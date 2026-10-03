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
| `/app` | Espace connecté. Il s'adapte à l'usage : **particulier** (accueil avec le champ « collez le lien », mes analyses, guides, compte) ou **Benef** (tableau de bord, analyser, rapports, parc, rentabilité, comparer, recherche, guides, compte ; les modules hors formule affichent un cadenas). `/benefapp` y redirige. |
| `/app/analyser` | L'outil d'analyse (particulier ou Benef selon l'espace). `?lien=` lance l'import du lien Leboncoin dès l'ouverture. |
| `/app/rapports`, `/app/rapports/[id]` | Analyses et rapports enregistrés (`/analyse/[id]` y redirige). |
| `/app/compte` | Formule, quota, changement de formule, usage (particulier ou Benef), profil, mot de passe, suppression du compte. `/compte` y redirige. |
| `/legal` | Mentions, confidentialité, conditions d'utilisation, conditions de vente, accessibilité, contact. |

Onboarding : une fenêtre de 3 questions s'ouvre à la première visite de `/`, `/benef` et `/tarifs`, puis recommande un parcours et une formule. Les réponses pré-remplissent l'inscription. Bouton « M'orienter en 3 questions » pour la rouvrir.

## Formules (`src/lib/offres.ts`, seule source de vérité)

| Formule | Prix | Analyses | Ce qu'elle ajoute |
|---|---|---|---|
| Découverte | 0 € | 1 au total | verdict, coût réel, 3 points à vérifier |
| Essentiel | 4,99 €/mois | 10/mois | prix à proposer, questions au vendeur, marché et fiabilité détaillés, 3 photos, historique |
| Sérénité | 9,99 €/mois | 30/mois | négociation, contrôle sur place, y aller seul ou accompagné, 6 photos, guides inclus |
| Benef Starter | 14,99 €/mois | 30/mois | marge, offre, plafond, 20 derniers rapports, tableau de bord, guides |
| Benef Croissance | 29 €/mois | 100/mois | historique complet, comparateur, 6 photos |
| Benef Pro | 59 €/mois | 400/mois | tableau de bord complet, parc, recherche avancée, export CSV |
| Guides | 9 € une fois | | les 4 guides à vie |

Les droits sont appliqués côté serveur : quotas dans `/api/analyse`, parties payantes retirées avant l'envoi au navigateur (`src/lib/analyse/filtre.ts`), parc protégé par une règle RLS (formule Pro). Les rapports Benef s'affichent complets par défaut, avec un bouton « Synthèse » (texte déjà rédigé par l'analyse).

## Changer la formule de quelqu'un (Supabase)

Table Editor › table **`profils`** : chaque compte a une ligne avec son `email`.

- `formule_offerte` : choisir dans la liste (`gratuit`, `essentiel`, `serenite`, `starter`, `croissance`, `pro`). Elle passe **avant** l'abonnement Stripe. Vide = la formule payée sur Stripe (ou Découverte).
- `offerte_jusqu_au` : dernier jour inclus. Vide = sans date de fin.
- `famille` : l'usage de l'espace (`particulier` ou `benef`) quand la personne n'a pas de formule payante.
- `illimite` : coché = tout est ouvert (Benef Pro complet, espace particulier ou Benef au choix), sans limite d'analyses. Pour les administrateurs et les testeurs.

Le changement s'applique à la page suivante. Vue d'ensemble en lecture seule : vue **`comptes_admin`** (email, formule en vigueur, formule offerte, abonnement Stripe, analyses du mois, nombre de rapports). Elle n'est visible que depuis le tableau de bord Supabase.

## Emails de compte

Supabase n'envoie plus aucun email. La fonction **`compte`** (`../supabase/functions/compte`) crée le compte déjà confirmé (connexion immédiate), envoie le lien de connexion et le lien « mot de passe oublié », le tout depuis `contact@utopicar.fr` (Resend) avec des liens vers le site (`/auth/confirm`). Limites : 8 inscriptions par heure et par connexion, 3 liens par email tous les quarts d'heure ; réponses identiques que le compte existe ou non.

## Comment l'analyse est faite

1. Règles fixes, sans IA (`src/lib/analyse/`) : lecture de l'annonce, 38 défauts chiffrés, moteurs et boîtes à éviter, coûts.
2. API Claude côté serveur (`ia.ts`) : version, cote du marché, distance, photos, entretien à prévoir, négociation, contrôle sur place, synthèse.
   Le modèle dépend de la formule (`MODELES` dans `ia.ts`) :

   | Formules | Modèle | Coût indicatif par analyse |
   |---|---|---|
   | Découverte, Essentiel | Claude Haiku 4.5 (le moins cher) | environ 0,03 € |
   | Sérénité, Benef Starter | Claude Sonnet 5.5, effort bas | environ 0,05 € |
   | Benef Croissance, Benef Pro, comptes illimités | Claude Sonnet 5.5, effort moyen | environ 0,08 € |

   Pour changer de modèle sans toucher au code : `ANTHROPIC_MODEL_ECO` (formules d'entrée) et `ANTHROPIC_MODEL_PRECIS` (les autres). Chaque appel écrit dans les journaux Vercel le modèle et le nombre de jetons, pour suivre le coût réel.
3. Calculs d'argent par l'outil (`couts.ts`) : marge, plafond et offre pour Benef ; coût réel pour les particuliers.

Une analyse n'est décomptée que si elle aboutit. La copie de l'extension Chrome (texte et photos) est reconnue au collage.

**Import par lien (Leboncoin)** : on colle le lien de l'annonce, la fonction Supabase `annonce` lance l'acteur Apify
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
| `ANTHROPIC_MODEL_ECO`, `ANTHROPIC_MODEL_PRECIS` | facultatifs : remplacent les modèles par défaut (voir « Comment l'analyse est faite ») |
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
