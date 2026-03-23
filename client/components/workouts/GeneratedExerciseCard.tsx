'use client';

import { useState } from 'react';
import { Dumbbell, Clock, Repeat, Info, Youtube, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '@/components/ui/Card';

interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: string;
    rest_s: number;
    instructions: string[];
}

interface GeneratedExerciseCardProps {
    exercise: Exercise;
    onClickAction: (exercise: Exercise) => void;
}

export default function GeneratedExerciseCard({ exercise, onClickAction }: GeneratedExerciseCardProps) {
    const [showInstructions, setShowInstructions] = useState(false);
    const youtubeUrl = `https://www.youtube.com/results?search_query=how+to+do+${encodeURIComponent(exercise.name)}+exercise`;

    return (
        <Card
            variant="glass"
            padding="md"
            className="flex flex-col gap-3 sm:gap-4 group cursor-pointer hover:border-[#B8FF3C]/50 transition-all hover:shadow-[0_0_20px_rgba(184,255,60,0.1)] relative overflow-hidden"
            onClick={() => onClickAction(exercise)}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-slate-800/80 flex items-center justify-center text-[#B8FF3C] border border-[#B8FF3C]/20 shadow-inner group-hover:scale-110 transition-transform">
                    <Dumbbell size={20} />
                </div>
                <div className="flex gap-1">
                    <a
                        href={youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 sm:p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Watch tutorial"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Youtube size={16} />
                    </a>
                    {/* Info toggle — opens instructions inline on mobile */}
                    <button
                        className="p-1.5 sm:p-2 text-slate-500 hover:text-cyan-400 transition-colors"
                        onClick={(e) => { e.stopPropagation(); setShowInstructions((o) => !o); }}
                        aria-label="Toggle instructions"
                    >
                        {showInstructions ? <ChevronUp size={16} /> : <Info size={16} />}
                    </button>
                </div>
            </div>

            {/* Name */}
            <div>
                <h4 className="font-bold text-base sm:text-lg text-slate-100 line-clamp-1 group-hover:text-[#B8FF3C] transition-colors capitalize">
                    {exercise.name}
                </h4>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4">
                    <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                        <Repeat size={13} className="text-cyan-400 shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-slate-300 truncate">
                            {exercise.sets} × {exercise.reps}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                        <Clock size={13} className="text-orange-400 shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-slate-300 truncate">
                            {exercise.rest_s}s Rest
                        </span>
                    </div>
                </div>
            </div>

            {/* Collapsible instructions */}
            {showInstructions && exercise.instructions?.length > 0 && (
                <div
                    className="border-t border-slate-800 pt-3 flex flex-col gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                >
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Instructions</p>
                    {exercise.instructions.map((step, i) => (
                        <div key={i} className="flex gap-2 text-xs text-slate-400">
                            <span className="text-[#B8FF3C] font-black shrink-0">{i + 1}.</span>
                            <span>{step}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Hover glow */}
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-[#B8FF3C]/5 blur-3xl rounded-full group-hover:bg-[#B8FF3C]/10 transition-all pointer-events-none" />
        </Card>
    );
}