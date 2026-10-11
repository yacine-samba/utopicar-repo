// Commentaires TikTok collectés en local (Playwright, Chromium du PC), pour la recherche de cible : texte, likes et nombre
// de réponses des commentaires sous des vidéos publiques. Aucun nom d'utilisateur n'est gardé. Pas de service externe.
// S'arrête si TikTok affiche une vérification (CAPTCHA) : on ne la contourne pas.
// usage : node scripts/commentaires-tiktok.mjs <sortie.json> <url> [url…]
//   MAX=200 commentaires par vidéo · HEADFUL=1 pour voir la fenêtre · CHROMIUM=chemin d'un autre Chromium
import { chromium } from 'playwright';
import fs from 'fs';

const [out, ...urls] = process.argv.slice(2);
if (!out || !urls.length) { console.error('usage : node scripts/commentaires-tiktok.mjs <sortie.json> <url> [url…]'); process.exit(1); }
const MAX = +(process.env.MAX || 200);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, headless: !process.env.HEADFUL, args: ['--lang=fr-FR'] });
const ctx = await browser.newContext({
  locale: 'fr-FR', viewport: { width: 1400, height: 950 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',
});
const page = await ctx.newPage();
const resultats = [];
let bloque = false;

for (const url of urls) {
  const vus = new Map();
  // les commentaires arrivent par l'API interne de la page ; on lit ses réponses au lieu de les redemander
  const lire = async (r) => {
    if (!r.url().includes('/api/comment/list/')) return;
    try {
      const j = await r.json();
      for (const c of j.comments || []) if (c.text && !vus.has(c.cid)) vus.set(c.cid, { texte: c.text, likes: c.digg_count ?? 0, reponses: c.reply_comment_total ?? 0 });
    } catch { /* réponse vide ou non JSON */ }
  };
  page.on('response', lire);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(5000);
  if (await page.locator('#captcha-verify-image, #captcha_container, [class*="captcha" i]').count()) {
    console.log('Vérification TikTok affichée : arrêt sur', url); bloque = true; page.off('response', lire); break;
  }
  // bandeau cookies : on refuse les cookies facultatifs ; puis l'onglet « Commentaires » du panneau de droite
  await page.getByRole('button', { name: /Décliner les cookies facultatifs|Decline optional cookies/i }).first().click({ timeout: 3000 }).catch(() => {});
  if (!vus.size) await page.getByText(/^Commentaires$|^Comments$/).first().click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(2500);
  // puzzle « Fais glisser le curseur » : TikTok demande une vérification humaine, on s'arrête
  if (await page.getByText(/Fais glisser le curseur|Drag the slider|compléter le puzzle/i).count()) {
    console.log('Vérification TikTok (puzzle) affichée : arrêt sur', url); bloque = true; page.off('response', lire); break;
  }
  const icone = page.locator('[data-e2e="comment-icon"]').first();
  if (!vus.size && await icone.count()) await icone.click({ timeout: 5000 }).catch(() => {});
  let calme = 0;
  for (let i = 0; i < 80 && vus.size < MAX && calme < 6; i++) {
    const avant = vus.size;
    await page.evaluate(() => {
      const c = document.querySelector('[data-e2e="comment-level-1"]');
      let el = c; while (el && el !== document.body && !(el.scrollHeight > el.clientHeight + 20 && /(auto|scroll)/.test(getComputedStyle(el).overflowY))) el = el.parentElement;
      (el && el !== document.body ? el : document.scrollingElement).scrollBy(0, 2500);
    });
    await page.waitForTimeout(1300);
    calme = vus.size === avant ? calme + 1 : 0;
  }
  // secours : commentaires lus dans la page si l'API n'a rien renvoyé
  if (!vus.size) {
    const dom = await page.locator('[data-e2e="comment-level-1"]').allInnerTexts().catch(() => []);
    dom.forEach((t, k) => vus.set('dom' + k, { texte: t, likes: null, reponses: null }));
  }
  page.off('response', lire);
  const commentaires = [...vus.values()].slice(0, MAX);
  resultats.push({ url, commentaires });
  console.log(`${commentaires.length} commentaires · ${url}`);
}

fs.writeFileSync(out, JSON.stringify({ collecte: new Date().toISOString(), videos: resultats }, null, 1));
await browser.close();
if (bloque) process.exitCode = 2;
