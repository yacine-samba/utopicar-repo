# Revue de livraison : « 4 000 € » v4 et la série de 13 vidéos de 10 s (29 oct. 2026)

Demande : rechercher (hook, montage, sound design, techniques de vrais monteurs), améliorer en boucle, mettre les
skills à jour, aucune valeur prédéfinie, un orange utopicar moins pétant, et des vidéos de 10 s tirées de toutes les
vidéos pour Instagram et YouTube Shorts, belles, qui retiennent et font réagir **sans jamais rien demander**.

## Livrables

| Fichier | Contenu |
|---|---|
| `video/renders/9x16-avatar-4000-euros-partie-1.mp4` | « 4 000 € : 3 oui, 1 non », v4 (remplace la v3) |
| `video/renders/9x16-avatar-4000-euros-partie-2.mp4` | « 4 000 € : 4 pièges à éviter », v4 (remplace la v3) |
| `video/renders/courts/9x16-court-01-…13-….mp4` | les 13 vidéos de 10 s (liste et ordre de publication : `video/brief-courts-10s.md` § 6) |
| `video/renders/courts/couvertures/` | l'image 0 de chaque vidéo (couverture, lisible recadrée en 3:4) |
| `video/brief-courts-10s.md` | brief de la série : concept, sources, accroches (art-du-hook), découpages, contrôle, publication |
| `video/docs/recherche-v4/` | les trois recherches (sources, niveaux de preuve), la synthèse, le langage v4 d'origine |
| `.claude/skills/…` et `video/renders/skill/*.skill` | motion-studio, recette-47, montage-viral, art-du-hook mis à jour |

## Ce qui change de la v3 à la v4

**Image** (langage tiré du logo, `.claude/skills/motion-studio/references/langage-v4.md`) :
- tout bouge sur l'axe de la flèche du logo (31,7°, mesuré sur le SVG officiel) : le « oui » monte, le « non » descend ;
- l'orange adouci `#E2683A` (même teinte que le logo, chroma −20 %) en aplat, `#F0915E` pour le texte ; le logo
  officiel garde son `#FF5A1F` ;
- une seule pastille porte les chiffres ; elle épouse son texte, son chiffre roule vers le haut sur le geste, et le
  « non » la fait passer au noir avec une croix tracée et le nom barré ;
- deux couleurs pleines par vidéo aux changements de chapitre (« 3 oui » orange, « 1 non » noire à contre-sens,
  « Essence ») ;
- de vrais filés entre deux prises (deux images côte à côte, même vitesse à la jointure, flou de bougé du moteur) ;
- partie 2 : le « 4 000 € » passe derrière la tête (détourage nettoyé image par image) ;
- sous-titres à largeur mesurée, sur une ligne, découpés sur la syntaxe, un mot orange par groupe ;
- carte de fin de 0,85 s, déjà commencée sur sa première image.

**Son** (`langage-v4.md` § 5) :
- logo sonore « u-to-pi-car » en mi, fait du vrai bip de verrouillage (accordé), d'un clic d'interrupteur, de la
  porte et de la serrure ; la dernière note tombe sur la pose de la flèche (+0,254 s) ;
- les chiffres de la pastille jouent ses notes dans l'ordre ;
- la 208 : un démarrage raté puis la serrure qui retombe ;
- les couleurs pleines : une voiture qui passe dans le sens de la flèche ;
- règles mesurées : ambiances ≥ 15 LU sous la voix, 1-4 kHz creusés quand elle parle, harmoniques pour le téléphone,
  crête vraie réglée après encodage AAC, somme mono identique.

**Voix** : DeepFilterNet 3 (poids officiels) avant la chaîne studio, gardé plan par plan seulement si la note DNSMOS
monte sans abîmer la transcription ni le timbre : DNSMOS moyen ≈ 3,35 (voix studio de référence 3,37 ; brute 3,02 ;
v3 3,10).

## Mesures (fichiers livrés)

qa_video.py sur chaque MP4 encodé, mix4 (crête vraie après AAC, somme mono), synchro de la voix sur l'image par corrélation. « Zones sûres » : contenu net du décor filmé (habitacle) dans les marges, vérifié à l'image : aucun texte n'y entre.

| Vidéo | Durée | LUFS | dBTP (MP4) | Synchro | Mono | Image 0 | Images vides | Plans figés | Zones sûres | FAIL |
|---|---|---|---|---|---|---|---|---|---|---|
| 4 000 € v4 partie 1 | 35.71 s | -14.0 | -1.6 | -1 ms | +0.0 | OK | OK | OK | WARN (décor) | 0 |
| 4 000 € v4 partie 2 | 23.62 s | -14.0 | -1.7 | -1 ms | +0.0 | OK | OK | OK | WARN (décor) | 0 |
| c1-208 | 7.88 s | -14.0 | -1.6 | -1 ms | +0.0 | OK | OK | OK | WARN (décor) | 0 |
| c2-clio | 9.75 s | -14.0 | -1.8 | -1 ms | +0.0 | OK | OK | OK | WARN (décor) | 0 |
| c3-yaris | 11.12 s | -14.0 | -1.7 | -1 ms | +0.0 | OK | OK | OK | WARN (décor) | 0 |
| c4-corsa | 10.33 s | -14.0 | -1.8 | -1 ms | +0.0 | OK | OK | OK | WARN (décor) | 0 |
| c5-diesel | 9.62 s | -14.0 | -1.7 | -1 ms | +0.0 | OK | OK | OK | WARN (décor) | 0 |
| d1-deja-vendue | 10.88 s | -14.0 | -2.1 | +0 ms | +0.0 | OK | OK | OK | WARN (décor) | 0 |
| d2-vendeur-presse | 7.83 s | -14.0 | -1.8 | +0 ms | +0.0 | OK | OK | OK | WARN (décor) | 0 |
| d3-annonces-mal-faites | 6.92 s | -14.1 | -1.5 | +0 ms | +0.0 | OK | OK | OK | WARN (décor) | 0 |
| d4-ventes-etat | 6.58 s | -14.0 | -1.5 | +0 ms | +0.0 | OK | OK | OK | WARN (décor) | 0 |
| g1-6-par-an | 9.96 s | -14.0 | -1.5 | -1 ms | +0.0 | OK | OK | OK | WARN (décor) | 0 |
| g2-3-criteres | 10.33 s | -14.0 | -1.9 | -1 ms | +0.0 | OK | OK | OK | WARN (décor) | 0 |
| g3-1-mois | 8.04 s | -14.0 | -1.5 | -1 ms | +0.0 | OK | OK | OK | WARN (décor) | 0 |
| g4-tva-marge | 5.08 s | -14.0 | -1.5 | -1 ms | +0.0 | OK | OK | OK | WARN (décor) | 0 |


## Rounds de critique (améliorer, corriger, recommencer)

| Round | Ce qui a été vu | Correction |
|---|---|---|
| 1 | Partie 2 : « 4 000 € » rogné à droite et peu lisible sur le toit ouvrant ; poignée du plafond détourée devant le chiffre | mesure sur le texte, champ sombre sous la tête, masque du détourage nettoyé |
| 2 | Pastille avec un grand vide à droite ; sous-titres sur deux lignes avec un mot seul ; « bas \| de caisse » | largeur des noms en `max-content`, capsule qui épouse le nom ; largeur des sous-titres mesurée dans Chromium, découpage optimal par phrase |
| 3 | Accroche et pastille superposées à 2,7 s ; première image de la carte de fin vide | l'accroche sort avant l'entrée de la pastille ; le masque de fin part de la position mesurée du logo |
| 4 | Série : « touche \| pas », mots perdus sous une couleur pleine, « sur » seul, accroche de g4 lisible 1 s | coupure permise après une ponctuation, couleur qui ne cache que ses mots, mots outils seuls retirés, accroche tenue jusqu'à « TVA » |
| 5 | `hyperframes check` : textes et contrastes de pastille masqués, mot d'une couleur pleine « sur » une pastille cachée, deux sons sur une piste | `visibility` hors affichage, `data-layout-allow-overlap` sur le mot de l'aplat, pistes alternées |
| 6 | Coup sourd de l'accroche inaudible au téléphone (−35 dB au test passe-haut 800 Hz) | harmoniques + corps médium qui finit avant le premier mot (−20 dB) |
| 7 | Série, contrôle à 360 px du fichier encodé : trois images noires à la fin (sans carte de fin, le plan du visage s'arrêtait avant la queue), invisibles au contrôle à 4 i/s | le dernier plan tient jusqu'à la dernière image ; les 13 vidéos rendues à nouveau |

Notes finales (grille de `video/CLAUDE.md`, sur 10, après ces rounds) :

| | Hook | Lisibilité | Mouvement | Variété | Marque | Synchro son |
|---|---|---|---|---|---|---|
| 4 000 € partie 1 | 8 | 9 | 8 | 8 | 9 | 9 |
| 4 000 € partie 2 | 8 | 9 | 8 | 8 | 9 | 9 |
| Série de 10 s | 8 | 9 | 8 | 8 | 9 | 9 |

Le hook est noté 8 et pas plus : aucune de ces vidéos n'est encore publiée, la note réelle viendra des statistiques
(rétention à 3 s, durée moyenne, envois), comparées à MO5 « 47 € ».

## Ce qui n'a pas été vérifié

- **Aucun son n'a été écouté** ici : le mix est mesuré (loudness, crête vraie après AAC, écarts voix/ambiance, test
  passe-haut 800 Hz, synchro par corrélation) mais pas entendu. À écouter en priorité : le logo sonore sur la carte de
  fin, les notes de la pastille, le démarrage raté de la 208.
- Les liens et dates exacts des sources iAutos, Carverif et Autodoc : [À FOURNIR] (déjà notés dans le brief).
- L'effet de la durée de 10 s contre 30 s n'est pas prouvé : à tester en Trial reels (`brief-courts-10s.md` § 6).
- La mention IA est à activer à la publication (Instagram et YouTube).
