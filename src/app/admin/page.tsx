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
        <div className="min-h-screen bg-gradient-to-br from-brown-50 via-white to-red-50 p-6 md:pl-72 pt-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-brown-900 mb-1">Admin Dashboard</h1>
                <p className="text-brown-600">Manage your coffee shop ecosystem</p>
            </div>

            {/* Stats Overview - 4 Column */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-blue-100 text-sm mb-1">Total Users</p>
                            <h3 className="text-3xl font-bold">{stats.users}</h3>
                            <p className="text-xs text-blue-100 mt-2 flex items-center gap-1">
                                <TrendingUp size={12} />
                                Registered members
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Users size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-green-100 text-sm mb-1">Active Now</p>
                            <h3 className="text-3xl font-bold">{stats.active}</h3>
                            <p className="text-xs text-green-100 mt-2 flex items-center gap-1">
                                <Activity size={12} />
                                Live tracking
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Clock size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-mustard-500 to-mustard-600 text-white border-0 shadow-lg">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-mustard-100 text-sm mb-1">Menu Items</p>
                            <h3 className="text-3xl font-bold">{stats.menus}</h3>
                            <p className="text-xs text-mustard-100 mt-2">Coffee & Snacks</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Coffee size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-purple-100 text-sm mb-1">Weekly Winner</p>
                            <h3 className="text-lg font-bold">Ready to Spin</h3>
                            <p className="text-xs text-purple-100 mt-2">Gamification Active</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Trophy size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Quick Actions Grid */}
            <div>
                <h2 className="text-2xl font-bold text-brown-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AdminActionCard
                        href="/admin/users"
                        title="User Management"
                        description="Manage residents, roles, and permissions"
                        icon={<Users size={32} />}
                        color="blue"
                    />
                    <AdminActionCard
                        href="/admin/menus"
                        title="Menu Items"
                        description="Update food & beverage offerings"
                        icon={<Coffee size={32} />}
                        color="mustard"
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
    color: 'blue' | 'mustard' | 'purple' | 'green' | 'red';
};

function AdminActionCard({ href, title, description, icon, color }: ActionCardProps) {
    const colorClasses = {
        blue: 'from-blue-100 to-blue-50 hover:from-blue-200 text-blue-700 border-blue-200',
        mustard: 'from-mustard-100 to-mustard-50 hover:from-mustard-200 text-mustard-700 border-mustard-200',
        purple: 'from-purple-100 to-purple-50 hover:from-purple-200 text-purple-700 border-purple-200',
        green: 'from-green-100 to-green-50 hover:from-green-200 text-green-700 border-green-200',
        red: 'from-red-100 to-red-50 hover:from-red-200 text-red-700 border-red-200',
    };

    return (
        <Link href={href} className="group block">
            <Card className={`bg-gradient-to-br ${colorClasses[color]} border-2 shadow-lg hover:shadow-xl transition-all`}>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="mb-3">{icon}</div>
                        <h3 className="text-xl font-bold mb-2">{title}</h3>
                        <p className="text-sm opacity-80 mb-4">{description}</p>
                        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
                            <span>Access</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
