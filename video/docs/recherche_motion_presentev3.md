# Présentation utopicar v3 : recherche motion design et règles retenues

Octobre 2026. But : refaire de A à Z la présentation 9:16 avec la voix de Simon, dans la grammaire des meilleurs
explainers SaaS, en filmant la vraie app.

## 1. Corpus et méthode

**25 vidéos analysées image par image**, à la cadence native (1/30 s ou 1/60 s, toujours ≤ 0,05 s) :

| Famille | Vidéos |
|---|---|
| 1600.agency (référence demandée) | 5 films du portfolio : Juicebox (2 parties), 3 films produit (ap1–ap3), un film 4K. 7 autres films du portfolio sont sur Vimeo, qui a bloqué l'accès : non contourné. |
| Pubs verticales avec voix | Qonto (pub « 5 min » en 9:16 et 4:5, pub « étapes », pub « taux », vidéo du site) |
| Films produit | Framer (film « verre », film interface), Motion (lancement, 76 s), Jitter (hero, agents), Pennylane, Intercom Fin, Apple (Siri) |
| Boucles d'interface | Notion (notes, recherche), Superhuman (Go, Mail), Dia, Shine, Screen Studio |

YouTube a refusé le téléchargement (contrôle anti-robot) : rien n'a été contourné, les vidéos viennent des pages des
éditeurs et de la bibliothèque publicitaire publique de Meta.

**Outils** (dans `.claude/skills/motion-studio/scripts/`) :

- `ref-frames.py --step 0.05` : planches toutes les 0,05 s, coupes, voix mot à mot ; corrigé pour les vidéos sans son.
- `ref-motion.py` : part du temps en mouvement, plans figés, vitesse, à-coups, flou de bougé, coupes.
- `ref-easing.py` (nouveau) : pour chaque geste, où tombe la vitesse maximale, durée de la retombée, dépassement.
  On en tire un profil : ease-out, ease-in-out, ease-in, ressort ou linéaire.
- Mosaïques image par image (ffmpeg), mesures au pixel sur les images clés, analyse du son (librosa, LUFS).

Les références restent hors du dépôt. Les notes détaillées font 22 fiches, une par vidéo, plus trois synthèses
(Qonto, boucles d'interface, 1600).

## 2. Ce que disent les mesures

### Fluidité (ref-motion)

| Vidéo | Mouvement | Plans figés | Vitesse p50 / p90 (% du cadre/s) | Coupes / 10 s |
|---|---|---|---|---|
| 1600 · Juicebox | 57 % | 39 % | 6,4 / 17,6 | 9,0 |
| 1600 · film produit 1 | 65 % | 31 % | 8,1 / 47,9 | 2,9 |
| 1600 · film produit 2 | 77 % | 22 % | 8,7 / 47,2 | 0,7 |
| 1600 · film produit 3 | 58 % | 37 % | 6,3 / 49,0 | 2,3 |
| Qonto · pub 9:16 | 47 % | 52 % | 5,4 / 32,4 | 1,8 |
| Framer · interface | 88 % | 10 % | 9,0 / 38,1 | 3,8 |
| Motion · lancement | 53 % | 40 % | 6,5 / 44,8 | 13,8 |
| Superhuman · Mail | 17 % | 82 % | 4,2 / 16,8 | 0 |

Les films de 1600 bougent 57 à 77 % du temps et ne restent jamais figés plus de 3,5 s. Leur caméra ne s'arrête
presque jamais, mais la vitesse médiane reste basse (6 à 9 % du cadre par seconde) : ça glisse, ça ne s'agite pas.

### Forme des gestes (ref-easing)

| Vidéo | Gestes | Durée médiane | Ressort | Ease-out | Linéaire |
|---|---|---|---|---|---|
| 1600 · Juicebox | 28 | 0,68 s | 71 % | 4 % | 11 % |
| 1600 · films produit (3) | 217 | 0,22 à 1,09 s | 50 à 51 % | 12 à 30 % | 10 à 12 % |
| Motion · lancement | 101 | 0,30 s | 66 % | 12 % | 5 % |
| Qonto · pub 9:16 | 20 | 0,44 s | 45 % | 20 % | 5 % |
| Superhuman · Go | 17 | 0,37 s | 24 % | 53 % | 6 % |

Le ressort domine chez 1600 et Motion : un léger dépassement, puis l'objet se pose. Les interfaces calmes
(Superhuman) préfèrent l'ease-out sans dépassement. La règle retenue : ressort `default` (≈ 2 % de dépassement)
pour les cartes, `snappy` pour boutons et pastilles. Pas de rebond sur la typographie.

## 3. La grammaire retenue

**1600.agency (Juicebox, films produit).**

- Une caméra continue : on plonge dans l'interface (la barre de recherche remplit l'écran), on la suit, on recule. Pas
  de coupe.
- Des sous-titres mot à mot : chaque mot entre flou et se pose net ; la phrase part mot après mot quand la suivante
  arrive.
- Des éléments d'interface qui sortent de l'écran et flottent devant, en 3D légère.
- Un fond en dégradé qui dérive.
- Le logo : l'icône pivote, puis les lettres se tapent.

**Qonto (pub verticale avec voix).**

- Une image tous les 0,63 s.
- Le titre condense la voix, en 72 px, à 261 px du haut.
- Un élément sort de l'appareil (notification, carte) : c'est le bénéfice.
- Les chiffres arrivent 0,15 s avant le mot.
- Entrées en ease-out de 0,6 à 0,9 s, sorties en ease-in de 0,16 à 0,24 s.
- Rien ne s'arrête : flottement de ±15 px et ±4°.

**Boucles d'interface (Notion, Superhuman, Dia, Shine, Screen Studio).**

- Le produit bouge lui-même, avec une causalité stricte : l'interface répond 0,1 à 0,2 s après le clic.
- Bouton enfoncé à ×0,95.
- L'anneau de score se remplit en 0,8 s, en easeOutCubic.
- L'interrupteur bascule en 0,3 s, en easeOutQuart.
- 33 ms de décalage entre les éléments d'un groupe, 0,33 s entre les étapes d'un processus.
- Un fondu dure 2,5 fois moins que le déplacement qu'il accompagne.

**Son (Qonto, Motion, 1600).**

- Un whoosh par grand mouvement, calé à ±2 images du pic de vitesse.
- Un tic par caractère tapé.
- Un impact sur les mots clés.
- Une coupure de musique avant le drop.
- La dernière syllabe presque sans musique.

## 4. Application au film (`film-presentev3/`)

- **Le vrai produit.** Les pages de l'app (même code que la production, base de démonstration) sont figées en HTML
  (`scripts/app-demo/figer.mjs`) puis chargées dans le film. Chaque bloc qui compte est extrait de sa page au pixel
  près : cote, travaux, marge, verdict, offre, plafond, alerte, messages, étapes du parc, marge par voiture, marge du
  mois. Il sort du téléphone en grande carte 3D, net à toutes les tailles car c'est du vrai DOM.
- **Un seul plan.** Le téléphone ne disparaît jamais entre deux parties : les pages glissent dedans (« push » d'iOS,
  ou retour), et la caméra s'approche puis recule sur des ressorts. Sur « Colle l'annonce », plongée ×1,25 sur le
  champ de texte ; sur « arrête de scroller », le téléphone grossit pendant que la liste file.
- **Causalité.** Le doigt touche « Analyser » (bouton ×0,95) et le rapport arrive 0,3 s après. L'anneau de note se
  remplit dans le téléphone, puis la carte sort avec la même valeur, sans recompter. La place du bloc reste vide dans
  l'écran. La notification naît de l'île du téléphone (pastille noire, puis bannière) sur « sous la cote », puis
  s'ouvre en e-mail sur « tu reçois ».
- **Sous-titres.**
  - Calés sur la voix mot à mot (`audio/vo-presentev3/vo.words.json`), à 270 px du haut, en 74 px.
  - Mots clés en Clash, de la couleur de la partie.
  - Chaque mot entre flou, monte de 26 px et se pose net 0,07 s avant d'être dit.
  - Deux phrases ne sont jamais à l'écran ensemble.
- **Fonds.** Trois halos en dégradé radial, de la couleur de la partie : orange pour l'accroche, rouge pour la perte et
  « À éviter », vert pour la bonne affaire et la marge, bleu nuit pour « tu dors ». Ils glissent en 0,35 s, sans
  fondu entre plans.
- **Son.**
  - La voix passe devant (−11 dB de musique en médiane par phrase).
  - Musique de presente30 recalée : un premier temps sur « À éviter » ; passe-bas puis arrêt de bande quand la liste
    s'arrête ; drop sur « Ta recherche » ; « utopicar » sur le premier temps de la mesure 21.
  - Bruitages ElevenLabs déjà payés : pops qui montent sur une gamme, ticks des étapes, frappes de clavier découpées
    une à une pour le logo, aspiration dont la crête tombe sur l'arrêt de la liste.
  - Master à −14 LUFS et −3,5 dBTP.

## 5. Limites

- 7 films de 1600 sur 12 restent inaccessibles (Vimeo restreint), et YouTube a refusé le téléchargement. Rien n'a été
  contourné.
- Le son est mesuré (niveaux, calage, spectre), pas écouté.
- Les chiffres sont ceux de la base de démonstration, calculés par l'app elle-même, avec la mention « Données de
  démonstration » à l'écran.
- Le rendu se fait sur processeur, faute de carte graphique dans le conteneur cloud. `GPU=1` est prévu dans
  `scripts/render.mjs` pour une machine locale.
