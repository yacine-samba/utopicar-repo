# QA — 16x9-presente30

Format détecté : **desktop**, zones interdites {'top': 54, 'bottom': 108, 'left': 96, 'right': 96}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 54, 'bottom': 108, 'left': 96, 'right': 96}) : droite : 8.25–8.50s; bas : 24.25–26.25s; haut : 24.50–26.25s — vérifier sur 16x9-presente30-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| WARN | Équilibre pour haut-parleur de téléphone | 58 % de l énergie sous 150 Hz, 10.0 % entre 1 et 5 kHz — un téléphone ne reproduit pas ce grave : le film paraîtra faible ; remonter médiums/aigus, alléger le sub |
| OK | Codec vidéo | h264 yuv420p 1920×1080 30.00 i/s, 30.00 s (desktop) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 40.1 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.0 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.1 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -14.7 LUFS momentané vs -14.7 sur le reste |

Planche zones sûres : `16x9-presente30-safe.png` (rouge = interdit aux textes, logos, CTA).
