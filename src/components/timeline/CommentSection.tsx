import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Loader2, Send, Trash2, User } from 'lucide-react';
import Image from 'next/image';
import MentionsInput from './MentionsInput';
import { UserPreviewModal } from './UserPreviewModal';

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
}

interface CommentSectionProps {
    postId: string;
    currentUserId: string | null;
    onCommentAdded: () => void;
}

export default function CommentSection({ postId, currentUserId, onCommentAdded }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal State
    const [previewUsername, setPreviewUsername] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openProfile = (username: string) => {
        setPreviewUsername(username);
        setIsModalOpen(true);
    };

    const fetchComments = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`/api/timeline/${postId}/comments`, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            });
            if (res.ok) {
                setComments(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`/api/timeline/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ content: newComment })
            });

            if (res.ok) {
                setNewComment('');
                onCommentAdded();
                fetchComments();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm('Hapus komentar ini?')) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            await fetch(`/api/timeline/${postId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${session?.access_token}` }
            });
            setComments(comments.filter(c => c.id !== commentId));
        } catch (e) {
            alert('Gagal menghapus komentar');
        }
    };

    // Render mentions logic
    const renderContent = (text: string) => {
        const parts = text.split(/(@\w+)/g);
        return parts.map((part, index) => {
            if (part.match(/^@\w+$/)) {
                const username = part.substring(1);
                return (
                    <span
                        key={index}
                        onClick={(e) => { e.stopPropagation(); openProfile(username); }}
                        className="text-neo-blue font-black cursor-pointer hover:underline bg-neo-blue/10 px-1 rounded-sm"
                    >
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <div className="space-y-6">
            <h4 className="font-black text-neo-black uppercase text-sm border-b-2 border-neo-black pb-2">
                Discussion ({comments.length})
            </h4>

            {isLoading ? (
                <div className="flex justify-center p-4">
                    <Loader2 className="animate-spin text-neo-black" size={24} />
                </div>
            ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex gap-3 items-start group">
                            <div
                                className="w-8 h-8 bg-gray-100 border-2 border-neo-black flex-shrink-0 flex items-center justify-center overflow-hidden cursor-pointer"
                                onClick={() => openProfile(comment.user.username)}
                            >
                                {comment.user.avatarUrl ? (
                                    <Image src={comment.user.avatarUrl} alt={comment.user.fullName} width={32} height={32} className="object-cover w-full h-full" />
                                ) : (
                                    <span className="font-bold text-xs text-neo-black">{comment.user.fullName[0]}</span>
                                )}
                            </div>
                            <div className="flex-1 bg-gray-50 border-2 border-transparent group-hover:border-gray-200 p-2 rounded transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-baseline gap-2">
                                        <span
                                            className="font-black text-sm text-neo-black uppercase cursor-pointer hover:underline"
                                            onClick={() => openProfile(comment.user.username)}
                                        >
                                            {comment.user.fullName}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: idLocale })}
                                        </span>
                                    </div>
                                    {currentUserId === comment.user.id && (
                                        <button onClick={() => handleDelete(comment.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm font-bold text-gray-700 mt-1 leading-relaxed whitespace-pre-wrap break-words">
                                    {renderContent(comment.content)}
                                </p>
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && (
                        <p className="text-center text-gray-400 font-bold uppercase text-xs">No comments yet.</p>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                <MentionsInput
                    value={newComment}
                    onChange={setNewComment}
                    placeholder="Write a comment... (@ to tag)"
                    disabled={isSubmitting}
                    className="w-full resize-none p-2 border-2 border-neo-black font-bold focus:ring-2 focus:ring-neo-yellow focus:outline-none min-h-[44px] max-h-[100px]"
                />
                <button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                    className="bg-neo-black text-white px-4 h-[44px] flex items-center justify-center border-2 border-neo-black hover:bg-neo-yellow hover:text-neo-black transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} strokeWidth={3} />}
                </button>
            </form>

            <UserPreviewModal
                username={previewUsername}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
