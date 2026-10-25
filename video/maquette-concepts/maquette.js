// 5 concepts · maquette 9:16 (1080×1920) dans la grammaire du film « wow » (master60w) : écrans pleins, phrase en
// géant (Clash + Instrument italique), vraie interface en carte inclinée, curseur. Chaque concept garde son propre
// geste de motion. ?f=N affiche l'écran N (images fixes, pour valider avant la production).
(async function () {
  const F = document.getElementById('f');
  const N = +(new URLSearchParams(location.search).get('f') || 0);
  const UI = '../film-master60/ui-blanc/', PH = '../assets/master60/photos/', DEMO = '../assets/master60/ui/images/demo/', BR = '../assets/brand/official/';
  await Promise.all(['700 200px Clash', '600 60px Clash', '700 40px Satoshi', '500 30px Satoshi', 'italic 200px Instrument'].map((f) => document.fonts.load(f)));

  const css = document.createElement('style');
  css.textContent = `
  .tick{position:absolute;left:50%;top:0;width:6px;margin-left:-3px;border-radius:3px;transform-origin:50% 430px}
  .ann2{width:520px;padding:30px 36px;border-radius:34px;background:#1b1612;border:2px solid rgba(244,241,236,.12);color:#f4f1ec;box-shadow:0 40px 80px -20px rgba(0,0,0,.7)}
  .ann2 .m{font:700 40px Satoshi;white-space:nowrap}.ann2 .s{font:500 28px Satoshi;opacity:.55;margin-top:6px;white-space:nowrap}
  .ann2 .p{font:600 76px Clash;margin-top:14px;white-space:nowrap}
  .msg{max-width:720px;padding:26px 36px;border-radius:38px;font:600 44px Satoshi;white-space:nowrap;box-shadow:0 24px 50px -20px rgba(0,0,0,.35)}
  .msg small{display:block;font:500 24px Satoshi;opacity:.6;margin-top:6px}
  .ptag{width:520px;height:210px;border-radius:26px 50px 50px 26px;background:#fff;border:4px solid var(--o);display:flex;flex-direction:column;justify-content:center;padding-left:96px;position:relative;box-shadow:0 40px 70px -24px rgba(28,22,18,.45)}
  .ptag::before{content:"";position:absolute;left:34px;top:50%;width:30px;height:30px;margin-top:-15px;border-radius:50%;background:var(--w);border:4px solid rgba(28,22,18,.25)}
  .ptag b{font:600 92px/1 Clash;white-space:nowrap}.ptag small{font:500 28px Satoshi;opacity:.6;margin-top:10px;white-space:nowrap}
  .ptag.k{background:#1b1612;color:#fff;border-color:#1b1612}
  .loupe{border-radius:50%;border:22px solid var(--k);background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.55),rgba(255,255,255,.12) 45%,rgba(255,255,255,.04));box-shadow:0 40px 80px -20px rgba(0,0,0,.5),inset 0 0 0 4px rgba(255,255,255,.4)}
  .handle{width:70px;height:300px;border-radius:35px;background:var(--k);transform-origin:50% 0}
  .ped{width:440px;height:96px;border-radius:50%;background:radial-gradient(ellipse at 50% 40%,rgba(255,90,31,.55),rgba(255,90,31,.08) 60%,transparent 70%);border:3px solid rgba(255,90,31,.8)}
  .bar2{width:400px;height:34px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden}
  .bar2 i{display:block;height:100%;border-radius:999px}
  .cork{background:#b88a5a radial-gradient(rgba(0,0,0,.18) 1.2px,transparent 1.6px) 0 0/9px 9px,radial-gradient(rgba(255,255,255,.14) 1px,transparent 1.4px) 4px 5px/11px 11px}
  .paper{background:#fbf7ee;border-radius:6px;box-shadow:0 30px 50px -16px rgba(40,20,5,.6);padding:30px 34px;color:var(--ink)}
  .paper .h{font:700 26px Satoshi;letter-spacing:.14em;opacity:.55;white-space:nowrap}
  .paper .v{font:600 84px/1.05 Clash;white-space:nowrap;margin-top:10px}
  .pin{width:46px;height:46px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ff8a6a,#c81e1e 60%,#7a0f0f);box-shadow:0 8px 12px rgba(0,0,0,.45)}
  .odo{width:620px;padding:34px 40px;border-radius:30px;background:#111;border:6px solid #333;box-shadow:0 30px 60px -20px rgba(0,0,0,.7)}
  .odo .d{font:600 120px/1 'Courier New',monospace;color:#9ef0a8;letter-spacing:.06em;text-shadow:0 0 18px rgba(120,255,140,.55);white-space:nowrap}
  .odo .u{font:700 30px Satoshi;color:rgba(255,255,255,.5);margin-top:8px;letter-spacing:.2em}
  .todo{border:5px dashed var(--o);border-radius:40px;background:#fff;padding:40px 44px;width:800px;box-shadow:0 50px 100px -30px rgba(28,22,18,.45)}
  .todo .lab{font:700 24px Satoshi;letter-spacing:.16em;color:var(--o);white-space:nowrap}
  .todo .t{font:700 44px/1.25 Satoshi;margin-top:18px}.todo .c{font:500 32px/1.4 Satoshi;opacity:.65;margin-top:18px}
  .vs{font:700 420px/0.9 Clash;letter-spacing:-.06em;color:#fff;white-space:nowrap}
  .stamp{font:700 170px/1 Clash;color:var(--r);border:14px solid var(--r);border-radius:30px;padding:10px 40px;white-space:nowrap;letter-spacing:-.03em}
  `;
  document.head.appendChild(css);

  // ---------- outils (repris de maquette-master60) ----------
  const add = (html, x, y, css = '') => { const d = document.createElement('div'); d.className = 'a'; d.style.cssText = `left:${x}px;top:${y}px;${css}`; d.innerHTML = html; F.appendChild(d); return d; };
  const at = (cx, cy, t = '') => `left:${cx}px;top:${cy}px;transform:translate(-50%,-50%) ${t}`;
  const p3 = (rx = 0, ry = 0, rz = 0, s = 1) => `perspective(1700px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`;
  // titre géant ramené dans la colonne 140 → 910 (techniques.md § 16)
  const fit = (d) => { const g = d.firstChild; let s = parseFloat(g.style.fontSize); while (d.offsetLeft + g.getBoundingClientRect().width > 910 && s > 40) { s -= 4; g.style.fontSize = s + 'px'; } return d; };
  const G = (html, x, y, size, color = 'var(--ink)', extra = '') => fit(add(`<div class="g" style="font-size:${size}px;color:${color};${extra}">${html}</div>`, x, y));
  const I = (html, x, y, size, color = 'var(--o)', extra = '') => fit(add(`<div class="g i" style="font-size:${size}px;color:${color};${extra}">${html}</div>`, x, y));
  const crop = (src, r, w, cx, cy, t = '', css = '') => {
    const k = w / r.w;
    return add(`<div class="card" style="position:relative;width:${w}px;height:${r.h * k}px;${css}"><img src="${UI}${src}.png" style="width:${r.W * k}px;left:${-r.x * k}px;top:${-r.y * k}px"></div>`, 0, 0, at(cx, cy, t));
  };
  const cursor = (x, y, dark = false) => add(`<svg class="cur" viewBox="0 0 28 36"><path d="M3 2 L3 29 L10 22.5 L14.8 33 L19.4 31 L14.7 20.8 L24 20.3 Z" fill="${dark ? '#fff' : '#0C0F14'}" stroke="${dark ? '#0C0F14' : '#fff'}" stroke-width="2.4" stroke-linejoin="round"/></svg>`, x - 6, y - 4);
  const ripple = (x, y, d = 150, o = 0.9) => add('', 0, 0, at(x, y) + `;width:${d}px;height:${d}px;opacity:${o}`).classList.add('rip');
  const brk = (html, x, y, color = 'var(--ink)') => add(`<div class="brk" style="color:${color}">${html}</div>`, x, y);
  const men = (s, color = 'var(--ink)') => add(`<div class="men" style="color:${color}">${s}</div>`, 140, 1440);
  const bg = (c) => { F.style.background = c; };
  const lst = (cx, cy, t, w, m, s, p, img, flip = false, mark = false) => add(`<div class="lst" style="width:${w}px"><img src="${img}" style="${flip ? 'transform:scaleX(-1)' : ''}"><div class="b"><div class="m" style="font-size:${w * 0.062}px">${m}</div><div class="s" style="font-size:${w * 0.045}px">${s}</div><div class="p" style="font-size:${w * 0.14}px">${p}${mark ? '<i></i>' : ''}</div></div></div>`, 0, 0, at(cx, cy, t));
  const C = {
    fiche: { W: 1050, x: 0, y: 0, w: 1050, h: 700 },
    travaux: { W: 1050, x: 0, y: 925, w: 1050, h: 215 },
    yaris: { W: 1074, x: 0, y: 470, w: 1074, h: 370 },
    h208: { W: 1074, x: 0, y: 2226, w: 1074, h: 372 },
    rapporte: { W: 1074, x: 0, y: 0, w: 1074, h: 387 },
    alerte: { W: 948, x: 0, y: 0, w: 948, h: 405 },
  };
  // cadran d'horloge : 60 graduations, secteur balayé jusqu'à la minute m, aiguille à la minute a
  const clock = (cx, cy, m, a, dark = true, back = false) => {
    const R = 430, ink = dark ? '#f4f1ec' : '#1c1612';
    let ticks = '';
    for (let i = 0; i < 60; i++) ticks += `<div class="tick" style="height:${i % 5 ? 26 : 60}px;background:${ink};opacity:${i % 5 ? 0.35 : 0.9};transform:rotate(${i * 6}deg)"></div>`;
    const sweep = `conic-gradient(from 0deg,rgba(255,90,31,.10) 0deg,rgba(255,90,31,.55) ${m * 6}deg,transparent ${m * 6}deg)`;
    const trail = back ? `<div class="a" style="inset:0;border-radius:50%;background:conic-gradient(from ${a * 6}deg,rgba(255,255,255,.0) 0deg,rgba(255,255,255,.35) 40deg,transparent 41deg)"></div>` : '';
    return add(`<div style="position:relative;width:${2 * R}px;height:${2 * R}px;border-radius:50%;border:4px solid ${dark ? 'rgba(244,241,236,.25)' : 'rgba(28,22,18,.18)'};background:${sweep}">
      ${ticks}${trail}
      <div class="a" style="left:${R - 7}px;top:${R - 380}px;width:14px;height:380px;border-radius:7px;background:var(--o);transform-origin:50% 380px;transform:rotate(${a * 6}deg);box-shadow:0 0 30px rgba(255,90,31,.6)"></div>
      <div class="a" style="left:${R - 26}px;top:${R - 26}px;width:52px;height:52px;border-radius:50%;background:var(--o)"></div></div>`, 0, 0, at(cx, cy));
  };

  const frames = [
    // ================= 1 · LE DICTIONNAIRE DU VENDEUR (plongée à travers les lettres) =================
    // 1.1 · hook, image 0
    () => {
      bg('var(--w)');
      brk('[ lu dans une annonce ]', 140, 250);
      I('« Juste un', 140, 330, 190, 'var(--ink)'); I('voyant,', 140, 520, 190, 'var(--ink)');
      add('<div style="width:700px;height:120px;border-radius:14px;background:rgba(255,90,31,.55);transform:rotate(-2deg)"></div>', 120, 760);
      I('rien de grave. »', 140, 710, 150, 'var(--ink)');
      add('<div class="ptag"><b>1 500 €</b><small>jusqu\'à · réparation</small></div>', 0, 0, at(560, 1180, p3(0, -38, -6)));
      cursor(760, 1270);
    },
    // 1.2 · plongée dans le « o » de « voyant »
    () => {
      bg('var(--k)');
      add('<div class="g i" style="font-size:1500px;color:var(--w)">voyant</div>', -560, 160);
      brk('[ la caméra <b>plonge</b> dans le « o » ]', 140, 250, '#fff');
      add('<div style="width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,rgba(255,90,31,.35),transparent 70%)"></div>', 0, 0, at(560, 1010));
      add('<div class="ptag k"><b style="color:var(--o)">100 à 1 500 €</b><small style="color:#fff">Voyant allumé, panne non diagnostiquée</small></div>', 0, 0, at(560, 1010, 'scale(.82) rotate(-3deg)') + ';width:760px');
    },
    // 1.3 · phrase suivante, l'étiquette se retourne
    () => {
      bg('var(--w)');
      I('« Petit bruit', 140, 260, 170, 'var(--ink)'); I('au démarrage. »', 140, 430, 150, 'var(--ink)');
      add('<div class="ptag" style="opacity:.35"><b style="font-size:54px">Petit bruit…</b><small>le vendeur</small></div>', 0, 0, at(430, 1000, p3(0, 70, 4, 0.9)));
      add('<div class="ptag"><b>100 à 600 €</b><small>origine inconnue</small></div>', 0, 0, at(600, 1060, p3(0, -18, -4)));
      add('<div style="width:130px;height:8px;background:var(--o);border-radius:4px;transform:rotate(-30deg)"></div>', 260, 860);
      brk('[ un mot, un <b>prix</b> ]', 140, 1260);
    },
    // 1.4 · le total
    () => {
      bg('var(--o)');
      brk('[ une seule annonce, quatre phrases ]', 140, 250, '#fff');
      G('jusqu\'à', 140, 330, 130, 'var(--k)'); G('3 450 €', 140, 470, 250, '#fff');
      [['1 500 €', 'voyant'], ['600 €', 'petit bruit'], ['900 €', 'embrayage haut'], ['450 €', 'clim à recharger']].forEach(([p, l], i) =>
        add(`<div class="tag">${p}<small>${l}</small></div>`, 0, 0, at(330 + (i % 2) * 400, 960 + Math.floor(i / 2) * 230 + (i % 2) * 40, `rotate(${[-7, 5, 4, -5][i]}deg)`)));
      men('Fourchettes de la grille de coûts UTOPICAR', '#fff');
    },
    // 1.5 · la solution : la vraie fiche chiffre les travaux
    () => {
      bg('var(--w)');
      G('UTOPICAR', 140, 250, 110); I('chiffre chaque phrase.', 140, 380, 120);
      brk('[ avant que tu <b>appelles</b> ]', 140, 560);
      crop('fiche-208', C.fiche, 620, 540, 920, p3(10, -14, -2));
      crop('fiche-208', C.travaux, 720, 560, 1290, p3(6, -10, 1), 'background:#fff');
      add('<div class="hl" style="width:720px;height:150px"></div>', 0, 0, at(560, 1290, p3(6, -10, 1)));
      cursor(880, 1330); men('Données de démonstration');
    },

    // ================= 2 · 15 MINUTES (horloge radar, l'aiguille sert de volet) =================
    // 2.1 · hook
    () => {
      bg('var(--k)');
      G('En ligne', 140, 250, 150, '#fff'); I('15 minutes.', 140, 400, 190);
      clock(540, 1050, 15, 15);
      add('<div class="ann2"><div class="m">Renault Mégane 3</div><div class="s">annonce mise en ligne · 9 h 00</div><div class="p">1 500 €</div></div>', 0, 0, at(700, 860, p3(8, -10, -4, 0.78)));
    },
    // 2.2 · minute 2 : quelqu'un appelle
    () => {
      bg('var(--k)');
      G('Minute', 140, 250, 150, '#fff'); G('2.', 140, 400, 230, 'var(--o)');
      clock(540, 1050, 2, 2);
      add('<div class="ann2"><div class="m">Renault Mégane 3</div><div class="s">il y a 2 min</div><div class="p">1 500 €</div></div>', 0, 0, at(660, 860, p3(8, -10, -4, 0.78)));
      ripple(830, 980, 220, 0.8); ripple(830, 980, 360, 0.35);
      add('<div class="msg" style="background:#fff;color:var(--ink)">📞 Appel entrant<small>quelqu\'un a été plus rapide</small></div>', 0, 0, at(560, 1330));
    },
    // 2.3 · minute 16 : « déjà vendue »
    () => {
      bg('var(--w)');
      G('Minute', 140, 250, 150); G('16.', 140, 400, 230, 'var(--o)');
      clock(540, 1000, 16, 16, false);
      add('<div class="ann2" style="opacity:.5"><div class="m">Mégane 3</div><div class="p">1 500 €</div></div>', 0, 0, at(540, 1000, 'scale(.22) rotate(40deg)') + ';filter:blur(3px)');
      brk('[ annonce <b>supprimée</b> ]', 520, 520);
      add('<div class="msg" style="background:var(--o);color:#1a1310">Bonjour, toujours dispo ?</div>', 0, 0, at(600, 1250));
      add('<div class="msg" style="background:#fff;color:var(--ink)">Désolé, déjà vendue.</div>', 0, 0, at(440, 1380));
    },
    // 2.4 · relance : l'aiguille se rembobine
    () => {
      bg('var(--o)');
      G('Il ne cherchait', 140, 250, 120, '#fff'); G('pas.', 140, 370, 120, '#fff');
      I('Il a reçu', 140, 500, 170, 'var(--k)'); I('une alerte.', 140, 670, 170, 'var(--k)');
      const c = clock(540, 1220, 0, 58, true, true); c.style.transform += ' scale(.68)';
      add('<div style="font:700 60px Satoshi;color:#fff;white-space:nowrap">↺</div>', 0, 0, at(540, 1220));
    },
    // 2.5 · la solution : minute zéro
    () => {
      bg('var(--k)');
      G('Minute', 140, 250, 150, '#fff'); I('zéro.', 140, 400, 230);
      ripple(540, 1000, 300, 0.7); ripple(540, 1000, 520, 0.3);
      crop('tb-journee-action-4', C.alerte, 820, 540, 1000, p3(10, -8, -3));
      brk('[ la nouvelle annonce arrive <b>chez toi</b> ]', 140, 1250, '#fff');
      cursor(760, 1090, true); men('Données de démonstration', '#fff');
    },

    // ================= 3 · DEUX 208, UN MOT (miroir parfait qui décroche) =================
    // 3.1 · hook
    () => {
      bg('var(--w)');
      G('Deux 208.', 140, 250, 170); I('J\'achète', 140, 420, 170); I('la plus chère.', 140, 590, 150);
      add('<div style="width:4px;height:760px;background:linear-gradient(transparent,rgba(28,22,18,.35),transparent)"></div>', 0, 0, at(540, 1130));
      lst(320, 1130, p3(4, 22, 0), 400, 'Peugeot 208 1.2', '2016 · Essence', '7 190 €', PH + '208-annonce.jpg');
      lst(760, 1130, p3(4, -22, 0), 400, 'Peugeot 208 1.6', '2016 · Diesel', '8 200 €', PH + '208-annonce.jpg', true);
      men('Données de démonstration');
    },
    // 3.2 · trouve la différence
    () => {
      bg('var(--k)');
      G('Trouve', 140, 250, 160, '#fff'); I('la différence.', 140, 410, 150);
      lst(320, 1130, p3(4, 22, 0), 400, 'Peugeot 208 1.2', '2016 · Essence', '7 190 €', PH + '208-annonce.jpg');
      lst(760, 1130, p3(4, -22, 0), 400, 'Peugeot 208 1.6', '2016 · Diesel', '8 200 €', PH + '208-annonce.jpg', true);
      add('<div class="loupe" style="width:300px;height:300px"></div>', 0, 0, at(400, 1050));
      add('<div class="handle"></div>', 0, 0, at(540, 1300, 'rotate(-40deg)'));
      add('<div style="width:220px;height:220px;border-radius:50%;border:14px solid rgba(255,255,255,.15);border-top-color:var(--o);display:flex;align-items:center;justify-content:center;font:700 130px Clash;color:#fff">3</div>', 0, 0, at(540, 1440));
    },
    // 3.3 · le mot trouvé, le miroir décroche
    () => {
      bg('var(--w)');
      G('Un mot.', 140, 250, 170); I('PureTech.', 140, 420, 210, 'var(--r)');
      lst(330, 1210, p3(18, 30, 14, 0.92), 400, 'Peugeot 208 <span style="background:rgba(200,30,30,.18);border-radius:8px;padding:0 6px">1.2 PureTech</span>', '2016 · Essence', '7 190 €', PH + '208-annonce.jpg').style.filter = 'brightness(.62) saturate(.6)';
      lst(740, 1080, p3(2, -8, 0, 1.05), 420, 'Peugeot 208 1.6 BlueHDi', '2016 · Diesel', '8 200 €', PH + '208-annonce.jpg', true, true);
      add('<div class="loupe" style="width:420px;height:420px;display:flex;align-items:center;justify-content:center;background:#fff"><div style="font:600 64px/1.05 Clash;color:var(--r);text-align:center">1.2<br>PureTech</div></div>', 0, 0, at(330, 960));
      add('<div class="handle"></div>', 0, 0, at(480, 1230, 'rotate(-40deg)'));
    },
    // 3.4 · pourquoi : schéma tracé en code, l'huile monte sur la courroie
    () => {
      bg('var(--k)');
      G('Courroie', 140, 250, 170, '#fff'); I('dans l\'huile.', 140, 420, 190);
      add(`<svg width="860" height="760" viewBox="0 0 860 760">
        <defs><clipPath id="cl"><rect x="0" y="420" width="860" height="400"/></clipPath></defs>
        <rect x="40" y="420" width="780" height="320" rx="30" fill="rgba(255,90,31,.85)"/>
        <path d="M40 430 Q 220 400 430 428 T 820 424" stroke="#ffb38a" stroke-width="8" fill="none"/>
        <circle cx="250" cy="220" r="150" fill="none" stroke="#f4f1ec" stroke-width="10"/>
        <circle cx="610" cy="520" r="110" fill="none" stroke="#f4f1ec" stroke-width="10"/>
        <path d="M250 70 L610 410 M250 370 L610 630" stroke="#f4f1ec" stroke-width="22" stroke-linecap="round"/>
        <g clip-path="url(#cl)"><path d="M250 370 L610 630" stroke="#1c1612" stroke-width="22" stroke-linecap="round" opacity=".55"/><circle cx="610" cy="520" r="110" fill="none" stroke="#1c1612" stroke-width="10" opacity=".55"/></g>
        <circle cx="250" cy="220" r="20" fill="#f4f1ec"/><circle cx="610" cy="520" r="18" fill="#f4f1ec"/>
      </svg>`, 0, 0, at(540, 1060));
      brk('[ et tes acheteurs <b>le savent</b> ]', 140, 1440, '#fff');
    },
    // 3.5 · la solution : la vraie fiche
    () => {
      bg('var(--w)');
      G('UTOPICAR', 140, 250, 110); I('te le dit avant.', 140, 380, 140);
      crop('fiche-208', C.fiche, 700, 520, 870, p3(10, 14, 2));
      crop('tb-affaires', C.h208, 640, 580, 1300, p3(6, -12, -2));
      add('<div class="hl" style="width:500px;height:120px"></div>', 0, 0, at(640, 1000, p3(10, 14, 2)));
      cursor(820, 1040); men('Données de démonstration');
    },

    // ================= 4 · CHOISIS TA VOITURE (écran de sélection de jeu vidéo) =================
    // 4.1 · hook
    () => {
      bg('var(--k)');
      G('Une des deux', 140, 250, 120, '#fff'); G('te coûte', 140, 370, 120, '#fff'); G('2 700 €.', 140, 490, 190, 'var(--o)');
      [[310, 'mercedes-profil.jpg', PH, 'Mercedes Classe A', '19 990 €'], [770, 'yaris-1.webp', DEMO, 'Toyota Yaris', '8 990 €']].forEach(([x, f, d, m, p], i) => {
        add('<div class="ped"></div>', 0, 0, at(x, 1270));
        add(`<div class="card" style="position:relative;width:400px;height:260px;background:url(${d}${f}) center/cover"></div>`, 0, 0, at(x, 1080, p3(6, i ? -16 : 16, 0)));
        add(`<div style="text-align:center;color:#fff"><div style="font:700 36px Satoshi;white-space:nowrap">${m}</div><div style="font:600 70px Clash;white-space:nowrap">${p}</div></div>`, 0, 0, at(x, 1370));
      });
      add('<div style="width:440px;height:330px;border-radius:44px;border:6px solid var(--o)"></div>', 0, 0, at(310, 1080, 'rotate(-2deg)'));
      cursor(420, 1150, true);
    },
    // 4.2 · 3 secondes, choisis
    () => {
      bg('var(--k)');
      G('3 secondes.', 140, 250, 140, '#fff'); I('Choisis.', 140, 400, 220);
      [[310, 'mercedes-profil.jpg', PH, 'Coup de cœur', 92], [770, 'yaris-1.webp', DEMO, 'Coup de cœur', 38]].forEach(([x, f, d, l, v], i) => {
        add(`<div class="card" style="position:relative;width:400px;height:260px;background:url(${d}${f}) center/cover"></div>`, 0, 0, at(x, 920, p3(6, i ? -16 : 16, 0)));
        add(`<div style="color:#fff"><div style="font:700 28px Satoshi;opacity:.6;margin-bottom:10px">${l}</div><div class="bar2"><i style="width:${v}%;background:${i ? '#7d756e' : 'var(--o)'}"></i></div></div>`, 0, 0, at(x, 1130));
      });
      add('<div style="width:300px;height:300px;border-radius:50%;border:16px solid rgba(255,255,255,.15);border-top-color:var(--o);border-right-color:var(--o);display:flex;align-items:center;justify-content:center;font:700 170px Clash;color:#fff">3</div>', 0, 0, at(540, 1320));
      cursor(360, 960, true);
    },
    // 4.3 · VS
    () => {
      bg('var(--o)');
      add('', 0, 0, 'width:1080px;height:1920px;background:var(--k);clip-path:polygon(0 0,100% 0,100% 38%,0 62%)');
      add(`<div class="card" style="position:relative;width:520px;height:340px;background:url(${PH}mercedes-profil.jpg) center/cover"></div>`, 0, 0, at(330, 620, 'rotate(-8deg)'));
      add(`<div class="card" style="position:relative;width:520px;height:340px;background:url(${DEMO}yaris-1.webp) center/cover"></div>`, 0, 0, at(750, 1300, 'rotate(7deg)'));
      add('<div class="vs">VS</div>', 0, 0, at(540, 960, 'rotate(-12deg)'));
    },
    // 4.4 · K.O. : les barres de vie deviennent la marge
    () => {
      bg('var(--w)');
      G('La plus belle', 140, 250, 120); I('perd.', 140, 380, 230, 'var(--r)');
      add(`<div style="width:800px"><div style="display:flex;justify-content:space-between;font:700 40px Satoshi"><span>Mercedes Classe A</span><b style="font:600 64px Clash;color:var(--r)">−2 700 €</b></div>
        <div style="height:46px;border-radius:999px;background:rgba(28,22,18,.08);margin-top:14px;overflow:hidden"><i style="display:block;width:6%;height:100%;background:var(--r);border-radius:999px"></i></div>
        <div style="display:flex;justify-content:space-between;font:700 40px Satoshi;margin-top:60px"><span>Toyota Yaris</span><b style="font:600 64px Clash;color:var(--ok)">+1 240 €</b></div>
        <div style="height:46px;border-radius:999px;background:rgba(28,22,18,.08);margin-top:14px;overflow:hidden"><i style="display:block;width:84%;height:100%;background:var(--ok);border-radius:999px"></i></div></div>`, 140, 780);
      add('<div class="stamp">K.O.</div>', 0, 0, at(560, 1290, 'rotate(-10deg)'));
      men('Données de démonstration');
    },
    // 4.5 · la solution : les vraies fiches
    () => {
      bg('var(--k)');
      G('UTOPICAR', 140, 250, 110, '#fff'); I('a tranché en 2 s.', 140, 380, 130);
      crop('merc-rapporte', C.rapporte, 800, 540, 820, p3(8, -10, -2));
      crop('tb-affaires', C.yaris, 720, 560, 1190, p3(6, 10, 2));
      brk('[ et toi, <b>laquelle</b> tu prenais ? ]', 140, 1400, '#fff');
      cursor(760, 860, true); men('Données de démonstration', '#fff');
    },

    // ================= 5 · LE COMPTEUR QUI RECULE (tableau d'enquête, le fil devient la courbe) =================
    // 5.1 · hook
    () => {
      bg('#b88a5a'); F.classList.add('cork');
      add('<div class="paper" style="width:600px"><div class="h">L\'ANNONCE</div><div class="v">131 000 km</div></div>', 0, 0, at(470, 380, 'rotate(-4deg)'));
      add('<div class="pin"></div>', 0, 0, at(470, 300));
      add('<div class="odo"><div class="d">184 000</div><div class="u">PHOTO DU COMPTEUR · MÊME ANNONCE</div></div>', 0, 0, at(560, 900, 'rotate(5deg)'));
      add('<div class="pin"></div>', 0, 0, at(560, 790));
      add('<div style="width:520px;height:8px;background:#c81e1e;border-radius:4px;box-shadow:0 4px 6px rgba(0,0,0,.35)"></div>', 0, 0, at(515, 545, 'rotate(84deg)'));
      add('<div class="paper" style="padding:22px 30px"><div style="font:700 60px Satoshi;white-space:nowrap">Cherchez l\'erreur.</div></div>', 0, 0, at(540, 1240, 'rotate(-2deg)'));
      men('Exemple : dossier démo à créer', '#2b1d10');
    },
    // 5.2 · le fil rouge trace la courbe : elle monte, puis redescend
    () => {
      bg('#b88a5a'); F.classList.add('cork');
      add('<div class="paper" style="padding:18px 30px"><div style="font:600 70px Clash;white-space:nowrap">Le compteur a <span style="color:#c81e1e">reculé.</span></div></div>', 0, 0, at(540, 330, 'rotate(-1.5deg)'));
      const P = [[220, 1150, 'CT 2020', '118 000'], [520, 760, 'CT 2022', '184 000'], [820, 1060, 'Annonce 2026', '131 000']];
      add(`<svg width="1080" height="1920" style="position:absolute;left:0;top:0"><polyline points="${P.map(([x, y]) => `${x},${y}`).join(' ')}" fill="none" stroke="#c81e1e" stroke-width="9" stroke-linejoin="round" style="filter:drop-shadow(0 5px 4px rgba(0,0,0,.35))"/></svg>`, 0, 0);
      P.forEach(([x, y, h, v], i) => {
        add(`<div class="paper" style="width:290px;padding:20px 24px"><div class="h" style="font-size:20px">${h}</div><div class="v" style="font-size:54px">${v}</div></div>`, 0, 0, at(x, y + 150, `rotate(${[-4, 3, -3][i]}deg)`));
        add('<div class="pin"></div>', 0, 0, at(x, y));
      });
      men('Exemple : dossier démo à créer', '#2b1d10');
    },
    // 5.3 · le conseil gratuit
    () => {
      bg('var(--k)');
      G('Demande', 140, 250, 160, '#fff'); G('le HistoVec.', 140, 410, 150, '#fff'); I('C\'est gratuit.', 140, 580, 170);
      add(`<div class="paper" style="width:560px;height:620px;padding:46px"><div class="h">RAPPORT DU VÉHICULE</div>
        ${[90, 70, 84, 60, 76, 50].map((w) => `<div style="height:22px;width:${w}%;border-radius:11px;background:rgba(28,22,18,.12);margin-top:34px"></div>`).join('')}</div>`, 0, 0, at(560, 1060, p3(10, -16, -4) + ' scale(.85)'));
      brk('[ s\'il refuse, <b>tu passes</b> ]', 140, 1440, '#fff');
    },
    // 5.4 · la solution : l'outil lit le compteur sur les photos
    () => {
      bg('var(--w)');
      G('UTOPICAR', 140, 250, 110); I('lit le compteur', 140, 380, 130); I('sur les photos.', 140, 510, 130);
      add(`<div class="todo"><div class="lab">À CAPTURER · VIGILANCE DE L'ANALYSE</div>
        <div class="t">Le compteur en photo indique 184 000 km, l'annonce 131 000 km</div>
        <div class="c">Demandez une explication et le rapport HistoVec : un compteur trafiqué fait perdre beaucoup à la revente.</div></div>`, 0, 0, at(540, 1060, p3(8, -8, -2)));
      cursor(820, 1180); men('Textes réels de l\'outil (vigilance.ts) · capture à faire');
    },
    // 5.5 · CTA de partage
    () => {
      bg('var(--o)');
      G('Envoie ça', 140, 250, 170, '#fff'); G('à ton pote', 140, 420, 170, '#fff'); I('qui cherche', 140, 590, 170, 'var(--k)'); I('une voiture.', 140, 760, 170, 'var(--k)');
      add('<div style="width:200px;height:200px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font:700 110px Satoshi;color:var(--o)">➦</div>', 0, 0, at(540, 1130));
      add(`<img src="${BR}utopicar-logo-horizontal-fond-sombre.svg" style="width:640px;display:block">`, 0, 0, at(540, 1380));
    },
  ];
  frames[N]();
  await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
  window.nFrames = frames.length;
  window.ready = true;
})();
