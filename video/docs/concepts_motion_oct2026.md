# 5 concepts motion : un sujet fort, un hook, une fin Utopicar (11 octobre 2026)

Écrit avec les skills motion-studio et « L'art du hook ». Chaque sujet passe d'abord le filtre 3C :
- **Noyau** : le débutant en achat-revente, notre cible.
- **Cercle** : tout acheteur ou vendeur de voiture d'occasion, qui regarde sans être client.
- **Curiosité** : l'inconnu qui tombe dessus et veut la réponse.

Chaque concept a sa propre grammaire de motion et finit sur une vraie fonction de l'outil, une différente par film.

**Maquette 9:16 (11 octobre 2026)**, dans la grammaire du film « wow » (master60w) : `renders/planches/concepts-1.jpg`
à `concepts-5.jpg` (5 écrans annotés par concept) et `concepts-hooks.jpg` (les 5 images 0). Source : branche
`claude/master60`, `video/maquette-concepts/` et `scripts/maquette-concepts.mjs`, `scripts/planche-concepts.py`
(pas encore commités). Trois hooks ont changé pour reprendre les vrais chiffres de l'app :
- 3 : « Deux 208. Une à 7 190 €, une à 8 200 €. J'achète la plus chère. » (fiche 208 PureTech 4/10 et 208 BlueHDi + 760 €)
- 4 : « Mercedes à 19 990 € ou Yaris à 8 990 € : une des deux te fait perdre 2 700 €. » (− 2 700 € et + 1 240 €)
- 5 : « Annonce : 131 000 km. Photo du compteur, dans la même annonce : 184 000 km. » (l'outil lit le compteur sur
  les photos, `vigilance.ts`)

Recoupements avec les briefs de master60 : MO8 « Les 5 moteurs » touche le sujet du concept 3, MO6 « Ce qui se voit,
ce qui se cache » celui du concept 1.

| # | Concept | Sujet amélioré | Motion | Fin Utopicar |
|---|---|---|---|---|
| 1 | Le dictionnaire du vendeur | Ce que coûtent les phrases rassurantes des vendeurs | Typo cinétique, plongée à travers les lettres | Défauts lus dans le texte et chiffrés |
| 2 | 15 minutes | Les bonnes affaires vivent 15 minutes | Horloge radar, l'aiguille sert de volet | Recherche en direct |
| 3 | Deux 208, un mot | Un mot du titre décide si la voiture se revend | Miroir parfait qui décroche | Fiabilité moteur et boîte |
| 4 | Choisis ta voiture | La plus belle annonce perd le duel | Écran de sélection de jeu vidéo | Note, « Il vous reste », prix max |
| 5 | Le compteur qui recule | Un kilométrage qui baisse entre deux contrôles | Tableau d'enquête, fil rouge qui devient courbe | Relevés de kilométrage comparés |

---

## 1. Le dictionnaire du vendeur (30 s)

**Sujet** : « les défauts dans les annonces » devient **ce que coûtent, en euros, les phrases qui rassurent**. Format
de série : un épisode, une phrase traduite.

- Noyau : il lit des dizaines d'annonces sans savoir chiffrer ce qu'il lit.
- Cercle : tout le monde a déjà lu « rien à prévoir » ou « petit bruit, rien de grave ».
- Curiosité : traduire le langage des vendeurs fait rire et se partage.

**Hook**
- Voix : « "Juste un voyant, rien de grave." Dans une annonce, cette phrase peut te coûter 1 500 €. »
- Écran : « Rien de grave » = 1 500 €
- Image 0 : la phrase entre guillemets en lettres géantes, un coup de surligneur déjà en train de la barrer.

| t | Ce qu'on voit | Ce qu'on entend |
|---|---|---|
| 0–3 s | Le hook. Le chiffre 1 500 € se retourne au dos de la phrase. | Hook, impact sur « 1 500 ». |
| 3–17 s | Trois phrases traduites. « Petit bruit au démarrage » : 100 à 600 €, origine inconnue. « Embrayage un peu haut » : 500 à 900 €. « Clim à recharger » : 80 à 450 €. | Une phrase par mesure, un « tchk » d'étiquette à chaque retournement. |
| 17–21 s | Les quatre étiquettes s'empilent : une annonce, jusqu'à 3 450 €. | Silence d'une demi-seconde, puis le total. |
| 21–27 s | Les étiquettes tombent dans la vraie fiche Utopicar et deviennent ses lignes de défauts, extraits surlignés. | « Utopicar lit l'annonce et chiffre chaque phrase. Avant que tu appelles. » |
| 27–30 s | CTA. | « Écris en commentaire la phrase de vendeur que tu veux que je traduise. » |

**Motion** : typographie cinétique en macro. La caméra plonge à travers l'œil d'une lettre (le « o » de « voyant ») et
ressort dans la phrase suivante, sans coupe. Chaque phrase se retourne comme une étiquette : au recto les mots du
vendeur, au verso le coût. Surligneur tracé à la main, flou de bougé sur chaque plongée.

**Chiffres** : grille de coûts de l'outil (`web/src/lib/analyse/defauts.ts`) : voyant 100 à 1 500 €, bruit 100 à
600 €, embrayage 500 à 900 €, clim 80 à 450 €. Total des maximums : 3 450 €. Ce sont des fourchettes de l'outil, pas
des données démo ; on écrit « jusqu'à ».

**Bonus** : le CTA fournit les épisodes suivants.

---

## 2. 15 minutes (30 s)

**Sujet** : « mets des alertes » devient **pourquoi tu ne vois jamais les bonnes affaires : elles restent en ligne
15 minutes**.

- Noyau : le débutant qui croit qu'il n'y a plus de bonnes affaires.
- Cercle : tout le monde a déjà reçu « Désolé, déjà vendue ».
- Curiosité : qui achète une voiture en 15 minutes ?

**Hook**
- Voix : « Cette Mégane 3 à 1 500 € est restée en ligne 15 minutes. Toi, tu l'as vue à la seizième. »
- Écran : En ligne : 15 min
- Image 0 : un cadran d'horloge plein cadre, la carte de l'annonce sous l'aiguille qui balaie déjà.

| t | Ce qu'on voit | Ce qu'on entend |
|---|---|---|
| 0–3 s | Le hook. | Hook, la trotteuse donne le tempo. |
| 3–12 s | Minute 0 : en ligne. Minute 2 : le premier appel. Minute 15 : la carte est aspirée au centre du cadran (annonce supprimée). Minute 16 : ton message, « Toujours dispo ? », la réponse, « Désolé, déjà vendue. » | Un tic par minute, la musique accélère avec l'aiguille. |
| 12–18 s | Relance : « Celui qui l'a eue ne cherchait pas. Il a reçu une alerte. » Ton vécu : tes journées à faire défiler les annonces. | La musique tombe sur « alerte ». |
| 18–26 s | L'aiguille repart en arrière jusqu'à la minute 0. Ton téléphone vibre : la vraie recherche en direct, nouvelle annonce comparée au marché, pastille « Vraie affaire ». | « Avec Utopicar, l'annonce arrive sur ton téléphone. Minute zéro. » |
| 26–30 s | CTA. | « Commente DÉBUTANT. » |

**Motion** : horloge radar. L'aiguille des minutes sert de volet : chaque balayage révèle la scène suivante dans le
secteur qu'elle traverse, avec une traînée. Pour la solution, l'aiguille se rembobine. La musique est calée sur la
trotteuse (120 BPM : deux tics par seconde).

**Chiffres** : Mégane 3 à 1 500 €, partie en 15 minutes : ton vécu (script n° 3). Recherche en direct : base démo,
mention « Données de démonstration ». On montre la pastille, pas la cote chiffrée (réservée aux abonnés).

---

## 3. Deux 208, un mot (30 s)

**Sujet** : « les voitures à éviter », le sujet n° 1 de la niche (345 k chez @flo.vma, 298 k chez @achatreventeauto),
devient **un jeu des différences : un seul mot du titre décide si la voiture se revend**.

- Noyau : le débutant qui choisit sa première voiture.
- Cercle : les propriétaires de 208, C3 et 2008 commentent pour défendre la leur.
- Curiosité : on cherche la différence avant d'avoir la réponse.

**Hook**
- Voix : « Deux 208 de 2014, même prix, même kilométrage. Je n'en achète qu'une. »
- Écran : Trouve la différence
- Image 0 : deux 208 identiques en miroir parfait, la caméra déjà en travelling.

| t | Ce qu'on voit | Ce qu'on entend |
|---|---|---|
| 0–3 s | Le hook. | Hook. |
| 3–8 s | « 3 secondes. » Une loupe balaie les deux annonces, compte à rebours. | Tic-tac, la musique retient sa basse. |
| 8–12 s | La loupe s'arrête sur le titre : « 1.2 PureTech » d'un côté, « 1.6 HDi » de l'autre. | Impact sur « PureTech ». |
| 12–19 s | Schéma tracé en code : l'huile monte sur la courroie. « Et tes acheteurs le savent. » | « Courroie dans l'huile, consommation d'huile. » |
| 19–23 s | Le mot se cache ailleurs : C3, 2008, 301, puis le TCe 120 chez Renault et les boîtes EDC, DSG. | Un pop par modèle. |
| 23–28 s | Tu colles l'annonce dans Utopicar : la ligne fiabilité tombe en clair. | « Utopicar te le dit avant que tu te déplaces. » |
| 28–30 s | CTA. | « Commente le moteur de ta voiture, je te dis si je l'achèterais. » |

**Motion** : symétrie miroir. Les deux côtés bougent en parfait miroir (même travelling, même lumière). Quand la
différence est trouvée, le miroir décroche : le côté PureTech se désynchronise, glisse et s'assombrit, le cadre se
recentre sur la HDi. Le schéma moteur est un dessin au trait animé en SVG, sans image générée.

**Chiffres** : texte de l'outil (`web/src/lib/analyse/fiabilite.ts`) : « 1.0 / 1.2 PureTech ou VTi 3 cylindres :
courroie dans l'huile, consommation d'huile » ; fiche 208 : « En diesel seulement : les essence de cette tranche sont
des PureTech. » Ta règle (script n° 7). Image : une seule photo Pexels de 208 mise en miroir, plaques floutées.

---

## 4. Choisis ta voiture (30 s)

**Sujet** : « l'analyse d'une annonce » devient **un duel où le spectateur parie avant la réponse, et où la plus belle
annonce perd**.

- Noyau : le débutant qui hésite entre deux annonces.
- Cercle : tout le monde a déjà hésité entre deux voitures.
- Curiosité : on parie, on veut savoir si on a gagné.

**Hook**
- Voix : « Golf à 9 500 € ou Clio à 6 400 € : une des deux te fait perdre 1 200 €. »
- Écran : 1 des 2 te coûte 1 200 €
- Image 0 : un écran de sélection de jeu de combat, les deux voitures sur socles tournants, le curseur qui hésite.

| t | Ce qu'on voit | Ce qu'on entend |
|---|---|---|
| 0–3 s | Le hook. | Hook, son de menu de jeu. |
| 3–9 s | Les fiches se remplissent comme des stats de personnage : « Distribution faite », « CT OK », « 2 propriétaires ». La Golf gagne toutes les barres. | Une note montante par barre. |
| 9–12 s | « 3 secondes. Choisis. » Compte à rebours, le curseur se pose sur la Golf. | Trois bips. |
| 12–20 s | « VS » claque. Les barres de vie deviennent la marge : la Golf tombe à − 1 200 €, note 38/100, « N'achète pas à ce prix. Prix max : 7 500 €. » La Clio monte à + 1 932 €, 92/100. | « K.O. » sur la Golf. |
| 20–26 s | La vraie fiche Utopicar des deux annonces. | « La plus belle annonce était la pire affaire. » |
| 26–30 s | CTA. | « Dis en commentaire laquelle tu aurais prise. » |

**Motion** : interface de jeu vidéo. Socles tournants (orbite permanente), barres qui se remplissent en springs
snappy, slam « VS » avec impact, barres de vie qui se vident en continu.

**Chiffres** : base démo (`video/scripts/demo-data.mjs`) : Golf VII 9 500 €, 38/100, − 1 200 €, prix max 7 500 € ;
Clio IV 6 400 €, 92/100, + 1 932 €. Mention « Données de démonstration ».

---

## 5. Le compteur qui recule (30 s)

**Sujet** : « les arnaques » devient **un kilométrage qui baisse entre deux contrôles techniques, et comment le voir
en 10 secondes, gratuitement**. Le partage pour protéger un proche est le ressort mesuré dans la veille
(15 900 partages sur l'arnaque à la station-essence d'@enseignant_automatique).

- Noyau : le revendeur qui rachète un compteur trafiqué le revend avec, et en répond.
- Cercle : tout acheteur d'occasion, et celui qui envoie la vidéo à son pote.
- Curiosité : l'enquête.

**Hook**
- Voix : « 184 000 km au contrôle technique de 2022. 131 000 km sur l'annonce de 2026. »
- Écran : Le compteur a reculé
- Image 0 : un tableau de liège, deux documents punaisés, le fil rouge déjà tendu entre les deux chiffres.

| t | Ce qu'on voit | Ce qu'on entend |
|---|---|---|
| 0–3 s | Le hook. | Hook, le fil qui se tend. |
| 3–10 s | Les PV de 2020 et 2022 et l'annonce, punaisés. Le fil rouge relie les relevés et dessine la courbe du kilométrage : elle monte, puis redescend. | Punaises, fil, la musique descend avec la courbe. |
| 10–16 s | Le conseil gratuit : « Demande le rapport HistoVec au vendeur. C'est gratuit. S'il refuse, tu passes. » | Voix seule. |
| 16–25 s | Tu colles l'annonce et le PV dans Utopicar : « Kilométrage incohérent », note plafonnée à 25/100, « N'achète pas ». | « Utopicar compare les relevés pour toi. » |
| 25–30 s | CTA. | « Envoie ça à ton pote qui cherche une voiture. » |

**Motion** : fait main. Papier, punaises, fil rouge qui se tend ; travelling latéral continu le long du tableau ; le
fil tendu entre les punaises devient le graphique ; mise au point qui glisse d'un document à l'autre.

**Chiffres** : 184 000 et 131 000 km sont un exemple. Il faut créer ce dossier dans la base démo pour que l'outil le
juge lui-même (`deal.ts` : compteur suspect, note plafonnée à 25, verdict négatif). Mention à l'écran.

---

## Règles communes

- Vraie interface d'Utopicar à la fin, aucune interface imaginée. Aucun logo de plateforme.
- Images : vraies photos (Pexels, Mixkit), plaques floutées, schémas et décors en code. Aucune image générée.
- Caméra qui ne s'arrête jamais, chaîne sans coupe, flou de bougé (`references/fluidite.md`).
- Voix : ElevenLabs demande un forfait payant depuis le 8 octobre. Sinon ta voix d'après le script, ou une version
  sans voix avec textes à l'écran.

## Recommandation

Commencer par le 1 (une série que les commentaires alimentent) et le 3 (le sujet qui marche le mieux dans la niche,
transformé en jeu).
