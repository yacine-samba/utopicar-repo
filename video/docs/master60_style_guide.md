# master60 — direction artistique

Brief : `brief-master60.md` · script : `script-master60.md` · voix : Simon v4, `audio/vo-master60/vo-placed-{A,B}.wav`
(55,07 s, corps à 4,23 s dans les deux ouvertures).

## 1. Ce que font les références (prompt-motion.com, Product UI, mesurées image par image)

| Mesure | Démos 15 s (Dub, Stockwhiz, Supademo, Frame by Frame) | Films longs (AllInvestView 42 s, Distilbook 40 s, Ren 30 s) |
|---|---|---|
| Une nouvelle scène toutes les | 0,53 à 0,68 s | 1,4 à 2,7 s |
| Coupes franches | 13 à 23 | 2 à 8 (le reste enchaîné sans coupe) |
| Image 0 | logo ou mot seul | titre de chapitre + vraie UI |
| Titres | 1 à 3 mots, point final, deux tons (blanc + accent) | « All your investments. *One view.* » : 2 lignes, la 2e en accent |
| UI | une vraie pièce d'UI par idée, en légère perspective, qui s'anime toute seule (courbe qui se trace, compteur qui roule, anneau qui se remplit) | idem, chapitres numérotés « 01 · … », fond qui change à chaque chapitre |
| Satisfaction | compteurs, courbes, mur d'icônes qui se range (Enxovaly), bouton → chargement → coche sans coupe (twoclipping) | carte qui passe du rouge au vert (Winkz), coût qui monte contre prix fixe (AjustaCV) |
| Fin | logo + une ligne + bouton | idem |

## 2. Adaptation à UTOPICAR

| Élément | Choix |
|---|---|
| Rythme | film long à voix : une nouveauté toutes les 1,5 à 2 s, chaîne continue, coupes franches seulement sur les gags (« Ah. Non. », « Hop ! ») |
| Fond | le fond sombre chaud du site (`#0b0a09` → `#17100b`), grain léger, lueur orange lente derrière le sujet ; **chapitre 02** (après l'achat) passe sur le thème clair du site (`#f7f2ea`) au « Hop ! » : le désordre sombre devient une page claire et rangée |
| Accent | l'orange UTOPICAR `#ff5a1f` (et `#ff8a4c` en texte sur fond sombre). Vert `#3ecb7f` / rouge `#ff7a7a` / ambre `#ffc53d` uniquement pour les verdicts et chiffres, comme dans l'app |
| Typo | celle du site : **Clash Display** 600 pour les titres, **Satoshi** pour l'UI, **Instrument Serif italique** pour la 2e moitié des titres en deux tons (« Ta marge, *frais déduits.* ») — la signature du site |
| Titres | ≤ 6 mots, écrits lettre à lettre à la lumière (technique maison), jamais en fondu seul |
| UI | composants réels de l'app (`video/capture-web/`, données démo), en perspective légère (rotateX 8°, rotateY −10°), ombre portée chaude ; la caméra vise le chiffre qui compte (point focal) |
| Chapitres | « 01 · Avant d'acheter » (208, Mercedes) et « 02 · Après l'achat » (tableau de bord) : petite pastille en haut, chiffre en orange |
| Gags | « Ah. » : la musique coupe net, la caméra se fige 1 image, « Non. » : tampon rouge « Déconseillée » ; « Bizarre. » : sourcil — le ticket penche de 3° ; chaos des onglets : chaque mot fait tomber un objet ; « Hop ! » : tout se range d'un coup |
| Satisfaction | bouton Analyser → chargement → verdict ; compteur 7 190 + 1 650 → 8 840 ; compteur 19 990 → 16 500 ; trois étiquettes qui tombent ; barres de marge qui poussent ; jauge « 44 mois » qui se remplit ; bouton orange enfoncé |
| Mentions | « Vraie annonce, analysée par UTOPICAR » sous la 208 et la Mercedes ; « Données de démonstration » pendant tout le chapitre 02 ; « Exemple calculé » sous la jauge 44 mois |
| Interdits | aucun logo de plateforme (filigrane Leboncoin recadré), aucune plaque, aucun logo de marque sur les photos (étoile Mercedes effacée si visible), pas de crossfade, pas de glow sur l'UI |

## 3. Formats

- **9:16 (1080×1920)** : colonne 140 → 940 centrée sur x = 540 ; rien dans les 220 px du haut ni les 440 px du bas ;
  titres en haut du tiers central, UI en dessous ; sous-titres de la voix dans la bande 1260–1440.
- **16:9 (1920×1080)** : recomposé (pas recadré) — UI à droite en perspective, titre en deux tons à gauche (grammaire
  Stockwhiz/AllInvestView) ; marges 96 × 54, bas 108 ; « Lien en bio » devient « utopicar.fr ».

## 4. Son (rappel, phase 4)
Musique ElevenLabs instrumentale ≈ 112 BPM, groove lumineux ; **arrêt net sur « Ah. »** (8,1 s) et reprise basse seule
sur « Mille six cent… » ; impact sur « bam » ; montée sur le chapitre 02 ; « snap » sur « Hop ! » ; « ding » réel sur
« Ding ! » ; un tic par étiquette de prix ; accord final sur UTOPICAR. Voix devant (ducking), −14 LUFS, ≤ −1 dBTP mesuré
sur le MP4.
