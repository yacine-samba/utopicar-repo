# Recherche v4 (29 oct. 2026) : ce qu'on applique, et pourquoi

Trois recherches menées en parallèle, sources ouvertes une à une, chaque affirmation avec son niveau de preuve :

- `recherche-montage-motion.md` : 41 techniques de monteurs et de motion designers (Murch, Dmytryk, Material, Apple,
  Carbon, studios DIA, Vucko, Netflix, Mastercard, Polestar, MrBeast, Jenny Hoyos, Kallaway), traduites pour notre
  chaîne (HyperFrames, GSAP, ffmpeg, OpenCV) ;
- `recherche-son.md` : sound design, logo sonore, mix pour téléphone, voix (Netflix *ta-dum*, Intel, BMW, Audi,
  Renault, Murch, Torcoli 2019, norme SII, DAFx 2020, URGENT 2025-2026) ;
- `recherche-reels-shorts.md` : ce qui fait la portée sur Instagram Reels et YouTube Shorts en 2025-2026, sans CTA
  (fiches officielles Meta et YouTube, Mosseri, études académiques, grands jeux de données).

Plus la documentation de HyperFrames 0.8.210 installée ici (contrat de rendu, `motion.md`, `captions.md`,
`overlays.md`, `types/vertical.md`), relue directement.

Niveaux : **OFF** = officiel, **ACA** = académique, **DATA** = grand jeu de données d'éditeur, **PRAT** = praticien,
**DÉD** = notre déduction. Rien de ce qui suit n'est une garantie de vues.

## 1. Distribution : rester recommandable, gagner la première seconde

| Règle | Appui |
|---|---|
| Une **idée distincte par vidéo**. Pas de déclinaisons d'un même gabarit, pas la même musique ni les mêmes images d'avatar sur des dizaines de vidéos. | YouTube, règlement anti-spam (« high volumes of similar content with minimal changes », exemple : « exact same background music and repetitive AI generated imagery ») ; originalité Shorts renforcée le 1er oct. 2026 ; Instagram, originalité 2024 et 30 avr. 2026 (OFF) |
| **Aucun appel à l'engagement**, ni écrit ni dit. Sur Instagram, un contenu qui « demande explicitement » partages, commentaires ou tags n'est pas recommandé ; la règle du client retire donc un risque. | Instagram, juin 2024 et FAQ créateurs (OFF) |
| **Image 0 = le sujet**, sans logo ni intro ; le texte d'accroche reprend **les premiers mots dits** ; le message clé avant 2 s. | Fiche Reels de Meta (11 nov. 2025 : prédiction « moins de 3 s », entrée « passé en moins de 2 s ») ; YouTube classe sur le « % de spectateurs qui ont choisi de regarder » (OFF) ; Hoyos : « une seconde » (PRAT) |
| La durée de visionnage est **comparée aux vidéos de même durée** : une vidéo courte ne gagne que par des vues complètes et des revisionnages. | Meta (« 95 % des utilisateurs… reels de même longueur », OFF) ; Zhan et al., KDD 2022 (ACA) |
| Revisionnages comptés comme vues sur Reels et Shorts ; le gain de distribution d'une boucle n'est **pas prouvé**. Une boucle doit servir le sens (la fin complète le début). | OFF (comptage) ; vidIQ (anecdote) |
| **Penser « envoi »** : on transmet l'utile et ce qui inquiète ou surprend. Arnaques et pannes coûteuses sont nos meilleurs sujets. | Mosseri, janv. 2025 (OFF rapporté) ; Berger et Milkman 2012 (ACA) |
| Commentaires sans les demander : des **verdicts vrais, sourcés, modérément débattus** (la discussion culmine à controverse modérée). Jamais d'erreur volontaire. | Chen et Berger 2013 (ACA) |
| Les **mêmes mots partout** : dits, écrits à l'écran, première ligne de légende, titre YouTube. 5 hashtags au plus sur Instagram. | Instagram Search, 2021 et 2025 ; YouTube Help (OFF) |
| **Séries** : épisodes reconnaissables, codes visuels constants ; séries de Shorts (23 sept. 2026) et lien « vidéo associée » pour naviguer sans rien demander. | OFF ; Ovsiankina (méta-analyse 2025, ACA) |
| Avatar IA : mention IA obligatoire (Meta, YouTube) ; environ −7 à 8 % de likes, moins sur un contenu informatif. Ton concret, effort visible, décors variés. | JCR 2026, 1,1 M de posts (ACA) ; Meta, YouTube (OFF) |
| Texte dans la zone **x 65-850 (bas) / 140-940 (haut), y 288-1248** ; couverture lisible recadrée en 3:4. | Meta pub Reels 14 % / 35 % / 6 % ; Google (lecture tierce) ; HyperFrames : 168-1330 px (DÉD : zone commune) |
| Sous-titres incrustés, vidéo pensée **son activé** (plus de 75 % des vues Reels). | Meta, nov. 2024 (OFF) |
| Le format 10 s n'est **pas validé** par les données : à tester contre 15-20 s avec les Trial reels. | Socialinsider 2026, Metricool 2026 (DATA) |

## 2. Montage et transitions

| Règle | Appui |
|---|---|
| Une transition a **une cause à l'écran** (un objet, un mouvement, un son) ; 3 à 5 sortes par film ; jamais de fondu enchaîné. | Murch, Dmytryk, Videomaker (PRAT) ; HyperFrames `motion.md` |
| **Couper au pic du mouvement**, même sens et même vitesse des deux côtés (`power3.in` qui sort, `power3.out` qui entre). | Dmytryk ; HyperFrames |
| Le **filé** devient un vrai filé : deux plans côte à côte qui bougent ensemble, vitesses égales à la jointure, flou de bougé du moteur HyperFrames (le flou CSS sur une vidéo est interdit par le contrat, règle 11). | HyperFrames (contrat, `motion.md`) |
| Plans d'illustration **coupés sur leur image la plus rapide**, dans le sens du mouvement qui sort ; plus de poussée de 3 % identique sur tous. | flux optique mesuré (OpenCV) ; HyperFrames (« slow creeping scale » = défaut qui fait généré) |
| Garder **l'œil au même endroit** de part et d'autre d'une coupe. | Murch (eye-trace), Bartsch (PRAT) |
| **Coupe en creux** (l'image sortante s'assombrit ~40 % pendant 3 images) pour une coupe voulue, sur le renversement. | HyperFrames |
| **Fin abrupte**, 2 à 4 images après la fermeture des lèvres ; ne jamais annoncer la fin. | MrBeast, Hoyos (83 → 88 % en coupant une seconde) (PRAT) |
| Rythme : un fait visuel nouveau toutes les 1-2 s dans l'accroche, toutes les 2-4 s ensuite, durées variées (pas un métronome), un même traitement jamais plus de ~6 s. | Cutting 2011 (ACA) ; HyperFrames |

## 3. Motion et typographie

| Règle | Appui |
|---|---|
| **Ressorts calculés**, pas choisis dans une liste : durée perçue d selon la taille (badge ~0,22 s, pastille ~0,32 s, plein cadre ~0,5 s), amortissement selon la propriété : 1 pour opacité et couleur, ≥ 0,9 pour le texte (dépassement ≤ 0,15 %), ~0,8 pour une forme. | Apple WWDC23, Material (AOSP), HyperFrames (OFF) ; formules vérifiées |
| À 24 i/s, une courbe d'interface fait sauter la moitié du trajet en une image : **première image ≤ 30 % du trajet** (`power3.out` ≥ 0,6 s) ou flou de bougé. | calcul (DÉD) ; HyperFrames (« trop vif = bug ») |
| `back.out(1.8)` sur le chiffre de la v3 descend à 0,868 : **rebond visible sur du texte**, interdit. Anneau d'onde = défaut générique. | calcul ; HyperFrames, `motion-pro.md` |
| **Un objet porteur** : une seule pastille persistante dont le chiffre roule vers le haut, posé sur l'image du geste. | maison (`motion-pro.md`) ; HyperFrames |
| Sous-titres en **groupes de 2 à 4 mots**, ≥ 20 images, le cadre calé sur les coupes (12 images), les mots allumés à leur temps dit ; un seul mot en couleur d'accent par phrase ; ombre de 2-4 px et voile à la taille du texte seulement si le fond est clair ; jamais de halo. | Netflix (OFF) ; Rayner/RSVP (ACA) ; HyperFrames |
| **Texte derrière le sujet** (30-55 % caché) pour un mot d'accroche, sur plan large. | HyperFrames `captions.md` |
| Un mot qui a atterri reste **immobile**. | HyperFrames |

## 4. Marque : une grammaire tirée du logo

| Règle | Appui |
|---|---|
| La flèche du symbole officiel monte à **31,7°** (mesuré sur le SVG). Tout ce qui dit « progrès, bon choix » bouge sur cet axe ; ce qui dit « risque, perte » bouge en sens inverse. Un sens = un sens. | Google Dots, Renault (OFF) ; mesure |
| **Le trait** : la voiture du logo est un trait. Il dessine à vitesse de plume constante : soulignement, entourage d'une pièce réelle, voiture de fin. | DIA, Vucko (« quelques comportements iconiques répétés ») |
| **L'orange, une fois par écran**, sur le verdict ou le chiffre du moment ; adouci pour la vidéo (voir § 7). | Polestar (retenue), Carbon (expressif réservé aux moments importants) |
| Une identité **sonore et visuelle synchronisée** : l'image se pose sur l'attaque du son, à 0 ms. | HyperFrames ; Spence et Keller 2024 (ACA) |

## 5. Son

| Règle | Appui |
|---|---|
| Remplacer les baisses fixes par des **écarts de loudness mesurés** pendant la parole : ambiance ≥ 15 LU sous la voix ; bruitages creusés dans **1-4 kHz** (72 % de l'intelligibilité) ; bruitages posés dans les trous entre les mots. | Torcoli 2019 (JAES, ACA) ; ANSI SII |
| Les graves d'impact ne passent pas sur un téléphone (chute vers 800 Hz) : chaque accent reçoit une **couche 150-800 Hz et des harmoniques** (basse virtuelle). | Waves ; Moliner et al., DAFx 2020 (ACA) |
| Un **logo sonore** ≤ 1 s ici, fait de 3-4 sons réels du monde de la marque (télécommande, relais de clignotant, porte), rythmé sur « u-to-pi-car », contour qui monte comme la flèche et se pose sur une note stable, précédé d'un court silence. Les chiffres de la vidéo **jouent ses notes**. Toujours le même fichier, arrangement seul variable. | Netflix, Intel, Mastercard, Audi, BMW (OFF/PRAT) ; Spence et Keller 2024 |
| **Collisions par famille** (même famille à moins de ~0,17 s : on garde la prioritaire), 2 bruitages au plus avec la voix, un **budget d'accents**, un **vide de 150-300 ms** avant la phrase clé. | Murch, Brewster (earcons), Thom |
| Tous les sons tonaux dans **une tonalité de marque** ; la série montante finit sur un degré stable. | Audi (12 tonalités), Jerden |
| Sons **maison** : matière réelle (Mixkit comme matière première) transformée (transposition, étirement, couches) ; espace d'habitacle court plutôt qu'une réverbe générique ; sons d'interface secs. | Burtt, Bender, Deenen, Murch (worldizing) |
| Limiteur **true-peak suréchantillonné ×4** vers −1,5 dBTP (au lieu de −3 dBFS en crête d'échantillon), contrôle ≤ −1 dBTP après AAC, contrôle de la **somme mono** et test « passe-haut 800 Hz ». | ITU-R BS.1770-5, Apple, Spotify |
| Pas de musique du commerce dans le fichier ; pas de musique identique d'une vidéo à l'autre. | Meta, YouTube (OFF) |

## 6. Voix

| Règle | Appui |
|---|---|
| Le traitement du signal seul plafonne (notre banc : 3,04 → 3,11 contre 3,37 pour la voix studio). Il faut une **restauration neuronale avant** la chaîne de finition. | notre mesure ; URGENT 2025 |
| Candidat hors ligne : **DeepFilterNet 3** (installé, MIT/Apache), atténuation limitée à 12-18 dB. | Schröter et al. ; ClearerVoice 2025 (comparatif) |
| On ne garde une prise que si elle passe **trois contrôles** : DNSMOS, erreur de transcription en français (Whisper), ressemblance du locuteur. Le DNSMOS seul ne voit pas les mots inventés. | URGENT 2025 (ACA) ; Diffio 2026 (vendeur) |

## 7. L'orange utopicar adouci

Le logo officiel garde `#FF5A1F` (on ne recolore jamais le logo). En vidéo, `#FF5A1F` en aplat paraît fluorescent
(chroma OKLCH 0,21, la plus forte de la charte). Testé sur de vraies images de l'avatar :

| Usage | Couleur | Pourquoi |
|---|---|---|
| Aplats, pastille, couleur pleine | `#E2683A` | même teinte que le logo (OKLCH H 40°), chroma 0,17 (−20 %), encre `#160904` dessus : contraste 5,8:1 |
| Texte orange sur vidéo ou fond sombre | `#F0915E` | plus clair pour rester lisible sur le sweat blanc et les fonds sombres |
| Encre sur orange | `#160904` | charte |

## 8. Ce qui n'est pas prouvé (on ne l'écrira pas comme un fait)

- L'effet des boucles et des commentaires épinglés sur la distribution.
- La supériorité des 10 s sur les 15-30 s.
- Les cotes exactes des zones sûres (schémas lus par des tiers) et la taille idéale du texte.
- Les règles de montage attribuées à Iman Gadzhi, Ali Abdaal ou Dan Koe : aucune source écrite.
- La normalisation de la loudness par TikTok et Meta : aucune cible publiée.
