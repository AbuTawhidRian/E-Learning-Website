require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

async function main() {
  const rawUrl = process.env.DATABASE_URL || '';
  const connectionString = rawUrl.replace(/^"|"$/g, '');
  const pool = new Pool({ connectionString });
  
  await pool.query('ALTER TABLE "Material" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;');
  console.log('Column isPublic added successfully');
}

main().catch(e => console.error('Error:', e.message)).finally(() => process.exit(0));
