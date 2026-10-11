// master60 · maquette « wow » (1920×1080) : un écran plein par idée, la phrase de Simon écrite en géant,
// la vraie interface de l'app en 3D en dessous. ?f=N affiche l'écran N (images fixes, pour valider avant la production).
(async function () {
  const F = document.getElementById('f');
  const N = +(new URLSearchParams(location.search).get('f') || 0);
  const UI = '../film-master60/ui-blanc/', PH = '../assets/master60/photos/', BR = '../assets/brand/official/';
  await Promise.all(['700 200px Clash', '600 60px Clash', '700 40px Satoshi', '500 30px Satoshi', 'italic 200px Instrument'].map((f) => document.fonts.load(f)));

  // ---------- outils ----------
  const add = (html, x, y, css = '') => { const d = document.createElement('div'); d.className = 'a'; d.style.cssText = `left:${x}px;top:${y}px;${css}`; d.innerHTML = html; F.appendChild(d); return d; };
  const at = (cx, cy, t = '') => `left:${cx}px;top:${cy}px;transform:translate(-50%,-50%) ${t}`;
  const p3 = (rx = 0, ry = 0, rz = 0, s = 1) => `perspective(1700px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`;
  // texte géant (x, y = coin haut-gauche)
  const G = (html, x, y, size, color = 'var(--ink)', extra = '') => add(`<div class="g" style="font-size:${size}px;color:${color};${extra}">${html}</div>`, x, y);
  const I = (html, x, y, size, color = 'var(--o)', extra = '') => add(`<div class="g i" style="font-size:${size}px;color:${color};${extra}">${html}</div>`, x, y);
  // morceau d'une capture (px de l'image source), largeur w, posé par son centre, incliné
  const crop = (src, r, w, cx, cy, t = '', css = '') => {
    const k = w / r.w;
    return add(`<div class="card" style="position:relative;width:${w}px;height:${r.h * k}px;${css}"><img src="${UI}${src}.png" style="width:${r.W * k}px;left:${-r.x * k}px;top:${-r.y * k}px"></div>`, 0, 0, at(cx, cy, t));
  };
  const cursor = (x, y, dark = false) => add(`<svg class="cur" viewBox="0 0 28 36"><path d="M3 2 L3 29 L10 22.5 L14.8 33 L19.4 31 L14.7 20.8 L24 20.3 Z" fill="${dark ? '#fff' : '#0C0F14'}" stroke="${dark ? '#0C0F14' : '#fff'}" stroke-width="2.4" stroke-linejoin="round"/></svg>`, x - 6, y - 4);
  const ripple = (x, y, d = 150, o = 0.9) => add('', 0, 0, at(x, y) + `;width:${d}px;height:${d}px;opacity:${o}`).classList.add('rip');
  const men = (s, color = 'var(--ink)') => add(`<div class="men" style="color:${color}">${s}</div>`, 96, 940);
  const bg = (c) => { F.style.background = c; };
  const lst = (cx, cy, t, w = 560, mark = true) => add(`<div class="lst" style="width:${w}px"><img src="${PH}208-annonce.jpg"><div class="b"><div class="m">Peugeot 208 1.2 PureTech 110</div><div class="s">2016 · 116 789 km · Essence</div><div class="p">7 190 €${mark ? '<i></i>' : ''}</div></div></div>`, 0, 0, at(cx, cy, t));
  const W = { fiche: { W: 1050, x: 0, y: 0, w: 1050, h: 1617 }, ent: { W: 1074 } };

  const frames = [
    // 1 · ouverture A, image 0
    () => {
      bg('var(--w)');
      G('Ta première', 96, 250, 170); I('voiture ?', 96, 430, 210);
      lst(1400, 520, p3(10, -22, -3));
      cursor(1250, 760); men('Vraie annonce, analysée par UTOPICAR');
    },
    // 2 · « …deux fois. »
    () => {
      bg('var(--o)');
      G('Deux', 96, 150, 380, '#fff'); I('fois.', 110, 520, 400, 'var(--k)');
      add('<div class="tag">7 190 €<small>le prix affiché</small></div>', 0, 0, at(1330, 420, 'rotate(-6deg)'));
      add('<div class="tag" style="border-color:var(--k)">7 190 €<small>une 2e fois en réparations ?</small></div>', 0, 0, at(1500, 640, 'rotate(7deg)'));
      men('Vraie annonce, analysée par UTOPICAR', '#fff');
    },
    // 3 · ouverture B
    () => {
      bg('var(--k)');
      const M = ['Peugeot 208|2016 · 116 789 km|7 190 €', 'BMW Série 1|2013 · 174 000 km|5 500 €', 'Renault Clio|2019 · 62 000 km|10 490 €', 'Volkswagen Polo|2016 · 98 000 km|9 990 €',
        'Opel Corsa|2017 · 88 000 km|7 900 €', 'Renault Mégane|2015 · 140 000 km|7 500 €', 'Peugeot 308|2017 · 101 000 km|10 990 €', 'Ford Fiesta|2018 · 74 000 km|8 890 €'];
      let h = '';
      for (let r = 0; r < 8; r++) for (let c = 0; c < 6; c++) { const [m, s, p] = M[(r * 6 + c) % M.length].split('|'); h += `<div class="ann" style="left:${c * 330}px;top:${r * 200}px"><div class="m">${m}</div><div class="s">${s}</div><div class="p">${p}</div></div>`; }
      add(`<div style="position:relative;width:1960px;height:1600px">${h}</div>`, 0, 0, at(1250, 560, p3(46, 0, -14, 1.05)) + ';opacity:.85');
      add('', 0, 0, 'width:1920px;height:1080px;background:linear-gradient(90deg,rgba(14,11,9,.96) 0,rgba(14,11,9,.85) 720px,rgba(14,11,9,0) 1150px)');
      G('50', 90, 120, 560, 'var(--o)'); G('annonces.', 100, 650, 120, '#fff'); I('ce matin.', 104, 780, 140, '#fff');
      men('Vraies annonces du marché', '#fff');
    },
    // 4 · « Celle-là… tu l'achètes ? »
    () => {
      bg('var(--w)');
      G('Tu', 110, 150, 170);
      I("l'achètes ?", 80, 470, 300, 'var(--o)');
      lst(1520, 560, p3(4, 12, 2), 540);
      cursor(1430, 800); men('Vraie annonce, analysée par UTOPICAR');
    },
    // 5 · « Je colle l'annonce. »
    () => {
      bg('var(--k)');
      G('Je colle <span class="i" style="color:var(--o);font-size:1.1em">l\'annonce.</span>', 96, 140, 170, '#fff');
      add(`<div style="width:1600px;height:190px;border-radius:999px;background:#fff;display:flex;align-items:center;padding:0 24px 0 60px;gap:26px;box-shadow:0 50px 100px -30px rgba(0,0,0,.8)">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#1c1612" stroke-width="2.2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>
        <div style="flex:1;font:500 46px Satoshi;color:#1c1612;white-space:nowrap;overflow:hidden">…/annonce/peugeot-208-puretech-110<span style="display:inline-block;width:4px;height:52px;background:var(--o);vertical-align:-8px;margin-left:4px"></span></div>
        <div style="height:142px;padding:0 64px;border-radius:999px;background:var(--o);display:flex;align-items:center;font:600 56px Clash;color:#1a1310">Analyser</div></div>`, 0, 0, at(960, 620, p3(14, 0, -2)));
      ripple(1560, 640, 220, 0.8); cursor(1580, 650, true);
    },
    // 6 · « Ah. »
    () => {
      bg('var(--k)');
      add('<div style="width:110px;height:110px;border-radius:50%;border:12px solid rgba(255,90,31,.25);border-top-color:var(--o)"></div>', 0, 0, at(960, 440));
      G('Ah.', 0, 0, 150, '#6b625b', 'transform:translate(-50%,0);position:absolute;left:960px;top:560px');
    },
    // 7 · « Non. »
    () => {
      bg('var(--r)');
      G('Non.', 70, 300, 760, '#fff');
      crop('fiche-208', { W: 1050, x: 0, y: 0, w: 1050, h: 700 }, 620, 1480, 380, 'rotate(6deg)', 'background:#fff');
      men('Vraie annonce, analysée par UTOPICAR', '#fff');
    },
    // 8 · « 1 650 € de travaux… »
    () => {
      bg('var(--w)');
      // compteur à rouleaux : chaque chiffre tourne, ses voisins flous au-dessus et en dessous
      const reel = (d, x) => add(`<div style="font:700 230px/1 Clash;letter-spacing:-.04em;color:var(--r);text-align:center">
        <div>${d}</div></div>`, x, 320);
      G('+', 96, 320, 230, 'var(--r)'); ['1', '6', '5', '0'].forEach((d, i) => reel(d, 250 + i * 150 + (i > 0 ? 50 : 0)));
      G('€', 920, 320, 230, 'var(--r)');
      add('<div class="brk">[ de travaux que le vendeur a <b>oubliés</b> ]</div>', 100, 660);
      const fc = crop('fiche-208', W.fiche, 520, 1430, 540, p3(12, -16, -2));
      add('<div class="hl" style="width:500px;height:92px"></div>', 0, 0, at(1430, 590, p3(12, -16, -2)));
      cursor(1600, 610); men('Vraie annonce, analysée par UTOPICAR');
    },
    // 9 · « Bizarre. »
    () => {
      bg('var(--w)');
      I('Bizarre.', 90, 300, 430, 'var(--ink)', 'transform:rotate(-6deg)');
      crop('fiche-208', W.fiche, 400, 1580, 560, 'rotate(9deg)');
      cursor(1350, 420); men('Vraie annonce, analysée par UTOPICAR');
    },
    // 10 · « UTOPICAR »
    () => {
      bg('var(--o)');
      add('', 0, 0, at(960, 540) + ';width:1800px;height:1800px;border-radius:50%;box-shadow:0 0 0 2000px var(--w)');
      add(`<img src="${BR}utopicar-logo-horizontal-fond-sombre.svg" style="width:1100px;display:block">`, 0, 0, at(960, 520));
      add('<div style="font:700 46px Satoshi;color:#fff;white-space:nowrap">Colle l\'annonce. Ta marge nette, frais déduits.</div>', 0, 0, at(960, 760));
    },
    // 11 · « …et bam, ce qu'il te reste, frais déduits »
    () => {
      bg('var(--w)');
      I('Bam.', 96, 90, 330, 'var(--o)');
      add('<div style="width:1500px;height:6px;border-radius:3px;background:linear-gradient(90deg,var(--ok) 0,var(--ok) 66%,rgba(28,22,18,.12) 66%)"></div>', 0, 0, at(960, 690));
      add('<div class="step"><i>✓</i>Colle l\'annonce</div>', 0, 0, at(420, 690));
      add('<div class="step"><i>✓</i>Frais déduits</div>', 0, 0, at(960, 690));
      add('<div class="step on"><i>3</i>Ta marge nette</div>', 0, 0, at(1500, 690, 'scale(1.06)'));
      ripple(1360, 700, 200, 0.7); cursor(1370, 712);
      add('<div class="brk">[ ce qu\'il te reste, <b>frais déduits</b> ]</div>', 100, 840);
    },
    // 12 · Mercedes, prix max
    () => {
      bg('var(--k)');
      G('<s style="text-decoration-thickness:10px">19 990 €</s>', 96, 130, 120, 'rgba(251,249,245,.28)');
      G('Prix max', 100, 300, 90, '#fff'); G('16 500 €', 90, 410, 190, 'var(--o)');
      add('<div class="brk" style="color:#fff">[ au-delà, tu <b>perds de l\'argent</b> ]</div>', 100, 720);
      add(`<div class="card" style="width:760px;height:520px"><img src="${PH}mercedes-profil.jpg" style="width:100%;height:100%;object-fit:cover;position:static"></div>`, 0, 0, at(1390, 380, p3(8, -18, -2)));
      crop('merc-argent', { W: 1074, x: 66, y: 1960, w: 942, h: 286 }, 740, 1400, 770, p3(8, -18, -2) + ' translateZ(60px)');
      men('Vraie annonce, analysée par UTOPICAR', '#fff');
    },
    // 13 · « en vente trois fois ? Ah ouais ! »
    () => {
      bg('var(--w)');
      G('×3', 80, 110, 560, 'var(--o)'); I('Ah ouais !', 110, 700, 150, 'var(--ink)');
      crop('merc-historique', { W: 1074, x: 50, y: 860, w: 974, h: 280 }, 760, 1400, 300, p3(12, 10, 3));
      add('<div class="tag">17 990 €<small>Bretagne</small></div>', 0, 0, at(1150, 640, 'rotate(-6deg)'));
      add('<div class="tag" style="border-color:var(--o);border-width:5px">19 990 €<small>cette annonce</small></div>', 0, 0, at(1430, 700, 'rotate(2deg) scale(1.08)'));
      add('<div class="tag">21 990 €<small>Tarn</small></div>', 0, 0, at(1710, 630, 'rotate(8deg)'));
      cursor(1450, 760); men('Vraies annonces, analysées par UTOPICAR');
    },
    // 14 · chapitre 02, « Quinze voitures en stock ? »
    () => {
      bg('var(--k)');
      for (let r = 0; r < 7; r++) add(`<div class="out">${"APRÈS L'ACHAT · ".repeat(5)}</div>`, -300 + (r % 2) * 420, -40 + r * 160);
      add('<div style="padding:40px 70px;background:var(--o);border-radius:30px"><div style="font:700 44px Satoshi;color:#fff;opacity:.85">02 · Après l\'achat</div><div class="g" style="font-size:170px;color:#fff;margin-top:10px">15 voitures</div><div class="g i" style="font-size:170px;color:var(--k)">en stock ?</div></div>', 0, 0, at(960, 540, 'rotate(-3deg)'));
    },
    // 15 · « Pfff… »
    () => {
      bg('var(--w)');
      I('Pfff…', 160, 250, 520, '#ddd4c8');
      const P = ['Clio IV', '308', 'Captur', 'A3', 'Yaris', 'Golf VI', '207', 'C4 Picasso', 'Mégane III', 'Fiesta', 'Auris', 'C3', 'Sandero', 'Clio III', 'Twingo II'];
      P.forEach((m, i) => { const c = i % 5, r = Math.floor(i / 5); add(`<div class="puce"><b>●</b>${m}</div>`, 0, 0, at(560 + c * 260 + (r % 2) * 60, 560 + r * 120 + ((i * 37) % 40), `rotate(${((i * 53) % 15) - 7}deg)`)); });
      men('Données de démonstration');
    },
    // 16 · « Carnet, calculette, quatorze onglets… »
    () => {
      bg('var(--beige)');
      const desk = `<div style="position:relative;width:1200px;height:900px">
        <div class="note a" style="left:120px;top:220px;transform:rotate(-7deg)">Clio · 6 700 → marge ?<br>308 : CT ok ? <s>4 100</s> 3 900<br>Captur → baisser ??<br>A3 Lyon… rappeler<br>frais ≈ ?</div>
        <div class="calc a" style="left:640px;top:330px;transform:rotate(8deg)"><div class="e">-130</div><div class="k">${'<span></span>'.repeat(15)}<span class="o"></span></div></div>
        ${['Annonce Clio', 'Cote 308', 'Carte grise : simulateur', 'Assurance', 'Annonce A3', 'Contrôle technique', 'Pneus prix', 'Annonce Captur', 'Messages', 'Tableur marges', 'Cote Captur', 'Banque', 'Annonce Polo', 'Calendrier']
          .map((s, i) => `<div class="tab a" style="left:${(i % 4) * 270 + ((i * 53) % 40)}px;top:${Math.floor(i / 4) * 80 + ((i * 29) % 30)}px;transform:rotate(${((i * 7) % 9) - 4}deg)">${s}</div>`).join('')}</div>`;
      add(desk, 0, 0, at(1420, 540, p3(28, 0, -8, 0.82)));
      G('Carnet.', 96, 160, 150); G('Calculette.', 96, 330, 150); I('14 onglets…', 96, 500, 170, 'var(--o)');
    },
    // 17 · « Hop ! »
    () => {
      bg('var(--o)');
      add('', 0, 0, 'width:1920px;height:1080px;background:repeating-conic-gradient(from 0deg at 960px 540px,rgba(255,255,255,.16) 0deg 1.2deg,transparent 1.2deg 9deg);-webkit-mask-image:radial-gradient(circle at 960px 540px,transparent 280px,#000 700px)');
      G('Hop !', 0, 0, 520, '#fff', 'position:absolute;left:960px;top:540px;transform:translate(-50%,-50%)');
    },
    // 18 · « Tu ouvres ton tableau de bord »
    () => {
      bg('var(--w)');
      G('Ton tableau', 96, 210, 150); I('de bord.', 96, 370, 180, 'var(--o)');
      add('<div class="brk">[ tu sais quoi faire <b>ce matin</b> ]</div>', 100, 640);
      crop('tb-entete', { W: 1074, x: 0, y: 0, w: 1074, h: 2215 }, 680, 1420, 640, p3(24, -16, -6));
      men('Données de démonstration');
    },
    // 19 · « La 308 dort depuis 63 jours ? Baisse le prix. »
    () => {
      bg('var(--w)');
      G('La 308 dort depuis', 96, 110, 76);
      G('63', 80, 190, 480, 'var(--o)'); I('jours.', 640, 470, 170, 'var(--ink)');
      crop('tb-entete', { W: 1074, x: 40, y: 1330, w: 994, h: 450 }, 740, 1450, 560, p3(6, -10, -1));
      add('<div class="hl" style="width:270px;height:64px"></div>', 0, 0, at(1295, 698, p3(6, -10, -1)));
      ripple(1295, 700, 170, 0.8); cursor(1306, 712, true);
      add('<div class="brk">[ <b>Baisse le prix.</b> ]</div>', 100, 840); men('Données de démonstration');
    },
    // 20 · « Une A3 sous la cote ? Ding ! »
    () => {
      bg('var(--k)');
      G('Ding !', 90, 100, 360, 'var(--o)');
      G('−18 % sous la cote', 100, 560, 92, '#fff');
      crop('tb-marche-annonce-1', { W: 840, x: 0, y: 500, w: 840, h: 760 }, 520, 1600, 760, p3(8, 16, 2), 'opacity:.9');
      for (const [d, o] of [[260, 0.5], [380, 0.28], [500, 0.12]]) ripple(1140, 560, d, o);
      add(`<div class="notif"><div class="ic"><svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="#1a1310" stroke-width="2.4" stroke-linecap="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg></div><div><div class="t">Audi A3 Sportback · −18 % sous la cote</div><div class="s">Nouvelle annonce · à analyser avant les autres</div></div></div>`, 0, 0, at(1450, 560, 'rotate(-3deg) scale(.86)'));
      cursor(1540, 610); men('Données de démonstration', '#fff');
    },
    // 21 · « Et ta vraie marge, voiture par voiture. »
    () => {
      bg('var(--w)');
      G('Ta vraie marge,', 96, 120, 110); I('voiture par voiture.', 96, 250, 120, 'var(--o)');
      G('4 860 €', 90, 470, 230, 'var(--ink)');
      add('<div style="font:700 40px Satoshi;color:var(--ok)">▲ + 3 870 € par rapport à septembre</div>', 100, 730);
      crop('tb-marges', { W: 1074, x: 0, y: 0, w: 1074, h: 790 }, 680, 1460, 540, p3(14, -12, -2));
      add('<div class="bub">Renault Mégane III<small>marge prévue + 1 410 €</small></div>', 0, 0, at(1560, 470, 'rotate(-2deg)'));
      men('Données de démonstration');
    },
    // 22 · « Tu débutes ? Starter. »
    () => {
      bg('var(--o)');
      add('<div class="seg"><span class="on">Je débute</span><span>J\'ai un parc</span></div>', 96, 110);
      G('Starter.', 90, 320, 250, '#fff'); G('14,99 € / mois', 100, 620, 90, 'var(--k)');
      crop('offre-starter', { W: 1050, x: 0, y: 0, w: 1050, h: 740 }, 600, 1520, 560, p3(8, -14, -2), 'background:#fff');
      cursor(250, 200, true); men('Exemples chiffrés, pas une promesse de gain', '#fff');
    },
    // 23 · « Une seule voiture bien achetée, tu paies trois ans. »
    () => {
      bg('var(--w)');
      G('<span style="color:var(--o)">1</span> voiture', 90, 120, 260); I('= <span style="font-size:1.25em">3</span> ans payés.', 100, 400, 230, 'var(--ink)');
      add('<div class="gauge"><div class="h"><span>+ 670 € de marge</span><b>= 44 mois</b></div><div class="bar"><i></i></div><div class="s">Exemple calculé : achetée 5 000 €, 630 € de frais, revendue 6 300 €</div></div>', 0, 0, at(1300, 790, p3(10, -10, -1)));
      men('Exemples chiffrés, pas une promesse de gain');
    },
    // 24 · « Tu gères un parc ? Pro. »
    () => {
      bg('var(--k)');
      add('<div class="seg"><span>Je débute</span><span class="on" style="background:var(--o);color:#1a1310">J\'ai un parc</span></div>', 96, 110);
      G('Pro.', 80, 250, 480, '#fff'); G('79 € / mois', 100, 720, 90, 'var(--o)');
      crop('offre-starter', { W: 1050, x: 0, y: 0, w: 1050, h: 740 }, 520, 1300, 470, p3(8, -14, -2) + ' translateZ(-200px)', 'background:#fff;opacity:.5');
      crop('offre-pro', { W: 1050, x: 0, y: 0, w: 1050, h: 740 }, 640, 1500, 600, p3(8, -14, -2), 'background:#fff');
      cursor(520, 200, true); men('Exemples chiffrés, pas une promesse de gain', '#fff');
    },
    // 25 · « Essaie trois jours, sans carte bancaire. »
    () => {
      bg('var(--w)');
      G('Essaie', 96, 130, 200); I('3 jours.', 96, 330, 260, 'var(--o)');
      add(`<img src="${UI}bouton-essai.png" style="width:820px;display:block">`, 0, 0, at(1360, 430, 'scale(.98)'));
      ripple(1420, 450, 260, 0.75); cursor(1430, 460);
      add('<div style="font:700 60px Satoshi;white-space:nowrap"><span style="display:inline-flex;width:76px;height:76px;border-radius:50%;background:var(--ok);color:#fff;align-items:center;justify-content:center;margin-right:20px">✓</span>Sans carte bancaire</div>', 1010, 700);
      add('<div style="font:700 60px Satoshi;white-space:nowrap"><span style="display:inline-flex;width:76px;height:76px;border-radius:50%;background:var(--ok);color:#fff;align-items:center;justify-content:center;margin-right:20px">✓</span>utopicar.fr</div>', 1010, 810);
      men('Exemples chiffrés, pas une promesse de gain');
    },
    // 26 · « Tu chiffres ta prochaine marge avant d'appeler. »
    () => {
      bg('var(--k)');
      G('Ta prochaine', 96, 250, 200, '#fff'); G('marge,', 96, 430, 200, '#fff'); I("avant d'appeler.", 96, 620, 210, 'var(--o)');
    },
    // 27 · « UTOPICAR. » carton final
    () => {
      bg('var(--o)');
      add(`<img src="${BR}utopicar-logo-horizontal-fond-sombre.svg" style="width:1000px;display:block">`, 0, 0, at(960, 430));
      add('<div class="pill" style="background:#fff;color:var(--ink);font-size:52px;padding:30px 56px"><b style="color:var(--o)">3 jours offerts</b> · utopicar.fr</div>', 0, 0, at(960, 690));
      ripple(1150, 700, 200, 0.6); cursor(1160, 712);
      men('Exemples chiffrés, pas une promesse de gain', '#fff');
    },
  ];
  frames[N]();
  await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
  window.nFrames = frames.length;
  window.ready = true;
})();
