"""Groupe D (1/2) : ceux qui veulent se lancer dans l'achat-revente. Accroches : skill « L'art du hook » + Conbersa.
Image 1 = Contexte (pastille) + écart (titre), image 2 = valeur tout de suite, image 3 = relance, image 4 = la boucle se ferme.
Faits du fondateur (interview oct. 2026) : 6 mois, départ 400 €, Clio 2 à problèmes revendue 950 € en moins d'une semaine,
Excel / Notion / Drive / calculettes, journées sans réponse des vendeurs, alertes 15 min ou 1 h, marge minimum 750 à 1 000 €,
Mégane 3 à 1 500 € et Clio 4 à 4 000 € parties en 15 minutes, arnaques au RIB, critères CT / carrosserie / mécanique."""
from common import *
CARS = [
car('400-euros-pas-5000', 'CV',
    "Tu crois qu'il faut 5 000 € pour te lancer dans l'achat-revente de voitures ? J'ai commencé avec 400 €. Ma première voiture, et ce que j'en ai retenu.",
    "Tu démarrerais avec combien ?", [
  S(kicker="Achat-revente de voitures :", title="Il te faut\n5 000 € pour\ndémarrer ? *Non.*"),
  S(title="J'ai démarré\navec *400 €*.", body="Il y a 6 mois. Ma première voiture : une **Clio 2 à problèmes**."),
  S(title="Revendue\nen moins\nd'une *semaine*.", comp=[BIG("950 €", "encaissés en moins de 7 jours.")], relance="Image 4 : pourquoi ça a marché avec si peu."),
  S(title="Ce qui compte", comp=[LIST(["Un modèle que tout le monde cherche", "une Clio, pas une sportive"], ["Un défaut connu, chiffré avant", "pas de surprise après"], ["Un prix sous la barre des 1 000 €", "beaucoup d'acheteurs possibles"])]),
], "Ton budget n'est pas\nle *problème*."),

car('3-etapes-rien-dautre', 'DM',
    "Tu ne sais pas comment te lancer dans l'achat-revente de voitures ? 3 étapes, 3 critères pour choisir la voiture. Rien d'autre.",
    "Tu bloques à quelle étape ?", [
  S(kicker="Tu ne sais pas comment te lancer ?", title="3 étapes.\n*Rien* d'autre."),
  S(title="Les 3 étapes", comp=[LIST(["Trouve une annonce qui te plaît", "sur Leboncoin ou ailleurs"], ["Passe-la dans utopicar", "elle te laisse une bonne marge ?"], ["Tu l'achètes, tu la revends", "et tu recommences"])]),
  S(title="La voiture :\n*3* critères", comp=[ROWS(["Contrôle technique OK", "Oui", 'ok'], ["Pas de grosse carrosserie à faire", "Oui", 'ok'], ["Mécanique très saine", "Oui", 'ok'])], relance="Image 4 : tout ce que tu peux ignorer."),
  S(title="Le reste ?\n*Oublie*.", body="Couleur, options, jantes : elles ne changent pas ta marge. **Le CT, la carrosserie et la mécanique, si.**"),
], "Lance-toi\n*cette* semaine."),

car('3-regles-premiere-perte', 'EI',
    "Tu débutes ton achat-revente ? 3 règles pour éviter ta première voiture à perte. La 3e, presque tous les débutants l'oublient.",
    "Laquelle tu ne respectais pas ?", [
  S(kicker="Tu débutes ton achat-revente ?", title="3 règles\npour ne pas\nperdre ta *1re*."),
  S(title="1. Ton prix max\n*avant* l'appel", body="Revente rapide − frais − ta marge minimum = **le prix que tu ne dépasses pas**."),
  S(title="2. Compte\n*tous* les frais", comp=[PILLS(["Trajet"], ["Contrôle technique"], ["Pneus"], ["Vidange"], ["Nettoyage"])], body="Les petits frais mangent la marge.", relance="Image 4 : celle que presque tous oublient."),
  S(title="3. Achète ce qui\nse *revend*", body="Pas ce qui te plaît. Une voiture qui dort bloque ton argent. **Clio, 208 diesel, C3, Sandero : ça part.**"),
], "Tes 3 règles,\n*appliquées*."),

car('revente-moins-achat-faux', 'CV',
    "En achat-revente auto, revente moins achat ne donne pas ta marge. Les 5 frais qui passent avant toi, sur un exemple chiffré.",
    "Tu calculais comment avant ?", [
  S(kicker="Revente − achat = ta marge ?", title="C'est ce calcul\nqui fait *perdre*."),
  S(title="Ce que\ntu crois", comp=[TICKET(["Revente", "4 400 €"], ["Achat", "− 3 200 €"], tot="+ 1 200 €", totLab="Ta marge ?", tone='g')]),
  S(title="Ce qui\npasse avant", comp=[TICKET(["Trajet aller-retour", "− 80 €"], ["2 pneus", "− 200 €"], ["Vidange + filtres", "− 120 €"], ["Contrôle technique", "− 80 €"], ["Nettoyage + photos", "− 40 €"], tot="− 520 €", totLab="Frais", tone='r')], relance="Image 4 : ce qu'il te reste."),
  S(title="Il te reste", comp=[BIG("680 €", "pas 1 200 €.")]),
], "Ta *vraie* marge,\navant d'acheter."),

car('750-ou-rien', 'PI',
    "Ma règle en achat-revente : sous 750 € de marge, je n'achète pas. Ce qu'un seul imprévu fait à une marge de 300 €.",
    "Elle est à combien, ta marge minimum ?", [
  S(kicker="Ma règle d'achat :", title="Sous *750 €*,\nje laisse\npasser."),
  S(title="Pourquoi\nsi haut", comp=[LIST("Un imprévu en mange 300 €", "La négo de l'acheteur en mange 200 €", "Il doit rester de quoi payer ton temps")]),
  S(title="Avec 300 €\nde marge", comp=[TICKET(["Marge prévue", "300 €"], ["Batterie à changer", "− 150 €"], ["Négo de l'acheteur", "− 200 €"], tot="− 50 €", totLab="Il te reste", tone='r')], relance="Image 4 : comment fixer la tienne."),
  S(title="Fixe la tienne", body="Choisis ta marge **avant** de chercher. Elle décide de ton prix max, et ton prix max décide de chaque appel."),
], "Ta marge\nd'abord. *Le reste* suit."),

car('voitures-qui-partent', 'FC',
    "Les voitures qui se revendent le plus vite en achat-revente : Clio, 208 diesel, C3, Sandero, Yaris. Et les moteurs à prendre sur chacune.",
    "Tu revends quoi, toi ?", [
  S(kicker="Pour ta première revente,", title="5 voitures\nqui partent\nen *quelques* jours."),
  S(title="Les 5", comp=[ROWS(["Renault Clio III / IV", "1.2 16V, 1.5 dCi", 'ok'], ["Peugeot 208", "diesel seulement", 'ok'], ["Citroën C3 II", "1.4 HDi, 1.6 HDi", 'ok'], ["Dacia Sandero", "1.2 16V, 1.5 dCi", 'ok'], ["Toyota Yaris", "1.0 / 1.33 VVT-i", 'ok'])]),
  S(title="Pourquoi elles", body="Jeunes conducteurs, deuxième voiture, petits budgets : **tout le monde en cherche une**.", relance="Image 4 : le piège sur la 208."),
  S(title="Le piège", body="La **208 essence** de 2012 à 2016, c'est un PureTech. Les acheteurs le savent. Prends-la en diesel.", comp=[PILLS(["208 PureTech", 'bad'], ["208 1.6 HDi", 'ok'])]),
], "Achète ce qui\n*part*."),

car('clio-2-6-jours', 'RE',
    "Une Clio 2 à problèmes revendue 950 € en moins d'une semaine. Ce que ma première revente m'a appris sur les voitures qui partent vite.",
    "Ta première revente a pris combien de temps ?", [
  S(kicker="Ma première revente :", title="Une Clio 2\n*à problèmes*.\nVendue en 6 jours."),
  S(title="1. Le modèle", body="Une Clio. **Tout le monde en cherche une** : jeunes conducteurs, deuxième voiture, petits budgets."),
  S(title="2. Le prix", body="**950 €** : sous la barre des 1 000 €, la liste des acheteurs possibles est longue.", relance="Image 4 : la leçon que j'applique depuis."),
  S(title="3. La leçon", body="Une voiture qui part vite vaut mieux qu'une grosse marge qui dort. **Depuis, je choisis des voitures rapides à vendre.**"),
], "Vends *vite*,\nrecommence."),

car('papiers-revente-bloque', 'CC',
    "Acheter une voiture à revendre sans HistoVec, CT, factures et carte grise au bon nom, c'est bloquer ta revente. Les 4 papiers à exiger.",
    "Il t'en a manqué un, déjà ?", [
  S(kicker="Tu achètes pour revendre ?", title="Un papier\nmanquant, c'est\nta *revente* bloquée."),
  S(title="Les 2 premiers", comp=[LIST(["Le HistoVec", "propriétaires, sinistres, kilométrages"], ["Le contrôle technique", "moins de 6 mois"])]),
  S(title="Les 2 autres", comp=[LIST(["Le carnet et les factures", "la preuve de l'entretien"], ["La carte grise", "au nom du vendeur"], start=3)], relance="Image 4 : ce que ton acheteur fera."),
  S(title="Ton acheteur", body="Il te posera **les mêmes questions** que toi au vendeur. Sans papiers, il négocie fort. Ou il part."),
], "Le dossier\n*complet*, à chaque achat."),

car('declarer-activite', 'DO',
    "Achat-revente de voitures : à partir de quand tu dois te déclarer ? Pas de nombre magique, trois critères à connaître.",
    "Tu es en micro-entreprise ?", [
  S(kicker="Tu revends des voitures ?", title="« 2 voitures\npar an » : ce chiffre\nn'*existe* pas."),
  S(title="Ce qui compte", comp=[LIST("Tu achètes pour revendre", "Tu le fais de façon habituelle", "Tu cherches un bénéfice")], body="Les trois réunis : c'est une **activité commerciale**."),
  S(title="Le risque", body="Une activité non déclarée peut être requalifiée. **Garde tes factures dès la première voiture.**", relance="Image 4 : par où commencer."),
  S(title="Par où\ncommencer", comp=[LIST("Renseigne-toi auprès de l'URSSAF", "Regarde le statut de micro-entrepreneur", "Note chaque achat et chaque vente")]),
], "Démarre *carré*."),

car('coup-de-coeur', 'EI',
    "L'erreur des débutants motivés en achat-revente : acheter la voiture qu'ils aiment. Pourquoi elle dort sur le parking.",
    "Tu as déjà acheté au coup de cœur ?", [
  S(kicker="Erreur des débutants motivés :", title="acheter la voiture\nqu'ils *aiment*."),
  S(title="Ce qui\nse passe", comp=[TL(["Jour 1", "Tu achètes la voiture qui te plaît."], ["Jour 20", "Personne n'a appelé.", 'x'], ["Jour 45", "Tu baisses le prix. Ta marge part.", 'x'])]),
  S(title="La bonne\nquestion", body="Pas « elle me plaît ? ». **« Combien de gens la cherchent ? »**", relance="Image 4 : comment le savoir en 2 minutes."),
  S(title="En 2 minutes", comp=[LIST("Compte les annonces du même modèle", "Regarde depuis quand elles sont en ligne", "Peu d'annonces, vite parties : bon signe")]),
], "Achète avec\nta *tête*."),

car('journees-sur-annonces', 'AA',
    "Avant, je passais mes journées sur les annonces de voitures. Maintenant, une alerte me prévient. Avant et après, chiffrés.",
    "Tu passes combien de temps par jour sur les annonces ?", [
  S(kicker="Achat-revente :", title="Tu passes\ntes *journées*\nsur les annonces ?"),
  S(title="Avant", comp=[LIST("Rafraîchir la page encore et encore", "Les bonnes parties avant mon appel", "Des vendeurs qui ne répondent pas")]),
  S(title="Après", body="Je ne cherche plus. **Une alerte arrive** quand une annonce correspond à ma recherche.", relance="Image 4 : à quoi elle ressemble."),
  S(title="L'alerte", comp=[NOTIF("Clio IV 1.5 dCi · 2014", "[g]Sous la cote[/g] · marge estimée 980 €", "il y a 3 min")], body="Toutes les 15 minutes ou toutes les heures."),
], "Arrête de *chercher*."),

car('message-trop-long', 'AA',
    "Les vendeurs de voitures ne te répondent pas ? Ton message est trop long. Avant / après, et le délai qui change tout.",
    "Combien de messages sans réponse cette semaine ?", [
  S(kicker="Les vendeurs ne te répondent pas ?", title="Ton message\nest trop *long*."),
  S(title="Avant", comp=[CHAT(["m", "Bonjour, je suis intéressé par votre véhicule, est-ce qu'il serait possible d'avoir plus d'informations sur l'entretien, le prix est-il négociable…"])]),
  S(title="Après", comp=[CHAT(["m", "Bonjour, elle est toujours dispo ? Vous pouvez m'envoyer le CT et les factures ?"])], relance="Image 4 : s'il ne répond toujours pas."),
  S(title="Pas de réponse\nen 2 h ?", body="Tu appelles. Toujours rien ? **Annonce suivante.** Une autre arrive dans 15 minutes."),
], "Court.\n*Premier*."),

car('voiture-qui-dort', 'CC',
    "En achat-revente, une voiture qui ne se vend pas te coûte bien plus que son prix : elle t'empêche d'acheter la suivante.",
    "Ta voiture la plus longue à vendre ?", [
  S(kicker="Ta voiture ne se vend pas ?", title="Elle te coûte\nplus que\nson *prix*."),
  S(title="Ce que tu vois", comp=[LIST("L'assurance", "La place sur le parking", "Le prix que tu vas baisser")]),
  S(title="Ce que tu\nne vois pas", body="Pendant qu'elle dort, **tu ne peux pas acheter la suivante**. Une marge de 800 € ratée par mois.", relance="Image 4 : la règle des 30 jours."),
  S(title="La règle", comp=[TL(["Jour 1", "Prix dans le bas du marché."], ["Jour 15", "Pas d'appel ? Refais photos et texte."], ["Jour 30", "Baisse le prix. Récupère ton argent.", 'v'])]),
], "Une voiture\nqui *tourne*."),

car('clio-iv-de-a-a-z', 'DM',
    "Un achat-revente de A à Z, chiffré : une Clio IV achetée 3 900 €, travaux, frais, revente. Combien il reste.",
    "Tu aurais acheté à ce prix ?", [
  S(kicker="Exemple chiffré, de A à Z.", title="Une Clio IV\nà 3 900 €.\nIl *reste* combien ?"),
  S(title="L'achat", comp=[TICKET(["Prix négocié", "3 900 €"], ["Trajet", "60 €"], ["Pneus + vidange", "320 €"], ["CT", "80 €"], tot="4 360 €", totLab="Ce qu'elle te coûte")]),
  S(title="La revente", comp=[TICKET(["Prix affiché", "5 400 €"], ["Négociation de l'acheteur", "− 200 €"], tot="5 200 €", totLab="Ce que tu encaisses")], relance="Image 4 : la marge."),
  S(title="La marge", comp=[BIG("840 €", "au-dessus de la barre des 750 €.")]),
], "Chiffre tout,\n*avant*."),

car('annonce-dans-cet-ordre', 'DM',
    "Ton annonce de revente de voiture : les infos que l'acheteur cherche, dans cet ordre. La structure à copier.",
    "Tu écris tes annonces comment ?", [
  S(kicker="Tu revends ta voiture ?", title="Ton annonce\nne *répond* pas\naux bonnes questions."),
  S(title="Le titre", comp=[QUOTE("++Renault Clio IV 1.5 dCi 90 · 2014 · 128 000 km++", lab="Titre")], body="Modèle, moteur, année, kilométrage. **Rien d'autre.**"),
  S(title="Le texte", comp=[LIST("Entretien : factures et distribution", "Contrôle technique : date et résultat", "Les défauts, écrits", "Pourquoi tu vends")], relance="Image 4 : la phrase qui rassure."),
  S(title="La phrase\nqui rassure", comp=[QUOTE("++CT de moins de 6 mois, factures et HistoVec envoyés sur demande.++", lab="Fin d'annonce")]),
], "Une annonce\nqui *vend*."),

car('photos-qui-vendent', 'FC',
    "Les photos qui font vendre une voiture d'occasion vite : 8 vues, la bonne lumière, un fond propre. La liste.",
    "Tu prends tes photos où ?", [
  S(kicker="Tes photos font fuir ?", title="La photo\nqui manque fait\n*fuir* l'acheteur."),
  S(title="L'extérieur", comp=[LIST("3/4 avant", "3/4 arrière", "Profil", "Jantes et pneus")]),
  S(title="L'intérieur", comp=[LIST("Compteur, moteur allumé", "Sièges avant", "Banquette arrière", "Coffre", start=5)], relance="Image 4 : la lumière."),
  S(title="La lumière", body="Ciel couvert ou fin de journée. **Pas de soleil de midi.** Un parking vide en fond."),
], "Des photos\nqui *vendent*."),

car('moteurs-invendables', 'CC',
    "Acheter un moteur à mauvaise réputation pour le revendre : les acheteurs le connaissent et négocient fort. PureTech, THP, EcoBoost, boîtes robotisées.",
    "Tu en as déjà eu un sur les bras ?", [
  S(kicker="Pour revendre vite,", title="ce moteur\nte coûte des\n*semaines*."),
  S(title="Les acheteurs\nles connaissent", comp=[PILLS(["1.2 PureTech", 'bad'], ["1.6 THP", 'bad'], ["1.0 EcoBoost", 'bad'], ["1.2 TCe 115", 'bad'])], body="Ils tapent le moteur sur Google avant d'appeler."),
  S(title="Et les boîtes", comp=[PILLS(["EDC", 'bad'], ["DSG7", 'bad'], ["Powershift", 'bad'], ["Quickshift", 'bad'])], relance="Image 4 : ceux qui rassurent."),
  S(title="Ceux qui\nrassurent", comp=[PILLS(["1.5 dCi", 'ok'], ["1.6 HDi", 'ok'], ["1.2 16V", 'ok'], ["1.33 VVT-i", 'ok'], ["1.6 TDI", 'ok'])]),
], "Le bon moteur\nse *revend*."),

car('formule-prix-max', 'PI',
    "La formule à appliquer avant chaque achat de voiture à revendre : revente rapide moins frais moins marge minimum.",
    "Tu as une formule, toi ?", [
  S(kicker="Avant chaque achat,", title="Une formule.\nSans elle, tu\n*paies* trop."),
  S(title="La formule", comp=[LIST("Revente rapide", "− tous les frais", "− ta marge minimum", "= ton prix max")]),
  S(title="La revente\n*rapide*", body="Pas le prix moyen : le prix **bas** du marché. Celui qui vend en une semaine.", relance="Image 4 : un exemple."),
  S(title="Exemple", comp=[TICKET(["Revente rapide", "4 800 €"], ["Frais", "− 420 €"], ["Marge minimum", "− 750 €"], tot="3 630 €", totLab="Prix max")]),
], "Ta formule,\n*à chaque* achat."),

car('frais-decouverts-apres', 'DO',
    "Les frais découverts après l'achat en achat-revente : trajet, pneus, distribution. Ils mangent la marge avant que tu les voies.",
    "C'est quoi, le frais qui t'a surpris ?", [
  S(kicker="Ta marge fond après l'achat ?", title="Ces 3 frais\narrivent *après*."),
  S(title="Le trajet", body="200 km aller-retour pour aller la chercher. Essence et péage : **60 à 80 €**."),
  S(title="Les pneus", body="« Pneus corrects », disait l'annonce. Sur place : à changer. **140 à 260 € les deux.**", relance="Image 4 : le plus cher."),
  S(title="La distribution", body="Pas de facture. L'acheteur suivant la demande. **400 à 750 €**, ou une grosse négo."),
], "Les frais,\n*avant* l'achat."),

car('avant-maintenant-marge', 'AA',
    "Mon achat-revente avant et maintenant : marge estimée après l'achat contre travaux listés avant. Ce qui a changé.",
    "Tu es plutôt avant ou maintenant ?", [
  S(kicker="Ta marge, tu la découvres", title="*après* l'achat ?"),
  S(title="La marge", comp=[VS(["Avant", ["Estimée après l'achat", "Des frais imprévus", "Parfois rien au bout"]], ["Maintenant", ["Calculée avant", "Tous les travaux listés", "750 € minimum"]])]),
  S(title="La recherche", comp=[VS(["Avant", ["Des journées sur les annonces", "Les bonnes déjà parties"]], ["Maintenant", ["Une alerte toutes les 15 min", "Je vois avant les autres"]])], relance="Image 4 : les outils."),
  S(title="Les outils", comp=[VS(["Avant", ["Excel", "Notion", "Drive", "Calculettes"]], ["Maintenant", ["Un seul outil, codé pour moi"]])]),
], "Passe à\n*maintenant*."),

car('plan-7-etapes', 'DM',
    "Ta première voiture en achat-revente en 7 étapes, de la recherche à la revente. Celle que tout le monde saute est la 3.",
    "Tu en es à quelle étape ?", [
  S(kicker="Ta première voiture ?", title="7 étapes.\nTout le monde\nsaute la *3e*."),
  S(title="Avant l'achat", comp=[LIST("Choisis un modèle qui part vite", "Fixe ta marge minimum", "Calcule ton prix max", "Demande CT, factures, HistoVec")]),
  S(title="Après l'achat", comp=[LIST("Fais les petits travaux", "Photos + annonce honnête", "Prix dans le bas du marché", start=5)], relance="Image 4 : pourquoi la 3e."),
  S(title="La 3e", body="Sans prix max, tu négocies à l'émotion. **Et tu paies trop.**"),
], "Ton plan,\n*étape* par étape."),

car('5-erreurs-debutant', 'EI',
    "5 erreurs de débutant en achat-revente de voitures. Elles coûtent chacune une marge. La 5e est la plus chère.",
    "Tu en as fait combien ?", [
  S(kicker="Achat-revente de voitures :", title="5 erreurs\nqui coûtent\nune *marge*."),
  S(title="1 et 2", comp=[LIST(["Calculer la marge après l'achat", "trop tard pour négocier"], ["Oublier les petits frais", "trajet, pneus, vidange"])]),
  S(title="3 et 4", comp=[LIST(["Acheter au coup de cœur", "personne n'en veut"], ["Afficher trop cher", "elle dort, ton argent aussi"], start=3)], relance="Image 4 : la plus chère."),
  S(title="5. La plus\nchère", body="**Tout gérer dans 4 outils.** Excel, Notion, Drive, calculette. Tu perds le fil, tu perds de l'argent."),
], "Évite-les\n*toutes*."),

car('combien-par-voiture', 'RE',
    "Combien je gagne par voiture en achat-revente ? Ma barre est à 750 €, je vise 1 000 €. Pourquoi pas plus.",
    "Tu vises combien par voiture ?", [
  S(kicker="On me demande tout le temps :", title="Tu gagnes\n*combien*\npar voiture ?"),
  S(title="Ma barre", comp=[BIG("750 €", "minimum. Je vise 1 000 €.")]),
  S(title="Pourquoi\npas moins", body="En dessous, **un seul imprévu** et je travaille gratuitement.", relance="Image 4 : pourquoi pas plus."),
  S(title="Pourquoi\npas plus", body="Je vise des voitures qui partent vite. **800 € en une semaine valent mieux que 1 500 € en trois mois.**"),
], "Ta marge,\n*ta* règle."),

car('quatre-outils-zero-vision', 'AA',
    "Excel, Notion, Drive et calculettes : mon organisation au début de l'achat-revente. Pourquoi 4 outils te font perdre de l'argent.",
    "Tu utilises quoi pour t'organiser ?", [
  S(kicker="Ton achat-revente tient dans", title="4 outils ?\nTu as *zéro*\nvision."),
  S(title="Le chaos", comp=[ROWS(["Excel", "les calculs", 'warn'], ["Notion", "les annonces", 'warn'], ["Drive", "les papiers", 'warn'], ["Calculettes", "le reste", 'warn'])]),
  S(title="Le résultat", comp=[LIST("Quelle voiture rapporte quoi ? Aucune idée", "Une facture perdue, une négo perdue", "Ta marge du mois ? Inconnue")], relance="Image 4 : ce que j'ai fait."),
  S(title="Ce que\nj'ai fait", body="Tout au même endroit : l'annonce, le calcul, les frais, les papiers. **Je l'ai codé pour moi.**"),
], "Un seul outil,\n*tout* dedans."),

car('3-questions-avant-trajet', 'DM',
    "Les 3 questions à poser à chaque vendeur avant d'acheter une voiture pour la revendre : CT, défauts, carnet.",
    "Tu poses quoi, toi ?", [
  S(kicker="Avant de faire 200 km,", title="pose ces\n*3* questions."),
  S(title="1. Le CT", body="« Il a moins de 6 mois ? » Sinon tu le paies, et tu découvres peut-être des réparations."),
  S(title="2. Les défauts", body="« Qu'est-ce qui ne va pas ? » Chaque défaut, tu le chiffres. **Il sort de ta marge.**", relance="Image 4 : la question pour la revente."),
  S(title="3. Le carnet", body="« Vous avez les factures ? » Ton acheteur te les demandera. **Sans elles, tu revends moins cher.**"),
], "Les bonnes questions,\n*la bonne* marge."),

car('visite-5-points', 'DM',
    "La visite d'une voiture à revendre en 10 minutes : moteur froid, voyants, embrayage, boîte, fuites.",
    "Tu regardes quoi en premier ?", [
  S(kicker="Tu vas voir une voiture à revendre ?", title="10 minutes.\n*5* points.\nPas un de plus."),
  S(title="Le moteur", comp=[LIST("Démarrage moteur froid", "Aucun voyant après démarrage", "Pas de fumée bleue ou blanche")]),
  S(title="La boîte", comp=[LIST("Embrayage qui ne patine pas", "Vitesses qui passent sans craquer", start=4)], relance="Image 4 : si un point coince."),
  S(title="Un point coince ?", comp=[VERDICT("Chiffre ou pars", 'warn', "Il sort de ta marge. **Sous 750 €, tu laisses.**")]),
], "Vite vu,\n*bien* vu."),

car('faux-cheque-de-banque', 'CC',
    "Quand tu revends ta voiture : l'arnaque au faux chèque de banque. La voiture part, l'argent n'arrive jamais.",
    "On t'a déjà proposé un chèque de banque ?", [
  S(kicker="Le jour où tu revends,", title="ce chèque\nte coûte\nta *voiture*."),
  S(title="L'arnaque", body="L'acheteur paie par chèque de banque, un samedi. **Le chèque est faux.** Ta voiture est partie."),
  S(title="Vérifier", body="Appelle la banque émettrice avec **un numéro que tu as trouvé toi-même**. Jamais celui du chèque.", relance="Image 4 : le plus simple."),
  S(title="Le plus\nsimple", comp=[VERDICT("Virement instantané", 'ok', "Fait ensemble. L'argent arrive, puis tu donnes les clés.")]),
], "Revends\n*sans* risque."),

car('15-minutes-affaires', 'DO',
    "Les meilleures affaires de voitures restent en ligne 15 minutes. Mégane 3 à 1 500 €, Clio 4 à 4 000 € : comment être le premier à appeler.",
    "Tu as déjà raté une affaire de peu ?", [
  S(kicker="Tu rates les bonnes affaires ?", title="Elles restent\nen ligne\n*15 minutes*."),
  S(title="Ce que j'ai vu", comp=[TL(["9 h 00", "Une Mégane 3 à 1 500 €."], ["9 h 15", "Déjà partie.", 'x'])], body="Pareil pour une Clio 4 à 4 000 €."),
  S(title="Pourquoi", body="Les marchands ont des alertes. **Ils appellent pendant que tu scrolles.**", relance="Image 4 : comment je fais."),
  S(title="Comment\nje fais", comp=[NOTIF("Mégane III 1.5 dCi · 2012", "[g]Sous la cote[/g] · dans ta recherche", "il y a 1 min")], body="Une alerte par mail, toutes les 15 minutes."),
], "Sois le\n*premier*."),

car('afficher-en-bas', 'CV',
    "Pour revendre ta voiture vite, affiche-la dans le bas du marché. Ta marge se fait à l'achat, pas à la vente.",
    "Tu affiches à quel prix, toi ?", [
  S(kicker="Tu affiches cher pour négocier ?", title="C'est pour ça\nqu'elle ne\n*part* pas."),
  S(title="Le marché", comp=[COTE(5200, 4700, 3800, 6600, "Ton prix face aux autres annonces")]),
  S(title="En bas\ndu marché", body="Les acheteurs trient par prix. **En bas de la fourchette, tu sors en premier.**", relance="Image 4 : et ta marge ?"),
  S(title="Ta marge", body="Elle se fait **à l'achat**. Tu as acheté sous ton prix max : tu peux afficher bas."),
], "La marge se fait\n*à l'achat*."),

car('2000-euros-recalcul', 'CV',
    "« Je gagne 2 000 € par voiture » : je refais le calcul avec tous les frais. Ce que les vidéos d'achat-revente ne montrent pas.",
    "Tu y croyais, aux 2 000 € ?", [
  S(kicker="« 2 000 € par voiture. »", title="Je refais\nle calcul.\nIl en reste *500*."),
  S(title="Ce qu'ils\nmontrent", comp=[TICKET(["Revente", "7 000 €"], ["Achat", "− 5 000 €"], tot="+ 2 000 €", totLab="Annoncé", tone='g')]),
  S(title="Ce qu'ils\ntaisent", comp=[TICKET(["Distribution", "− 600 €"], ["Pneus + freins", "− 450 €"], ["Trajet + CT", "− 150 €"], ["Négo de l'acheteur", "− 300 €"], tot="− 1 500 €", totLab="Frais", tone='r')], relance="Image 4 : la vraie marge."),
  S(title="La vraie\nmarge", comp=[BIG("500 €", "pas 2 000 €.")]),
], "Les *vrais* chiffres."),

car('6-mois-ce-que-je-referais', 'RE',
    "6 mois d'achat-revente de voitures, parti de 400 €. Ce que je referais, ce que je ne referais pas.",
    "Tu en es à combien de mois ?", [
  S(kicker="6 mois d'achat-revente,", title="parti de\n*400 €*.\nMon bilan."),
  S(title="Je referais", comp=[LIST("Commencer petit, avec 400 €", "Une Clio, pas une sportive", "Choisir des voitures rapides à vendre")]),
  S(title="Je ne referais\npas", comp=[LIST("Calculer la marge après l'achat", "Chercher les annonces à la main", "Tout gérer dans 4 outils")], relance="Image 4 : le conseil que je me donnerais."),
  S(title="Mon conseil", body="**Calcule tout avant d'acheter.** Le prix max, les frais, la marge. Le reste s'apprend."),
], "Tes 6 premiers mois,\n*mieux* que les miens."),

car('8-cases-premier-achat', 'DM',
    "La checklist avant ton premier achat de voiture à revendre : 8 cases. Une case vide te coûte de l'argent.",
    "Combien de cases tu coches aujourd'hui ?", [
  S(kicker="Ton premier achat ?", title="8 cases.\nUne case vide\nte *coûte*."),
  S(title="Avant d'appeler", comp=[ROWS(["Modèle qui part vite", "✓", 'ok'], ["Moteur fiable", "✓", 'ok'], ["Prix max calculé", "✓", 'ok'], ["Frais estimés", "✓", 'ok'])]),
  S(title="Avant de payer", comp=[ROWS(["CT de moins de 6 mois", "✓", 'ok'], ["Factures + carnet", "✓", 'ok'], ["HistoVec", "✓", 'ok'], ["Essai fait", "✓", 'ok'])], relance="Image 4 : s'il manque une case."),
  S(title="Une case vide ?", comp=[VERDICT("Tu attends", 'warn', "Ou tu baisses ton offre du coût de la case.")]),
], "Coche tout,\n*puis* achète."),

car('argent-bloque', 'CC',
    "Ton premier achat de voiture à revendre bloque ton argent tant qu'elle n'est pas vendue. Pourquoi la vitesse compte plus que la marge.",
    "Ton argent est bloqué combien de temps, en moyenne ?", [
  S(kicker="Tu as acheté ta première ?", title="Ton argent\nest *bloqué*\ndedans."),
  S(title="Le calcul", comp=[VS(["Voiture lente", ["1 500 € de marge", "en 3 mois", "= 1 voiture"]], ["Voiture rapide", ["800 € de marge", "par mois", "= 2 400 € en 3 mois"]])]),
  S(title="La leçon", body="Avec un petit budget, **le nombre de tours compte plus** que la marge par voiture.", relance="Image 4 : comment faire tourner."),
  S(title="Faire tourner", comp=[LIST("Modèles très demandés", "Prix dans le bas du marché", "Revente dans les 30 jours")]),
], "Fais *tourner*\nton argent."),

car('critere-ct-carrosserie-meca', 'PI',
    "Les 3 critères pour choisir une voiture à revendre quand tu débutes : CT OK, pas de grosse carrosserie, mécanique saine.",
    "Lequel tu négliges ?", [
  S(kicker="Tu choisis ta première voiture ?", title="3 critères.\nUn seul raté\net c'est *perdu*."),
  S(title="1. Le CT", body="Sans contre-visite. **Moins de 6 mois.** Sinon tu achètes des réparations inconnues."),
  S(title="2. La\ncarrosserie", body="Une rayure, ça se chiffre. **Un élément à refaire, ça mange tout.**", comp=[PILLS(["Rayures", 'ok'], ["Aile à refaire", 'bad'])], relance="Image 4 : le critère qui ne pardonne pas."),
  S(title="3. La mécanique", body="**Très saine.** Moteur, boîte, embrayage. Un doute ? Tu passes."),
], "Les *3*,\nà chaque fois."),
]
