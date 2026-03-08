'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Diamond, RotateCcw, Mail, ArrowRight, ChevronLeft, CheckCircle2, X } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate sending — replace with real API call when email service is set up
        await new Promise(r => setTimeout(r, 1000));
        setLoading(false);
        setSent(true);
    };

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                background: 'radial-gradient(ellipse at 40% 30%, #1c3a0c 0%, #0e1f07 40%, #080f04 100%)',
            }}
        >
            {/* Top navbar */}
            <nav className="flex items-center justify-between px-6 h-14 border-b border-white/[0.06]">
                <Link href="/" className="flex items-center gap-2">
                    <Diamond size={18} className="text-[#B8FF3C]" fill="currentColor" />
                    <span className="font-black text-white text-lg tracking-tight">MacroSnap</span>
                </Link>
                <Link
                    href="/login"
                    className="w-8 h-8 bg-[#1a2a12] border border-white/[0.08] rounded-lg flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                    <X size={15} />
                </Link>
            </nav>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                {/* Main card */}
                <div className="w-full max-w-sm bg-[#0e1a09]/80 border border-white/[0.08] rounded-2xl p-7 shadow-2xl backdrop-blur-sm mb-4">
                    {/* Icon */}
                    <div className="flex justify-center mb-5">
                        <div className="w-14 h-14 rounded-full bg-[#B8FF3C]/15 border border-[#B8FF3C]/25 flex items-center justify-center">
                            <RotateCcw size={26} className="text-[#B8FF3C]" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-white text-center mb-2">Reset your password</h1>
                    <p className="text-white/40 text-sm text-center mb-6 leading-relaxed">
                        Enter your registered email address below. We&apos;ll send you a secure link to reset your account credentials.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full bg-[#162010]/60 border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#B8FF3C]/40 transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || sent}
                            className="w-full bg-[#B8FF3C] text-[#0a1205] font-black py-4 rounded-xl hover:bg-[#d4ff6e] transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                        >
                            {loading ? 'Sending...' : <> Send Reset Link <ArrowRight size={16} /> </>}
                        </button>
                    </form>

                    <div className="flex justify-center mt-5">
                        <Link
                            href="/login"
                            className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors font-medium"
                        >
                            <ChevronLeft size={14} /> Back to Login
                        </Link>
                    </div>
                </div>

                {/* "Check your email" success card */}
                {sent && (
                    <div className="w-full max-w-sm bg-[#0e1a09]/60 border border-[#B8FF3C]/20 rounded-2xl p-5 flex gap-3 items-start animate-fade-in">
                        <div className="w-8 h-8 rounded-full bg-[#B8FF3C]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle2 size={18} className="text-[#B8FF3C]" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm mb-1">Check your email</p>
                            <p className="text-white/40 text-xs leading-relaxed">
                                We&apos;ve sent a recovery link to your inbox. If you don&apos;t see it within 5 minutes, check your spam folder or{' '}
                                <button
                                    onClick={() => setSent(false)}
                                    className="text-[#B8FF3C] font-bold underline underline-offset-2 hover:text-[#d4ff6e]"
                                >
                                    request a new one
                                </button>
                                .
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="px-6 py-5 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-white/20 text-xs">© 2026 MacroSnap Inc. All rights reserved. Secure password recovery system.</p>
                <div className="flex gap-5 text-white/25 text-xs">
                    {['Privacy Policy', 'Terms of Service', 'Contact Support'].map(l => (
                        <a key={l} href="#" className="hover:text-white/50 transition-colors">{l}</a>
                    ))}
                </div>
            </footer>
        </div>
    );
}
