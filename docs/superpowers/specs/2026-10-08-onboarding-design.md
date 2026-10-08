# Onboarding : montrer d'abord, demander après, sans changer de page

Date : 8 octobre 2026. Branche : `claude/onboarding`. Remplace la version précédente (parcours en questions), jugée désagréable : trop de questions avant d'agir, allure de formulaire, inscription qui coupe l'élan.

## Pourquoi

Aujourd'hui, la fenêtre « Qu'est-ce qui vous amène ? » s'ouvre seule à 1,2 s, pose 2 à 4 questions et se termine par une recommandation. Sur téléphone elle devient l'élément LCP (3,6 s). Celui qui colle une annonce sur `/analyse` est envoyé sur `/inscription` avant de rien voir. Dans l'espace, un nouveau compte tombe sur « Aucun rapport pour le moment ».

Le site possède déjà ce qu'il faut pour faire l'inverse : `/api/analyse/apercu` calcule en 2 s, sans IA et sans rien consommer, la cote, l'écart de prix, la fiabilité du moteur, les défauts lus dans le texte et les papiers mentionnés. Il n'est servi qu'aux comptes, pendant l'attente de l'analyse complète.

Principe : **le visiteur voit un vrai résultat avant toute question et avant toute inscription ; l'inscription se fait dans la même carte, au moment où il veut le rapport complet.**

## Partie 1 : site public

### 1.1 Le hero devient le produit
- Supprimés : `components/site/Onboarding.tsx`, `components/site/BoutonOnboarding.tsx`, l'ouverture automatique, le paramètre `?sans-accueil`, le bouton « M'orienter en 3 questions ». Pas de page `/commencer`.
- Sous le titre et le paragraphe du hero de `/` : un composant client `components/accueil/Essai.tsx` : un champ unique « Collez le lien Leboncoin, La Centrale, AutoScout24, ou le texte de l'annonce » (`<textarea>` d'une ligne qui s'agrandit, label visible), le bouton « Analyser », et dessous « ou essayez : Clio IV · 208 · Yaris » (trois `<button>`). Les trois coches « Première analyse offerte · Sans carte bancaire · Résultat en langage clair » restent sous le champ.
- Le même composant est placé en haut de `/benef` (mode `benef`, texte « Collez une annonce : vous verrez la marge nette avant de vous déplacer »), à la place du lien « Pas sûr de la formule ? Répondez à 3 questions ».
- `/analyse` garde l'outil complet (photos, ville) ; son texte « Un compte gratuit vous sera demandé » est remplacé par « L'aperçu est immédiat et sans compte ; le rapport complet demande un compte gratuit ».

### 1.2 Un vrai résultat en 2 secondes, sans compte
À l'envoi (texte collé, lien, ou exemple), la carte sous le champ s'ouvre et s'anime comme la démo : trois étapes qui se cochent (« Lecture du texte », « Cote sur les annonces comparables », « Contrôles : moteur, défauts, papiers »), puis le résultat arrive ligne par ligne en cascade (80 ms entre chaque), avec un anneau qui se dessine pour l'écart à la cote :

- titre de l'annonce, année, kilométrage, énergie, boîte, ville ;
- **prix face à la cote** : « 7 400 € · 450 € au-dessus de la cote » avec « 174 annonces comparables, moitié entre 6 400 et 7 600 € » ; sans cote : « Modèle rare : la cote se calcule dans le rapport complet » ;
- **moteur** : fiable (vert), à surveiller (orange, avec la raison), ou rien ;
- **défauts repérés dans le texte** : jusqu'à 5 pastilles, les pièges en rouge ;
- **papiers** : contrôle technique, carnet, factures, distribution (ce que `apercu` renvoie déjà).

Les trois exemples affichent, sans requête, le résultat de la démo (`EXEMPLES` de `Demo.tsx`, déplacés dans `lib/demo.ts`), avec la même animation. L'animation respecte `prefers-reduced-motion` et `data-calme` (résultat affiché d'un coup).

Côté serveur :
- `/api/analyse/apercu` accepte les visiteurs : sans compte, limite de 10 appels par heure et par adresse IP (même mécanisme en mémoire que `tropDeDemandes` dans `/api/analyse`, extrait dans `lib/limite.ts` pour être partagé) ; au-delà, `429` et le champ dit « Beaucoup d'essais d'affilée : créez votre compte gratuit pour continuer ».
- Liens d'annonces sans compte : la fonction Supabase `annonce` accepte l'absence de jeton. Sans compte : 3 lectures par jour et par IP (`x-forwarded-for`), plafond global de 200 lectures anonymes par jour ; `imports_annonces.user_id` devient nullable et une colonne `ip text` est ajoutée (migration). Les limites par compte restent inchangées. `429` → même message que ci-dessus ; `402`/`503` → « Collez le texte de l'annonce à la place ».
- Rien n'est enregistré pour un visiteur : pas de rapport, pas de photo stockée, pas de décompte.

### 1.3 L'inscription dans la même carte
Sous le résultat de l'aperçu (pas pour les exemples : là, le bloc dit « Collez la vôtre » et renvoie le focus sur le champ) :

> **Le rapport complet** : coût réel d'achat, prix à proposer, questions au vendeur, lecture des photos, points à contrôler sur place. Première analyse offerte, sans carte bancaire.

puis un formulaire réduit, inline : **e-mail, mot de passe**, case « J'accepte les conditions », bouton « Voir mon rapport », et les boutons Google/Apple s'ils sont actifs. Composant `components/compte/InscriptionInline.tsx`, qui réutilise `fonctionCompte` et `signInWithPassword` de `FormulaireCompte.tsx` (logique sortie dans `lib/compte-client.ts` pour être partagée ; pas de prénom, demandé plus tard dans le profil). Lien « Déjà un compte ? Se connecter » qui bascule le même bloc en connexion.

À la réussite : sans quitter la page, `Essai` appelle `/api/analyse` avec le texte (et le lien, les photos récupérées), affiche la carte « Analyse en cours » (étapes de `Patience.tsx`, aperçu déjà visible dessous), puis ouvre `/app/rapports/{id}` avec `router.push`. Le brouillon est aussi gardé en `sessionStorage` (`utp-brouillon`, format existant) pour les inscriptions Google/Apple, qui quittent la page : `/auth/confirm` revient sur `next=/?reprise=1`, et `Essai` relance l'analyse au chargement s'il trouve le brouillon.

Celui qui ne crée pas de compte garde l'aperçu à l'écran. Un bouton « Nouvelle annonce » vide la carte.

### 1.4 Une question, après, facultative
Au-dessus du bloc d'inscription : « Vous achetez pour vous, ou pour revendre ? » avec deux pastilles `J'achète pour moi` / `Je revends`. Sans réponse : rien ne change. Avec `Je revends` : le texte du bloc devient « **Le rapport complet**, et votre espace s'ouvre en Benef : marge nette après frais, prix d'offre et plafond dès la formule Starter (14,99 € par mois). Première analyse offerte. » Le bouton reste « Voir mon rapport » et l'analyse part en mode `particulier` : la première analyse offerte est une analyse particulier, la formule Benef se choisit dans l'espace. Le choix est écrit dans `localStorage.utp-profil` au format actuel (`{ but: "achat" | "pro", famille: "particulier" | "benef" }`) et envoyé à l'inscription (`onboarding`, déjà transmis par `fonctionCompte`). Sur `/benef`, la pastille « Je revends » est présélectionnée.

Inscription Google/Apple : `components/espace/ProfilDepuisNavigateur.tsx` (client, monté dans `app/app/layout.tsx`) lit `utp-profil` au premier rendu de l'espace ; s'il existe, `POST /api/profil { onboarding }` puis supprime la clé. La route ne remplit `profils.onboarding` et `profils.famille` que s'ils sont vides.

### 1.5 Mesure
`track()` de `@vercel/analytics` : `apercu_vu { source: "texte" | "lien" | "exemple", cote: boolean }`, `apercu_limite`, `pastille_famille { famille }`, `inscription_inline_ok { fournisseur: "email" | "google" | "apple" }`, `rapport_ouvert { depuis: "hero" | "benef" | "analyse" }`.

## Partie 2 : espace connecté

### 2.1 Carte « Premiers pas »
Composant serveur `components/espace/PremiersPas.tsx`, rendu sous le « Bonjour » des trois tableaux de bord de `app/app/page.tsx`. Reçoit `etapes: { l: string; fait: boolean; href: string; bouton: string }[]`.

| Profil | 1 | 2 | 3 |
|---|---|---|---|
| Particulier | Analyser une annonce — `rapports` mode particulier ≥ 1 — `/app/analyser` | Garder une annonce en favori — `favoris` ≥ 1 — `/app/favoris` | Choisir la suite — formule payante ou `credits > 0` — `/app/compte#formule` |
| Benef avec formule, Pro | Chiffrer une annonce — `rapports` mode benef ≥ 1 — `/app/analyser` | Lancer une recherche — `recherches` ≥ 1 — `/app/recherche` | Ajouter une voiture au parc — `parc` ≥ 1 — `/app/parc` |
| Benef avec formule, Starter ou Croissance | idem | idem | Lire le guide de la première revente — `reglages.guide_ouvert` — `/app/guides` |
| Benef sans formule | Choisir sa formule — formule payante — `/app/compte#formule` | Chiffrer une annonce — idem | Lancer une recherche — idem |

Comptages par `count: "exact", head: true` ajoutés au `Promise.all` de chaque tableau. `/app/guides` pose `reglages.guide_ouvert = true` à l'ouverture.

Affichage : anneau SVG (0/3 à 3/3, `stroke-dashoffset`, même dessin que la démo), trois étapes en liste ; étape faite barrée avec coche verte ; étape suivante avec `btn btn-o btn-sm` ; les autres avec `btn btn-sm`. À 3/3 : « Vous êtes lancé » et un bouton « Masquer ». « Masquer » aussi disponible dès le début, en texte discret.

Visibilité : affichée si `reglages.premiers_pas` n'est ni `"fini"` ni `"masque"`. À 3/3 au rendu serveur, la page pose `"fini"` après ce rendu (la carte se voit une dernière fois). « Masquer » : `PATCH /api/profil { premiers_pas: "masque" }` depuis `components/espace/BoutonMasquerPremiersPas.tsx` (client), puis `router.refresh()`.

### 2.2 Texte d'accueil
La fonction `Bonjour` de `app/app/page.tsx` reçoit une phrase de `lib/orientation.ts : phraseAccueil(onboarding, famille)` : `achat` → « Collez la prochaine annonce qui vous plaît : vous verrez tout de suite ce qu'il faut regarder. » ; `pro` ou famille `benef` → « Chiffrez chaque annonce avant de vous déplacer : marge nette, prix d'offre, plafond. » ; profil vide → phrase actuelle du tableau.

### 2.3 Route `/api/profil`
- `POST { onboarding }` : compte obligatoire ; objet plat de chaînes (clés `but`, `famille`, 40 caractères max) ; écrit `profils.onboarding` et `profils.famille` seulement si vides ; répond `{ ok, ecrit }`.
- `PATCH { premiers_pas: "masque" | "fini" }` : fusionne dans `profils.reglages`.
- Erreurs en JSON `4xx/5xx`, jamais bloquantes côté page.

## Fichiers
- Nouveaux : `components/accueil/Essai.tsx` (client : champ, exemples, carte animée, aperçu, pastilles, bloc d'inscription, relance), `components/accueil/CarteApercu.tsx` (rendu animé d'un `Apercu` ou d'un exemple), `components/compte/InscriptionInline.tsx`, `lib/compte-client.ts`, `lib/demo.ts`, `lib/limite.ts`, `lib/orientation.ts`, `components/espace/PremiersPas.tsx`, `components/espace/BoutonMasquerPremiersPas.tsx`, `components/espace/ProfilDepuisNavigateur.tsx`, `app/api/profil/route.ts`, migration `supabase/migrations/20261008130000_imports_anonymes.sql`.
- Modifiés : `app/(site)/page.tsx` (hero), `app/(site)/benef/page.tsx` (hero), `app/(site)/analyse/page.tsx` (texte), `app/(site)/layout.tsx` (retrait de `<Onboarding />`), `app/api/analyse/apercu/route.ts` (visiteurs + limite), `app/api/analyse/route.ts` (limite partagée), `supabase/functions/annonce/index.ts` (visiteurs + limites), `components/accueil/Demo.tsx` (importe `lib/demo.ts`), `components/analyse/Patience.tsx` (exporte le bloc d'étapes), `components/compte/FormulaireCompte.tsx` (utilise `lib/compte-client.ts`), `app/auth/confirm/route.ts` (accepte `next=/?reprise=1`), `app/app/page.tsx`, `app/app/layout.tsx`, `app/app/guides/page.tsx`.
- Supprimés : `components/site/Onboarding.tsx`, `components/site/BoutonOnboarding.tsx`.

## Erreurs et cas limites
- Texte collé trop court (< 30 caractères) : message sous le champ, pas de requête.
- Lien non reconnu : « Ce lien n'est pas une annonce Leboncoin, La Centrale ou AutoScout24 : collez le texte de la page. »
- `apercu` sans cote (modèle rare) : la ligne cote dit que la cote se calcule dans le rapport complet ; le reste s'affiche.
- Limite par IP atteinte : message dans la carte avec le bloc d'inscription visible.
- Inscription inline qui échoue (e-mail déjà utilisé) : message sous le champ et lien « Se connecter » qui bascule le bloc, l'aperçu reste.
- Compte créé mais `/api/analyse` en erreur (IA indisponible, quota) : le message de l'API s'affiche dans la carte, avec « Ouvrir mon espace ».
- JavaScript absent : le champ est un `<form method="get" action="/analyse">` dont le champ s'appelle `lien` ; un lien collé arrive dans `OutilAnalyse` par `lienInitial` (existant), un texte collé mène simplement à `/analyse` où l'outil complet l'attend.

## Tests avant livraison
- `tsc --noEmit`, `eslint`, `npm run build`.
- axe-core (`wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`, `best-practice`) sur `/` et `/benef`, à 375 et 1280 px, carte ouverte : zéro violation. Reflow à 320 px.
- Clavier : Tab atteint le champ, Entrée lance, les exemples et les pastilles sont des boutons, le focus va sur le titre de la carte quand elle s'ouvre, le bloc d'inscription est un formulaire avec labels.
- Mouvement réduit : résultat affiché d'un coup, aucun anneau animé.
- Sur `localhost` avec des valeurs de test : texte collé → aperçu en moins de 3 s sans session ; exemple → résultat immédiat ; inscription inline → analyse → rapport ouvert ; `profils.onboarding` rempli ; tableau de bord avec carte 1/3 → 2/3 après un favori ; « Masquer » ; 11e appel d'aperçu dans l'heure → message de limite.
- Événements visibles dans la console en développement.

## Hors périmètre
Bascule mensuel/annuel, témoignages, pages modèles : dans `docs/revue-site-2027.md`.
