'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: React.ReactNode;
    iconRight?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, hint, icon, iconRight, type, id, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';
        const inputType = isPassword && showPassword ? 'text' : type;

        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && (
                    <label
                        htmlFor={id}
                        className="text-sm font-medium text-white/70"
                    >
                        {label}
                    </label>
                )}
                <div className="relative flex items-center">
                    {icon && (
                        <div className="absolute left-3.5 text-white/40 pointer-events-none">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={id}
                        type={inputType}
                        className={cn(
                            'w-full bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-xl px-4 py-3 text-white text-sm',
                            'placeholder:text-white/30',
                            'focus:outline-none focus:border-[rgba(184,255,60,0.5)] focus:bg-[rgba(184,255,60,0.03)]',
                            'transition-all duration-200',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            error && 'border-red-500/60 focus:border-red-500/60',
                            icon && 'pl-10',
                            (iconRight || isPassword) && 'pr-10',
                            className
                        )}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 text-white/40 hover:text-white/70 transition-colors"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    )}
                    {iconRight && !isPassword && (
                        <div className="absolute right-3.5 text-white/40 pointer-events-none">
                            {iconRight}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                        <span>⚠</span> {error}
                    </p>
                )}
                {hint && !error && (
                    <p className="text-xs text-white/40">{hint}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
