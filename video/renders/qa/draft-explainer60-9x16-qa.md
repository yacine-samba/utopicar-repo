# QA — draft-explainer60-9x16

Format détecté : **vertical**, zones interdites {'top': 110, 'bottom': 220, 'left': 30, 'right': 70}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 110, 'bottom': 220, 'left': 30, 'right': 70}) : droite : 16.25–16.50s, 33.75–34.00s, 39.75–40.00s, 48.75–49.00s, 53.75–54.00s; bas : 20.00–20.25s, 22.25–22.50s, 25.25–25.50s; haut : 23.75–24.00s, 28.75–29.00s, 43.25–43.50s, 49.75–50.00s; gauche : 28.00–28.25s, 40.00–40.25s — vérifier sur draft-explainer60-9x16-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| WARN | Images vides | aplats sans contenu à 38.25s — souvent la frame de coupe où le plan suivant n est pas encore entré : faire entrer le premier élément dès la frame de coupe |
| OK | Codec vidéo | h264 yuv420p 540×960 30.00 i/s, 57.63 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 27.0 — contient déjà du contenu |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.0 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.4 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -15.9 LUFS momentané vs -14.0 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 33 % de l énergie sous 150 Hz, 5.8 % entre 1 et 5 kHz |

Planche zones sûres : `draft-explainer60-9x16-safe.png` (rouge = interdit aux textes, logos, CTA).
