import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPushNotification } from '@/lib/push';

// Reuse the getUser helper
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

        // Update lastViewedTimeline if user is authenticated
        if (user) {
            // Fire and forget update
            (prisma as any).user.update({
                where: { id: user.id },
                data: { lastViewedTimeline: new Date() }
            }).catch((err: any) => console.error("Failed to update lastViewedTimeline", err));
        }

        const includeQuery = {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    username: true,
                    avatarUrl: true
                }
            },
            _count: {
                select: {
                    likes: true,
                    comments: true
                }
            },
            ...(user ? {
                likes: {
                    where: { userId: user.id },
                    select: { userId: true }
                }
            } : {})
        };

        const posts = await prisma.post.findMany({
            include: includeQuery,
            orderBy: {
                createdAt: 'desc'
            }
        });

        const formattedPosts = posts.map(post => ({
            ...post,
            likeCount: post._count.likes,
            commentCount: (post._count as any).comments,
            isLiked: (post as any).likes?.length > 0 // still safe to access relation
        }));

        return NextResponse.json(formattedPosts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();

        // Basic Validation
        if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const newPost = await prisma.post.create({
            data: {
                content: body.content,
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

        // NOTIFICATION LOGIC
        try {
            // 1. Detect Mentions
            const mentionRegex = /@(\w+)/g;
            const matches = body.content.match(mentionRegex);

            if (matches) {
                const usernames = matches.map((m: string) => m.substring(1)); // Remove @
                // Find users to notify
                const usersToNotify = await prisma.user.findMany({
                    where: {
                        username: { in: usernames },
                        id: { not: user.id } // Don't notify self
                    },
                    select: { id: true }
                });

                // ... (inside POST)

                if (usersToNotify.length > 0) {
                    await (prisma as any).notification.createMany({
                        data: usersToNotify.map((u: any) => ({
                            userId: u.id,
                            senderId: user.id,
                            type: 'MENTION',
                            postId: newPost.id,
                            read: false
                        }))
                    });

                    // Send Push Notifications
                    // Fetch sender details first
                    const senderProfile = await prisma.user.findUnique({
                        where: { id: user.id },
                        select: { username: true }
                    });

                    if (senderProfile) {
                        usersToNotify.forEach((u: any) => {
                            sendPushNotification(
                                u.id,
                                "New Mention",
                                `@${senderProfile.username} mentioned you in a post`,
                                `/timeline`
                            );
                        });
                    }
                }
            }

            // 2. "New Post" Global Notification
            // Broadcast to all users who have push subscriptions (except self)
            // Optimization: In a real large app, this should be a background queue. 
            // Here we do a simple "send to all endpoints" via our helper or custom logic.

            // Fetch ALL subscriptions except sender
            // Note: This might be heavy if users > 1000. For now it's fine.
            const allSubscriptions = await (prisma as any).pushSubscription.findMany({
                where: {
                    userId: { not: user.id }
                },
                select: { userId: true } // Just need distinct userIds to target
            });

            // Get unique user IDs to avoid duplicate sends if user has multiple devices (handled by sendPushNotification implementation slightly efficiently)
            const uniqueUserIds = Array.from(new Set(allSubscriptions.map((s: any) => s.userId)));

            // Fire and forget push
            const senderName = user.user_metadata?.username || "Someone"; // Fallback if Supabase user doesn't carry username easily (or fetch from DB)
            // Actually better to fetch from DB for accurate username
            const senderProfileForGlobal = await prisma.user.findUnique({ where: { id: user.id }, select: { username: true } });
            const displayName = senderProfileForGlobal?.username || "Someone";

            // Limit broadcast to avoid timeout?
            // Let's send to first 50 for safety in this valid iteration, or just loop all. 
            // Taking 20 most recent separate users to be safe? No, user wants *broadcast*.

            // We'll iterate but with error catching per chunk if we were advanced. 
            // Simple loop for now.
            uniqueUserIds.forEach((recipientId: any) => {
                sendPushNotification(
                    recipientId,
                    "New Post",
                    `@${displayName} posted on timeline`,
                    `/timeline`
                );
            });

        } catch (notifError) {
            console.error("Failed to create notifications:", notifError);
            // Don't fail the request, just log it
        }

        return NextResponse.json(newPost);
    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}
