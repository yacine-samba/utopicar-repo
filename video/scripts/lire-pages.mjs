// Lit des pages web publiques en local (Playwright, Chromium du PC) et garde leur texte, pour la recherche de cible
// (fils de forum, témoignages). Pas de service externe. S'arrête sur une page de vérification anti-robot, sans la contourner.
// usage : node scripts/lire-pages.mjs <sortie.json> <url> [url…]   (CHROMIUM=chemin d'un autre Chromium)
import { chromium } from 'playwright';
import fs from 'fs';

const [out, ...urls] = process.argv.slice(2);
if (!out || !urls.length) { console.error('usage : node scripts/lire-pages.mjs <sortie.json> <url> [url…]'); process.exit(1); }
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--lang=fr-FR'] });
const ctx = await browser.newContext({ locale: 'fr-FR', viewport: { width: 1300, height: 900 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36' });
const page = await ctx.newPage();
const pages = [];
for (const url of urls) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  // bandeau cookies : on refuse ce qui est facultatif quand le bouton existe
  await page.getByRole('button', { name: /Continuer sans accepter|Tout refuser|Refuser|Decline/i }).first().click({ timeout: 2000 }).catch(() => {});
  const titre = await page.title();
  if (/just a moment|un instant|vérification|captcha|attention required/i.test(titre)) { console.log('Vérification anti-robot :', url); pages.push({ url, bloque: true }); continue; }
  const texte = await page.evaluate(() => document.body.innerText);
  pages.push({ url, titre, texte });
  console.log(`${texte.length} caractères · ${titre.slice(0, 70)}`);
}
fs.writeFileSync(out, JSON.stringify({ lu: new Date().toISOString(), pages }, null, 1));
await browser.close();
