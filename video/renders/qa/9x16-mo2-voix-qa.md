# QA — 9x16-mo2-voix

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| OK | Codec vidéo | h264 yuv420p 1080×1920 30.00 i/s, 60.00 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 53.7 — contient déjà du contenu |
| OK | Zones sûres | aucun contenu net dans les marges {'top': 220, 'bottom': 440, 'left': 60, 'right': 140} |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.0 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.1 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -11.9 LUFS momentané vs -14.5 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 24 % de l énergie sous 150 Hz, 5.4 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-mo2-voix-safe.png` (rouge = interdit aux textes, logos, CTA).
