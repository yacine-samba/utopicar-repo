# Analyse critique — `renders/9x16-explainer.mp4` (v5, 60 s)

Relecture du MP4 livré : planches à 4 images/s sur les 60 s, mesures au pixel des zones sûres, analyse du son
(loudness momentanée, spectre, true peak) et de la synchro image/son, et contrôle automatique
`.claude/skills/motion-studio/scripts/qa_video.py`. Les rounds de critique notés 8/8 s'appuyaient surtout sur l'œil ;
les mesures ci-dessous en contredisent une partie. C'est la leçon principale : **ce qui se mesure doit être mesuré.**

## Ce qui marche (à garder)

- Grammaire de la référence bien transposée : grille blanche, phrases en deux graisses tapées, flash plein cadre,
  chapitres « mot géant + interrupteur », chiffres géants, récap « Tu… », fin sur pastille cliquée.
- Le curseur qui manipule la vraie interface et les surligneurs sur les montants (− 1 200 €, 1 450 € sous la cote,
  + 1 932 €) : c'est ce qui rend l'UI lisible.
- Synchro mesurée : impacts du flash (8 s), des chiffres (28, 36 s), du récap (44, 48 s) à 0 frame du changement d'image.
- Loudness −14,0 LUFS, true peak −1,5 dBTP sur le MP4 (après correction).

## Ce qui ne va pas — par gravité

### Bloquant pour une pub TikTok

1. **Les 2 premières secondes ne retiennent personne.** L'image 0 est une grille blanche vide (écart-type 1,7) : c'est
   la vignette et la première impression. Le son des 2 premières secondes est à **−35,7 LUFS** (momentané) contre
   −13,9 LUFS pour le reste du film : **quasi muet** au moment où le spectateur décide de rester. La phrase du hook
   n'est complète qu'à ≈ 0,9 s.
2. **Textes et CTA sous l'interface TikTok.** « 14 820 € » va jusqu'à x = 985 px (36,5–38 s) et la pastille UTOPICAR +
   « Commente GARAGE » jusqu'à x = 987 px (52,5–60 s). La zone droite (x > 940) est couverte par les boutons like /
   commentaire / partage : **le CTA, l'élément le plus important, est en partie masqué.** Cause technique : la fonction
   `fit()` mesurait la largeur d'une boîte pleine largeur (toujours 1 080 px) et ne réduisait donc jamais le texte.
   La carte « Avec » entre aussi par la zone basse (38,0–39,2 s).
3. **Mix taillé pour un casque, pas pour un téléphone.** 88 % de l'énergie est sous 150 Hz et 1,4 % seulement entre
   1 et 5 kHz. Un haut-parleur de téléphone ne reproduit presque rien sous 150 Hz : la musique paraîtra lointaine et
   fine, alors que le « −14 LUFS » est dépensé dans le sub. Musique synthétisée en code, jamais écoutée.
4. **Allégations chiffrées sans mention.** « 14 820 € de marge réalisée », « 1 450 € sous la cote », « + 1 932 € »
   viennent de la base démo, mais une pub les présente comme des résultats. Sans mention « Données de démonstration »
   (ou de vrais chiffres vérifiables), c'est une allégation potentiellement trompeuse (Code de la consommation,
   pratiques commerciales trompeuses) et contraire aux règles publicitaires des plateformes.
5. **Trop long pour une pub in-feed.** 60 s, promesse concrète à 16 s, CTA à 54 s, puis 6 s de fin quasi statique :
   la grande majorité des spectateurs ne verra jamais le CTA. Format pub recommandé : 21–34 s, promesse dans les
   3 premières secondes, CTA dit et affiché avant la fin, carton final ≤ 3 s.

### Narration et clarté

6. **On ne sait ni à qui ça parle ni ce que ça fait avant 14 s.** La promesse du brief — « ce qu'il te restera, frais
   déduits, et le prix à ne pas dépasser » — n'est jamais dite en toutes lettres. « Tout ton achat-revente dans un
   seul outil » reste vague ; la cible (acheteurs-revendeurs) n'est pas nommée.
7. **Structure répétée trois fois** (chapitre → démo → chiffre, 3 × 8 s) : prévisible dès la deuxième.
8. **Démo de recherche illogique** : le curseur clique « Chercher maintenant » sur un formulaire vide (Marque…,
   Modèle…), puis une Clio apparaît. Une démo doit être crédible pas à pas : on remplit, puis on cherche.
9. **Carte « Lu sur l'annonce » montrée 0,8 s** (16,0–16,8 s) : illisible, elle n'apporte rien.
10. **UI trop dense à 360 px** (rapport complet, annonce en direct complète) : seuls les montants surlignés se lisent.
    Il faut zoomer sur la ligne qui compte au lieu de montrer la carte entière.
11. **Sans / Avec confus** : la réponse (« Avec ») apparaît avant sa question ; « 9 500 € » et « 6 400 € » se
    superposent pendant le changement (41 s) ; le logo de « Avec » est **invisible** (tuile sombre sur fond sombre,
    seule la voiture se voit) ; le squelette gris n'évoque pas une vraie annonce.
12. **Explosion 50–52 s** : 0,4 s de noir presque vide, puis de grandes cartes blanches très floues qui flashent —
    illisible, pic de luminosité désagréable, se lit comme un bug plutôt qu'une intention.

### Finition

13. **Micro-flashs blancs à chaque coupe** : la frame de coupe est une grille vide (6, 14, 20, 22, 28, 30, 36, 44, 46,
    48, 50 s) parce que chaque plan démarre de zéro.
14. **Mots géants coupés** (« echerch… ») : la référence les coupe aussi, mais en 9:16 on lit un mot tronqué.
15. **Fin** : deux oranges en concurrence (pastille et « GARAGE »), cartes grises floues qui font « sale » ;
    6 s sans nouvelle information.
16. **Tout repose sur la lecture** : ≈ 25 écrans de texte, aucune voix off, alors que TikTok se regarde avec le son.
17. **Logo retracé** depuis une image : très proche, mais pas le fichier source.
18. Pas de boucle (fin sombre → début blanc) ; « Tu revends. » tenu 1 s sans mouvement (48,75–49,75 s).

## Priorités de correction (pour la prochaine passe)

1. Hook : image 0 déjà pleine (phrase + UI), son qui attaque à 0 s (voix off + impact), promesse dite en ≤ 3 s.
2. Zones sûres : corriger `fit()` (mesurer le texte lui-même), tout texte/CTA dans x ∈ [60, 940], y ∈ [220, 1480].
3. Voix off professionnelle + remix pour téléphone (grave allégé, présence 1–5 kHz, voix devant la musique).
4. Version pub 30 s : promesse → 2 preuves zoomées → CTA à 25 s, carton ≤ 3 s ; garder la 60 s en version longue.
5. Mention « Données de démonstration » (ou vrais chiffres) ; démo de recherche remplie avant le clic ;
   Sans / Avec remis dans l'ordre, logo avec liseré sur fond sombre ; explosion remplacée par des cartes nettes.

Mesures : `qa_video.py renders/9x16-explainer.mp4` → FAIL première image vide ; WARN zones sûres (droite 36,5–38 s et
52,5–60 s), son des 2 premières secondes −35,7 vs −13,9 LUFS, 88 % d'énergie sous 150 Hz.
