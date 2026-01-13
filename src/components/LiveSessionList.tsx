import { useRef } from "react";
import { Card } from "@/components/ui/Card";

interface LiveUser {
    id: string;
    fullName: string;
    avatarUrl?: string;
    checkInTime: string; // ISO
}

export function LiveSessionList({ users }: { users: LiveUser[] }) {
    return (
        <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex gap-4">
                {users.length === 0 && (
                    <div className="text-coffee-500 italic w-full text-center py-4">
                        Belum ada yang nongkrong... jadilah yang pertama!
                    </div>
                )}
                {users.map(u => (
                    <div key={u.id} className="min-w-[120px] flex flex-col items-center gap-2 animate-float" style={{ animationDelay: `${Math.random()}s` }}>
                        <div className="w-16 h-16 rounded-full border-2 border-green-500 p-1 relative">
                            <img src={u.avatarUrl || '/icons/icon-192x192.png'} className="w-full h-full rounded-full object-cover bg-coffee-800" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border border-black"></div>
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-bold text-coffee-100 truncate w-24">{u.fullName}</p>
                            <p className="text-[10px] text-coffee-400">Since {new Date(u.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
