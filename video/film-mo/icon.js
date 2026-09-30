// Logo UTOPICAR en icône d'app iOS : carré à coins continus (superellipse, comme les icônes iOS), fond sombre en léger
// dégradé, liseré de lumière en haut, voiture du vrai logo (assets/brand/logo.svg) centrée à ≈ 70 % de la largeur.
// L'ombre portée est posée en CSS par chaque film (.lock .ico).
const N = 5, R = 512, STEPS = 96;
function squircle() {
  let d = '';
  for (let i = 0; i < STEPS; i++) {
    const a = i / STEPS * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    const x = R + R * Math.sign(c) * Math.abs(c) ** (2 / N), y = R + R * Math.sign(s) * Math.abs(s) ** (2 / N);
    d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  return d + 'Z';
}
// renvoie une fonction : chaque appel produit un SVG aux identifiants uniques (un dégradé référencé dans un élément
// masqué ne s'affiche pas ailleurs)
let n = 0;
export async function appIcon() {
  const src = await (await fetch('../assets/brand/logo.svg')).text();
  const glyph = [...src.matchAll(/<path[\s\S]*?\/>/g)].map(m => m[0]).join('');
  const P = squircle();
  return () => { const id = 'ico' + n++; return svg(id, P, glyph); };
}
function svg(id, P, glyph) {
  // voiture : x 292 → 1640, y 828 → 1102 dans le repère du logo ; centrée, 70 % de la largeur de l'icône
  return `<svg class="ico" viewBox="0 0 1024 1024"><defs>
<linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B221D"/><stop offset="1" stop-color="#141009"/></linearGradient>
<linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".22"/><stop offset=".35" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
<clipPath id="${id}c"><path d="${P}"/></clipPath></defs>
<path d="${P}" fill="url(#${id}g)"/>
<g clip-path="url(#${id}c)"><path d="${P}" fill="none" stroke="#FFFFFF" stroke-opacity=".14" stroke-width="12"/><path d="${P}" fill="none" stroke="url(#${id}h)" stroke-width="14"/></g>
<g transform="translate(512 524) scale(0.57) translate(-966 -965)">${glyph}</g></svg>`;
}
