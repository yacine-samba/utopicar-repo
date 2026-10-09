# Brief : MO13 « Avec 1 500 € » (série recette 47, épisode 6)

Il croit qu'il faut 10 000 € pour se lancer, il en a 1 500. Le film le fait monter trois marches, une voiture à la
fois, et le compteur BUDGET passe de 1 500 à 3 100 € en douze semaines, frais payés ; il repart avec les quatre règles
de l'échelle et le prix max de sa quatrième voiture.

Écrit le 9 octobre 2026 avec les skills recette-47, motion-studio et « L'art du hook », sans porte de validation (« tout
en auto », à la demande de l'utilisateur). Voix et textes passés à Stop Slop. Chiffres et sources :
`docs/timeline-mo13.md`. ElevenLabs a bloqué le compte (« Unusual activity… Free Tier access has been disabled ») :
la voix est écrite, prête pour une génération, et le film tourne sur le minutage provisoire de ce brief jusqu'au
déblocage.

```
Produit / URL : aucun, rien à vendre       Objectif : arrêt net, revisionnage, enregistrement et partage spontanés
Plateforme : TikTok, puis Reels et Shorts  Public : débutants qui veulent se lancer dans l'achat-revente auto
Promesse : avec 1 500 €, tu peux commencer ce mois-ci, si tu montes une marche à la fois et gardes de quoi payer les frais.
CTA : aucun, ni dit ni écrit                Type / durée : motion design narratif, ≈ 31,4 s (comme MO9), en boucle
Voix : Simon (ElevenLabs, eleven_v3), × 1,2 au plus, une seule génération ; bloquée, minutage provisoire
Musique : Controlled Drop, passages de MO5, 120 BPM
Ouvertures : A = « la petite rouge d'en face est à mille deux » / B = « 1 500 au départ, 3 100 trois voitures plus tard »
Format : 9:16, 1080×1920, 60 i/s           Voitures : 206, Mégane II, Fiesta VI, photos libres (Vauxford, CC BY-SA 4.0)
Données : exemple chiffré, chaque montant sourcé (docs/timeline-mo13.md), « Exemple · prix moyens constatés » à l'écran
Interdits : produit, CTA, logos de marques et de plateformes, nom de site d'annonces, plaques, visages, morale,
            chiffre non sourcé, promesse de gain
```

## Pourquoi ce sujet

- **Le format qui marche dans la veille.** « Commencer avec peu » et « le débutant qui montre ses chiffres » :
  @global.car.business, « Commencer l'achat-revente avec 10 000 € » (483 k vues), @tkatk1, « +2 500 € en 8 jours »
  (782 k vues, 2,7 fois ses abonnés en médiane). MO13 prend le chiffre de l'un et la forme de l'autre, et retourne le
  calcul : on commence avec ce qu'on a, une voiture qu'on peut payer en gardant de quoi payer ses frais.
- **L'envie, sans redire MO5.** Ni achat raté, ni attente qui ruine, ni vente bradée : trois reventes qui marchent, de
  plus en plus haut. C'est le registre que l'utilisateur a choisi au brief de MO9 (journal, § 6).
- **La suite logique de MO10.** MO10 montre la deuxième voiture achetée trop tôt ; MO13 montre l'échelle faite dans le
  bon ordre : la deuxième s'achète quand la première est vendue.

### Les contrôles du sujet (episode.md § 1)

| Contrôle | Réponse |
|---|---|
| Envie | Il voit qu'il peut commencer ce mois-ci avec ce qu'il a déjà, et que chaque revente paie la marche suivante : 1 500 → 1 950 → 2 500 → 3 100 €. Une quatrième marche vide l'attend à la fin. |
| Valeur | Quatre éléments à garder : les quatre règles de l'échelle ; la formule budget − réserve = prix max, appliquée quatre fois (1 200, 1 550, 2 000, 2 500 €) ; les frais d'une voiture à un prix donné (carte grise selon les CV, assurance, pneus, contre-visite) ; une réserve qui grandit avec la marche (300, 400, 500, 600 €). |
| Rien de proposé | Ni fiche, ni appel, ni « enregistre », ni morale. La carte de fin applique la méthode au même exemple, rien d'autre. |
| Chute | « Budget : trois mille cent. » (la seule pause) « Et tu attendais dix mille. » Puis « La prochaine fois que tu te dis… » enchaîne sur « Dix mille pour te lancer ? ». |
| Tient dans un calcul | Son calcul : 10 000 − 1 500 = 8 500 € qui manquent. Deux chiffres ronds dans la phrase 1. |

## Hypothèse (recette v1)

- **On garde** : l'ouverture en deux temps (son calcul, puis un objet de sa vie qui le contredit), le compteur à
  rouleaux en haut de l'écran, les notifications bancaires avec leur petite vidéo, un gag, une seule pause sur le
  chiffre final, le rembobinage, la méthode appliquée au même exemple avec un verdict, la boucle, Simon, Controlled
  Drop aux passages de MO5, la charte.
- **On change** : l'échelle du récit. Trois reventes enchaînées dans un seul film, et le compteur BUDGET grandit de
  voiture en voiture, au lieu d'une seule revente (MO5, MO9) ou de deux voitures en même temps (MO10). Le compteur
  s'appelle BUDGET parce qu'il suit ce qu'il possède d'une voiture à l'autre : c'est la variable elle-même, pas une
  seconde variable.
- **On saura si** : à J+7, visionnages complets et durée moyenne (en % de la durée) comparés à MO9 (même durée, même
  registre) et à MO5 ; courbe de rétention entre 11 et 17 s (marches 2 et 3, le passage le plus dense) comparée à MO9
  aux mêmes secondes ; enregistrements et partages pour 1 000 vues comparés à MO9. Si les visionnages complets égalent
  ou dépassent ceux de MO9 sans creux supplémentaire entre 11 et 17 s, un récit à plusieurs étapes devient une forme
  possible de la série (hypothèse, à confirmer par un deuxième épisode). Seuils chiffrés quand les captures de MO5 et
  MO9 seront relevées.
- **Fabrication** : un rendu plus court. Verre dépoli (`backdrop-filter`) seulement sur les éléments visibles, et pas
  plus grands que nécessaire ; aucun flou CSS sur les grands calques. Concrètement :
  1. fonds flous (rue de l'image 0, calendrier de l'attente, calculs du renversement) floutés une fois au chargement
     dans un petit canvas (`ctx.filter`), puis affichés agrandis, sans `filter` CSS ; MO9 floutait en CSS des calques
     de 1400 × 2440 et 1880 × 2720 px à chaque image ;
  2. plus de `filter: blur()` sur un calque entier ni sur la voiture en mouvement : le flou de bougé vient du
     sur-échantillonnage (`window.shutter`, MB = 4), la profondeur de champ de copies déjà floutées ;
  3. les marches de l'escalier, grandes surfaces, en verre « peint » (dégradé, reflet, liseré) sans `backdrop-filter` ;
     le vrai verre dépoli reste sur les notifications (640 × 150 px au lieu de 780 × 184), les cellules du compteur, la
     jauge, les palettes et les cartes de la fin ;
  4. au plus trois éléments en verre dépoli visibles à la fois : une notification qui passe derrière la pile perd son
     `backdrop-filter` et garde un fond opaque équivalent ; `visibility: hidden` sous 0,002 d'opacité (déjà dans le kit).

  **Mesure** : secondes par image sur 60 images pleine définition d'un passage chargé, démarrage retiré (une image
  seule, `--range a,a`, mesure le démarrage). Après : `CUT=mo13 node scripts/render.mjs --range 13.2,14.183` (marche 2 :
  pluie de débits, compteur, jauge, voiture, deux marches à l'écran). Avant : MO9 sur `--range 14,14.983` (sa pluie de
  débits). Le 9 octobre à 1 h 35, ce rendu de MO9 ne démarre pas dans cette copie du dépôt (séquences
  `film-mo9/seq/` absentes, hors git) : le « avant » se mesure sur la copie de MO9 qui sert de point de départ à
  `film-mo13/`, séquences retéléchargées, avant toute modification (détail : `docs/timeline-mo13.md`, § 7). Noter
  « avant → après » dans le journal (§ 5), avec la durée du rendu final.
- **À noter, pas testé** : trois photos libres d'un même photographe, pas des voitures de l'utilisateur ; film de
  ≈ 31,4 s (MO9 : 31,4 s ; MO5 : 29,6 s), noté dans la ligne de l'épisode.

## Le hook (skill « L'art du hook »)

**Analyse** : douleur visée, il veut se lancer, il a 1 500 € de côté et il entend partout qu'il en faut 5 000 à 10 000
· croyance, « avec 1 500 €, je ne peux pas commencer, il me manque 8 500 € » · vérité, une voiture à 1 200 € existe
dans sa rue, et chaque revente paie la suivante si on garde de quoi payer les frais.

| | Levier | Voix | Texte à l'écran | Image 0 |
|---|---|---|---|---|
| **A** | Croyance → vérité (mécanique MO5 : son calcul, puis un contradicteur de sa vie) | « Dix mille pour te lancer ? Tu en as mille cinq cents. La petite rouge d'en face est à mille deux. » | Il te manque 8 500 € ? | « 10 000 − 1 500 » en Clash géant, « = 8 500 € ? » dessous, le « ? » en Fraunces orange, « il te manque » en petit ; derrière, une rue le soir, floue, voitures garées. Sur « la petite rouge », la 206 entre par la droite, une pancarte « À VENDRE · 1 200 € » derrière le pare-brise, et le calcul tremble. |
| B | Résultat d'abord (le format @tkatk1 de la veille) | « Mille cinq cents au départ. Trois voitures plus tard : trois mille cent. » | 1 500 € → 3 100 € | Le compteur BUDGET déjà à 3 100 €, l'escalier de verre tracé dessous, trois marches, une voiture sur la plus haute. |
| C | Coût caché | « Attendre d'avoir dix mille, c'est laisser passer trois reventes. » | Attendre = 3 reventes perdues | Une barre d'épargne « 1 500 / 10 000 € · 15 % » qui ne bouge pas ; derrière, trois voitures passent, floues. |
| D | Phrase impossible à ignorer | « Ta première voiture paie la deuxième. La deuxième paie la troisième. » | La 1re paie la 2e | Trois étiquettes de prix en escalier, 1 200 · 1 550 · 2 000 €, reliées par un fil de lumière. |
| E | Démonstration | « Mille deux. Mille cinq cent cinquante. Deux mille. Une seule mise de départ. » | Une seule mise : 1 500 € | Les trois étiquettes s'allument une à une sur le temps. |

**Recommandation** : A en ouverture principale, B en test. A garde la mécanique qui a fait MO5, MO9 et MO10 et met
le sujet, ses deux chiffres et le contradicteur dans les cinq premières secondes ; B teste le résultat d'abord, comme
le B de MO9, ce qui rend les deux tests comparables. D sert de relance écrite à la marche 2.

**Les 4 verrous de A** :
- Temps ✅ : « Dix mille » sont les deux premiers mots, « mille cinq cents » arrive avant la fin de la phrase ; le sujet
  (se lancer avec peu) est là dès la phrase 1.
- Sens ✅ : trois phrases courtes, aucun mot de pro ; on voit la petite rouge et sa pancarte au moment où on l'entend.
- Miroir ✅ : son calcul à lui, ses 1 500 €, en « tu ».
- Écart ✅ : il croit qu'il lui manque 8 500 € ; la voiture d'en face coûte moins que ce qu'il a. La phrase ne dit ni si
  ça suffit, ni comment on continue : « et après ? » reste ouvert.

**Relances dans le corps** : « Marche un. » (6,0 s) · le gag « Essence · elle était sur la réserve » (10,3 s, écrit) ·
« Marche deux. » et « La 1re paie la 2e. » écrit (12,6 s) · « Une affaire passe. Tu attends. » puis le silence
(17,1 s) · « trois mille cent » et la seule pause (21,5 s) · « Ceux qui gagnent montent marche par marche. » (25,4 s).

## La grille de transposition

Minutage cible du film (provisoire, recalé mot à mot sur la voix quand elle existera).

| Temps (cible MO13) | Rôle | MO5 (la marge fond) | MO9 (la marge tient) | **MO13 (le budget monte)** | Émotion |
|---|---|---|---|---|---|
| Ouverture (0 → 5,8 s) | son calcul, puis un objet de sa vie qui le contredit | « Tu l'achètes 3 500, tu la revends 5 000. » / « Ton compte en banque n'est pas d'accord. » | « Tu l'achètes 3 900, tu la revends 5 600. » / « Cette fois, ton compte en banque est d'accord. » | « Dix mille pour te lancer ? Tu en as mille cinq cents. » / « La petite rouge d'en face est à mille deux. » | reconnaissance, sourire |
| Image 0 | le calcul écrit, avec un « ? » | « 5 000 − 3 500 = 1 500 € ? » | « 3 900 → 5 600 ✓ » | « 10 000 − 1 500 = 8 500 € ? » (« il te manque ») | curiosité |
| Chiffre héros | ce qui roule en haut de l'écran | MARGE 1 500 € qui fond | MARGE 1 000 € qui tient | **BUDGET 1 500 €** qui baisse un peu à chaque frais et monte à chaque vente : 1 500 → 1 950 → 2 500 → 3 100 | |
| Héros visible | ce qui porte l'histoire | la Polo, couverte d'étiquettes | la Clio, qui brille de plus en plus | trois voitures sur un escalier de verre, une par marche : la 206 rouge, la Mégane grise, la Fiesta bleue ; la marche quittée garde son « vendue ✓ » | |
| Jour 1 → **Marche 1** (5,8 → 8,6 s) | le moment où il se croit gagnant | « Jour 1, tu l'achètes. » | « Jour 0, tu comptes. » | « Marche un. Tu gardes trois cents à côté. » : 1 500 se partage en 1 200 (la voiture, « prix max ✓ ») et 300 (la jauge « Réserve ») | élan |
| Accumulation → **la montée** (8,6 → 16,8 s) | 6 à 9 coups chiffrés, un par temps | 9 débits qui font fondre la marge | 7 débits tamponnés « prévu ✓ » | 11 débits en trois salves, chacun pris dans la réserve (tampon « réserve ✓ »), et trois virements : la 206 part, la caméra monte d'une marche, la Mégane arrive ; idem jusqu'à la Fiesta | plaisir qui monte, rythme |
| Gag | un coup vrai, petit et drôle | « Kebab · après la 4e visite · − 12 € » | « Kebab · pour fêter · prévu ✓ » | « **Essence · elle était sur la réserve** · − 40 € », tamponné « réserve ✓ » : la voiture était sur la réserve, il paie avec la sienne | sourire |
| Attente (16,8 → 20,0 s) | le temps vide | J+1 → J+23, « Et là, personne n'appelle. » | J+1 → J+6, « Et là, ça sonne. » | SEMAINE 8 → 11, la Fiesta n'est pas vendue ; une annonce à 1 600 € passe, tamponnée « une à la fois » : « Une affaire passe. Tu attends. » Puis les messages arrivent | tentation, maîtrise |
| Chute (20,0 → 24,4 s) | le chiffre final, la seule pause, la phrase de tous les jours | « Bénéfice, 47 euros. Même pas un plein. » | « Bénéfice : 974 euros. » / « Même le kebab était prévu. » | « Budget : trois mille cent. » (pause) « Et tu attendais dix mille. » | fierté, rire |
| Renversement (24,4 → 29,6 s) | la méthode du pro, appliquée au même exemple, avec un verdict | « Ceux qui gagnent font le calcul à l'envers. » 4 500 − 950 − 800 = 2 750 | « Tout s'est joué au jour 0. » Trois décisions | « Ceux qui gagnent montent marche par marche. » Quatre règles, chacune avec ses chiffres ; verdict : « Ta quatrième : deux mille cinq cents max. » (3 100 − 600) | soulagement, valeur, envie |
| Boucle (29,6 → 31,4 s) | une demi-phrase qui ramène à l'ouverture | « La prochaine fois que tu te dis… » | idem | idem → « Dix mille pour te lancer ? » ; dernière image = image 0 | relance |
| Ce qu'on enregistre | la valeur | la liste des frais, la formule | les trois décisions | les quatre règles, la formule budget − réserve = prix max et ses quatre résultats, les frais par voiture | |
| Ce qu'on envoie | le détail qu'on montre à un pote | « Même pas un plein », le kebab | « Même le kebab était prévu » | « Et tu attendais dix mille », au pote qui attend d'avoir assez ; « elle était sur la réserve » | |
| Ce qu'on commente | ce que chacun voudra ajouter | ses frais oubliés | sa meilleure revente | avec combien il a commencé, sa première voiture, « 1 500 € c'est pas réaliste » | |

## Le scénario chiffré (exemple)

Tout est sourcé dans `docs/timeline-mo13.md` (pages consultées le 9 octobre 2026). Île-de-France, voitures de plus de
10 ans. Aucun modèle n'est nommé à l'écran ni dans la voix.

**Départ** : 1 500 € de côté. Son calcul : il faudrait 10 000 €, il manque 8 500 €.

**Marche 1 · Peugeot 206 1.1 (4 CV), 2001, 185 000 km**
- Réserve 300 € ; prix max 1 500 − 300 = **1 200 €**. La pancarte dit 1 200 € : il l'achète.
- Frais : carte grise 152 · assurance 1 mois 40 · nettoyage 18 · **essence, elle était sur la réserve, 40** = **250 €**
  (il reste 50 € de réserve).
- Semaine 3 : annoncée 1 990 €, « 1 900 et je la prends ». Bénéfice : 1 900 − 1 200 − 250 = **450 €**.
- **BUDGET 1 950 €.**

**Marche 2 · Renault Mégane II 1.6 16V (7 CV), 2006, 195 000 km**
- Réserve 400 € ; prix max 1 950 − 400 = **1 550 €**. Annoncée 1 800 €, achetée 1 550 €.
- Frais : carte grise 255 · vidange 55 · assurance 40 = **350 €** (il reste 50 €).
- Semaine 7 : annoncée 2 590 €, « 2 450 et je la prends ». Bénéfice : 2 450 − 1 550 − 350 = **550 €**.
- **BUDGET 2 500 €.**

**Marche 3 · Ford Fiesta VI 1.25 82 ch (5 CV), 2009, 205 000 km**
- Réserve 500 € ; prix max 2 500 − 500 = **2 000 €**. Annoncée 2 300 € (pneus lisses, contre-visite), achetée 2 000 €.
- Frais : carte grise 186 · 2 pneus 100 · contre-visite 24 · assurance 40 = **350 €** (il reste 150 €).
- Semaines 8 à 11 : une annonce à 1 600 € passe. Il ne l'achète pas : une voiture à la fois.
- Semaine 12 : annoncée 3 190 €, « 2 950 et je la prends ». Bénéfice : 2 950 − 2 000 − 350 = **600 €**.
- **BUDGET 3 100 €.**

**Le compteur, pas à pas** (l'argent, plus la voiture comptée à son prix d'achat : l'achat ne le change pas) :
1 500 → 1 348 → 1 308 → 1 290 → 1 250 → **1 950** → 1 695 → 1 640 → 1 600 → **2 500** → 2 314 → 2 214 → 2 190 →
2 150 → **3 100**. La jauge « Réserve » : 300 → 50, puis 400 → 50, puis 500 → 150.

**Le chiffre final** : **3 100 €** en 12 semaines. 1 600 € de bénéfice, 950 € de frais payés, jamais plus d'une voiture.

**La méthode du pro, appliquée au même exemple** : les quatre règles, avec les chiffres de l'exemple.

| Règle | Dans l'exemple |
|---|---|
| 1 · Une voiture à la fois | 206 → vendue → Mégane → vendue → Fiesta ; l'affaire à 1 600 € passe |
| 2 · Tout le bénéfice remis dedans | + 450 · + 550 · + 600 |
| 3 · Une réserve pour les frais | 300 · 400 · 500, et les frais ont coûté 250 · 350 · 350 |
| 4 · Une marche un peu plus haute | 1 200 · 1 550 · 2 000 |

**Verdict** : marche 4, réserve 600 €. 3 100 − 600 = **2 500 € max**. Une voiture à 2 500 €, pas deux à 1 250.

Ce que la vidéo ne promet pas : le prix d'achat sous les annonces, l'offre, le délai. Les voitures pas chères, le
réservoir vide et les 12 semaines sont l'exemple, dans les fourchettes relevées. Le statut (acheter pour revendre
souvent est une activité commerciale) reste hors champ, comme dans toute la série : bénéfice compté avant impôts et
cotisations (`docs/timeline-mo13.md`, § 5).

## L'histoire en 7 temps

| Temps | Ce qu'on voit | Voix | Émotion |
|---|---|---|---|
| 0-5,8 s · **le calcul** | Image 0 composée : « 10 000 − 1 500 = 8 500 € ? » sur une rue floue. La 206 rouge entre par la droite avec sa pancarte « À VENDRE · 1 200 € » ; le calcul tremble. | « Dix mille pour te lancer ? Tu en as mille cinq cents. La petite rouge d'en face est à mille deux. » | reconnaissance, sourire |
| 5,8-8,6 s · **marche 1** | Le calcul se replie, « 1 500 € » devient le compteur BUDGET. Palettes « MARCHE 1 ». La rue s'éteint, la 206 roule sur la première marche de verre. 1 500 se partage : 1 200 vers la pancarte (« prix max ✓ »), 300 dans la jauge « Réserve ». | « Marche un. Tu gardes trois cents à côté. » | élan |
| 8,6-16,8 s · **la montée** | Trois salves de débits, chacune prise dans la jauge (tampon « réserve ✓ »), le gag « elle était sur la réserve » ; SEMAINE 3, virement, le compteur monte, la marche se trace à la lumière ; la 206 part à gauche, la caméra monte d'une marche, la Mégane arrive (« La 1re paie la 2e. ») ; idem jusqu'à la Fiesta. | « Elle part à mille neuf cents. Marche deux. Marche trois. » | plaisir qui monte |
| 16,8-20,0 s · **la tentation** | SEMAINE 8 → 11. La lumière refroidit, la basse se retire. Une annonce à 1 600 € glisse vers le compteur ; tampon « une à la fois », elle repart. Silence, puis les messages « Toujours dispo ? » s'empilent. | « Une affaire passe. Tu attends. » | tension calme, maîtrise |
| 20,0-24,4 s · **la chute** | Bulle « 2 950 et je la prends. » Virement. Le compteur roule jusqu'à 3 100 et se fond dans « 3 100 € » géant ; tout s'éteint, la musique s'arrête : la seule pause. « Et tu attendais *10 000.* » s'écrit dessous. | « Budget : trois mille cent. » (pause) « Et tu attendais dix mille. » | fierté, rire |
| 24,4-29,6 s · **marche par marche** | Rembobinage jusqu'à la marche 1. Fond chaud, quatre cartes de verre, une par temps, chacune avec ses chiffres. Puis la quatrième marche, vide, s'allume au-dessus : « 3 100 − 600 = *prix max* 2 500 € ». | « Ceux qui gagnent montent marche par marche. Ta quatrième : deux mille cinq cents max. » | soulagement, valeur, envie |
| 29,6-31,4 s · **la boucle** | Les cartes se replient, le calcul de l'image 0 revient dans le même cadre. | « La prochaine fois que tu te dis… » → « Dix mille pour te lancer ? » | relance |

## La timeline seconde par seconde

Provisoire, sur la grille de MO5 (120 BPM : un temps toutes les 0,5 s, une mesure toutes les 2 s). Les débits tombent
sur les temps, les grands moments sur les premiers temps de mesure. Tout se recale mot à mot sur la voix
(`audio/vo-mo13/vo-timing.json`), comme MO9 et MO10. Texte et voitures au-dessus de y = 1480, colonne 140 → 940,
centre x = 540. « Exemple · prix moyens constatés » à l'écran de 5,8 à 29,6 s.

| t (s) | Image | Voix | Son |
|---|---|---|---|
| 0,0 | Image 0 déjà composée : « 10 000 − 1 500 » en Clash géant, « = 8 500 € » dessous, « il te manque » en petit Satoshi gris. Fond : une rue le soir, floue (Mixkit, rue calme), lueur orange derrière les chiffres. La plume écrit le « ? » en Fraunces orange (0,2-0,9). | « Dix mille pour te lancer ? » (0,10-1,45) | musique dès l'image 0 (mesure 13) |
| 1,7 | La lumière passe sur « 1 500 ». | « Tu en as mille cinq cents. » (1,70-3,00) | scintillement |
| 2,9 | La 206 rouge entre par la droite et freine sous le calcul (3,5) ; son contour se trace à la lumière. | | moteur léger, freinage |
| 3,6 | La plume écrit la pancarte derrière le pare-brise : « À VENDRE · 1 200 € ». Le calcul tremble, le « ? » vacille. | « La petite rouge d'en face est à mille deux. » (3,30-5,50) | tracé, petit choc sur « mille deux » |
| 5,8 | Le calcul se replie vers le haut ; « 1 500 € » glisse à y = 300 et devient le compteur à rouleaux BUDGET. Palettes « MARCHE 1 ». La rue s'éteint ; la 206 roule sur la première marche de verre. | « Marche un. » (5,95-6,55) | palettes, rouleaux qui s'enclenchent |
| 6,8 | Sous le compteur, 1 500 se partage : 1 200 file vers la pancarte (« prix max ✓ »), 300 tombe dans la jauge « Réserve · 300 € ». | « Tu gardes trois cents à côté. » (6,80-8,55) | deux notes, la seconde plus haute |
| 8,5 · 9,0 · 9,5 | Débits : « Carte grise · − 152 € » (mains qui signent), « Assurance · 1 mois · − 40 € » (papiers), « Nettoyage · − 18 € » (éponge). Chacun reçoit « réserve ✓ » et vide la jauge (148, 108, 90). BUDGET 1 348, 1 308, 1 290. | | un débit par temps |
| 10,25 | Le gag, seul, plus petit, de travers : « Essence · elle était sur la réserve · − 40 € » (pompe) ; tampon « réserve ✓ » (10,5). Jauge 50, BUDGET 1 250. | | déclic de pompe, tampon, note la plus haute |
| 10,75 | Palettes « SEMAINE 3 ». Bulle : « 1 900 et je la prends. » | | vibration |
| 11,5 | « Virement reçu · + 1 900 € » (clés). Le compteur roule 1 250 → 1 950. La plume trace l'arête de la marche 1 et écrit dessus « 1 200 → 1 900 ✓ ». | « Elle part à mille neuf cents. » (11,05-12,15) | virement, note qui monte |
| 12,2 | La 206 part par la gauche. La caméra monte d'une marche (12,2-13,0) ; la Mégane grise entre par la droite et freine (13,0) ; étiquette « 1 800 € » barrée, « 1 550 € ✓ ». Jauge « Réserve · 400 € ». Écrit, en petit : « La 1re paie la 2e. » | « Marche deux. » (12,55-13,15) | moteur, palettes, rouleaux |
| 13,5 · 13,75 · 14,0 | Pluie : « Carte grise · − 255 € », « Vidange · − 55 € » (moteur), « Assurance · − 40 € ». BUDGET 1 695, 1 640, 1 600 ; jauge 145, 90, 50. | | trois débits, notes qui montent |
| 14,25 | « SEMAINE 7 ». « Virement reçu · + 2 450 € » (14,5) ; compteur → 2 500 ; arête de la marche 2 tracée, « 1 550 → 2 450 ✓ ». | | virement, note plus haute |
| 14,7 | La Mégane part. La caméra monte ; la Fiesta bleue entre (14,9) et freine (15,4) ; « 2 300 € » barré, « 2 000 € ✓ ». Jauge « Réserve · 500 € ». | « Marche trois. » (14,95-15,55) | moteur, rouleaux |
| 15,75 · 16,0 · 16,25 · 16,5 | « Carte grise · − 186 € », « 2 pneus · − 100 € » (pneu), « Contre-visite · − 24 € » (pont élévateur), « Assurance · − 40 € ». BUDGET 2 314 → 2 150 ; jauge 150. | | quatre débits |
| 16,8 | Palettes SEMAINE 8 → 11, de plus en plus lentes. La lumière refroidit ; le calendrier rayé passe flou derrière. | | la musique perd sa basse, le son passe sous 1 400 Hz |
| 17,0 | Une notification arrive par la droite : « Annonce · 1 600 € · Une affaire ? », une silhouette de voiture dedans ; elle glisse vers le compteur. | « Une affaire passe. » (17,05-18,05) | vibration |
| 17,9 | Tampon orange « une à la fois » ; la notification repart par où elle est venue (18,3). | « Tu attends. » (18,45-19,10) | tampon, seul |
| 19,2 | Silence de la voix. Les messages s'empilent en verre : « Toujours dispo ? » × 5. SEMAINE 12. | | notes de message, la basse revient (19,9) |
| 20,0 | Bulle : « 2 950 et je la prends. » | | |
| 20,5 | « Virement reçu · + 2 950 € ». | « Budget : » (20,75) | virement |
| 21,0 → 21,5 | Le compteur roule 2 150 → 3 100 et se fond dans « 3 100 € » géant (≈ 400 px, relief, dans la colonne) ; l'escalier entier, ses trois marches tracées, s'assombrit derrière. | « trois mille cent. » (21,25-22,05) | arrêt de bande à 21,5, silence |
| 22,05 → 22,85 | La seule pause. Immobile. | (silence) | silence |
| 22,9 | « Et tu attendais *10 000.* » s'écrit à la lumière sous le 3 100, en Fraunces orange. | « Et tu attendais dix mille. » (22,90-24,30) | |
| 24,5 → 25,3 | Rembobinage : lignes de balayage, la Fiesta, la Mégane, la 206 repassent à l'envers, les arêtes se défont, le compteur redescend à 1 500, palettes « MARCHE 1 ». | | bande qui rembobine, souffle inversé |
| 25,4 | Fond chaud (calculs au crayon, flou). « Marche *par marche.* » | « Ceux qui gagnent montent marche par marche. » (25,40-27,40) | la musique repart sur le premier temps de 26,0 (mesure 55) |
| 26,0 · 26,5 · 27,0 · 27,5 | Quatre cartes de verre, une par temps : « 1 · Une voiture à la fois » (trois pictogrammes de voiture, 1 → 2 → 3) · « 2 · Tout le bénéfice remis dedans » (+ 450 · + 550 · + 600) · « 3 · Une réserve pour les frais » (300 · 400 · 500) · « 4 · Une marche un peu plus haute » (1 200 · 1 550 · 2 000). | | une note par carte, qui monte |
| 27,9 | Au-dessus, la quatrième marche, vide, s'allume : « Marche 4 ». La formule s'écrit ligne par ligne : budget 3 100 (28,1) · − réserve 600 (28,35) · trait (28,6) · « *prix max* 2 500 € » (28,8), éclair. | « Ta quatrième : deux mille cinq cents max. » (27,75-29,55) | les chiffres claquent sur les temps |
| 29,6 | Les cartes et l'escalier se replient ; « 10 000 − 1 500 = 8 500 € ? » revient dans le cadre exact de l'image 0, la rue floue derrière. | « La prochaine fois que tu te dis… » (29,75-31,35) | la musique boucle sur la mesure |
| 31,4 | = image 0 | → « Dix mille pour te lancer ? » | |

## La voix

Simon (`mvhJVdVoTWVUtL4keT7W`), eleven_v3, même ton que MO5 : le pote pince-sans-rire qui en a revendu cinquante.
**Une seule génération** (generations_count = 1), ouverture B dite à la fin du même texte après une pause (méthode de
MO10). Pose : × 1,2 au plus (MO9 à × 1,25 jugé « trop rapide »), 0,2 à 0,4 s entre les phrases, pauses internes
ramenées à 0,10-0,30 s, mots horodatés par faster-whisper *medium* et bornes recalées sur l'enveloppe à 20 ms
(journal, § 6), une réplique de trop coupée au montage plutôt que régénérée. Script de pose : `scripts/vo-mo13.py`
(sur le modèle de `vo-mo10.py`) ; tant que la prise n'existe pas, il écrit un `vo-timing.json` provisoire avec les temps
ci-dessous, pour que le film tourne déjà.

### Le script minuté

67 mots écrits (en comptant « 1 500 » pour deux, comme MO5), 73 mots dits, 15 répliques. Les créneaux provisoires
totalisent 19,3 s de parole ; dite par Simon, elle devrait prendre 21 à 23 s (MO10 : 76 mots dits, 24,2 s). La pose
élargira les créneaux en prenant sur les silences de la montée (8,6-11,0 et 13,2-14,9 s), pas sur l'attente ni sur la
pause.

| # | Réplique | t (s), provisoire | Mots écrits | Vitesse |
|---|---|---|---|---|
| 1 | Dix mille pour te lancer ? | 0,10-1,45 | 5 | × 1,15 |
| 2 | Tu en as mille cinq cents. | 1,70-3,00 | 5 | × 1,15 |
| 3 | La petite rouge d'en face est à mille deux. | 3,30-5,50 | 9 | × 1,15 |
| 4 | Marche un. | 5,95-6,55 | 2 | × 1,2 |
| 5 | Tu gardes trois cents à côté. | 6,80-8,55 | 5 | × 1,2 |
| 6 | Elle part à mille neuf cents. | 11,05-12,15 | 5 | × 1,2 |
| 7 | Marche deux. | 12,55-13,15 | 2 | × 1,2 |
| 8 | Marche trois. | 14,95-15,55 | 2 | × 1,2 |
| 9 | Une affaire passe. | 17,05-18,05 | 3 | × 1,15 |
| 10 | Tu attends. | 18,45-19,10 | 2 | × 1,15 |
| 11 | Budget : trois mille cent. | 20,75-22,05 | 3 | × 1,15 |
| 12 | Et tu attendais dix mille. | 22,90-24,30 | 5 | × 1,15 |
| 13 | Ceux qui gagnent montent marche par marche. | 25,40-27,40 | 7 | × 1,2 |
| 14 | Ta quatrième : deux mille cinq cents max. | 27,75-29,55 | 5 | × 1,2 |
| 15 | La prochaine fois que tu te dis… | 29,75-31,35 | 7 | × 1,15 |

Si la prise dépasse 31,5 s une fois posée à × 1,2 : couper d'abord la pause interne de la réplique 11, puis raccourcir
le silence de l'attente (19,1-20,7 s), jamais la seule pause (22,05-22,85 s).

### Texte ElevenLabs

Le texte exact, pour **une** génération. Nombres en lettres, balises eleven_v3 sobres (celles de MO9 et MO10).
528 caractères, soit environ 530 crédits (MO10 : 580 pour un texte de même longueur ; estimation à refaire au
déblocage, sans relancer en cas d'échec).

```
Dix mille pour te lancer ? Tu en as mille cinq cents. [deadpan] La petite rouge d'en face est à mille deux.
Marche un. Tu gardes trois cents à côté.
Elle part à mille neuf cents.
Marche deux.
Marche trois.
Une affaire passe. [short pause] Tu attends.
Budget : [short pause] trois mille cent.
[deadpan] Et tu attendais dix mille.
Ceux qui gagnent montent marche par marche.
Ta quatrième : deux mille cinq cents max.
La prochaine fois que tu te dis…
[pause]
Mille cinq cents au départ. Trois voitures plus tard : trois mille cent.
```

À contrôler sur la prise (transcription *medium*, puis à l'oreille) : « mille deux » (et non « mille deux cents »),
« mille neuf cents », « trois mille cent » dit d'un bloc, « max » prononcé « maxe ». Ouverture B posée à part
(`vo-placed-B.wav`) : la dernière phrase à 0,10 s, à la place des répliques 1 à 3.

### Les textes à l'écran

Séparés de la voix, six mots au plus chacun.

| Moment | Texte |
|---|---|
| Image 0 (hook) | 10 000 − 1 500 · = 8 500 € ? · il te manque |
| Ouverture | À VENDRE · 1 200 € |
| Compteur, jauge | BUDGET · Réserve · 300 € · prix max ✓ |
| Palettes | MARCHE 1 · MARCHE 2 · MARCHE 3 · SEMAINE 3 · SEMAINE 7 · SEMAINE 8 → 12 |
| Débits marche 1 | Carte grise · − 152 € · Assurance · 1 mois · − 40 € · Nettoyage · − 18 € |
| Le gag | Essence · elle était sur la réserve · − 40 € |
| Tampons | réserve ✓ · une à la fois |
| Ventes | 1 900 et je la prends. · 2 950 et je la prends. · Virement reçu · + 1 900 € |
| Marches | 1 200 → 1 900 ✓ · 1 800 € barré, 1 550 € ✓ · La 1re paie la 2e. |
| Débits marches 2 et 3 | Vidange · − 55 € · 2 pneus · − 100 € · Contre-visite · − 24 € |
| La tentation | Annonce · 1 600 € · Une affaire ? · Toujours dispo ? |
| Chute | 3 100 € · Et tu attendais 10 000. |
| Renversement | Marche par marche. · 1 · Une voiture à la fois · 2 · Tout le bénéfice remis dedans · 3 · Une réserve pour les frais · 4 · Une marche un peu plus haute |
| Verdict | Marche 4 · 3 100 − 600 · prix max 2 500 € |
| Tout le récit | Exemple · prix moyens constatés |

Mot porteur en Fraunces italique orange : « ? » (image 0), « par marche. », « 10 000. », « prix max », « une à la
fois ».

### Passage à Stop Slop

- « Il négocie. Tu acceptes. » retiré : la bulle le montre, et il fallait de la place pour la tentation.
- « Vendue mille neuf cents » devient « Elle part à mille neuf cents » : une phrase active, comme « La première part en
  huit jours » de MO10.
- « Ceux qui gagnent montent une marche à la fois » devient « marche par marche » (deux mots de moins, le titre de la
  carte en sort).
- Ouverture C : « Pas besoin de 10 000, il te faut… » (contraste « pas X, mais Y ») réécrit en un coût concret, « laisser
  passer trois reventes ».
- Aucun adverbe, aucun tiret long, pas de chute en maxime : « Et tu attendais dix mille » rappelle la phrase 1, comme le
  voisin de MO10. Gardés exprès : les fragments « Marche deux. Marche trois. » (le rythme de la montée) et la
  personnification de l'ouverture (« la petite rouge »), qui est la blague.
- Note : franchise 9, rythme 8, confiance 9, naturel 8, densité 9, soit 43 / 50.

## La voiture

Trois voitures, une par marche, trois photos libres du même photographe (Vauxford, Wikimedia Commons,
**CC BY-SA 4.0**) : même angle (trois quarts avant, objectif bas), même lumière, retournées pour que l'avant regarde
vers la gauche. Aucune Twingo, 207, Clio IV, Sandero, Clio III ni C3 (prises par MO9 à MO12).

| Marche | Voiture | Fichiers | Crédit |
|---|---|---|---|
| 1 | Peugeot 206 rouge, 3 portes (photo d'une 206 L 1.1 de 2000 ; l'exemple dit 2001) | prête : `assets/cars-libres/car-206.png`, `car-206-contour.js` | [2000 Peugeot 206 L 1.1 Front](https://commons.wikimedia.org/wiki/File:2000_Peugeot_206_L_1.1_Front.jpg), Vauxford, CC BY-SA 4.0 |
| 2 | Renault Mégane II grise, 3 portes, phase 2 (2006-2008) | original : `assets/photos-mo13/src/wm-megane2.jpg` (1920 × 981) ; à faire : `assets/photos-mo13/car-megane2.png` + contour | [2007 Renault Megane Dynamique 1.6 Front](https://commons.wikimedia.org/wiki/File:2007_Renault_Megane_Dynamique_1.6_Front.jpg), Vauxford, CC BY-SA 4.0 |
| 3 | Ford Fiesta VI bleue, 5 portes | original : `assets/photos-mo13/src/wm-fiesta6.jpg` (1920 × 959) ; à faire : `assets/photos-mo13/car-fiesta6.png` + contour | [2010 Ford Fiesta Edge 1.2 Front](https://commons.wikimedia.org/wiki/File:2010_Ford_Fiesta_Edge_1.2_Front.jpg), Vauxford, CC BY-SA 4.0 |

Préparation : `film-mo13/photos.py`, sur le modèle de `scripts/cars-libres-206.py` (losange de la Mégane, ovale et
logos d'enjoliveurs de la Fiesta, plaques effacés ; voiture garée derrière la Mégane et poubelles derrière la Fiesta
retirées du masque ; retournement, BiRefNet, bords décontaminés, étalonnage dans la charte, contour vectoriel). Crédits :
`assets/photos-mo13/CREDITS.tsv` ; dans la légende du post : « Photos : Vauxford, CC BY-SA 4.0, Wikimedia Commons ».
Les originaux de `src/` restent hors git (comme `photos-mo9/src/` : la ligne `.gitignore` s'ajoute avec le commit de
l'épisode). La pancarte « À VENDRE · 1 200 € » est un calque du film, pas une retouche de la photo.

## La direction artistique

La charte de MO5 : fond #08070a, orange #ff5a1f / #ff8a4c / #ffb38a, seule couleur d'accent ; Clash Display pour les
chiffres, Satoshi pour l'interface, Fraunces italique en dégradé orange pour le mot porteur ; grain, vignettage, lueurs
orange (la dérogation de MO5, reconduite pour la série) ; caméra continue avec flou de bougé, ressorts fermés de
`lib/motion.js`. Construit sur `lib/kit47.js` (lu, jamais modifié) à partir d'une copie de `film-mo9/` ; les modules
nouveaux vont dans `film-mo13/`.

**Nouveau dans MO13** :
- **L'escalier de verre** : trois marches, plus une quatrième vide à la fin. Chaque marche naît d'un trait : la plume
  trace son arête au moment de la vente et y écrit « achat → revente ✓ ». La caméra monte d'une marche à chaque
  voiture (grue continue, sans coupe). Les marches sont du verre peint (dégradé, reflet, liseré), sans
  `backdrop-filter` (voir Fabrication).
- **Le compteur BUDGET** : les rouleaux de MO5, qui descendent un peu à chaque frais et remontent d'un cran à chaque
  vente. Lisible à 360 px de large.
- **La jauge « Réserve »** : la jauge « frais prévus » de MO9, remplie à 300, 400 puis 500 € au début de chaque marche,
  vidée par les débits. On voit qu'il en reste à chaque fois.
- **Le partage du budget** : à la marche 1, « 1 500 » se coupe en deux, 1 200 vers la pancarte, 300 vers la jauge.
- **La pancarte « À VENDRE · 1 200 € »** derrière le pare-brise, écrite par la plume.
- **Le tampon « une à la fois »** sur l'annonce qui tente.

MO5 glissait vers la nuit, MO9 allait vers le jour. MO13 monte : la caméra s'élève, la lumière reste chaude, sauf
pendant la tentation (elle refroidit, puis revient avec les messages).

## Le son

- **Musique** : Controlled Drop recalé à 120 BPM. Mesure 13 dès l'image 0 ; la basse se retire pendant la tentation
  (16,8-19,9 s, son passé sous 1 400 Hz) puis revient avec les messages ; arrêt de bande sur « trois mille cent »
  (21,5 s), silence pendant la seule pause ; passage suivant à l'envers jusqu'au temps de 26,0 s ; mesure 55 jusqu'à
  la fin, fondu de boucle. Temps lus dans `vo-timing.json`, comme MO9.
- **Bruitages** (banques Mixkit de MO5, MO6 et MO9 d'abord, `audio/bank/mo13/`) : écriture à la lumière, un débit par
  temps, tampon, virement, une note par vente qui monte (trois ventes, trois notes de plus en plus hautes), moteur et
  freinage de chaque voiture, déclic de pompe pour le gag, vibrations, palettes, rouleaux. Un son principal à la fois.
- **Mix** : `scripts/audio-mo13.py` sur le modèle de `audio-mo9.py` (nivellement par réplique, ducking par bande,
  limiteur), −14 LUFS, plafond −3,5 dBTP avant l'encodage, contrôle sur le MP4 (`docs/mix_report-mo13.txt`).

## Les plans vidéo réels souhaités

Mixkit (licence libre, usage commercial, sans crédit obligatoire), peints sur canvas en séquences JPG à 30 i/s,
**sans visage** ; choisis sur planche étiquetée, trois images regardées par clip. Détail et commandes :
`docs/timeline-mo13.md`, § 6.

| Où | Mots-clés Mixkit | Candidats |
|---|---|---|
| Fond de l'image 0 (la rue « d'en face »), flou | calm street, parked cars, street at dusk | 4348, 22916 |
| Chaque achat | car keys, key handover | 34140, 45301 |
| Cartes grises, assurances | signing documents, paperwork | 241 (deux passages) |
| Nettoyage | car wash sponge | 47585 |
| Le gag (essence) | fuel nozzle, gas station | 31961 |
| Vidange | engine, mechanic hands | 4716 |
| Pneus | tire change | 45755 |
| Contre-visite | car lift | 13260 |
| La tentation, les messages | phone in hand | 42136 |
| Fond de l'attente, flou | calendar | 38501 |
| Fond du renversement, flou | calculator, notes | 49219 |

## Ce qu'on enregistre, ce qu'on envoie, ce qu'on commente

- **Enregistrer** : les quatre règles avec leurs chiffres ; la formule budget − réserve = prix max et ses quatre
  résultats (1 200, 1 550, 2 000, 2 500 €) ; ce que coûte une voiture à 1 200, 1 550 ou 2 000 € en frais (250 à 350 €).
  On la ressort le jour où on regarde sa première annonce.
- **Envoyer** : « Et tu attendais dix mille », au pote qui attend d'avoir assez ; « elle était sur la réserve ».
- **Commenter** : avec combien il a commencé, sa première voiture, ou « 1 500 €, c'est pas réaliste » (la réponse est
  dans les sources).

## Production : les 5 étapes

Enchaînées sans porte de validation, à la demande de l'utilisateur.

| Étape | Ce qui est livré | État au 9 octobre |
|---|---|---|
| 1. Brief | ce document | fait |
| 2. Timeline et sources | `docs/timeline-mo13.md` ; originaux des photos et crédits (`assets/photos-mo13/`) ; images tests de l'image 0, de la marche 2, du 3 100 € et du verdict | sources faites ; images tests à faire |
| 3. Maquettage | `film-mo13/` (copie de `film-mo9/`, sur `lib/kit47.js`), `timeline-mo13.json`, planches toutes les 0,1 s (`CUT=mo13 node scripts/sheet.mjs`), instants choisis (`at.mjs`) | à faire, sur le minutage provisoire |
| 4. Voix | texte ci-dessus, une génération, pose par `scripts/vo-mo13.py` | **bloquée** (ElevenLabs) : texte prêt, minutage provisoire |
| 5. Son, rendu, contrôle | `scripts/audio-mo13.py`, rendu 60 i/s MB = 4 en morceaux, `qa_video.py` sans FAIL, boucle mesurée, couverture (l'image 0 ou le 3 100 €, vérifiée à 200 px), `scripts/srt-mo13.py`, `docs/review_log-mo13.md` | à faire après la voix ; un seul Chromium à la fois de ce côté, aucun rendu final `--all` tant que les trois épisodes tournent |

## Ce qu'il me faut

1. **Débloquer ElevenLabs** (message reçu : « Unusual activity… Free Tier access has been disabled ») : un abonnement
   payant ou un autre compte. Ensuite, une génération d'environ 530 crédits ; rien n'est relancé sans toi.
2. Rien d'autre à valider : le reste avance seul. Si tu as commencé petit toi-même, tes vrais chiffres (budget de
   départ, première voiture, frais, délai) remplacent l'exemple.
