# Brief : MO12 « 600 km » (série recette 47 · vidéo 1 de la série A/B « sans vendre »)

Il voit une citadine 1 600 € moins chère que les mêmes près de chez lui, à 300 km, et fait 600 km un samedi pour
l'avoir. Le film lui montre le vendeur qui « croit » que la distribution est faite, l'achat qu'il fait quand même
parce qu'il a fait la route, et ce que la route lui a vraiment coûté : 578 €, presque un euro du kilomètre. Il repart
avec la méthode des pros : les 300 km se font au téléphone, en cinq questions, avec un prix max écrit avant de partir.

Écrit avec les skills recette-47, motion-studio et « L'art du hook ». Textes passés à Stop Slop. Planche validée en
images : `renders/maquette-hooks/planche-mo12.png` (source `maquette-hooks/planche-mo12.html`, mode `?zones=1` pour
tracer les zones sûres). Sources des chiffres et recherche : `docs/recherche-serie-ab.md`. Place dans la série :
`docs/serie-ab-achat-revente.md` (vidéo 1, famille « Récit 47 »).

```
Produit / URL : aucun, rien à vendre       Objectif : arrêt net, revisionnage, enregistrement, partage, commentaires
Plateforme : TikTok, puis Reels et Shorts  Public : débutants qui veulent se lancer dans l'achat-revente auto
Promesse : une affaire à 300 km se juge au téléphone en cinq questions ; sinon la route te fait acheter n'importe quoi.
CTA : « Ta question au vendeur, en commentaire. » (dit et écrit, 27,4 → 29,6 s) — ni produit, ni lien, ni code
Type / durée : motion design narratif, 29,6 s, image finale = image 0
Voix : Simon (ElevenLabs), ton MO5          Musique : Controlled Drop, passages de MO5, 120 BPM
Ouvertures : A = son calcul + « le vendeur, lui, sait pourquoi » / B = « Plus tu roules, plus tu l'achètes »
Format : 9:16, 1080×1920, 60 i/s           Données : exemple chiffré avec la formule de l'outil, mention à l'écran
Voiture : Clio III (Wikimedia Commons, M 93, domaine public, `assets/photos-mo10/car-clio3.png`), pas de plaque ni logo
Interdits : produit, logos de marques et de plateformes, plaques, visages, morale, « enregistre », chiffre non sourcé
```

## Hypothèse (recette v1 + CTA)

- **On garde** : huit ingrédients de MO5 sans retouche (son calcul en deux chiffres + un contradicteur du quotidien ;
  un chiffre héros toujours à l'écran ; une vraie voiture couverte d'étiquettes ; six coups en six secondes avec un
  gag ; le silence qui coûte ; la chute en deux phrases, le chiffre géant, la phrase en Fraunces ; le renversement
  appliqué au même exemple avec un verdict ; image finale = image 0). Même voix, même musique, même durée, même charte.
- **On change** (la variable de la série) : la demi-phrase de boucle (« La prochaine fois que tu te dis… ») devient un
  **CTA sans vente**, dit par Simon et écrit en carte de verre (bas de colonne, au-dessus de y = 1480) : « Ta question
  au vendeur, en commentaire. » La boucle reste visuelle.
- **Constante de toute la série, pas une variable** (recherche `docs/recherche-serie-ab.md`, axes 1-2) : sous-titres
  intégraux incrustés et synchronisés (Satoshi 700, fond encre à 80 %, dans la zone sûre, jamais sur un texte de
  marque), musique à l'image 0 sans fondu, voix avant 1 s, valeur annoncée avant 7 s (« six questions que tu n'as pas
  posées » à 5,9 s). MO5 n'avait pas de sous-titres incrustés : la comparaison V01 / MO5 porte donc sur CTA + sous-titres ;
  la comparaison propre du CTA est V01 / V02.
- **Imposé par le sujet, noté sans être testé** : le compteur héros monte (« Cette affaire te coûte », 0 → 578 €) au
  lieu de fondre ; l'accumulation colle des « ? » (les questions jamais posées) au lieu de débits bancaires ; l'attente
  devient le silence du parking.
- **On saura si** : commentaires pour 1 000 vues au-dessus de MO5 et de la médiane MO9–MO11, **sans** que la durée
  moyenne (en % de la vidéo) et la part encore là à 3 s tombent de plus de 20 % sous MO5. Commentaires en hausse et
  durée en baisse de plus de 20 % : le CTA parlé coûte la boucle, les épisodes suivants le passent à l'écrit seul.
- **Fabrication** : réutiliser `lib/kit47.js` (MO9–MO11) ; nouveau module « route de lumière » (trait SVG qui s'écrit
  avec la plume, caméra qui le suit) ; mesure : part d'images en mouvement (`ref-motion.py`) ≥ 80 %, rendu ≤ 60 min.

## Les 5 contrôles du sujet

1. **Envie** : il sort avec un geste qu'il peut faire ce soir (cinq questions au téléphone) et l'impression d'être
   plus malin que la route. 2. **Valeur** : cinq questions, la formule du prix max, le double verdict (avec / sans
   facture). 3. **Rien de proposé** : aucune fiche, aucun outil ; le CTA demande un avis, pas une action d'achat.
   4. **Chute** : « Presque un euro du kilomètre », puis la méthode ; l'image finale relance l'image 0. 5. **Tient
   dans un calcul** : « 1 600 € de moins, à 300 km ».

## Le hook (skill « L'art du hook »)

**Analyse** : douleur, il voit des affaires loin de chez lui et a peur de rater celle-là · croyance, « 1 600 € de
moins, ça vaut 300 km » · vérité, la route ne coûte pas de l'essence, elle lui fait acheter une voiture qu'il n'aurait
jamais prise au téléphone (coûts irrécupérables).

| | Levier | Voix | Écran | Image 0 |
|---|---|---|---|---|
| A | Croyance → vérité (mécanique MO5) | « Mille six cents de moins, à trois cents kilomètres. Le vendeur, lui, sait pourquoi. » | − 1 600 € · 300 km ? | annonce en verre, « − 1 600 € » géant, « ? » en Fraunces |
| B | Phrase impossible à ignorer | « Plus tu roules pour voir une voiture, plus tu l'achètes. Trois cents kilomètres, et tu vas le vérifier. » | Plus tu roules, plus tu achètes | route de lumière, phrase en Clash + Fraunces |
| C | Démonstration | « "La distribution ? Je crois que c'est fait." Tu as fait trois cents kilomètres pour entendre ça. » | « Je crois que c'est fait. » | la bulle seule dans le noir |
| D | Erreur intelligente | « Les débutants font trois cents kilomètres pour une affaire. Les pros font trois questions au téléphone. » | 300 km ou 3 questions | route qui s'allonge, trois pastilles |
| E | Coût caché chiffré | « Une affaire à trois cents kilomètres, ce n'est pas cent vingt euros d'essence. C'est cinq cent soixante-dix-huit euros. » | 120 € ? Non : 578 € | « 120 € » barré, « 578 € » qui roule |

**Recommandation** : A en ouverture (ingrédient 1 inchangé : seul le CTA varie), B en test (la thèse sans chiffre,
future variable « ouverture sans calcul », É4 du journal). **4 verrous de A** : Temps ✅ (« mille six cents de moins »
dans les quatre premiers mots) · Sens ✅ (deux phrases, aucun jargon) · Miroir ✅ (son calcul, en « tu ») · Écart ✅
(« le vendeur sait pourquoi » ouvre la question sans y répondre). **Relances** : « Samedi, six heures. » · le silence
du parking et « Je crois que c'est fait. » · « Alors tu l'achètes quand même. » · « Six cents kilomètres. » · « Ceux
qui gagnent font les trois cents kilomètres au téléphone. »

## L'histoire en 7 temps (29,6 s)

| Temps | Ce qu'on voit | Voix (≈ 68 mots, à chronométrer sur la prise) | Émotion |
|---|---|---|---|
| 0 → 4,2 · ouverture | annonce en verre (Clio, 2 900 €, « à 300 km »), « − 1 600 € » géant, « 300 km ? » ; musique dès 0,0 s, premier mot avant 0,3 s | Hook A | reconnaissance, sourire |
| 4,2 → 5,9 · jour 1 | palettes « SAM 6:02 », compteur « Cette affaire te coûte 0 € », la route de lumière part de chez toi | « Samedi, six heures. Tu pars. » | élan |
| 5,9 → 12,0 · la route | travelling le long de la route ; six « ? » se collent sur la voiture, un par temps (distribution, CT, carte grise, pourquoi ce prix, photos du compteur, carnet) ; le compteur suit les km (0,20 €/km) ; gag « Sandwich triangle · − 8 € » | « Trois cents kilomètres. Six questions que tu n'as pas posées. La distribution. Le contrôle technique. La carte grise. » | peur qui monte, rire |
| 12,0 → 15,6 · le parking | la voiture de près, palettes « 118 000 km », bulle du vendeur ; la musique perd sa basse | « La distribution ? » … (bulle : « Je crois que c'est fait. ») | doute |
| 15,6 → 20,9 · la chute | virement − 2 900 €, facture « Distribution · 600 € », « ton prix max au téléphone : 2 450 € », compteur 68 → 518 → 578 ; « 578 € » plein écran, musique coupée ; « Presque un euro du kilomètre. » | « Tu as fait trois cents kilomètres. Alors tu l'achètes quand même. Deux mille neuf cents. Au téléphone, ton prix max, c'était deux mille quatre cent cinquante. Six cents kilomètres. Cinq cent soixante-dix-huit euros. Presque un euro du kilomètre. » | rire jaune |
| 20,9 → 27,4 · le renversement | rembobinage au samedi matin ; carte « Avant de rouler · 5 questions » ; carte formule 4 300 − 456 − 600 − 750 = 2 450 (2 494 arrondi), « avec la facture : 3 050 » ; verdict en Fraunces | « Ceux qui gagnent font les trois cents kilomètres au téléphone. La distribution, la facture ? Pourquoi ce prix ? La carte grise, à votre nom ? Sans facture, ton prix max : deux mille quatre cent cinquante. Ou tu restes chez toi. » | soulagement, envie d'appeler |
| 27,4 → 29,6 · CTA + boucle | l'image 0 revient dans le même cadre ; carte de verre « Ta question au vendeur ? Écris-la en commentaire » | « Ta question au vendeur, en commentaire. » | relance |

## Les chiffres (exemple calculé avec la formule de l'outil, `web/src/lib/analyse/bilan.ts`)

| Poste | Montant | Source |
|---|---|---|
| Annonce | Clio III 1.2 16V 75, 2010, 118 000 km, 2 900 €, à 300 km | exemple, **à confirmer** en passant une vraie annonce dans l'outil avant tournage |
| Les mêmes près de chez toi | 4 500 € (médiane) → revente visée 4 300 € (× 0,96, arrondi aux 50 €) | exemple ; formule de l'outil |
| Carte grise | 186 € (5 CV × 34,475 € IDF 2026, abattement 50 % après 10 ans, + 13,76 €) | `docs/timeline-mo5.md` (eplaque, Ornikar) |
| Frais fixes | 150 € | formule de l'outil |
| Trajet | 600 km × 0,20 € = 120 € | `profil.ts` (kmCost 0,20) |
| Distribution courroie + pompe à eau | 600 € (400 à 800 € en garage ; 445 à 826 € sur Clio selon moteur) | `docs/timeline-mo6.md` (AD, Carter-Cash, iDGARAGES) ; intervalle du D4F et confirmation « courroie, pas chaîne » : `docs/recherche-serie-ab.md` |
| Marge voulue | 750 € | `profil.ts` (margeMin), règle de l'utilisateur (« sous 750 €, je n'achète pas ») |
| Prix max sans facture | 4 300 − 186 − 150 − 120 − 600 − 750 = 2 494 → **2 450 €** | arrondi aux 50 € inférieurs |
| Prix max avec facture | 4 300 − 456 − 750 = 3 094 → **3 050 €** | idem |
| Ce que la route a coûté | 2 900 − 2 450 = 450 € + 120 € + 8 € (gag) = **578 €** | la distribution est la raison du prix max, pas comptée deux fois |

Mention à l'écran de 4,2 à 27,4 s : « Exemple · ordres de grandeur, petite citadine ».

## Ce qu'on enregistre, ce qu'on envoie, ce qu'on commente

Enregistrer : les cinq questions et la formule, à ressortir avant d'appeler un vendeur. Envoyer : « Je crois que
c'est fait » et le sandwich, au pote qui fait 300 km samedi. Commenter : la question qu'on pose, soi, toujours (le
CTA) ; les meilleures nourrissent un épisode « vos questions au vendeur ».

## Production : les 5 étapes

1. Brief et planche (ce document, `planche-mo12.png`) → « OK ». 2. Timeline seconde par seconde, chiffres
confirmés dans l'outil, 3 à 5 images tests rendues. 3. Maquettage toutes les 0,1 s. 4. Voix : Simon, une génération,
estimation des crédits et solde vérifiés avant. 5. Animation, son, `qa_video.py` sans FAIL, boucle mesurée, SRT,
couverture tirée de l'image 0.

## Ce qu'il me faut

1. Ton « OK » sur la planche et le hook A, ou ce que tu changes (sujet, CTA, chiffres).
2. Une vraie annonce de Clio III 1.2 (ou d'une autre citadine à courroie) passée dans l'outil, pour remplacer
   l'exemple par des chiffres calculés.
3. Ton solde ElevenLabs avant l'étape 4.
