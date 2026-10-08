---
name: recette-47
description: La recette de la vidéo UTOPICAR qui a le mieux marché, MO5 « 47 € » (la Polo achetée 3 500 €, plus de 6 000 vues), devenue une méthode pour tourner une série de vidéos TikTok / Reels / Shorts de 30 s pour les débutants en achat-revente auto, et pour l'améliorer à chaque publication grâce aux statistiques. Utilise ce skill dès que l'utilisateur veut une nouvelle vidéo « comme celle de la Polo », « de la même manière », « avec la même recette », le prochain épisode de la série, une idée de vidéo d'attention qui marche, ou qu'il donne les chiffres d'une vidéo publiée (vues, rétention, partages, enregistrements) pour savoir quoi changer, même s'il ne cite ni MO5 ni la recette. Ce skill décide quoi raconter, dans quel ordre et à quel rythme ; la fabrication passe par motion-studio et chaque hook par art-du-hook.
---

# Recette 47

MO5 « 47 € » est la vidéo d'attention qui a le mieux marché : **plus de 6 000 vues** début octobre 2026, contre 1 000
pour notre meilleur carrousel (« 3 règles ») et 200 à 300 pour les autres. Ce skill garde ce qui l'a fait marcher,
fabrique les épisodes suivants de la même manière et fait progresser la recette à chaque publication, chiffres à
l'appui.

Le dossier du dépôt (`.claude/skills/recette-47/`) fait foi. `references/journal.md` change après chaque publication.
Sur claude.ai, le skill est une copie : quand tu modifies le journal ou la recette, rappelle à l'utilisateur de
réimporter le paquet (`video/renders/skill/recette-47.skill`, commande en bas de page).

## La recette en une phrase

Le calcul que fait le débutant, démoli en trente secondes par sa propre première voiture, puis refait à l'envers par
ceux qui gagnent. Rien à vendre, et la fin relance le début.

## Les 9 ingrédients (recette v1, celle de MO5)

Chacun vient du film publié. Le pourquoi compte plus que la lettre : un nouvel épisode change le sujet, pas la mécanique.

1. **L'ouverture, c'est son calcul.** Phrase 1 : le calcul ou le plan du débutant, en « tu », avec deux chiffres ronds
   dans les six premiers mots. Phrase 2 : un objet de sa vie le contredit, pince-sans-rire, sans dire pourquoi.
   MO5 : « Tu l'achètes 3 500, tu la revends 5 000. Ton compte en banque n'est pas d'accord. » Image 0 : le calcul
   écrit en grand, terminé par un « ? ». Il se reconnaît en deux secondes (miroir) et la phrase 2 ouvre la question
   « pourquoi ? » que seul le film referme (écart).
2. **Un seul chiffre héros, toujours à l'écran.** Le compteur à rouleaux « MARGE » part du chiffre promis (1 500 €) et
   tombe à chaque coup dur. Sans le son, on suit encore l'histoire.
3. **Une vraie voiture, la sienne.** La photo de l'utilisateur, détourée, contour tracé à la lumière. Chaque frais y
   colle une étiquette de prix, jusqu'à la couvrir. Elle porte l'histoire : c'est elle qui coûte.
4. **L'accumulation.** Six à neuf frais concrets en six secondes, un par temps de musique. Chacun arrive en
   notification bancaire (titre, montant, petite vidéo réelle dedans). La voix n'en nomme que la moitié : on revoit
   pour lire le reste. Un des frais est un **gag** (« Kebab · après la 4e visite · − 12 € ») : c'est lui qu'on envoie
   au pote.
5. **L'attente.** Le temps passe en palettes (J+1 → J+23), la nuit tombe, la musique perd sa basse, la voix se tait
   presque (« Et là, personne n'appelle. »). Les petits frais continuent de tomber.
6. **La chute.** La vente en deux phrases courtes (« Il négocie. Tu acceptes. »), le compteur dégringole, le chiffre
   final remplit l'écran, la musique s'arrête net : la seule pause du film. Puis une comparaison de tous les jours en
   moins de cinq mots, en Fraunces orange (« Même pas un plein. »).
7. **Le renversement.** « Ceux qui gagnent font le calcul à l'envers. » L'histoire se rembobine jusqu'au jour 1
   (étiquettes qui se décollent, compteur qui remonte), puis la méthode du pro s'écrit sur une carte de verre, appliquée
   **au même exemple**, avec un verdict sur l'annonce du début (« À 3 500, tu passes ton tour. »). C'est ce que le
   spectateur enregistre.
8. **La boucle.** « La prochaine fois que tu te dis… » enchaîne sur la phrase 1 ; la dernière image est l'image 0.
9. **Rien à vendre.** Ni produit, ni CTA, ni logo, ni morale, ni « enregistre ». Chaque montant est sourcé ou annoncé
   à l'écran comme exemple (« Exemple · prix moyens constatés »).

## La forme, mesurée sur MO5

| Temps | De → à (s) | Voix (MO5) | Émotion |
|---|---|---|---|
| Ouverture | 0 → 4,2 | « Tu l'achètes 3 500, tu la revends 5 000. Ton compte en banque n'est pas d'accord. » | reconnaissance, sourire |
| Jour 1 | 4,2 → 5,9 | « Jour 1, tu l'achètes. » | élan |
| Accumulation | 5,9 → 12,0 | « Carte grise, contrôle technique, pneus, vidange, plaquettes. Et six allers-retours pour des visites. » | peur qui monte, rire |
| Attente | 12,0 → 15,6 | « Et là, personne n'appelle. » | peur |
| Chute | 15,6 → 20,9 | « Il négocie. Tu acceptes. Bénéfice, 47 euros. Même pas un plein. » | humour noir |
| Renversement | 20,9 → 27,4 | « Ceux qui gagnent font le calcul à l'envers. Ton prix max, 2 750. À 3 500, tu passes ton tour. » | soulagement, valeur |
| Boucle | 27,4 → 29,6 | « La prochaine fois que tu te dis… » | relance |

29,6 s, 1080 × 1920, 60 i/s. 75 mots en 21 répliques, 21,7 s de parole : les silences comptent autant que les mots.
Quelque chose de neuf toutes les 0,5 à 2 s, une seule pause (sur le chiffre final). Détail image par image, son et
code : `references/anatomie-mo5.md`.

## Faire un épisode

Le processus en 5 étapes de motion-studio (`references/codes-attention.md` de ce skill-là), avec un « OK » de
l'utilisateur à chaque étape. Ce skill ajoute ce qui suit.

0. **Lis `references/journal.md`** : version de la recette en cours, leçons confirmées, expérience prévue pour cet
   épisode. Puis `references/sujets.md`.
1. **Brief.** Choisis une croyance chiffrée du débutant (`sujets.md`) et remplis la grille de transposition
   (`references/episode.md`) : chaque temps de MO5 trouve son équivalent. Écris les hooks avec le skill
   **art-du-hook** (règle du dépôt, sans exception) : 3 à 5 variantes, la variante A garde la mécanique « son calcul +
   un objet qui le contredit ». Passe la voix et les textes au skill **stop-slop** ; la personnification du hook
   (« ton compte en banque n'est pas d'accord ») reste : c'est la blague. Le brief `video/brief-<projet>.md` contient
   une section **Hypothèse** : ce qu'on garde, la seule variable qu'on change, le chiffre qui tranchera, et
   l'amélioration de fabrication de cet épisode.
2. **Timeline et images tests**, chiffres sourcés (lien et date pour chaque montant).
3. **Maquettage toutes les 0,1 s.**
4. **Voix** : Simon, même ton que MO5. Estimer les crédits ElevenLabs et demander l'accord avant de générer.
5. **Animation, son, contrôle, livraison** : `qa_video.py` sans FAIL, boucle mesurée, couverture, SRT.

La fabrication suit le skill **motion-studio** (`references/techniques.md` y donne la recette de chaque procédé :
écriture à la lumière, compteur à rouleaux, palettes, verre, détourage, rembobinage, boucle, rendu parallèle). Le point
de départ du code est `video/film-mo5/film.js` et `video/scripts/audio-mo5.py`, tant qu'il n'existe pas de gabarit
réutilisable (voir le journal).

**La voiture.** Après MO6, l'utilisateur a écarté la Polo (« on l'a assez vue »). La recette garde le principe : une
vraie voiture à lui. Demande à chaque épisode une photo d'une autre de ses voitures (trois quarts avant, plein jour,
sans personne autour). Ne reprends la Polo que s'il le demande.

## Après la publication : la boucle d'amélioration

Chaque épisode doit apprendre quelque chose, et la recette ne change que sur preuve. Méthode complète et tableau dans
`references/journal.md`.

1. **Relever** à J+2 et à J+7 : demande les captures de TikTok Studio (vue d'ensemble, courbe de rétention,
   spectateurs). Note vues, part encore là à 3 s, durée moyenne, visionnages complets, partages, enregistrements,
   commentaires, part du trafic « Pour toi », et le contexte (jour, heure, légende, hashtags, son).
2. **Comparer** pour 1 000 vues, à MO5 et à la médiane de la série. Lis la courbe : la seconde où les gens partent
   désigne le temps du film en cause.
3. **Trancher l'hypothèse** de l'épisode : confirmée, infirmée ou sans signal. Une vidéo seule prouve peu (heure, son,
   humeur de l'algorithme) : une leçon devient un ingrédient quand deux épisodes la confirment, et reste une hypothèse
   avant.
4. **Fabrication** : chaque épisode améliore une technique, mesurée avant et après (part d'images en mouvement avec
   `ref-motion.py`, écart de boucle, avertissements de `qa_video.py`, durée de rendu, retours de l'utilisateur).
5. **Écrire** le résultat dans le journal, monter la version de la recette si un ingrédient change, choisir
   l'expérience de l'épisode suivant, commit, réempaqueter le skill.

Ce que l'utilisateur dit d'une vidéo (« trop lent », « la voix fait IA ») vaut une mesure : note-le dans le journal
avec la date, comme une statistique.

## Fichiers

| Fichier | Quand le lire |
|---|---|
| `references/anatomie-mo5.md` | Avant chaque brief : la vidéo de référence seconde par seconde (image, voix, son, chiffres, code) et pourquoi chaque temps fonctionne |
| `references/episode.md` | Étape 1 : grille de transposition, modèle de brief d'épisode, contrôles avant publication |
| `references/journal.md` | Au début de chaque épisode et après chaque publication : résultats, expériences, leçons, version de la recette |
| `references/sujets.md` | Pour choisir le prochain sujet : banque de croyances de débutants à démolir, avec leur statut |
| `video/serie-47.md` (dépôt) | Les premiers épisodes de la série, hooks écrits avec art-du-hook, prêts à valider |
| `video/brief-mo5.md`, `video/docs/timeline-mo5.md` (dépôt) | Le brief et les frais sourcés de MO5 |
| `video/film-mo5/film.js`, `video/scripts/audio-mo5.py` (dépôt) | Le code du film et du mix de MO5 |

Réempaqueter après une modification (depuis la racine du dépôt) :

```bash
(cd .claude/skills && python3 -m zipfile -c ../../video/renders/skill/recette-47.skill recette-47)
```

Hors du dépôt (claude.ai), tu ne peux pas écrire dans le journal : donne la ligne à ajouter et demande de la reporter
dans le dépôt à la prochaine session Claude Code.
