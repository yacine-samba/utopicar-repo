# UTOPICAR

Outil privé d'achat-revente auto.

- `web/` : l'outil d'analyse d'annonce en Next.js (`/app` pour les pros, `/benef` pour les particuliers). Voir `web/README.md`.
- `legacy/` : l'outil complet d'origine (UTOPICAR Garage, artifact claude.ai) et l'inventaire de ses fonctionnalités (`legacy/FONCTIONNALITES.md`), gardés pour les ajouts futurs.
- `api/` : serveur Vercel (lecteur d'annonces, protégé par la variable d'environnement `UTP_KEY`, à définir dans Vercel, jamais dans ce dépôt).
- `extension/` : extension Chrome « UTOPICAR Scanner » (Leboncoin, La Centrale, AutoScout24, LeParking).
- `scanner/` : source de la page du scanner publiée sur Claude.
- `sites/` : sites Utopicar et Première Revente (Vercel), inscriptions stockées dans Supabase, emails par Resend. Voir `sites/README.md`.

Ne jamais mettre de clé ou de mot de passe dans ce dépôt.
