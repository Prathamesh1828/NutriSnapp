'use client';

import { Calendar, Trash2, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useState } from 'react';

interface WorkoutCardProps {
    id: number;
    name: string;
    date: string;
    onView: (id: number) => void;
    onDelete: (id: number) => void;
    isDeleting?: boolean;
}

export default function WorkoutCard({
    id,
    name,
    date,
    onView,
    onDelete,
    isDeleting,
}: WorkoutCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <Card
            variant="neon"
            className="flex flex-col gap-3 sm:gap-4 group hover:-translate-y-1 transition-all duration-300 w-full"
        >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-xl font-bold text-slate-100 group-hover:text-[#B8FF3C] transition-colors truncate">
                        {name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 text-slate-400 text-xs sm:text-sm">
                        <Calendar size={13} className="text-cyan-400 shrink-0" />
                        <span>{new Date(date).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Mobile kebab toggle */}
                <button
                    className="sm:hidden p-1.5 text-slate-600 hover:text-slate-400 transition-colors mt-0.5"
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-label="Toggle options"
                >
                    {menuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            {/* Desktop action row */}
            <div className="hidden sm:flex gap-3 mt-auto pt-4 border-t border-white/10">
                <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => onView(id)}
                    className="group/btn"
                >
                    View Plan
                    <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
                <Button
                    variant="destructive"
                    onClick={() => onDelete(id)}
                    loading={isDeleting}
                    aria-label="Delete Workout"
                >
                    <Trash2 size={16} />
                </Button>
            </div>

            {/* Mobile dropdown actions */}
            {menuOpen && (
                <div className="sm:hidden flex gap-2 pt-3 border-t border-white/10">
                    <button
                        onClick={() => onView(id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 hover:border-slate-500 transition-all"
                    >
                        View Plan <ArrowRight size={13} />
                    </button>
                    <button
                        onClick={() => onDelete(id)}
                        disabled={isDeleting}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Trash2 size={14} />
                        )}
                    </button>
                </div>
            )}
        </Card>
    );
}