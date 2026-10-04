"""Groupe P (1/2) : ceux qui font déjà de l'achat-revente (réguliers, marchands, garagistes). Accroches : skill + Conbersa.
Faits : règles de l'outil (cote = annonces comparables, ventes ≈ 5 % sous l'affiché, offre d'ouverture ≈ 7 % sous le
marché, alertes de stock 60 / 90 jours, inspection de reprise en 15 points, 38 défauts recherchés) + interview."""
from common import *
CARS = [
car('affaire-15-minutes', 'DO',
    "En achat-revente auto, la bonne affaire part en 15 minutes. Mégane 3 à 1 500 €, Clio 4 à 4 000 € : comment je ne les rate plus.",
    "Ta meilleure affaire, tu l'as eue en combien de temps ?", [
  S(kicker="Tu fais de l'achat-revente ?", title="La bonne\naffaire part\nen *15 minutes*."),
  S(title="Ça m'est\narrivé", comp=[TL(["9 h 00", "Une Mégane 3 sort à 1 500 €."], ["9 h 15", "Vendue. J'étais sur une autre annonce.", 'x'])]),
  S(title="Et une Clio 4\nà *4 000 €*", body="Même histoire : partie avant mon premier appel.", relance="Image 4 : comment je ne les rate plus."),
  S(title="L'alerte\nvient à moi", comp=[NOTIF("Clio IV 1.5 dCi · 2014", "[g]1 450 € sous la cote[/g] · marge 980 €", "il y a 2 min")], body="Toutes les 15 minutes, dans ma boîte mail."),
], "Arrête de chercher.\n*Reçois.*"),

car('calculette-oublie', 'CC',
    "Tu calcules ta marge d'achat-revente à la calculette ? Elle oublie un frais différent à chaque fois. Exemple : 640 € qui disparaissent.",
    "Calculette, Excel ou de tête ?", [
  S(kicker="Ta calculette ne ment pas.", title="Elle *oublie*.\n640 € par\nvoiture."),
  S(title="Ce que\ntu tapes", comp=[TICKET(["Revente", "6 200 €"], ["Achat", "− 4 800 €"], tot="1 400 €", totLab="Ta calculette", tone='g')]),
  S(title="Ce qu'elle\noublie", comp=[PILLS(["Trajet"], ["CT"], ["Pneus"], ["Distribution"], ["Négo de l'acheteur"], ["Annonce"])], relance="Image 4 : le vrai chiffre."),
  S(title="Le vrai\nchiffre", comp=[TICKET(["Ta calculette", "1 400 €"], ["Frais oubliés", "− 640 €"], tot="760 €", totLab="Ta vraie marge")]),
], "Tous les frais,\n*à chaque* annonce."),

car('marge-avant-appel', 'AA',
    "Ma règle d'achat-revente : 750 à 850 € de marge minimum, travaux listés avant l'appel. Avant, je calculais après l'achat.",
    "Ta barre, c'est combien ?", [
  S(kicker="Ta marge, tu la calcules quand ?", title="Après l'achat ?\nC'est *trop* tard."),
  S(title="Avant", body="Je calculais la marge **après** l'achat. Les travaux tombaient ensuite. Parfois, il ne restait rien."),
  S(title="Maintenant", comp=[LIST("Tous les travaux listés avant", "Chaque frais chiffré", "Marge calculée avant l'appel")], relance="Image 4 : ce que ça change."),
  S(title="Ce que\nça change", body="Je dis non plus souvent. **Celles que j'achète passent la barre des 750 € avant même la visite.**"),
], "Ta barre,\n*avant* l'appel."),

car('40-annonces-3-appels', 'RE',
    "Trier 40 annonces de voitures en 10 minutes et garder 3 appels utiles. La méthode en 3 filtres.",
    "Tu regardes combien d'annonces par jour ?", [
  S(kicker="40 annonces ce matin ?", title="3 appels utiles.\nEn *10 minutes*."),
  S(title="Filtre 1 :\nle moteur", body="PureTech, THP, boîte robotisée : dehors. **Tu ne les revendras pas vite.**", comp=[PILLS(["1.2 PureTech", 'bad'], ["EDC", 'bad'])]),
  S(title="Filtre 2 :\nle prix", body="Au-dessus de ton prix max calculé : dehors. Pas de « on verra en négo ».", relance="Image 4 : le filtre le plus rapide."),
  S(title="Filtre 3 :\nles mots", comp=[QUOTE("Vendue en l'état, ==kilométrage non garanti==, ==joint de culasse à prévoir==.")], body="Un seul de ces mots : **dehors**."),
], "Moins d'annonces,\n*plus* d'affaires."),

car('deux-prix-avant-appel', 'PI',
    "Avant d'appeler un vendeur, j'ai deux prix : mon offre de départ et mon prix max. Comment je les calcule.",
    "Tu appelles avec un prix en tête ?", [
  S(kicker="Tu appelles un vendeur ?", title="Sans tes\n*deux* prix,\ntu as perdu."),
  S(title="L'offre\nde départ", comp=[TICKET(["Prix du marché", "8 100 €"], ["− 7 %", "− 570 €"], tot="7 530 €", totLab="J'ouvre à")]),
  S(title="Le prix max", comp=[TICKET(["Revente rapide", "8 900 €"], ["Frais", "− 600 €"], ["Marge minimum", "− 750 €"], tot="7 550 €", totLab="Je ne dépasse pas")], relance="Image 4 : entre les deux."),
  S(title="Entre\nles deux", body="Ta zone de négo. **Au-dessus du max, tu raccroches poliment.**"),
], "Deux chiffres,\n*zéro* hésitation."),

car('74-jours-stock', 'CC',
    "Une voiture en stock depuis 74 jours : ce qu'elle te coûte et quand baisser le prix. Les alertes à 60 et 90 jours.",
    "Ta plus vieille voiture en stock a combien de jours ?", [
  S(kicker="Au fond de ton parc,", title="74 jours.\nElle te coûte\nune *voiture*."),
  S(title="Ce qu'elle\nte coûte", comp=[LIST("L'argent bloqué dedans", "L'assurance, la place", "Le marché qui baisse chaque mois")]),
  S(title="Les seuils", comp=[ROWS(["Moins de 30 jours", "OK", 'ok'], ["Plus de 60 jours", "Alerte", 'warn'], ["Plus de 90 jours", "Urgence", 'bad'])], relance="Image 4 : quoi faire à 60 jours."),
  S(title="À 60 jours", comp=[LIST("Nouvelles photos, nouveau texte", "Prix dans le bas du marché", "Argent récupéré, la suivante achetée")]),
], "Un parc\nqui *tourne*."),

car('marge-nette-devinee', 'EI',
    "Les bons marchands connaissent leur chiffre d'affaires par cœur. Leur marge nette du mois, ils la devinent. Exemple chiffré.",
    "Tu connais ta marge nette du mois ?", [
  S(kicker="Ton chiffre d'affaires, tu le connais.", title="Ta marge *nette*,\ntu la devines."),
  S(title="Brute", comp=[TICKET(["Ventes du mois", "24 600 €"], ["Achats", "− 19 800 €"], tot="4 800 €", totLab="Marge brute")]),
  S(title="Nette", comp=[TICKET(["Marge brute", "4 800 €"], ["Travaux", "− 1 250 €"], ["Trajets, CT, annonces", "− 420 €"], tot="3 130 €", totLab="Marge nette")], relance="Image 4 : voiture par voiture."),
  S(title="Voiture\npar voiture", comp=[ROWS(["Clio IV", "+ 980 €", 'ok'], ["208 HDi", "+ 1 120 €", 'ok'], ["C3 II", "+ 760 €", 'ok'], ["Mégane III", "+ 270 €", 'bad'])], body="Exemple d'un mois. Une voiture tire la moyenne vers le bas."),
], "Ta marge,\n*voiture* par voiture."),

car('4-chiffres-du-mois', 'PI',
    "Ton mois d'achat-revente en 4 chiffres : marge moyenne, jours en stock, argent immobilisé, argent en attente.",
    "Tu suis quels chiffres, toi ?", [
  S(kicker="Ton mois d'achat-revente :", title="*4* chiffres.\nLe reste est\ndu bruit."),
  S(title="1 et 2", comp=[LIST(["La marge moyenne par voiture", "au-dessus de ta barre ?"], ["Les jours en stock", "moyenne et pire voiture"])]),
  S(title="3 et 4", comp=[LIST(["L'argent immobilisé", "combien dort dans le parc"], ["L'argent en attente", "vendues, pas encore encaissées"], start=3)], relance="Image 4 : où les voir."),
  S(title="Où les voir", body="Avant : un Excel jamais à jour. **Maintenant : un tableau de bord qui se remplit tout seul.**"),
], "Pilote avec\ndes *chiffres*."),

car('reprise-8000', 'CV',
    "Garagistes : ton client croit que sa voiture vaut le prix des annonces. La reprise juste se calcule en 2 minutes, et s'explique.",
    "Tu estimes tes reprises comment ?", [
  S(kicker="Ton client veut 8 000 € de reprise.", title="Les annonces\nne sont *pas*\ndes ventes."),
  S(title="Ce qu'il croit", body="Il a vu une annonce à 8 000 €. **Une annonce, c'est un prix demandé.** Pas un prix vendu."),
  S(title="Le prix juste", comp=[TICKET(["Médiane des comparables", "8 000 €"], ["Ventes conclues : − 5 %", "− 400 €"], ["Remise en état", "− 650 €"], ["Ta marge", "− 900 €"], tot="6 050 €", totLab="Reprise")], relance="Image 4 : comment l'expliquer."),
  S(title="L'expliquer", body="Tu montres les comparables et les travaux. **Le client voit le calcul, il accepte plus facilement.**"),
], "Un prix juste,\n*expliqué*."),

car('ridicule-rib', 'DO',
    "Annonces de voitures à prix ridicule et demande de RIB : les arnaques visent aussi les pros de l'achat-revente.",
    "Tu en reçois combien par semaine ?", [
  S(kicker="Même les pros tombent dedans.", title="Un prix\n*ridicule*,\nun RIB, fini."),
  S(title="Le scénario", comp=[CHAT(["v", "Je suis muté, je la laisse à 2 900 €. Virement et je vous la fais livrer."])]),
  S(title="Les signaux", comp=[LIST("Plus de 40 % sous le marché", "Pas de visite possible", "Paiement avant de voir la voiture")], relance="Image 4 : ton filtre."),
  S(title="Ton filtre", comp=[VERDICT("Annonce suivante", 'bad', "Pas de visite, pas de virement.")]),
], "Garde ton argent\n*pour* les vraies."),

car('quiz-clio-8400', 'DM',
    "Quiz achat-revente : Clio IV 1.5 dCi, 2014, 128 000 km, affichée 8 400 €. Combien tu proposes ? Réponse en image 4.",
    "Ton offre en commentaire, avant de glisser.", [
  S(kicker="Réponds avant de glisser.", title="Clio IV à\n8 400 €. Tu\n*proposes* combien ?"),
  S(title="L'annonce", comp=[QUOTE("Clio IV 1.5 dCi 90 · 2014 · 128 000 km. CT OK, ==pneus à prévoir==, ==distribution non faite==. 8 400 €.")]),
  S(title="Le marché", comp=[COTE(7850, 8400, 6500, 9500)], relance="Image 4 : ma réponse."),
  S(title="Ma réponse", comp=[TICKET(["Marché", "7 850 €"], ["− 7 %", "− 550 €"], ["Pneus", "− 200 €"], ["Distribution", "− 600 €"], tot="6 500 €", totLab="J'ouvre à")]),
], "Ton offre,\n*calculée*."),

car('plus-de-scroll', 'AA',
    "Je n'ouvre plus les annonces de voitures le matin. Les alertes arrivent par mail, la marge déjà calculée. Avant / après.",
    "Tu scrolles combien de temps par jour ?", [
  S(kicker="Tu ouvres les annonces 5 fois par jour ?", title="Je ne les\nouvre *plus*."),
  S(title="Avant", comp=[TL(["7 h", "Leboncoin, La Centrale, AutoScout."], ["13 h", "Rebelote."], ["22 h", "Encore. Les bonnes, déjà parties.", 'x'])]),
  S(title="Après", body="Une recherche précise par modèle. **Une alerte toutes les 15 minutes ou toutes les heures.**", relance="Image 4 : ce que contient l'alerte."),
  S(title="L'alerte", comp=[NOTIF("208 1.6 HDi · 2013 · 142 000 km", "[g]Sous la cote[/g] · marge estimée 1 020 €", "il y a 4 min")]),
], "Les annonces\nviennent à *toi*."),

car('38-defauts-chiffres', 'FC',
    "Chaque mot d'une annonce de voiture a un prix en négociation. 38 défauts recherchés et chiffrés automatiquement.",
    "Tu lis les annonces jusqu'au bout ?", [
  S(kicker="Dans le texte de l'annonce,", title="chaque mot\na un *prix*."),
  S(title="Le texte", comp=[QUOTE("Très bon état, ==petit bruit embrayage==, ==pneus à prévoir==, ==clim à recharger==.")]),
  S(title="Le chiffrage", comp=[TICKET(["Embrayage", "500 – 900 €"], ["Pneus", "150 – 350 €"], ["Clim", "80 – 450 €"], tot="730 – 1 700 €", totLab="À déduire")], relance="Image 4 : comment je les repère."),
  S(title="Comment", body="**38 défauts** recherchés dans chaque annonce, chiffrés automatiquement. Je lis la liste, pas le roman."),
], "Lis l'annonce\n*en euros*."),

car('inspection-15-points', 'DM',
    "L'inspection d'une voiture en 15 points avant de l'acheter pour la revendre. La fiche complète.",
    "Tu as une fiche d'inspection ?", [
  S(kicker="Avant d'acheter pour revendre,", title="15 points.\nSauter un seul\ncoûte *cher*."),
  S(title="1 à 5", comp=[LIST("Kilométrage et voyants au contact", "Codes défauts à la valise", "Niveau et état de l'huile", "Démarrage à froid", "Fumée à l'échappement")]),
  S(title="6 à 10", comp=[LIST("Embrayage", "Boîte, marche arrière comprise", "Freins et direction", "Fuites sous la voiture", "Pneus : date et usure", start=6)], relance="Image 4 : les 5 derniers."),
  S(title="11 à 15", comp=[LIST("Écarts de carrosserie", "Teinte des éléments", "Pare-brise et optiques", "Intérieur et équipements", "Papiers et VIN", start=11)]),
], "Inspecte,\n*puis* achète."),

car('3-questions-2-minutes', 'RE',
    "3 questions au téléphone avec le vendeur trient une annonce sur deux. Moins de trajets pour rien en achat-revente.",
    "Ta première question au téléphone ?", [
  S(kicker="Au téléphone avec le vendeur,", title="3 questions\nqui trient *1 annonce*\nsur 2."),
  S(title="1. Le CT", body="« Moins de 6 mois ? Des contre-visites ? »"),
  S(title="2. Les défauts", body="« Qu'est-ce qui ne va pas ? » Tu notes, tu chiffres pendant qu'il parle.", relance="Image 4 : la question qui décide."),
  S(title="3. Le carnet", body="« Distribution faite quand ? Factures ? » Pas de preuve : **600 € en moins** dans ton offre."),
], "Moins de trajets\n*pour rien*."),

car('argus-ou-marche', 'CV',
    "Tu estimes encore à l'Argus en achat-revente ? Le prix réel se lit dans les annonces comparables, moins 5 %.",
    "Tu te bases sur quoi pour estimer ?", [
  S(kicker="Tu estimes à l'Argus ?", title="Le marché,\nlui, ne *publie*\npas de cote."),
  S(title="La cote\nréelle", body="La médiane des annonces **comparables** : même modèle, ± 2 ans, même énergie, kilométrage proche."),
  S(title="La fourchette", comp=[COTE(7850, 7850, 6500, 9500, "La moitié des annonces entre ces deux prix")], relance="Image 4 : le détail que tout le monde oublie."),
  S(title="Le détail", body="Les voitures se vendent **environ 5 % sous** le prix affiché. Compte-le dans ta revente."),
], "Estime avec\nle *vrai* marché."),

car('kilometrage-qui-baisse', 'CC',
    "Acheter pour revendre une voiture au kilométrage douteux : c'est toi qui portes le problème quand ton acheteur fait le HistoVec.",
    "Tu vérifies les relevés à chaque fois ?", [
  S(kicker="Le compteur a reculé ?", title="C'est *toi*\nqui le portes\nà la revente."),
  S(title="Les relevés", comp=[ROWS(["Facture 2021", "108 000 km", 'ok'], ["CT 2023", "139 000 km", 'ok'], ["Annonce", "[r]117 000 km[/r]", 'bad'])]),
  S(title="Le risque", body="Tu revends, ton acheteur fait le HistoVec. **Il revient vers toi.**", relance="Image 4 : la règle."),
  S(title="La règle", comp=[VERDICT("Tu n'achètes pas", 'bad', "Un kilométrage qui baisse, c'est non.")]),
], "Les relevés\n*avant* le prix."),

car('boite-robotisee-retour', 'DO',
    "Boîtes robotisées en achat-revente : EDC, DSG, Powershift. Le client revient trois semaines après la vente.",
    "Tu en achètes encore ?", [
  S(kicker="Tu as vendu une EDC ?", title="Le client\nva *revenir*."),
  S(title="Le scénario", comp=[TL(["J+0", "Tu vends une Clio EDC."], ["J+20", "« Elle fait des à-coups. »", 'x'], ["J+21", "Il veut que tu paies.", 'x'])]),
  S(title="Les boîtes", comp=[PILLS(["EDC", 'bad'], ["DSG7", 'bad'], ["Powershift", 'bad'], ["Easytronic", 'bad'], ["AL4", 'bad'], ["ETG", 'bad'])], relance="Image 4 : si tu en prends une quand même."),
  S(title="Quand même ?", body="Seulement **avec les factures de la boîte**, et ta marge augmentée pour le risque."),
], "Moins de retours,\n*plus* de marge."),

car('parc-4-colonnes', 'FC',
    "Ton parc d'achat-revente en 4 colonnes : achetée, en préparation, en vente, vendue. Tu vois où ça bloque.",
    "Tu as combien de voitures en cours ?", [
  S(kicker="Ton parc, d'un coup d'œil :", title="4 colonnes\nmontrent où\nça *bloque*."),
  S(title="Les colonnes", comp=[ROWS(["Achetée", "2", 'warn'], ["En préparation", "3", 'bad'], ["En vente", "3", 'ok'], ["Vendue ce mois", "4", 'ok'])]),
  S(title="Ici", body="Trois voitures en préparation. **Ton garagiste est le goulot.** Ton argent attend chez lui.", relance="Image 4 : avant les colonnes."),
  S(title="Avant", body="Un Notion, un Drive, des notes sur le téléphone. **Je perdais le fil des papiers.**"),
], "Ton parc,\n*clair*."),

car('excel-pas-a-jour', 'DO',
    "Ton Excel d'achat-revente n'est jamais à jour : tu le remplis après, le soir, fatigué. J'ai fait pareil.",
    "Ton Excel est à jour, là ?", [
  S(kicker="Ton Excel d'achat-revente,", title="il date de\n*quand* ?"),
  S(title="Les colonnes", comp=[PILLS(["Modèle"], ["Achat"], ["Frais"], ["Travaux"], ["Revente"], ["Marge"], ["Jours"], ["Statut"])]),
  S(title="Le problème", body="Tu le remplis **après**. Le soir, fatigué. Une fois sur deux, tu oublies.", relance="Image 4 : ce qui a marché pour moi."),
  S(title="Ce qui\na marché", body="Le calcul se fait **quand je colle l'annonce**. Achat, frais, marge : déjà là."),
], "Plus d'Excel\n*en retard*."),

car('travaux-qui-se-voient', 'RE',
    "Préparer une voiture avant revente : les petits travaux qui se voient sur les photos. Optiques, rayures, nettoyage pour 160 à 400 €.",
    "Tu prépares tes voitures toi-même ?", [
  S(kicker="Avant de revendre,", title="400 € de\ntravaux qui\nse *voient*."),
  S(title="Les petits prix", comp=[TICKET(["Rénovation des 2 optiques", "40 – 120 €"], ["Retouche rayure", "80 – 200 €"], ["Nettoyage intérieur", "40 – 80 €"], tot="160 – 400 €", totLab="Total")]),
  S(title="Pourquoi", body="Sur les photos, **une voiture propre se démarque**. Moins de négo, vente plus rapide.", relance="Image 4 : ce que tu ne fais pas."),
  S(title="Tu ne\nfais pas", body="La grosse mécanique que l'acheteur ne voit pas. **Elle se chiffre à l'achat.**"),
], "Prépare ce\nqui *se voit*."),

car('negocier-avec-le-marche', 'CV',
    "En négo, tu crois qu'il faut convaincre le vendeur. Montre-lui le marché : 14 annonces comparables ne se discutent pas.",
    "Tu négocies avec quoi ?", [
  S(kicker="En négo,", title="ne discute\npas *ton* avis.\nMontre le marché."),
  S(title="La phrase", comp=[CHAT(["m", "J'ai 14 annonces du même modèle, même année, même kilométrage. Elles tournent autour de 7 850 €."])]),
  S(title="Pourquoi\nça marche", body="Il peut contester ton avis. **Il ne peut pas contester 14 annonces.**", relance="Image 4 : la suite."),
  S(title="La suite", comp=[CHAT(["m", "Avec la distribution à faire, je peux monter à 6 900 €."], ["v", "Faites 7 000 et c'est bon."])]),
], "Négocie avec\nle *marché*."),

car('meilleur-mot-non', 'PI',
    "En achat-revente, l'argent se gagne aussi en disant non. Les voitures à refuser, et comment dire non en 10 secondes.",
    "Ton dernier non, c'était quoi ?", [
  S(kicker="Achat-revente :", title="ton meilleur\nmot,\nc'est *non*."),
  S(title="Dis non à", comp=[LIST("Une marge sous 750 €", "Un moteur ou une boîte à risque", "Des papiers incomplets", "Un kilométrage douteux")]),
  S(title="Pourquoi", body="Une mauvaise voiture bloque ton argent **et** ton temps. Pendant ce temps, la bonne passe.", relance="Image 4 : dire non vite."),
  S(title="Dire non\nvite", body="Le calcul avant l'appel. **Le non prend 10 secondes**, pas une visite."),
], "Dis non\n*plus vite*."),

car('colle-lis-decide', 'FC',
    "6 mois d'achat-revente et je ne calcule plus rien à la main. Je colle l'annonce : cote, défauts, moteur, marge, offre.",
    "Tu calcules encore à la main ?", [
  S(kicker="Je colle une annonce.", title="2 secondes après,\nj'ai ma *décision*."),
  S(title="L'annonce", comp=[QUOTE("Clio IV 1.5 dCi 90 · 2014 · 128 000 km · ==pneus à prévoir== · 6 900 €")]),
  S(title="Ce que\nje reçois", comp=[ROWS(["Cote du marché", "7 850 €", 'ok'], ["Défauts chiffrés", "200 €", 'warn'], ["Moteur", "Fiable", 'ok'], ["Marge estimée", "980 €", 'ok'])], relance="Image 4 : la décision."),
  S(title="La décision", comp=[VERDICT("Rentable", 'ok', "Offre de départ **6 450 €**. Prix max **7 050 €**.")]),
], "Colle. Lis.\n*Décide.*"),

car('frais-fixes-200', 'CC',
    "Les frais fixes par voiture en achat-revente : trajet, CT, annonce, nettoyage. Environ 200 € par voiture, 2 000 € sur 10.",
    "Tes frais fixes, c'est combien par voiture ?", [
  S(kicker="Tes frais fixes par voiture :", title="sur 10 voitures,\n*2 000 €*\ninvisibles."),
  S(title="La liste", comp=[TICKET(["Trajet aller-retour", "60 – 120 €"], ["Contrôle technique", "80 €"], ["Nettoyage + photos", "40 €"], ["Annonce en avant", "0 – 30 €"], tot="≈ 200 €", totLab="Par voiture")]),
  S(title="Sur 10\nvoitures", comp=[BIG("2 000 €", "que ta calculette ne voit pas.")], relance="Image 4 : la parade."),
  S(title="La parade", body="Tu les rentres **une fois**. Ils s'ajoutent tout seuls à chaque calcul."),
], "Compte *aussi*\nles petits frais."),

car('megane-tire-la-moyenne', 'CV',
    "Tu crois que les grosses voitures font les grosses marges en achat-revente. Classe ton parc par marge nette : la citadine gagne.",
    "C'est quoi, ton modèle le plus rentable ?", [
  S(kicker="Grosse voiture, grosse marge ?", title="Classe tes\nventes. La\n*citadine* gagne."),
  S(title="Ce qu'on croit", body="Les grosses voitures : gros prix, **grosses marges**."),
  S(title="Un mois\ntype", comp=[ROWS(["208 1.6 HDi", "+ 1 120 €", 'ok'], ["Clio IV dCi", "+ 980 €", 'ok'], ["C3 II", "+ 760 €", 'ok'], ["Mégane III", "+ 270 €", 'bad'])], relance="Image 4 : pourquoi."),
  S(title="Pourquoi", body="Plus de jours en stock, plus de négo. **La citadine tourne, la grosse dort.**"),
], "Achète ce qui\n*rapporte*."),

car('entonnoir-200-1', 'RE',
    "Combien d'annonces de voitures pour un achat en achat-revente ? Exemple de semaine : 200 vues, 6 calculs OK, 1 achat.",
    "Ton ratio annonces / achats ?", [
  S(kicker="Une semaine d'achat-revente :", title="200 annonces\npour *1* achat."),
  S(title="L'entonnoir", comp=[ROWS(["Annonces vues", "200", 'warn'], ["Dans le budget", "40", 'warn'], ["Calcul OK", "6", 'ok'], ["Appels utiles", "3", 'ok'], ["Achat", "1", 'ok'])], body="Exemple d'une semaine type."),
  S(title="Ton temps", body="Il part dans les **194 annonces** que tu n'achèteras jamais.", relance="Image 4 : couper l'entonnoir."),
  S(title="Couper\nl'entonnoir", body="Recherche précise + alertes : **tu ne vois que les 6 qui passent le calcul.**"),
], "Regarde *moins*,\nachète mieux."),

car('photos-en-euros', 'FC',
    "Les photos d'une annonce de voiture trahissent des défauts : vues manquantes, volant usé, teinte différente. Ce qu'il faut zoomer.",
    "Tu zoomes sur les photos ?", [
  S(kicker="Zoome sur les photos.", title="Elles *parlent*\navant le\nvendeur."),
  S(title="Ce qui manque", comp=[LIST("Le compteur", "Les pneus", "Le côté droit", "L'intérieur")], body="Une vue absente = **une question à poser**."),
  S(title="Ce qui\nse voit", comp=[LIST("Teinte différente entre deux éléments", "Volant usé, kilométrage bas", "Jantes frottées")], relance="Image 4 : ce que tu en fais."),
  S(title="Ce que\ntu en fais", body="Chaque défaut vu : **un montant**. Il sort de ton offre avant l'appel."),
], "Lis les photos\n*en euros*."),

car('message-premier', 'PI',
    "Le message aux vendeurs de voitures en achat-revente : court, direct, envoyé dans les 15 minutes. Les deux premières lignes comptent.",
    "Ils te répondent, tes vendeurs ?", [
  S(kicker="Les vendeurs lisent 2 lignes.", title="Le premier\nmessage *gagne*."),
  S(title="Le message", comp=[CHAT(["m", "Bonjour, toujours dispo ? Vous pouvez m'envoyer le CT et les factures ? Je peux passer demain."])]),
  S(title="Pourquoi", comp=[LIST("Court : lu sur le téléphone", "Les papiers : tu tries tout de suite", "« Demain » : il te prend au sérieux")], relance="Image 4 : le délai."),
  S(title="Le délai", body="Envoyé **dans les 15 minutes** après la mise en ligne. Avant les autres."),
], "Court.\n*Premier*."),

car('voyant-efface', 'FC',
    "Voyant moteur effacé avant la visite : le piège classique en achat-revente. La valise affiche les codes effacés récemment.",
    "Tu passes la valise à chaque fois ?", [
  S(kicker="Aucun voyant allumé ?", title="Il a peut-être\nété *effacé*\nce matin."),
  S(title="Le piège", body="Le vendeur efface les codes défauts le matin. **Le voyant revient 50 km après.**"),
  S(title="Comment\nle voir", body="La valise affiche les **codes effacés récemment** et l'état des tests de préparation.", relance="Image 4 : si c'est le cas."),
  S(title="Si c'est\nle cas", comp=[VERDICT("Méfiance", 'bad', "Demande ce qui a été effacé. Pas de réponse claire : tu pars.")]),
], "Branche la valise,\n*à chaque* visite."),

car('alertes-15-ou-60', 'FC',
    "Les alertes d'achat-revente : toutes les 15 minutes pour les modèles très demandés, toutes les heures pour les autres. Le réglage qui compte.",
    "Tu as combien de recherches actives ?", [
  S(kicker="Tes alertes d'annonces,", title="tu les as\nréglées sur\nle *bon* rythme ?"),
  S(title="15 minutes", body="Les modèles **très demandés** : Clio, 208 diesel, Mégane 3 pas chère.", comp=[PILLS(["Clio IV"], ["208 HDi"], ["Mégane III"])]),
  S(title="1 heure", body="Les modèles **moins demandés**, ou un budget plus haut. Moins de concurrence.", relance="Image 4 : le réglage qui compte."),
  S(title="Le réglage", body="Ta **marge minimum** dans chaque recherche. Tu ne reçois que ce qui passe la barre."),
], "Des alertes\n*réglées*."),

car('affiche-pas-vendu', 'CC',
    "Les voitures se vendent environ 5 % sous le prix affiché. Ta marge prévue de 900 € tombe à 500 € si tu l'oublies.",
    "Tu comptes la négo dans ta revente ?", [
  S(kicker="Ta marge prévue : 900 €.", title="Il t'en reste\n*500*. Voilà\npourquoi."),
  S(title="L'écart", comp=[TICKET(["Prix affiché", "8 000 €"], ["Ventes conclues : − 5 %", "− 400 €"], tot="7 600 €", totLab="Ce que tu encaisses")]),
  S(title="Sur ta\nmarge", body="Tu avais calculé sur l'affiché. **L'acheteur, lui, négocie.**", relance="Image 4 : comment l'intégrer."),
  S(title="L'intégrer", body="Dans ta formule, prends **la revente rapide**, pas l'affiché. Ta marge devient vraie."),
], "Calcule avec\nle *vendu*."),

car('marge-a-lachat', 'CV',
    "On dit que l'argent se fait à la vente en achat-revente. Il se fait à l'achat, avant même l'appel au vendeur.",
    "Tu gagnes ta marge à l'achat ou à la vente ?", [
  S(kicker="On dit que l'argent se fait à la vente.", title="Il se fait\n*à l'achat*."),
  S(title="À la vente", body="Tu subis le marché. **Tout le monde affiche au même prix.**"),
  S(title="À l'achat", comp=[LIST("Tu choisis le modèle", "Tu chiffres les défauts", "Tu fixes ton prix max")], relance="Image 4 : le moment qui compte."),
  S(title="Le moment", body="**Avant l'appel.** Après, tu négocies avec l'émotion."),
], "Gagne ta marge\n*avant*."),
]
