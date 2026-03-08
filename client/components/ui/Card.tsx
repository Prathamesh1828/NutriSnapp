'use client';

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'neon' | 'teal' | 'glass';
    padding?: 'sm' | 'md' | 'lg' | 'none';
}

function Card({ className, variant = 'default', padding = 'md', children, ...props }: CardProps) {
    const variants = {
        default: 'glass-panel',
        neon: 'glass-panel neon-border',
        teal: 'glass-panel teal-border',
        glass: 'bg-white/[0.03] backdrop-blur-lg border border-white/[0.06]',
    };

    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div
            className={cn(
                'rounded-2xl',
                variants[variant],
                paddings[padding],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export default Card;
