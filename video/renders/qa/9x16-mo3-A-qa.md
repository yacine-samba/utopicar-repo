# QA — 9x16-mo3-A

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : gauche : 11.75–12.00s, 24.75–25.25s; droite : 14.00–14.25s, 24.75–25.25s, 38.00–38.25s — vérifier sur 9x16-mo3-A-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 1080×1920 60.00 i/s, 41.32 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 16.5 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.4 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -4.0 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -16.5 LUFS momentané vs -14.4 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 35 % de l énergie sous 150 Hz, 8.1 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-mo3-A-safe.png` (rouge = interdit aux textes, logos, CTA).
