'use client';

import { useState, useEffect, useRef } from 'react';
import { workoutApi } from '@/lib/workoutApi';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Search, Loader2, Info, ChevronDown, X, SlidersHorizontal, Plus } from 'lucide-react';

interface ExerciseBrowserProps {
    onSelectAction: (exerciseId: string) => void;
}

// ── Inline dropdown for filters ────────────────────────────────────────────────
function FilterDropdown({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: string[];
    value: string;
    onChange: (v: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const displayLabel = value
        ? value.charAt(0).toUpperCase() + value.slice(1)
        : label;

    return (
        <div ref={ref} className="relative flex-1">
            <button
                onClick={() => setOpen((o) => !o)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all ${value
                        ? 'bg-[#B8FF3C]/10 border-[#B8FF3C]/40 text-[#B8FF3C]'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
            >
                <span className="truncate font-semibold capitalize">{displayLabel}</span>
                <div className="flex items-center gap-1 shrink-0 ml-1">
                    {value && (
                        <span
                            className="p-0.5 rounded hover:bg-[#B8FF3C]/20 transition-colors"
                            onClick={(e) => { e.stopPropagation(); onChange(''); }}
                        >
                            <X size={12} />
                        </span>
                    )}
                    <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    />
                </div>
            </button>

            {open && (
                <div className="absolute top-full mt-1.5 left-0 right-0 z-50 bg-[#0D0D14] border border-slate-700 rounded-xl shadow-2xl max-h-52 overflow-y-auto py-1">
                    <button
                        onClick={() => { onChange(''); setOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-800 transition-colors capitalize"
                    >
                        All
                    </button>
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => { onChange(opt); setOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-xs font-semibold capitalize transition-colors ${value === opt
                                    ? 'text-[#B8FF3C] bg-[#B8FF3C]/10'
                                    : 'text-slate-300 hover:bg-slate-800'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ExerciseBrowser({ onSelectAction }: ExerciseBrowserProps) {
    const [exercises, setExercises] = useState<any[]>([]);
    const [bodyParts, setBodyParts] = useState<string[]>([]);
    const [targets, setTargets] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBodyPart, setSelectedBodyPart] = useState('');
    const [selectedTarget, setSelectedTarget] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        async function loadInitialData() {
            try {
                setLoading(true);
                const [bpRes, tarRes, exRes] = await Promise.all([
                    workoutApi.fetchBodyParts(),
                    workoutApi.fetchMuscles(),
                    workoutApi.fetchExercises(),
                ]);
                setBodyParts(bpRes.data || []);
                setTargets(tarRes.data || []);
                setExercises(exRes.data || []);
            } catch (err) {
                console.error('Failed to load exercises', err);
            } finally {
                setLoading(false);
            }
        }
        loadInitialData();
    }, []);

    const filteredExercises = exercises.filter((ex) => {
        const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBodyPart = !selectedBodyPart || ex.bodyPart === selectedBodyPart;
        const matchesTarget = !selectedTarget || ex.target === selectedTarget;
        return matchesSearch && matchesBodyPart && matchesTarget;
    });

    const activeFilterCount = [selectedBodyPart, selectedTarget].filter(Boolean).length;

    return (
        <div className="flex flex-col h-[75vh] max-h-[720px]">
            {/* ── Search + filter bar ──────────────────── */}
            <div className="flex flex-col gap-2 sm:gap-3 mb-3 sm:mb-4 shrink-0">
                {/* Search row */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                            size={16}
                        />
                        <input
                            type="text"
                            placeholder="Search exercises…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-[#B8FF3C] transition-colors placeholder:text-slate-600"
                        />
                    </div>

                    {/* Mobile filter toggle */}
                    <button
                        onClick={() => setShowFilters((o) => !o)}
                        className={`sm:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-bold transition-all ${activeFilterCount > 0
                                ? 'bg-[#B8FF3C]/10 border-[#B8FF3C]/40 text-[#B8FF3C]'
                                : 'bg-slate-900 border-slate-700 text-slate-400'
                            }`}
                    >
                        <SlidersHorizontal size={15} />
                        {activeFilterCount > 0 && (
                            <span className="w-4 h-4 rounded-full bg-[#B8FF3C] text-[#0A0A0F] text-[9px] font-black flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Filter dropdowns — always visible on desktop, toggled on mobile */}
                <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex gap-2`}>
                    <FilterDropdown
                        label="Body Part"
                        options={bodyParts}
                        value={selectedBodyPart}
                        onChange={setSelectedBodyPart}
                    />
                    <FilterDropdown
                        label="Target Muscle"
                        options={targets}
                        value={selectedTarget}
                        onChange={setSelectedTarget}
                    />
                    {activeFilterCount > 0 && (
                        <button
                            onClick={() => { setSelectedBodyPart(''); setSelectedTarget(''); }}
                            className="shrink-0 px-3 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700 hover:border-slate-500 transition-all whitespace-nowrap"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* ── Results list ─────────────────────────── */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 sm:gap-3 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#B8FF3C] gap-4">
                        <Loader2 size={36} className="animate-spin" />
                        <span className="text-slate-500 text-xs animate-pulse font-mono uppercase tracking-widest">
                            Hydrating Library…
                        </span>
                    </div>
                ) : filteredExercises.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-3xl">
                        <Info size={28} className="mx-auto text-slate-700 mb-3" />
                        <p className="text-slate-500 text-sm">No exercises match your filters.</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSearchQuery(''); setSelectedBodyPart(''); setSelectedTarget(''); }}
                            className="mt-2 text-cyan-400 text-xs"
                        >
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest px-1 mb-2">
                            {filteredExercises.length} movements found
                        </div>
                        <div className="flex flex-col gap-2 pb-6">
                            {filteredExercises.slice(0, 200).map((ex) => (
                                <div
                                    key={ex.id || ex.name}
                                    onClick={() => onSelectAction(ex.id)}
                                    className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-[#B8FF3C]/40 hover:bg-slate-800/60 transition-all cursor-pointer group"
                                >
                                    {/* GIF thumbnail with loading fallback */}
                                    <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shrink-0 border border-slate-800 shadow-inner flex items-center justify-center">
                                        <img
                                            src={ex.gifUrl || '/placeholder-exercise.png'}
                                            alt={ex.name}
                                            className="w-full h-full object-contain mix-blend-multiply transition-opacity opacity-90 group-hover:opacity-100"
                                            referrerPolicy="no-referrer"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZhcHoxZGZ4ZzB6Z3Z4ZzB6Z3Z4ZzB6Z3Z4ZzB6Z3Z4ZzB6Z3Z4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKDkDbIDJieKbVm/giphy.gif'; // Generic fitness placeholder
                                                (e.target as HTMLImageElement).className = 'w-10 h-10 object-contain opacity-20';
                                            }}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0 pr-2">
                                        <h4 className="font-bold text-slate-100 group-hover:text-[#B8FF3C] transition-colors truncate capitalize text-sm mb-1 line-clamp-1">
                                            {ex.name}
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            <span className="text-[9px] uppercase tracking-widest bg-slate-800 text-slate-500 px-2 py-0.5 rounded-lg border border-slate-700">
                                                {ex.bodyPart}
                                            </span>
                                            <span className="text-[9px] uppercase tracking-widest bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                                                {ex.target}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus size={14} className="text-[#B8FF3C]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredExercises.length > 200 && (
                            <div className="text-center py-4 text-slate-600 font-mono text-[10px] uppercase tracking-[0.3em] border-t border-slate-800/50 mt-2">
                                Top 200 of {filteredExercises.length} shown
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}