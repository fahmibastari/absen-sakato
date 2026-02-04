import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { User, Coffee } from 'lucide-react';
import Image from 'next/image';

interface LiveUser {
    id: string;
    username?: string;
    fullName: string;
    avatarUrl?: string;
    checkInTime: string; // ISO
}

export function LiveSessionList({ users }: { users: LiveUser[] }) {
    if (users.length === 0) {
        return (
            <div className="text-center py-12 bg-neo-blue border-4 border-neo-black shadow-neo relative overflow-hidden">
                <div className="relative z-10">
                    <Coffee className="mx-auto mb-4 text-white drop-shadow-md" size={64} strokeWidth={3} />
                    <p className="font-black text-white uppercase text-3xl mb-2 tracking-tighter drop-shadow-sm">ZONE EMPTY</p>
                    <p className="text-sm font-bold text-neo-black uppercase bg-white inline-block px-3 py-1 border-2 border-neo-black transform -rotate-1 shadow-sm">
                        No skilled personnel on site
                    </p>
                </div>
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
                <div key={user.id} className="relative bg-neo-yellow border-4 border-neo-black p-4 shadow-neo hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-neo-lg transition-all group z-10">
                    {/* Status Indicator */}
                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                        <span className="w-4 h-4 bg-neo-green border-2 border-black animate-pulse shadow-sm"></span>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-16 h-16 border-4 border-neo-black bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm relative">
                            {user.avatarUrl ? (
                                <Image src={user.avatarUrl} alt={user.fullName} width={64} height={64} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all" />
                            ) : (
                                <User size={32} className="text-neo-black" strokeWidth={2} />
                            )}
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                            <h4 className="font-black text-neo-black uppercase truncate text-lg leading-none mb-1">{user.fullName}</h4>
                            <div className="inline-block bg-neo-black text-white text-xs font-bold px-1 py-0.5 truncate max-w-full">
                                @{user.username || 'user'}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-2 border-neo-black p-2 font-mono text-xs font-bold flex justify-between items-center uppercase shadow-sm">
                        <span className="text-gray-500">Check In:</span>
                        <span className="text-neo-black text-sm bg-neo-green px-1 border border-black">{formatDistanceToNow(new Date(user.checkInTime), { addSuffix: true, locale: id })}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
