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

    // 1. Get current avatar URL to delete later if needed
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    const oldAvatarUrl = dbUser?.avatarUrl;

    // 2. Update Database
    const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
            fullName: body.fullName,
            username: body.username,
            bio: body.bio,
            avatarUrl: body.avatarUrl // Allow updating avatarUrl
        }
    });

    // 3. Delete old avatar if it changed and existed
    if (body.avatarUrl && oldAvatarUrl && body.avatarUrl !== oldAvatarUrl) {
        // Extract path from URL (assuming standard Supabase Storage URL format)
        // URL format: .../storage/v1/object/public/avatars/path/to/file
        try {
            const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

            // Basic extraction: get everything after 'avatars/'
            const parts = oldAvatarUrl.split('/avatars/');
            if (parts.length === 2) {
                const oldPath = parts[1]; // e.g. "public/user_123/123456.png"
                console.log('Deleting old avatar:', oldPath);

                // Using service role might be safer for deletion guarantee, but let's try standard client first
                // or just fire and forget.
                await supabase.storage.from('avatars').remove([oldPath]);
            }
        } catch (e) {
            console.error('Failed to delete old avatar:', e);
            // Don't fail the request just because cleanup failed
        }
    }

    return NextResponse.json(updated);
}
