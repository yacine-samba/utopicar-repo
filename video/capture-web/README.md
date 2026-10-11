# capture-web : la vraie interface d'UTOPICAR, hors de Next, pour filmer

Rend les **vrais composants React** de `web/src` (tableau de bord Benef Pro, bilan d'un rapport, formules, fiche
d'exemple de l'accueil) avec des données de démonstration, puis les photographie dans Chromium.
Rien n'est écrit sous `web/` (lecture seule).

## Reconstruire

```bash
cd video/capture-web
npm install          # dépendances locales (react 19.2.8, esbuild, Tailwind v4, playwright-core…)
npm run tout         # = npm run build (CSS, rendu, scripts) puis npm run captures (PNG + HTML)
```

Variables utiles pour `npm run captures` : `PAGES=tableau,offres` (une partie seulement),
`LARGEURS=390,1280`, `DPR=3`, `SORTIE=…`. Pour `npm run build` : `DATE_DEMO=2026-10-10T08:30:00Z` (date figée
du tableau de bord : « samedi 10 octobre », jours en stock, mois en cours).

Chromium : `/opt/pw-browsers/chromium-1194` (Playwright 1.56).

## Sorties (`video/assets/master60/ui/`)

- `<page>-<thème>.html` : page finale autonome (DOM figé, CSS compilée en ligne, aucun script), polices et images
  en chemins relatifs (`polices/`, `images/`). Elle s'ouvre hors ligne (file://) ; les entrées en cascade du site se jouent à l'ouverture.
- `accueil-208-anime-<thème>.html` : le vrai champ d'essai de l'accueil, en direct : il clique tout seul sur
  l'exemple de la 208 et joue les étapes de l'analyse puis la fiche.
- `png/<page>-<thème>-<390|1280>.png` : page entière, densité 3.
- `png/elements/…png` : chaque carte seule, fond transparent (les cartes de l'app sont translucides : les poser sur un fond sombre).

Pages : `tableau` (espace /app), `rapport-mercedes` (Bilan du rapport Benef), `offres` (Starter et Pro),
`bouton` (« Essayer 3 jours »), `trois-verdicts` (accueil, carte 208 avec photo), `accueil-208` (fiche d'exemple).
Thèmes : l'espace `/app` est **sombre** (pas de cadre de thème) ; le site public est **clair** par défaut
(`CadreSite`). Chaque page existe dans les deux.

## Comment ça marche

- `scripts/construire.mjs` : copie `web/src/app/globals.css`, la compile avec Tailwind v4 en scannant `web/src`,
  ajoute les `@font-face` (Clash Display, Satoshi de `web/src/app/polices`, Instrument Serif italique de
  @fontsource) et les variables `--font-clash`, `--font-satoshi`, `--font-instrument` de `layout.tsx` ; regroupe
  les composants avec esbuild (`@/` → `web/src`) et les rend avec `react-dom/server`.
- `shims/` : remplaçants de `next/link` (un `<a>`), `next/navigation` (crochets sans effet), `next/image`
  (`<img>`), `server-only` (vide), `@vercel/analytics` (sans mesure), `@/lib/supabase/navigateur` (session vide).
- `src/donnees.ts` : la fausse base (parc, rapports, annonces trouvées). Les chiffres affichés sont calculés par
  le code de l'app (`statsParc`, `margeReelle`, `margePrevue`, `joursStock`, règles de « Votre journée »),
  avec les calculs de `TableauComplet` recopiés dans `src/tableau.tsx`. Modifier ce fichier puis relancer.
- `src/horloge.ts` fige la date ; `src/client/` : scripts navigateur (typographie du site, champ d'essai).
- `scripts/captures.mjs` : Chromium, animations réduites (état final), attente des polices, PNG et copies HTML.
