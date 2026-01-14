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

export async function POST(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { subscription } = body;

        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
        }

        console.log(`Saving push subscription for user ${user.id}`);

        // Save subscription
        await (prisma as any).pushSubscription.upsert({
            where: {
                userId_endpoint: {
                    userId: user.id,
                    endpoint: subscription.endpoint
                }
            },
            update: {
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            },
            create: {
                userId: user.id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving subscription:", error);
        return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
    }
}
