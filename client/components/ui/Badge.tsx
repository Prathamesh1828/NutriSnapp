'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'accent' | 'teal' | 'orange' | 'red' | 'gray' | 'outline';
    size?: 'sm' | 'md';
    className?: string;
}

export default function Badge({ children, variant = 'accent', size = 'md', className }: BadgeProps) {
    const variants = {
        accent: 'bg-[rgba(184,255,60,0.12)] text-[#B8FF3C] border border-[rgba(184,255,60,0.3)]',
        teal: 'bg-[rgba(16,185,129,0.12)] text-[#10b981] border border-[rgba(16,185,129,0.3)]',
        orange: 'bg-[rgba(249,115,22,0.12)] text-[#f97316] border border-[rgba(249,115,22,0.3)]',
        red: 'bg-[rgba(239,68,68,0.12)] text-red-400 border border-red-400/30',
        gray: 'bg-white/[0.06] text-white/60 border border-white/10',
        outline: 'bg-transparent text-white/70 border border-white/20',
    };

    const sizes = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-xs px-3 py-1',
    };

    return (
        <span className={cn('inline-flex items-center gap-1 rounded-full font-medium', variants[variant], sizes[size], className)}>
            {children}
        </span>
    );
}
