import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

export { prisma };

if (process.env.NODE_ENV === 'development') {
  globalForPrisma.prisma = prisma;
}
