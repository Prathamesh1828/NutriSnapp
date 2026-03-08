'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
    value: number; // 0-100
    max?: number;
    color?: 'accent' | 'teal' | 'orange' | 'red' | 'custom';
    customColor?: string;
    height?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    label?: string;
    className?: string;
    animated?: boolean;
}

export default function ProgressBar({
    value,
    max = 100,
    color = 'accent',
    customColor,
    height = 'md',
    showLabel = false,
    label,
    className,
    animated = true,
}: ProgressBarProps) {
    const pct = Math.min(Math.max((value / max) * 100, 0), 100);

    const colors = {
        accent: 'bg-[#B8FF3C]',
        teal: 'bg-[#10b981]',
        orange: 'bg-[#f97316]',
        red: 'bg-red-500',
        custom: '',
    };

    const heights = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
    };

    return (
        <div className={cn('w-full', className)}>
            {(showLabel || label) && (
                <div className="flex justify-between items-center mb-1.5">
                    {label && <span className="text-xs text-white/60">{label}</span>}
                    {showLabel && (
                        <span className="text-xs font-semibold text-white/80">{Math.round(pct)}%</span>
                    )}
                </div>
            )}
            <div
                className={cn(
                    'w-full bg-white/[0.06] rounded-full overflow-hidden',
                    heights[height]
                )}
            >
                <div
                    className={cn(
                        'h-full rounded-full',
                        animated && 'transition-all duration-700 ease-out',
                        color !== 'custom' && colors[color]
                    )}
                    style={{
                        width: `${pct}%`,
                        ...(customColor ? { backgroundColor: customColor } : {}),
                    }}
                />
            </div>
        </div>
    );
}
