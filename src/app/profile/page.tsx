'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Input, TextArea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User, Mail, AtSign, Edit2, Save, X, LogOut } from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [profile, setProfile] = useState({
        id: '',
        fullName: '',
        username: '',
        email: '',
        bio: '',
        avatarUrl: '',
        joinedAt: ''
    });

    useEffect(() => {
        getProfile();
    }, []);

    async function getProfile() {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.replace('/login'); return; }

        try {
            const res = await fetch('/api/attendance/me', {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            const data = await res.json();

            setProfile({
                id: data.id || '',
                fullName: data.fullName || '',
                username: data.username || '',
                email: session.user.email || '',
                bio: data.bio || '',
                avatarUrl: data.avatarUrl || '',
                joinedAt: session.user.created_at || new Date().toISOString()
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        localStorage.removeItem('user_role');
        await supabase.auth.signOut();
        router.push('/login');
    }

    async function saveProfile(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();

        try {
            await fetch('/api/attendance/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    fullName: profile.fullName,
                    username: profile.username,
                    bio: profile.bio
                })
            });
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (e) {
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-brown-50 via-white to-mustard-50 pb-24 md:pl-72 pt-8 px-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-brown-900 mb-1">Profile</h1>
                <p className="text-brown-600">Manage your account information</p>
            </div>

            {/* Profile Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left - Avatar & Quick Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Avatar Card */}
                    <div className="bg-white rounded-2xl border border-brown-100 shadow-lg p-8">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-32 h-32 rounded-full border-4 border-mustard-500 bg-brown-100 flex items-center justify-center relative mb-4 shadow-lg">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <User size={48} className="text-brown-400" />
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-brown-900 mb-1">{profile.fullName || 'Loading...'}</h2>
                            <p className="text-brown-600 mb-4">@{profile.username || '...'}</p>

                            {!isEditing && (
                                <div className="w-full space-y-3">
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Edit2 size={16} className="mr-2" />
                                        Edit Profile
                                    </Button>
                                    <Button
                                        onClick={handleLogout}
                                        variant="danger"
                                        className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                                    >
                                        <LogOut size={16} className="mr-2" />
                                        Logout Account
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-gradient-to-br from-mustard-500 to-mustard-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="text-sm font-medium text-mustard-100 mb-2">Member Since</div>
                        <div className="text-2xl font-bold">
                            {profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' }) : '-'}
                        </div>
                    </div>
                </div>

                {/* Right - Info & Edit Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-brown-100 shadow-lg p-8">
                        {!isEditing ? (
                            /* View Mode */
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-brown-900 mb-6">Account Information</h3>
                                </div>

                                <div className="grid gap-6">
                                    <div className="flex items-start gap-4 p-4 bg-brown-50 rounded-xl">
                                        <div className="w-10 h-10 rounded-lg bg-mustard-100 flex items-center justify-center flex-shrink-0">
                                            <User className="text-mustard-600" size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm text-brown-600 mb-1">Full Name</div>
                                            <div className="font-semibold text-brown-900">{profile.fullName}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 bg-brown-50 rounded-xl">
                                        <div className="w-10 h-10 rounded-lg bg-mustard-100 flex items-center justify-center flex-shrink-0">
                                            <AtSign className="text-mustard-600" size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm text-brown-600 mb-1">Username</div>
                                            <div className="font-semibold text-brown-900">@{profile.username}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 bg-brown-50 rounded-xl">
                                        <div className="w-10 h-10 rounded-lg bg-mustard-100 flex items-center justify-center flex-shrink-0">
                                            <Mail className="text-mustard-600" size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm text-brown-600 mb-1">Email Address</div>
                                            <div className="font-semibold text-brown-900">{profile.email}</div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-brown-50 rounded-xl">
                                        <div className="text-sm text-brown-600 mb-2">Bio</div>
                                        <div className="text-brown-900 italic">{profile.bio || 'No bio yet.'}</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Edit Mode */
                            <form onSubmit={saveProfile} className="space-y-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-brown-900">Edit Profile</h3>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="text-brown-600 hover:text-brown-900"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <Input
                                    label="Full Name"
                                    value={profile.fullName}
                                    onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                                />
                                <Input
                                    label="Username"
                                    value={profile.username}
                                    onChange={e => setProfile({ ...profile, username: e.target.value })}
                                />
                                <TextArea
                                    label="Bio"
                                    value={profile.bio}
                                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                    rows={4}
                                />

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="primary" disabled={loading} className="flex-1">
                                        <Save size={18} className="mr-2" />
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
