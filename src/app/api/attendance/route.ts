import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    console.log('[API Attendance] Request received');

    // Verify user
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
        console.log('[API Attendance] Missing token');
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Supabase client server-side
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    // Validasi user dari JWT
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        console.log('[API Attendance] Auth failed:', error);
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('[API Attendance] Processing for user:', user.email);
    const userId = user.id;

    // 1. Check if there is an ACTIVE session (CheckIn but no CheckOut)
    const activeSession = await prisma.attendance.findFirst({
        where: {
            userId: userId,
            checkOut: null
        }
    });

    if (activeSession) {
        // === CHECK OUT ===
        console.log('[API Attendance] Found active session, checking out...');
        const checkOutTime = new Date();
        const checkInTime = activeSession.checkIn ? new Date(activeSession.checkIn) : new Date();
        const durationSeconds = Math.floor((checkOutTime.getTime() - checkInTime.getTime()) / 1000);

        await prisma.attendance.update({
            where: { id: activeSession.id },
            data: {
                checkOut: checkOutTime,
                totalDuration: durationSeconds
            }
        });

        return NextResponse.json({
            message: `Goodbye! Sesi nongkrong selesai. Durasi: ${Math.floor(durationSeconds / 60)} menit.`,
            type: 'checkout'
        });

    } else {
        // === CHECK IN ===
        console.log('[API Attendance] No active session, checking in...');

        // Optional: Ensure date is stored as "Today 00:00" for grouping if needed, 
        // but now we mainly care about the timestamp.
        const today = new Date();
        const todayDateOnly = new Date(today);
        todayDateOnly.setHours(0, 0, 0, 0);

        await prisma.attendance.create({
            data: {
                userId: userId,
                date: todayDateOnly,
                checkIn: today,
                checkOut: null,
                totalDuration: 0
            }
        });

        return NextResponse.json({
            message: 'Welcome! Selamat nongkrong ☕',
            type: 'checkin'
        });
    }
}
