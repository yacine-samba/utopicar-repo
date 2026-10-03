# UTOPICAR

Outil privé d'achat-revente auto.

- `web/` : tout le site utopicar.fr en Next.js : présentation, comptes, abonnements, outil d'analyse (`/analyse`), espace Benef (`/app`), guides. Voir `web/README.md`.
- `legacy/` : l'outil complet d'origine (UTOPICAR Garage, artifact claude.ai) et l'inventaire de ses fonctionnalités (`legacy/FONCTIONNALITES.md`), gardés pour les ajouts futurs.
- `api/` : ancien test de lecture des annonces (protégé par `UTP_KEY`), repris dans `web/` sous `/api/probe`.
- `extension/` : extension Chrome « UTOPICAR Scanner » (Leboncoin, La Centrale, AutoScout24, LeParking). Elle copie l'annonce et ses photos ; on colle dans Utopicar.
- `scanner/` : ancienne page du scanner publiée sur Claude (remplacée par `web/`).
=======
- `api/` : serveur Vercel (lecteur d'annonces, protégé par la variable d'environnement `UTP_KEY`, à définir dans Vercel, jamais dans ce dépôt).
- `extension/` : extension Chrome « UTOPICAR Scanner » (Leboncoin, La Centrale, AutoScout24, LeParking).
- `scanner/` : source de la page du scanner publiée sur Claude.
- `sites/` : sites Utopicar et Première Revente (Vercel), inscriptions stockées dans Supabase, emails par Resend. Voir `sites/README.md`.

Ne jamais mettre de clé ou de mot de passe dans ce dépôt.
