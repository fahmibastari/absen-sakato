import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch users who have checked in today but NOT checked out
    const liveSessions = await prisma.attendance.findMany({
        where: {
            date: today,
            checkOut: null, // Still active
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    avatarUrl: true,
                }
            }
        },
        orderBy: {
            checkIn: 'desc'
        }
    });

    const result = liveSessions.map(s => {
        // Safe check, though schema says default(now())
        const time = s.checkIn ? s.checkIn : new Date();
        return {
            id: s.user.id,
            fullName: s.user.fullName,
            avatarUrl: s.user.avatarUrl,
            checkInTime: time.toISOString()
        };
    });

    console.log(`[API /live] Returning ${result.length} active sessions`);
    return NextResponse.json(result);
}
