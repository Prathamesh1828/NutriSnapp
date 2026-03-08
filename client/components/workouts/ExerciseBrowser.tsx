'use client';

import { useState, useEffect, useCallback } from 'react';
import { wgerApi, Exercise, Category, Muscle } from '@/lib/wgerApi';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Search, Loader2 } from 'lucide-react';

interface ExerciseBrowserProps {
    onSelect: (exerciseId: number) => void;
    categoryId?: number;
}

export default function ExerciseBrowser({ onSelect, categoryId }: ExerciseBrowserProps) {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [muscles, setMuscles] = useState<Muscle[]>([]);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedCategory, setSelectedCategory] = useState<number | undefined>(categoryId);
    const [selectedMuscle, setSelectedMuscle] = useState<number | undefined>(undefined);

    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 20;

    // Load Metadata
    useEffect(() => {
        async function loadMetadata() {
            try {
                const [catRes, musRes] = await Promise.all([
                    wgerApi.fetchCategories(),
                    wgerApi.fetchMuscles()
                ]);
                setCategories(catRes.results || []);
                setMuscles(musRes.results || []);
            } catch (err) {
                console.error("Failed to load metadata", err);
            }
        }
        loadMetadata();
    }, []);

    // Fetch Exercises
    const fetchExercisesList = useCallback(async (isLoadMore = false) => {
        try {
            if (isLoadMore) setLoadingMore(true);
            else setLoading(true);

            const res = await wgerApi.fetchExercises(LIMIT, isLoadMore ? offset : 0, selectedCategory, selectedMuscle);

            const newExercises = res.results || [];
            if (isLoadMore) {
                setExercises(prev => [...prev, ...newExercises]);
            } else {
                setExercises(newExercises);
                setOffset(0);
            }

            setHasMore(!!res.next);
        } catch (err) {
            console.error("Failed to fetch exercises", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [offset, selectedCategory, selectedMuscle]);

    // Refetch when filters change
    useEffect(() => {
        fetchExercisesList(false);
    }, [selectedCategory, selectedMuscle, fetchExercisesList]);

    // Filter existing list locally for fast search, but API search is better if wger supported it well.
    // Wger doesn't have a simple text search query param in the base endpoint without translations, 
    // so we'll do local filtering on loaded items for a simple implementation.
    const filteredExercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleLoadMore = () => {
        setOffset(prev => prev + LIMIT);
        // The effect or manual call will trigger next page
    };

    useEffect(() => {
        if (offset > 0) {
            fetchExercisesList(true);
        }
    }, [offset, fetchExercisesList]);

    // Helpers
    const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || 'Unknown';

    return (
        <div className="flex flex-col h-[60vh] max-h-[600px]">
            <div className="flex flex-col gap-4 mb-4 flex-shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search exercises (local)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <select
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-[#B8FF3C] min-w-[140px]"
                        value={selectedCategory || ''}
                        onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <select
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 min-w-[140px]"
                        value={selectedMuscle || ''}
                        onChange={(e) => setSelectedMuscle(e.target.value ? Number(e.target.value) : undefined)}
                    >
                        <option value="">All Muscles</option>
                        {muscles.map(m => (
                            <option key={m.id} value={m.id}>{m.name_en || m.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 custom-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-cyan-500">
                        <Loader2 size={32} className="animate-spin" />
                    </div>
                ) : filteredExercises.length === 0 ? (
                    <div className="text-center text-slate-500 py-10">No exercises found. Try changing filters.</div>
                ) : (
                    filteredExercises.map(ex => (
                        <Card
                            key={ex.id}
                            variant="default"
                            padding="sm"
                            className="flex justify-between items-center bg-slate-900/50 hover:bg-slate-800 transition-colors cursor-pointer group border border-transparent hover:border-cyan-500/30"
                            onClick={() => onSelect(ex.id)}
                        >
                            <div>
                                <h4 className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">{ex.name}</h4>
                                <div className="text-xs text-slate-500 mt-1 flex gap-2">
                                    <span className="bg-white/5 px-2 rounded-md">{getCategoryName(ex.category)}</span>
                                    {ex.muscles.length > 0 && <span className="bg-cyan-500/10 text-cyan-400 px-2 rounded-md">{ex.muscles.length} Primary Muscles</span>}
                                </div>
                            </div>
                            <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                Add
                            </Button>
                        </Card>
                    ))
                )}

                {hasMore && !loading && (
                    <Button
                        variant="ghost"
                        onClick={handleLoadMore}
                        loading={loadingMore}
                        className="mt-2 text-[#B8FF3C] hover:text-[#B8FF3C] hover:bg-[#B8FF3C]/10"
                    >
                        Load More Exercises
                    </Button>
                )}
            </div>
        </div>
    );
}
