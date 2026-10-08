# Brief : MO10 « La cote » (série recette 47, épisode 2)

Il achète une Clio III 3 000 € parce que la cote dit 5 800 €, et il l'affiche à la cote. Le film lui montre ce que
voit l'acheteur, neuf annonces de la même Clio, toutes moins chères, six semaines de silence et une vente sous toutes les
autres ; il repart avec la méthode des pros : garder les jumelles, prendre celle du milieu.

Écrit avec les skills recette-47, motion-studio et « L'art du hook ». Textes passés à Stop Slop. Chiffres sourcés dans
`docs/timeline-mo10.md` (consultés le 8 octobre 2026).

```
Produit / URL : aucun, rien à vendre       Objectif : arrêt net, revisionnage, enregistrement et partage spontanés
Plateforme : TikTok, puis Reels et Shorts  Public : débutants qui veulent se lancer dans l'achat-revente auto
Promesse : ce soir, tu sais fixer ton prix de revente avec les annonces jumelles de ta voiture.
CTA : aucun, ni dit ni écrit                Type / durée : motion design narratif, 29,6 s, en boucle
Voix : Simon (ElevenLabs), ton MO5          Musique : Controlled Drop, passages de MO5, 120 BPM
Ouvertures : A = son calcul + son téléphone (publiée) / B = « cote 5 800, vendue 3 200 » (réserve)
Format : 9:16, 1080×1920, 60 i/s
Voiture : Renault Clio III phase 1, 5 portes, gris (Wikimedia Commons, M 93, domaine public), détourée, sans plaque ni logo
Données : exemple chiffré, annonces réelles relevées le 8 oct. 2026, mention « Exemple · prix moyens constatés »
Interdits : produit, logos de marques et de plateformes, nom de site à l'écran, interface d'un site, plaques,
            visages, CTA, morale, « enregistre », chiffre non sourcé
```

## Hypothèse (recette v1)

- **On garde** : tout MO5 sauf la forme de l'accumulation. L'ouverture A (son calcul en deux chiffres ronds, un
  contradicteur du quotidien, aucun « parce que »), le compteur à rouleaux « MARGE » toujours à l'écran, une vraie
  voiture détourée et tracée à la lumière, l'attente (palettes, nuit, basse coupée, voix presque muette), la chute
  (deux phrases, chiffre géant, arrêt de bande, phrase de cinq mots au plus), le renversement (méthode du pro sur le
  même exemple, verdict, carte de verre), la boucle « La prochaine fois que tu te dis… », rien à vendre. Même durée
  (29,6 s), mêmes temps (minutage de MO5 au dixième), mêmes neuf coups aux mêmes instants (6,0 · 6,8 · 7,3 · 7,81 ·
  8,23 · 8,74 · 9,45 · 9,95 · 11,65), même musique aux mêmes passages, même voix, même charte, mêmes quatre caméras.
- **On change** : la forme de l'accumulation. Les neuf coups arrivent en **cartes d'annonces concurrentes** (verre de
  notre charte, jamais l'interface d'un site, aucun nom de site) qui se rangent en grille 3 × 3 autour de « ta
  carte », au lieu de notifications de débit avec vidéo et d'étiquettes collées sur la voiture. Le son de chaque coup
  suit la forme (une carte qui se pose, pas un débit bancaire) : il fait partie de la même variable. Pourquoi : le
  journal (§ 4, É2) veut savoir si la notification bancaire est un ingrédient ou un détail.
- **On saura si** : durée moyenne de visionnage et creux de la courbe de rétention entre 6 et 12 s, comparés à MO5
  (référence) et à MO9 (épisode 1, recette inchangée, notifications de débit). Règle proposée : si la part perdue
  entre 6 et 12 s dépasse celle de MO9 de 5 points ou plus, la notification est un ingrédient ; à 2 points près ou
  mieux, c'est un détail (le rythme et le compteur portent le passage). Une seule vidéo reste une hypothèse : il en
  faudra une deuxième pour en faire une règle. Il faut la courbe de MO5 et de MO9 à J+2 et J+7 (captures TikTok
  Studio).
- **Fabrication** : la couverture est tirée de l'image 0 et vérifiée en vignette de 200 px. Rendu de
  `renders/poster-mo10.png` par `window.seek(1.4)` (le calcul complet, « ? » écrit), puis réduction à 200 px de large
  et mesure : hauteur des chiffres du calcul ≥ 20 px, contraste encre / fond ≥ 7:1, rien sous le compteur de vues de
  la vignette (bas gauche), planche `renders/review/mo10-poster-200.jpg` avec les couvertures de MO5 et MO9 à la même
  taille, regardée. Avant : couverture de MO5 jamais mesurée. Après : les trois mesures notées dans le journal de
  fabrication.

**Voiture (changement imposé, noté, hors variable)** : Renault Clio III phase 1, berline 5 portes, gris platine,
1.2 16V 75 ch, présentée comme une 2009 à 165 000 km. Photo Wikimedia Commons `File:Renault Clio III 20090527
front.JPG` (M 93, domaine public), déjà détourée par l'équipe des assets : `assets/photos-mo10/car-clio3.png`, contour
`car-clio3-contour.js`, losanges, plaque et support de plaque effacés (`scripts/photos-mo10.py`), retournée pour
regarder vers la gauche. Repli de modèle : Peugeot 207. Aucun modèle de MO8. La photo tient la Clio du jour 1 et
« ta carte » ; les jumelles ont leurs propres photos (voir la timeline).

## Les cinq contrôles du sujet

| Contrôle | Réponse |
|---|---|
| Envie | Il a bien acheté : à 3 000 €, sa Clio vaut 3 690 € chez ses jumelles, soit jusqu'à 690 € avant négociation et frais. Le renversement finit sur son téléphone qui sonne. |
| Valeur | Cinq choses à garder : les quatre critères des jumelles (même moteur et même boîte, même carrosserie, ± 1 an, ± 20 000 km) ; « celle du milieu » ; les vrais prix d'une Clio III 1.2 75 en octobre 2026 (3 490 à 4 600 €) ; une cote nettement au-dessus de ces annonces ; chaque baisse de prix et chaque semaine qui coûtent. |
| Rien de proposé | Aucune fiche, aucun appel, aucune morale, aucun « enregistre ». La règle s'écrit sur une carte de verre, appliquée à sa Clio. |
| Chute | « Même l'urgent était plus cher. » surprend (il a vendu moins cher que l'annonce la plus pressée de la page) ; « La prochaine fois que tu te dis… » enchaîne sur « Tu l'achètes 3 000, la cote dit 5 800. » |
| Un calcul | Oui : « 5 800 − 3 000 = 2 800 € ? » |

## La grille de transposition

| Temps (durée MO5) | Rôle | MO5 | MO10 « La cote » | Minutage cible |
|---|---|---|---|---|
| Ouverture (4,2 s) | son calcul, puis un objet du quotidien qui le contredit | « Tu l'achètes 3 500, tu la revends 5 000. » / « Ton compte en banque n'est pas d'accord. » | « Tu l'achètes 3 000, la cote dit 5 800. » / « Ton téléphone n'a pas lu la cote. » | 0,0 → 4,2 (voix 0,08 → 3,9) |
| Image 0 | le calcul écrit, avec un « ? » | « 5 000 − 3 500 = 1 500 € ? » | « 5 800 − 3 000 = 2 800 € ? », étiquette orange « la cote » sur le 5 800, un téléphone muet dans le flou du fond | t = 0 ; « ? » écrit à 1,3 |
| Chiffre héros | ce qui roule en haut de l'écran pendant le récit | MARGE 1 500 € | MARGE 2 800 €, qui finit à 143 € | 4,0 → 18,9 (y = 300) |
| Héros visible | ce qui se couvre de ses frais | la Polo de l'utilisateur, étiquettes de prix | la Clio III (Wikimedia), une seule étiquette « 5 800 € = la cote » ; la photo devient « ta carte », case 1 de la grille ; ce sont les jumelles qui l'entourent | 4,85 → 6,0, puis grille |
| Jour 1 (1,7 s) | le moment où il se croit gagnant | « Jour 1, tu l'achètes. » | « Jour 1, tu l'affiches. » L'étiquette « 5 800 € » se pose sur la portière | 4,2 → 5,9 |
| Accumulation (6 s) | 6 à 9 coups chiffrés, un par temps, sous une forme familière | 9 notifications de débit, chacune avec sa vidéo | 9 cartes d'annonces jumelles en verre, une par temps, rangées par prix décroissant ; le compteur tombe au prix de chaque nouvelle carte | 6,0 → 11,65 |
| Gag | un coup vrai, petit et drôle | « Kebab · après la 4e visite · − 12 € » | « URGENT · cause déménagement · 3 450 € », plus petite, de travers, seule | 11,65 |
| Attente (3,6 s) | le temps vide qui coûte encore | J+1 → J+23, « Et là, personne n'appelle. » | J+1 → J+42, « Tu baisses. Tu baisses encore. » ; étiquette 5 800 → 4 900 → 3 900 ; « Toujours en ligne. Zéro appel. » ; annonce remontée − 12 €, assurance − 45 € | 12,0 → 15,6 |
| Chute (5,3 s) | deux phrases courtes, le chiffre final, la comparaison | « Il négocie. Tu acceptes. Bénéfice, 47 euros. Même pas un plein. » | « Il négocie. Tu acceptes. Bénéfice, 143 euros. Même l'urgent était plus cher. » Ta carte « Vendue · 3 200 € » tombe sous l'urgent | 15,6 → 20,9 (arrêt de bande 18,65) |
| Renversement (6,5 s) | ce que font ceux qui gagnent, sur le même exemple, avec un verdict | « Ceux qui gagnent font le calcul à l'envers. » 4 500 − 950 − 800 = 2 750 ; « À 3 500, tu passes ton tour. » | « Ceux qui gagnent ne gardent que les jumelles. » Même moteur, même boîte, même carrosserie, ± 1 an, ± 20 000 km : restent 3 590 · 3 690 · 4 500. « Celle du milieu, 3 690. » « Cote · 5 800 € » barrée. « Là, ton téléphone sonne. » | 20,9 → 27,4 |
| Boucle (2,2 s) | une demi-phrase qui ramène à l'ouverture | « La prochaine fois que tu te dis… » | la même demi-phrase, sur le retour de l'image 0 | 27,4 → 29,6 |
| Ce qu'on enregistre | la valeur | la liste des frais, la formule du prix max | la règle des jumelles et « celle du milieu » ; les vrais prix d'une Clio III 1.2 75 | 22,3 → 27,4 |
| Ce qu'on envoie | le détail qu'on montre à un pote | « Même pas un plein », le kebab | « Même l'urgent était plus cher. », la carte URGENT | 11,65 et 19,9 |
| Ce qu'on commente | ce que chacun voudra ajouter | ses propres frais oubliés | « ma cote disait tant, je l'ai vendue tant » ; le débat cote contre annonces | tout le film |

## Le hook (skill « L'art du hook »)

**Analyse** : douleur visée, il a acheté sa première voiture « sous la cote », il compte déjà sa marge, et son
téléphone ne sonne pas · croyance, « la cote dit 5 800, je la vends 5 800 » · vérité, l'acheteur ne voit pas la cote,
il voit les annonces d'à côté ; le prix se lit chez les jumelles de sa voiture.

| | Levier | Voix | Texte à l'écran | Image 0 |
|---|---|---|---|---|
| A | Croyance → vérité (mécanique MO5) | « Tu l'achètes 3 000, la cote dit 5 800. Ton téléphone n'a pas lu la cote. » | 5 800 − 3 000 = 2 800 € ? | Le calcul en Clash géant, étiquette orange « la cote » sur le 5 800, un téléphone posé dans le flou, écran allumé, muet. À 2,1 s, une carte « La même · 4 600 € » percute le 5 800. |
| B | Coût caché, résultat d'abord | « La cote disait 5 800. Six semaines plus tard, tu la vends 3 200. » | Cote 5 800 €, vendue 3 200 € | Deux étiquettes de prix face à face ; la première se barre d'un trait orange, le compteur MARGE roule déjà vers le bas. |
| C | Démonstration | « Huit Clio comme la tienne, sur la même page. La tienne est la plus chère. » | La plus chère de la page | La grille 3 × 3 déjà pleine, ta carte en tête cerclée d'orange, « 5 800 € ». |
| D | Phrase impossible à ignorer | « Ton acheteur a vu huit annonces avant la tienne. Il a appelé les huit. » | Il a appelé les huit autres | Ta carte seule au centre ; autour, huit cartes s'allument une à une, chacune avec un petit combiné qui sonne. |

**Les 4 verrous de A** :
- Temps ✅ : le sujet (« la cote ») et les deux chiffres sont dans la première phrase ; « 3 000 » est le 3e mot,
  « 5 800 » ferme la phrase.
- Sens ✅ : deux phrases courtes, voix active, chiffres ronds. Test d'isolement : « ton téléphone n'a pas lu la cote »
  ne se comprend que d'une façon, personne n'appelle.
- Miroir ✅ : c'est son calcul à lui, en « tu » : acheter « sous la cote » et compter la différence comme une marge.
- Écart ✅ : il croit tenir 2 800 € ; son téléphone dit non, sans dire pourquoi. La question « pourquoi il ne
  sonne pas ? » ne se referme qu'à 6 s, et la suivante (« combien je vais perdre ? ») à 18,6 s.

**Recommandation** : A, et seulement A à la publication. La variable de l'épisode est l'accumulation : changer aussi
l'ouverture mélangerait deux effets. B, C et D restent en réserve ; C et D sont des ouvertures « scène », utiles pour
l'épisode 4 du plan (le type d'ouverture).

**Relances du corps** : « Jour 1, tu l'affiches. » à 4,25 s (l'élan) · « À côté, la même, pneus neufs. » à 6,05 s
(nouvelle boucle : combien sont-elles ?) · « Tu baisses. » puis le silence à 12,9 s · « 143 euros. » à 18,6 s ·
« Ceux qui gagnent ne gardent que les jumelles. » à 21,0 s (la promesse d'une méthode).

## L'histoire en 7 temps

| Temps | Ce qu'on voit | Ce qu'on entend | Émotion |
|---|---|---|---|
| 0,0-4,2 · **son calcul** | « 5 800 − 3 000 = 2 800 € ? », « la cote » sur le 5 800, un téléphone muet au fond. Une carte d'annonce « La même · 4 600 € » percute le calcul. | Hook A. Glissé et choc de la carte. | reconnaissance, sourire |
| 4,2-5,9 · **jour 1, il l'affiche** | Le résultat devient le compteur MARGE 2 800 €. Palettes JOUR 1. La Clio entre, freine, son contour se trace ; l'étiquette « 5 800 € = la cote » se pose. | « Jour 1, tu l'affiches. » | élan |
| 5,9-12,0 · **les jumelles** | La Clio se range dans « ta carte », case 1 d'une grille 3 × 3. Neuf cartes jumelles tombent, une par temps, toutes moins chères ; le compteur roule à chacune : 2 800 → 450. L'urgent arrive seul, de travers. | « À côté, la même, pneus neufs. Plus récente. Distribution faite. Et un urgent, cause déménagement. » | peur qui monte, rire |
| 12,0-15,6 · **six semaines** | Nuit. Palettes J+1 → J+42. L'étiquette se barre, 4 900, puis 3 900. « Toujours en ligne. Zéro appel. » Annonce remontée, assurance. | « Tu baisses. Tu baisses encore. » Basse coupée. | peur |
| 15,6-20,9 · **la vente** | Le téléphone vibre enfin : « 3 200 € et je la prends aujourd'hui. » Virement. Ta carte « Vendue · 3 200 € » tombe sous l'urgent. « 143 € » géant. | « Il négocie. Tu acceptes. Bénéfice, 143 euros. Même l'urgent était plus cher. » Arrêt de bande, silence. | humour noir |
| 20,9-27,4 · **les jumelles, version pro** | Rembobinage jusqu'au jour 1. Fond chaud, la règle s'écrit sur une carte de verre ; les cartes hors règle sortent ; restent trois jumelles, celle du milieu s'allume : « ton prix 3 690 € ». « Cote · 5 800 € » barrée. | « Ceux qui gagnent ne gardent que les jumelles. Celle du milieu, 3 690. Là, ton téléphone sonne. » | soulagement, valeur |
| 27,4-29,6 · **la boucle** | Le calcul de l'image 0 revient dans le même cadre. | « La prochaine fois que tu te dis… » | relance |

## Les chiffres

Exemple : une Renault Clio III phase 1, 1.2 16V 75 ch essence, boîte manuelle, berline 5 portes, 2009,
165 000 km, en Île-de-France. Achetée 3 000 € à un particulier ; la cote de la version dit 5 800 €. Il l'affiche à
5 800 €, marge prévue 2 800 €. Sources, liens et hypothèses : `docs/timeline-mo10.md`.

**Règle du compteur** (pour l'animation) : MARGE = le prix le plus bas entre son étiquette et les jumelles déjà
apparues, moins 3 000, moins les frais engagés ; à la vente, prix de vente − 3 000 − frais. L'acheteur ne paiera pas
plus que la jumelle d'à côté : chaque carte moins chère fait tomber le compteur à son prix. Ses baisses (4 900, puis
3 900) restent au-dessus de la jumelle la moins chère (3 450) : elles changent l'étiquette, pas le compteur.

| Moment | Ce qui arrive (à l'écran) | Compteur « MARGE » |
|---|---|---|
| Ouverture | Achat 3 000 € · la cote dit 5 800 € | 5 800 − 3 000 = 2 800 € ? |
| Jour 1 | Affichée 5 800 € | 2 800 |
| Accumulation, 9 jumelles | 4 600 (2010 · 158 000 km · break · 4 pneus neufs) · 4 500 (2008 · 153 500 km) · 4 250 (2012 · 162 000 km) · 4 000 (2005 · 160 000 km) · 3 990 (2011 · 186 000 km · distribution neuve) · 3 690 (2009 · 146 000 km) · 3 590 (2010 · 180 500 km) · 3 490 (2012 · 162 000 km · break) · **URGENT, cause déménagement 3 450 (2009 · 230 000 km, le gag)** | 2 800 → 1 600 → 1 500 → 1 250 → 1 000 → 990 → 690 → 590 → 490 → 450 |
| Attente, J+1 → J+42 | Baisse 4 900 € (J+10) · Annonce remontée − 12 € · Baisse 3 900 € (J+30) · Assurance 6 semaines − 45 € | 450 → 438 → 393 |
| Chute | « 3 200 € et je la prends aujourd'hui. » · Virement reçu + 3 200,00 € | 393 → **143** |
| Renversement | Même moteur et même boîte · même carrosserie · ± 1 an · ± 20 000 km : restent 3 590 · 3 690 · 4 500 ; **celle du milieu, 3 690 €** ; « Cote · 5 800 € » barrée | — |

3 200 − 3 000 − 12 − 45 = **143 €**, en six semaines, pour une marge prévue de 2 800 €.

**La méthode du pro, sur le même exemple** : garder les seules jumelles (même moteur et même boîte, même carrosserie,
année à un an près, kilométrage à 20 000 km près), les ranger par prix, prendre celle du milieu. Ici : 3 590 · **3 690**
· 4 500 → son prix d'annonce est 3 690 €, et sa marge avant négociation et frais 3 690 − 3 000 = 690 €, pas 2 800.
Verdict sur l'annonce du début : « Cote · 5 800 € » barrée, « Là, ton téléphone sonne. » L'achat à 3 000 € était bon ;
le prix d'annonce l'a ruiné.

Les huit premières cartes sont de vraies annonces relevées le 8 octobre 2026 (prix demandés, année et kilométrage
réels, aucune photo ni nom de site repris) ; la neuvième est le gag, inventée et déclarée. Mention à l'écran pendant
tout le récit : « Exemple · prix moyens constatés ».

## La voix

Simon (ElevenLabs `eleven_v3`, voix `mvhJVdVoTWVUtL4keT7W`), même ton que MO5 : le pote qui en a revendu cinquante,
pince-sans-rire, jamais donneur de leçon. Prise accélérée de 10 % (`atempo`), chaque réplique posée sur son geste.
76 mots écrits (« 3 000 » compte pour deux), 22 répliques, environ 22 s de parole. Textes passés à Stop Slop ; la
personnification du hook reste, c'est la blague.

| t (s) | Réplique |
|---|---|
| 0,08 | Tu l'achètes 3 000, |
| 1,35 | la cote dit 5 800. |
| 2,55 | Ton téléphone n'a pas lu la cote. |
| 4,25 | Jour 1, |
| 4,95 | tu l'affiches. |
| 6,05 | À côté, la même, pneus neufs. |
| 7,35 | Plus récente. |
| 8,25 | Distribution faite. |
| 10,4 | Et un urgent, cause déménagement. |
| 12,9 | Tu baisses. |
| 14,2 | Tu baisses encore. |
| 16,0 | Il négocie. |
| 16,75 | Tu acceptes. |
| 17,55 | Bénéfice, |
| 18,6 | 143 euros. |
| 19,85 | Même l'urgent était plus cher. |
| 21,0 | Ceux qui gagnent ne gardent que les jumelles. |
| 23,6 | Celle du milieu, |
| 24,2 | 3 690. |
| 25,7 | Là, ton téléphone sonne. |
| 27,9 | La prochaine fois que tu te dis… |
| 29,6 | → « Tu l'achètes 3 000… » |

**Texte ElevenLabs** (nombres en lettres, balises sobres ; une prise par bloc, comme MO5) :

```
[deadpan] Tu l'achètes trois mille, la cote dit cinq mille huit cents. [short pause] Ton téléphone n'a pas lu la cote.
Jour un, tu l'affiches.
À côté, la même, pneus neufs. [short pause] Plus récente. [short pause] Distribution faite.
[short pause] Et un urgent, cause déménagement.
[pause] Tu baisses. [pause] Tu baisses encore.
Il négocie. [short pause] Tu acceptes.
Bénéfice, cent quarante-trois euros. [pause] Même l'urgent était plus cher.
[deadpan] Ceux qui gagnent ne gardent que les jumelles.
Celle du milieu, trois mille six cent quatre-vingt-dix. [short pause] Là, ton téléphone sonne.
La prochaine fois que tu te dis…
```

Contrôle de la prise : « cent quarante-trois » et « trois mille six cent quatre-vingt-dix » bien entendus à la
transcription (MO8 : « deux cent huit » entendu « deux cents vites ») ; aucune balise prononcée ; « l'urgent » avec
la liaison attendue.

**Textes à l'écran** (6 mots au plus, ils ne recopient pas la voix) :

| t (s) | Texte |
|---|---|
| 0,0 | la cote · 5 800 − 3 000 · = 2 800 € ? |
| 2,1 | La même · 4 600 € |
| 4,0 | MARGE 2 800 € · Exemple · prix moyens constatés |
| 4,25 | JOUR 1 |
| 5,4 | 5 800 € · = la cote |
| 5,9 | Ta Clio · 2009 · 165 000 km |
| 6,0 → 11,65 | une carte par jumelle : prix · année · km · un argument (4 pneus neufs, distribution neuve, break) |
| 11,65 | URGENT · cause déménagement · 3 450 € |
| 12,0 | J+1 → J+42 · Toujours en ligne. *Zéro appel.* |
| 13,1 · 14,4 | Baisse de prix · 4 900 € · Baisse de prix · 3 900 € |
| 13,7 · 14,8 | Annonce remontée · − 12 € · Assurance · 6 semaines · − 45 € |
| 15,7 | « 3 200 € et je la prends *aujourd'hui.* » |
| 17,3 | Virement reçu · + 3 200,00 € |
| 18,1 | Vendue · 3 200 € |
| 18,9 | 143 € |
| 19,9 | *Même l'urgent était plus cher.* |
| 22,5 → 23,3 | Même moteur · même boîte / Même carrosserie / ± 1 an · ± 20 000 km |
| 24,2 | *ton prix* 3 690 € |
| 25,5 | Cote · 5 800 € (barrée) |

En italique : Fraunces en dégradé orange, le mot qui porte la phrase.

## Timeline seconde par seconde (pour l'animation)

Point de départ du code : `film-mo5/film.js` et `scripts/audio-mo5.py`. Même caméra continue (A sur le calcul, B le
long des palettes, C qui suit la voiture puis la grille, F en orbite sur la carte de la règle), mêmes ressorts
fermés, `story(t)` pour le rembobinage, flou de bougé MB = 4 au rendu. Grille 3 × 3 centrée sur x = 540 :
colonnes de 248 px, x 140 → 940 ; lignes y 410 → 1430. Elle tient « ta carte » et les huit jumelles réelles ;
l'urgent n'a pas de case, il se pose en biais sur le coin bas droit de la grille, comme le kebab de MO5. Quand la
grille se réordonne (baisses, vente), les cartes glissent de case en case, l'urgent reste posé au-dessus de la
dernière. Compteur à y = 300, mention à y ≈ 372. Tout le texte reste entre y = 220 et y = 1480, et à gauche de
x = 940.

Les cartes jumelles : verre dépoli de la charte ; vignette = une vraie photo de Clio III d'une autre couleur
(Wikimedia Commons), de la carrosserie et de la phase de l'annonce : n° 2 → `annonce-5.jpg` (phase 1, 5 portes,
beige) ; n° 3 → `annonce-3.jpg` (phase 2, 5 portes, gris) ; à ajouter : trois phase 2 5 portes (n° 5, 6, 7), une
phase 1 5 portes (n° 4), deux Clio III break (n° 1, 8). Les photos 3 portes déjà prêtes (`annonce-1`, `-2`, `-4`,
`-6`) ne vont sur aucune carte : aucune annonce de la grille n'est une 3 portes. La vignette naît d'un trait de
lumière (le contour), puis la photo s'y remplit, comme les vidéos dans les notifications de MO5. Prix en Clash 64 px,
année et kilométrage en Satoshi 28 px au moins, un argument en Fraunces orange sur trois cartes. Aucune mise en page
de site d'annonces, aucun nom, aucune photo reprise des annonces elles-mêmes. Le gag n'a pas de photo. « Ta carte »
garde la photo de la Clio détourée.

| t (s) | Image | Voix | Son |
|---|---|---|---|
| 0,0 | Image 0 déjà composée : « 5 800 − 3 000 » en Clash géant (centre x = 540, y ≈ 760), « la cote » en Satoshi orange posé sur le 5 800. Au fond, flou, un téléphone posé sur une table, écran allumé, muet (vidéo réelle bleu nuit). Le trait de lumière écrit « = 2 800 € », puis le « ? » en Fraunces orange (1,3). | « Tu l'achètes 3 000, » (0,08) « la cote dit 5 800. » (1,35) | musique dès l'image 0 (mesure 13) |
| 2,1 | Une carte d'annonce « La même · 4 600 € » arrive par la droite et percute le 5 800, qui tremble. Le téléphone du fond reste noir. | « Ton téléphone n'a pas lu la cote. » (2,55-3,9) | glissé de carte, choc sur le temps ; aucune vibration |
| 4,0 | Le calcul s'efface vers le haut ; « 2 800 € » devient le compteur à rouleaux « MARGE » (y = 300), la mention s'écrit dessous. Palettes « JOUR 1 » en verre. | « Jour 1, » (4,25) « tu l'affiches. » (4,95) | palettes, clic de publication |
| 4,85 | La Clio III détourée entre par la droite et freine ; son contour se trace à la lumière (5,6-6,4). L'étiquette en papier « 5 800 € » se pose sur la portière (5,4), tampon orange « = la cote ». | | moteur léger, papier |
| 5,9 | La caméra recule et monte : la photo se range dans « ta carte » (morph), case 1 de la grille : « Ta Clio · 2009 · 165 000 km · 5 800 € ». | | souffle court |
| 6,0 | Jumelle 1 : 4 600 € · 2010 · 158 000 km · break · *4 pneus neufs*. Elle naît d'un trait, se remplit de verre, se pose en case 2. | « À côté, la même, pneus neufs. » (6,05-7,1) | carte n° 1, cran des rouleaux : 1 600 |
| 6,8 | Jumelle 2 : 4 500 € · 2008 · 153 500 km | | carte n° 2 : 1 500 |
| 7,3 | Jumelle 3 : 4 250 € · 2012 · 162 000 km | « Plus récente. » (7,35-7,9) | carte n° 3 : 1 250 |
| 7,81 | Jumelle 4 : 4 000 € · 2005 · 160 000 km | | carte n° 4 : 1 000 |
| 8,23 | Jumelle 5 : 3 990 € · 2011 · 186 000 km · *distribution neuve* | « Distribution faite. » (8,25-9,0) | carte n° 5 : 990 |
| 8,74 | Jumelle 6 : 3 690 € · 2009 · 146 000 km. La caméra recule pour voir la grille presque pleine. | | carte n° 6 : 690 |
| 9,45 | Jumelle 7 : 3 590 € · 2010 · 180 500 km | | carte n° 7 : 590 |
| 9,95 | Jumelle 8 : 3 490 € · 2012 · 162 000 km · break. « Ta carte », en tête, paraît seule et chère. | | carte n° 8 : 490 |
| 11,65 | Le gag, seul, plus petit, de travers, posé en biais sur le coin bas droit de la grille : « URGENT · cause déménagement · 3 450 € · 2009 · 230 000 km ». Arrêt d'un demi-temps dessus. | « Et un urgent, cause déménagement. » (10,4-11,7) | carte n° 9, un cran plus aiguë : 450 |
| 12,0 | La nuit tombe (voile bleu, vidéo de nuit floutée derrière la grille). Palettes J+1 qui accélèrent jusqu'à J+42. « Toujours en ligne. *Zéro appel.* » | « Tu baisses. » (12,9) | basse coupée, son passé sous 1 400 Hz (12,4 → 15,5), palettes |
| 13,1 | L'étiquette de « ta carte » se barre et se réécrit « 4 900 € » ; elle reste en tête de grille. | | trait de stylo |
| 13,7 | Petite carte sous le calendrier : « Annonce remontée · − 12 € ». | | cran : 438 |
| 14,4 | Deuxième baisse : « 3 900 € ». « Ta carte » glisse au milieu de la grille, les autres se décalent. | « Tu baisses encore. » (14,2-15,0) | trait de stylo, glissé |
| 14,8 | « Assurance · 6 semaines · − 45 € ». J+42. | | cran : 393 |
| 15,7 | Le téléphone vibre, pour la première fois du film ; bulle de verre : « 3 200 € et je la prends *aujourd'hui.* » | « Il négocie. » (16,0) « Tu acceptes. » (16,75) | vibration, la basse revient |
| 17,3 | Notification « Virement reçu · + 3 200,00 € » (montant en orange clair). | « Bénéfice, » (17,55) | |
| 18,1 → 18,9 | « Ta carte » devient « Vendue · 3 200 € » et tombe à la dernière case, sous l'urgent. Le compteur roule 393 → 143 et se fond dans un « 143 € » géant (430 px, relief) ; tout le reste s'assombrit. | « 143 euros. » (18,6-19,4) | arrêt de bande à 18,65, silence |
| 19,9 | « *Même l'urgent était plus cher.* » s'écrit à la lumière sous le 143 ; la carte URGENT (3 450 €) se rallume une demi-seconde au-dessus de la tienne. | « Même l'urgent était plus cher. » (19,85-20,85) | silence (la seule pause du film) |
| 20,9 → 22,3 | Rembobinage : lignes de balayage, la grille se défait à l'envers (cartes qui repartent, étiquette qui remonte 3 200 → 5 800) jusqu'à la Clio du jour 1 ; le compteur remonte 143 → 2 800. | « Ceux qui gagnent ne gardent que les jumelles. » (21,0-22,8) | souffle inversé ; la musique repart sur le temps à 22,0 (mesure 55) |
| 22,3 | Fond chaud. Les neuf jumelles reviennent en grille autour de « ta carte ». Carte de verre de la règle : « Même moteur · même boîte » s'écrit (22,5), aucune carte ne sort. | | feutre |
| 22,9 | « Même carrosserie » : les deux breaks se barrent et sortent. | | deux claquements sur les temps |
| 23,3 | « ± 1 an · ± 20 000 km » : 2012, 2005, 2011 et l'urgent (230 000 km) se barrent et sortent. Restent trois jumelles, qui se rangent en ligne par prix : 3 590 · 3 690 · 4 500. | | quatre claquements |
| 23,6 | La carte du milieu s'avance. « → celle du milieu » s'écrit sur la règle. | « Celle du milieu, » (23,6) | |
| 24,2 | « *ton prix* 3 690 € » s'écrit, éclair. | « 3 690. » (24,2-25,2) | les chiffres claquent |
| 25,5 | « Cote · 5 800 € » glisse dessous et se barre d'un trait orange (26,0). Le téléphone revient en petit et vibre. | « Là, ton téléphone sonne. » (25,7-26,7) | vibration courte |
| 27,45 | Retour : la règle s'efface, le calcul de l'image 0 revient dans le même cadre, téléphone muet au fond. | « La prochaine fois que tu te dis… » (27,9-29,5) | la musique boucle sur la mesure |
| 29,6 | = image 0 | → « Tu l'achètes 3 000… » | |

**Le son** : musique « Controlled Drop » calée à 120 BPM, aux passages de MO5 (mesure 13 de 0 à 18,65 s ; basse
retirée et son sous 1 400 Hz de 12,4 à 15,5 s ; arrêt de bande en 0,22 s sur « 143 » ; silence ; 0,9 s du passage
suivant à l'envers jusqu'au temps de 22,0 s ; mesure 55 jusqu'à la fin, fondu de boucle). Bruitages Mixkit, banque
`audio/bank/mo10/`, choisis sur planche (`mixkit.py search --sheet`) : glissé de carte et petit choc de verre (les
neuf jumelles, au niveau et à la place du choc de débit de MO5), cran des rouleaux, palettes, papier, trait de stylo,
vibration (réservée au téléphone : 15,7 et 25,5), souffle inversé, feutre, claquements de la règle. Un son principal
à la fois. Mix façon `audio-mo5.py` : nivellement par réplique, ducking par bande, −14 LUFS intégrés, plafond
−3,5 dBTP mesuré sur le MP4, contrôle téléphone.

## Ce qu'on enregistre, ce qu'on envoie, ce qu'on commente

- **Enregistrer** : la règle des jumelles (même moteur et même boîte, même carrosserie, ± 1 an, ± 20 000 km, celle
  du milieu), à ressortir le soir où il publie son annonce ; les vrais prix d'une Clio III 1.2 75.
- **Revoir** : les cartes tombent trop vite pour tout lire ; au deuxième passage, « 2 800 € ? » se lit autrement.
- **Envoyer** : « Même l'urgent était plus cher. » et la carte URGENT, au pote qui se fie à la cote.
- **Commenter** : « ma cote disait tant, je l'ai vendue tant » ; le débat cote contre annonces se lance seul.

## Production : les 5 étapes

Mode automatique demandé par l'utilisateur : les « OK » d'étape sont accordés d'avance, aucune question.

| Étape | Livrable | État |
|---|---|---|
| 1. Brief | ce document | fait |
| 2. Timeline et images tests | `docs/timeline-mo10.md` (chiffres sourcés, voix ; plans réels à compléter) ; 4 images tests en 1080 × 1920 (image 0, grille pleine à 11,7 s, « 143 € » à 19,9 s, règle à 24,5 s) | chiffres et voix faits |
| 3. Maquettage toutes les 0,1 s | `film-mo10/film.js` (à partir de `film-mo5/film.js`), planches `renders/review/mo10-planche-0.1s-*.jpg`, boucle mesurée | à faire |
| 4. Voix | Simon, `eleven_v3`, deux prises (environ 1 250 crédits estimés, 629 caractères par prise ; MO8 : 1 054), transcription mot à mot, `audio/vo-mo10/vo-timing.json` | à faire |
| 5. Animation, son, contrôle | `scripts/audio-mo10.py`, `qa_video.py` sans FAIL (aucun texte sous y = 1480), boucle < 1, `renders/poster-mo10.png` mesurée à 200 px, SRT | à faire |

**Publication** : ouverture A, même créneau que MO5. Légende proposée, sans CTA : « La cote disait 5 800 €. Ses
jumelles étaient à 3 690 €. Achat-revente voiture : fixer son prix de revente. Photos : Wikimedia Commons » suivi des auteurs
de `assets/photos-mo10/CREDITS.tsv` dont la licence demande un crédit (CC BY, CC BY-SA). Hashtags (jeu A débutants, `docs/hashtags_test.md`) : #achatrevente #achatreventevoiture
#voitureoccasion #entrepreneur.

## Ce qu'il me faut

Rien pour avancer. Après publication : les captures TikTok Studio de MO10 à J+2 et J+7 (vue d'ensemble, courbe de
rétention, sources du trafic), et la courbe de MO5 et de MO9 sur la même fenêtre, sans lesquelles l'hypothèse ne se
tranche pas.
