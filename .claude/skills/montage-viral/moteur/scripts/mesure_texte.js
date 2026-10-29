// Mesure la largeur (px) de textes dans Chromium, avec les polices de la marque (le même moteur que le rendu).
// Usage : node mesure_texte.js entree.json sortie.json
// entree : {"polices": {"Satoshi": "/chemin/Satoshi-700.woff2", ...}, "styles": {"st": {"font": "700 58px Satoshi",
//           "letterSpacing": "-0.4px"}}, "textes": {"st": ["mot", ...]}}
// sortie : {"st": {"mot": largeur, ...}}
const fs = require("fs");
const { chromium } = require("playwright");
(async () => {
  const [entree, sortie] = process.argv.slice(2);
  const E = JSON.parse(fs.readFileSync(entree, "utf8"));
  const faces = Object.entries(E.polices).map(([fam, f]) => {
    const [nom, poids, style] = fam.split("|");
    const b64 = fs.readFileSync(f).toString("base64");
    return `@font-face{font-family:"${nom}";font-weight:${poids || 400};font-style:${style || "normal"};src:url(data:font/woff2;base64,${b64}) format("woff2");}`;
  }).join("\n");
  const navigateur = await chromium.launch();
  const page = await navigateur.newPage();
  await page.setContent(`<html><head><style>${faces}</style></head><body></body></html>`);
  const res = await page.evaluate(async (E) => {
    const out = {};
    for (const [cle, st] of Object.entries(E.styles)) await document.fonts.load(st.font, "Aa");
    await document.fonts.ready;
    for (const [cle, st] of Object.entries(E.styles)) {
      const s = document.createElement("span");
      s.style.font = st.font; s.style.letterSpacing = st.letterSpacing || "0px"; s.style.whiteSpace = "pre";
      s.style.position = "absolute"; document.body.appendChild(s);
      out[cle] = {};
      for (const t of E.textes[cle] || []) { s.textContent = t; out[cle][t] = s.getBoundingClientRect().width; }
      s.remove();
    }
    return out;
  }, E);
  fs.writeFileSync(sortie, JSON.stringify(res));
  await navigateur.close();
})();
