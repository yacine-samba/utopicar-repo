# UTOPICAR

Analyse d'annonces de voitures d'occasion, pour acheter (Utopicar) ou faire de l'achat-revente (Benef).
Une seule source pour tout : ce dépôt.

| Dossier | Contenu | Où ça tourne |
|---|---|---|
| `web/` | Le site complet en Next.js : pages d'accueil Utopicar (`/`) et Benef (`/benef`), tarifs, comptes, abonnements, outil d'analyse, espace connecté (`/app`, particulier ou Benef), guides. Voir `web/README.md`. | Projet Vercel `utopicar` (Root Directory `web`), déployé à chaque push |
| `sites/utopicar/` | Le site statique actuellement en ligne sur utopicar.fr (accueil, `/benef`, guide, mentions légales). Remplacé par `web/` dès que le domaine bascule. Voir `sites/README.md`. | Projet Vercel `utopicar-garage`, déployé à la main |
| `supabase/` | Base et fonctions du projet Supabase `rvdfifhgosovdapdltps` : migrations SQL (inscrits, contact, comptes, abonnements, rapports, parc) et fonctions `compte` (inscription, lien de connexion, mot de passe oublié, emails depuis utopicar.fr), `annonce` (import d'une annonce Leboncoin par son lien, via Apify), `inscription` et `contact`. Formules modifiables à la main : table `profils`, colonne `formule_offerte` (voir `web/README.md`). Toutes sont déployées ; seule la limite de 10 minutes ajoutée à `inscription` reste à déployer (`supabase functions deploy inscription --no-verify-jwt`). | Supabase |
| `extension/` | Extension Chrome « UTOPICAR Scanner » (Leboncoin, La Centrale, AutoScout24, LeParking). Elle copie l'annonce et ses photos ; on colle dans Utopicar. | Chrome |
| `legacy/` | Ce qui a été remplacé, gardé pour mémoire : l'outil d'origine UTOPICAR Garage et l'inventaire de ses fonctionnalités (`legacy/FONCTIONNALITES.md`), l'ancien test `api/probe.js` (repris dans `web/` sous `/api/probe`), l'ancienne page du scanner. | Nulle part |
| `utopicar-logo/` | Logo, icônes, favicons, visuels réseaux sociaux et impression. | — |
| `video/` | Vidéos et studio de motion design. | — |

L'ancien projet Vercel `premiere-revente` redirige déjà vers utopicar.fr/benef.

Ne jamais mettre de clé ou de mot de passe dans ce dépôt.
