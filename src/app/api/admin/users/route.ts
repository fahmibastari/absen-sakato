import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Verify Admin Middleware logic (simplified)
async function verifyAdmin(req: Request) {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return false;

    // We trust the database role, not just the token, for extra security 
    // (though in a real app better to set Custom Claims in JWT)
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return false;

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    return dbUser?.role === 'ADMIN';
}

export async function GET(req: Request) {
    if (!(await verifyAdmin(req))) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(users);
}
