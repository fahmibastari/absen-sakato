'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Award, Clock, Trophy, Medal, ChevronLeft, ChevronRight, Calendar, Crown } from 'lucide-react';
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

    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    const dateRange = `${format(start, 'd MMM', { locale: id })} - ${format(end, 'd MMM yyyy', { locale: id })}`;

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}H ${m}M`;
    }

    const top3 = data.users.slice(0, 3);
    const rest = data.users.slice(3);
    const admins = data.admins;

    return (
        <div className="min-h-screen bg-neo-white bg-dots pb-24 md:pl-72 pt-8 px-6 font-sans">
            {/* Header */}
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-neo-black pb-8">
                <div>
                    <h1 className="text-5xl font-black text-neo-black mb-1 uppercase tracking-tighter">Leaderboard</h1>
                    <p className="text-xl font-bold text-gray-600 uppercase bg-neo-yellow inline-block px-2 transform -rotate-1">Ga punya rumah tuh</p>
                </div>

                {/* Week Navigation */}
                <div className="flex items-center bg-white border-4 border-neo-black shadow-neo transform rotate-1">
                    <button
                        onClick={handlePrevWeek}
                        className="p-3 hover:bg-neo-black hover:text-white transition-colors border-r-4 border-neo-black"
                    >
                        <ChevronLeft size={24} strokeWidth={3} />
                    </button>
                    <div className="flex items-center gap-2 px-6 text-sm font-black uppercase text-neo-black min-w-[200px] justify-center">
                        <Calendar size={20} strokeWidth={3} />
                        {dateRange}
                    </div>
                    <button
                        onClick={handleNextWeek}
                        disabled={isCurrentWeek}
                        className={`p-3 transition-colors ${isCurrentWeek ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-neo-black hover:text-white'}`}
                    >
                        <ChevronRight size={24} strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* Podium Visual - Top 3 */}
            {top3.length > 0 && (
                <div className="mb-16">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8">

                            {/* 2nd Place */}
                            {top3[1] && (
                                <div className="order-2 md:order-1 flex-1 w-full md:max-w-xs">
                                    <div className="bg-white border-4 border-neo-black p-6 text-center shadow-neo hover:translate-y-[-4px] transition-transform relative">
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-neo-blue text-white px-3 py-1 font-black border-2 border-neo-black text-sm uppercase">Rank 2</div>
                                        <div className="w-20 h-20 mx-auto mb-4 border-4 border-neo-black bg-gray-200 overflow-hidden">
                                            {top3[1].avatarUrl ? (
                                                <Image src={top3[1].avatarUrl} alt={top3[1].fullName} width={80} height={80} className="object-cover w-full h-full grayscale hover:grayscale-0" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-black text-2xl">2</div>
                                            )}
                                        </div>
                                        <h3 className="font-black text-lg text-neo-black mb-1 uppercase truncate">{top3[1].fullName}</h3>
                                        <div className="text-xl font-black bg-neo-black text-white inline-block px-2">{formatDuration(top3[1].total)}</div>
                                    </div>
                                </div>
                            )}

                            {/* 1st Place */}
                            {top3[0] && (
                                <div className="order-1 md:order-2 flex-1 w-full md:max-w-xs md:-mt-12 z-10">
                                    <div className="bg-neo-yellow border-4 border-neo-black p-8 text-center shadow-[12px_12px_0px_#000] transform hover:scale-105 transition-transform relative">
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                                            <Crown size={48} strokeWidth={3} className="text-neo-black fill-white animate-bounce" />
                                        </div>
                                        <div className="w-24 h-24 mx-auto mb-4 border-4 border-neo-black bg-white overflow-hidden shadow-sm">
                                            {top3[0].avatarUrl ? (
                                                <Image src={top3[0].avatarUrl} alt={top3[0].fullName} width={96} height={96} className="object-cover w-full h-full" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-black text-4xl">1</div>
                                            )}
                                        </div>
                                        <div className="bg-neo-black text-white px-4 py-1 mb-2 inline-block font-black text-sm uppercase transform rotate-2">CHAMPION</div>
                                        <h3 className="font-black text-2xl text-neo-black mb-1 uppercase leading-none">{top3[0].fullName}</h3>
                                        <div className="text-3xl font-black text-neo-black mt-2 underline decoration-4 underline-offset-4">{formatDuration(top3[0].total)}</div>
                                    </div>
                                </div>
                            )}

                            {/* 3rd Place */}
                            {top3[2] && (
                                <div className="order-3 md:order-3 flex-1 w-full md:max-w-xs">
                                    <div className="bg-white border-4 border-neo-black p-6 text-center shadow-neo hover:translate-y-[-4px] transition-transform relative">
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-neo-pink text-white px-3 py-1 font-black border-2 border-neo-black text-sm uppercase">Rank 3</div>
                                        <div className="w-20 h-20 mx-auto mb-4 border-4 border-neo-black bg-gray-200 overflow-hidden">
                                            {top3[2].avatarUrl ? (
                                                <Image src={top3[2].avatarUrl} alt={top3[2].fullName} width={80} height={80} className="object-cover w-full h-full grayscale hover:grayscale-0" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-black text-2xl">3</div>
                                            )}
                                        </div>
                                        <h3 className="font-black text-lg text-neo-black mb-1 uppercase truncate">{top3[2].fullName}</h3>
                                        <div className="text-xl font-black bg-neo-black text-white inline-block px-2">{formatDuration(top3[2].total)}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {rest.length > 0 && (
                <div className="bg-white border-4 border-neo-black shadow-neo-lg p-6 mb-12">
                    <h2 className="text-2xl font-black text-neo-black mb-6 uppercase flex items-center gap-2">
                        <Trophy size={28} strokeWidth={3} />
                        The Contenders
                    </h2>
                    <div className="space-y-4">
                        {rest.map((leader, index) => {
                            const rank = index + 4;
                            return (
                                <div key={leader.userId} className="flex items-center p-4 border-2 border-neo-black bg-gray-50 hover:bg-neo-yellow/20 transition-colors">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        {/* Rank */}
                                        <div className="w-10 h-10 flex-shrink-0 bg-neo-black text-white flex items-center justify-center font-black text-lg shadow-sm">
                                            #{rank}
                                        </div>

                                        {/* Avatar */}
                                        <div className="w-12 h-12 flex-shrink-0 border-2 border-neo-black bg-white flex items-center justify-center overflow-hidden">
                                            {leader.avatarUrl ? (
                                                <Image src={leader.avatarUrl} alt={leader.fullName} width={48} height={48} className="object-cover w-full h-full grayscale" />
                                            ) : (
                                                <span className="font-black text-lg">{leader.fullName[0]}</span>
                                            )}
                                        </div>

                                        {/* Name */}
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-black text-neo-black uppercase truncate text-lg">{leader.fullName}</h3>
                                            <p className="text-xs font-bold text-gray-500 uppercase truncate">@{leader.username}</p>
                                        </div>
                                    </div>

                                    {/* Duration */}
                                    <div className="flex items-center gap-2 text-neo-black pl-4 border-l-4 border-neo-black">
                                        <Clock size={20} strokeWidth={3} />
                                        <span className="font-mono font-black text-xl">{formatDuration(leader.total)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Admin Section */}
            {admins.length > 0 && (
                <div className="bg-neo-black p-8 text-white border-4 border-white shadow-neo">
                    <h2 className="text-3xl font-black mb-6 flex items-center gap-3 uppercase">
                        <Award className="text-neo-yellow" size={32} strokeWidth={3} />
                        Admin Activity
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {admins.map((admin) => (
                            <div key={admin.userId} className="flex items-center justify-between p-4 bg-white/10 border-2 border-white/20 hover:bg-white/20 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 border-2 border-neo-yellow bg-neo-black flex items-center justify-center overflow-hidden">
                                        {admin.avatarUrl ? (
                                            <Image src={admin.avatarUrl} alt="Admin" width={48} height={48} className="object-cover" />
                                        ) : (
                                            <span className="font-black text-neo-yellow">A</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white uppercase">{admin.fullName}</h3>
                                        <span className="bg-neo-yellow text-neo-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider inline-block transform -rotate-2">
                                            ADMIN
                                        </span>
                                    </div>
                                </div>
                                <div className="font-mono font-black text-neo-yellow text-xl">
                                    {formatDuration(admin.total)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {data.users.length === 0 && (
                <div className="text-center py-20 bg-white border-4 border-neo-black border-dashed">
                    <Trophy className="mx-auto mb-4 text-gray-300" size={80} strokeWidth={1} />
                    <p className="font-black text-2xl uppercase text-gray-400">ARENA EMPTY</p>
                    <p className="text-sm font-bold text-gray-400 mt-2 uppercase">Be the first to enter the ranks.</p>
                </div>
            )}
        </div>
    );
}
