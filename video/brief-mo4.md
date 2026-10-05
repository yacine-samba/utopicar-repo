# Brief : MO4, motion fluide de 15 s sans voix

Demande : « analyser une à une les références de motion plus fluides que ce que nous faisons, puis créer un motion
sans voix, qui parle de lui-même, de 15 s maximum, pour utopicar. Design inspiré de l'interface actuelle du repo et
d'utopicar.fr. »

Analyse des références : `docs/ref_motion_fluide.md`, avec les mesures de fluidité et la comparaison avec nos films.

| | |
|---|---|
| Produit | utopicar.fr : l'outil qui analyse une annonce de voiture d'occasion |
| Public | acheteurs d'occasion et débutants en achat-revente, sur TikTok |
| Promesse | vous collez l'annonce, l'outil vous dit si c'est une bonne affaire et quel prix proposer |
| Format | 9:16, 1080×1920, 60 i/s, 15,0 s, en boucle (la dernière image rejoint la première) |
| Voix | aucune : musique et bruitages seulement, textes à l'écran en français |
| Interface | la vraie démo du site (`web/src/components/accueil/Demo.tsx`) et le formulaire de `/analyse` |
| Données | la vraie annonce Clio de la démo du site, analysée par l'outil le 3 octobre 2026 |
| Charte | celle du site (`web/src/app/globals.css`) : fond #0b0a09 → #17100b, orange #ff5a1f / #ff8a4c / #ffb38a, Clash Display, Satoshi, Instrument Serif en italique dégradé pour le mot mis en avant |
| CTA | « Estimer une affaire → » et utopicar.fr, comme la fin de la page d'accueil |

## Pourquoi la Clio

La démo du site propose trois annonces. Les photos de la 208 et de la Yaris portent un filigrane de plateforme et des
plaques de concessionnaire. Celles de la Clio n'en ont pas et la plaque est floutée. La Clio rouge attire l'œil. Sa
fiche contient tout : un verdict (« Bon prix », 8/10), les défauts repérés dans le texte, et un prix à proposer
inférieur au prix affiché (6 250 € au lieu de 6 700 €).

## La mention

Les chiffres ne sont pas des données de démonstration : c'est une vraie annonce passée dans l'outil. La mention reprend
donc celle du site, raccourcie : « Vraie annonce Leboncoin du 3 octobre 2026, analysée par l'outil. Chiffres arrondis. »
Le mot « Leboncoin » apparaît en texte, comme sur le site ; aucun logo de plateforme à l'écran.

## Ce qu'on reprend des références (grammaire mesurée)

- **Une chaîne sans coupe** : l'annonce devient le champ « Lien de l'annonce », le bouton devient la fiche, le prix à
  proposer devient le point orange de la fin.
- **Une caméra qui ne s'arrête jamais** : avancée lente, rotation 3D légère, gros plan oblique sur la liste des
  vérifications. Aucune pause de plus de 0,6 s avant le plan final.
- **Un vrai flou de bougé** sur les gestes rapides : 8 sous-images par image, moyennées au rendu.
- **Un doigt qui mène l'histoire** : appui long pour copier, toucher pour coller, toucher sur le bouton.
- **Des verbes courts en haut**, mot par mot, chaque mot sort du flou.
- **Le prix à proposer sort de la carte** vers la caméra.
- **La fin** : une traînée orange dessine le symbole, puis le slogan du site mot à mot. Tout se replie dans le point
  orange de départ.

Objectifs mesurables (`scripts/ref-motion.py` sur notre rendu) :

| Mesure | Références verticales | Nos films | Cible MO4 |
|---|---|---|---|
| images en mouvement | 81–94 % | 22–40 % | ≥ 80 % |
| plus longue pause | 0,5–1,5 s | 2,1–3,5 s | ≤ 0,8 s, hors plan final |
| à-coups | 0,09–0,10 | 0,14–0,26 | ≤ 0,12 |
| flou de bougé | 0,22–0,49 | 0,71–0,95 | ≤ 0,6 |

## Découpage (120 BPM : un temps = 0,5 s, une mesure = 2 s)

| t (s) | Texte en haut | Image | Son |
|---|---|---|---|
| 0,00–0,50 | — | Le point orange éclate (onde fine). La carte « Annonce Leboncoin » jaillit du point, inclinée, floue de vitesse, et se pose : photo de la Clio rouge, « 3 photos », titre, **6 700 €**, kilométrage, texte du vendeur. | éclat + souffle, premier temps |
| 0,50–2,00 | « Bonne affaire / ou *piège ?* » mot par mot | La caméra avance doucement et tourne de quelques degrés. À 1,55 s, un doigt entre et fait un appui long sur la carte : un anneau se remplit autour du doigt. | un tic par mot, son d'appui qui monte |
| 2,00–3,50 | « Collez l'annonce. » | La carte se replie dans le champ « Lien de l'annonce Leboncoin » : la photo rétrécit dans le champ et l'adresse s'écrit. Le bouton « Analyser ce lien » passe du gris à l'orange. Le doigt le touche à 3,25 s, onde au toucher, le bouton s'enfonce. | souffle, frappe, pop, clic |
| 3,50–6,00 | « L'outil vérifie tout. » | Le bouton s'ouvre en « Fiche Utopicar · Analyse en cours… ». Gros plan oblique qui descend la liste. Les 4 vraies étapes se cochent une par temps (4,0 / 4,5 / 5,0 / 5,5 s) : lecture du texte et des photos, cote du marché, 38 défauts, prix à proposer. | souffle, 4 pops qui montent d'un ton |
| 6,00–7,50 | « Vous savez quoi *proposer.* » | La caméra recule sur la fiche entière. L'anneau se remplit jusqu'à 8/10 (vert), « Bon prix » saute à côté, puis la phrase du verdict. | temps fort, son qui monte, ding à 8/10 |
| 7,50–9,50 | (même texte) | Les 4 lignes arrivent une par demi-temps et comptent : cote du marché 7 550 €, défauts +425 €, prix réel 7 125 €, **prix à proposer 6 250 €**. La mention apparaît en bas. | pops, tics des compteurs |
| 9,50–11,00 | (même texte) | La caméra plonge sur la dernière ligne. « 6 250 € » sort de la carte vers nous (temps fort à 10,0 s). « Prix affiché : 6 700 € » se pose au-dessus, en gris. | souffle + impact sur le temps fort |
| 11,00–12,00 | — | « 6 250 € » se replie en point orange. La traînée part du point et dessine le symbole utopicar, qui se remplit à 12,0 s. | souffle filé, impact |
| 12,00–13,50 | « Votre prochaine / voiture, *au bon prix* » mot par mot | Sous le slogan : « Première analyse offerte », puis le bouton orange « Estimer une affaire → ». | pops sur les mots |
| 13,50–14,50 | — | Le doigt touche le bouton (onde). « utopicar.fr » dessous. La caméra avance lentement. | clic, accord final |
| 14,50–15,00 | — | Tout se replie dans le point orange : la dernière image rejoint la première. | souffle inversé |

## Résultat mesuré (rendu final)

`scripts/ref-motion.py` sur `renders/9x16-mo4.mp4`, mêmes réglages que pour les références :

| Mesure | Références verticales | Nos films précédents | Cible MO4 | MO4 |
|---|---|---|---|---|
| images en mouvement | 81–94 % | 22–40 % | ≥ 80 % | **59 %** (non atteint) |
| plus longue pause | 0,5–1,5 s | 2,1–3,5 s | ≤ 0,8 s | **1,02 s** (dans la fourchette des références, au-dessus de la cible) |
| à-coups | 0,09–0,10 | 0,14–0,26 | ≤ 0,12 | **0,07** |
| flou de bougé | 0,22–0,49 | 0,71–0,95 | ≤ 0,6 | **0,52** |

Le fond du site est un aplat : seul le contenu porte le mouvement, alors que les références remplissent l'image
d'interface ou de matière. D'où le 59 % malgré une caméra qui ne s'arrête jamais.

`qa_video.py` : tout est au vert.
- −14,3 LUFS, true peak −4,0 dBTP sur le MP4.
- Son dès l'image 0, 23 % de l'énergie sous 150 Hz.
- Rien dans les zones interdites, aucune image vide, aucun plan figé.

## Livrables

- `renders/9x16-mo4.mp4` (15 s, 60 i/s, 7,2 Mo) et `renders/poster-mo4.png` (couverture : l'accroche à 1,48 s)
- `renders/qa/9x16-mo4-qa.md` et `9x16-mo4-safe.png` (contrôles du skill)
- `renders/review/mo4-final-*.png` : planche, bande du geste le plus rapide, test téléphone à 360 px, jonction de la boucle
