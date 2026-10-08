# QA — 9x16-mo9

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : droite : 2.50–2.75s, 15.50–15.75s, 17.00–18.00s, 21.00–25.00s; haut : 13.00–17.00s, 18.25–20.00s, 20.25–20.75s, 25.00–25.25s — vérifier sur 9x16-mo9-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 1080×1920 60.00 i/s, 31.40 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 33.8 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.3 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.5 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -13.7 LUFS momentané vs -14.5 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 42 % de l énergie sous 150 Hz, 7.8 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-mo9-safe.png` (rouge = interdit aux textes, logos, CTA).
