# QA — 9x16-explainer60

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : droite : 2.50–2.75s, 32.00–32.25s, 34.50–34.75s, 39.50–39.75s, 47.25–47.50s, 49.00–49.50s, 50.25–50.50s, 55.50–55.75s; bas : 14.00–14.25s, 20.50–20.75s, 22.75–23.00s, 30.00–30.25s; haut : 24.25–24.50s, 29.00–29.25s, 44.25–44.50s; gauche : 58.75–60.00s — vérifier sur 9x16-explainer60-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 1080×1920 30.00 i/s, 60.00 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 28.0 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.0 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.2 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -11.9 LUFS momentané vs -14.5 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 24 % de l énergie sous 150 Hz, 5.4 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-explainer60-safe.png` (rouge = interdit aux textes, logos, CTA).
