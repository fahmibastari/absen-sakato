'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PostCard } from '@/components/timeline/PostCard';
import CreatePostForm from '@/components/timeline/CreatePostForm';
import { supabase } from '@/lib/supabase';
import { Loader2, MessageCircle, Star } from 'lucide-react';
import { NotificationPermission } from '@/components/timeline/NotificationPermission';

interface Post {
    id: string;
    content: string;
    createdAt: string;
    likeCount: number;
    commentCount: number;
    isLiked: boolean;
    user: {
        id: string;
        fullName: string;
        username: string;
        avatarUrl: string | null;
    };
}

export default function TimelinePage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'POST' | 'ANNOUNCEMENT'>('POST');

    const [status, setStatus] = useState({ hasNewPosts: false, hasNewAnnouncements: false });

    async function fetchPosts(type?: 'POST' | 'ANNOUNCEMENT') {
        const targetType = type || activeTab;
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const headers: HeadersInit = {};
            if (session) {
                headers['Authorization'] = `Bearer ${session.access_token}`;
                setCurrentUserId(session.user.id);
            }

            const res = await fetch(`/api/timeline?type=${targetType}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
                fetchStatus();
            }
        } catch (error) {
            console.error("Failed to fetch timeline", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchStatus() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch('/api/timeline/status', {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            if (res.ok) {
                setStatus(await res.json());
            }
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        fetchPosts();
        fetchStatus();
    }, [activeTab]);

    const handleDelete = (postId: string) => {
        setPosts(posts.filter(p => p.id !== postId));
    };

    const hasAnyNotification = status.hasNewPosts || status.hasNewAnnouncements;

    return (
        <div className="min-h-screen bg-neo-blue bg-dots font-sans">
            <div className="max-w-2xl mx-auto p-4 md:p-8 md:pl-24"> {/* Added padding left for mobile sidebar clearance if needed, but sidebar is usually left. desktop is pl-72 usually handled by layout padding. Wait, formatting usually handles this. */}

                {/* Header */}
                <div className="mb-8 p-6 bg-white border-4 border-neo-black shadow-neo">
                    <h1 className="text-4xl font-black text-neo-black uppercase tracking-tighter flex items-center gap-3">
                        Sakatoday
                        {hasAnyNotification && (
                            <span className="relative flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neo-pink opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-neo-pink border-2 border-black"></span>
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-600 font-bold uppercase mt-1">Asbun dulu gak sih</p>
                </div>

                {/* Sleek Tabs */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('POST')}
                        className={`py-4 border-4 border-neo-black font-black uppercase text-lg transition-all shadow-neo hover:translate-y-[-2px] hover:shadow-neo-lg
                            ${activeTab === 'POST' ? 'bg-neo-yellow text-neo-black' : 'bg-white text-gray-500 hover:text-neo-black'}
                        `}
                    >
                        <div className="flex items-center justify-center gap-2">
                            MESSAGE FEED
                            {status.hasNewPosts && activeTab !== 'POST' && <span className="w-3 h-3 bg-neo-pink border-2 border-black rounded-full" />}
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('ANNOUNCEMENT')}
                        className={`py-4 border-4 border-neo-black font-black uppercase text-lg transition-all shadow-neo hover:translate-y-[-2px] hover:shadow-neo-lg
                            ${activeTab === 'ANNOUNCEMENT' ? 'bg-neo-pink text-white' : 'bg-white text-gray-500 hover:text-neo-black'}
                        `}
                    >
                        <div className="flex items-center justify-center gap-2">
                            ANNOUNCEMENTS
                            {status.hasNewAnnouncements && activeTab !== 'ANNOUNCEMENT' && <span className="w-3 h-3 bg-neo-yellow border-2 border-black rounded-full" />}
                        </div>
                    </button>
                </div>

                {/* Notification Permission */}
                <NotificationPermission />

                {/* Create Post */}
                <div className="mb-8">
                    <CreatePostForm onPostCreated={fetchPosts} defaultType={activeTab} />
                </div>

                {/* Feed */}
                <div className="space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="animate-spin text-white" size={64} />
                        </div>
                    ) : posts.length > 0 ? (
                        posts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                currentUserId={currentUserId}
                                onDelete={() => handleDelete(post.id)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white border-4 border-neo-black border-dashed">
                            <MessageCircle size={64} className="mx-auto text-gray-300 mb-4" strokeWidth={3} />
                            <h3 className="text-neo-black font-black text-2xl uppercase">SILENCE.</h3>
                            <p className="text-gray-500 font-bold uppercase">Be the first to break it.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
