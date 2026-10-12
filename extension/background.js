'use strict';
/* Utopicar v4 : travail de fond. Lecture d'une annonce (texte + toutes les photos) et lecture en rafale
   des annonces cochées, au rythme d'une personne. Le résultat s'ouvre directement sur utopicar.fr
   (analyse, Tri rapide ou Cote) ; il est aussi copié, pour Ctrl+V en secours. */
importScripts('extract.js');

const SITE = 'https://www.utopicar.fr';
// où chaque envoi s'ouvre : l'annonce dans l'analyse, le lot dans le Tri rapide, le relevé dans la Cote
const PAGES = {annonce: '/app/analyser', lot: '/app/tri', releve: '/app/cote'};
const MAX_BATCH = 10;              // même limite que le Tri rapide
const PHOTOS_SINGLE = 20;          // annonce seule : jusqu'à 20 photos
const PHOTOS_BATCH = 8;            // rafale : 8 photos par annonce
const PAUSE_MIN = 4000, PAUSE_MAX = 9000;   // pause entre deux annonces (rythme humain)
const RELEVE_MAX = 3500;          // relevé : maximum de Leboncoin, 100 pages de 35 annonces
const RELEVE_PAUSE = [2000, 4000]; // pause entre deux pages de résultats

const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (a, b) => a + Math.round(Math.random() * (b - a));
let running = false, stopAsked = false;

async function setState(s){
  await chrome.storage.session.set({job: s});
  const t = s.running ? `${s.done}/${s.total}` : s.status === 'ok' ? 'OK' : s.status === 'bad' ? '!' : '';
  chrome.action.setBadgeText({text: t});
  chrome.action.setBadgeBackgroundColor({color: s.status === 'bad' ? '#BF2A21' : s.running ? '#FF5A1F' : '#0A7A43'});
}
function notify(message){
  try { chrome.notifications.create('utp-' + Date.now(), {type:'basic', iconUrl:'icons/128.png', title:'Utopicar', message, priority:1}); } catch(e){}
}
chrome.notifications?.onClicked?.addListener(() => montrer());

/* ---- ouverture sur utopicar.fr ---- */
async function montrer(){
  const { ouvert } = await chrome.storage.session.get('ouvert');
  if (ouvert){ try { const t = await chrome.tabs.get(ouvert); await chrome.tabs.update(t.id, {active:true}); await chrome.windows.update(t.windowId, {focused:true}); return; } catch(e){} }
  await openApp();
}
async function openApp(){
  const tabs = await chrome.tabs.query({url: ['https://www.utopicar.fr/*', 'https://utopicar.fr/*']});
  if (tabs[0]){ await chrome.tabs.update(tabs[0].id, {active:true}); await chrome.windows.update(tabs[0].windowId, {focused:true}); }
  else await chrome.tabs.create({url: SITE + '/app'});
}
/** Ouvre la page qui reçoit l'envoi : rechargée si elle est déjà ouverte, sinon dans un nouvel onglet.
    La page annonce qu'elle est prête, site.js lui passe l'envoi gardé ici (jamais par un serveur tiers). */
async function ouvrirSur(cible, actif){
  const url = SITE + PAGES[cible] + '?ext=1';
  const tabs = await chrome.tabs.query({url: ['https://www.utopicar.fr/*', 'https://utopicar.fr/*']});
  const deja = tabs.find(t => { try { return new URL(t.url).pathname === PAGES[cible]; } catch(e){ return false; } });
  let tab;
  if (deja){ tab = await chrome.tabs.update(deja.id, {url, active: actif}); }
  else { tab = await chrome.tabs.create({url, active: actif}); }
  if (actif && tab) await chrome.windows.update(tab.windowId, {focused:true});
  if (tab) await chrome.storage.session.set({ouvert: tab.id});
}

/* ---- photos : téléchargées par l'extension (l'outil ne peut pas charger d'image distante), réduites en JPEG ---- */
async function toDataUrl(url, maxSide, q){
  const r = await fetch(url, {credentials:'omit'});
  if (!r.ok) throw new Error('photo ' + r.status);
  const bmp = await createImageBitmap(await r.blob());
  const sc = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const c = new OffscreenCanvas(Math.max(1, Math.round(bmp.width*sc)), Math.max(1, Math.round(bmp.height*sc)));
  const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0,0,c.width,c.height); ctx.drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await c.convertToBlob({type:'image/jpeg', quality:q});
  const buf = new Uint8Array(await blob.arrayBuffer());
  let bin = ''; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  return 'data:image/jpeg;base64,' + btoa(bin);
}
async function grabPhotos(o, max, side, q, onStep){
  const urls = (o.photos || []).slice(0, max); const out = [];
  for (let i = 0; i < urls.length; i++){
    if (onStep) await onStep(i, urls.length);
    try { out.push(await toDataUrl(urls[i], side, q)); } catch(e){}
    await sleep(rand(120, 350));
  }
  delete o.photos; o.photosData = out; o.nbPhotosAnnonce = (o.ad && o.ad.images && (o.ad.images.nb_images || (o.ad.images.urls || []).length)) || urls.length;
  return o;
}

/* ---- copie dans le presse-papiers depuis l'arrière-plan (document hors écran) ---- */
async function copyText(text){
  try {
    const has = chrome.offscreen.hasDocument ? await chrome.offscreen.hasDocument() : false;
    if (!has) await chrome.offscreen.createDocument({url:'offscreen.html', reasons:['CLIPBOARD'], justification:'Copier l\'annonce vers Utopicar'});
    const r = await chrome.runtime.sendMessage({type:'utp-offcopy', text});
    // (document hors écran : seulement pour la copie de secours)
    return !!(r && r.ok);
  } catch(e){ return false; }
}
/* Envoi : gardé pour la page Utopicar (30 minutes, le temps de se connecter si besoin), copié en secours, puis ouvert. */
async function deliver(payload, meta, cible, envoi, actif){
  await chrome.storage.local.set({last: payload, lastMeta: meta, 'utp-envoi': {type: cible, brut: envoi.brut, images: envoi.images || [], t: Date.now()}});
  const copied = await copyText(payload);
  try { await ouvrirSur(cible, actif); } catch(e){}
  return copied;
}

/* ---- ouverture d'une annonce dans un onglet de fond, lecture, fermeture ---- */
function waitComplete(tabId, ms){
  return new Promise(res => {
    let done = false; const fin = ok => { if (done) return; done = true; chrome.tabs.onUpdated.removeListener(l); clearTimeout(t); res(ok); };
    const l = (id, info) => { if (id === tabId && info.status === 'complete') fin(true); };
    chrome.tabs.onUpdated.addListener(l);
    const t = setTimeout(() => fin(false), ms);
    chrome.tabs.get(tabId).then(tb => { if (tb && tb.status === 'complete') fin(true); }).catch(() => fin(false));
  });
}
async function readInTab(url, windowId){
  const tab = await chrome.tabs.create({url, active:false, windowId});
  try {
    await waitComplete(tab.id, 30000);
    let o = null;
    for (let k = 0; k < 6; k++){          // la page finit de se construire : on relit jusqu'à trouver l'annonce
      await sleep(k ? 1200 : rand(1500, 2500));
      const [res] = await chrome.scripting.executeScript({target:{tabId: tab.id}, func: extractAd});
      o = res && res.result;
      if (o && (o.blocked || o.ad || (o.photos || []).length)) break;
    }
    return o;
  } finally { try { await chrome.tabs.remove(tab.id); } catch(e){} }
}

/* ---- annonce seule (onglet actif) ---- */
async function runSingle(tabId){
  if (running) return {ok:false, err:'Une lecture est déjà en cours.'};
  running = true;
  try {
    await setState({running:true, kind:'single', done:0, total:1, msg:'Lecture de l\'annonce…'});
    const [res] = await chrome.scripting.executeScript({target:{tabId}, func: extractAd});
    const o = res && res.result;
    if (!o) throw new Error('Rien à lire sur cette page.');
    if (o.blocked) throw new Error('Leboncoin affiche une vérification : validez-la vous-même dans l\'onglet, puis recommencez.');
    await grabPhotos(o, PHOTOS_SINGLE, 1280, 0.82, (i, n) => setState({running:true, kind:'single', done:0, total:1, msg:`Photos : ${i + 1} sur ${n}…`}));
    const payload = 'UTPIMPORT' + JSON.stringify(o);
    const { photosData, ...sansPhotos } = o; // la page reçoit les photos à part, déjà prêtes
    const copied = await deliver(payload, {kind:'single', n:1, photos:photosData.length, titre:o.title, at:Date.now()}, 'annonce', {brut: 'UTPIMPORT' + JSON.stringify(sansPhotos), images: photosData}, true);
    const msg = `Annonce et ${photosData.length} photo${photosData.length > 1 ? 's' : ''} envoyées : l'analyse s'ouvre sur Utopicar.${copied ? ' (Copiées aussi : Ctrl+V en secours.)' : ''}`;
    await setState({running:false, status:'ok', kind:'single', done:1, total:1, msg, copied});
    notify(msg);
    return {ok:true, msg, copied};
  } catch(e){
    const msg = e.message || String(e);
    await setState({running:false, status:'bad', done:0, total:1, msg});
    return {ok:false, err:msg};
  } finally { running = false; }
}

/* ---- rafale : annonces cochées sur une page de résultats ---- */
async function runBatch(urls, windowId, src){
  if (running) return;
  running = true; stopAsked = false;
  const list = [...new Set(urls)].slice(0, MAX_BATCH); const items = []; const fails = [];
  let blocked = false;
  try {
    for (let i = 0; i < list.length; i++){
      if (stopAsked) break;
      await setState({running:true, kind:'batch', done:i, total:list.length, msg:`Annonce ${i + 1} sur ${list.length} : ouverture…`});
      let o = null;
      try { o = await readInTab(list[i], windowId); } catch(e){ console.error('lecture', list[i], e && e.message); o = null; }
      if (o && o.blocked){ blocked = true; break; }
      if (!o || (!o.ad && !(o.text || '').trim())){ fails.push(list[i]); }
      else {
        await grabPhotos(o, PHOTOS_BATCH, 1024, 0.78, (k, n) => setState({running:true, kind:'batch', done:i, total:list.length, msg:`Annonce ${i + 1} sur ${list.length} : photo ${k + 1} sur ${n}…`}));
        items.push(o);
      }
      if (i < list.length - 1 && !stopAsked){
        const p = rand(PAUSE_MIN, PAUSE_MAX);
        await setState({running:true, kind:'batch', done:i + 1, total:list.length, msg:`Pause de ${Math.round(p/1000)} s avant l'annonce suivante…`});
        await sleep(p);
      }
    }
    if (!items.length){
      const msg = blocked ? 'Leboncoin affiche une vérification. Ouvrez une annonce, validez-la vous-même, puis relancez.' : stopAsked ? 'Lecture arrêtée.' : 'Aucune annonce n\'a pu être lue.';
      await setState({running:false, status:'bad', done:0, total:list.length, msg}); notify(msg); return;
    }
    const payload = 'UTPLOT' + JSON.stringify({v:1, src, at:Date.now(), items});
    const nPh = items.reduce((s, o) => s + (o.photosData || []).length, 0);
    const copied = await deliver(payload, {kind:'batch', n:items.length, photos:nPh, at:Date.now()}, 'lot', {brut: payload}, false);
    const extra = [blocked ? 'arrêt sur une vérification Leboncoin' : '', stopAsked ? 'arrêtée à votre demande' : '', fails.length ? `${fails.length} illisible(s)` : ''].filter(Boolean).join(', ');
    const msg = `${items.length} annonce${items.length > 1 ? 's' : ''} lue${items.length > 1 ? 's' : ''} en entier (${nPh} photos)${extra ? ', ' + extra : ''}. Triées dans le Tri rapide d'Utopicar : cliquez cette notification.${copied ? ' (Copiées aussi : Ctrl+V en secours.)' : ''}`;
    await setState({running:false, status: blocked ? 'bad' : 'ok', kind:'batch', done:items.length, total:list.length, msg, copied});
    notify(msg);
  } catch(e){
    await setState({running:false, status:'bad', done:items.length, total:list.length, msg:'Erreur : ' + (e.message || e)});
  } finally { running = false; stopAsked = false; }
}

/* ---- relevé de toute une recherche : toutes les pages de résultats, lues depuis l'onglet de l'utilisateur ---- */
async function runReleve(tabId, url){
  if (running) return;
  running = true; stopAsked = false;
  const items = []; const seen = new Set(); let total = null, pages = 1, blocked = false, err = '', title = '';
  const isLbc = /leboncoin\./.test(url || '');
  try {
    if (!isLbc){
      await setState({running:true, kind:'releve', done:0, total:1, msg:'Lecture de la page…'});
      const [res] = await chrome.scripting.executeScript({target:{tabId}, func: extractList, args:[1]});
      const o = res && res.result; if (!o || !o.items.length) throw new Error('Aucune annonce trouvée sur cette page.');
      const brut = 'UTPRELEVE' + JSON.stringify(o);
      const copied = await deliver(brut, {kind:'releve', n:o.items.length, at:Date.now()}, 'releve', {brut}, true);
      const msg = `${o.items.length} annonces envoyées : la Cote s'ouvre sur Utopicar.${copied ? ' (Copiées aussi : Ctrl+V en secours.)' : ''}`;
      await setState({running:false, status:'ok', kind:'releve', done:1, total:1, msg, copied}); notify(msg); return;
    }
    for (let p = 1; p <= pages; p++){
      if (stopAsked) break;
      await setState({running:true, kind:'releve', done:p - 1, total:pages, msg:`Page ${p}${pages > 1 ? ' sur ' + pages : ''} · ${items.length} annonces relevées…`});
      const [res] = await chrome.scripting.executeScript({target:{tabId}, func: lbcPage, args:[p]});
      const r = res && res.result;
      if (!r || r.err){ err = r && r.err || 'lecture impossible'; if (p === 1) break; else break; }
      if (r.blocked){ blocked = true; break; }
      if (p === 1){ total = r.total; title = r.title || ''; const per = Math.max(1, r.items.length); pages = Math.min(r.max_pages || 100, Math.ceil(Math.min(total || per, RELEVE_MAX) / per)); }
      let add = 0; for (const it of r.items){ if (!seen.has(it.u)){ seen.add(it.u); items.push(it); add++; } }
      if (!add || items.length >= RELEVE_MAX) break;
      if (p < pages && !stopAsked) await sleep(rand(RELEVE_PAUSE[0], RELEVE_PAUSE[1]));
    }
    if (!items.length){
      const msg = blocked ? 'Leboncoin affiche une vérification : validez-la vous-même dans l\'onglet, puis relancez.' : 'Aucune annonce lue' + (err ? ' (' + err + ')' : '') + '. Rechargez la page de résultats et relancez.';
      await setState({running:false, status:'bad', kind:'releve', done:0, total:pages, msg}); notify(msg); return;
    }
    const o = {v:2, src:'www.leboncoin.fr', url, title, total, items: items.slice(0, RELEVE_MAX)};
    const brut = 'UTPRELEVE' + JSON.stringify(o);
    const copied = await deliver(brut, {kind:'releve', n:o.items.length, at:Date.now()}, 'releve', {brut}, false);
    const extra = [blocked ? 'arrêt sur une vérification Leboncoin' : '', stopAsked ? 'arrêté à votre demande' : '', total > items.length && pages >= 100 ? 'Leboncoin n\'affiche pas plus de 100 pages : découpez la recherche (prix, années) pour le reste' : ''].filter(Boolean).join(', ');
    const msg = `${o.items.length} annonces relevées${total ? ' sur ' + total : ''}${extra ? ' (' + extra + ')' : ''}. Placées sur leur cote dans Utopicar : cliquez cette notification.${copied ? ' (Copiées aussi : Ctrl+V en secours.)' : ''}`;
    await setState({running:false, status: blocked ? 'bad' : 'ok', kind:'releve', done:pages, total:pages, msg, copied});
    notify(msg);
  } catch(e){
    await setState({running:false, status:'bad', kind:'releve', done:0, total:pages, msg:'Erreur : ' + (e.message || e)});
  } finally { running = false; stopAsked = false; }
}

/* ---- relevé automatique des cotes : chaque marque, chaque modèle, en essence, diesel puis hybride ----
   Audi A1 essence, Audi A1 diesel, Audi A1 hybride, puis Audi A3 essence… Chaque recherche est lue sur Leboncoin depuis un
   onglet Leboncoin (comme « Relever toute la recherche »), envoyée à Utopicar qui l'ajoute à la base du marché et recalcule
   la cote de chaque génération dans cette énergie. L'avancement est gardé : arrêté, fermé ou interrompu par une
   vérification Leboncoin, le relevé reprend à la recherche où il s'était arrêté. */
const LBC_RECHERCHE = 'https://www.leboncoin.fr/recherche';
const ENERGIES = ['essence', 'diesel', 'hybride'];
const FUEL = {essence: '1', diesel: '2', hybride: '6,8'};   // codes Leboncoin (hybride : simple et rechargeable)
const BAL_PAUSE = [5000, 10000];      // entre deux recherches
const BAL_REPOS = [60000, 120000];    // une pause plus longue toutes les 25 recherches
const BAL_REPOS_TOUS = 25;
const BAL_PAGES = [1, 3, 10, 100];    // pages lues par recherche (35 annonces par page)
let balRunning = false, balStop = '';   // balStop : 'pause' ou 'abandon', pris en compte entre deux étapes
/** Attente qui reste à l'écoute de « Pause » (et garde l'arrière-plan éveillé : Chrome l'arrête après 30 s sans activité). */
async function attendre(ms){
  const fin = Date.now() + ms;
  while (Date.now() < fin && !balStop){ await sleep(Math.min(5000, fin - Date.now())); await chrome.runtime.getPlatformInfo(); }
}

/** Adresse de la recherche Leboncoin d'un modèle dans une énergie (modèle sans code Leboncoin : cherché par son nom). */
function urlRecherche(b, m, en){
  const p = new URLSearchParams({category: '2'});
  if (b.lbc) p.set('u_car_brand', b.lbc);
  if (m.lbc) p.set('u_car_model', m.lbc); else p.set('text', b.lbc ? m.n : `${b.n} ${m.n}`);
  p.set('fuel', FUEL[en]);
  return LBC_RECHERCHE + '?' + p.toString().replace(/%2C/g, ',');
}
async function catalogue(){
  const r = await fetch(SITE + '/api/catalogue', {credentials: 'omit'});
  if (!r.ok) throw new Error('catalogue indisponible (' + r.status + ')');
  return r.json();
}
/** Les recherches à faire, dans l'ordre : marque, modèle, puis les trois énergies. */
function etapesDe(cat, marques){
  const out = [];
  for (const b of cat){
    if (marques && marques.length && !marques.includes(b.k)) continue;
    for (const m of b.m) for (const en of ENERGIES) out.push({base: `${b.k} ${m.k}`, nom: `${b.n} ${m.n}`, en, url: urlRecherche(b, m, en), md: m.lbc || ''});
  }
  return out;
}
// état léger (avancement, message) écrit à chaque étape ; liste des recherches et résultats gardés à part
const lireBal = async () => {
  const r = await chrome.storage.local.get(['bal', 'balEtapes', 'balResultats']);
  return r.bal ? {...r.bal, etapes: r.balEtapes || [], resultats: r.balResultats || []} : null;
};
const ecrireBal = bal => { const {etapes, resultats, ...leger} = bal; return chrome.storage.local.set({bal: {...leger, n: etapes.length}}); };
async function etatBal(bal, msg){
  bal.msg = msg; await ecrireBal(bal);
  if (!running){
    chrome.action.setBadgeText({text: bal.actif && !bal.pause ? Math.floor(100 * bal.i / Math.max(1, bal.etapes.length)) + '%' : bal.pause ? '||' : ''});
    chrome.action.setBadgeBackgroundColor({color: bal.pause ? '#5E6670' : '#FF5A1F'});
  }
}

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
async function lirePage(bal, p, url){
  for (let essai = 0; essai < 2; essai++){
    try {
      bal.tabId = await ongletLbc(bal.tabId);
      const [res] = await chrome.scripting.executeScript({target: {tabId: bal.tabId}, func: lbcPage, args: [p, url]});
      return res && res.result;
    } catch(e){ bal.tabId = null; await sleep(3000); }   // onglet fermé ou rechargé : un autre
  }
  return {err: 'onglet Leboncoin indisponible'};
}
/** Une recherche, toutes ses pages (jusqu'au réglage) : annonces de ce modèle, sans doublon. */
async function lireRecherche(bal, e, prefixe){
  const items = [], seen = new Set(); let pages = 1, total = null;
  for (let p = 1; p <= pages; p++){
    if (balStop) break;
    await etatBal(bal, `${prefixe}${e.nom} ${e.en} : page ${p}${pages > 1 ? ' sur ' + pages : ''}…`);
    const r = await lirePage(bal, p, e.url);
    if (!r || r.blocked) return {blocked: true, items};
    if (r.err) return {err: r.err, lent: r.lent, items};
    if (p === 1){ total = r.total; const per = Math.max(1, r.items.length); pages = Math.min(bal.pages, r.max_pages || 100, Math.ceil(Math.min(total || per, RELEVE_MAX) / per)); }
    let add = 0;
    for (const it of r.items){ if (!seen.has(it.u)){ seen.add(it.u); items.push(it); add++; } }
    if (!add || items.length >= RELEVE_MAX) break;
    if (p < pages && !balStop) await attendre(rand(RELEVE_PAUSE[0], RELEVE_PAUSE[1]));
  }
  // annonces d'un autre modèle (« à la une ») : écartées quand Leboncoin donne le modèle de l'annonce
  const M = e.md.toUpperCase();
  const memes = M ? items.filter(it => { const md = String(it.f && it.f.md || '').toUpperCase(); return !md || md === M || M.endsWith('_' + md); }) : items;
  return {items: memes.length || !items.length ? memes : items, total};
}
/** Envoi d'une recherche à Utopicar : enregistrée dans la base du marché, cote recalculée. */
async function envoyerCotes(e, items){
  for (let essai = 0; ; essai++){
    try {
      const r = await fetch(SITE + '/api/marche/balayage', {method: 'POST', credentials: 'include', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({base: e.base, energie: e.en, items: items.map(({u, t, f}) => ({u, t, f}))})});
      const j = await r.json().catch(() => null);
      if (r.ok && j) return {ok: true, j};
      if (r.status === 401 || r.status === 403 || essai >= 2) return {ok: false, status: r.status, err: (j && j.erreur) || 'Utopicar a répondu ' + r.status};
    } catch(err){ if (essai >= 2) return {ok: false, err: 'Utopicar injoignable'}; }
    await attendre(essai ? 15000 : 5000);
  }
}

async function runBalayage(){
  if (balRunning) return;
  let bal = await lireBal();
  if (!bal || !bal.actif) return;
  balRunning = true; balStop = '';
  bal.pause = ''; bal.erreurs = bal.erreurs || 0;
  chrome.alarms.create('utp-bal', {periodInMinutes: 1});   // relance le relevé si le navigateur a coupé l'arrière-plan
  const eveil = setInterval(() => chrome.runtime.getPlatformInfo(), 20000);   // pendant les appels longs (calcul de la cote)
  let fautes = 0;
  try {
    while (bal.i < bal.etapes.length){
      if (balStop === 'abandon'){ bal.actif = false; bal.fin = Date.now(); await etatBal(bal, `Relevé arrêté : ${bal.i} recherches sur ${bal.etapes.length} faites, gardées dans la base.`); return; }
      if (balStop){ bal.pause = 'arret'; await etatBal(bal, `Relevé en pause : ${bal.i} recherches sur ${bal.etapes.length}. « Reprendre » le continue.`); return; }
      const e = bal.etapes[bal.i];
      const prefixe = `${bal.i + 1}/${bal.etapes.length} · `;
      const r = await lireRecherche(bal, e, prefixe);
      if (r.blocked){
        bal.pause = 'verification';
        const msg = `Leboncoin demande une vérification (à ${e.nom} ${e.en}). Validez-la vous-même dans l'onglet Leboncoin, puis « Reprendre ».`;
        await etatBal(bal, msg); notify(msg); return;
      }
      if (balStop && !r.items.length) continue;
      let res;
      if (r.err && !r.items.length){
        fautes++;
        if (fautes >= 2 || r.lent){
          bal.pause = 'erreur';
          const msg = `Relevé en pause à ${e.nom} ${e.en} : ${r.err}. Attendez un moment, puis « Reprendre ».`;
          await etatBal(bal, msg); notify(msg); return;
        }
        await etatBal(bal, `${prefixe}${e.nom} ${e.en} : ${r.err}, nouvel essai dans 20 s…`); await attendre(20000); continue;
      }
      fautes = 0;
      if (!r.items.length) res = {base: e.base, nom: e.nom, energie: e.en, recues: 0, gardees: 0, gens: []};
      else {
        await etatBal(bal, `${prefixe}${e.nom} ${e.en} : ${r.items.length} annonces, calcul de la cote…`);
        const s = await envoyerCotes(e, r.items);
        if (!s.ok && (s.status === 401 || s.status === 403)){
          bal.pause = 'connexion';
          const msg = `${s.err} Puis « Reprendre » : le relevé reprend à ${e.nom} ${e.en}.`;
          await etatBal(bal, msg); notify(msg); return;
        }
        res = s.ok ? s.j : {base: e.base, nom: e.nom, energie: e.en, recues: r.items.length, gardees: 0, gens: [], erreur: s.err};
        if (!s.ok) bal.erreurs++;
      }
      res.total = r.total ?? null;
      bal.resultats.push(res); bal.i++;
      await chrome.storage.local.set({balResultats: bal.resultats});
      await etatBal(bal, `${prefixe}${e.nom} ${e.en} : ${res.gardees || 0} annonces${res.erreur ? ' (non enregistrées : ' + res.erreur + ')' : ''}.`);
      if (bal.i < bal.etapes.length && !balStop){
        const repos = bal.i % BAL_REPOS_TOUS === 0, p = repos ? rand(BAL_REPOS[0], BAL_REPOS[1]) : rand(BAL_PAUSE[0], BAL_PAUSE[1]);
        await etatBal(bal, `${repos ? 'Pause longue' : 'Pause'} de ${Math.round(p / 1000)} s avant ${bal.etapes[bal.i].nom} ${bal.etapes[bal.i].en}…`);
        await attendre(p);
      }
    }
    bal.actif = false; bal.fin = Date.now();
    const nAnn = bal.resultats.reduce((s, x) => s + (x.gardees || 0), 0);
    const nSous = bal.resultats.reduce((s, x) => s + (x.gens || []).reduce((t, g) => t + (g.nSous || 0), 0), 0);
    const msg = `Relevé des cotes terminé : ${bal.etapes.length} recherches, ${nAnn} annonces, ${nSous} sous la cote${bal.erreurs ? `, ${bal.erreurs} non enregistrée(s)` : ''}. Cliquez pour voir le bilan.`;
    await etatBal(bal, msg);
    await envoyerBilan(bal, false);
    notify(msg);
  } catch(err){
    bal.pause = 'erreur'; await etatBal(bal, 'Erreur : ' + (err.message || err) + '. « Reprendre » relance à la même recherche.');
  } finally {
    clearInterval(eveil);
    balRunning = false; balStop = '';
    if (!bal.actif || bal.pause) chrome.alarms.clear('utp-bal');
  }
}
/** Bilan du relevé (terminé ou en cours) ouvert dans la Cote d'Utopicar. */
async function envoyerBilan(bal, actif){
  const o = {v: 1, debut: bal.debut, fin: bal.fin || null, pages: bal.pages, marques: bal.marques, etapes: bal.etapes.length, faites: bal.i, resultats: bal.resultats};
  const brut = 'UTPBALAYAGE' + JSON.stringify(o);
  return deliver(brut, {kind: 'balayage', n: bal.i, at: Date.now()}, 'releve', {brut}, actif);
}
async function demarrerBalayage(marques, pages){
  const cat = await catalogue();
  const etapes = etapesDe(cat, marques);
  if (!etapes.length) throw new Error('Aucun modèle à relever.');
  const ancien = await lireBal();
  await chrome.storage.local.set({balEtapes: etapes, balResultats: []});
  await ecrireBal({actif: true, pause: '', marques: marques && marques.length ? marques : null, pages: BAL_PAGES.includes(pages) ? pages : 10, etapes, i: 0, resultats: [], erreurs: 0, debut: Date.now(), tabId: ancien && ancien.tabId || null, msg: 'Démarrage…'});
  runBalayage();
}
chrome.alarms?.onAlarm?.addListener(async a => {
  if (a.name !== 'utp-bal') return;
  const bal = await lireBal();
  if (!bal || !bal.actif || bal.pause){ chrome.alarms.clear('utp-bal'); return; }
  if (!balRunning) runBalayage();   // le navigateur avait arrêté l'arrière-plan : on reprend à la recherche en cours
});
// navigateur relancé : le relevé ne repart pas tout seul, il attend « Reprendre »
chrome.runtime.onStartup.addListener(async () => {
  const bal = await lireBal();
  if (bal && bal.actif && !bal.pause){ bal.pause = 'arret'; await etatBal(bal, `Relevé en pause (navigateur relancé) : ${bal.i} recherches sur ${bal.etapes.length}. « Reprendre » le continue.`); }
});

chrome.runtime.onMessage.addListener((msg, sender, send) => {
  if (!msg || typeof msg !== 'object') return;
  if (msg.type === 'utp-single'){ runSingle(msg.tabId).then(send); return true; }
  if (msg.type === 'utp-batch'){
    if (running){ send({ok:false, err:'Une lecture est déjà en cours.'}); return; }
    runBatch(msg.urls || [], msg.windowId, msg.src || ''); send({ok:true}); return;
  }
  if (msg.type === 'utp-releve'){
    if (running){ send({ok:false, err:'Une lecture est déjà en cours.'}); return; }
    runReleve(msg.tabId, msg.url || ''); send({ok:true}); return;
  }
  if (msg.type === 'utp-stop'){ stopAsked = true; send({ok:true}); return; }
  if (msg.type === 'utp-bal-start'){
    if (balRunning){ send({ok:false, err:'Le relevé des cotes est déjà en cours.'}); return; }
    demarrerBalayage(msg.marques || null, +msg.pages || 10).then(() => send({ok:true}), e => send({ok:false, err: e.message || String(e)}));
    return true;
  }
  if (msg.type === 'utp-bal-reprendre'){
    lireBal().then(async bal => {
      if (!bal || !bal.actif){ send({ok:false, err:'Aucun relevé à reprendre.'}); return; }
      if (!balRunning){ bal.pause = ''; await etatBal(bal, 'Reprise…'); runBalayage(); }
      send({ok:true});
    });
    return true;
  }
  if (msg.type === 'utp-bal-pause'){ if (balRunning) balStop = 'pause'; send({ok:true}); return; }
  if (msg.type === 'utp-bal-abandon'){
    if (balRunning){ balStop = 'abandon'; send({ok:true}); return; }   // la boucle s'arrête elle-même après l'étape en cours
    lireBal().then(async bal => { if (bal && bal.actif){ bal.actif = false; bal.pause = ''; bal.fin = Date.now(); await etatBal(bal, `Relevé arrêté : ${bal.i} recherches sur ${bal.etapes.length} faites, gardées dans la base.`); } chrome.alarms.clear('utp-bal'); send({ok:true}); });
    return true;
  }
  if (msg.type === 'utp-bal-bilan'){
    lireBal().then(async bal => { if (!bal || !bal.i){ send({ok:false, err:'Pas encore de bilan.'}); return; } await envoyerBilan(bal, true); send({ok:true}); });
    return true;
  }
  if (msg.type === 'utp-copylast'){
    chrome.storage.local.get('last').then(async r => { if (!r.last){ send({ok:false, err:'Rien à recopier.'}); return; } send({ok: await copyText(r.last)}); });
    return true;
  }
  if (msg.type === 'utp-open'){ openApp().then(() => send({ok:true})); return true; }
  if (msg.type === 'utp-renvoyer'){ // « Rouvrir dans Utopicar » : le dernier envoi, de nouveau proposé à sa page
    chrome.storage.local.get(['last', 'lastMeta']).then(async r => {
      if (!r.last){ send({ok:false, err:'Rien à renvoyer.'}); return; }
      const k = (r.lastMeta && r.lastMeta.kind) || '';
      const cible = k === 'single' ? 'annonce' : k === 'batch' ? 'lot' : 'releve';
      let envoi = {brut: r.last};
      if (cible === 'annonce'){ try { const o = JSON.parse(r.last.slice(9)); const { photosData, ...sp } = o; envoi = {brut: 'UTPIMPORT' + JSON.stringify(sp), images: photosData || []}; } catch(e){} }
      await chrome.storage.local.set({'utp-envoi': {type: cible, brut: envoi.brut, images: envoi.images || [], t: Date.now()}});
      await ouvrirSur(cible, true); send({ok:true});
    });
    return true;
  }
});
