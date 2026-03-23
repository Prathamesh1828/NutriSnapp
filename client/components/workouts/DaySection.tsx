'use client';

import { Calendar, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import ExerciseCard from './ExerciseCard';

export interface DaySetting {
    id: string | number;
    exercise: string | number;
    sets: number;
    exerciseName?: string;
    categoryName?: string;
}

interface DaySectionProps {
    id: string | number;
    description: string;
    settings: DaySetting[];
    onAddExerciseAction: (dayId: any) => void;
    onRemoveExerciseAction: (setId: any) => void;
    onDeleteDayAction: (dayId: any) => void;
    isDeletingDay?: boolean;
}

export default function DaySection({
    id,
    description,
    settings,
    onAddExerciseAction,
    onRemoveExerciseAction,
    onDeleteDayAction,
    isDeletingDay,
}: DaySectionProps) {
    // Default collapsed on mobile (small screens), expanded on desktop
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <Card
            variant="glass"
            padding="md"
            className="flex flex-col gap-0 !bg-[#0A0A0F] border border-slate-800 shadow-[0_4px_30px_rgba(0,0,0,0.4)] transition-all overflow-hidden group"
        >
            {/* ── Header row ──────────────────────────── */}
            <div
                className="flex items-center justify-between cursor-pointer py-1"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-[#B8FF3C]/10 flex items-center justify-center text-[#B8FF3C] group-hover:scale-105 transition-transform border border-[#B8FF3C]/20">
                        <Calendar size={16} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h3 className="text-sm sm:text-lg font-bold text-slate-100 group-hover:text-[#B8FF3C] transition-colors truncate">
                            {description || `Day ${id}`}
                        </h3>
                        <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-black">
                            {settings.length} Exercise{settings.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteDayAction(id)}
                        loading={isDeletingDay}
                        className="text-red-500/50 hover:text-red-400 hover:bg-red-500/10 h-8 px-2"
                        aria-label="Delete Day"
                    >
                        <Trash2 size={15} />
                    </Button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 sm:p-2 text-slate-600 hover:text-[#B8FF3C] transition-colors"
                    >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                </div>
            </div>

            {/* ── Expandable body ──────────────────────── */}
            {isExpanded && (
                <div className="flex flex-col gap-2 sm:gap-3 mt-3 sm:mt-4 pl-3 sm:pl-4 border-l-2 border-[#B8FF3C]/20">
                    {settings.map((setting) => (
                        <ExerciseCard
                            key={setting.id}
                            id={setting.exercise}
                            setId={setting.id}
                            name={setting.exerciseName || `Exercise ${setting.exercise}`}
                            categoryName={setting.categoryName || 'General'}
                            sets={setting.sets}
                            onRemoveAction={onRemoveExerciseAction}
                        />
                    ))}

                    {settings.length === 0 && (
                        <div className="py-8 sm:py-12 text-center text-slate-600 border border-dashed border-slate-800 rounded-3xl bg-slate-900/30 font-medium text-sm">
                            No exercises added to this training block.
                        </div>
                    )}

                    <Button
                        variant="outline"
                        fullWidth
                        className="mt-3 sm:mt-4 border-dashed border-slate-700 bg-slate-900/50 text-[#B8FF3C] hover:bg-[#B8FF3C] hover:text-[#0A0A0F] transition-all py-4 sm:py-6 rounded-2xl group"
                        onClick={() => onAddExerciseAction(id)}
                    >
                        <Plus
                            size={18}
                            className="mr-2 group-hover:rotate-90 transition-transform duration-300"
                        />
                        <span className="font-bold tracking-tight text-sm">ADD EXERCISE</span>
                    </Button>
                </div>
            )}
        </Card>
    );
}