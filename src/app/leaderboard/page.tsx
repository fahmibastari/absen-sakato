'use client';

import { useEffect, useState } from 'react';
import { Award, Clock, Trophy, Medal, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { id } from 'date-fns/locale';

type LeaderboardItem = {
    userId: string;
    fullName: string;
    username: string;
    total: number;
    avatarUrl?: string;
};

export default function LeaderboardPage() {
    const [data, setData] = useState<{ users: LeaderboardItem[], admins: LeaderboardItem[] }>({ users: [], admins: [] });
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const dateStr = currentDate.toISOString();
        fetch(`/api/attendance/leaderboard?date=${dateStr}`)
            .then(res => res.json())
            .then(setData);
    }, [currentDate]);

    const handlePrevWeek = () => setCurrentDate(prev => subWeeks(prev, 1));
    const handleNextWeek = () => setCurrentDate(prev => addWeeks(prev, 1));

    const isCurrentWeek = new Date().toDateString() === currentDate.toDateString() || currentDate > new Date();

    // Calculate display range
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    const dateRange = `${format(start, 'd MMM', { locale: id })} - ${format(end, 'd MMM yyyy', { locale: id })}`;

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h} J ${m} M`;
    }

    const top3 = data.users.slice(0, 3);
    const rest = data.users.slice(3);
    const admins = data.admins;

    return (
        <div className="min-h-screen bg-gradient-to-br from-brown-50 via-white to-mustard-50 pb-24 md:pl-72 pt-8 px-6">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-brown-900 mb-1">Leaderboard</h1>
                    <p className="text-brown-600">Keliatan banget gapunya rumahnya tuh</p>
                </div>

                {/* Week Navigation */}
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-brown-200 shadow-sm">
                    <button
                        onClick={handlePrevWeek}
                        className="p-2 hover:bg-brown-50 rounded-lg text-brown-600 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 px-2 text-sm font-semibold text-brown-800 min-w-[140px] justify-center">
                        <Calendar size={16} className="text-mustard-600" />
                        {dateRange}
                    </div>
                    <button
                        onClick={handleNextWeek}
                        disabled={isCurrentWeek} // Logic: can't go to future weeks if we assume date resets to "now"
                        className={`p-2 rounded-lg transition-colors ${isCurrentWeek ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-brown-50 text-brown-600'}`}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Podium Visual - Top 3 */}
            {top3.length > 0 && (
                <div className="mb-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row items-end justify-center gap-4 mb-8">
                            {/* 2nd Place - Order 2 on mobile, 1 on desktop (via flex order or structure) */}
                            {/* Actually simpler to keeping DOM order: 2, 1, 3 for Flex Row. For Mobile Col, we want 1, 2, 3? Or just stack. */}
                            {/* Let's use simple flex-col-reverse on mobile for 2-1-3 layout or just stack normally? */}
                            {/* Standard Podium: 2 - 1 - 3 */}

                            {/* On Mobile: Stack them. 1st should be top. */}
                            {/* We can use Grid for absolute control or Flex with Order. */}

                            {/* 2nd Place */}
                            {top3[1] && (
                                <div className="order-2 md:order-1 flex-1 w-full md:max-w-xs">
                                    <div className="bg-white rounded-2xl border-2 border-gray-300 p-6 text-center shadow-lg transform hover:scale-105 transition-transform">
                                        <div className="w-20 h-20 mx-auto mb-3 rounded-full border-4 border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {top3[1].avatarUrl ? (
                                                <img src={top3[1].avatarUrl} alt={top3[1].fullName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-2xl text-gray-600">{top3[1].fullName[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <Medal className="text-gray-400" size={20} />
                                            <span className="text-3xl font-bold text-gray-600">2</span>
                                        </div>
                                        <h3 className="font-bold text-lg text-brown-900 mb-1">{top3[1].fullName}</h3>
                                        <p className="text-xs text-brown-600 mb-3">@{top3[1].username}</p>
                                        <div className="text-xl font-bold text-gray-600">{formatDuration(top3[1].total)}</div>
                                    </div>
                                </div>
                            )}

                            {/* 1st Place - Higher */}
                            {top3[0] && (
                                <div className="order-1 md:order-2 flex-1 w-full md:max-w-xs md:-mt-12 z-10">
                                    <div className="bg-gradient-to-br from-mustard-500 to-mustard-600 rounded-2xl border-4 border-mustard-400 p-8 text-center shadow-2xl transform hover:scale-105 transition-transform relative">
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-mustard-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                                            CHAMPION
                                        </div>
                                        <div className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-white bg-white flex items-center justify-center overflow-hidden shadow-lg">
                                            {top3[0].avatarUrl ? (
                                                <img src={top3[0].avatarUrl} alt={top3[0].fullName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-3xl text-mustard-600">{top3[0].fullName[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-center gap-2 mb-3">
                                            <Trophy className="text-white" size={24} />
                                            <span className="text-4xl font-bold text-white">1</span>
                                        </div>
                                        <h3 className="font-bold text-xl text-white mb-1">{top3[0].fullName}</h3>
                                        <p className="text-xs text-mustard-100 mb-4">@{top3[0].username}</p>
                                        <div className="text-2xl font-bold text-white">{formatDuration(top3[0].total)}</div>
                                    </div>
                                </div>
                            )}

                            {/* 3rd Place */}
                            {top3[2] && (
                                <div className="order-3 md:order-3 flex-1 w-full md:max-w-xs">
                                    <div className="bg-white rounded-2xl border-2 border-orange-300 p-6 text-center shadow-lg transform hover:scale-105 transition-transform">
                                        <div className="w-20 h-20 mx-auto mb-3 rounded-full border-4 border-orange-300 bg-orange-100 flex items-center justify-center overflow-hidden">
                                            {top3[2].avatarUrl ? (
                                                <img src={top3[2].avatarUrl} alt={top3[2].fullName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-2xl text-orange-600">{top3[2].fullName[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <Award className="text-orange-500" size={20} />
                                            <span className="text-3xl font-bold text-orange-600">3</span>
                                        </div>
                                        <h3 className="font-bold text-lg text-brown-900 mb-1">{top3[2].fullName}</h3>
                                        <p className="text-xs text-brown-600 mb-3">@{top3[2].username}</p>
                                        <div className="text-xl font-bold text-orange-600">{formatDuration(top3[2].total)}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {rest.length > 0 && (
                <div className="bg-white rounded-2xl border border-brown-100 shadow-lg p-5 mb-8">
                    <h2 className="text-lg font-bold text-brown-900 mb-4 px-1">Other Rankings</h2>
                    <div className="space-y-2">
                        {rest.map((leader, index) => {
                            const rank = index + 4;
                            return (
                                <div key={leader.userId} className="flex items-center p-3 bg-brown-50/50 rounded-xl hover:bg-brown-50 transition-colors border border-transparent hover:border-brown-100">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {/* Rank */}
                                        <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-white border border-brown-200 flex items-center justify-center font-bold text-sm text-brown-700 shadow-sm">
                                            {rank}
                                        </div>

                                        {/* Avatar */}
                                        <div className="w-10 h-10 flex-shrink-0 rounded-full border-2 border-brown-200 bg-brown-100 flex items-center justify-center overflow-hidden">
                                            {leader.avatarUrl ? (
                                                <img src={leader.avatarUrl} alt={leader.fullName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-sm text-brown-700">{leader.fullName[0]}</span>
                                            )}
                                        </div>

                                        {/* Name */}
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-sm text-brown-900 truncate pr-2">{leader.fullName}</h3>
                                            <p className="text-[10px] text-brown-500 truncate">@{leader.username}</p>
                                        </div>
                                    </div>

                                    {/* Duration */}
                                    <div className="flex items-center gap-1.5 text-brown-600 pl-2">
                                        <Clock size={14} className="opacity-70" />
                                        <span className="font-mono font-bold text-sm">{formatDuration(leader.total)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Admin Section (Excluded from leaderboard) */}
            {admins.length > 0 && (
                <div className="bg-brown-900 rounded-2xl shadow-lg p-6 text-brown-100">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Award className="text-mustard-500" />
                        Admin Activity
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {admins.map((admin) => (
                            <div key={admin.userId} className="flex items-center justify-between p-4 bg-brown-800 rounded-xl border border-brown-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full border-2 border-mustard-500 bg-brown-700 flex items-center justify-center overflow-hidden">
                                        {admin.avatarUrl ? (
                                            <img src={admin.avatarUrl} alt="Admin" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-mustard-500">A</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{admin.fullName}</h3>
                                        <span className="px-2 py-0.5 rounded text-[10px] bg-mustard-500 text-brown-900 font-bold uppercase tracking-wider">
                                            ADMIN
                                        </span>
                                    </div>
                                </div>
                                <div className="font-mono font-bold text-mustard-400">
                                    {formatDuration(admin.total)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {data.users.length === 0 && (
                <div className="text-center py-16 text-brown-500">
                    <Trophy className="mx-auto mb-4 opacity-50" size={64} />
                    <p className="text-lg">No leaderboard data yet</p>
                    <p className="text-sm mt-1">Be the first to check in this week!</p>
                </div>
            )}
        </div>
    );
}
