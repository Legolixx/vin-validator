import { PrismaClient } from '@/lib/generated/prisma/client';

// Evita recriar o client no modo dev com hot reload
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
