'use client';

import { Calendar, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import ExerciseCard from './ExerciseCard';

export interface DaySetting {
    id: number;
    exercise: number; // Base exercise ID
    sets: number;
    exerciseName?: string;
    categoryName?: string;
}

interface DaySectionProps {
    id: number;
    description: string;
    settings: DaySetting[];
    onAddExercise: (dayId: number) => void;
    onRemoveExercise: (setId: number) => void;
    onDeleteDay: (dayId: number) => void;
    isDeletingDay?: boolean;
}

export default function DaySection({
    id,
    description,
    settings,
    onAddExercise,
    onRemoveExercise,
    onDeleteDay,
    isDeletingDay
}: DaySectionProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <Card variant="glass" padding="md" className="flex flex-col gap-4 !bg-slate-900 border border-slate-800 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                        <Calendar size={18} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-100">{description || `Day ${id}`}</h3>
                    <span className="text-sm text-slate-500 bg-slate-800 px-2 py-1 rounded-md ml-2">
                        {settings.length} Exercises
                    </span>
                </div>

                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteDay(id)}
                        loading={isDeletingDay}
                        className="text-red-400 hover:bg-red-500/20"
                        aria-label="Delete Day"
                    >
                        <Trash2 size={16} />
                    </Button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 text-slate-500 hover:text-cyan-400"
                    >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="flex flex-col gap-3 mt-2 pl-4 border-l-2 border-cyan-500/20">
                    {settings.map((setting) => (
                        <ExerciseCard
                            key={setting.id}
                            id={setting.exercise}
                            setId={setting.id}
                            name={setting.exerciseName || `Exercise ${setting.exercise}`}
                            categoryName={setting.categoryName || 'Unknown Category'}
                            sets={setting.sets}
                            onRemove={onRemoveExercise}
                        />
                    ))}

                    {settings.length === 0 && (
                        <div className="py-8 text-center text-slate-500 border border-dashed border-slate-700 rounded-xl bg-slate-800/50">
                            No exercises added to this day yet.
                        </div>
                    )}

                    <Button
                        variant="outline"
                        className="w-full mt-2 border-dashed border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
                        onClick={() => onAddExercise(id)}
                    >
                        <Plus size={16} className="mr-2" /> Add Exercise to Day
                    </Button>
                </div>
            )}
        </Card>
    );
}
