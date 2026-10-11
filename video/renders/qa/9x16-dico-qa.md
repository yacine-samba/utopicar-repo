# QA — 9x16-dico

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : haut : 4.25–4.50s; droite : 4.25–4.50s, 10.75–11.00s, 14.00–14.25s; gauche : 10.75–11.00s — vérifier sur 9x16-dico-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| WARN | Images vides | aplats sans contenu à 12.50s, 15.50s — souvent la frame de coupe où le plan suivant n est pas encore entré : faire entrer le premier élément dès la frame de coupe |
| OK | Codec vidéo | h264 yuv420p 1080×1920 30.00 i/s, 33.00 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 22.3 — contient déjà du contenu |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.0 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.6 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -12.6 LUFS momentané vs -14.2 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 36 % de l énergie sous 150 Hz, 9.4 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-dico-safe.png` (rouge = interdit aux textes, logos, CTA).
