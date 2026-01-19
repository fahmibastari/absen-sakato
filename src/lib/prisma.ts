import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    let url = process.env.DATABASE_URL;

    // Safety Force Connection Limit in Dev
    if (process.env.NODE_ENV !== 'production' && url && !url.includes('connection_limit')) {
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}connection_limit=1`;
        console.log("⚠️ Dev Mode: Enforcing connection_limit=1");
    }

    return new PrismaClient({
        datasources: {
            db: {
                url: url
            },
        },
    });
};

const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}