# Script — master60 (porte 2)

Brief : `brief-master60.md`. Français seulement, voix de Simon incarné, 60 s, ouvertures A/B (0–3 s) sur un même corps.

## 1. En une ligne chacun
- **Qui** : le débutant qui achète sa première voiture à revendre, et le marchand qui a déjà du stock.
- **Douleur** : une annonce qui a l'air bien cache des travaux ; un stock qui dort mange la marge.
- **Promesse** : avant d'acheter, tu sais ce qu'il te restera, frais déduits ; après, le tableau de bord te dit quoi faire.
- **Preuve** : deux vraies annonces analysées (208 déconseillée, Mercedes Classe A 2017 à 12 990 €), le vrai tableau de bord.
- **Action** : « Essaie trois jours, sans carte bancaire. Lien en bio. »

## 2. Ce qu'on reprend des références (grammaire, pas contenu)
Études image par image de 14 films « Product UI » de prompt-motion.com (`refs` hors dépôt).
| Référence | Ce qu'on en garde |
|---|---|
| AllInvestView (42 s) | Chapitres numérotés « 01 · … » ; un titre en deux tons (encre + accent) et **une** vraie pièce d'UI qui s'anime par chapitre ; fond qui change de couleur à chaque chapitre ; une scène toutes les 1,6 s |
| AjustaCV (prix) | Le coût qui monte à côté d'un prix fixe : la valeur avant le prix |
| Winkz (pitch) | La même carte change d'état, rouge (problème) puis verte (solution) |
| Dub, Taxtello | Compteurs qui roulent, courbes qui se tracent, anneau qui se remplit : le plaisir de voir les chiffres se ranger |
| Enxovaly | Le chaos (mur d'icônes) qui se range en une liste propre |
| twoclipping (UI morph, photo print) | Une seule forme qui passe d'état en état sans coupe : bouton → chargement → coche ; le bouton de commande devient la barre de progression |
| Supademo | Un mot par temps musical, fond plein cadre qui change de couleur |

Rythme visé : une nouvelle chose toutes les 1,5 à 2 s, presque pas de coupes franches (chaîne continue, raccords par la forme).

## 3. Ouvertures (skill art-du-hook)

**A, le débutant.** Douleur : peur de perdre de l'argent sur la première. Croyance : « pas chère, c'est une bonne
affaire ». Vérité : le prix affiché cache les travaux, et tu les paies après.
| | Variante | Voix (≈ 3 s) | Écran |
|---|---|---|---|
| **A1 ✔** | Coût caché | « Ta première voiture à revendre… tu peux la payer deux fois. » | « Payée deux fois ? » |
| A2 | Croyance → vérité | « Ta première revente, tu la gagnes le jour où tu achètes. » | « Gagnée à l'achat. » |
| A3 | Question directe | « Ta première voiture à revendre : il te restera combien ? » | « Il te restera combien ? » |

**B, le marchand.** Douleur : trop d'annonces à trier, et une erreur mange la marge. Croyance : « avec l'œil du
métier, je trie vite ». Vérité : l'œil ne lit pas les travaux que l'annonce tait.
| | Variante | Voix (≈ 3 s) | Écran |
|---|---|---|---|
| **B1 ✔** | Miroir + volume | « T'es marchand ? Cinquante annonces à trier ce matin. » | « 50 annonces ce matin. » |
| B2 | Phrase impossible à ignorer | « Ton œil de marchand ne lit pas ce que l'annonce cache. » | « Ce que l'annonce cache. » |
| B3 | Erreur intelligente | « Même les marchands qui ont l'œil achètent des travaux cachés. » | « Des travaux cachés. » |

Recommandation : **A1** (la boucle « payée deux fois » se referme à 7 s sur les 1 650 € de travaux, avec un sourire)
et **B1** (le marchand se reconnaît dans le volume, sans qu'on lui fasse la leçon). Les deux se raccordent à 3,0 s
sur la même image : la vraie annonce de la 208 à 7 190 €, et « Celle-là… tu l'achètes ? ».
Image 0 des deux ouvertures : la carte de l'annonce déjà pleine, le texte d'ouverture lisible, son à la frame 0.

## 4. Script minuté (≈ 145 mots dits, 60 s)

| t (s) | Voix (Simon) | Écran (≤ 6 mots) | Image | Son |
|---|---|---|---|---|
| 0–3 (A) | Ta première voiture à revendre… tu peux la payer deux fois. | « Payée deux fois ? » | Vraie annonce 208 (photo, 7 190 €, 2016 · 116 789 km) pleine image dès la frame 0, la caméra glisse | attaque groove + voix à 0 s |
| 0–3 (B) | T'es marchand ? Cinquante annonces à trier ce matin. | « 50 annonces ce matin. » | Mur de 50 vraies cartes d'annonces qui défilent ; la 208 sort du mur et vient au centre | idem, petits clics de cartes |
| 3–5 | Celle-là… tu l'achètes ? | « Tu l'achètes ? » | Surligneur sur 7 190 € | un temps de silence musical |
| 5–10 | Je colle l'annonce. **Ah. Non.** Mille six cent cinquante euros de travaux. L'annonce a oublié de le dire. | « 01 · Avant d'acheter » puis « N'achète pas à ce prix. » | Le lien glisse dans le vrai champ ; le bouton Analyser devient chargement puis verdict « Déconseillée » ; la carte vire au rouge ; ticket : 7 190 € + 1 650 € = 8 840 € (cote 5 950 €) | **la musique s'arrête net sur « Ah. »**, impact grave, reprise basse seule sur « Mille… » |
| 10–14 | C'est UTOPICAR. Tu colles l'annonce, tu sais ce qu'il te restera, frais déduits. | « Ta marge, *frais déduits.* » | Logo ; les trois étapes du site s'allument : Colle l'annonce → Frais déduits → Ta marge nette | groove complet |
| 14–20 | Et celle-là ? **[verdict de l'outil]**. Ton offre : **[écart]** de moins. *(petit rire)* Ah ouais. | « [verdict en clair] » puis « − [écart] € » | Vraie annonce Mercedes Classe A 2017, 138 000 km, 12 990 € (photo recadrée : ni logo du vendeur, ni filigrane, ni plaque) ; verdict de l'outil ; la ligne « Prix d'offre » surlignée ; compteur qui roule 12 990 → [offre] | pop sur le verdict, petite montée |
| 20–24,5 | Et avec quinze voitures en stock ? *(soupir)* Le carnet, la calculette, quatorze onglets… | « 02 · Après l'achat » | Gag : un carnet griffonné, une calculette, des onglets de navigateur qui s'empilent (génériques, aucun logo) … puis tout se range d'un coup dans une seule page | empilement qui accélère, puis « snap » net |
| 24,5–36 | Ton tableau de bord te dit quoi faire ce matin. La 308 dort depuis soixante-trois jours ? Baisse le prix. Une A3 sort sous la cote ? Tu as l'alerte. Et ta vraie marge, voiture par voiture. | « Votre journée » · « 63 jours en stock » · « − 18 % sous la cote » · « Ta marge, voiture par voiture. » | Vrai tableau de bord (données démo) : la carte « Votre journée » et sa ligne « 63 jours en stock · Ajuster le prix » ; la carte Marché « −18 % sous la cote » ; le graphique des marges dont les barres poussent, compteurs de KPI | un accent par ligne, sur les temps |
| 36–44 | Tu débutes ? Starter. Une seule voiture bien achetée te paie trois ans d'abonnement. Tu gères un parc ? Pro. | « Starter 14,99 € » · « + 670 € = 44 mois » · « Pro 79 € » | Les deux vraies cartes de formules ; sous Starter, la marge d'une voiture bien achetée remplit une jauge de 44 mois d'abonnement | montée |
| 44–49 | Essaie trois jours, sans carte bancaire. Lien en bio. | « 3 jours offerts » · « Lien en bio → » | Bouton orange cliqué par le curseur ; « Sans carte bancaire » coché | clic, accent |
| 49–55 | Ta prochaine marge, chiffrée avant d'appeler. UTOPICAR. | « Ta prochaine marge, *chiffrée avant d'appeler.* » | Titre en deux tons, le logo se pose | accord |
| 55–60 | — | Logo + « 3 jours offerts · Lien en bio » | Carton final ≤ 5 s, mention des données | fin nette |

16:9 : « Lien en bio » devient « utopicar.fr » (voix : « sur utopicar point fr »).

## 5. Humour et satisfaction
- **Humour** : « Ah. Non. » avec la musique qui s'arrête net ; « L'annonce a oublié de le dire. » ; le soupir sur la pile
  d'onglets ; « La 308 dort depuis soixante-trois jours » (la phrase vient de l'app : « Le capital dort »).
- **Satisfaction** : le bouton qui devient chargement puis verdict, sans coupe ; le compteur 12 990 → prix d'offre ; la pile
  d'onglets qui se range d'un coup en une page ; les barres de marge qui poussent ; la jauge « 44 mois » qui se remplit.

## 6. Chiffres dits ou montrés, et leur source
| Chiffre | Source |
|---|---|
| 208 à 7 190 €, + 1 650 € de travaux, prix réel 8 840 €, cote 5 950 €, « Déconseillée » | vraie annonce du 3 oct. 2026 analysée par l'outil (`web/src/lib/demo.ts`) |
| Mercedes Classe A 2017, 138 000 km, 12 990 € : verdict, marge nette, prix d'offre, plafond | **en attente** : rapport Benef de l'app sur l'annonce fournie (leboncoin 3260794761), lu dans la base |
| 63 jours en stock, − 18 % sous la cote, marges par voiture | **données de démonstration** (mention à l'écran), règles réelles de l'app (> 60 j : « Le capital dort », marché 10–45 % sous la cote) |
| Starter 14,99 €/mois, Pro 79 €/mois | `web/src/lib/offres.ts` |
| + 670 € = 44 mois de Starter | calculateur du site (voiture achetée 5 000 €, 630 € de frais, revendue 6 300 €), affiché comme exemple calculé |
| 3 jours offerts sans carte | **à confirmer** (brief) ; sinon « Ta première analyse est offerte » |

## 7. Voix
Personnage : Simon a revendu une cinquantaine de voitures. Il montre l'app à un pote, sur son téléphone, avec le
sourire. Pince-sans-rire, jamais donneur de leçon : il réagit à ce que l'écran montre.
Texte envoyé à eleven_v3 (balises jouées, pas lues ; « 308 » écrit « trois cent huit ») :
> Celle-là… [curious] tu l'achètes ? [short pause] Je colle l'annonce. [pause] [surprised] Ah. [short pause] [amused]
> Non. Mille six cent cinquante euros de travaux. [chuckles] L'annonce a oublié de le dire. [pause] C'est UTOPICAR. Tu
> colles l'annonce, tu sais ce qu'il te restera, frais déduits. [pause] Et celle-là ? [short pause] [verdict]. Et ton
> offre : [écart] de moins. [laughs softly] Ah ouais. [pause] Et avec quinze voitures en stock ?
> [sighs] Le carnet, la calculette, quatorze onglets… [pause] Ton tableau de bord te dit quoi faire ce matin. La trois
> cent huit dort depuis soixante-trois jours ? Baisse le prix. Une A3 sort sous la cote ? Tu as l'alerte. Et ta vraie
> marge, voiture par voiture. [pause] Tu débutes ? Starter. Une seule voiture bien achetée te paie trois ans
> d'abonnement. Tu gères un parc ? Pro. [pause] [excited] Essaie trois jours, sans carte bancaire. Lien en bio. [pause]
> Ta prochaine marge, chiffrée avant d'appeler. UTOPICAR.

Ouvertures, générées à part : « [amused] Ta première voiture à revendre… tu peux la payer deux fois. » et
« [curious] T'es marchand ? Cinquante annonces à trier ce matin. »

Coût estimé (ElevenLabs, `estimate_only`) : corps ≈ 1 956 crédits pour 2 prises ; ouvertures ≈ 300 crédits pour 2 prises
chacune. **Total ≈ 2 250 crédits.** Choix de la prise sur mesures (débit, prononciation de UTOPICAR, pauses), puis écoute.
