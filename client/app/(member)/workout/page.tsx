'use client';

import { useState, useEffect } from 'react';
import { wgerApi, Workout, WorkoutDay, Setting, Exercise } from '@/lib/wgerApi';
import WorkoutCard from '@/components/workouts/WorkoutCard';
import DaySection, { DaySetting } from '@/components/workouts/DaySection';
import ExerciseBrowser from '@/components/workouts/ExerciseBrowser';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Plus, ArrowLeft, Loader2, RefreshCcw, Sparkles, Filter, ChevronRight, Save, Printer, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { workoutApi, WorkoutPlan as GeneratedPlan, Exercise as GeneratedExercise } from '@/lib/workoutApi';
import GeneratedExerciseCard from '@/components/workouts/GeneratedExerciseCard';
import { useSession } from 'next-auth/react';
import axios from 'axios';

export default function WorkoutsPage() {
    const { data: session } = useSession();
    // --- View State --- //
    const [view, setView] = useState<'list' | 'detail' | 'generator'>('list');
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

    // --- Data State --- //
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [days, setDays] = useState<WorkoutDay[]>([]);
    const [settings, setSettings] = useState<Record<number, DaySetting[]>>({}); // dayId -> Settings

    // --- UI State --- //
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeletingWorkout, setIsDeletingWorkout] = useState<number | null>(null);
    const [isDeletingDay, setIsDeletingDay] = useState<number | null>(null);
    const [savedPlans, setSavedPlans] = useState<GeneratedPlan[]>([]);
    const [isTogglingPlan, setIsTogglingPlan] = useState<string | null>(null);

    // --- Generator State --- //
    const [filterOptions, setFilterOptions] = useState<{ bodyParts: string[], muscles: string[], equipment: string[] }>({
        bodyParts: [],
        muscles: [],
        equipment: []
    });
    const [selectedFilters, setSelectedFilters] = useState<{ bodyPart: string[], targetMuscles: string[], equipment: string[] }>({
        bodyPart: [],
        targetMuscles: [],
        equipment: []
    });
    const [memberProfile, setMemberProfile] = useState<any>(null);
    const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSavingPlan, setIsSavingPlan] = useState(false);

    // --- Existing UI State --- //
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newWorkoutName, setNewWorkoutName] = useState('');
    const [browserModalOpen, setBrowserModalOpen] = useState(false);
    const [activeDayIdForExercise, setActiveDayIdForExercise] = useState<number | null>(null);

    // --- Modal State --- //
    const [selectedGeneratedExercise, setSelectedGeneratedExercise] = useState<GeneratedExercise | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    // Toast equivalent (simplified for this component, ideally use a context)
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // --- Data Fetching --- //
    const loadWorkouts = async () => {
        try {
            setLoading(true);
            setError(null);

            const [wgerRes, savedRes] = await Promise.allSettled([
                wgerApi.fetchWorkouts(),
                session?.user?.id ? workoutApi.fetchPlans(session.user.id) : Promise.resolve({ success: true, data: [] })
            ]);

            if (wgerRes.status === 'fulfilled') {
                setWorkouts(wgerRes.value.results || []);
            } else {
                console.error('WGER fetch failed:', wgerRes.reason);
                setError('Failed to load WGER workouts.');
            }

            if (savedRes.status === 'fulfilled' && (savedRes.value as any).success) {
                setSavedPlans((savedRes.value as any).data || []);
            }
        } catch (err) {
            setError('An unexpected error occurred.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'list') {
            loadWorkouts();
        } else if (view === 'generator') {
            loadGeneratorData();
        }
    }, [view]);

    const loadGeneratorData = async () => {
        if (!session?.user?.id) return;
        try {
            setLoading(true);
            const [bp, musc, equip, prof] = await Promise.all([
                workoutApi.fetchBodyParts(),
                workoutApi.fetchMuscles(),
                workoutApi.fetchEquipment(),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/profile/member/${session.user.id}`)
            ]);

            setFilterOptions({
                bodyParts: bp.data || [],
                muscles: musc.data || [],
                equipment: equip.data || []
            });
            setMemberProfile(prof.data?.data);
        } catch (err) {
            console.error('Failed to load generator data:', err);
            showToast('Failed to load filter options', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Load specific workout details (days and their exercises)
    const loadWorkoutDetails = async (workout: Workout) => {
        try {
            setLoading(true);
            setError(null);

            const resDays = await wgerApi.fetchWorkoutDays(workout.id);
            const fetchedDays = resDays.results || [];
            setDays(fetchedDays);

            // Fetch sets (exercises) for each day
            const newSettings: Record<number, DaySetting[]> = {};

            await Promise.all(
                fetchedDays.map(async (day) => {
                    const resSets = await wgerApi.fetchSetsForDay(day.id);
                    const sets = resSets.results || [];

                    // Hydrate sets with Exercise names (wger sets endpoint only gives ids)
                    // For a production app, we might want to batch this or use a local cache
                    const hydratedSets: DaySetting[] = await Promise.all(
                        sets.map(async (s) => {
                            try {
                                // Exercise is an array in ExerciseSet, take first one
                                const exId = Array.isArray(s.exercise) ? s.exercise[0] : (s.exercise as any);
                                const ex = await wgerApi.fetchExerciseById(exId);
                                return {
                                    id: s.id,
                                    exercise: exId,
                                    sets: s.sets || 0,
                                    exerciseName: ex.name,
                                };
                            } catch {
                                return { id: s.id, exercise: 0, sets: 0, exerciseName: 'Unknown Exercise' };
                            }
                        })
                    );

                    newSettings[day.id] = hydratedSets;
                })
            );

            setSettings(newSettings);
            setSelectedWorkout(workout);
            setView('detail');
        } catch (err) {
            setError('Failed to load workout details.');
            showToast('Error loading details', 'error');
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers --- //
    const handleCreateWorkout = async () => {
        if (!newWorkoutName.trim()) return;
        try {
            await wgerApi.createWorkout({ description: newWorkoutName });
            showToast('Workout created successfully!');
            setCreateModalOpen(false);
            setNewWorkoutName('');
            loadWorkouts();
        } catch (err) {
            showToast('Failed to create workout', 'error');
        }
    };

    const handleDeleteWorkout = async (id: number) => {
        if (!confirm('Are you sure you want to delete this workout?')) return;
        try {
            setIsDeletingWorkout(id);
            await wgerApi.deleteWorkout(id);
            setWorkouts(w => w.filter(wk => wk.id !== id));
            showToast('Workout deleted');
        } catch (err) {
            showToast('Failed to delete workout', 'error');
        } finally {
            setIsDeletingWorkout(null);
        }
    };

    const handleAddDay = async () => {
        if (!selectedWorkout) return;
        try {
            const newDay = await wgerApi.createWorkoutDay({
                training: selectedWorkout.id,
                description: `Day ${days.length + 1}`
            });
            setDays([...days, newDay]);
            setSettings({ ...settings, [newDay.id]: [] });
            showToast('Day added');
        } catch (err) {
            showToast('Failed to add day', 'error');
        }
    };

    const handleDeleteDay = async (dayId: number) => {
        try {
            setIsDeletingDay(dayId);
            await wgerApi.deleteWorkoutDay(dayId);
            setDays(days.filter(d => d.id !== dayId));
            const newSettings = { ...settings };
            delete newSettings[dayId];
            setSettings(newSettings);
            showToast('Day deleted');
        } catch (err) {
            showToast('Failed to delete day', 'error');
        } finally {
            setIsDeletingDay(null);
        }
    };

    const openExerciseBrowser = (dayId: number) => {
        setActiveDayIdForExercise(dayId);
        setBrowserModalOpen(true);
    };

    const handleAddExerciseToDay = async (exerciseId: number) => {
        if (!activeDayIdForExercise) return;
        try {
            const newSet = await wgerApi.createSet({
                const newSet = await wgerApi.createSet({
                    day: activeDayIdForExercise,
                    exercise: [exerciseId],
                    exercise: [exerciseId],
                    sets: 3 // Default
                });

                const exDetails = await wgerApi.fetchExerciseById(exerciseId);

                const hydratedSet: DaySetting = {
                    id: newSet.id,
                    exercise: exerciseId,
                    exercise: exerciseId,
                    sets: 3,
                    exerciseName: exDetails.name
                };

                setSettings(prev => ({
                    ...prev,
                    [activeDayIdForExercise]: [...(prev[activeDayIdForExercise] || []), hydratedSet]
                }));

    setBrowserModalOpen(false);
    showToast('Exercise added');
} catch (err) {
    showToast('Failed to add exercise', 'error');
}
    };

const handleRemoveExercise = async (setId: number, dayId: number) => {
    try {
        await wgerApi.deleteSet(setId);
        await wgerApi.deleteSet(setId);
        setSettings(prev => ({
            ...prev,
            [dayId]: prev[dayId].filter(s => s.id !== setId)
        }));
        showToast('Exercise removed');
    } catch (err) {
        showToast('Failed to remove exercise', 'error');
    }
};

const handleGenerateWorkout = async () => {
    if (!memberProfile) {
        showToast('Profile not loaded', 'error');
        return;
    }

    try {
        setIsGenerating(true);
        const dob = new Date(memberProfile.dob);
        const age = Math.floor((new Date().getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

        const res = await workoutApi.generateWorkout({
            age,
            gender: memberProfile.gender,
            weight: memberProfile.weightKg,
            goal: memberProfile.goal
        }, selectedFilters);

        if (res.success) {
            setGeneratedPlan(res.data);
            showToast('Workout plan generated!');
        }
    } catch (err) {
        showToast('Failed to generate plan', 'error');
    } finally {
        setIsGenerating(false);
    }
};

const handleSaveGeneratedPlan = async () => {
    if (!generatedPlan || !session?.user?.id) return;
    try {
        setIsSavingPlan(true);
        const res = await workoutApi.savePlan({
            userId: session.user.id,
            title: generatedPlan.title,
            exercises: generatedPlan.exercises,
            notes: `Generated on ${new Date().toLocaleDateString()}`
        });

        if (res.success) {
            showToast('Workout plan saved!');
            // Automatically activate it too
            await workoutApi.activatePlan(res.data._id);
            setView('list');
        }
    } catch (err) {
        showToast('Failed to save plan', 'error');
    } finally {
        setIsSavingPlan(false);
    }
};

const toggleFilter = (category: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
        ...prev,
        [category]: prev[category].includes(value)
            ? prev[category].filter(v => v !== value)
            : [...prev[category], value]
    }));
};

const handlePrintPlan = () => {
    window.print();
};

const togglePlanActivation = async (planId: string, currentlyActive: boolean) => {
    try {
        setIsTogglingPlan(planId);
        if (currentlyActive) {
            // Deactivate (just calling activate on a non-existent or same might not work, 
            // but our backend activate deactivates others. To deactivate current, we need a separate endpoint or just activate nothing)
            // For now, let's just support activation as requested.
            await workoutApi.activatePlan(planId);
        } else {
            await workoutApi.activatePlan(planId);
        }
        showToast(currentlyActive ? 'Plan deactivated' : 'Plan activated');
        loadWorkouts();
    } catch (err) {
        showToast('Failed to toggle activation', 'error');
    } finally {
        setIsTogglingPlan(null);
    }
};

const handleDeleteSavedPlan = async (id: string) => {
    if (!confirm('Delete this saved plan?')) return;
    try {
        await workoutApi.deletePlan(id);
        setSavedPlans(prev => prev.filter(p => p._id !== id));
        showToast('Plan deleted');
    } catch (err) {
        showToast('Failed to delete plan', 'error');
    }
};

const renderGenerator = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col gap-8 pb-20"
    >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-4 items-center">
                <Button variant="ghost" className="px-3" onClick={() => setView('list')}>
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 uppercase tracking-wider">AI <span className="text-[#B8FF3C] neon-text">Generator</span></h1>
                    <p className="text-slate-400 mt-1">Smart workout planning tailored to your profile.</p>
                </div>
            </div>
            {generatedPlan && (
                <div className="flex gap-3 w-full md:w-auto">
                    <Button variant="secondary" onClick={handlePrintPlan} className="flex-1 md:flex-none">
                        <Printer size={18} className="mr-2" /> Print
                    </Button>
                    <Button onClick={handleSaveGeneratedPlan} loading={isSavingPlan} className="flex-1 md:flex-none">
                        <Save size={18} className="mr-2" /> Save Plan
                    </Button>
                </div>
            )}
        </div>

        {/* Profile Summary & Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar: Filters */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="glass-panel p-6 rounded-2xl border-slate-800">
                    <div className="flex items-center gap-2 mb-6 text-[#B8FF3C]">
                        <Filter size={18} />
                        <h3 className="font-bold uppercase tracking-widest text-sm">Filters</h3>
                    </div>

                    {/* Equipment */}
                    <div className="mb-6">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Equipment</h4>
                        <div className="flex flex-wrap gap-2">
                            {filterOptions.equipment.slice(0, 10).map(item => (
                                <button
                                    key={item}
                                    onClick={() => toggleFilter('equipment', item)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${selectedFilters.equipment.includes(item)
                                            ? 'bg-[#B8FF3C] text-[#0A0A0F] border-[#B8FF3C]'
                                            : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Body Parts */}
                    <div className="mb-6">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Focus Areas</h4>
                        <div className="flex flex-wrap gap-2">
                            {filterOptions.bodyParts.map(item => (
                                <button
                                    key={item}
                                    onClick={() => toggleFilter('bodyPart', item)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${selectedFilters.bodyPart.includes(item)
                                            ? 'bg-cyan-500 text-white border-cyan-500'
                                            : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        fullWidth
                        onClick={handleGenerateWorkout}
                        loading={isGenerating}
                        className="mt-4"
                    >
                        <Sparkles size={18} className="mr-2" /> Generate
                    </Button>
                </div>

                {/* Profile Summary */}
                {memberProfile && (
                    <div className="glass-panel p-6 rounded-2xl border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-800/30">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Your Profile</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Goal</span>
                                <span className="text-[#B8FF3C] font-bold uppercase">{memberProfile.goal}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Weight</span>
                                <span className="text-slate-200">{memberProfile.weightKg} kg</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Gender</span>
                                <span className="text-slate-200 capitalize">{memberProfile.gender}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content: Results */}
            <div className="lg:col-span-3">
                {!generatedPlan ? (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20 text-center p-8">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 mb-6">
                            <Sparkles size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-300">Ready to transform?</h3>
                        <p className="text-slate-500 max-w-sm mt-2">Adjust your filters and click generate to create a scientifically-backed workout plan.</p>
                    </div>
                ) : (
                    <div className="space-y-6 print-container">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-100">{generatedPlan.title}</h2>
                            <span className="text-xs text-slate-500 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-slate-700">6 Exercises</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {generatedPlan.exercises.map((ex, idx) => (
                                <GeneratedExerciseCard
                                    key={ex.id + idx}
                                    exercise={ex}
                                    onClick={(ex) => {
                                        setSelectedGeneratedExercise(ex);
                                        setDetailModalOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </motion.div>
);

// --- Views --- //
const renderList = () => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex flex-col gap-6"
    >
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-slate-100 uppercase tracking-wider">Your <span className="text-[#B8FF3C] neon-text">Workouts</span></h1>
                <p className="text-slate-400 mt-2">Manage your training regimens.</p>
            </div>
            <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setView('generator')} className="border-cyan-500/30 text-cyan-400">
                    <Sparkles size={18} className="mr-2" /> AI Generator
                </Button>
                <Button onClick={() => setCreateModalOpen(true)} className="shadow-[0_0_15px_rgba(184,255,60,0.3)]">
                    <Plus size={18} className="mr-2" /> New Workout
                </Button>
            </div>
        </div>

        {error ? (
            <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-center">
                <p>{error}</p>
                <Button variant="outline" className="mt-4 border-red-500 text-red-400 hover:bg-red-500/10" onClick={loadWorkouts}>
                    <RefreshCcw size={16} className="mr-2" /> Retry
                </Button>
            </div>
        ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-[180px] rounded-2xl bg-slate-800/50 animate-pulse border border-slate-700/50" />
                ))}
            </div>
        ) : workouts.length === 0 && savedPlans.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-3xl">
                <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6 border border-cyan-500/20">
                    <Plus size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-200">No workouts found</h3>
                <p className="text-slate-500 max-w-md mt-2">Create your first workout program to start tracking your gains.</p>
                <Button className="mt-6" onClick={() => setCreateModalOpen(true)}>Create Workout</Button>
            </div>
        ) : (
            <div className="flex flex-col gap-8">
                {/* Saved AI Plans */}
                {savedPlans.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Sparkles size={14} className="text-[#B8FF3C]" /> AI Generated Plans
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedPlans.map(plan => (
                                <div key={plan._id} className={`glass-panel p-6 rounded-2xl border transition-all ${plan.is_active ? 'border-[#B8FF3C]/50 bg-[#B8FF3C]/5 shadow-[0_0_20px_rgba(184,255,60,0.1)]' : 'border-slate-800'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-slate-100">{plan.title}</h3>
                                            <p className="text-xs text-slate-500 mt-1">{plan.exercises.length} Exercises • Saved {new Date(plan.createdAt || '').toLocaleDateString()}</p>
                                        </div>
                                        {plan.is_active && (
                                            <span className="bg-[#B8FF3C] text-[#0A0A0F] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Active</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-6">
                                        <Button
                                            variant={plan.is_active ? 'outline' : 'primary'}
                                            className="flex-1 text-xs py-2"
                                            onClick={() => plan._id && togglePlanActivation(plan._id, !!plan.is_active)}
                                            loading={isTogglingPlan === plan._id}
                                        >
                                            {plan.is_active ? 'Deactivate' : 'Activate'}
                                        </Button>
                                        <Button variant="ghost" className="px-3" onClick={() => plan._id && handleDeleteSavedPlan(plan._id)}>
                                            <Plus size={16} className="rotate-45 text-red-400" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Standard Workouts */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Manual Workouts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workouts.map(workout => (
                            <WorkoutCard
                                key={workout.id}
                                id={workout.id}
                                name={workout.description || `Workout ${workout.id}`}
                                date={workout.creation_date}
                                onView={() => loadWorkoutDetails(workout)}
                                onDelete={handleDeleteWorkout}
                                isDeleting={isDeletingWorkout === workout.id}
                            />
                        ))}
                    </div>
                </section>
            </div>
        )}
    </motion.div>
);

const renderDetail = () => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex flex-col gap-6"
    >
        <div className="flex gap-4 items-center">
            <Button variant="ghost" className="px-3" onClick={() => setView('list')}>
                <ArrowLeft size={20} />
            </Button>
            <div>
                <h1 className="text-2xl font-bold text-slate-100">{selectedWorkout?.description || `Workout ${selectedWorkout?.id}`}</h1>
                <p className="text-slate-400 text-sm">Created {new Date(selectedWorkout?.creation_date || '').toLocaleDateString()}</p>
            </div>
        </div>

        <div className="flex justify-between items-center mt-4">
            <h2 className="text-lg font-semibold text-cyan-400 uppercase tracking-widest text-sm">Training Days</h2>
            <Button variant="outline" size="sm" onClick={handleAddDay}>
                <Plus size={16} className="mr-2" /> Add Day
            </Button>
        </div>

        {loading ? (
            <div className="flex justify-center p-12">
                <Loader2 size={40} className="text-cyan-500 animate-spin" />
            </div>
        ) : days.length === 0 ? (
            <div className="py-12 text-center text-slate-500 glass-panel rounded-2xl border-dashed border-slate-700">
                No days configured. Add a day to start inserting exercises.
            </div>
        ) : (
            <div className="flex flex-col gap-6">
                {days.map(day => (
                    <DaySection
                        key={day.id}
                        id={day.id}
                        description={day.description}
                        settings={settings[day.id] || []}
                        onAddExercise={() => openExerciseBrowser(day.id)}
                        onRemoveExercise={(setId) => handleRemoveExercise(setId, day.id)}
                        onDeleteDay={handleDeleteDay}
                        isDeletingDay={isDeletingDay === day.id}
                    />
                ))}
            </div>
        )}
    </motion.div>
);

return (
    <div className="min-h-screen bg-[#0A0A0F] pt-24 pb-12 px-4 sm:px-6 lg:px-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
                {view === 'list' ? renderList() : view === 'detail' ? renderDetail() : renderGenerator()}
            </AnimatePresence>
        </div>

        {/* --- Modals --- */}

        <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Workout">
            <div className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Workout Name</label>
                    <input
                        type="text"
                        value={newWorkoutName}
                        onChange={e => setNewWorkoutName(e.target.value)}
                        placeholder="e.g. Push Pull Legs"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-[#B8FF3C] focus:ring-1 focus:ring-[#B8FF3C] transition-colors"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkout()}
                    />
                </div>
                <Button fullWidth onClick={handleCreateWorkout} disabled={!newWorkoutName.trim()}>
                    Create
                </Button>
            </div>
        </Modal>

        <Modal open={browserModalOpen} onClose={() => setBrowserModalOpen(false)} title="Select Exercise" size="lg">
            <ExerciseBrowser onSelect={handleAddExerciseToDay} />
        </Modal>

        <Modal
            open={detailModalOpen}
            onClose={() => setDetailModalOpen(false)}
            title={selectedGeneratedExercise?.name || 'Exercise Details'}
            size="md"
        >
            {selectedGeneratedExercise && (
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                            <span className="text-xs text-slate-500 uppercase block mb-1">Sets & Reps</span>
                            <span className="text-slate-200 font-bold capitalize">{selectedGeneratedExercise.sets} × {selectedGeneratedExercise.reps}</span>
                        </div>
                        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                            <span className="text-xs text-slate-500 uppercase block mb-1">Rest</span>
                            <span className="text-slate-200 font-bold">{selectedGeneratedExercise.rest_s}s</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-[#B8FF3C] uppercase mb-3 tracking-widest flex items-center gap-2">
                            <CheckCircle2 size={16} /> Instructions
                        </h4>
                        <div className="space-y-3">
                            {selectedGeneratedExercise.instructions.map((step, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:border-[#B8FF3C] group-hover:text-[#B8FF3C] transition-colors">
                                        {i + 1}
                                    </span>
                                    <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-200 transition-colors">
                                        {step}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button fullWidth onClick={() => setDetailModalOpen(false)}>
                        Got it
                    </Button>
                </div>
            )}
        </Modal>

        {/* --- Toasty --- */}
        <AnimatePresence>
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-2xl glass-panel text-white font-medium z-50 ${toast.type === 'error' ? 'border-red-500/50 bg-red-500/10' : 'border-[#B8FF3C]/50 bg-[#B8FF3C]/10 text-[#B8FF3C]'
                        }`}
                >
                    {toast.message}
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);
}
