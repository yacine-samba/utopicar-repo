# QA — 9x16-c7-FI3

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : gauche : 0.00–0.50s, 1.25–3.50s; bas : 4.25–4.50s — vérifier sur 9x16-c7-FI3-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 1080×1920 30.00 i/s, 7.95 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 57.1 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.6 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.7 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -15.0 LUFS momentané vs -14.7 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 31 % de l énergie sous 150 Hz, 9.7 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-c7-FI3-safe.png` (rouge = interdit aux textes, logos, CTA).
