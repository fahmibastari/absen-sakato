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
        <div className="min-h-screen bg-gradient-to-br from-brown-50 via-white to-mustard-50 pb-24 md:pl-72 pt-8 px-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-brown-900 mb-1">Attendance History</h1>
                <p className="text-brown-600">Track your check-in and check-out records</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-mustard-500 to-mustard-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock size={24} />
                        <span className="text-sm font-medium text-mustard-100">Total Time</span>
                    </div>
                    <div className="text-4xl font-bold">{Math.floor(totalAll / 3600)}h</div>
                    <div className="text-mustard-100 text-sm mt-1">{Math.floor((totalAll % 3600) / 60)} minutes</div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-brown-100">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="text-brown-600" size={24} />
                        <span className="text-sm font-medium text-brown-600">Total Days</span>
                    </div>
                    <div className="text-4xl font-bold text-brown-900">{history.length}</div>
                    <div className="text-brown-500 text-sm mt-1">Days checked in</div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-brown-100">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="text-green-600" size={24} />
                        <span className="text-sm font-medium text-brown-600">Avg. Time</span>
                    </div>
                    <div className="text-4xl font-bold text-brown-900">
                        {history.length > 0 ? Math.floor(totalAll / history.length / 3600) : 0}h
                    </div>
                    <div className="text-brown-500 text-sm mt-1">Per day</div>
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-brown-100 shadow-lg p-6 md:p-8">
                <h2 className="text-xl font-bold text-brown-900 mb-6">Activity Timeline</h2>

                {history.length === 0 && (
                    <div className="text-center py-16 text-brown-500">
                        <Calendar className="mx-auto mb-4 opacity-50" size={48} />
                        <p>No history records yet</p>
                        <p className="text-sm mt-1">Start checking in to see your attendance history</p>
                    </div>
                )}

                <div className="relative pl-4">
                    {/* Timeline Line */}
                    {history.length > 0 && (
                        <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-brown-200 hidden md:block"></div>
                    )}

                    {/* Timeline Items */}
                    <div className="space-y-8">
                        {history.map((item, idx) => (
                            <div key={item.id} className="relative md:pl-20">
                                {/* Timeline Dot - Mobile Position vs Desktop */}
                                <div className="hidden md:flex absolute left-0 top-0 w-10 h-10 rounded-full bg-gradient-to-br from-mustard-500 to-mustard-600 items-center justify-center text-white font-bold shadow-lg z-10">
                                    {idx + 1}
                                </div>

                                {/* Content Card */}
                                <div className="bg-brown-50 rounded-2xl p-6 border border-brown-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col gap-4">
                                        {/* Date Header */}
                                        <div className="flex items-center justify-between border-b border-brown-200 pb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="md:hidden w-8 h-8 rounded-full bg-mustard-500 flex items-center justify-center text-white font-bold text-sm">
                                                    {idx + 1}
                                                </div>
                                                <div className="font-bold text-lg text-brown-900">
                                                    {new Date(item.date).toLocaleDateString('id-ID', {
                                                        weekday: 'long',
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <div className="text-xl font-bold text-mustard-600 leading-none">
                                                    {Math.floor(item.totalDuration / 3600)}h {Math.floor((item.totalDuration % 3600) / 60)}m
                                                </div>
                                                <div className="text-[10px] text-brown-500 uppercase tracking-widest font-semibold mt-1">Duration</div>
                                            </div>
                                        </div>

                                        {/* Times Grid */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-3 rounded-xl border border-brown-100">
                                                <span className="text-xs text-brown-500 font-semibold uppercase block mb-1">Check In</span>
                                                <span className="font-mono text-lg font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md inline-block">
                                                    {item.checkIn ? new Date(item.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                </span>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-brown-100">
                                                <span className="text-xs text-brown-500 font-semibold uppercase block mb-1">Check Out</span>
                                                <span className="font-mono text-lg font-bold text-red-700 bg-red-50 px-2 py-1 rounded-md inline-block">
                                                    {item.checkOut ? new Date(item.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '...'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Mobile Duration Footer */}
                                        <div className="sm:hidden pt-2 text-center border-t border-brown-200 mt-1">
                                            <div className="text-2xl font-bold text-mustard-600">
                                                {Math.floor(item.totalDuration / 3600)}h {Math.floor((item.totalDuration % 3600) / 60)}m
                                            </div>
                                            <div className="text-xs text-brown-500 uppercase tracking-wide">Total Duration</div>
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
