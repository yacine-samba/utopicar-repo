# UTOPICAR — films TikTok (motion design en code)

Film de 15 s en 9:16 (1080×1920, 30 i/s) pour une campagne TikTok, réalisé en code à partir de la **vraie
interface d'UTOPICAR Garage**, chargée dans Chromium avec des **données démo** (aucune donnée réelle du parc).
Tous les chiffres à l'écran sont calculés par l'outil lui-même.

## Versions

| Version | Fichier | Direction |
|---|---|---|
| v1 | historique git (`e9e81bb`) | écran complet de l'app, 9 titres, rythme rapide |
| v2 | `renders/9x16.mp4` | minimaliste : un titre et un extrait du site par plan, musique calme |
| **v3** | **`renders/9x16-launch.mp4`** | **lancement cinématographique monochrome d'après la référence 1** : 3D (Three.js), profondeur de champ, halo, grain, texte fin mot à mot, sound design original, 24 i/s ; le jaune UTOPICAR est la seule couleur du film |

| v4 | `renders/9x16-saas.mp4` | film produit 30 s d'après la référence 2 : mosaïque, mot-symbole tracé puis extrudé, survols 3D |
| **v5** | **`renders/9x16-explainer.mp4`** | **explicatif 60 s d'après la référence 3** : grille blanche, phrases tapées, chapitres « mot géant + interrupteur », curseur sur la vraie UI, chiffres géants, Sans / Avec, récap, pastille logo |
| **v6** | **`renders/9x16-chat.mp4`** | **« conversation » 60 s d'après la référence 4** : recherche tapée, phrases adressées au spectateur, anneau, essaim, fenêtre inclinée, panneaux pastel par fonction, pause noire, kaléidoscope, bouton cliqué |

v5 et v6 utilisent le **logo fourni par l'utilisateur** (retracé en vecteur : `assets/brand/logo.svg`) et son orange
`#FF5A1F` comme accent. Calques d'UI supplémentaires : `node scripts/capture2.mjs` → `assets/ui2/`.
Refaire la v5 (ou la v6 avec `chat`) : `python3 scripts/music-explainer.py && CUT=explainer python3 scripts/beats.py audio/music-explainer.wav --stem audio/drums-explainer.wav && CUT=explainer node scripts/sync.mjs && CUT=explainer node scripts/sfx.mjs && MIX_CEIL=-3.5 CUT=explainer python3 scripts/mix.py && CUT=explainer node scripts/render.mjs --all` (≈ 6 min).
Style et plans : `docs/explainer_style_guide.md`, `docs/explainer_shotlist.md`, `docs/chat_style_guide.md`, `docs/chat_shotlist.md`.

Refaire la v3 : `python3 scripts/music-launch.py && CUT=launch python3 scripts/beats.py audio/music-launch.wav --stem audio/drums-launch.wav && CUT=launch node scripts/sync.mjs && CUT=launch python3 scripts/mix.py && CUT=launch node scripts/render.mjs --all` (≈ 12 min, rendu WebGL logiciel).
Style et plans : `docs/launch_style_guide.md`, `docs/launch_shotlist.md`. La référence n'est pas versionnée (`refs/` ignoré).

## Faire un nouveau film : le master prompt

- Dans ce dépôt : tape **`/motion-studio`** (skill `.claude/skills/motion-studio/`). Il pose le questionnaire (contexte,
  demande, voix, langues, type de voix, script, musique, ouvertures A/B, formats), puis déroule script bilingue,
  voix off ElevenLabs, direction artistique, son, construction, critique mesurée et livraison
  (2 ouvertures × 2 langues × Vertical / Square / Desktop).
- Ailleurs (claude.ai, autre dépôt) : colle **`MASTER_PROMPT.md`** (version compilée du skill ; la régénérer avec
  `python3 .claude/skills/motion-studio/scripts/build_master_prompt.py`). Paquet installable : `renders/skill/motion-studio.skill`.
- Contrôle mesuré d'un MP4 : `python3 .claude/skills/motion-studio/scripts/qa_video.py renders/<film>.mp4 --out renders/qa`.
- Rendu des déclinaisons (films qui lisent `?fmt=&lang=&hook=`) : `CUT=<projet> FMT=square VLANG=en HOOK=B node scripts/render.mjs --all`.
- Analyse critique de la v5 : `docs/analyse_v5_explainer.md`.

## Livrables (v2)

| Fichier | Contenu |
|---|---|
| `renders/9x16.mp4` | film final, H.264 yuv420p CRF 16 + AAC 256 k, −14 LUFS, true peak −1,2 dBTP |
| `renders/poster.png` | image de couverture (14,2 s : logo + CTA) |
| `renders/contact.png` | contact sheet à 2 img/s tirée du MP4 |
| `renders/storyboard.png` | une image par plan avec son texte |
| `renders/audio-check.png` | spectrogramme + forme d'onde avec les repères sonores |
| `renders/review/r5-*` | contrôles du rendu final (contact, bande de 12 frames, test 360 px, boucle) |
| `docs/review_log.md` | 4 rounds de critique notés + passage de contrôle |
| `docs/style_guide.md`, `docs/shotlist.md` | direction validée avant le code |

## Refaire le film

Prérequis : Node 22+, ffmpeg, Python 3 avec numpy, scipy, librosa, soundfile, pillow, pyloudnorm ; `npm install`.

```bash
node scripts/capture.mjs                      # vraie UI + base démo → assets/ui/*.png + layout.json
python3 scripts/music.py                      # musique originale 120 BPM → audio/music.wav + drums.wav
python3 scripts/beats.py audio/music.wav --stem audio/drums.wav   # grille mesurée → beats.json
node scripts/sync.mjs                         # vérifie la timeline contre la grille (--apply pour recaler)
node scripts/sfx.mjs                          # effets sonores depuis timeline.json → audio/sfx.wav
python3 scripts/mix.py                        # mix −14 LUFS / −1 dBTP → audio/mix.wav + docs/mix_report.txt
node scripts/render.mjs --all                 # film final → renders/9x16.mp4 + poster.png
python3 scripts/review.py r6                  # contrôle qualité sur le MP4
```

Autres modes de rendu : `--at 3.2,3.25` (images fixes), `--range 3,5`, `--sheet`, `--strip 12.0`, `--phone`,
`--draft` (animatic 540×960). Aperçu en direct : servir le dossier et ouvrir `film/index.html`.

## Architecture

- `film/film.js` : `window.seek(t)` peint la frame `t`, sans transition CSS, minuterie ni état entre frames.
- `lib/motion.js` : springs fermés (`snappy`, `default`, `heavy`, `playful`), `track`, `indicator`, `swapAlpha`, `loopT`.
- `timeline.json` : source commune de l'image et du son (repères, titres, CTA).
- `scripts/ui.mjs` + `scripts/demo-data.mjs` : la page réelle `assets/site/utopicar-live.html`, avec
  `window.claude` remplacé par une base démo (véhicules, rapports, annonces, cote de 200 annonces seedée).
- Barre, dock et bouton collant sont capturés en PNG transparent ; le film recrée leur verre avec le même
  `backdrop-filter` que le site.

## Modifier

- Textes et CTA : `timeline.json` (`titles`, `cta`), puis `node scripts/sfx.mjs && python3 scripts/mix.py && node scripts/render.mjs --all`.
- Chiffres affichés : `scripts/demo-data.mjs`, puis `node scripts/capture.mjs` et rendu.
- Mot-clé du CTA : actuellement « GARAGE ».
