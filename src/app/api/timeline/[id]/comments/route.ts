import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPushNotification } from '@/lib/push';

async function getUser(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return null;

    const token = authHeader.replace('Bearer ', '');
    if (!token) return null;

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: { user } } = await supabase.auth.getUser(token);

    return user;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: postId } = await params;

        const comments = await (prisma as any).comment.findMany({
            where: { postId },
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
                createdAt: 'asc' // Oldest first (Instagram style) or desc? Let's do asc for reading flow
            }
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: postId } = await params;
        const { content } = await req.json();

        if (!content || !content.trim()) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        // 1. Create Comment
        const comment = await (prisma as any).comment.create({
            data: {
                content,
                postId,
                userId: user.id
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
            }
        });

        // 2. Notify Post Owner (if not self)
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { userId: true }
        });

        if (post && post.userId !== user.id) {
            // DB Notification
            // Need to cast to any because NotificationType enum might not be fully generated in types yet if we didn't run generate (but we did in push?)
            // We'll rely on string or enum if available.
            await prisma.notification.create({
                data: {
                    userId: post.userId,
                    senderId: user.id,
                    type: 'COMMENT', // Enum value
                    postId: postId,
                    read: false
                }
            });

            // Push Notification
            const senderName = comment.user.username || "Someone";
            await sendPushNotification(
                post.userId,
                "New Comment",
                `${senderName} commented: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
                `/timeline`
            );
        }

        return NextResponse.json(comment);
    } catch (error) {
        console.error("Error creating comment:", error);
        return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }
}
