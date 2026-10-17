# QA — 9x16-presentev11

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : bas : 11.00–11.50s, 12.75–14.50s, 16.00–16.25s, 16.75–17.00s, 18.75–19.00s, 21.00–21.25s, 26.00–27.00s, 27.75–28.00s, 29.25–29.50s, 30.25–30.50s, 30.75–31.25s, 33.75–34.00s, 35.75–36.00s, 37.25–37.50s, 40.00–40.25s, 43.25–44.00s, 45.00–45.50s — vérifier sur 9x16-presentev11-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| WARN | Images vides | aplats sans contenu à 47.75s — souvent la frame de coupe où le plan suivant n est pas encore entré : faire entrer le premier élément dès la frame de coupe |
| OK | Codec vidéo | h264 yuv420p 1080×1920 30.00 i/s, 55.20 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 49.3 — contient déjà du contenu |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.1 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.4 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -13.5 LUFS momentané vs -14.1 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 27 % de l énergie sous 150 Hz, 8.0 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-presentev11-safe.png` (rouge = interdit aux textes, logos, CTA).

## Contrôles en plus (17 oct. 2026)

- **Zones sûres (WARN)** : ce qui passe dans les 440 px du bas est le bas du téléphone (fin de l'écran de l'app et sa
  barre d'onglets), comme sur la planche validée. Aucun sous-titre, chiffre, bloc sorti, logo ni appel à l'action n'y
  entre (blocs sortis : bas ≤ 1 460 px).
- **Images vides (WARN, 47,75 s)** : la grosse couleur orange de la fin, qui couvre l'écran ; « Ta 1re analyse » s'écrit
  dessus 0,04 s plus tard.
- **Détecteurs** (`chevauchements.mjs`, puis `chevauchements.py`, seuls, avant le rendu) : 0 texte posé sur un autre,
  0 texte hors des zones sûres, 0 détail net sous une lettre de sous-titre (462 images).
- **Coutures des trois morceaux** (18,4 s et 36,8 s) : écarts d'image à image sans saut (1,0 à 4,6 sur 255).
- **Boucle** : les dernières images retombent sur la première (Polo, 8 990 €, « Tu »).
- **Mix** (`docs/mix_report-presentev11.txt`) : −14,1 LUFS, voix au moins 8,9 dB devant la musique (médiane 11,0 dB),
  plus long blanc dans la voix 0,40 s.
- **Mouvement** (`scripts/ref-motion.py`, flux optique, `mouvement/motion.md`) :

  | | mouvement | figé (part) | figé médian / max | vitesse p90 | départ / arrêt |
  |---|---|---|---|---|---|
  | v10 | 53 % | 41 % | 0,67 / 3,33 s | 14,4 %/s | 0,27 / 0,27 s |
  | v11 | 57 % | 30 % | 0,50 / 2,00 s | 16,8 %/s | 0,20 / 0,23 s |

  Ce qui reste presque immobile : les quatre cartes « Étape N » (1,2 à 1,4 s chacune, le texte s'écrit sur la
  couleur), les 2 s qui suivent « −2 458 € » dans l'accroche, et la fin (logo, signature). Les pubs de référence
  bougent sur 79 à 93 % des images.
