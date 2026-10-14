# QA — 16x9-presentev

Format détecté : **desktop**, zones interdites {'top': 54, 'bottom': 108, 'left': 96, 'right': 96}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 54, 'bottom': 108, 'left': 96, 'right': 96}) : haut : 0.00–6.25s, 28.00–28.25s; droite : 3.50–6.00s; bas : 21.75–22.00s — vérifier sur 16x9-presentev-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 1920×1080 30.00 i/s, 28.17 s (desktop) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 58.2 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.2 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.7 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -13.2 LUFS momentané vs -14.7 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 31 % de l énergie sous 150 Hz, 9.2 % entre 1 et 5 kHz |

Planche zones sûres : `16x9-presentev-safe.png` (rouge = interdit aux textes, logos, CTA).
