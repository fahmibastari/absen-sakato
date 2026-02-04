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
        <div className="min-h-screen flex bg-neo-white bg-dots font-sans">
            {/* LEFT SIDE - BRANDING */}
            <div className="hidden lg:flex lg:w-1/2 bg-neo-green border-r-4 border-neo-black p-12 flex-col justify-between relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-20 right-20 w-48 h-48 bg-neo-yellow border-4 border-neo-black rounded-none transform rotate-45 shadow-[8px_8px_0px_#000] z-0 opacity-50"></div>
                <div className="absolute bottom-20 left-20 w-32 h-32 bg-neo-pink border-4 border-neo-black rounded-full shadow-neo z-0"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-white border-4 border-neo-black flex items-center justify-center shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                            <Coffee className="text-neo-black" size={32} strokeWidth={3} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-neo-black uppercase tracking-tighter leading-none">Sakato<br />Coffee</h1>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <h2 className="text-5xl font-black text-neo-black mb-6 leading-tight uppercase">
                        Join The<br />
                        <span className="bg-neo-black text-neo-green px-2 border-2 border-white">Squad.</span>
                    </h2>
                    <p className="text-xl font-bold text-neo-black border-l-4 border-neo-black pl-4">
                        Create your account in seconds. Start tracking, start climbing the ranks.
                    </p>
                </div>

                <div className="relative z-10 text-neo-black font-black uppercase text-xl">
                    "Simple. Fast. Brutally Efficient."
                </div>
            </div>

            {/* RIGHT SIDE - FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md bg-white border-4 border-neo-black p-8 shadow-[8px_8px_0px_#000]">
                    {/* Logo mobile */}
                    <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                        <div className="w-14 h-14 bg-neo-green border-4 border-neo-black flex items-center justify-center shadow-neo">
                            <Coffee className="text-neo-black" size={28} strokeWidth={3} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-neo-black uppercase">Sakato</h1>
                        </div>
                    </div>

                    <div className="mb-6 text-center lg:text-left">
                        <h2 className="text-4xl font-black text-neo-black mb-2 uppercase">Create Account</h2>
                        <p className="text-gray-600 font-bold uppercase text-sm">Join the coffee revolution</p>
                    </div>

                    <div className="space-y-4">
                        {/* Avatar Upload */}
                        <div className="flex justify-center mb-6">
                            <label className="cursor-pointer group relative">
                                <div className="w-32 h-32 bg-gray-100 border-4 border-neo-black group-hover:bg-neo-yellow/20 overflow-hidden flex items-center justify-center transition-all shadow-neo">
                                    {file ? (
                                        <img src={URL.createObjectURL(file as Blob)} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-4">
                                            <Upload className="mx-auto text-neo-black" size={32} strokeWidth={3} />
                                            <span className="text-xs font-black text-neo-black mt-2 block uppercase">Upload Photo</span>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-neo-black text-white p-1 border-2 border-white">
                                    <Upload size={16} />
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
                                className="border-4 border-neo-black p-3 font-bold rounded-none focus:shadow-neo transition-all"
                            />
                            <Input
                                label="Username *"
                                value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                                placeholder="johndoe"
                                className="border-4 border-neo-black p-3 font-bold rounded-none focus:shadow-neo transition-all"
                            />
                        </div>
                        <Input
                            label="Email *"
                            type="email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            placeholder="john@example.com"
                            className="border-4 border-neo-black p-3 font-bold rounded-none focus:shadow-neo transition-all"
                        />
                        <Input
                            label="Password *"
                            type="password"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            placeholder="••••••••"
                            className="border-4 border-neo-black p-3 font-bold rounded-none focus:shadow-neo transition-all"
                        />
                        <TextArea
                            label="Bio (Optional)"
                            value={form.bio}
                            onChange={e => setForm({ ...form, bio: e.target.value })}
                            placeholder="Tell us about yourself..."
                            rows={2}
                            className="border-4 border-neo-black p-3 font-bold rounded-none focus:shadow-neo transition-all resize-none"
                        />
                    </div>

                    <Button
                        onClick={submit}
                        isLoading={loading}
                        className="w-full mt-8 bg-neo-green text-neo-black hover:bg-green-400 border-4 border-neo-black shadow-neo hover:translate-y-[-2px] hover:shadow-neo-lg transition-all font-black uppercase text-lg py-4"
                    >
                        Create Account
                        <ArrowRight className="ml-2" size={24} strokeWidth={3} />
                    </Button>

                    <p className="text-center text-sm font-bold text-gray-600 mt-6 uppercase">
                        Already have an account? <Link href="/login" className="text-neo-blue hover:text-neo-black hover:underline decoration-4 underline-offset-4">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
