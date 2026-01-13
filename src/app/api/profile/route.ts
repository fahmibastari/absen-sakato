import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const body = await req.json();

    await prisma.user.create({
        data: {
            id: body.id,
            fullName: body.fullName,
            username: body.username,
            avatarUrl: body.avatarUrl ?? null,
            bio: body.bio ?? null,
        },
    });

    return NextResponse.json({ success: true });
}
