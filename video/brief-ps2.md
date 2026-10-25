# Brief : PS2, problème → solution v2 (« Rembobine », la Classe A)

Retour de l'utilisateur sur PS1 (11 oct. 2026) : « le problème solution est pas ouf ». Ce qui clochait dans PS1 :
le problème mélangeait deux choses (trois annonces, puis une perte sans lien de cause), et la solution ne refermait
pas la question du hook. PS2 raconte une seule histoire, deux fois : la même annonce achetée sans l'outil, puis avec.

```
Format : 9:16, 1080×1920, 30 i/s, 26,0 s           Voix : Simon (mvhJVdVoTWVUtL4keT7W), eleven_v4, 2 prises, × 1,12
Musique et bruitages : ceux de master60, 0 crédit    Crédits voix : estimation ≈ 800, facturé 0 (affiché par ElevenLabs)
Film : film-c7/?hook=PS2, timeline-c7.json, audio/c7-musique.json (repère « rew » : rembobinage image et son)
```

## Script (art-du-hook, Stop Slop)

| Temps | Voix | Image |
|---|---|---|
| Problème 0 → 10,3 s | Classe A achetée 19 990. Revendue 18 600. Carte grise, trajet, travaux… moins 2 700. (soupir) Pfff. | L'annonce entre en mouvement ; dès l'image 0, « et tu perds 2 700 € dessus ». Le compteur « ce qui te reste » part à − 1 390 €, chaque frais colle son étiquette sur la voiture (− 427, − 233, − 500, − 150), le compteur tombe à − 2 700 €, l'écran vire au rouge, la musique s'arrête, la voiture s'affaisse sur le soupir |
| Bascule 10,3 → 11,4 s | Rembobine. | Le film repart vraiment à l'envers (seek à rebours, lent, rapide, lent) : étiquettes qui se décollent, compteur qui remonte, rouge qui se retire ; lignes de balayage, « ◀◀ REMBOBINE », le son du film relu à l'envers |
| Solution 11,4 → 17,2 s | Même annonce. Avant d'appeler, tu la colles dans UTOPICAR… et bam : prix max, 16 500. | Même cadre qu'à l'image 0 ; le lien s'écrit, clic, chargement. Drop : la vraie analyse (43/100, « À creuser »), le prix roule de 19 990 à 16 500 € |
| 17,2 → 21,2 s | Tu négocies à 16 000… (rire) Plus 1 290. | Glissé : l'ancien « − 2 700 € » se fait barrer, la négo en bulles, puis l'écran vire au vert et le même compteur monte à + 1 290 € |
| Fin 21,2 → 26,0 s | Trois analyses offertes avec le code TIKTOK. Lien en bio ! | Carton orange : « 3 analyses offertes avec le code TIKTOK », logo, « Code TIKTOK · lien en bio » |

## Fin : le code TIKTOK

La première version finissait sur « Trois jours offerts » : cet essai n'existe pas. Fin refaite le 11 oct. 2026 avec
le code TIKTOK (3 analyses Benef offertes, une fois par compte, migration `20261011120000_codes_offerts.sql`), prise
trPt raccordée par `scripts/vo-ps2-fin.py`.

## Chiffres

Vraie analyse de l'app du 10 oct. 2026 (rapport `1b8f9bad`) : Classe A 180d 2018, 96 000 km, 19 990 € ; revente
normale 18 600 € ; frais comptés 1 310 € (travaux 500, carte grise 427, trajet 233, frais 150) ; − 2 700 € au prix
affiché ; offre d'ouverture 15 500 €, objectif 16 000 €, prix max 16 500 €.
+ 1 290 € = 18 600 − 16 000 − 1 310 : calcul sur les chiffres de l'outil, affiché comme « Exemple ».

## Fabrication

```
python scripts/vo-c7-mots.py PS2 ; python scripts/vo-c7-pose.py PS2      # prise czjz (« Utopicar » bien dit)
python scripts/vo-ps2-fin.py                                            # fin « code TIKTOK » (prise trPt)
python scripts/build-c7.py ; node scripts/cues-c7.mjs PS2 ; ID=PS2 python scripts/audio-c7.py
CUT=c7 HOOK=PS2 MB=8 PARTS=6 PART=0…5 node scripts/render.mjs --all ; CUT=c7 HOOK=PS2 PARTS=6 node scripts/render.mjs --assemble
```
