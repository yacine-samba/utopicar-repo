# Script, ouvertures A/B, voix off, sous-titres (phase 2)

## 1. Stratégie avant les mots

Écris d'abord, en une ligne chacun : **qui** (public précis), **douleur** (vécue, concrète), **promesse** (ce que le
produit change, chiffrée si possible), **preuve** (ce que l'écran montre), **action** (CTA). Si l'une manque, le
script sera flou — c'est ce qui est arrivé à la v5 : la promesse du brief n'y était jamais dite en toutes lettres.

Structure pub in-feed (30 s) qui marche :
| Temps | Rôle | Règle |
|---|---|---|
| 0–3 s | Ouverture (A ou B) | Image 0 déjà pleine, son qui attaque à 0 s, la promesse ou la douleur dite et écrite |
| 3–8 s | Promesse | Ce que fait le produit, pour qui, en une phrase ; logo visible |
| 8–22 s | 2 preuves max | Une fonction = un plan zoomé sur la ligne qui compte, un chiffre surligné |
| 22–27 s | Bénéfice + CTA | CTA dit **et** écrit, dans la zone sûre |
| 27–30 s | Carton | Logo + CTA, ≤ 3 s, pas de temps mort |

Version longue (45–60 s) : mêmes blocs, 3–4 preuves, un « Sans / Avec », CTA avant la 45e seconde.

## 2. Ouvertures A/B (ou A/B/C)

Les variantes ne changent **que les 0–3 premières secondes** (image + voix + texte) et se raccordent au même
corps de film à la même frame. Sinon on ne sait pas ce qu'on teste. Deux par défaut ; trois (A/B/C) quand
l'utilisateur veut tester des hooks forts — chacune d'un angle vraiment différent, même durée à ±0,2 s, même
dernière image avant le raccord.

**Un « gros hook »** se joue dans la première seconde, pas dans la troisième :
- image 0 déjà pleine et en mouvement, sujet au centre, gros texte (≥ 120 px en 9:16) ;
- premier mot à ≤ 0,3 s, son qui attaque à la frame 0 (impact, voix, ou les deux) ;
- une rupture avant 1,5 s : coupe, zoom choc, changement de couleur plein cadre, objet qui tombe ;
- une tension ouverte (question, chiffre absurde, aveu) que seule la suite referme ;
- jamais de logo ni de « Bonjour » en ouverture.

Paires d'angles éprouvées (choisis-en deux vraiment différents) :
- **Problème vécu** : « Tu as déjà acheté une voiture… et perdu de l'argent en la revendant ? »
- **Chiffre choc** : « − 1 200 €. C'est ce que cette Golf t'aurait coûté. »
- **Question directe** : « Tu sais combien il te reste, frais déduits ? »
- **Démo immédiate** : la note 38/100 et « NO GO » tombent dès la première image.
- **Preuve sociale** (seulement si elle est vraie et vérifiable).

Ce qu'on mesure ensuite (à dire à l'utilisateur à la livraison) : taux d'accroche (vues 3 s / impressions), rétention
à 50 % et 100 %, CTR ou commentaires sur le mot-clé. Même budget, même audience, au moins 3–5 jours ou ≈ 1 000
impressions par variante avant de conclure ; on juge d'abord l'accroche, puis le CTR.

## 3. Écrire pour l'oreille et pour l'œil

**Avant de montrer un texte (brief, script, voix off, textes à l'écran) : passe-le au skill Stop Slop**
(`anthropic-skills:stop-slop`). Retour de l'utilisateur (oct. 2026) : les textes sonnaient « IA ». Pas d'adverbes de
remplissage, pas de « ce n'est pas X, c'est Y », pas de tiret long, voix active, détails vécus et chiffrés.

**Verdicts et notes en clair.** Un spectateur, même pro, ne comprend pas « GO / NO GO » ni « 38/100 » seul. On écrit
le verbe et la conséquence en euros : « N'achète pas à ce prix », « Tu peux l'acheter », « Note de l'affaire : 38/100.
Tu perds 1 200 € », « Le prix max à payer : 7 500 € », « 1 450 € moins cher que le prix du marché ». Si une vraie
capture montre « GO » ou « NO GO », on ajoute une légende en clair juste dessous.

- **La voix dit, l'écran montre.** Les textes à l'écran ne recopient pas la voix : ils posent le chiffre ou le mot
  clé (≤ 6 mots par écran, 1 idée), la voix raconte. Les sous-titres de la voix sont une couche à part.
- Budget de mots (voix), 10 % de respiration comprise :
  | Durée | Français (≈ 2,5 mots/s) | Anglais (≈ 2,7 mots/s) |
  |---|---|---|
  | 15 s | 32–35 | 36–38 |
  | 30 s | 65–70 | 72–78 |
  | 60 s | 130–140 | 145–155 |
- Phrases courtes, verbes d'action, tutoiement si c'est le registre choisi. Un chiffre par phrase.
- **Deuxième langue = adaptation, pas traduction** : mêmes intentions et mêmes chiffres, tournures natives, même
  minutage de blocs. Vérifie la longueur des textes à l'écran dans les deux langues avant de figer la mise en page
  (l'anglais est souvent 10–20 % plus court, l'espagnol et l'allemand plus longs).
- Écris la voix pour la synthèse : chiffres et sigles en toutes lettres quand la lecture est ambiguë
  (« mille deux cents euros », « G-O »), nom de marque avec sa prononciation validée (« UTOPICAR » : u-to-pi-car).

Livre le script sous cette forme :
```
| t | Voix FR | Voix EN | Écran FR | Écran EN | Image |
| 0,0–3,0 (A) | … | … | … | … | … |
| 0,0–3,0 (B) | … | … | … | … | … |
| 3,0–8,0 | … |
```

## 4. Voix off professionnelle (connecteur ElevenLabs)

1. **Choisir des voix réelles** : `creative_list_voices` avec les filtres issus du brief — `languages` (ex. `['fr']`),
   `gender`, `age`, `accent`, `use_cases: ['advertisement','social_media']`, `descriptives` (`confident`, `upbeat`,
   `crisp`, `calm`…), `voice_category: 'high_quality'`. Ne jamais inventer un `voice_id`. Retiens 2–3 candidates
   qui parlent **les deux langues** (une même voix sur `eleven_multilingual_v2`/`eleven_v3` garde son timbre).
2. **Faire écouter** : une phrase du script par voix candidate, `generations_count: 1`, après `estimate_only` et accord.
   L'utilisateur choisit. S'il veut une voix sur mesure : `creative_design_voice` avec **sa** description et **sa**
   phrase (100–1000 caractères, jamais inventées), puis `creative_save_designed_voice`.
3. **Générer la VO** par langue et par ouverture (A, B, corps) : `creative_generate_speech`, modèle
   `eleven_multilingual_v2` (stable) ou `eleven_v3` pour les indications de jeu entre crochets
   (`[confident]`, `[excited]`, `[whispers]`, `[short pause]`). Garde un même `flow_id` pour tout le projet.
   Suis chaque génération avec `creative_get_flow_run_status` jusqu'à `all_completed`.
4. **Minutage mot à mot** : transcris chaque prise avec `creative_transcribe_audio` (Scribe). Les horodatages de mots
   servent à caler les textes à l'écran, les impacts et les sous-titres. Stocke `audio/vo-<projet>-<lang>-<bloc>.wav`
   et `audio/vo-<projet>-<lang>-<bloc>.words.json`.
   **Sans Scribe** (ou pour économiser des crédits) : faster-whisper en local (`small`, `int8`,
   `word_timestamps=True`, `language='fr'`) donne le même minutage mot à mot (MO5, MO6).
5. **Récupérer et poser la prise** : les URL des générations sont dans `creative_get_flow_run_status` (téléchargement
   avec `curl`). Si la prise est un peu lente pour le budget, `atempo=1.1` (ffmpeg) garde le timbre ; au-delà, ça
   s'entend. Chaque réplique est ensuite posée à son temps (`vo-placed.wav`) et le film recalé sur
   `vo-timing.json` (objet `K`, voir `techniques.md`).
6. Si le connecteur n'est pas disponible ou si l'utilisateur refuse de dépenser : voix de l'utilisateur (il enregistre
   d'après le script minuté) ou film sans voix, textes à l'écran seulement — dis-le clairement, c'est un compromis.
7. **Accès coupé par ElevenLabs** (MO6, oct. 2026) : « Unusual activity has been detected on your account, so Free
   Tier access has been disabled » (déclenché par le proxy de l'environnement cloud). Ne pas relancer, citer le
   message exact, vérifier côté utilisateur si des crédits ont été débités, proposer : abonnement payant, voix
   enregistrée par l'utilisateur (on garde tout le reste de la chaîne), ou mise en attente.

Contrôle d'une prise : débit dans le budget, noms et chiffres bien prononcés, pas de souffle ou de clic en tête,
énergie qui démarre à la première syllabe (le hook se joue là).

### Voix incarnée (« plus d'humain »)

Une voix humaine n'est pas une voix plus forte : c'est un **personnage qui réagit**. Les retours de la v7 (« trop IA »,
puis « pas assez humaine », puis « trop dramatique ») montrent qu'on ne règle pas ça par l'énergie mais par l'écriture.
- **Un personnage** écrit en trois lignes (métier, humeur, rapport au spectateur), pas un « narrateur ».
- **Une histoire vécue** au lieu d'une liste de fonctions : un avant raté, un déclic, un après.
- **Des réactions** à ce que montre l'image : « Ah. », « Attends… », un petit rire, un soupir, une auto-correction
  (« enfin… presque »). Une réaction toutes les 2–3 phrases, jamais deux d'affilée.
- **Des ruptures de registre** : une phrase à voix basse (`[whispers]`) au milieu d'un passage enlevé, une phrase
  très courte après une longue, un silence volontaire de 0,4–0,8 s avant le chiffre clé.
- **Les balises eleven_v3** jouent sans être lues : `[sighs]`, `[chuckles]`, `[laughs]`, `[sarcastic]`, `[curious]`,
  `[excited]`, `[whispers]`, `[short pause]`, `[pause]`, points de suspension. Vérifier à la transcription qu'aucune
  n'est prononcée.
- **Mesurer** chaque prise (`ref-frames.py` sur le WAV, ou la transcription Scribe) : débit 2,3–2,8 mots/s, plage de
  hauteur ≥ 6 demi-tons sur une phrase expressive (une voix plate en a 2–3), des pauses de 0,3–0,8 s entre idées.
  Comparer ces chiffres à ceux de la référence quand il y en a une.
- Garder 2–3 prises par bloc et choisir à la transcription (prononciation de la marque, débit, pauses) — dire que le
  choix est fait sur mesures et non à l'écoute.

## 5. Sous-titres

- Couche « sous-titres de la voix » incrustée dans les versions réseaux (beaucoup regardent sans le son) :
  2 lignes max, 32 caractères par ligne, 1–2 s par sous-titre, découpés sur les horodatages Scribe, dans la zone sûre,
  style de la marque (Archivo 700, fond encre à 80 %).
- Fichiers `.srt` par langue et par ouverture, livrés à côté des MP4 (Desktop / YouTube / LinkedIn).
- Les textes de marque à l'écran ne sont pas des sous-titres : ils ne doivent pas se superposer à la bande de
  sous-titres (réserve-lui sa zone dans chaque format).
