# QA — 9x16-explainer60

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : droite : 2.75–3.00s, 16.75–17.00s, 40.50–40.75s, 47.25–47.50s, 50.00–50.25s; haut : 15.25–15.50s, 18.75–19.00s, 24.25–24.50s, 29.50–29.75s, 34.50–34.75s, 39.25–39.50s, 44.50–44.75s, 51.00–51.25s; bas : 20.50–20.75s, 22.75–23.00s, 25.00–25.50s; gauche : 48.25–48.50s, 48.75–49.00s — vérifier sur 9x16-explainer60-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| OK | Codec vidéo | h264 yuv420p 1080×1920 30.00 i/s, 58.17 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 28.0 — contient déjà du contenu |
| OK | Images vides | aucune |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.0 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -1.7 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -16.1 LUFS momentané vs -14.0 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 33 % de l énergie sous 150 Hz, 6.3 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-explainer60-safe.png` (rouge = interdit aux textes, logos, CTA).
