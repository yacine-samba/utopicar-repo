
  // ---------- outils d'écriture des scénarios : chaque scène tient une liste de peintres ----------
  const S = (a, b, bg, tin, push) => { const s = scene(a, b, bg, tin, push); s.P = []; s.paint = (t) => s.P.forEach((f) => f(t)); return s; };
  const KA = (s, x, y, size, txt, c, it, ins, mode = 'rise', o2) => { const k = L1(s.cam, x, y, size, txt, c, it); ins = Array.isArray(ins) ? ins.map((v) => early(s, v)) : early(s, ins); s.P.push((t) => ktP(k, t, ins, mode, null, 'up', o2)); return k; };
  const BA = (s, x, y, txt, hot, ins, color = 'var(--ink)', size = 40, hc) => { const k = brk(s.cam, x, y, B(txt, hot, hc), color, size); ins = early(s, ins); s.P.push((t) => ktP(k, t, ins, 'rise', null, 'up', { step: 0.05 })); return k; };
  const cred = (s, txt, color = 'var(--ink)') => mk('div', 'men a', s.el, { left: '140px', top: '1418px', width: '780px', whiteSpace: 'normal', lineHeight: '1.3', color, fontSize: '19px' }, txt);   // tient dans la colonne sûre, sur deux lignes si besoin
  const hero = (s, img, w, hgt, x, y, t0, pos = '50% 45%') => { t0 = early(s, t0); const e = mk('div', 'card a', s.cam, { width: w + 'px', height: hgt + 'px', background: `url(${img}) ${pos}/cover` }); s.P.push((t) => pose(e, t, (tt) => { const p = E(tt, t0, 0.7); return { x: lerp(1600, x, p), y, c: 1, p: 1, rx: 6, ry: -14 - 30 * (1 - p), r: -2 }; })); return e; };
  const carIn = (s, src, w, x, y, t0, from = 1700) => { t0 = early(s, t0); const e = car(s.cam, src, w); s.P.push((t) => pose(e, t, (tt) => { const p = E(tt, t0, 0.65), f = Math.max(0, tt - t0 - 0.65); return { x: lerp(from, x, p) + 6 * Math.sin(f * 0.9), y: y + 5 * Math.sin(f * 1.4), c: 1, r: 0.35 * Math.sin(f * 1.1) }; })); return e; };   // la voiture flotte une fois arrivée
  const DEMO = '../assets/demo/', CAR = '../carousels-semaine/img/';
  const CREDIT = {
    clio: 'Photo Wikimedia Commons : OSX, domaine public', bmw: 'Photo Wikimedia Commons : Tokumeigakarinoaoshima, CC0',
    golf: 'Photo Wikimedia Commons : Thomas doerfer, CC BY 3.0, détourée', fiesta: 'Photo Wikimedia Commons : M 93, CC BY-SA 3.0 DE, détourée',
    p208: 'Photo Wikimedia Commons : OSX, domaine public',
  };
  // slide « moteur à fuir » (A01) : un écran par moteur, passés comme un carrousel
  function engineSlide(a, b, tin, n, kicker, brand, model, img, imgKey, pills, tCar) {
    const s = S(a, b, 'var(--w)', tin, 0.025);
    BA(s, 144, 250, kicker, [], a + 0.05, 'var(--ink)', 34);
    const k1 = KA(s, 140, 320, 170, brand, 'var(--ink)', false, a + 0.08);
    KA(s, 140, 490, 190, model, 'var(--o)', true, a + 0.2);
    const N = mk('div', 'a', s.cam, { font: '700 300px/1 Clash', color: 'rgba(28,22,18,.06)', left: '600px', top: '230px', letterSpacing: '-.05em' }, 'N°' + n);
    carIn(s, CAR + img, 760, 540, 1010, tCar ?? a + 0.1);
    const ps = pills.map(([txt, tone], i) => mk('div', 'pill a', s.cam, { background: tone === 'bad' ? 'var(--r)' : '#b26a00', color: '#fff', fontSize: '42px' }, txt));
    ps.forEach((e, i) => s.P.push((t) => pose(e, t, (tt) => { const t0 = (tCar ?? a) + 0.35 + i * 0.25; if (tt < t0 - 0.02) return null; const p = E(tt, t0, 0.3); return { x: 540, y: 1270 + i * 100, c: 1, s: 1 + 0.5 * (1 - p), o: p * 3, r: -2 + i * 3 }; })));
    pills.forEach((_, i) => cue((tCar ?? a) + 0.35 + i * 0.25, 'thud', 0.6));
    // points du carrousel
    const dots = mk('div', 'a', s.cam, { left: '540px', top: '1405px', display: 'flex', gap: '14px', transform: 'translateX(-50%)' }, [1, 2, 3, 4, 5].map((i) => `<i style="width:${6 - i === n ? 34 : 14}px;height:14px;border-radius:7px;background:${6 - i === n ? 'var(--o)' : 'rgba(28,22,18,.18)'}"></i>`).join(''));
    cred(s, CREDIT[imgKey] + ' · Coûts : ordres de grandeur, presse auto et propriétaires');
    s.P.push((t) => { N.style.transform = `translateX(${(-30 * E(t, a, 2.5)).toFixed(1)}px)`; });
    return { s, k1 };
  }

  const SPECS = {};
  // =====================================================================================================
  // LE DICTIONNAIRE DU VENDEUR (version courte, 20 s)
  // =====================================================================================================
  SPECS.dico2 = () => {
    const tP1 = T('1500', 3), tP2 = T('600', 6), tP3 = T('900', 8.5), tP5 = T('3000', 11);
    function entry(a, b, tin, head, tP, from, to, label, hot) {
      const s = S(a, b, 'var(--ink)', tin, 0.04); s.imp.push([tP + 0.05, 12]);
      KA(s, 140, 330, 72, head, '#fbf9f5', true, a - s.pre - 0.02);
      BA(s, 144, 440, 'expression de vendeur', [], a - s.pre + 0.05, 'rgba(251,249,245,.5)', 30);
      const PB = priceBlock(s, 560, "jusqu'à", tP, from, to, B(label, hot)); s.P.push(PB);
      men(s, 'Fourchettes de la grille de coûts UTOPICAR', '#fbf9f5');
      return s;
    }
    // « Juste un voyant… rien de grave. » Traduction :
    const s1 = S(-1, 3.3, 'var(--w)', { type: 'cut' }, 0.05);
    BA(s1, 144, 250, 'lu dans une annonce', ['annonce'], -0.6);
    const hl = mk('div', 'a', s1.cam, { left: '128px', top: '742px', width: '760px', height: '118px', borderRadius: '14px', background: 'rgba(255,90,31,.55)', transformOrigin: '0 50%' });
    KA(s1, 140, 330, 190, '« Juste un', 'var(--ink)', true, [-0.55, -0.45, -0.4]);
    const q2 = KA(s1, 140, 520, 190, 'voyant,', 'var(--ink)', true, T('voyant') - 0.05, 'rise', { acc: [T('voyant')] });
    KA(s1, 140, 712, 150, 'rien de grave. »', 'var(--ink)', true, [T('rien'), T('de', 1), T('grave')]);
    KA(s1, 140, 1010, 120, 'Traduction :', 'var(--o)', false, T('traduction', 2), 'slam');
    s1.P.push((t) => { hl.style.transform = `rotate(-2deg) scaleX(${E(t, 1.4, 0.55).toFixed(3)})`; });
    cue(1.4, 'whoosh', 0.45); cue(T('traduction', 2), 'thud', 0.6);
    // portail par le « o » de « voyant » → l'entrée du dictionnaire
    entry(3.3, T('petit', 4), { type: 'portal', ...at(q2, 0, 1, 0.3, 0.6) }, '« voyant allumé, rien de grave »', tP1, '0 000 €', '1 500 €', 'panne non diagnostiquée', ['diagnostiquée']);
    // « Petit bruit au démarrage ? » hmm…
    const a3 = T('petit', 4), s3 = S(a3, tP2 - 0.12, 'var(--w)', { type: 'pull', x: 230, y: 390 }, 0.05);
    const q3 = KA(s3, 140, 300, 180, '« Petit bruit', 'var(--ink)', true, [a3, a3, T('bruit', 4.5)]);
    KA(s3, 140, 490, 150, 'au démarrage ? »', 'var(--ink)', true, [T('au', 4.8), T('demarrage', 4.8)]);
    KA(s3, 140, 760, 130, 'hmm…', '#b5aa9c', true, 5.7, 'blur', { fx: (i, j, tt) => ({ y: Math.sin(tt * 7 + j * 1.3) * 8 }) });
    entry(tP2 - 0.12, T('embrayage', 7), { type: 'portal', ...at(q3, 2, 0, 0.2, 0.55) }, '« petit bruit au démarrage »', tP2, '000 €', '600 €', 'bruit signalé, origine inconnue', ['inconnue']);
    // « Embrayage un peu haut ? » (soupir)
    const a5 = T('embrayage', 7), s5 = S(a5, tP3 - 0.12, 'var(--w)', { type: 'pull', x: 260, y: 390 }, 0.05);
    const sag = (i, j, tt) => ({ y: E(tt, 8.45 + j * 0.03, 0.5) * (10 + j * 4), r: E(tt, 8.45, 0.5) * (j % 2 ? 3 : -2) });
    const q5 = KA(s5, 140, 300, 180, '« Embrayage', 'var(--ink)', true, a5, 'rise', { fx: sag });
    KA(s5, 140, 490, 160, 'un peu haut ? »', 'var(--ink)', true, [T('un', 7.6), T('peu', 7.6), T('haut', 7.6)], 'rise', { fx: sag });
    entry(tP3 - 0.12, T('tu', 9.8), { type: 'portal', ...at(q5, 1, 2, 0.2, 0.5) }, '« embrayage un peu haut »', tP3, '000 €', '900 €', 'embrayage à changer', ['changer']);
    // « Tu additionnes… pfff… »
    const a7 = T('tu', 9.8), s7 = S(a7, tP5 - 0.06, 'var(--o)', { type: 'slab' });
    KA(s7, 140, 270, 150, 'Tu', '#fff', false, a7, 'slam'); KA(s7, 140, 420, 150, 'additionnes…', '#fff', false, T('additionnes', 10));
    KA(s7, 140, 600, 220, 'Pfff…', 'var(--ink)', true, 11.0, 'blur', { fx: (i, j, tt) => ({ y: E(tt, 11.15 + j * 0.05, 0.5) * (14 + j * 9), r: E(tt, 11.15, 0.5) * (j % 2 ? 5 : -4) }) });
    [['1 500 €', 'voyant', 330, 1010, -7, 10.35], ['600 €', 'petit bruit', 740, 1060, 5, 10.55], ['900 €', 'embrayage', 520, 1260, 3, 10.75]].forEach(([p, l, x, y, r, t0]) => {
      const e = tag(s7.cam, p, l, 76); cue(t0, 'pop', 0.7); s7.P.push((t) => drop(e, t, t0, x, y + E(t, 11.15, 0.5) * 24, r)); });
    cue(10.92, 'tapestop');
    // « …trois mille euros. »
    const s8 = S(tP5 - 0.06, T('je', 12.3), 'var(--ink)', { type: 'cut' }, 0.04); s8.imp.push([tP5 + 0.04, 26]); cue(tP5, 'impact');
    s8.P.push(priceBlock(s8, 600, "jusqu'à", tP5, '0 000 €', '3 000 €', B('pour une seule annonce', ['annonce'])));
    men(s8, 'Fourchettes de la grille de coûts UTOPICAR', '#fbf9f5');
    // « Je colle l'annonce dans UTOPICAR… »
    const a9 = T('je', 12.3), tCl = 14.18, s9 = S(a9, T('bam', 14) - 0.02, 'var(--o)', { type: 'slab' });
    KA(s9, 140, 270, 150, 'Je colle', '#fff', false, [a9, T('colle', 12.5)]); KA(s9, 140, 420, 200, "l'annonce", 'var(--ink)', true, T('annonce', 12.9));
    const field = mk('div', 'a', s9.cam, { width: '800px', height: '150px', borderRadius: '999px', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 18px 0 36px', gap: '16px', boxShadow: '0 50px 100px -30px rgba(28,22,18,.45)' },
      '<svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#1c1612" stroke-width="2.2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>');
    const txt = mk('div', '', field, { flex: '1', font: '500 36px Satoshi', color: '#1c1612', whiteSpace: 'nowrap', overflow: 'hidden' });
    const chars = [...'…/annonce/peugeot-208'].map((ch) => mk('span', '', txt, null, ch));
    const btn = mk('div', '', field, { height: '114px', width: '270px', borderRadius: '999px', background: 'var(--o)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 44px Clash', color: '#1a1310', flex: 'none' }, 'Analyser');
    const L9 = logo(s9.cam, 540, 1200, 620), cur9 = cursor(s9.cam, [[a9, 1200, 1900], [tCl - 0.02, 800, 905], [tCl + 0.6, 815, 925]], [tCl]);
    cue(T('colle', 12.5) + 0.1, 'type'); cue(T('utopicar', 13), 'whoosh', 0.6); cue(tCl, 'click');
    s9.P.push((t) => { pose(field, t, (tt) => { const p = E(tt, a9 + 0.1, 0.55); return { x: 540, y: lerp(1500, 860, p), c: 1, p: 1, rx: 12 * (1 - p) + 6, r: -2 }; });
      chars.forEach((c, i) => { c.style.opacity = t >= T('colle', 12.5) + 0.1 + i * 0.018 ? 1 : 0; });
      btn.style.transform = `scale(${(1 - 0.08 * bump(t, tCl - 0.03, 0.14)).toFixed(3)})`; L9(t, T('utopicar', 13) - 0.05); cur9(t); });
    // « …et bam : les travaux, chiffrés avant d'appeler. »
    const aB = T('bam', 14) - 0.02, s10 = S(aB, T('t', 16.6), 'var(--w)', { type: 'circle', x: 800, y: 905 }, 0.03); s10.imp.push([aB + 0.03, 22]); cue(aB, 'impact');
    s10.P.push(((k) => (t) => ktP(k, t, aB, 'slam', T('les', 14.7) - 0.25, 'up'))(L1(s10.cam, 140, 230, 330, 'Bam.', 'var(--o)', true)));
    KA(s10, 140, 270, 130, 'Les travaux,', 'var(--ink)', false, [T('les', 14.7), T('travaux', 14.7)]);
    KA(s10, 140, 400, 130, 'chiffrés', 'var(--ink)', false, T('chiffres', 15));
    KA(s10, 140, 540, 170, "avant d'appeler.", 'var(--o)', true, [T('avant', 15.8), T('appeler', 15.8)], 'rise', { acc: [T('avant', 15.8), T('appeler', 15.8)] });
    const card = crop(s10.cam, 'fiche-208', { W: 1050, x: 0, y: 0, w: 1050, h: 1150 }, 560);
    const hlc = mk('div', 'hl a', card, { left: '18px', top: '486px', width: '524px', height: '124px' });
    const TG = ['1 500 €', '600 €', '900 €'].map((p) => tag(s10.cam, p, null, 60)), tIn = [T('les', 14.7), T('travaux', 14.7), T('chiffres', 15)];
    tIn.forEach((ti) => cue(ti, 'pop', 0.7)); cue(T('avant', 15.8) - 0.05, 'ding', 0.7);
    men(s10, 'Données de démonstration');
    s10.P.push((t) => { pose(card, t, (tt) => { const p = E(tt, aB + 0.12, 0.6); return { x: 540, y: lerp(2300, 1095, p), c: 1, p: 1, rx: 8 + 14 * (1 - p), ry: -10, r: 2 }; });
      hlc.style.opacity = E(t, tIn[0], 0.3).toFixed(3);
      TG.forEach((e, i) => pose(e, t, (tt) => { const t0 = tIn[i] - 0.35; if (tt < t0) return null; const p = E(tt, t0, 0.42, eIO);
        return { x: lerp([270, 770, 290][i], 600, p), y: lerp([1370, 1330, 840][i], 1110, p), c: 1, s: lerp(1, 0.25, p), o: 1 - E(tt, t0 + 0.32, 0.12), r: lerp([-10, 8, 6][i], 0, p) }; })); });
    // « T'as lu quoi, toi ? » (rire)
    const aT = T('t', 16.6), s11 = S(aT, T('ecris', 18), 'var(--ink)', { type: 'cut' }, 0.04); cue(aT, 'thud', 0.5);
    KA(s11, 140, 300, 210, "T'as lu", 'var(--o)', true, [aT, T('lu', 16.9)]); KA(s11, 140, 500, 210, 'quoi, toi ?', 'var(--o)', true, [T('quoi', 17), T('toi', 17.2)]);
    KA(s11, 640, 780, 110, 'ha !', 'rgba(251,249,245,.45)', true, 17.75, 'blur', { fx: (i, j, tt) => ({ y: Math.sin(tt * 20 + j) * 6 }) });
    const bub = mk('div', 'a', s11.cam, { width: '760px', padding: '30px 36px', borderRadius: '40px', background: '#fff', display: 'flex', gap: '24px', alignItems: 'center', boxShadow: '0 40px 80px -24px rgba(0,0,0,.7)' },
      '<div style="flex:none;width:84px;height:84px;border-radius:50%;background:var(--o)"></div><div style="flex:1"><div style="height:22px;width:42%;border-radius:11px;background:rgba(28,22,18,.18)"></div><div style="display:flex;gap:12px;margin-top:20px"><i style="width:22px;height:22px;border-radius:50%;background:var(--ink)"></i><i style="width:22px;height:22px;border-radius:50%;background:var(--ink)"></i><i style="width:22px;height:22px;border-radius:50%;background:var(--ink)"></i></div></div>');
    const dots = [...bub.querySelectorAll('i')], tB = T('toi', 17.2) + 0.15; cue(tB, 'sent', 0.6);
    s11.P.push((t) => { pose(bub, t, (tt) => { if (tt < tB - 0.05) return null; const p = E(tt, tB, 0.45); return { x: 540, y: lerp(1500, 1150, p), c: 1, o: p * 2, r: -2 * (1 - p) }; });
      dots.forEach((d, i) => { d.style.transform = `translateY(${(-8 * Math.max(0, Math.sin((t - tB) * 9 - i * 0.9))).toFixed(1)}px)`; }); });
    endCard(T('ecris', 18), 'var(--o)', [['Écris-le.', 300, 230, '#fff', false, T('ecris', 18)]], 'Écris ta phrase <b style="color:var(--o)">en commentaire</b>', T('ecris', 18) + 0.1, { type: 'circle', x: 540, y: 1150 });
  };

  // =====================================================================================================
  // A01 · 5 moteurs à fuir
  // =====================================================================================================
  SPECS.A01 = () => {
    const s1 = S(-1, 2.9, 'var(--w)', { type: 'cut' }, 0.04);
    KA(s1, 140, 270, 170, 'Clio à', 'var(--ink)', false, [-0.6, -0.5]);
    const R = ROLL(s1.cam, 130, 450, 240, '0 000 €', '5 900 €', 'var(--o)'); cue(T('5'), 'pop', 0.6);
    carIn(s1, CAR + 'car-clio.webp', 760, 540, 1110, -0.7);
    cred(s1, CREDIT.clio);
    s1.P.push((t) => { rollP(R, t, -0.75, 0.55, 0.06); pose(R.box, t, (tt) => ({ x: 0, y: 0, s: 1 + 0.07 * bump(tt, T('5'), 0.2) })); });
    const s2 = S(2.9, T('5', 4.5) - 0.05, 'var(--ink)', { type: 'portal', ...atEl(R.cols[1].col, 0.5, 0.5) }, 0.04); s2.imp.push([T('10', 3) + 0.05, 20]); cue(T('10', 3), 'impact', 0.8);
    s2.P.push(priceBlock(s2, 520, "jusqu'à", T('10', 3), '00 000 €', '10 000 €', B('de moteur', ['moteur'])));
    const a3 = T('5', 4.5) - 0.05, s3 = S(a3, 6.32, 'var(--o)', { type: 'slab' });
    KA(s3, 140, 300, 200, '5 moteurs', '#fff', false, [T('5', 4.5), T('moteurs', 4.5)], 'slam'); KA(s3, 140, 500, 260, 'à fuir.', 'var(--ink)', true, [T('a', 5.2), T('fuir', 5.2)]);
    engineSlide(6.32, 8.1, { type: 'swipe' }, 5, 'N° 5 · 1.6 N13 · 2011 à 2015', 'BMW', '116i', 'car-bmw.webp', 'bmw', [['Jusqu’à 5 000 €', 'bad']], T('bmw', 6));
    engineSlide(8.1, 10.55, { type: 'swipe' }, 4, 'N° 4 · 1.4 TSI 122 et 160 ch · 2008 à 2012', 'Golf', '6', 'car-golf.webp', 'golf', [['Jusqu’à 7 000 €', 'bad']], T('golf', 8));
    engineSlide(10.55, 12.0, { type: 'swipe' }, 3, 'N° 3 · 1.0 EcoBoost · 2011 à 2018', 'Fiesta et', 'Focus', 'car-fiesta.webp', 'fiesta', [['Jusqu’à 7 000 €', 'bad']], T('fiesta', 10.5));
    engineSlide(12.0, 14.45, { type: 'swipe' }, 2, 'N° 2 · 1.2 TCe 115 et 120 · fin 2012 à mi-2016', 'Clio', '4', 'car-clio.webp', 'clio', [['Jusqu’à 10 000 €', 'bad']], T('clio', 12));
    const s8 = S(14.45, 16.3, 'var(--ink)', { type: 'cut' }, 0.05); cue(14.45, 'thud', 0.6);
    KA(s8, 140, 330, 170, 'Et numéro', '#fff', false, [T('et', 14.4), T('numero', 14.4)]);
    const k1 = KA(s8, 140, 520, 420, '1…', 'var(--o)', false, T('1', 15), 'slam');
    const { s: s9 } = engineSlide(16.3, 17.95, { type: 'portal', ...at(k1, 0, 0, 0.5, 0.5) }, 1, 'N° 1 · 1.2 PureTech · 2013 à mi-2022', 'Peugeot', '208', 'car-p208.webp', 'p208', [['Courroie : 400 à 600 €', 'warn'], ['Sinon : le moteur', 'bad']], T('208', 16));
    s9.imp.push([T('208', 16) + 0.05, 18]); cue(T('208', 16), 'impact', 0.8);
    endCard(17.95, 'var(--o)', [['Enregistre', 300, 190, '#fff', false, T('enregistre', 17.5)], ['la liste.', 480, 230, 'var(--ink)', true, T('liste', 18)]], '<b style="color:var(--o)">5 moteurs</b> à vérifier avant d’acheter', T('enregistre', 17.5));
  };

  // =====================================================================================================
  // A02 · Golf achetée 9 500 €, revendue 9 800 €, et 1 200 € de perte
  // =====================================================================================================
  SPECS.A02 = () => {
    const s1 = S(-1, 4.1, 'var(--w)', { type: 'cut' }, 0.04);
    KA(s1, 140, 260, 190, 'Golf', 'var(--ink)', false, -0.6);
    carIn(s1, CAR + 'car-golf.webp', 760, 540, 1170, -0.7); cred(s1, CREDIT.golf);
    const t1 = tag(s1.cam, '9 500 €', 'achetée', 80), t2 = tag(s1.cam, '9 800 €', 'revendue', 80);
    cue(T('9') , 'pop', 0.7); cue(T('9', 2.4), 'pop', 0.7);
    s1.P.push((t) => { drop(t1, t, T('9'), 330, 690, -6); drop(t2, t, T('9', 2.4), 740, 780, 5); });
    const s2 = S(4.1, 5.85, 'var(--ink)', { type: 'portal', x: 740, y: 780 }, 0.04); s2.imp.push([T('1', 4.6) + 0.05, 22]); cue(T('1', 4.6), 'impact');
    KA(s2, 140, 400, 140, 'Et tu perds', '#fff', false, [T('et', 4), T('tu', 4), T('perds', 4)]);
    const R2 = ROLL(s2.cam, 130, 580, 300, '0 000 €', '1 200 €', '#ff5a4a'); cue(T('1', 4.6) + 0.12, 'roll', 0.8);
    s2.P.push((t) => { R2.box.style.visibility = t >= T('1', 4.6) - 0.12 ? '' : 'hidden'; rollP(R2, t, T('1', 4.6) - 0.1, 0.55, 0.06); });
    const s3 = S(5.85, 7.6, 'var(--w)', { type: 'swipe' }, 0.03);
    KA(s3, 140, 260, 130, 'Sur le papier,', 'var(--ink)', false, [T('sur', 5.8), T('le', 5.9), T('papier', 5.9)]);
    const tk3 = ticket(s3.cam, 780, [['Revente', '9 800 €', 6.2], ['Achat', '− 9 500 €', 6.45]], { lab: 'Écart', v: 300, sign: '+ ', t: T('300', 6.8), tone: 'g' });
    s3.P.push((t) => { rise(tk3, t, 5.9, 540, 860); tk3.paint(t); });
    const s4 = S(7.6, 13.75, 'var(--w)', { type: 'swipe' }, 0.03); s4.imp.push([T('1', 12.8) + 0.05, 18]); cue(T('1', 12.8), 'impact', 0.8);
    KA(s4, 140, 260, 130, 'Puis les frais.', 'var(--ink)', false, [T('puis', 7.7), T('les', 7.8), T('frais', 7.8)]);
    const tk4 = ticket(s4.cam, 780, [['Remise en état', '1 100 €', T('remise', 8.8)], ['Carte grise, 5 CV', '186 €', T('carte', 9.9)], ['Trajet, 128 km', '64 €', T('trajet', 10.9)], ['CT, nettoyage, annonce', '150 €', 11.6]], { lab: 'Frais', v: 1500, t: T('1', 12.8), tone: 'r' });
    s4.P.push((t) => { rise(tk4, t, 7.7, 540, 900); tk4.paint(t); });
    const s5 = S(13.75, 16.25, 'var(--ink)', { type: 'portal', ...atPose(tk4, 540, 900, 0.8, 0.9) }, 0.04);
    KA(s5, 140, 380, 130, 'Ton prix max', '#fff', false, [T('ton', 13.8), T('prix', 13.8), T('max', 13.8)]);
    const R5 = ROLL(s5.cam, 130, 540, 300, '0 000 €', '7 500 €', 'var(--o)'); cue(T('7', 14.9) + 0.12, 'roll', 0.8);
    BA(s5, 144, 900, "calculé avant d'appeler", ['avant'], 15.5, '#fbf9f5');
    s5.P.push((t) => { R5.box.style.visibility = t >= T('7', 14.9) - 0.12 ? '' : 'hidden'; rollP(R5, t, T('7', 14.9) - 0.1, 0.55, 0.06); });
    endCard(16.25, 'var(--o)', [['Commente', 300, 170, '#fff', false, T('commente', 16)], ['DÉBUTANT', 470, 200, 'var(--ink)', false, T('debut', 16.5)]], 'Le guide <b style="color:var(--o)">Ta 1re revente</b>', T('commente', 16));
  };

  // =====================================================================================================
  // A03 · l'arnaque au faux paiement sécurisé
  // =====================================================================================================
  SPECS.A03 = () => {
    const s1 = S(-1, 5.0, 'var(--ink)', { type: 'cut' }, 0.04);
    KA(s1, 140, 260, 150, 'Tu vends', '#fff', false, [-0.6, -0.5]); KA(s1, 140, 410, 200, 'ta 207', 'var(--o)', true, [T('ta'), T('207')]);
    const tg = tag(s1.cam, '3 900 €', null, 90); cue(T('3900'), 'pop', 0.7);
    const b1 = bubble(s1.cam, 900, 'Bonjour, je la prends sans visite. Je paie par le paiement sécurisé.', false, T('un', 2.6), 'Un acheteur · 21:14');
    const st = stamp(s1.cam, 'SANS LA VOIR', 'var(--o)', 96); cue(T('sans', 3.5), 'thud', 0.8);
    s1.P.push((t) => { drop(tg, t, T('3900'), 720, 700, 6); b1(t); slamAt(st, t, T('sans', 3.5), 540, 1330, -6); });
    const s2 = S(5.0, 8.75, 'var(--w)', { type: 'swipe' }, 0.03);
    KA(s2, 140, 260, 150, 'Puis un SMS.', 'var(--ink)', false, [T('puis', 5), T('un', 5.2), T('sms', 5.5)]);
    const nt = mk('div', 'notif2 a', s2.cam, null, '<div class="h"><i class="ic"></i>SMS · 21:31</div>Paiement de 3 900 € reçu. Validez vos coordonnées bancaires pour le recevoir : <u>ouvrir le lien</u>');
    cue(T('sms', 5.5), 'ding', 0.7);
    const cur2 = cursor(s2.cam, [[5.0, 1200, 1900], [8.3, 640, 1010], [8.8, 650, 1020]], [8.45]);
    s2.P.push((t) => { pose(nt, t, (tt) => { const p = E(tt, T('sms', 5.5), 0.5); return { x: 540, y: lerp(-400, 860, p), c: 1, r: -1.5 * (1 - p) }; }); cur2(t); });
    const u = nt.querySelector('u');
    const s3 = S(8.75, 10.58, 'var(--r)', { type: 'portal', x: 640, y: 1010 }, 0.04);
    KA(s3, 140, 260, 140, 'Le lien veut', '#fff', false, [T('le', 8.8), T('lien', 8.8), T('veut', 8.8)]); KA(s3, 140, 420, 230, 'ta carte.', '#fff', true, [T('ta', 9.4), T('carte', 9.4)]);
    const rows = [['Numéro de carte', 'demandé'], ['Date et cryptogramme', 'demandés'], ['Test de 0,01 €', '« pour valider »']].map(([l, v], i) => line(s3.cam, 140, 800 + i * 110, `${l} · <span style="color:#ffd0c8">${v}</span>`, 44, '#fff'));
    s3.P.push((t) => rows.forEach((r, i) => slideIn(r, t, 9.0 + i * 0.3)));
    const s4 = S(10.58, 14.1, 'var(--ink)', { type: 'cut' }, 0.05); cue(10.58, 'thud', 0.5);
    KA(s4, 140, 300, 90, "Pour recevoir de l'argent,", 'rgba(251,249,245,.75)', false, [T('pour', 10.5), T('recevoir', 10.5), T('de', 11), T('argent', 11)]);
    KA(s4, 140, 470, 160, 'personne', 'var(--o)', true, T('personne', 12)); KA(s4, 140, 640, 160, "n'a besoin", 'var(--o)', true, [T('n', 12.4), T('besoin', 12.4)]);
    KA(s4, 140, 810, 160, 'de ta carte.', '#fff', true, [T('de', 12.9), T('ta', 13), T('carte', 13)]);
    endCard(14.1, 'var(--o)', [['Envoie ça', 260, 170, '#fff', false, T('envoie', 14)], ['à ton pote', 420, 170, '#fff', false, T('ton', 14.6)], ['qui vend sa voiture.', 610, 110, 'var(--ink)', true, T('vend', 15)]], 'Carte donnée ? <b style="color:var(--o)">Fais-la opposer.</b>', T('envoie', 14));
  };

  // =====================================================================================================
  // A04 · Ta 1re revente, partie 1
  // =====================================================================================================
  const intro = (n, tPart) => { const s = S(-1, 0, 'var(--w)', { type: 'cut' }, 0.04);
    BA(s, 144, 250, 'POV : ta 1re revente', ['1re'], -0.6, 'var(--ink)', 34);
    KA(s, 140, 310, 140, 'Ta 1re revente,', 'var(--ink)', false, [-0.55, -0.5, -0.45]); KA(s, 140, 470, 210, 'partie ' + n, 'var(--o)', true, [tPart, tPart + 0.12]);
    hero(s, DEMO + 'clio-2.webp', 780, 520, 540, 1080, -0.7); cue(tPart, 'thud', 0.6); return s; };
  SPECS.A04 = () => {
    const s1 = intro(1, T('partie')); s1.b = 2.55;
    const s2 = S(2.55, 4.95, 'var(--w)', { type: 'swipe' }, 0.03);
    KA(s2, 140, 260, 150, 'Une Clio 4', 'var(--ink)', false, [T('une', 2.5), T('clio', 2.5), T('4', 2.8)]);
    const ls = listing(s2.cam, 640, DEMO + 'clio-2.webp', 'Renault Clio 4 TCe 90', '2016 · 112 000 km · Essence', '7 400 €'); const mk2 = ls.querySelector('.p i');
    s2.P.push((t) => { rise(ls, t, 2.65, 540, 930, 2); mk2.style.transform = `scaleX(${E(t, T('7400', 3.5), 0.45).toFixed(3)})`; });
    const s3 = S(4.95, 8.1, 'var(--ink)', { type: 'portal', x: 420, y: 1250 }, 0.04);
    KA(s3, 140, 260, 110, "Avant d'appeler,", '#fff', false, [T('avant', 5), T('appeler', 5)]); KA(s3, 140, 390, 150, 'ton prix max', 'var(--o)', true, [T('ton', 5.7), T('prix', 5.7), T('max', 5.7)]);
    const tk = ticket(s3.cam, 780, [['Revente estimée', '8 300 €', 5.6], ['Frais prévus', '− 640 €', 5.85], ['Ta marge minimum', '− 600 €', 6.1]], { lab: 'Prix max', v: 7060, t: T('7', 6.6), tone: 'o' });
    s3.P.push((t) => { rise(tk, t, 5.2, 540, 980); tk.paint(t); });
    const s4 = S(8.1, 11.75, 'var(--w)', { type: 'swipe' }, 0.03);
    KA(s4, 140, 260, 140, 'Au téléphone…', 'var(--ink)', false, [T('au', 8.1), T('telephone', 8.1)]);
    const bs = [bubble(s4.cam, 560, 'Je vous propose 6 700 €.', true, 8.6), bubble(s4.cam, 760, '7 000 et elle est à vous.', false, T('7000', 9.2), 'Le vendeur'),
      bubble(s4.cam, 1000, 'Avec le carnet et le double des clés ?', true, 10.6), bubble(s4.cam, 1220, 'Les deux.', false, 11.2)];
    s4.P.push((t) => bs.forEach((b) => b(t)));
    const s5 = S(11.75, 14.65, 'var(--o)', { type: 'slab' });
    KA(s5, 140, 280, 170, 'Tu achètes.', '#fff', false, [T('tu', 11.7), T('achetes', 11.7)], 'slam');
    const R = ROLL(s5.cam, 130, 470, 280, '0 000 €', '7 000 €', 'var(--ink)'); cue(12.1, 'roll', 0.8);
    BA(s5, 144, 820, '60 € sous ton plafond', ['60'], T('60', 12.5), 'var(--ink)', 40, '#fff');
    s5.P.push((t) => { R.box.style.visibility = t >= 11.85 ? '' : 'hidden'; rollP(R, t, 11.9, 0.55, 0.06); });
    endCard(14.65, 'var(--ink)', [['Partie 2,', 300, 190, '#fff', false, T('partie', 14.5)], ['samedi.', 480, 230, 'var(--o)', true, T('samedi', 15)]], '640 € de frais, <b style="color:var(--o)">5 jours sans appel</b>', T('partie', 14.5));
  };

  // =====================================================================================================
  // A05 · Tu gagnes 300 € en négo et tu rentres à −12 €
  // =====================================================================================================
  SPECS.A05 = () => {
    const s1 = S(-1, 3.0, 'var(--w)', { type: 'cut' }, 0.04);
    KA(s1, 140, 260, 160, 'Lille →', 'var(--ink)', false, [-0.6, -0.5]); KA(s1, 140, 420, 190, 'Marseille', 'var(--o)', true, T('marseille', 1.5));
    const map = mk('div', 'a', s1.cam, { left: '0px', top: '0px' }, `<svg width="1080" height="1920"><path id="rt" d="M300 760 C 520 820, 330 1040, 560 1110 S 760 1260, 780 1330" fill="none" stroke="#1c1612" stroke-width="10" stroke-linecap="round" stroke-dasharray="4 26"/>
      <circle cx="300" cy="760" r="22" fill="#1c1612"/><circle cx="780" cy="1330" r="26" fill="#ff5a1f"/><text x="340" y="772" font-family="Satoshi" font-weight="700" font-size="40" fill="#1c1612">Lille</text><text x="560" y="1408" font-family="Satoshi" font-weight="700" font-size="40" fill="#1c1612">Marseille · 1 000 km</text></svg>`);
    const path = map.querySelector('#rt'), PL = path.getTotalLength();
    const cr = car(s1.cam, CAR + 'car-clio.webp', 260);   // posée sur Marseille, dans la colonne sûre cred(s1, CREDIT.clio);
    s1.P.push((t) => { path.style.strokeDashoffset = '0'; path.setAttribute('stroke-dasharray', `4 26`); path.style.clipPath = ''; const p = E(t, -0.4, 2.2, eIO); path.setAttribute('stroke-dasharray', `${(PL * p).toFixed(0)} ${PL}`);
      pose(cr, t, (tt) => ({ x: 770, y: 1235 - 20 * E(tt, 1.7, 0.5), c: 1, o: E(tt, 1.6, 0.4) })); });
    const s2 = S(3.0, 4.85, 'var(--ink)', { type: 'swipe' }, 0.03);
    KA(s2, 140, 260, 120, 'Tu gagnes', '#fff', false, [T('tu', 3), T('gagnes', 3)]);
    const R2 = ROLL(s2.cam, 130, 400, 260, '+000 €', '+300 €', '#3ccf7a'); cue(T('300', 3.3) + 0.1, 'roll', 0.8);
    BA(s2, 144, 700, 'en négo', ['négo'], T('nego', 4), '#fbf9f5');
    const b2 = bubble(s2.cam, 900, 'Allez, 3 900 au lieu de 4 200.', false, 3.3, 'Le vendeur · Marseille');
    s2.P.push((t) => { R2.box.style.visibility = t >= T('300', 3.3) - 0.12 ? '' : 'hidden'; rollP(R2, t, T('300', 3.3) - 0.1, 0.5, 0.06); b2(t); });
    const s3 = S(4.85, 10.15, 'var(--w)', { type: 'swipe' }, 0.03);
    KA(s3, 140, 260, 130, 'Ton samedi :', 'var(--ink)', false, [4.9, 5.0]);
    const tk = ticket(s3.cam, 780, [['Train aller', '118 €', T('train', 4.9)], ['Gazole, 1 000 km', '96 €', T('gazole', 5.5)], ['Péages', '87 €', T('peage', 6.3)], ['Sandwich et café', '11 €', T('sandwich', 7)]], { lab: 'Trajet', v: 312, t: T('312', 8.5), tone: 'r' });
    s3.P.push((t) => { rise(tk, t, 4.95, 540, 900); tk.paint(t); });
    const s4 = S(10.15, 12.05, 'var(--ink)', { type: 'portal', ...atPose(tk, 540, 900, 0.82, 0.88) }, 0.04); s4.imp.push([T('moins', 11) + 0.05, 24]); cue(T('moins', 11), 'impact');
    KA(s4, 140, 300, 160, 'Ta négo ?', '#fff', false, [T('ta', 10.2), T('nego', 10.2)]);
    const R4 = ROLL(s4.cam, 130, 500, 320, '−00 €', '−12 €', '#ff5a4a'); cue(T('moins', 11) + 0.12, 'roll', 0.8);
    BA(s4, 144, 900, 'une fois le trajet payé', ['trajet'], 11.6, '#fbf9f5');
    s4.P.push((t) => { R4.box.style.visibility = t >= T('moins', 11) - 0.1 ? '' : 'hidden'; rollP(R4, t, T('moins', 11) - 0.08, 0.5, 0.06); });
    const s5 = S(12.05, 15.1, 'var(--w)', { type: 'swipe' }, 0.03);
    KA(s5, 140, 260, 140, 'Et la voiture ?', 'var(--ink)', false, [T('et', 12), T('la', 12.2), T('voiture', 12.2)]);
    KA(s5, 140, 410, 130, 'Faut encore', 'var(--o)', true, [T('faut', 13.2), T('encore', 13.2)]); KA(s5, 140, 540, 150, 'la revendre.', 'var(--o)', true, [T('la', 13.6), T('revendre', 13.6)]);
    carIn(s5, CAR + 'car-clio.webp', 760, 540, 1150, 12.1); cred(s5, CREDIT.clio);
    const ven = tag(s5.cam, 'À vendre', null, 64); cue(T('revendre', 13.6), 'pop', 0.7);
    s5.P.push((t) => drop(ven, t, T('revendre', 13.6), 760, 1000, 6));
    endCard(15.1, 'var(--o)', [['Envoie ça', 260, 170, '#fff', false, T('envoie', 15)], ['à ton pote', 420, 170, '#fff', false, T('ton', 15.6)], ['qui fait 1 000 km', 600, 110, 'var(--ink)', true, T('fait', 16.2)], ['pour 300 €.', 720, 110, 'var(--ink)', true, T('pour', 17)]], null, T('envoie', 15));
  };

  // =====================================================================================================
  // A06 · Ta 1re revente, partie 2
  // =====================================================================================================
  SPECS.A06 = () => {
    const s1 = intro(2, T('partie')); s1.b = 2.45;
    const s2 = S(2.45, 5.35, 'var(--w)', { type: 'swipe' }, 0.03);
    KA(s2, 140, 260, 150, 'Les frais.', 'var(--ink)', false, [2.5, 2.6]);
    const tk = ticket(s2.cam, 780, [['Carte grise, 5 CV', '290 €', 2.55], ['2 pneus avant', '160 €', 2.72], ['Plaquettes avant', '90 €', 2.89], ['Nettoyage', '40 €', 3.06], ['Trajet du jour 1', '60 €', 3.23]], { lab: 'Frais', v: 640, t: T('euros', 3), tone: '' });
    const st = stamp(s2.cam, 'PILE LE BUDGET', 'var(--ok)', 80); cue(T('pile', 4), 'thud', 0.8);
    s2.P.push((t) => { rise(tk, t, 2.5, 540, 880); tk.paint(t); slamAt(st, t, T('pile', 4), 560, 1360, -5); });
    const s3 = S(5.35, 7.55, 'var(--ink)', { type: 'portal', ...atPose(tk, 540, 880, 0.82, 0.9) }, 0.04);
    KA(s3, 140, 260, 130, 'Ton annonce :', '#fff', false, [T('annonce', 5.3), T('annonce', 5.3) + 0.1]);
    const ls = listing(s3.cam, 620, DEMO + 'clio-2.webp', 'Renault Clio 4 TCe 90', '2016 · 112 000 km · Essence', '8 490 €'); const mk3 = ls.querySelector('.p i');
    s3.P.push((t) => { rise(ls, t, 5.45, 540, 930, 2); mk3.style.transform = `scaleX(${E(t, T('8490', 5.8), 0.45).toFixed(3)})`; });
    const s4 = S(7.55, 10.35, 'var(--ink)', { type: 'swipe' }, 0.04);
    const R = ROLL(s4.cam, 130, 300, 420, '0', '5', '#fff'); cue(T('5', 7.5) + 0.1, 'roll', 0.8);
    KA(s4, 400, 420, 200, 'jours.', 'var(--o)', true, T('jours', 7.8));
    const z = mk('div', 'pill a', s4.cam, { background: 'var(--r)', color: '#fff', fontSize: '60px', padding: '24px 46px' }, '0 appel · 0 message'); cue(T('zero', 8.6), 'thud', 0.8);
    s4.P.push((t) => { rollP(R, t, T('5', 7.5) - 0.1, 0.6, 0); pose(z, t, (tt) => { const t0 = T('zero', 8.6); if (tt < t0 - 0.02) return null; const p = E(tt, t0, 0.25); return { x: 540, y: 1000, c: 1, s: 1 + 0.6 * (1 - p), o: p * 3, r: -3 }; }); });
    const s5 = S(10.35, 13.7, 'var(--w)', { type: 'swipe' }, 0.03);
    KA(s5, 140, 260, 150, 'Tu baisses ?', 'var(--ink)', false, [T('tu', 10.3), T('baisses', 10.3)]);
    const th = mk('div', 'a', s5.cam, { padding: '40px 56px', borderRadius: '70px', background: '#fff', font: 'italic 400 76px Instrument', color: 'var(--ink)', whiteSpace: 'nowrap', boxShadow: '0 40px 80px -30px rgba(28,22,18,.45)' }, '« Je baisse à 7 990 ? »');
    const no = stamp(s5.cam, 'NON.', 'var(--r)', 130); cue(T('non', 11.3), 'impact', 0.8); s5.imp.push([T('non', 11.3) + 0.03, 16]);
    KA(s5, 140, 1020, 130, 'Tu changes', 'var(--o)', true, [T('tu', 12), T('changes', 12)]); KA(s5, 140, 1160, 160, '4 lignes.', 'var(--o)', true, [T('4', 12.4), T('lignes', 12.4)]);
    s5.P.push((t) => { pose(th, t, (tt) => { const p = E(tt, 10.45, 0.5); return { x: 540, y: 640, c: 1, s: 0.8 + 0.2 * p, o: p * 2 }; }); slamAt(no, t, T('non', 11.3), 620, 700, -10); });
    endCard(13.7, 'var(--ink)', [['Partie 3,', 300, 190, '#fff', false, T('partie', 13.6)], ['demain.', 480, 230, 'var(--o)', true, T('demain', 14)]], 'Les <b style="color:var(--o)">4 lignes</b> qui font appeler', T('partie', 13.6));
  };

  // =====================================================================================================
  // A07 · Ta 1re revente, partie 3
  // =====================================================================================================
  SPECS.A07 = () => {
    const s1 = intro(3, T('partie')); s1.b = 2.38;
    const s2 = S(2.38, 5.65, 'var(--w)', { type: 'swipe' }, 0.03);
    KA(s2, 140, 250, 120, '4 lignes changées.', 'var(--ink)', false, [T('4', 2.3), T('lignes', 2.3), T('changees', 2.3)]);
    const av = mk('div', 'card2 a', s2.cam, { width: '760px', font: '600 34px Satoshi', color: 'rgba(28,22,18,.45)' }, '<div style="font:700 24px Satoshi;letter-spacing:.14em;margin-bottom:10px">AVANT</div><s>Très bon état</s> · <s>CT OK</s> · <s>Pas sérieux s’abstenir</s>');
    const ap = mk('div', 'card2 a', s2.cam, { width: '780px', font: '700 38px/1.55 Satoshi', color: 'var(--ink)' }, '<div style="font:700 24px Satoshi;letter-spacing:.14em;color:var(--o);margin-bottom:8px">APRÈS</div>' + ['112 000 km, 2 propriétaires', 'CT d’août, aucun défaut', 'Pneus et plaquettes neufs, factures', 'Carnet complet, 2 clés'].map((x) => `<div class="ln2">✓ ${x}</div>`).join(''));
    const lns = [...ap.querySelectorAll('.ln2')];
    const call = mk('div', 'pill a', s2.cam, { background: 'var(--o)', color: '#fff', fontSize: '50px' }, '3 appels en 2 jours'); cue(T('3', 3.8), 'ding', 0.8);
    s2.P.push((t) => { rise(av, t, 2.45, 540, 520, -1); rise(ap, t, 2.6, 540, 880, 1); lns.forEach((l, i) => slideIn(l, t, 2.75 + i * 0.18));
      pose(call, t, (tt) => { const t0 = T('3', 3.8); if (tt < t0 - 0.02) return null; const p = E(tt, t0, 0.3); return { x: 540, y: 1300, c: 1, s: 1 + 0.5 * (1 - p) + 0.04 * Math.sin((tt - t0) * 30) * Math.exp(-(tt - t0) * 3), o: p * 3 }; }); });
    const s3 = S(5.65, 9.95, 'var(--ink)', { type: 'swipe' }, 0.03);
    KA(s3, 140, 260, 150, 'Jour 10.', '#fff', false, [5.7, 5.8]);
    const bs = [bubble(s3.cam, 520, 'Bonjour, vous faites 7 900 ?', false, T('vous', 5.6), 'Un acheteur · 19:02'), bubble(s3.cam, 780, '8 300. Pneus et plaquettes neufs, factures à l’appui.', true, T('8003', 7)),
      bubble(s3.cam, 1120, 'Je passe samedi. 8 300.', false, 9.2)];
    s3.P.push((t) => bs.forEach((b) => b(t)));
    const s4 = S(9.95, 13.9, 'var(--o)', { type: 'slab' });
    const st = stamp(s4.cam, 'VENDUE', 'var(--ink)', 150); cue(T('vendu', 9.9), 'impact', 0.8); s4.imp.push([T('vendu', 9.9) + 0.03, 18]);
    const R = ROLL(s4.cam, 130, 640, 280, '+000 €', '+660 €', '#fff'); cue(T('660', 10.8) + 0.1, 'roll', 0.8);
    BA(s4, 144, 990, 'en 12 jours, frais payés', ['12'], T('12', 12), 'var(--ink)', 40, '#fff');
    s4.P.push((t) => { slamAt(st, t, T('vendu', 9.9), 540, 420, -6); R.box.style.visibility = t >= T('660', 10.8) - 0.12 ? '' : 'hidden'; rollP(R, t, T('660', 10.8) - 0.1, 0.55, 0.06); });
    const s5 = S(13.9, 16.72, 'var(--ink)', { type: 'portal', ...atEl(R.box, 0.5, 0.5) }, 0.04);
    KA(s5, 140, 260, 110, 'Le calcul du jour 1,', '#fff', false, [T('le', 13.9), T('calcul', 13.9), T('du', 14.3), T('jour', 14.3), T('1', 14.7)]);
    KA(s5, 140, 380, 150, 'étape par étape', 'var(--o)', true, [T('etape', 15.3), T('par', 15.6), T('etape', 15.8)]);
    const tk = ticket(s5.cam, 780, [['Revente estimée', '8 300 €', 14.4], ['Frais prévus', '− 640 €', 14.6], ['Ta marge minimum', '− 600 €', 14.8]], { lab: 'Prix max', v: 7060, t: 15.15, tone: 'o' });
    s5.P.push((t) => { rise(tk, t, 14.05, 540, 980); tk.paint(t); });
    endCard(16.72, 'var(--o)', [['Commente', 300, 170, '#fff', false, T('commente', 16.6)], ['DÉBUTANT', 470, 200, 'var(--ink)', false, T('debut', 16.9)]], 'Le guide <b style="color:var(--o)">Ta 1re revente</b>', T('commente', 16.6));
  };

  if (!SPECS[ID]) throw new Error('vidéo inconnue : ' + ID);
  SPECS[ID]();
  // intro des séries : la première scène finit à la deuxième
  // ---------- seek ----------
  window.seek = (t) => { KF = inWin(t) ? 0.3 : 1; for (const s of SC) paintScene(s, t); };
  window.shutter = (t) => (inWin(t) ? 1 : 0);
  window.samples = (t) => 8;
  window.filmDur = DUR;
  window.cues = CUES.sort((x, y) => x.t - y.t);
  window.seek(0);
  window.filmReady = true;
})();
