# Les styles

Se choisit dans `projet.STYLE` ; la musique dans `projet.MUSIQUE`. Les deux générateurs lisent ces réglages.

## Viral @yass.views (`STYLE = "viral"`)

Relevé sur la vidéo 7700717561310170401 de @yass.views (image par image, 0,05 s, et enveloppe du son).

- **Couleurs** : bleu des intercalaires `#0848E0`, blanc à trame de points (`#F0F0F0`), chiffre d'accroche rouge
  `#F02A2A` avec halo, mot en cours orange `#F2742B`.
- **Typo** : petite ligne Satoshi 700 ; mot fort Instrument Serif italique (entre par un flou) ; chiffres et punchs
  en capitales étroites (Impact, police système).
- **Construction** : le visage ne reste jamais plus de ~3 s : la voix continue sur des intercalaires plein cadre
  (`mots`, un ou deux mots à la fois) et des cartes ; carte vidéo qui monte depuis le bas ; sous-titres sur le torse,
  un seul mot orange ; chiffre d'accroche seul en haut, au moment où il est dit.
- **Mouvement** : intercalaire qui glisse depuis la droite avec flou de mouvement (0,3 s) ; coupes franches entre
  bleu et blanc ; poussée lente sur le visage ; filé et zoom arrière aux entrées de plan.
- **Son** : souffle à chaque intercalaire et carte, clic sur les mots forts, impact grave sur le chiffre d'accroche.
- **Version longue** : mots forts à côté du visage (côté libre), cartes dans un panneau arrondi, pastilles de
  chapitre bleues, carton titre blanc et carton de fin bleu.

## Sobre (`STYLE = "sobre"`)

- Coupes franches (ni filé ni zoom), pas d'intercalaires mot à mot, aucun bruitage.
- Sous-titres en Satoshi 700 blanc, sans mot géant ni mot orange ; accroche en linéale blanche.
- Les cartes de données et la carte nom restent possibles si le découpage les liste.

## utopicar v4 (`gen4.py`, vidéos utopicar face caméra)

Tiré du logo officiel (dépôt utopicar, motion-studio `references/langage-v4.md`) : tout bouge sur l'axe de la flèche
(31,7°) ; le trait crème trace croix, ratures et liens à vitesse de plume constante ; une couleur pleine orange
(`#E2683A`, encre `#160904`) ou noire couvre l'écran à chaque chapitre ; une seule pastille porte les chiffres ;
sous-titres Satoshi 700 en groupes mesurés (une ligne, coupés sur la syntaxe), un mot orange texte (`#F0915E`) ;
accroche posée dès l'image 0, derrière la tête en plan large ; filés réels entre deux prises de même cadre ; carte de
fin de 0,85 s (vidéo longue) ; son : logo sonore « u-to-pi-car » en mi fait de vrais sons de voiture, chiffres qui
jouent ses notes, mix à écarts mesurés. Aucun préréglage : ressorts calculés sur la taille, largeurs mesurées.

## Musique

Par défaut : non (la voix et les bruitages ; l'utilisateur a retiré la musique sur Henritokane). Avec
`MUSIQUE = True` : fichiers dans `assets/audio/musique/`, `musique=(fichier, départ)` par extrait, `LITS` dans
`decoupage_yt.py` ; la loudness se mesure toute seule, lit 18 à 20 dB sous la voix.
