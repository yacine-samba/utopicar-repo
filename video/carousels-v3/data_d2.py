"""Groupe D (2/2) : débutants en achat-revente. Thèmes nouveaux : appel au vendeur, négociation, revente (papiers, CT,
annonce, acheteurs), choix des voitures, fonctions de l'outil (alertes, calcul, tri). 33 carrousels."""
from common import *
CARS = [
car('premier-appel-script', 'DM',
    "Ton premier appel à un vendeur de voiture en achat-revente : le script en 4 phrases, de la prise de contact au rendez-vous.",
    "Tu stresses au téléphone ?", [
  S(kicker="Tu stresses avant d'appeler ?", title="4 phrases.\nTu *lis*,\nc'est tout."),
  S(title="1 et 2", comp=[CHAT(["m", "Bonjour, j'appelle pour la Clio. Elle est toujours disponible ?"], ["m", "Le contrôle technique date de quand ?"])]),
  S(title="3", comp=[CHAT(["m", "Qu'est-ce qui ne va pas sur la voiture, même un petit détail ?"])], relance="Image 4 : la phrase qui décroche le rendez-vous."),
  S(title="4", comp=[CHAT(["m", "Je peux passer demain à 18 h avec la somme. Vous aurez le CT et les factures ?"])], body="« Avec la somme » : **il te prend au sérieux**."),
], "Appelle avec\nun *script*."),

car('negocier-sans-vexer', 'EI',
    "L'erreur des débutants en négociation de voiture : critiquer la voiture pour faire baisser le prix. Le vendeur se braque. La méthode qui marche.",
    "Tu négocies comment ?", [
  S(kicker="Erreur des débutants en négo :", title="critiquer\nla voiture.\nIl se *braque*."),
  S(title="Ce qui vexe", comp=[CHAT(["m", "Franchement elle est pas terrible, les pneus sont morts, c'est cher pour ce que c'est."])]),
  S(title="Ce qui marche", comp=[CHAT(["m", "Elle me plaît. Il y a les pneus à faire, environ 200 €. Je peux vous proposer 4 300 € ?"])], relance="Image 4 : pourquoi ça marche."),
  S(title="Pourquoi", comp=[LIST("Tu commences par ce qui te plaît", "Tu chiffres au lieu de juger", "Tu proposes un prix précis")]),
], "Chiffre,\n*ne juge* pas."),

car('leviers-chiffres', 'FC',
    "Les défauts qui se négocient sur une voiture à revendre : pneus, freins, batterie, vidange, optiques. Leurs prix, à garder sur ton téléphone.",
    "Tu connaissais ces prix ?", [
  S(kicker="En négo, chaque défaut", title="a un prix.\nConnais-les *par cœur*."),
  S(title="Les petits", comp=[TICKET(["Batterie", "100 – 200 €"], ["Vidange + filtres", "80 – 150 €"], ["2 optiques rénovées", "40 – 120 €"], ["Recharge clim", "70 – 120 €"], tot="290 – 590 €", totLab="Si tout y est")]),
  S(title="Les moyens", comp=[TICKET(["2 pneus", "140 – 260 €"], ["Plaquettes + disques", "150 – 300 €"], ["Amortisseurs avant", "250 – 450 €"], tot="540 – 1 010 €", totLab="Si tout y est")], relance="Image 4 : comment t'en servir."),
  S(title="T'en servir", body="Chaque défaut vu sur place : **tu annonces son prix**, tu le retires de ton offre. Calmement."),
], "Négocie\n*en euros*."),

car('preparer-pour-revendre', 'RE',
    "Préparer une voiture avant de la revendre : nettoyage, optiques, petites retouches. Ce qui se voit sur les photos fait vendre plus vite.",
    "Tu nettoies tes voitures toi-même ?", [
  S(kicker="Avant de revendre,", title="ce qui se voit\nfait *vendre*."),
  S(title="Ce qui se voit", comp=[TICKET(["Nettoyage intérieur", "40 – 80 €"], ["2 optiques rénovées", "40 – 120 €"], ["Retouche rayure", "80 – 200 €"], tot="160 – 400 €", totLab="Préparation")]),
  S(title="Ce que\nça change", body="Des photos propres : **plus d'appels, moins de négo**. L'acheteur se projette.", relance="Image 4 : ce que tu ne fais pas."),
  S(title="Tu ne fais pas", body="Les grosses réparations invisibles. **Elles se chiffrent à l'achat**, pas avant la revente."),
], "Prépare\nce qui *se voit*."),

car('jour-de-la-vente-papiers', 'DM',
    "Le jour où tu revends ta voiture : les papiers à préparer, dans l'ordre. Certificat de cession, code de cession, carte grise barrée.",
    "Tu prépares quoi le jour de la vente ?", [
  S(kicker="Le jour où tu revends,", title="il te manque\nun papier ?\nLa vente *saute*."),
  S(title="Avant", comp=[LIST(["Certificat de non-gage", "moins de 15 jours"], ["Contrôle technique", "moins de 6 mois"], ["Factures et HistoVec", "imprimés ou envoyés"])]),
  S(title="Pendant", comp=[LIST(["Carte grise barrée", "« Vendu le … à … h » + signature"], ["Certificat de cession", "cerfa 15776, 2 exemplaires"], start=4)], relance="Image 4 : juste après."),
  S(title="Après", body="Tu déclares la cession sur le site de l'ANTS et tu donnes **le code de cession** à l'acheteur."),
], "Une vente\n*propre*."),

car('ct-pour-revendre', 'CC',
    "Revendre une voiture de plus de 4 ans sans contrôle technique de moins de 6 mois : la vente ne peut pas se faire. Compte-le dans tes frais.",
    "Tu l'avais compté dans tes frais ?", [
  S(kicker="Tu revends une voiture de plus de 4 ans ?", title="Sans CT récent,\ntu ne *vends* pas."),
  S(title="La règle", body="Le vendeur remet un contrôle technique de **moins de 6 mois**. Toi aussi, quand tu revends."),
  S(title="Le coût", comp=[TICKET(["Contrôle technique", "≈ 80 €"], ["Contre-visite éventuelle", "+ réparations"], tot="80 € et plus", totLab="À compter")], relance="Image 4 : l'astuce à l'achat."),
  S(title="À l'achat", body="Achète avec **un CT récent et propre**. S'il a moins de 6 mois à ta revente, tu n'en refais pas."),
], "Le CT,\n*dans* tes frais."),

car('histovec-qui-vend', 'FC',
    "Envoyer le HistoVec avant la visite fait vendre ta voiture plus vite : l'acheteur arrive rassuré. Comment le générer.",
    "Tu l'envoies avant la visite ?", [
  S(kicker="Quand tu revends,", title="ce PDF gratuit\nfait *vendre*\nplus vite."),
  S(title="Le HistoVec", comp=[LIST("Propriétaires", "Sinistres", "Kilométrages relevés", "Gage ou opposition")]),
  S(title="Pourquoi", body="L'acheteur arrive **rassuré**. Moins de questions, moins de négo, moins de visites pour rien.", relance="Image 4 : comment le générer."),
  S(title="Comment", body="Sur le site officiel HistoVec, avec ta carte grise. **2 minutes.** Tu l'envoies avec le CT et les factures."),
], "Rassure\n*avant* la visite."),

car('garder-factures', 'EI',
    "L'erreur des débutants en achat-revente : jeter les factures des réparations faites. À la revente, elles valent de l'argent.",
    "Tu gardes tes factures ?", [
  S(kicker="Erreur des débutants :", title="ne pas garder\nles *factures*."),
  S(title="Ce qui se passe", body="Tu as changé les pneus et fait la vidange. **L'acheteur ne te croit pas sans preuve.** Il négocie."),
  S(title="Ce qui marche", comp=[LIST("Une pochette par voiture", "Chaque facture photographiée", "Tout envoyé avant la visite")], relance="Image 4 : ce que ça rapporte."),
  S(title="Ce que\nça rapporte", body="Les travaux prouvés **ne se renégocient pas**. Ta marge reste intacte."),
], "Une preuve,\n*zéro* négo."),

car('kilometrage-max', 'FC',
    "Le kilométrage à ne pas dépasser pour une voiture à revendre : il dépend du modèle. 170 000 km pour une Aygo, 200 000 km pour une Clio.",
    "Tu achètes jusqu'à combien de km ?", [
  S(kicker="Tu achètes jusqu'à combien de km ?", title="Ça dépend\ndu *modèle*."),
  S(title="Les seuils", comp=[ROWS(["Clio III / IV, Sandero", "200 000 km", 'ok'], ["Yaris, Jazz, 207", "190 000 km", 'ok'], ["Swift, Mazda 2", "180 000 km", 'ok'], ["Aygo, C1, 107", "170 000 km", 'ok'])]),
  S(title="Au-delà", body="La revente **traîne** : les acheteurs ont peur du kilométrage, même sur un bon moteur.", relance="Image 4 : la règle."),
  S(title="La règle", body="Achète **sous le seuil** de ton modèle, avec les factures. Tu revends sans débat."),
], "Le bon\n*kilométrage*."),

car('essence-pour-revendre', 'CV',
    "Tu crois que le diesel se revend mieux. Pour une petite citadine à moins de 10 000 km par an, beaucoup d'acheteurs cherchent de l'essence.",
    "Diesel ou essence, pour toi ?", [
  S(kicker="Diesel = meilleure revente ?", title="Pas sur une\n*citadine*."),
  S(title="Ton acheteur", body="Jeune conducteur, deuxième voiture, petits trajets en ville. **Il roule peu.**"),
  S(title="Ce qu'il\ncraint", body="La vanne EGR et le FAP qui s'encrassent en ville : **jusqu'à 1 500 €**.", relance="Image 4 : ce qu'il cherche."),
  S(title="Ce qu'il\ncherche", comp=[PILLS(["Yaris VVT-i", 'ok'], ["Clio 1.2 16V", 'ok'], ["Jazz i-VTEC", 'ok'], ["Aygo 1.0", 'ok'])]),
], "Pense à\n*ton* acheteur."),

car('regle-30-jours', 'PI',
    "La règle des 30 jours en achat-revente : une voiture pas vendue en un mois, tu baisses le prix et tu récupères ton argent.",
    "Ta voiture la plus longue, c'était combien de jours ?", [
  S(kicker="Ta voiture ne part pas ?", title="30 jours.\nPas *un* de plus."),
  S(title="Jour 1", body="Prix dans **le bas du marché**. Photos propres, annonce complète."),
  S(title="Jour 15", body="Pas d'appel ? **Le problème vient des photos ou du texte.** Refais-les.", relance="Image 4 : jour 30."),
  S(title="Jour 30", comp=[VERDICT("Baisse le prix", 'warn', "Ton argent bloqué vaut plus que 200 € de marge.")]),
], "Fais *tourner*\nton argent."),

car('negociation-dans-le-prix', 'FC',
    "Ton acheteur va négocier : prévois-le dans ton prix affiché. Les voitures se vendent environ 5 % sous le prix demandé.",
    "Tu prévois la négo dans ton prix ?", [
  S(kicker="Ton acheteur va négocier.", title="Prévois-le\n*avant*\nd'afficher."),
  S(title="Le constat", body="Les voitures se vendent **environ 5 % sous** le prix affiché."),
  S(title="Exemple", comp=[TICKET(["Prix visé", "5 000 €"], ["+ 5 % de marge de négo", "+ 250 €"], tot="5 250 €", totLab="Prix affiché")], relance="Image 4 : la limite."),
  S(title="La limite", body="Reste **dans le bas du marché**. Trop haut, personne n'appelle et la négo n'a jamais lieu."),
], "Affiche\n*malin*."),

car('defauts-ecrits', 'CV',
    "Tu crois qu'écrire les défauts dans ton annonce de revente fait fuir. Les défauts découverts à la visite font fuir davantage.",
    "Tu écris les défauts dans tes annonces ?", [
  S(kicker="Écrire les défauts fait fuir ?", title="Les cacher\nfait fuir\n*plus*."),
  S(title="Défaut caché", comp=[TL(["Visite", "L'acheteur découvre la rayure."], ["Réaction", "« Qu'est-ce qu'il cache d'autre ? »", 'x'], ["Fin", "Il part. Visite perdue.", 'x'])]),
  S(title="Défaut écrit", body="L'acheteur vient **en sachant**. Il a déjà accepté le défaut au téléphone.", relance="Image 4 : comment l'écrire."),
  S(title="Comment\nl'écrire", comp=[QUOTE("++Rayure sur la porte arrière, visible en photo 6. Prix ajusté en conséquence.++", lab="Dans l'annonce")]),
], "Écris-le,\n*vends-la*."),

car('filtrer-les-curieux', 'DO',
    "Tu reçois 30 messages pour ta voiture et personne ne vient ? Le message qui filtre les curieux et garde les acheteurs.",
    "Tu reçois beaucoup de « toujours dispo ? » ?", [
  S(kicker="30 messages, zéro visite ?", title="Tu réponds\naux *curieux*."),
  S(title="Les curieux", comp=[CHAT(["v", "Toujours dispo ?"], ["v", "Dernier prix ?"], ["v", "Échange possible ?"], v='Un acheteur')]),
  S(title="Ta réponse", comp=[CHAT(["m", "Oui. CT, factures et HistoVec en pièce jointe. Visites ce week-end : samedi 10 h ou dimanche 14 h ?"])], relance="Image 4 : pourquoi ça marche."),
  S(title="Pourquoi", body="Tu proposes **un créneau précis**. Les curieux disparaissent, les acheteurs réservent."),
], "Garde les\n*acheteurs*."),

car('vendre-a-un-pro', 'CV',
    "Tu crois qu'il est plus simple de revendre ta voiture à un pro. Il te rachète moins cher, et c'est ta marge qui part.",
    "Tu as déjà revendu à un pro ?", [
  S(kicker="Revendre à un pro, c'est plus simple ?", title="Oui. Et ta\nmarge part\n*avec*."),
  S(title="Le pro", body="Il rachète sous le marché : **il doit faire sa propre marge**. Souvent plusieurs centaines d'euros sous un particulier."),
  S(title="Le particulier", body="Plus long : annonce, appels, visites. **Mais tu encaisses le prix du marché.**", relance="Image 4 : quand vendre à un pro."),
  S(title="Quand\nle pro", comp=[VERDICT("Exception", 'warn', "Voiture qui dort depuis 60 jours : récupérer ton argent vaut la décote.")]),
], "Vends au\n*bon* acheteur."),

car('modeles-a-fuir-debutant', 'EI',
    "Les débutants ambitieux en achat-revente achètent des premiums ou des sportives. Peu d'acheteurs, réparations chères : la marge disparaît.",
    "Tu as été tenté par une premium ?", [
  S(kicker="Débutant ambitieux ?", title="La *premium*\nest un piège."),
  S(title="Pourquoi", comp=[LIST("Peu d'acheteurs pour ce budget", "Des réparations à 1 500 € et plus", "Une négo dure, des acheteurs exigeants")]),
  S(title="Les pièges", comp=[PILLS(["Premium à 200 000 km", 'bad'], ["Sportive", 'bad'], ["Boîte robotisée", 'bad'], ["Électrique ancienne", 'bad'])], relance="Image 4 : quoi acheter à la place."),
  S(title="À la place", body="Une citadine fiable, entre **3 000 et 6 000 €**. Moins de marge par voiture, mais elle part vite."),
], "Commence\n*simple*."),

car('defaut-connu-chiffre', 'CV',
    "Tu crois qu'une voiture avec un défaut est une mauvaise affaire. Un défaut connu et chiffré avant l'achat, c'est souvent ta marge.",
    "Tu as déjà acheté avec un défaut ?", [
  S(kicker="Une voiture avec un défaut,", title="c'est parfois\nta *marge*."),
  S(title="La condition", body="Le défaut est **connu, chiffré et réparable**. Le vendeur a baissé son prix plus que la réparation."),
  S(title="Exemple", comp=[TICKET(["Prix sans défaut", "4 800 €"], ["Prix avec défaut", "3 900 €"], ["Réparation", "− 500 €"], tot="+ 400 €", totLab="Gagné à l'achat", tone='g')], relance="Image 4 : les défauts à fuir."),
  S(title="À fuir", comp=[PILLS(["Joint de culasse", 'bad'], ["Moteur", 'bad'], ["Boîte", 'bad'], ["Bruit inconnu", 'bad'])], body="Un défaut **non chiffrable**, c'est un pari."),
], "Chiffre\nle *défaut*."),

car('prix-max-100-euros', 'PI',
    "« Pour 100 € de plus, ça passe. » Non. En achat-revente, chaque dépassement du prix max sort de ta marge.",
    "Tu as déjà dépassé ton prix max ?", [
  S(kicker="« Pour 100 € de plus… »", title="Ton prix max\nn'est pas une\n*suggestion*."),
  S(title="Le calcul", comp=[TICKET(["Marge prévue au prix max", "750 €"], ["Dépassement « juste 100 € »", "− 100 €"], ["Imprévu sur la voiture", "− 250 €"], tot="400 €", totLab="Il te reste", tone='r')]),
  S(title="Pourquoi\non cède", body="Tu as fait 100 km, tu es sur place, tu as envie. **L'émotion négocie à ta place.**", relance="Image 4 : la parade."),
  S(title="La parade", body="Annonce ton prix max **au téléphone, avant le trajet**. S'il refuse, tu ne te déplaces pas."),
], "Ton max,\n*c'est* ton max."),

car('coller-l-annonce', 'FC',
    "La fonction que j'utilise avant chaque appel : coller l'annonce de voiture et lire la cote, les défauts, le moteur et la marge.",
    "Tu analyses une annonce comment ?", [
  S(kicker="Avant chaque appel,", title="je colle\nl'annonce.\n*2 secondes*."),
  S(title="Je colle", comp=[QUOTE("Clio IV 1.5 dCi 90 · 2014 · 128 000 km · ==pneus à prévoir== · 6 900 €")]),
  S(title="Je lis", comp=[ROWS(["Cote du marché", "7 850 €", 'ok'], ["Défauts chiffrés", "200 €", 'warn'], ["Moteur", "Fiable", 'ok'], ["Marge estimée", "980 €", 'ok'])], relance="Image 4 : ce que je décide."),
  S(title="Je décide", comp=[VERDICT("J'appelle", 'ok', "Offre de départ **6 450 €**, prix max **7 050 €**.")]),
], "Colle.\n*Décide.*"),

car('alerte-avant-les-autres', 'FC',
    "Les alertes d'annonces de voitures : une recherche précise, un mail toutes les 15 minutes, avant les autres acheteurs.",
    "Tu as des alertes, toi ?", [
  S(kicker="Les bonnes affaires", title="arrivent\ndans ma\n*boîte mail*."),
  S(title="La recherche", comp=[ROWS(["Modèle", "Clio IV", 'ok'], ["Moteur", "1.5 dCi", 'ok'], ["Budget", "≤ 5 000 €", 'ok'], ["Marge minimum", "750 €", 'ok'])]),
  S(title="Le rythme", body="**Toutes les 15 minutes** pour les modèles très demandés. Toutes les heures pour les autres.", relance="Image 4 : ce que je reçois."),
  S(title="Je reçois", comp=[NOTIF("Clio IV 1.5 dCi · 2013", "[g]Sous la cote[/g] · marge estimée 910 €", "il y a 2 min")]),
], "Sois *premier*."),

car('trier-avant-appeler', 'DM',
    "Trier les annonces de voitures avant d'appeler : moteur, prix, mots dangereux. 3 filtres, 10 minutes.",
    "Tu tries tes annonces comment ?", [
  S(kicker="Trop d'annonces ?", title="3 filtres.\nIl en reste\n*trois*."),
  S(title="Filtre 1", body="**Le moteur.** PureTech, THP, boîte robotisée : dehors."),
  S(title="Filtre 2", body="**Le prix.** Au-dessus de ton prix max : dehors.", relance="Image 4 : le filtre des mots."),
  S(title="Filtre 3", comp=[QUOTE("Vendue en l'état, ==non roulante==, ==kilométrage non garanti==.")], body="Un seul de ces mots : **dehors**."),
], "Trie,\n*puis* appelle."),

car('premier-mois-une-voiture', 'PI',
    "Ton premier mois d'achat-revente : l'objectif est une voiture, bien achetée et bien revendue. Pas cinq.",
    "Ton objectif du premier mois ?", [
  S(kicker="Ton premier mois :", title="*une* voiture.\nPas cinq."),
  S(title="Pourquoi une", comp=[LIST("Tu apprends le calcul sur un vrai cas", "Tu découvres les frais réels", "Tu revends et tu mesures")]),
  S(title="Ce que\ntu mesures", comp=[ROWS(["Marge prévue", "800 €", 'ok'], ["Marge réelle", "?", 'warn'], ["Jours pour vendre", "?", 'warn'])], relance="Image 4 : le mois 2."),
  S(title="Le mois 2", body="Tu corriges ton calcul avec **tes vrais chiffres**. Puis deux voitures."),
], "Une, *bien*\nfaite."),

car('reserve-imprevu', 'EI',
    "L'erreur des débutants motivés : réinvestir tout l'argent dans la voiture suivante. Garde une réserve pour l'imprévu.",
    "Tu gardes une réserve ?", [
  S(kicker="Erreur des débutants motivés :", title="tout remettre\ndans la *suivante*."),
  S(title="Ce qui arrive", comp=[TL(["Achat", "Tout ton argent dans la voiture."], ["J+3", "Batterie morte, 150 €.", 'x'], ["J+4", "Tu n'as plus rien.", 'x'])]),
  S(title="La réserve", body="Garde **10 à 15 %** de ton budget hors voiture. Pour la batterie, les pneus, l'imprévu.", relance="Image 4 : exemple."),
  S(title="Exemple", comp=[TICKET(["Budget total", "4 000 €"], ["Réserve 12 %", "− 480 €"], tot="3 520 €", totLab="Achat max")]),
], "Garde de\nl'*air*."),

car('trajet-mange-marge', 'CC',
    "Aller chercher une voiture à 300 km en achat-revente : essence, péage, journée perdue. Le trajet mange ta marge avant l'achat.",
    "Tu vas jusqu'où pour une voiture ?", [
  S(kicker="La voiture parfaite est à 300 km.", title="Le trajet\nmange ta\n*marge*."),
  S(title="Le coût", comp=[TICKET(["Essence aller", "≈ 45 €"], ["Péages", "≈ 40 €"], ["Train ou retour", "≈ 40 €"], tot="≈ 125 €", totLab="Avant même l'achat", tone='r')]),
  S(title="Et si", body="Sur place, la voiture ne correspond pas. **Tu as payé 125 € pour rien.**", relance="Image 4 : la règle."),
  S(title="La règle", comp=[LIST("Cherche d'abord près de chez toi", "Au-delà de 100 km : marge plus haute", "Tout vérifier au téléphone avant")]),
], "Compte\nle *trajet*."),

car('acheter-a-un-pro', 'CV',
    "Tu crois qu'acheter ta voiture à revendre chez un pro est plus sûr. Il a déjà pris sa marge : il ne reste rien pour toi.",
    "Tu achètes chez des pros ?", [
  S(kicker="Acheter chez un pro, c'est plus sûr ?", title="Pour revendre,\nc'est *trop* cher."),
  S(title="Le pro", body="Garantie, voiture préparée, **sa marge déjà dedans**. Le prix est en haut du marché."),
  S(title="Le particulier", body="Pas de garantie, mais **un prix plus bas**. C'est là que ta marge existe.", relance="Image 4 : le compromis."),
  S(title="Le compromis", body="Achète chez un particulier, **avec les papiers et une inspection** si un doute existe."),
], "Ta marge est\nchez les *particuliers*."),

car('trop-belle-affaire', 'DO',
    "Une affaire de voiture trop belle : prix ridicule, vendeur loin, RIB envoyé. Les arnaques visent aussi les débutants en achat-revente.",
    "Tu en as déjà vu une ?", [
  S(kicker="Tu débutes et tu cherches l'affaire ?", title="Les arnaqueurs\nte *cherchent* aussi."),
  S(title="Le message", comp=[CHAT(["v", "Je suis muté à l'étranger. Je la laisse à 2 900 €. Virement et je vous la fais livrer."])]),
  S(title="Les 3 signes", comp=[LIST("Prix très sous le marché", "Pas de visite possible", "Paiement avant de voir la voiture")], relance="Image 4 : ta réponse."),
  S(title="Ta réponse", comp=[VERDICT("Rien", 'bad', "Tu ne réponds pas. Annonce suivante.")]),
], "Garde\n*ton* argent."),

car('pas-d-essai-pas-d-achat', 'PI',
    "Un vendeur refuse l'essai de la voiture que tu veux revendre ? Pas d'essai, pas d'achat. Ce que l'essai montre.",
    "On t'a déjà refusé un essai ?", [
  S(kicker="Le vendeur refuse l'essai ?", title="Pas d'essai,\n*pas* d'achat."),
  S(title="L'essai montre", comp=[LIST("L'embrayage et la boîte", "Les freins et la direction", "Les bruits moteur chaud")]),
  S(title="La parade", body="Propose qu'il conduise, toi à côté. **Tu écoutes, tu regardes les voyants.**", relance="Image 4 : s'il refuse encore."),
  S(title="Encore non ?", comp=[VERDICT("Tu pars", 'bad', "Un vendeur qui cache la route cache un défaut.")]),
], "Roule\n*avant* d'acheter."),

car('mes-3-criteres', 'RE',
    "Mes 3 critères pour toute voiture à revendre : CT OK, pas de grosse carrosserie, mécanique très saine. Rien d'autre.",
    "Tu as des critères, toi ?", [
  S(kicker="Pour chaque voiture que j'achète :", title="3 critères.\n*Rien* d'autre."),
  S(title="Les 3", comp=[ROWS(["Contrôle technique OK", "Oui", 'ok'], ["Pas de grosse carrosserie", "Oui", 'ok'], ["Mécanique très saine", "Oui", 'ok'])]),
  S(title="Pourquoi\nsi peu", body="Ces trois-là décident du prix de revente. **Le reste, l'acheteur s'en fiche.**", relance="Image 4 : ce que j'ignore."),
  S(title="J'ignore", comp=[PILLS(["Couleur"], ["Options"], ["Jantes"], ["Finition"])], body="Ils ne changent pas la marge."),
], "3 critères,\n*zéro* doute."),

car('revente-4-etapes', 'DM',
    "Une revente de voiture en 4 étapes : préparation, photos, annonce, visites. Chaque étape a sa règle.",
    "Tu en es à quelle étape ?", [
  S(kicker="Ta voiture est prête à revendre ?", title="4 étapes.\nUne règle\n*chacune*."),
  S(title="1 et 2", comp=[LIST(["Préparation", "ce qui se voit : propre, optiques, rayures"], ["Photos", "8 vues, lumière douce, fond vide"])]),
  S(title="3 et 4", comp=[LIST(["Annonce", "titre clair, défauts écrits, papiers listés"], ["Visites", "créneaux précis, papiers prêts"], start=3)], relance="Image 4 : l'étape qui fait vendre."),
  S(title="L'étape\nqui vend", body="**Le prix.** Dans le bas du marché, tout le reste devient plus facile."),
], "Revends\n*en ordre*."),

car('5-pour-cent-negociation', 'FC',
    "En achat-revente, les voitures se vendent environ 5 % sous le prix affiché. Ce chiffre change ton calcul de revente.",
    "Tu le comptes dans ton calcul ?", [
  S(kicker="Ta revente à 6 000 € ?", title="Compte\nplutôt\n*5 700*."),
  S(title="Le constat", body="Les voitures se vendent **environ 5 % sous** le prix affiché. L'acheteur négocie toujours un peu."),
  S(title="Sur ta marge", comp=[TICKET(["Revente affichée", "6 000 €"], ["− 5 %", "− 300 €"], tot="5 700 €", totLab="Revente réelle")], relance="Image 4 : ce que ça change."),
  S(title="Ce que\nça change", body="Tes 750 € de marge minimum se calculent **sur 5 700 €**, pas sur 6 000 €."),
], "Calcule avec\nle *vendu*."),

car('pas-de-sportive', 'EI',
    "Pourquoi les débutants doués en mécanique perdent de l'argent en achat-revente : ils achètent des voitures qu'ils savent réparer, pas qu'ils savent revendre.",
    "Tu répares toi-même ?", [
  S(kicker="Tu es doué en mécanique ?", title="C'est ton\n*piège*."),
  S(title="Le raisonnement", body="« Je peux réparer moi-même, donc je peux acheter abîmé. » **Le temps passé n'est pas compté.**"),
  S(title="Le calcul\noublié", comp=[TICKET(["Pièces", "300 €"], ["Ton temps : 3 week-ends", "?"], tot="300 € + 3 week-ends", totLab="Vrai coût")], relance="Image 4 : la bonne façon."),
  S(title="La bonne\nfaçon", body="Répare **ce qui est rapide et chiffré**. Le reste, laisse-le aux autres."),
], "Ton temps\n*compte*."),

car('carnet-tamponne', 'FC',
    "Le carnet d'entretien tamponné d'une voiture à revendre vaut de l'argent : l'acheteur paie pour la tranquillité.",
    "Tu vérifies le carnet ?", [
  S(kicker="Deux voitures identiques.", title="Celle avec\nle *carnet*\nse vend plus vite."),
  S(title="Ce que\nveut l'acheteur", body="Pas une voiture parfaite. **Une voiture dont il connaît l'histoire.**"),
  S(title="Le carnet", comp=[ROWS(["Tamponné, complet", "Rassure", 'ok'], ["Factures sans carnet", "OK", 'ok'], ["Rien du tout", "Négo forte", 'bad'])], relance="Image 4 : à l'achat."),
  S(title="À l'achat", body="Préfère **la voiture avec carnet**, même un peu plus chère. Tu la revends plus vite."),
], "L'histoire\n*se vend*."),
car('annonce-en-10-secondes', 'DM',
    "Ce que je lis dans une annonce de voiture en 10 secondes avant de décider d'appeler : moteur, prix, mots, photos.",
    "Tu regardes quoi en premier dans une annonce ?", [
  S(kicker="Une annonce, 10 secondes :", title="je lis *4* choses.\nDans cet ordre."),
  S(title="1 et 2", comp=[LIST(["Le moteur", "fiable ou à fuir"], ["Le prix", "sous mon prix max ?"])]),
  S(title="3 et 4", comp=[LIST(["Les mots", "« en l'état », « voyant », « à prévoir »"], ["Les photos", "compteur, pneus, côté droit"], start=3)], relance="Image 4 : ce qui me fait appeler."),
  S(title="J'appelle si", comp=[ROWS(["Moteur fiable", "✓", 'ok'], ["Sous le prix max", "✓", 'ok'], ["Aucun mot rouge", "✓", 'ok'], ["Photos complètes", "✓", 'ok'])]),
], "10 secondes,\n*une* décision."),
]
