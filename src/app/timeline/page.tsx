'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PostCard } from '@/components/timeline/PostCard';
import CreatePostForm from '@/components/timeline/CreatePostForm';
import { supabase } from '@/lib/supabase';
import { Loader2, MessageCircle } from 'lucide-react';
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
                // Refresh status to clear the dot for current tab
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
        // Poll status every minute? Or just once. Just once is safer for now.
        fetchStatus();
    }, [activeTab]);

    const handleDelete = (postId: string) => {
        setPosts(posts.filter(p => p.id !== postId));
    };

    const hasAnyNotification = status.hasNewPosts || status.hasNewAnnouncements;

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-brown-900 flex items-center gap-3 relative w-fit">
                    <div className="p-2 bg-mustard-100 rounded-xl text-mustard-700 relative">
                        <MessageCircle size={28} />
                        {hasAnyNotification && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                            </span>
                        )}
                    </div>
                    SAKAToday
                </h1>
                <p className="text-brown-500 mt-2">Sosmed aseli Sakato loh ya.</p>
            </div>

            {/* Sleek Tabs */}
            <div className="flex border-b border-gray-200 mb-6 sticky top-0 bg-white/80 backdrop-blur-md z-30 pt-2">
                <button
                    onClick={() => setActiveTab('POST')}
                    className={`flex-1 py-3 text-sm font-semibold relative transition-colors ${activeTab === 'POST' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <div className="flex items-center justify-center gap-2">
                        Timeline
                        {status.hasNewPosts && activeTab !== 'POST' && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                    </div>
                    {activeTab === 'POST' && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-mustard-600 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('ANNOUNCEMENT')}
                    className={`flex-1 py-3 text-sm font-semibold relative transition-colors ${activeTab === 'ANNOUNCEMENT' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <div className="flex items-center justify-center gap-2">
                        Pengumuman
                        {status.hasNewAnnouncements && activeTab !== 'ANNOUNCEMENT' && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                    </div>
                    {activeTab === 'ANNOUNCEMENT' && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-mustard-600 rounded-t-full" />
                    )}
                </button>
            </div>

            {/* Check Notification Permission */}
            <NotificationPermission />

            {/* Create Post - Context Aware */}
            <CreatePostForm onPostCreated={fetchPosts} defaultType={activeTab} />

            {/* Feed */}
            <div className="space-y-1">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-mustard-600" size={32} />
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
                    <Card className="text-center py-12 border-dashed border-2 border-brown-200 bg-transparent shadow-none">
                        <MessageCircle size={48} className="mx-auto text-brown-300 mb-3" />
                        <h3 className="text-brown-600 font-semibold text-lg">No posts yet</h3>
                        <p className="text-brown-400">Be the first to share something!</p>
                    </Card>
                )}
            </div>
        </div>
    );
}
