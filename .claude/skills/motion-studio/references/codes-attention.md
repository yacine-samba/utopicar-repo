# Codes des vidéos d'attention (MO5 « 47 € » et suivantes)

Un format à part des pubs produit : une vidéo de 30 s au plus, qui ne vend rien et sert seulement à arrêter le pouce,
à se faire revoir, enregistrer et envoyer. Ces codes viennent de MO5 (`video/brief-mo5.md`,
`video/film-mo5/film.js`, `video/scripts/audio-mo5.py`), validée par l'utilisateur en octobre 2026, et de MO6
(`video/brief-mo6.md`, `video/docs/timeline-mo6.md`, `video/film-mo6/film.js`). Les recettes techniques sont dans
`techniques.md`.

MO5, publiée début octobre 2026, a passé les 6 000 vues. Sa recette exacte (ingrédients, minutage, voix, son), la
série qui la reprend et le journal des résultats sont dans le skill **recette-47** (`.claude/skills/recette-47/`).

## Processus en 5 étapes (chaque étape attend un « OK »)

1. **Brief** : concept, hooks, histoire, émotions. `video/brief-<projet>.md`.
2. **Timeline seconde par seconde** + 1 à 5 images tests rendues (`video/docs/timeline-<projet>.md`,
   `film-<projet>/tests.html`, une scène par `?s=`). Chiffres sourcés dans la même étape.
3. **Maquettage complet toutes les 0,1 s** : le vrai film animé (`film-<projet>/film.js`, minutage provisoire dans
   l'objet `K`), puis les planches `node video/scripts/sheet.mjs` (`renders/review/<projet>-planche-0.1s-*.jpg`) et
   la boucle mesurée.
4. **Voix off** : script, puis choix de la voix.
5. **Animation finale** : film, son, QA, livraison.

## Contraintes de fond

- 30 s au plus, en boucle parfaite (dernière image = image 0, dernière phrase qui enchaîne sur la première).
- Rien à vendre : aucun produit, aucun outil, aucun CTA (ni « commente pour recevoir… »), aucune morale.
- Cible : **débutants qui veulent se lancer dans l'achat-revente**, pas des particuliers qui vendent leur voiture.
- Un vrai problème de leur univers, montré par une démonstration chiffrée de bon sens. Chiffres sourcés ou
  annoncés comme exemple à l'écran. Aucun chiffre inventé présenté comme vrai (MO5 : les « 46 h » retirées).
- Émotions fortes et variées : humour, peur, joie, questionnement. Une émotion nommée par temps de l'histoire.
- Valeur concrète que le spectateur garde (enregistrer) et un détail drôle ou choquant qu'il envoie (partager).
- Tout hook passe par le skill `art-du-hook` (CLAUDE.md racine) : analyse, 3 à 5 variantes, 4 verrous, re-hooks.
  À **chaque** changement de concept, on relance le skill : un hook n'est jamais recopié d'un brief abandonné.

## Trouver le concept (ce que MO6 a appris)

Trois briefs refusés avant le bon. Ce que l'utilisateur a dit, et ce qu'il fallait en tirer :

| Refus | Ce qui manquait | Règle |
|---|---|---|
| « Même voiture », deux annonces | trop proche d'un conseil d'annonce, pas assez désirable | le sujet doit donner **envie de se lancer**, pas seulement corriger une erreur |
| « Le regard », la première revente | de l'émotion, mais rien à garder | **apporter de la valeur** : un savoir concret, chiffré, réutilisable le jour J |
| fiche récapitulative finale « à enregistrer » | une proposition déguisée | **ne rien proposer** : pas de fiche, pas de récap, pas de « enregistre ». Le spectateur enregistre de lui-même parce que le contenu est dense et utile |

Le concept retenu (MO6) combine les trois : une **idée de pro qui renverse une croyance** (ce qui fait peur coûte
peu, ce qui coûte ne se voit pas), des **prix et des tests concrets**, et une **chute** comme MO5 (« Personne n'a
regardé sous le bouchon. ») qui relance la boucle.

Avant d'écrire un brief, vérifier :
1. Envie : le débutant sort-il avec l'envie d'y aller ?
2. Valeur : y a-t-il au moins trois éléments concrets qu'il voudra retrouver ?
3. Rien de proposé : aucune fiche, aucun appel, aucune morale.
4. Chute : la dernière phrase surprend et enchaîne sur la première.

## Renouveler l'image (décision de l'utilisateur après MO6)

- **Plus de Polo** : elle a porté MO5 et MO6, « on l'a assez vue ». Ne pas la réutiliser comme sujet.
- **Éléments graphiques avec une animation complètement cohérente** : la technique (lumière, verre, caméra) est
  validée ; ce qui manquait, c'est un **système graphique** dessiné pour le film (pictogrammes au même trait, cartes,
  points, axes, crochets) et **une seule grammaire de mouvement** :
  1. tout naît d'un trait, puis se remplit ;
  2. un élément devient le suivant (morph), sans couper la chaîne ;
  3. une seule famille de ressorts pour tout le film ;
  4. tout tombe sur la grille musicale ;
  5. la caméra suit le trait ;
  6. une seule source de lumière : la plume qui trace.

## Chiffres et faits

- Chaque montant a sa source (lien, date) dans la timeline. Les fourchettes deviennent un chiffre rond, annoncé
  comme ordre de grandeur (« Exemple · ordres de grandeur, petite citadine »).
- Un fait technique se vérifie avant d'être animé, avec ses limites : la Polo 1.2 de cette génération a une chaîne,
  pas une courroie, donc la radiographie montre une voiture générique ; la mousse sous le bouchon peut venir de
  petits trajets, donc la voix dit « méfiance », pas « culasse morte ».

## Direction artistique

- Fond #08070a, orange #ff5a1f / #ff8a4c / #ffb38a, encre #f6efe7, gris #a59a90.
- Clash Display (chiffres, titres), Satoshi (UI), **Fraunces italique** pour le mot porteur (choisie parmi 7 serifs).
- Verre dépoli : `backdrop-filter: blur(26px) saturate(1.5)`, reflet en biais, liserés intérieurs.
- Lueurs : taches radiales en `screen`, filtres SVG de flou. Sur demande de l'utilisateur, elles touchent aussi les
  cartes (dérogation assumée à « pas de glow sur l'interface »).
- Grain en overlay (~8 %), vignettage.
- Photos réelles de l'utilisateur détourées avec rembg BiRefNet (`birefnet-general-lite`), bords décontaminés,
  contour lissé, puis **contour vectoriel tracé à la lumière** : il cache les défauts de détourage.
- Vidéos libres de droits : Mixkit (accessible, gratuit). Coverr accessible. Pexels, Freepik, Pixabay bloqués ici :
  ne pas contourner. Extraire en séquences JPG 30 i/s et les peindre sur canvas (déterministe).
- Pas de logo de plateforme, pas de visage, pas de plaque lisible (sauf la photo de l'utilisateur).

## Mouvement (« tout doit être parfait, d'une douceur »)

- **Caméra continue** : transform par couche
  `perspective(1700px) translateZ(z) rotateX rotateY translate3d(-x,-y,z)`, chaque axe suivi par `track()` avec
  springs fermés. Travellings, plongées dans un élément, profondeur de champ par flou des couches éloignées.
- **Lignes de lumière qui écrivent** : texte SVG en `stroke-dasharray`, une plume lumineuse suit le tracé, puis le
  remplissage monte.
- **Éléments qui se construisent** : palettes (split-flap), compteurs à rouleaux (colonnes −60..19 pour ne jamais
  tomber à vide, opacité des zéros de tête en `k^3`), étiquettes qui tombent, grilles qui se rangent sur le temps.
- **Typo lettre par lettre**, jamais de rebond visible.
- **Temps d'histoire** distinct du temps du film (`story(t)`) pour rembobiner proprement.
- Flou de bougé : `window.shutter` / `window.samples` (4 en mouvement rapide, 1 sinon).
- Quelque chose de nouveau toutes les 2 à 4 s, aucun temps mort.

## Son

- Voix : ElevenLabs `eleven_v3`, Simon `mvhJVdVoTWVUtL4keT7W`, pince-sans-rire. Accélérée de 10 % (`atempo`),
  minutage mot à mot par faster-whisper local, phrases placées sur la timeline.
- Musique : morceau de l'utilisateur calé à 120 BPM ; arrêt de bande, souffle inversé aux bascules ; automation qui
  assombrit la musique pendant l'attente.
- Bruitages Mixkit gratuits (banque `video/audio/bank/<projet>/`), liste d'événements avec priorités : un seul son
  principal à la fois (un son moins prioritaire à moins de 0,12 s est retiré).
- Mix : nivellement par phrase, ducking par bande (présence −10 dB, global −8 dB), réverbe courte partagée,
  limiteur à anticipation, −14 LUFS, plafond −3,5 dBTP avant AAC, musique −9 dB sous 150 Hz pour le téléphone.
- Crédits ElevenLabs : estimer d'abord ; « utilise ce qui est gratuit » sauf accord.

## Rendu

- `CUT=<projet> MB=4 PARTS=4 PART=<i> node video/scripts/render.mjs` en parallèle, puis `--assemble` (mux de
  `audio/mix-<projet>.wav`). Éléments à opacité < 0,002 en `visibility: hidden` (le backdrop-filter coûte cher).
- Images chargées en séquence avec relance (le `decode()` parallèle échoue sur les longues séquences).
- Contrôles : boucle mesurée (écart moyen image finale / image 0 < 1), `qa_video.py`, planche 0,25 s regardée.
- Dire franchement ce qui a été mesuré mais pas écouté.
