# Brief : 14 vidéos « l'analyse sort tout » (semaines du 12 et du 19 oct. 2026)

Concept validé le 11 oct. 2026 (Polo v4, puis planches `renders/maquette-hooks/planche-7-videos.png` et
`planche-7-videos-semaine2.png`) : chiffre + voiture dès l'image 0 avec « POV Ta 1re revente » → « Tu colles l'annonce
dans UTOPICAR » (barre, clic) → l'analyse sort tout (revente, fiabilité, à vérifier, prix max) → verdict varié →
« Trois analyses offertes avec le code TIKTOK » + logo.

```
Format : 9:16, 1080×1920, 30 i/s, 12,8 à 21,7 s       Voix : Simon (mvhJVdVoTWVUtL4keT7W), eleven_v4, 1 prise, × 1,1
Musique et bruitages : master60 (0 crédit)             Film : film-c7/?hook=S1V1…S2V7 (moteur « semaine » dans _specs.js)
Fabrication : bash scripts/semaines.sh [ids]           Sorties : renders/9x16-c7-S1V1.mp4 … S2V7.mp4
```

## Chiffres

Vraies annonces de particuliers de la base du marché UTOPICAR (relevées du 3 au 9 oct. 2026), calcul de l'outil
(`web/src/lib/analyse/bilan.ts`) : revente en 1 à 2 mois = médiane des comparables × 0,96 ; bénéfice = revente − prix −
carte grise − 150 € de frais fixes ; prix max = revente − frais − 750 €, arrondi aux 50 € inférieurs ; offre = prix max
× 0,94. Les travaux probables de la vraie analyse ne sont pas comptés : mention « Exemple calculé avec l'outil, hors
travaux » à l'écran. Modèles et points à vérifier : listes FIABLES et EVITER_GLOBAL de `fiabilite.ts`, signaux de
`vigilance.ts`.

| Vidéo | Jour | Sujet | Annonce | Chiffres |
|---|---|---|---|---|
| S1V1 | lun. 12 | Un max de bénef avec ces 5 voitures | Twingo II 2013 2 850 €, Corsa D 2012 2 500 €, Polo V 2011 3 500 €, Clio III 1.2 2012 3 650 €, Clio III dCi 2012 2 500 € | +698, +1 564, +1 598, +1 748, +2 048 € |
| S1V2 | mar. 13 | 300 € de plus, 800 € de bénef en plus | Twingo II 2007 2 500 € / 2011 2 800 € | +298 / +1 098 €, prix max 3 100 € |
| S1V3 | mer. 14 | 192 000 km et +2 048 € | Clio III 1.5 dCi 75 2012, 192 000 km, 2 500 € | revente 4 850, max 3 750 € |
| S1V4 | jeu. 15 | Polo trop chère de 350 € | Polo IV TDI 2009, 146 000 km, 4 500 € | revente 5 250, max 4 150 € |
| S1V5 | ven. 16 | La 208 à fuir | 208 1.2 PureTech 82 2013, 190 000 km, 3 990 € | PureTech : liste « à éviter » de l'outil |
| S1V6 | sam. 17 | Clio 4 à 3 000 € : trop beau ? | Clio IV dCi 90 2016, 169 000 km, 3 000 € | comparables ≈ 6 800 € ; question « Pourquoi ce prix ? » |
| S1V7 | dim. 18 | 3 250 € en poche | Clio III 1.2 16V 2008, 105 000 km, 3 250 € | +798 €, max 3 250 € |
| S2V1 | lun. 19 | 1 voiture sur 10 a un compteur trafiqué | données de démonstration (mention à l'écran) | 9,6 % (UFC-Que Choisir / carVertical) |
| S2V2 | mar. 20 | Boîte automatique : −2 242 € | Twingo II auto 2013, 91 500 km, 7 490 € ; Polo V DSG7 2011, 5 300 € | −2 242 € / −1 702 € |
| S2V3 | mer. 21 | Ce qui te reste vraiment | Clio III 1.2 2010, 165 000 km, 2 000 € | brut +1 750, il reste +1 448 € avant distribution |
| S2V4 | jeu. 22 | « Dernier prix » | Polo V 1.6 TDI 2011, 178 000 km, 6 200 € | ouvre 3 850, vise 4 000, max 4 100 € |
| S2V5 | ven. 23 | Petit kilométrage, gros piège | Clio 1.2 2005, 86 000 km, 1re main, 4 990 € | revente 4 100, −1 192 €, max 3 000 € |
| S2V6 | sam. 24 | La vraie affaire existe | Clio IV 1.2 16V 2015, 42 350 km, 1re main, 7 000 € | revente 8 750, +1 448 € |
| S2V7 | dim. 25 | Les 3 messages d'un arnaqueur | messages d'exemple (mention à l'écran) | signaux de vigilance.ts |

## Avant de publier

- Le code TIKTOK doit être en ligne (branche `claude/code-tiktok`, migration `20261011120000_codes_offerts.sql`).
- Passer chaque annonce dans l'app : si la vraie analyse donne d'autres chiffres (travaux probables), corriger la vidéo.
- S1V4 : photo de Polo V (aucune Polo IV libre sur Pexels).

## Sources

- UFC-Que Choisir, fraude au compteur : https://www.quechoisir.org/actualite-fraude-au-compteur-1-voiture-d-occasion-sur-10-concernee-n105694
- La Tribune Auto, mésaventures à l'achat d'occasion : https://www.latribuneauto.com/reportages/actualites/13047-un-tiers-des-francais-a-deja-ete-victime-dune-mesaventure-lors-de-lachat-dun-vehicule-doccasion
- Actu-Automobile, 1.2 PureTech : https://www.actu-automobile.com/2023/03/24/fragilite-du-3-cylindres-1-2-puretech-comment-eviter-la-casse-de-courroie
- Photos Pexels : 29446658 (208), 36644271 (Clio IV), 8886300 (Clio III grise), 18742022 (Corsa D), plus `assets/hooks-photos/credits.json`.
