'use strict';
/* Utopicar 4.6 : relevé automatique des cotes sur tout Leboncoin.
   Toutes les marques de Leboncoin, chaque modèle de chaque marque, et pour chaque modèle les énergies essence, diesel,
   hybride et électrique ; chaque recherche est relevée page après page (100 pages au plus : au-delà, Leboncoin n'affiche
   plus rien, le nombre total de résultats est noté pour la Cote). Annonces de 500 € et plus, 250 000 km au plus.
   Pour lire moins de pages sans rien perdre : une recherche qui tient en 100 pages (3 500 annonces) est lue en entier
   puis répartie par modèle et par énergie ; seule une recherche plus grande est découpée (marque → modèles → énergies).
   Les annonces sont gardées dans l'extension, puis envoyées à Utopicar à la fin (base du marché et bilan dans la Cote).
   Chargé par background.js (importScripts) : utilise SITE, RELEVE_MAX, RELEVE_PAUSE, sleep, rand, notify, deliver,
   waitComplete, running et lbcPage, lbcReferentiel (extract.js). */

const LBC_RECHERCHE = 'https://www.leboncoin.fr/recherche';
const ENERGIES = ['essence', 'diesel', 'hybride', 'electrique'];
const NOM_EN = {essence: 'essence', diesel: 'diesel', hybride: 'hybride', electrique: 'électrique'};
const FUEL = {essence: '1', diesel: '2', hybride: '6,8', electrique: '4'};   // codes Leboncoin (hybride : simple et rechargeable)
const PRIX_MIN = 500, KM_MAX = 250000;
const BAL_PAUSE = [4000, 8000];       // entre deux recherches
const BAL_REPOS = [60000, 120000];    // une pause plus longue toutes les 40 recherches
const BAL_REPOS_TOUS = 40;
const LOT_ENVOI = 2500;               // annonces par envoi à Utopicar
/* Marques essayées en plus de celles que Leboncoin donne (codes de filtre : nom en capitales, sans accent).
   Une marque inconnue de Leboncoin ne renvoie rien et est ignorée ; une marque vue dans une annonce est ajoutée. */
const MARQUES_CONNUES = ['ABARTH', 'AC', 'AIWAYS', 'AIXAM', 'ALFA ROMEO', 'ALPINA', 'ALPINE', 'ASTON MARTIN', 'AUDI', 'AUSTIN',
  'AUTOBIANCHI', 'BELLIER', 'BENTLEY', 'BMW', 'BUGATTI', 'BUICK', 'BYD', 'CADILLAC', 'CASALINI', 'CATERHAM', 'CHATENET',
  'CHEVROLET', 'CHRYSLER', 'CITROEN', 'CUPRA', 'DACIA', 'DAEWOO', 'DAIHATSU', 'DANGEL', 'DE TOMASO', 'DODGE', 'DONKERVOORT',
  'DR', 'DS', 'FERRARI', 'FIAT', 'FISKER', 'FORD', 'GENESIS', 'GMC', 'GRECAV', 'HONDA', 'HUMMER', 'HYUNDAI', 'INEOS',
  'INFINITI', 'INNOCENTI', 'ISUZU', 'IVECO', 'JAGUAR', 'JDM', 'JEEP', 'KIA', 'KTM', 'LADA', 'LAMBORGHINI', 'LANCIA',
  'LAND ROVER', 'LAND-ROVER', 'LEAPMOTOR', 'LEXUS', 'LIGIER', 'LINCOLN', 'LOTUS', 'LYNK & CO', 'MAHINDRA', 'MASERATI',
  'MAYBACH', 'MAZDA', 'MCLAREN', 'MEGA', 'MERCEDES', 'MERCEDES-BENZ', 'MG', 'MG MOTOR', 'MICROCAR', 'MINI', 'MITSUBISHI',
  'MORGAN', 'NIO', 'NISSAN', 'OMODA', 'OPEL', 'PEUGEOT', 'PIAGGIO', 'POLESTAR', 'PONTIAC', 'PORSCHE', 'PROTON', 'RENAULT',
  'ROLLS ROYCE', 'ROLLS-ROYCE', 'ROVER', 'SAAB', 'SANTANA', 'SEAT', 'SERES', 'SIMCA', 'SKODA', 'SMART', 'SSANGYONG',
  'SUBARU', 'SUZUKI', 'TALBOT', 'TATA', 'TESLA', 'TOYOTA', 'TRIUMPH', 'VOLKSWAGEN', 'VOLVO', 'XPENG', 'ZEEKR'];

let balRunning = false, balStop = '';   // balStop : 'pause' ou 'abandon', pris en compte entre deux pages
let balEnvoi = false;

const plat = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
function normEnergie(s){ s = plat(s); return /diesel|gazole/.test(s) ? 'diesel' : /hybride/.test(s) ? 'hybride' : /lectrique/.test(s) ? 'electrique' : /essence/.test(s) ? 'essence' : ''; }
/** Attente qui reste à l'écoute de « Pause » (et garde l'arrière-plan éveillé : Chrome l'arrête après 30 s sans activité). */
async function attendre(ms){
  const fin = Date.now() + ms;
  while (Date.now() < fin && !balStop){ await sleep(Math.min(5000, fin - Date.now())); await chrome.runtime.getPlatformInfo(); }
}

/* ---- état gardé dans l'extension ----
   bal : avancement et chiffres (écrit souvent) · balFile : les recherches à faire, dans l'ordre · balLignes : le bilan
   (une ligne par recherche) · balRef : marques et modèles de Leboncoin · balI:<n> : annonces de la recherche n. */
async function lireBal(){
  const r = await chrome.storage.local.get(['bal', 'balFile', 'balLignes', 'balRef']);
  return r.bal ? {...r.bal, file: r.balFile || [], lignes: r.balLignes || [], ref: r.balRef || {marques: {}, modeles: {}}} : null;
}
const ecrireBal = bal => { const {file, lignes, ref, ...leger} = bal; return chrome.storage.local.set({bal: {...leger, n: file.length}}); };
const ecrireFile = bal => chrome.storage.local.set({balFile: bal.file});
const ecrireLignes = bal => chrome.storage.local.set({balLignes: bal.lignes});
async function etatBal(bal, msg){
  if (msg != null) bal.msg = msg;
  await ecrireBal(bal);
  if (!running){
    const pct = Math.floor(100 * (bal.marquesFaites || 0) / Math.max(1, bal.nMarques || 1));
    chrome.action.setBadgeText({text: bal.actif && !bal.pause ? pct + '%' : bal.pause ? '||' : ''});
    chrome.action.setBadgeBackgroundColor({color: bal.pause ? '#5E6670' : '#FF5A1F'});
  }
}

/* ---- recherches Leboncoin ---- */
function urlLbc(s){
  const p = new URLSearchParams({category: '2', price: `${PRIX_MIN}-max`, mileage: `min-${KM_MAX}`});
  p.set('u_car_brand', s.mq);
  if (s.md) p.set('u_car_model', s.md);
  if (s.en) p.set('fuel', FUEL[s.en]);
  return LBC_RECHERCHE + '?' + p.toString().replace(/%2C/g, ',');
}
const libelle = s => [s.mql || s.mq, s.md ? (s.mdl || s.md.split('_').slice(1).join('_')) : '', s.en ? NOM_EN[s.en] : ''].filter(Boolean).join(' ');
const nomModele = (bal, mq, md, vu) => (bal.ref.modeles[mq] || {})[md] || vu || md.split('_').slice(1).join('_') || md;

/** Un onglet Leboncoin où lire les recherches : celui du relevé, sinon un onglet Leboncoin ouvert, sinon un nouvel onglet de fond. */
async function ongletLbc(id){
  const estLbc = t => t && /^https:\/\/www\.leboncoin\.fr\//.test(t.url || t.pendingUrl || '');
  if (id){ try { const t = await chrome.tabs.get(id); if (estLbc(t) && !t.discarded) return t.id; } catch(e){} }
  const tabs = await chrome.tabs.query({url: 'https://www.leboncoin.fr/*'});
  const t = tabs.find(x => !x.discarded);
  if (t) return t.id;
  const n = await chrome.tabs.create({url: LBC_RECHERCHE + '?category=2', active: false});
  await waitComplete(n.id, 30000); await sleep(rand(1500, 2500));
  return n.id;
}
async function dansOnglet(bal, func, args){
  for (let essai = 0; essai < 2; essai++){
    try {
      bal.tabId = await ongletLbc(bal.tabId);
      const [res] = await chrome.scripting.executeScript({target: {tabId: bal.tabId}, func, args: args || []});
      return res && res.result;
    } catch(e){ bal.tabId = null; await sleep(3000); }   // onglet fermé ou rechargé : un autre
  }
  return {err: 'onglet Leboncoin indisponible'};
}
const lirePage = (bal, p, url) => dansOnglet(bal, lbcPage, [p, url]);

/** Annonce gardée dans l'extension : l'essentiel pour la base du marché, avec les codes Leboncoin de marque et modèle. */
function compacte(it){
  const f = it.f || {}, id = (String(it.u || '').match(/(\d{6,14})(?:\.htm)?$/) || String(it.u || '').match(/(\d{6,14})/) || [])[1];
  const prix = Number(f.prix) || null, km = f.km != null ? Number(f.km) : null;
  if (!id || !prix) return null;
  return {i: id, t: String(it.t || '').slice(0, 140), p: prix, a: f.annee || null, k: km, e: String(f.energie || ''), b: String(f.boite || ''), c: f.ch || null,
    pro: !!f.pro, cp: String(f.cp || '').slice(0, 10), q: String(f.mq || ''), m: String(f.md || ''), ql: String(f.mql || ''), ml: String(f.mdl || '')};
}
/** Annonces de la recherche : dans les limites (prix, km), de cette marque, de ce modèle, de cette énergie. */
const garder = s => x => x && x.p >= PRIX_MIN && x.p <= 300000 && (x.k == null || x.k <= KM_MAX) && (!x.q || x.q === s.mq)
  && (!s.md || !x.m || x.m === s.md) && ENERGIES.includes(normEnergie(x.e)) && (!s.en || normEnergie(x.e) === s.en);

/** Lit une recherche : page 1, puis les suivantes si elles doivent l'être. */
async function lireRecherche(bal, s, prefixe, combien){
  const url = urlLbc(s), lib = libelle(s), brut = [], seen = new Set();
  let total = null, pages = 1, erreur = '';
  for (let p = 1; p <= pages; p++){
    if (balStop) return {stop: true};
    await etatBal(bal, `${prefixe}${lib} : page ${p}${pages > 1 ? ' sur ' + pages : ''}…`);
    const r = await lirePage(bal, p, url);
    if (!r || r.blocked) return {blocked: true};
    if (r.err){ if (p === 1) return {err: r.err, lent: r.lent}; erreur = r.err; break; }
    if (p === 1){
      total = r.total != null ? r.total : r.items.length;
      const per = Math.max(1, r.items.length), utiles = Math.ceil(Math.min(total, RELEVE_MAX) / per);
      pages = Math.max(1, Math.min(r.max_pages || 100, utiles, combien(total)));
    }
    let add = 0;
    for (const it of r.items){ if (!seen.has(it.u)){ seen.add(it.u); brut.push(it); add++; } }
    if (!add) break;
    if (p < pages) await attendre(rand(RELEVE_PAUSE[0], RELEVE_PAUSE[1]));
  }
  return {total, brut, erreur};
}

/** Recherches à faire pour une marque trop grande : ses modèles (Leboncoin, catalogue Utopicar, annonces vues). */
function modelesDe(bal, mq, items){
  const m = new Map(Object.entries(bal.ref.modeles[mq] || {}));
  for (const code of bal.catModeles[mq] || []) if (!m.has(code)) m.set(code, code.split('_').slice(1).join('_'));
  for (const x of items) if (x.m && x.q === mq && !m.has(x.m)) m.set(x.m, x.ml || x.m.split('_').slice(1).join('_'));
  return [...m].sort((a, b) => plat(a[1]).localeCompare(plat(b[1]), 'fr', {numeric: true}));
}

/** Une étape : lit la recherche, garde ses annonces, écrit ses lignes du bilan, et découpe si elle dépasse 100 pages. */
async function traiterEtape(bal, idx, prefixe){
  const s = bal.file[idx];
  // liste des modèles donnée par Leboncoin (celle du catalogue Utopicar est incomplète : elle ne suffit pas)
  const ref = !!(bal.ref.modeles[s.mq] && Object.keys(bal.ref.modeles[s.mq]).length);
  // trop grande pour être lue en entier : une marque dont on connaît les modèles, ou un modèle (découpé par énergie) : page 1 seulement ;
  // une marque sans liste de modèles est lue sur ses 100 pages pour découvrir ses modèles
  const combien = total => total <= RELEVE_MAX || s.t === 'energie' || (s.t === 'marque' && !ref) ? 100 : 1;
  const r = await lireRecherche(bal, s, prefixe, combien);
  if (r.stop || r.blocked || (r.err && !r.brut)) return r;
  const total = r.total || 0;
  // aucun résultat (modèle sans annonce dans cette énergie, marque inconnue de Leboncoin), ou filtre de marque ignoré
  // par Leboncoin (autant de résultats que tout Leboncoin) : rien à noter
  if (!total || (s.t === 'marque' && bal.grand && total >= bal.grand * 0.9)) return {vide: true};
  const items = r.brut.map(compacte).filter(garder(s));
  const complet = total <= RELEVE_MAX && !r.erreur;
  await chrome.storage.local.set({['balI:' + idx]: items});
  bal.lues += items.length;
  if (s.t === 'marque') s.mql = s.mql || (items.find(x => x.ql) || {}).ql || s.mq;

  // nouvelles marques vues dans les annonces (« à la une » d'une autre marque) : relevées à leur tour
  if (!bal.filtre) for (const x of r.brut.map(compacte)){
    if (x && x.q && !bal.connues.includes(x.q)){ bal.connues.push(x.q); bal.file.push({t: 'marque', mq: x.q, mql: x.ql || x.q}); bal.nMarques++; }
  }
  const base = {mq: s.mq, mql: s.mql || s.mq};
  if (complet){
    // tout est lu : une ligne par modèle et par énergie
    const g = new Map();
    for (const x of items){
      const md = s.md || x.m || '', en = normEnergie(x.e), k = md + '|' + en;
      if (!g.has(k)) g.set(k, {...base, md, mdl: md ? nomModele(bal, s.mq, md, s.mdl || x.ml) : 'modèle non précisé', en, total: 0, lus: 0, complet: true});
      const l = g.get(k); l.total++; l.lus++;
    }
    bal.lignes.push(...[...g.values()].sort((a, b) => plat(a.mdl).localeCompare(plat(b.mdl), 'fr', {numeric: true}) || ENERGIES.indexOf(a.en) - ENERGIES.indexOf(b.en)));
    if (s.t !== 'energie') bal.lignes.push({...base, md: s.md || '', mdl: s.mdl || '', en: '', niveau: s.t, total, lus: items.length, complet: true});
  } else if (s.t === 'energie'){
    // plus de 100 pages : Leboncoin n'en montre pas plus, le total est noté
    bal.lignes.push({...base, md: s.md, mdl: s.mdl, en: s.en, total, lus: items.length, complet: false, raison: r.erreur ? 'erreur' : '100 pages'});
    if (!r.erreur) bal.coupees++;
  } else {
    // trop grande : découpée (marque → modèles, modèle → énergies), lignes détaillées à suivre
    bal.lignes.push({...base, md: s.md || '', mdl: s.mdl || '', en: '', niveau: s.t, total, lus: items.length, complet: false, decoupee: true});
    const suite = s.t === 'marque'
      ? modelesDe(bal, s.mq, items).map(([md, mdl]) => ({t: 'modele', mq: s.mq, mql: base.mql, md, mdl}))
      : ENERGIES.map(en => ({t: 'energie', mq: s.mq, mql: base.mql, md: s.md, mdl: s.mdl, en}));
    bal.file.splice(idx + 1, 0, ...suite);
  }
  await ecrireFile(bal); await ecrireLignes(bal);
  return {ok: true, total, lus: items.length, complet};
}

/* ---- le relevé ---- */
async function runBalayage(){
  if (balRunning || balEnvoi) return;
  let bal = await lireBal();
  if (!bal || !bal.actif) return;
  balRunning = true; balStop = '';
  bal.pause = '';
  chrome.alarms.create('utp-bal', {periodInMinutes: 1});   // relance le relevé si le navigateur a coupé l'arrière-plan
  const eveil = setInterval(() => chrome.runtime.getPlatformInfo(), 20000);
  let fautes = 0, fini = false;
  try {
    if (!bal.prepare){ const ok = await preparer(bal); if (!ok) return; }
    while (bal.i < bal.file.length){
      if (balStop === 'abandon'){ bal.actif = false; bal.fin = Date.now(); await etatBal(bal, `Relevé arrêté : ${bal.marquesFaites} marques sur ${bal.nMarques}, ${bal.lues} annonces gardées. « Envoyer à Utopicar » les ajoute à la base.`); return; }
      if (balStop){ bal.pause = 'arret'; await etatBal(bal, `Relevé en pause : ${bal.marquesFaites} marques sur ${bal.nMarques}, ${bal.lues} annonces. « Reprendre » le continue.`); return; }
      const s = bal.file[bal.i];
      const prefixe = `Marque ${Math.min(bal.marquesFaites + 1, bal.nMarques)}/${bal.nMarques} · `;
      const r = await traiterEtape(bal, bal.i, prefixe);
      if (r.stop) continue;
      if (r.blocked){
        bal.pause = 'verification';
        const msg = `Leboncoin demande une vérification (à ${libelle(s)}). Validez-la vous-même dans l'onglet Leboncoin, puis « Reprendre ».`;
        await etatBal(bal, msg); notify(msg); return;
      }
      if (r.err){
        fautes++;
        if (fautes >= 2 || r.lent){
          bal.pause = 'erreur';
          const msg = `Relevé en pause à ${libelle(s)} : ${r.err}. Attendez un moment, puis « Reprendre ».`;
          await etatBal(bal, msg); notify(msg); return;
        }
        await etatBal(bal, `${prefixe}${libelle(s)} : ${r.err}, nouvel essai dans 20 s…`); await attendre(20000); continue;
      }
      fautes = 0;
      bal.i++; bal.recherches++;
      if (s.t === 'marque' && !r.vide) bal.marquesTrouvees++;
      // marque finie quand l'étape suivante est une autre marque
      if (!bal.file[bal.i] || bal.file[bal.i].mq !== s.mq) bal.marquesFaites++;
      await etatBal(bal, r.vide ? `${libelle(s)} : aucune annonce.` : `${prefixe}${libelle(s)} : ${r.total} résultats, ${r.lus} gardées${r.complet ? '' : (s.t === 'energie' ? ' (coupé à 100 pages)' : ' : découpage par ' + (s.t === 'marque' ? 'modèle' : 'énergie'))}.`);
      if (bal.i < bal.file.length && !balStop && !r.vide){
        const repos = bal.recherches % BAL_REPOS_TOUS === 0, p = repos ? rand(BAL_REPOS[0], BAL_REPOS[1]) : rand(BAL_PAUSE[0], BAL_PAUSE[1]);
        await etatBal(bal, `${repos ? 'Pause longue' : 'Pause'} de ${Math.round(p / 1000)} s avant ${libelle(bal.file[bal.i])}…`);
        await attendre(p);
      } else if (r.vide) await attendre(rand(1500, 3000));
    }
    bal.actif = false; bal.fin = Date.now(); fini = true;
    await etatBal(bal, `Relevé terminé : ${bal.marquesTrouvees} marques, ${bal.lues} annonces, ${bal.coupees} recherche(s) coupée(s) à 100 pages. Envoi à Utopicar…`);
  } catch(err){
    bal.pause = 'erreur'; await etatBal(bal, 'Erreur : ' + (err.message || err) + '. « Reprendre » relance à la même recherche.');
  } finally {
    clearInterval(eveil);
    balRunning = false; balStop = '';
    if (!bal.actif || bal.pause) chrome.alarms.clear('utp-bal');
  }
  if (fini) envoyerTout(true);   // fini : tout part sur Utopicar et la Cote s'ouvre
}

/** Avant la première recherche : marques et modèles de Leboncoin, et le nombre total d'annonces (pour repérer un filtre ignoré). */
async function preparer(bal){
  await etatBal(bal, 'Lecture des marques et modèles de Leboncoin…');
  const ref = await dansOnglet(bal, lbcReferentiel, []);
  if (ref && ref.marques){ bal.ref = {marques: ref.marques, modeles: ref.modeles || {}}; bal.source = ref.sources && ref.sources.length ? 'leboncoin' : 'annonces'; }
  // modèles connus du catalogue Utopicar (codes Leboncoin) : essayés aussi pour les grandes marques
  bal.catModeles = {};
  try {
    const r = await fetch(SITE + '/api/catalogue', {credentials: 'omit'});
    if (r.ok) for (const b of await r.json()){ if (b.lbc) bal.catModeles[b.lbc] = b.m.map(m => m.lbc).filter(Boolean); }
  } catch(e){}
  // tout Leboncoin (mêmes limites) : nombre d'annonces, et marques des annonces de la première page
  const g = await lirePage(bal, 1, LBC_RECHERCHE + `?category=2&price=${PRIX_MIN}-max&mileage=min-${KM_MAX}`);
  if (!g || g.blocked){ bal.pause = 'verification'; const msg = 'Leboncoin demande une vérification : validez-la vous-même dans l\'onglet Leboncoin, puis « Reprendre ».'; await etatBal(bal, msg); notify(msg); return false; }
  if (g.err){ bal.pause = 'erreur'; await etatBal(bal, 'Leboncoin illisible (' + g.err + '). Rechargez un onglet Leboncoin, puis « Reprendre ».'); return false; }
  bal.grand = g.total || 0;
  const noms = {...bal.ref.marques};
  for (const it of g.items || []){ const f = it.f || {}; if (f.mq && !noms[f.mq]) noms[f.mq] = f.mql || f.mq; }
  for (const code of Object.keys(bal.catModeles)) if (!noms[code]) noms[code] = code;
  for (const code of MARQUES_CONNUES) if (!noms[code]) noms[code] = code;
  let marques = Object.entries(noms);
  if (bal.filtre) marques = marques.filter(([c, n]) => bal.filtre.some(f => plat(n).includes(f) || plat(c).includes(f)));
  marques.sort((a, b) => plat(a[1]).localeCompare(plat(b[1]), 'fr'));
  bal.file = marques.map(([mq, mql]) => ({t: 'marque', mq, mql: mql === mq ? '' : mql}));
  bal.connues = Object.keys(noms);
  bal.nMarques = bal.file.length; bal.prepare = true;
  await chrome.storage.local.set({balRef: bal.ref});
  await ecrireFile(bal);
  await etatBal(bal, `${bal.nMarques} marques à relever (${bal.source === 'leboncoin' ? 'liste Leboncoin' : 'marques connues et vues dans les annonces'}), ${bal.grand} annonces sur Leboncoin dans ces limites.`);
  return true;
}

async function demarrerBalayage(filtre){
  const ancien = await chrome.storage.local.get('bal');
  const n = ancien.bal && ancien.bal.n || 0;
  if (n) await chrome.storage.local.remove(Array.from({length: n}, (_, k) => 'balI:' + k));
  await chrome.storage.local.set({balFile: [], balLignes: [], balRef: {marques: {}, modeles: {}}});
  const f = String(filtre || '').split(/[,;]+/).map(plat).filter(Boolean);
  await ecrireBal({id: crypto.randomUUID(), actif: true, pause: '', prepare: false, filtre: f.length ? f : null, debut: Date.now(), fin: null,
    file: [], lignes: [], ref: {marques: {}, modeles: {}}, catModeles: {}, connues: [], grand: 0, source: '',
    i: 0, nMarques: 0, marquesFaites: 0, marquesTrouvees: 0, recherches: 0, lues: 0, coupees: 0,
    envoi: {etat: '', idx: 0, envoyees: 0}, tabId: ancien.bal && ancien.bal.tabId || null, msg: 'Démarrage…'});
  runBalayage();
}

/* ---- envoi à Utopicar : les annonces par lots (base du marché), puis le bilan, puis la Cote s'ouvre ---- */
const versServeur = x => ({i: x.i, t: x.t, p: x.p, a: x.a >= 1950 && x.a <= 2035 ? x.a : null, k: x.k, e: x.e, b: x.b, c: x.c > 0 && x.c < 2000 ? x.c : null, pro: x.pro, cp: x.cp,
  mq: x.ql || x.q || '?', md: x.ml || (x.m ? x.m.split('_').slice(1).join('_') : null)});
function bilanDe(bal){
  return {v: 2, id: bal.id, debut: bal.debut, fin: bal.fin, grand: bal.grand, source: bal.source, filtre: bal.filtre,
    marques: bal.marquesTrouvees, recherches: bal.recherches, lues: bal.lues, coupees: bal.coupees, termine: !bal.actif && !!bal.fin && bal.i >= bal.file.length,
    lignes: bal.lignes};
}
async function poster(chemin, corps){
  for (let essai = 0; ; essai++){
    try {
      const r = await fetch(SITE + chemin, {method: 'POST', credentials: 'include', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(corps)});
      const j = await r.json().catch(() => null);
      if (r.ok) return {ok: true, j};
      if (r.status === 401 || r.status === 403 || r.status === 400 || essai >= 2) return {ok: false, status: r.status, err: (j && j.erreur) || 'Utopicar a répondu ' + r.status};
    } catch(e){ if (essai >= 2) return {ok: false, err: 'Utopicar injoignable'}; }
    await sleep(essai ? 15000 : 5000);
  }
}
async function envoyerTout(ouvrir){
  if (balEnvoi || balRunning) return {ok: false, err: 'Un envoi ou un relevé est déjà en cours.'};
  const bal = await lireBal();
  if (!bal || !bal.i) return {ok: false, err: 'Rien à envoyer.'};
  balEnvoi = true;
  const eveil = setInterval(() => chrome.runtime.getPlatformInfo(), 20000);
  try {
    const e = bal.envoi = bal.envoi && bal.envoi.idx <= bal.i ? bal.envoi : {idx: 0, envoyees: 0};
    e.etat = 'en cours';
    const vus = new Set(); let lot = [];
    const vider = async () => {
      for (let k = 0; k < lot.length; k += LOT_ENVOI){
        const r = await poster('/api/marche/balayage', {items: lot.slice(k, k + LOT_ENVOI)});
        if (!r.ok) return r;
        e.envoyees += Math.min(LOT_ENVOI, lot.length - k);
        await etatBal(bal, `Envoi à Utopicar : ${e.envoyees} annonces sur ${bal.lues}…`);
      }
      lot = []; return {ok: true};
    };
    for (let k = e.idx; k < bal.i; k++){
      const items = (await chrome.storage.local.get('balI:' + k))['balI:' + k] || [];
      for (const x of items) if (!vus.has(x.i)){ vus.add(x.i); lot.push(versServeur(x)); }
      if (lot.length >= LOT_ENVOI || k === bal.i - 1){
        const r = await vider();
        if (!r.ok){ e.etat = 'erreur'; const msg = `Envoi interrompu : ${r.err} Les annonces restent dans l'extension : « Envoyer à Utopicar » reprend l'envoi.`; await etatBal(bal, msg); notify(msg); return {ok: false, err: r.err}; }
        e.idx = k + 1; await ecrireBal(bal);
      }
    }
    const b = await poster('/api/marche/balayage/bilan', {id: bal.id, debut: bal.debut, fin: bal.fin || null, bilan: bilanDe(bal)});
    e.etat = b.ok ? 'fini' : 'erreur';
    const msg = b.ok ? `${e.envoyees} annonces ajoutées à la base du marché, bilan dans la Cote d'Utopicar${bal.coupees ? ` (${bal.coupees} recherche(s) coupée(s) à 100 pages)` : ''}. Cliquez pour l'ouvrir.`
      : `Annonces envoyées, mais le bilan n'a pas été gardé : ${b.err}`;
    await etatBal(bal, msg);
    if (ouvrir) await deliver('UTPBALAYAGE' + JSON.stringify(bilanDe(bal)), {kind: 'balayage', n: bal.lues, at: Date.now()}, 'releve', {brut: 'UTPBALAYAGE' + JSON.stringify(bilanDe(bal))}, false);
    notify(msg);
    return {ok: b.ok};
  } finally { clearInterval(eveil); balEnvoi = false; }
}

chrome.alarms?.onAlarm?.addListener(async a => {
  if (a.name !== 'utp-bal') return;
  const bal = await lireBal();
  if (!bal || !bal.actif || bal.pause){ chrome.alarms.clear('utp-bal'); return; }
  if (!balRunning) runBalayage();   // le navigateur avait arrêté l'arrière-plan : reprise à la recherche en cours
});
// navigateur relancé : le relevé ne repart pas tout seul, il attend « Reprendre »
chrome.runtime.onStartup.addListener(async () => {
  const bal = await lireBal();
  if (bal && bal.actif && !bal.pause){ bal.pause = 'arret'; await etatBal(bal, `Relevé en pause (navigateur relancé) : ${bal.marquesFaites} marques sur ${bal.nMarques}. « Reprendre » le continue.`); }
});

/** Messages de la fenêtre de l'extension (« utp-bal-… »). Renvoie true quand la réponse arrive plus tard. */
function balMessage(msg, send){
  if (msg.type === 'utp-bal-start'){
    if (balRunning || balEnvoi){ send({ok: false, err: 'Un relevé ou un envoi est déjà en cours.'}); return; }
    demarrerBalayage(msg.marques).then(() => send({ok: true}), e => send({ok: false, err: e.message || String(e)}));
    return true;
  }
  if (msg.type === 'utp-bal-reprendre'){
    lireBal().then(async bal => {
      if (!bal || !bal.actif){ send({ok: false, err: 'Aucun relevé à reprendre.'}); return; }
      if (!balRunning){ bal.pause = ''; await etatBal(bal, 'Reprise…'); runBalayage(); }
      send({ok: true});
    });
    return true;
  }
  if (msg.type === 'utp-bal-pause'){ if (balRunning) balStop = 'pause'; send({ok: true}); return; }
  if (msg.type === 'utp-bal-abandon'){
    if (balRunning){ balStop = 'abandon'; send({ok: true}); return; }   // la boucle s'arrête elle-même
    lireBal().then(async bal => { if (bal && bal.actif){ bal.actif = false; bal.pause = ''; bal.fin = Date.now(); await etatBal(bal, `Relevé arrêté : ${bal.lues} annonces gardées. « Envoyer à Utopicar » les ajoute à la base.`); } chrome.alarms.clear('utp-bal'); send({ok: true}); });
    return true;
  }
  if (msg.type === 'utp-bal-envoyer'){ envoyerTout(true).then(send); return true; }
  if (msg.type === 'utp-bal-bilan'){
    lireBal().then(async bal => {
      if (!bal || !bal.lignes.length){ send({ok: false, err: 'Pas encore de bilan.'}); return; }
      const brut = 'UTPBALAYAGE' + JSON.stringify(bilanDe(bal));
      await deliver(brut, {kind: 'balayage', n: bal.lues, at: Date.now()}, 'releve', {brut}, true); send({ok: true});
    });
    return true;
  }
}
