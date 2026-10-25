// Rend les 12 images clés de la planche (planche-presente-v/index.html?f=1…12) en 1080×1920 → renders/planche-presente-v/f01.png…
import { chromium } from 'playwright'; import path from 'node:path'; import fs from 'node:fs';
const out = 'renders/planche-presente-v'; fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', (e) => console.log('PAGEERR', e.message));
for (let i = 1; i <= 12; i++) {
  await p.goto('file://' + path.resolve('planche-presente-v/index.html') + '?f=' + i);
  await p.waitForFunction(() => document.title === 'ok'); await p.waitForTimeout(150);
  await p.screenshot({ path: `${out}/f${String(i).padStart(2, '0')}.png` }); console.log('f' + i);
}
await b.close();
