# utopicar.fr (Next.js)

Tout le site utopicar.fr : présentation, comptes, abonnements, outil d'analyse d'annonces, espace Benef et guides.
Même stack que les autres projets : Next.js 16, React 19, Tailwind 4, TypeScript. Données et comptes : Supabase. Paiements : Stripe. Analyse : API Claude, côté serveur.

Ton : vouvoiement partout, y compris dans les guides.

## Pages

Deux mondes séparés : le **site public** (`src/app/(site)/`, en-tête « Benef · Tarifs » et pied de page) et l'**espace connecté** `/app` (sa propre mise en page : menu latéral sur ordinateur, barre du bas et menu sur téléphone). Une personne connectée qui ouvre `/analyse`, `/guide` ou `/compte` est envoyée dans son espace.

| Route | Rôle |
|---|---|
| `/` | Accueil. Titre « Voyez en 10 secondes si une occasion est… » (animation corrigée), bouton « Estimer une affaire », démo, deux parcours, formules particuliers, FAQ. |
| `/benef` | Présentation de Benef (achat-revente) : peurs et réponses, calculateur de marge, espace Benef, formules, guide, FAQ. |
| `/tarifs` | Toutes les formules : particuliers, Benef, guides. |
| `/analyse` | Outil particulier pour les visiteurs (première analyse offerte, compte demandé pour voir le résultat). |
| `/guide` | Les 4 guides : 2 chapitres offerts, la suite pour les acheteurs du guide et les abonnés Sérénité et Benef. Les anciens liens personnels reçus par email (lecture et désinscription, y compris `/benef/guide`) fonctionnent toujours. |
| `/inscription`, `/connexion` | Comptes : email et mot de passe, lien de connexion, mot de passe oublié. Tout passe par la fonction Supabase `compte` (voir plus bas). |
| `/app` | Espace connecté. Il s'adapte à l'usage : **particulier** (accueil avec le champ « collez le lien », mes analyses, crédits) ou **Benef** (tableau de bord : parc et chiffres clés en haut, marge par voiture, recherche de marché, meilleures affaires et alertes du parc ; puis analyser, rapports, parc, recherche, messages Leboncoin, estimation de cote). Le profil (en bas du menu, formule à côté) mène aux paramètres et aux guides. Favoris : option à activer dans Profil › Accessibilité. Tri rapide, comparateur et alertes séparées sont retirés du menu (code gardé) ; la rentabilité est sur `/benef`. `/benefapp` y redirige. |
| Analyse en arrière-plan | Le bouton « Analyser une annonce » (menu, tableau de bord, à côté de l'étoile des favoris) ouvre une fenêtre : on colle un lien Leboncoin, La Centrale ou AutoScout24, l'analyse tourne pendant qu'on navigue, une notification annonce le rapport (`AnalysesEnFond`). |
| `/app/parc/[id]` | Vue détaillée d'une voiture du parc : photos, chiffres, documents (CT, HistoVec, carte grise, cession…) et rapport complet. « Ajouter au parc » y mène. |
| `/app/recherche` | Arrivée sur l'historique des recherches (avec les photos des annonces) ; « Chercher une annonce » ouvre le formulaire allégé (« Plus de filtres » pour le reste). L'alerte e-mail est un interrupteur sur chaque recherche. |
| `/app/estimation` | Estimation de cote (formules Benef) : critères du véhicule, cote calculée sur la base d'annonces. La cote globale (`/app/cote`, graphique et relevés) et l'extension sont réservées au compte illimité. |
| `/app/messages` | Option « Messages Leboncoin » de Benef Pro (45 €/mois) : premier message automatique aux annonces d'une recherche, boîte de réception. Voir plus bas. |
| `/app/analyser` | L'outil d'analyse (particulier ou Benef selon l'espace). `?lien=` lance l'import du lien Leboncoin dès l'ouverture. |
| `/app/rapports`, `/app/rapports/[id]` | Analyses et rapports enregistrés (`/analyse/[id]` y redirige). |
| `/app/compte` | Profil et paramètres : formule, quota, option Messages, « Utilisation d'Utopicar » (particulier ou Benef), mes guides (selon la formule), accessibilité (favoris), profil, mot de passe, e-mail, suppression du compte. `/compte` y redirige. |
| `/app/admin` | Administration (comptes `profils.admin` seulement) : nouveaux comptes, inscrits au guide, formules et crédits offerts, guides et option Messages offerts, renvoi du guide aux inscrits, journal. |
| `/legal` | Mentions, confidentialité, conditions d'utilisation, conditions de vente, accessibilité, contact. |
| `/methode` | Comment l'analyse est faite : quatre questions, rôle de l'outil et de l'IA, neutralité, limites, mesure de justesse en direct. |
| `/r/[jeton]` | Rapport partagé par lien (bouton Partager du rapport) : lecture seule, sans le vendeur ni le texte brut, sans compte. |

Onboarding : une fenêtre de 3 questions s'ouvre à la première visite de `/`, `/benef` et `/tarifs`, puis recommande un parcours et une formule. Les réponses pré-remplissent l'inscription. Bouton « M'orienter en 3 questions » pour la rouvrir.

## Formules (`src/lib/offres.ts`, seule source de vérité)

| Formule | Prix | Analyses | Ce qu'elle ajoute |
|---|---|---|---|
| Découverte | 0 € | 1 au total | verdict, coût réel, 3 points à vérifier |
| Essentiel | 4,99 €/mois | 10/mois | prix à proposer, questions au vendeur, marché et fiabilité détaillés, 3 photos, historique |
| Sérénité | 9,99 €/mois | 30/mois | négociation, contrôle sur place, y aller seul ou accompagné, 6 photos, guides inclus |
| Benef Starter | 14,99 €/mois | 30/mois | marge, offre, plafond, 20 derniers rapports, tableau de bord, guides |
| Benef Croissance | 29 €/mois | 100/mois | historique complet, comparateur, 6 photos |
| Benef Pro | 79 €/mois | 400/mois | tableau de bord complet, parc, recherche avancée, export CSV |
| Option Messages Leboncoin | 45 €/mois | | en plus de Benef Pro : premier message automatique, boîte de réception |
| Guides | 9 € une fois | | les 4 guides à vie |

Guides ouverts en entier (`guidesOuverts`, `src/lib/guides`) : Sérénité, « Acheter une occasion » ; Starter, « Première revente » ; Croissance et Pro, les trois guides Benef (première revente, tri, reprise). L'achat à 9 € et le compte illimité ouvrent les quatre. Un guide offert depuis l'administration n'ouvre que lui (`achats.produit = guide:<id>`). Les autres : deux chapitres offerts.

Les droits sont appliqués côté serveur : quotas dans `/api/analyse`, parties payantes retirées avant l'envoi au navigateur (`src/lib/analyse/filtre.ts`), parc protégé par une règle RLS (formule Pro). Les rapports Benef s'affichent complets par défaut, avec un bouton « Synthèse » (texte déjà rédigé par l'analyse).

## Changer la formule de quelqu'un (Supabase)

Table Editor › table **`profils`** : chaque compte a une ligne avec son `email`.

- `formule_offerte` : choisir dans la liste (`gratuit`, `essentiel`, `serenite`, `starter`, `croissance`, `pro`). Elle passe **avant** l'abonnement Stripe. Vide = la formule payée sur Stripe (ou Découverte).
- `offerte_jusqu_au` : dernier jour inclus. Vide = sans date de fin.
- `famille` : l'usage de l'espace (`particulier` ou `benef`) quand la personne n'a pas de formule payante.
- `illimite` : coché = tout est ouvert (Benef Pro complet, espace particulier ou Benef au choix), sans limite d'analyses. Pour les administrateurs et les testeurs.

Plus simple : la page **Administration** (`/app/admin`, menu de l'espace) fait tout cela sans passer par Supabase, avec un e-mail facultatif pour prévenir la personne. Elle est réservée aux comptes où `admin` est coché (colonne distincte d'`illimite` : un testeur illimité ne voit pas les comptes des autres). Chaque action est notée dans la table `journal_admin`.

Le changement s'applique à la page suivante. Vue d'ensemble en lecture seule : vue **`comptes_admin`** (email, formule en vigueur, formule offerte, abonnement Stripe, analyses du mois, nombre de rapports). Elle n'est visible que depuis le tableau de bord Supabase.

## Emails de compte

Supabase n'envoie plus aucun email. La fonction **`compte`** (`../supabase/functions/compte`) crée le compte déjà confirmé (connexion immédiate), envoie le lien de connexion et le lien « mot de passe oublié », le tout depuis `contact@utopicar.fr` (Resend) avec des liens vers le site (`/auth/confirm`). Limites : 8 inscriptions par heure et par connexion, 3 liens par email tous les quarts d'heure ; réponses identiques que le compte existe ou non.

## Comment l'analyse est faite

0. **Profil d'analyse** (`profil.ts`, `profils.reglages.analyse`) : 4 questions à la première analyse (objectif, expérience, travaux acceptés, bénéfice et délai de revente ou kilométrage), modifiables dans Profil › Mon profil d'analyse. Il règle les priorités de la note, jamais l'éligibilité d'une voiture. Détail : `../docs/analyse-2027.md`.
1. Règles fixes, sans IA (`src/lib/analyse/`) : lecture de l'annonce, 38 défauts chiffrés, pièces annoncées refaites, réputation des moteurs, boîtes et batteries toutes gammes (`connaissances.ts`), coûts.
2. **Cote du marché par l'outil, sans IA** (`cote.ts`, fonction SQL `cote_marche`) : annonces comparables réellement en ligne (table `marche_annonces`, environ 11 000 annonces Leboncoin relevées : même modèle, ±2 ans, même énergie, kilométrage proche), prix ramenés à l'année et au kilométrage de la voiture. Dès 5 annonces trouvées, cette cote remplace l'estimation de l'IA (fourchette, prix réaliste, revente rapide). Pour l'enrichir : ajouter des relevés dans `marche_annonces`.
3. API Claude côté serveur (`ia.ts`) : version, cote du marché, distance, photos, entretien à prévoir, négociation, contrôle sur place, synthèse.
   Un seul modèle pour toutes les formules : **Claude Haiku 4.5**, le moins cher (environ 0,03 € par analyse, photos comprises). L'IA s'appuie sur les paramètres de l'outil (étape 1) et ne les remplace jamais ; elle complète ce que les règles ne lisent pas (cote du marché, photos, questions et messages à copier). `ANTHROPIC_MODEL` permet d'en changer sans toucher au code. Chaque appel écrit dans les journaux Vercel le modèle et le nombre de jetons, pour suivre le coût réel.
4. **Bilan par l'outil** (`bilan.ts`, `travaux.ts`) : quatre réponses (Fiable ? Des travaux ? Bon prix ? Ça rapporte ou Combien par mois ?), note sur 100 pondérée selon le profil, verdict (Très bonne affaire, Bonne affaire, À négocier, À creuser, À éviter), confiance de l'analyse, questions au vendeur et premier message. Budget travaux sur 12 mois avec probabilités ; bénéfice en trois scénarios de revente ; perte de valeur mesurée sur les annonces du modèle (`projection.ts`). Recalculé dans le navigateur avec le profil courant : changer son profil met à jour tous les rapports.

5. **Après le premier message** (`complements.ts`, `/api/rapports/[id]/complements`) : réponse du vendeur, documents photographiés (lus par l'IA), visite ; le bilan est recalculé. **Vigilance** (`vigilance.ts`) et **historique de l'annonce** (`historique.ts`, fonction SQL `historique_annonce`) en tête du bilan. Banc d'essai : `npm run banc`. Détail : `../docs/analyse-2027.md`.

Une analyse n'est décomptée que si elle aboutit. La copie de l'extension Chrome (texte et photos) est reconnue au collage.

**Messages Leboncoin (option de Benef Pro)** : fonction Supabase `messages`, appelée toutes les minutes par pg_cron. Une campagne = une recherche + un message ; chaque annonce Leboncoin de la dernière actualisation de la recherche reçoit le message une seule fois (table `lbc_envois`, unique par compte et annonce ; la boîte de réception ramène aussi les annonces déjà contactées sur Leboncoin). Une requête Apify (`clearpath/leboncoin-acheteur`) toutes les 2 minutes au plus pour tout le site. Les annonces qui refusent le démarchage sont ignorées par défaut (interrupteur par campagne). Mot de passe Leboncoin chiffré en base (pgcrypto, clé dans Supabase Vault, fonction `lbc_enregistrer`), déchiffré seulement par la fonction d'envoi au moment de l'appel. Réglages (table `reglages`) : `lbc_actif` (oui/non), `lbc_jusqu_au` (arrêt automatique des envois, réglé sur la fin de l'essai gratuit), `lbc_max_usd` (plafond par requête Apify, 1 $ par défaut : le passer à 30 pour laisser l'acteur activer son pass mensuel de 29 $). Option ouverte à la main : table `options_comptes` (`offerte` cochée).

**Import par lien (Leboncoin, La Centrale, AutoScout24)** : on colle le lien de l'annonce, la fonction Supabase `annonce` lance l'acteur Apify
`silentflow~leboncoin-details-scraper-ppr` (jeton `apify_token` de la table `reglages`, jamais côté navigateur), renvoie
l'annonce et jusqu'à 6 photos, puis l'analyse démarre toute seule. Environ une minute, environ 0,001 $ par annonce.
Réservé aux personnes connectées, 30 imports par jour et par personne (table `imports_annonces`).

## Variables d'environnement (Vercel)

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://rvdfifhgosovdapdltps.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | clé publique du projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | clé secrète : enregistrement des abonnements Stripe, portail de paiement, suppression de compte. Les analyses n'en ont plus besoin (fonction SQL `enregistrer_analyse`). |
| `ANTHROPIC_API_KEY` | analyse |
| `ANTHROPIC_WORKSPACE_ID` | seulement si la clé Anthropic n'est rattachée à aucun espace de travail : identifiant `wrkspc_…` (Console Anthropic › Workspaces) |
| `ANTHROPIC_MODEL` | facultatif : `claude-haiku-4-5` par défaut, pour toutes les formules |
| `STRIPE_SECRET_KEY` | paiements |
| `STRIPE_WEBHOOK_SECRET` | signature du webhook |
| `NEXT_PUBLIC_SITE_URL` | `https://utopicar.fr` |
| `UTP_KEY` | protège `/api/probe` (repris de `legacy/api/probe.js`) |
| `UTOPICAR_DEMO` | `1` seulement pour tester sans Supabase : analyses sans compte, rien n'est enregistré |

Sans les variables Supabase, le site s'affiche et les comptes sont fermés (« ouvrent très bientôt »).

## Mise en service, dans l'ordre

1. **Base de données** : fait. `../supabase/migrations/20261003000000_comptes_abonnements.sql` est appliquée au projet Supabase (tables `profils`, `abonnements`, `achats`, `usages`, `rapports`, `parc`, avec RLS).
2. **Supabase Auth** : rien d'obligatoire (les emails passent par la fonction `compte`). Conseillé : Site URL `https://utopicar.fr`.
3. **Stripe** : les produits et les prix se créent tout seuls au premier paiement (par leur « lookup key »). L'abonnement est enregistré au retour du paiement. Conseillé ensuite, dans Stripe : webhook vers `https://utopicar.fr/api/stripe/webhook` (`checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`) ; portail client avec changement de formule et résiliation.
4. **Vercel** : projet `utopicar`, relié à ce dépôt, Root Directory `web` (fait). Ajouter les variables ci-dessus, vérifier la prévisualisation, puis déplacer les domaines `utopicar.fr` et `www.utopicar.fr` depuis le projet `utopicar-garage` (site statique de `sites/utopicar/`). Les liens déjà envoyés par email (`/guide?t=`, `/guide?stop=`, `/benef/guide`) continuent de marcher.
5. **Avant d'encaisser** : compléter dans `/legal` le numéro SIRET et le médiateur de la consommation.
6. **Ancienne fonction Supabase `inscription`** : elle envoie encore le guide gratuitement à toute inscription. Une fois le nouveau site en ligne, couper la création de nouveaux liens (garder `lire` et `stop` pour les liens déjà envoyés).

## Développer

```bash
cd web
npm install
npm run dev     # ou UTOPICAR_DEMO=1 npm run dev pour tester sans Supabase
npm run lint
npm run build
```
