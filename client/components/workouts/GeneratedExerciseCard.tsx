'use client';

import { Dumbbell, Clock, Repeat, Info } from 'lucide-react';
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
    onClick: (exercise: Exercise) => void;
}

export default function GeneratedExerciseCard({ exercise, onClick }: GeneratedExerciseCardProps) {
    return (
        <Card 
            variant="glass" 
            padding="md" 
            className="flex flex-col gap-4 group cursor-pointer hover:border-[#B8FF3C]/50 transition-all hover:shadow-[0_0_20px_rgba(184,255,60,0.1)] relative overflow-hidden"
            onClick={() => onClick(exercise)}
        >
            <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-[#B8FF3C] border border-[#B8FF3C]/20 shadow-inner group-hover:scale-110 transition-transform">
                    <Dumbbell size={24} />
                </div>
                <button className="p-2 text-slate-500 hover:text-cyan-400 transition-colors">
                    <Info size={18} />
                </button>
            </div>

            <div>
                <h4 className="font-bold text-lg text-slate-100 line-clamp-1 group-hover:text-[#B8FF3C] transition-colors capitalize">
                    {exercise.name}
                </h4>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                        <Repeat size={14} className="text-cyan-400" />
                        <span className="text-sm font-medium text-slate-300">
                            {exercise.sets} × {exercise.reps}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                        <Clock size={14} className="text-orange-400" />
                        <span className="text-sm font-medium text-slate-300">
                            {exercise.rest_s}s Rest
                        </span>
                    </div>
                </div>
            </div>

            {/* Subtle background glow on hover */}
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-[#B8FF3C]/5 blur-3xl rounded-full group-hover:bg-[#B8FF3C]/10 transition-all" />
        </Card>
    );
}
