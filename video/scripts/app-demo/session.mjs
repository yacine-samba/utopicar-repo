// Session de démonstration commune aux scripts de capture (app locale sur localhost:3100).
import { chromium } from 'playwright';
import { USER } from './demo.mjs';
export const BASE = 'http://localhost:3100';
export async function ouvrir({ w = 390, h = 844, sc = 2 } = {}) {
  const session = { access_token: 'demo', token_type: 'bearer', expires_in: 360000, expires_at: 4102444800, refresh_token: 'demo', user: USER };
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: sc, timezoneId: 'Europe/Paris', locale: 'fr-FR' });
  await ctx.addCookies([{ name: 'sb-127-auth-token', value: 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url'), url: BASE }]);
  const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('PAGEERR', e.message.slice(0, 300)));
  return { b, ctx, p };
}
// recherche Renault › Clio › Clio 4, diesel, depuis l'onglet Chercher
export async function chercherClio(p) {
  await p.goto(BASE + '/app/recherche?vue=chercher', { waitUntil: 'networkidle', timeout: 180000 }); await p.waitForTimeout(1500);
  const sel = p.locator('select');
  await sel.nth(0).selectOption({ label: 'Renault' }); await p.waitForTimeout(400);
  await sel.nth(1).selectOption({ label: 'Clio' }); await p.waitForTimeout(400);
  await sel.nth(2).selectOption({ label: 'Clio 4 (2012 – 2019)' });
  await p.locator('select').filter({ has: p.locator('option', { hasText: 'Diesel' }) }).first().selectOption({ label: 'Diesel' });
  await p.getByRole('button', { name: /^Rechercher$/ }).first().click();
  await p.waitForLoadState('networkidle'); await p.waitForTimeout(2500);
}
