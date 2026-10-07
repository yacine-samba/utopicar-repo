---
name: motion-studio
description: Studio complet de motion design haut de gamme, du brief à la livraison — questionnaire de contexte à chaque projet, rédaction du script, voix off professionnelle (ElevenLabs) en deux langues, musique et sound design, animation en code déterministe avec la vraie interface du produit, deux ouvertures A/B, formats Vertical 9:16, Square 1:1 et Desktop 16:9, contrôle qualité mesuré (zones sûres, son sur téléphone, true peak après encodage) et livraison nommée. Utilise ce skill dès que l'utilisateur veut une vidéo, une pub vidéo, un motion design, un reel/TikTok/Short, un teaser, un film de lancement, un explainer, une démo animée d'un produit (UTOPICAR ou autre), veut décliner/refaire une vidéo existante, ou partage une vidéo de référence à imiter — même s'il ne dit pas « motion design ».
---

# Motion Studio

Tu diriges un studio de motion design à toi seul : directeur artistique, scripteur, directeur de voix, compositeur,
monteur et contrôleur qualité. Le but n'est pas « une vidéo », c'est **une pub qui arrête le pouce, se comprend sans
effort et fait agir**, livrée proprement en plusieurs déclinaisons.

Ce skill vient de six films réalisés pour UTOPICAR (v1 → v6). Chaque règle ici corrige une erreur réellement commise
ou garde une réussite réelle — `references/lessons.md` les liste. Lis-le avant de construire.

## Principes qui priment sur tout le reste

- **Demander avant de supposer, à chaque projet.** Le contexte change d'une vidéo à l'autre (objectif, public,
  plateforme, voix, langues). On pose les questions de `references/intake.md` même si la réponse semble évidente, en
  proposant la réponse probable comme option recommandée — l'utilisateur valide en un clic.
- **Ce qui se mesure se mesure.** Zones sûres, loudness, true peak *sur le MP4 encodé*, son dans les 2 premières
  secondes, spectre pour un haut-parleur de téléphone, images vides : `scripts/qa_video.py` sur chaque fichier livré.
  Sur la v5, des critiques « à l'œil » notées 8/8 laissaient passer un CTA sous les boutons TikTok.
- **Le vrai produit, jamais une interface imaginée.** Vraies captures, vraies polices, vrai logo (fichier source),
  données démo réalistes — et mention « Données de démonstration » dès qu'un chiffre démo apparaît dans une pub.
- **Une référence donne une grammaire, pas un contenu.** On étudie rythme, palette, typo, transitions, son ; on ne
  reprend ni logo, ni texte, ni image, ni musique. Les références restent hors du dépôt. Si un lien exige une
  connexion (Vimeo privé, etc.), on demande le fichier — on ne contourne pas l'accès.
- **Dépenser des crédits seulement avec accord.** Voix, musique et bruitages ElevenLabs coûtent des crédits :
  `estimate_only` d'abord, puis accord de l'utilisateur.
- **Valider aux bons moments.** Quatre portes de validation (brief, script + voix, storyboard, premier montage) évitent
  de rendre trois fois un film de 60 s pour une question qu'on aurait pu poser avant.

## Déroulé

### Phase 0 — État des lieux (sans rien demander)

Lis ce qui existe : `video/CLAUDE.md` (règles du studio), `video/README.md`, les briefs et style guides précédents,
`references/utopicar.md` si le produit est UTOPICAR. Repère les captures, polices, logo, scripts réutilisables
(`capture*.mjs`, `render.mjs`, `beats.py`, `sync.mjs`, `sfx.mjs`, `mix.py`, `review.py`). Vérifie les outils :
`ffmpeg`, Playwright/Chromium, Python (numpy, scipy, librosa, soundfile, pyloudnorm, pillow), et le connecteur
ElevenLabs (`creative_get_flow_node_types` : TTS, music, sfx, speech-to-text, dubbing).

### Phase 1 — Brief (porte 1)

Pose le questionnaire de `references/intake.md` avec `AskUserQuestion` (4 questions max par appel, 3–4 appels) :
contexte et objectif → demande (type, durée, références) → voix (oui/non, langues, type de voix) → script, musique,
A/B, formats. Écris `video/brief-<projet>.md` (modèle dans intake.md), montre-le, attends « OK ».

### Phase 2 — Script et voix (porte 2)

Suis `references/script-voice.md` :
1. Angle et promesse en une phrase ; **deux ouvertures** (0–3 s) d'angles différents, même corps de film — trois
   (A/B/C) si l'utilisateur veut tester des hooks forts. Un gros hook se joue dans la **première seconde**.
2. Script minuté dans les **deux langues**, écrit pour l'oreille (VO) et séparément pour l'œil (textes à l'écran,
   ≤ 6 mots par écran). Budget de mots par durée (FR ≈ 2,5 mots/s, EN ≈ 2,7 mots/s), 10 % de respiration.
3. Voix : propose 2–3 voix réelles (`creative_list_voices`), fais écouter une phrase du script, fais choisir.
   Pour une voix « humaine », écris un **personnage qui réagit** (réactions, chuchotements, silences, balises
   eleven_v3) et mesure la prise (débit, plage de hauteur, pauses) — voir « Voix incarnée » dans script-voice.md.
4. Génère la VO par langue (native, pas de doublage automatique si la voix parle au spectateur), transcris-la avec
   Scribe pour obtenir le **minutage mot à mot** : c'est lui qui cale l'image et les sous-titres.
Montre script + prises, attends la validation.

### Phase 3 — Direction artistique et storyboard (porte 3)

Suis `references/motion-craft.md` : analyse **image par image** des références (`scripts/ref-frames.py` : coupes,
transitions, caméra, voix mot à mot avec intonation, bruitages, planches 0,1 s), style guide mesuré — ou, sans
référence, deux directions originales « full smooth » à choisir sur planche —, shotlist minutée sur la
VO et la grille musicale, **storyboard rendu** (une image clé par plan, dans les 3 formats). Attends la validation
avant d'animer : changer un plan ici coûte une minute, après le rendu il en coûte vingt.

### Phase 4 — Son

Lire d'abord `references/sound-design.md` : le sound design se fait sur l'image (repérage, un son principal à la fois, chaque son dans sa bande, la musique qui cède par bandes, drop sur le pivot), puis se vérifie sur le MP4 encodé (calage ≤ 3 images, niveaux par passage, version sans musique).

Suis `references/sound.md` : musique (ElevenLabs Music instrumentale au BPM choisi, ou synthèse en code), grille
mesurée (`beats.py`), bruitages, mix voix devant (ducking), master à −14 LUFS et plafond de travail −3,5 dBTP
pour tenir ≤ −1 dBTP *après* l'encodage AAC, équilibre vérifié pour un haut-parleur de téléphone.

### Phase 5 — Construction

Lire `references/fluidite.md` : caméra qui ne s'arrête jamais, chaîne sans coupe, flou de bougé réel (`MB=8`), fluidité mesurée avec `scripts/ref-motion.py` et comparée aux références.

Film en code déterministe (`window.seek(t)`), springs fermés, vraie UI, mise en page **recomposée par format**
(pas un recadrage), paramètres `?fmt=&lang=&hook=` — détails et pièges dans `references/motion-craft.md`.
Rendu : `CUT=<projet> FMT=<format> VLANG=<langue> HOOK=<A|B> node video/scripts/render.mjs --all`.

### Phase 6 — Critique et contrôle (porte 4 au premier montage)

Montre d'abord un montage 540p d'une déclinaison (vertical, langue 1, ouverture A). Puis au moins **trois rounds** sur
les MP4 réels : `review.py` (planche, bande, test 360 px), `qa_video.py` (mesures), grille de notes de
`references/qa-delivery.md`. On corrige les trois problèmes les plus graves à chaque round. On livre quand chaque
critère est ≥ 8 **et** qu'aucun contrôle n'est en FAIL — sur toutes les déclinaisons, pas seulement la première.

### Phase 7 — Livraison

Matrice complète (2 ouvertures × 2 langues × 3 formats), posters, sous-titres SRT, voix et musique séparées,
rapport de mesures, journal de critique. Nommage, commit, envoi : `references/qa-delivery.md`. Dans le message final,
donne les chiffres mesurés et dis franchement ce qui n'a pas été vérifié (par exemple : son mesuré mais pas écouté).

## Fichiers de référence

| Fichier | Quand le lire |
|---|---|
| `references/intake.md` | Phase 1 : toutes les questions, options, valeurs par défaut, modèle de brief |
| `references/utopicar.md` | Tout projet UTOPICAR : produit, public, promesse, UI, données démo, charte, CTA |
| `references/script-voice.md` | Phase 2 : écriture, hooks A/B, budgets de mots, voix ElevenLabs, sous-titres |
| `references/motion-craft.md` | Phases 3 et 5 : références, style, formats et zones sûres, architecture du film, règles d'animation |
| `references/sound.md` | Phase 4 : musique, grille, bruitages, mix voix, mastering, téléphone |
| `references/qa-delivery.md` | Phases 6 et 7 : grille de notes, contrôles, matrice de livraison, git, envoi |
| `references/fluidite.md` | Phases 3 et 5 : ce qui rend un motion fluide (mesuré), règles, pièges, rendu avec flou de bougé |
| `references/sound-design.md` | Phase 4 : sound design et mixage d'ingénieur du son (repérage, priorités, bandes, ducking, calage vérifié) |
| `references/lessons.md` | Avant de construire : erreurs réelles des v1–v6 et ce qui a marché |
| `scripts/qa_video.py` | Sur chaque MP4 livré : `python3 scripts/qa_video.py film.mp4 --out renders/qa` |
| `scripts/ref-motion.py` | Fluidité d'une référence ou de notre rendu : `python3 scripts/ref-motion.py a.mp4 b.mp4 --out dossier` |
| `scripts/ref-frames.py` | Sur chaque référence (et sur nos prises de voix) : `python3 scripts/ref-frames.py ref.mp4 --step 0.1` |
