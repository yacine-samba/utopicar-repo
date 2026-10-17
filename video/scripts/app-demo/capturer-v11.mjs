// Captures de la vraie app (main) pour la présentation v11 : le parcours analyser → trouver → négocier → revendre,
// sur la base démo (annonces d'essai, cote réelle relue le 17 oct. 2026). Trois sortes d'images :
//  - écrans du téléphone (2×, barre du bas comprise) : analyser, lien collé, lecture, analyse en cours, haut du rapport ;
//  - pages entières à plat (2×) pour les faire défiler : rapports de la Polo et de la Clio, recherche, parc ;
//  - blocs du rapport en gros plan (3×) : verdict, quatre questions, offre et plafond, premier message.
// Les textes lus dans chaque bloc vont dans textes.json : on y vérifie chaque chiffre avant de l'écrire dans le film.
// usage : node capturer-v11.mjs ../../assets/presente-v11/app
//   (faux Supabase lancé avec DELAI_IMPORT=3500 DELAIS=cote_marche:6000, app sur localhost:3100)
import fs from 'node:fs';
import { ouvrir, BASE } from './session.mjs';
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const T = {};
// l'espace fine des montants (U+202F, « 5 750 € ») n'a pas de glyphe dans les polices du conteneur de capture et disparaît
// (« 5750 € ») : remplacée par l'espace insécable, que les polices du site ont
const propre = (p) => p.evaluate(() => { document.activeElement?.blur(); for (const a of document.querySelectorAll('a,button')) if (/Aller au contenu|animations en pause/.test(a.textContent)) a.style.display = 'none';
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (n.nodeValue.includes('\u202f')) n.nodeValue = n.nodeValue.replace(/\u202f/g, '\u00a0');
  for (const i of document.querySelectorAll('input')) if (i.value.includes('\u202f')) i.value = i.value.replace(/\u202f/g, '\u00a0'); });
// pages longues : la barre du bas (fixe) et les bulles disparaissent, l'en-tête collant reprend sa place en haut
const aPlat = (p) => p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { const cs = getComputedStyle(e); if (cs.position === 'fixed') e.style.display = 'none'; else if (cs.position === 'sticky') e.style.position = 'relative'; } scrollTo(0, 0); });
// le plus petit bloc arrondi dont le texte correspond : marqué data-cap=<nom>, son texte est gardé
const marque = (p, nom, re, sel = '[class*="rounded"], .carte') => p.evaluate(([n, r, s]) => {
  const rx = new RegExp(r, 'i');   // innerText rend les majuscules CSS ; les « ? » ont une espace insécable
  const c = [...document.querySelectorAll(s)].filter((e) => rx.test(e.innerText || '') && e.getBoundingClientRect().height > 30).sort((a, b) => a.innerText.length - b.innerText.length)[0];
  if (!c) return null; c.setAttribute('data-cap', n); return c.innerText;
}, [nom, re, sel]);
const blocs = async (p, pre, liste) => { await propre(p); for (const [nom, re, sel] of liste) { const t = await marque(p, `${pre}-${nom}`, re, sel); T[`${pre}-${nom}`] = t; if (t) await p.locator(`[data-cap="${pre}-${nom}"]`).screenshot({ path: `${OUT}/${pre}-${nom}.png` }); else console.log('bloc introuvable', pre, nom); } };
const RAPPORT = [
  ['verdict', 'Avant le premier message[\\s\\S]*sur 100'],
  ['fiable', '^Fiable\\s?\\?'], ['travaux', '^Des travaux\\s?\\?'], ['prix', '^Bon prix\\s?\\?'], ['rapporte', '^Ça rapporte\\s?\\?'],
  ['reste', "^Ce qu'il vous resterait"], ['offre', "^Offre d'ouverture"], ['plafond', '^Prix à ne pas dépasser'],
  ['demander', '^Avant de vous déplacer, demandez'], ['calcul', 'Ce qui reste[\\s\\S]*Prix maximum'],
];
// analyse d'une annonce par son lien, avec les écrans de l'attente
async function analyser(p, lien, pre, attente) {
  await p.goto(BASE + '/app/analyser', { waitUntil: 'networkidle', timeout: 180000 }); await p.waitForTimeout(1500); await propre(p);
  if (attente) await p.screenshot({ path: `${OUT}/ecran-analyser.png` });
  await p.getByPlaceholder(/leboncoin\.fr\/ad\/voitures/).first().fill(lien); await p.waitForTimeout(400); await propre(p);
  if (attente) await p.screenshot({ path: `${OUT}/ecran-colle.png` });
  await p.getByRole('button', { name: /Analyser ce lien/ }).first().click();
  if (attente) {
    await p.waitForTimeout(1500); await propre(p); await p.screenshot({ path: `${OUT}/ecran-lecture.png` });
    await p.getByText('Analyse en cours…').first().waitFor({ timeout: 30000 }); await p.waitForTimeout(4200); await propre(p);
    await p.screenshot({ path: `${OUT}/ecran-analyse.png` });
  }
  await p.waitForURL(/rapports\//, { timeout: 90000 }); await p.waitForLoadState('networkidle'); await p.waitForTimeout(2000); await propre(p);
  T[`${pre}-url`] = p.url();
  await p.screenshot({ path: `${OUT}/ecran-${pre}-haut.png` });
  await aPlat(p); await p.waitForTimeout(300); await propre(p);
  await p.screenshot({ path: `${OUT}/page-${pre}.png`, fullPage: true });
  T[`${pre}-page`] = await p.locator('main').innerText().catch(() => null);
  return p.url();
}

const A = await ouvrir({ sc: 2 }), p = A.p;
const urlPolo = await analyser(p, 'https://www.leboncoin.fr/ad/voitures/2873461903', 'polo', true);
const urlClio = await analyser(p, 'https://www.leboncoin.fr/ad/voitures/2870558214', 'clio', false);

// recherche : Clio 4 diesel, au moins 15 % sous la cote (dans « Plus de filtres »), puis l'alerte e-mail
await p.goto(BASE + '/app/recherche?vue=chercher', { waitUntil: 'networkidle', timeout: 180000 }); await p.waitForTimeout(1500);
const sel = p.locator('select');
await sel.nth(0).selectOption({ label: 'Renault' }); await p.waitForTimeout(400);
await sel.nth(1).selectOption({ label: 'Clio' }); await p.waitForTimeout(400);
await sel.nth(2).selectOption({ label: 'Clio 4 (2012 – 2019)' });
await p.locator('select').filter({ has: p.locator('option', { hasText: 'Diesel' }) }).first().selectOption({ label: 'Diesel' });
await p.getByText('Plus de filtres').first().click(); await p.waitForTimeout(600);
await p.getByPlaceholder('ex. 10').first().fill('15'); await p.waitForTimeout(400); await propre(p);
await p.screenshot({ path: `${OUT}/ecran-recherche.png` });
await aPlat(p); await propre(p); await p.screenshot({ path: `${OUT}/page-recherche.png`, fullPage: true });
await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
await p.getByText('Mes recherches', { exact: true }).first().click(); await p.waitForTimeout(1500); await propre(p);
await p.screenshot({ path: `${OUT}/ecran-alerte-off.png` });
await p.locator('[role=switch]').first().click(); await p.waitForTimeout(1500); await propre(p);
await p.screenshot({ path: `${OUT}/ecran-alerte-on.png` });
T.alerte = await p.locator('main').innerText().catch(() => null);

// parc : la Clio ajoutée depuis son rapport arrive en « Repérée »
await p.goto(urlClio, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
const ajout = p.getByRole('button', { name: /Ajouter au parc/ }).first();
if (await ajout.count()) { await ajout.click(); await p.waitForTimeout(2500); } else console.log('pas de bouton Ajouter au parc');
await p.goto(BASE + '/app/parc', { waitUntil: 'networkidle' }); await p.waitForTimeout(2000); await propre(p);
await p.screenshot({ path: `${OUT}/ecran-parc.png` });
await aPlat(p); await propre(p); await p.screenshot({ path: `${OUT}/page-parc.png`, fullPage: true });
T.parc = await p.locator('main').innerText().catch(() => null);
// la Clio vendue, avec sa marge réelle (onglet « Vendues »)
await p.goto(BASE + '/app/parc', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
await p.getByText('Vendues', { exact: true }).first().click(); await p.waitForTimeout(1500); await propre(p);
await p.screenshot({ path: `${OUT}/ecran-parc-vendues.png` });
T['parc-vendues'] = await p.locator('main').innerText().catch(() => null);
await A.b.close();

// blocs des deux rapports en gros plan (3×), sur un grand téléphone (430 px) : les montants ne passent pas à la ligne
const B = await ouvrir({ w: 430, h: 932, sc: 3 });
for (const [pre, u] of [['polo', urlPolo], ['clio', urlClio]]) {
  await B.p.goto(u, { waitUntil: 'networkidle' }); await B.p.waitForTimeout(2000); await propre(B.p); await aPlat(B.p);
  await blocs(B.p, pre, RAPPORT);
}
// la recherche suivie, « Alerte e-mail » allumée (l'interrupteur a été basculé plus haut)
await B.p.goto(BASE + '/app/recherche?vue=chercher', { waitUntil: 'networkidle' }); await B.p.waitForTimeout(1200);
await B.p.getByText('Mes recherches', { exact: true }).first().click(); await B.p.waitForTimeout(1500); await aPlat(B.p);
await blocs(B.p, 'recherche', [['suivie', '^Renault Clio 4[\\s\\S]*Alerte e-mail']]);
await B.p.goto(BASE + '/app/parc', { waitUntil: 'networkidle' }); await B.p.waitForTimeout(1500);
await B.p.getByText('Vendues', { exact: true }).first().click(); await B.p.waitForTimeout(1500); await propre(B.p); await aPlat(B.p);
await blocs(B.p, 'parc', [['clio', 'Clio IV 1.5 dCi 75 Zen[\\s\\S]*Vendue[\\s\\S]*Marge'], ['clio-chiffres', '^Renault Clio IV 1.5 dCi 75 Zen[\\s\\S]*Marge réelle', 'div']]);
await B.b.close();
fs.writeFileSync(`${OUT}/textes.json`, JSON.stringify(T, null, 1));
console.log('→', OUT);
