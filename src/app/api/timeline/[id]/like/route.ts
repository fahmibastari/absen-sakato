import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper to get user
async function getUser(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
        console.log("getUser: No Authorization header");
        return null;
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        console.log("getUser: No token in Authorization header");
        return null;
    }

    console.log(`getUser: Verifying token: ${token.substring(0, 10)}...`);
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        console.error("getUser: Supabase auth failed:", error?.message);
        return null;
    }

    return user;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUser(req);
        if (!user) {
            console.error("Like Error: User not authenticated");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: postId } = await params; // Await params for Next.js 15
        if (!postId) {
            console.error("Like Error: No Post ID");
            return NextResponse.json({ error: "Post ID required" }, { status: 400 });
        }

        console.log(`User ${user.id} toggling like for post ${postId}`);

        // Check if like exists
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId: user.id,
                    postId: postId
                }
            }
        });

        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: {
                    userId_postId: {
                        userId: user.id,
                        postId: postId
                    }
                }
            });
            return NextResponse.json({ liked: false });
        } else {
            // Like
            await prisma.like.create({
                data: {
                    userId: user.id,
                    postId: postId
                }
            });
            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        console.error("Error toggling like:", error);
        return NextResponse.json({ error: "Failed to like post" }, { status: 500 });
    }
}
