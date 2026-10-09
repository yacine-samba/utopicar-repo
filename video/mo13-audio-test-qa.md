# QA — mo13-audio-test

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| OK | Codec vidéo | h264 yuv420p 1080×1920 60.00 i/s, 31.25 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 38.2 — contient déjà du contenu |
| OK | Zones sûres | aucun contenu net dans les marges {'top': 220, 'bottom': 440, 'left': 60, 'right': 140} |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.3 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.9 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -15.0 LUFS momentané vs -14.6 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 17 % de l énergie sous 150 Hz, 31.9 % entre 1 et 5 kHz |

Planche zones sûres : `mo13-audio-test-safe.png` (rouge = interdit aux textes, logos, CTA).
