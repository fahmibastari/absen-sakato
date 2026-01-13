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
        <div className="min-h-screen flex">
            {/* LEFT SIDE - BRANDING */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-mustard-600 via-mustard-500 to-brown-700 p-12 flex-col justify-between relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-brown-900/20 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center">
                            <Coffee className="text-mustard-600" size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Sakato Coffee</h1>
                            <p className="text-mustard-100 text-sm">Attendance System</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                        Track Your Coffee<br />Time, Effortlessly
                    </h2>
                    <p className="text-mustard-100 text-lg">
                        Simple, modern attendance tracking for coffee shop teams. Check in, compete, and connect.
                    </p>
                </div>

                <div className="relative z-10 flex gap-8 text-white">
                    <div>
                        <div className="text-3xl font-bold">500+</div>
                        <div className="text-mustard-100 text-sm">Check-ins</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold">50+</div>
                        <div className="text-mustard-100 text-sm">Active Users</div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    {/* Logo mobile */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-mustard-500 rounded-xl flex items-center justify-center">
                            <Coffee className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-brown-900">Sakato</h1>
                            <p className="text-brown-500 text-sm">Coffee Shop Attendance</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-brown-900 mb-2">Welcome Back</h2>
                        <p className="text-brown-600">Sign in to continue to your dashboard</p>
                    </div>

                    <div className="space-y-5">
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    {msg && <p className="mt-4 text-center text-sm text-mustard-700 bg-mustard-50 p-3 rounded-lg border border-mustard-200">{msg}</p>}

                    <Button onClick={login} isLoading={loading} className="w-full mt-6">
                        Sign In
                        <ArrowRight className="ml-2" size={18} />
                    </Button>

                    <p className="text-center text-sm text-brown-600 mt-6">
                        Don't have an account? <Link href="/register" className="text-mustard-600 font-semibold hover:underline">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
