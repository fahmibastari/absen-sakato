import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch ONLY COMPLETED sessions (checked out)
    const data = await prisma.attendance.findMany({
        where: {
            date: today,
            checkOut: { not: null }
        },
        include: {
            user: true,
        },
        orderBy: {
            checkOut: 'desc'
        }
    });

    const result = data.map((item) => {
        // Safe null check (though checkOut is verified not null in query)
        const checkOut = item.checkOut || new Date();
        const checkIn = item.checkIn || new Date();

        return {
            id: item.id,
            fullName: item.user.fullName,
            checkInTime: checkIn.toISOString(),
            checkOutTime: checkOut.toISOString(),
            duration: Math.floor(item.totalDuration / 60) // minutes
        };
    });

    return NextResponse.json(result);
}
