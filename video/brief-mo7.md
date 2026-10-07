# Brief : MO7 « Une semaine » (30 s max, voix off)

Troisième vidéo d'attention. Décisions de l'utilisateur après MO6 :
- **Plus de Polo**.
- **On reste en motion design**, avec la charte de MO5 et MO6 (fond sombre, orange, verre, lumière qui écrit, Clash,
  Satoshi, Fraunces), mais avec **des éléments graphiques qui font réalistes**.
- **Tout doit être cohérent** : un seul éclairage, une seule matière, une seule grammaire de mouvement, du premier
  au dernier plan, et avec les vidéos précédentes.
- Pas de rendu « IA », pas de rendu « page web ».

Le sujet : la semaine d'un achat-revente, du lundi au samedi, en 30 secondes. Une voiture trouvée lundi, achetée
mardi, préparée mercredi, photographiée jeudi, demandée vendredi, revendue samedi. Chaque jour, un objet réaliste et un
chiffre. Le débutant voit que c'est faisable, et repart avec la méthode jour par jour.

Écrit avec les skills motion-studio et « L'art du hook ». Textes passés à Stop Slop.

```
Produit / URL : aucun, rien à vendre       Objectif : arrêt net, revisionnage, enregistrement et partage spontanés
Plateforme : TikTok, puis Reels et Shorts  Public : débutants qui veulent se lancer dans l'achat-revente auto
Promesse : une voiture achetée lundi peut repartir samedi, avec une marge, si chaque jour a sa tâche.
CTA : aucun, rien de proposé, ni dit ni écrit  Type / durée : motion design 3D réaliste, 28 à 30 s, en boucle
Voix : Simon (ElevenLabs), même voix que MO5 et MO6
Musique : nouveau passage ou nouveau morceau (120 BPM), plus lumineux que MO6
Ouvertures : A = « lundi / samedi » / B = « 6 jours, 6 gestes » (0-3,5 s, même corps)
Format : 9:16, 1080×1920, 60 i/s           Données : exemple chiffré, sourcé à l'étape 2, mention à l'écran
Interdits : la Polo, toute marque ou plaque lisible, produit, logo de plateforme, CTA, morale, visages
```

## Le hook (skill « L'art du hook »)

**Analyse** : douleur visée, il croit que l'achat-revente prend des semaines et qu'il risque de rester bloqué avec la
voiture · croyance, « il faut du temps, de l'expérience et de la chance » · vérité, une revente rapide est une suite
de gestes simples, un par jour.

| | Levier | Voix | Texte à l'écran |
|---|---|---|---|
| A | Démonstration, bénéfice | « Lundi, tu la trouves à 4 200. Samedi, tu la revends 4 900. Voilà ta semaine. » | Lundi → Samedi |
| B | Phrase impossible à ignorer | « Une revente rapide, c'est six jours et six gestes. Pas un de plus. » | 6 jours. 6 gestes. |
| C | Croyance → vérité | « Tu crois qu'il faut des mois pour revendre une voiture. Il faut une semaine bien rangée. » | Une semaine bien rangée |

**Recommandation** : A en ouverture, B en test. A pose deux jours et deux prix : le sujet et l'enjeu sont clairs dès
la première phrase, et « voilà ta semaine » ouvre la question « comment ? ».

**Les 4 verrous de A** : Temps ✅ (lundi, un prix, dès le premier mot) · Sens ✅ (trois phrases courtes) ·
Miroir ✅ (« tu », sa première voiture) · Écart ✅ (il pense des semaines ; on lui montre six jours).

## L'histoire

Un calendrier à palettes (le procédé de MO5) change de jour à chaque plan. Chaque jour a son objet réaliste, son geste
et son chiffre.

| Temps | Jour | Objet réaliste | Ce qui se passe | Voix (provisoire) |
|---|---|---|---|---|
| 0-3,5 s | **Lundi** | un téléphone | L'écran s'allume dans le noir : une annonce, 4 200 €. Un trait de lumière entoure le prix. | Hook A |
| 3,5-8 s | **Mardi** | des billets et un trousseau de clés | Les billets se posent un à un sur une surface sombre, les clés tombent dessus. « 4 200 » est barré, « 3 900 » s'écrit. | « Mardi, tu négocies : 3 900. » |
| 8-13 s | **Mercredi** | la voiture sous sa bâche, des flacons de nettoyage | La bâche glisse, la carrosserie brille sous la lumière qui passe ; les flacons tournent autour. Compteur : « + 40 € ». | « Mercredi, tu la prépares. Quarante euros de produits. » |
| 13-17 s | **Jeudi** | un appareil photo | Éclair du flash : une photo se développe en carte d'annonce, 4 900 €. | « Jeudi, une vraie photo, un vrai prix. » |
| 17-21 s | **Vendredi** | le téléphone | Il vibre, les messages s'empilent en verre : « Toujours dispo ? » × 6. | « Vendredi, ça sonne. » |
| 21-25 s | **Samedi** | les clés, des billets | Les clés repartent dans une main, les billets reviennent. Le compteur roule : + 960 €, puis « marge » en Fraunces. | « Samedi, elle part. » |
| 25-28,5 s | **Dimanche** (chute) | le téléphone | Le téléphone se rallume : une nouvelle annonce. | « Dimanche, tu recommences. » |
| 28,5-30 s | **Lundi** | | La palette repasse sur « Lundi » : image 0. | (enchaîne sur « Lundi… ») |

Les chiffres sont un exemple (achat, frais, revente, marge). À l'étape 2, je vérifie qu'ils tiennent debout pour une
citadine d'occasion, frais compris (produits, annonce, carte grise si elle est à ta charge), comme pour MO5.

## Les éléments réalistes (nouveau)

- **Source** : objets scannés en 3D de Poly Haven (licence CC0, libres pour un usage commercial), accessibles
  depuis cet environnement : voiture sous bâche (`covered_car`), flacons de nettoyage, appareil photo, réveil, clés à
  molette, pneu. Le téléphone, les billets et les clés sont modélisés en code (formes simples, matières réalistes),
  sans marque ni texte lisible d'une vraie banque.
- **Rendu** : vraie 3D (Three.js) dans le même film que le reste, image par image, avec les mêmes contraintes que
  MO5 et MO6 (rendu déterministe, flou de bougé, boucle parfaite).
- **Un seul éclairage pour tout** : une lumière orange chaude en haut à gauche, un liseré froid derrière, une
  ambiance sombre d'atelier (HDRI Poly Haven, CC0). Les reflets du verre et du métal viennent de la même pièce.
- **Une seule matière de mise en scène** : chaque objet est posé sur la même surface sombre et brillante, avec son
  reflet et son ombre de contact ; jamais flottant au hasard.

## La charte (identique à MO5 et MO6)

- Fond #08070a, orange #ff5a1f / #ff8a4c / #ffb38a, encre #f6efe7.
- Clash Display pour les chiffres, Satoshi pour les étiquettes, Fraunces italique pour le mot porteur.
- Verre dépoli pour les cartes et notifications, écriture à la lumière, compteurs à rouleaux, palettes, grain,
  vignettage.

## La grammaire de mouvement (cohérence totale)

1. **Une seule caméra** qui ne coupe jamais : elle glisse d'un objet au suivant, toujours à la même hauteur, avec la
   même focale.
2. **Un objet amène le suivant** : la lumière du téléphone éclaire les billets, la clé qui tombe fait glisser la
   bâche, le flash de l'appareil photo devient la carte d'annonce. Aucun fondu entre les jours.
3. **Les mêmes ressorts partout** : ce qui arrive ralentit, ce qui part accélère ; pas de rebond sur le texte.
4. **Les jours tombent sur la grille musicale** : un jour toutes les deux mesures (4 s à 120 BPM), la palette sur le
   premier temps.
5. **Une seule source de lumière qui bouge** : la plume orange qui écrit les chiffres est aussi la lumière qui passe sur
   les objets.

## Pourquoi on l'enregistre, on la revoit et on l'envoie (sans qu'on le lui demande)

- **Enregistrer** : la semaine type, un geste par jour, avec les chiffres.
- **Revoir** : la boucle « dimanche → lundi » relance tout de suite.
- **Envoyer** : à l'ami qui dit « un jour je me lance ».
- **Commenter** : chacun voudra raconter sa revente la plus rapide.

## Production

Mêmes 5 étapes que MO5 et MO6. À l'étape 2, en plus de la timeline : une planche des objets réalistes sous le même
éclairage, pour valider le rendu avant d'animer.

## Ce qu'il me faut

1. Ton « OK » sur ce brief, ou ce que tu changes.
2. Tes vrais chiffres d'une revente rapide (achat, frais, revente, délai), s'ils sont plus parlants que l'exemple.
