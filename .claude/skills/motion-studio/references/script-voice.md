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

## 2. Deux ouvertures A/B

Les deux variantes ne changent **que les 0–3 premières secondes** (image + voix + texte) et se raccordent au même
corps de film à la même frame. Sinon on ne sait pas ce qu'on teste.

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
5. Si le connecteur n'est pas disponible ou si l'utilisateur refuse de dépenser : voix de l'utilisateur (il enregistre
   d'après le script minuté) ou film sans voix, textes à l'écran seulement — dis-le clairement, c'est un compromis.

Contrôle d'une prise : débit dans le budget, noms et chiffres bien prononcés, pas de souffle ou de clic en tête,
énergie qui démarre à la première syllabe (le hook se joue là).

## 5. Sous-titres

- Couche « sous-titres de la voix » incrustée dans les versions réseaux (beaucoup regardent sans le son) :
  2 lignes max, 32 caractères par ligne, 1–2 s par sous-titre, découpés sur les horodatages Scribe, dans la zone sûre,
  style de la marque (Archivo 700, fond encre à 80 %).
- Fichiers `.srt` par langue et par ouverture, livrés à côté des MP4 (Desktop / YouTube / LinkedIn).
- Les textes de marque à l'écran ne sont pas des sous-titres : ils ne doivent pas se superposer à la bande de
  sous-titres (réserve-lui sa zone dans chaque format).
