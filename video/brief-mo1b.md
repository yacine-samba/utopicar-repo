# Brief — MO1 v2 : voix plus naturelle, éléments graphiques animés

Retours à l'origine de cette version :
- plus de mouvement et une animation plus moderne, avec de vrais éléments graphiques dans la vidéo ;
- une voix moins « IA » : des pauses à chaque phrase, des phrases vraiment construites, des mimiques et une
  personnalité ;
- le curseur de MO2 était « sans vie, presque fixe ».

Style : la grammaire de la référence 1 (MO1) est conservée. Si cette version est validée, on refait MO2.

## La voix : Simon, un personnage

Marchand VO d'expérience. Cash, pince-sans-rire, complice. Il rit de ses erreurs passées, chuchote les bons plans et
parle au spectateur (« tu »). Il raconte une histoire au lieu de réciter les fonctions : la Golf qui avait l'air
parfaite, puis ce qu'il fait maintenant.

ElevenLabs, voix Simon (`mvhJVdVoTWVUtL4keT7W`). Les balises de jeu (`[sighs]`, `[sarcastic]`, `[chuckles]`,
`[whispers]`…) et les pauses (`[short pause]`, `[pause]`, points de suspension) sont interprétées, jamais lues.

```
[casual] Tu fais de l'achat-revente auto ? [short pause] Bon… écoute-moi deux secondes.
[sighs] Une Golf. Propre, entretenue, le vendeur est adorable.
[sarcastic] Et une fois les frais payés ? [pause] Moins mille deux cents euros. [chuckles] Magnifique.
[warmly] Alors maintenant, tu colles l'annonce dans utopicar. [short pause] Deux secondes… une note, un verdict, et ce qu'il te reste VRAIMENT.
[mischievously] Avec le prix à ne jamais dépasser. Au téléphone, c'est toi qui tiens le chiffre.
[curious] Deux voitures en tête ? Tu compares, tu gardes la meilleure.
[excited] Et pendant que tu dors, il surveille les annonces. [short pause] Une Clio, mille quatre cent cinquante euros sous la cote ? [whispers] T'es le premier au courant.
[warmly] Ton parc, ta marge, les jours en stock… tout est là. [chuckles] Fini le tableur du dimanche.
[confident] Tu sais avant d'acheter. Tu revends avec de la marge.
[excited] Commente DÉBUTANT ou PRO… [short pause] tu reçois le guide qui va avec, et ta place sur la liste d'attente.
```

**Prises (6 lancées, ≈ 6 144 crédits ; 2 prises v4 refusées par ElevenLabs, « Free Tier access has been disabled »).**
Toutes les prises reçues sont dans `audio/vo-takes/v2/`.

| Prise | Modèle | Durée | Débit | Pauses > 0,35 s | Note |
|---|---|---|---|---|---|
| **simon-v3-a (retenue)** | eleven_v3 | 59,9 s | 2,44 mots/s | 28 | texte complet, « utopicar » bien prononcé |
| simon-v3-b | eleven_v3 | 60,5 s | 2,45 mots/s | 28 | « utopie-car » |
| simon-v3-c | eleven_v3 | 59,9 s | — | — | « Itopicar » |
| simon-v4-a | eleven_v4 | 45,9 s | 3,33 mots/s | 10 | trop rapide, peu de respirations : le côté récité qu'on veut éviter |

Aucune balise n'est prononcée (vérifié à la transcription). Les pauses sont gardées telles quelles : le film passe à
62,6 s (fin de la voix + 2,6 s de carton final).

## Le film, phrase par phrase (`film-mo1b/`)

| Phrase de Simon | Élément graphique animé |
|---|---|
| « Tu fais de l'achat-revente auto ? » | hook lettre à lettre, logo officiel (pack `utopicar-logo`) |
| « Bon… écoute-moi deux secondes. » | « Écoute. » dans un chrono de 2 s qui se dessine |
| « Une Golf. Propre, entretenue… » | la vraie fiche glisse, le curseur la survole, 3 pastilles « Propre ✓ », « Entretenue ✓ », « Vendeur adorable ♥ » tombent sur chaque mot |
| « Et une fois les frais payés ? » | 4 tickets de frais tombent un à un, le compteur plonge de + 300 € à − 1 200 € |
| « Moins mille deux cents euros. Magnifique. » | − 1 200 € frappé, secousse de caméra, fissures qui se dessinent, « Magnifique. » en italique |
| « Alors maintenant, tu colles l'annonce… » | fleur orange, le curseur clique, le texte se colle, clic sur « Analyser » avec onde |
| « Deux secondes… » | anneau de chargement 2 → 1 → ✓ |
| « une note, un verdict » | jauge qui monte à 38/100, tampon NO GO qui s'écrase (secousse) |
| « et ce qu'il te reste VRAIMENT » | vraie carte « Il vous reste − 1 200 € », cercle tracé à la main |
| « Avec le prix à ne jamais dépasser. » | réglette : le prix glisse de 9 500 € au plafond 7 500 €, zone rouge au-dessus |
| « Au téléphone, c'est toi qui tiens le chiffre. » | téléphone qui sonne, pastilles « Ta 1re offre : 7 050 € » et « Ton plafond : 7 500 € » |
| « Deux voitures en tête ? Tu compares… » | duel de barres Golf − 1 200 € / Clio + 1 932 €, le curseur clique la Clio, tampon GO |
| « Et pendant que tu dors… » | radar de nuit qui balaie, lune, un point orange repéré |
| « Une Clio, 1 450 € sous la cote ? » | courbe : ligne de cote, les annonces se posent, l'écart de 1 450 € se trace |
| « T'es le premier au courant. » | notification utopicar qui tombe, ondes, texte chuchoté |
| « Ton parc, ta marge, les jours en stock… » | vraies lignes du parc, calendrier dont les jours défilent, tableau de bord |
| « Fini le tableur du dimanche. » | tableur rempli d'erreurs, barré en rouge, qui tombe |
| « Tu sais avant d'acheter. Tu revends avec de la marge. » | grand texte, puis courbe de marge qui monte jusqu'à + 14 820 € |
| « Commente DÉBUTANT ou PRO… » | fleur orange, logo officiel, pastilles DÉBUTANT / PRO, le curseur clique DÉBUTANT puis PRO, la goutte tourne autour |

**Mouvement :**
- une caméra qui respire : chaque plan arrive un peu trop près puis se pose, avec une dérive lente ;
- des secousses sur les chocs (− 1 200 €, NO GO, tableur) ;
- un curseur aux trajets courbes, qui s'enfonce au clic avec une onde ;
- la goutte orange qui guide l'œil de plan en plan.

La mention « Données de démonstration » s'affiche seulement sur les plans qui montrent des chiffres de l'exemple.

## Chaîne de production

1. `CUT=mo1b MAXDUR=66 ENDHOLD=2.6 python3 scripts/vo_marks.py` : repères sur les mots.
2. `python3 scripts/music-mo1b.py` : musique de l'explainer recalée, arrêt du disque avant « Moins mille deux cents ».
3. `node scripts/cues-mo1b.mjs` puis `CUT=mo1b HOOK=voix|sansvoix node scripts/sfx.mjs` : bruitages.
4. Mixage :
   - avec voix : `MIX_CEIL=-3.5 SFX_HP=90 CUT=mo1b HOOK=voix python3 scripts/mix.py` ;
   - sans voix : même commande avec `NO_VO=1` et `HOOK=sansvoix`.
5. `CUT=mo1b HOOK=voix node scripts/render.mjs --all` pour la version avec voix. Pour la version sans voix : « Écoute. »
   devient « Regarde. », rendu à part avec `render.mjs --range`, puis `python3 scripts/splice.py` avec le mix sans voix.
