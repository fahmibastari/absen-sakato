'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/Button";
import { Shield, Trash2, Search, UserCheck, UserX } from 'lucide-react';

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch('/api/admin/users', {
            headers: { Authorization: `Bearer ${session.access_token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setUsers(data);
        }
        setLoading(false);
    }

    const filtered = users.filter(u =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-neo-yellow bg-dots p-6 md:pl-72 pb-24 pt-8 font-sans">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b-4 border-neo-black pb-6 bg-white p-4 shadow-neo">
                <div>
                    <h1 className="text-4xl font-black text-neo-black mb-1 uppercase tracking-tighter">User Roster</h1>
                    <p className="text-gray-600 font-bold uppercase">Manage access & permissions</p>
                </div>
                <div className="flex items-center gap-4 bg-neo-black text-white px-6 py-3 border-2 border-white shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-transform">
                    <Shield size={32} className="text-neo-yellow" />
                    <div>
                        <div className="text-xs font-bold uppercase text-neo-yellow">Total Agents</div>
                        <div className="text-3xl font-black leading-none">{users.length}</div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative max-w-md">
                <div className="absolute inset-0 bg-neo-black translate-x-2 translate-y-2"></div>
                <div className="relative border-4 border-neo-black bg-white flex items-center p-2">
                    <Search className="ml-2 text-neo-black" size={24} strokeWidth={3} />
                    <input
                        type="text"
                        placeholder="SEARCH AGENT..."
                        className="w-full bg-transparent border-none focus:ring-0 text-neo-black font-bold placeholder-gray-400 uppercase ml-2 outline-none"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* User Table */}
            <div className="bg-white border-4 border-neo-black shadow-neo-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neo-black text-white border-b-4 border-neo-black">
                            <tr>
                                <th className="text-left p-4 font-black uppercase text-sm tracking-wider">Agent Profile</th>
                                <th className="text-left p-4 font-black uppercase text-sm tracking-wider">Codename</th>
                                <th className="text-left p-4 font-black uppercase text-sm tracking-wider">Clearance</th>
                                <th className="text-left p-4 font-black uppercase text-sm tracking-wider">Status</th>
                                <th className="text-right p-4 font-black uppercase text-sm tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-4 divide-neo-black">
                            {filtered.map((user, idx) => (
                                <tr key={user.id} className={`hover:bg-neo-yellow/20 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 border-2 border-neo-black bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {user.avatarUrl ? (
                                                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                                                ) : (
                                                    <span className="font-black text-neo-black text-lg">{user.fullName[0]}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-black text-neo-black uppercase">{user.fullName}</div>
                                                <div className="text-xs font-bold text-gray-500 uppercase">{user.email || 'NO EMAIL'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-mono text-sm font-bold bg-neo-black text-white px-2 py-1">@{user.username}</span>
                                    </td>
                                    <td className="p-4">
                                        {user.role === 'ADMIN' ? (
                                            <span className="inline-flex items-center gap-1 bg-neo-pink border-2 border-neo-black text-white px-3 py-1 text-xs font-black uppercase shadow-neo-sm transform -rotate-2">
                                                <Shield size={12} fill="currentColor" />
                                                Admin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-neo-blue border-2 border-neo-black text-white px-3 py-1 text-xs font-black uppercase shadow-neo-sm transform rotate-1">
                                                User
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center gap-1 bg-neo-green border-2 border-neo-black text-neo-black px-3 py-1 text-xs font-black uppercase">
                                            <UserCheck size={12} strokeWidth={3} />
                                            Active
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 border-2 border-neo-black bg-white hover:bg-neo-pink hover:text-white transition-all shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                                                <Trash2 size={18} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-neo-black bg-white">
                        <Search className="mx-auto mb-3 opacity-20" size={64} />
                        <p className="font-black uppercase text-xl">NO AGENTS FOUND</p>
                    </div>
                )}
            </div>
        </div>
    )
}
