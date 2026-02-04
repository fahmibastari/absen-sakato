'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, ArrowRight, TrendingUp } from 'lucide-react';

type HistoryItem = {
    id: string;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    totalDuration: number;
};

export default function HistoryPage() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [totalAll, setTotalAll] = useState(0);

    async function loadHistory() {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) return;

        const res = await fetch('/api/attendance/history', {
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        });

        const data = await res.json();
        setHistory(data);

        const sum = data.reduce(
            (acc: number, item: HistoryItem) => acc + item.totalDuration,
            0
        );
        setTotalAll(sum);
    }

    useEffect(() => {
        loadHistory();
    }, []);

    return (
        <div className="min-h-screen bg-neo-white bg-dots pb-24 md:pl-72 pt-8 px-6 font-sans">
            {/* Header */}
            <div className="mb-8 border-b-4 border-neo-black pb-4 bg-white/50 backdrop-blur-sm p-4 border-4">
                <h1 className="text-4xl font-black text-neo-black uppercase tracking-tighter mb-1">Attendance History</h1>
                <p className="text-gray-600 font-bold uppercase">Track your check-in and check-out records</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-neo-blue text-white p-6 border-4 border-neo-black shadow-neo hover:translate-y-[-2px] transition-transform">
                    <div className="flex items-center gap-3 mb-2 border-b-2 border-white pb-2">
                        <Clock size={24} strokeWidth={3} />
                        <span className="text-sm font-black uppercase">Total Time</span>
                    </div>
                    <div className="text-5xl font-black">{Math.floor(totalAll / 3600)}<span className="text-2xl">h</span></div>
                    <div className="text-white text-sm font-bold uppercase mt-1">{Math.floor((totalAll % 3600) / 60)} minutes</div>
                </div>

                <div className="bg-neo-yellow text-neo-black p-6 border-4 border-neo-black shadow-neo hover:translate-y-[-2px] transition-transform">
                    <div className="flex items-center gap-3 mb-2 border-b-2 border-neo-black pb-2">
                        <Calendar className="text-neo-black" size={24} strokeWidth={3} />
                        <span className="text-sm font-black uppercase">Total Days</span>
                    </div>
                    <div className="text-5xl font-black">
                        {new Set(history.map(item => new Date(item.date).toDateString())).size}
                    </div>
                    <div className="text-neo-black text-sm font-bold uppercase mt-1">Days checked in</div>
                </div>

                <div className="bg-white p-6 border-4 border-neo-black shadow-neo hover:translate-y-[-2px] transition-transform">
                    <div className="flex items-center gap-3 mb-2 border-b-2 border-neo-black pb-2">
                        <TrendingUp className="text-neo-green" size={24} strokeWidth={3} />
                        <span className="text-sm font-black uppercase text-neo-black">Avg. Time</span>
                    </div>
                    <div className="text-5xl font-black text-neo-black">
                        {history.length > 0 ? Math.floor(totalAll / history.length / 3600) : 0}<span className="text-2xl">h</span>
                    </div>
                    <div className="text-gray-500 text-sm font-bold uppercase mt-1">Per session</div>
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border-4 border-neo-black shadow-neo-lg p-6 md:p-8">
                <h2 className="text-2xl font-black text-neo-black mb-8 uppercase flex items-center gap-2">
                    <span className="w-4 h-8 bg-neo-pink border-2 border-neo-black block"></span>
                    Activity Timeline
                </h2>

                {history.length === 0 && (
                    <div className="text-center py-16 border-4 border-dashed border-gray-300">
                        <Calendar className="mx-auto mb-4 text-gray-300" size={64} strokeWidth={2} />
                        <p className="text-xl font-black text-gray-400 uppercase">NO HISTORY FOUND</p>
                        <p className="text-sm font-bold text-gray-400 uppercase mt-1">Start checking in to populate this list.</p>
                    </div>
                )}

                <div className="relative pl-4">
                    {/* Timeline Line */}
                    {history.length > 0 && (
                        <div className="absolute left-[39px] top-6 bottom-6 w-1 bg-neo-black hidden md:block"></div>
                    )}

                    {/* Timeline Items */}
                    <div className="space-y-8">
                        {history.map((item, idx) => (
                            <div key={item.id} className="relative md:pl-20 group">
                                {/* Timeline Dot - Mobile Position vs Desktop */}
                                <div className="hidden md:flex absolute left-0 top-0 w-10 h-10 bg-neo-yellow border-4 border-neo-black items-center justify-center text-neo-black font-black z-10 shadow-[2px_2px_0px_#000]">
                                    {idx + 1}
                                </div>

                                {/* Content Card */}
                                <div className="bg-gray-50 border-4 border-neo-black p-6 shadow-neo hover:shadow-neo-lg transition-all hover:bg-white">
                                    <div className="flex flex-col gap-4">
                                        {/* Date Header */}
                                        <div className="flex items-center justify-between border-b-4 border-neo-black pb-3 border-dashed">
                                            <div className="flex items-center gap-3">
                                                <div className="md:hidden w-8 h-8 bg-neo-yellow border-2 border-neo-black flex items-center justify-center text-neo-black font-black text-sm">
                                                    {idx + 1}
                                                </div>
                                                <div className="font-black text-xl text-neo-black uppercase">
                                                    {new Date(item.date).toLocaleDateString('id-ID', {
                                                        weekday: 'long',
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <div className="text-2xl font-black text-neo-black leading-none bg-neo-green px-2 py-0.5 border-2 border-neo-black shadow-sm transform rotate-1">
                                                    {Math.floor(item.totalDuration / 3600)}h {Math.floor((item.totalDuration % 3600) / 60)}m
                                                </div>
                                            </div>
                                        </div>

                                        {/* Times Grid */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-3 border-2 border-neo-black relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-1 bg-neo-green border-l-2 border-b-2 border-neo-black">
                                                    <ArrowRight size={12} className="text-neo-black" />
                                                </div>
                                                <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Check In</span>
                                                <span className="font-mono text-xl font-black text-neo-black">
                                                    {item.checkIn ? new Date(item.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                </span>
                                            </div>
                                            <div className="bg-white p-3 border-2 border-neo-black relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-1 bg-neo-red text-white border-l-2 border-b-2 border-neo-black">
                                                    <ArrowRight size={12} />
                                                </div>
                                                <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Check Out</span>
                                                <span className="font-mono text-xl font-black text-neo-black">
                                                    {item.checkOut ? new Date(item.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '...'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Mobile Duration Footer */}
                                        <div className="sm:hidden pt-2 text-center border-t-2 border-neo-black mt-1 border-dashed">
                                            <div className="text-2xl font-black text-neo-black mt-2">
                                                {Math.floor(item.totalDuration / 3600)}h {Math.floor((item.totalDuration % 3600) / 60)}m
                                            </div>
                                            <div className="text-xs text-gray-500 uppercase font-bold">Total Duration</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
