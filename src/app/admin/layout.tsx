'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Shield } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        async function checkAdmin() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.replace('/login');
                return;
            }

            try {
                // Verify role against API (which checks DB)
                const res = await fetch('/api/attendance/me', {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
                const data = await res.json();

                if (data.role === 'ADMIN') {
                    setAuthorized(true);
                } else {
                    router.replace('/dashboard'); // Kick non-admins back to dashboard
                }
            } catch (e) {
                router.replace('/dashboard');
            } finally {
                setChecking(false);
            }
        }
        checkAdmin();
    }, []);

    if (checking) {
        return (
            <div className="min-h-screen bg-coffee-950 flex flex-col items-center justify-center text-coffee-100">
                <div className="animate-spin mb-4">
                    <Shield size={48} className="text-coffee-500" />
                </div>
                <p className="text-coffee-400 font-mono text-sm animate-pulse">Verifying Clearance...</p>
            </div>
        );
    }

    if (!authorized) return null;

    return <>{children}</>;
}
