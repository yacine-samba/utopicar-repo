# QA — draft-mo13-9x16

Format détecté : **vertical**, zones interdites {'top': 110, 'bottom': 220, 'left': 30, 'right': 70}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 110, 'bottom': 220, 'left': 30, 'right': 70}) : droite : 8.50–8.75s, 10.50–10.75s, 12.25–12.50s, 14.50–14.75s, 15.25–15.50s, 16.75–17.00s, 18.50–18.75s, 19.00–19.25s, 20.00–20.25s; gauche : 9.75–10.00s, 12.00–12.25s, 14.75–15.25s, 20.25–20.50s, 20.75–21.25s, 24.50–24.75s — vérifier sur draft-mo13-9x16-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 540×960 60.00 i/s, 31.45 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 45.6 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.1 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -4.0 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -15.3 LUFS momentané vs -14.3 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 14 % de l énergie sous 150 Hz, 33.5 % entre 1 et 5 kHz |

Planche zones sûres : `draft-mo13-9x16-safe.png` (rouge = interdit aux textes, logos, CTA).
