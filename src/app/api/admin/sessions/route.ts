import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    // Fetch all active sessions (no checkout time)
    const sessions = await prisma.attendance.findMany({
        where: {
            checkOut: null
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    username: true,
                    avatarUrl: true
                }
            }
        },
        orderBy: {
            checkIn: 'desc'
        }
    });

    return NextResponse.json(sessions);
}

export async function PUT(request: Request) {
    try {
        const { attendanceId, checkOutTime } = await request.json();

        if (!attendanceId || !checkOutTime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const session = await prisma.attendance.findUnique({
            where: { id: attendanceId }
        });

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const checkIn = new Date(session.checkIn);
        const checkOut = new Date(checkOutTime);

        // Calculate duration in seconds
        const durationSeconds = Math.floor((checkOut.getTime() - checkIn.getTime()) / 1000);

        if (durationSeconds < 0) {
            return NextResponse.json({ error: 'Checkout time cannot be before checkin time' }, { status: 400 });
        }

        const updated = await prisma.attendance.update({
            where: { id: attendanceId },
            data: {
                checkOut: checkOut,
                totalDuration: durationSeconds
            }
        });

        return NextResponse.json(updated);

    } catch (error) {
        console.error("Manual Checkout Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
