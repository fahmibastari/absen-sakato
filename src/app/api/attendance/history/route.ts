import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');

    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const records = await prisma.attendance.findMany({
        where: {
            userId: user.id,
        },
        orderBy: {
            date: 'desc',
        },
    });

    const result = records.map((item) => ({
        id: item.id,
        date: item.date,
        checkIn: item.checkIn,
        checkOut: item.checkOut,
        totalDuration: item.totalDuration,
    }));

    return NextResponse.json(result);
}
