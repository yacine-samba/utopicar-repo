# Style guide — UTOPICAR, film de lancement 15 s (v3)

Référence 1 : film de lancement produit de 26,6 s (1920×1080, 24 i/s), fourni par l'utilisateur.
Analyse : `python3 scripts/analyze-ref.py refs/reference1.mp4` (images à 0,5 s, plans, palette, mouvement)
et analyse audio (loudness, spectre, attaques). **On reprend la grammaire, jamais le contenu** : aucun logo,
texte, personnage, plan ou son de la référence n'est réutilisé. La vidéo et ses images restent hors du dépôt.

## Ce que dit la référence

| Élément | Constat |
|---|---|
| Palette | Monochrome strict : `#040404`, `#080808`, `#121112`, `#1E1E1E`, `#2D2C2D`, `#413F40`, `#5A5758`, `#7E7B7D`, `#B2AEB1`, `#E7E7E8`. Aucune couleur d'accent. Alternance de scènes sombres et de scènes gris clair. |
| Rendu | 3D abstraite mate (sphères, anneaux, blocs, cubes), éclairage doux et large, profondeur de champ forte (avant-plans flous), bokeh, halo (bloom) autour des sources, vignettage, grain de film visible. |
| Typo | Deux voix : un mot d'accroche **gras, sans-serif, gris clair avec halo** (le mot d'introduction, puis le logo) ; les phrases en **sans-serif très fine et oblique**, petite, centrée, gris clair sur sombre ou gris foncé sur clair, **espacement des mots large**, pas de tracking serré. |
| Entrée du texte | Mot à mot, chaque mot sort du flou (flou → net + opacité + léger glissement), décalage d'environ 0,15–0,25 s ; le dernier mot est encore flou quand les premiers sont nets. |
| Sortie du texte | Toute la ligne repart dans le flou avec la scène, jamais de coupe sèche sur le texte. |
| Durée des plans | 3 coupes franches seulement en 26 s ; à l'intérieur, une nouvelle idée toutes les 2,5–3,5 s portée par la caméra, la mise au point ou la lumière. |
| Transitions | Passage par la lumière (flash blanc avant le logo final), par le flou (mise au point), par un mouvement de caméra qui traverse un objet. Aucun volet, aucun glitch. |
| Caméra | Travellings lents, légère orbite, rapprochements continus, bascules de mise au point. Jamais d'arrêt complet. |
| Logo | Apparition dans le noir avec halo et traînée lumineuse ; fin sur fond gris clair, logo foncé qui passe du flou au net, maintenu ~2,5 s. |
| Son | Pas de beat régulier : sound design cinématographique. Nappes tonales (ré mineur : ré, fa, la, si♭, mi), montées graves, notes cristallines sur l'apparition des mots, gros impact grave sur le logo, souffles d'air sur les mouvements, forte dynamique (−30 à −6 dB RMS), −14,9 LUFS intégrés. |

## Adaptation UTOPICAR (9:16, 15 s)

- **Format** 1080×1920, **24 i/s** comme la référence (rendu cinéma), H.264 CRF 16.
- **Palette** : monochrome de la référence. **Une seule couleur dans tout le film : le jaune UTOPICAR `#FFC928`**,
  réservé au logo final sur fond clair (dans le noir, le logo est blanc lumineux). Les extraits du site sont
  étalonnés en niveaux de gris comme le reste de l'image.
- **Rendu** : vraie 3D (Three.js), rendue image par image de façon déterministe (`window.seek(t)`), halo (bloom),
  profondeur de champ, grain de film seedé par numéro d'image, vignettage.
- **Typo** : Archivo (police du site). Accroche : Archivo 700, largeur 100 %, halo. Phrases : **Archivo 300 italique**,
  72 px dans le cadre 1080 (lisible à 360 px de large), centrées, espacement des mots 0,35 em.
- **Extraits du site** : vrais composants capturés (verdict + « Il vous reste −1 200 € », « Ne dépassez pas 7 500 € »,
  annonce Clio « 1 450 € sous la cote »), posés comme des panneaux dans l'espace 3D, éclairés et soumis à la mise au point.
- **Zones sûres TikTok** : texte entre y 300 et 1450, jamais à droite de x 940.
- **Écarts assumés avec CLAUDE.md** (demandés par l'utilisateur pour coller à la référence) : texte centré sur des
  fonds éclairés en dégradé, nappes sonores, halo lumineux sur le logo. Les autres règles tiennent : springs fermés,
  pas de rebond du texte, pas de crossfade entre scènes (transitions par la lumière, la mise au point et la caméra),
  opacité jamais seule (toujours avec flou et déplacement).
