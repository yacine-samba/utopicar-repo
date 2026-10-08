# Brief : MO9 « Le PV » (série recette 47, épisode 1)

Il prend la moins chère pour faire le double, achetée 1 500 et revendue 3 000, et chaque réparation qu'il paie
ensuite était déjà écrite sur le procès-verbal du contrôle technique que le vendeur lui a donné avec les clés. Il
repart avec la lecture d'un PV (critique, majeure, mineure), le prix de six réparations courantes sur une citadine et
le calcul du prix max avec une ligne « PV chiffré ».

Écrit avec les skills recette-47, motion-studio et « L'art du hook ». Textes passés à Stop Slop. Montants sourcés dans
`docs/timeline-mo9.md` (consultés le 8 octobre 2026). Production « tout en auto » à la demande de l'utilisateur
(8 octobre 2026) : les « OK » des étapes sont accordés d'avance.

```
Produit / URL : aucun, rien à vendre       Objectif : arrêt net, revisionnage, enregistrement et partage spontanés
Plateforme : TikTok, puis Reels et Shorts  Public : débutants qui veulent se lancer dans l'achat-revente auto
Promesse : le vendeur te donne la liste de ses réparations avec les clés ; lue avant le prix, elle fixe ton prix max.
CTA : aucun, ni dit ni écrit                Type / durée : motion design narratif, 29,6 s, en boucle
Voix : Simon (ElevenLabs), ton MO5          Musique : Controlled Drop, passages de MO5, 120 BPM
Ouvertures : A = « ta boîte à gants » (publiée) / B = « il t'a donné la liste » (même corps, en réserve)
Format : 9:16, 1080×1920, 60 i/s           Données : exemple chiffré, sourcé, mention « Exemple · prix moyens constatés »
Voiture : Peugeot 206 L 1.1 3 portes de 2000 (phase 1), photo Wikimedia Commons « 2000 Peugeot 206 L 1.1 Front.jpg »,
          Vauxford, CC BY-SA 4.0, détourée, sans plaque ni logo (repli : Renault Clio II)
Interdits : produit, logos de marques et de plateformes, plaques, visages, CTA, morale, « enregistre », chiffre non sourcé
```

## Hypothèse (recette v1)

- **On garde** : les 9 ingrédients de la recette v1, sans retouche. Ouverture « son calcul en deux chiffres ronds + un
  contradicteur du quotidien », compteur « MARGE » toujours à l'écran, vraie voiture couverte d'étiquettes de prix,
  accumulation en notifications de débit avec un gag, attente qui coûte, chute en deux phrases courtes puis chiffre
  final et phrase en Fraunces, renversement appliqué au même exemple avec un verdict, boucle, rien à vendre. Même voix,
  mêmes passages de musique, même durée (29,6 s), même charte, même créneau de publication que MO5.
- **On change** : aucune variable (seul le sujet change). Le plan d'expériences du journal (É1) veut savoir si la
  recette se transporte sur un autre calcul que « revente moins achat ». Changements imposés, notés dans le journal,
  sans compter comme variable : la voiture (une 206 de Wikimedia Commons au lieu de la Polo) ; le chiffre final négatif
  (cas prévu par l'ingrédient 6, « Tu as payé pour la vendre. »).
- **On saura si** : vues à J+7 et part encore là à 3 s, comparées à MO5. La recette se transporte si MO9 passe
  3 000 vues à J+7 (la moitié des plus de 6 000 de MO5) avec une part à 3 s à 5 points près de celle de MO5. Elle ne
  se transporte pas si MO9 reste au niveau des carrousels (1 000 vues ou moins). Entre les deux : sans signal, on
  attend É2. La part à 3 s de MO5 se relève avant la publication de MO9 (journal, § 3). À noter aussi : partages pour
  1 000 vues (la pizza, « tu as payé pour la vendre ») et enregistrements pour 1 000 vues (la carte du PV chiffré).
- **Fabrication** : étiquettes de prix au-dessus de y = 1480 (zones sûres). Avant (MO5) : avertissement zones sûres de
  `qa_video.py` de 5,5 à 18,75 s, étiquettes dans la zone basse, pile de notifications contre la marge droite. Cible :
  aucun texte sous y = 1480 ni à droite de x = 940 sur les 29,6 s, mesuré par `qa_video.py` (zéro avertissement
  texte). Moyens : voiture posée roues à y ≈ 1460, étiquettes ancrées sur la moitié haute de la carrosserie
  (y 1040 → 1420, tableau `TAGS`), pile de notifications dans la colonne x 160 → 900, planche 0,1 s regardée avec les
  deux lignes de zone sûre tracées.

## Les 5 contrôles du sujet

Repartis de la ligne « Le PV » de `sujets.md` : croyance « la moins chère rapporte le plus : achetée 1 500, revendue
3 000, le double » ; vérité « le PV du contrôle technique listait déjà les réparations » ; méthode « lire le PV avant
le prix : mineure, majeure, critique, et chiffrer chaque majeure » ; chute « une marge négative, tu as payé pour la
vendre, et tout était écrit sur le PV ».

1. **Envie** ✅ : le PV, chaque vendeur d'une voiture de plus de 4 ans doit le lui remettre. Lu avant le prix, c'est
   un devis gratuit. Il repart avec un outil qu'il aura entre les mains dès la première visite.
2. **Valeur** ✅ : trois éléments à retrouver le jour J. Les trois niveaux d'un PV et ce qu'ils imposent (critique :
   elle ne roule plus après minuit le jour du contrôle ; majeure : contre-visite sous deux mois ; mineure : rien
   d'obligatoire). Le prix moyen de six réparations majeures sur une 206. Le calcul du prix max avec la ligne
   « PV chiffré ».
3. **Rien de proposé** ✅ : ni fiche, ni appel, ni morale. La carte du PV chiffré reste à l'écran le temps d'être
   lue, sans invitation à l'enregistrer.
4. **Chute** ✅ : la marge passe sous zéro, « Tu as payé pour la vendre. » surprend ; « La prochaine fois que tu te
   dis… » enchaîne sur « Tu l'achètes 1 500… ».
5. **Le sujet tient dans un calcul** ✅ : 3 000 − 1 500 = 1 500, « le double ».

## La grille de transposition

| Temps (durée MO5) | Rôle | MO5 | MO9 « Le PV » |
|---|---|---|---|
| Ouverture (0 → 4,2 s) | son calcul, puis un objet du quotidien qui le contredit | « Tu l'achètes 3 500, tu la revends 5 000. » / « Ton compte en banque n'est pas d'accord. » | « Tu l'achètes 1 500, tu la revends 3 000. » (0,08-2,3) / « Ta boîte à gants n'est pas d'accord. » (2,55-3,7). À 2,1 s le PV jaillit de la boîte à gants et percute le calcul. |
| Image 0 | le calcul écrit, avec un « ? » | « 5 000 − 3 500 = 1 500 € ? » | « 3 000 − 1 500 = 1 500 € ? » ; derrière, floue, une boîte à gants entrouverte, le coin d'un papier qui dépasse |
| Chiffre héros | ce qui roule en haut de l'écran pendant tout le récit | MARGE 1 500 € | MARGE 1 500 €, compteur à rouleaux à y = 300, qui passe sous zéro (le « − » entre en orange) |
| Héros visible | ce qui se couvre de ses frais | la Polo, étiquettes de prix | la Peugeot 206 (Wikimedia Commons), 10 étiquettes posées au-dessus de y = 1480 ; le PV plié rangé dans la portière |
| Jour 1 (4,2 → 5,9 s) | le moment où il se croit gagnant | « Jour 1, tu l'achètes. » | « Jour 1, tu l'achètes. » La 206 arrive, le PV se replie et disparaît dans la portière ; étiquette « PV · pas lu » |
| Accumulation (5,9 → 12,0 s) | 6 à 9 coups chiffrés, un par temps, sous une forme familière | 9 notifications de débit, chacune avec sa vidéo | 7 notifications de débit (6,0 · 6,8 · 7,3 · 7,81 · 8,5 · 9,95 · 11,65), chacune avec sa vidéo ; cinq portent une pastille « PV » |
| Gag | un coup vrai, petit et drôle | « Kebab · après la 4e visite · − 12 € » | « Pizza · le pote qui tenait la lampe · − 12 € », juste après l'ampoule à 4 € : la pizza coûte trois fois la réparation |
| Attente (12,0 → 15,6 s) | le temps vide qui coûte encore | J+1 → J+23, « Et là, personne n'appelle. » | J+1 → J+16 au garage, « Et là… pièce en commande. » ; assurance, amortisseurs (la pièce arrive), contre-visite « Favorable » |
| Chute (15,6 → 20,9 s) | deux phrases courtes, le chiffre final, la phrase concrète | « Il négocie. Tu acceptes. Bénéfice, 47 euros. Même pas un plein. » | « Il lit le PV. Tu baisses. Bénéfice, moins 73 euros. Tu as payé pour la vendre. » |
| Renversement (20,9 → 27,4 s) | ce que font ceux qui gagnent, appliqué au même exemple, avec un verdict | « Ceux qui gagnent font le calcul à l'envers. » 4 500 − 950 − 800 = 2 750 ; « À 3 500, tu passes ton tour. » | « Ceux qui gagnent lisent le PV avant le prix. » Les étiquettes retournent sur leurs lignes du PV ; 2 700 − 1 040 − 230 − 500 = 930 ; « À 1 500, tu passes ton tour. » |
| Boucle (27,4 → 29,6 s) | une demi-phrase qui ramène à l'ouverture | « La prochaine fois que tu te dis… » | « La prochaine fois que tu te dis… » ; la boîte à gants se referme derrière le calcul de l'image 0 |
| Ce qu'on enregistre | la valeur | la liste des frais, la formule du prix max | la carte du PV chiffré (trois niveaux, six majeures et leurs prix), le calcul avec « PV chiffré » |
| Ce qu'on envoie | le détail qu'on montre à un pote | « Même pas un plein », le kebab | « Tu as payé pour la vendre », la pizza du pote qui tenait la lampe |
| Ce qu'on commente | ce que chacun voudra ajouter | ses propres frais oubliés | la pire ligne lue sur un PV, ses propres majeures, le prix de sa dernière contre-visite |

## Le hook (skill « L'art du hook »)

**Analyse** : douleur visée, il démarre avec peu d'argent et a peur que sa première voiture lui coûte plus qu'elle ne
rapporte · croyance, « la moins chère rapporte le plus : achetée 1 500, revendue 3 000, le double » · vérité, le
vendeur lui a donné la liste des réparations avec les clés, le PV du contrôle technique ; chiffrée, elle mange toute
la marge.

| | Levier | Voix | Texte à l'écran | Image 0 |
|---|---|---|---|---|
| A | Croyance → vérité (mécanique MO5) | « Tu l'achètes 1 500, tu la revends 3 000. Ta boîte à gants n'est pas d'accord. » | 3 000 − 1 500 = 1 500 € ? | Le calcul en Clash géant ; derrière, floue, une boîte à gants entrouverte d'où dépasse le coin d'un papier. À 2,1 s, le PV en sort, se déplie et percute le calcul : « 6 défaillances majeures ». |
| B | Coût caché, résultat d'abord | « Ta voiture à 1 500 : 1 500 € de marge prévue. Moins 73 à l'arrivée. » | 1 500 € prévus. − 73 € encaissés. | Le compteur « MARGE » part de 1 500 et roule jusque sous zéro. |
| C | Écart implicite | « Le vendeur t'a donné la liste de ses réparations. Tu l'as rangée dans la boîte à gants. » | Il t'a donné la liste. | Un PV plié glisse dans une boîte à gants éclairée par un téléphone ; une ligne « Défaillance majeure » s'allume au passage. |
| D | Erreur intelligente | « Les débutants comparent les prix. Ceux qui gagnent comparent les PV. » | Ils comparent les PV. | Deux cartes de PV côte à côte : une longue, six lignes orange ; une courte, une ligne grise. |
| E | Démonstration | « Disques, rotules, silencieux, amortisseurs : mille quarante euros. Écrits sur le PV avant que tu paies. » | 1 040 € écrits sur le PV | Le PV en gros plan, les six majeures s'allument une par temps, un prix au bout de chacune. |

**Recommandation** : A en ouverture publiée, parce que l'épisode teste la recette telle quelle et qu'A garde la
mécanique de MO5 mot pour mot ; C fabriquée en ouverture B (même corps, raccord à 4,2 s), gardée en réserve pour cet
épisode : publier deux ouvertures ajouterait une variable.

**Les 4 verrous de A** :
- Temps ✅ : « achètes » est le deuxième mot, « 1 500 » tombe dans les quatre premiers mots, « 3 000 » avant la fin de
  la phrase. Le sujet (acheter pour revendre) est dans la phrase 1.
- Sens ✅ : deux phrases courtes, voix active, deux chiffres ronds. La boîte à gants est un objet que tout le monde a
  ouvert. Test d'isolement : « PV » veut aussi dire « contravention » ; le film écrit « Procès-verbal · contrôle
  technique » en toutes lettres à 2,1 s, avant que la voix dise « PV » (16,0 s).
- Miroir ✅ : c'est son calcul à lui, en « tu », avec une voiture à son budget.
- Écart ✅ : il croit doubler sa mise ; un objet de sa propre voiture n'est pas d'accord, sans dire pourquoi. La
  question « qu'est-ce qu'il y a dans la boîte à gants ? » s'ouvre, et seule la carte du PV chiffré la referme.

**Relances du corps** : « Jour 1. » à 4,25 s · la pizza qui tombe seule, en silence, à 11,65 s · « Et là… pièce en
commande. » à 12,35 s · le compteur qui passe sous zéro à 18,4 s · « Ceux qui gagnent lisent le PV avant le prix. » à
21,0 s.

## L'histoire en 7 temps

| Temps | De → à (s) | Voix | Ce qu'on voit | Émotion |
|---|---|---|---|---|
| Ouverture | 0 → 4,2 | « Tu l'achètes 1 500, tu la revends 3 000. Ta boîte à gants n'est pas d'accord. » | le calcul géant ; le PV jaillit de la boîte à gants et le percute | reconnaissance, sourire |
| Jour 1 | 4,2 → 5,9 | « Jour 1, tu l'achètes. » | la 206 arrive et freine ; le PV plié disparaît dans la portière, « PV · pas lu » | élan |
| Accumulation | 5,9 → 12,0 | « Carte grise, disques, rotules, silencieux, pneus. Et l'ampoule du feu stop, 4 euros. » | 7 débits, la 206 se couvre d'étiquettes ; la pizza tombe seule | peur qui monte, rire |
| Attente | 12,0 → 15,6 | « Et là… pièce en commande. » | nuit, garage, J+1 → J+16 ; amortisseurs, contre-visite « Favorable » | peur |
| Chute | 15,6 → 20,9 | « Il lit le PV. Tu baisses. Bénéfice, moins 73 euros. Tu as payé pour la vendre. » | le compteur passe sous zéro, « − 73 € » plein écran, silence | humour noir |
| Renversement | 20,9 → 27,4 | « Ceux qui gagnent lisent le PV avant le prix. Ton prix max, 930. À 1 500, tu passes ton tour. » | les étiquettes retournent sur leurs lignes du PV ; le calcul du pro ; l'annonce barrée | soulagement, valeur |
| Boucle | 27,4 → 29,6 | « La prochaine fois que tu te dis… » | retour à l'image 0 | relance |

## Les chiffres

Sources, liens et hypothèses : `docs/timeline-mo9.md` (consultés le 8 octobre 2026). Une Peugeot 206 1.1 de 2000
(4 CV), achetée 1 500 € en Île-de-France avec un PV « Défavorable pour défaillances majeures » : six majeures, trois
mineures, aucune critique. Revente visée 3 000 € (prix médian des 206 en vente : 2 990 €). Marge prévue : 1 500 €.

| Moment | Coup (notification de débit) | Montant | Sur le PV | Compteur « MARGE » |
|---|---|---|---|---|
| | départ | | | 1 500 |
| Accumulation | Carte grise | 152 € | | 1 348 |
| | Disques et plaquettes avant | 259 € | majeure | 1 089 |
| | Rotules de direction | 227 € | majeure | 862 |
| | Silencieux arrière | 216 € | majeure | 646 |
| | 2 pneus avant | 102 € | majeure | 544 |
| | Ampoule de feu stop | 4 € | majeure | 540 |
| | **Pizza · le pote qui tenait la lampe** (gag) | 12 € | | 528 |
| Attente | Assurance, 1 mois | 40 € | | 488 |
| | Amortisseurs arrière | 236 € | majeure | 252 |
| | Contre-visite | 25 € | | 227 |
| Chute | Message « J'ai lu le PV. 2 700, aujourd'hui. », virement + 2 700 € (300 de moins que prévu) | − 300 € | | **− 73** |

Total des frais : 1 273 €, dont 1 044 € de réparations écrites sur le PV. 1 500 − 1 273 − 300 = **− 73 €**.

**Le calcul du pro, sur le même exemple** : revente 2 700 − PV chiffré 1 040 − frais 230 − marge voulue 500 =
**prix max 930 €**. Verdict : « Annonce · 1 500 € » barrée, « À 1 500, tu passes ton tour. »

Mention à l'écran de 4,0 à 27,4 s : « Exemple · prix moyens constatés ».

## Seconde par seconde

Minutage cible, calé sur les repères de MO5 (`anatomie-mo5.md` § 2) ; l'étape 4 le recale sur la prise retenue
(`audio/vo-mo9/vo-timing.json`). Caméras A (calcul), B (palettes), C (voiture et pile), F (orbite sur la formule),
comme MO5. Zones sûres : aucun texte au-dessus de y = 220, sous y = 1480, à droite de x = 940 ; centre x = 540.

| t (s) | Image | Voix | Son |
|---|---|---|---|
| 0,0 | Image 0 déjà composée : « 3 000 − 1 500 » en Clash géant, « = 1 500 € ? » dessous. Derrière, floue, une boîte à gants entrouverte dans le noir, lueur orange à l'intérieur, le coin d'un papier qui dépasse. Le trait de lumière écrit « 1 500 € », puis le « ? » en Fraunces orange (1,3). | « Tu l'achètes 1 500, » (0,08) « tu la revends 3 000. » (1,42) | musique dès l'image 0 (mesure 13) |
| 2,1 | La boîte à gants s'ouvre d'un coup ; le PV plié en jaillit, se déplie en carte de verre « Procès-verbal · contrôle technique » et percute le calcul, qui tremble. Sur la carte : « Défavorable · *6 défaillances majeures* ». | « Ta boîte à gants n'est pas d'accord. » (2,55-3,7) | clac du loquet, papier qui claque, choc |
| 4,0 | Le calcul s'efface vers le haut ; « 1 500 € » devient le compteur à rouleaux « MARGE » (y = 300), « Exemple · prix moyens constatés » dessous (y ≈ 392, gris). Palettes « JOUR 1 » en verre. Le PV se replie en quatre. | « Jour 1, » (4,25) « tu l'achètes. » (4,95) | palettes, clés |
| 4,85 | La 206 détourée entre par la droite et freine, roues à y ≈ 1460 ; son contour se trace à la lumière (5,6-6,4). Le PV plié glisse dans la portière passager et disparaît ; une étiquette de papier « PV · pas lu » se pose sur la vitre (y ≈ 1120). | | moteur léger, papier |
| 6,0 → 9,95 | Six débits, un par geste de la voix : 6,0 Carte grise − 152 · 6,8 Disques et plaquettes avant − 259 · 7,3 Rotules de direction − 227 · 7,81 Silencieux arrière − 216 · 8,5 2 pneus avant − 102 · 9,95 Ampoule de feu stop − 4. Chaque notification joue sa vidéo (signature, disque de frein, pont élévateur, échappement, pneu, feu arrière), s'empile dans la colonne x 160 → 900, y 430 → 960, et colle son étiquette de prix sur la moitié haute de la carrosserie (y 1040 → 1420). Les cinq réparations portent une petite pastille grise « PV ». Le compteur roule à chaque débit. | « Carte grise, » (6,05) « disques, rotules, silencieux, pneus. » (6,8-8,9) « Et l'ampoule du feu stop, 4 euros. » (9,4-11,0) | un choc de débit par temps, papier qui se colle |
| 11,65 | « Pizza · le pote qui tenait la lampe · − 12 € » arrive seule, plus tard, plus petite, de travers. Compteur 528 €. | (silence de la voix) | le choc un cran plus aigu : le gag |
| 12,0 | La nuit tombe (voile bleu, atelier de garage de nuit flouté derrière). Palettes J+1 qui accélèrent jusqu'à J+16. « Toujours au garage. *Zéro nouvelle.* » | « Et là, » (12,35) « pièce en commande. » (13,2) | basse coupée, son sous 1 400 Hz de 12,4 à 15,5, palettes, clé à chocs au loin |
| 13,1 · 14,0 · 14,8 | Débits sous le calendrier : Assurance · 1 mois − 40 (J+5) · Amortisseurs arrière − 236 (J+12, « pièce arrivée ») · Contre-visite − 25 (J+16), un tampon orange « Favorable » s'imprime sur une petite carte du PV. Compteur 227 €. | | débits, coup de tampon |
| 15,7 | Le téléphone vibre ; bulle de verre : « J'ai lu le PV. 2 700, *aujourd'hui.* » | « Il lit le PV. » (16,0) « Tu baisses. » (16,85) | vibration, la basse revient |
| 17,3 | Notification « Virement reçu · + 2 700,00 € » (montant en orange clair). | « Bénéfice, » (17,55) | |
| 18,1 → 18,9 | Le compteur roule 227 → 0 ; au passage du zéro (18,4), un « − » orange entre par la gauche ; il continue jusqu'à 73 et se fond dans un « − 73 € » géant, en relief, taillé pour la colonne 140 → 940 (≈ 360 px) ; tout le reste s'assombrit. | « moins 73 euros. » (18,55) | arrêt de bande à 18,65, silence |
| 19,9 | « *Tu as payé pour la vendre.* » s'écrit à la lumière sous le − 73. | « Tu as payé pour la vendre. » (19,9-20,9) | |
| 20,9 → 22,3 | Rembobinage : lignes de balayage, le récit repart à l'envers jusqu'au jour 1. Les étiquettes se décollent une à une, le compteur remonte − 73 → 1 500. Le PV ressort de la portière et se déplie (22,0) ; les étiquettes des six majeures volent se poser au bout de leur ligne. | « Ceux qui gagnent lisent le PV avant le prix. » (21,0-23,15) | souffle inversé, la musique repart sur le temps à 22,0 |
| 22,3 | Fond chaud, la carte du PV en grand : « Procès-verbal · contrôle technique », pastilles « Critique 0 · Majeures 6 · Mineures 3 ». Six lignes majeures avec leur prix en orange (Disques de frein AV 259 · Rotules de direction 227 · Échappement 216 · Pneus AV 102 · Feu stop G 4 · Amortisseurs AR 236), trois mineures en gris, sans prix. | | chaque étiquette se pose d'un « tac » |
| 23,0 | Les six prix glissent l'un vers l'autre et se fondent en une ligne « − PV chiffré 1 040 » ; la carte devient le calcul : Revente 2 700 · − PV chiffré 1 040 · − frais 230 · − marge voulue 500. Le trait de total se trace (23,9), « *prix max* 930 € » (24,2), éclair. | « Ton prix max, » (23,2) « 930. » (24,2) | les chiffres claquent |
| 25,5 | « Annonce · 1 500 € » glisse dessous et se barre d'un trait orange (26,0). « À 1 500, tu *passes ton tour.* » | « À 1 500, » (25,6) « tu passes ton tour. » (26,55) | |
| 27,45 | Retour : le calcul s'efface, celui de l'image 0 revient dans le même cadre ; derrière, la boîte à gants floue se referme sur le coin du papier. | « La prochaine fois que tu te dis… » (27,9-29,5) | mesure 55, la musique boucle sur la mesure |
| 29,6 | = image 0 | → « Tu l'achètes 1 500… » | |

Contrôles prévus : boucle mesurée (écart moyen image finale / image 0 < 1), une seule pause (sur « − 73 € »), aucun
plan figé de plus de 0,9 s, rien dans les zones interdites, `qa_video.py` sans FAIL ni avertissement texte.

## La voix

Simon, ton MO5. 21 répliques, 81 mots écrits (« 1 500 » compte pour deux), environ 21 s de parole estimées sur le débit
de MO5 : nos nombres se disent plus vite que « deux mille sept cent cinquante ». Le texte envoyé à ElevenLabs
(nombres en lettres, balises eleven_v3) est dans `docs/timeline-mo9.md`, avec l'ouverture B.

| # | t (s) | Réplique (écran, sous-titres) | Texte ElevenLabs |
|---|---|---|---|
| 1 | 0,08 | Tu l'achètes 1 500, | [deadpan] Tu l'achètes mille cinq cents, |
| 2 | 1,42 | tu la revends 3 000. | tu la revends trois mille. |
| 3 | 2,55 | Ta boîte à gants n'est pas d'accord. | [short pause] Ta boîte à gants n'est pas d'accord. |
| 4 | 4,25 | Jour 1, | [pause] Jour un, |
| 5 | 4,95 | tu l'achètes. | tu l'achètes. |
| 6 | 6,05 | Carte grise, | [pause] Carte grise, |
| 7 | 6,8 | disques, rotules, silencieux, pneus. | disques, rotules, silencieux, pneus. |
| 8 | 9,4 | Et l'ampoule du feu stop, 4 euros. | [short pause] Et l'ampoule du feu stop, quatre euros. |
| 9 | 12,35 | Et là, | [pause] Et là… |
| 10 | 13,2 | pièce en commande. | pièce en commande. |
| 11 | 16,0 | Il lit le PV. | [pause] Il lit le pé-vé. |
| 12 | 16,85 | Tu baisses. | [short pause] Tu baisses. |
| 13 | 17,55 | Bénéfice, | [short pause] Bénéfice, |
| 14 | 18,55 | moins 73 euros. | [short pause] moins soixante-treize euros. |
| 15 | 19,9 | Tu as payé pour la vendre. | [pause] Tu as payé pour la vendre. |
| 16 | 21,0 | Ceux qui gagnent lisent le PV avant le prix. | [pause] Ceux qui gagnent lisent le pé-vé avant le prix. |
| 17 | 23,2 | Ton prix max, | [short pause] Ton prix max, |
| 18 | 24,2 | 930. | neuf cent trente. |
| 19 | 25,6 | À 1 500, | [short pause] À mille cinq cents, |
| 20 | 26,55 | tu passes ton tour. | tu passes ton tour. |
| 21 | 27,9 | La prochaine fois que tu te dis… | [pause] La prochaine fois que tu te dis… |

**Textes à l'écran** (6 mots au plus par élément, ils ne recopient pas la voix) : « 3 000 − 1 500 = 1 500 € ? » ·
« Procès-verbal · contrôle technique » · « Défavorable · 6 défaillances majeures » · « JOUR 1 » · « PV · pas lu » ·
« MARGE » · « Exemple · prix moyens constatés » · les dix notifications (titre · montant) · « Toujours au garage.
Zéro nouvelle. » · « J+1 … J+16 » · « Favorable » · « J'ai lu le PV. 2 700, aujourd'hui. » · « Virement reçu ·
+ 2 700,00 € » · « − 73 € » · « Tu as payé pour la vendre. » · « Critique 0 · Majeures 6 · Mineures 3 » et les neuf
lignes du PV · « Revente 2 700 », « − PV chiffré 1 040 », « − frais 230 », « − marge voulue 500 », « prix max 930 € » ·
« Annonce · 1 500 € » · « À 1 500, tu passes ton tour. »

**Passe Stop Slop** : aucun adverbe, aucune tournure « ce n'est pas X, c'est Y », pas de tiret long ; « la pièce est
en commande » devenu « pièce en commande » (la phrase du garagiste, telle qu'on la reçoit) ; « Tu acceptes » remplacé
par « Tu baisses » (le geste, pas l'accord) ; l'écran de l'attente dit « Zéro nouvelle » au lieu de répéter la voix.
La personnification « Ta boîte à gants n'est pas d'accord » reste : c'est la blague. Note : directivité 9,
rythme 8, confiance 9, naturel 8, densité 9, soit 43/50.

## Le son

- **Voix** : Simon (`eleven_v3`, `mvhJVdVoTWVUtL4keT7W`), deux prises, la plus proche du ton de MO5 retenue sur
  mesures (débit, pauses, « PV » bien dit), accélérée de 10 % si besoin, chaque réplique ramenée au même niveau.
- **Musique** : Controlled Drop recalée à 120 BPM, mêmes passages que MO5 : mesure 13 de 0 à 18,65 s ; basse retirée
  et son sous 1 400 Hz de 12,4 à 15,5 s ; arrêt de bande en 0,22 s sur « 73 » ; silence ; 0,9 s du passage suivant à
  l'envers jusqu'au temps de 22,0 s ; mesure 55 jusqu'à la fin, fondu de boucle.
- **Bruitages Mixkit** (banque `audio/bank/mo9/`) : loquet de boîte à gants, papier qui se déplie, vibration, choc de
  débit, papier collé et décollé, palettes, clés, moteur léger, clé à chocs lointaine, tampon, rouleaux, arrêt de bande,
  souffle inversé, plume. Un son principal à la fois (un son moins important à moins de 0,12 s est retiré).
- **Mix** façon `scripts/audio-mo5.py` : nivellement par réplique, ducking par bande, −14 LUFS, plafond −3,5 dBTP
  mesuré sur le MP4, contrôle téléphone (énergie sous 150 Hz).

## L'image

- **Charte MO5** : fond #08070a → #17100b, orange #ff5a1f / #ff8a4c / #ffb38a, encre #f6efe7, gris #a59a90 ; Clash
  Display pour les chiffres, Satoshi pour l'interface, Fraunces italique en dégradé orange pour le mot porteur
  (« 6 défaillances majeures », « Zéro nouvelle. », « aujourd'hui. », « Tu as payé pour la vendre. », « prix max »,
  « passes ton tour. »).
- **Le PV** : une carte de verre dépoli de la charte, son nom écrit en texte. On ne reproduit ni la mise en page d'un
  vrai procès-verbal ni le logo d'un centre de contrôle (`video/CLAUDE.md`). Plié, il garde le même verre.
- **La voiture** : photo Wikimedia Commons retouchée par `scripts/photos-mo9.py` (lions et plaque effacés, plaque
  vierge, retournée pour regarder à gauche, détourée BiRefNet, étalonnée), contour vectoriel tracé à la lumière,
  ombre et reflet au sol, dix étiquettes de papier au-dessus de y = 1480.
- **Mouvement** : film en code déterministe (`window.seek(t)`), springs fermés de `lib/motion.js`, `track()` sur chaque
  axe de caméra, `story(t)` pour le rembobinage (récit 18,6 → 4,9 s entre 20,9 et 22,3 s du film), flou de bougé
  (`window.shutter` / `window.samples`, MB = 4 au rendu), bruit déterministe.
- **Vidéos réelles** : Mixkit en séquences JPG à 30 i/s peintes sur canvas, liste à compléter dans
  `docs/timeline-mo9.md` (« Les plans réels »).

## Ce qu'on enregistre, ce qu'on envoie, ce qu'on commente

On ne demande rien à l'écran.
- **Revoir** : la dernière phrase enchaîne sur la première ; les pastilles « PV » des notifications et les lignes de
  la carte défilent trop vite pour tout lire en un passage.
- **Enregistrer** : la carte du PV chiffré (trois niveaux, six réparations et leurs prix) et le calcul du prix max,
  à ressortir à la prochaine visite.
- **Envoyer** : « Tu as payé pour la vendre » et la pizza du pote qui tenait la lampe, au pote qui veut se lancer, ou
  à celui qui a tenu la lampe.
- **Commenter** : la pire ligne lue sur un PV, ses propres majeures, le prix de sa dernière contre-visite.

## Publication

- Ouverture A, même créneau que MO5 (jour et heure à noter dans le journal avant publication).
- Légende proposée, sans CTA : « Achat-revente voiture : ta première à 1 500 €, et le contrôle technique avait déjà
  tout écrit. » Ligne suivante : « Photo : Vauxford / Wikimedia Commons (CC BY-SA 4.0) ».
- Hashtags (`docs/hashtags_test.md`, débutants, jeu A) : #achatrevente #achatreventevoiture #voitureoccasion
  #entrepreneur.
- Couverture `poster-mo9.png` : l'image 0, lisible en vignette ; SRT fourni à part.

## Production : les 5 étapes

| Étape | Ce que je livre | Contrôle |
|---|---|---|
| 1. Brief | ce document et `docs/timeline-mo9.md` (chiffres sourcés, voix) | OK accordé d'avance |
| 2. Timeline et images tests | plans Mixkit choisis sur planche, 3 images tests (image 0 avec le PV qui percute, pluie de débits avec étiquettes au-dessus de y = 1480, carte du PV chiffré) | lignes de zone sûre tracées sur chaque image |
| 3. Maquettage 0,1 s | `film-mo9/film.js` repris de `film-mo5/film.js` (objet `K`, tableau `TAGS`), planches 0,1 s, boucle mesurée | planches regardées |
| 4. Voix | deux prises de Simon (environ 1 300 crédits), transcription mot à mot, `vo-timing.json`, film recalé | « PV » et nombres bien dits, aucune balise prononcée |
| 5. Animation, son, livraison | `scripts/audio-mo9.py` repris de `audio-mo5.py`, rendu parallèle, 2 MP4 (A, B), couverture, SRT | `qa_video.py` sans FAIL ni avertissement texte, −14 LUFS, ≤ −3,5 dBTP mesuré sur le MP4 |

Journal de fabrication à remplir après le rendu : avertissements zones sûres avant (MO5) → après (MO9).

## Ce qu'il me faut

Rien de bloquant : production « tout en auto ».
1. Avant de publier : les chiffres de MO5 dans TikTok Studio (part encore là à 3 s, durée moyenne, visionnages
   complets), sans lesquels la comparaison de l'hypothèse se limite aux vues.
2. En option : le PV et les factures d'une de tes premières voitures. Tes vrais chiffres remplaceraient l'exemple.
