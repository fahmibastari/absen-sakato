'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Send, Loader2, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface SearchUser {
    id: string;
    fullName: string;
    username: string;
    avatarUrl: string | null;
}

export default function CreatePostForm({ onPostCreated, defaultType = 'POST' }: { onPostCreated: () => void, defaultType?: 'POST' | 'ANNOUNCEMENT' }) {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [postType, setPostType] = useState<'POST' | 'ANNOUNCEMENT'>(defaultType);

    useEffect(() => {
        setPostType(defaultType);
    }, [defaultType]);

    // Mention State
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionResults, setMentionResults] = useState<SearchUser[]>([]);
    const [cursorPosition, setCursorPosition] = useState(0);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (showMentions && mentionQuery) {
            const timeoutId = setTimeout(async () => {
                try {
                    const res = await fetch(`/api/users/search?q=${mentionQuery}`);
                    if (res.ok) {
                        const data = await res.json();
                        setMentionResults(data);
                    }
                } catch (error) {
                    console.error("Search failed", error);
                }
            }, 300); // Debounce
            return () => clearTimeout(timeoutId);
        } else {
            setMentionResults([]);
        }
    }, [showMentions, mentionQuery]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        const newCursorPos = e.target.selectionStart;
        setContent(text);
        setCursorPosition(newCursorPos);

        // Detect mention trigger
        const textBeforeCursor = text.slice(0, newCursorPos);
        const lastAtPos = textBeforeCursor.lastIndexOf('@');

        if (lastAtPos !== -1) {
            const textAfterAt = textBeforeCursor.slice(lastAtPos + 1);
            // Check if there are spaces, meaning we might have moved past a username
            if (!textAfterAt.includes(' ')) {
                setShowMentions(true);
                setMentionQuery(textAfterAt);
                return;
            }
        }
        setShowMentions(false);
    };

    const selectMention = (user: SearchUser) => {
        const textBeforeCursor = content.slice(0, cursorPosition);
        const lastAtPos = textBeforeCursor.lastIndexOf('@');
        const textAfterCursor = content.slice(cursorPosition);

        const newContent = content.slice(0, lastAtPos) + `@${user.username} ` + textAfterCursor;

        setContent(newContent);
        setShowMentions(false);
        setMentionResults([]);

        // Refocus and set cursor
        if (textareaRef.current) {
            textareaRef.current.focus();
            // We can try to set cursor position but it's tricky with React state updates sometimes
        }
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                alert("Please login first");
                router.push('/login');
                return;
            }

            const res = await fetch('/api/timeline', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ content, type: postType })
            });

            if (res.ok) {
                setContent('');
                onPostCreated(); // Trigger refresh
            } else {
                console.error("Failed to post");
                const data = await res.json();
                alert(data.error || "Failed to post update. Please try again.");
            }
        } catch (error) {
            console.error("Error posting:", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card className="mb-6 overflow-visible z-20 relative border-none shadow-sm ring-1 ring-gray-100">
            <form onSubmit={handleSubmit}>
                <div className="relative p-1">
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={handleContentChange}
                        placeholder={postType === 'ANNOUNCEMENT' ? "Tulis pengumuman penting..." : "Hayo mau ngomong apa?"}
                        className="w-full bg-transparent p-3 md:p-4 pr-12 text-brown-900 placeholder:text-brown-400 focus:outline-none min-h-[80px] md:min-h-[100px] resize-none transition-all text-sm md:text-base block"
                        maxLength={280}
                    />

                    {/* Mention Dropdown */}
                    {showMentions && mentionResults.length > 0 && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-2 border-b border-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Suggestions
                            </div>
                            {mentionResults.map(user => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => selectMention(user)}
                                    className="w-full text-left p-3 hover:bg-gray-50 transition-colors flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                <User size={14} className="text-gray-500" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{user.fullName}</p>
                                        <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between px-2 pb-2 mt-2">
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${postType === 'ANNOUNCEMENT' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                {postType === 'ANNOUNCEMENT' ? 'Pengumuman' : 'Timeline'}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={`text-xs ${content.length > 250 ? 'text-red-500' : 'text-gray-300'}`}>
                                {content.length}/280
                            </span>
                            <button
                                type="submit"
                                disabled={!content.trim() || isSubmitting}
                                className="bg-brown-900 hover:bg-brown-800 text-white px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
                            >
                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Posting'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </Card>
    );
}
