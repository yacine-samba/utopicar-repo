# Revue du site — 12 octobre 2026

Revue complète de utopicar.fr (branche `claude/revue-site`) : pages publiques, API, paiements, CarCrush, accessibilité, SEO, mobile.

## 1. À faire de ton côté, en priorité

### Appliquer deux migrations Supabase (bloquant en production)

Le code de main les utilise déjà, mais la base ne les a pas :

| Migration | Ce qui ne marche pas tant qu'elle manque |
|---|---|
| `supabase/migrations/20261011120000_codes_offerts.sql` | **Le code TIKTOK annoncé dans les vidéos est refusé** (fonction `utiliser_code` absente). Le reste du site tient (les lectures valent 0). |
| `supabase/migrations/20261012100000_carcrush.sql` | **CarCrush** : l'estimation du nombre d'annonces marche, mais le lancement répond « La recherche n'a pas pu démarrer » (rien n'est débité) et les coups de cœur ne s'enregistrent pas. |

Je les ai relues : elles sont compatibles avec la base actuelle (mêmes définitions de départ pour `credits_solde`, `quota_formule` et `enregistrer_analyse`, et seuls les motifs `achat`, `analyse` et `offert` existent dans `credits`). L'application directe m'a été refusée par le garde-fou « déploiement en production ». Trois façons de faire :

- Supabase → SQL Editor : coller la 1re migration, exécuter, puis la 2e (dans cet ordre).
- Ou, en local : `supabase db push`.
- Ou m'autoriser l'outil `apply_migration` de Supabase : je les applique et je vérifie.

Ensuite, à tester : saisir `TIKTOK` sur un compte Découverte, puis lancer une recherche CarCrush (avec des crédits).

### Fusionner la PR de la revue

Elle contient les corrections de la section 2 et la vérification automatique des PR (section 3).

## 2. Corrigé dans la PR

| Problème | Risque | Correction |
|---|---|---|
| Le quota d'analyses est vérifié **avant** l'appel à l'IA et décompté **après**. | Un compte gratuit qui envoie plusieurs analyses en même temps les obtient toutes (jusqu'à 12 / 10 min), et chacune coûte un appel IA. | Une analyse à la fois par compte. Le verrou expire tout seul après 5 min. |
| Une panne de la base du marché faisait échouer l'analyse entière. | Erreur pour la personne, et l'analyse est perdue. | L'analyse continue sans cote, comme pour un visiteur. |
| Vérification du mot de passe actuel sans limite. | Une session volée permettait de deviner le mot de passe. | 8 essais par compte et par quart d'heure. |
| Changement d'adresse e-mail sans limite. | Envoi d'e-mails en masse vers n'importe quelle adresse, depuis utopicar.fr (mauvais pour la délivrabilité). | 5 demandes par compte et par heure. |
| Webhook Stripe : l'abonnement était écrit tel que reçu dans l'événement. | Stripe ne garantit pas l'ordre : un vieux « updated » arrivé après une résiliation pouvait réactiver l'abonnement. | L'abonnement est relu chez Stripe à chaque événement. |
| CarCrush : les liens des coups de cœur étaient acceptés sans contrôle. | Un appel forgé pouvait enregistrer un lien `javascript:` (risque limité au compte qui l'envoie). | Liens et photos en `https://` seulement. |
| Titres de /benef, /tarifs et /guide trop longs (77 à 89 caractères). | Coupés dans Google. | Raccourcis à environ 63 caractères. |

## 3. Ajouté

- **`.github/workflows/web.yml`** : à chaque PR, GitHub vérifie les types et le lint du site. La fusion qui a cassé main le 11 octobre (doublons dans l'administration et le tableau de bord) aurait été bloquée avant d'arriver sur Vercel.

## 4. Vérifié, rien à signaler

- **Pages publiques** : 16 pages, 33 adresses du plan du site et 39 liens internes, tous en 200, sans erreur JS ni ressource manquante.
- **Accessibilité** (axe, WCAG 2.2 AA) : 0 violation sur l'accueil, /carcrush, /tiktok, /methode, /cote et /guide.
- **Mobile 375 px** : aucun débordement horizontal sur les 10 pages principales.
- **SEO** : un seul H1 par page, description, canonique, image OG et données structurées partout. noindex là où il faut (/cote, /carcrush, /tiktok, connexion, inscription).
- **Sécurité** :
  - toutes les routes privées vérifient le compte et valident les données reçues ;
  - redirection après connexion protégée (`suiteSure`) ;
  - jeton de changement d'e-mail signé, valable 1 h ;
  - route `probe` cachée derrière une clé ;
  - webhook Stripe signé, crédits non doublés (session Stripe unique).
- **Cotes réservées aux abonnés** : aucune cote détaillée ni lien vers /cote dans les pages publiques.

## 5. Suggestions, de la plus rentable à la moins urgente

### Fiabilité

1. **Appliquer les migrations automatiquement.** Le code et la base se décalent : deux migrations manquaient alors que le code était en ligne. Une action GitHub `supabase db push` sur main (avec un jeton d'accès Supabase en secret GitHub) supprime ce risque.
2. **Garde du quota en base.** Le verrou ajouté vaut par instance du serveur. La vraie garantie : réserver l'analyse en base avant l'appel à l'IA (une ligne dans `usages`, rendue si l'IA échoue), et refuser si `analyses_restantes = 0`. Il faut une migration ; je peux l'écrire.
3. **Limites de débit partagées.** `tropDeDemandes` compte en mémoire, par instance : sur Vercel, chaque nouvelle instance repart de zéro. Passer par une table Supabase (ou les règles de limite du pare-feu Vercel) pour l'aperçu gratuit, l'import de lien et les codes.
4. **Tests sur les calculs qui font l'argent.** Aucun test aujourd'hui. Priorité : marge nette Benef, verdict de prix CarCrush (`verdictPrix`), coût d'une recherche (`coutRecherche`), quota de formule. Une dizaine de tests Vitest suffit.

### Vitesse et référencement

5. **Pages publiques statiques.** L'en-tête lit le compte et le thème côté serveur, donc toutes les pages (accueil, fiabilité, moteurs, guides…) sont recalculées à chaque visite. En lisant le compte côté navigateur (le bouton « Se connecter » ou « Mon espace » se met à jour après chargement), ces pages peuvent être servies toutes prêtes depuis le cache de Vercel : page plus rapide depuis TikTok, meilleur score Google. Le thème reste en cookie, avec un petit script dans `<head>` pour éviter le flash.
6. **Images OG par page de fiabilité et de moteur.** Aujourd'hui, toutes les pages partagent la même image. Une image générée par modèle (« Clio IV : les moteurs à éviter ») rend les partages plus parlants.
7. **Passer la CSP de « report-only » à « appliquée »** une fois quelques jours de rapports relus : protection réelle contre l'injection de scripts.

### Conversion

8. **CarCrush, une fois les migrations appliquées** :
   - le mettre à l'essai auprès des inscrits TikTok (lien direct, la page est déjà cachée des moteurs) ;
   - ajouter deux événements Vercel (recherche lancée, coup de cœur) et les suivre avant de l'ouvrir plus largement.
9. **Entonnoir mesuré de bout en bout** : aperçu vu → compte créé → 1re analyse → paiement, dans une seule vue de l'administration (les événements Vercel existent déjà : `apercu_vu`, `paiement_ok`).
10. **E-mail de relance J+2** pour les comptes qui ont fait l'aperçu sans lancer l'analyse offerte. C'est l'étape où le plus de monde décroche, en général.

## 6. Question ouverte

- « Connecter CarCrush aux API » : côté code, CarCrush est déjà branché (recherche dans la base d'annonces, cote, crédits). Il ne manque que la migration (section 1). Si tu pensais à une autre source d'annonces (La Centrale, AutoScout24 en direct), dis-le-moi : la collecte se ferait en local, comme le reste.
