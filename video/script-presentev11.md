# Présentation utopicar v11 : nouveau texte de Simon (le parcours)

Retour de l'utilisateur sur la v10 : « l'animation du scroll s'arrête net, un des textes chiffres coupe et y'a aucun
dynamisme, on comprend rien du tout, absolument rien du tout, pas de contexte, pas de parcours, pas d'UX, pas
de compréhension. Refais le texte de Simon, on va revoir tout un par un. »

Statut des informations :
- **(fait)** vérifié dans le code de l'app ou dans la base ;
- **(exemple d'essai)** annonce écrite pour la démo, chiffres calculés par l'outil ;
- **[À VÉRIFIER]** à confirmer avant publication.

## 1. Ce qui ne va pas dans la v10

- **On ne sait pas où on est.** Le film enchaîne des résultats (critères, verdicts, mur, radar, horloge, e-mail, parc)
  sans jamais montrer le geste qui y mène. Il n'y a ni annonce de départ, ni étapes, ni fil : le spectateur ne peut
  pas refaire le chemin.
- **Pas de contexte.** La première phrase donne un prix et une perte. Elle ne dit ni à qui on parle (quelqu'un qui
  achète pour revendre), ni où est cette Polo (une annonce en ligne), ni que c'est une app.
- **Pas de dynamisme.**
  - Pour laisser vivre les images, on avait ajouté 16 s de blancs à la voix (41 s de voix brute, 57 s après montage).
    Pendant ces blancs, l'écran tient une interface immobile.
  - Les critères n'occupent que le haut de l'écran : le bas reste vide.
- **Défauts repérés image par image sur le MP4 :**
  - vers 35 s, le défilement du mur d'annonces accélère jusqu'au flou, puis s'arrête d'un coup ;
  - vers 33–35 s, les prix du mur sont coupés par les bords de l'écran (« 200 € », « 00 € ») ;
  - vers 15,2 s, le disque rouge part du milieu de « −2 490 € » et mange le chiffre avant de couvrir l'écran ;
  - vers 51 s, « 1 550 € » apparaît coupé par son masque pendant sa montée.
- **Des chiffres périmés.** Le verdict de la Clio (97/100, « environ 1 450 € », offre 6 650 €, plafond 7 100 €) ne
  correspond plus à l'outil. Le plafond était même plus bas que le prix demandé (7 650 €). Avec la cote relue le
  17 oct. 2026, l'outil donne 80/100, +1 050 €, offre 7 450 €, plafond 7 950 €.

## 2. Le principe de la v11 : une histoire, un parcours

On suit **une personne** (toi, qui achètes pour revendre) et **une voiture à la fois**, de l'annonce jusqu'à la
revente. Chaque étape montre trois choses, dans cet ordre :
1. **ce que tu fais** (copier un lien, le coller, lancer une recherche, ajouter au parc) ;
2. **ce que tu vois** dans l'app, avec ses vrais libellés ;
3. **ce que ça te donne** (une perte évitée, un prix, un mail, une marge).

Le parcours a quatre étapes, affichées en permanence par un fil discret qui avance :
**Analyser → Trouver → Négocier → Revendre.**

La voix mène, l'image bouge pendant qu'elle parle. Plus de blancs pour laisser vivre une interface : un blanc dure
0,5 s au plus, seulement pour une transition.

## 3. L'accroche (skill art-du-hook)

**Analyse.**
- Douleur visée : acheter une voiture pour la revendre et y perdre de l'argent.
- Croyance classique : « le prix a l'air dans le marché, je négocierai un peu et ça passera ».
- Vérité proposée : une annonce qui a l'air dans les prix peut te faire perdre 2 490 € une fois tout payé.

| Variante | Voix | Texte à l'écran |
|---|---|---|
| **A · Contexte + coût caché** (recommandée) | « Tu achètes des voitures pour les revendre ? Cette Polo à 8 990 euros a l'air dans les prix. À la revente, tu perds 2 490 euros. » | « Cette Polo à 8 990 € ? », puis « −2 490 € » |
| B · Croyance → vérité | « Tu comptes négocier cette Polo à 8 990 euros ? Même à 7 990, tu perds encore 1 490 euros à la revente. » | « Négocier ne suffit pas » |
| C · Situation | « Polo de 2012, 8 990 euros, vendeur pro. Tu l'achètes pour la revendre ? Attends : tu perdrais 2 490 euros. » | « Tu l'achètes ? Attends. » |
| D · Démonstration | « Regarde : tu colles cette annonce de Polo dans utopicar. 8 990 euros. Verdict : à éviter. » | « 8 990 € : à éviter » |

Visuel commun aux quatre : l'annonce de la Polo comme on la voit en ligne (photo, titre, prix), sans logo ni
interface de plateforme.

**Recommandation : A.**
- Le contexte arrive en 2 s (« Tu achètes des voitures pour les revendre ? »), au « tu ».
- La croyance (« a l'air dans les prix ») et l'écart (« tu perds 2 490 euros ») suivent.
- La question qui reste (« comment il le sait ? ») est exactement ce que le parcours montre ensuite.

B est la meilleure variante à tester en second. Ses chiffres sont ceux de l'outil (Polo à 7 990 € : −1 490 €).

## 4. Le texte de Simon

> **[Analyser]**
> Tu achètes des voitures pour les revendre ? Cette Polo à 8 990 euros a l'air dans les prix. À la revente, tu perds
> 2 490 euros.
> Pour le savoir, copie le lien de l'annonce, et colle-le dans utopicar.
> L'app la compare à 268 Polo comparables.
> Fiable ? Moyen. Des travaux ? Environ 400 euros. Bon prix ? Trop cher. Et ça rapporte ? Moins 2 490.
> Verdict : à éviter. Pour garder ta marge, ne la paie pas plus de 5 750 euros.
>
> **[Trouver]**
> Alors, où sont les bonnes affaires ? Lance une recherche : ton modèle, ton budget, combien sous la cote.
> Une annonce passe dessous ? Tu reçois un mail.
>
> **[Négocier]**
> Cette Clio : plus de 2 000 euros sous la cote. Très bonne affaire.
> Tu as ton offre d'ouverture, le prix à ne pas dépasser, et le premier message pour le vendeur.
>
> **[Revendre]**
> Achetée ? Ajoute-la à ton parc, et suis-la jusqu'à la vente, avec ta vraie marge.
> utopicar. Achète juste, revends mieux. Le lien est en bio.

**Durée.**
- Environ 165 mots à l'oral.
- Au débit de Simon mesuré sur la prise v10 (3,15 mots par seconde, pauses naturelles comprises), cela fait environ
  52 s de voix.
- Avec les transitions (0,5 s au plus chacune) et la fin, le film dure environ 56 à 58 s. À chronométrer sur la prise.

**Pourquoi ces phrases.**
- La boucle ouverte par l'accroche (« d'où vient ce −2 490 € ? ») se ferme sur la carte « Ça rapporte ? » de l'app.
- Les quatre questions sont dites dans l'ordre où l'app les affiche. Elles font le rythme : question, réponse, quatre
  fois.
- « Alors, où sont les bonnes affaires ? » relance au milieu, avant que la première histoire soit finie.
- Chaque étape commence par un geste au « tu » : copie, colle, lance, ajoute.

## 5. Découpage, scène par scène

Chaque scène deviendra une planche, revue une par une.

| # | Étape | Voix | Ce que tu fais | Ce que tu vois (vrais libellés) | Texte à l'écran |
|---|---|---|---|---|---|
| 1 | Analyser | Tu achètes des voitures pour les revendre ? Cette Polo à 8 990 euros a l'air dans les prix. À la revente, tu perds 2 490 euros. | Tu fais défiler des annonces ; tu t'arrêtes sur une Polo | L'annonce : la Polo en 3D, « Volkswagen Polo 1.2 TSI 90 Confortline · 2012 · 118 400 km », 8 990 €. Le prix bascule en −2 490 € rouge | Cette Polo à 8 990 € ? · −2 490 € |
| 2 | Analyser | Pour le savoir, copie le lien de l'annonce, et colle-le dans utopicar. | Tu copies le lien, puis tu le colles | L'écran « Analyser une annonce » : champ « Lien de l'annonce (Leboncoin, La Centrale, AutoScout24) », lien collé sur une ligne, bouton « Analyser ce lien » | Copie le lien · colle-le |
| 3 | Analyser | L'app la compare à 268 Polo comparables. | Tu attends | « Lecture de l'annonce… », puis les étapes qui se cochent : « Cote sur les annonces comparables », « Calcul du deal : marge, offre, plafond ». Les 268 annonces se rangent autour de la cote (médiane 7 457 €) | 268 Polo comparables |
| 4 | Analyser | Fiable ? Moyen. Des travaux ? Environ 400 euros. Bon prix ? Trop cher. Et ça rapporte ? Moins 2 490. | Tu lis le rapport | Les quatre cartes de l'app, dans son ordre : « Fiable ? » Moyen, « Des travaux ? » ≈ 400 €, « Bon prix ? » Trop cher (+1 533 €, +21 %), « Ça rapporte ? » −2 490 € | Les quatre questions de l'app |
| 5 | Analyser | Verdict : à éviter. Pour garder ta marge, ne la paie pas plus de 5 750 euros. | Tu lis le verdict | « Avant le premier message », « À éviter », note 29 sur 100, et « Prix à ne pas dépasser » 5 750 € mis en avant | À éviter · 5 750 € au plus |
| 6 | Trouver | Alors, où sont les bonnes affaires ? Lance une recherche : ton modèle, ton budget, combien sous la cote. | Tu remplis la recherche | Page « Recherche » : marque et modèle « Renault Clio », « Prix (€) », « Sous la cote d'au moins (%) », bouton « Rechercher », interrupteur « Alerte e-mail » qui s'allume | Ton modèle · ton budget · sous la cote |
| 7 | Trouver | Une annonce passe dessous ? Tu reçois un mail. | Ton téléphone reçoit le mail | L'e-mail d'alerte : la Clio à 7 650 €, « 2 064 € sous la cote (cote 9 714 € sur 1 102 annonces) », bouton « Voir mes alertes sur utopicar » | Tu reçois un mail |
| 8 | Négocier | Cette Clio : plus de 2 000 euros sous la cote. Très bonne affaire. | Tu l'analyses | Verdict vert « Très bonne affaire », note 80 sur 100, « Ça rapporte ? » +1 050 € | Très bonne affaire |
| 9 | Négocier | Tu as ton offre d'ouverture, le prix à ne pas dépasser, et le premier message pour le vendeur. | Tu copies le message | « Offre d'ouverture » 7 450 €, « Prix à ne pas dépasser » 7 950 €, puis « Premier message, prêt à envoyer » et « Copier le message » | Offre · plafond · message |
| 10 | Revendre | Achetée ? Ajoute-la à ton parc, et suis-la jusqu'à la vente, avec ta vraie marge. | « Ajouter au parc », puis la voiture avance d'étape | La Clio passe « Repérée → Achetée → En préparation → En vente → Vendue » ; « Marge réelle » s'affiche | Ta vraie marge |
| 11 | Fin | utopicar. Achète juste, revends mieux. Le lien est en bio. | — | Logo officiel, signature, pastille « lien en bio », puis boucle sur l'annonce de la Polo | utopicar · lien en bio |

**Deux choix d'affichage :**
- **L'« Objectif » de la Clio n'est pas montré.** L'app le calcule à 7 700 €, plus que le prix demandé (7 650 €) : à
  l'écran, ça embrouille. On montre l'offre d'ouverture et le prix à ne pas dépasser.
- **La marge réelle de la scène 10 se calcule.** Il faut fixer un prix d'achat et un prix de vente pour l'exemple de la
  Clio. Je te les proposerai sur la planche 10, calculés avec la formule de l'app (vente − achat − frais).

## 6. Ce qui change par rapport à la v10

- **Ajouté :**
  - le contexte (qui achète, pour quoi faire) et l'annonce de départ ;
  - le copier-coller du lien et l'attente, avec les vraies étapes de l'app ;
  - les quatre questions dans l'ordre de l'app ;
  - la recherche remplie à l'écran ;
  - le premier message au vendeur ;
  - le passage d'étape dans le parc ;
  - le fil des quatre étapes.
- **Retiré :**
  - « En une minute ». L'app annonce 30 à 60 s pour lire l'annonce, puis « environ une minute » pour l'analyse :
    « une minute » en tout serait faux.
  - La nuit et les messages envoyés aux vendeurs (« Toi, tu dors. utopicar, lui, écrit aux vendeurs »). C'est une
    option à part (« Messages Leboncoin », 45 € par mois en plus de Benef Pro). L'essai du service qui envoie les
    messages devait finir le 7 oct. 2026 : à vérifier en production. Et c'est une étape de plus qui embrouille le
    parcours principal. On peut la remettre en une phrase si tu y tiens.
  - Le mur d'annonces qui défile et le radar. La recherche se montre par son vrai écran, qu'on remplit.
- **Gardé :** la Polo en 3D, les chiffres de l'outil, la DA immersive (sans cadre, grosse couleur entre deux étapes,
  voix écrite en grand), la fin et la boucle.

## 7. Vérifié dans l'app et dans la base

| Ce que dit ou montre le film | Où |
|---|---|
| On colle un lien d'annonce (Leboncoin, La Centrale, AutoScout24) ; l'app récupère l'annonce et ses photos, puis l'analyse démarre seule | `web/src/components/Saisie.tsx`, `web/src/lib/analyse/import.ts`, `supabase/functions/annonce/index.ts` |
| Attente : « Lecture de l'annonce… » (30 à 60 s), puis « Analyse en cours… » (environ une minute), étapes « Cote sur les annonces comparables », « Calcul du deal : marge, offre, plafond » | `web/src/components/analyse/Patience.tsx` |
| Les quatre questions, dans cet ordre : « Fiable ? », « Des travaux ? », « Bon prix ? », « Ça rapporte ? » ; verdicts « À éviter », « Très bonne affaire » ; note sur 100 ; surtitre « Avant le premier message » | `web/src/lib/analyse/bilan.ts`, `verdicts.ts`, `web/src/components/analyse/Bilan.tsx` |
| « Offre d'ouverture », « Objectif », « Prix à ne pas dépasser » ; « Premier message, prêt à envoyer », « Copier le message » | `web/src/components/analyse/Bilan.tsx` |
| Recherche : marque, modèle, « Prix (€) », « Sous la cote d'au moins (%) », « Rechercher » ; interrupteur « Alerte e-mail » | `web/src/components/marche/RechercheMarche.tsx`, `InterrupteurAlerte.tsx` |
| E-mail : « X € sous la cote (cote Y € sur N annonces) », « Voir mes alertes sur Utopicar » ; même cote que l'analyse (`cote_marche`) | `supabase/functions/veille/index.ts` |
| Parc : « Ajouter au parc » (arrivée en « Repérée »), étapes « Repérée, Achetée, En préparation, En vente, Vendue », marge réelle = vente − achat − frais | `web/src/lib/parc.ts`, `web/src/components/benef/AjouterParc.tsx` |
| Marge minimale du profil : « Bénéfice minimum par voiture, une fois tout payé » (750 € dans la démo) | `web/src/components/analyse/ProfilAnalyse.tsx` |
| Polo à 8 990 € : cote sur 268 annonces (médiane 7 457 €) ; Fiable ? Moyen ; ≈ 400 € de travaux ; Trop cher, +1 533 € (+21 %) ; −2 490 € ; 29/100 ; 5 750 € au plus | banc de l'outil, `cote_marche` relue le 17 oct. 2026 |
| Clio à 7 650 € : cote sur 1 102 annonces (médiane 9 714 €) ; 2 064 € sous la cote (−21 %) ; 80/100 « Très bonne affaire » ; +1 050 € ; offre 7 450 € ; plafond 7 950 € | banc de l'outil, `cote_marche` relue le 17 oct. 2026 |

## 8. À vérifier avant publication

- **[À VÉRIFIER] La veille des recherches tourne en production.** Elle est appelée par une tâche planifiée, toutes les
  3 h au plus, de 7 h à 23 h.
- **[À VÉRIFIER] Recherche, alertes et parc sont réservés à Benef Pro** (79 € par mois). Le film les montre sans le
  dire. Faut-il l'écrire, ou garder ces étapes pour une vidéo Pro ?
- **[À VÉRIFIER] Le lien en bio** : la page derrière, et le code TIKTOK (3 analyses offertes) s'il est déployé.
- **La cote bouge.** Les chiffres sont ceux du 17 oct. 2026. On les relit le jour où l'on enregistre la voix.
- **Exemple d'essai.** La Polo et la Clio sont des annonces d'essai : de vrais calculs sur de faux cas, sans mention à
  l'écran (décision de l'utilisateur). Le texte ne dit jamais qu'elles sont réelles.
- **Ne pas imiter une plateforme.** L'annonce de départ est montrée sans logo ni interface de plateforme.

## 9. Suite

1. Tu valides ou corriges ce texte, phrase par phrase.
2. Planche de la scène 1, revue avec toi, puis la 2, et ainsi de suite. Chaque planche montre une image toutes les
   0,2 s de la scène, à la taille du téléphone.
3. Une fois toutes les planches validées : la voix de Simon (crédits ElevenLabs, avec ton accord), puis le film.
