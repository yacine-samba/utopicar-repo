# QA — 9x16-presentev6

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : gauche : 0.00–3.50s, 20.75–23.00s, 23.50–25.00s, 25.50–25.75s, 26.00–27.25s, 35.50–36.25s, 36.50–36.75s, 37.25–37.75s, 44.50–44.75s; droite : 0.00–3.75s, 6.00–8.50s, 9.00–9.75s, 20.75–21.75s, 22.00–23.00s, 23.50–25.00s, 25.50–26.25s, 26.50–27.25s, 28.25–28.75s, 35.50–37.75s, 44.50–44.75s; bas : 20.25–20.50s, 20.75–21.75s, 22.00–22.75s, 23.50–24.75s, 26.00–26.25s, 38.00–39.00s; haut : 22.00–22.25s — vérifier sur 9x16-presentev6-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 1080×1920 30.00 i/s, 44.80 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 60.5 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.0 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.6 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -12.9 LUFS momentané vs -14.1 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 33 % de l énergie sous 150 Hz, 14.9 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-presentev6-safe.png` (rouge = interdit aux textes, logos, CTA).
