'use client';

import { useState } from 'react';
import { Dumbbell, MinusCircle, Youtube, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '@/components/ui/Card';

interface ExerciseCardProps {
    id: string | number;
    setId: string | number;
    name: string;
    categoryName: string;
    sets: number;
    onRemoveAction: (setId: any) => void;
    isRemoving?: boolean;
}

export default function ExerciseCard({
    id,
    setId,
    name,
    categoryName,
    sets,
    onRemoveAction,
    isRemoving,
}: ExerciseCardProps) {
    const [expanded, setExpanded] = useState(false);
    const youtubeUrl = `https://www.youtube.com/results?search_query=how+to+do+${encodeURIComponent(name)}+exercise`;

    return (
        <Card
            variant="glass"
            padding="sm"
            className="bg-slate-900 border border-slate-800 shadow-xl group hover:border-cyan-500/40 transition-all duration-200"
        >
            {/* ── Main row ─────────────────────────────── */}
            <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                    <Dumbbell size={18} />
                </div>

                {/* Title + badges */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-100 capitalize truncate text-sm sm:text-base">
                        {name}
                    </h4>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase tracking-tighter text-slate-400">
                            {categoryName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#B8FF3C]/10 text-[#B8FF3C] border border-[#B8FF3C]/20 text-[10px] font-bold">
                            {sets > 0 ? `${sets} Sets` : 'Sets not set'}
                        </span>
                    </div>
                </div>

                {/* Desktop actions — hidden on mobile */}
                <div className="hidden sm:flex items-center gap-1 shrink-0">
                    <a
                        href={youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold"
                        title="Watch tutorial"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Youtube size={16} />
                        <span>DEMO</span>
                    </a>
                    <button
                        onClick={() => onRemoveAction(setId)}
                        disabled={isRemoving}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        aria-label="Remove exercise"
                    >
                        {isRemoving ? (
                            <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <MinusCircle size={18} />
                        )}
                    </button>
                </div>

                {/* Mobile toggle chevron */}
                <button
                    className="sm:hidden p-1.5 text-slate-600 hover:text-slate-400 transition-colors"
                    onClick={() => setExpanded((o) => !o)}
                    aria-label="Toggle actions"
                >
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            {/* Mobile expanded actions */}
            {expanded && (
                <div className="sm:hidden flex gap-2 pt-3 mt-3 border-t border-slate-800">
                    <a
                        href={youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20 hover:bg-red-500/20 transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Youtube size={14} /> Watch Demo
                    </a>
                    <button
                        onClick={() => onRemoveAction(setId)}
                        disabled={isRemoving}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 text-red-400 text-xs font-bold border border-slate-700 hover:bg-red-500/10 transition-all disabled:opacity-50"
                    >
                        {isRemoving ? (
                            <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <MinusCircle size={14} /> Remove
                            </>
                        )}
                    </button>
                </div>
            )}
        </Card>
    );
}