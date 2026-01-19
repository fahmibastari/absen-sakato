import { useState } from "react";
import { UserPreviewModal } from "@/components/timeline/UserPreviewModal";

interface LiveUser {
    id: string;
    username?: string;
    fullName: string;
    avatarUrl?: string;
    checkInTime: string; // ISO
}

export function LiveSessionList({ users }: { users: LiveUser[] }) {
    const [previewUsername, setPreviewUsername] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleUserClick = (username?: string) => {
        if (username) {
            setPreviewUsername(username);
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <div className="w-full max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {users.length === 0 && (
                        <div className="col-span-full text-coffee-500 italic w-full text-center py-4">
                            Belum ada yang nongkrong... jadilah yang pertama!
                        </div>
                    )}
                    {users.map(u => (
                        <div
                            key={u.id}
                            onClick={() => handleUserClick(u.username)}
                            className="flex flex-col items-center gap-2 animate-fadeIn p-4 bg-brown-50 rounded-xl hover:shadow-md transition-all cursor-pointer hover:bg-brown-100 active:scale-95"
                        >
                            <div className="w-16 h-16 rounded-full border-2 border-green-500 p-1 relative">
                                <img src={u.avatarUrl || '/icons/icon-192x192.png'} className="w-full h-full rounded-full object-cover bg-brown-200" />
                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border border-white animate-pulse"></div>
                            </div>
                            <div className="text-center w-full">
                                <p className="text-sm font-bold text-brown-900 truncate w-full">{u.fullName}</p>
                                <p className="text-xs text-brown-500">Since {new Date(u.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <UserPreviewModal
                username={previewUsername}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    )
}
