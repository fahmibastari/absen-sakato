import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

        const includeQuery: any = {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    username: true,
                    avatarUrl: true
                }
            },
            _count: {
                select: { likes: true }
            }
        };

        if (user) {
            includeQuery.likes = {
                where: { userId: user.id },
                select: { userId: true }
            };
        }

        const posts = await prisma.post.findMany({
            include: includeQuery,
            orderBy: {
                createdAt: 'desc'
            }
        });

        const formattedPosts = posts.map((post: any) => ({
            ...post,
            likeCount: post._count?.likes ?? 0,
            isLiked: post.likes?.length > 0
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

        return NextResponse.json(newPost);
    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}
