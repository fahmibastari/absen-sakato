import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ username: string }> }) {
    try {
        const { username } = await params;

        const user = await prisma.user.findUnique({
            where: { username: username },
            select: {
                id: true,
                fullName: true,
                username: true,
                bio: true,
                avatarUrl: true,
                _count: {
                    select: {
                        posts: true,
                        // likes: true // If we want to show total likes received (requires different query)
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}
