# QA — 9x16-mo3-C

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : droite : 10.00–10.25s, 12.50–12.75s, 23.00–23.25s, 23.50–23.75s, 36.50–36.75s; gauche : 10.25–10.50s, 23.25–23.75s — vérifier sur 9x16-mo3-C-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 1080×1920 60.00 i/s, 39.83 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 16.3 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.4 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -4.0 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -14.2 LUFS momentané vs -14.3 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 36 % de l énergie sous 150 Hz, 7.9 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-mo3-C-safe.png` (rouge = interdit aux textes, logos, CTA).
