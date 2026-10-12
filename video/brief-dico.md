# Brief : « Le dictionnaire du vendeur » (TikTok 9:16, 33 s)

Concept 1 de `docs/concepts_motion_oct2026.md`, choisi le 11 octobre 2026 parmi les cinq. Il touche tout acheteur
d'occasion, il se décline en série (le CTA demande la prochaine phrase à traduire) et il ne recoupe pas MO8.
Fait dans la grammaire du film « wow » (master60w), dont il reprend le moteur, la voix, la musique et les bruitages.

```
Produit : UTOPICAR (analyse d'annonce)         Objectif : vues, partages, commentaires (série)
Public : débutants en achat-revente, et tout acheteur d'occasion (filtre 3C)
Format : 9:16, 1080×1920, 30 i/s, 33,0 s       Voix : Simon (ElevenLabs mvhJVdVoTWVUtL4keT7W), eleven_v4, comme master60
Musique et bruitages : ceux de master60 (ElevenLabs, déjà générés), 0 crédit
CTA (dit et écrit) : « Écris-le, je te le traduis. » / « Écris ta phrase en commentaire »
Données : fourchettes de la grille de coûts de l'outil (web/src/lib/analyse/defauts.ts) ; fiche 208 en démo
```

## Voix (texte passé au Stop Slop, avec onomatopées, pauses et respirations comme master60)

```
[sarcastic] « Juste un voyant… rien de grave. » [short pause] Dans une annonce, cette phrase peut te coûter mille cinq
cents euros. [pause] [chuckles] Allez, je te traduis le vendeur. [short pause] « Petit bruit au démarrage »… [curious]
hmm… jusqu'à six cents. [short pause] « Embrayage un peu haut » ? [sighs] Neuf cents. [short pause] « Clim à
recharger » ? Quatre cent cinquante, au pire. [pause] Tu additionnes… pfff… trois mille quatre cent cinquante euros.
[pause] Moi, je colle l'annonce dans UTOPICAR… et bam : chaque phrase a son prix. Avant d'appeler. [short pause] Et
toi, t'as lu quoi ? [laughs] Écris-le, je te le traduis.
```

Deux prises (0 crédit facturé, comme les prises v4 de master60). Prise 1 retenue sur mesure : « rien de grave » fini
à 1,7 s (2,3 s pour la prise 2), « t'as lu quoi » bien prononcé, aucune balise lue, 30,9 s, 2,4 mots/s, plage de
hauteur 19,7 demi-tons. Onomatopées repérées hors des mots : petit rire 6,26 s, « hmm » 10,41 s, soupir 13,94 s,
« pfff » 20,25 s, rire 28,65 s.

## Chiffres

| Phrase | Ligne de la grille de coûts | Fourchette | Dit |
|---|---|---|---|
| « Juste un voyant, rien de grave » | Voyant allumé, panne non diagnostiquée | 100 à 1 500 € | 1 500 € |
| « Petit bruit au démarrage » | Bruit signalé, origine inconnue | 100 à 600 € | jusqu'à 600 € |
| « Embrayage un peu haut » | Embrayage à changer | 500 à 900 € | 900 € |
| « Clim à recharger » | Climatisation à recharger ou réparer | 80 à 450 € | 450 €, au pire |
| Total des maximums | | | 3 450 € |

L'écran écrit « jusqu'à » au-dessus de chaque prix, et la mention « Fourchettes de la grille de coûts UTOPICAR ».
La fiche de la fin est la fiche 208 de démonstration (mention « Données de démonstration »).

## Déroulé

| t | Voix | Image |
|---|---|---|
| 0,0 | « Juste un voyant… rien de grave. » | Crème. La phrase en italique géant, le surligneur file sous « rien de grave ». |
| 2,9 | « …cette phrase peut te coûter… » | La caméra plonge dans le trait du « o » de « voyant » ; l'encre remplit l'écran. |
| 4,8 | « …mille cinq cents euros. » (petit rire) | Encre. « jusqu'à » puis 1 500 € qui roule, impact ; « hé hé… » sous le prix. |
| 7,1 | « Allez, je te traduis le vendeur. » | Volet orange. « [ le dictionnaire du vendeur ] ». |
| 8,9 | « Petit bruit au démarrage… hmm… » | Crème, « hmm… » ondule, plongée dans le « b » de « bruit ». |
| 11,2 | « …jusqu'à six cents. » | Encre, 600 € roule. |
| 12,6 | « Embrayage un peu haut ? (soupir) » | Crème, les mots s'affaissent sur le soupir, plongée dans le « b ». |
| 14,5 | « Neuf cents. » | Encre, 900 €. |
| 15,6 | « Clim à recharger ? » | Crème, plongée dans le « e ». |
| 16,9 | « Quatre cent cinquante, au pire. » | Encre, 450 €, « au pire. » |
| 18,3 | « Tu additionnes… pfff… » | Volet orange, les quatre étiquettes tombent une par temps ; arrêt de bande, « Pfff… » s'affaisse. |
| 20,8 | « …trois mille quatre cent cinquante euros. » | Encre, 3 450 € dans le silence, impact. |
| 22,2 | « Moi, je colle l'annonce dans UTOPICAR… » | Volet crème, le lien s'écrit dans le champ, le logo s'assemble, clic sur Analyser. |
| 24,5 | « …et bam : chaque phrase a son prix. Avant d'appeler. » | Cercle crème, « Bam. », drop ; la vraie fiche monte, les quatre étiquettes s'y engouffrent sur la ligne des travaux. |
| 27,4 | « Et toi, t'as lu quoi ? (rire) » | Encre, une bulle de commentaire qui s'écrit. |
| 29,3 | « Écris-le, je te le traduis. » | Cercle orange, logo, coup final de la musique, bouton « Écris ta phrase en commentaire » cliqué. |

## Son

Musique de master60 : mesure 4 sur l'image 0, arrêt de bande juste avant le « pfff », silence pendant le total,
souffle inversé jusqu'à « bam », drop (mesure 16) sur « bam », coup final (mesure 24) sur le logo. Bruitages de
master60 posés sur les 43 repères que publie le film. Rapport : `docs/mix_report-dico.txt`.

## Chaîne de fabrication (depuis video/, branche claude/master60)

```
python scripts/vo-dico-mots.py                 # mots horodatés des prises (faster-whisper medium)
node scripts/cues-dico.mjs                     # repères sonores du film → audio/cues-dico.json
python scripts/audio-dico.py                   # mix → audio/mix-dico.wav, stems, rapport
CUT=dico PARTS=3 PART=0|1|2 node scripts/render.mjs --all ; CUT=dico PARTS=3 node scripts/render.mjs --assemble
```
`CHROMIUM=<chrome.exe>` si la version de Chromium attendue par Playwright n'est pas installée.
