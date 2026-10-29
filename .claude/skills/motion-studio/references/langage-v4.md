# Langage utopicar v4 : la flèche, le trait, la couleur pleine (face caméra, Reels, Shorts)

Langage de motion et de son des vidéos face caméra utopicar (avatar en voiture + plans d'illustration), écrit le
29 oct. 2026 après trois recherches (montage et motion de pros, sound design, Reels/Shorts 2025-2026 ; synthèse dans
`video/brief-courts-10s.md` § 2) et appliqué à « 4 000 € » v4 (2 parties) et à la série de 13 vidéos de 10 s.
**Aucune valeur n'est un préréglage** : chacune se déduit d'une mesure (le logo, la taille d'un élément, la voix, la
largeur réelle d'un texte, le mouvement d'un plan) et se recalcule quand la mesure change. Le code est dans le skill
`montage-viral` (`moteur/scripts/v4.py`, `gen4.py`, `moteur/work/mix4.py`) ; ce fichier dit quoi et pourquoi.

## 1. Trois comportements, un sens chacun (tirés du logo)

| Comportement | D'où il vient | Ce qu'il dit | Où |
|---|---|---|---|
| **La flèche** : mouvement sur l'axe θ = 31,7° (montée vers la droite) | axe de la flèche orange du symbole officiel, de (1199,5 ; 1102) à (1640 ; 830) ; angle CSS d'un dégradé qui monte le long de θ : 58,3° | progrès, bon choix | entrée de la pastille, chiffre qui roule vers le haut, couleur pleine qui couvre, masques de sortie, flèche de fin |
| **Le contre-sens** : même axe, vers le bas et la gauche | l'inverse | risque, « non » | la 208, le diesel, « commerce non déclaré » |
| **Le trait** : ligne crème `#F4F1EC` à vitesse de plume constante (2 600 px/s), bout rond | la voiture du logo est un trait | « regarde ça », la précision | rature d'un nom, croix d'une pastille, ligne entre deux années |
| **La couleur pleine** : aplat qui couvre l'écran sur θ, porte un mot, s'ouvre dans le même sens | DA immersive validée (« une grosse couleur qui prend l'écran ») | changement de chapitre | « 3 oui », « 1 non » (noir), « Essence », « La cote », « Habitude »… |

Une transition sans cause n'existe pas : chaque couleur pleine est un chapitre dit par la voix, chaque filé un vrai
changement de prise.

## 2. Jetons

- Orange **aplat** `#E2683A` (OKLCH 0,66 / 0,17 / 40° : la teinte du logo, chroma −20 % ; `#FF5A1F` en aplat vidéo
  paraît fluorescent), encre dessus `#160904` (contraste 5,8:1).
- Orange **texte** sur vidéo ou noir : `#F0915E`. Crème `#F4F1EC`, noir chaud `#0B0907`, voile `rgba(14,10,8,.72)`.
- Le logo officiel garde `#FF5A1F`. L'orange paraît **une fois par écran** (le mot du moment).
- Polices : Clash Display 600 (gros texte, mots des couleurs pleines), Satoshi 700 (sous-titres, pastille, contexte),
  Instrument Serif italique (la seule signature « Revends mieux. »).
- Zones (1080 × 1920) : texte entre y 288 et 1248 ; colonne 140 → 940 au-dessus de y 1150, **230 → 850 en dessous**
  (rail des boutons Instagram) ; tout ce qui est centré l'est sur x = 540.

## 3. Mouvement

- **Ressorts en forme fermée**, la durée perçue d se calcule sur la taille : `d = 0,16 + 0,0045·√(diagonale px)` (0,22 s
  pour un chiffre de 52 px, 0,31 s pour la pastille, 0,47 s plein cadre) ; l'amortissement selon la propriété : ζ = 1
  opacité et couleur, 0,92 tout ce qui porte du texte (dépassement invisible), 0,8 une forme sans texte (la flèche).
  Durée de la tween = (ζ ≥ 1 ? 1,5 : 1,2)·d. Jamais de `back.out` sur du texte (rebond visible).
- **Flou de bougé du moteur** HyperFrames sur la racine : `data-motion-blur="on" data-motion-blur-events="on"
  data-motion-blur-shutter="300"` (le flou CSS sur une vidéo est interdit par le contrat).
- **Filé réel** entre deux prises de même cadre : les deux plans côte à côte bougent ensemble (sortie `power3.in`
  0,10 s, entrée `power3.out` 0,18 s, même vitesse de pointe à la jointure : distance de sortie = W·0,10/0,28), le plan
  sortant prolongé, l'entrant commencé plus tôt ; les plans du visage alternent de piste (0 / 10) pour ne pas
  superposer deux sons sur une piste.
- **Un mot posé ne bouge plus.** Plans d'illustration sans poussée ajoutée ; coupés sur leur geste.

## 4. Les éléments

**Accroche (image 0)** : déjà posée à l'image 0 (c'est la couverture). Ligne de contexte « DÉBUTANT EN
ACHAT-REVENTE » (Satoshi 700, 30 px, interlettrage 0,16 em), gros texte (l'objet du jour : « 4 000 € », « Clio 3 ·
1.2 », « 6 par an ? »), capsule sombre (la promesse, un mot orange). Deux mises en page :
- **sur le torse** (plan serré, y ≈ 900, ordre gros texte → capsule) : elle remplace les sous-titres pendant qu'elle
  est là ;
- **au-dessus de la tête** (plan large, y = 300, ordre capsule → gros texte, le gros texte le plus près du visage) :
  les sous-titres restent visibles en bas. Un champ sombre radial derrière le texte rend le crème lisible sur le toit
  ouvrant ; avec un détourage, le gros texte passe **derrière la tête** (la tête, au-dessus du champ, reste éclairée).
- Tout se mesure sur le texte lui-même (un `span` en `inline-block`, pas le bloc de 800 px qui le contient) et se
  réduit pour tenir dans 800 px, marges de la capsule comprises ; sinon le masque du bloc rogne le « € ».
- Sortie : un masque qui monte sur θ ; elle est sortie **avant** que la pastille entre au même endroit.

**Pastille (objet porteur)** : une seule par vidéo, persistante. Disque orange + chiffre (Clash 600) + nom (Satoshi
700, 40 px), capsule noire 80 %. Elle entre en glissant de 32 px sur θ ; le chiffre roule vers le haut sur le geste
(ζ = 1) ; **la capsule épouse le nom affiché** (largeur mesurée, `width: max-content`, même ressort que le
défilement) ; seuls le nom et le chiffre affichés sont visibles, les autres attendent cachés (`visibility`) ; le
**mode risque** : disque noir chaud cerclé de crème, croix tracée en deux traits de plume, nom barré ; une vidéo qui
ouvre sur la voiture à éviter fait entrer la pastille directement en mode risque. N'importe quel glyphe peut remplacer
le chiffre (« ! » pour « frais en plus »).

**Sous-titres** (le plus gros chantier de la v4) :
- **largeur réelle mesurée** dans Chromium (`mesure_texte.js`, police et interlettrage du rendu) : chaque groupe tient
  sur **une ligne** de la colonne (800 px au-dessus de y 1150, 620 px en dessous, à 54 px au lieu de 58) ;
- **découpage optimal par phrase** (programmation dynamique) : coût d'une coupure selon la syntaxe (bonus après une
  virgule, +100 après un article, une préposition, un pronom sujet ou un déterminant sauf s'il porte la ponctuation,
  +30 avant « de / du / des » (complément du nom : « bas | de caisse »), +60 dans un nom propre (« Toyota | Yaris »),
  +100 dans un composé connu, −5 avant un mot outil, +8 entre deux mots pleins) ; coût d'un groupe selon sa durée
  lisible (pénalité sous 20 images, borne de fin = début de la phrase suivante) et son nombre de mots (1 mot : +18) ;
  **deux lignes** seulement si un groupe d'une ligne resterait moins de 20 images (+25, coupure syntaxique, lignes
  équilibrées, pas de mot seul sur une ligne) ;
- cadre calé sur les coupes (règle des 12 images), mots allumés à leur temps dit (crème 62 % → 100 %), **un** mot
  orange par groupe ; voile à la taille du texte ; jamais de halo ; un mot outil seul ou un éclair de moins de 0,3 s
  ne s'affiche pas ;
- **masques** : une accroche sur le torse ou une plage d'années cache tout ; une couleur pleine ne cache que **ses**
  mots (elle les porte), un autre mot dit sous elle s'affiche à la réouverture s'il n'y perd pas plus de 0,35 s
  (sinon caché) ; une proposition réduite à un ou deux mots visibles n'est pas sous-titrée du tout.

**Années** : deux années dites lentement, la seconde montée de `écart·tan θ`, le trait les relie le long de θ.

**Carte de fin** (vidéo longue seulement, 0,85 s, abrupte) : noir chaud, le symbole révélé sur θ **déjà commencé à
son image 0** (le masque part de l'arrière de la voiture, sa position mesurée sur l'axe du dégradé ; sinon la première
image est vide), la flèche file et se pose (ζ = 0,8) sur la dernière note du logo sonore, « Achète juste. » / « Revends
mieux. ». **Pas de carte de fin dans une vidéo de 10 s** : elle finit 3 images après les lèvres fermées et boucle ; le dernier
plan tient jusqu'à la dernière image (sinon trois images noires, invisibles au contrôle à 4 i/s).

**Détourage** (`npx hyperframes remove-background in.mp4 -o out.webm --device cpu`, 0,4-0,9 s par image) : le modèle
laisse des taches semi-transparentes hors de la personne (la poignée du plafond, alpha 0,67-0,8, collée aux cheveux)
qui passeraient **devant** le texte. Nettoyer image par image (`detour_propre.py`) : cœur sûr alpha > 0,9, plus grande
composante connexe, dilatée de 10 px, alpha d'origine × ce masque.

## 5. Son

**Logo sonore « u-to-pi-car »** (≤ 0,75 s, toujours le même fichier, sec) : quatre notes en **mi** (mi5, sol#5, si5,
mi6 : 0, +4, +7, +12), trois brèves qui montent et vont de gauche à droite (−0,20 → +0,20), la tonique qui sonne.
Matière réelle : le bip de verrouillage électronique (sfx-2852, sa hauteur **mesurée** dans le fichier : 1 625 Hz,
transposé à chaque note), le clic d'un interrupteur (2582) pour l'attaque, la porte qui claque (1564) et la serrure
(2849) sous la tonique, qui sonne par un résonateur accordé (−60 dB en 0,36 s). La dernière note tombe **sur la pose de
la flèche** de la carte de fin : premier passage du ressort à la cible, `t = 0,10 + (π − atan(ωd/(ζω)))/ωd`, soit
+0,254 s. Les **chiffres de la pastille jouent les notes du logo** dans l'ordre, attaque 50 ms avant le mot dit (dans
le trou) : la vidéo épelle le logo, la carte de fin le termine.

**Risque** : un démarrage raté (1540, 0,65 s) puis la serrure qui retombe (2854, un ton plus bas). **Couleur pleine** :
une voiture qui passe (1484 pour l'orange, 1538 un ton plus bas pour le noir), coupée à la durée du mouvement, crête
sur l'image qui couvre, panoramique ±0,25 dans le sens de la flèche, et un coup bas-médium (porte, 70-420 Hz).
**Filé** : souffle court (1492), crête sur la jointure, de droite à gauche. **Plans d'illustration** : leur son réel
arrive 0,25 s avant l'image (J) et s'éteint 0,2 s après (L). **Image 0** : un coup sourd sous 160 Hz, plus son corps
médium **seulement s'il finit avant le premier mot** (0,18 s quand la voix commence à 0,2 s, rien si elle commence
tout de suite).

**Règles de mix mesurées** (`mix4.py`) :
- ambiances **≥ 15 LU sous la voix** pendant qu'elle parle (gain de chaque ambiance recalculé sur sa fenêtre) ;
- bruitages **creusés de 6 dB entre 1 et 4 kHz** quand la voix parle (égaliseur dynamique piloté par son enveloppe) ;
- collisions par famille (< 0,17 s : on garde le prioritaire), deux bruitages au plus avec la voix ;
- **vide de 150-300 ms** (ambiances coupées 0,2 s avant) avant la phrase clé et avant le logo ;
- chaque son grave reçoit une couche d'harmoniques (redressement + saturation forte, 150-2 400 Hz) : **test passe-haut
  800 Hz** de chaque accent dans le rapport (un coup sourd seul y perd 35 dB : inaudible sur un téléphone) ;
- sons diégétiques dans un **habitacle court** (premières réflexions 4-23 ms + queue de 0,2 s, −9 dB) ; sons de marque
  secs ;
- master −14 LUFS, limiteur réglé jusqu'à **≤ −1,5 dBTP mesurés ×4**, contrôle **après AAC 192 kb/s** (≤ −1 dBTP),
  **somme mono** à moins de 1 LU ; pose sur la vidéo avec contrôle de synchro par corrélation des enveloppes
  (`poser_mix.py`, refus au-delà d'une demi-image).

**Voix** : DeepFilterNet 3 (poids officiels) à atténuation limitée avant la chaîne de finition ; une prise n'est gardée
que si DNSMOS monte, que la transcription ne se dégrade pas (CER) et que le timbre reste (cosinus MFCC ≥ 0,985).

## 6. Contrôles avant de livrer

1. `npx hyperframes check <dossier> --json` : 0 erreur. Faux positifs connus, à traiter à la source et non à ignorer :
   texte d'une couleur pleine « sur » une pastille cachée sous l'aplat (→ `data-layout-allow-overlap` sur le mot) ;
   contrastes mesurés sur des noms de pastille masqués (→ `visibility: hidden` hors affichage) ; débordements voulus
   (rouleau du chiffre, pile des noms, rature → `data-layout-allow-overflow`). Restent acceptés : « line_unread » de la
   carte de fin (voulue < 1 s) et d'une couleur pleine (0,6 s, le mot est dit), « first_frame_empty » quand l'image 0
   montre bien l'accroche (vérifié à l'image).
2. Snapshots à 0,05 / 1,2 s, sur chaque pastille, couleur pleine, fin : regardés réellement, en planche.
3. `qa_video.py` sur chaque MP4 livré : aucun FAIL ; « images vides » doit être « aucune ».
4. Rapport du mix : écart voix, passe-haut 800 Hz, crête après AAC, somme mono, calage.

## 7. Série de 10 s (Reels, Shorts) : ce qui change

- Une idée par vidéo (YouTube anti-spam : « high volumes of similar content with minimal changes ») ; jamais la même
  vidéo recadrée ; une vidéo courte ne sort pas le même jour que la longue dont elle vient.
- **Aucun appel à l'engagement**, ni dit, ni écrit, ni en légende, ni en commentaire épinglé (décision de l'utilisateur
  du 29 oct. 2026 ; Instagram ne recommande pas un contenu qui demande partages ou commentaires). Les commentaires
  viennent de verdicts **vrais et modérément débattus**, les envois de l'utile.
- Accroche = l'objet du jour + le verdict, reprend les mots de la voix ; mêmes mots en première ligne de légende et en
  titre YouTube ; 5 hashtags au plus ; mention IA activée.
- Temps fixes : 0-2 s accroche, 2-7 s raison (voix + plan réel ou pastille), 7-10 s geste ou verdict ; fin abrupte,
  boucle. Pas de logo sonore (il marquerait une fin) ; les notes de la pastille restent.
- Fabrication : `courts/serie.py` (une fiche par vidéo : projet source, plans, accroche, pastille ou couleur pleine,
  illustrations, hauteur des sous-titres) et `courts/court.py generer|rendre` (un sous-processus par vidéo, chemin
  d'import du projet source d'abord).
