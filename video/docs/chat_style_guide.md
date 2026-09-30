# Style guide — UTOPICAR, film « conversation » 60 s (v6)

Référence 4 : film promotionnel d'une messagerie d'équipe, 66,7 s (contenu jusqu'à ≈ 52 s), 1920×1080, 60 i/s, fourni
par l'utilisateur (fichier). Analyse : `python3 scripts/analyze-ref.py refs/reference4.mp4` + analyse audio.
**On reprend la grammaire, jamais le contenu** : aucun logo, texte, photo, interface ni son de la référence.
La référence reste hors du dépôt (`refs/` ignoré).

## Ce que dit la référence

| Élément | Constat |
|---|---|
| Palette | Blanc chaud / pastels (menthe `#E9F5EB`, rose `#F9E3FA`, lilas `#DCB2F1`) + **une couleur de marque profonde** (aubergine `#470651`) en plein cadre pour les phrases. Noir pour une pause. |
| Ton | **Conversation directe avec le spectateur** : phrases courtes tapées mot à mot (« Bon ok », « J'ai 45 secondes… », « Mais c'est pas tout », « Mais en attendant… »). |
| Ouverture | Barre de recherche tapée au curseur sur fond clair, clic → coupe sur l'aplat profond. |
| Logo | Pop du logo au centre, puis **anneau d'éléments** reliés au logo par des traits. |
| Interface | Fenêtres **inclinées en perspective** qui glissent, **pastille flottante** qui vient se poser dessus ; panneaux **par couleur pastel** (un par fonction) avec l'UI et le curseur qui clique ; recherche tapée avec résultats. |
| Motifs | **Essaim de bulles** qui s'écoule et tourne autour d'un élément central ; **macro** sur la forme du logo ; **anneau d'icônes** ; **kaléidoscope** des couleurs de marque avant la fin. |
| Rythme | Coupe toutes les ≈ 2,6 s, très sur les temps ; une **pause noire** avant le dernier acte. |
| Fin | Logo + **bouton d'appel à l'action** que le curseur clique. |
| Son | Pop enjouée ≈ 129 BPM, claps, pizzicati/plucks, −13,6 LUFS ; silence sur la pause noire. |

## Adaptation UTOPICAR (9:16, 60 s)

- **Logo** : le logo fourni par l'utilisateur (tuile sombre, voiture blanche, flèche orange), retracé en vecteur
  (`assets/brand/logo.svg`).
- **Couleur profonde** : le noir chaud du logo `#1A1310`, en **aplat uni** (pas de dégradé derrière les phrases).
  **Accent** : l'orange du logo `#FF5A1F` (mots clés, anneau-minuteur, pastilles). Fond clair : blanc chaud `#FFF8F4`.
- **Pastels par fonction** : ceux du vrai site — `--gain-soft #E4F6EC` (rapport), `--plaque-soft #EAEFFF` (parc),
  `--att-soft #FFF2DA` (tableau de bord), pêche `#FFE6DB` (recherche, dérivée de l'orange).
- **Typo** : Archivo ; phrases 92 px 800 blanc sur l'aplat, mot clé en orange ; légendes 46 px 700 encre.
- **Interface** : vraies captures (données démo), fenêtres inclinées en CSS 3D (perspective), curseur noir.
  La frappe dans le champ de recherche réutilise le vrai champ capturé, avec la police et la taille du site.
- **Format** : 1080×1920, 30 i/s, 60 s, grille 128 BPM (mesure = 1,875 s ; 32 mesures = 60 s).
- **Son** : musique originale 128 BPM (pop enjouée, fa majeur), synthétisée en code, silence sur la pause noire ;
  frappes et clics en SFX ; mix −14 LUFS / −1 dBTP.
- **Zones sûres TikTok** : textes entre y 300 et 1450, rien d'essentiel à droite de x 940.
