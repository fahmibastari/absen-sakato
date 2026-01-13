import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper to get user
async function getUser(req: Request) {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return null;
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: { user } } = await supabase.auth.getUser(token);
    return user;
}

export async function GET(req: Request) {
    const user = await getUser(req);
    if (!user) return NextResponse.json({}, { status: 401 });

    // Find if I have ANY active session right now
    const activeSession = await prisma.attendance.findFirst({
        where: {
            userId: user.id,
            checkOut: null // Still open
        }
    });

    // Get Full Name
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

    return NextResponse.json({
        id: dbUser?.id,
        isCheckedIn: !!activeSession,
        checkInTime: activeSession ? activeSession.checkIn : null,
        fullName: dbUser?.fullName,
        username: dbUser?.username,
        bio: dbUser?.bio,
        avatarUrl: dbUser?.avatarUrl,
        role: (dbUser as any)?.role
    });
}

// Allow Profile Update via PUT
export async function PUT(req: Request) {
    const user = await getUser(req);
    if (!user) return NextResponse.json({}, { status: 401 });

    const body = await req.json();

    // Verify username uniqueness if changed (omitted for brevity, assume simple update)
    const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
            fullName: body.fullName,
            username: body.username,
            bio: body.bio
            // avatarUrl logic separate usually
        }
    });

    return NextResponse.json(updated);
}
