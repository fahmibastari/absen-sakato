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

    useEffect(() => {
        // Check cache first to prevent flickering
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
    }, [pathname]); // Re-check on path change to be safe, but rely on cache

    async function handleLogout() {
        localStorage.removeItem('user_role');
        await supabase.auth.signOut();
        router.push('/login');
    }

    if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/admin/qr')) return null;

    const isActive = (path: string) => pathname === path;

    const [hasNewPosts, setHasNewPosts] = useState(false);

    useEffect(() => {
        // Poll for new posts status
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
        const interval = setInterval(checkStatus, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {/* Mobile Bottom Nav - Modern White */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-brown-200 p-3 z-50 shadow-lg">
                <div className="flex justify-around items-center max-w-md mx-auto">
                    <Link href="/dashboard" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/dashboard') ? 'bg-mustard-100 text-mustard-700' : 'text-brown-500'}`}>
                        <Home size={20} />
                        <span className="text-[10px] font-medium">Home</span>
                    </Link>
                    <Link href="/leaderboard" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/leaderboard') ? 'bg-mustard-100 text-mustard-700' : 'text-brown-500'}`}>
                        <Trophy size={20} />
                        <span className="text-[10px] font-medium">Ranking</span>
                    </Link>
                    <Link href="/timeline" className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/timeline') ? 'bg-mustard-100 text-mustard-700' : 'text-brown-500'}`}>
                        <MessageCircle size={20} />
                        <span className="text-[10px] font-medium">Timeline</span>
                        {hasNewPosts && !isActive('/timeline') && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </Link>
                    <Link href="/history" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/history') ? 'bg-mustard-100 text-mustard-700' : 'text-brown-500'}`}>
                        <History size={20} />
                        <span className="text-[10px] font-medium">History</span>
                    </Link>
                    <Link href="/profile" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/profile') ? 'bg-mustard-100 text-mustard-700' : 'text-brown-500'}`}>
                        <User size={20} />
                        <span className="text-[10px] font-medium">Profile</span>
                    </Link>
                    {role === 'ADMIN' && (
                        <Link href="/admin" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${pathname.startsWith('/admin') ? 'bg-red-100 text-red-600' : 'text-brown-500'}`}>
                            <Shield size={20} />
                            <span className="text-[10px] font-medium">Admin</span>
                        </Link>
                    )}
                </div>
            </nav>

            {/* Desktop Sidebar - Modern White */}
            <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-72 bg-white border-r border-brown-100 p-6 z-50 shadow-sm">
                {/* Logo/Brand */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-mustard-500 to-mustard-600 rounded-xl flex items-center justify-center">
                            <Coffee className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl text-brown-900">Sakato</h1>
                            <p className="text-xs text-brown-500">Coffee Attendance</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 space-y-1">
                    <Link href="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/dashboard') ? 'bg-mustard-100 text-mustard-700 font-semibold shadow-sm' : 'text-brown-700 hover:bg-brown-50'}`}>
                        <Home size={20} />
                        <span>Dashboard</span>
                        {isActive('/dashboard') && <div className="ml-auto w-1.5 h-1.5 bg-mustard-600 rounded-full"></div>}
                    </Link>
                    <Link href="/leaderboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/leaderboard') ? 'bg-mustard-100 text-mustard-700 font-semibold shadow-sm' : 'text-brown-700 hover:bg-brown-50'}`}>
                        <Trophy size={20} />
                        <span>Leaderboard</span>
                        {isActive('/leaderboard') && <div className="ml-auto w-1.5 h-1.5 bg-mustard-600 rounded-full"></div>}
                    </Link>
                    <Link href="/timeline" className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/timeline') ? 'bg-mustard-100 text-mustard-700 font-semibold shadow-sm' : 'text-brown-700 hover:bg-brown-50'}`}>
                        <MessageCircle size={20} />
                        <span>Timeline</span>
                        {isActive('/timeline') && <div className="ml-auto w-1.5 h-1.5 bg-mustard-600 rounded-full"></div>}
                        {hasNewPosts && !isActive('/timeline') && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                        )}
                    </Link>
                    <Link href="/history" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/history') ? 'bg-mustard-100 text-mustard-700 font-semibold shadow-sm' : 'text-brown-700 hover:bg-brown-50'}`}>
                        <History size={20} />
                        <span>History</span>
                        {isActive('/history') && <div className="ml-auto w-1.5 h-1.5 bg-mustard-600 rounded-full"></div>}
                    </Link>
                    <Link href="/profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/profile') ? 'bg-mustard-100 text-mustard-700 font-semibold shadow-sm' : 'text-brown-700 hover:bg-brown-50'}`}>
                        <User size={20} />
                        <span>Profile</span>
                        {isActive('/profile') && <div className="ml-auto w-1.5 h-1.5 bg-mustard-600 rounded-full"></div>}
                    </Link>

                    {role === 'ADMIN' && (
                        <>
                            <div className="my-4 border-t border-brown-100"></div>
                            <Link href="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname.startsWith('/admin') ? 'bg-red-100 text-red-700 font-semibold shadow-sm' : 'text-red-600 hover:bg-red-50'}`}>
                                <Shield size={20} />
                                <span>Admin Panel</span>
                                {pathname.startsWith('/admin') && <div className="ml-auto w-1.5 h-1.5 bg-red-600 rounded-full"></div>}
                            </Link>
                        </>
                    )}
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-brown-600 hover:bg-red-50 hover:text-red-600 transition-all mt-4 border border-brown-200"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </aside>
        </>
    );
}
