import { PrismaClient } from './prisma-client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Pastikan client selalu diperbarui jika instance lama tidak memiliki model daishaType / user
const existingClient = globalForPrisma.prisma;
const isStale =
  existingClient &&
  (!('daishaType' in existingClient) || !('user' in existingClient));

export const prisma =
  isStale || !existingClient ? new PrismaClient() : existingClient;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
export default prisma;

