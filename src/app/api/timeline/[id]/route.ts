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

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const postId = params.id;

        if (!postId) {
            return NextResponse.json({ error: "Post ID required" }, { status: 400 });
        }

        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify ownership
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { userId: true }
        });

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        if (post.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden: Not your post" }, { status: 403 });
        }

        // Delete post
        await prisma.post.delete({
            where: { id: postId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete post" }, { status: 500 });
    }
}
