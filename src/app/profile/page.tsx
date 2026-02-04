'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Input, TextArea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User, Mail, AtSign, Edit2, Save, X, LogOut, Camera } from 'lucide-react';

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

    async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
        if (!event.target.files || event.target.files.length === 0) return;

        const file = event.target.files[0];
        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No session");

            const fileExt = file.name.split('.').pop();
            const fileName = `public/${session.user.id}/${Date.now()}.${fileExt}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(fileName);

            // Update local state (will be saved when clicking Save Changes, or we can auto-update? 
            // The plan said "Update URL... delete old". This usually implies saving immediately.
            // Let's update ONLY the local state so the user sees preview, 
            // BUT for "delete old" logic to work best on backend, we should technically save the whole profile or just the avatar.
            // To keep it simple and consistent with "Edit Profile" flow, we'll just set it in state.
            // But wait, if they cancel, we uploaded a file for nothing.
            // Better UX: Upload AND Save immediately for avatar, or handle temp files.
            // Given "User request: ... saat ganti, foto lama ... terhapus", immediate save makes sense for Avatar.

            // LET'S AUTO-SAVE AVATAR CHANGE
            setProfile(prev => ({ ...prev, avatarUrl: publicUrl }));

            // Trigger save immediately for avatar
            await fetch('/api/attendance/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    ...profile,
                    avatarUrl: publicUrl
                    // We include other profile fields too so they don't get overwritten with old state if they were being edited
                })
            });

            alert("Foto profil berhasil diganti!");

        } catch (e) {
            console.error(e);
            alert("Gagal upload foto");
        } finally {
            setLoading(false);
        }
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
                    bio: profile.bio,
                    avatarUrl: profile.avatarUrl // Include avatarUrl
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
        <div className="min-h-screen bg-neo-white bg-dots pb-24 md:pl-72 pt-8 px-6 font-sans">
            {/* Header */}
            <div className="mb-12 border-b-4 border-neo-black pb-6 bg-white border-4 p-6 shadow-neo">
                <h1 className="text-5xl font-black text-neo-black uppercase tracking-tighter mb-2">My Profile</h1>
                <p className="text-xl font-bold text-gray-600 uppercase">Manage your identity.</p>
            </div>

            {/* Profile Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left - Avatar & Quick Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Avatar Card */}
                    <div className="bg-white border-4 border-neo-black shadow-neo-lg p-8 relative">
                        {/* Badge */}
                        {!isEditing && (
                            <div className="absolute top-4 right-4 bg-neo-green text-neo-black border-2 border-neo-black px-2 py-0.5 text-xs font-black uppercase rotate-6">
                                Verified
                            </div>
                        )}

                        <div className="flex flex-col items-center text-center">
                            <div className="relative group">
                                <div className="w-40 h-40 border-4 border-neo-black bg-gray-100 flex items-center justify-center relative mb-6 shadow-[8px_8px_0px_#000] overflow-hidden">
                                    {profile.avatarUrl ? (
                                        <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                    ) : (
                                        <User size={64} className="text-neo-black" strokeWidth={1.5} />
                                    )}
                                </div>

                                {/* Edit Overlay */}
                                {isEditing && (
                                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-neo-black/50 transition-colors z-10 w-40 h-40 border-4 border-transparent hover:border-white">
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            disabled={loading}
                                        />
                                        <div className="text-white flex flex-col items-center gap-1 animate-bounce">
                                            <Camera size={32} strokeWidth={3} className="text-neo-yellow drop-shadow-md" />
                                            <span className="text-xs font-black uppercase bg-neo-black px-1 text-neo-yellow">Change</span>
                                        </div>
                                    </label>
                                )}
                            </div>

                            <h2 className="text-3xl font-black text-neo-black mb-1 uppercase tracking-tight break-words w-full">{profile.fullName || 'Loading...'}</h2>
                            <p className="text-white bg-neo-black px-2 text-sm font-bold uppercase mb-6 inline-block transform -rotate-2">@{profile.username || '...'}</p>

                            {!isEditing && (
                                <div className="w-full space-y-4">
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        className="w-full bg-neo-blue text-white border-4 border-neo-black shadow-neo hover:translate-y-[-2px] hover:shadow-neo-lg font-black uppercase"
                                    >
                                        <Edit2 size={18} className="mr-2" strokeWidth={3} />
                                        Edit Profile
                                    </Button>
                                    <Button
                                        onClick={handleLogout}
                                        className="w-full bg-neo-pink text-white border-4 border-neo-black shadow-neo hover:translate-y-[-2px] hover:shadow-neo-lg font-black uppercase"
                                    >
                                        <LogOut size={18} className="mr-2" strokeWidth={3} />
                                        Logout
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-neo-yellow border-4 border-neo-black p-6 text-neo-black shadow-neo">
                        <div className="text-xs font-black uppercase mb-2 border-b-2 border-neo-black pb-1 inline-block">One of us since</div>
                        <div className="text-3xl font-black uppercase">
                            {profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }) : '-'}
                        </div>
                    </div>
                </div>

                {/* Right - Info & Edit Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-4 border-neo-black shadow-neo-lg p-8 relative">
                        {/* Decorative Corner */}
                        <div className="absolute top-0 right-0 w-8 h-8 bg-neo-black"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 bg-white border-2 border-neo-black transform translate-x-2 -translate-y-2"></div>

                        {!isEditing ? (
                            /* View Mode */
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-2xl font-black text-neo-black uppercase border-b-4 border-neo-black pb-2 inline-block">Details</h3>
                                </div>

                                <div className="grid gap-6">
                                    <div className="flex items-start gap-4 p-4 border-2 border-neo-black bg-gray-50 hover:bg-neo-blue/10 transition-colors">
                                        <div className="w-12 h-12 border-2 border-neo-black bg-neo-blue flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <User className="text-white" size={24} strokeWidth={3} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-gray-500 uppercase mb-1">Full Name</div>
                                            <div className="text-xl font-black text-neo-black uppercase break-words">{profile.fullName}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 border-2 border-neo-black bg-gray-50 hover:bg-neo-yellow/10 transition-colors">
                                        <div className="w-12 h-12 border-2 border-neo-black bg-neo-yellow flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <AtSign className="text-neo-black" size={24} strokeWidth={3} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-gray-500 uppercase mb-1">Username</div>
                                            <div className="text-xl font-black text-neo-black uppercase break-all">@{profile.username}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 border-2 border-neo-black bg-gray-50 hover:bg-neo-pink/10 transition-colors">
                                        <div className="w-12 h-12 border-2 border-neo-black bg-neo-pink flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <Mail className="text-white" size={24} strokeWidth={3} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-gray-500 uppercase mb-1">Email Address</div>
                                            <div className="text-xl font-black text-neo-black uppercase break-all">{profile.email}</div>
                                        </div>
                                    </div>

                                    <div className="p-6 border-2 border-neo-black bg-white shadow-[4px_4px_0px_#000]">
                                        <div className="text-xs font-bold text-neo-black bg-neo-green inline-block px-2 py-0.5 border-2 border-neo-black mb-3 uppercase">Bio</div>
                                        <div className="text-xl font-bold text-neo-black italic leading-relaxed break-words whitespace-pre-wrap">"{profile.bio || 'No bio yet.'}"</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Edit Mode */
                            <form onSubmit={saveProfile} className="space-y-6">
                                <div className="flex items-center justify-between mb-8 border-b-4 border-neo-black pb-4">
                                    <h3 className="text-3xl font-black text-neo-black uppercase">Edit Mode</h3>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="text-neo-black hover:bg-neo-red hover:text-white p-2 border-2 border-transparent hover:border-neo-black transition-all"
                                    >
                                        <X size={32} strokeWidth={3} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <Input
                                        label="Full Name"
                                        value={profile.fullName}
                                        onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                                        className="border-4 border-neo-black p-4 font-bold text-lg"
                                    />
                                    <Input
                                        label="Username"
                                        value={profile.username}
                                        onChange={e => setProfile({ ...profile, username: e.target.value })}
                                        className="border-4 border-neo-black p-4 font-bold text-lg"
                                    />
                                    <TextArea
                                        label="Bio"
                                        value={profile.bio}
                                        onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                        rows={4}
                                        className="border-4 border-neo-black p-4 font-bold text-lg resize-none"
                                    />
                                </div>

                                <div className="flex gap-4 pt-8">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 bg-white text-neo-black border-4 border-neo-black py-3 font-black uppercase hover:bg-gray-100 transition-colors shadow-neo active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-neo-green text-neo-black border-4 border-neo-black py-3 font-black uppercase hover:bg-green-400 transition-colors shadow-neo active:shadow-none active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2"
                                    >
                                        <Save size={20} strokeWidth={3} />
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
