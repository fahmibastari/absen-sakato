'use client';

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/Card";
import { Clock, User, LogOut, Loader2, Save } from "lucide-react";
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
        // Set default checkout time to now, but formatted for input datetime-local
        const now = new Date();
        // Adjust to local ISO string somewhat manually to handle timezone offset for the input value
        // Or simpler: just use current local time
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

            // Success
            setSelectedSession(null);
            fetchSessions(); // Refresh list
        } catch (error) {
            alert("Gagal melakukan checkout manual");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:pl-72 pt-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-brown-900 mb-1">Active Sessions</h1>
                <p className="text-brown-600">Manual checkout for users who forgot</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-mustard-600" size={32} />
                </div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <Clock className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">No active sessions right now.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sessions.map((session) => (
                        <Card key={session.id} className="p-4 flex flex-col justify-between border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                        {session.user.avatarUrl ? (
                                            <img src={session.user.avatarUrl} alt={session.user.fullName} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} className="text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{session.user.fullName}</h3>
                                        <p className="text-xs text-gray-500">@{session.user.username}</p>
                                    </div>
                                </div>

                                <div className="bg-green-50 p-2 rounded text-xs text-green-700 mb-4 flex items-center gap-2">
                                    <Clock size={12} />
                                    Check In: <span className="font-semibold">{format(new Date(session.checkIn), "d MMM, HH:mm", { locale: id })}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleOpenModal(session)}
                                className="w-full py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                            >
                                <LogOut size={16} />
                                Manual Checkout
                            </button>
                        </Card>
                    ))}
                </div>
            )}

            {/* Manual Checkout Modal */}
            {selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Manual Checkout</h3>

                        <div className="mb-6">
                            <p className="text-sm text-gray-500 mb-1">User</p>
                            <div className="font-semibold text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                                {selectedSession.user.fullName}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm text-gray-500 mb-1">Set Checkout Time</label>
                            <input
                                type="datetime-local"
                                value={checkoutTime}
                                onChange={(e) => setCheckoutTime(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mustard-500 focus:outline-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Caution: Duration will be calculated based on this time.
                            </p>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setSelectedSession(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCheckout}
                                disabled={processing}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                {processing ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                Confirm Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
