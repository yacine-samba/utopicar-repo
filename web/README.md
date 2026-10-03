# utopicar.fr (Next.js)

Tout le site utopicar.fr : présentation, comptes, abonnements, outil d'analyse d'annonces, espace Benef et guides.
Même stack que les autres projets : Next.js 16, React 19, Tailwind 4, TypeScript. Données et comptes : Supabase. Paiements : Stripe. Analyse : API Claude, côté serveur.

Ton : vouvoiement partout, y compris dans les guides.

## Pages

| Route | Rôle |
|---|---|
| `/` | Accueil. Titre « Voyez en 10 secondes si une occasion est… » (animation corrigée), bouton « Estimer une affaire », démo, deux parcours, formules particuliers, FAQ. |
| `/benef` | Présentation de Benef (achat-revente) : peurs et réponses, calculateur de marge, espace Benef, formules, guide, FAQ. |
| `/tarifs` | Toutes les formules : particuliers, Benef, guides. |
| `/analyse` | Outil particulier : verdict, coût réel d'achat, points à vérifier ; selon la formule : prix à proposer, questions, comment négocier, quoi contrôler sur place, faut-il y aller seul. |
| `/analyse/[id]` | Une analyse enregistrée. |
| `/app` | Espace Benef : tableau de bord, analyser, rapports, comparer, parc, recherche. `/benefapp` y redirige. |
| `/guide` | Les 4 guides : 2 chapitres offerts, la suite pour les acheteurs du guide et les abonnés Sérénité et Benef. Les anciens liens personnels reçus par email (lecture et désinscription) fonctionnent toujours. |
| `/inscription`, `/connexion`, `/compte` | Comptes (email et mot de passe, lien de connexion, mot de passe oublié), formule, quota, abonnement, profil, suppression du compte. |
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

## Comment l'analyse est faite

1. Règles fixes, sans IA (`src/lib/analyse/`) : lecture de l'annonce, 38 défauts chiffrés, moteurs et boîtes à éviter, coûts.
2. API Claude côté serveur (`ia.ts`) : version, cote du marché, distance, photos, entretien à prévoir, négociation, contrôle sur place, synthèse.
3. Calculs d'argent par l'outil (`couts.ts`) : marge, plafond et offre pour Benef ; coût réel pour les particuliers.

Une analyse n'est décomptée que si elle aboutit. La copie de l'extension Chrome (texte et photos) est reconnue au collage.

## Variables d'environnement (Vercel)

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://rvdfifhgosovdapdltps.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | clé publique du projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | clé secrète (quotas, rapports, webhook, suppression de compte) |
| `ANTHROPIC_API_KEY` | analyse |
| `ANTHROPIC_MODEL` | facultatif, `claude-opus-5-5` par défaut |
| `STRIPE_SECRET_KEY` | paiements |
| `STRIPE_WEBHOOK_SECRET` | signature du webhook |
| `NEXT_PUBLIC_SITE_URL` | `https://utopicar.fr` |
| `UTP_KEY` | protège `/api/probe` (repris de l'ancien `api/probe.js`) |
| `UTOPICAR_DEMO` | `1` seulement pour tester sans Supabase : analyses sans compte, rien n'est enregistré |

Sans les variables Supabase, le site s'affiche et les comptes sont fermés (« ouvrent très bientôt »).

## Mise en service, dans l'ordre

1. **Base de données** : appliquer `supabase/migrations/20261003000000_comptes_abonnements.sql` au projet Supabase (tables `profils`, `abonnements`, `achats`, `usages`, `rapports`, `parc`, avec RLS). Elle ne touche à aucune table existante.
2. **Supabase Auth** : Site URL `https://utopicar.fr` ; URL de redirection `https://utopicar.fr/auth/confirm` (plus le domaine de prévisualisation Vercel) ; envoi des emails par SMTP Resend (l'envoi par défaut de Supabase est très limité).
3. **Stripe** : `STRIPE_SECRET_KEY=sk_... node stripe/prix.mjs` crée les produits et les prix. Puis, dans Stripe : webhook vers `https://utopicar.fr/api/stripe/webhook` (`checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`) ; portail client avec changement de formule et résiliation.
4. **Vercel** : projet `utopicar` (déjà relié à ce dépôt) avec **Root Directory = `web`** et les variables ci-dessus. Vérifier la prévisualisation, puis déplacer les domaines `utopicar.fr` et `www.utopicar.fr` depuis le projet `utopicar-garage`.
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
