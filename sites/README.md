# Sites Utopicar : pages d'inscription, emails et base des inscrits

Deux sites statiques hébergés sur Vercel, un seul backend Supabase, et Resend pour l'envoi des emails.

| Dossier | Site | Projet Vercel | URL |
|---|---|---|---|
| `utopicar-garage/` | Utopicar (outil pour marchands, garagistes, acheteurs) | `utopicar-garage` | https://utopicar-garage.vercel.app |
| `premiere-revente/` | Première Revente (guide et ebook achat-revente) | `premiere-revente` | https://premiere-revente.vercel.app |
| `logo/` | Logo vectorisé et icônes | — | — |
| `supabase/` | Fonctions `inscription` et `contact`, migrations SQL | projet `rvdfifhgosovdapdltps` | — |

Équipe Vercel : `yacinesambas-projects`. Les fichiers des deux sites sont exactement ceux déployés en production.

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
| `cle_interne` | Secret du cron et de la signature des liens de désinscription |

## Envoi des emails aux inscrits : ce qui reste à faire

Sans domaine vérifié, Resend n'envoie qu'au propriétaire du compte (erreur 403 vers les inscrits).
Les inscriptions sont bien enregistrées et le cron réessaie tout seul : dès qu'un domaine est vérifié, les guides en attente partent.

Resend refuse les domaines `*.vercel.app`. Il faut donc un domaine à soi, avec deux possibilités :

**A. Acheter un domaine chez Vercel** (par exemple `utopicar.app`, 9,99 $ la première année puis 15 $/an).
Le DNS est alors géré par Vercel : les enregistrements Resend s'ajoutent depuis Vercel et les sites peuvent passer sur ce domaine.
Les `.fr` ne sont pas vendus par Vercel.

**B. Utiliser `envoi.utopiclabs.fr`, déjà créé dans Resend.** Le DNS de `utopiclabs.fr` est chez IONOS : ajouter ces 4 enregistrements dans IONOS > Domaines > `utopiclabs.fr` > DNS :

| Type | Nom | Valeur | Priorité |
|---|---|---|---|
| TXT | `resend._domainkey.envoi` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCvKfkS0RTAhq+G1xAAHElli9MRsn1UiAHSPVi+lePwbszvfx2MQ66VwFLdD0aU5B3ctDSBePrwJis27z2bFJdVbTcjFtXxYCiKn5G5wSDXy5l5EZeB7LbV/bfQ1GFb4tmxlOIDURv6l5SK7Eno1FXJBOYNrEPLCjne8eCzR56a9wIDAQAB` | |
| MX | `send.envoi` | `feedback-smtp.eu-west-1.amazonses.com` | 10 |
| TXT | `send.envoi` | `v=spf1 include:amazonses.com ~all` | |
| CNAME | `rsend.envoi` | `send.forge.rmta.net` | |

Dans les deux cas, une fois le domaine vérifié dans Resend, activer l'expéditeur :

```sql
insert into reglages (cle, valeur) values
  ('email_from_leads', 'Yacine <guide@DOMAINE>'),
  ('email_from', 'Utopicar <notifications@DOMAINE>')
on conflict (cle) do update set valeur = excluded.valeur, maj = now();
```

Le domaine `mail.yacinesamba.fr` (créé le 29/09, jamais vérifié) peut être supprimé de Resend, ainsi que `envoi.utopiclabs.fr` si l'option A est retenue.

## Déployer

Sites (depuis chaque dossier, lié au bon projet Vercel) :

```sh
cd sites/utopicar-garage && vercel deploy --prod
cd sites/premiere-revente && vercel deploy --prod
```

Fonctions et base :

```sh
cd sites
supabase link --project-ref rvdfifhgosovdapdltps
supabase functions deploy inscription --no-verify-jwt
supabase functions deploy contact --no-verify-jwt
```

Les migrations de `supabase/migrations/` sont déjà appliquées sur le projet. Elles ne couvrent que les inscriptions et le contact ;
la table `reglages` et l'extension `pg_net` viennent des migrations de la veille Leboncoin.

Les URL des sites sont codées en dur à deux endroits : `SITES` dans `supabase/functions/inscription/index.ts` (liens des emails)
et la vérification CORS des deux fonctions (`*.vercel.app` et `localhost`). En cas de passage sur un domaine à soi, mettre à jour les deux.

## Règles

- Hébergement Vercel uniquement, emails Resend uniquement.
- Aucune adresse email affichée sur les sites.
- Le guide n'est envoyé que par email, jamais renvoyé à l'inscription.
- Aucune clé ni mot de passe dans ce dépôt : tout est dans `reglages` ou dans les secrets Supabase.

## À faire ensuite

- Mentions légales : ajouter le SIRET.
- Bandeau de consentement avant d'activer le pixel TikTok.
- CGV et paiement Stripe avant la vente de l'ebook.
