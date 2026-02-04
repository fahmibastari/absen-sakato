import React, { useEffect, useState } from 'react';
import { User, X, Loader2 } from 'lucide-react';

interface UserPreviewModalProps {
    username: string | null;
    isOpen: boolean;
    onClose: () => void;
}

interface UserProfile {
    id: string;
    fullName: string;
    username: string;
    bio: string | null;
    avatarUrl: string | null;
    _count: {
        posts: number;
    };
    createdAt?: string; // If available
}

export const UserPreviewModal: React.FC<UserPreviewModalProps> = ({ username, isOpen, onClose }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && username) {
            setLoading(true);
            fetch(`/api/users/${username}`)
                .then(res => {
                    if (!res.ok) throw new Error("Failed");
                    return res.json();
                })
                .then(data => {
                    setUser(data);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        } else {
            setUser(null);
        }
    }, [isOpen, username]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neo-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border-4 border-neo-black shadow-[8px_8px_0px_#E4FF00] w-full max-w-sm relative overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header Pattern */}
                <div className="h-24 bg-neo-white bg-dots border-b-4 border-neo-black relative">
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 bg-neo-red text-white p-1 border-2 border-neo-black hover:bg-red-600 transition-colors z-10"
                    >
                        <X size={24} strokeWidth={3} />
                    </button>
                </div>

                {loading ? (
                    <div className="h-48 flex items-center justify-center">
                        <Loader2 className="animate-spin text-neo-black" size={48} strokeWidth={3} />
                    </div>
                ) : user ? (
                    <div className="flex flex-col relative">
                        <div className="px-6 pb-6 pt-0">
                            {/* Avatar - Negative Margin to overlap header */}
                            <div className="-mt-12 mb-4 w-24 h-24 bg-white border-4 border-neo-black flex items-center justify-center overflow-hidden shadow-sm relative z-10">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                                ) : (
                                    <User className="text-neo-black" size={40} />
                                )}
                            </div>

                            {/* Info */}
                            <div className="mb-4">
                                <h3 className="text-2xl font-black text-neo-black leading-none uppercase mb-1">{user.fullName}</h3>
                                <div className="inline-block bg-neo-black text-white px-2 py-0.5 text-sm font-bold skew-x-[-10deg]">@{user.username}</div>
                            </div>

                            {user.bio && (
                                <div className="bg-gray-50 border-2 border-neo-black p-3 mb-6 font-bold text-gray-800 text-sm leading-relaxed shadow-[4px_4px_0px_#000]">
                                    "{user.bio}"
                                </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-neo-blue border-2 border-neo-black p-2 text-center text-white shadow-neo-sm">
                                    <span className="block text-2xl font-black">{user._count.posts}</span>
                                    <span className="text-xs font-bold uppercase">Posts</span>
                                </div>
                                <div className="bg-neo-green border-2 border-neo-black p-2 text-center text-neo-black shadow-neo-sm">
                                    <span className="block text-2xl font-black">{new Date(user.createdAt || Date.now()).getFullYear()}</span>
                                    <span className="text-xs font-bold uppercase">Member Since</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-48 flex items-center justify-center text-gray-500 font-bold uppercase">
                        User not found
                    </div>
                )}
            </div>
            {/* Overlay click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose}></div>
        </div>
    );
};
