# QA — 9x16-ads2

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : haut : 2.25–2.50s, 7.00–7.25s; bas : 2.25–2.50s; droite : 9.25–9.50s — vérifier sur 9x16-ads2-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 1080×1920 30.00 i/s, 12.53 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 30.0 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.0 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.5 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -12.8 LUFS momentané vs -15.1 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 22 % de l énergie sous 150 Hz, 4.7 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-ads2-safe.png` (rouge = interdit aux textes, logos, CTA).
