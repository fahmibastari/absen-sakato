import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper to get user
async function getUser(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return null;

    const token = authHeader.replace('Bearer ', '');
    if (!token) return null;

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: { user } } = await supabase.auth.getUser(token);

    return user;
}

export async function GET(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Get user's last viewed time
        const dbUser = await (prisma as any).user.findUnique({
            where: { id: user.id },
            select: { lastViewedTimeline: true }
        });

        if (!dbUser) return NextResponse.json({ hasNewPosts: false });

        // 2. Check if there are any posts created AFTER that time
        const newPost = await prisma.post.findFirst({
            where: {
                createdAt: {
                    gt: dbUser.lastViewedTimeline
                }
            },
            select: { id: true } // We only need to know if ONE exists
        });

        return NextResponse.json({ hasNewPosts: !!newPost });
    } catch (error) {
        console.error("Error checking timeline status:", error);
        return NextResponse.json({ hasNewPosts: false });
    }
}
