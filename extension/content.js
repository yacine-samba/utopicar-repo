// UTOPICAR Scanner — bouton sur les pages d'annonce, copie texte + photos pour le scanner.
(function(){
  'use strict';
  const SCANNER_URL = 'https://claude.ai/artifact/8bHqs6YhWoWT2zje3mSF3q';
  const MAX_PHOTOS = 8;
  const isAdPage = () => {
    const h = location.hostname, p = location.pathname;
    if (h.includes('leboncoin')) return /\/ad\/|\/vi\//.test(p);
    if (h.includes('lacentrale')) return /auto-occasion-annonce/.test(p);
    if (h.includes('autoscout24')) return /\/offres\//.test(p);
    if (h.includes('leparking')) return /\/(voiture-occasion|annonce|detail)/.test(p);
    return false;
  };

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

  function toast(msg, ok){
    let t = document.getElementById('utp-toast');
    if (!t){ t = document.createElement('div'); t.id = 'utp-toast'; document.body.appendChild(t); }
    t.style.cssText = 'position:fixed;right:20px;bottom:84px;z-index:2147483647;max-width:340px;padding:12px 14px;border-radius:10px;font:600 13px/1.4 system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.25);background:' + (ok === false ? '#C62E27' : '#0D1522') + ';color:#fff';
    t.innerHTML = msg;
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
      const html = '<div data-utp="1">' + imgs.map((s, i) => '<img alt="photo ' + (i + 1) + '" src="' + s + '">').join('') + '</div>';
      await navigator.clipboard.write([new ClipboardItem({
        'text/plain': new Blob([text], { type: 'text/plain' }),
        'text/html': new Blob([html], { type: 'text/html' })
      })]);
      toast('✓ Annonce copiée avec ' + imgs.length + ' photo(s).<br>Ouvrez le scanner et faites <b>Ctrl+V</b>.<br><a href="' + SCANNER_URL + '" target="_blank" style="color:#F5B800">Ouvrir le scanner →</a>');
    } catch(e){
      toast('Copie impossible : ' + (e && e.message || e) + '. Cliquez d\'abord dans la page puis réessayez.', false);
    } finally { btn.disabled = false; btn.textContent = label; }
  }

  function mount(){
    const existing = document.getElementById('utp-btn');
    if (!isAdPage()){ if (existing) existing.remove(); return; }
    if (existing) return;
    const b = document.createElement('button');
    b.id = 'utp-btn'; b.type = 'button'; b.textContent = 'Scanner avec UTOPICAR';
    b.style.cssText = 'position:fixed;right:20px;bottom:24px;z-index:2147483647;background:#F5B800;color:#0D1522;border:0;border-radius:10px;padding:13px 18px;font:800 14px system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.25)';
    b.addEventListener('click', () => run(b));
    document.body.appendChild(b);
  }
  mount();
  // Les sites changent de page sans recharger : on vérifie régulièrement.
  let last = location.href;
  setInterval(() => { if (location.href !== last){ last = location.href; setTimeout(mount, 800); } else mount(); }, 1500);
})();
