'use client';

import { Calendar, Trash2, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface WorkoutCardProps {
    id: number;
    name: string;
    date: string;
    onView: (id: number) => void;
    onDelete: (id: number) => void;
    isDeleting?: boolean;
}

export default function WorkoutCard({ id, name, date, onView, onDelete, isDeleting }: WorkoutCardProps) {
    return (
        <Card variant="neon" className="flex flex-col gap-4 group hover:-translate-y-1 transition-all duration-300 w-full">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-slate-100 group-hover:text-[#B8FF3C] transition-colors">{name}</h3>
                    <div className="flex items-center gap-2 mt-2 text-slate-400 text-sm">
                        <Calendar size={14} className="text-cyan-400" />
                        <span>{new Date(date).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 mt-auto pt-4 border-t border-white/10">
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
        </Card>
    );
}
