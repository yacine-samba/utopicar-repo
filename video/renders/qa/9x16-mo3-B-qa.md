# QA — 9x16-mo3-B

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : gauche : 0.00–0.50s, 11.25–11.50s, 18.50–18.75s, 24.25–24.75s; droite : 0.00–0.50s, 11.25–11.50s, 18.50–18.75s, 24.00–24.25s, 24.50–24.75s, 35.75–36.00s — vérifier sur 9x16-mo3-B-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 1080×1920 60.00 i/s, 40.72 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 19.6 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.5 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -4.0 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -13.3 LUFS momentané vs -14.5 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 35 % de l énergie sous 150 Hz, 8.1 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-mo3-B-safe.png` (rouge = interdit aux textes, logos, CTA).
