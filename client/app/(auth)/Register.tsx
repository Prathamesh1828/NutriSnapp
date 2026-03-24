'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Leaf, Eye, EyeOff, ArrowRight, Mail, Lock, User } from 'lucide-react';

function RegisterForm() {
    const router = useRouter();
    const [role, setRole] = useState<'member' | 'coach'>('member');
    const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (form.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/account/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    role: role,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Registration failed');
                setLoading(false);
                return;
            }

            // Successfully registered, auto login
            const signInRes = await signIn('credentials', {
                email: form.email,
                password: form.password,
                redirect: false,
            });

            if (signInRes?.error) {
                // If login fails, redirect to login page with success flag
                router.push('/login?registered=true');
            } else {
                // Login succeeded, redirect to onboarding based on role
                router.push(role === 'coach' ? '/coach-onboarding' : '/member-onboarding');
                router.refresh();
            }
        } catch (err) {
            setError('A network error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
            style={{
                background: 'radial-gradient(ellipse at 30% 60%, #1c3a0c 0%, #0e1f07 40%, #080f04 100%)',
            }}
        >
            <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#B8FF3C] flex items-center justify-center mb-3 shadow-lg shadow-[#B8FF3C]/20">
                    <Leaf size={28} className="text-[#0a1205]" fill="currentColor" />
                </div>
                <span className="font-black text-white text-2xl tracking-tight">NutriSnap</span>
            </div>

            <div className="w-full max-w-sm bg-[#0e1a09]/90 border border-white/[0.08] rounded-2xl p-7 shadow-2xl backdrop-blur-sm">
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <h1 className="text-2xl font-black text-white leading-tight">Create account</h1>
                        <p className="text-white/40 text-sm mt-1">Start your fitness journey today</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-6 p-1.5 bg-white/5 border border-white/10 rounded-xl">
                    {(['member', 'coach'] as const).map(r => (
                        <button
                            key={r}
                            onClick={() => setRole(r)}
                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${role === r
                                ? 'bg-[#B8FF3C] text-[#0A0A0F] shadow-md'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>

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
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                placeholder="name@example.com"
                                className="w-full bg-[#162010]/60 border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#B8FF3C]/40 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1.5 block">Password</label>
                        <div className="relative">
                            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                                type={showPass ? 'text' : 'password'}
                                required
                                value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                placeholder="••••••••"
                                className="w-full bg-[#162010]/60 border border-white/[0.08] rounded-xl pl-9 pr-11 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#B8FF3C]/40 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                            >
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1.5 block">Confirm Password</label>
                        <div className="relative">
                            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                                type={showPass ? 'text' : 'password'}
                                required
                                value={form.confirmPassword}
                                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                placeholder="••••••••"
                                className="w-full bg-[#162010]/60 border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#B8FF3C]/40 transition-colors"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2.5 text-red-400 text-xs text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#B8FF3C] text-[#0a1205] font-black py-4 rounded-xl hover:bg-[#d4ff6e] transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-60 mt-2"
                    >
                        {loading ? 'Creating account...' : <> Sign Up <ArrowRight size={16} /> </>}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-white/[0.06]" />
                    <span className="text-white/30 text-xs font-semibold uppercase tracking-widest">or continue with</span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                </div>

                {/* Social buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => signIn('google')}
                        className="flex items-center justify-center gap-2.5 bg-[#1a2a12]/60 border border-white/[0.08] rounded-xl py-3 text-white text-sm font-semibold hover:bg-[#1a2a12] transition-colors"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </button>
                    <button className="flex items-center justify-center gap-2.5 bg-[#1a2a12]/60 border border-white/[0.08] rounded-xl py-3 text-white text-sm font-semibold hover:bg-[#1a2a12] transition-colors">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.28.07 2.17.78 2.93.79 1.12-.21 2.19-.95 3.39-.84 1.44.12 2.53.71 3.25 1.8-3.02 1.78-2.56 5.75.44 6.93-.73 1.55-1.73 3.07-2.01 4.18zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.15 1.17-.34 2.35-1.02 3.13-.69.73-1.83 1.35-2.95 1.25-.17-1.13.40-2.28 1.03-2.88z" />
                        </svg>
                        Apple
                    </button>
                </div>
            </div>

            <p className="text-sm text-white/40 mt-5">
                Already have an account?{' '}
                <Link href="/login" className="font-black text-[#B8FF3C] hover:text-[#d4ff6e] transition-colors">
                    Sign in
                </Link>
            </p>
        </div>
    );
}

export default function Register() {
    return (
        <Suspense>
            <RegisterForm />
        </Suspense>
    );
}