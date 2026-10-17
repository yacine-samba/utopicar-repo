# QA — 9x16-presentev10

Format détecté : **vertical**, zones interdites {'top': 220, 'bottom': 440, 'left': 60, 'right': 140}

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | contenu net dans une zone interdite ({'top': 220, 'bottom': 440, 'left': 60, 'right': 140}) : gauche : 13.50–13.75s, 33.25–34.50s, 38.25–38.50s; bas : 33.25–34.50s; droite : 33.25–34.50s, 37.75–38.00s, 59.25–59.50s — vérifier sur 9x16-presentev10-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL |
| WARN | Images vides | aplats sans contenu à 8.25s — souvent la frame de coupe où le plan suivant n est pas encore entré : faire entrer le premier élément dès la frame de coupe |
| OK | Codec vidéo | h264 yuv420p 1080×1920 30.00 i/s, 59.53 s (vertical) |
| OK | Codec audio | aac 48000 Hz |
| OK | Première image | écart-type 49.4 — contient déjà du contenu |
| OK | Plans figés > 0,9 s | aucun |
| OK | Loudness intégrée (MP4) | -14.2 LUFS (cible −14 ±1) |
| OK | True peak (MP4 encodé) | -3.5 dBTP (≤ −1) — dans la cible |
| OK | Son des 2 premières secondes | -12.4 LUFS momentané vs -14.3 sur le reste |
| OK | Équilibre pour haut-parleur de téléphone | 40 % de l énergie sous 150 Hz, 9.7 % entre 1 et 5 kHz |

Planche zones sûres : `9x16-presentev10-safe.png` (rouge = interdit aux textes, logos, CTA).

## Lecture des deux alertes (vérifiées image par image sur le MP4)

- **Zones sûres.** Aucun texte, logo ni CTA dans une marge :
  - 13,50–13,75 s : traînées de flou des cartes qui sortent ;
  - 33,25–34,50 s : mur d'annonces en perspective, plein cadre, sous « Et pour les trouver » ;
  - 37,75–38,50 s : points du radar ;
  - 59,25–59,50 s : arrière de la Polo, à la même place qu'à l'image 0 (la boucle retombe exactement dessus).
- **Image vide à 8,25 s.** C'est la grosse couleur orange, voulue, qui couvre l'écran entre l'accroche et le collage du lien.
- **Coutures du rendu en 3 morceaux** (images 594–596 et 1189–1191) : écart d'une image à l'autre identique au reste du plan,
  aucune saute.
