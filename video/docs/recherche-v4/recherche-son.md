# Recherche son v4 : sound design, mix téléphone, voix studio, signature sonore (shorts verticaux)

29 octobre 2026. Recherche documentaire (WebSearch + WebFetch). Le son n'a pas été écouté.

## 0. Comment lire ce document

- **Une source n'est citée que si elle a été ouverte.** Quand seul un extrait de moteur de recherche a été vu, c'est
  écrit. Type de source : **[primaire]** (créateur du son, fabricant, plateforme, norme, article scientifique),
  **[vendeur]** (blog d'une entreprise qui vend l'outil ou le service), **[blog]** (presse ou blog spécialisé).
- **Confiance** : haute (source primaire claire), moyenne (source secondaire sérieuse, ou primaire mais incomplète),
  faible (blog ou vendeur seul, ou déduction).
- **« Proposition »** : notre adaptation au mixeur Python/ffmpeg. Elle n'est **pas sourcée**, ses chiffres sont des
  points de départ à mesurer.
- Vérifié en local : les options des filtres de ffmpeg 6.1.1 (`ffmpeg -h filter=…`) et de DeepFilterNet 0.5.6, tous
  deux installés dans l'environnement.
- Limites :
  - le budget de recherche web (200 requêtes partagées entre agents) a été épuisé en cours de route ;
  - plusieurs pages ont été refusées à la lecture (Adobe helpx, kit presse Mastercard, Netflix Partner Help, AES
    e-Library, aide Instagram, Material Design) ;
  - non trouvé ou non vérifié : l'identité sonore de Polestar, des réglages chiffrés de chaîne voix publiés par iZotope,
    les règles « son » de Material Design, la spec son de Netflix.

## A. Ce qu'il faut changer dans notre méthode (classé par gain attendu)

| # | Aujourd'hui (`montage-4k/work/mix.py`) | Proposition | Appui |
|---|---|---|---|
| 1 | Baisse fixe sous la voix : −4 dB (bruitages), −6 dB (ambiances), 0 (accents) | Viser un **écart de loudness mesuré** voix/fond pendant la parole : ≥ 15 LU pour l'ambiance, ≥ 10 LU (14 pour un public non expert) pour une musique. Creuser la bande **1–4 kHz** des bruitages et ambiances pendant la parole, au lieu d'une baisse large bande. Placer les bruitages dans les **trous entre les mots** (`words.json`). | Torcoli 2019 (JAES), SII ANSI S3.5, principe Trackspacer |
| 2 | Accroche : coup sourd passe-bas à 160 Hz ; accents à 30 Hz–16 kHz | Sur téléphone, ce coup sourd **ne s'entend pas** (beaucoup de haut-parleurs chutent vers 800 Hz). Ajouter à chaque impact une couche « corps » 150–800 Hz et/ou des **harmoniques** du grave (non-linéarité). Le sub reste un bonus casque. | Waves ; Moliner et al., DAFx 2020 |
| 3 | Signature de fin = impact + carillon de banque | Un vrai **logo sonore** : ≤ 2 s, fait de 3–4 sons réels du monde de la marque, avec un geste qui monte comme la flèche orange et finit sur une note stable. Rythme en 4 temps « u-to-pi-car ». Un temps de silence avant, calé sur le dessin du logo. Les badges numérotés jouent ses notes. 20–30 candidats, puis un test à l'aveugle par mots associés. | Netflix (20k.org), Intel, Mastercard, BMW, Spence & Keller 2024 |
| 4 | Réverbe commune : IR de bruit synthétique, 0,45 s, −15 dB | Utiliser la **vraie réponse impulsionnelle de la voiture** (ou « worldizer » le bus bruitages dans l'habitacle). Garder les sons d'interface plus secs. Les plans de coupe gardent leur propre espace. | Murch (worldizing) |
| 5 | Collision : un son moins prioritaire à < 0,12 s d'un plus prioritaire est retiré | Règle **par famille** : même famille à < ~0,17 s, on retire ; familles différentes dans des bandes disjointes, elles coexistent. Au plus 2 bruitages + la voix à un même instant. Un budget d'accents par vidéo, et un **vide** avant la phrase clé. | Murch (2,5 / 5 couches), Brewster (≤ 6 notes/s), Thom |
| 6 | Famille montante +0, +2, +4, +5 demi-tons | Mettre tous les sons tonaux sur **la tonalité de la marque** et finir la série sur un degré stable (+7 ou +12), qui résout sur le logo de fin. | Audi (logo en 12 tonalités), Jerden |
| 7 | Sons Mixkit posés tels quels | Un **kit de sons réels** (clé, porte, clignotant, ceinture, démarreur, tôle de casse) enregistré, ou isolé dans nos plans de coupe. Chaque son transformé : transposition, étirement, granulaire, réenregistrement. On en génère beaucoup et on en garde peu. | Burtt, Bender, Renault, Deenen, Veenstra, Hahn |
| 8 | Limiteur à −3 dBFS en crête d'échantillon, puis contrôle après AAC | Un limiteur **true-peak suréchantillonné ×4** vers −1,5 dBTP, puis contrôle ≤ −1 dBTP après AAC : les transitoires y gagnent 1–2 dB à loudness égale. Garder −14 LUFS. Contrôler la **somme mono**. | ITU-R BS.1770-5, Apple, Spotify, Waves |

**Voix** (détail en § 4) : le traitement du signal seul plafonne (notre banc : OVRL DNSMOS ≈ 3,1, cible 3,37). Il faut
une restauration neuronale avant la chaîne classique. On ne garde une prise que si elle passe trois contrôles :
DNSMOS, **taux d'erreur de transcription en français** (Whisper) et ressemblance du locuteur. Le DNSMOS seul ne voit pas
les mots inventés (URGENT 2025).

---

## 1. Sound design de montage

### 1.1 Souffle « pré-lap » : la crête sur l'image de coupe
- **Technique** :
  - le souffle démarre avant la coupe et sa crête d'énergie tombe sur la coupe ;
  - il ne dure pas plus que le mouvement qu'il accompagne ;
  - pour varier, on change d'abord la durée, puis la forme ;
  - un souffle qui finit sur un impact sourd donne une destination au mouvement.
- **Pourquoi** : « peaking on the edit point carries the eye across it » ; un souffle trop long est « the most common
  reason one feels wrong » (vendeur).
- **Comment** : la page donne ~1,5–2 s pour une coupe rapide et ~4–5 s pour un long balayage ; « as long as the move it
  covers, and no longer ».
- **Pour notre mixeur** : le calage par la crête existe déjà (ancre « crête »). À ajouter (proposition) :
  - tronquer chaque souffle à la durée du mouvement, avec un fondu de sortie ;
  - ne jamais mettre deux souffles de même durée dans une vidéo ;
  - quand une carte arrive, finir sur un « thunk » bas-médium plutôt que sur une traîne.
- **Sources** :
  - [vendeur] https://morphic.com/resources/sounds/whoosh-sound-effect
  - [primaire] fabrication des souffles, voir § 1.4 (Deenen)
- **Confiance** : moyenne (pratique courante, mais source vendeur).

### 1.2 Montée (riser) et souffle inversé vers une révélation
- **Technique** :
  - **riser** : hauteur et filtre automatisés ensemble pour que le son monte, et un LFO qui accélère et s'intensifie
    (« use pitch and filter automation to make a sound rise in frequency and pitch ») ;
  - le riser s'arrête net sur la révélation (vendeur) ;
  - le **souffle inversé peut être tonal** : la « blossom » finale du *ta-dum* Netflix est une phrase de guitare
    d'environ 30 s jouée à l'envers, passée dans un DigiTech 2101 et utilisée « without any extra sound design ».
- **Pourquoi** : la tension puis la libération. C'est le brief de Netflix : « builds up tension and then releases it,
  just like a story does ».
- **Pour notre mixeur** (proposition) :
  - fabriquer l'inversé à partir du son qui suit : la traîne convoluée de l'impact, ou le mot clé lui-même ;
  - montée en x^2 à x^3 (MO5 utilisait x^2,2 sur 0,9 s) ;
  - coupe nette 0 à 1 image avant l'impact ;
  - riser = bruit filtré + transposition qui monte d'environ une octave + passe-bas qui s'ouvre.
- **Sources** :
  - [primaire] Richard Veenstra (The Solos : *1917*, *Black Panther*) sur le blog d'Ableton :
    https://www.ableton.com/fr/blog/learn-how-to-make-high-impact-sounds-for-movies-and-trailers
  - [primaire] transcription de l'épisode Netflix de Twenty Thousand Hertz : https://www.20k.org/episodes/netflix
  - [vendeur] Morphic, page ci-dessus
- **Confiance** : haute (principe) ; moyenne (réglages).

### 1.3 Impacts, booms, « slams » de badges : des couches, et une version pour téléphone
- **Technique** :
  - construire depuis le grave : un kick ou un taiko dont on coupe l'aigu ;
  - ajouter en haut une percussion métallique ou orchestrale, puis un sub, une atmosphère, et une réverbe pour la
    traîne ;
  - égaliser chaque couche ; « compress individual elements and limit the overall mix » (Veenstra) ;
  - Lon Bender (Netflix) : « any sound is made up of four sounds, generally » ;
  - Tilman Hahn : « combine sounds that feature different frequency bands (Low, Mid, High) ».
- **Pourquoi** : chaque couche a son rôle. L'attaque donne la netteté, le corps le poids, la traîne l'espace.
- **Version téléphone** :
  - beaucoup de haut-parleurs de téléphone chutent dès ~800 Hz, une tablette vers 400 Hz, un portable vers 200 Hz
    (Waves) ;
  - un égaliseur ne peut pas rendre ce grave : il y faudrait une énergie énorme, qui distord et peut abîmer le
    haut-parleur (DAFx 2020) ;
  - la solution est la **basse virtuelle** (fondamentale manquante). On ajoute des harmoniques que le haut-parleur
    reproduit, et l'oreille reconstruit la fondamentale ;
  - Moliner, Rämö et Välimäki (DAFx 2020) traitent séparément les **transitoires** (dispositif non linéaire :
    redresseur demi-onde suivi d'une exponentielle « fuzz », qui donne une série harmonique complète) et les **sons
    tenus** (harmoniques par vocodeur de phase, pondérées pour garder le timbre). Leur méthode hybride a la meilleure
    note MUSHRA (11 auditeurs retenus).
- **Pour notre mixeur** (proposition) :
  - chaque accent sur 3–4 couches : clic 2–5 kHz ; corps 150–800 Hz (une vraie porte de voiture, § 1.4) ; sub sous
    100 Hz, bas ; traîne = IR de l'habitacle (§ 1.9) ;
  - une couche d'harmoniques par impact : passe-bas 120 Hz → redressement demi-onde → `tanh` → passe-bande 150–1 000 Hz,
    mélangée à −6 à −12 dB ;
  - contrôle sans écoute (test Waves) : passer le mix dans un passe-haut à 800 Hz (6 dB/oct) et vérifier que l'accent
    garde sa crête relative ;
  - l'actuel « coup sourd » d'accroche, passe-bas à 160 Hz, est entièrement sous la zone utile d'un téléphone ;
  - le filtre ffmpeg `virtualbass` n'est **pas** adapté : testé en local, il sort un 2.1 (canal LFE ajouté) et non un
    stéréo enrichi.
- **Sources** :
  - [primaire] Ableton / Veenstra (ci-dessus) ; 20k.org Netflix (ci-dessus)
  - [blog] Tilman Hahn chez A Sound Effect, 2014 : https://www.asoundeffect.com/the-sound-of-the-whoosh-with-tilman-hahn/
  - [vendeur] Waves : https://www.waves.com/tips-for-great-mixes-on-small-speakers
  - [primaire] DAFx 2020, CC BY :
    https://acris.aalto.fi/ws/portalfiles/portal/51973173/Eloi2020_Virtual_bass_DAFx2020.pdf
- **Confiance** : haute (couches, harmoniques) ; moyenne (fréquences de coupure des téléphones, source vendeur ; nos
  chiffres).

### 1.4 Fabriquer des sons originaux à partir d'enregistrements réels
- **Technique** (des exemples documentés par leurs auteurs) :
  - **Ben Burtt, sabre laser** : un bourdonnement de projecteur au repos, plus le buzz d'un tube de télévision capté
    par un câble de micro abîmé. La boucle est rejouée sur un haut-parleur et réenregistrée en balançant un second micro,
    ce qui donne l'effet Doppler. Le blaster vient d'un hauban de pylône frappé. Les sons réels apportent « the
    credibility of those sounds ».
  - **Lon Bender, *ta-dum*** : son alliance frappée contre un meuble de sa chambre, une enclume ralentie (« deeper
    tone ») et des coups étouffés « for more oomph ». Il a fait 20 à 30 propositions.
  - **Renault** : une sonothèque et surtout la nature (« pieces of wood rubbing together, percussive sounds, seeds
    pouring »), stylisées puis mixées. Des utilisateurs cibles les testent avec des mots : trop « dark », « sharp »,
    « plastic », « musical ».
  - **Richard Veenstra** :
    - étirer dans le temps pour faire des nappes ;
    - partir d'enregistrements à haute fréquence d'échantillonnage pour les descendre de **2 à 3 octaves** proprement ;
    - jouer sur les réglages de formants.
  - **Tilman Hahn** : lecture granulaire d'enregistrements de terrain ; mélanger des sources dissemblables (« fire with
    wind »).
  - **Charles Deenen, « 100 whooshes in 2 minutes »** :
    - 10–20 pistes, avec 4–5 min de matière montée ;
    - 2–3 bus de mouvement (Doppler, flanger, filtres d'enveloppe), chaque bus baissant l'autre par sidechain ;
    - une porte qui déclenche les impacts au point le plus fort ;
    - de l'automation aléatoire, et chaque passage enregistré. On obtient 2 à 5 souffles utilisables par passage.
  - **SAM Audio** (Meta, décembre 2025) : isole un son décrit en texte (« car engine ») dans la bande-son d'une vidéo.
    De quoi extraire des sons réels de **nos propres plans de coupe**. Licence « SAM License », poids sur demande,
    GPU recommandé.
- **Pourquoi** : un son enregistré dans le monde du sujet porte du sens et ne ressemble à aucune banque.
- **Pour nous** (proposition) :
  - un « kit utopicar » de 15–25 sons réels : clé, bip de télécommande, verrouillage, claquement de porte, relais de
    clignotant, ceinture, démarreur, frein à main, gravier, tôle de casse, papier ou carte grise ;
  - chaque son transformé : ±12–24 demi-tons, étirement, granulaire, réenregistrement dans l'habitacle ;
  - 20–30 variantes par rôle, on en garde 3–5.
- **Sources** :
  - [primaire] https://www.20k.org/episodes/starwarspewpew
  - [primaire] https://www.20k.org/episodes/netflix
  - [primaire] Renault, 2021 :
    https://www.renaultgroup.com/en/magazine/our-group-news/renault-in-tune-with-the-sound-episode-1/
  - [primaire] Ableton / Veenstra (§ 1.2) ; Hahn (§ 1.3)
  - [primaire] Deenen : https://designingsound.org/2010/02/26/charles-deenen-special-100-whooshes-in-2-minutes/
  - [primaire] https://github.com/facebookresearch/sam-audio
- **Confiance** : haute.

### 1.5 Bruitages d'interface (badges, cartes mots) : les règles des earcons
- **Technique** (Brewster, Wright & Edwards, université de Glasgow) :
  - construire une famille de sons par le timbre, le registre et le rythme. Pour qu'un son se reconnaisse seul, il faut
    « big differences » ; un nombre de notes différent par rythme est « very effective » ;
  - pas de note de moins de **0,0825 s**, sauf pour un son très simple d'une ou deux notes (0,03 s) ;
  - jusqu'à **6 notes par seconde** ;
  - hauteur entre **125–150 Hz** et **5 kHz** au plus ;
  - ne pas différencier par l'intensité seule ;
  - la position stéréo aide à distinguer des sons joués en même temps.
- **Google (earcons)** :
  - « as brief as possible », cohérents avec la marque, peu nombreux, « in moderation » ;
  - « If you feel like you have to teach users what an earcon means, don't use an earcon ».
- **Sémiotique** : le clignotant de la Bentley Continental GT fait le « tick-toc » d'une pendule de voyage plutôt qu'un
  bruit « tinny ». Un son d'interface peut porter le sens du monde de la marque (Spence & Keller 2024).
- **Une seule mélodie pour tout** :
  - Mastercard : la mélodie sous-tend le logo sonore, les sonneries, l'attente téléphonique et le son de paiement ;
  - Intel : Werzowa a tiré « 20 sounds » de ses 5 notes.
- **Pour nous** (proposition) :
  - les badges numérotés jouent les notes du logo sonore (§ 2.7). La vidéo « épelle » le logo, et la carte de fin le
    complète ;
  - partie tonale ≥ 83 ms, registre 150 Hz–5 kHz, harmoniques au-dessus de 800 Hz pour le téléphone ;
  - dans une même famille, des événements espacés d'au moins ~0,17 s (6 par seconde).
- **Sources** :
  - [primaire] https://www.dcs.gla.ac.uk/~stephen/earcon_guidelines.shtml
  - [primaire] https://developers.google.com/assistant/conversation-design/earcons
  - [primaire] Spence & Keller 2024, *Psychology & Marketing* 41:1530, CC BY : https://doi.org/10.1002/mar.21995
    (PDF lu en entier)
  - [primaire] Mastercard, 2019 : https://newsroom.mastercard.com/news/press/2019/february/sound-on-mastercard-debuts-sonic-brand/
  - [primaire] Intel : https://www.intel.com/content/www/us/en/support/articles/000015030/programs.html
- **Confiance** : haute (règles) ; moyenne (adaptation).

### 1.6 Le son propre des plans de coupe, et le hors-champ
- **Technique** (Randy Thom, *Designing a Movie for Sound*) :
  - les personnages entendent leur environnement, et ce qu'ils entendent dit qui ils sont ;
  - le hors-champ fait travailler l'imagination : « starving the eye will inevitably bring the ear, and therefore the
    imagination, more into play » ;
  - montrer un son à l'image avant de l'utiliser hors champ ;
  - laisser durer un plan pour qu'on écoute.
- **Pour nous** (proposition) :
  - garder le vrai son du plan (moteur, circulation, clés) plutôt qu'un bruitage de banque ;
  - ouvrir le son du plan de coupe 0,2–0,5 s avant son image (J-cut) et le laisser mourir sous le retour à l'avatar
    (L-cut) ;
  - une clé vue une fois peut revenir plus tard hors champ, comme rappel.
- **Source** : [primaire] http://filmsound.org/articles/designing_for_sound.htm
- **Confiance** : moyenne (principes de cinéma transposés au short).

### 1.7 Un vide avant la phrase clé
- **Technique** :
  - Randy Thom : penser « when to linger on a shot after the dialog is finished, or before it begins » ; le son « has
    value when it is part of a continuum, when it changes over time » ;
  - Jean-Michel Jarre (Renault) : partir du silence, « a blank canvas » ;
  - le *bong* d'Intel commence par une note longue, le « palate cleanser », qui « closes off whatever sound was there
    before » ;
  - le *ta-dum* : tension, puis libération.
- **Pourquoi** : le contraste. Un son qui sort du silence se remarque ; le même son sur un fond plein se perd.
- **Pour nous** (proposition) :
  - dans les 150–300 ms avant le chiffre ou le prix clé : ambiance −10 à −15 dB, aucun bruitage, la voix seule ;
  - l'accent tombe sur la syllabe du chiffre ou juste après, jamais avant.
  - Notre méthode MO avait déjà « 0,1 s de vide juste avant le pivot » pour la musique.
- **Sources** :
  - [primaire] Thom (ci-dessus)
  - [primaire] Renault : https://www.renaultgroup.com/en/magazine/our-group-news/design-talks-sound-design-bringing-emotion-to-function/
  - [blog] Werzowa dans The Globe and Mail : https://www.theglobeandmail.com/report-on-business/the-mozart-of-jingles/article4211353
  - [primaire] 20k.org Netflix
- **Confiance** : moyenne (principe) ; faible (durées).

### 1.8 Panoramique qui suit le mouvement à l'écran
- **Technique** :
  - la position stéréo aide à séparer des sons simultanés (Brewster) ;
  - beaucoup de petits haut-parleurs sont en pratique mono, d'où « checking your mix in mono is critical » (Waves) ;
  - un téléphone tenu en portrait a ses deux haut-parleurs en haut et en bas : gauche/droite n'y correspond pas à
    l'écran. **Aucune source officielle trouvée** ; les réponses communautaires se contredisent.
- **Pour nous** : garder ±0,25 au plus (déjà la règle) et aucun élargissement par la phase (Haas). Proposition :
  vérifier que la loudness de la somme L+R reste à moins de 1 LU de la stéréo, et que la corrélation reste positive.
  Le panoramique sert surtout à l'écoute au casque.
- **Sources** : [primaire] Brewster (§ 1.5) ; [vendeur] Waves (§ 1.3).
- **Confiance** : faible à moyenne.

### 1.9 Un espace acoustique commun, réel plutôt que synthétique
- **Technique** (*worldizing*, Walter Murch, *American Graffiti*) :
  - rejouer un son sur un haut-parleur dans un vrai lieu, le réenregistrer à distance, puis doser le sec et le
    réverbéré ;
  - « The most convincing way to make something sound like it was recorded in a room is to record it in one »
    (Nick Peck) ;
  - pour Murch, cela donne aussi de la profondeur de champ : une musique diffuse n'a pas de bords et ne concurrence pas
    le dialogue.
- **Pour nous** (proposition) :
  - (a) enregistrer la **réponse impulsionnelle de la vraie voiture** (claquement de mains, ballon, ou balayage sinus
    puis déconvolution), micro à la place de celui de la voix, puis convoluer les bruitages ponctuels à faible dosage,
    à la place de l'IR de bruit synthétique de `mix.py` ;
  - (b) ou worldizer le bus bruitages : le rejouer dans l'habitacle sur un petit haut-parleur et le réenregistrer ;
  - (c) si la voix est restaurée en voix sèche de studio (§ 4), garder les sons d'interface secs et ne donner de
    l'espace qu'aux sons diégétiques ;
  - la méthode exacte de mesure par balayage (Farina, AES 2000) n'a pas pu être ouverte.
- **Source** : [primaire] http://filmsound.org/terminology/worldizing.htm
- **Confiance** : haute (principe) ; moyenne (adaptation).

### 1.10 Accorder les sons sur une tonalité
- **Technique** :
  - Audi fournit son logo sonore (le battement de cœur) dans **les 12 tonalités** « so it fits into any commercial » ;
  - Bryan Jerden (bandes-annonces de *Prometheus* et *Inception*) : « watch out for tonal sound effects that are out of
    key with the music ».
- **Pour nous** (proposition) :
  - fixer la tonalité de la marque, celle du logo sonore ;
  - mesurer la hauteur de chaque son tonal (pop, carillon, slam) avec `librosa.pyin` et le transposer sur le degré de
    gamme le plus proche ;
  - finir la famille montante sur +7 ou +12 (degrés stables) plutôt que sur +5, qui reste suspendu ;
  - s'il y a une musique, transposer le logo et les sons tonaux dans sa tonalité.
- **Sources** :
  - [blog] Dexigner, 2010 : https://www.dexigner.com/news/21107
  - [blog] https://jonnyelwyn.co.uk/sound-design-mixing/film-trailer-sound-design
- **Confiance** : moyenne à haute (principe) ; le choix des degrés est une proposition.

### 1.11 Éviter le son « banque » (pas de preset, pas de son stock)
- **Technique**, ce que font les pros cités plus haut :
  1. **une source qui a du sens**, enregistrée dans le monde du sujet (Burtt, Bender, Renault) ;
  2. **3 à 4 couches** sur des bandes différentes (Bender, Hahn) ;
  3. **des transformations** : 2–3 octaves vers le bas, étirement, granulaire, réenregistrement à travers un haut-parleur
     et un lieu (Veenstra, Hahn, Burtt, Murch) ;
  4. **jouer le son plutôt que le régler** : automation en direct et aléatoire, puis on garde 2–5 prises sur un passage
     (Deenen) ;
  5. **beaucoup de candidats, peu d'élus** : 20–30 propositions et un test à l'aveugle pour le *ta-dum*.
  - Varier chaque occurrence (quelques centièmes de ton, point de départ) est une pratique du jeu vidéo, **non
    vérifiée ici**.
- **Pour notre mixeur** : chaque rôle reçoit 3–5 sons maison au lieu d'un fichier Mixkit. Les sons Mixkit ne servent
  plus que de matière première, transformée.
- **Confiance** : moyenne à haute.

### 1.12 Combien de sons sur un face-caméra ?
- **Technique** :
  - **Murch, règle des deux et demi** : au-delà de « not quite three layers » d'un même type de son, ils se fondent en un
    seul groupe ;
  - des couches réparties sur tout le spectre (du dialogue « violet » à la musique « rouge ») tiennent jusqu'à
    **cinq** ;
  - la densité doit varier d'un moment à l'autre, comme le volume ;
  - Thom critique la « théorie des 100 % », où chaque métier remplit tout et crée un embouteillage ;
  - Google : les earcons « in moderation » ; Brewster : ≤ 6 notes/s.
- **Pour nous** (proposition) :
  - remplacer la règle de collision par une **règle par famille** :
    - deux sons de la même famille à moins de ~0,17 s : on garde le prioritaire ;
    - deux familles différentes, dans des bandes disjointes : elles coexistent ;
  - jamais plus de 2 bruitages en même temps que la voix ;
  - un budget de 2 à 4 accents par vidéo de 30 s, et rien sur la phrase clé.
- **Sources** :
  - [primaire] Murch, *Dense Clarity – Clear Density* : https://transom.org/2005/walter-murch/
  - [primaire] Thom (§ 1.6) ; Google (§ 1.5) ; Brewster (§ 1.5)
- **Confiance** : moyenne (règles de cinéma, budget proposé).

---

## 2. Signature sonore (logo sonore de 1 à 2 s)

### 2.1 Netflix, *ta-dum* : comment il a été construit
- **Faits** (transcription de Twenty Thousand Hertz, avec Todd Yellin, Tanya Kumar, Lon Bender et Charlie Campagna) :
  - le brief : « it had to be really short », « like three seconds » ; Tanya Kumar parle de « only four seconds » ;
  - tension puis libération ; « more cinematic than electronic » ; faire penser « Netflix » sans dire le nom ;
  - les sons : l'alliance contre le meuble, une enclume ralentie, des coups étouffés, et la guitare inversée pour la
    « blossom » ;
  - 20–30 propositions groupées par esthétique ;
  - une enquête à l'aveugle auprès de « thousands of people », chacun entendant un seul son. Les mots du gagnant :
    « dramatic, interesting, beginning, good, short », avec « movie » en tête ;
  - un an de travail ;
  - l'image a changé au fil des années, le son très peu.
- **Leçon** : des sons réels, 3–4 couches, un contour en tension puis résolution, et un **test par mots associés**
  plutôt que par goût.
- **Source** : [primaire] https://www.20k.org/episodes/netflix
- **Confiance** : haute.

### 2.2 Intel, *bong*
- **Faits** :
  - « a simple five-note tune » ; Werzowa a tiré « 20 sounds » de ces notes (Intel) ;
  - une note longue d'ouverture (le « palate cleanser »), puis quatre notes qui suivent les quatre syllabes
    « In-tel In-side » ; « only a few seconds » ; « went for simplicity » (The Globe and Mail) ;
  - les dates de création se contredisent (1991 ou 1994).
- **Leçon** : le rythme vient des **syllabes du nom**. Pour « u-to-pi-car », c'est 4 temps.
- **Sources** : [primaire] Intel (§ 1.5) ; [blog] The Globe and Mail (§ 1.7).
- **Confiance** : haute (5 notes, syllabes) ; moyenne (le reste).

### 2.3 Mastercard
- **Faits** :
  - la mélodie est « the foundation of the company's sound architecture » ; elle se décline en partitions, logos
    sonores, sonneries, musique d'attente et sons d'acceptation de paiement ;
  - jouée en styles « operatic, cinematic and playful » et en versions régionales ;
  - « distinct and authentic, yet adaptable globally and across genres » (Raja Rajamannar) ;
  - selon Mastercard et GfK, cité par Spence & Keller : 12 mois après le lancement, 77 % des consommateurs trouvaient la
    marque plus digne de confiance (chiffre d'entreprise).
- **Leçon** : un seul motif, décliné partout. Pour nous, logo de fin, badges, cartes et carillons viennent du même
  motif.
- **Sources** :
  - [primaire] communiqué Mastercard, février 2019 (§ 1.5) ; le kit presse a refusé la lecture (403)
  - [primaire] Spence & Keller 2024 (§ 1.5)
- **Confiance** : moyenne à haute.

### 2.4 McDonald's
- Wikipedia confirme seulement l'origine : un jingle écrit pour la campagne de 2003, adapté de la campagne allemande
  « Ich liebe es », crédité à Pharrell Williams, Tom Batoy, Franco Tortora et Andreas Forberger. Le nombre de notes du
  « ba-da-ba-ba-ba » et ses règles d'usage **n'ont pas été vérifiés** dans une source ouverte.
- **Source** : [blog] https://en.wikipedia.org/wiki/I%27m_Lovin%27_It_(song)
- **Confiance** : faible.

### 2.5 Constructeurs automobiles
- **BMW**, sons de démarrage et IconicSounds Electric, par Hans Zimmer et Renzo Vitale :
  - le son de démarrage dure **2 s** : une note de chœur qui enfle, plus un « impact sound » ;
  - environ 6 mois d'itérations (Robb Report, 2023) ;
  - « clásico pero sorprendente », avec une « sensación de ligereza » (communiqué BMW).
- **Audi** :
  - un battement de cœur humain réel, plus court, plus dynamique, mêlé de sons techniques et plus large en spectre
    (2010) ;
  - livré dans **les 12 tonalités** ;
  - selon un extrait de recherche, la page du guide d'identité d'Audi l'associe au logo animé de fin de film. Elle
    était en 404 à la lecture, ce point n'est donc pas vérifié.
- **Renault** :
  - sons tirés de la nature puis stylisés, et testés par des utilisateurs avec des mots ;
  - « We're not making music, we're communicating messages with an intentional aesthetic » ;
  - Renault travaille de longue date avec l'Ircam et le compositeur Andrea Cera. Jean-Michel Jarre les a rejoints : avec
    l'Ircam et les équipes de Renault, il a créé le son piéton et la séquence d'accueil de la Renault 5 (synthés années
    80 dans un cadre contemporain) ;
  - une signature « empathetic […] that expresses mobility rather than speed and power ».
- **Bentley** : le clignotant fait le « tick-toc » d'une pendule de voyage (§ 1.5).
- **Polestar** : rien trouvé.
- **Sources** :
  - [blog] https://robbreport.com.au/motors/automotive/bmw-sound-renzo-vitale/
  - [primaire] https://www.press.bmwgroup.com/spain/article/detail/T0306805ES/el-sonido-del-bmw-concept-i4
  - [blog] Dexigner (§ 1.10)
  - [primaire] Renault (§ 1.4 et § 1.7)
  - [primaire] https://www.renaultgroup.com/en/news-on-air/news/what-sound-identity-is-appropriate-for-electric-cars
- **Confiance** : moyenne.

### 2.6 Ce que la recherche dit des logos sonores
Source pour toute cette section : Spence & Keller 2024, revue CC BY, *Psychology & Marketing* (§ 1.5).
- **Correspondances entre les sens** :
  - la hauteur d'un son s'associe à l'élévation, à la taille et à la luminosité ;
  - c'est surtout la hauteur **relative** qui compte ;
  - les combinaisons qui se correspondent « tend to be easier to learn » et sont traitées « more fluently ».
  - D'où, pour nous : une flèche qui monte va avec un geste sonore qui monte.
- **La convenance ne suffit pas** : un logo sonore doit aussi plaire et être « auditorily distinctive and memorable ».
- **Sémiotique** : un logo sonore peut représenter les symboles de la marque, comme un logo visuel.
- **Lien avec la marque** : selon SoundOut, quand le consommateur ne relie pas le logo sonore à la marque, la valeur
  perçue baisse de **7,7 %**. Il faut donc l'associer toujours au logo visuel et le répéter à l'identique.
- **Chiffres d'Ipsos 2020** (cités dans la revue, et par TikTok qui parle de « 8x ») :
  - les éléments audio sont 3,44 fois plus efficaces que les éléments visuels ;
  - les logos sonores sont 8,53 fois plus présents dans les publicités performantes.
  - Ce sont des chiffres d'industrie.
- **Contour et tonalité** (Zoghaib, Luffarelli & Feiereisen 2023, lu via un résumé de blog) :
  - un contour irrégulier ou une tonalité instable donnent une marque plus « innovante », mais moins aimée ;
  - un contour régulier et une tonalité stable la rendent plus « likable and approachable ».
  - Pour une plateforme de débutants, cela pousse vers un contour simple qui résout.
- **Sources** :
  - [primaire] Spence & Keller 2024
  - [primaire] TikTok, 2021 : https://ads.tiktok.com/business/en-US/blog/evolution-of-sound-volume-1
  - [blog] https://newneuromarketing.com/rocking-your-brand-how-music-can-influence-brand-perception
- **Confiance** : haute (revue) ; moyenne (Zoghaib via blog, chiffres d'industrie).

### 2.7 Cahier des charges du logo sonore utopicar (proposition, à partir de 2.1 à 2.6)
- **Durée** : ≤ 2 s jusqu'à la fin de la traîne (BMW : 2 s ; le *ta-dum*, plus cinématographique, fait 3–4 s).
- **Matière** : 3–4 sons réels du monde de la marque, transformés (§ 1.4). Par exemple : le double bip ou le clic de la
  télécommande pour l'attaque, la porte qui claque pour le corps, un relais de clignotant pour le rythme.
- **Contour** : une montée courte et régulière qui suit le tracé de la flèche orange, et une résolution sur la tonique.
- **Rythme** : 4 temps « u-to-pi-car », précédés d'un temps de silence d'environ 150–250 ms, notre « palate cleanser ».
- **Calage** : l'attaque principale sur l'image où le dessin du logo se termine, la résolution sur la pointe de la
  flèche.
- **Toujours le même fichier.** On ne change que l'arrangement ou la tonalité (Audi, Mastercard).
- **Les badges et carillons de toute la série** reprennent ses notes (Mastercard, Intel).
- **Sélection** : 20–30 candidats, puis un test à l'aveugle en français. Chaque personne entend un seul son et donne
  trois mots ; on garde celui dont les mots sont « simple, confiance, voiture, malin » (Netflix, Renault).

---

## 3. Mixer pour le téléphone

### 3.1 Ce que reproduit un haut-parleur de téléphone
- **Faits** :
  - « many cell phone speakers begin to drop off around 800 Hz » ; tablettes ~400 Hz ; portables ~200 Hz ; les aigus
    tiennent jusqu'à ~18 kHz (Waves) ;
  - la coupure basse d'un « petit haut-parleur » varie de 100 à 200 Hz environ (DAFx 2020, plutôt portables et
    enceintes) ;
  - on ne peut pas compenser par l'égaliseur (DAFx).
- **Comment** :
  - tester le mix filtré à 200, 400 et 800 Hz (6 dB/oct) contre une référence ;
  - placer les éléments importants dans « 400 Hz to 6K » ;
  - pousser l'attaque dans « 700 Hz to 2 kHz » (Waves).
- **Sources** : [vendeur] Waves (§ 1.3) ; [primaire] DAFx 2020 (§ 1.3).
- **Confiance** : moyenne (aucune mesure de téléphone primaire trouvée).

### 3.2 Bande de présence de la voix, et creuser les autres sons à sa place
- **Faits** : poids d'intelligibilité par octave de l'indice SII (ANSI S3.5-1997) : 250 Hz 0,062 ; 500 Hz 0,167 ;
  **1 kHz 0,237 ; 2 kHz 0,265 ; 4 kHz 0,214** ; 8 kHz 0,055. Les octaves de 1 à 4 kHz portent environ 72 % de
  l'intelligibilité.
- **Technique** : un égaliseur piloté par la voix, qui ne baisse dans les autres sons que les fréquences où ils gênent la
  voix. C'est le principe de Trackspacer, un égaliseur à 32 bandes en sidechain qui applique la courbe inverse : « it
  only touches the frequencies that are actually clashing » (résumés de presse lus via la recherche ; page produit non
  ouverte).
- **Pour notre mixeur** (proposition) :
  - TFCT de la voix et du bus bruitages/ambiances, puis gain par bande sur le bus : baisse jusqu'à −6/−10 dB dans
    1–5 kHz proportionnelle à l'énergie de la voix, attaque ~10 ms, relâchement 150–250 ms ;
  - ce n'est pas faisable avec ffmpeg 6.1.1 : `adynamicequalizer` n'y a pas d'entrée sidechain (vérifié), et
    `sidechaincompress` agit sur toute la bande. Il faut le faire en numpy.
- **Source** : [primaire, dérivé de la norme] https://rdrr.io/rforge/SII/man/sii.html
- **Confiance** : haute (poids SII) ; moyenne (adaptation).

### 3.3 Coupe-bas sur les bruitages : le grave perdu
- **Faits** :
  - le filtre de pondération K de la mesure de loudness (ITU-R BS.1770-5, 11/2023) se fait en deux étages, « shelving »
    puis « high-pass » : le très grave pèse peu dans les LUFS ;
  - il occupe pourtant de la marge de crête, et le limiteur travaille pour rien ;
  - un téléphone ne le reproduit pas (§ 3.1).
- **Pour nous** (proposition) : passe-haut 150–250 Hz sur les bruitages qui doivent s'entendre au téléphone. Un sub
  bas, en bonus casque, seulement sous les accents. Une couche d'harmoniques à la place (§ 1.3).
- **Source** : [primaire] https://www.itu.int/dms_pubrec/itu-r/rec/bs/R-REC-BS.1770-5-202311-I!!PDF-E.pdf (PDF lu)
- **Confiance** : moyenne.

### 3.4 Quel écart entre la voix et le fond (au lieu d'une baisse fixe)
- **Faits** (Torcoli et al., JAES 67(12), 2019 ; 22 auditeurs à l'audition normale) :
  - « we recommend at least 10 LU difference for CoM [commentaire sur musique] and at least 15 LU for CoA
    [commentaire sur ambiance] » ;
  - les non-experts préfèrent environ **4 LU de plus** que les experts ;
  - le minimum de la DPP britannique (repris par d'anciennes recommandations de Netflix) est de **4 LU** entre la parole
    et le fond (Torcoli et al. 2024, arXiv).
- **Pour notre mixeur** (proposition) :
  - mesurer la loudness à court terme (fenêtre de 400 ms à 3 s) de la piste voix et du bus de fond pendant la parole ;
  - viser ≥ 15 LU pour l'ambiance, ≥ 14 LU pour une musique (public non expert), et pour les bruitages ponctuels
    ≥ 6–10 LU sous la voix sauf s'ils tombent dans un trou ;
  - rapporter le minimum et la médiane par plan dans `<clip>-mix.txt`, à la place de « −4 dB / −6 dB ».
- **Sources** :
  - [primaire] https://cris.fau.de/publications/234640600
  - [primaire] https://arxiv.org/html/2405.17364
- **Confiance** : haute.

### 3.5 Loudness et normalisation sur YouTube Shorts, Instagram Reels et TikTok
- **YouTube** :
  - référence de lecture **−14 LUFS** depuis septembre 2019 (MeterPlugs) ;
  - YouTube baisse le volume des vidéos trop fortes et « doesn't turn up quieter videos » (Production Advice, 2017) ;
  - sur l'application mobile, le **volume stable** est actif par défaut : il « balances the range between quiet and loud »
    en continu, sauf pour YouTube Music et les clips officiels ;
  - rien de spécifique aux Shorts trouvé.
- **Meta (Reels, Stories)** :
  - le codec xHE-AAC laisse l'audio d'origine « untouched » et confie la loudness au lecteur via des métadonnées ;
  - le lecteur fixe un niveau cible et un type de compression « based on context » ;
  - **aucune cible chiffrée publiée**.
- **TikTok** : **aucune documentation officielle trouvée**. Le −14 LUFS / −1 dBTP vient de blogs et d'outils.
- **Pour référence**, Spotify :
  - −14 LUFS ;
  - true-peak sous −1 dBTP, ou sous −2 dB si le master dépasse −14 LUFS ;
  - garde 1 dB de marge pour les formats compressés.
- **Conséquence** : −14 LUFS intégrés et ≤ −1 dBTP restent un bon compromis.
  - À −14, YouTube ne touche pas au niveau, mais le volume stable peut encore tasser la dynamique sur mobile.
  - Meta normalise à la lecture.
  - Pour TikTok, l'inconnu demande une vérification sur une vidéo publiée puis téléchargée.
- **Sources** :
  - [blog] https://www.meterplugs.com/blog/2019/09/18/youtube-changes-loudness-reference-to-14-lufs.html
  - [blog] https://productionadvice.co.uk/stats-for-nerds/
  - [primaire] https://support.google.com/youtube/answer/14106294
  - [primaire] https://engineering.fb.com/2023/04/11/video-engineering/high-quality-audio-xhe-aac-codec-meta/
  - [primaire] https://support.spotify.com/us/artists/article/loudness-normalization/
- **Confiance** : moyenne (YouTube, Meta) ; faible (TikTok).

### 3.6 True-peak et marge pour l'AAC
- **Faits** :
  - BS.1770-5 mesure le true-peak sur un signal suréchantillonné à au moins 192 kHz (×4 à 48 kHz) ;
  - Apple : « leave at least 1 dB of headroom » contre l'écrêtage au suréchantillonnage ;
  - Spotify : −1 dBTP, −2 dBTP pour les masters plus forts que −14 LUFS ;
  - les plateformes réencodent encore après nous (Meta en xHE-AAC).
- **Pour notre mixeur** (proposition) :
  - aujourd'hui, le limiteur plafonne à −3 dBFS en crête d'échantillon (`alimiter`) ;
  - suréchantillonner ×4 (`aresample=192000`), limiter vers −1,5 dBTP, redescendre à 48 kHz, puis garder le contrôle
    ≤ −1 dBTP après l'encodage AAC ;
  - à −14 LUFS égaux, les impacts y gagnent 1–2 dB de crête ;
  - option à essayer en mesure : `apsyclip`, l'écrêteur psychoacoustique de ffmpeg ;
  - `loudnorm` sait viser un TP en mode linéaire avec les mesures d'une première passe, mais repasse en mode dynamique
    s'il ne peut pas tenir.
- **Sources** :
  - [primaire] ITU (§ 3.3)
  - [primaire] https://www.apple.com/apple-music/apple-digital-masters/docs/apple-digital-masters.pdf (PDF lu)
  - [primaire] Spotify (§ 3.5)
  - [local] `ffmpeg -h filter=loudnorm` et `apsyclip`
- **Confiance** : haute (principes) ; moyenne (gain de 1–2 dB, à mesurer).

### 3.7 Compatibilité mono
- **Faits** : beaucoup de petits haut-parleurs sont en pratique mono. Il faut garder les éléments principaux au centre
  et réserver l'élargissement aux effets (Waves).
- **Pour nous** : un contrôle mono mesuré, voir § 1.8.
- **Confiance** : moyenne.

---

## 4. La voix : du son d'habitacle à une voix de studio

### 4.1 Le point de départ (nos mesures)
- Le banc de `montage-4k/work/voix_studio.py` (10 plans, DNSMOS P.835) donne :
  - piste Omni brute : OVRL ≈ 3,0 à 3,27 ;
  - chaîne actuelle (coupe-bas 60 Hz, égalisation d'appariement, pauses −10 dB) : +0,05 à +0,19 ;
  - cible (voix ElevenLabs de studio) : 3,37 ;
  - débruitage FFT `afftdn` : la voix se dégrade (SIG 3,49 → 3,25) ;
  - compression 3:1 avant débruitage : le bruit remonte entre les mots ;
  - Resemble Enhance : 3,35 sur un plan, puis exécution refusée par l'environnement.
- L'auteur de RNNoise rappelle qu'un débruiteur n'augmente pas l'intelligibilité (« can only destroy information ») :
  il rend l'écoute plus agréable et moins fatigante.
- **Conclusion** : la chaîne DSP plafonne. Le moteur (non stationnaire, suit le régime) et la réverbération courte de
  l'habitacle demandent un modèle neuronal.
- **Source** : [primaire] https://jmvalin.ca/demo/rnnoise/

### 4.2 Traitement du signal seul et modèles neuronaux : qui fait quoi
| Famille | Exemples | Ce qu'ils font | Risque |
|---|---|---|---|
| Traitement du signal (DSP) | coupe-bas, EQ, `afftdn` (soustraction spectrale), `anlmdn` (moyennes non locales), `afwtdn` (ondelettes), `noisereduce` (porte spectrale, MIT), `deesser`, compresseur, `aexciter`, limiteur | Réglages prévisibles ; enlèvent le bruit stationnaire | Bruit « musical », voix creusée, aucune déréverbération réelle |
| Hybride | RNNoise / `arnndn` (BSD ; 22 bandes Bark, gains par RNN, filtre en peigne sur la hauteur ; ~60× le temps réel sur x86) ; DeepFilterNet 3 | Gains par bandes ou filtre profond appris ; la sortie ne peut pas ajouter de son | Peu de déréverbération |
| Neuronal par masque (discriminatif) | ClearerVoice MossFormer2_SE_48K, FRCRN ; modules de type RX Dialogue Isolate | Séparent la voix du reste | Artefacts si le bruit ressemble à la voix |
| Neuronal génératif (resynthèse) | Adobe Enhance, Descript Studio Sound (« rebuilds each voice »), Resemble Enhance (enhancer), VoiceFixer, Sidon, UniPASE, Auphonic Studio Voice (bêta) | Recréent une voix « comme en studio », y compris réverbe et bande passante | **Voix qui change**, mots inventés, dépendance à la langue |

Sources :
- [primaire] RNNoise (§ 4.1)
- [primaire] https://www.descript.com/tools/remove-background-noise
- [primaire] https://github.com/timsainb/noisereduce
- [local] `ffmpeg -h filter=arnndn` (option `mix` pour doser le traité et le brut)

### 4.3 Outils qui tournent hors ligne : licence, processeur, ce qu'on sait
- **DeepFilterNet 3** (**déjà installé** : `deepfilternet` 0.5.6, commande `deepFilter`) :
  - licence MIT ou Apache-2.0 ; pleine bande 48 kHz ;
  - « real-time-factor of 0.19 on a single threaded notebook CPU » ;
  - options vérifiées en local : `-m DeepFilterNet3` (modèle par défaut dans le code installé), `--atten-lim` (limite
    d'atténuation en dB, par mélange avec le brut), `--pf` (post-filtre) ;
  - les poids se téléchargent au premier lancement ;
  - aucune revendication de déréverbération.
  - Sources : [primaire] https://github.com/Rikorose/DeepFilterNet ; https://arxiv.org/abs/2305.08227. Confiance :
    haute.
- **RNNoise via `arnndn`** (dans ffmpeg) : BSD. Il faut un fichier de modèle `.rnnn` (non vérifié ici). Confiance :
  haute (outil), faible (qualité sur notre voix).
- **ClearerVoice-Studio** (Alibaba Tongyi) :
  - Apache-2.0 ; `pip install clearvoice` ;
  - modèles MossFormer2_SE_48K, MossFormerGAN_SE_16K, FRCRN_SE_16K, et MossFormer2_SR_48K pour la super-résolution ;
  - l'exécution sur processeur n'est pas documentée.
  - Source : [primaire] https://github.com/modelscope/ClearerVoice-Studio
- **UniPASE** (Rong et al., 2026, accepté à IEEE TASLP) :
  - génératif, conçu pour « minimal linguistic hallucination » ; travaille à 16 kHz puis un PostNet sort du 48 kHz ;
  - a servi de base à la soumission **1re en évaluation objective de URGENT 2026** ;
  - code MIT ; poids sur Hugging Face (licence des poids non vue) ; option `-D cpu` ;
  - une commande dédiée aux fichiers de plus de 20 s.
  - Sources : [primaire] https://arxiv.org/abs/2604.14606 ; https://github.com/xiaobin-rong/unipase. Confiance :
    moyenne (pas de chiffres lus).
- **Sidon** (2025) :
  - restauration multilingue, sortie 48 kHz ;
  - entraîné sur réverbération, bruit, bande limitée, écrêtage, MP3 et pertes de paquets ;
  - 104 langues à l'entraînement ; le français fait partie des 100 langues évaluées (FLEURS) ;
  - code MIT ; licence des poids non indiquée ; « most sidon experiments assume a GPU-backed environment ».
  - Sources : [primaire] https://arxiv.org/html/2509.17052v1 ; https://github.com/sarulab-speech/Sidon/
- **VoiceFixer** :
  - MIT ; bruit, réverbération, basse résolution (2–44,1 kHz) et écrêtage dans un seul modèle ;
  - vocodeur 44,1 kHz ; option `cuda=False` ; ancien (2021–2022).
  - Source : [primaire] https://github.com/haoheliu/voicefixer
- **Resemble Enhance** : MIT ; un débruiteur, puis un « enhancer » qui restaure et étend la bande. Matériel non
  documenté. Refusé dans notre environnement.
  - Source : [primaire] https://github.com/resemble-ai/resemble-enhance
- **Apollo** : restauration de **musique** compressée (MP3 vers sans perte). Licence CC BY-SA 4.0. **Pas pour la voix.**
  - Source : [primaire] https://github.com/JusperLee/Apollo
- **SAM Audio** (Meta) : sépare un son par une description texte. « SAM License », poids sur demande, GPU recommandé.
  Utile pour isoler la voix du moteur, ou des sons dans les plans de coupe.
  - Source : [primaire] https://github.com/facebookresearch/sam-audio
- **iZotope RX 12** (avril–mai 2026) :
  - Dialogue Isolate a de nouveaux réseaux, « cleaner voice processing », en temps réel et hors ligne ;
  - Breath Control refait en apprentissage automatique ; nouveaux Scene Rebalance et Stems View ;
  - logiciel commercial, pas sous Linux (non vérifié ici).
  - Source : [primaire] https://www.izotope.com/community/blog/rx-12

### 4.4 Services en ligne
- **Adobe Podcast Enhance Speech v2** :
  - un curseur « speech » (dose de traitement de la voix) et un curseur « background » (niveau du fond isolé) depuis
    février 2025 ;
  - jusqu'à 4 h par jour, fichiers jusqu'à 1 Go.
  - Source : [primaire] https://podcast.adobe.com/en/guides/latest-updates
- **ElevenLabs Voice Isolator** :
  - API `audio-isolation/convert` ; jusqu'à 500 Mo et 1 h ;
  - 1 000 caractères ou crédits par minute ;
  - « not specifically optimized for isolating vocals from music ».
  - Source : [primaire] https://elevenlabs.io/docs/capabilities/voice-isolator
- **Auphonic** :
  - débruiteurs Static, Dynamic et Speech Isolation ;
  - curseurs Remove Noise, Remove Reverb, Remove Breaths ;
  - coupe-bas adaptatif à phase linéaire ; Voice AutoEQ par locuteur ; de-plosive ;
  - Bandwidth Extension (avril 2025) ; **Studio Voice (bêta, 21 juillet 2026)**, qui reconstruit la voix ;
  - limiteur true-peak suréchantillonné ×4.
  - Source : [primaire] https://auphonic.com/help/algorithms/singletrack.html
- **Descript Studio Sound** :
  - intensité par défaut à 100 ;
  - « Occasionally, AI reconstruction can introduce a low or artificial tone » ; remède : baisser l'intensité.
  - Source : [primaire] page Descript (§ 4.2)

### 4.5 Comparaisons publiées, et ce qu'elles valent
- **ClearerVoice-Studio** (Interspeech 2025), sur VoiceBank+DEMAND (bruit sans réverbération) :

  | Modèle | PESQ | SI-SDR | P.808 MOS |
  |---|---|---|---|
  | MossFormer2_SE_48K | 3,15 | 19,36 | 3,53 |
  | DeepFilterNet | 3,03 | 15,71 | 3,47 |
  | Resemble Enhance | 2,84 | 12,42 | 3,53 |

  Source : [primaire] https://www.isca-archive.org/interspeech_2025/zhao25f_interspeech.pdf (PDF lu).
- **Sidon** :
  - FLEURS, moyenne sur 100 langues : DNSMOS 3,393 contre 3,352 pour Miipher-2 ; CER 0,090 contre 0,094 ; le signal
    bruité d'origine a un CER de 0,084, Sidon dégrade donc un peu la transcription ;
  - LibriTTS test-clean : NISQA 4,79 contre 4,69 pour Miipher.
- **URGENT 2025** (Interspeech 2025, 32 systèmes ; l'écoute P.808 n'a porté que sur l'anglais) :
  - le 1er en objectif est discriminatif ;
  - le système génératif T13 a la meilleure note d'écoute (3,69 contre 3,24), mais des mesures intrusives faibles ;
  - il « occasionally hallucinated spoken content, particularly under low-SNR conditions » ;
  - **« DNSMOS yields high scores even when hallucinations occur »** ;
  - les modèles génératifs dépendent de la langue (mesuré sur anglais, allemand, **français**, espagnol, chinois et
    japonais) ;
  - recommandation : combiner les mesures sans référence avec une mesure du contenu (CAcc, l'exactitude des caractères).
  - Source : [primaire] https://arxiv.org/html/2505.23212v2
- **ProVideo Coalition** (2026, Nick Lear) :
  - RX 12 contre RX 11 contre Adobe Enhance ;
  - sur un enregistrement de téléphone réverbéré et sur un trafic dense, **Enhance en ligne gagne** ;
  - mais « as long as you don't mind the possibility of the voice changing slightly » ;
  - RX 12 : « a subtle but important step forward » ; la version d'Enhance intégrée à Premiere est « very patchy ».
  - Source : [blog] https://www.provideocoalition.com/izotope-rx-12-shootout/amp/
- **Diffio** (vendeur concurrent, test du 22 octobre 2026 ; 59 enregistrements réels, mesures de modèles et non écoute) :

  | Outil | Gain SCOREQ | WER (original : 13,2 %) | Similarité avec l'original |
  |---|---|---|---|
  | Adobe | +1,87 | 18,2 % | 0,60 |
  | Auphonic | +0,82 | 13,3 % | 0,84 |
  | ElevenLabs | +0,79 | 18,1 % | 0,83 |
  | Descript | +0,46 | 22,6 % | 0,72 |

  Le gain le plus fort va avec une transcription dégradée et une voix moins ressemblante.
  - Source : [vendeur] https://diffio.ai/best-ai-audio-enhancer/
- **Confiance** : haute (articles) ; faible à moyenne (blog, vendeur). Aucune comparaison indépendante trouvée sur une
  voix française en voiture.

### 4.6 Le meilleur chemin réaliste vers une voix de studio (proposition, appuyée sur 4.1 à 4.5)
1. **Restauration neuronale d'abord**, plan par plan, sur le WAV brut à 48 kHz. Trois candidats :
   - hors ligne et licence permissive : **DeepFilterNet 3** (installé, `--atten-lim` 12–18 dB pour ne pas « sur-nettoyer »),
     puis **UniPASE** (CPU, peu d'hallucinations annoncées) ou **ClearerVoice MossFormer2_SE_48K** si la réverbération
     reste ;
   - en ligne, si c'est accepté : **Adobe Enhance v2** (« speech » 70–90 %, « background » 0–5 %), ou **Auphonic**
     (Speech Isolation + Remove Reverb + Voice AutoEQ ; Studio Voice en bêta) ;
   - **ElevenLabs Isolator**, dont le compte existe déjà.
2. **Ne garder une prise que si elle passe trois contrôles** :
   - DNSMOS (déjà en place) ;
   - **CER/WER en français**, Whisper sur le brut et sur le traité : refuser toute hausse sensible ;
   - **ressemblance du locuteur** entre le brut et le traité (encodeur de locuteur, à choisir) ;
   - pourquoi : URGENT 2025 montre que le DNSMOS ne voit pas les hallucinations, et Diffio que les plus gros gains
     abîment la transcription.
3. **Ensuite, la chaîne de finition**. Points de départ non sourcés, à mesurer :
   - coupe-bas 70–90 Hz, 12–18 dB/oct (le moteur) ;
   - égalisation d'appariement sur la voix de référence (déjà faite) ;
   - de-esser seulement si la sibilance mesurée dépasse : `deesser` i 0,3–0,5, ou `adynamicequalizer` vers 6–8 kHz ;
   - compression douce 2:1–3:1, attaque 10–20 ms, relâchement 100–200 ms, 2–4 dB de réduction, **après** le débruitage
     (notre banc) ;
   - excitateur (`aexciter`) seulement si la bande reste sous 8–10 kHz après restauration ; sinon une extension de bande
     neuronale (Auphonic, MossFormer2_SR_48K) ;
   - phrases ramenées à ±1–2 LU ; limiteur suréchantillonné.
4. **Doser plutôt que tout traiter** : mélanger 10–30 % de brut débruité légèrement (`arnndn mix`, `--atten-lim`, curseurs
   Adobe/Descript) si la voix « change ».
5. **Si la voix vient du générateur vidéo (Omni)** et non d'un micro, le plus propre est de régénérer la réplique en
   voix de synthèse de studio, puis de refaire la synchronisation labiale. C'est la chaîne « hybride » de
   `recherche/notes.md`. Elle sort du cadre de cette recherche.

---

## 5. Musique sous un face-caméra

### 5.1 Faut-il de la musique, et à quel niveau ?
- **Faits** :
  - TikTok, 2021 : 88 % des utilisateurs disent le son « vital » (Nielsen, 2020) ; 50 % disent que la musique rend le
    contenu « more uplifting, energizing, and engaging » (Kantar, 2021). Ce sont des chiffres de plateforme, pas des
    études de face-caméra ;
  - pour le niveau : ≥ 10 LU sous un commentaire, environ 4 LU de plus pour les non-experts (Torcoli 2019, § 3.4) ;
  - aucune source primaire trouvée sur la pratique réelle des monteurs de shorts face caméra.
- **Pour nous** (proposition), deux options mesurables :
  - **A, sans musique** : l'ambiance de l'habitacle, le son des plans de coupe et le logo sonore portent la vidéo.
    C'est 100 % « son original » ;
  - **B, une nappe originale** construite sur le motif du logo sonore, ≥ 14 LU sous la voix, creusée en 1–4 kHz pendant
    la parole, coupée avant la phrase clé (§ 1.7) et qui revient sur le logo.
- **Sources** : [primaire] TikTok (§ 2.6) ; Torcoli (§ 3.4).
- **Confiance** : moyenne (niveaux) ; faible (pratique des monteurs).

### 5.2 Règles des plateformes et risque d'une musique du commerce dans le fichier
- **TikTok** :
  - avec un **compte Business**, « Ajouter un son » ne montre que la Commercial Music Library (« Commercial Sounds »,
    ~1 million de titres, gratuite pour les entreprises, « for organic or paid content ») ;
  - utiliser la bibliothèque générale depuis un compte personnel pour promouvoir une entreprise, c'est « at risk of
    copyright infringement ».
- **Meta** : « Use of music for commercial or non-personal purposes in particular is prohibited » sans licence. Le
  contenu peut être « blocked, muted or removed », et « shorter clips of music are recommended ».
- **YouTube Shorts** :
  - depuis le 15 octobre 2024, un Short de plus d'une minute avec une revendication de droits active est **bloqué dans le
    monde entier** ;
  - la Shorts Audio Library permet jusqu'à 90 s d'un titre ;
  - la musique libre de droits de la YouTube Audio Library « won't receive a Content ID claim ».
- **Conséquence** : ne jamais intégrer de musique du commerce dans le fichier. Utiliser de la musique originale, ou une
  bibliothèque dont la licence couvre l'usage commercial (Mixkit, d'après notre `sound-design.md`), ou les bibliothèques
  internes des plateformes, qui ne suivent pas le fichier en cas de republication ailleurs. Ce dernier point vient de
  blogs vus via la recherche, non ouverts.
- **Sources** :
  - [primaire] https://ads.tiktok.com/resources/help/article/how-to-use-the-commercial-music-library?lang=en
  - [primaire] https://ads.tiktok.com/business/en/blog/audio-library-royalty-free-music
  - [primaire] https://www.facebook.com/legal/music_guidelines
  - [primaire] https://support.google.com/youtube/answer/15424877?hl=en
  - [primaire] https://support.google.com/youtube/answer/13486873?hl=en
- **Confiance** : haute.

---

## 6. Outils locaux vérifiés (ffmpeg 6.1.1, DeepFilterNet 0.5.6)

| Outil | Options utiles | Remarque |
|---|---|---|
| `loudnorm` | `I`, `LRA`, `TP` (défaut −2), `linear`, `measured_*` | Mode linéaire en deux passes ; repasse en dynamique s'il ne peut pas tenir le TP |
| `apsyclip` | `clip`, `adaptive`, `iterations` | Écrêteur psychoacoustique, à comparer au limiteur |
| `deesser` | `i`, `m`, `f` | De-esser simple |
| `adynamicequalizer` | `dfrequency`, `tfrequency`, `ratio`, `range`, `mode` | **Pas de sidechain** dans cette version |
| `aexciter` | `drive`, `freq` (2–12 kHz), `amount` | Excitateur |
| `arnndn` | `model`, `mix` | RNNoise ; fichier de modèle requis |
| `afftdn`, `anlmdn`, `afwtdn` | — | Débruitage DSP (`afftdn` a dégradé notre voix) |
| `speechnorm` | `peak`, `expansion`, `compression` | Nivellement de la parole |
| `sidechaincompress` | 2 entrées | Baisse de toute la bande seulement |
| `virtualbass` | `cutoff` 100–500 Hz, `strength` | Sort un **2.1 (LFE)** : inadapté au téléphone tel quel |
| `deepFilter` / `df.enhance` | `-m DeepFilterNet3`, `--atten-lim`, `--pf` | Poids téléchargés au premier lancement |

## 7. Sources ouvertes (par sujet)

- **Sound design** :
  - https://www.20k.org/episodes/netflix
  - https://www.20k.org/episodes/starwarspewpew
  - https://www.ableton.com/fr/blog/learn-how-to-make-high-impact-sounds-for-movies-and-trailers
  - https://designingsound.org/2010/02/26/charles-deenen-special-100-whooshes-in-2-minutes/
  - https://www.asoundeffect.com/the-sound-of-the-whoosh-with-tilman-hahn/
  - https://asoundeffect.com/modern-trailer-sound (peu utile)
  - https://morphic.com/resources/sounds/whoosh-sound-effect
  - http://filmsound.org/articles/designing_for_sound.htm
  - http://filmsound.org/terminology/worldizing.htm
  - https://transom.org/2005/walter-murch/
  - https://www.dcs.gla.ac.uk/~stephen/earcon_guidelines.shtml
  - https://developers.google.com/assistant/conversation-design/earcons
  - https://jonnyelwyn.co.uk/sound-design-mixing/film-trailer-sound-design
  - https://github.com/facebookresearch/sam-audio
- **Signature sonore** :
  - https://doi.org/10.1002/mar.21995 (Spence & Keller 2024, PDF)
  - https://www.intel.com/content/www/us/en/support/articles/000015030/programs.html
  - https://www.theglobeandmail.com/report-on-business/the-mozart-of-jingles/article4211353
  - https://newsroom.mastercard.com/news/press/2019/february/sound-on-mastercard-debuts-sonic-brand/
  - https://robbreport.com.au/motors/automotive/bmw-sound-renzo-vitale/
  - https://www.press.bmwgroup.com/spain/article/detail/T0306805ES/el-sonido-del-bmw-concept-i4
  - https://www.dexigner.com/news/21107
  - https://www.renaultgroup.com/en/magazine/our-group-news/renault-in-tune-with-the-sound-episode-1/
  - https://www.renaultgroup.com/en/magazine/our-group-news/design-talks-sound-design-bringing-emotion-to-function/
  - https://www.renaultgroup.com/en/news-on-air/news/what-sound-identity-is-appropriate-for-electric-cars
  - https://newneuromarketing.com/rocking-your-brand-how-music-can-influence-brand-perception
  - https://en.wikipedia.org/wiki/I%27m_Lovin%27_It_(song)
  - https://ads.tiktok.com/business/en-US/blog/evolution-of-sound-volume-1
- **Mix téléphone** :
  - https://www.waves.com/tips-for-great-mixes-on-small-speakers
  - https://acris.aalto.fi/ws/portalfiles/portal/51973173/Eloi2020_Virtual_bass_DAFx2020.pdf
  - https://rdrr.io/rforge/SII/man/sii.html
  - https://www.itu.int/dms_pubrec/itu-r/rec/bs/R-REC-BS.1770-5-202311-I!!PDF-E.pdf
  - https://cris.fau.de/publications/234640600
  - https://arxiv.org/html/2405.17364
  - https://productionadvice.co.uk/stats-for-nerds/
  - https://productionadvice.co.uk/td1008/
  - https://www.meterplugs.com/blog/2019/09/18/youtube-changes-loudness-reference-to-14-lufs.html
  - https://support.google.com/youtube/answer/14106294
  - https://engineering.fb.com/2023/04/11/video-engineering/high-quality-audio-xhe-aac-codec-meta/
  - https://support.spotify.com/us/artists/article/loudness-normalization/
  - https://www.apple.com/apple-music/apple-digital-masters/docs/apple-digital-masters.pdf
- **Voix** :
  - https://jmvalin.ca/demo/rnnoise/
  - https://github.com/Rikorose/DeepFilterNet
  - https://arxiv.org/abs/2305.08227
  - https://github.com/modelscope/ClearerVoice-Studio
  - https://www.isca-archive.org/interspeech_2025/zhao25f_interspeech.pdf
  - https://arxiv.org/html/2509.17052v1
  - https://github.com/sarulab-speech/Sidon/
  - https://arxiv.org/abs/2604.14606
  - https://github.com/xiaobin-rong/unipase
  - https://arxiv.org/abs/2509.25275
  - https://arxiv.org/html/2505.23212v2
  - https://github.com/haoheliu/voicefixer
  - https://github.com/resemble-ai/resemble-enhance
  - https://github.com/JusperLee/Apollo
  - https://arxiv.org/abs/2006.05694 (HiFi-GAN, Su, Jin & Finkelstein 2020 : une voix « as though it had been recorded
    in a studio » ; le lien avec Adobe Enhance n'est pas confirmé)
  - https://podcast.adobe.com/en/guides/latest-updates
  - https://elevenlabs.io/docs/capabilities/voice-isolator
  - https://auphonic.com/help/algorithms/singletrack.html
  - https://www.descript.com/tools/remove-background-noise
  - https://www.izotope.com/community/blog/rx-12
  - https://www.provideocoalition.com/izotope-rx-12-shootout/amp/
  - https://diffio.ai/best-ai-audio-enhancer/
  - https://github.com/timsainb/noisereduce
  - https://github.com/spotify/pedalboard (GPLv3 : attention si on distribue le code)
- **Musique et droits** :
  - https://ads.tiktok.com/resources/help/article/how-to-use-the-commercial-music-library?lang=en
  - https://ads.tiktok.com/business/en/blog/audio-library-royalty-free-music
  - https://www.facebook.com/legal/music_guidelines
  - https://support.google.com/youtube/answer/15424877?hl=en
  - https://support.google.com/youtube/answer/13486873?hl=en
- **Fichiers internes** :
  - `/tmp/claude-0/-home-user-utopicar-repo/b5d19bef-ca1f-5aaf-bb07-4bb6be64e876/scratchpad/montage-4k/work/mix.py`
  - `/tmp/claude-0/-home-user-utopicar-repo/b5d19bef-ca1f-5aaf-bb07-4bb6be64e876/scratchpad/montage-4k/work/voix_studio.py`
  - `/home/user/utopicar-repo/.claude/skills/motion-studio/references/sound-design.md`
