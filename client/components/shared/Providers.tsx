'use client';

import { SessionProvider } from 'next-auth/react';
import { UserProvider } from '@/contexts/UserContext';
import { SocketProvider } from '@/contexts/SocketContext';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <UserProvider>
                <SocketProvider>
                    {children}
                </SocketProvider>
            </UserProvider>
        </SessionProvider>
    );
}
