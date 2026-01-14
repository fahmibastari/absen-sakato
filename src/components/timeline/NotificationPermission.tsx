'use client';

import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Convert VAPID key to UInt8Array
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function NotificationPermission() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const subscribeUser = async () => {
        setLoading(true);
        try {
            if (!('serviceWorker' in navigator)) return;

            // 1. Register Service Worker (if not already)
            const registration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            // 2. Request Permission
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                // 3. Subscribe to Push
                const subscribeOptions = {
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
                };

                const subscription = await registration.pushManager.subscribe(subscribeOptions);

                // 4. Send to Server
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    await fetch('/api/notifications/subscribe', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`
                        },
                        body: JSON.stringify({ subscription })
                    });
                    console.log("Push Subscribed!");
                }
            }
        } catch (error) {
            console.error("Failed to subscribe to push:", error);
            alert("Failed to enable notifications. Please check site permissions.");
        } finally {
            setLoading(false);
        }
    };

    if (permission === 'granted' || permission === 'denied') return null; // Hide if already handled

    return (
        <div className="mb-6 p-4 bg-mustard-50 border border-mustard-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-mustard-100 rounded-lg text-mustard-700">
                    <Bell size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-brown-900 text-sm">Enable Notifications</h3>
                    <p className="text-xs text-brown-600">Get notified when someone replies or mentions you.</p>
                </div>
            </div>
            <button
                onClick={subscribeUser}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-mustard-500 to-orange-500 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Enable'}
            </button>
        </div>
    );
}
