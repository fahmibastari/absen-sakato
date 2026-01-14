import React from 'react';
import { Card } from '@/components/ui/Card';
import { formatDistanceToNow } from 'date-fns';
import { User, MessageCircle, Heart, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PostCardProps {
    post: {
        id: string;
        content: string;
        createdAt: string;
        likeCount: number;
        isLiked: boolean;
        user: {
            id: string;
            fullName: string;
            username: string;
            avatarUrl: string | null;
        };
    };
    currentUserId?: string | null;
    onDelete?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, onDelete }) => {
    const [isLiked, setIsLiked] = React.useState(post.isLiked);
    const [likeCount, setLikeCount] = React.useState(post.likeCount);
    const [isAnimating, setIsAnimating] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleLike = async () => {
        // ... existing handleLike logic ...
        // Optimistic update
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return; // Should prompt login in real app

            const res = await fetch(`/api/timeline/${post.id}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Like API Error:", res.status, text);
                throw new Error(`Failed to like: ${res.status} ${text}`);
            }
        } catch (error) {
            console.error("Like failed:", error);
            // Revert on error
            setIsLiked(!newIsLiked);
            setLikeCount(prev => !newIsLiked ? prev + 1 : prev - 1);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Yakin mau di hapus?")) return;

        setIsDeleting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`/api/timeline/${post.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (res.ok) {
                if (onDelete) onDelete();
            } else {
                alert("Failed to delete post");
            }
        } catch (error) {
            console.error("Delete failed", error);
            alert("Error deleting post");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Card className="mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex gap-3 md:gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {post.user.avatarUrl ? (
                        <img
                            src={post.user.avatarUrl}
                            alt={post.user.fullName}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                    ) : (
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-mustard-100 flex items-center justify-center border-2 border-white shadow-sm">
                            <User className="text-mustard-600" size={18} />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-1">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <h3 className="font-bold text-brown-900 truncate">{post.user.fullName}</h3>
                            <span className="text-xs md:text-sm text-brown-500 truncate">@{post.user.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] md:text-xs text-brown-400 flex-shrink-0">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </span>
                            {currentUserId === post.user.id && (
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="text-brown-400 hover:text-red-500 transition-colors p-1"
                                    title="Delete post"
                                >
                                    {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                </button>
                            )}
                        </div>
                    </div>

                    <p className="text-sm md:text-base text-brown-800 leading-relaxed whitespace-pre-wrap break-words">
                        {post.content}
                    </p>

                    {/* Actions */}
                    <div className="mt-3 flex gap-4 text-brown-400">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1.5 text-xs md:text-sm transition-all duration-200 group ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                        >
                            <div className={`relative ${isAnimating ? 'scale-125' : 'scale-100'} transition-transform`}>
                                <Heart
                                    size={16}
                                    className={`${isLiked ? 'fill-current' : ''}`}
                                />
                            </div>
                            <span className="font-medium">{likeCount > 0 ? likeCount : 'Like'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </Card>
    );
};
