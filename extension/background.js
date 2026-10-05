'use strict';
/* UTOPICAR v4 : travail de fond. Lecture d'une annonce (texte + toutes les photos) et lecture en rafale
   des annonces cochées, au rythme d'une personne, puis copie automatique pour Ctrl+V dans l'outil. */
importScripts('extract.js');

const APP_URL = 'https://claude.ai/artifact/8bHqs6YhWoWT2zje3mSF3q';
const APP_ID = '8bHqs6YhWoWT2zje3mSF3q';
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
  chrome.action.setBadgeBackgroundColor({color: s.status === 'bad' ? '#BF2A21' : s.running ? '#15307F' : '#0A7A43'});
}
function notify(message){
  try { chrome.notifications.create('utp-' + Date.now(), {type:'basic', iconUrl:'icons/128.png', title:'UTOPICAR', message, priority:1}); } catch(e){}
}
chrome.notifications?.onClicked?.addListener(() => openApp());

async function openApp(){
  const tabs = await chrome.tabs.query({url: 'https://claude.ai/*'});
  const t = tabs.find(x => (x.url || '').includes(APP_ID));
  if (t){ await chrome.tabs.update(t.id, {active:true}); await chrome.windows.update(t.windowId, {focused:true}); }
  else await chrome.tabs.create({url: APP_URL});
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
    if (!has) await chrome.offscreen.createDocument({url:'offscreen.html', reasons:['CLIPBOARD'], justification:'Copier l\'annonce vers UTOPICAR'});
    const r = await chrome.runtime.sendMessage({type:'utp-offcopy', text});
    return !!(r && r.ok);
  } catch(e){ return false; }
}
async function deliver(payload, meta){
  await chrome.storage.local.set({last: payload, lastMeta: meta});
  return await copyText(payload);
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
    const copied = await deliver(payload, {kind:'single', n:1, photos:o.photosData.length, titre:o.title, at:Date.now()});
    const msg = `Annonce et ${o.photosData.length} photo${o.photosData.length > 1 ? 's' : ''} ${copied ? 'copiées' : 'prêtes'}. Sur UTOPICAR, faites Ctrl+V.`;
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
    const copied = await deliver(payload, {kind:'batch', n:items.length, photos:nPh, at:Date.now()});
    const extra = [blocked ? 'arrêt sur une vérification Leboncoin' : '', stopAsked ? 'arrêtée à votre demande' : '', fails.length ? `${fails.length} illisible(s)` : ''].filter(Boolean).join(', ');
    const msg = `${items.length} annonce${items.length > 1 ? 's' : ''} lue${items.length > 1 ? 's' : ''} en entier (${nPh} photos)${extra ? ', ' + extra : ''}. ${copied ? 'Copiées : sur UTOPICAR, faites Ctrl+V.' : 'Ouvrez l\'extension et cliquez « Copier le dernier envoi ».'}`;
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
      const copied = await deliver('UTPRELEVE' + JSON.stringify(o), {kind:'releve', n:o.items.length, at:Date.now()});
      const msg = `${o.items.length} annonces ${copied ? 'copiées' : 'prêtes'}. Sur UTOPICAR, faites Ctrl+V.`;
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
    const copied = await deliver('UTPRELEVE' + JSON.stringify(o), {kind:'releve', n:o.items.length, at:Date.now()});
    const extra = [blocked ? 'arrêt sur une vérification Leboncoin' : '', stopAsked ? 'arrêté à votre demande' : '', total > items.length && pages >= 100 ? 'Leboncoin n\'affiche pas plus de 100 pages : découpez la recherche (prix, années) pour le reste' : ''].filter(Boolean).join(', ');
    const msg = `${o.items.length} annonces relevées${total ? ' sur ' + total : ''}${extra ? ' (' + extra + ')' : ''}. ${copied ? 'Copiées : sur UTOPICAR, faites Ctrl+V.' : 'Ouvrez l\'extension et cliquez « Copier le dernier envoi ».'}`;
    await setState({running:false, status: blocked ? 'bad' : 'ok', kind:'releve', done:pages, total:pages, msg, copied});
    notify(msg);
  } catch(e){
    await setState({running:false, status:'bad', kind:'releve', done:0, total:pages, msg:'Erreur : ' + (e.message || e)});
  } finally { running = false; stopAsked = false; }
}

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
  if (msg.type === 'utp-copylast'){
    chrome.storage.local.get('last').then(async r => { if (!r.last){ send({ok:false, err:'Rien à recopier.'}); return; } send({ok: await copyText(r.last)}); });
    return true;
  }
  if (msg.type === 'utp-open'){ openApp().then(() => send({ok:true})); return true; }
});
