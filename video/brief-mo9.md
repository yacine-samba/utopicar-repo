# Brief : MO9 « La cote » (série recette 47, épisode 1)

Il vient d'acheter sa voiture pour la revendre. Il regarde la cote, elle dit 5 000 €, il affiche 5 000 €. La vidéo
suit l'annonce du jour 1 au jour de la vente : la caméra recule et montre les neuf annonces du même modèle autour de
la sienne, toutes moins chères ; personne n'appelle, il baisse chaque semaine, et il finit par vendre moins cher que
toutes les autres. Puis la vidéo rembobine et montre comment fixer son prix sur les annonces d'à côté.

Thème choisi avec toi le 8 octobre 2026, à la place de « Le PV » (en réserve : `brief-reserve-pv.md`).
Écrit avec les skills recette-47, motion-studio et « L'art du hook ». Textes passés à Stop Slop.

```
Produit / URL : aucun, rien à vendre       Objectif : arrêt net, revisionnage, enregistrement et partage spontanés
Plateforme : TikTok, puis Reels et Shorts  Public : débutants qui veulent se lancer dans l'achat-revente auto
Promesse : tu fixes ton prix sur les annonces d'à côté, pas sur la cote, et tu sais comment les choisir.
CTA : aucun, ni dit ni écrit                Type / durée : motion design narratif, 29,6 s, en boucle
Voix : Simon (ElevenLabs), ton de MO5      Musique : Controlled Drop, mêmes passages que MO5, 120 BPM
Ouvertures : A = « ton téléphone n'a pas lu la cote » / C = « et la tienne, à 5 000 »
Format : 9:16, 1080×1920, 60 i/s           Voiture : photo libre de droits, détourée, sans logo ni plaque
Données : exemple chiffré, « Exemple · prix moyens constatés » à l'écran, méthode sourcée
Livrables : 2 MP4 (A et C) + couverture + sous-titres SRT + pistes voix, musique, bruitages
Interdits : produit, logos de marques et de plateformes, nom de site de cote, plaques, visages, CTA, morale
```

## Pourquoi ce thème

- **Il l'a déjà vécu, ou il va le vivre.** Mettre sa voiture « au prix de la cote » est le réflexe du débutant, et
  « personne n'appelle » est sa première angoisse de vendeur (le temps fort de l'attente de MO5).
- **Le même calcul que MO5, côté vente.** MO5 démolissait « revente − achat » ; MO9 démolit « prix de vente = cote ».
  L'ouverture garde la mécanique : son chiffre, puis un objet qui le contredit.
- **La méthode est sourcée.** La cote suppose une voiture en parfait état et s'écarte du prix réel ; on compare à des
  annonces du même modèle, même moteur et même finition, avec un kilométrage et une année proches, récentes et proches
  de chez soi ([Ornikar](https://www.ornikar.com/permis/autour-voiture/achat/occasion/argus),
  [CapCar](https://www.capcar.fr/blog/la-cote-argus-est-elle-toujours-fiable), sites commerciaux, à recouper à
  l'étape 2).
- **Une valeur qui se garde.** Les trois filtres d'une annonce comparable et la règle du prix servent le soir même,
  au moment de publier.

## Hypothèse (recette v1)

- **On garde** : l'ouverture (son chiffre, un contradicteur), le compteur « MARGE », jour 1, l'attente, la chute, le
  renversement, la boucle, le minutage, la voix, la musique, la charte.
- **On change** : la forme de l'accumulation. Au lieu des neuf débits, neuf annonces voisines s'allument, une par
  temps. C'est la variable prévue pour cet épisode dans le journal, et c'est le cœur du sujet.
- **Deuxième écart, à noter** : la voiture est une photo libre, pas une voiture à toi (ingrédient 3). Si MO9 fait
  moins bien que MO5, on ne saura pas lequel des deux a pesé. Le test « recette seule », prévu avec « Le PV », passe à
  un épisode suivant.
- **On saura si** : durée moyenne et creux de la courbe entre 6 et 12 s, comparés à MO5 ; vues à J+7 dans la même
  zone que MO5 (au moins la moitié). Seuils provisoires, fixés quand on aura les chiffres complets de MO5.
- **Fabrication** : le gabarit `film-47` (le film de MO5 piloté par un fichier d'épisode), avec un nouveau module,
  **la grille qui se filtre**. Mesures : le temps entre ce brief validé et le premier maquettage complet, la fidélité
  du gabarit (MO5 rendu par le gabarit, comparé à l'original sur 10 instants), la part d'images en mouvement de la
  grille (`ref-motion.py`).

## Le hook (skill « L'art du hook »)

**Analyse** : douleur visée, son annonce est en ligne et personne n'appelle · croyance, « le bon prix, c'est la cote »
· vérité, l'acheteur ne voit jamais la cote ; il voit les annonces voisines du même modèle, et il passe la plus chère.

| | Levier | Voix | Texte à l'écran | Image 0 |
|---|---|---|---|---|
| A | Croyance → vérité (mécanique MO5) | « La cote dit 5 000, tu l'affiches à 5 000. Ton téléphone n'a pas lu la cote. » | Cote 5 000 € = prix ? | « Cote 5 000 € » écrit à la lumière, « = prix ? » dessous ; un téléphone posé, écran noir |
| B | Coût caché | « Mettre ta voiture au prix de la cote, ça ne coûte rien le premier jour. Ensuite, 200 € par semaine. » | − 200 € par semaine | Le prix de l'annonce barré, réécrit, barré, réécrit |
| C | Démonstration | « Même modèle : 4 700, 4 650, 4 590. Et la tienne, à 5 000. » | Et la tienne ? | Neuf cartes d'annonces, la sienne allumée en orange au centre |
| D | Erreur intelligente | « Les débutants sérieux vérifient tous la cote. L'acheteur, lui, ne l'a jamais vue. » | L'acheteur n'a pas vu la cote | Une cote qui s'efface derrière une grille d'annonces |

**Recommandation** : A en ouverture principale, C en test. A reprend la mécanique de MO5 avec un nouveau contradicteur
(le téléphone). C montre la grille dès l'image 0 : si elle retient mieux, la grille tient aussi comme ouverture.

**Les 4 verrous de A** :
- Temps ✅ : « la cote » et « 5 000 » dans les quatre premiers mots, le second « 5 000 » dans la même phrase.
- Sens ✅ : deux phrases courtes, aucun mot de pro.
- Miroir ✅ : c'est exactement ce qu'il a fait en publiant, en « tu ».
- Écart ✅ : il croit son prix juste ; le téléphone muet dit non, sans dire pourquoi.

**Relances dans le corps** : « Jour 1. » à 4,3 s · « Et la tienne, à 5 000. » à 9 s · « Chaque semaine, tu baisses. »
à 12,4 s · « 70 euros » à 18,6 s · « Ceux qui vendent vite… » à 21 s.

## La grille de transposition

| Temps | MO5 | MO9 |
|---|---|---|
| Ouverture | « Tu l'achètes 3 500, tu la revends 5 000. » / « Ton compte en banque n'est pas d'accord. » | « La cote dit 5 000, tu l'affiches à 5 000. » / « Ton téléphone n'a pas lu la cote. » |
| Image 0 | « 5 000 − 3 500 = 1 500 € ? » | « Cote 5 000 € = prix ? » |
| Chiffre héros | MARGE 1 500 € | MARGE 1 000 € (achetée 4 000 €, frais compris) |
| Héros visible | la Polo, étiquettes de prix | la voiture dans sa carte d'annonce ; le prix barré et réécrit, une étiquette par baisse |
| Jour 1 | « Jour 1, tu l'achètes. » | « Jour 1, tu publies. » L'annonce part en ligne. |
| Accumulation | 9 débits, chacun avec sa vidéo | 9 annonces du même modèle s'allument autour de la sienne, prix et kilométrage |
| Gag | « Kebab · après la 4e visite » | une annonce : « Échange possible contre jet-ski » |
| Attente | J+1 → J+23, « Et là, personne n'appelle. » | J+7 → J+41, une baisse de 200 € par semaine, « Toujours en vente. *Zéro appel.* » |
| Chute | « Bénéfice, 47 euros. Même pas un plein. » | « 4 200, tu acceptes. Bénéfice : 70 euros. La moins chère de toutes. » |
| Renversement | le calcul à l'envers, 2 750 € | la grille se filtre, le prix du milieu, « ton prix : 4 650 » |
| Boucle | « La prochaine fois que tu te dis… » | « La prochaine fois que tu te dis… » → « La cote dit 5 000… » |
| Ce qu'on enregistre | la liste des frais, la formule | les trois filtres, la règle du prix |
| Ce qu'on envoie | « Même pas un plein », le kebab | « La moins chère de toutes », le jet-ski |
| Ce qu'on commente | ses frais oubliés | pour ou contre la cote, ses propres baisses de prix |

## Le scénario chiffré (exemple)

Une citadine essence de 2014, boîte manuelle, 125 000 km, achetée 4 000 € frais compris. La cote dit 5 000 €. Marge
prévue : 1 000 €.

**La grille** (neuf annonces du même modèle, toutes sous 5 000 €) :

| Prix | Détail | Gardée au renversement ? |
|---|---|---|
| 4 450 € | 168 000 km | non : kilométrage trop loin |
| 4 590 € | 2014 · 131 000 km | oui |
| 4 650 € | 2014 · 124 000 km | oui |
| 4 690 € | diesel | non : autre moteur |
| 4 700 € | 2014 · 128 000 km | oui |
| 4 750 € | 2014 · 119 000 km | oui |
| 4 790 € | 2016 | non : autre année |
| 4 850 € | « échange possible contre jet-ski », boîte auto | non : autre boîte (le gag) |
| 4 900 € | 2014 · 112 000 km | oui |

**L'attente** (compteur « MARGE ») :

| Jour | Ce qui tombe | Prix affiché | Marge |
|---|---|---|---|
| Jour 1 | publication | 5 000 € | 1 000 € |
| J+7 | Baisse de prix · − 200 € | 4 800 € | 800 € |
| J+14 | Baisse de prix · − 200 € ; Annonce remontée · − 30 € | 4 600 € | 570 € |
| J+21 | Baisse de prix · − 200 € ; Assurance · 1 mois · − 35 € | 4 400 € | 335 € |
| J+30 | Annonce remontée · − 30 € | 4 400 € | 305 € |
| J+38 | Assurance · 2e mois · − 35 € | 4 400 € | 270 € |
| J+41 | « Je vois que vous l'avez baissée. 4 200 ? » | 4 200 € | **70 €** |

4 200 €, c'est moins que les neuf annonces de la grille : « la moins chère de toutes ».

**Le renversement** : les cinq annonces gardées valent 4 590, 4 650, 4 700, 4 750 et 4 900 €. Le prix du milieu est
4 700 € ; « ton prix » se place juste dessous, à **4 650 €**, soit 650 € de marge au lieu de 70, et 450 € de plus
qu'à J+41.

À l'étape 2 : un vrai modèle courant pour la photo, et une grille de prix cohérente avec ses annonces réelles du
moment, sans reproduire aucune annonce ni nommer aucun site. Les frais de l'attente reprennent les sources de MO5
(`docs/timeline-mo5.md`).

## L'histoire en 7 temps

Minutage indicatif, celui de MO5, avec une accumulation un peu plus courte et une attente plus longue (six semaines à
raconter) ; l'étape 2 le fixe à l'image près sur la grille musicale.

| Temps | Ce qu'on voit | Ce qu'on entend | Émotion |
|---|---|---|---|
| 0-4,2 s · **la cote** | Image 0 déjà composée : « Cote 5 000 € » en Clash géant, écrit à la lumière, « = prix ? » dessous, le « ? » en Fraunces orange. À côté, un téléphone posé, écran noir ; il ne s'allume pas. | « La cote dit 5 000, tu l'affiches à 5 000. Ton téléphone n'a pas lu la cote. » | sourire, question |
| 4,2-5,9 s · **jour 1** | Palettes « JOUR 1 ». La voiture entre par la droite et freine dans sa carte d'annonce en verre, prix 5 000 €. Le compteur « MARGE 1 000 € » se construit en haut. | « Jour 1, tu publies. » Palettes, petit son d'envoi. | élan |
| 5,9-10,5 s · **la grille** | La caméra recule : neuf cartes d'annonces du même modèle s'allument autour de la sienne, une par temps, chacune avec sa photo floutée, son prix et son kilométrage. Le jet-ski arrive de travers. La sienne reste la seule au-dessus de 4 900. | « Même modèle : 4 700, 4 650, 4 590. Et la tienne, à 5 000. » Une note par carte. | peur qui monte, rire |
| 10,5-15,6 s · **l'attente** | La nuit tombe, palettes J+7 → J+41. À chaque semaine, une notification « Baisse de prix · − 200 € » ; le prix de la carte se barre et se réécrit ; une étiquette se colle sur la voiture. Les petits frais tombent dessous. « Toujours en vente. *Zéro appel.* » Le compteur fond jusqu'à 270. | « Chaque semaine, tu baisses. » La musique perd sa basse ; palettes, tic-tac. | peur |
| 15,6-20,9 s · **la chute** | Le téléphone vibre enfin : « Je vois que vous l'avez baissée. 4 200 ? » Virement + 4 200 €. Le compteur roule jusqu'à 70 et se fond dans un « 70 € » géant ; la grille se rallume en arrière-plan, toutes les cartes au-dessus de la sienne. La musique s'arrête net. « *La moins chère de toutes.* » s'écrit dessous. | « Il a vu que tu baissais. 4 200, tu acceptes. Bénéfice : 70 euros. » (silence) « La moins chère de toutes. » | humour noir |
| 20,9-27,4 s · **le renversement** | Rembobinage jusqu'au jour 1 : les étiquettes se décollent, le prix remonte à 5 000, le compteur remonte. La grille revient et se filtre en trois gestes, chacun écrit sur une carte de verre : « Même moteur, même boîte » · « Kilométrage proche » · « Même année ». Les cartes écartées tombent, il en reste cinq ; leur prix du milieu s'allume (4 700). Puis : « Ton prix : 4 700 − 50 = *4 650 €* ». L'annonce à 5 000 € se barre et devient 4 650 €. | « Ceux qui vendent vite regardent les annonces d'à côté. Ton prix : 4 650. » Souffle inversé, la musique repart sur le temps, une note par filtre. | soulagement, valeur |
| 27,4-29,6 s · **la boucle** | La grille s'efface, « Cote 5 000 € = prix ? » revient dans le cadre de l'image 0. | « La prochaine fois que tu te dis… » → « La cote dit 5 000… » | boucle |

**La voix complète (provisoire, 80 mots écrits en comptant « 5 000 » pour deux ; MO5 en fait 75)** :

```
La cote dit 5 000, tu l'affiches à 5 000.
Ton téléphone n'a pas lu la cote.
Jour 1, tu publies.
Même modèle : 4 700, 4 650, 4 590.
Et la tienne, à 5 000.
Chaque semaine, tu baisses.
Il a vu que tu baissais.
4 200, tu acceptes.
Bénéfice : 70 euros.
La moins chère de toutes.
Ceux qui vendent vite regardent les annonces d'à côté.
Ton prix : 4 650.
La prochaine fois que tu te dis…
```

Ouverture C (même corps) : « Même modèle : 4 700, 4 650, 4 590. Et la tienne, à 5 000. » Le corps passe alors
directement à « Jour 1 » sans répéter la grille parlée. Je resserre la voix à l'étape 4, chronomètre en main : la
parole doit tenir en 22 s environ.

## La direction artistique

La charte de MO5, sans changement : fond #08070a, orange #ff5a1f / #ff8a4c / #ffb38a, Clash Display pour les
chiffres, Satoshi pour l'interface, Fraunces italique en dégradé orange pour le mot porteur (« prix ? », « Zéro
appel. », « La moins chère de toutes. », « 4 650 € »). Verre dépoli pour les cartes d'annonces, le compteur, les
palettes, les notifications et les filtres ; lueurs orange (la dérogation de MO5 à « pas de glow sur l'interface »,
demandée par toi le 6 octobre, est reconduite pour la série) ; grain ; caméra continue avec flou de bougé.

**Nouveau dans MO9** :
- **La grille d'annonces** : des cartes de verre de notre charte (photo floutée, prix, kilométrage, année), jamais
  l'interface d'un site d'annonces. Elles s'allument une par temps pendant que la caméra recule.
- **La grille qui se filtre** : à chaque filtre, les cartes écartées basculent et tombent dans la profondeur, les
  autres se resserrent ; le prix du milieu se trace à la lumière.
- **Le prix qui se barre** : à chaque baisse, un trait orange barre le prix de la carte et le nouveau s'écrit dessous,
  comme une annonce qu'on modifie.

**La voiture** : une photo libre de droits (Wikimedia Commons, licence et auteur notés comme pour MO8), détourée avec
`cutout.py`, contour tracé à la lumière, logos et plaque retirés. Un modèle courant qui n'apparaît pas dans la liste de
MO8 (« Les 5 moteurs »), pour ne pas brouiller les deux vidéos : par exemple une Toyota Yaris, une Dacia Sandero ou une
Opel Corsa. Je te propose deux ou trois photos à l'étape 2.

**Plans réels** (Mixkit, comme MO5) : téléphone posé la nuit, main qui fait défiler un téléphone, route de nuit. Je
réutilise ceux de MO5 qui conviennent.

## Le son

- **Musique** : Controlled Drop, les passages de MO5 (mesure 13 jusqu'à la chute, arrêt de bande sur « 70 euros »,
  souffle inversé, mesure 55 pour le renversement), recalés sur la nouvelle voix.
- **Bruitages** : écriture à la lumière, palettes, son d'envoi de l'annonce, une note par carte de la grille, trait
  qui barre le prix, vibration, cartes qui tombent au filtre. Banque Mixkit de MO5 d'abord.
- **Mix** : la méthode de MO5, −14 LUFS, plafond −3,5 dBTP avant l'encodage, contrôle sur le MP4.

## Pourquoi on la revoit, on l'enregistre et on l'envoie

- **Revoir** : la dernière phrase relance la première, et les neuf annonces passent trop vite pour toutes les lire.
- **Enregistrer** : les trois filtres d'une annonce comparable et la règle « juste sous le prix du milieu », à
  ressortir au moment de publier.
- **Envoyer** : « La moins chère de toutes » et le jet-ski, au pote qui vient de mettre sa voiture en ligne.
- **Commenter** : chacun voudra défendre la cote, ou raconter combien de fois il a baissé.

## Production : les 5 étapes

| Étape | Ce que je livre | Ce que tu valides |
|---|---|---|
| 1. Brief | ce document | « OK », ou tes changements |
| 2. Timeline et images tests | le déroulé seconde par seconde, le modèle et sa photo libre, la grille de prix, la méthode recoupée, 3 à 5 images tests en 1080×1920 (la cote, la grille, 70 €, le filtre, 4 650 €), le gabarit `film-47` vérifié sur MO5 | la DA et le déroulé |
| 3. Maquettage complet | une image toutes les 0,1 s, en planches par temps | chaque temps |
| 4. Voix off | le script final, deux prises de Simon posées sur la musique ; estimation des crédits ElevenLabs avant de générer | le texte, puis la prise |
| 5. Animation | le film, le son, le mix, `qa_video.py` sans FAIL, les 2 MP4, la couverture, les SRT | la livraison |

## Ce qu'il me faut

1. **Ton « OK » sur ce brief**, ou ce que tu changes. Et l'ouverture : A en principale (ma recommandation), ou C.
2. **Si tu as vécu ce cas** : le prix que tu avais affiché, combien de fois tu as baissé, à combien tu as vendu. Un
   exemple vécu remplace l'exemple construit.
3. **Avant la publication** (pas avant la production) : les chiffres de MO5 dans TikTok Studio, pour fixer les seuils
   de l'hypothèse.
