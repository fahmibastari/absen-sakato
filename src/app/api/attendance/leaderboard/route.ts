import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    const now = new Date();

    // awal minggu (Senin)
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay(); // 0 = Minggu
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // akhir minggu
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const data = await prisma.attendance.findMany({
        where: {
            date: {
                gte: startOfWeek,
                lt: endOfWeek,
            },
        },
        include: {
            user: true,
        },
    });

    // akumulasi durasi per user
    const map: Record<
        string,
        { userId: string; fullName: string; username: string; avatarUrl: string | null; total: number }
    > = {};

    for (const item of data) {
        if (!map[item.userId]) {
            map[item.userId] = {
                userId: item.userId,
                fullName: item.user.fullName,
                username: item.user.username,
                avatarUrl: item.user.avatarUrl,
                total: 0,
            };
        }

        map[item.userId].total += item.totalDuration;
    }

    const leaderboard = Object.values(map)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10); // top 10

    return NextResponse.json(leaderboard);
}
