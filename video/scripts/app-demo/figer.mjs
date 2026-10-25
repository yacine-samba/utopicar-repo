// Fige des pages de la vraie app (app locale = même code que la production, base de démo) en HTML statique, pour les
// animer élément par élément dans un film : DOM rendu par React avec les données de démo, scripts retirés, valeurs des
// champs écrites dans le HTML, transitions et animations CSS coupées (le film pilote tout), styles et polices copiés.
// usage : node figer.mjs [scène,scène…]   (app sur localhost:3100, faux Supabase sur 54321)
// Sortie : video/assets/presente-v3/ui/<scène>.html (+ _next/static/chunks/*.css, _next/static/media/*, fichiers de public/)
import fs from 'node:fs'; import path from 'node:path';
import { ouvrir, BASE, chercherClio } from './session.mjs';
const APP = '/tmp/claude-0/-home-user-utopicar-repo/c77fa2e8-85c5-5cd2-9783-45e9d7179f5b/scratchpad/appweb/web';
const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../assets/presente-v3/ui');
fs.mkdirSync(OUT, { recursive: true });
const lire = (f) => fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), f), 'utf8');

async function attendre(p, ms = 1500) { await p.waitForLoadState('networkidle').catch(() => {}); await p.waitForTimeout(ms); }
async function figer(p, nom) {
  const html = await p.evaluate(() => {
    document.querySelectorAll('script, noscript, link[rel=preload], link[rel=modulepreload], link[rel=prefetch], link[rel=dns-prefetch], link[rel=preconnect], link[rel=manifest]').forEach((e) => e.remove());
    document.querySelectorAll('textarea').forEach((t) => { t.textContent = t.value; });
    document.querySelectorAll('input').forEach((i) => {
      if (i.type === 'checkbox' || i.type === 'radio') i.checked ? i.setAttribute('checked', '') : i.removeAttribute('checked');
      else i.setAttribute('value', i.value);
    });
    document.querySelectorAll('select').forEach((s) => [...s.options].forEach((o) => (o.selected ? o.setAttribute('selected', '') : o.removeAttribute('selected'))));
    document.querySelectorAll('meta[charset]').forEach((m) => m.remove());
    const mc = document.createElement('meta'); mc.setAttribute('charset', 'utf-8'); document.head.prepend(mc);
    const st = document.createElement('style'); st.id = 'fige';
    st.textContent = '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}html{scroll-behavior:auto!important}';
    document.head.appendChild(st);
    return '<!doctype html>\n' + document.documentElement.outerHTML;
  });
  // chemins absolus du site → relatifs au fichier (le film sert le dossier ui/ tel quel)
  const rel = html.replace(/(href|src)="\/(?!\/)/g, '$1="').replace(/url\(\/(?!\/)/g, 'url(').replace(/url\(&quot;\/(?!\/)/g, 'url(&quot;');
  fs.writeFileSync(path.join(OUT, nom + '.html'), rel);
  const box = await p.evaluate(() => ({ h: document.documentElement.scrollHeight, y: scrollY }));
  console.log(`→ ui/${nom}.html (${(rel.length / 1024).toFixed(0)} ko, page ${box.h} px)`);
}

const SCENES = {
  async accueil(p) { await p.goto(BASE + '/app', { waitUntil: 'networkidle' }); await attendre(p, 2500); await figer(p, 'accueil'); },
  async parc(p) { await p.goto(BASE + '/app/parc', { waitUntil: 'networkidle' }); await attendre(p); await figer(p, 'parc'); },
  async analyser(p) {
    await p.goto(BASE + '/app/analyser', { waitUntil: 'networkidle', timeout: 180000 }); await attendre(p, 4000);
    await figer(p, 'analyser-vide');
    await p.locator('textarea').first().fill(lire('annonce-208.txt')); await p.waitForTimeout(500);
    await figer(p, 'analyser-208');
    await p.getByRole('button', { name: /Analyser l.annonce/ }).first().click();
    for (const [k, ms] of [[1, 400], [2, 1200], [3, 2500], [4, 4500]]) { await p.waitForTimeout(ms); await figer(p, 'analyse-attente-' + k); }
    await p.waitForURL(/rapports\//, { timeout: 60000 }).catch(() => {}); await p.waitForTimeout(3000);
    await p.goto(p.url(), { waitUntil: 'networkidle' }); await attendre(p, 2000); console.log('   rapport :', p.url());
    await figer(p, 'rapport-208');
  },
  async clio(p) {
    await p.goto(BASE + '/app/analyser', { waitUntil: 'networkidle', timeout: 180000 }); await attendre(p, 4000);
    await p.locator('textarea').first().fill(lire('annonce-clio.txt')); await p.waitForTimeout(500);
    await p.getByRole('button', { name: /Analyser l.annonce/ }).first().click();
    await p.waitForURL(/rapports\//, { timeout: 60000 }).catch(() => {}); await p.waitForTimeout(3000);
    await p.goto(p.url(), { waitUntil: 'networkidle' }); await attendre(p, 2000); console.log('   rapport :', p.url());
    await figer(p, 'rapport-clio');
  },
  async recherche(p) { await chercherClio(p); await figer(p, 'recherche'); },
  async alertes(p) {
    await p.goto(BASE + '/app/recherche', { waitUntil: 'networkidle' }); await attendre(p, 2000); await figer(p, 'alertes-off');
    const sw = p.getByRole('switch').first();
    if (await sw.count()) { await sw.click(); await attendre(p, 2000); } else console.log('   pas d\'interrupteur trouvé');
    await figer(p, 'alertes-on');
  },
  async messages(p) {
    await p.goto(BASE + '/app/messages', { waitUntil: 'networkidle' }); await attendre(p, 2000);
    const d = p.locator('summary', { hasText: /Détail des/ }).first(); if (await d.count()) { await d.click(); await p.waitForTimeout(600); }
    await figer(p, 'messages');
  },
};

const quoi = (process.argv[2] || Object.keys(SCENES).join(',')).split(',');
const { b, p } = await ouvrir({ w: 390, h: 844, sc: 1 });
for (const s of quoi) { console.log('•', s); await SCENES[s](p); }
await b.close();
// styles, polices et fichiers publics, une fois
fs.mkdirSync(path.join(OUT, '_next/static/chunks'), { recursive: true }); fs.mkdirSync(path.join(OUT, '_next/static/media'), { recursive: true });
for (const f of fs.readdirSync(path.join(APP, '.next/static/chunks')).filter((f) => f.endsWith('.css'))) fs.copyFileSync(path.join(APP, '.next/static/chunks', f), path.join(OUT, '_next/static/chunks', f));
for (const f of fs.readdirSync(path.join(APP, '.next/static/media'))) fs.copyFileSync(path.join(APP, '.next/static/media', f), path.join(OUT, '_next/static/media', f));
fs.cpSync(path.join(APP, 'public'), OUT, { recursive: true });
console.log('styles, polices et public copiés');
