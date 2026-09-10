import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

// Simple import script that reads data/laws.json and upserts into the DB.
// Run after you've generated prisma client and provisioned the DATABASE_URL.
// Usage: node scripts/import-to-db.mjs

async function main(){
  const prisma = new PrismaClient();
  const p = path.join(process.cwd(),'data','laws.json');
  const txt = await fs.readFile(p,'utf8');
  const arr = JSON.parse(txt);
  console.log('Importing', arr.length, 'records');
  for (const item of arr){
    const code = `${item.file.replace(/\W+/g,'_')}_${item.exportName}`.toLowerCase();
    await prisma.law.upsert({
      where: { code },
      update: { title: item.title || code, content: item.content, source: item.file },
      create: { code, title: item.title || code, content: item.content, source: item.file }
    });
  }
  await prisma.$disconnect();
  console.log('Import finished');
}

main().catch(e=>{ console.error(e); process.exit(1); });
