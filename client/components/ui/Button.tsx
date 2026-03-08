'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            loading = false,
            fullWidth = false,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const base =
            'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

        const variants = {
            primary:
                'bg-[#B8FF3C] text-[#0A0A0F] hover:shadow-[0_0_30px_rgba(184,255,60,0.5)] hover:-translate-y-0.5 active:translate-y-0',
            secondary:
                'glass-panel text-white hover:border-[rgba(184,255,60,0.4)] hover:text-[#B8FF3C] border border-white/10',
            ghost:
                'text-white/70 hover:text-white hover:bg-white/5 rounded-lg',
            destructive:
                'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30',
            outline:
                'border border-[rgba(184,255,60,0.4)] text-[#B8FF3C] hover:bg-[rgba(184,255,60,0.1)]',
        };

        const sizes = {
            sm: 'text-sm px-4 py-2 gap-1.5',
            md: 'text-sm px-5 py-2.5 gap-2',
            lg: 'text-base px-7 py-3.5 gap-2.5',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    base,
                    variants[variant],
                    sizes[size],
                    fullWidth && 'w-full',
                    className
                )}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <>
                        <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>
                        Loading...
                    </>
                ) : (
                    children
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
