
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function getUser(req: Request) {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return null;
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: { user } } = await supabase.auth.getUser(token);
    return user;
}

export async function GET(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ hasNewPosts: false, hasNewAnnouncements: false });
        }

        const userData = await prisma.user.findUnique({
            where: { id: user.id },
            select: { lastViewedTimeline: true, lastViewedAnnouncement: true }
        });

        if (!userData) {
            return NextResponse.json({ hasNewPosts: false, hasNewAnnouncements: false });
        }

        const [newPostsCount, newAnnouncementsCount] = await Promise.all([
            prisma.post.count({
                where: {
                    type: 'POST',
                    createdAt: { gt: userData.lastViewedTimeline }
                }
            }),
            prisma.post.count({
                where: {
                    type: 'ANNOUNCEMENT',
                    createdAt: { gt: userData.lastViewedAnnouncement }
                }
            })
        ]);

        return NextResponse.json({
            hasNewPosts: newPostsCount > 0,
            hasNewAnnouncements: newAnnouncementsCount > 0
        });

    } catch (error) {
        console.error("Error checking timeline status:", error);
        return NextResponse.json({ hasNewPosts: false, hasNewAnnouncements: false });
    }
}
