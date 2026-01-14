'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CreatePostForm({ onPostCreated }: { onPostCreated: () => void }) {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

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
                body: JSON.stringify({ content })
            });

            if (res.ok) {
                setContent('');
                onPostCreated(); // Trigger refresh
            } else {
                console.error("Failed to post");
                alert("Failed to post update. Please try again.");
            }
        } catch (error) {
            console.error("Error posting:", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card className="mb-8">
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Hayo mau ngomong apa?"
                        className="w-full bg-white/50 border border-brown-200 rounded-xl p-3 md:p-4 pr-12 text-brown-900 placeholder:text-brown-400 focus:outline-none focus:ring-2 focus:ring-mustard-500 min-h-[80px] md:min-h-[100px] resize-none transition-all text-sm md:text-base"
                        maxLength={280}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <span className={`text-xs ${content.length > 250 ? 'text-red-500' : 'text-brown-400'}`}>
                            {content.length}/280
                        </span>
                        <button
                            type="submit"
                            disabled={!content.trim() || isSubmitting}
                            className="bg-mustard-600 hover:bg-mustard-700 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </div>
            </form>
        </Card>
    );
}
