// Analyse d'une annonce dans l'app locale (page /app/analyser) : colle le texte, clique sur Analyser, capture le résultat.
// usage : node analyser.mjs annonce.txt sortie.png
import { chromium } from 'playwright'; import fs from 'node:fs';
import { USER } from './demo.mjs';
const [, , fic, out] = process.argv;
const session = { access_token: 'demo', token_type: 'bearer', expires_in: 360000, expires_at: 4102444800, refresh_token: 'demo', user: USER };
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.addCookies([{ name: 'sb-127-auth-token', value: 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url'), url: 'http://localhost:3100' }]);
const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('PAGEERR', e.message.slice(0, 300)));
await p.goto('http://localhost:3100/app/analyser', { waitUntil: 'networkidle', timeout: 180000 });
await p.waitForTimeout(10000); await p.screenshot({ path: out.replace('.png', '-avant.png'), fullPage: true });
const ta = p.locator('textarea').first(); console.log('textarea', await ta.count());
await ta.fill(fs.readFileSync(fic, 'utf8'));
const btn = p.getByRole('button', { name: /Analyser l.annonce/ }).first(); console.log('bouton', await btn.textContent());
await btn.click();
await p.waitForTimeout(12000);
await p.screenshot({ path: out, fullPage: true }); console.log(p.url());
await b.close();
