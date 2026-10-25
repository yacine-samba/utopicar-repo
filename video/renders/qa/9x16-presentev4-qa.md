# QA — 9x16-presentev4

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : gauche : 12.50–12.75s, 15.25–15.75s, 22.25–22.50s, 24.75–25.00s; droite : 15.25–15.75s, 26.25–26.50s — vérifier sur 9x16-presentev4-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 1080×1920 30.00 i/s, 33.13 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 44.0 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.0 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.7 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -13.6 LUFS momentané vs -14.0 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 27 % de l énergie sous 150 Hz, 13.4 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-presentev4-safe.png` (rouge = interdit aux textes, logos, CTA).
