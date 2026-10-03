"""Groupe D : ceux qui veulent se lancer dans l'achat-revente. 33 carrousels.
Histoire vraie du fondateur (interview, oct. 2026) : 6 mois d'achat-revente, départ avec 400 €, Clio 2 à problèmes
revendue 950 € en moins d'une semaine, chaos Excel / Notion / Drive / calculettes, journées à chercher sans réponse
des vendeurs, alertes toutes les 15 min ou 1 h, marge minimum 750 à 1 000 €, frais découverts après l'achat.
Le carrousel « 3 règles » (≈ 1 000 vues, les autres 200-300) sert de modèle : identité dans les 3 premiers mots,
liste chiffrée, perte à éviter, aucune capture produit en image 1."""
from common import *
CARS = [
car('400-euros',
    "J'ai commencé l'achat-revente de voitures il y a 6 mois avec 400 €. Ma première voiture, ce qui a marché, et le chaos qui a suivi.",
    "Tu démarrerais avec combien ?", [
  S(kicker="Il y a 6 mois,", title="j'ai lancé mon\nachat-revente\navec *400 €*."),
  S(title="Ma première :\nune Clio 2\n*à problèmes*.", body="Revendue **950 €** en moins d'une semaine."),
  S(title="Puis le *chaos*.", comp=[PILLS(["Excel"], ["Notion"], ["Drive"], ["3 calculettes"])], body="Un calcul à la main pour chaque annonce. Et les frais, je les découvrais **après** l'achat.", relance="Image 4 : ce que j'ai fait pour en sortir."),
  S(title="Alors j'ai codé\n*mon* outil.", comp=[LIST(["Je colle l'annonce", "cote, défauts, travaux à prévoir"], ["Il liste les frais avant l'achat", "plus de surprise après"], ["Il me dit si la marge passe", "sous 750 €, je laisse"])]),
], "Tu veux démarrer\n*sans* le chaos ?"),

car('te-lancer-3-etapes',
    "Tu ne sais pas comment te lancer dans l'achat-revente de voitures ? 3 étapes, et 3 critères pour choisir la voiture. Rien d'autre.",
    "Tu bloques à quelle étape ?", [
  S(kicker="Tu ne sais pas comment te lancer ?", title="3 étapes.\n*Rien* d'autre."),
  S(title="Les 3 étapes", comp=[LIST(["Trouve une annonce qui te plaît", "sur Leboncoin ou ailleurs"], ["Passe-la dans utopicar", "elle te laisse une bonne marge ?"], ["Tu l'achètes, tu la revends", "et tu recommences"])]),
  S(title="La voiture :\n*3* critères", comp=[ROWS(["Contrôle technique OK", "Oui", 'ok'], ["Pas de grosse carrosserie à faire", "Oui", 'ok'], ["Mécanique très saine", "Oui", 'ok'])], relance="Image 4 : tout ce que tu peux ignorer."),
  S(title="Le reste ?\n*Oublie*.", body="Couleur, options, jantes : elles ne changent pas ta marge. **Le CT, la carrosserie et la mécanique, si.**"),
], "Lance-toi\n*cette* semaine."),

car('3-regles',
    "Tu débutes ton achat-revente de voitures ? 3 règles pour éviter ta première voiture à perte. Enregistre-les.",
    "Laquelle tu ne respectais pas ?", [
  S(kicker="Tu débutes ton achat-revente ?", title="3 règles pour\néviter ta 1re\nvoiture à *perte*."),
  S(title="1. Ton prix max\n*avant* d'appeler", body="Revente rapide − frais − ta marge minimum = **le prix que tu ne dépasses pas**."),
  S(title="2. Compte\n*tous* les frais", comp=[PILLS(["Trajet"], ["Contrôle technique"], ["Pneus"], ["Vidange"], ["Annonce"], ["Nettoyage"])], body="Les petits frais mangent ta marge.", relance="Image 4 : la règle qui protège ton argent."),
  S(title="3. Achète ce qui\nse *revend* vite", body="Une voiture qui dort, c'est ton argent bloqué. Clio, 208 diesel, C3, Sandero : **ça part**."),
], "Tes 3 règles,\n*appliquées*."),

car('revente-moins-achat',
    "En achat-revente auto, ta marge n'est pas revente moins achat. Les 5 frais qui passent avant toi, avec un exemple chiffré.",
    "Tu calculais comment avant ?", [
  S(kicker="Revente − achat = ta marge ?", title="*Faux.*"),
  S(title="L'exemple", comp=[TICKET(["Revente", "4 400 €"], ["Achat", "− 3 200 €"], tot="+ 1 200 €", totLab="Ce que tu crois gagner", tone='g')]),
  S(title="Les frais\noubliés", comp=[TICKET(["Trajet aller-retour", "− 80 €"], ["2 pneus", "− 200 €"], ["Vidange + filtres", "− 120 €"], ["Contrôle technique", "− 80 €"], ["Nettoyage + photos", "− 40 €"], tot="− 520 €", totLab="Frais", tone='r')], relance="Image 4 : ce qu'il te reste."),
  S(title="Il te reste", comp=[BIG("680 €", "pas 1 200 €.")]),
], "Ta *vraie* marge,\navant d'acheter."),

car('marge-minimum',
    "Ma règle en achat-revente : sous 750 € de marge, je n'achète pas. Pourquoi une marge minimum te protège.",
    "Elle est à combien, ta marge minimum ?", [
  S(kicker="Ma règle :", title="sous *750 €*,\nje n'achète\npas."),
  S(title="Pourquoi", comp=[LIST("Un frais imprévu en mange 300", "La négociation de l'acheteur en mange 200", "Il doit rester de quoi payer ton temps")]),
  S(title="Le calcul\nà l'envers", comp=[TICKET(["Revente rapide", "5 000 €"], ["Frais estimés", "− 450 €"], ["Ta marge minimum", "− 750 €"], tot="3 800 €", totLab="Ton prix max")], relance="Image 4 : et si l'annonce est au-dessus ?"),
  S(title="Au-dessus ?", comp=[VERDICT("Tu laisses passer", 'bad', "Ou tu proposes ton prix max. **Pas un euro de plus.**")]),
], "Fixe ta *marge*,\nle reste suit."),

car('voitures-qui-partent',
    "Les voitures qui se revendent le plus vite en achat-revente : Clio, 208 diesel, C3, Sandero, Yaris. Pourquoi elles.",
    "Tu revends quoi, toi ?", [
  S(kicker="Pour ta première revente,", title="achète ce qui\n*part* vite."),
  S(title="Les modèles", comp=[ROWS(["Renault Clio III / IV", "Très demandée", 'ok'], ["Peugeot 208 diesel", "Très demandée", 'ok'], ["Citroën C3 II", "Facile à revendre", 'ok'], ["Dacia Sandero", "Entretien pas cher", 'ok'], ["Toyota Yaris", "Fiable", 'ok'])]),
  S(title="Pourquoi elles", body="Tout le monde cherche une citadine pas chère. **Plus il y a d'acheteurs, plus tu vends vite.**", relance="Image 4 : celles à éviter pour débuter."),
  S(title="À éviter", comp=[PILLS(["Moteurs PureTech", 'bad'], ["Boîtes robotisées", 'bad'], ["Premium à 200 000 km", 'bad'])], body="Les acheteurs les connaissent. Ils fuient."),
], "Achète pour\n*revendre*."),

car('clio-2-une-semaine',
    "Ma Clio 2 à problèmes s'est revendue 950 € en moins d'une semaine. Ce que j'en ai retenu pour toutes les suivantes.",
    "Ta première revente a pris combien de temps ?", [
  S(kicker="Une Clio 2 à problèmes,", title="revendue\nen *moins*\nd'une semaine."),
  S(title="1. Le modèle", body="Une Clio. **Tout le monde en cherche une** : jeunes conducteurs, deuxième voiture, petits budgets."),
  S(title="2. Le prix", body="**950 €** : sous la barre des 1 000 €, la liste des acheteurs possibles est longue.", relance="Image 4 : ce que j'en retiens pour la suite."),
  S(title="3. La leçon", body="Une voiture qui part vite vaut mieux qu'une grosse marge qui dort. **Depuis, je choisis des voitures rapides à vendre.**"),
], "Ta première revente,\n*rapide*."),

car('4-papiers-revente',
    "Tu achètes une voiture pour la revendre ? Exige ces 4 papiers, sinon c'est ta revente qui bloque.",
    "Il t'en a manqué un, déjà ?", [
  S(kicker="Tu achètes pour revendre ?", title="Sans ces\n4 papiers,\n*ta* revente\nbloque."),
  S(title="1 et 2", comp=[LIST(["Le HistoVec", "propriétaires, sinistres, kilométrages"], ["Le contrôle technique", "moins de 6 mois"])]),
  S(title="3 et 4", comp=[LIST(["Le carnet et les factures", "la preuve de l'entretien"], ["La carte grise", "au nom du vendeur"], start=3)], relance="Image 4 : pourquoi ton acheteur les demandera."),
  S(title="Ton acheteur", body="Il te posera **les mêmes questions** que toi au vendeur. Sans papiers, il négocie fort. Ou il part."),
], "Le dossier\n*complet*, toujours."),

car('se-declarer',
    "Achat-revente de voitures : à partir de quand tu dois te déclarer ? Pas de nombre magique, mais des critères clairs.",
    "Tu es en micro-entreprise ?", [
  S(kicker="Achat-revente de voitures :", title="tu dois te\n*déclarer* ?"),
  S(title="Ce qui compte", comp=[LIST("Tu achètes pour revendre", "Tu le fais de façon habituelle", "Tu cherches un bénéfice")], body="Les trois réunis : c'est une **activité commerciale**."),
  S(title="Pas de\nnombre magique", body="On entend « 2 voitures par an ». **Aucun texte ne fixe ce chiffre.** C'est l'habitude qui compte.", relance="Image 4 : par où commencer."),
  S(title="Par où\ncommencer", comp=[LIST("Renseigne-toi auprès de l'URSSAF", "Regarde le statut de micro-entrepreneur", "Garde toutes tes factures dès la 1re voiture")]),
], "Démarre *carré*."),

car('coup-de-coeur',
    "L'erreur n°1 en achat-revente auto : acheter la voiture qui te plaît au lieu de celle qui se revend.",
    "Tu as déjà acheté au coup de cœur ?", [
  S(kicker="Erreur n°1 du débutant :", title="acheter au\n*coup de cœur*."),
  S(title="Ce qui\nse passe", comp=[TL(["Jour 1", "Tu achètes la voiture que tu aimes."], ["Jour 20", "Personne ne t'a appelé.", 'x'], ["Jour 45", "Tu baisses le prix. Ta marge part.", 'x'])]),
  S(title="La bonne\nquestion", body="Pas « elle me plaît ? ». **« Combien de gens la cherchent ? »**", relance="Image 4 : comment le savoir."),
  S(title="Comment\nle savoir", comp=[LIST("Compte les annonces du même modèle", "Regarde depuis quand elles sont en ligne", "Choisis les modèles qui partent vite")]),
], "Achète avec\nta *tête*."),

car('journees-annonces',
    "Au début, je passais mes journées sur les annonces de voitures. Comment je reçois maintenant les bonnes directement par mail.",
    "Tu passes combien de temps par jour sur les annonces ?", [
  S(kicker="Au début,", title="je passais mes\n*journées* sur\nles annonces."),
  S(title="Le problème", comp=[LIST("Rafraîchir la page encore et encore", "Les bonnes parties avant mon appel", "Les vendeurs qui ne répondent pas")]),
  S(title="Ce que j'ai\nchangé", body="Je ne cherche plus. **Je reçois une alerte** quand une annonce correspond à ma recherche.", relance="Image 4 : à quoi elle ressemble."),
  S(title="L'alerte", comp=[NOTIF("Clio IV 1.5 dCi · 2014", "[g]Sous la cote[/g] · marge estimée 980 €", "il y a 3 min")], body="Toutes les 15 minutes ou toutes les heures."),
], "Arrête de *chercher*."),

car('vendeurs-repondent-pas',
    "Les vendeurs ne te répondent pas sur les annonces de voitures ? Ça m'arrivait tout le temps. Ce que j'ai changé.",
    "Combien de messages sans réponse cette semaine ?", [
  S(kicker="Ça m'arrivait tout le temps.", title="Les vendeurs\nne me\nrépondaient *pas*."),
  S(title="Mon ancien\nmessage", comp=[CHAT(["m", "Bonjour, je suis intéressé par votre véhicule, est-ce qu'il serait possible d'avoir plus d'informations sur l'entretien, le prix est-il négociable…"])], body="Trop long. **Il ne le lisait pas.**"),
  S(title="Le nouveau", comp=[CHAT(["m", "Bonjour, elle est toujours dispo ? Vous pouvez m'envoyer le CT et les factures ?"])], relance="Image 4 : et s'il ne répond toujours pas."),
  S(title="Pas de réponse\nen 2 h ?", body="Tu appelles. Toujours pas ? **Annonce suivante.** Une autre arrive dans 15 minutes."),
], "Des réponses,\n*vite*."),

car('voiture-qui-dort',
    "En achat-revente, une voiture qui ne se vend pas te coûte chaque jour : argent bloqué, assurance, prix qui baisse.",
    "Ta voiture la plus longue à vendre ?", [
  S(kicker="Ta voiture ne se vend pas ?", title="Chaque jour,\nelle te *coûte*."),
  S(title="Ce qu'elle\nte coûte", comp=[LIST("Ton argent bloqué dedans", "L'assurance et la place", "Le prix que tu vas devoir baisser")]),
  S(title="Le vrai\nproblème", body="Pendant qu'elle dort, **tu ne peux pas acheter la suivante.**", relance="Image 4 : la règle des 30 jours."),
  S(title="La règle", comp=[TL(["Jour 1", "Prix dans le bas du marché."], ["Jour 15", "Pas d'appel ? Revois les photos et le texte."], ["Jour 30", "Baisse le prix. Récupère ton argent.", 'v'])]),
], "Une voiture\nqui *tourne*."),

car('exemple-chiffre',
    "Un achat-revente de A à Z, chiffré : Clio IV achetée 3 900 €, travaux, frais, revente. Combien il reste vraiment.",
    "Tu aurais acheté à ce prix ?", [
  S(kicker="De A à Z, chiffré.", title="Une Clio IV.\nCombien\nil *reste* ?"),
  S(title="L'achat", comp=[TICKET(["Prix négocié", "3 900 €"], ["Trajet", "60 €"], ["Pneus + vidange", "320 €"], ["CT", "80 €"], tot="4 360 €", totLab="Ce qu'elle te coûte")]),
  S(title="La revente", comp=[TICKET(["Prix affiché", "5 400 €"], ["Négociation de l'acheteur", "− 200 €"], tot="5 200 €", totLab="Ce que tu encaisses")], relance="Image 4 : ta marge."),
  S(title="Ta marge", comp=[BIG("840 €", "au-dessus de la barre des 750 €.")]),
], "Chiffre tout,\n*avant*."),

car('annonce-revente',
    "Ton annonce de revente de voiture : les 5 infos que l'acheteur cherche, dans cet ordre. Copie la structure.",
    "Tu écris tes annonces comment ?", [
  S(kicker="Tu revends ta première voiture ?", title="Ton annonce,\n*dans* cet ordre."),
  S(title="Le titre", comp=[QUOTE("++Renault Clio IV 1.5 dCi 90 · 2014 · 128 000 km++", lab="Titre")], body="Modèle, moteur, année, kilométrage. **Rien d'autre.**"),
  S(title="Le texte", comp=[LIST("Entretien : factures et distribution", "Contrôle technique : date et résultat", "Les défauts, écrits honnêtement", "Pourquoi tu vends")], relance="Image 4 : la phrase qui rassure."),
  S(title="La phrase\nqui rassure", comp=[QUOTE("++CT de moins de 6 mois, factures et HistoVec envoyés sur demande.++", lab="Fin d'annonce")]),
], "Une annonce\nqui *vend*."),

car('photos-revente',
    "Les photos qui font vendre une voiture d'occasion vite : 8 vues, une lumière, un fond propre. La liste.",
    "Tu prends tes photos où ?", [
  S(kicker="Tes photos font fuir ?", title="8 photos.\nPas une\nde *moins*."),
  S(title="L'extérieur", comp=[LIST("3/4 avant", "3/4 arrière", "Profil", "Les jantes et pneus")]),
  S(title="L'intérieur", comp=[LIST("Le compteur, moteur allumé", "Les sièges avant", "La banquette arrière", "Le coffre", start=5)], relance="Image 4 : la lumière."),
  S(title="La lumière", body="Ciel couvert ou fin de journée. **Pas de soleil de midi.** Un parking vide en fond."),
], "Des photos\nqui *vendent*."),

car('moteurs-invendables',
    "Pour débuter en achat-revente, évite ces moteurs : les acheteurs les connaissent et les fuient. PureTech, THP, EcoBoost, boîtes robotisées.",
    "Tu en as déjà eu un sur les bras ?", [
  S(kicker="Pour revendre vite,", title="évite ces\nmoteurs *maudits*."),
  S(title="Les acheteurs\nles connaissent", comp=[PILLS(["1.2 PureTech", 'bad'], ["1.6 THP", 'bad'], ["1.0 EcoBoost", 'bad'], ["1.2 TCe 115", 'bad'])], body="Ils tapent le moteur sur Google. **Ils lisent les mêmes vidéos que toi.**"),
  S(title="Et les boîtes", comp=[PILLS(["EDC", 'bad'], ["DSG7", 'bad'], ["Powershift", 'bad'], ["Quickshift", 'bad'])], relance="Image 4 : les moteurs qui rassurent."),
  S(title="Ceux qui\nrassurent", comp=[PILLS(["1.5 dCi", 'ok'], ["1.6 HDi", 'ok'], ["1.2 16V", 'ok'], ["1.33 VVT-i", 'ok'], ["1.6 TDI", 'ok'])]),
], "Le bon moteur\nse *revend*."),

car('ma-formule',
    "La formule que j'applique avant chaque achat de voiture à revendre : revente rapide moins frais moins marge minimum.",
    "Tu as une formule, toi ?", [
  S(kicker="Avant chaque achat,", title="*une* formule."),
  S(title="La formule", comp=[LIST("Revente rapide", "− tous les frais", "− ta marge minimum", "= ton prix max")]),
  S(title="La revente\n*rapide*", body="Pas le prix moyen : le prix **bas** du marché. Celui qui vend en une semaine.", relance="Image 4 : un exemple."),
  S(title="Exemple", comp=[TICKET(["Revente rapide", "4 800 €"], ["Frais", "− 420 €"], ["Marge minimum", "− 750 €"], tot="3 630 €", totLab="Prix max")]),
], "Ta formule,\n*chaque* fois."),

car('frais-oublies',
    "Les frais que j'ai oubliés sur mes premières voitures en achat-revente. Ils m'ont coûté ma marge.",
    "C'est quoi, le frais qui t'a surpris ?", [
  S(kicker="Sur mes premières voitures,", title="j'ai oublié\nces *frais*."),
  S(title="Le trajet", body="200 km aller-retour pour aller la chercher. Essence et péage : **60 à 80 €**."),
  S(title="Les pneus", body="« Pneus corrects », disait l'annonce. Sur place : **à changer**. 140 à 260 € les deux.", relance="Image 4 : le plus cher."),
  S(title="La distribution", body="Pas de facture. L'acheteur suivant l'a demandée. **400 à 750 €**, ou une grosse négo."),
], "Les frais,\n*avant* l'achat."),

car('avant-maintenant',
    "Mon achat-revente avant et maintenant : marge estimée après l'achat contre travaux listés avant. Ce qui a changé.",
    "Tu es plutôt avant ou maintenant ?", [
  S(kicker="Mon achat-revente,", title="avant *et*\nmaintenant."),
  S(title="La marge", comp=[VS(["Avant", ["Estimée après l'achat", "Des frais imprévus", "Parfois rien au bout"]], ["Maintenant", ["Calculée avant", "Tous les travaux listés", "750 € minimum"]])]),
  S(title="La recherche", comp=[VS(["Avant", ["Des journées sur les annonces", "Les bonnes déjà parties"]], ["Maintenant", ["Une alerte toutes les 15 min", "Je vois avant les autres"]])], relance="Image 4 : les outils."),
  S(title="Les outils", comp=[VS(["Avant", ["Excel", "Notion", "Drive", "Calculettes"]], ["Maintenant", ["Un seul outil, que j'ai codé"]])]),
], "Passe à\n*maintenant*."),

car('plan-premiere-voiture',
    "Ta première voiture en achat-revente en 7 étapes, de la recherche à la revente. Le plan à suivre.",
    "Tu en es à quelle étape ?", [
  S(kicker="Ta première voiture ?", title="7 étapes.\n*Dans* l'ordre."),
  S(title="Avant l'achat", comp=[LIST("Choisis un modèle qui part vite", "Fixe ta marge minimum", "Calcule ton prix max", "Demande CT, factures, HistoVec")]),
  S(title="Après l'achat", comp=[LIST("Fais les petits travaux", "Photos + annonce honnête", "Prix dans le bas du marché", start=5)], relance="Image 4 : l'étape que tout le monde saute."),
  S(title="L'étape\nsautée", body="La **3**. Sans prix max, tu négocies à l'émotion. Et tu paies trop."),
], "Ton plan,\n*étape* par étape."),

car('achete-ce-qui-se-vend',
    "N'achète pas la voiture que tu aimes. Achète celle que les autres cherchent. La règle de base de l'achat-revente.",
    "Ta voiture préférée, tu l'achèterais pour revendre ?", [
  S(kicker="Achat-revente :", title="ce n'est pas\n*ta* voiture."),
  S(title="Ta voiture\npréférée", body="Une sportive, un SUV premium. **Peu d'acheteurs**, beaucoup de négo, des réparations chères."),
  S(title="Celle qu'ils\ncherchent", body="Une citadine fiable, entre 3 000 et 6 000 €. **Des dizaines d'acheteurs** chaque jour.", relance="Image 4 : comment la trouver."),
  S(title="Comment\nla trouver", comp=[LIST("Une recherche précise : modèle, moteur, budget", "Une alerte qui te prévient", "Ton prix max calculé avant d'appeler")]),
], "Achète pour\nles *autres*."),

car('5-erreurs',
    "5 erreurs de débutant en achat-revente de voitures. Je les ai presque toutes faites.",
    "Tu en as fait combien ?", [
  S(kicker="Je les ai presque toutes faites.", title="5 erreurs\nde *débutant*."),
  S(title="1 et 2", comp=[LIST(["Calculer la marge après l'achat", "trop tard pour négocier"], ["Oublier les petits frais", "trajet, pneus, vidange"])]),
  S(title="3 et 4", comp=[LIST(["Acheter au coup de cœur", "personne n'en veut"], ["Afficher trop cher", "elle dort, ton argent aussi"], start=3)], relance="Image 4 : la pire."),
  S(title="5. La pire", body="**Gérer tout ça dans 4 outils.** Excel, Notion, Drive, calculette. Tu perds le fil, tu perds de l'argent."),
], "Évite-les\n*toutes*."),

car('combien-par-voiture',
    "Combien je gagne par voiture en achat-revente ? Ma marge minimum est entre 750 et 1 000 €. Voilà pourquoi.",
    "Tu vises combien par voiture ?", [
  S(kicker="On me demande tout le temps :", title="tu gagnes\n*combien*\npar voiture ?"),
  S(title="Ma barre", comp=[BIG("750 €", "minimum. Je vise 1 000 €.")]),
  S(title="Pourquoi\npas moins", body="En dessous, **un seul imprévu** et je travaille gratuitement.", relance="Image 4 : pourquoi pas plus."),
  S(title="Pourquoi\npas plus", body="Je vise des voitures qui partent vite. **Mieux vaut 800 € en une semaine que 1 500 € en trois mois.**"),
], "Ta marge,\n*ta* règle."),

car('excel-notion-chaos',
    "Excel, Notion, Drive et calculettes : mon organisation en achat-revente au début. Pourquoi ça ne tient pas.",
    "Tu utilises quoi pour t'organiser ?", [
  S(kicker="Mon organisation au début :", title="4 outils.\n*Zéro* vision."),
  S(title="Le chaos", comp=[ROWS(["Excel", "les calculs", 'warn'], ["Notion", "les annonces", 'warn'], ["Drive", "les papiers", 'warn'], ["Calculettes", "le reste", 'warn'])]),
  S(title="Le résultat", comp=[LIST("Je ne savais plus quelle voiture rapportait quoi", "Une facture perdue = une négo perdue", "Ma marge du mois ? Aucune idée")], relance="Image 4 : la solution."),
  S(title="La solution", body="Tout au même endroit : l'annonce, le calcul, les frais, les papiers. **Je l'ai codé pour moi.**"),
], "Un seul outil,\n*tout* dedans."),

car('questions-revendeur',
    "Les 3 questions que je pose à chaque vendeur avant d'acheter une voiture pour la revendre.",
    "Tu poses quoi, toi ?", [
  S(kicker="Avant d'acheter pour revendre,", title="mes *3* questions."),
  S(title="1. Le CT", body="« Il a moins de 6 mois ? » Sinon tu le paies, et tu découvres peut-être des réparations."),
  S(title="2. Les défauts", body="« Qu'est-ce qui ne va pas ? » Chaque défaut, tu le chiffres. **Il sort de ta marge.**", relance="Image 4 : la question pour la revente."),
  S(title="3. Le carnet", body="« Vous avez les factures ? » Ton acheteur te les demandera. **Sans elles, tu revends moins cher.**"),
], "Les bonnes questions,\n*la bonne* marge."),

car('visite-10-minutes',
    "La visite d'une voiture à revendre en 10 minutes : moteur froid, voyants, embrayage, boîte, fuites. Ce que je regarde.",
    "Tu regardes quoi en premier ?", [
  S(kicker="Tu vas voir une voiture à revendre ?", title="10 minutes,\n*5* points."),
  S(title="Le moteur", comp=[LIST("Démarrage moteur froid", "Aucun voyant après démarrage", "Pas de fumée bleue ou blanche")]),
  S(title="La boîte", comp=[LIST("Embrayage qui ne patine pas", "Vitesses qui passent sans craquer", start=4)], relance="Image 4 : si un point coince."),
  S(title="Un point coince ?", comp=[VERDICT("Chiffre ou pars", 'warn', "Il sort de ta marge. **Sous 750 €, tu laisses.**")]),
], "Vite vu,\n*bien* vu."),

car('faux-cheque',
    "Quand tu revends ta voiture : l'arnaque au faux chèque de banque. Comment vérifier avant de rendre les clés.",
    "On t'a déjà proposé un chèque de banque ?", [
  S(kicker="Le jour où tu revends,", title="méfie-toi\ndu *chèque*\nde banque."),
  S(title="L'arnaque", body="L'acheteur paie par chèque de banque, un samedi. **Le chèque est faux.** Ta voiture est partie."),
  S(title="Comment\nvérifier", body="Appelle la banque émettrice avec **un numéro que tu as trouvé toi-même**. Jamais celui du chèque.", relance="Image 4 : le plus simple."),
  S(title="Le plus\nsimple", comp=[VERDICT("Virement instantané", 'ok', "Fait ensemble. L'argent arrive, puis tu donnes les clés.")]),
], "Revends\n*sans* risque."),

car('affaires-en-ligne',
    "Les meilleures affaires de voitures ne restent pas en ligne plus de 15 minutes. Comment être le premier à appeler.",
    "Tu as déjà raté une affaire de peu ?", [
  S(kicker="Les vraies affaires", title="restent en ligne\n*15 minutes*."),
  S(title="Ce que j'ai vu", comp=[TL(["9 h 00", "Une Mégane 3 à 1 500 €."], ["9 h 15", "Déjà partie.", 'x'])]),
  S(title="Pourquoi", body="Les marchands ont des alertes. **Ils appellent pendant que tu scrolles.**", relance="Image 4 : comment je fais."),
  S(title="Comment\nje fais", comp=[NOTIF("Mégane III 1.5 dCi · 2012", "[g]Sous la cote[/g] · dans ta recherche", "il y a 1 min")], body="Une alerte par mail, toutes les 15 minutes."),
], "Sois le\n*premier*."),

car('prix-revente-rapide',
    "Pour revendre ta voiture en une semaine : affiche-la dans le bas du marché. La règle du prix de revente rapide.",
    "Tu affiches à quel prix, toi ?", [
  S(kicker="Tu veux vendre en une semaine ?", title="Affiche *en bas*\ndu marché."),
  S(title="Le marché", comp=[COTE(5200, 4700, 3800, 6600, "Ton prix face aux autres annonces")]),
  S(title="Pourquoi", body="Les acheteurs trient par prix. **En bas de la fourchette, tu sors en premier.** Ils t'appellent toi.", relance="Image 4 : et ta marge ?"),
  S(title="Ta marge", body="Elle se fait **à l'achat**, pas à la vente. Tu as acheté sous ton prix max : tu peux afficher bas."),
], "La marge se fait\n*à l'achat*."),

car('2000-par-voiture',
    "« Je gagne 2 000 € par voiture » : je refais le calcul avec tous les frais. Ce que les vidéos d'achat-revente ne montrent pas.",
    "Tu y croyais, aux 2 000 € ?", [
  S(kicker="« 2 000 € par voiture. »", title="Je refais\nle *calcul*."),
  S(title="Ce qu'ils\nmontrent", comp=[TICKET(["Revente", "7 000 €"], ["Achat", "− 5 000 €"], tot="+ 2 000 €", totLab="Annoncé", tone='g')]),
  S(title="Ce qu'ils\ntaisent", comp=[TICKET(["Distribution", "− 600 €"], ["Pneus + freins", "− 450 €"], ["Trajet + CT", "− 150 €"], ["Négo de l'acheteur", "− 300 €"], tot="− 1 500 €", totLab="Frais", tone='r')], relance="Image 4 : ce qu'il reste."),
  S(title="Il reste", comp=[BIG("500 €", "pas 2 000 €.")]),
], "Les *vrais* chiffres."),

car('6-mois-lecons',
    "6 mois d'achat-revente de voitures, parti de 400 €. Ce que je referais, et ce que je ne referais jamais.",
    "Tu en es à combien de mois, toi ?", [
  S(kicker="6 mois d'achat-revente.", title="Ce que je\n*referais*."),
  S(title="Je referais", comp=[LIST("Commencer petit, avec 400 €", "Une Clio, pas une sportive", "Choisir des voitures rapides à vendre")]),
  S(title="Je ne referais\npas", comp=[LIST("Calculer la marge après l'achat", "Chercher les annonces à la main", "Tout gérer dans 4 outils")], relance="Image 4 : le conseil que je me donnerais."),
  S(title="Mon conseil", body="**Calcule tout avant d'acheter.** Le prix max, les frais, la marge. Le reste s'apprend."),
], "Tes 6 premiers mois,\n*mieux* que les miens."),

car('premier-achat-checklist',
    "La checklist avant ton premier achat de voiture à revendre. 8 cases à cocher. Enregistre-la.",
    "Combien de cases tu coches aujourd'hui ?", [
  S(kicker="Ton premier achat ?", title="8 cases\nà *cocher*."),
  S(title="Avant d'appeler", comp=[ROWS(["Modèle qui part vite", "✓", 'ok'], ["Moteur fiable", "✓", 'ok'], ["Prix max calculé", "✓", 'ok'], ["Frais estimés", "✓", 'ok'])]),
  S(title="Avant de payer", comp=[ROWS(["CT de moins de 6 mois", "✓", 'ok'], ["Factures + carnet", "✓", 'ok'], ["HistoVec", "✓", 'ok'], ["Essai fait", "✓", 'ok'])], relance="Image 4 : s'il manque une case."),
  S(title="Une case vide ?", comp=[VERDICT("Tu attends", 'warn', "Ou tu baisses ton offre. **Une case vide coûte.**")]),
], "Coche tout,\n*puis* achète."),

]
