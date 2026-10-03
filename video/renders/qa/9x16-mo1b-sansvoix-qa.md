# QA — 9x16-mo1b-sansvoix

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : droite : 6.00–6.25s, 16.75–17.00s, 22.25–22.50s — vérifier sur 9x16-mo1b-sansvoix-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| WARN | Images vides | aplats sans contenu à 16.50s — souvent la frame de coupe où le plan suivant n est pas encore entré : faire entrer le premier élément dès la frame de coupe |
| OK | Codec vidéo | h264 yuv420p 1080×1920 30.00 i/s, 62.63 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 24.2 — contient déjà du contenu |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.0 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.3 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -16.2 LUFS momentané vs -13.9 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 33 % de l énergie sous 150 Hz, 6.8 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-mo1b-sansvoix-safe.png` (rouge = interdit aux textes, logos, CTA).
