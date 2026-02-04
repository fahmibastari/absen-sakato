'use client';

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/Card";
import { Clock, User, LogOut, Loader2, Save, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

type Session = {
    id: string;
    checkIn: string;
    user: {
        id: string;
        fullName: string;
        username: string;
        avatarUrl: string | null;
    };
};

export default function AdminSessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [checkoutTime, setCheckoutTime] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/sessions');
            const data = await res.json();
            setSessions(data);
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleOpenModal = (session: Session) => {
        const now = new Date();
        const localIso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        setCheckoutTime(localIso);
        setSelectedSession(session);
    };

    const handleCheckout = async () => {
        if (!selectedSession || !checkoutTime) return;
        setProcessing(true);

        try {
            const res = await fetch('/api/admin/sessions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    attendanceId: selectedSession.id,
                    checkOutTime: new Date(checkoutTime).toISOString()
                })
            });

            if (!res.ok) throw new Error("Failed to checkout");

            setSelectedSession(null);
            fetchSessions();
        } catch (error) {
            alert("Gagal melakukan checkout manual");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-neo-blue bg-dots p-6 md:pl-72 pt-8 font-sans">
            <div className="mb-8 bg-white border-4 border-neo-black p-6 shadow-neo">
                <h1 className="text-4xl font-black text-neo-black mb-1 uppercase tracking-tighter">Active Sessions</h1>
                <p className="text-gray-600 font-bold uppercase">Manual overrides & Monitoring</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-white" size={64} />
                </div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-12 bg-white border-4 border-neo-black shadow-neo-lg">
                    <Clock className="mx-auto h-16 w-16 text-neo-black mb-4" strokeWidth={3} />
                    <p className="font-black text-2xl uppercase text-neo-black">SECTOR CLEAR.</p>
                    <p className="text-gray-600 font-bold uppercase">No active sessions detected.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map((session) => (
                        <div key={session.id} className="bg-white border-4 border-neo-black p-4 flex flex-col justify-between shadow-neo hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-neo-lg transition-all">
                            <div>
                                <div className="flex items-center gap-3 mb-4 border-b-4 border-neo-black pb-4">
                                    <div className="w-12 h-12 border-2 border-neo-black bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {session.user.avatarUrl ? (
                                            <img src={session.user.avatarUrl} alt={session.user.fullName} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={24} className="text-neo-black" strokeWidth={3} />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-neo-black uppercase leading-none text-lg">{session.user.fullName}</h3>
                                        <p className="text-xs font-bold bg-neo-black text-white px-1 inline-block">@{session.user.username}</p>
                                    </div>
                                </div>

                                <div className="bg-neo-green/20 border-2 border-neo-black p-3 mb-4 flex items-center gap-2">
                                    <Clock size={20} className="text-neo-black" strokeWidth={3} />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase text-neo-black leading-none">CHECKED IN AT</span>
                                        <span className="font-black text-neo-black text-lg leading-none">{format(new Date(session.checkIn), "HH:mm", { locale: id })}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleOpenModal(session)}
                                className="w-full py-3 bg-neo-pink text-white border-2 border-neo-black font-black uppercase tracking-wider hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                            >
                                <LogOut size={20} strokeWidth={3} />
                                FORCE OUT
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Manual Checkout Modal */}
            {selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neo-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white border-4 border-neo-black shadow-[8px_8px_0px_#FFF] w-full max-w-md p-8 relative">
                        <div className="absolute -top-4 -left-4 bg-neo-yellow border-4 border-neo-black px-4 py-1 transform -rotate-2">
                            <h3 className="text-xl font-black uppercase">Emergency Exit</h3>
                        </div>

                        <div className="mt-4 mb-6">
                            <p className="text-sm font-bold uppercase text-gray-500 mb-1">Target Agent</p>
                            <div className="font-black text-xl text-neo-black bg-gray-100 p-2 border-2 border-neo-black">
                                {selectedSession.user.fullName}
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-bold uppercase text-gray-500 mb-1">Override Time</label>
                            <input
                                type="datetime-local"
                                value={checkoutTime}
                                onChange={(e) => setCheckoutTime(e.target.value)}
                                className="w-full p-3 border-4 border-neo-black font-mono font-bold focus:ring-4 focus:ring-neo-yellow focus:outline-none"
                            />
                            <p className="text-xs font-bold text-neo-pink mt-2 flex items-center gap-1">
                                <AlertTriangle size={14} />
                                CAUTION: CHECKOUT TIME IS FINAL.
                            </p>
                        </div>

                        <div className="flex gap-4 justify-end">
                            <button
                                onClick={() => setSelectedSession(null)}
                                className="px-6 py-3 font-bold uppercase hover:bg-gray-100 border-2 border-transparent hover:border-neo-black transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCheckout}
                                disabled={processing}
                                className="px-6 py-3 bg-neo-black text-white border-2 border-transparent hover:bg-neo-yellow hover:text-neo-black hover:border-neo-black font-black uppercase transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {processing ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                CONFIRM
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
