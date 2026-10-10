# QA — draft-mo12-9x16

Format détecté : **vertical**, zones interdites {'top': 110, 'bottom': 220, 'left': 30, 'right': 70}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 110, 'bottom': 220, 'left': 30, 'right': 70}) : gauche : 3.25–3.50s — vérifier sur draft-mo12-9x16-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 540×960 60.00 i/s, 31.05 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 46.1 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.2 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.8 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -13.4 LUFS momentané vs -14.8 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 26 % de l énergie sous 150 Hz, 26.7 % entre 1 et 5 kHz |

Planche zones sûres : `draft-mo12-9x16-safe.png` (rouge = interdit aux textes, logos, CTA).
