# Style guide — UTOPICAR, pub TikTok 15 s

Aucune vidéo de référence : la grammaire vient de l'interface réelle d'UTOPICAR
(assets/site/utopicar-live.html) et des contraintes TikTok.

## Palette (tokens réels du site)
| Rôle | Hex | Usage dans le film |
|---|---|---|
| Scène (fond du film) | `#0C0F14` (ink) | fond sombre derrière l'UI, fait ressortir l'écran clair |
| Surface UI | `#F2F4F7` / `#FFFFFF` | l'interface reste en thème clair, comme sur le site |
| Texte UI | `#0C0F14`, `#394150`, `#667085` | inchangés |
| **Accent unique** | `#FFC928` (jaune) + bord `#E5AE00`, texte `#1A1400` | marque, soulignements, CTA, logo |
| Plaque (secondaire marque) | `#2447D6` / plaque EU `#1D3FA6` | uniquement là où l'UI l'utilise (plaque, liens) |
| Sémantique gain | `#0A8F55` sur `#E4F6EC` | GO, marge positive, données de l'UI uniquement |
| Sémantique perte | `#D93A3A` sur `#FDECEC` | NO GO, marge négative, données de l'UI uniquement |

Justification : le jaune est le seul accent graphique du film. Le rouge et le vert
ne servent qu'aux verdicts et montants affichés par l'outil, jamais comme décoration.

## Typographie
- Police unique : **Archivo** (variable, largeur 62–125 %, graisse 400–800), servie en local
  (assets/site/Archivo-latin.woff2).
- Display (titres à l'écran) : Archivo, `font-stretch:125%`, graisse 800, tracking −0.03em,
  corps 104–128 px en 1080x1920. Chiffres en `tabular-nums`.
- UI : Archivo à `font-stretch:100%`, telle que rendue par le site (aucun restylage).
- Montants : format français réel de l'outil (`9 500 €`, `−1 200 €`).
- Taille minimale d'un texte lisible : 48 px en 1080 px de large, soit 16 px à 360 px.

## Rythme et plans
- 120 BPM : 1 beat = 0,5 s, 1 mesure = 2 s. 15 s = 30 beats, downbeats à 0, 2, 4…, 14 s.
- Une nouvelle information toutes les 1 à 2 s ; un nouveau payoff à chaque downbeat.
- **Idée structurelle : un seul conteneur ne coupe jamais.** L'écran du téléphone
  (coins 44 px) reste à l'image du début à la fin et morph entre les états réels de l'outil :
  ticket NO GO → rapport → Recherche en direct → Tableau de bord → carré jaune du logo.
- Aucun crossfade entre scènes : les changements passent par le morph du conteneur,
  des scrolls réels de l'UI et des zooms caméra.

## Transitions
- Morph de conteneur (position, taille, rayon) en spring `default`, whoosh léger.
- Scroll vertical de l'UI en spring `default` (on voit la vraie page défiler).
- Zoom caméra sur une zone clé (ticket, montant) en spring `heavy`.
- Entrée des lignes de calcul : translation de 24 px + opacité, décalées d'un beat ou d'un demi-beat.

## Mouvements de caméra et d'interface
- Caméra 2D : échelle 1,0 → 1,6 max sur les chiffres clés, légère parallaxe du téléphone
  (±6 px) calée sur les beats, pas de rotation.
- Curseur tactile : pastille 64 px blanche à 85 %, pression = échelle 0,86 en `snappy` et clic.
- Anneau de note (/100) : se remplit en `heavy` ; le chiffre compte en entiers.
- Montants : compteur déterministe qui s'arrête pile sur un beat.

## Texte à l'écran
- Titres display au-dessus du téléphone, alignés à gauche à x = 72 px, jamais centrés sur un dégradé.
- Entrée : masque de ligne (slide vers le haut de 100 % de la hauteur de ligne) + opacité, spring `heavy`, sans rebond.
- Sortie : slide vers le haut de 40 % + opacité, avant le morph suivant.
- Un mot clé par titre peut porter un soulignement jaune de 12 px qui se trace en `snappy`.

## Texture, contraste
- Pas de grain, pas de glow, pas de particules. Contraste net : UI claire sur scène sombre.
- Ombre du téléphone : celle de l'UI (`--sh3`), sans halo coloré.

## Zones sûres TikTok (1080x1920)
- Haut : 0–160 px vide. Bas : 1500–1920 px sans info critique (légende et CTA TikTok).
- Droite : 940–1080 px sans texte (boutons like, commentaire, partage).
- Zone utile des titres : x 72 → 900, y 180 → 560. Téléphone : y 560 → 1480.

## Son
- Musique originale 120 BPM : kick sec, basse courte, hi-hat, pas de nappe.
- SFX : impact sur le hook (0 s), hit sur le verdict (1,0 s), clics sur les pressions,
  whoosh sur chaque morph, pops sur les lignes de calcul, thump sur le logo (12 s).
- Mix : −14 LUFS, true peak ≤ −1 dBTP. Le film doit rester compréhensible sans le son.
