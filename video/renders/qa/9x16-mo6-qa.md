# QA — 9x16-mo6

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : droite : 0.25–4.75s, 5.50–7.50s, 10.50–12.50s, 13.25–13.75s, 27.00–29.00s, 29.75–30.00s; gauche : 9.00–10.25s, 10.50–12.50s, 13.25–13.50s, 16.25–17.00s — vérifier sur 9x16-mo6-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 1080×1920 60.00 i/s, 30.00 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 48.9 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.6 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.5 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -15.2 LUFS momentané vs -14.9 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 40 % de l énergie sous 150 Hz, 6.9 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-mo6-safe.png` (rouge = interdit aux textes, logos, CTA).
