# QA — 16x9-master60w-B

Format détecté : **desktop**, zones interdites {'top': 54, 'bottom': 108, 'left': 96, 'right': 96}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 54, 'bottom': 108, 'left': 96, 'right': 96}) : haut : 0.00–4.50s, 22.00–22.25s, 31.00–31.25s, 31.50–34.00s; bas : 0.00–4.50s, 22.00–22.25s, 31.25–34.00s; droite : 0.00–4.50s, 24.00–24.50s, 34.25–37.50s, 37.75–38.00s, 39.25–41.00s, 41.75–42.00s, 42.50–42.75s, 48.25–48.75s — vérifier sur 16x9-master60w-B-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 1920×1080 30.00 i/s, 59.00 s (desktop) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 44.7 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.2 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.4 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -13.7 LUFS momentané vs -14.2 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 39 % de l énergie sous 150 Hz, 10.0 % entre 1 et 5 kHz |

Planche zones sûres : `16x9-master60w-B-safe.png` (rouge = interdit aux textes, logos, CTA).
