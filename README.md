# UTOPICAR

Outil privé d'achat-revente auto (usage personnel).

- `api/` : serveur Vercel (lecteur d'annonces, protégé par la variable d'environnement `UTP_KEY`, à définir dans Vercel, jamais dans ce dépôt).
- `extension/` : extension Chrome « UTOPICAR Scanner » (Leboncoin, La Centrale, AutoScout24, LeParking).
- `scanner/` : source de la page du scanner publiée sur Claude.
- `sites/` : sites Utopicar et Première Revente (Vercel), inscriptions stockées dans Supabase, emails par Resend. Voir `sites/README.md`.

Dépôt privé. Ne jamais y mettre de clé ou de mot de passe.
