# QA — 9x16-ads3

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : haut : 3.50–3.75s, 5.25–5.50s; gauche : 3.75–4.00s; droite : 4.00–4.25s, 10.00–10.25s — vérifier sur 9x16-ads3-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 1080×1920 30.00 i/s, 14.07 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 28.9 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.0 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.4 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -13.9 LUFS momentané vs -14.9 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 28 % de l énergie sous 150 Hz, 6.6 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-ads3-safe.png` (rouge = interdit aux textes, logos, CTA).
