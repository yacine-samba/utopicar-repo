# Brief : PS1, vidéo test problème → solution (« La Classe A en vente trois fois »)

Demande du 11 octobre 2026 : une vidéo problème → solution bien tournée, en test, avant d'en faire plusieurs.
Choix de l'utilisateur : la Mercedes en vente trois fois, environ 22 s, voix de Simon générée.

```
Format : 9:16, 1080×1920, 30 i/s, 19,4 s          Voix : Simon (mvhJVdVoTWVUtL4keT7W), eleven_v4, 2 prises
Musique et bruitages : ceux de master60, 0 crédit    Crédits voix : estimation ≈ 700, facturé 0 (affiché par ElevenLabs)
Film : film-c7/?hook=PS1 (même moteur que les motions c7), timeline-c7.json, audio/c7-musique.json
```

## Script (art-du-hook, Stop Slop, pauses et onomatopées comme master60)

| Temps | Voix | Image |
|---|---|---|
| Problème 0 → 2,3 s | Tu craques pour cette Classe A. | L'annonce entre déjà en mouvement, le cœur se remplit, le prix 19 990 € surligné |
| 2,3 → 5,9 s | Elle est en vente trois fois… à trois prix. (rire) | Zoom arrière : la même annonce sort deux fois de derrière elle ; trois étiquettes tombent : 17 990 € Bretagne, 19 990 € cette annonce, 21 990 € Tarn |
| 5,9 → 7,2 s | Tu prends celle du milieu ? | Portail par l'étiquette du milieu ; le curseur va vers « Appeler » |
| 7,2 → 10,0 s | Tu perds 2 700. (soupir) Pfff. | Coupe sur le rouge avant le clic ; le calcul ligne par ligne, la musique s'arrête sur « 2 700 » |
| Solution 10,0 → 13,4 s | Avant d'appeler, tu colles l'annonce dans UTOPICAR… | Glissé orange, le lien s'écrit, clic sur Analyser, le logo se construit ; la musique revient étouffée |
| 13,4 → 15,9 s | et bam : ton prix max, 16 500. | Drop. La vraie analyse : 43 sur 100, « À creuser », l'alerte « même voiture dans 2 autres annonces » ; le prix roule de 19 990 à 16 500 € |
| Fin 15,9 → 19,4 s | Trois jours offerts. Lien en bio ! | Portail par le chiffre ; carton orange, logo, « Lien en bio · sans carte bancaire » |

Hook : scène (une Classe A précise), miroir (« tu craques »), écart (trois prix pour la même voiture), perte chiffrée
avant 8 s. Texte à l'écran : « Tu craques » puis « 3 fois. ».

## Chiffres (tous sourcés)

Vraie annonce analysée par l'app le 10 oct. 2026 (rapport `1b8f9bad`, voir `script-master60.md`) : Mercedes Classe A
180d AMG Line, 2018, 96 000 km, 19 990 €. Note 43/100, « À creuser ». Revente normale (1 à 2 mois) 18 600 € ; frais
comptés par l'outil : travaux 500 €, carte grise 427 €, trajet 233 €, frais 150 € ; au prix affiché : − 2 700 €. Prix à
ne pas dépasser 16 500 €. Même voiture vue dans 2 autres annonces, à 17 990 € et 21 990 €.
Mention à l'écran : « Vraie annonce (Classe A 180d, 2018, 96 000 km), analysée par UTOPICAR le 10 oct. 2026 ».

## Son

Mesure 4 sur l'image 0 ; arrêt de bande sur « 2 700 » (7,95 s) ; retour étouffé sous « Avant d'appeler » (10,05 s) ;
drop sur « bam » (13,40 s) ; coup final sur le carton (15,85 s).

## Fabrication

```
python scripts/vo-c7-mots.py PS1 ; python scripts/vo-c7-pose.py PS1      # prise imM8 (« trois jours offerts » bien dit)
python scripts/build-c7.py ; node scripts/cues-c7.mjs PS1 ; ID=PS1 python scripts/audio-c7.py
CUT=c7 HOOK=PS1 MB=8 PARTS=3 PART=0|1|2 node scripts/render.mjs --all ; CUT=c7 HOOK=PS1 PARTS=3 node scripts/render.mjs --assemble
```
