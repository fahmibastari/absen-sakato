'use client';

import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Coffee, ArrowRight, Upload } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [form, setForm] = useState({
        email: '',
        password: '',
        fullName: '',
        username: '',
        bio: '',
    });

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    }

    async function submit() {
        if (!form.email || !form.password || !form.username || !form.fullName) {
            alert("Harap isi semua kolom wajib!");
            return;
        }

        setLoading(true);
        try {
            // 1. Sign Up Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: form.email.trim(),
                password: form.password.trim(),
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("Gagal mendaftar user");

            const userId = authData.user.id;
            let avatarUrl = null;

            // 2. Upload Image
            if (file) {
                const fileExt = file.name.split('.').pop();
                const filePath = `${userId}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error("Upload failed:", uploadError);
                    // continue even if upload fails
                } else {
                    const { data: publicUrlData } = supabase.storage
                        .from('images')
                        .getPublicUrl(filePath);
                    avatarUrl = publicUrlData.publicUrl;
                }
            }

            // 3. Simpan Profil ke Database
            await fetch('/api/profile', {
                method: 'POST',
                body: JSON.stringify({
                    id: userId,
                    fullName: form.fullName.trim(),
                    username: form.username.trim(),
                    bio: form.bio.trim(),
                    avatarUrl
                }),
            });

            alert('Register berhasil! Silahkan login.');
            router.push('/login');

        } catch (err: any) {
            alert(err.message || 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* LEFT SIDE - BRANDING */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brown-700 via-brown-600 to-mustard-700 p-12 flex-col justify-between relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-mustard-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center">
                            <Coffee className="text-brown-700" size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Sakato Coffee</h1>
                            <p className="text-brown-100 text-sm">Attendance System</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                        Join The Team,<br />Start Tracking Today
                    </h2>
                    <p className="text-brown-100 text-lg">
                        Create your account in seconds and become part of the coffee community.
                    </p>
                </div>

                <div className="relative z-10 text-white/80 text-sm">
                    "Simple, intuitive, and makes attendance tracking actually enjoyable."
                </div>
            </div>

            {/* RIGHT SIDE - FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    {/* Logo mobile */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-brown-700 rounded-xl flex items-center justify-center">
                            <Coffee className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-brown-900">Sakato</h1>
                            <p className="text-brown-500 text-sm">Coffee Shop Attendance</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-brown-900 mb-2">Create Account</h2>
                        <p className="text-brown-600">Fill in your details to get started</p>
                    </div>

                    <div className="space-y-4">
                        {/* Avatar Upload */}
                        <div className="flex justify-center">
                            <label className="cursor-pointer group">
                                <div className="w-24 h-24 rounded-full bg-brown-100 border-2 border-dashed border-brown-300 group-hover:border-mustard-500 overflow-hidden flex items-center justify-center transition-all">
                                    {file ? (
                                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="mx-auto text-brown-400 group-hover:text-mustard-500 transition-colors" size={24} />
                                            <span className="text-xs text-brown-500 mt-1 block">Upload Photo</span>
                                        </div>
                                    )}
                                </div>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Full Name *"
                                value={form.fullName}
                                onChange={e => setForm({ ...form, fullName: e.target.value })}
                                placeholder="John Doe"
                            />
                            <Input
                                label="Username *"
                                value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                                placeholder="johndoe"
                            />
                        </div>
                        <Input
                            label="Email *"
                            type="email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            placeholder="john@example.com"
                        />
                        <Input
                            label="Password *"
                            type="password"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            placeholder="••••••••"
                        />
                        <TextArea
                            label="Bio (Optional)"
                            value={form.bio}
                            onChange={e => setForm({ ...form, bio: e.target.value })}
                            placeholder="Tell us about yourself..."
                            rows={2}
                        />
                    </div>

                    <Button onClick={submit} isLoading={loading} className="w-full mt-6">
                        Create Account
                        <ArrowRight className="ml-2" size={18} />
                    </Button>

                    <p className="text-center text-sm text-brown-600 mt-6">
                        Already have an account? <Link href="/login" className="text-mustard-600 font-semibold hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
