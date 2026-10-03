# Référence 5 — grammaire mesurée image par image

Source : vidéo produit SaaS fournie par l'utilisateur (`refs/ref5/`, hors dépôt). On n'en reprend **que la grammaire** :
ni logo, ni texte, ni gag, ni image, ni musique.
Analyse : `python3 scripts/ref-frames.py refs/ref5/gojiberry.mp4 --step 0.1` (60 i/s, 4 246 images lues une à une),
puis lecture des 8 planches à 0,1 s, des 4 bandes de coupe et de 18 images clés en 640 px.

À noter : le fichier de sous-titres déposé avec la vidéo (`captions.vtt`) ne correspond pas à cette vidéo : il vient
d'un autre film, en français. La voix de la référence est en anglais (langue détectée à 100 %). Une première passe en
français forcé avait donné une *traduction* : d'où l'option `--lang auto` par défaut.

## Ce que fait la référence (mesuré)

| Sujet | Mesure | Ce qu'on en retient |
|---|---|---|
| Format | 1920×1080, 60 i/s, 70,8 s, −16,2 LUFS, musique ≈ 108 BPM | — |
| Montage | **4 coupes franches seulement**, mais **33 scènes** : une nouvelle scène toutes les 2,14 s (médiane 1,55 s) | Le film est un **plan-séquence** : tout s'enchaîne dans le mouvement |
| Hook 0–8 s | 10 scènes en 8 s (une toutes les 0,8 s) : 0,17 · 1,13 · 1,25 · 1,80 · 2,20 · 3,32 · 4,70 · 6,37 · 7,47 s | La densité est maximale au début, puis le film respire |
| Premier son | Premier mot à **0,00 s**. Ce n'est pas le narrateur : c'est un **personnage** qui hésite (« Hmm… », « okay… », « sent. ») | Le hook est une **scène vécue**, pas une promesse |
| Onomatopées | Le « Mmh.. » du personnage s'écrit lettre à lettre en haut du cadre (0,15 → 0,50 s) ; plus loin « Ohhh! » (6,8 → 7,3 s) | La réaction humaine est **écrite** autant que dite |
| Rupture | 2,05 s : aplat bleu plein cadre « Sent » (1 mot, blanc, centré), 0,85 s | Un aplat de couleur = un temps fort, une action terminée |
| Humour | La question ironique du narrateur (4,8 → 5,7 s) est suivie de **3,34 s sans voix** (la plus longue pause), puis la chute arrive en image : la réponse reçue + « Ohhh! » | Le gag se joue **dans le silence**, l'image fait la chute |
| Typo cinétique | Chaque phrase de la voix s'écrit **mot à mot, au mot près** : flou + montée + gris clair → encre en ≈ 0,15 s ; 1 ou 2 mots clés en couleur d'accent | Sous-titre = élément graphique principal, centré, une ligne |
| Transitions sans coupe | 1) traînée verticale (smear) d'une carte (10,95 → 11,05 s) ; 2) **zoom à travers un mot** (« to » grossit jusqu'à remplir l'écran, 21,65 → 21,85 s) puis explosion dessinée → logo ; 3) dézoom en profondeur des cartes pendant que la phrase suivante s'écrit ; 4) chiffre géant qui glisse latéralement avec **lignes de vitesse** et flou (57,5 → 59,0 s) ; 5) aplat plein cadre | 5 familles, jamais de fondu enchaîné |
| Caméra | Jamais fixe : dérive lente 80–200 px/s, cartes d'interface en **perspective 3D inclinée**, profondeur de champ (arrière-plan flou) | La caméra respire en continu |
| Graphismes | Cartes UI flottantes à ombres douces, avatars ronds, **radar concentrique** autour du logo, pastilles pleines avec un mot, cartes-icônes inclinées avec point rouge de notification, courbe en vague | Formes simples, une idée par objet |
| Contraste de style | Effets **dessinés à la main** (flammes 2D) au milieu d'une UI très propre, aux 3 moments clés (révélation de marque, chiffre, CTA) | La surprise vient du changement de matière |
| Palette | Problème : blanc froid et bleu (#ECECEB, #D1E2F0). Solution : rose → pêche chaud (#F9E9E6, #FBDAD1), accent rouge-orange | **La palette bascule à la révélation de la marque** (22 s) |
| Fond | Blanc avec une grille de carrés très pâles (≈ 3–5 % de contraste) | Texture discrète qui donne la profondeur et le mouvement |
| Voix | 2,40 mots/s (parole pure 3,16), **25 pauses > 0,3 s** (médiane 0,48 s), 1,5 s avant la marque. Phrases expressives : 9–16 demi-tons d'amplitude ; phrases de chute (« It's time to change. », « Try … now. ») plates : 1,6–2,2 demi-tons | Expressif pour raconter, **plat et posé pour affirmer** |
| Bruitages | 26 hors voix (≈ 1 toutes les 2,7 s) : 13 souffles / whoosh sur les grands déplacements, 13 pops / frappes médium (900–1 900 Hz) sur les apparitions et les clics. **Aucun sur un mot** | Le son dessine le mouvement, il ne couvre jamais la voix |
| Fin | Logo + phrase + bouton, le curseur entre, clique, éclat dessiné (68,6 s), tenue 5 s | CTA **cliqué à l'écran** |

## Adaptation UTOPICAR (film `mo3`)

| Grammaire | Chez nous |
|---|---|
| Hook = scène vécue par un personnage | Simon, marchand VO, **sur le point d'acheter** : il hésite à voix haute, on lit ses « Mmh… » |
| Aplat plein cadre sur l'action | Aplat orange `#FF5A1F` « Acheté. » (ou « Signé. ») au clic |
| Chute dans le silence | Après l'achat, 1,5–2 s sans voix : le ticket du garage tombe, les frais s'empilent, le compteur plonge |
| Typo cinétique mot à mot | Archivo 800, encre `#0C0F14`, gris `#B8BEC8` → encre, mot clé en orange ; calée sur les mots de Simon (transcription Scribe) |
| Plan-séquence, 5 transitions | Traînée, zoom à travers un mot, dézoom en profondeur, chiffre géant avec lignes de vitesse, aplat |
| Bascule de palette à la marque | Problème : blanc froid / gris bleuté. Solution : crème chaud `#FFF6EF` → pêche, accent orange du logo |
| Effet dessiné aux 3 moments clés | **Éclats de stylo orange** (traits tracés, pas de flammes) : révélation du logo, chiffre clé, clic du CTA |
| Graphismes | Vraies cartes UTOPICAR en perspective, radar des annonces, pastilles « GO » / « NO GO », réglette du plafond |
| Fond | Blanc + grille de carrés pâles, en 9:16 |
| Son | Whoosh sur chaque transition, pop sur chaque carte, clic réel, aucune attaque sur un mot ; musique 108 BPM légère sous la voix |
| Fin | Logo officiel + « Commente DÉBUTANT ou PRO », le curseur clique la pastille, éclat orange |

Interdits rappelés : pas d'insulte ni de réponse d'un prospect (gag de la référence), pas de LinkedIn ni d'autre
plateforme à l'écran, pas de flammes, pas de « It's time to change » ni de tournure traduite.
