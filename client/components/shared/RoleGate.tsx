'use client';

import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface RoleGateProps {
    children: React.ReactNode;
    allowedRole: 'member' | 'coach';
    fallback?: React.ReactNode;
}

export default function RoleGate({ children, allowedRole, fallback = null }: RoleGateProps) {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center p-8">
                <LoadingSpinner />
            </div>
        );
    }

    if (!session || session.user.role !== allowedRole) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
