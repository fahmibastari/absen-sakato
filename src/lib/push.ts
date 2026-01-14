import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

// Configure Web Push with your keys
webpush.setVapidDetails(
    process.env.NEXT_PUBLIC_VAPID_SUBJECT || 'mailto:admin@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function sendPushNotification(userId: string, title: string, body: string, url: string = '/') {
    try {
        // Fetch all subscriptions for the user
        const subscriptions = await (prisma as any).pushSubscription.findMany({
            where: { userId }
        });

        if (!subscriptions.length) return;

        const payload = JSON.stringify({
            title,
            body,
            url
        });

        const promises = subscriptions.map((sub: any) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };

            return webpush.sendNotification(pushSubscription, payload)
                .catch((err) => {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Subscription has expired or is no longer valid
                        console.log(`Deleting expired subscription for user ${userId}`);
                        return (prisma as any).pushSubscription.delete({
                            where: { id: sub.id }
                        });
                    }
                    console.error("Error sending push:", err);
                });
        });

        await Promise.all(promises);
        console.log(`Sent push notification to ${subscriptions.length} devices for user ${userId}`);
    } catch (error) {
        console.error("Push Notification Error:", error);
    }
}
