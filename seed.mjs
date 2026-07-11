import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash('password123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: { email: 'admin@test.com', name: 'Admin User', password, role: 'ADMIN' },
  });
  
  await prisma.user.upsert({
    where: { email: 'teacher@test.com' },
    update: {},
    create: { email: 'teacher@test.com', name: 'Teacher User', password, role: 'TEACHER' },
  });
  
  await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: {},
    create: { email: 'student@test.com', name: 'Student User', password, role: 'STUDENT' },
  });
  
  console.log('✅ Test users seeded successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
