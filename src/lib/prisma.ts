import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const rawUrl = process.env.DATABASE_URL || '';
const connectionString = rawUrl.replace(/^"|"$/g, '');

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in the environment variables');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma3: PrismaClient };

export const prisma = globalForPrisma.prisma3 || new PrismaClient({ 
  adapter
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma3 = prisma;
