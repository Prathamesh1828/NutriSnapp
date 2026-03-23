'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Diamond, Eye, EyeOff, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';

function getStrength(pw: string): { score: number; label: string; pct: number; color: string } {
    if (!pw) return { score: 0, label: '', pct: 0, color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const map = [
        { label: 'Weak', pct: 20, color: '#ef4444' },
        { label: 'Fair', pct: 40, color: '#f97316' },
        { label: 'Moderate', pct: 60, color: '#eab308' },
        { label: 'Strong', pct: 80, color: '#84cc16' },
        { label: 'Very Strong', pct: 92, color: '#B8FF3C' },
    ];
    const entry = map[Math.min(score, 5) - 1] || map[0];
    return { score, ...entry };
}

function ResetPasswordForm() {
    const router = useRouter();
    const params = useSearchParams();
    const token = params.get('token') || '';

    const [form, setForm] = useState({ password: '', confirm: '' });
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const strength = getStrength(form.password);
    const matches = form.password && form.confirm && form.password === form.confirm;
    const valid = matches && strength.score >= 3;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!valid) return;
        setError('');
        setLoading(true);
        // TODO: call /api/auth/reset-password with token + new password
        await new Promise(r => setTimeout(r, 1000));
        setLoading(false);
        router.push('/login?reset=1');
    };

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                background: 'radial-gradient(ellipse at 60% 40%, #1c3a0c 0%, #0e1f07 40%, #080f04 100%)',
            }}
        >
            {/* Top navbar */}
            <nav className="flex items-center justify-between px-6 h-14 border-b border-white/[0.06]">
                <Link href="/" className="flex items-center gap-2">
                    <Diamond size={18} className="text-[#B8FF3C]" fill="currentColor" />
                    <span className="font-black text-white text-lg tracking-tight">NutriSnap</span>
                </Link>
                <button className="w-8 h-8 bg-[#B8FF3C]/15 border border-[#B8FF3C]/20 rounded-full flex items-center justify-center text-[#B8FF3C] hover:bg-[#B8FF3C]/25 transition-colors">
                    <HelpCircle size={15} />
                </button>
            </nav>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-16">
                <div className="w-full max-w-md bg-[#0e1a09]/80 border border-white/[0.08] rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
                    <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                        Secure Your Account
                    </h1>
                    <p className="text-[#B8FF3C] text-sm mb-8 leading-relaxed">
                        Choose a strong, unique password to keep your macros safe.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* New Password */}
                        <div>
                            <label className="block text-xs font-black text-white/40 uppercase tracking-widest mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    required
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    placeholder="••••••••••••"
                                    className="w-full bg-[#162010]/60 border border-white/[0.08] rounded-xl px-4 py-3.5 pr-11 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#B8FF3C]/40 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                                >
                                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Strength */}
                            {form.password && (
                                <div className="mt-2.5">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <p className="text-xs">
                                            <span className="text-white/40">Strength: </span>
                                            <span className="font-bold" style={{ color: strength.color }}>{strength.label}</span>
                                        </p>
                                        <span className="text-xs text-white/30">{strength.pct}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${strength.pct}%`, background: strength.color }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-black text-white/40 uppercase tracking-widest mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    required
                                    value={form.confirm}
                                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                                    placeholder="••••••••••••"
                                    className={`w-full bg-[#162010]/60 border rounded-xl px-4 py-3.5 pr-11 text-white text-sm placeholder:text-white/25 focus:outline-none transition-colors ${form.confirm && !matches
                                        ? 'border-red-500/40 focus:border-red-500/60'
                                        : 'border-white/[0.08] focus:border-[#B8FF3C]/40'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                                >
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2.5 text-red-400 text-xs">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !valid}
                            className="w-full bg-[#B8FF3C] text-[#0a1205] font-black py-4 rounded-xl hover:bg-[#d4ff6e] transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : <> Set New Password <ArrowRight size={16} /> </>}
                        </button>
                    </form>

                    {/* Validation message */}
                    {valid && (
                        <div className="mt-4 flex items-center gap-2 text-[#B8FF3C] text-sm justify-center animate-fade-in">
                            <CheckCircle2 size={16} />
                            <span>Passwords match and meet all requirements</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="px-6 py-5 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-white/20 text-xs">© 2026 NutriSnap. All rights reserved.</p>
                <div className="flex gap-5 text-white/25 text-xs">
                    {['Privacy Policy', 'Terms of Service', 'Contact Support'].map(l => (
                        <a key={l} href="#" className="hover:text-white/50 transition-colors">{l}</a>
                    ))}
                </div>
            </footer>
        </div>
    );
}

export default function ResetPassword() {
    return (
        <Suspense>
            <ResetPasswordForm />
        </Suspense>
    );
}
