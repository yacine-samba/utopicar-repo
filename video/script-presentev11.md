# Présentation utopicar v11 : le parcours, avec les vrais écrans de l'app

Retours de l'utilisateur sur la v10 :
- « l'animation du scroll s'arrête net, un des textes chiffres coupe et y'a aucun dynamisme, on comprend rien du tout,
  absolument rien du tout, pas de contexte, pas de parcours, pas d'UX, pas de compréhension. Refais le texte de Simon,
  on va revoir tout un par un. » ;
- puis : « inspire-toi [des vidéos de références] pour les textes aussi, pour les améliorations, fais-moi une planche
  avant ».

Planche : `renders/planches-presentev11/planche.png` (les dix images une à une : `f01.png` à `f10.png`).

Statut des informations :
- **(fait)** vérifié dans le code de l'app, dans l'app elle-même ou dans la base ;
- **(exemple d'essai)** annonce écrite pour la démo, chiffres calculés par l'app ;
- **[À VÉRIFIER]** à confirmer avant publication.

## 1. Ce qui ne va pas dans la v10

- **On ne sait pas où on est.** Le film enchaîne des résultats (critères, verdicts, mur, radar, horloge, e-mail, parc)
  sans jamais montrer le geste qui y mène. Il n'y a ni annonce de départ, ni étapes, ni fil : le spectateur ne peut
  pas refaire le chemin.
- **Pas de contexte.** La première phrase donne un prix et une perte. Elle ne dit ni à qui on parle (quelqu'un qui
  achète pour revendre), ni où est cette Polo (une annonce en ligne), ni que c'est une app.
- **Pas d'UX.** Les morceaux d'interface flottent sans téléphone ni écran : on ne reconnaît pas une app qu'on utilise.
- **Pas de dynamisme.**
  - Pour laisser vivre les images, on avait ajouté 16 s de blancs à la voix (41 s de voix brute, 57 s après montage).
    Pendant ces blancs, l'écran tient une interface immobile.
  - Les critères n'occupent que le haut de l'écran : le bas reste vide.
- **Défauts repérés image par image sur le MP4 :**
  - vers 35 s, le défilement du mur d'annonces accélère jusqu'au flou, puis s'arrête d'un coup ;
  - vers 33–35 s, les prix du mur sont coupés par les bords de l'écran (« 200 € », « 00 € ») ;
  - vers 15,2 s, le disque rouge part du milieu de « −2 490 € » et mange le chiffre avant de couvrir l'écran ;
  - vers 51 s, « 1 550 € » apparaît coupé par son masque pendant sa montée.
- **Des chiffres qui ne sont plus ceux de l'app.**
  - Les chiffres de la v10 venaient d'un banc d'essai : une copie plus ancienne des règles de l'app. L'app en ligne
    (`main`, 17 oct.) donne −2 458 € pour la Polo, et non −2 490 €, et environ 390 € de travaux, et non 400 €.
  - Le verdict de la Clio (97/100, « environ 1 450 € », offre 6 650 €, plafond 7 100 €) était périmé. Le plafond était
    même plus bas que le prix demandé (7 650 €).
  - Tous les chiffres de la v11 sont lus dans la vraie app (§ 7).

## 2. Ce qu'on reprend des références

Les références sont dans `video/references/` (sur GitHub). Une référence donne une grammaire, pas un contenu : on n'en
reprend ni texte, ni image, ni logo.

**[À VÉRIFIER] Les vidéos ajoutées aujourd'hui** ne sont pas sur GitHub : le dossier en ligne s'arrête au 13 oct.
Elles seront analysées dès qu'elles y sont.

**Pour le texte : @flo.vma** (face caméra dans un showroom, 51 s, analysé image par image et mot à mot)

| Ce qu'il fait | Ce qu'on en tire pour Simon |
|---|---|
| L'accroche pose le chiffre, la cible et la promesse en 4 s : « Les 5 pires voitures à ne jamais acheter, surtout si tu fais de l'achat-revente, et je te dis exactement pourquoi. » | « Tu fais de l'achat-revente ? Cette Polo à 8 990 euros te ferait perdre 2 458 euros. Je te montre comment le voir avant d'appeler, en quatre étapes. » |
| Un titre fixe en haut pendant toute la vidéo, et un gros numéro 1 à 5 avec une petite voiture : on sait toujours où on en est | Le fil des quatre étapes en haut, tout le film : Analyser, Trouver, Négocier, Revendre |
| Des repères dits à voix haute : « On commence tout de suite avec la première », « La numéro 2 », « Et pour finir » | « Étape 1 : analyser. », « Étape 2 : trouver. »… |
| Chaque point finit sur la marge et un ordre : « si vous voulez garder votre marge, écartez-les » | « Pour garder 750 euros de marge, paie-la 5 750 au plus. » |
| Les mots du métier : faire de la marge, garder sa marge, passer | « marge », « cote », « sous la cote » |
| Un débit rapide, sans blanc : 4,5 mots par seconde | Voix de Simon plus rapide qu'en v10 (3,15 mots par seconde), blancs de 0,5 s au plus |
| Appel : « commente AUTO juste ici en dessous et je t'envoie un guide 100 % gratuit » | « Ta première analyse est offerte : le lien est en bio. » (vrai dans l'app : § 7) |

**Pour l'image et l'UX : les pubs d'applis** (Drive, Facebook, Qonto, Instagram, TikTok ; analyse du mouvement :
`docs/ref_motion_fluide.md`)

| Ce qu'elles font | Ce qu'on en tire |
|---|---|
| L'app est toujours dans un téléphone ou une fenêtre, en 3D, et on la voit utilisée | Le vrai écran de l'app dans un téléphone, légèrement incliné |
| Un élément sort de l'écran vers nous (le montant chez Qonto) | Le bloc qui compte sort du téléphone en gros plan : « Trop cher », « Prix à ne pas dépasser », « Très bon prix » |
| Des verbes courts à l'impératif en haut (« Encaissez. », « Créez une carte. ») | « Copie le lien, colle-le. », « Ouvre à 7 400 € » |
| Une liste qui se coche (0/4 → 4/4) | Les étapes réelles de l'attente : « Lecture du texte de l'annonce », « Cote sur les annonces comparables »… |
| Ça bouge sur 81 à 94 % des images, aucune pause de plus de 0,5 à 1,5 s | Caméra qui ne s'arrête pas, aucun blanc pour laisser vivre une interface |
| Fin : logo, slogan mot à mot, retour au début | Logo officiel, « Achète juste. Revends mieux. », boucle sur la Polo |

**On ne reprend pas :** le face caméra (Simon reste une voix), les logos de plateformes, les cœurs et notifications,
une main qui tient un téléphone.

## 3. Le principe de la v11 : une histoire, un parcours

On suit **une personne** (toi, qui achètes pour revendre) et **une voiture à la fois**, de l'annonce jusqu'à la
revente. Chaque étape montre trois choses, dans cet ordre :
1. **ce que tu fais** (copier un lien, le coller, lancer une recherche, ajouter au parc) ;
2. **ce que tu vois** : le vrai écran de l'app, dans un téléphone ;
3. **ce que ça te donne** : le bloc qui compte sort du téléphone en gros plan.

Le fil **Analyser → Trouver → Négocier → Revendre** reste en haut de l'écran pendant tout le film.

## 4. L'accroche (skill art-du-hook)

**Analyse.**
- Douleur visée : acheter une voiture pour la revendre et y perdre de l'argent.
- Croyance classique : « le prix a l'air dans le marché, je négocierai un peu et ça passera ».
- Vérité proposée : à ce prix, une fois les frais et les travaux payés, la revente fait perdre 2 458 €.

| Variante | Voix | Texte à l'écran |
|---|---|---|
| **A · Contexte + coût caché + promesse** (recommandée) | « Tu fais de l'achat-revente ? Cette Polo à 8 990 euros te ferait perdre 2 458 euros. Je te montre comment le voir avant d'appeler, en quatre étapes. » | « Cette Polo à 8 990 € ? », puis « −2 458 € à la revente » |
| B · Croyance → vérité | « Tu comptes négocier cette Polo à 8 990 euros ? Même 1 000 euros moins chère, tu perds encore de l'argent à la revente. » | « Négocier ne suffit pas » |
| C · Situation | « Polo de 2012, 8 990 euros, vendeur pro. Tu l'achètes pour la revendre ? Attends : tu perdrais 2 458 euros. » | « Tu l'achètes ? Attends. » |

**Recommandation : A.** Le contexte arrive en 2 s, au « tu ». La perte suit, puis la promesse et sa structure
(« en quatre étapes »), comme chez @flo.vma. La question qui reste (« comment il le sait, et à combien l'acheter ? »)
est exactement ce que le parcours montre.

[À VÉRIFIER] La variante B ne donne pas de chiffre : il faut relancer l'app sur une Polo à 7 990 € avant de l'écrire.

## 5. Le texte de Simon

> **[Accroche]**
> Tu fais de l'achat-revente ? Cette Polo à 8 990 euros te ferait perdre 2 458 euros. Je te montre comment le voir
> avant d'appeler, en quatre étapes.
>
> **[1 · Analyser]**
> Étape 1 : analyser. Copie le lien de l'annonce et colle-le dans utopicar.
> L'app la compare à 268 Polo comparables : 1 533 euros au-dessus de la cote.
> Verdict : à éviter. Pour garder 750 euros de marge, paie-la 5 750 au plus.
>
> **[2 · Trouver]**
> Étape 2 : trouver. Lance une recherche : Clio 4, au moins 15 % sous la cote.
> Une annonce passe dessous, tu reçois un mail.
>
> **[3 · Négocier]**
> Étape 3 : négocier. Cette Clio est 2 064 euros sous la cote. Très bonne affaire.
> Tu ouvres à 7 400, sans dépasser 7 900, et ton premier message au vendeur est prêt.
>
> **[4 · Revendre]**
> Étape 4 : revendre. Tu l'achètes, tu l'ajoutes à ton parc, et à la vente tu vois ce qu'elle t'a rapporté, frais
> payés.
>
> **[Fin]**
> Ta première analyse est offerte : le lien est en bio. utopicar. Achète juste, revends mieux.

**Durée.**
- 168 mots, 318 syllabes à l'oral (nombres comptés comme ils se disent).
- Au débit de Simon en v10 (5,2 syllabes par seconde) : environ 61 s de voix.
- Avec une voix 13 % plus rapide, plus proche de @flo.vma : environ 54 s, donc un film de 57 à 58 s.
- À chronométrer sur la prise.

**Choix d'écriture.**
- Passé au crible stop-slop :
  - plus de mise en scène « ça a l'air X, en fait c'est Y » ;
  - plus de question posée pour la forme ;
  - des chiffres à la place des formules vagues.
- Les montants dits sont ceux de l'app. La marge réelle de la Clio (1 300 €) reste à l'écran sans être dite : c'est un
  exemple de vente, pas un résultat de client.

## 6. Découpage : la planche, scène par scène

Chaque image de la planche est une scène. Écrans : vraies captures de l'app (`main`) sur la base démo.

| # | Étape | Voix | Écran du téléphone | Gros plan | Texte à l'écran |
|---|---|---|---|---|---|
| 1 | Accroche | Tu fais de l'achat-revente ? … en quatre étapes. | — (la Polo en 3D, les quatre étapes en attente) | — | Cette Polo à 8 990 € ? · −2 458 € à la revente |
| 2 | 1 · Analyser | Étape 1 : analyser. Copie le lien… | « Analyser une annonce », lien collé, « Analyser ce lien » | Le champ et le bouton | Copie le lien, colle-le. |
| 3 | 1 · Analyser | L'app la compare à 268 Polo comparables… | « Analyse en cours… » et ses étapes | « Bon prix ? Trop cher, 1 533 € de plus que les annonces comparables (+21 %) » | 268 Polo comparables |
| 4 | 1 · Analyser | Verdict : à éviter… 5 750 au plus. | Verdict : 29 sur 100, « À éviter » | « Prix à ne pas dépasser 5 750 €, pour garder 750 € » | À éviter. 5 750 € max. |
| 5 | 2 · Trouver | Étape 2 : trouver… | Recherche : Renault, Clio, Clio 4 (2012 — 2019) | « Sous la cote d'au moins (%) : 15 » | Clio 4, 15 % sous la cote |
| 6 | 2 · Trouver | Une annonce passe dessous, tu reçois un mail. | L'e-mail d'alerte : « 2 064 € sous la cote (cote 9 714 € sur 1102 annonces) » | La recherche suivie, « Alerte e-mail » allumée | Tu reçois un mail. |
| 7 | 3 · Négocier | Étape 3 : négocier… Très bonne affaire. | Verdict : 80 sur 100, « Très bonne affaire » | « Bon prix ? Très bon prix, 2 064 € de moins que les annonces comparables (−21 %) » | 2 064 € sous la cote |
| 8 | 3 · Négocier | Tu ouvres à 7 400, sans dépasser 7 900… | « Avant de vous déplacer, demandez », puis « Premier message, prêt à envoyer » | « Offre d'ouverture 7 400 € » et « Prix à ne pas dépasser 7 900 € » | Ouvre à 7 400 € · 7 900 € max. |
| 9 | 4 · Revendre | Étape 4 : revendre… frais payés. | « Parc » : la Clio arrive « Repérée » | La fiche de la Clio vendue : achat 7 400 €, frais 650 €, vendue 9 350 €, marge réelle 1 300 € | Ce qu'elle t'a rapporté |
| 10 | Fin | Ta première analyse est offerte… revends mieux. | — (logo officiel) | — | Achète juste. Revends mieux. · Ta 1re analyse offerte · lien en bio |

Dans le film, chaque scène bouge : le téléphone avance et tourne lentement, l'écran défile, le gros plan sort de
l'écran vers nous. Une grosse couleur passe entre deux étapes, comme en v9 et v10.

## 7. Les chiffres, lus dans la vraie app

L'app (`main` du 17 oct. 2026) tourne en local sur la base démo (`scripts/app-demo/`). La cote est la vraie fonction
`cote_marche`, relue le 17 oct. Les captures et les textes lus sont dans `assets/presente-v11/app/` (`textes.json`).

| | Polo 1.2 TSI 90, 2012, 118 400 km, 8 990 € (exemple d'essai) | Clio IV 1.5 dCi 75, 2018, 88 500 km, 7 650 € (exemple d'essai) |
|---|---|---|
| Cote | 268 annonces comparables, médiane 7 457 € | 1 102 annonces, médiane 9 714 € |
| Verdict | 29/100, « À éviter » | 80/100, « Très bonne affaire » |
| Fiable ? | Moyen (1.2 TSI : chaîne de distribution) | Oui (88 500 km : kilométrage faible pour ce moteur) |
| Des travaux ? | ≈ 390 € (0 à 1 850 €) | ≈ 420 € (0 à 1 250 €) |
| Bon prix ? | Trop cher, +1 533 € (+21 %) | Très bon prix, −2 064 € (−21 %) |
| Ça rapporte ? (vente en 1 à 2 mois) | −2 458 € | +1 046 € |
| Offre d'ouverture · objectif · plafond | 5 400 € · 5 600 € · 5 750 € | 7 400 € · 7 650 € · 7 900 € |
| E-mail d'alerte | — | « 2 064 € sous la cote (cote 9 714 € sur 1102 annonces) » : même fonction de cote |
| Parc (exemple de vente) | — | achat 7 400 €, frais 650 €, vendue 9 350 €, marge réelle 1 300 €, 22 jours en stock |

- L'« Objectif » de la Clio (7 650 €) est égal au prix demandé : on ne le montre pas, il n'apporte rien.
- **Offre « 1re analyse offerte »** : la formule Découverte (0 €) donne une analyse, au niveau Benef pour un compte
  achat-revente (`offres.ts`, `compte.ts`). Aucun essai payant gratuit n'existe.
- **Recherche, alertes et parc** sont réservés à Pro (79 € par mois).

## 8. À décider ou à vérifier avant le film

- **[À DÉCIDER] Dire que la recherche, les alertes et le parc sont dans Pro ?** Le film les montre sans le dire.
- **[À DÉCIDER] Noms de plateformes dans l'interface.** Le lien collé montre « leboncoin.fr » (demandé en v7). Mais
  l'écran « Analyser une annonce » affiche aussi « (Leboncoin, La Centrale, AutoScout24) » et l'attente « Lecture de
  l'annonce sur Leboncoin ». Dans le film, on cadre pour ne pas les montrer, sauf avis contraire.
- **[À VÉRIFIER] La veille des recherches tourne en production** (toutes les 3 h au plus, de 7 h à 23 h).
- **[À VÉRIFIER] Le lien en bio** : la page derrière.
- **[À VÉRIFIER] Les références ajoutées aujourd'hui**, à pousser sur GitHub.
- **La cote bouge.** Chiffres du 17 oct. 2026 : à relire le jour de la voix.
- **Défauts de l'app vus pendant les captures** (hors film, à corriger dans l'app) :
  - `main` ne compile plus : clés en double dans deux fichiers CarCrush (tâche proposée à part) ;
  - en haut d'un rapport, à 390 px de large, « Rapports » passe sous les boutons « Suivre le prix », « Partager » ;
  - à 390 px, « (+21 %) » se coupe en « (+21 » / « %) », et « 7 650 € » en « 7 650 » / « € » sur la carte d'une
    recherche ;
  - le bouton de l'e-mail d'alerte écrit « Utopicar » avec une majuscule.

## 9. Fait (17 oct. 2026)

- **Planche validée** par l'utilisateur : « repars de la vidéo de base qu'on a créée et copie cette animation pour les
  interfaces », nouveau texte et nouvelle voix.
- **Voix** : 2 prises eleven_v4 de Simon (1 730 crédits, avec accord). Prise retenue `Uy7VO2vX` : aucun mot faux à la
  transcription (seuls des homophones : cette/cet, paie/paye), « En quatre étapes. » détaché, 23,2 demi-tons, silence le
  plus long 0,43 s. Accélérée × 1,05 : 52,97 s de voix, 6,0 syllabes par seconde (v10 : 5,2). `scripts/vo-presentev11.py`.
- **Film** : `film-presentev11/` (55,2 s) ; écrans et gros plans : `scripts/film-v11-images.py` ; captures en plus
  (l'attente de l'analyse image par image, « Acheter », l'onglet « Vendues ») : `scripts/app-demo/capturer-v11b.mjs`.
- **Son** : `scripts/audio-presentev11.py` (même musique que la v10, montée par chapitre ; bruitages aux repères).
- **Écart avec la planche** : le libellé « Lien de l'annonce (Leboncoin, La Centrale, AutoScout24) » et « Lecture de
  l'annonce sur Leboncoin » restent visibles en petit sur l'écran du téléphone (vrais écrans, comme sur la planche) ;
  le gros plan du lien, lui, ne les montre pas. À décider : les garder ou les masquer.
