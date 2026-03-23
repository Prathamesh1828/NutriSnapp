'use client';

import { useState } from 'react';

export default function ForgotPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [strength, setStrength] = useState(80); // Demo: 80% "Very Strong"

    const getStrengthColor = () => {
        if (strength < 30) return 'bg-red-500';
        if (strength < 60) return 'bg-yellow-500';
        if (strength < 80) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword === confirmPassword) {
            console.log('Reset password:', newPassword);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-900 via-emerald-900 to-green-800 relative overflow-hidden">
            {/* Footer Links */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 text-xs text-emerald-400">
                <a href="#" className="hover:text-emerald-300 transition-colors">Terms</a>
                <a href="#" className="hover:text-emerald-300 transition-colors">Privacy</a>
                <a href="#" className="hover:text-emerald-300 transition-colors">Support</a>
            </div>

            <div className="w-full max-w-md z-10">
                {/* Logo */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent text-4xl font-black mx-auto">
                        🗂️ NutriSnap
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-emerald-900/90 backdrop-blur-md border border-emerald-600/50 rounded-3xl p-8 shadow-2xl">
                    <h1 className="text-2xl font-bold text-white mb-2 text-center bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                        Secure Your Account
                    </h1>
                    <p className="text-emerald-300 text-sm mb-8 text-center">Macros safe, unique password keeps your</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-emerald-200 mb-3">NEW PASSWORD</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        // Simple strength demo
                                        setStrength(Math.min(100, e.target.value.length * 10));
                                    }}
                                    className="w-full px-4 py-4 bg-emerald-800/50 border border-emerald-600/50 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all"
                                    placeholder="New password"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 text-xl">👁️</div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-emerald-200 mb-3">Strength</label>
                            <div className="w-full bg-emerald-800/50 rounded-full h-2">
                                <div className={`h-2 rounded-full ${getStrengthColor()} transition-all`} style={{ width: `${strength}%` }} />
                            </div>
                            <span className="text-xs text-emerald-400 ml-1">Very Strong</span>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-emerald-200 mb-3">CONFIRM PASSWORD</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-4 bg-emerald-800/50 border border-emerald-600/50 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all"
                                    placeholder="Confirm password"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 text-xl">👁️</div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-500 hover:to-emerald-600 text-black font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wide text-sm flex items-center justify-center gap-1"
                        >
                            Set New Password →
                        </button>
                    </form>

                    <p className="text-center mt-6 text-xs text-emerald-400">Passwords match & meet requirements</p>
                </div>
            </div>
        </main>
    );
}
