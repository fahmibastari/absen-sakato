import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Loader2, AlertCircle, Megaphone, PenTool } from 'lucide-react';
import MentionsInput from './MentionsInput';

interface CreatePostFormProps {
    onPostCreated: () => void;
    defaultType?: 'POST' | 'ANNOUNCEMENT';
}

export default function CreatePostForm({ onPostCreated, defaultType = 'POST' }: CreatePostFormProps) {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [type, setType] = useState<'POST' | 'ANNOUNCEMENT'>(defaultType);
    const [isAdmin, setIsAdmin] = useState(false);

    // Check admin status on mount
    useState(() => {
        const checkAdmin = async () => {
            const role = localStorage.getItem('user_role');
            setIsAdmin(role === 'ADMIN');
        };
        checkAdmin();
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch('/api/timeline', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ content, type })
            });

            if (res.ok) {
                setContent('');
                onPostCreated();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white border-4 border-neo-black p-4 md:p-6 shadow-neo mb-8 relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 p-2 bg-neo-black text-white pointer-events-none">
                <PenTool size={20} />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-neo-black font-black uppercase text-sm mb-2">
                        {type === 'ANNOUNCEMENT' ? 'Broadcast Announcement' : 'Share something'}
                    </label>
                    <MentionsInput
                        value={content}
                        onChange={setContent}
                        placeholder={type === 'ANNOUNCEMENT' ? "IMPORTANT: ..." : "What's on your mind? (@ to tag)"}
                        className="w-full h-32 p-4 border-4 border-neo-black font-bold text-lg focus:outline-none focus:ring-4 focus:ring-neo-yellow focus:border-neo-black resize-none placeholder-gray-400 bg-gray-50"
                    />
                </div>

                <div className="flex justify-between items-center">
                    {isAdmin ? (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setType('POST')}
                                className={`px-3 py-1 text-xs font-black uppercase border-2 border-neo-black transition-all ${type === 'POST' ? 'bg-neo-black text-white' : 'bg-white text-gray-400 hover:text-neo-black'}`}
                            >
                                Regular
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('ANNOUNCEMENT')}
                                className={`px-3 py-1 text-xs font-black uppercase border-2 border-neo-black transition-all ${type === 'ANNOUNCEMENT' ? 'bg-neo-pink text-white' : 'bg-white text-gray-400 hover:text-neo-pink'}`}
                            >
                                Announcement
                            </button>
                        </div>
                    ) : <div></div>}

                    <button
                        type="submit"
                        disabled={isSubmitting || !content.trim()}
                        className="bg-neo-yellow text-neo-black border-4 border-neo-black px-6 py-2 font-black uppercase flex items-center gap-2 hover:bg-neo-black hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <Send size={20} strokeWidth={3} />
                                <span>POST</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
