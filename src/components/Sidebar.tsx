'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Trophy, History, User, LogOut, Shield, Coffee, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);
    const [hasNewPosts, setHasNewPosts] = useState(false);

    useEffect(() => {
        const cachedRole = localStorage.getItem('user_role');
        if (cachedRole) setRole(cachedRole);

        async function checkRole() {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                try {
                    const res = await fetch('/api/attendance/me', {
                        headers: { Authorization: `Bearer ${session.access_token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setRole(data.role);
                        if (data.role) localStorage.setItem('user_role', data.role);
                    }
                } catch (e) {
                    console.error("Failed to fetch role", e);
                }
            } else {
                localStorage.removeItem('user_role');
            }
        }
        checkRole();
    }, [pathname]);

    useEffect(() => {
        async function checkStatus() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            try {
                const res = await fetch('/api/timeline/status', {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setHasNewPosts(data.hasNewPosts);
                }
            } catch (error) {
                console.error("Status check failed", error);
            }
        }

        checkStatus();
        const interval = setInterval(checkStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    async function handleLogout() {
        localStorage.removeItem('user_role');
        await supabase.auth.signOut();
        router.push('/login');
    }

    if (!pathname) return null;
    if (pathname === '/login' || pathname === '/register' || pathname?.startsWith('/admin/qr')) return null;

    const isActive = (path: string) => pathname === path;

    const navItemClass = (path: string) => `
        flex items-center gap-3 px-4 py-3 border-2 border-transparent transition-all font-bold uppercase tracking-wide
        ${isActive(path)
            ? 'bg-neo-yellow text-neo-black border-neo-black shadow-[4px_4px_0px_#000] translate-x-[-2px] translate-y-[-2px]'
            : 'text-gray-500 hover:text-neo-black hover:bg-gray-100 hover:border-neo-black'
        }
    `;

    const mobileNavItemClass = (path: string) => `
        flex flex-col items-center gap-1 p-2 border-2 border-transparent transition-all
        ${isActive(path)
            ? 'bg-neo-yellow text-neo-black border-neo-black shadow-neo-sm'
            : 'text-gray-500'
        }
    `;

    return (
        <>
            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t-4 border-neo-black p-2 z-50">
                <div className="flex justify-around items-center max-w-md mx-auto">
                    <Link href="/dashboard" className={mobileNavItemClass('/dashboard')}>
                        <Home size={20} strokeWidth={2.5} />
                    </Link>
                    <Link href="/leaderboard" className={mobileNavItemClass('/leaderboard')}>
                        <Trophy size={20} strokeWidth={2.5} />
                    </Link>
                    <Link href="/timeline" className={`${mobileNavItemClass('/timeline')} relative`}>
                        <MessageCircle size={20} strokeWidth={2.5} />
                        {hasNewPosts && !isActive('/timeline') && (
                            <span className="absolute top-1 right-1 w-3 h-3 bg-neo-pink border-2 border-white rounded-full animate-bounce"></span>
                        )}
                    </Link>
                    <Link href="/history" className={mobileNavItemClass('/history')}>
                        <History size={20} strokeWidth={2.5} />
                    </Link>
                    <Link href="/profile" className={mobileNavItemClass('/profile')}>
                        <User size={20} strokeWidth={2.5} />
                    </Link>
                    {role === 'ADMIN' && (
                        <Link href="/admin" className={mobileNavItemClass('/admin')}>
                            <Shield size={20} strokeWidth={2.5} />
                        </Link>
                    )}
                </div>
            </nav>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-72 bg-white border-r-4 border-neo-black p-6 z-50">
                {/* Logo */}
                <div className="mb-10 p-4 bg-neo-black text-white shadow-neo">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neo-yellow border-2 border-white flex items-center justify-center transform rotate-3">
                            <Coffee className="text-neo-black" size={24} strokeWidth={3} />
                        </div>
                        <div>
                            <h1 className="font-black text-2xl uppercase leading-none tracking-tighter">Sakato</h1>
                            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Attendance</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 space-y-3">
                    <Link href="/dashboard" className={navItemClass('/dashboard')}>
                        <Home size={20} strokeWidth={3} />
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/leaderboard" className={navItemClass('/leaderboard')}>
                        <Trophy size={20} strokeWidth={3} />
                        <span>Ranking</span>
                    </Link>
                    <Link href="/timeline" className={navItemClass('/timeline')}>
                        <div className="relative">
                            <MessageCircle size={20} strokeWidth={3} />
                            {hasNewPosts && !isActive('/timeline') && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-neo-pink border-2 border-white rounded-full animate-ping"></div>
                            )}
                        </div>
                        <span>Timeline</span>
                    </Link>
                    <Link href="/history" className={navItemClass('/history')}>
                        <History size={20} strokeWidth={3} />
                        <span>History</span>
                    </Link>
                    <Link href="/profile" className={navItemClass('/profile')}>
                        <User size={20} strokeWidth={3} />
                        <span>Profile</span>
                    </Link>

                    {role === 'ADMIN' && (
                        <>
                            <div className="my-6 border-t-4 border-neo-black"></div>
                            <Link href="/admin" className={`flex items-center gap-3 px-4 py-3 border-2 border-transparent transition-all font-bold uppercase tracking-wide
                                ${pathname.startsWith('/admin')
                                    ? 'bg-neo-pink text-white border-neo-black shadow-neo translate-x-[-2px] translate-y-[-2px]'
                                    : 'text-neo-pink hover:bg-neo-pink/10 hover:border-neo-pink'
                                }
                            `}>
                                <Shield size={20} strokeWidth={3} />
                                <span>Admin Panel</span>
                            </Link>
                        </>
                    )}
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 mt-4 font-bold uppercase text-gray-500 hover:text-white hover:bg-neo-black border-2 border-transparent hover:border-black transition-all"
                >
                    <LogOut size={20} strokeWidth={3} />
                    <span>Logout</span>
                </button>
            </aside>
        </>
    );
}
