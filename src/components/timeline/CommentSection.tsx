'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        id: string;
        fullName: string;
        username: string;
        avatarUrl: string | null;
    };
    userId: string;
}

interface CommentSectionProps {
    postId: string;
    currentUserId: string | null;
    onCommentAdded?: () => void;
}

export default function CommentSection({ postId, currentUserId, onCommentAdded }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const inputRef = useState<HTMLInputElement | null>(null);
    const [inputEl, setInputEl] = useState<HTMLInputElement | null>(null);

    const handleReply = (username: string) => {
        setNewComment(`@${username} `);
        inputEl?.focus();
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

    async function fetchComments() {
        try {
            const res = await fetch(`/api/timeline/${postId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Failed to fetch comments", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!newComment.trim() || !currentUserId) return;

        setSubmitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`/api/timeline/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ content: newComment })
            });

            if (res.ok) {
                const addedComment = await res.json();
                setComments([...comments, addedComment]);
                setNewComment('');
                if (onCommentAdded) onCommentAdded();
            }
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return <div className="p-4 flex justify-center text-brown-400"><Loader2 className="animate-spin" size={20} /></div>;
    }

    return (
        <div className="border-t border-gray-100 bg-white pt-2 pb-4 px-4 md:px-6">
            {/* Comment List */}
            <div className="space-y-4 mb-4">
                {comments.length === 0 ? (
                    <p className="text-xs text-center text-gray-400 py-4 italic">Belum ada komentar.</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="flex gap-3 text-[13px] group">
                            <div className="flex-shrink-0">
                                <Link href={`/profile/${comment.user.username}`}>
                                    <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden relative border border-gray-100">
                                        {comment.user.avatarUrl ? (
                                            <Image
                                                src={comment.user.avatarUrl}
                                                alt={comment.user.fullName}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-[10px]">
                                                {comment.user.fullName.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="leading-snug">
                                    <Link href={`/profile/${comment.user.username}`} className="font-semibold text-gray-900 mr-2 hover:underline">
                                        {comment.user.username}
                                    </Link>
                                    <span className="text-gray-800 break-words">{comment.content}</span>
                                </div>
                                <div className="flex gap-4 mt-1">
                                    <span className="text-[11px] text-gray-400">
                                        {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                    <button
                                        onClick={() => handleReply(comment.user.username)}
                                        className="text-[11px] font-semibold text-gray-400 hover:text-gray-600"
                                    >
                                        Balas
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-3 items-center border-t border-gray-100 pt-3">
                <div className="text-xl">😊</div>
                <div className="flex-1 relative">
                    <input
                        ref={setInputEl}
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Tambahkan komentar..."
                        className="w-full text-sm outline-none placeholder:text-gray-400 bg-transparent py-1"
                        disabled={submitting}
                    />
                </div>
                <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="text-blue-500 font-semibold text-sm disabled:opacity-30 hover:text-blue-600 transition-colors"
                >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Kirim'}
                </button>
            </form>
        </div>
    );
}
