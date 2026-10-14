// Recherche dans l'app locale : Renault › Clio › Clio IV, diesel ; capture des résultats.
// usage : node chercher.mjs sortie.png
import { chromium } from 'playwright';
import { USER } from './demo.mjs';
const out = process.argv[2];
const session = { access_token: 'demo', token_type: 'bearer', expires_in: 360000, expires_at: 4102444800, refresh_token: 'demo', user: USER };
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.addCookies([{ name: 'sb-127-auth-token', value: 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url'), url: 'http://localhost:3100' }]);
const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('PAGEERR', e.message.slice(0, 300)));
await p.goto('http://localhost:3100/app/recherche?vue=chercher', { waitUntil: 'networkidle', timeout: 180000 }); await p.waitForTimeout(6000);
const sel = p.locator('select');
console.log('selects', await sel.count());
const opts = async (i) => (await sel.nth(i).locator('option').allTextContents()).slice(0, 40);
console.log('marques', (await opts(0)).join('|').slice(0, 300));
await sel.nth(0).selectOption({ label: 'Renault' }); await p.waitForTimeout(800);
console.log('modeles', (await opts(1)).join('|').slice(0, 300));
await sel.nth(1).selectOption({ label: 'Clio' }); await p.waitForTimeout(800);
console.log('gens', (await opts(2)).join('|').slice(0, 300));
const g = (await opts(2)).find((x) => /IV|4/.test(x)); if (g) await sel.nth(2).selectOption({ label: g });
const en = p.locator('select').filter({ has: p.locator('option', { hasText: 'Diesel' }) }).first(); await en.selectOption({ label: 'Diesel' }).catch((e) => console.log('energie', e.message.slice(0, 100)));
await p.getByRole('button', { name: /^Rechercher$/ }).first().click();
await p.waitForTimeout(9000);
await p.screenshot({ path: out, fullPage: true }); console.log(p.url());
await b.close();
