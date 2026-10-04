// Utopicar — sur une annonce : « Analyser avec Utopicar » (texte, photos, numéro s'il est affiché) ;
// sur une page de résultats Leboncoin : « Relever la page » (toutes les annonces, cote de chacune dans Utopicar).
// Les données sont gardées par l'extension puis transmises à la page Utopicar qui s'ouvre (voir site.js).
(function(){
  'use strict';
  const SITE = 'https://www.utopicar.fr';
  const SCANNER_URL = SITE + '/app/analyser?ext=1';
  const COTE_URL = SITE + '/app/cote?ext=1';
  const MAX_PHOTOS = 8;
  const isAdPage = () => {
    const h = location.hostname, p = location.pathname;
    if (h.includes('leboncoin')) return /\/ad\/|\/vi\//.test(p);
    if (h.includes('lacentrale')) return /auto-occasion-annonce/.test(p);
    if (h.includes('autoscout24')) return /\/offres\//.test(p);
    if (h.includes('leparking')) return /\/(voiture-occasion|annonce|detail)/.test(p);
    return false;
  };

  // Page de résultats Leboncoin (recherche, catégorie voitures) : on peut la relever.
  const isListPage = () => location.hostname.includes('leboncoin') && !isAdPage() && /\/(recherche|c\/voitures|voitures)/.test(location.pathname + location.search);

  // Relevé de toute la page de résultats (même format que le favori « Relever la page » de l'outil Garage).
  function releve(){
    const d = document, pat = /\/ad\/|annonce|\/offres?\/|\/detail|\/vo\/|\/voiture-occasion/i, out = [], seen = {};
    const cl = h => { try { const u = new URL(h, location.href); return u.origin + u.pathname; } catch(e){ return h; } };
    const ok = a => { const h = a.getAttribute('href') || ''; return pat.test(h) && !/recherche|search|liste|deposer|annonces\?|\/c\/|\/ck\//i.test(h); };
    [...d.querySelectorAll('a[href]')].filter(ok).forEach(a => {
      const h = cl(a.href); if (seen[h]) return; let el = a, best = null;
      while (el && el !== d.body){
        const n = new Set([...el.querySelectorAll('a[href]')].filter(ok).map(x => cl(x.href))).size;
        if (n > 1) break;
        if (/€/.test(el.innerText || '')) best = el;
        el = el.parentElement;
      }
      if (!best) return; seen[h] = 1;
      const te = best.querySelector('[data-qa-id="aditem_title"],[data-test-id*="title"],h2,h3');
      const tt = [...best.querySelectorAll('a[title],a[aria-label]')].map(x => (x.getAttribute('title') || x.getAttribute('aria-label') || '').trim()).filter(v => v.length > 3)[0] || (te ? te.innerText.trim() : '');
      out.push({ u: h, t: tt.slice(0, 140), x: (best.innerText || '').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').slice(0, 1200) });
    });
    return out;
  }

  // Garde l'envoi pour la page Utopicar qui va s'ouvrir (10 minutes au plus), puis l'ouvre.
  function envoyer(p, url){
    // l'onglet est ouvert par le service worker : après la lecture des photos, window.open serait bloqué
    return new Promise(res => chrome.storage.local.set({ 'utp-envoi': Object.assign({ t: Date.now() }, p) }, () => chrome.runtime.sendMessage({ type: 'utp-ouvrir', url }, () => res())));
  }

  function findAd(json){
    let best = null, bl = 0, seen = 0;
    (function walk(x, d){
      if (!x || typeof x !== 'object' || d > 14 || seen > 60000) return; seen++;
      if (!Array.isArray(x) && (('body' in x) || ('description' in x)) && (('price' in x) || ('attributes' in x) || ('prices' in x) || ('mileage' in x))){
        const l = JSON.stringify(x).length; if (l > bl && l < 300000){ best = x; bl = l; }
      }
      for (const k in x) if (Object.prototype.hasOwnProperty.call(x, k)) walk(x[k], d + 1);
    })(json, 0);
    return best;
  }

  function collect(){
    const d = document;
    const o = { v: 2, src: location.hostname, url: location.href.split('?')[0].split('#')[0], title: ((d.querySelector('h1') || {}).innerText || d.title || '').trim() };
    const meta = n => { const e = d.querySelector('meta[property="' + n + '"],meta[name="' + n + '"]'); return e ? e.content : ''; };
    o.ogTitle = meta('og:title'); o.ogDesc = meta('og:description'); o.ogImage = meta('og:image');
    // numéro du vendeur : seulement s'il est affiché sur la page (après « Voir le numéro »)
    const tel = d.querySelector('a[href^="tel:"]');
    if (tel) o.telephone = (tel.getAttribute('href') || '').replace(/^tel:/, '').trim().slice(0, 20);
    o.ld = [...d.querySelectorAll('script[type="application/ld+json"]')].map(s => { try { return JSON.parse(s.textContent); } catch(e){ return null; } }).filter(Boolean);
    const nd = d.getElementById('__NEXT_DATA__');
    if (nd){ try { const ad = findAd(JSON.parse(nd.textContent)); if (ad) o.ad = ad; } catch(e){} }
    const main = d.querySelector('main') || d.body;
    o.text = (main.innerText || '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').slice(0, 14000);

    // Photos : données de l'annonce d'abord, puis JSON-LD, puis grandes images visibles.
    let photos = [];
    const ad = o.ad || {};
    if (ad.images){ photos = photos.concat(ad.images.urls_large || ad.images.urls || []); }
    if (Array.isArray(ad.photos)) photos = photos.concat(ad.photos.map(p => typeof p === 'string' ? p : (p.url || p.src || p.large || '')));
    o.ld.flatMap(x => Array.isArray(x) ? x : (x['@graph'] || [x])).forEach(x => {
      const im = x && x.image; if (!im) return;
      [].concat(im).forEach(i => photos.push(typeof i === 'string' ? i : (i.url || i.contentUrl || '')));
    });
    if (photos.length < 3){
      [...d.images].filter(i => (i.naturalWidth || 0) >= 400 && !/logo|icon|avatar|sprite|pixel/i.test(i.currentSrc || i.src))
        .forEach(i => photos.push(i.currentSrc || i.src));
    }
    if (o.ogImage) photos.push(o.ogImage);
    o.photoUrls = [...new Set(photos.filter(u => /^https:\/\//.test(u)))];
    o.images = o.photoUrls.slice(0, 40);
    return o;
  }

  function fetchImage(url){
    return new Promise(res => {
      try { chrome.runtime.sendMessage({ type: 'utp-fetch-image', url }, r => res(r && r.ok ? r.dataUrl : null)); }
      catch(e){ res(null); }
    });
  }
  async function shrink(dataUrl){
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const bmp = await createImageBitmap(blob);
      const s = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      return c.toDataURL('image/jpeg', 0.82);
    } catch(e){ return null; }
  }

  // Message construit en DOM (jamais en HTML brut) : un texte d'erreur ne peut pas injecter de balises.
  function toast(lignes, ok, lien){
    let t = document.getElementById('utp-toast');
    if (!t){ t = document.createElement('div'); t.id = 'utp-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.style.cssText = 'position:fixed;right:20px;bottom:84px;z-index:2147483647;max-width:340px;padding:12px 14px;border-radius:10px;font:600 13px/1.4 system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.25);background:' + (ok === false ? '#C62E27' : '#15110d') + ';color:#fff';
    t.replaceChildren(...lignes.flatMap((l, i) => i ? [document.createElement('br'), document.createTextNode(l)] : [document.createTextNode(l)]));
    if (lien){ const a = document.createElement('a'); a.href = lien; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Ouvrir Utopicar →'; a.style.cssText = 'display:block;margin-top:6px;color:#ff8a4c'; t.appendChild(a); }
    clearTimeout(t._h); t._h = setTimeout(() => t.remove(), 9000);
  }

  async function run(btn){
    btn.disabled = true; const label = btn.textContent; btn.textContent = 'Lecture…';
    try {
      const o = collect();
      const urls = o.photoUrls.slice(0, MAX_PHOTOS);
      btn.textContent = 'Photos 0/' + urls.length;
      const imgs = [];
      for (const u of urls){ const raw = await fetchImage(u); const sm = raw && await shrink(raw); if (sm) imgs.push(sm); btn.textContent = 'Photos ' + imgs.length + '/' + urls.length; }
      o.photosIncluded = imgs.length;
      const text = 'UTPIMPORT' + JSON.stringify(o);
      // copie de secours dans le presse-papiers (Ctrl+V dans Utopicar), puis ouverture directe d'Utopicar
      try {
        const html = '<div data-utp="1">' + imgs.map((s, i) => '<img alt="photo ' + (i + 1) + '" src="' + s + '">').join('') + '</div>';
        await navigator.clipboard.write([new ClipboardItem({ 'text/plain': new Blob([text], { type: 'text/plain' }), 'text/html': new Blob([html], { type: 'text/html' }) })]);
      } catch(e){ /* presse-papiers refusé : l'envoi direct suffit */ }
      await envoyer({ type: 'annonce', brut: text, images: imgs }, SCANNER_URL);
      toast(['✓ Annonce envoyée à Utopicar avec ' + imgs.length + ' photo(s).', 'L\'analyse démarre dans l\'onglet Utopicar.'], true, SCANNER_URL);
    } catch(e){
      toast(['Copie impossible : ' + (e && e.message || e) + '.', 'Cliquez d\'abord dans la page puis réessayez.'], false);
    } finally { btn.disabled = false; btn.textContent = label; }
  }

  async function runReleve(btn){
    const items = releve();
    if (!items.length){ toast(['Aucune annonce trouvée sur cette page.', 'Ouvrez une page de résultats de recherche Leboncoin.'], false); return; }
    const text = 'UTPRELEVE' + JSON.stringify({ v: 1, src: location.hostname, url: location.href, title: document.title, items: items.slice(0, 120) });
    try { await navigator.clipboard.writeText(text); } catch(e){ /* l'envoi direct suffit */ }
    await envoyer({ type: 'releve', brut: text }, COTE_URL);
    toast(['✓ ' + items.length + ' annonces relevées.', 'La cote de chacune s\'affiche dans l\'onglet Utopicar.'], true, COTE_URL);
  }

  function mount(){
    const existing = document.getElementById('utp-btn');
    const liste = isListPage();
    if (!isAdPage() && !liste){ if (existing) existing.remove(); return; }
    if (existing && existing.dataset.mode === (liste ? 'liste' : 'annonce')) return;
    if (existing) existing.remove();
    const b = document.createElement('button');
    b.id = 'utp-btn'; b.type = 'button'; b.dataset.mode = liste ? 'liste' : 'annonce';
    b.textContent = liste ? 'Relever la page avec Utopicar' : 'Analyser avec Utopicar';
    b.style.cssText = 'position:fixed;right:20px;bottom:24px;z-index:2147483647;background:#ff5a1f;color:#160904;border:0;border-radius:10px;padding:13px 18px;font:800 14px system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.25)';
    b.addEventListener('click', () => (b.dataset.mode === 'liste' ? runReleve(b) : run(b)));
    document.body.appendChild(b);
  }
  mount();
  // Les sites changent de page sans recharger : on vérifie régulièrement.
  let last = location.href;
  setInterval(() => { if (location.href !== last){ last = location.href; setTimeout(mount, 800); } else mount(); }, 1500);
})();
