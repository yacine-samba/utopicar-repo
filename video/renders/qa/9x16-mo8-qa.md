# QA — 9x16-mo8

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : gauche : 4.50–4.75s, 16.25–18.75s, 28.50–28.75s; droite : 7.50–8.25s, 15.50–16.25s, 16.75–18.75s, 29.00–29.50s — vérifier sur 9x16-mo8-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 1080×1920 60.00 i/s, 30.00 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 59.2 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.8 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.5 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -13.1 LUFS momentané vs -15.0 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 31 % de l énergie sous 150 Hz, 9.4 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-mo8-safe.png` (rouge = interdit aux textes, logos, CTA).
