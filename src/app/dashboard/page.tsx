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

            try {
                const res = await fetch('/api/attendance/me', {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUserState(data);
                    setUserName(data.fullName || "User");
                }
            } catch (e) {
                console.error(e);
            }

            loadLive();
        }
        init();
    }, []);

    async function loadLive() {
        const res = await fetch('/api/attendance/live');
        const data = await res.json();
        setLiveUsers(data);

        const hRes = await fetch('/api/attendance/today');
        const hData = await hRes.json();
        setTodayHistory(hData);
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
        <div className="min-h-screen bg-gradient-to-br from-brown-50 via-white to-mustard-50 pb-24 md:pl-72 pt-8 px-6">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-brown-900 mb-1">
                    Welcome back, <span className="text-mustard-600">{userName}</span>
                </h1>
                <p className="text-brown-600">Here's your attendance overview for today</p>
            </div>

            {/* Stats Grid - 3 Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Status Card - Large */}
                <Card className="md:col-span-2 bg-gradient-to-br from-mustard-500 to-mustard-600 text-white border-0 shadow-xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center h-full">
                        <div>
                            <p className="text-mustard-100 text-sm mb-2 font-medium">Current Status</p>
                            <h2 className="text-3xl font-bold mb-2">
                                {userState.isCheckedIn ? "Checked In" : "Not Active"}
                            </h2>
                            {userState.isCheckedIn && (
                                <div className="flex items-center gap-2 text-mustard-100">
                                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                                    <span className="text-sm">Live tracking active</span>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 md:mt-0">
                            <Button
                                variant={userState.isCheckedIn ? "danger" : "primary"}
                                onClick={() => setIsScannerOpen(true)}
                                className="bg-white text-mustard-700 hover:bg-mustard-50 shadow-lg"
                            >
                                <QrCode className="mr-2" size={20} />
                                {userState.isCheckedIn ? "Scan to Check Out" : "Scan to Check In"}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Quick Stats Card */}
                <Card className="bg-white border-brown-100 shadow-lg">
                    <div className="flex flex-col justify-between h-full">
                        <div>
                            <div className="flex items-center gap-2 text-brown-600 mb-3">
                                <Users size={18} />
                                <span className="text-sm font-medium">Active Now</span>
                            </div>
                            <div className="text-4xl font-bold text-brown-900">{liveUsers.length}</div>
                        </div>
                        <div className="mt-4 text-sm text-green-600 flex items-center gap-1">
                            <TrendingUp size={14} />
                            <span>People currently checked in</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content - 2 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Sessions - Takes 2 columns */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-brown-900 flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                            Live Sessions
                        </h3>
                        <span className="text-sm text-brown-500">{liveUsers.length} active</span>
                    </div>
                    <div className="bg-white rounded-2xl border border-brown-100 shadow-lg p-6">
                        <LiveSessionList users={liveUsers} />
                    </div>
                </div>

                {/* Today's History - Sidebar */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-brown-900 flex items-center gap-2">
                            <Clock size={20} />
                            Today's Activity
                        </h3>
                    </div>
                    <div className="bg-white rounded-2xl border border-brown-100 shadow-lg p-6">
                        <TodayHistoryList items={todayHistory} />
                    </div>
                </div>
            </div>

            {/* Scanner Modal */}
            <Modal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} title="Scan QR Code">
                {isScannerOpen && <QRScanner onScan={onScanSuccess} />}
            </Modal>
        </div>
    );
}
