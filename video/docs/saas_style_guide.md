# Style guide — UTOPICAR, film produit 30 s (v4)

Référence 2 : film de présentation d'un logiciel, 84 s, 3840×2160, 30 i/s, fourni par l'utilisateur (lien X).
Analyse : `python3 scripts/analyze-ref.py refs/reference2.mp4` + analyse audio. **On reprend la grammaire, jamais
le contenu** : aucun logo, texte, photo, interface ni son de la référence. La référence reste hors du dépôt.

## Ce que dit la référence

| Élément | Constat |
|---|---|
| Palette | Blanc `#FFFFFE`, crème `#FDFCF9` / `#F8F7EB`, **une couleur d'accent saturée** (≈ 14 % de l'image) en aplats plein cadre, gris chauds, texte presque noir `#252323`. |
| Ouverture / fin | Lueur ronde sur blanc → **mosaïque de carrés** de l'accent (opacités variées) avec le logo au centre → mot-symbole **tracé en pointillés / contours** puis rempli → mot-symbole **extrudé en 3D**, posé en diagonale sur une **bande d'accent**. Fin symétrique : volets diagonaux, mosaïque, logo, lueur. |
| Interface | Vraies pages du produit **survolées en 3D** (plans inclinés, flou de profondeur, travellings obliques), gros plans sur des **boutons en relief** qui s'enfoncent, **cartes d'UI épaisses** (bords visibles, ombre douce) qui flottent sur l'aplat d'accent, **téléphone** qui pivote, tableau de bord survolé. |
| Typo | Grotesque noire, graisse moyenne à grasse, centrée ; **un mot d'accent** en couleur / style différent en fin de phrase. |
| Transitions | Volets diagonaux de l'accent, passages par l'aplat plein cadre, caméra qui traverse. Aucun fondu enchaîné. |
| Rythme | Nouvelle idée toutes les 2–3 s, coupes nettes sur les temps, mouvements de caméra continus et fluides. |
| Son | Pop corporate énergique ≈ 108 BPM, percussions présentes (27 %), accords en mineur (do / mi♭), −11,7 LUFS. |

## Adaptation UTOPICAR (9:16, 30 s)

- **Accent** : le jaune UTOPICAR `#FFC928` (bord `#E5AE00`, texte sur jaune `#1A1400`). Fonds blanc `#FFFFFF` et crème `#FAF9F5`, texte `#141413`.
- **Mot d'accent** : le jaune sur blanc est peu lisible ; le mot d'accent est donc en **Archivo italique** sur un **surlignage jaune** qui se trace sous lui.
- **Mot-symbole** : contours réels d'Archivo 800 / 125 % (la police du logo), tracés puis remplis, puis extrudés en vraie 3D.
- **Interface** : vraies captures d'UTOPICAR en couleur (données démo), sur des plans 3D et des cartes épaisses ; le téléphone est un simple boîtier générique, l'écran montre la vraie page.
- **Format** : 1080×1920, 30 i/s, 30 s. Grille musicale 108 BPM (mesure = 2,22 s) : chaque idée commence sur un downbeat.
- **Son** : musique originale 108 BPM synthétisée en code, mix −14 LUFS / −1 dBTP (norme du studio, pas le −11,7 de la référence).
- **Zones sûres TikTok** : textes entre y 300 et 1450, rien d'essentiel à droite de x 940.
