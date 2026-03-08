'use client';

import { Dumbbell, MinusCircle, Info } from 'lucide-react';
import Card from '@/components/ui/Card';

interface ExerciseCardProps {
    id: number;
    setId: number;
    name: string;
    categoryName: string;
    sets: number;
    onRemove: (setId: number) => void;
    isRemoving?: boolean;
}

export default function ExerciseCard({ id, setId, name, categoryName, sets, onRemove, isRemoving }: ExerciseCardProps) {
    return (
        <Card variant="glass" padding="sm" className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between group hover:border-cyan-500/50 transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                    <Dumbbell size={20} />
                </div>
                <div>
                    <h4 className="font-semibold text-slate-200">{name}</h4>
                    <div className="flex gap-2 text-xs text-slate-500 mt-1">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                            {categoryName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#B8FF3C]/10 text-[#B8FF3C] border border-[#B8FF3C]/20">
                            {sets > 0 ? `${sets} Sets` : 'Sets not set'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <button
                    onClick={() => onRemove(setId)}
                    disabled={isRemoving}
                    className="ml-auto sm:ml-0 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                    aria-label="Remove exercise"
                >
                    {isRemoving ? (
                        <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <MinusCircle size={20} />
                    )}
                </button>
            </div>
        </Card>
    );
}
