'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import QRScanner from "@/components/QRScanner";
import { LiveSessionList } from "@/components/LiveSessionList";
import { TodayHistoryList } from "@/components/TodayHistoryList";
import { Clock, Users, TrendingUp, QrCode } from 'lucide-react';

type UserState = {
    isCheckedIn: boolean;
    checkInTime?: string;
};

export default function DashboardPage() {
    const router = useRouter();
    const [userState, setUserState] = useState<UserState>({ isCheckedIn: false });
    const [liveUsers, setLiveUsers] = useState<any[]>([]);
    const [todayHistory, setTodayHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [userName, setUserName] = useState("User");

    useEffect(() => {
        async function init() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.replace('/login');
                return;
            }

            // Parallel Data Fetching
            const fetchMe = fetch('/api/attendance/me', {
                headers: { Authorization: `Bearer ${session.access_token}` }
            }).then(res => res.ok ? res.json() : null);

            const fetchLive = fetch('/api/attendance/live').then(res => res.json());
            const fetchHistory = fetch('/api/attendance/today').then(res => res.json());

            try {
                const [meData, liveData, historyData] = await Promise.all([fetchMe, fetchLive, fetchHistory]);

                if (meData) {
                    setUserState(meData);
                    setUserName(meData.fullName || "User");
                }
                setLiveUsers(liveData);
                setTodayHistory(historyData);
            } catch (e) {
                console.error("Dashboard Load Error:", e);
            }
        }
        init();
    }, []);

    async function loadLive() {
        // Parallel refresh
        const [liveData, historyData] = await Promise.all([
            fetch('/api/attendance/live').then(r => r.json()),
            fetch('/api/attendance/today').then(r => r.json())
        ]);

        setLiveUsers(liveData);
        setTodayHistory(historyData);
    }

    const isProcessingRef = useRef(false);

    async function onScanSuccess(text: string) {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        setLoading(true);

        try {
            setIsScannerOpen(false);

            let payload;
            try { payload = JSON.parse(text); } catch {
                isProcessingRef.current = false;
                return;
            }
            if (payload.app !== 'sakato') {
                isProcessingRef.current = false;
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();

            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { Authorization: `Bearer ${session?.access_token}` },
            });
            const data = await res.json();

            if (res.ok) {
                alert(data.message);
                const me = await fetch('/api/attendance/me', {
                    headers: { Authorization: `Bearer ${session?.access_token}` }
                }).then(r => r.json());
                setUserState(me);
                loadLive();
            } else {
                alert(data.message);
            }
        } catch (e) {
            console.error(e);
            alert("Terjadi kesalahan saat scan");
        } finally {
            setLoading(false);
            setTimeout(() => {
                isProcessingRef.current = false;
            }, 2000);
        }
    }

    return (
        <div className="min-h-screen bg-neo-white pb-24 md:pl-72 pt-8 px-6 font-sans">
            {/* Header */}
            <div className="mb-8 border-b-4 border-neo-black pb-4">
                <h1 className="text-5xl font-black text-neo-black uppercase tracking-tighter mb-2">
                    DASHBOARD
                </h1>
                <p className="text-xl font-bold text-gray-600">
                    Welcome back, <span className="bg-neo-yellow px-2 border-2 border-neo-black text-neo-black transform -rotate-1 inline-block">{userName}</span>
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Status Card - Large */}
                <div className={`md:col-span-2 border-4 border-neo-black shadow-neo-lg p-8 transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_#1A1A1A] relative overflow-hidden
                    ${userState.isCheckedIn ? 'bg-neo-green' : 'bg-neo-yellow'}
                `}>
                    {/* Decorative Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-20 transform rotate-45 translate-x-16 -translate-y-16 pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center h-full relative z-10">
                        <div>
                            <p className="text-neo-black font-bold uppercase tracking-wider mb-2 border-b-2 border-neo-black inline-block">Current Status</p>
                            <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter text-neo-black">
                                {userState.isCheckedIn ? "ONLINE" : "OFFLINE"}
                            </h2>
                            {userState.isCheckedIn && (
                                <div className="flex items-center gap-2 text-neo-black font-bold animate-pulse">
                                    <div className="w-4 h-4 bg-neo-black rounded-none"></div>
                                    <span>TRACKING ACTIVE</span>
                                </div>
                            )}
                        </div>
                        <div className="mt-6 md:mt-0">
                            <Button
                                onClick={() => setIsScannerOpen(true)}
                                className={`shadow-neo border-4 border-neo-black font-black uppercase py-4 px-8 text-xl hover:translate-y-[-2px] hover:shadow-neo-lg transition-all
                                    ${userState.isCheckedIn ? 'bg-neo-black text-white hover:bg-gray-800' : 'bg-white text-neo-black hover:bg-gray-100'}
                                `}
                            >
                                <QrCode className="mr-2" size={24} strokeWidth={3} />
                                {userState.isCheckedIn ? "SCAN OUT" : "SCAN IN"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Card */}
                <Card className="bg-neo-blue text-white">
                    <div className="flex flex-col justify-between h-full">
                        <div>
                            <div className="flex items-center gap-2 text-white mb-4">
                                <Users size={24} className="stroke-2" />
                                <span className="text-sm font-black uppercase">Active Personnel</span>
                            </div>
                            <div className="text-6xl font-black">{liveUsers.length}</div>
                        </div>
                        <div className="mt-4 text-sm font-bold flex items-center gap-2 border-t-2 border-white/20 pt-4">
                            <TrendingUp size={16} />
                            <span>ON THE GRID</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live Sessions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between border-b-4 border-neo-black pb-2">
                        <h3 className="text-3xl font-black text-neo-black uppercase flex items-center gap-3">
                            <span className="w-4 h-4 bg-neo-pink border-2 border-neo-black animate-pulse"></span>
                            Live Feed
                        </h3>
                        <span className="font-bold bg-neo-black text-white px-3 py-1 text-xs border-2 border-neo-black shadow-[2px_2px_0px_#000]">{liveUsers.length} ACTIVE</span>
                    </div>

                    {/* Render List Directly - No White Wrapper */}
                    <LiveSessionList users={liveUsers} />
                </div>

                {/* History Sidebar */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b-4 border-neo-black pb-2">
                        <h3 className="text-2xl font-black text-neo-black uppercase flex items-center gap-2">
                            <Clock size={24} className="stroke-[3px]" />
                            History
                        </h3>
                    </div>
                    <div className="neo-card p-0">
                        <div className="bg-neo-yellow border-b-4 border-neo-black p-3 font-bold text-center uppercase text-sm">
                            Today's Log
                        </div>
                        <div className="p-4">
                            <TodayHistoryList items={todayHistory} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Scanner Modal */}
            <Modal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} title="SCAN QR ACCESS">
                {isScannerOpen && <QRScanner onScan={onScanSuccess} />}
            </Modal>
        </div>
    );
}
