'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Users, Coffee, Trophy, QrCode, ArrowRight, TrendingUp, Clock, Activity } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        active: 0,
        menus: 0
    });

    useEffect(() => {
        async function fetchStats() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const headers = { Authorization: `Bearer ${session.access_token}` };

            const [usersRes, activeRes, menusRes] = await Promise.all([
                fetch('/api/admin/users', { headers }),
                fetch('/api/attendance/live'),
                fetch('/api/admin/menus', { headers })
            ]);

            const users = await usersRes.json();
            const active = await activeRes.json();
            const menus = await menusRes.json();

            setStats({
                users: Array.isArray(users) ? users.length : 0,
                active: Array.isArray(active) ? active.length : 0,
                menus: Array.isArray(menus) ? menus.length : 0
            });
        }
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-neo-white p-6 md:pl-72 pt-8 font-sans">
            {/* Header */}
            <div className="mb-8 border-b-4 border-neo-black pb-4">
                <h1 className="text-5xl font-black text-neo-black uppercase tracking-tighter mb-2">Admin Panel</h1>
                <p className="text-xl font-bold text-gray-600 uppercase">Command Center</p>
            </div>

            {/* Stats Overview - 4 Column */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <Card className="bg-white border-4 border-neo-black shadow-neo-lg hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all relative">
                    <div className="absolute top-0 right-0 p-2 bg-neo-blue text-white border-l-4 border-b-4 border-neo-black">
                        <Users size={24} strokeWidth={3} />
                    </div>
                    <div className="pt-8">
                        <h3 className="text-5xl font-black text-neo-black mb-1">{stats.users}</h3>
                        <p className="text-sm font-black uppercase bg-neo-blue text-white inline-block px-2 py-1 transform -rotate-2">
                            Registered Users
                        </p>
                    </div>
                </Card>

                <Card className="bg-white border-4 border-neo-black shadow-neo-lg hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all relative">
                    <div className="absolute top-0 right-0 p-2 bg-neo-green text-neo-black border-l-4 border-b-4 border-neo-black">
                        <Clock size={24} strokeWidth={3} />
                    </div>
                    <div className="pt-8">
                        <h3 className="text-5xl font-black text-neo-black mb-1">{stats.active}</h3>
                        <p className="text-sm font-black uppercase bg-neo-green text-neo-black inline-block px-2 py-1 transform rotate-1">
                            Active Now
                        </p>
                    </div>
                </Card>

                <Card className="bg-white border-4 border-neo-black shadow-neo-lg hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all relative">
                    <div className="absolute top-0 right-0 p-2 bg-neo-yellow text-neo-black border-l-4 border-b-4 border-neo-black">
                        <Coffee size={24} strokeWidth={3} />
                    </div>
                    <div className="pt-8">
                        <h3 className="text-5xl font-black text-neo-black mb-1">{stats.menus}</h3>
                        <p className="text-sm font-black uppercase bg-neo-yellow text-neo-black inline-block px-2 py-1 transform -rotate-1">
                            Menu Items
                        </p>
                    </div>
                </Card>

                <Card className="bg-white border-4 border-neo-black shadow-neo-lg hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all relative">
                    <div className="absolute top-0 right-0 p-2 bg-neo-pink text-white border-l-4 border-b-4 border-neo-black">
                        <Trophy size={24} strokeWidth={3} />
                    </div>
                    <div className="pt-8">
                        <h3 className="text-3xl font-black text-neo-black mb-1 truncate">READY</h3>
                        <p className="text-sm font-black uppercase bg-neo-pink text-white inline-block px-2 py-1 transform rotate-2">
                            Gamification
                        </p>
                    </div>
                </Card>
            </div>

            {/* Quick Actions Grid */}
            <div>
                <h2 className="text-3xl font-black text-neo-black mb-6 uppercase flex items-center gap-3">
                    <span className="w-4 h-4 bg-neo-black"></span>
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AdminActionCard
                        href="/admin/users"
                        title="User Management"
                        description="Manage residents, roles, permissions"
                        icon={<Users size={32} />}
                        color="blue"
                    />
                    <AdminActionCard
                        href="/admin/menus"
                        title="Menu Items"
                        description="Update food & beverage offerings"
                        icon={<Coffee size={32} />}
                        color="yellow"
                    />
                    <AdminActionCard
                        href="/admin/gamification"
                        title="Prize Wheel"
                        description="Spin to select weekly winners"
                        icon={<Trophy size={32} />}
                        color="purple"
                    />
                    <AdminActionCard
                        href="/admin/qr"
                        title="QR Generator"
                        description="Generate check-in QR codes"
                        icon={<QrCode size={32} />}
                        color="green"
                    />
                    <AdminActionCard
                        href="/admin/sessions"
                        title="Active Sessions"
                        description="Manual checkout for active users"
                        icon={<Clock size={32} />}
                        color="red"
                    />
                </div>
            </div>
        </div>
    );
}

type ActionCardProps = {
    href: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: 'blue' | 'yellow' | 'purple' | 'green' | 'red';
};

function AdminActionCard({ href, title, description, icon, color }: ActionCardProps) {
    const colorClasses = {
        blue: 'bg-white hover:bg-neo-blue hover:text-white',
        yellow: 'bg-white hover:bg-neo-yellow hover:text-neo-black',
        purple: 'bg-white hover:bg-purple-500 hover:text-white',
        green: 'bg-white hover:bg-neo-green hover:text-neo-black',
        red: 'bg-white hover:bg-neo-pink hover:text-white',
    };

    return (
        <Link href={href} className="group block">
            <div className={`
                border-4 border-neo-black p-6 shadow-neo transition-all group-hover:shadow-neo-lg group-hover:translate-x-[-2px] group-hover:translate-y-[-2px]
                ${colorClasses[color]}
            `}>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="mb-4 border-2 border-neo-black p-2 inline-block bg-white text-neo-black shadow-sm">{icon}</div>
                        <h3 className="text-2xl font-black mb-1 uppercase">{title}</h3>
                        <p className="text-sm font-bold opacity-70 mb-4 uppercase">{description}</p>
                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wide border-t-2 border-neo-black pt-2 inline-flex">
                            <span>Access Module</span>
                            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
