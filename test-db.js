require('dotenv').config({ path: '.env' });
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const rawUrl = process.env.DATABASE_URL || '';
  const connectionString = rawUrl.replace(/^"|"$/g, '');
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('MainCourse Count:', await prisma.mainCourse.count());
  console.log('CoreSubject Count:', await prisma.coreSubject.count());
}

main().catch(console.error).finally(()=>process.exit(0));
