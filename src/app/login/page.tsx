'use client';

import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Coffee, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');

    async function login() {
        if (!email || !password) return setMsg("Isi email dan password");

        setLoading(true);
        setMsg('');

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setMsg(error.message);
            } else {
                setMsg('Login berhasil! Mengalihkan...');

                // Smart Redirect based on Role
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        const res = await fetch('/api/attendance/me', {
                            headers: { Authorization: `Bearer ${session.access_token}` }
                        });
                        const userData = await res.json();

                        if (userData.role === 'ADMIN') {
                            router.push('/admin');
                        } else {
                            router.push('/dashboard');
                        }
                    } else {
                        router.push('/dashboard');
                    }
                } catch (e) {
                    router.push('/dashboard');
                }
            }
        } catch (err) {
            setMsg('Terjadi kesalahan internal.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex bg-neo-white bg-dots font-sans">
            {/* LEFT SIDE - BRANDING */}
            <div className="hidden lg:flex lg:w-1/2 bg-neo-yellow border-r-4 border-neo-black p-12 flex-col justify-between relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-20 right-20 w-48 h-48 bg-neo-white border-4 border-neo-black rounded-full shadow-neo-lg z-0"></div>
                <div className="absolute bottom-20 left-20 w-32 h-32 bg-neo-blue border-4 border-neo-black transform rotate-12 shadow-neo z-0"></div>

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
                        Track Your<br />
                        <span className="bg-neo-black text-neo-yellow px-2">Hustle.</span>
                    </h2>
                    <p className="text-xl font-bold text-neo-black border-l-4 border-neo-black pl-4">
                        The ultimate attendance system for the coffee army. Check in, grind, repeat.
                    </p>
                </div>

                <div className="relative z-10 flex gap-12 text-neo-black">
                    <div>
                        <div className="text-4xl font-black">500+</div>
                        <div className="font-bold uppercase text-sm border-t-2 border-neo-black pt-1">Check-ins</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black">50+</div>
                        <div className="font-bold uppercase text-sm border-t-2 border-neo-black pt-1">Active Users</div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md bg-white border-4 border-neo-black p-8 shadow-[8px_8px_0px_#000]">
                    {/* Logo mobile */}
                    <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                        <div className="w-14 h-14 bg-neo-yellow border-4 border-neo-black flex items-center justify-center shadow-neo">
                            <Coffee className="text-neo-black" size={28} strokeWidth={3} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-neo-black uppercase">Sakato</h1>
                        </div>
                    </div>

                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-4xl font-black text-neo-black mb-2 uppercase">Welcome Back</h2>
                        <p className="text-gray-600 font-bold uppercase text-sm">Sign in to command center</p>
                    </div>

                    <div className="space-y-6">
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="border-4 border-neo-black p-4 font-bold text-lg focus:shadow-neo transition-all rounded-none"
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="border-4 border-neo-black p-4 font-bold text-lg focus:shadow-neo transition-all rounded-none"
                        />
                    </div>

                    {msg && (
                        <div className={`mt-6 text-center text-sm font-black uppercase p-4 border-4 border-neo-black shadow-neo relative z-50 ${msg.toLowerCase().includes('berhasil') ? 'bg-neo-green text-neo-black animate-bounce' : 'bg-neo-red text-white'}`}>
                            {msg}
                        </div>
                    )}

                    <Button
                        onClick={login}
                        isLoading={loading}
                        className="w-full mt-8 bg-neo-black text-white hover:bg-gray-800 border-4 border-neo-black shadow-neo hover:translate-y-[-2px] hover:shadow-neo-lg transition-all font-black uppercase text-lg py-6"
                    >
                        Sign In
                        <ArrowRight className="ml-2" size={24} strokeWidth={3} />
                    </Button>

                    <p className="text-center text-sm font-bold text-gray-600 mt-8 uppercase">
                        Don't have an account? <Link href="/register" className="text-neo-blue hover:text-neo-black hover:underline decoration-4 underline-offset-4">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
