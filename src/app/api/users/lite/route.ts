import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Fetch all users with minimal fields for tagging
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true
            },
            orderBy: {
                fullName: 'asc'
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users list:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
