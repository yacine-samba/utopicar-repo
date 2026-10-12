
  // ---------- plongée à travers une lettre : la caméra fonce dans le trait d'une lettre, son encre remplit l'écran ----------
  // dv : calque de contenu de la scène ; k : texte (KT), wi / ci : mot et lettre visés, fx / fy : point du trait dans la
  // lettre (fraction de sa boîte) ; t0 → t1 : la plongée (l'échelle monte en expo jusqu'à × 90)
  function dive(s, k, wi, ci, fx, fy, t0, t1) {
    const c = k.words[wi].chars[ci], r = c.getBoundingClientRect(), br = s.cam.getBoundingClientRect();
    const px = r.left - br.left + r.width * fx, py = r.top - br.top + r.height * fy;
    s.dv.style.transformOrigin = `${px.toFixed(1)}px ${py.toFixed(1)}px`;
    const disc = mk('div', 'a', s.dv, { left: px - 9 + 'px', top: py - 9 + 'px', width: '18px', height: '18px', borderRadius: '50%', background: 'var(--ink)' });
    cue(t0, 'whoosh', 0.9);
    return (t) => {
      // approche : la caméra avance déjà vers la lettre 1,4 s avant la plongée (× 1,04 : au-delà, les phrases larges entrent dans la zone des boutons TikTok), puis fonce (× 90)
      const p = clamp((t - t0) / (t1 - t0), 0, 1), sc = (tt) => (1 + 0.04 * eIO(clamp((tt - t0 + 1.4) / 1.4, 0, 1))) * Math.pow(90, Math.pow(clamp((tt - t0) / (t1 - t0), 0, 1), 2.4));
      // le disque d'encre grandit dans le calque : à × 90 il couvre l'écran, même si le point tombe au bord du trait
      disc.style.opacity = clamp((p - 0.42) * 4, 0, 1).toFixed(3);
      disc.style.transform = `scale(${(1 + 3.2 * Math.pow(p, 2)).toFixed(3)})`;
      // flou d'après la vitesse relative du zoom (écart des logarithmes d'une demi-image), plafonné à 10 px
      const v = Math.log(sc(t)) - Math.log(sc(t - 1 / 120));
      s.dv.style.transform = `scale(${sc(t).toFixed(4)})`;
      const b = Math.min(10, v * 120 * 0.45); mb(s.dv, b, b);
    };
  }
  // scène avec calque de contenu (pour la plongée)
  function sceneD(a, b, bg, tin, push) { const s = scene(a, b, bg, tin, push); s.dv = mk('div', 'a', s.cam, { width: W + 'px', height: H + 'px' }); return s; }
  // écran du prix : « jusqu'à », le prix qui roule, la ligne de la grille de coûts
  function priceScene(a, b, tP, from, to, label, extra) {
    const s = scene(a, b, 'var(--ink)', { type: 'cut' }, 0.04); s.imp.push([tP + 0.05, 14]);
    if (a < tP - 0.15) cue(a, 'thud', 0.6); cue(tP + 0.13, 'roll');   // le roulement juste après le choc ou l'impact, pour qu'il s'entende
    const k0 = KT(s.cam, 140, 600, 96, [["jusqu'à", { c: 'rgba(251,249,245,.7)' }]]);
    const R = ROLL(s.cam, 130, 720, 300, from, to, 'var(--o)');
    const k1 = brk(s.cam, 144, 1090, [['[', {}], ...label, [']', {}]], '#fbf9f5', 38);
    men(s, 'Fourchettes de la grille de coûts UTOPICAR', '#fbf9f5');
    s.paint = (t) => {
      ktP(k0, t, a - 0.02, 'rise');
      R.box.style.visibility = t >= tP - 0.12 ? '' : 'hidden'; rollP(R, t, tP - 0.1, 0.55, 0.06);
      pose(R.box, t, (tt) => ({ x: 0, y: 0, s: 1 + 0.06 * bump(tt, tP + 0.3, 0.2) }));
      ktP(k1, t, tP + 0.25, 'rise', null, 'up', { step: 0.05 });
      if (extra) extra(t);
    };
    return s;
  }
  // phrase du vendeur entre guillemets, en italique géant, sur fond crème
  const quote = (s, lines) => lines.map(([txt, y, size]) => KT(s.dv, 140, y, size, [[txt, { i: 1, c: 'var(--ink)' }]]));

  // =====================================================================================================
  // 1 · « Juste un voyant… rien de grave. Dans une annonce, cette phrase peut te coûter mille cinq cents euros. »
  // =====================================================================================================
  const tP1 = Wt('1500', 4);
  { const s = sceneD(-1, tP1, 'var(--w)', { type: 'cut' }, 0.05);
    const kb = brk(s.dv, 144, 250, [['[', {}], ['lu', {}], ['dans', {}], ['une', {}], ['annonce', { c: 'var(--o)' }], [']', {}]]);
    const hl = mk('div', 'a', s.dv, { left: '128px', top: '742px', width: '760px', height: '118px', borderRadius: '14px', background: 'rgba(255,90,31,.55)', transformOrigin: '0 50%' });
    const [q1, q2, q3] = quote(s, [['« Juste un', 330, 190], ['voyant,', 520, 190], ['rien de grave. »', 712, 150]]);
    const kc = brk(s.dv, 144, 1010, [['[', {}], ['cette', {}], ['phrase', {}], ['peut', {}], ['te', {}], ['coûter…', { c: 'var(--o)' }], [']', {}]]);
    const D = dive(s, q2, 0, 1, 0.24, 0.62, 4.22, tP1);
    cue(1.42, 'whoosh', 0.45); cue(tP1, 'impact', 0.8);
    s.paint = (t) => {
      ktP(kb, t, -0.6, 'rise', null, 'up', { step: 0.05 });
      ktP(q1, t, [-0.55, -0.45], 'rise', null, 'up', { acc: [Wt('juste'), Wt('un')] });
      ktP(q2, t, Wt('voyant') - 0.05, 'rise', null, 'up', { acc: [Wt('voyant')] });
      ktP(q3, t, [Wt('rien'), Wt('de'), Wt('grave')], 'rise');
      hl.style.transform = `rotate(-2deg) scaleX(${E(t, 1.42, 0.55).toFixed(3)})`;
      ktP(kc, t, [Wt('cette', 2), Wt('cette', 2), Wt('phrase', 2), Wt('peut', 2), Wt('te', 4), Wt('couter', 2), Wt('couter', 2)], 'rise');
      D(t);
    };
  }
  priceScene(tP1, Wt('allez', 6), tP1, '0 000 €', '1 500 €', [['voyant', {}], ['allumé,', {}], ['panne', {}], ['non', {}], ['diagnostiquée', { c: 'var(--o)' }]]);
  // le petit rire de Simon (6,26 s) s'écrit sous le prix
  { const s = SC[SC.length - 1], kh = KT(s.cam, 140, 1230, 120, [['hé hé…', { i: 1, c: 'rgba(251,249,245,.45)' }]]);
    const p0 = s.paint; s.paint = (t) => { p0(t); ktP(kh, t, 6.26, 'blur', null, 'up', { fx: (i, j, tt) => ({ y: Math.sin(tt * 18 + j) * 5 * (1 - E(tt, 6.3, 0.8)) }) }); }; }

  // =====================================================================================================
  // 2 · « Allez, je te traduis le vendeur. »
  // =====================================================================================================
  const tPetit = Wt('petit', 8);
  { const a = Wt('allez', 6), s = scene(a, tPetit, 'var(--o)', { type: 'slab', d: 0.4 });
    const k1 = KT(s.cam, 140, 280, 150, [['Allez,', { c: '#fff' }]]);
    const k2 = KT(s.cam, 140, 440, 130, [['je te traduis', { c: 'var(--ink)' }]]);
    const k3 = KT(s.cam, 140, 590, 210, [['le vendeur.', { i: 1, c: '#fff' }]]);
    const k4 = brk(s.cam, 144, 900, [['[', {}], ['le', {}], ['dictionnaire', { c: '#fff' }], ['du', {}], ['vendeur', { c: '#fff' }], [']', {}]], 'var(--ink)');
    cue(Wt('vendeur', 7) + 0.25, 'pop', 0.6);
    s.paint = (t) => {
      ktP(k1, t, a, 'slam'); ktP(k2, t, [Wt('je', 7), Wt('te', 7), Wt('traduis', 7)]);
      ktP(k3, t, [Wt('le', 7.5), Wt('vendeur', 7.5)], 'rise', null, 'up', { acc: [Wt('le', 7.5), Wt('vendeur', 7.5)] });
      ktP(k4, t, Wt('vendeur', 7) + 0.25, 'rise', null, 'up', { step: 0.05 });
    };
  }

  // =====================================================================================================
  // 3 · « "Petit bruit au démarrage"… hmm… jusqu'à six cents. »
  // =====================================================================================================
  const tP2 = Wt('jusqu', 11);
  { const s = sceneD(tPetit, tP2, 'var(--w)', { type: 'cut' }, 0.05); cue(tPetit, 'thud', 0.5);
    const [q1, q2] = quote(s, [['« Petit bruit', 300, 180], ['au démarrage. »', 490, 150]]);
    const kh = KT(s.dv, 140, 760, 130, [['hmm…', { i: 1, c: '#b5aa9c' }]]);
    const D = dive(s, q1, 2, 0, 0.18, 0.55, 10.72, tP2);   // le trait du « b » de « bruit »
    s.paint = (t) => {
      ktP(q1, t, [tPetit, Wt('bruit', 8.5)], 'rise'); ktP(q2, t, [Wt('au', 9), Wt('demarrage', 9)], 'rise');
      ktP(kh, t, 10.41, 'blur', null, 'up', { fx: (i, j, tt) => ({ y: Math.sin(tt * 7 + j * 1.3) * 8 }) });
      D(t);
    };
  }
  priceScene(tP2, Wt('embrayage', 12), Wt('600', 11), '000 €', '600 €', [['bruit', {}], ['signalé,', {}], ['origine', {}], ['inconnue', { c: 'var(--o)' }]]);

  // =====================================================================================================
  // 4 · « "Embrayage un peu haut" ? (soupir) Neuf cents. »
  // =====================================================================================================
  const tEmb = Wt('embrayage', 12), tP3 = Wt('900', 14);
  { const s = sceneD(tEmb, tP3, 'var(--w)', { type: 'cut' }, 0.05); cue(tEmb, 'thud', 0.5);
    const [q1, q2] = quote(s, [['« Embrayage', 300, 180], ['un peu haut. »', 490, 160]]);
    const D = dive(s, q1, 1, 2, 0.2, 0.5, 14.0, tP3);    // le trait du « b » d'« Embrayage »
    // le soupir (13,94 s) : les mots s'affaissent
    const sag = (i, j, tt) => ({ y: E(tt, 13.94 + j * 0.03, 0.5) * (10 + j * 4), r: E(tt, 13.94, 0.5) * (j % 2 ? 3 : -2) });
    s.paint = (t) => {
      ktP(q1, t, tEmb, 'rise', null, 'up', { fx: sag });
      ktP(q2, t, [Wt('un', 12.8), Wt('peu', 12.8), Wt('haut', 12.8)], 'rise', null, 'up', { fx: sag });
      D(t);
    };
  }
  priceScene(tP3, Wt('climat', 15), tP3, '000 €', '900 €', [['embrayage', {}], ['à', {}], ['changer', { c: 'var(--o)' }]]);

  // =====================================================================================================
  // 5 · « "Clim à recharger" ? Quatre cent cinquante, au pire. »
  // =====================================================================================================
  const tClim = Wt('climat', 15), tP4 = Wt('450', 16);
  { const s = sceneD(tClim, tP4, 'var(--w)', { type: 'cut' }, 0.05); cue(tClim, 'thud', 0.5);
    const [q1, q2] = quote(s, [['« Clim à', 300, 190], ['recharger. »', 490, 190]]);
    const D = dive(s, q2, 0, 1, 0.3, 0.62, 16.42, tP4);
    s.paint = (t) => { ktP(q1, t, [tClim, tClim + 0.11], 'rise'); ktP(q2, t, Wt('recharge', 15.6), 'rise'); D(t); };
  }
  { const tPire = Wt('pire', 17);
    let kp; const s = priceScene(tP4, Wt('tu', 18), tP4, '000 €', '450 €', [['clim', {}], ['à', {}], ['recharger', {}], ['ou', {}], ['réparer', { c: 'var(--o)' }]], (t) => ktP(kp, t, [Wt('au', 17.4), tPire], 'rise'));
    kp = KT(s.cam, 140, 1210, 170, [['au pire.', { i: 1, c: '#fbf9f5' }]]); cue(tPire, 'pop', 0.6); }

  // =====================================================================================================
  // 6 · « Tu additionnes… pfff… trois mille quatre cent cinquante euros. »
  // =====================================================================================================
  const tTu = Wt('tu', 18), tPf = 20.25, tP5 = 20.84;
  { const s = scene(tTu, tP5, 'var(--o)', { type: 'slab', d: 0.4 });
    const k1 = KT(s.cam, 140, 270, 150, [['Tu', { c: '#fff' }]]), k2 = KT(s.cam, 140, 420, 150, [['additionnes…', { c: '#fff' }]]);
    const kp = KT(s.cam, 140, 600, 220, [['Pfff…', { i: 1, c: 'var(--ink)' }]]);
    const TG = [['1 500 €', 'voyant'], ['600 €', 'petit bruit'], ['900 €', 'embrayage'], ['450 €', 'clim']];
    const tg = TG.map(([p, l]) => mk('div', 'tag a', s.cam, { fontSize: '76px' }, `${p}<small style="font-size:28px">${l}</small>`));
    const XY = [[330, 1010, -7], [740, 1050, 5], [330, 1250, 4], [740, 1290, -5]], tIn = [18.62, 18.89, 19.16, 19.43];
    tIn.forEach((ti) => cue(ti, 'pop', 0.7)); cue(T_STOP - 0.05, 'tapestop');
    s.paint = (t) => {
      ktP(k1, t, tTu, 'slam'); ktP(k2, t, Wt('additionnes', 18), 'rise');
      ktP(kp, t, tPf - 0.05, 'blur', null, 'up', { fx: (i, j, tt) => ({ y: E(tt, tPf + 0.15 + j * 0.05, 0.5) * (14 + j * 9), r: E(tt, tPf + 0.15, 0.5) * (j % 2 ? 5 : -4) }) });
      tg.forEach((e, i) => pose(e, t, (tt) => { if (tt < tIn[i] - 0.3) return null; const p = E(tt, tIn[i] - 0.25, 0.32), f = E(tt, tPf + 0.1 + i * 0.04, 0.5);
        return { x: XY[i][0], y: lerp(-300, XY[i][1], p) + f * 26, c: 1, r: XY[i][2] - 18 * (1 - p) + f * (i % 2 ? 4 : -4) }; }));
    };
  }
  { const s = priceScene(tP5, Wt('moi', 21.5), tP5, '0 000 €', '3 450 €', [['pour', {}], ['une', {}], ['seule', {}], ['annonce', { c: 'var(--o)' }]]);
    s.imp.push([tP5 + 0.04, 26]); cue(tP5, 'impact'); }

  // =====================================================================================================
  // 7 · « Moi, je colle l'annonce dans UTOPICAR… »
  // =====================================================================================================
  { const a = Wt('moi', 21.5), s = scene(a, T_BAM, 'var(--o)', { type: 'slab', d: 0.4 });   // orange : le mot du logo est blanc
    const k1 = KT(s.cam, 140, 270, 150, [['Moi, je colle', { c: '#fff' }]]), k2 = KT(s.cam, 140, 420, 200, [["l'annonce", { i: 1, c: 'var(--ink)' }]]);
    const field = mk('div', 'a', s.cam, { width: '800px', height: '150px', borderRadius: '999px', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 18px 0 36px', gap: '16px', boxShadow: '0 50px 100px -30px rgba(28,22,18,.45),0 0 0 1px rgba(28,22,18,.06)' },
      '<svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#1c1612" stroke-width="2.2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>');
    const txt = mk('div', '', field, { flex: '1', font: '500 36px Satoshi', color: '#1c1612', whiteSpace: 'nowrap', overflow: 'hidden' });
    const chars = [...'…/annonce/peugeot-208'].map((ch) => mk('span', '', txt, null, ch));
    const btn = mk('div', '', field, { height: '114px', width: '270px', borderRadius: '999px', background: 'var(--o)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 44px Clash', color: '#1a1310', flex: 'none' }, 'Analyser');
    const L = logo(s.cam, 540, 1200, 620);
    const tType = Wt('colle', 22) + 0.1, tUto = Wt('utopicar', 23), tCl = 24.1;
    cue(tType, 'type'); cue(tUto, 'whoosh', 0.6); cue(tCl, 'click');
    const cur = cursor(s.cam, [[a, 1200, 1900], [tCl - 0.02, 800, 905], [tCl + 0.6, 815, 925]], [tCl]);
    s.paint = (t) => {
      ktP(k1, t, [a, Wt('je', 22.4), Wt('colle', 22.4)], 'rise'); ktP(k2, t, Wt('annonce', 22.8), 'rise');
      pose(field, t, (tt) => { const p = E(tt, a + 0.1, 0.55); return { x: 540, y: lerp(1500, 860, p), c: 1, p: 1, rx: 12 * (1 - p) + 6, r: -2 }; });
      chars.forEach((c, i) => { c.style.opacity = t >= tType + i * 0.018 ? 1 : 0; });
      btn.style.transform = `scale(${(1 - 0.08 * bump(t, tCl - 0.03, 0.14)).toFixed(3)})`;
      L(t, tUto - 0.05); cur(t);
    };
  }

  // =====================================================================================================
  // 8 · « …et bam : chaque phrase a son prix. Avant d'appeler. »
  // =====================================================================================================
  { const a = T_BAM, s = scene(a, Wt('et', 27), 'var(--w)', { type: 'circle', x: 540, y: 900, d: 0.42 }, 0.03); s.imp.push([a + 0.03, 22]);
    cue(a, 'impact');
    const kb = KT(s.cam, 140, 230, 330, [['Bam.', { i: 1, c: 'var(--o)' }]]);
    const k1 = KT(s.cam, 140, 270, 130, 'Chaque phrase'), k2 = KT(s.cam, 140, 400, 130, 'a son prix,');
    const k3 = KT(s.cam, 140, 540, 170, [["avant d'appeler.", { i: 1, c: 'var(--o)' }]]);
    const card = crop(s.cam, 'fiche-208', { W: 1050, x: 0, y: 0, w: 1050, h: 1150 }, 560);
    const hl = mk('div', 'hl a', card, { left: '18px', top: '486px', width: '524px', height: '124px' });
    const TG = ['1 500 €', '600 €', '900 €', '450 €'].map((p) => mk('div', 'tag a', s.cam, { fontSize: '60px' }, p));
    const tIn = [Wt('chaque', 24.8), Wt('phrase', 24.8), Wt('son', 24.8), Wt('prix', 24.8)];
    tIn.forEach((ti, i) => cue(ti, 'pop', 0.7)); cue(Wt('avant', 26) - 0.05, 'ding', 0.7);
    men(s, 'Données de démonstration');
    s.paint = (t) => {
      ktP(kb, t, a, 'slam', Wt('chaque', 24.8) - 0.3, 'up');
      ktP(k1, t, [tIn[0], tIn[1]], 'rise'); ktP(k2, t, [Wt('a', 25.4), Wt('son', 25.4), Wt('prix', 25.4)], 'rise');
      ktP(k3, t, [Wt('avant', 26), Wt('appeler', 26)], 'rise', null, 'up', { acc: [Wt('avant', 26), Wt('appeler', 26)] });
      pose(card, t, (tt) => { const p = E(tt, a + 0.12, 0.6); return { x: 540, y: lerp(2300, 1095, p), c: 1, p: 1, rx: 8 + 14 * (1 - p), ry: -10, r: 2 }; });
      hl.style.opacity = E(t, tIn[0], 0.3).toFixed(3);
      TG.forEach((e, i) => pose(e, t, (tt) => { const t0 = tIn[i] - 0.35; if (tt < t0) return null; const p = E(tt, t0, 0.42, eIO);
        return { x: lerp([270, 770, 290, 760][i], 600, p), y: lerp([1370, 1330, 840, 880][i], 1110, p), c: 1, s: lerp(1, 0.25, p), o: 1 - E(tt, t0 + 0.32, 0.12), r: lerp([-10, 8, 6, -7][i], 0, p) }; }));
    };
  }

  // =====================================================================================================
  // 9 · « Et toi, t'as lu quoi ? (rire) Écris-le, je te le traduis. »
  // =====================================================================================================
  const tEt = Wt('et', 27), tEc = Wt('ecris', 29);
  { const s = scene(tEt, tEc, 'var(--ink)', { type: 'cut' }, 0.04); cue(tEt, 'thud', 0.5);
    const k1 = KT(s.cam, 140, 280, 160, [['Et toi,', { c: '#fff' }]]);
    const k2 = KT(s.cam, 140, 450, 210, [["t'as lu", { i: 1, c: 'var(--o)' }]]), k3 = KT(s.cam, 140, 650, 210, [['quoi ?', { i: 1, c: 'var(--o)' }]]);
    const kh = KT(s.cam, 640, 720, 110, [['ha !', { i: 1, c: 'rgba(251,249,245,.45)' }]]);
    const bub = mk('div', 'a', s.cam, { width: '760px', padding: '30px 36px', borderRadius: '40px', background: '#fff', display: 'flex', gap: '24px', alignItems: 'center', boxShadow: '0 40px 80px -24px rgba(0,0,0,.7)' },
      '<div style="flex:none;width:84px;height:84px;border-radius:50%;background:var(--o)"></div><div style="flex:1"><div style="height:22px;width:42%;border-radius:11px;background:rgba(28,22,18,.18)"></div><div style="display:flex;gap:12px;margin-top:20px"><i style="width:22px;height:22px;border-radius:50%;background:var(--ink)"></i><i style="width:22px;height:22px;border-radius:50%;background:var(--ink)"></i><i style="width:22px;height:22px;border-radius:50%;background:var(--ink)"></i></div></div>');
    const dots = [...bub.querySelectorAll('i')]; const tB = Wt('quoi', 28) + 0.2; cue(tB, 'sent', 0.6);
    s.paint = (t) => {
      ktP(k1, t, [tEt, Wt('toi', 27.4)], 'rise'); ktP(k2, t, [Wt('t', 27.8), Wt('lu', 27.8)], 'rise'); ktP(k3, t, [Wt('quoi', 28), Wt('quoi', 28) + 0.2], 'rise');
      ktP(kh, t, 28.66, 'blur', null, 'up', { fx: (i, j, tt) => ({ y: Math.sin(tt * 20 + j) * 6 }) });
      pose(bub, t, (tt) => { if (tt < tB - 0.05) return null; const p = E(tt, tB, 0.45); return { x: 540, y: lerp(1500, 1150, p), c: 1, o: p * 2, r: -2 * (1 - p) }; });
      dots.forEach((d, i) => { d.style.transform = `translateY(${(-8 * Math.max(0, Math.sin((t - tB) * 9 - i * 0.9))).toFixed(1)}px)`; });
    };
  }
  { const s = scene(tEc, DUR + 1, 'var(--o)', { type: 'circle', x: 540, y: 1150, d: 0.45 }, 0.02);
    const k1 = KT(s.cam, 140, 270, 170, [['Écris-le,', { c: '#fff' }]]);
    const k2 = KT(s.cam, 140, 440, 200, [['je te le', { i: 1, c: 'var(--ink)' }]]), k3 = KT(s.cam, 140, 630, 200, [['traduis.', { i: 1, c: 'var(--ink)' }]]);
    const L = logo(s.cam, 540, 1060, 700);
    const pill = mk('div', 'pill a', s.cam, { background: '#fff', color: 'var(--ink)', fontSize: '42px', padding: '26px 44px' }, 'Écris ta phrase <b style="color:var(--o)">en commentaire</b>');
    const tL = T_HIT, tPill = tL + 0.7, tCl = tL + 1.5;
    cue(tL, 'pop', 0.8); cue(tL + 0.2, 'whoosh', 0.6); cue(tPill, 'pop', 0.6); cue(tCl, 'click');
    const cur = cursor(s.cam, [[tPill, 1200, 1900], [tCl - 0.02, 760, 1290], [tCl + 1, 800, 1330]], [tCl]);
    s.paint = (t) => {
      ktP(k1, t, [tEc, Wt('le', 29.5)], 'rise'); ktP(k2, t, [Wt('je', 30), Wt('te', 30), Wt('le', 30.2)], 'rise'); ktP(k3, t, Wt('traduis', 30.3), 'rise');
      L(t, tL);
      pose(pill, t, (tt) => { if (tt < tPill - 0.05) return null; const p = E(tt, tPill, 0.45); return { x: 540, y: 1290 + 70 * (1 - p), c: 1, o: p * 2, s: (1 + 0.025 * pulse(tt)) * (1 - 0.05 * bump(tt, tCl - 0.03, 0.14)) }; });
      cur(t);
    };
  }

  // ---------- seek ----------
  window.seek = (t) => { for (const s of SC) paintScene(s, t); };
  window.filmDur = DUR;
  window.cues = CUES.sort((x, y) => x.t - y.t);
  window.seek(0);
  window.filmReady = true;
})();
