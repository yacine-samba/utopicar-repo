"""Groupe P : ceux qui font déjà de l'achat-revente (particuliers réguliers, marchands, garagistes). 34 carrousels.
Faits : règles de l'outil (cote = annonces comparables, ventes conclues ≈ 5 % sous l'affiché, offre d'ouverture
≈ 7 % sous le marché, alertes de stock, inspection de reprise en 15 points) + interview du fondateur."""
from common import *
CARS = [
car('15-minutes',
    "En achat-revente auto, la bonne affaire part en 15 minutes. Mégane 3 à 1 500 €, Clio 4 à 4 000 € : comment je ne les rate plus.",
    "Ta meilleure affaire, tu l'as eue en combien de temps ?", [
  S(kicker="Tu fais de l'achat-revente ?", title="La bonne\naffaire part\nen *15 minutes*."),
  S(title="Ça m'est arrivé.", comp=[TL(["9 h 00", "Une Mégane 3 sort à 1 500 €."], ["9 h 15", "Vendue. J'étais encore sur une autre annonce.", 'x'])]),
  S(title="Et une Clio 4\nà *4 000 €*.", body="Même histoire : partie avant mon premier appel.", relance="Image 4 : comment je ne les rate plus."),
  S(title="Maintenant,\nl'*alerte* vient à moi.", comp=[NOTIF("Clio IV 1.5 dCi · 2014", "[g]1 450 € sous la cote[/g] · marge 980 €", "il y a 2 min")], body="Toutes les 15 minutes, dans ma boîte mail."),
], "Arrête de chercher.\n*Reçois.*"),

car('calculette',
    "Tu calcules encore ta marge d'achat-revente sur la calculette du téléphone ? Ce que tu oublies à chaque fois.",
    "Calculette, Excel ou de tête ?", [
  S(kicker="Achat-revente auto :", title="tu calcules\nencore à la\n*calculette* ?"),
  S(title="Ce que tu tapes", comp=[TICKET(["Revente", "6 200 €"], ["Achat", "− 4 800 €"], tot="1 400 €", totLab="Ta calculette", tone='g')]),
  S(title="Ce que tu\noublies", comp=[PILLS(["Trajet"], ["CT"], ["Pneus"], ["Distribution"], ["Négo de l'acheteur"], ["Annonce"])], body="Chaque fois, un frais différent.", relance="Image 4 : le total."),
  S(title="Le total", comp=[TICKET(["Ta calculette", "1 400 €"], ["Frais oubliés", "− 640 €"], tot="760 €", totLab="Ta vraie marge")]),
], "Tous les frais,\n*à chaque* annonce."),

car('regle-750',
    "Ma règle d'achat-revente : 750 à 850 € de marge minimum, travaux listés avant l'achat. Sinon je laisse passer.",
    "Ta barre, c'est combien ?", [
  S(kicker="Ma règle d'achat :", title="*750 €* de marge.\nSinon, non."),
  S(title="Avant", body="Je calculais la marge **après** l'achat. Les travaux tombaient ensuite. Parfois, il ne restait rien."),
  S(title="Maintenant", comp=[LIST("Tous les travaux listés avant", "Chaque frais chiffré", "La marge calculée avant l'appel")], relance="Image 4 : ce que ça change."),
  S(title="Ce que\nça change", body="Je dis non plus souvent. **Celles que j'achète passent la barre avant même la visite.**"),
], "Ta barre,\n*avant* l'appel."),

car('trier-40-annonces',
    "Trier 40 annonces de voitures en 10 minutes et garder 3 appels utiles. La méthode en 3 filtres.",
    "Tu regardes combien d'annonces par jour ?", [
  S(kicker="40 annonces ce matin ?", title="Garde-en *3*.\nEn 10 minutes."),
  S(title="Filtre 1", body="**Le moteur.** PureTech, THP, boîte robotisée : dehors. Tu ne les revendras pas.", comp=[PILLS(["1.2 PureTech", 'bad'], ["EDC", 'bad'])]),
  S(title="Filtre 2", body="**Le prix.** Au-dessus de ton prix max calculé : dehors. Pas de « on verra en négo ».", relance="Image 4 : le filtre qui fait gagner le plus de temps."),
  S(title="Filtre 3", body="**Les mots.** « Joint de culasse », « non roulant », « kilométrage non garanti » : dehors.", comp=[QUOTE("Vendue en l'état, ==kilométrage non garanti==.")]),
], "Moins d'annonces,\n*plus* d'affaires."),

car('deux-prix',
    "Avant d'appeler un vendeur, j'ai deux prix : mon offre de départ et mon prix max. Comment je les calcule.",
    "Tu appelles avec un prix en tête ?", [
  S(kicker="Avant chaque appel,", title="j'ai *deux* prix."),
  S(title="L'offre\nde départ", comp=[TICKET(["Prix du marché", "8 100 €"], ["− 7 %", "− 570 €"], tot="7 530 €", totLab="J'ouvre à")]),
  S(title="Le prix max", comp=[TICKET(["Revente rapide", "8 900 €"], ["Frais", "− 600 €"], ["Marge minimum", "− 750 €"], tot="7 550 €", totLab="Je ne dépasse pas")], relance="Image 4 : entre les deux."),
  S(title="Entre\nles deux", body="Ma zone de négo. **Au-dessus du max, je raccroche poliment.**"),
], "Deux chiffres,\n*zéro* hésitation."),

car('stock-60-jours',
    "Une voiture en stock depuis plus de 60 jours : ce qu'elle te coûte et quand baisser le prix. Les alertes à 60 et 90 jours.",
    "Ta plus vieille voiture en stock a combien de jours ?", [
  S(kicker="Regarde le fond de ton parc.", title="Elle est là\ndepuis *74 jours*."),
  S(title="Ce qu'elle\nte coûte", comp=[LIST("L'argent bloqué dedans", "L'assurance, la place", "Le prix du marché qui baisse chaque mois")]),
  S(title="Les seuils", comp=[ROWS(["Moins de 30 jours", "OK", 'ok'], ["Plus de 60 jours", "Alerte", 'warn'], ["Plus de 90 jours", "Urgence", 'bad'])], relance="Image 4 : que faire à 60 jours."),
  S(title="À 60 jours", comp=[LIST("Nouvelles photos, nouveau texte", "Prix dans le bas du marché", "Ton argent récupéré, la suivante achetée")]),
], "Un parc\nqui *tourne*."),

car('marge-nette',
    "Marge brute ou marge nette en achat-revente auto : la différence qui fait ton mois. Exemple chiffré.",
    "Tu connais ta marge nette du mois ?", [
  S(kicker="Tu connais ton chiffre d'affaires.", title="Ta marge *nette*,\ntu la devines."),
  S(title="Brute", comp=[TICKET(["Ventes du mois", "24 600 €"], ["Achats", "− 19 800 €"], tot="4 800 €", totLab="Marge brute")]),
  S(title="Nette", comp=[TICKET(["Marge brute", "4 800 €"], ["Travaux", "− 1 250 €"], ["Trajets, CT, annonces", "− 420 €"], tot="3 130 €", totLab="Marge nette")], relance="Image 4 : voiture par voiture."),
  S(title="Voiture\npar voiture", comp=[ROWS(["Clio IV", "+ 980 €", 'ok'], ["208 HDi", "+ 1 120 €", 'ok'], ["C3 II", "+ 760 €", 'ok'], ["Mégane III", "+ 270 €", 'bad'])], body="Une voiture tire la moyenne vers le bas."),
], "Ta marge,\n*voiture* par voiture."),

car('tableau-du-mois',
    "Ton mois d'achat-revente en un écran : marge moyenne, jours en stock, argent immobilisé. Les 4 chiffres à suivre.",
    "Tu suis quels chiffres, toi ?", [
  S(kicker="Ton mois d'achat-revente,", title="*4* chiffres.\nPas plus."),
  S(title="1 et 2", comp=[LIST(["La marge moyenne par voiture", "au-dessus de ta barre ?"], ["Les jours en stock", "moyenne et pire voiture"])]),
  S(title="3 et 4", comp=[LIST(["L'argent immobilisé", "combien dort dans le parc"], ["L'argent en attente", "vendues, pas encore encaissées"], start=3)], relance="Image 4 : où les voir."),
  S(title="Où les voir", body="Avant : un Excel que je ne mettais jamais à jour. **Maintenant : un tableau de bord qui se remplit tout seul.**"),
], "Pilote avec\ndes *chiffres*."),

car('reprise-2-minutes',
    "Garagistes : estimer une reprise de voiture en 2 minutes, avec un prix juste expliqué au client. La méthode.",
    "Tu estimes tes reprises comment ?", [
  S(kicker="Garagiste ?", title="Ta reprise,\nestimée\nen *2 minutes*."),
  S(title="Le client\nveut 8 000 €", body="Il a vu une annonce à 8 000 €. **Les annonces sont affichées, pas vendues.**"),
  S(title="Le prix\njuste", comp=[TICKET(["Médiane des annonces comparables", "8 000 €"], ["Ventes conclues : environ − 5 %", "− 400 €"], ["Remise en état chiffrée", "− 650 €"], ["Ta marge", "− 900 €"], tot="6 050 €", totLab="Reprise")], relance="Image 4 : comment l'expliquer."),
  S(title="L'expliquer", body="Tu montres les annonces comparables et les travaux. **Le client voit le calcul, il accepte plus facilement.**"),
], "Un prix juste,\n*expliqué*."),

car('prix-ridicules',
    "Annonces de voitures à prix ridicule et demande de RIB : les arnaques visent aussi les pros de l'achat-revente.",
    "Tu en reçois combien par semaine ?", [
  S(kicker="Même les pros tombent dedans.", title="Un prix\n*ridicule*,\nun RIB,\net c'est fini."),
  S(title="Le scénario", comp=[CHAT(["v", "Je suis muté, je la laisse à 2 900 €. Virement et je vous la fais livrer."])]),
  S(title="Les signaux", comp=[LIST("Plus de 40 % sous le marché", "Pas de visite possible", "Paiement avant de voir la voiture")], relance="Image 4 : ton filtre."),
  S(title="Ton filtre", comp=[VERDICT("Annonce suivante", 'bad', "Pas de visite, pas de virement. Aucune exception.")]),
], "Garde ton argent\n*pour* les vraies."),

car('combien-tu-proposes',
    "Quiz achat-revente : Clio IV 1.5 dCi, 2014, 128 000 km, affichée 8 400 €. Combien tu proposes ? Réponse en image 4.",
    "Ton offre en commentaire, avant de glisser.", [
  S(kicker="Réponds avant de glisser.", title="Combien\ntu *proposes* ?"),
  S(title="L'annonce", comp=[QUOTE("Clio IV 1.5 dCi 90 · 2014 · 128 000 km. CT OK, ==pneus à prévoir==, ==distribution non faite==. 8 400 €.")]),
  S(title="Le marché", comp=[COTE(7850, 8400, 6500, 9500)], relance="Image 4 : ma réponse."),
  S(title="Ma réponse", comp=[TICKET(["Marché", "7 850 €"], ["− 7 %", "− 550 €"], ["Pneus", "− 200 €"], ["Distribution", "− 600 €"], tot="6 500 €", totLab="J'ouvre à")]),
], "Ton offre,\n*calculée*."),

car('plus-de-scroll',
    "Je n'ouvre plus les annonces de voitures le matin. Les alertes arrivent par mail, avec la marge déjà calculée.",
    "Tu scrolles combien de temps par jour ?", [
  S(kicker="Achat-revente :", title="je ne *scrolle*\nplus les\nannonces."),
  S(title="Avant", comp=[TL(["7 h", "Leboncoin, La Centrale, AutoScout."], ["13 h", "Rebelote."], ["22 h", "Encore. Les bonnes, déjà parties.", 'x'])]),
  S(title="Maintenant", body="Une recherche précise par modèle. **Une alerte toutes les 15 minutes ou toutes les heures.**", relance="Image 4 : ce que contient l'alerte."),
  S(title="L'alerte", comp=[NOTIF("208 1.6 HDi · 2013 · 142 000 km", "[g]Sous la cote[/g] · marge estimée 1 020 €", "il y a 4 min")]),
], "Les annonces\nviennent à *toi*."),

car('mots-qui-valent',
    "Les mots d'une annonce de voiture qui valent de l'argent en négociation : chaque défaut écrit a un prix.",
    "Tu lis les annonces jusqu'au bout ?", [
  S(kicker="Lis l'annonce jusqu'au bout.", title="Chaque mot\na un *prix*."),
  S(title="Dans le texte", comp=[QUOTE("Très bon état, ==petit bruit embrayage==, ==pneus à prévoir==, ==clim à recharger==.")]),
  S(title="Le chiffrage", comp=[TICKET(["Embrayage", "500 – 900 €"], ["Pneus", "150 – 350 €"], ["Clim", "80 – 450 €"], tot="730 – 1 700 €", totLab="À déduire")], relance="Image 4 : comment je les repère."),
  S(title="Comment\nje les repère", body="38 défauts recherchés dans chaque annonce, **chiffrés automatiquement**. Je lis la liste, pas le roman."),
], "Lis l'annonce\n*en euros*."),

car('inspection-15-points',
    "L'inspection d'une voiture en 15 points avant de l'acheter pour la revendre. La fiche que j'utilise.",
    "Tu as une fiche d'inspection ?", [
  S(kicker="Avant d'acheter pour revendre,", title="*15* points.\nTous."),
  S(title="1 à 5", comp=[LIST("Kilométrage et voyants au contact", "Codes défauts à la valise", "Niveau et état de l'huile", "Démarrage à froid", "Fumée à l'échappement")]),
  S(title="6 à 10", comp=[LIST("Embrayage", "Boîte, marche arrière comprise", "Freins et direction", "Fuites sous la voiture", "Pneus : date et usure", start=6)], relance="Image 4 : les 5 derniers."),
  S(title="11 à 15", comp=[LIST("Écarts de carrosserie", "Teinte des éléments", "Pare-brise et optiques", "Intérieur et équipements", "Papiers et VIN", start=11)]),
], "Inspecte,\n*puis* achète."),

car('3-questions-pro',
    "Les 3 questions qui font gagner du temps au téléphone avec un vendeur de voiture. Je les pose avant de bouger.",
    "Ta première question au téléphone ?", [
  S(kicker="Au téléphone,", title="3 questions,\n*2* minutes."),
  S(title="1. Le CT", body="« Moins de 6 mois ? Des contre-visites ? » **La réponse trie 1 annonce sur 2.**"),
  S(title="2. Les défauts", body="« Qu'est-ce qui ne va pas ? » Je note, je chiffre pendant qu'il parle.", relance="Image 4 : la question qui décide."),
  S(title="3. Le carnet", body="« Distribution faite quand ? Factures ? » Pas de preuve : **600 € en moins** dans mon offre."),
], "Moins de trajets\n*pour rien*."),

car('cote-vs-argus',
    "Cote du marché ou cote Argus pour l'achat-revente ? Pourquoi je me base sur les annonces comparables en ligne.",
    "Tu te bases sur quoi pour estimer ?", [
  S(kicker="Argus ou marché ?", title="Je me fie\nau *marché*."),
  S(title="Ma cote", body="La médiane des annonces **comparables** : même modèle, ± 2 ans, même énergie, kilométrage proche."),
  S(title="La fourchette", comp=[COTE(7850, 7850, 6500, 9500, "La moitié des annonces entre ces deux prix")], relance="Image 4 : le détail que tout le monde oublie."),
  S(title="Le détail", body="Les voitures se vendent **environ 5 % sous** le prix affiché. Compte-le dans ta revente."),
], "Estime avec\nle *vrai* marché."),

car('compteur-suspect',
    "Compteur suspect sur une voiture à revendre : croise HistoVec, contrôles techniques et factures. Le kilométrage ne descend jamais.",
    "Tu vérifies les relevés à chaque fois ?", [
  S(kicker="Avant d'acheter pour revendre,", title="croise les\n*kilomètres*."),
  S(title="Les relevés", comp=[ROWS(["Facture 2021", "108 000 km", 'ok'], ["CT 2023", "139 000 km", 'ok'], ["Annonce", "[r]117 000 km[/r]", 'bad'])]),
  S(title="Le risque", body="Tu revends, ton acheteur fait le HistoVec. **C'est toi qui portes le problème.**", relance="Image 4 : la règle."),
  S(title="La règle", comp=[VERDICT("Tu n'achètes pas", 'bad', "Un kilométrage qui baisse, c'est non.")]),
], "Les relevés\n*avant* le prix."),

car('boites-robotisees-pro',
    "Boîtes robotisées en achat-revente : EDC, DSG, Powershift. Le risque de retour client après la vente.",
    "Tu en achètes encore ?", [
  S(kicker="EDC, DSG, Powershift :", title="le client\n*revient* toujours."),
  S(title="Le scénario", comp=[TL(["J+0", "Tu vends une Clio EDC."], ["J+20", "« Elle fait des à-coups. »", 'x'], ["J+21", "Il veut que tu paies.", 'x'])]),
  S(title="Les boîtes", comp=[PILLS(["EDC", 'bad'], ["DSG7", 'bad'], ["Powershift", 'bad'], ["Easytronic", 'bad'], ["AL4", 'bad'], ["ETG", 'bad'])], relance="Image 4 : si tu en prends quand même."),
  S(title="Si tu en\nprends une", body="Seulement **avec les factures de la boîte**, et ta marge augmentée pour le risque."),
], "Moins de retours,\n*plus* de marge."),

car('pipeline',
    "Ton parc d'achat-revente en 4 colonnes : achetée, en préparation, en vente, vendue. Tu vois tout d'un coup d'œil.",
    "Tu as combien de voitures en cours ?", [
  S(kicker="Ton parc, d'un coup d'œil.", title="*4* colonnes.\nC'est tout."),
  S(title="Les colonnes", comp=[ROWS(["Achetée", "2", 'warn'], ["En préparation", "1", 'warn'], ["En vente", "3", 'ok'], ["Vendue ce mois", "4", 'ok'])]),
  S(title="Pourquoi", body="Tu vois où ça bloque. **Trois voitures en préparation ? Ton garagiste est le goulot.**", relance="Image 4 : ce que je suivais avant."),
  S(title="Avant", body="Un Notion, un Drive, des notes sur le téléphone. **Je ne savais plus quelle carte grise était où.**"),
], "Ton parc,\n*clair*."),

car('colonnes-excel',
    "Les colonnes de ton Excel d'achat-revente, et pourquoi tu ne le mets jamais à jour. J'ai fait pareil.",
    "Ton Excel est à jour, là ?", [
  S(kicker="Ton Excel d'achat-revente,", title="il est *à jour* ?"),
  S(title="Les colonnes", comp=[PILLS(["Modèle"], ["Achat"], ["Frais"], ["Travaux"], ["Revente"], ["Marge"], ["Jours"], ["Statut"])]),
  S(title="Le problème", body="Tu le remplis **après**. Le soir, fatigué. Une fois sur deux, tu oublies.", relance="Image 4 : ce qui a marché pour moi."),
  S(title="Ce qui\na marché", body="Le calcul se fait **au moment où je colle l'annonce**. Achat, frais, marge : déjà là."),
], "Plus d'Excel\n*en retard*."),

car('preparation-rentable',
    "Préparer une voiture avant revente : les petits travaux qui rapportent plus qu'ils ne coûtent. Optiques, rayures, nettoyage.",
    "Tu prépares tes voitures toi-même ?", [
  S(kicker="Avant de revendre,", title="ces travaux\n*rapportent*."),
  S(title="Les petits prix", comp=[TICKET(["Rénovation des 2 optiques", "40 – 120 €"], ["Retouche rayure", "80 – 200 €"], ["Nettoyage intérieur", "40 – 80 €"], tot="160 – 400 €", totLab="Total")]),
  S(title="Pourquoi", body="Sur les photos, **une voiture propre se démarque**. Moins de négo, vente plus rapide.", relance="Image 4 : ce que tu ne fais pas."),
  S(title="Tu ne\nfais pas", body="La grosse mécanique que l'acheteur ne voit pas. **Elle se chiffre à l'achat**, pas à la revente."),
], "Prépare ce\nqui *se voit*."),

car('negocier-comparables',
    "Négocier une voiture avec les annonces comparables en main. Le vendeur ne peut pas discuter un marché.",
    "Tu négocies avec quoi, toi ?", [
  S(kicker="En négo,", title="viens avec\nles *comparables*."),
  S(title="La phrase", comp=[CHAT(["m", "J'ai 14 annonces du même modèle, même année, même kilométrage. Elles tournent autour de 7 850 €."])]),
  S(title="Pourquoi\nça marche", body="Tu ne discutes pas **ton** avis. Tu montres **le marché**.", relance="Image 4 : la suite."),
  S(title="La suite", comp=[CHAT(["m", "Avec la distribution à faire, je peux monter à 6 900 €."], ["v", "Faites 7 000 et c'est bon."])]),
], "Négocie avec\nle *marché*."),

car('dire-non',
    "En achat-revente, l'argent se gagne aussi en disant non. Les voitures que je refuse, et pourquoi.",
    "Ton dernier non, c'était quoi ?", [
  S(kicker="Achat-revente :", title="ton meilleur\nmot,\nc'est *non*."),
  S(title="Je dis non", comp=[LIST("Marge sous 750 €", "Moteur ou boîte à risque", "Papiers incomplets", "Kilométrage douteux")]),
  S(title="Pourquoi", body="Une mauvaise voiture bloque ton argent **et** ton temps. Pendant ce temps, la bonne passe.", relance="Image 4 : comment dire non vite."),
  S(title="Dire non\n*vite*", body="Le calcul avant l'appel. **Le non prend 10 secondes**, pas une visite."),
], "Dis non *plus vite*."),

car('6-mois-sans-calcul',
    "6 mois d'achat-revente et je ne calcule plus rien à la main. Ce que fait l'outil que j'ai codé, en 4 étapes.",
    "Tu calcules encore à la main ?", [
  S(kicker="6 mois d'achat-revente,", title="je ne calcule\nplus à la *main*."),
  S(title="Je colle\nl'annonce", comp=[QUOTE("Clio IV 1.5 dCi 90 · 2014 · 128 000 km · ==pneus à prévoir== · 6 900 €")]),
  S(title="Je reçois", comp=[ROWS(["Cote du marché", "7 850 €", 'ok'], ["Défauts chiffrés", "200 €", 'warn'], ["Moteur", "Fiable", 'ok'], ["Marge estimée", "980 €", 'ok'])], relance="Image 4 : la décision."),
  S(title="La décision", comp=[VERDICT("Rentable", 'ok', "Offre de départ **6 450 €**. Prix max **7 050 €**.")]),
], "Colle. Lis.\n*Décide.*"),

car('frais-fixes',
    "Les frais fixes par voiture en achat-revente : trajet, CT, annonce, nettoyage. Le chiffre à ajouter à chaque calcul.",
    "Tes frais fixes, c'est combien par voiture ?", [
  S(kicker="Tu les oublies à chaque fois.", title="Tes frais *fixes*\npar voiture."),
  S(title="La liste", comp=[TICKET(["Trajet aller-retour", "60 – 120 €"], ["Contrôle technique", "80 €"], ["Nettoyage + photos", "40 €"], ["Annonce en avant", "0 – 30 €"], tot="≈ 200 €", totLab="Par voiture")]),
  S(title="Sur 10 voitures", comp=[BIG("2 000 €", "que ta calculette ne voit pas.")], relance="Image 4 : la parade."),
  S(title="La parade", body="Tu les rentres **une fois**. Ils s'ajoutent tout seuls à chaque calcul."),
], "Compte *aussi*\nles petits frais."),

car('marge-voiture-par-voiture',
    "Quelle voiture te rapporte le plus en achat-revente ? Classe ton parc par marge nette, voiture par voiture.",
    "C'est quoi, ton modèle le plus rentable ?", [
  S(kicker="Quel modèle te rapporte le plus ?", title="Tu crois\nle *savoir*."),
  S(title="Ce qu'on croit", body="Les grosses voitures : gros prix, **grosses marges**."),
  S(title="Un mois type", comp=[ROWS(["208 1.6 HDi", "+ 1 120 €", 'ok'], ["Clio IV dCi", "+ 980 €", 'ok'], ["C3 II", "+ 760 €", 'ok'], ["Mégane III", "+ 270 €", 'bad'])], relance="Image 4 : pourquoi la Mégane perd."),
  S(title="Pourquoi", body="Plus de jours en stock, plus de négo. **La citadine tourne, la Mégane dort.**"),
], "Achète ce qui\n*rapporte*."),

car('combien-annonces',
    "Combien d'annonces de voitures tu regardes par jour en achat-revente ? Et combien deviennent un appel ?",
    "Ton ratio annonces / appels ?", [
  S(kicker="Achat-revente :", title="combien\nd'annonces\npour *un* achat ?"),
  S(title="L'entonnoir", comp=[ROWS(["Annonces vues", "200", 'warn'], ["Dans le budget", "40", 'warn'], ["Calcul OK", "6", 'ok'], ["Appels utiles", "3", 'ok'], ["Achat", "1", 'ok'])], body="Exemple d'une semaine type."),
  S(title="Où part\nton temps", body="Dans les **194 annonces** que tu n'achèteras jamais.", relance="Image 4 : comment couper l'entonnoir."),
  S(title="Couper\nl'entonnoir", body="Recherche précise + alertes : **tu ne vois que les 6 qui passent le calcul.**"),
], "Regarde\n*moins*, achète mieux."),

car('photos-annonce-vendeur',
    "Les photos d'une annonce de voiture trahissent des défauts : vues manquantes, compteur caché, pneus coupés. Ce que je regarde.",
    "Tu zoomes sur les photos ?", [
  S(kicker="Zoome sur les photos.", title="Elles *parlent*\navant\nle vendeur."),
  S(title="Ce qui manque", comp=[LIST("Le compteur", "Les pneus", "Le côté droit", "L'intérieur")], body="Une vue absente = **une question à poser**."),
  S(title="Ce qui\nse voit", comp=[LIST("Teinte différente entre deux éléments", "Volant usé, kilométrage bas", "Jantes frottées")], relance="Image 4 : ce que je fais de tout ça."),
  S(title="Ce que\nj'en fais", body="Chaque défaut vu : **un montant**. Il sort de mon offre avant même l'appel."),
], "Lis les photos\n*en euros*."),

car('message-pro',
    "Le message que j'envoie aux vendeurs de voitures en achat-revente : court, direct, avec les papiers demandés.",
    "Ils te répondent, tes vendeurs ?", [
  S(kicker="Les vendeurs ne répondaient pas.", title="J'ai changé\nde *message*."),
  S(title="Le message", comp=[CHAT(["m", "Bonjour, toujours dispo ? Vous pouvez m'envoyer le CT et les factures ? Je peux passer demain."])]),
  S(title="Pourquoi", comp=[LIST("Court : il le lit sur son téléphone", "Les papiers : tu tries tout de suite", "« Demain » : il te prend au sérieux")], relance="Image 4 : le délai."),
  S(title="Le délai", body="Envoyé **dans les 15 minutes** après la mise en ligne. Avant les autres messages."),
], "Court.\n*Premier*."),

car('voyant-efface',
    "Voyant moteur effacé avant la visite : le piège classique en achat-revente. Comment le repérer avec une valise.",
    "Tu passes la valise à chaque fois ?", [
  S(kicker="Aucun voyant ?", title="Il a peut-être\nété *effacé*."),
  S(title="Le piège", body="Le vendeur efface les codes défauts le matin. **Le voyant revient 50 km après.**"),
  S(title="Comment\nle voir", body="La valise de diagnostic affiche les **codes effacés récemment**. Et les compteurs de préparation.", relance="Image 4 : si c'est le cas."),
  S(title="Si c'est\nle cas", comp=[VERDICT("Méfiance", 'bad', "Demande ce qui a été effacé. Pas de réponse claire : tu pars.")]),
], "Branche la valise,\n*toujours*."),

car('alerte-15-ou-1h',
    "Mes alertes d'achat-revente : toutes les 15 minutes ou toutes les heures selon la recherche. Comment je les règle.",
    "Tu as combien de recherches actives ?", [
  S(kicker="Mes alertes,", title="15 minutes\nou *1 heure* ?"),
  S(title="15 minutes", body="Les modèles **très demandés** : Clio, 208 diesel, Mégane 3 pas chère. Elles partent vite.", comp=[PILLS(["Clio IV"], ["208 HDi"], ["Mégane III"])]),
  S(title="1 heure", body="Les modèles **moins demandés**, ou un budget plus haut. Moins de concurrence.", relance="Image 4 : le réglage qui compte."),
  S(title="Le réglage", body="Ta **marge minimum** dans chaque recherche. Tu ne reçois que les annonces qui passent la barre."),
], "Des alertes\n*réglées*."),

car('ventes-sous-affiche',
    "Les voitures se vendent environ 5 % sous le prix affiché. Ce que ça change dans ton calcul de revente.",
    "Tu comptes la négo dans ta revente ?", [
  S(kicker="Le prix affiché", title="n'est *pas*\nle prix vendu."),
  S(title="L'écart", comp=[TICKET(["Prix affiché", "8 000 €"], ["Ventes conclues : − 5 %", "− 400 €"], tot="7 600 €", totLab="Ce que tu encaisses")]),
  S(title="Sur ta marge", body="Tu avais calculé 900 €. **Il t'en reste 500.**", relance="Image 4 : comment l'intégrer."),
  S(title="L'intégrer", body="Dans ta formule, prends **la revente rapide**, pas l'affiché. Ta marge devient vraie."),
], "Calcule avec\nle *vendu*."),

car('ecart-acheter-vendre',
    "Ce qui sépare un achat-revente rentable d'un mauvais : tout se joue à l'achat, avant même la visite.",
    "Tu gagnes ta marge à l'achat ou à la vente ?", [
  S(kicker="On dit que l'argent se fait à la vente.", title="Il se fait\n*à l'achat*."),
  S(title="À la vente", body="Tu subis le marché. **Tout le monde affiche au même prix.**"),
  S(title="À l'achat", comp=[LIST("Tu choisis le modèle", "Tu chiffres les défauts", "Tu fixes ton prix max")], relance="Image 4 : le moment qui compte."),
  S(title="Le moment", body="**Avant l'appel.** Après, tu négocies avec l'émotion."),
], "Gagne ta marge\n*avant*."),

car('journee-type',
    "Une journée type en achat-revente de voitures quand les annonces arrivent par alerte au lieu de les chercher à la main.",
    "Elle ressemble à quoi, ta journée ?", [
  S(kicker="Une journée d'achat-revente,", title="sans *chercher*\nd'annonces."),
  S(title="Le matin", comp=[TL(["8 h 30", "3 alertes reçues dans la nuit."], ["8 h 40", "2 passent le calcul. J'appelle.", 'v'])]),
  S(title="La journée", comp=[TL(["11 h", "Visite d'une 208 HDi."], ["15 h", "Photos et annonce d'une Clio prête."], ["18 h", "Une vente encaissée.", 'v'])], relance="Image 4 : le soir."),
  S(title="Le soir", body="Je regarde **un seul écran** : marge du mois, voitures en stock, argent en attente."),
], "Ta journée,\n*sans* scroll."),
]
