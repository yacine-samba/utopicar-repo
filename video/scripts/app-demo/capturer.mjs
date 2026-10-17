// Captures HD (3×) de la vraie app locale pour la présentation, avec la position des blocs clés (rects.json, px CSS).
// Écrans : analyser (formulaire rempli), rapport de la 208 (page entière), résultats de recherche Clio 4 (haut de liste),
// Mes recherches (alerte éteinte puis allumée), messages (compteurs, boîte, campagne et envois de la nuit).
// usage : ALERTE_ON= node capturer.mjs ../../assets/presente-v/app   (faux Supabase et app lancés)
import fs from 'node:fs';
import { ouvrir, chercherClio, BASE } from './session.mjs';
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const R = {};
const rect = async (p, sel, re) => p.evaluate(([s, r]) => { const rx = new RegExp(r); const e = [...document.querySelectorAll(s)].filter((x) => rx.test(x.textContent || '') && x.getBoundingClientRect().height > 40).sort((a, b) => a.textContent.length - b.textContent.length)[0]; if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.x, y: q.y + scrollY, w: q.width, h: q.height }; }, [sel, re]);
const propre = (p) => p.evaluate(() => { document.activeElement?.blur(); for (const a of document.querySelectorAll('a,button')) if (/Aller au contenu|animations en pause/.test(a.textContent)) a.style.display = 'none'; });
// pages longues : la barre du bas (fixe) et les bulles disparaissent, l'en-tête collant reprend sa place en haut
const aPlat = (p) => p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { const cs = getComputedStyle(e); if (cs.position === 'fixed') e.style.display = 'none'; else if (cs.position === 'sticky') e.style.position = 'relative'; } scrollTo(0, 0); });
const { b, p } = await ouvrir({ sc: 3 });
// 1. analyser : formulaire rempli, puis le rapport
await p.goto(BASE + '/app/analyser', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
await p.locator('textarea').first().fill(fs.readFileSync('annonce-208.txt', 'utf8')); await p.locator('textarea').first().evaluate((e) => (e.scrollTop = 0)); await propre(p); await aPlat(p);
R.form = { champ: await rect(p, 'textarea', '.'), bouton: await rect(p, 'button', "^Analyser l.annonce$") };
await p.screenshot({ path: `${OUT}/analyser.png`, fullPage: true });
await p.getByRole('button', { name: /Analyser l.annonce/ }).first().click();
await p.waitForURL(/rapports\//, { timeout: 60000 }); await p.waitForLoadState('networkidle'); await p.waitForTimeout(1500); await propre(p); await aPlat(p);
R.rapport = { verdict: await rect(p, 'div,section', '^AVANT LE PREMIER MESSAGE|Avant le premier message'), prix: await rect(p, 'body *', 'Bon prix[\\s\\S]*Trop cher'), travaux: await rect(p, 'body *', 'Des travaux[\\s\\S]*540'), marge: await rect(p, 'body *', 'Ça rapporte[\\s\\S]*688'), verdict2: await rect(p, 'div,section', 'À éviter[\\s\\S]*Passez'), titre: await rect(p, 'h1,h2', 'Peugeot 208') };
await p.screenshot({ path: `${OUT}/rapport.png`, fullPage: true });
// 2. recherche : résultats (haut de liste, 7 000 px)
await chercherClio(p); await p.waitForTimeout(6000); await propre(p); await aPlat(p);
R.recherche = { liste: await rect(p, 'h2,h3,p,div', '^220 annonces'), carte1: await rect(p, 'body *', 'dCi 75 Zen[\\s\\S]*2\\s?300\\s?€ sous'), resultats: await rect(p, 'body *', '^220 annonces . Renault Clio 4') };
await p.screenshot({ path: `${OUT}/recherche.png`, fullPage: true, clip: { x: 0, y: 0, width: 390, height: 7000 } });
// 3. mes recherches : alerte éteinte puis allumée
await p.getByText('Mes recherches', { exact: true }).first().click(); await p.waitForTimeout(1500); await p.evaluate(() => scrollTo(0, 0)); await propre(p);
R.alerte = { carte: await rect(p, 'div', 'Renault Clio 4[\\s\\S]*Alerte e-mail'), interrupteur: await rect(p, '[role=switch]', '.') };
await p.screenshot({ path: `${OUT}/alerte-off.png`, clip: { x: 0, y: 0, width: 390, height: 1400 } });
await p.getByRole('switch').first().click(); await p.waitForTimeout(2500); await propre(p);
await p.screenshot({ path: `${OUT}/alerte-on.png`, clip: { x: 0, y: 0, width: 390, height: 1400 } });
// 4. messages : envois de la nuit dépliés
await p.goto(BASE + '/app/messages', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
await p.getByText(/Détail des \d+ annonces/).first().click().catch(() => {}); await p.waitForTimeout(800); await propre(p); await aPlat(p);
R.messages = { envois: await rect(p, 'body *', 'Détail des[\\s\\S]*01:1'), compteurs: await rect(p, 'div', '^Messages envoyés'), boite: await rect(p, 'div,section', '^Boîte de réception'), campagne: await rect(p, 'div,section', '^Renault Clio 4 diesel'), titre: await rect(p, 'h1', 'Messages') };
await p.screenshot({ path: `${OUT}/messages.png`, fullPage: true });
fs.writeFileSync(`${OUT}/rects.json`, JSON.stringify(R, null, 1)); console.log(JSON.stringify(R));
await b.close();
