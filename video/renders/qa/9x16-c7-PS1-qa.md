# QA — 9x16-c7-PS1

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : gauche : 5.50–5.75s — vérifier sur 9x16-c7-PS1-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 1080×1920 30.00 i/s, 19.40 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 59.5 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.3 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.8 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -15.1 LUFS momentané vs -14.8 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 41 % de l énergie sous 150 Hz, 9.2 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-c7-PS1-safe.png` (rouge = interdit aux textes, logos, CTA).
