# QA — 9x16-mo5

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : gauche : 1.00–1.75s, 3.50–4.00s, 16.00–17.25s, 17.50–18.75s; bas : 5.50–12.50s, 15.75–18.75s, 21.50–21.75s; droite : 5.75–12.50s, 13.75–18.75s, 21.00–21.25s, 21.50–21.75s, 24.00–27.75s — vérifier sur 9x16-mo5-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 1080×1920 60.00 i/s, 29.60 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 41.3 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.3 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.5 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -13.4 LUFS momentané vs -14.5 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 48 % de l énergie sous 150 Hz, 6.3 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-mo5-safe.png` (rouge = interdit aux textes, logos, CTA).
