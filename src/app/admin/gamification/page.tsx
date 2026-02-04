'use client';
import { useEffect, useState } from 'react';
import SpinWheel from '@/components/SpinWheel';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { Trophy, Crown, Star, Sparkles } from 'lucide-react';

type UserRank = {
    userId: string;
    fullName: string;
    total: number;
}

export default function GamificationPage() {
    const [menus, setMenus] = useState<string[]>([]);
    const [candidates, setCandidates] = useState<UserRank[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch Menus
        const menuRes = await fetch('/api/admin/menus', { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (menuRes.ok) {
            const menuData = await menuRes.json();
            const names = menuData.filter((m: any) => m.isAvailable).map((m: any) => m.name);
            setMenus(names.length > 0 ? names : ['ZONK', 'FREE COFFEE', 'HUG', 'HIGH FIVE']);
        }

        // Fetch Candidates (Leaderboard)
        const leadRes = await fetch('/api/attendance/leaderboard');
        if (leadRes.ok) {
            const leadData = await leadRes.json();
            setCandidates(leadData.slice(0, 5));
        }
    }

    return (
        <div className="min-h-screen bg-neo-purple bg-dots p-6 md:pl-72 pt-8 pb-24 font-sans">
            {/* Header */}
            <div className="mb-8 bg-white border-4 border-neo-black p-6 shadow-neo flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-16 h-16 bg-neo-yellow border-4 border-neo-black flex items-center justify-center transform rotate-3">
                            <Trophy className="text-neo-black" size={32} strokeWidth={3} />
                        </div>
                        <div>
                            <h1 className="text-5xl font-black text-neo-black uppercase tracking-tighter leading-none">WHEEL OF FORTUNE</h1>
                            <p className="text-neo-black font-bold uppercase bg-neo-yellow inline-block px-2">Spin to WIN</p>
                        </div>
                    </div>
                </div>
                <div className="hidden md:block">
                    <Sparkles className="text-neo-black animate-spin-slow" size={64} />
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Prize Wheel - Left */}
                <Card className="bg-white border-4 border-neo-black shadow-neo-lg order-2 md:order-1 p-8 relative overflow-visible">
                    <div className="absolute -top-6 -left-6 bg-neo-pink border-4 border-neo-black px-4 py-2 transform -rotate-6 shadow-neo-sm z-10">
                        <h3 className="font-black text-2xl text-white uppercase">The Wheel</h3>
                    </div>

                    <div className="mt-4 flex justify-center">
                        <SpinWheel items={menus} onWin={(item) => alert(`WINNER: ${item}`)} />
                    </div>
                </Card>

                {/* Candidates - Right */}
                <Card className="bg-neo-black border-4 border-neo-black shadow-neo-lg order-1 md:order-2 p-0 overflow-hidden">
                    <div className="bg-neo-yellow p-6 border-b-4 border-neo-black flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Crown size={32} className="text-neo-black" strokeWidth={3} />
                            <h3 className="font-black text-3xl text-neo-black uppercase">Top Agents</h3>
                        </div>
                        <span className="bg-neo-black text-white px-3 py-1 font-black uppercase text-sm transform rotate-3 border-2 border-white">
                            Elite 5
                        </span>
                    </div>

                    <div className="p-6 space-y-4">
                        {candidates.length === 0 && <p className="text-white font-bold italic text-center py-8 uppercase">NO ELITE AGENTS YET.</p>}

                        {candidates.map((user, idx) => (
                            <div key={user.userId} className="flex items-center justify-between p-4 bg-white border-4 border-neo-black hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[4px_4px_0px_#FFF] transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 flex items-center justify-center font-black text-xl border-2 border-neo-black ${idx === 0 ? 'bg-neo-pink text-white' : 'bg-gray-200 text-neo-black'}`}>
                                        #{idx + 1}
                                    </div>
                                    <div>
                                        <span className="font-black text-neo-black block uppercase text-lg group-hover:text-neo-pink transition-colors">{user.fullName}</span>
                                        <span className="text-xs font-bold bg-neo-black text-white px-1 uppercase">Top Performer</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-black text-neo-black text-xl">
                                        {Math.floor(user.total / 60)}H
                                    </div>
                                    <div className="text-xs font-bold text-gray-500 uppercase">
                                        {user.total % 60}M
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Info Box */}
                    <div className="p-4 bg-neo-blue border-t-4 border-neo-black">
                        <p className="text-sm text-white font-bold flex items-center gap-2 uppercase">
                            <span className="w-6 h-6 bg-white text-neo-black border-2 border-neo-black flex items-center justify-center font-black text-xs">i</span>
                            Rank #1 gets a free spin!
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    )
}
