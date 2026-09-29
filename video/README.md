# UTOPICAR — pub TikTok 15 s (motion design en code)

Film de 15 s en 9:16 (1080×1920, 30 i/s) pour une campagne TikTok, réalisé en code à partir de la **vraie
interface d'UTOPICAR Garage**, chargée dans Chromium avec des **données démo** (aucune donnée réelle du parc).
Tous les chiffres à l'écran sont calculés par l'outil lui-même.

## Livrables

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
