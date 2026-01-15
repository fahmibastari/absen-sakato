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

    async function fetchPosts() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const headers: HeadersInit = {};
            if (session) {
                headers['Authorization'] = `Bearer ${session.access_token}`;
                setCurrentUserId(session.user.id);
            }

            const res = await fetch('/api/timeline', { headers });
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            console.error("Failed to fetch timeline", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = (postId: string) => {
        setPosts(posts.filter(p => p.id !== postId));
    };

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-brown-900 flex items-center gap-3">
                    <div className="p-2 bg-mustard-100 rounded-xl text-mustard-700">
                        <MessageCircle size={28} />
                    </div>
                    Timeline
                </h1>
                <p className="text-brown-500 mt-2">Sosmed aseli Sakato loh ya.</p>
            </div>

            {/* Notification Permission Request */}
            <NotificationPermission />

            {/* Create Post */}
            <CreatePostForm onPostCreated={fetchPosts} />

            {/* Feed */}
            <div className="space-y-4">
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
