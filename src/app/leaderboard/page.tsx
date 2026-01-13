'use client';

import { useEffect, useState } from 'react';
import { Award, Clock, Trophy, Medal } from 'lucide-react';

type LeaderboardItem = {
    userId: string;
    fullName: string;
    username: string;
    total: number;
    avatarUrl?: string;
};

export default function LeaderboardPage() {
    const [leaders, setLeaders] = useState<LeaderboardItem[]>([]);

    useEffect(() => {
        fetch('/api/attendance/leaderboard')
            .then(res => res.json())
            .then(setLeaders);
    }, []);

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    }

    const top3 = leaders.slice(0, 3);
    const rest = leaders.slice(3);

    return (
        <div className="min-h-screen bg-gradient-to-br from-brown-50 via-white to-mustard-50 pb-24 md:pl-72 pt-8 px-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-brown-900 mb-1">Leaderboard</h1>
                <p className="text-brown-600">Top performers this week</p>
            </div>

            {/* Podium Visual - Top 3 */}
            {top3.length > 0 && (
                <div className="mb-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-end justify-center gap-4 mb-8">
                            {/* 2nd Place */}
                            {top3[1] && (
                                <div className="flex-1 max-w-xs">
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
                                <div className="flex-1 max-w-xs -mt-8">
                                    <div className="bg-gradient-to-br from-mustard-500 to-mustard-600 rounded-2xl border-2 border-mustard-400 p-8 text-center shadow-2xl transform hover:scale-105 transition-transform">
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
                                <div className="flex-1 max-w-xs">
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

            {/* Rest of Rankings  */}
            {rest.length > 0 && (
                <div className="bg-white rounded-2xl border border-brown-100 shadow-lg p-6">
                    <h2 className="text-xl font-bold text-brown-900 mb-6">Other Rankings</h2>
                    <div className="space-y-3">
                        {rest.map((leader, index) => {
                            const rank = index + 4;
                            return (
                                <div key={leader.userId} className="flex items-center justify-between p-4 bg-brown-50 rounded-xl hover:bg-brown-100 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-white border border-brown-200 flex items-center justify-center font-bold text-brown-700 shadow-sm">
                                            {rank}
                                        </div>
                                        <div className="w-12 h-12 rounded-full border-2 border-brown-300 bg-brown-100 flex items-center justify-center overflow-hidden">
                                            {leader.avatarUrl ? (
                                                <img src={leader.avatarUrl} alt={leader.fullName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-lg text-brown-700">{leader.fullName[0]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-brown-900">{leader.fullName}</h3>
                                            <p className="text-xs text-brown-600">@{leader.username}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-brown-600">
                                        <Clock size={16} />
                                        <span className="font-mono font-bold">{formatDuration(leader.total)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {leaders.length === 0 && (
                <div className="text-center py-16 text-brown-500">
                    <Trophy className="mx-auto mb-4 opacity-50" size={64} />
                    <p className="text-lg">No leaderboard data yet</p>
                    <p className="text-sm mt-1">Be the first to check in this week!</p>
                </div>
            )}
        </div>
    );
}
