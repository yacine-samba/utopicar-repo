/* Captures : ouvre chaque page de .construction/site/ dans Chromium (file://), attend les polices et l'état final,
   puis écrit dans video/assets/master60/ui/ :
   - <page>-<thème>.html : copie autonome de la page finale (DOM figé, CSS compilée en ligne, sans script),
     polices et images en chemins relatifs (polices/, images/) ; les entrées en cascade du site se jouent à l'ouverture ;
   - accueil-208-anime-<thème>.html : le vrai champ d'essai en direct (script en ligne) qui joue l'exemple de la 208 ;
   - png/<page>-<thème>-<390|1280>.png : page entière, densité 3 ;
   - png/elements/<page>-<thème>-<390|1280>-<élément>.png : cartes seules, fond transparent.
   Animations réduites pendant la capture : on photographie l'état final. */
import { chromium } from "playwright-core";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ICI = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = join(ICI, ".construction/site");
const SORTIE = process.env.SORTIE ?? resolve(ICI, "../assets/master60/ui");
const LARGEURS = (process.env.LARGEURS ?? "390,1280").split(",").map(Number);
const DPR = Number(process.env.DPR ?? 3);
const SEULES = process.env.PAGES ? process.env.PAGES.split(",") : null; // ex. PAGES=tableau,offres
const CHROME = ["/opt/pw-browsers/chromium-1194/chrome-linux/chrome"].find(existsSync);
const MAX_PX = 15000; // au-delà, Chromium découpe mal les captures : on assemble des tranches

if (!existsSync(join(SITE, "site.css"))) throw new Error("Lancer d'abord : npm run build");
const pages = JSON.parse(readFileSync(join(ICI, ".construction/pages.json"), "utf8")).filter((p) => !SEULES || SEULES.includes(p.nom));
if (!SEULES) rmSync(join(SORTIE, "png"), { recursive: true, force: true }); // pas d'anciennes captures mêlées aux nouvelles
mkdirSync(join(SORTIE, "png/elements"), { recursive: true });
for (const d of ["polices", "images"]) cpSync(join(SITE, d), join(SORTIE, d), { recursive: true });
const CSS = readFileSync(join(SITE, "site.css"), "utf8");

/** Les cartes à isoler, par page : [nom, sélecteur, tous les éléments (sinon le premier)]. */
const ELEMENTS = {
  tableau: [
    ["entete", 'section[aria-labelledby="tb-titre"]'],
    ["journee", 'section[aria-labelledby="tb-titre"] > div:last-child'],
    ["journee-action", 'section[aria-labelledby="tb-titre"] ol > li > div', true],
    ["chiffres", 'section[aria-labelledby="tb-chiffres"] > div'],
    ["chiffre", 'section[aria-labelledby="tb-chiffres"] .carte', true],
    ["marche", "#tb-marche"],
    ["marche-annonce", "#tb-marche article", true],
    ["parc", 'section[aria-labelledby="tb-parc"]'],
    ["affaires", 'section[aria-labelledby="tb-best"] ul'],
    ["affaire", 'section[aria-labelledby="tb-best"] li > a', true],
    ["marges", 'section[aria-labelledby="tb-marges"]'],
    ["analyses-mois", 'section[aria-labelledby="tb-analyses"]'],
    ["outils", 'section[aria-labelledby="tb-outils"] > div.grid'],
  ],
  "rapport-mercedes": [
    ["bilan", "#contenu > div > div"],
    ["verdict", 'section[aria-labelledby="bilan-verdict"]'],
    ["vigilance", 'section[aria-labelledby="bilan-vigilance"]'],
    ["questions-cles", "#contenu details.group >> xpath=..", false],
    ["pilier", "#contenu details.group", true],
    ["historique", 'section:has(> div > h2:text-is("Historique de l\'annonce"))'],
    ["a-demander", 'section:has(> div > h2:text-is("Avant de vous déplacer, demandez"))'],
    ["argent", 'section:has(> div > h2:text-is("Ce qu\'il vous resterait"))'],
    ["travaux", 'section:has(> div > h2:text-is("Travaux à prévoir sur 12 mois"))'],
  ],
  offres: [
    ["cartes", "#contenu ul"],
    ["carte", "#contenu ul > li.carte", true],
  ],
  bouton: [["bouton", "#bouton-essai"]],
  "trois-verdicts": [
    ["cartes", "#contenu ul"],
    ["carte", "#contenu ul > li article", true],
  ],
  "accueil-208": [
    ["fiche", "#essai article.carte"],
    ["essai", "#essai"],
  ],
};

/** Attend les polices, les scripts et, pour l'accueil, la fiche de la 208 terminée. */
async function pret(page, p) {
  await page.waitForLoadState("load");
  if (p.client) {
    await page.waitForSelector('#essai article.carte[aria-busy="false"]', { timeout: 15000 });
    await page.waitForFunction(() => document.querySelector("#essai")?.textContent?.includes("Déconseillée"));
  }
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400); // Typographie (MutationObserver) et images
  await page.evaluate(async () => {
    await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => (i.onload = i.onerror = r)))));
  });
}

/** Polices réellement utilisées : le titre en Clash Display, le texte en Satoshi. */
async function verifierPolices(page) {
  return page.evaluate(() => {
    const charge = [...document.fonts].filter((f) => f.status === "loaded").map((f) => `${f.family.replace(/"/g, "")} ${f.weight}${f.style === "italic" ? "i" : ""}`);
    const titre = document.querySelector("h1, h2:not(.sr-only), h3");
    return { charge: [...new Set(charge)].sort(), titre: titre ? getComputedStyle(titre).fontFamily.split(",")[0] : null, corps: getComputedStyle(document.body).fontFamily.split(",")[0] };
  });
}

/** Page entière ; en tranches assemblées quand elle dépasse la taille qu'accepte Chromium. */
async function pageEntiere(page, fichier) {
  // hauteur du contenu (bas de <main>) : pas la hauteur minimale de l'écran que garde le cadre du site
  const { w, h } = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: Math.ceil(document.querySelector("#contenu").getBoundingClientRect().bottom + scrollY) }));
  if (h * DPR <= MAX_PX) return page.screenshot({ path: fichier, fullPage: true, clip: { x: 0, y: 0, width: w, height: h } });
  const pas = Math.floor(MAX_PX / DPR);
  const tranches = [];
  for (let y = 0, k = 0; y < h; y += pas, k++) {
    const t = `${fichier}.tranche${k}.png`;
    await page.screenshot({ path: t, fullPage: true, clip: { x: 0, y, width: w, height: Math.min(pas, h - y) } });
    tranches.push(t);
  }
  execFileSync("python3", ["-I", "-c", "import sys\nfrom PIL import Image\nims=[Image.open(f) for f in sys.argv[2:]]\nout=Image.new(ims[0].mode,(ims[0].width,sum(i.height for i in ims)))\ny=0\nfor i in ims:\n  out.paste(i,(0,y)); y+=i.height\nout.save(sys.argv[1])", fichier, ...tranches]);
  tranches.forEach((t) => rmSync(t));
}

/** Copie autonome : DOM final sans scripts, CSS en ligne. */
async function copieFigee(page, p) {
  const html = await page.evaluate(() => {
    const d = document.documentElement.cloneNode(true);
    d.querySelectorAll("script").forEach((s) => s.remove());
    d.querySelectorAll("[hidden]:empty").forEach((s) => s.remove());
    return "<!doctype html>\n" + d.outerHTML;
  });
  const sortie = html.replace('<link rel="stylesheet" href="site.css">', `<style>${CSS}</style>`);
  writeFileSync(join(SORTIE, p.fichier), sortie);
}

const navigateur = await chromium.launch({ executablePath: CHROME });
const rapport = [];
for (const p of pages) {
  for (const largeur of LARGEURS) {
    const ctx = await navigateur.newContext({ viewport: { width: largeur, height: 900 }, deviceScaleFactor: DPR, reducedMotion: "reduce", locale: "fr-FR", timezoneId: "Europe/Paris" });
    const page = await ctx.newPage();
    const erreurs = [];
    page.on("pageerror", (e) => erreurs.push(String(e)));
    page.on("console", (m) => m.type() === "error" && erreurs.push(m.text()));
    await page.goto(pathToFileURL(join(SITE, p.fichier)).href);
    await pret(page, p);
    const base = `${p.nom}-${p.theme}-${largeur}`;
    await pageEntiere(page, join(SORTIE, "png", `${base}.png`));
    if (largeur === LARGEURS.at(-1)) await copieFigee(page, p);
    // éléments : fond de page transparent
    await page.addStyleTag({ content: "html,body,.cadre-site{background:transparent!important}" });
    let n = 0;
    for (const [nom, sel, tous] of ELEMENTS[p.nom] ?? []) {
      const loc = page.locator(sel);
      const total = await loc.count();
      if (!total) {
        erreurs.push(`élément introuvable : ${nom} (${sel})`);
        continue;
      }
      const cibles = tous ? [...Array(total).keys()] : [0];
      for (const i of cibles) {
        const el = loc.nth(i);
        if (!(await el.isVisible())) continue;
        await el.screenshot({ path: join(SORTIE, "png/elements", `${base}-${nom}${tous ? `-${i + 1}` : ""}.png`), omitBackground: true });
        n++;
      }
    }
    rapport.push({ page: base, elements: n, polices: await verifierPolices(page), erreurs });
    await ctx.close();
  }
}

// la version animée du champ d'essai : la page source avec CSS et script en ligne
for (const theme of ["clair", "sombre"]) {
  const f = join(SITE, `accueil-208-${theme}.html`);
  if (!existsSync(f) || (SEULES && !SEULES.includes("accueil-208"))) continue;
  const js = readFileSync(join(SITE, "js/accueil.js"), "utf8").replace(/<\/script/gi, "<\\/script");
  const html = readFileSync(f, "utf8")
    .replace('<link rel="stylesheet" href="site.css">', () => `<style>${CSS}</style>`)
    .replace('<script src="js/accueil.js"></script>', () => `<script>${js}</script>`);
  writeFileSync(join(SORTIE, `accueil-208-anime-${theme}.html`), html);
}

await navigateur.close();
writeFileSync(join(ICI, ".construction/captures.json"), JSON.stringify(rapport, null, 2));
for (const r of rapport) console.log(`${r.page.padEnd(34)} ${String(r.elements).padStart(3)} éléments · titre ${r.polices.titre} · corps ${r.polices.corps}${r.erreurs.length ? ` · ERREURS ${r.erreurs.join(" | ")}` : ""}`);
console.log("polices chargées :", [...new Set(rapport.flatMap((r) => r.polices.charge))].join(", "));
console.log(`${readdirSync(join(SORTIE, "png")).filter((f) => f.endsWith(".png")).length} pages et ${readdirSync(join(SORTIE, "png/elements")).length} éléments dans ${SORTIE}`);
