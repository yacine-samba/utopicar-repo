# QA — 9x16-c7-PS2

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : haut : 10.75–11.00s, 11.25–11.50s, 17.00–17.25s; bas : 10.75–11.00s, 11.25–11.50s, 17.00–17.25s; gauche : 10.75–11.50s, 16.75–17.25s; droite : 11.00–11.50s, 13.50–14.00s — vérifier sur 9x16-c7-PS2-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 1080×1920 30.00 i/s, 26.00 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 60.7 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.1 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.5 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -13.2 LUFS momentané vs -14.6 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 44 % de l énergie sous 150 Hz, 9.2 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-c7-PS2-safe.png` (rouge = interdit aux textes, logos, CTA).
