/* Construction : CSS du site (Tailwind v4 sur web/src/app/globals.css), polices, rendu serveur des composants,
   scripts navigateur. Écrit les pages sources dans .construction/site/ ; scripts/captures.mjs les ouvre ensuite
   dans Chromium, en fait les PNG et les copies HTML finales dans video/assets/master60/ui/.
   Rien n'est écrit sous web/ (lecture seule). */
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ICI = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEPOT = resolve(ICI, "../..");
const WEB = join(DEPOT, "web");
const WEB_SRC = join(WEB, "src");
const TMP = join(ICI, ".construction");
const SITE = join(TMP, "site"); // pages sources, mêmes chemins relatifs que les sorties
const MODULES = join(ICI, "node_modules");

rmSync(TMP, { recursive: true, force: true });
mkdirSync(join(SITE, "polices"), { recursive: true });
mkdirSync(join(SITE, "images", "demo"), { recursive: true });
mkdirSync(join(SITE, "js"), { recursive: true });

/* ---------- 1. Polices : Clash Display et Satoshi du site, Instrument Serif italique (next/font/google → @fontsource) ---------- */
for (const f of ["clash-display-500", "clash-display-600", "satoshi-400", "satoshi-500", "satoshi-700"]) cpSync(join(WEB_SRC, "app/polices", `${f}.woff2`), join(SITE, "polices", `${f}.woff2`));
const FS = join(MODULES, "@fontsource/instrument-serif/files");
for (const f of ["instrument-serif-latin-400-italic", "instrument-serif-latin-ext-400-italic"]) cpSync(join(FS, `${f}.woff2`), join(SITE, "polices", `${f}.woff2`));
// mêmes variables que web/src/app/layout.tsx (next/font les pose en classes sur <html>)
const POLICES = `
@font-face { font-family: "Clash Display"; src: url("polices/clash-display-500.woff2") format("woff2"); font-weight: 500; font-style: normal; font-display: swap; }
@font-face { font-family: "Clash Display"; src: url("polices/clash-display-600.woff2") format("woff2"); font-weight: 600; font-style: normal; font-display: swap; }
@font-face { font-family: "Satoshi"; src: url("polices/satoshi-400.woff2") format("woff2"); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: "Satoshi"; src: url("polices/satoshi-500.woff2") format("woff2"); font-weight: 500; font-style: normal; font-display: swap; }
@font-face { font-family: "Satoshi"; src: url("polices/satoshi-700.woff2") format("woff2"); font-weight: 700; font-style: normal; font-display: swap; }
@font-face { font-family: "Instrument Serif"; src: url("polices/instrument-serif-latin-ext-400-italic.woff2") format("woff2"); font-weight: 400; font-style: italic; font-display: swap;
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF; }
@font-face { font-family: "Instrument Serif"; src: url("polices/instrument-serif-latin-400-italic.woff2") format("woff2"); font-weight: 400; font-style: italic; font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
html { --font-instrument: "Instrument Serif"; --font-clash: "Clash Display"; --font-satoshi: "Satoshi"; }
`;

/* ---------- 2. CSS : la vraie feuille globals.css, compilée par Tailwind v4 sur toutes les classes de web/src ---------- */
const globals = readFileSync(join(WEB_SRC, "app/globals.css"), "utf8");
const entree = `${globals}\n/* --- ajouté par la capture : classes utilisées par les composants de l'app --- */\n@source "${WEB_SRC}/**/*.{ts,tsx}";\n@source "${join(ICI, "src")}/**/*.{ts,tsx}";\n`;
writeFileSync(join(TMP, "entree.css"), entree);
execFileSync(join(MODULES, ".bin/tailwindcss"), ["-i", join(TMP, "entree.css"), "-o", join(TMP, "tailwind.css"), "--cwd", ICI, "--minify"], { stdio: "inherit", cwd: ICI });
const CSS = POLICES.trim().replace(/\n\s*/g, " ") + "\n" + readFileSync(join(TMP, "tailwind.css"), "utf8");
writeFileSync(join(SITE, "site.css"), CSS);

/* ---------- 3. Images de la démo (accueil) ---------- */
for (const f of ["208-1", "clio-1", "yaris-1"]) // photos de TroisVerdicts
  for (const t of ["", "-400"]) cpSync(join(WEB, "public/images/demo", `${f}${t}.webp`), join(SITE, "images/demo", `${f}${t}.webp`));

/* ---------- 4. esbuild : alias de Next et des services, chemins @/ de web/ ---------- */
const SHIMS = join(ICI, "shims");
const REDIRECTIONS = {
  "next/link": join(SHIMS, "next-link.tsx"),
  "next/navigation": join(SHIMS, "next-navigation.ts"),
  "next/image": join(SHIMS, "next-image.tsx"),
  "server-only": join(SHIMS, "vide.ts"),
  "@vercel/analytics": join(SHIMS, "vercel-analytics.ts"),
  "@/lib/supabase/navigateur": join(SHIMS, "supabase-navigateur.ts"),
};
const alias = {
  name: "alias-capture",
  setup(b) {
    const motif = new RegExp(`^(${Object.keys(REDIRECTIONS).map((k) => k.replace(/[/.@-]/g, "\\$&")).join("|")})$`);
    b.onResolve({ filter: motif }, (a) => ({ path: REDIRECTIONS[a.path] }));
    // l'import relatif de navigateur.ts (ex. « ../supabase/navigateur ») passe aussi par la fausse session
    b.onResolve({ filter: /supabase\/navigateur$/ }, () => ({ path: REDIRECTIONS["@/lib/supabase/navigateur"] }));
    // @/… → web/src/… (les fichiers de capture-web n'ont pas le tsconfig de web/)
    b.onResolve({ filter: /^@\// }, async (a) => b.resolve("./" + a.path.slice(2), { resolveDir: WEB_SRC, kind: a.kind }));
  },
};
const commun = {
  bundle: true,
  jsx: "automatic",
  nodePaths: [MODULES], // web/ n'a pas de node_modules : react, react-dom et zod viennent d'ici
  plugins: [alias],
  logLevel: "warning",
  loader: { ".webp": "file" },
  define: { "process.env.NODE_ENV": '"production"' },
  tsconfig: join(ICI, "tsconfig.json"),
};

// rendu serveur (Node)
await build({ ...commun, entryPoints: [join(ICI, "src/rendu.tsx")], outfile: join(TMP, "rendu.mjs"), platform: "node", format: "esm", external: ["react", "react-dom", "react-dom/*"], banner: { js: "// généré par scripts/construire.mjs" } });
// scripts navigateur
await build({
  ...commun,
  entryPoints: { site: join(ICI, "src/client/site.tsx"), accueil: join(ICI, "src/client/accueil.tsx") },
  outdir: join(SITE, "js"),
  platform: "browser",
  format: "iife",
  minify: true,
  define: { ...commun.define, "process.env": "{}" },
});

/* ---------- 5. Pages ---------- */
process.env.TZ = "Europe/Paris";
const { PAGES, rendre, chiffresBilan } = await import(pathToFileURL(join(TMP, "rendu.mjs")).href);

/** Thèmes : l'espace /app est sombre (aucun cadre) ; le site public est clair par défaut (CadreSite). */
const THEMES = { espace: ["sombre", "clair"], site: ["clair", "sombre"] };
const STYLE_CLAIR = ":root{color-scheme:light}body{background:#f7f2ea}"; // posé par CadreSite en clair

function page({ titre, corps, theme, zone, scripts = [], attributs = "" }) {
  const cadre = zone === "site" || theme === "clair";
  const contenu = cadre ? `<div id="site" data-theme="${theme}" class="cadre-site">${corps}</div>` : corps;
  return `<!doctype html>
<html lang="fr" data-capture-theme="${theme}"${attributs}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Utopicar · ${titre} (${theme})</title>
<link rel="stylesheet" href="site.css">
${theme === "clair" ? `<style>${STYLE_CLAIR}</style>` : ""}
</head>
<body>
${contenu}
${scripts.map((s) => `<script src="js/${s}.js"></script>`).join("\n")}
</body>
</html>
`;
}

const liste = [];
for (const [nom, p] of Object.entries(PAGES)) {
  // les images de la démo sont servies à la racine du site (/images/demo/…) : chemins relatifs pour file://
  const corps = rendre(nom).replace(/(["\s,])\/images\/demo\//g, "$1images/demo/");
  for (const theme of THEMES[p.zone]) {
    const fichier = `${nom}-${theme}.html`;
    writeFileSync(join(SITE, fichier), page({ titre: p.titre, corps, theme, zone: p.zone, scripts: ["site"] }));
    liste.push({ nom, theme, fichier, zone: p.zone });
  }
}
// accueil : le champ d'essai, rendu dans le navigateur, qui ouvre tout seul l'exemple de la 208
for (const theme of THEMES.site) {
  const fichier = `accueil-208-${theme}.html`;
  writeFileSync(join(SITE, fichier), page({ titre: "Accueil, exemple Peugeot 208", corps: '<main id="contenu" tabindex="-1" class="outline-none"><div id="racine"></div></main>', theme, zone: "site", scripts: ["accueil"], attributs: ' data-exemple="p208" data-delai="900"' }));
  liste.push({ nom: "accueil-208", theme, fichier, zone: "site", client: true });
}
writeFileSync(join(TMP, "pages.json"), JSON.stringify(liste, null, 2));
writeFileSync(join(TMP, "bilan.json"), JSON.stringify(chiffresBilan(), null, 2));
console.log(`${liste.length} pages dans ${SITE}`);
console.log("bilan() :", JSON.stringify(chiffresBilan()));
if (!existsSync(join(SITE, "js/site.js"))) throw new Error("script navigateur manquant");
