# QA — 9x16-pub30-A

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : droite : 1.25–1.50s, 16.25–16.50s; bas : 2.50–2.75s; haut : 9.75–10.00s, 11.75–12.00s, 14.50–14.75s, 17.75–18.00s, 21.75–22.00s, 24.75–25.00s — vérifier sur 9x16-pub30-A-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 1080×1920 30.00 i/s, 28.00 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 44.2 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.0 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.0 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -15.9 LUFS momentané vs -13.9 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 35 % de l énergie sous 150 Hz, 5.7 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-pub30-A-safe.png` (rouge = interdit aux textes, logos, CTA).
