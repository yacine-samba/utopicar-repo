# Brief : motions de 15 à 20 s (« Le dictionnaire du vendeur » court + carrousels A01 à A07)

Demande du 11 octobre 2026 : améliorer le script et le motion du « Dictionnaire du vendeur », surtout les transitions
zoom, tout ramener à 15–20 s, puis faire en motion les 7 carrousels de la semaine A (12 au 18 octobre). Voix de Simon
comme master60, musique et bruitages de master60.

```
Format : 9:16, 1080×1920, 30 i/s, 16,1 à 20,0 s     Voix : Simon (mvhJVdVoTWVUtL4keT7W), eleven_v4, 2 prises par vidéo
Musique et bruitages : ceux de master60 (ElevenLabs, déjà générés), 0 crédit
Crédits ElevenLabs : estimation 5 420 (8 voix × 2 prises), facturé 0 (affiché par ElevenLabs, à vérifier sur le compte)
Un seul film pour les 8 : film-c7/ (?hook=<id>), timeline-c7.json, audio/c7-musique.json
```

## Scripts (Stop Slop, onomatopées, pauses, respirations)

| id | Durée | Voix |
|---|---|---|
| dico2 | 20,0 s | « Juste un voyant… rien de grave. » Traduction : jusqu'à 1 500 €. « Petit bruit au démarrage » ? hmm… 600. « Embrayage un peu haut » ? (soupir) 900. Tu additionnes… pfff… 3 000 €. Je colle l'annonce dans UTOPICAR… et bam : les travaux, chiffrés avant d'appeler. T'as lu quoi, toi ? (rire) Écris-le. |
| A01 | 20,0 s | Clio à 5 900 €… et jusqu'à 10 000 € de moteur. Cinq moteurs à fuir. BMW 116i. Golf 6, TSI. Fiesta EcoBoost. Clio 4, TCe 120. Et numéro un… (soupir) la 208 PureTech. Enregistre la liste. |
| A02 | 18,4 s | Golf achetée 9 500, revendue 9 800… et tu perds 1 200 €. Sur le papier ? Plus 300. Puis les frais : remise en état, carte grise, trajet… (soupir) 1 500. Ton prix max, c'était 7 500. Commente DÉBUTANT. |
| A03 | 17,0 s | Tu vends ta 207 3 900 €. Un acheteur la prend… sans la voir. Puis un SMS : « Paiement reçu, validez vos coordonnées. » Le lien veut ta carte. (chuchoté) Pour recevoir de l'argent, personne n'a besoin de ta carte. Envoie ça à ton pote qui vend sa voiture. |
| A04 | 17,2 s | Ta première revente. Partie un. Une Clio 4 à 7 400. Avant d'appeler, ton prix max : 7 060. Au téléphone… « 7 000, et elle est à vous. » (petit rire) Tu achètes. 60 € sous ton plafond. Partie deux, samedi. |
| A05 | 19,4 s | T'habites Lille, la Clio est à Marseille. Tu gagnes 300 € en négo. Train, gazole, péages, sandwich… (soupir) 312 €. Ta négo ? Moins 12 €. Et la voiture… faut encore la revendre. (rire) Envoie ça à ton pote qui fait 1 000 km pour 300 balles. |
| A06 | 16,1 s | Ta première revente, partie deux. 640 € de frais : pile le budget. Annonce à 8 490… Cinq jours. Zéro appel. (soupir) Tu baisses ? Non. Tu changes quatre lignes. Partie trois, demain. |
| A07 | 18,8 s | Ta première revente, partie trois. Quatre lignes changées… trois appels en deux jours. « Vous faites 7 900 ? » 8 300. Pneus neufs, factures. Vendue. Plus 660 €, en douze jours. (petit rire) Le calcul du jour un, étape par étape ? Commente DÉBUTANT. |

Chiffres : ceux des carrousels de la semaine A (`carousels-semaine/carousels.json`), et pour dico2 la grille de coûts
de l'outil (`web/src/lib/analyse/defauts.ts`) et la fiche 208 de démonstration.

## Prises retenues (mesurées, scripts/vo-c7-mots.py puis scripts/vo-c7-pose.py)

Choix par transcription : texte retrouvé, puis durée, aucune balise lue. A02 : la prise oMjM (« plus 300 » ; l'autre
sonne « 3 100 »). dico2 : prise ldpO (« Utopicar » bien dit) raccordée à la fin de la CWBq (« t'as lu quoi »). Silences
au-delà de 0,26 s ramenés à une respiration, seuil à −40 dB pour garder soupirs, « pfff » et respirations. dico2 et
A01 légèrement accélérées (× 1,12 et × 1,08, ffmpeg atempo, hauteur inchangée) pour tenir 20 s.

## Motion : ce qui change

- **Portail** : la caméra fonce dans une lettre, un chiffre, un lien ou le total d'un ticket ; la scène suivante
  apparaît dans un cercle qui s'ouvre depuis ce point, déjà zoomée, puis se pose (l'élan continue).
- **Glissé de carrousel** : les écrans des carrousels passent de droite à gauche, rotation 3D ; le contenu de la slide
  est déjà en place quand elle arrive, les lignes des tickets s'allument quand la voix les dit.
- **Zoom arrière** : la phrase suivante arrive de très près et recule (dico2).
- **Vrai flou de bougé** : pendant chaque transition, 8 sous-images moyennées au rendu (MB=8) ; le flou CSS par
  élément est réduit pour ne pas flouter deux fois.

## Son

Mesure 4 de la musique sur l'image 0, arrêt de bande avant la chute, retour étouffé quand le silence serait long,
drop (mesure 16) sur le pivot, coup final (mesure 24) sur le carton. Repères dans `audio/c7-musique.json`.

## Chaîne de fabrication (depuis video/, branche claude/master60)

```
python scripts/vo-c7-mots.py                     # transcription des prises
python scripts/vo-c7-pose.py                     # prise choisie, silences, mots horodatés → audio/vo-c7/<id>.wav
python scripts/build-c7.py                       # assemble film-c7/film.js depuis _core.js et _specs.js
node scripts/cues-c7.mjs                         # repères sonores → audio/cues-c7-<id>.json
ID=<id> python scripts/audio-c7.py               # mix → audio/mix-c7-<id>.wav
CUT=c7 HOOK=<id> MB=8 PARTS=3 PART=0|1|2 node scripts/render.mjs --all ; CUT=c7 HOOK=<id> PARTS=3 node scripts/render.mjs --assemble
```
