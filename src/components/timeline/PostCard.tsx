import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { MessageCircle, Heart, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import CommentSection from './CommentSection'; // Fixed import path if needed, usually it is default export
import { UserPreviewModal } from './UserPreviewModal';
import Image from 'next/image';

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

interface PostCardProps {
    post: Post;
    currentUserId: string | null;
    onDelete?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, onDelete }) => {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likeCount, setLikeCount] = useState(post.likeCount);
    const [commentCount, setCommentCount] = useState(post.commentCount);
    const [showComments, setShowComments] = useState(false);

    // Profile Modal State
    const [previewUsername, setPreviewUsername] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openProfile = (username: string) => {
        setPreviewUsername(username);
        setIsModalOpen(true);
    };

    const handleLike = async () => {
        if (!currentUserId) return;
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

        const { data: { session } } = await supabase.auth.getSession();
        await fetch(`/api/timeline/${post.id}/like`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${session?.access_token}` }
        });
    };

    const handleDelete = async () => {
        if (!confirm('Hapus postingan ini?')) return;
        const { data: { session } } = await supabase.auth.getSession();
        await fetch(`/api/timeline/${post.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${session?.access_token}` }
        });
        if (onDelete) onDelete();
    };

    // Render mentions
    const renderContent = (text: string) => {
        const parts = text.split(/(@\w+)/g);
        return parts.map((part, index) => {
            if (part.match(/^@\w+$/)) {
                const username = part.substring(1);
                return (
                    <span
                        key={index}
                        onClick={(e) => { e.stopPropagation(); openProfile(username); }}
                        className="text-neo-blue font-black cursor-pointer hover:underline bg-neo-blue/10 px-1"
                    >
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <>
            <div className="bg-white border-4 border-neo-black p-4 md:p-6 mb-6 shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all animate-in slide-in-from-bottom-2">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 bg-gray-200 border-2 border-neo-black flex items-center justify-center overflow-hidden cursor-pointer"
                            onClick={() => openProfile(post.user.username)}
                        >
                            {post.user.avatarUrl ? (
                                <Image src={post.user.avatarUrl} alt={post.user.fullName} width={56} height={56} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-black text-2xl text-neo-black">{post.user.fullName[0]}</span>
                            )}
                        </div>
                        <div>
                            <div className="flex flex-col">
                                <h3
                                    className="font-black text-neo-black uppercase text-lg leading-none hover:underline cursor-pointer"
                                    onClick={() => openProfile(post.user.username)}
                                >
                                    {post.user.fullName}
                                </h3>
                                <span className="text-xs font-bold bg-neo-black text-white px-1 w-fit mt-1">@{post.user.username}</span>
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: idLocale })}
                            </p>
                        </div>
                    </div>
                    {currentUserId === post.user.id && (
                        <button onClick={handleDelete} className="text-gray-400 hover:text-neo-pink transition-colors">
                            <Trash2 size={24} strokeWidth={3} />
                        </button>
                    )}
                </div>

                <div className="text-neo-black font-bold text-lg mb-6 leading-relaxed whitespace-pre-wrap break-words border-l-4 border-gray-200 pl-4">
                    {renderContent(post.content)}
                </div>

                <div className="flex items-center gap-6 border-t-4 border-neo-black pt-4">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 font-black uppercase transition-colors group ${isLiked ? 'text-neo-pink' : 'text-gray-500 hover:text-neo-black'}`}
                    >
                        <Heart size={24} strokeWidth={3} fill={isLiked ? "currentColor" : "none"} className={`group-active:scale-90 transition-transform ${isLiked ? 'animate-pulse_once' : ''}`} />
                        <span>{likeCount}</span>
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-2 font-black uppercase text-gray-500 hover:text-neo-blue transition-colors group"
                    >
                        <MessageCircle size={24} strokeWidth={3} className="group-active:scale-90 transition-transform" />
                        <span>{commentCount}</span>
                    </button>
                </div>

                {showComments && (
                    <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-300">
                        <CommentSection
                            postId={post.id}
                            currentUserId={currentUserId}
                            onCommentAdded={() => setCommentCount(prev => prev + 1)}
                        />
                    </div>
                )}
            </div>

            <UserPreviewModal
                username={previewUsername}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};
