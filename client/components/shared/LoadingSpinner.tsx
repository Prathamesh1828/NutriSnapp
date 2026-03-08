'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'accent' | 'teal' | 'white';
    className?: string;
}

export default function LoadingSpinner({ size = 'md', color = 'accent', className }: LoadingSpinnerProps) {
    const sizes = { sm: 'h-4 w-4', md: 'h-7 w-7', lg: 'h-12 w-12' };
    const colors = {
        accent: 'border-[#B8FF3C]',
        teal: 'border-[#10b981]',
        white: 'border-white',
    };

    return (
        <div
            className={cn(
                'animate-spin rounded-full border-2 border-t-transparent',
                sizes[size],
                colors[color],
                className
            )}
        />
    );
}
