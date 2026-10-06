# Utopicar : à faire

Mis à jour le 5 octobre 2026. Les cases cochées sont faites et en production.

## De votre côté (rapide, et rien ne peut se faire sans vous)

- [x] **Extension V4** : V4.3 reprise à l'identique (relevé de toute la recherche jusqu'à 3 500 annonces, lecture en entier de 10 annonces, envoi d'une annonce avec 20 photos), devenue 4.4 : les envois s'ouvrent directement sur utopicar.fr (analyse, Tri rapide, Cote). **À faire de votre côté : remplacer l'ancienne extension par la 4.4** (page Extension Leboncoin).
- [ ] **Supabase › Authentication › Settings** : activer « Leaked password protection » (refuse les mots de passe déjà piratés).
- [ ] **Stripe › Webhooks** : l'adresse doit être `https://www.utopicar.fr/api/stripe/webhook`. `utopicar.fr` redirige vers `www`, et Stripe ne suit pas les redirections.
- [ ] **Alertes** : l'adresse malek.admin@utopic.fr rejette les e-mails (bounce). Mettre une adresse valide sur les alertes.
- [ ] **Vercel** : vérifier que `NEXT_PUBLIC_SITE_URL` vaut `https://www.utopicar.fr`, s'il est défini (aperçus de liens).
- [ ] **Nettoyage** : comptes et clients Stripe de test ; dans l'éditeur SQL Supabase : `drop function public.importer_marche_temp(text, jsonb); drop function public.copier_email();`

## Retours pros d'octobre (branche claude/retours-pro-octobre)

- [ ] **Messages Leboncoin** : essai gratuit de l'acteur jusqu'au 7 octobre 20 h ; les envois s'arrêtent seuls à 19 h 45 (réglage `lbc_jusqu_au`). Pour continuer après : souscrire le pass (29 $) sur Apify, puis vider `lbc_jusqu_au` et mettre `lbc_max_usd` à 30.
- [ ] **Option Messages à 45 €/mois** : le prix Stripe se crée seul au premier paiement (clé `utp_option_messages_45`). Vérifier sur Apify si le pass de 29 $ vaut pour tout le compte Apify ou pour chaque compte Leboncoin : dans le second cas, 45 € laisse environ 10 € de marge par client.
- [ ] **Photos dans l'historique des recherches** : seulement pour les annonces collectées à partir du 6 octobre (les 7 600 annonces déjà en base n'ont pas de photo).
- [ ] **La Centrale et AutoScout24 dans la base du marché** : l'import par lien marche ; les verser aussi dans la cote demanderait une collecte par modèle (environ 0,8 $ les 1 000 annonces La Centrale, 0,5 $ AutoScout24).

## Recherche et cote

- [x] Génération = ses dates, comme sur Leboncoin ; années de transition départagées par la puissance, sinon « à vérifier ».
- [x] Motorisation lue dans la version Leboncoin, le titre ou la description, sinon déduite de la puissance DIN (table apprise des annonces).
- [x] Critères Leboncoin gardés : version, finition, 1re mise en circulation, portes, estimation Leboncoin.
- [x] Base du marché cumulative : une collecte ajoute, elle n'efface plus.
- [ ] **Collecte ciblée par motorisation** : quand un moteur rare a moins de 30 annonces (335d, 330xd…), collecter Leboncoin avec sa plage de puissance au lieu de toute la génération.
- [ ] **Rafraîchissement automatique** : recollecte cumulative, tous les 15 jours, des générations recherchées, dans la limite du budget Apify (0,26 $ dépensés sur 5 $ ce mois-ci).
- [ ] **Années de transition par la finition** : « Ambiente » n'existe que sur l'A3 8V, « Ambition Luxe » que sur la 8P. Une table des finitions par génération réglerait la plupart des annonces « à vérifier ».
- [x] **Cote comparable** : cote du même moteur dès 25 annonces (335i sur des 335i), sinon toute la génération avec la puissance (en écart relatif) ; puissance déduite du moteur quand elle manque (335i → 306 ch) ; carrosserie (E92 coupé, Touring, portes) et finition Leboncoin dans la régression ; âge au mois près (1re mise en circulation) ; comparables du même moteur et de la même carrosserie.
- [ ] **Cote par carrosserie rare** : quand une carrosserie a moins de 8 annonces dans la cote (cabriolet d'un moteur rare), collecter Leboncoin pour elle.
- [ ] **Leboncoin vs Utopicar** : comparer leur estimation et la nôtre sur chaque annonce. L'écart est un argument de négociation.
- [ ] **Liquidité** : la base étant cumulative, mesurer le délai de vente (annonces disparues) et les baisses de prix par modèle et motorisation.

## Alertes

- [x] Version → type de véhicule Leboncoin ; motorisation → plage de puissance DIN ; puissance min. et max.
- [ ] **Aperçu avant création** : « cette alerte aurait trouvé N annonces ces 30 derniers jours » (depuis la base).
- [ ] **E-mail** : ajouter la motorisation et l'estimation Leboncoin ; résumé quotidien optionnel au lieu d'un e-mail par passage.

## Application

- [x] Installable sur téléphone (manifest, icônes) ; robots.txt, sitemap, image de partage.
- [x] Vignettes des alertes servies à part (1 Mo de moins par chargement) ; catalogue mis en cache.
- [x] Page « Extension Leboncoin » dans le menu.
- [ ] **Notifications push** sur téléphone pour les alertes et la fin des collectes (en plus de l'e-mail).
- [ ] **Tableau de bord** : environ 1 s à chaud. Afficher le haut tout de suite et charger le parc et les alertes ensuite (streaming).
- [ ] **Polices** : Clash Display et Satoshi viennent d'un serveur externe (Fontshare). Les héberger sur le site : plus rapide et sans transfert de données à un tiers.
- [ ] **Tests automatiques** : les parcours vérifiés à la main (recherche, alertes, favoris, historique, paiement) en tests Playwright dans le dépôt, lancés par GitHub à chaque modification.
- [ ] **Surveillance** : e-mail à l'administrateur si la collecte Leboncoin échoue plusieurs fois de suite ou si le budget Apify approche de la limite.

## Croissance (idées)

- [ ] **Pages publiques par modèle** (« Prix d'une Clio 4 1.5 dCi 90 d'occasion ») générées depuis la base : prix médian, kilométrage, motorisations, défauts connus. Source de trafic Google. À valider juridiquement avant (données issues de Leboncoin).
- [ ] **Rapport d'exemple public** : un vrai rapport consultable sans compte, lié depuis l'accueil.
