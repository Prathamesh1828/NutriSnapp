'use client';

import { cn } from '@/lib/utils';

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    disabled?: boolean;
    color?: 'accent' | 'teal';
    className?: string;
}

export default function Toggle({
    checked,
    onChange,
    label,
    description,
    disabled = false,
    color = 'accent',
    className,
}: ToggleProps) {
    return (
        <div className={cn('flex items-center gap-3', className)}>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => !disabled && onChange(!checked)}
                disabled={disabled}
                className={cn(
                    'relative w-11 h-6 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-ring',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    checked
                        ? color === 'teal'
                            ? 'bg-[#10b981]'
                            : 'bg-[#B8FF3C]'
                        : 'bg-white/10'
                )}
            >
                <span
                    className={cn(
                        'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300',
                        checked && 'translate-x-5'
                    )}
                />
            </button>
            {(label || description) && (
                <div className="flex flex-col">
                    {label && (
                        <span className="text-sm font-medium text-white">{label}</span>
                    )}
                    {description && (
                        <span className="text-xs text-white/50">{description}</span>
                    )}
                </div>
            )}
        </div>
    );
}
