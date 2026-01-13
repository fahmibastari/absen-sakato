import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Verify Admin Middleware logic (simplified)
async function verifyAdmin(req: Request) {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return false;

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return false;

    // Use a quick check. In real app, we might cache this or rely on JWT claims.
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    return (dbUser as any)?.role === 'ADMIN';
}

export async function GET(req: Request) {
    // Optionally public? Or admin only? Let's make it public for now so dashboard can fetch it later if needed, 
    // but the management part is admin. 
    // Actually, this is /api/admin/menus, so strictly admin.
    // For public menu list, we might want /api/menus.
    if (!(await verifyAdmin(req))) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const menus = await prisma.menu.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(menus);
}

export async function POST(req: Request) {
    if (!(await verifyAdmin(req))) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const body = await req.json();

    const menu = await prisma.menu.create({
        data: {
            name: body.name,
            description: body.description,
            imageUrl: body.imageUrl,
            isAvailable: body.isAvailable ?? true
        }
    });

    return NextResponse.json(menu);
}

export async function DELETE(req: Request) {
    if (!(await verifyAdmin(req))) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    // Get ID from URL or body? Let's use searchParams for DELETE
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });

    await prisma.menu.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
