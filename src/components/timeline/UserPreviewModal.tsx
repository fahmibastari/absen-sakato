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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl w-full max-w-sm shadow-xl border border-white/50 relative overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/10 transition-colors z-10 text-brown-500"
                >
                    <X size={20} />
                </button>

                {loading ? (
                    <div className="h-48 flex items-center justify-center">
                        <Loader2 className="animate-spin text-mustard-600" size={32} />
                    </div>
                ) : user ? (
                    <div className="flex flex-col">
                        {/* Header / Banner area (could be a color or image) */}
                        <div className="h-24 bg-gradient-to-r from-mustard-200 to-orange-100"></div>

                        <div className="px-6 pb-6 -mt-10">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-white flex items-center justify-center overflow-hidden mb-3">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="text-mustard-600" size={40} />
                                )}
                            </div>

                            {/* Info */}
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-brown-900 leading-tight">{user.fullName}</h3>
                                <p className="text-brown-500 font-medium">@{user.username}</p>
                            </div>

                            {user.bio && (
                                <p className="text-brown-700 text-sm mb-4 leading-relaxed">
                                    {user.bio}
                                </p>
                            )}

                            {/* Stats */}
                            <div className="flex items-center gap-6 text-sm text-brown-600">
                                <div className="flex gap-1">
                                    <span className="font-bold text-brown-900">{user._count.posts}</span>
                                    <span>Posts</span>
                                </div>
                                {/* Add more stats here if needed */}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-48 flex items-center justify-center text-brown-500">
                        User not found
                    </div>
                )}
            </div>
            {/* Overlay click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose}></div>
        </div>
    );
};
