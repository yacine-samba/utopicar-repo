# QA — 9x16-presente30

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : droite : 4.75–5.25s, 8.25–8.50s; bas : 24.25–26.25s — vérifier sur 9x16-presente30-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| WARN | Équilibre pour haut-parleur de téléphone | 61 % de l énergie sous 150 Hz, 13.3 % entre 1 et 5 kHz — un téléphone ne reproduit pas ce grave : le film paraîtra faible ; remonter médiums/aigus, alléger le sub |
| OK | Codec vidéo | h264 yuv420p 1080×1920 30.00 i/s, 30.00 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 39.5 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.0 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.7 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -16.9 LUFS momentané vs -14.2 sur le reste |

Planche zones sûres : `9x16-presente30-safe.png` (rouge = interdit aux textes, logos, CTA).
