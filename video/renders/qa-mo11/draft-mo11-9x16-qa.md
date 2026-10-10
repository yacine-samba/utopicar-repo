# QA — draft-mo11-9x16

Format détecté : **vertical**, zones interdites {'top': 110, 'bottom': 220, 'left': 30, 'right': 70}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 110, 'bottom': 220, 'left': 30, 'right': 70}) : gauche : 0.00–5.50s, 6.00–7.50s, 8.50–8.75s, 9.50–10.00s, 10.50–10.75s, 11.50–12.50s, 15.25–15.50s, 28.50–28.75s, 29.50–30.25s; droite : 0.00–5.25s, 6.50–6.75s, 8.75–9.00s, 9.75–10.00s, 10.50–10.75s, 11.25–11.50s, 12.00–14.75s, 20.50–21.25s, 28.25–28.50s, 29.00–30.25s — vérifier sur draft-mo11-9x16-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 540×960 60.00 i/s, 30.15 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 56.0 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.2 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.8 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -15.7 LUFS momentané vs -14.3 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 30 % de l énergie sous 150 Hz, 25.4 % entre 1 et 5 kHz |

Planche zones sûres : `draft-mo11-9x16-safe.png` (rouge = interdit aux textes, logos, CTA).
