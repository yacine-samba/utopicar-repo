# Style guide — UTOPICAR, film explicatif 60 s (v5)

Référence 3 : film explicatif d'une application web, 77,6 s, 1920×1080, 25 i/s, fourni par l'utilisateur (fichier).
Analyse : `python3 scripts/analyze-ref.py refs/reference3.mp4` + analyse audio. **On reprend la grammaire, jamais le
contenu** : aucun logo, texte, photo, interface ni son de la référence. La référence reste hors du dépôt (`refs/` ignoré).

## Ce que dit la référence

| Élément | Constat |
|---|---|
| Palette | Blanc `#FFFFFF` (50 %) avec **grille très pâle**, texte presque noir `#201F1F`, **un seul accent saturé** (≈ 5 %) utilisé en **aplat plein cadre** aux moments clés, fin sur fond sombre. |
| Ouverture | Problème en 3 phrases courtes centrées (« … partout… », « … », « Zéro … ») au milieu d'**icônes qui flottent** en profondeur (flou), puis « À nous de changer ça » → **flash plein cadre de l'accent** avec le logo. |
| Chapitres | Chaque fonction s'ouvre sur un **mot géant gris très pâle** en fond + un **petit titre gras** centré + un **interrupteur** que le **curseur** vient basculer. |
| Démos | Vraie interface en cartes blanches à ombre douce, le **curseur** montre, clique, glisse ; caméra qui pousse lentement. |
| Chiffres | **Énorme chiffre** + mot, en partie coloré par l'accent, au milieu de cartes d'UI floues qui dérivent (« +99 … », « 0 … »). |
| Comparaison | « Sans / Avec » sur **fond sombre**. |
| Récap | Trois phrases courtes « Tu … / Tu … / Tu … », la dernière sur **l'aplat d'accent**. |
| Fin | Fond sombre, **cartes d'UI qui explosent** vers la caméra, puis **pastille logo** que le curseur clique. |
| Typo | Grotesque ; phrases en **deux graisses** (début léger gris, fin grasse noire) ; lettres qui apparaissent **une à une** (frappe). |
| Transitions | Coupes franches, flash d'aplat, éléments qui sortent en mouvement. Aucun fondu enchaîné. |
| Rythme | Plans longs (≈ 6 s) mais un événement toutes les 1–2 s dans le plan. |
| Son | Pop électronique légère ≈ 118 BPM, percussions nettes (62 % percussif), accords majeurs lumineux, −13 LUFS. |

## Adaptation UTOPICAR (9:16, 60 s)

- **Logo** : le logo fourni par l'utilisateur (tuile sombre `#1A1310`, voiture blanche, flèche orange), retracé en vecteur
  dans `assets/brand/logo.svg` (le fichier source n'était disponible que comme image).
- **Accent** : l'orange du logo `#FF5A1F` (texte sur orange `#1A1310`) en aplat plein cadre (flash logo, « Tu revends »),
  interrupteurs, pastille de fin. Les mots d'accent sont soulignés d'un **surligneur orange** ; sur l'UI, surligneur orange
  clair `#FFC4A8` en multiplication. Le jaune reste celui des boutons du vrai produit, jamais repeint.
- **Fonds** : blanc + grille 90 px `rgba(12,15,20,.045)` ; fond sombre `#0C0F14` (l'encre du site) pour Sans/Avec et la fin.
- **Typo** : Archivo (la police du site), phrases 76 px en 400 gris `#9AA1AD` + 800 encre `#0C0F14` ; mots géants de
  chapitre 300 px 800 `#F0F1F3` ; chiffres géants 230 px 800 largeur 125 %.
- **Interface** : vraies captures (données démo) posées en cartes blanches, ombre `--sh3` du site ; jamais redessinées.
  Les chips flottantes de l'ouverture sont de vrais morceaux d'UI (plaques, tags, prix), pas des logos de plateformes.
- **Curseur** : flèche noire bord blanc, déplacements en springs `snappy`, clic = enfoncement court.
- **Format** : 1080×1920, 30 i/s, 60 s. Grille 120 BPM (mesure = 2 s) : chaque idée commence sur un downbeat.
- **Son** : musique originale 120 BPM (pop électronique claire, la majeur), synthétisée en code ; clics et frappes du
  curseur en SFX ; mix −14 LUFS / −1 dBTP.
- **Zones sûres TikTok** : textes entre y 300 et 1450, rien d'essentiel à droite de x 940.
