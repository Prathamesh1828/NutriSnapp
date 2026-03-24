'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, ArrowLeft, Loader2, Sparkles, Filter,
    Save, Printer, Trash2, ChevronDown, X,
    Dumbbell, Zap, Settings2, BarChart3, Menu, Info, PlayCircle
} from 'lucide-react';
import ExerciseBrowser from '@/components/workouts/ExerciseBrowser';
import { workoutApi } from '@/lib/workoutApi';
import { useGlobalStore } from '@/store/useGlobalStore';
import { Toast } from '@/components/ui/Toast';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface DaySetting {
    id: string;
    exercise: string;
    sets: number;
    exerciseName: string;
    categoryName: string;
}

interface WorkoutDay {
    id: string;
    description: string;
    exercises: DaySetting[];
}

interface WorkoutPlan {
    _id?: string;
    title: string;
    days?: WorkoutDay[];
    exercises?: any[];
    is_active?: boolean;
    createdAt?: string;
}

// ─── Dropdown (multi-select filter) ───────────────────────────────────────────
function Dropdown({ label, options, selected, onToggle, accentColor = '#B8FF3C' }: {
    label: string; options: string[]; selected: string[];
    onToggle: (v: string) => void; accentColor?: string;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    return (
        <div ref={ref} className="relative w-full">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 text-sm font-semibold hover:border-slate-500 transition-all"
            >
                <span className="flex items-center gap-2 min-w-0">
                    <Filter size={13} className="text-slate-500 shrink-0" />
                    <span className="truncate">{label}</span>
                    {selected.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black text-black shrink-0" style={{ background: accentColor }}>
                            {selected.length}
                        </span>
                    )}
                </span>
                <ChevronDown size={15} className={`text-slate-500 transition-transform duration-200 shrink-0 ml-2 ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.14 }}
                        className="absolute top-full mt-2 left-0 right-0 z-50 bg-[#0D0D14] border border-slate-700 rounded-2xl shadow-2xl p-3 max-h-56 overflow-y-auto"
                    >
                        <div className="flex flex-wrap gap-1.5">
                            {options.map(opt => {
                                const active = selected.includes(opt);
                                return (
                                    <button
                                        key={opt}
                                        onClick={() => onToggle(opt)}
                                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border capitalize ${active ? 'text-black border-transparent' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`}
                                        style={active ? { background: accentColor } : {}}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, size = 'md' }: {
    open: boolean; onClose: () => void; title: string;
    children: React.ReactNode; size?: 'sm' | 'md' | 'lg';
}) {
    const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                className={`relative w-full ${sizes[size]} bg-[#0D0D14] border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto`}
            >
                <div className="flex justify-between items-center mb-5 sm:mb-6">
                    <h2 className="text-sm sm:text-base font-black text-slate-100 uppercase tracking-widest">{title}</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                        <X size={15} />
                    </button>
                </div>
                {children}
            </motion.div>
        </div>
    );
}

// ─── Button ────────────────────────────────────────────────────────────────────
function Button({ children, onClick, variant = 'primary', className = '', disabled = false, loading = false, fullWidth = false, size = 'md' }: {
    children: React.ReactNode; onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    className?: string; disabled?: boolean; loading?: boolean; fullWidth?: boolean;
    size?: 'sm' | 'md';
}) {
    const base = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';
    const sizes = { sm: 'text-xs px-3 py-2', md: 'text-sm px-4 py-2.5' };
    const vars: Record<string, string> = {
        primary: 'bg-[#B8FF3C] text-[#0A0A0F] hover:bg-[#c9ff5f] shadow-[0_0_20px_rgba(184,255,60,0.2)]',
        secondary: 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500',
        outline: 'bg-transparent border border-slate-700 text-slate-300 hover:border-slate-500',
        ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800',
    };
    return (
        <button onClick={onClick} disabled={disabled || loading}
            className={`${base} ${sizes[size]} ${vars[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}>
            {loading && <Loader2 size={14} className="animate-spin mr-2" />}
            {children}
        </button>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function WorkoutsPage() {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const user = useGlobalStore(state => state.user);

    const [view, setView] = useState<'list' | 'detail' | 'generator'>('list');
    const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(null);
    const [plans, setPlans] = useState<WorkoutPlan[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [filterOptions] = useState({
        bodyParts: ['back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist'],
        equipment: ['barbell', 'cable', 'dumbbell', 'ez barbell', 'kettlebell', 'resistance band', 'body weight', 'smith machine'],
    });
    const [selectedFilters, setSelectedFilters] = useState<{ bodyPart: string[]; equipment: string[] }>({ bodyPart: [], equipment: [] });
    const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSavingPlan, setIsSavingPlan] = useState(false);
    const [isDeletingPlan, setIsDeletingPlan] = useState<string | null>(null);
    const [isTogglingPlan, setIsTogglingPlan] = useState<string | null>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newWorkoutName, setNewWorkoutName] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [exerciseBrowserOpen, setExerciseBrowserOpen] = useState(false);
    const [activeDayId, setActiveDayId] = useState<string | null>(null);
    const [inspectingExercise, setInspectingExercise] = useState<any | null>(null);
    const [loadingExercise, setLoadingExercise] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; planId: string | null }>({ open: false, planId: null });

    // ─── Fetch Plans ──────────────────────────────────────────────────────────
    const fetchPlanData = async () => {
        if (!userId) return;
        setLoadingPlans(true);
        try {
            const res = await workoutApi.fetchPlans(userId);
            if (res.success) {
                setPlans(res.data || []);
            }
        } catch (err) {
            console.error('Failed to load plans:', err);
            showToast('Sync failed', 'error');
        } finally {
            setLoadingPlans(false);
        }
    };

    useEffect(() => {
        if (userId) fetchPlanData();
    }, [userId]);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const toggleFilter = (cat: keyof typeof selectedFilters, val: string) => {
        setSelectedFilters(prev => ({
            ...prev,
            [cat]: prev[cat].includes(val) ? prev[cat].filter(v => v !== val) : [...prev[cat], val],
        }));
    };

    const handleDeletePlan = async (id: string) => {
        setConfirmDelete({ open: true, planId: id });
    };

    const confirmDeleteAction = async () => {
        const id = confirmDelete.planId;
        if (!id) return;
        
        setIsDeletingPlan(id);
        setConfirmDelete({ open: false, planId: null });
        
        try {
            const res = await workoutApi.deletePlan(id);
            if (res.success) {
                setPlans(p => p.filter(w => w._id !== id));
                showToast('Workout deleted');
            } else {
                throw new Error(res.error);
            }
        } catch (err) {
            showToast('Delete failed', 'error');
        } finally {
            setIsDeletingPlan(null);
        }
    };

    const handleTogglePlan = async (id: string, active: boolean) => {
        setIsTogglingPlan(id);
        try {
            const res = await workoutApi.activatePlan(id);
            if (res.success) {
                setPlans(p => p.map(w => w._id === id ? { ...w, is_active: !active } : { ...w, is_active: false }));
                showToast(active ? 'Plan deactivated' : 'Plan activated');
            }
        } catch (err) {
            showToast('Toggle failed', 'error');
        } finally {
            setIsTogglingPlan(null);
        }
    };

    const handleCreateWorkout = async () => {
        if (!newWorkoutName.trim() || !userId) return;
        setIsSavingPlan(true);
        try {
            const res = await workoutApi.savePlan({
                userId,
                title: newWorkoutName,
                days: [],
                exercises: [],
                is_active: false
            });
            if (res.success) {
                setPlans(p => [res.data, ...p]);
                showToast('Program initialized!');
                setCreateModalOpen(false);
                setNewWorkoutName('');
            }
        } catch (err) {
            showToast('Save failed', 'error');
        } finally {
            setIsSavingPlan(false);
        }
    };

    const handleAddDay = (workout: WorkoutPlan) => {
        const newDay: WorkoutDay = { id: crypto.randomUUID(), description: `Day ${(workout.days || []).length + 1}`, exercises: [] };
        const updated = { ...workout, days: [...(workout.days || []), newDay] };
        setSelectedWorkout(updated);
        showToast('Day added');
    };

    const handleDeleteDay = (workout: WorkoutPlan, dayId: string) => {
        const updated = { ...workout, days: (workout.days || []).filter(d => d.id !== dayId) };
        setSelectedWorkout(updated);
        showToast('Day removed (unsaved)');
    };

    const handleSaveGeneratedPlan = async () => {
        if (!generatedPlan || !userId) return;
        setIsSavingPlan(true);
        try {
            const res = await workoutApi.savePlan({ ...generatedPlan, userId });
            if (res.success) {
                setPlans([res.data, ...plans]);
                setGeneratedPlan(null);
                setView('list');
                showToast('AI Routine Saved!');
            }
        } catch (err) {
            showToast('Save failed', 'error');
        } finally {
            setIsSavingPlan(false);
        }
    };

    const handleUpdateSelectedWorkout = async () => {
        if (!selectedWorkout || !selectedWorkout._id) return;
        setIsSavingPlan(true);
        try {
            const res = await workoutApi.updatePlan(selectedWorkout._id, selectedWorkout);
            if (res.success) {
                setPlans(plans.map(p => p._id === selectedWorkout._id ? res.data : p));
                showToast('Protocol Updated');
            }
        } catch (err) {
            showToast('Update failed', 'error');
        } finally {
            setIsSavingPlan(false);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            // Profile data (ideally this should come from a user state/context)
            const profile = { 
                gender: user?.gender || 'male', 
                weight: user?.weightKg || 75, 
                goal: user?.goal || 'bulk' 
            };
            
            const res = await workoutApi.generateWorkout(profile, selectedFilters);
            
            if (res.success) {
                setGeneratedPlan(res.data);
                showToast('Plan generated!');
            } else {
                showToast(res.error || 'Generation failed', 'error');
            }
        } catch (err: any) {
            console.error('Generation Tool Error:', err);
            showToast(err.response?.data?.error || 'Connection failed', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleInspectExercise = async (ex: any) => {
        if (ex.instructions) {
            setInspectingExercise(ex);
            return;
        }
        setLoadingExercise(true);
        try {
            const res = await workoutApi.fetchExerciseById(ex.id || ex._id);
            setInspectingExercise(res.data);
        } catch (err) {
            showToast('Could not load details', 'error');
        } finally {
            setLoadingExercise(false);
        }
    };

    const handleAddExerciseToDay = (dayId: string) => {
        setActiveDayId(dayId);
        setExerciseBrowserOpen(true);
    };

    const onSelectFromBrowser = async (exerciseId: string) => {
        if (!activeDayId || !selectedWorkout) return;
        setExerciseBrowserOpen(false);
        showToast('Adding exercise...', 'success');
        
        try {
            const res = await workoutApi.fetchExerciseById(exerciseId);
            const exData = res.data;
            
            const newEx: DaySetting = {
                id: crypto.randomUUID(),
                exercise: exerciseId,
                sets: 3,
                exerciseName: exData.name,
                categoryName: exData.bodyPart
            };

            const updatedDays = selectedWorkout.days?.map(d => 
                d.id === activeDayId ? { ...d, exercises: [...d.exercises, newEx] } : d
            );
            
            setSelectedWorkout({ ...selectedWorkout, days: updatedDays });
            showToast(`${exData.name} added!`);
        } catch (err) {
            showToast('Failed to add exercise', 'error');
        }
        setActiveDayId(null);
    };

    // ── List View ──────────────────────────────────────────────────────────────
    const renderList = () => (
        <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-5 sm:gap-6 pb-32">
            {/* Desktop header */}
            <div className="hidden sm:flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-100 uppercase tracking-wider">
                        Workout <span className="text-[#B8FF3C]">HQ</span>
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">Personal Training Hub</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setView('generator')} className="border-cyan-500/30 text-cyan-400">
                        <Sparkles size={15} className="mr-2" /> AI Assistant
                    </Button>
                    <Button onClick={() => setCreateModalOpen(true)}>
                        <Plus size={15} className="mr-2" /> Custom Plan
                    </Button>
                </div>
            </div>

            {/* Mobile CTA row */}
            <div className="flex sm:hidden gap-2">
                <Button variant="secondary" onClick={() => setView('generator')} className="flex-1 text-cyan-400 border-cyan-500/20 text-xs py-3">
                    <Sparkles size={13} className="mr-1.5" /> AI Generate
                </Button>
                <Button onClick={() => setCreateModalOpen(true)} className="flex-1 text-xs py-3">
                    <Plus size={13} className="mr-1.5" /> New Plan
                </Button>
            </div>

            {/* Plan grid */}
            {loadingPlans ? (
                <div className="py-24 flex flex-col items-center justify-center gap-5">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-4 border-[#B8FF3C]/10 rounded-full" />
                        <div className="absolute inset-0 border-4 border-[#B8FF3C] border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em] font-black animate-pulse">Syncing Plans</p>
                </div>
            ) : plans.length === 0 ? (
                <div className="py-16 sm:py-20 text-center flex flex-col items-center bg-slate-900/30 border border-slate-800 border-dashed rounded-3xl">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#B8FF3C]/10 flex items-center justify-center text-[#B8FF3C] mb-4 sm:mb-5 border border-[#B8FF3C]/20">
                        <Dumbbell size={26} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-200">No plans yet</h3>
                    <p className="text-slate-500 max-w-xs mt-2 text-sm">Create a plan or generate one with AI.</p>
                    <div className="flex gap-3 mt-5 sm:mt-6">
                        <Button onClick={() => setCreateModalOpen(true)}>Create Plan</Button>
                        <Button variant="secondary" onClick={() => setView('generator')}>AI Generator</Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className={`rounded-2xl border p-4 sm:p-5 cursor-pointer group transition-all duration-200 ${plan.is_active
                                ? 'border-[#B8FF3C]/40 bg-[#B8FF3C]/5'
                                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                                }`}
                            onClick={() => { setSelectedWorkout(plan); setView('detail'); }}
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-white text-lg sm:text-xl group-hover:text-[#B8FF3C] transition-colors truncate">
                                        {plan.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="text-[10px] font-black text-slate-500 bg-black/40 px-2 py-1 rounded-lg border border-white/5 uppercase tracking-wider">
                                            {(plan.days || []).length} Days
                                        </span>
                                        <span className="text-[10px] font-black text-slate-600 bg-white/5 px-2 py-1 rounded-lg border border-white/5 uppercase tracking-wider">
                                            {((plan.exercises || []).length + (plan.days || []).reduce((acc, d) => acc + (d.exercises || []).length, 0))} Skills
                                        </span>
                                    </div>
                                </div>
                                {plan.is_active && (
                                    <div className="flex items-center gap-1.5 bg-[#B8FF3C] text-[#0A0A0F] text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg shadow-[#B8FF3C]/20 shrink-0">
                                        <Zap size={10} fill="currentColor" /> Active
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 pt-5 border-t border-white/5" onClick={e => e.stopPropagation()}>
                                <Button
                                    variant={plan.is_active ? 'outline' : 'primary'}
                                    className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-[11px] font-black uppercase tracking-wider"
                                    onClick={() => plan._id && handleTogglePlan(plan._id, !!plan.is_active)}
                                    loading={isTogglingPlan === plan._id}
                                >
                                    {plan.is_active ? 'Standby' : 'Engage'}
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );

    // ── Detail View ────────────────────────────────────────────────────────────
    const renderDetail = () => (
        <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-5 sm:gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setView('list')}
                        className="p-2 bg-slate-900 border border-slate-800 rounded-xl h-9 w-9 flex items-center justify-center text-slate-100 hover:bg-slate-800 hover:border-slate-500 transition-all shadow-lg"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg sm:text-2xl font-black text-slate-100 truncate max-w-[200px] sm:max-w-none">
                            {selectedWorkout?.title}
                        </h1>
                        <p className="text-slate-500 text-xs mt-0.5">{(selectedWorkout?.days || []).length} training blocks</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant="primary"
                        onClick={handleUpdateSelectedWorkout}
                        loading={isSavingPlan}
                        className="flex-1 sm:flex-none text-xs"
                    >
                        <Save size={14} className="mr-1.5" /> Save Changes
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => selectedWorkout && handleAddDay(selectedWorkout)}
                        className="flex-1 sm:flex-none border-slate-700 text-slate-300 text-xs"
                    >
                        <Plus size={14} className="mr-1.5" /> Add Block
                    </Button>
                </div>
            </div>

            {/* AI Generated Flat List View */}
            {(selectedWorkout?.exercises || []).length > 0 && (selectedWorkout?.days || []).length === 0 && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pb-12">
                    {selectedWorkout!.exercises!.map((ex, i) => (
                        <div key={i} onClick={() => handleInspectExercise(ex)} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 hover:border-slate-700 transition-all group cursor-pointer">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-100 group-hover:text-[#B8FF3C] transition-colors truncate capitalize text-sm">{ex.name}</h4>
                                <span className="text-[10px] font-black text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">{ex.sets}×{ex.reps}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-black">{ex.bodyPart}</span>
                                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-black">·</span>
                                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-black">{ex.target}</span>
                            </div>
                        </div>
                    ))}
                 </div>
            )}

            {/* Manual Blocks View */}
            {(selectedWorkout?.days || []).length === 0 && (selectedWorkout?.exercises || []).length === 0 ? (
                <div className="py-14 sm:py-16 text-center flex flex-col items-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-600 mb-3 sm:mb-4 border border-slate-800">
                        <Plus size={20} />
                    </div>
                    <p className="text-slate-400 font-semibold text-sm">Add your first training day</p>
                    <Button className="mt-4 sm:mt-5 text-xs" onClick={() => selectedWorkout && handleAddDay(selectedWorkout)}>
                        Add Day
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col gap-3 sm:gap-4 pb-10">
                    {(selectedWorkout?.days || []).map((day, idx) => (
                        <motion.div
                            key={day.id}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4 sm:p-5"
                        >
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                    <span className="w-7 h-7 shrink-0 rounded-lg bg-[#B8FF3C]/10 border border-[#B8FF3C]/20 flex items-center justify-center text-[#B8FF3C] text-xs font-black">
                                        {idx + 1}
                                    </span>
                                    <span className="font-bold text-slate-200 text-sm truncate">{day.description}</span>
                                </div>
                                <button
                                    onClick={() => selectedWorkout && handleDeleteDay(selectedWorkout, day.id)}
                                    className="w-7 h-7 shrink-0 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500/50 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>

                            {day.exercises.length === 0 ? (
                                <p className="text-slate-600 text-xs text-center py-3">No exercises yet</p>
                            ) : (
                                <div className="space-y-2 mb-3">
                                    {day.exercises.map(ex => (
                                        <div key={ex.id} 
                                             onClick={() => handleInspectExercise({ id: ex.exercise, name: ex.exerciseName, bodyPart: ex.categoryName })} 
                                             className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:border-slate-500 transition-colors"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-slate-200 text-xs font-semibold capitalize truncate">{ex.exerciseName}</p>
                                                <p className="text-slate-500 text-[10px]">{ex.sets} sets · {ex.categoryName}</p>
                                            </div>
                                            <Info size={12} className="text-slate-700" />
                                        </div>
                                    ))}
                                </div>
                            )}

                             <button 
                                onClick={() => handleAddExerciseToDay(day.id)}
                                className="w-full py-2.5 text-xs text-slate-500 border border-dashed border-slate-700 rounded-xl hover:border-slate-500 hover:text-slate-300 transition-all font-bold uppercase tracking-widest bg-slate-900/20"
                            >
                                + Add Exercise
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );

    // ── Generator View ─────────────────────────────────────────────────────────
    const renderGenerator = () => (
        <motion.div key="generator" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="flex flex-col gap-5 sm:gap-6 pb-16">
            {/* Desktop header */}
             <div className="hidden sm:flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setView('list')}
                        className="p-2 bg-slate-900 border border-slate-800 rounded-xl h-9 w-9 flex items-center justify-center text-slate-100 hover:bg-slate-800 hover:border-slate-500 transition-all shadow-lg"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-100 uppercase tracking-wider">
                            AI <span className="text-[#B8FF3C]">Architect</span>
                        </h1>
                        <p className="text-slate-500 mt-0.5 text-xs">Algorithmically optimised training plans</p>
                    </div>
                </div>
                {generatedPlan && (
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => window.print()} className="text-xs">
                            <Printer size={13} className="mr-1.5" /> Print
                        </Button>
                        <Button onClick={handleSaveGeneratedPlan} loading={isSavingPlan} className="text-xs">
                            <Save size={13} className="mr-1.5" /> Save Plan
                        </Button>
                    </div>
                )}
            </div>

            {/* Mobile generator header */}
            <div className="flex sm:hidden items-center justify-between">
                <p className="text-xs text-slate-500 font-black uppercase tracking-widest">AI Architect</p>
                {generatedPlan && (
                    <Button onClick={handleSaveGeneratedPlan} loading={isSavingPlan} className="text-xs h-8 px-3">
                        <Save size={12} className="mr-1" /> Save
                    </Button>
                )}
            </div>

            {/* Responsive layout */}
            <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 sm:gap-5">
                {/* Filter panel */}
                <div className="lg:col-span-1 flex flex-col gap-3 sm:gap-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4 text-[#B8FF3C]">
                            <Settings2 size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Configuration</span>
                        </div>

                        {/* Both mobile and desktop use dropdowns for filters */}
                        <div className="flex flex-col gap-3">
                            <Dropdown
                                label="Target Zones"
                                options={filterOptions.bodyParts}
                                selected={selectedFilters.bodyPart}
                                onToggle={v => toggleFilter('bodyPart', v)}
                                accentColor="#22d3ee"
                            />
                            <Dropdown
                                label="Equipment"
                                options={filterOptions.equipment}
                                selected={selectedFilters.equipment}
                                onToggle={v => toggleFilter('equipment', v)}
                                accentColor="#B8FF3C"
                            />
                        </div>

                        <Button fullWidth onClick={handleGenerate} loading={isGenerating} className="mt-4 py-3 rounded-xl text-sm">
                            <Sparkles size={14} className="mr-2" /> Run AI Logic
                        </Button>
                    </div>

                    {/* Profile snapshot */}
                    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-[#B8FF3C]/5 to-transparent p-4">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest">Profile Snapshot</h4>
                        <div className="flex sm:flex-row lg:flex-col gap-4 sm:gap-6 lg:gap-3">
                            <div className="flex justify-between items-center text-xs flex-1 lg:flex-none">
                                <span className="text-slate-500 font-bold">GOAL</span>
                                <span className="text-[#B8FF3C] font-black uppercase">{user?.goal || 'Hypertrophy'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs flex-1 lg:flex-none">
                                <span className="text-slate-500 font-bold">BODY MASS</span>
                                <span className="text-slate-200 font-black">{user?.weightKg || 75} KG</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Generated plan area */}
                <div className="lg:col-span-3">
                    {!generatedPlan ? (
                        <div className="min-h-[260px] sm:min-h-[480px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/10 text-center p-6 sm:p-8">
                            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-700 mb-4 sm:mb-5 border border-slate-800">
                                <Zap size={30} />
                            </div>
                            <h3 className="text-base sm:text-xl font-bold text-slate-200">Architect Your Future</h3>
                            <p className="text-slate-500 max-w-xs mt-2 sm:mt-3 text-sm leading-relaxed">
                                Configure filters above and let AI draft a complete, optimised routine.
                            </p>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 sm:space-y-5">
                            <div className="flex items-end justify-between border-b border-slate-800 pb-4 sm:pb-5">
                                <div>
                                    <h2 className="text-lg sm:text-3xl font-black text-slate-100 tracking-tight">{generatedPlan.title}</h2>
                                    <p className="text-cyan-500 font-mono text-[10px] uppercase tracking-widest mt-1">Scientific Routine</p>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 hidden sm:block">
                                    {(generatedPlan.exercises || []).length} Movements
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {(generatedPlan.exercises || []).map((ex: any, idx: number) => (
                                    <motion.div
                                        key={ex.id + idx}
                                        initial={{ opacity: 0, y: 14 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.07 }}
                                        onClick={() => handleInspectExercise(ex)}
                                        className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 hover:border-slate-700 transition-all group cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                                            <PlayCircle size={20} className="text-[#B8FF3C]" />
                                        </div>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="min-w-0 pr-2">
                                                <h4 className="font-bold text-slate-100 text-sm capitalize group-hover:text-[#B8FF3C] transition-colors truncate">
                                                    {ex.name}
                                                </h4>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{ex.bodyPart}</p>
                                            </div>
                                            <span className="text-[10px] font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20 shrink-0">
                                                {ex.sets}×{ex.reps}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 pt-3 border-t border-slate-800/60">
                                            {[
                                                (['Sets', ex.sets, '#B8FF3C'] as const),
                                                (['Reps', ex.reps, 'text-slate-200'] as const),
                                                (['Rest', `${ex.rest_s}s`, 'text-slate-200'] as const)
                                            ].map(([label, val, color], i) => (
                                                <div key={label as string} className="flex items-center gap-3">
                                                    {i > 0 && <div className="h-5 w-px bg-slate-800" />}
                                                    <div className="text-center">
                                                        <p className="text-[9px] text-slate-600 uppercase font-black">{label}</p>
                                                        <p className={`text-sm font-black ${color === '#B8FF3C' ? '' : color}`} style={color === '#B8FF3C' ? { color } : {}}>
                                                            {val}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#0A0A0F] pb-12 px-3 sm:px-6 lg:px-8">
            {/* Mobile sticky header */}
            <div className="sm:hidden sticky top-0 z-30 flex items-center justify-between py-3 mb-4 bg-[#0A0A0F]/90 backdrop-blur-lg border-b border-slate-900 -mx-3 px-4">
                <div className="flex items-center gap-2">
                    <Dumbbell size={15} className="text-[#B8FF3C]" />
                    <span className="text-xs font-black text-slate-100 uppercase tracking-widest">Workout HQ</span>
                </div>
                <div className="flex items-center gap-2">
                    {view !== 'list' && (
                         <button
                            onClick={() => setView('list')}
                            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-100 shadow-xl"
                        >
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <button
                        onClick={() => setMobileMenuOpen(o => !o)}
                        className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400"
                    >
                        {mobileMenuOpen ? <X size={14} /> : <Menu size={14} />}
                    </button>
                </div>
            </div>

            {/* Desktop padding */}
            <div className="hidden sm:block h-16 sm:h-20" />

            {/* Mobile slide-down menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="fixed top-14 left-3 right-3 z-40 bg-[#0D0D14] border border-slate-700 rounded-2xl shadow-2xl p-2 sm:hidden"
                    >
                        {[
                            { label: 'My Plans', icon: <BarChart3 size={15} className="text-slate-400" />, color: 'text-slate-300', action: () => { setView('list'); setMobileMenuOpen(false); } },
                            { label: 'AI Generator', icon: <Sparkles size={15} className="text-cyan-400" />, color: 'text-cyan-400', action: () => { setView('generator'); setMobileMenuOpen(false); } },
                            { label: 'New Plan', icon: <Plus size={15} className="text-[#B8FF3C]" />, color: 'text-[#B8FF3C]', action: () => { setCreateModalOpen(true); setMobileMenuOpen(false); } },
                        ].map(item => (
                            <button
                                key={item.label}
                                onClick={item.action}
                                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold ${item.color} hover:bg-slate-800 transition-colors`}
                            >
                                {item.icon} {item.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto">
                <AnimatePresence mode="wait">
                    {view === 'list' ? renderList() : view === 'detail' ? renderDetail() : renderGenerator()}
                </AnimatePresence>
            </div>

            {/* Create modal */}
            <AnimatePresence>
                {createModalOpen && (
                    <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="New Program" size="sm">
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                                    Program Name
                                </label>
                                <input
                                    type="text"
                                    value={newWorkoutName}
                                    onChange={e => setNewWorkoutName(e.target.value)}
                                    placeholder="e.g. Advanced Hypertrophy"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 sm:py-3.5 text-slate-200 text-sm focus:outline-none focus:border-[#B8FF3C] transition-all placeholder:text-slate-700"
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleCreateWorkout()}
                                />
                            </div>
                            <Button
                                fullWidth
                                onClick={handleCreateWorkout}
                                disabled={!newWorkoutName.trim()}
                                loading={isSavingPlan}
                                className="py-3 sm:py-3.5 rounded-xl"
                            >
                                Initialize Program
                            </Button>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} />}
            </AnimatePresence>

            {/* Exercise Browser Modal */}
            <Modal open={exerciseBrowserOpen} onClose={() => setExerciseBrowserOpen(false)} title="Select Exercise" size="lg">
                <ExerciseBrowser onSelectAction={onSelectFromBrowser} />
            </Modal>

            {/* Exercise Inspector Modal */}
            <Modal open={!!inspectingExercise} onClose={() => setInspectingExercise(null)} title="Movement Specs" size="md">
                {inspectingExercise && (
                    <div className="space-y-6">
                        <div className="w-full aspect-square max-w-[280px] mx-auto bg-white rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl relative">
                            <img 
                                src={inspectingExercise.gifUrl} 
                                alt={inspectingExercise.name} 
                                className="w-full h-full object-cover mix-blend-multiply opacity-90"
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/5 to-transparent" />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-black text-slate-100 capitalize">{inspectingExercise.name}</h3>
                                <div className="flex gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 px-2 py-1 rounded-lg border border-slate-700">{inspectingExercise.bodyPart}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-[#B8FF3C]/10 text-[#B8FF3C] px-2 py-1 rounded-lg border border-[#B8FF3C]/20">{inspectingExercise.target}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[#B8FF3C]">
                                    <Info size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Technique Guide</span>
                                </div>
                                <div className="space-y-2">
                                    {inspectingExercise.instructions?.map((step: string, i: number) => (
                                        <div key={i} className="flex gap-3 text-sm leading-relaxed">
                                            <span className="text-[#B8FF3C] font-black shrink-0">{i + 1}.</span>
                                            <p className="text-slate-400 font-medium">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Button fullWidth onClick={() => setInspectingExercise(null)} variant="secondary" className="py-3.5 rounded-xl uppercase tracking-widest text-[10px]">
                            Dissmiss specs
                        </Button>
                    </div>
                )}
            </Modal>
            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {confirmDelete.open && (
                    <Modal 
                        open={confirmDelete.open} 
                        onClose={() => setConfirmDelete({ open: false, planId: null })} 
                        title="Confirm Deletion" 
                        size="sm"
                    >
                        <div className="flex flex-col items-center text-center gap-6 py-2">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 animate-pulse-glow">
                                <Trash2 size={28} />
                            </div>
                            <div>
                                <h3 className="text-slate-100 font-bold text-lg mb-2 capitalize">Delete this plan?</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    All training blocks and exercises within this routine will be permanently removed.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <Button 
                                    variant="secondary" 
                                    fullWidth 
                                    onClick={() => setConfirmDelete({ open: false, planId: null })}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    className="bg-red-500 hover:bg-red-600 border-none text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]" 
                                    fullWidth 
                                    onClick={confirmDeleteAction}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}