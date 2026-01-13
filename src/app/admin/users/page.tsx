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
        <div className="min-h-screen bg-gradient-to-br from-brown-50 via-white to-blue-50 p-6 md:pl-72 pb-24 pt-8">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-brown-900 mb-1">User Management</h1>
                    <p className="text-brown-600">Manage system users and permissions</p>
                </div>
                <div className="flex items-center gap-3 bg-blue-100 text-blue-700 px-6 py-3 rounded-xl">
                    <Shield size={24} />
                    <div>
                        <div className="text-sm font-medium">Total Users</div>
                        <div className="text-2xl font-bold">{users.length}</div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-500" size={20} />
                <input
                    type="text"
                    placeholder="Search by name or username..."
                    className="w-full bg-white border-2 border-brown-200 focus:border-mustard-500 rounded-xl py-3 pl-12 pr-4 text-brown-900 focus:outline-none transition-colors shadow-sm"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* User Table */}
            <div className="bg-white rounded-2xl border border-brown-100 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-brown-100 border-b border-brown-200">
                            <tr>
                                <th className="text-left p-4 font-semibold text-brown-900">User</th>
                                <th className="text-left p-4 font-semibold text-brown-900">Username</th>
                                <th className="text-left p-4 font-semibold text-brown-900">Role</th>
                                <th className="text-left p-4 font-semibold text-brown-900">Status</th>
                                <th className="text-right p-4 font-semibold text-brown-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((user, idx) => (
                                <tr key={user.id} className={`border-b border-brown-100 hover:bg-brown-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-brown-50/30'}`}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-brown-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {user.avatarUrl ? (
                                                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-bold text-brown-700">{user.fullName[0]}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-brown-900">{user.fullName}</div>
                                                <div className="text-xs text-brown-600">{user.email || 'No email'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-mono text-sm text-brown-700">@{user.username}</span>
                                    </td>
                                    <td className="p-4">
                                        {user.role === 'ADMIN' ? (
                                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                <Shield size={12} />
                                                Admin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                User
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                            <UserCheck size={12} />
                                            Active
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-brown-500">
                        <Search className="mx-auto mb-3 opacity-50" size={48} />
                        <p>No users found</p>
                    </div>
                )}
            </div>
        </div>
    )
}
