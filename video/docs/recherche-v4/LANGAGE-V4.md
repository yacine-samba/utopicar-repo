# Langage utopicar v4 : « la flèche, le trait, la couleur »

Langage de motion et de son des vidéos face caméra utopicar (avatar en voiture + plans d'illustration), tiré du logo
officiel et de la recherche v4 (`recherche/v4/SYNTHESE.md`). Aucune valeur n'est un préréglage : chacune se déduit
d'une mesure (le logo, la taille d'un élément, la voix, le mouvement d'un plan) et se recalcule quand la mesure change.

## 1. Trois comportements, un sens chacun

| Comportement | D'où il vient | Ce qu'il dit | Où il sert |
|---|---|---|---|
| **La flèche** : un mouvement sur l'axe θ = 31,7° (montée vers la droite) | l'axe de la flèche orange du symbole officiel (de la base (1199,5 ; 1102) à la pointe (1640 ; 830)) | progrès, bon choix, ça monte | entrée de la pastille, chiffre qui roule vers le haut, couleur pleine qui couvre, flèche de fin |
| **Le contre-sens** : le même axe, vers le bas et la gauche | l'inverse de la flèche | risque, perte, « non » | la 208, un piège, une rature |
| **Le trait** : une ligne crème `#F4F1EC` qui se dessine à vitesse de plume constante | la voiture du logo est un trait | « regarde ça », la méthode, la précision | soulignement du mot clé, rature du « non », entourage d'une pièce réelle |
| **La couleur pleine** : un aplat orange qui couvre l'écran sur l'axe θ puis s'ouvre | la DA immersive, validée par l'utilisateur (« j'aime qu'une grosse couleur prenne l'écran ») | changement de chapitre | entre l'accroche et le premier élément, avant la règle finale |

Une transition sans cause n'existe pas : chaque couleur pleine part d'un objet à l'écran (la pastille grandit et devient
le monde, puis le monde redevient la pastille), chaque filé est un vrai mouvement de caméra.

## 2. Jetons

**Couleurs**
- Orange aplat `#E2683A` (OKLCH 0,66 / 0,17 / 40°), encre dessus `#160904`.
- Orange texte sur vidéo `#F0915E`.
- Crème `#F4F1EC` (encre sur sombre), noir chaud `#0B0907` (fonds), voile `rgba(14,10,8,.62)`.
- L'orange apparaît **une fois par écran**, sur le chiffre ou le mot du moment. Le logo officiel garde son `#FF5A1F`.

**Polices** (une display, une interface, une signature)
- Clash Display 600 : chiffres, accroche, mots des couleurs pleines.
- Satoshi 700 / 900 : sous-titres, pastille, ligne de contexte.
- Instrument Serif italique : la seule signature « Revends mieux. ».

**Zones** (1080 × 1920)
- Rien d'écrit au-dessus de y = 288 ni sous y = 1248.
- Au-dessus de y = 1150 : colonne 140 → 940. Sous y = 1150 (rail des boutons Instagram) : colonne 230 → 850.
- Tout ce qui est centré l'est sur x = 540. Jamais sur le visage.

**Tailles** (mesurées sur le texte, réduites pour tenir, jamais sous 28 px)
- Sous-titres : Satoshi 700, 60 px, groupes de 2 à 4 mots.
- Pastille : Satoshi 700, 46 px ; chiffre Clash 600, 52 px.
- Accroche : Clash 600, 150 à 230 px pour le chiffre, 72 à 96 px pour la promesse.

## 3. Mouvement

**Ressorts calculés** (forme fermée, aucune liste de préréglages) :
`x(t) = 1 − e^(−ζωt)(cos ωd t + ζω/ωd · sin ωd t)`, ω = 2π/d, ωd = ω√(1−ζ²).
- d (durée perçue) selon la taille de l'élément : d = 0,16 + 0,0045·√(diagonale en px) s, soit environ 0,22 s pour un
  chiffre de 52 px, 0,31 s pour la pastille, 0,47 s pour un aplat plein cadre.
- ζ selon la propriété : 1 pour l'opacité, la couleur et le flou ; 0,92 pour tout ce qui porte du texte (dépassement
  0,08 %, invisible) ; 0,8 pour une forme sans texte (la flèche du logo, 1,5 %).

**Courbes à 24 i/s** : la première image ne couvre jamais plus de 30 % du trajet. Sinon, flou de bougé du moteur
HyperFrames (`data-motion-blur`, obturateur déduit de la vitesse : L = v × obturateur/360).

**Le trait** : vitesse de plume 2 600 px/s, constante dans toutes les vidéos (un soulignement de 420 px en 0,16 s, une
rature de 600 px en 0,23 s). Bout rond, épaisseur 7 px, crème. Il part toujours de la gauche (sens de lecture), sur
l'axe θ quand il ne suit pas un mot.

**Un mot posé ne bouge plus.** Le mouvement passe à l'élément suivant.

## 4. Les éléments

**Accroche** (image 0)
- Ligne de contexte « DÉBUTANT EN ACHAT-REVENTE » : Satoshi 700, 30 px, interlettrage 0,16 em, crème à 85 %.
- Le chiffre dit en premier (« 4 000 € ») en Clash 600, crème, le mot qui porte la promesse en orange texte.
- Plan large : le chiffre passe **derrière la tête** (détourage `hyperframes remove-background`, 30-55 % caché, mesuré
  image par image). Plan serré : sous le menton, jamais sur la bouche.
- Le texte arrive en 0,1-0,3 s (un texte déjà là à 0 s a l'air figé), par un masque qui monte sur l'axe θ.

**Pastille (objet porteur)** : une seule par vidéo, persistante.
- Un disque orange avec le chiffre, puis le nom (« Clio 3 · 1.2 essence »).
- Elle entre en glissant sur θ (24-40 px, ressort de pastille). Le chiffre roule vers le haut sur l'image du geste
  (doigts), ζ = 1, sans dépassement ni anneau.
- Mode risque (« la 208 ») : le disque passe au noir chaud, le chiffre roule vers le bas jusqu'à une croix tracée par
  le trait, sur le contre-sens.
- Elle peut **devenir le monde** : elle grandit jusqu'à couvrir l'écran (couleur pleine), porte un mot, puis se
  rétracte en pastille.

**Sous-titres**
- Groupes de 2 à 4 mots, coupés sur la syntaxe (jamais entre l'article et le nom), chacun ≥ 20 images.
- Le cadre du groupe se cale sur les coupes (ouvre sur la coupe si elle tombe moins de 12 images avant, tient jusqu'à
  2 images avant une coupe proche) ; les mots s'allument à leur temps dit (crème 62 % → 100 %), sans bouger.
- Un seul mot orange par phrase, celui qui porte le sens.
- Lisibilité : voile à la taille du texte (noir chaud 62 %, rayon 18 px) quand le fond mesuré dépasse 60/255 ; sinon
  ombre de 3 px. Aucun halo.

**Filé** entre deux prises de même cadre : les deux images côte à côte bougent ensemble (sortie `power3.in`, entrée
`power3.out`, même vitesse à la jointure), 0,24-0,3 s, flou de bougé du moteur.

**Plans d'illustration** : coupés sur leur image la plus rapide (flux optique mesuré), sans poussée ajoutée ; leur son
réel arrive 0,2-0,5 s avant l'image (J) et s'éteint sous le retour au visage (L).

**Coupe en creux** avant un renversement (la 208) : l'image sortante s'assombrit de 40 % pendant 3 images.

**Carte de fin** (0,85 s, abrupte) : fond noir chaud ; le symbole entre sur l'axe θ (masque), la flèche file et se pose
(ζ = 0,8) sur la note finale du logo sonore ; « Achète juste. » (Clash 600) et « Revends mieux. » (Instrument Serif,
orange texte) se révèlent par un masque sur θ en 0,24 s et restent immobiles.

## 5. Son

**Logo sonore « u-to-pi-car »** (≤ 0,75 s, toujours le même fichier) : un silence de 0,15 s, puis 4 temps sur les
syllabes du nom, contour qui monte comme la flèche et se pose sur la tonique.
- Matière réelle : bips de verrouillage électronique (accordés), clics de relais (clignotant), la serrure qui se ferme
  (corps 150-800 Hz), la porte qui claque (sub, plus ses harmoniques pour le téléphone).
- Tonalité de marque : **mi** (notes mi5, sol#5, si5, mi6 : 0, +4, +7, +12 demi-tons).
- Les chiffres des vidéos jouent ses notes dans l'ordre (1 = mi, 2 = sol#, 3 = si, 4 = mi aigu) : la vidéo épelle le
  logo, la carte de fin le termine.

**Risque** : un démarrage raté (le démarreur qui tourne et ne prend pas), court, et la serrure qui retombe.

**Couleur pleine** : un souffle de voiture qui passe, coupé à la durée du mouvement, crête sur l'image qui couvre,
panoramique de gauche à droite (±0,25 au plus) ; un « thunk » bas-médium à la couverture.

**Règles de mix**
- Écarts mesurés pendant la parole : ambiance ≥ 15 LU sous la voix ; bruitages creusés dans 1-4 kHz quand la voix
  parle ; bruitages dans les trous entre les mots.
- Collisions par famille (moins de 0,17 s dans la même famille : on garde le prioritaire), 2 bruitages au plus avec la
  voix, 2 à 4 accents par 30 s, 150-300 ms de vide avant la phrase clé.
- Chaque accent a une couche 150-800 Hz et des harmoniques (le téléphone ne rend pas le sub).
- Espace d'habitacle court (premières réflexions, 0,2 s) pour les sons diégétiques ; sons de marque secs.
- Master −14 LUFS, limiteur true-peak suréchantillonné ×4 à −1,5 dBTP, contrôle ≤ −1 dBTP après AAC, somme mono à moins
  de 1 LU, test passe-haut 800 Hz.

**Voix** : DeepFilterNet 3 (poids officiels, atténuation limitée) avant la chaîne de finition, prise gardée seulement
si DNSMOS, transcription et timbre passent.

## 6. Ce qui est banni (par son nom)

Anneau d'onde, rebond sur un chiffre ou un mot, entrée par flou seul, halo autour des sous-titres, poussée lente
identique sur tous les plans, flou CSS sur une vidéo, souffle sur chaque coupe, deux souffles de même durée, couleur
rouge ou bleue sans sens, texte hors zone, logo à l'image 0, appel à l'engagement.
