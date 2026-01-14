import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query || query.length < 1) {
            return NextResponse.json([]);
        }

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { username: { contains: query } }, // Case insensitive by default in some DBs, logic handled by Prisma
                    { fullName: { contains: query } }
                ]
            },
            take: 5,
            select: {
                id: true,
                fullName: true,
                username: true,
                avatarUrl: true
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Search Error:", error);
        return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
    }
}
