# Site statique utopicar.fr, inscriptions et emails

`sites/utopicar/` contient exactement ce qui est en ligne sur utopicar.fr (projet Vercel `utopicar-garage`) :
l'accueil Utopicar, la page Bénef (`/benef`), le guide reçu par email (`/guide`, `/benef/guide`) et les mentions légales.
Backend : Supabase (fonctions et migrations dans `supabase/` à la racine du dépôt) ; envoi des emails par Resend.

Ce site sera remplacé par le site Next.js de `web/` (mêmes pages, plus les comptes et l'outil d'analyse) quand le domaine
utopicar.fr passera du projet `utopicar-garage` au projet `utopicar`. Les liens déjà envoyés par email (`/guide?t=…`,
`/guide?stop=…`, `/benef/guide?…`) restent valables après la bascule : `web/` les reprend.

| Dossier | Rôle |
|---|---|
| `sites/utopicar/` | Pages en ligne sur utopicar.fr (`vercel.json` : adresses propres, en-têtes, `/benef/guide` → `/guide`) |
| `supabase/functions/` | Fonctions `inscription` et `contact` (identiques aux versions déployées) |
| `supabase/migrations/` | Tables `landing_leads`, `contact_messages`, envois automatiques, purge ; puis comptes et abonnements du site Next |
| `utopicar-logo/07-sites/` | Logo vectorisé et icônes utilisés par les sites |

Équipe Vercel : `yacinesambas-projects`. L'ancien projet `premiere-revente` redirige vers utopicar.fr/benef.

## Parcours d'un inscrit

1. Le formulaire du site (`c.js`) envoie prénom, email, profil, objectif et budget à la fonction `inscription`.
2. La fonction enregistre l'inscrit dans `landing_leads` (Supabase), crée un jeton personnel (stocké haché, valable 30 jours) et envoie par Resend l'email avec le lien `/guide?t=…`.
3. Tu reçois une notification « Nouvel inscrit » sur l'adresse `email_notif`.
4. L'inscrit ouvre le lien, `guide.html` appelle la fonction (`action: "lire"`) et affiche le guide adapté à son objectif. Le guide n'est jamais renvoyé au moment de l'inscription.
5. Le cron `leads-envois-relances` (à :07 et :37 chaque heure) renvoie les guides pas encore partis (pendant 7 jours) et relance une fois à J+2 ceux qui n'ont pas ouvert le guide.
6. Chaque email contient un lien « Ne plus recevoir de messages » (et l'en-tête `List-Unsubscribe`) qui passe `desinscrit` à vrai.
7. Le formulaire de contact des mentions légales passe par la fonction `contact` : message stocké dans `contact_messages` et transféré sur `email_notif`, avec l'email de la personne en adresse de réponse.

## Données enregistrées (Supabase)

- `landing_leads` : un inscrit par email (prénom, profil, objectif, budget, site, source, suivi d'envoi et d'ouverture, désinscription, intérêt pour l'ebook).
- `contact_messages` : messages du formulaire de contact.
- `reglages` : configuration lue par les fonctions (table partagée avec la veille Leboncoin).

Aucun accès direct depuis le navigateur (RLS actif, droits `anon` retirés) : tout passe par les fonctions avec la clé service.
Purge automatique chaque nuit (`purge-donnees-prospects`) : inscrits après 3 ans sans contact, messages après 1 an, jetons expirés.

Voir les inscrits : Supabase > Table Editor > `landing_leads`, ou en SQL :

```sql
select created_at, site, prenom, email, objectif, budget, email_envoye, email_confirme, interet_ebook, desinscrit
from landing_leads order by created_at desc;
```

### Clés de `reglages` utilisées

| Clé | Rôle |
|---|---|
| `resend_key` | Clé API Resend (secrète, jamais dans ce dépôt) |
| `email_notif` | Adresse qui reçoit les notifications (nouvel inscrit, contact, liste ebook) |
| `email_from` | Expéditeur des notifications. Vide : `onboarding@resend.dev` |
| `email_from_leads` | Expéditeur des guides envoyés aux inscrits. Vide : `onboarding@resend.dev` |
| `email_reply` | Adresse de réponse des guides |
| `cle_interne` | Secret du cron et de la signature des liens de désinscription |

## Envoi des emails

Le domaine `utopicar.fr` est vérifié dans Resend (région eu-west-1) : les guides partent de `contact@utopicar.fr`
(`email_from_leads`), avec `contact@utopicar.fr` en adresse de réponse (`email_reply`).
Les notifications internes utilisent `email_from` ; vide, c'est `onboarding@resend.dev`, qui n'écrit qu'au propriétaire du compte Resend.
Pour les envoyer aussi depuis le domaine :

```sql
insert into reglages (cle, valeur) values ('email_from', 'Utopicar <notifications@utopicar.fr>')
on conflict (cle) do update set valeur = excluded.valeur, maj = now();
```

Le domaine `envoi.utopiclabs.fr` (vérification échouée) peut être supprimé de Resend.

## Déployer

Site statique (le projet `utopicar-garage` n'est pas relié à Git : déploiement à la main, depuis ce dossier) :

```sh
cd sites/utopicar && vercel link --project utopicar-garage && vercel deploy --prod
```

Fonctions (depuis la racine du dépôt) :

```sh
supabase link --project-ref rvdfifhgosovdapdltps
supabase functions deploy inscription --no-verify-jwt
supabase functions deploy contact --no-verify-jwt
```

Les migrations de `supabase/migrations/` sont déjà appliquées sur le projet. La table `reglages` et l'extension `pg_net`
viennent des migrations de la veille Leboncoin.

Les URL des sites sont codées en dur à deux endroits : `SITES` dans `supabase/functions/inscription/index.ts` (liens des emails :
utopicar.fr et utopicar.fr/benef) et la vérification CORS des deux fonctions (utopicar.fr, `*.vercel.app`, `localhost`).

## Règles

- Hébergement Vercel uniquement, emails Resend uniquement.
- Aucune adresse email affichée sur les sites.
- Le guide n'est envoyé que par email, jamais renvoyé à l'inscription.
- Aucune clé ni mot de passe dans ce dépôt : tout est dans `reglages` ou dans les secrets Supabase.

## À faire ensuite

- Mentions légales : ajouter le SIRET.
- Basculer utopicar.fr sur le projet `utopicar` (site Next de `web/`), puis archiver ce dossier dans `legacy/`.
- Bandeau de consentement avant d'activer le pixel TikTok.
- CGV et paiement Stripe avant la vente de l'ebook.
