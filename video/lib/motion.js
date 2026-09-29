// Springs fermés : réponse exacte d'un oscillateur amorti à un échelon, fonction pure du temps.
// Aucune intégration pas à pas, aucun état : spring(t) donne la même valeur quel que soit l'ordre des frames.
(function (root) {
  const TAU = Math.PI * 2;
  // f = fréquence propre (Hz), z = amortissement (1 = critique, aucun dépassement)
  const PRESETS = {
    snappy: { f: 3.2, z: 0.8 },   // boutons, indicateurs, curseur
    default: { f: 2.0, z: 0.78 }, // cartes, conteneurs (~2 % de dépassement)
    heavy: { f: 1.5, z: 1.0 },    // gros textes, logos : aucun rebond
    playful: { f: 2.2, z: 0.45 }, // mascottes uniquement
  };
  const P = (p) => (typeof p === 'string' ? PRESETS[p] : p) || PRESETS.default;

  // progression 0 → 1 d'un spring lancé à t = 0
  function spring(t, preset) {
    if (t <= 0) return 0;
    const { f, z } = P(preset); const w = TAU * f;
    if (z < 1) {
      const wd = w * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
    }
    if (z === 1) return 1 - Math.exp(-w * t) * (1 + w * t);
    const s = Math.sqrt(z * z - 1), r1 = -w * (z - s), r2 = -w * (z + s);
    return 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
  }

  // valeur à plusieurs cibles : un spring par changement de cible, additionnés
  // keys = [[t0, v0], [t1, v1, preset], [t2, v2, preset], ...]
  function track(t, keys) {
    let v = keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [ti, vi, pr] = keys[i];
      v += (vi - keys[i - 1][1]) * spring(t - ti, pr || 'default');
    }
    return v;
  }

  // indicateur qui glisse entre des positions : bord avant plus raide que bord arrière (étirement)
  // stops = [[t, lo, hi], ...] ; renvoie {lo, hi}
  function indicator(t, stops) {
    let lo = stops[0][1], hi = stops[0][2];
    for (let i = 1; i < stops.length; i++) {
      const [ti, l1, h1] = stops[i]; const [, l0, h0] = stops[i - 1];
      const fwd = (l1 + h1) > (l0 + h0);
      const lead = spring(t - ti, 'snappy'), trail = spring(t - ti - 0.04, 'default');
      lo += (l1 - l0) * (fwd ? trail : lead);
      hi += (h1 - h0) * (fwd ? lead : trail);
    }
    return { lo, hi };
  }

  // opacité d'un texte porté par un conteneur qui morphe : entre après le début du morph, sort avant le suivant
  function swapAlpha(t, tIn, tOut, lead = 0.08, fall = 0.12) {
    const a = spring(t - (tIn + lead), 'snappy');
    const b = tOut == null ? 0 : spring(t - (tOut - fall), 'snappy');
    return Math.max(0, Math.min(1, a - b));
  }

  // temps bouclé : la dernière frame est identique à la première
  const loopT = (t, dur) => ((t % dur) + dur) % dur;

  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, p) => a + (b - a) * p;

  // bruit déterministe (valeur seedée, jamais Math.random)
  function noise(seed, t) {
    const h = (n) => { const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return s - Math.floor(s); };
    const i = Math.floor(t), fr = t - i, u = fr * fr * (3 - 2 * fr);
    return lerp(h(i), h(i + 1), u) * 2 - 1;
  }

  root.Motion = { PRESETS, spring, track, indicator, swapAlpha, loopT, clamp, lerp, noise };
})(typeof window !== 'undefined' ? window : globalThis);
