import fs from 'fs/promises';
import path from 'path';

// This script scans the services/ directory for exported template strings
// (e.g. `export const RAW_CRIMINAL_CODE = `...``) and writes a laws.json file.
// Run: node --experimental-json-modules scripts/extract-raw-to-json.mjs

async function extract() {
  const servicesDir = path.join(process.cwd(), 'services');
  const out = [];
  const files = await fs.readdir(servicesDir);
  for (const f of files) {
    if (!f.endsWith('.ts') && !f.endsWith('.js')) continue;
    const full = path.join(servicesDir, f);
    const txt = await fs.readFile(full, 'utf8');
    // match patterns like: export const NAME = `...`;
    const re = /export\s+const\s+(\w+)\s*=\s*`([\s\S]*?)`/g;
    let m;
    while ((m = re.exec(txt))) {
      const name = m[1];
      const content = m[2].trim();
      const title = content.split('\n').find(Boolean) || '';
      out.push({ file: f, exportName: name, title: title.slice(0,200), content });
    }
  }
  await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
  await fs.writeFile(path.join(process.cwd(), 'data', 'laws.json'), JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote data/laws.json with', out.length, 'entries');
}

extract().catch(e=>{ console.error(e); process.exit(1); });
