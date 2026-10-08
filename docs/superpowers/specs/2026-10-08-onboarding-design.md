# Onboarding : du hero au premier rapport

Date : 8 octobre 2026. Branche : `claude/onboarding`.

## Pourquoi

La fenêtre « Qu'est-ce qui vous amène ? » s'ouvre seule à 1,2 s sur `/`, `/benef` et `/tarifs` à la première visite. Mesuré le 8 octobre : sur téléphone elle devient l'élément LCP (3,6 s au lieu du titre), elle masque la promesse avant qu'elle soit lue, et elle se termine par une « recommandation » au lieu d'une action. Les réponses ne sont gardées qu'à l'inscription par e-mail (pas Google/Apple). Dans l'espace, un nouveau compte tombe sur « Aucun rapport pour le moment ».

But : un seul parcours, du bouton du hero jusqu'au premier rapport ouvert, puis trois premiers pas guidés dans l'espace. Succès mesuré par des événements, pas par une case cochée.

## Partie 1 : site public

### Entrée
- `Onboarding.tsx` (la `<dialog>`), `BoutonOnboarding.tsx`, l'ouverture automatique et le paramètre `?sans-accueil` sont supprimés.
- Le bouton secondaire du hero de `/` devient un lien « Par où commencer ? » vers `/commencer`. Le lien « Pas sûr de la formule ? Répondez à 3 questions » de `/benef` devient « Pas sûr de la formule ? Par où commencer ? » vers `/commencer?benef` : la page ouvre sur Q1 avec les deux choix Benef (« se lancer », « déjà pro ») placés en premier ; rien n'est pré-répondu.
- `/commencer` est une page publique indexable : `title` « Par où commencer avec Utopicar », description, canonique, dans le sitemap.

### Questions
Q1 « Qu'est-ce qui vous amène ? » : `achat` J'achète une voiture pour moi · `lancer` Je veux me lancer dans l'achat-revente · `pro` Je fais déjà de l'achat-revente · `curieux` Je découvre.

Q2 selon Q1 :
- `achat` → « Où en êtes-vous ? » : `annonce` J'ai une annonce en vue · `compare` J'hésite entre plusieurs annonces · `debut` Je commence à chercher.
- `lancer` → « Quel budget de départ ? » : `2` moins de 2 000 € · `5` 2 000 à 5 000 € · `10` 5 000 à 10 000 € · `plus` plus de 10 000 €.
- `pro` → « Combien de voitures passent par vous chaque mois ? » : `3` une à trois · `10` quatre à dix · `plus` plus de dix.
- `curieux` → pas de Q2.

Les questions « Vous vous y connaissez ? », « Quel est votre budget ? » (achat), « Combien de voitures par mois visez-vous ? » (lancer) et « Qu'est-ce qui vous ferait gagner le plus de temps ? » (pro) sont retirées.

Chaque question est un groupe de boutons (`<button>` pleine largeur, comme aujourd'hui), avec « ← Question précédente ». Le titre de l'étape reçoit le focus à chaque changement (comportement actuel conservé). Compteur « Question 1 sur 2 » en `aria-live="polite"`.

### Écran final (étape 3) : une action
- `achat` + `annonce` : titre « Collez votre annonce », puis le composant `Saisie` en mode `particulier`, `retour="/commencer"`, `maxPhotos` de la formule Découverte, sans la ville (nouvelle prop `sansVille` de `Saisie` : champ non rendu, valeur vide ; le trajet n'est pas calculé pour la première analyse). À l'envoi sans compte, `Saisie` garde le brouillon et envoie vers `/inscription?next=/commencer` (comportement existant) ; au retour, l'analyse se lance seule et ouvre `/app/rapports/{id}` (comportement existant de `OutilAnalyse`, repris tel quel : `/commencer` rend `OutilAnalyse` avec son propre en-tête).
- `achat` + `compare` ou `debut`, et `curieux` : titre « Essayez sur un vrai exemple », trois cartes (Clio IV, 208, Yaris : photo, titre, prix, verdict coloré) tirées de `EXEMPLES`. Un clic affiche le résultat de la démo dans la page (le panneau de résultat de `Demo.tsx`, sans l'animation d'étapes : résultat direct), puis sous le résultat : « Puis la vôtre » avec le même `Saisie` que ci-dessus.
- `lancer` et `pro` : titre « La formule qui vous correspond », une carte avec la formule conseillée (règle actuelle : `lancer` → Starter si budget `2` ou `5`, sinon Croissance ; `pro` → Pro si `10` ou `plus`, sinon Croissance), prix, trois points de la formule (`OFFRES[x].points.slice(0, 3)`), et deux boutons : « Commencer avec {nom} » → `/inscription?offre={id}&next=/app` ; « D'abord analyser une annonce gratuitement » → affiche le `Saisie` particulier dans la page (même bloc que `annonce`).

Pas d'écran « Notre conseil », pas de liste de conseils, pas de barre de progression.

### Profil
- À chaque réponse, `localStorage.utp-profil` = `{ but, ou?, budget?, volume?, famille }` avec `famille` = `particulier` pour `achat`, `benef` pour `lancer` et `pro`, `null` pour `curieux` (format actuel, lu par `FormulaireCompte`).
- Inscription Google/Apple : `ProfilDepuisNavigateur.tsx` (client, monté dans `app/app/layout.tsx`) lit `utp-profil` au premier rendu ; s'il existe, `POST /api/profil { onboarding }` puis supprime la clé. La route ne remplit `profils.onboarding` et `profils.famille` que s'ils sont vides (`{}` ou `null`).

### Mesure
`track()` de `@vercel/analytics` : `commencer_vu`, `commencer_reponse { question, valeur }`, `commencer_action { type: "coller" | "exemple" | "formule", valeur }`, `inscription_ok { source }` où `source` = `commencer` si le `next` contient `/commencer`, sinon `analyse`, `tarifs` ou `autre` (dans `FormulaireCompte` après succès et dans `/auth/confirm` pour Google/Apple).

## Partie 2 : espace connecté

### Carte « Premiers pas »
Composant serveur `components/espace/PremiersPas.tsx`, rendu en haut des trois tableaux de bord de `app/app/page.tsx` (particulier, Benef avec formule, Benef sans formule), sous le « Bonjour ». Reçoit `etapes: { l: string; fait: boolean; href: string; bouton: string }[]` et `etat: "en cours" | "fini"`.

Étapes par profil (`familleEspace(c)` et `c.offre`) :

| Profil | 1 | 2 | 3 |
|---|---|---|---|
| Particulier | Analyser une annonce — `rapports` mode particulier ≥ 1 — `/app/analyser` | Garder une annonce en favori — `favoris` ≥ 1 — `/app/favoris` | Choisir la suite — formule payante, ou `credits > 0` — `/app/compte#formule` |
| Benef avec formule, Pro | Chiffrer une annonce — `rapports` mode benef ≥ 1 — `/app/analyser` | Lancer une recherche — `recherches` ≥ 1 — `/app/recherche` | Ajouter une voiture au parc — `parc` ≥ 1 — `/app/parc` |
| Benef avec formule, Starter ou Croissance | idem | idem | Lire le guide de la première revente — `reglages.guide_ouvert` vrai — `/app/guides` |
| Benef sans formule | Choisir sa formule — formule payante — `/app/compte#formule` | Chiffrer une annonce — idem | Lancer une recherche — idem |

Les comptages viennent de requêtes `count: "exact", head: true` ajoutées au `Promise.all` déjà présent dans chaque tableau. `reglages.guide_ouvert` est posé à `true` par la page `/app/guides` à l'ouverture (une ligne).

Affichage : anneau SVG de progression (0/3 à 3/3, `stroke-dashoffset`, même dessin que la démo), les trois étapes en liste, l'étape faite barrée avec une coche verte, l'étape suivante avec son bouton `btn btn-o btn-sm`, les suivantes avec un bouton `btn btn-sm`. À 3/3 : titre « Vous êtes lancé », un bouton « Masquer ». Bouton « Masquer » aussi disponible dès le début, en texte discret.

Visibilité : la carte s'affiche si `reglages.premiers_pas` n'est ni `"fini"` ni `"masque"`. À 3/3 au rendu serveur, la page pose `premiers_pas = "fini"` après ce rendu (la carte « Vous êtes lancé » se voit une fois). « Masquer » : `PATCH /api/profil { premiers_pas: "masque" }` depuis un petit composant client, puis `router.refresh()`.

### Texte d'accueil
La fonction `Bonjour` de `app/app/page.tsx` reçoit une phrase calculée par `lib/orientation.ts : phraseAccueil(onboarding, famille)` :
- `achat/annonce` : « Vous aviez une annonce en vue : analysez-la quand vous voulez. »
- `achat/compare` : « Vous hésitez entre plusieurs annonces : analysez-les, le comparatif se fait tout seul dans vos rapports. »
- `achat/debut` ou `curieux` : « Collez la première annonce qui vous plaît : vous verrez tout de suite ce qu'il faut regarder. »
- `lancer` : « Vous voulez vous lancer avec {budget} : commencez par chiffrer une annonce. »
- `pro` : « {volume} voitures par mois : chiffrez chaque annonce avant de vous déplacer. »
- profil vide : phrase actuelle du tableau.

### Route `/api/profil`
- `POST { onboarding }` : compte connecté obligatoire ; valide un objet plat de chaînes (clés `but`, `ou`, `budget`, `volume`, `famille`, 40 caractères max chacune) ; écrit `profils.onboarding` et `profils.famille` seulement si vides ; répond `{ ok, ecrit: boolean }`.
- `PATCH { premiers_pas: "masque" | "fini" }` : fusionne dans `profils.reglages`.
- Toute erreur : `4xx/5xx` JSON, jamais bloquant côté page (appels en `catch` silencieux).

## Fichiers
- Nouveaux : `app/(site)/commencer/page.tsx`, `components/commencer/Parcours.tsx` (client), `components/commencer/Exemples.tsx`, `lib/orientation.ts` (questions, `recommander`, `phraseAccueil`), `lib/demo.ts` (`EXEMPLES` sortis de `Demo.tsx`), `components/espace/PremiersPas.tsx`, `components/espace/BoutonMasquerPremiersPas.tsx` (client), `components/espace/ProfilDepuisNavigateur.tsx` (client), `app/api/profil/route.ts`.
- Modifiés : `app/(site)/page.tsx` et `benef/page.tsx` (liens), `app/(site)/layout.tsx` (retrait de `<Onboarding />`), `components/accueil/Demo.tsx` (importe `lib/demo.ts`, expose le panneau de résultat), `app/app/page.tsx` (comptages + carte + phrase), `app/app/layout.tsx` (`ProfilDepuisNavigateur`), `app/app/guides/page.tsx` (`guide_ouvert`), `components/Saisie.tsx` (prop `sansVille`), `components/compte/FormulaireCompte.tsx` (événement `inscription_ok`), `app/auth/confirm/route.ts` (idem, via un paramètre `src=` ajouté au `next` et lu par `ProfilDepuisNavigateur` qui envoie l'événement côté client), `app/sitemap.ts`.
- Supprimés : `components/site/Onboarding.tsx`, `components/site/BoutonOnboarding.tsx`.

## Erreurs et cas limites
- Brouillon collé puis inscription abandonnée : reste en `sessionStorage` pour la session (existant).
- `/api/profil` en échec : silencieux ; la carte Premiers pas ne dépend que des comptages.
- Compte illimité ou admin : carte affichée comme Benef Pro ; « Masquer » marche pareil.
- JavaScript absent sur `/commencer` : les questions sont rendues côté serveur avec la première question ; sans JS, un lien « Analyser directement une annonce » vers `/analyse` reste visible sous les choix.

## Tests avant livraison
- `tsc --noEmit`, `eslint`, `npm run build`.
- axe-core (`wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`, `best-practice`) sur `/commencer` à 375 et 1280 px : zéro violation. Reflow à 320 px sans débordement.
- Clavier : Tab atteint chaque choix, Entrée répond, focus sur le titre de la question suivante, « Question précédente » accessible.
- Sur `localhost` avec un compte de test : coller une annonce sur `/commencer` → inscription → rapport ouvert sans action ; tableau de bord : carte 1/3 → 2/3 après un favori → « Masquer » la retire et `reglages.premiers_pas = "masque"` ; inscription via le brouillon pose `profils.onboarding`.
- Événements visibles dans la console en développement (`debug` de `@vercel/analytics`).

## Hors périmètre
Résultat partiel avant inscription, bascule mensuel/annuel, témoignages, refonte des tarifs : traités dans la revue du site (`docs/revue-site-2027.md`), pas ici.
