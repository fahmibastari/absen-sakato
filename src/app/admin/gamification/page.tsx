'use client';
import { useEffect, useState } from 'react';
import SpinWheel from '@/components/SpinWheel';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { Trophy, Crown, Star } from 'lucide-react';

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
            setMenus(names.length > 0 ? names : ['Zonk', 'Free Coffee', 'Hug', 'High Five']);
        }

        // Fetch Candidates (Leaderboard)
        const leadRes = await fetch('/api/attendance/leaderboard');
        if (leadRes.ok) {
            const leadData = await leadRes.json();
            setCandidates(leadData.slice(0, 5));
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-brown-50 via-white to-purple-50 p-6 md:pl-72 pt-8 pb-24">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Trophy className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-brown-900">Wheel of Fortune</h1>
                        <p className="text-brown-600">Spin to reward top performers</p>
                    </div>
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Prize Wheel - Left */}
                <Card className="bg-white border border-brown-100 shadow-xl order-2 md:order-1 p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Star className="text-mustard-500" size={24} />
                        <h3 className="font-bold text-2xl text-brown-900">Prize Wheel</h3>
                    </div>
                    <SpinWheel items={menus} onWin={(item) => console.log('Won:', item)} />
                </Card>

                {/* Candidates - Right */}
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl order-1 md:order-2 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Crown size={28} />
                            <h3 className="font-bold text-2xl">Top Candidates</h3>
                        </div>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                            Top 5
                        </span>
                    </div>

                    <div className="space-y-3">
                        {candidates.length === 0 && <p className="text-purple-100 italic text-center py-8">No candidates yet.</p>}

                        {candidates.map((user, idx) => (
                            <div key={user.userId} className="flex items-center justify-between p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-mustard-500 text-white shadow-lg' :
                                            'bg-white/20 text-white'
                                        }`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <span className="font-bold text-white block">{user.fullName}</span>
                                        <span className="text-xs text-purple-100">Top Performer</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-bold text-white">
                                        {Math.floor(user.total / 60)}h
                                    </div>
                                    <div className="text-xs text-purple-100">
                                        {user.total % 60}m
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
                        <p className="text-sm text-purple-100 flex items-center gap-2">
                            <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">i</span>
                            Top candidate gets to spin the wheel for a free menu item!
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    )
}
