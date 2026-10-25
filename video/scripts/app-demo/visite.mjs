// Ouvre une page de l'app locale (next dev sur 3100) avec une session de démo et fait une capture.
// usage : node visite.mjs /app sortie.png [largeur] [hauteur] [échelle] [pleine page 0|1]
import { chromium } from 'playwright';
import { USER } from './demo.mjs';
const [, , path = '/app', out = 'capture.png', w = '390', h = '844', sc = '2', full = '1'] = process.argv;
const session = { access_token: 'demo', token_type: 'bearer', expires_in: 360000, expires_at: 4102444800, refresh_token: 'demo', user: USER };
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: +sc });
await ctx.addCookies([{ name: 'sb-127-auth-token', value: 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url'), url: 'http://localhost:3100' }]);
const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('PAGEERR', e.message.slice(0, 300)));
p.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 300)); });
const r = await p.goto('http://localhost:3100' + path, { waitUntil: 'networkidle', timeout: 180000 }); console.log('HTTP', r.status(), p.url());
await p.waitForTimeout(1500); await p.screenshot({ path: out, fullPage: full === '1' });
await b.close();
