'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Scan, Dumbbell, MessageCircle, User, Users, BookOpen, BarChart3 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

const memberItems = [
    { href: '/member/dashboard', icon: LayoutDashboard, label: 'Home' },
    { href: '/member/analyze', icon: Scan, label: 'Analyze' },
    { href: '/member/workouts', icon: Dumbbell, label: 'Workouts' },
    { href: '/member/coach', icon: MessageCircle, label: 'Coach' },
    { href: '/member/profile', icon: User, label: 'Profile' },
];

const coachItems = [
    { href: '/coach/dashboard', icon: LayoutDashboard, label: 'Home' },
    { href: '/coach/clients', icon: Users, label: 'Clients' },
    { href: '/coach/programs', icon: BookOpen, label: 'Programs' },
    { href: '/coach/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/coach/messages', icon: MessageCircle, label: 'Messages' },
];

export default function MobileNav() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isCoach = session?.user.role === 'coach';
    const items = isCoach ? coachItems : memberItems;
    const accentColor = isCoach ? '#10b981' : '#B8FF3C';

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[rgba(19,19,26,0.97)] backdrop-blur-lg border-t border-white/[0.06] z-40 px-2 pb-safe">
            <div className="flex items-center justify-around py-2">
                {items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 px-3 py-2 min-w-[56px]">
                            <item.icon
                                size={20}
                                style={{ color: isActive ? accentColor : 'rgba(255,255,255,0.4)' }}
                            />
                            <span
                                className={cn('text-[10px] font-medium transition-colors')}
                                style={{ color: isActive ? accentColor : 'rgba(255,255,255,0.4)' }}
                            >
                                {item.label}
                            </span>
                            {isActive && (
                                <div
                                    className="absolute bottom-0 w-1 h-1 rounded-full"
                                    style={{ backgroundColor: accentColor }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
