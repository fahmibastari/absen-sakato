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

        // Fetch notifications
        const notifications = await (prisma as any).notification.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 20,
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        avatarUrl: true
                    }
                },
                post: {
                    select: {
                        id: true,
                        content: true
                    }
                }
            }
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}
