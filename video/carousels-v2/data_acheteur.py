"""Groupe A : acheteurs particuliers (Leboncoin et autres) qui ont peur de se faire avoir. 33 carrousels.
Faits et chiffres : règles de l'outil et guide « Acheter votre prochaine occasion » du site (branche main,
web/src/lib/analyse/defauts.ts, fiabilite.ts, regles.ts, guides/index.ts) + interview du fondateur."""
from common import *
CARS = [
car('5-phrases-annonce',
    "5 phrases d'annonce de voiture d'occasion qui cachent une réparation, avec le prix de chacune. Lis-les avant d'appeler le vendeur.",
    "Laquelle tu as déjà vue dans une annonce ?", [
  S(kicker="Tu achètes une occasion ?", title="5 phrases\nd'annonce qui\nte coûtent *cher*."),
  S(title="« Embrayage\nun peu dur »", comp=[QUOTE("Très bon état, ==embrayage un peu dur==, rien de grave.")], body="Traduction : embrayage à changer.\n**450 à 800 €.**"),
  S(title="Et ces trois-là", comp=[LIST(["« Pneus à prévoir »", "140 à 260 € les deux"], ["« Petit voyant, rien de grave »", "panne pas diagnostiquée : prix inconnu"], ["« Clim à recharger »", "70 à 450 €"], start=2)], relance="Image 4 : la phrase qui doit te faire réfléchir."),
  S(title="« Distribution\nà prévoir »", body="**400 à 750 €.** Et si elle casse avant, c'est le moteur qui part.", comp=[VERDICT("À négocier", 'warn', "Ou à laisser, si le prix ne baisse pas.")]),
], "Avant d'appeler,\nchiffre l'*annonce*."),

car('acompte-bloquer',
    "Un vendeur te demande un acompte pour « bloquer » une voiture d'occasion avant la visite ? Un scénario d'arnaque classique : voilà comment le repérer.",
    "On t'a déjà demandé un acompte avant de voir la voiture ?", [
  S(kicker="Tu cherches une voiture d'occasion ?", title="Il te demande\nun *acompte*\npour la bloquer ?"),
  S(title="Le message type", comp=[CHAT(["v", "Beaucoup de demandes. Envoyez 200 € et je vous la garde jusqu'à samedi."], ["m", "Je peux venir la voir avant ?"], ["v", "Pas possible, je suis en déplacement."])]),
  S(title="Les 3 signaux", comp=[LIST("Il ne peut pas te montrer la voiture", "Il te presse : « beaucoup de demandes »", "Il veut de l'argent avant les papiers")], relance="Image 4 : la seule règle à retenir."),
  S(title="Ta règle", comp=[VERDICT("À fuir", 'bad', "**Zéro euro** avant d'avoir vu la voiture et les papiers.")]),
], "Achète l'esprit\n*tranquille*."),

car('rib-arnaque',
    "J'ai reçu un RIB pour une voiture d'occasion à un prix ridicule. Voilà comment je repère ces arnaques en 10 secondes.",
    "Tu as déjà reçu un message comme ça ?", [
  S(kicker="Ça m'est arrivé.", title="On m'a envoyé\nun *RIB* avant\nla visite."),
  S(title="Le prix était\n*ridicule*.", comp=[COTE(6950, 3900, 3000, 9000, "Le prix face au marché")], body="Presque **3 000 €** sous la cote."),
  S(title="Les signes", comp=[LIST("Prix très sous le marché", "Vendeur « à l'étranger », livraison proposée", "Paiement avant la visite, par virement ou coupon")], relance="Image 4 : comment payer sans risque."),
  S(title="Comment payer", comp=[ROWS(["Virement instantané, fait ensemble", "Oui", 'ok'], ["Chèque de banque vérifié", "Oui", 'ok'], ["Acompte avant la visite", "Non", 'bad'], ["Mandat cash, coupon, crypto", "Non", 'bad'])]),
], "Repère l'arnaque\n*avant* de payer."),

car('trop-pas-cher',
    "Une voiture d'occasion bien moins chère que les autres annonces ? Affaire ou piège : comment trancher avant de te déplacer.",
    "Tu l'aurais appelé, ce vendeur ?", [
  S(kicker="Devine pourquoi.", title="Cette Golf\ncoûte 2 000 €\nde *moins*."),
  S(title="Trois raisons\npossibles", comp=[LIST(["Une arnaque", "la voiture n'existe pas"], ["Un défaut grave", "joint de culasse, boîte, moteur"], ["Un vendeur pressé", "rare, mais ça arrive"])]),
  S(title="Ce que dit\nl'*annonce*", comp=[QUOTE("Golf 1.6 TDI, ==bruit au démarrage==, ==voyant moteur allumé==, vendue en l'état.")], relance="Image 4 : le verdict."),
  S(title="Le verdict", comp=[VERDICT("Faire inspecter", 'bad', "Un bruit et un voyant non diagnostiqués : un garagiste avant tout paiement.")]),
], "Un prix bas\na une *raison*."),

car('moteurs-a-eviter',
    "5 moteurs et boîtes à éviter sur une voiture d'occasion : PureTech, THP, EcoBoost, TCe 115, boîtes robotisées. Enregistre avant d'acheter.",
    "Tu roules avec un de ces moteurs ?", [
  S(kicker="Enregistre avant d'acheter.", title="5 moteurs\nà *fuir*\nen occasion."),
  S(title="1. Le 1.2 PureTech", body="Peugeot, Citroën, DS, Opel.\nSa courroie de distribution **baigne dans l'huile**. Et il consomme de l'huile.", comp=[PILLS(["1.2 PureTech", 'bad'])]),
  S(title="2, 3 et 4", comp=[LIST(["1.6 THP / VTi", "Peugeot, Citroën, Mini : chaîne de distribution"], ["1.0 EcoBoost", "Ford : refroidissement, surchauffe"], ["1.2 TCe 115 / 120", "Renault, Dacia, Nissan : huile, casse moteur"], start=2)], relance="Image 4 : le piège des boîtes automatiques."),
  S(title="5. Les boîtes\n*robotisées*", comp=[PILLS(["EDC", 'bad'], ["DSG", 'bad'], ["Powershift", 'bad'], ["ETG", 'bad'], ["Quickshift", 'bad'], ["AL4", 'bad'])], body="Réputées fragiles. La réparation dépasse vite la valeur de la voiture."),
], "Vérifie le moteur\n*avant* le prix."),

car('citadines-fiables',
    "Les citadines d'occasion les plus fiables : Yaris, Jazz, Swift, Mazda 2, Aygo, C1, 107. Avec les bons moteurs à prendre.",
    "Laquelle tu prendrais ?", [
  S(kicker="Petit budget ?", title="5 citadines\nqui ne te\n*lâchent* pas."),
  S(title="Les japonaises", comp=[ROWS(["Toyota Yaris", "1.0 / 1.33 VVT-i", 'ok'], ["Honda Jazz", "1.2 / 1.4 i-VTEC", 'ok'], ["Suzuki Swift", "1.2 / 1.3 essence", 'ok'], ["Mazda 2", "1.3 / 1.5 essence", 'ok'])]),
  S(title="Et le trio jumeau", body="**Aygo, C1, 107** : le même moteur Toyota 1.0. Petit prix, très demandé en ville.", comp=[PILLS(["Toyota Aygo", 'ok'], ["Citroën C1", 'ok'], ["Peugeot 107", 'ok'])], relance="Image 4 : ce qu'il faut vérifier quand même."),
  S(title="À vérifier\nquand même", comp=[LIST("La rouille des passages de roue", "L'embrayage", "Le carnet d'entretien")]),
], "Le bon modèle,\n*le bon* moteur."),

car('main-sur-capot',
    "Le premier geste quand tu vas voir une voiture d'occasion : poser la main sur le capot. Moteur chaud = démarrage difficile caché.",
    "Tu le faisais déjà ?", [
  S(kicker="Tu vas voir une voiture ?", title="Pose la main\nsur le *capot*."),
  S(title="Il est chaud ?", body="Le vendeur l'a fait tourner avant ton arrivée. Il cache peut-être **un démarrage difficile**.", comp=[VERDICT("Méfiance", 'warn', "Demande à revenir moteur froid.")]),
  S(title="Moteur froid,\nregarde ça", comp=[LIST("Pas de claquement au démarrage", "Pas de fumée bleue : huile", "Pas de fumée blanche épaisse qui reste")], relance="Image 4 : le test des voyants."),
  S(title="Les voyants", body="Au contact, **tous** s'allument puis s'éteignent. Un voyant qui ne s'allume jamais a peut-être été débranché."),
], "15 minutes\nqui t'*évitent* le pire."),

car('papiers-jour-vente',
    "Les papiers à exiger le jour où tu achètes une voiture d'occasion : carte grise barrée, certificat de cession, non-gage, contrôle technique.",
    "Il t'en manquait un, la dernière fois ?", [
  S(kicker="Le jour de l'achat,", title="6 papiers.\nSinon tu *repars*."),
  S(title="Les trois\npremiers", comp=[LIST(["Carte grise barrée", "« Vendu le … à … h » + signature"], ["Certificat de cession", "cerfa 15776, 2 exemplaires signés"], ["Code de cession", "le vendeur le déclare sur le site de l'ANTS"])]),
  S(title="Les trois\nautres", comp=[LIST(["Non-gage de moins de 15 jours", "pas de gage, pas d'opposition"], ["Contrôle technique", "moins de 6 mois si la voiture a plus de 4 ans"], ["Nom de la carte grise", "= pièce d'identité du vendeur"], start=4)], relance="Image 4 : le piège du numéro de série."),
  S(title="Le numéro\nde série", body="Le VIN de la carte grise doit être **le même** que celui gravé sur la voiture : pare-brise et montant de porte."),
], "Les papiers\n*d'abord*."),

car('ct-a-faire',
    "« Contrôle technique à faire » dans une annonce de voiture d'occasion : ce que ça veut dire et ce que tu dois demander.",
    "Tu as déjà acheté sans CT récent ?", [
  S(kicker="Lu dans une annonce :", title="« CT à faire »"),
  S(title="La règle", body="Voiture de plus de 4 ans : le vendeur te remet un contrôle technique de **moins de 6 mois**.", comp=[ROWS(["CT de moins de 6 mois", "OK", 'ok'], ["CT « à faire »", "À demander", 'warn'], ["CT avec contre-visite", "À chiffrer", 'bad'])]),
  S(title="Pourquoi il\nne l'a pas fait", comp=[LIST("Il sait que la voiture ne passera pas", "Il veut te laisser les réparations", "Il n'a pas eu le temps (rare)")], relance="Image 4 : ce que tu lui réponds."),
  S(title="Ta réponse", comp=[CHAT(["m", "Je viens dès que le contrôle technique est fait. Vous me l'envoyez ?"], ["v", "…"])]),
], "Pas de CT,\npas de *visite*."),

car('cout-reel',
    "Le vrai coût d'une voiture d'occasion à 6 000 € : carte grise, trajet, pneus, distribution, vidange. Fais le total avant de signer.",
    "Ta dernière voiture t'a coûté combien en plus ?", [
  S(kicker="Tu as trouvé une voiture à 6 000 € ?", title="Elle va t'en\ncoûter *7 300*."),
  S(title="Le ticket", comp=[TICKET(["Prix de l'annonce", "6 000 €"], ["Carte grise", "300 €"], ["Trajet aller-retour", "60 €"], ["2 pneus", "220 €"], ["Distribution à prévoir", "600 €"], ["Vidange + filtres", "120 €"], tot="7 300 €", totLab="Coût réel")]),
  S(title="La carte grise", body="Son prix dépend de **ta région** et de la puissance fiscale. Calcule-la avant de négocier.", relance="Image 4 : comment t'en servir pour négocier."),
  S(title="Négocie avec\nle *total*", body="Chaque réparation chiffrée = un argument. Pneus et distribution annoncés : **820 €** à discuter."),
], "Le *vrai* prix,\navant de signer."),

car('3-questions-vendeur',
    "Les 3 questions que je pose à chaque vendeur avant de me déplacer pour une voiture d'occasion. Copie-les.",
    "Tu poses quoi, toi, en premier ?", [
  S(kicker="Avant de te déplacer,", title="3 questions.\nPas une\nde *plus*."),
  S(title="1. Le contrôle\ntechnique", body="« Il date de quand ? » Moins de 6 mois, sinon il doit le refaire.", comp=[CHAT(["m", "Le CT date de quand ?"], ["v", "Mars dernier."])]),
  S(title="2. Les défauts", body="« Qu'est-ce qui ne va pas sur la voiture ? » Une voiture sans aucun défaut, ça n'existe pas.", relance="Image 4 : la question qui trie les vendeurs."),
  S(title="3. Le carnet", body="« Vous avez les factures d'entretien ? » Pas de factures : la distribution est peut-être à faire.", comp=[ROWS(["Carnet + factures", "OK", 'ok'], ["« Je les cherche »", "À demander", 'warn'])]),
], "Les bonnes questions,\n*avant* le trajet."),

car('histovec',
    "HistoVec : le rapport gratuit qui te montre propriétaires, sinistres et kilométrages d'une voiture d'occasion. Demande-le au vendeur.",
    "Un vendeur t'a déjà refusé le HistoVec ?", [
  S(kicker="Il est gratuit.", title="Demande\nle *HistoVec*."),
  S(title="Ce qu'il te montre", comp=[LIST("Le nombre de propriétaires", "Les sinistres déclarés", "Les kilométrages relevés au CT", "Gage ou opposition")]),
  S(title="Comment l'avoir", body="Le vendeur le génère sur le site officiel avec sa carte grise, puis **te l'envoie**.", relance="Image 4 : s'il refuse."),
  S(title="S'il refuse", comp=[VERDICT("Passe ton tour", 'bad', "Un vendeur honnête l'envoie en 2 minutes.")]),
], "L'historique,\n*avant* la visite."),

car('offre-avant-essai',
    "Ne fais jamais d'offre sur une voiture d'occasion avant l'essai et la lecture des papiers. Voilà comment négocier dans l'ordre.",
    "Tu négocies au téléphone ou sur place ?", [
  S(kicker="Erreur classique :", title="faire une offre\n*avant* l'essai."),
  S(title="L'ordre", comp=[LIST("Tu lis les papiers", "Tu fais l'essai", "Tu chiffres ce que tu as vu", "Tu proposes")]),
  S(title="Ce que tu\nchiffres", comp=[TICKET(["Plaquettes + disques avant", "150 – 300 €"], ["2 pneus", "140 – 260 €"], ["Batterie", "100 – 200 €"], tot="390 – 760 €", totLab="À déduire")], relance="Image 4 : comment le dire sans vexer."),
  S(title="Comment\nle dire", comp=[CHAT(["m", "Elle me plaît. Il y a les pneus et les freins à faire, environ 500 €. Je peux vous proposer 6 500 € ?"])]),
], "Négocie avec\ndes *chiffres*."),

car('premiere-offre',
    "Combien proposer pour une voiture d'occasion ? Ma méthode : partir environ 7 % sous le prix du marché, puis déduire les défauts.",
    "Tu commences à combien sous le prix ?", [
  S(kicker="Tu ne sais jamais combien proposer ?", title="Pars à\n*− 7 %*."),
  S(title="Le calcul", comp=[TICKET(["Prix du marché", "7 000 €"], ["− 7 %", "− 490 €"], tot="6 510 €", totLab="Offre de départ")]),
  S(title="Le prix du\n*marché*", body="La moitié des annonces comparables : même modèle, **± 2 ans**, même énergie, kilométrage proche.", relance="Image 4 : et s'il dit non ?"),
  S(title="S'il dit non", body="Tu montres les défauts chiffrés et les annonces comparables. Tu ne montes que **pour une raison**."),
], "Ton offre,\n*chiffrée*."),

car('seul-ou-accompagne',
    "Aller voir une voiture d'occasion seul, venir accompagné ou la faire inspecter par un garagiste ? La règle pour décider.",
    "Tu y vas seul, toi ?", [
  S(kicker="Visite d'une occasion :", title="seul, à deux,\nou avec un *pro* ?"),
  S(title="Seul", comp=[VERDICT("Vas-y seul", 'ok', "Rien de grave dans l'annonce, CT propre, carnet suivi.")]),
  S(title="Accompagné", comp=[VERDICT("Viens à deux", 'warn', "Plusieurs petits points à vérifier sur place.")], relance="Image 4 : quand payer un garagiste."),
  S(title="Inspection", comp=[VERDICT("Fais inspecter", 'bad', "Bruit, voyant, fumée ou moteur à éviter : 100 € d'inspection valent mieux que 3 000 € de moteur.")]),
], "La bonne visite,\n*la bonne* décision."),

car('kilometrage',
    "Kilométrage d'une voiture d'occasion : comment repérer un compteur trafiqué avec le HistoVec et les contrôles techniques.",
    "Tu as déjà eu un doute sur un compteur ?", [
  S(kicker="168 000 km en 10 ans,", title="c'est normal ?\n*Vérifie*."),
  S(title="Les relevés", comp=[ROWS(["CT 2020", "121 000 km", 'ok'], ["CT 2022", "152 000 km", 'ok'], ["Annonce 2026", "[r]98 000 km[/r]", 'bad'])], body="Le compteur **ne descend pas**."),
  S(title="Où lire\nles relevés", comp=[LIST("Le rapport HistoVec", "Les anciens PV de contrôle technique", "Les factures d'entretien")], relance="Image 4 : la phrase qui doit t'alerter."),
  S(title="Dans l'annonce", comp=[QUOTE("Golf 1.6 TDI, ==kilométrage non garanti==, prix à débattre.")], body="Traduction : **le vendeur ne sait pas**, ou il sait."),
], "Les kilomètres\n*ne mentent* pas."),

car('teinte-differente',
    "Une portière qui n'a pas tout à fait la même couleur sur une voiture d'occasion ? Signe d'un choc réparé. Comment le voir.",
    "Tu regardes la carrosserie comment ?", [
  S(kicker="Regarde de biais.", title="Une portière\nd'une autre\n*couleur* ?"),
  S(title="Ce que\nça veut dire", body="La pièce a été **repeinte** ou changée. Souvent après un choc."),
  S(title="Les 3 indices", comp=[LIST("Écarts entre éléments irréguliers", "Teinte différente au soleil", "Trace de peinture sur les joints")], relance="Image 4 : ce que tu demandes au vendeur."),
  S(title="Ta question", comp=[CHAT(["m", "La voiture a eu un accident ou une réparation de carrosserie ?"])], body="Puis tu compares avec le **HistoVec**."),
], "La carrosserie\n*raconte* tout."),

car('lire-les-pneus',
    "Les pneus d'une voiture d'occasion en disent long : date de fabrication, marque par essieu, usure. Ce qu'il faut regarder.",
    "Tu regardes les pneus avant d'acheter ?", [
  S(kicker="Avant le moteur,", title="lis les *pneus*."),
  S(title="La date", body="4 chiffres sur le flanc : semaine et année. **Plus de 6 ans** : à changer.", comp=[PILLS(["2319 = semaine 23 de 2019"])]),
  S(title="La marque", body="Même marque **par essieu**. Deux marques différentes à l'avant : quelqu'un a économisé.", relance="Image 4 : ce que l'usure révèle."),
  S(title="L'usure", comp=[ROWS(["Régulière", "OK", 'ok'], ["Plus à l'intérieur", "Parallélisme", 'warn'], ["Par plaques", "Amortisseurs", 'bad'])]),
], "Les pneus parlent.\n*Écoute-les*."),

car('paiement-sur',
    "Payer une voiture d'occasion sans risque : virement instantané fait ensemble, chèque de banque vérifié. Les règles.",
    "Tu payes comment, toi ?", [
  S(kicker="Le jour de la vente,", title="comment payer\nsans *risque* ?"),
  S(title="Le plus sûr", body="Un **virement instantané**, fait ensemble. L'argent arrive avant que les clés changent de main.", comp=[VERDICT("Recommandé", 'ok')]),
  S(title="Le chèque\nde banque", body="Appelle la banque émettrice avec **un numéro que tu as trouvé toi-même**. Jamais celui écrit sur le chèque.", relance="Image 4 : ce que tu refuses."),
  S(title="Tu refuses", comp=[ROWS(["Acompte avant la visite", "Non", 'bad'], ["Mandat cash, coupon", "Non", 'bad'], ["Crypto", "Non", 'bad'], ["Livraison sans visite", "Non", 'bad'])]),
], "Paye l'esprit\n*tranquille*."),

car('photos-manquantes',
    "Une annonce de voiture d'occasion sans photo du compteur, de l'intérieur ou des pneus ? Les vues qui manquent disent beaucoup.",
    "Tu demandes des photos en plus ?", [
  S(kicker="Regarde ce qui manque.", title="Pas de photo\ndu *compteur* ?"),
  S(title="Les 4 vues\nà exiger", comp=[LIST("Le compteur, moteur allumé", "L'intérieur, sièges et volant", "Les 4 pneus", "Le dessous, si possible")]),
  S(title="Pourquoi", body="Un volant usé avec 80 000 km au compteur, ça ne colle pas. **Les photos se croisent avec les chiffres.**", relance="Image 4 : le message à envoyer."),
  S(title="Ton message", comp=[CHAT(["m", "Bonjour, vous pouvez m'envoyer une photo du compteur et des pneus ? Merci !"])]),
], "Les photos,\n*avant* le trajet."),

car('premiere-voiture',
    "Ta première voiture d'occasion : 3 modèles fiables et pas chers, et un piège à éviter. Pour jeunes conducteurs et petits budgets.",
    "C'était quoi, ta première voiture ?", [
  S(kicker="Ta première voiture ?", title="3 modèles\net *1* piège."),
  S(title="Les 3 modèles", comp=[ROWS(["Renault Clio III / IV", "1.2 16V 75 ch", 'ok'], ["Dacia Sandero", "1.2 16V, 1.5 dCi", 'ok'], ["Peugeot 207", "1.4 essence 75 ch", 'ok'])]),
  S(title="Pourquoi elles", body="Pièces partout, garagistes qui les connaissent, **revente facile** le jour où tu changes.", relance="Image 4 : le piège."),
  S(title="Le piège", body="La **208 essence** de 2012 à 2016 : c'est un PureTech. En diesel, elle est bien.", comp=[PILLS(["208 PureTech", 'bad'], ["208 1.6 HDi", 'ok'])]),
], "Ta première,\n*sans* galère."),

car('ville-diesel',
    "Diesel d'occasion et petits trajets en ville : vanne EGR et FAP encrassés, jusqu'à 900 € de réparation. Ce qu'il faut savoir.",
    "Tu roules surtout en ville ?", [
  S(kicker="Tu roules surtout en ville ?", title="Le diesel\nva te coûter\n*cher*."),
  S(title="Le problème", body="Sur les petits trajets, le moteur ne chauffe pas assez. **La vanne EGR et le FAP s'encrassent.**"),
  S(title="La facture", comp=[TICKET(["Vanne EGR", "250 – 600 €"], ["FAP", "jusqu'à 900 €"], tot="jusqu'à 1 500 €", totLab="Au pire", tone='r')], relance="Image 4 : quoi prendre à la place."),
  S(title="À la place", body="Moins de 10 000 km par an, surtout en ville : un **essence fiable**. Yaris, Jazz, Clio 1.2 16V.", comp=[PILLS(["Yaris VVT-i", 'ok'], ["Clio 1.2 16V", 'ok'])]),
], "Le bon moteur\npour *ta* route."),

car('vendeur-presse',
    "Un vendeur de voiture d'occasion qui te presse (« beaucoup de demandes », « je pars demain ») : pourquoi tu dois ralentir.",
    "On t'a déjà mis la pression ?", [
  S(kicker="« Beaucoup de demandes. »", title="Il te *presse* ?\nRalentis."),
  S(title="Les phrases", comp=[LIST("« J'ai trois personnes qui viennent ce soir »", "« Je pars à l'étranger demain »", "« Si vous ne venez pas maintenant, je la vends »")]),
  S(title="Pourquoi\nil fait ça", body="Pressé, tu ne lis pas les papiers. **Tu ne fais pas l'essai.** Tu ne négocies pas.", relance="Image 4 : ta réponse."),
  S(title="Ta réponse", comp=[CHAT(["m", "Pas de souci. Si elle est encore là samedi, je viens avec le CT et les factures en main."])]),
], "Ton rythme,\n*pas* le sien."),

car('10-points-visite',
    "10 points à vérifier pendant la visite d'une voiture d'occasion, en 15 minutes. La checklist à garder sur ton téléphone.",
    "Lequel tu oublies toujours ?", [
  S(kicker="Enregistre-la.", title="10 points\nen *15 minutes*."),
  S(title="Moteur et boîte", comp=[LIST("Démarrage moteur froid", "Aucun voyant après démarrage", "Embrayage : il ne patine pas en 3e", "Les vitesses passent sans craquer", "Pas de fuite sous la voiture")]),
  S(title="Le reste", comp=[LIST("Freinage droit, sans vibration", "La direction ne tire pas", "Pneus de moins de 6 ans", "Écarts de carrosserie réguliers", "Clim, vitres, fermeture : tout marche", start=6)], relance="Image 4 : si un point bloque."),
  S(title="Un point bloque ?", comp=[VERDICT("Chiffre-le", 'warn', "Tu le déduis du prix. Ou tu pars.")]),
], "La checklist,\n*dans* ta poche."),

car('boite-auto',
    "Boîte automatique pas chère sur une voiture d'occasion : EDC, DSG, Powershift. Pourquoi le prix bas cache souvent une facture.",
    "Tu veux une boîte auto ?", [
  S(kicker="Tu veux une automatique ?", title="Méfie-toi\ndes boîtes\n*pas chères*."),
  S(title="Les boîtes\nfragiles", comp=[PILLS(["EDC", 'bad'], ["DSG7", 'bad'], ["Powershift", 'bad'], ["Easytronic", 'bad'], ["MMT", 'bad'], ["AL4", 'bad'])]),
  S(title="À l'essai", comp=[LIST("À-coups au démarrage", "Hésitation entre deux rapports", "Voyant boîte au tableau de bord")], relance="Image 4 : ce qu'il faut demander."),
  S(title="Demande", body="Les **factures de la boîte** : vidange, embrayage, mécatronique. Sans elles, tu achètes un risque."),
], "Une auto,\n*oui*. Pas celle-là."),

car('au-dessus-du-marche',
    "Cette Peugeot 208 était affichée 450 € au-dessus du marché. Comment savoir si une voiture d'occasion est au bon prix.",
    "Tu compares avec combien d'annonces ?", [
  S(kicker="Le vendeur dit « prix ferme ».", title="Elle était\n*450 €*\ntrop chère."),
  S(title="Le marché", comp=[COTE(6950, 7400, 5000, 9000)]),
  S(title="La cote", body="Calculée sur les annonces **comparables** en ligne : même modèle, ± 2 ans, même énergie, kilométrage proche.", relance="Image 4 : ce que tu en fais."),
  S(title="Ce que tu dis", comp=[CHAT(["m", "J'ai vu 12 annonces du même modèle autour de 6 950 €. Vous pouvez faire un effort ?"])]),
], "Le bon prix,\nc'est le *marché*."),

car('message-vendeur',
    "Le message à envoyer au vendeur d'une voiture d'occasion pour obtenir une réponse et les bons documents. Copie-le.",
    "Les vendeurs te répondent, toi ?", [
  S(kicker="Les vendeurs ne te répondent pas ?", title="Envoie *ce*\nmessage."),
  S(title="Le message", comp=[CHAT(["m", "Bonjour, votre Clio m'intéresse. Elle est toujours disponible ? Vous pourriez m'envoyer le contrôle technique et les factures ?"])]),
  S(title="Pourquoi\nil marche", comp=[LIST("Court : il le lit", "Une question simple : il répond", "Les papiers tout de suite : tu tries")], relance="Image 4 : ce que sa réponse t'apprend."),
  S(title="Sa réponse", comp=[ROWS(["Il envoie tout", "Bon signe", 'ok'], ["« On verra sur place »", "Méfiance", 'warn'], ["Pas de réponse", "Suivante", 'bad'])]),
], "Un message,\n*trois* réponses."),

car('leviers-et-pieges',
    "Défauts d'une voiture d'occasion : ceux qui se négocient (pneus, freins, batterie) et ceux qui doivent te faire partir (joint de culasse).",
    "Tu es déjà parti d'une visite ?", [
  S(kicker="Tous les défauts ne se valent pas.", title="Négocie.\nOu *pars*."),
  S(title="Ça se négocie", comp=[PILLS(["Pneus", 'ok'], ["Freins", 'ok'], ["Batterie", 'ok'], ["Vidange", 'ok'], ["Rayures", 'ok'], ["Optiques", 'ok'])], body="Tu les chiffres, tu les retires du prix."),
  S(title="Tu pars", comp=[PILLS(["Joint de culasse", 'bad'], ["Moteur à refaire", 'bad'], ["Boîte qui craque", 'bad'], ["Fumée blanche", 'bad'])], relance="Image 4 : le cas du compteur."),
  S(title="Et aussi", comp=[PILLS(["Kilométrage non garanti", 'bad'], ["Carte grise pas au nom du vendeur", 'bad'])], body="Un problème de papiers, c'est **non**."),
], "Sache quand\n*partir*."),

car('couleur-fumee',
    "La couleur de la fumée d'échappement d'une voiture d'occasion : bleue, blanche ou noire. Ce que chacune veut dire.",
    "Tu regardes l'échappement au démarrage ?", [
  S(kicker="Au démarrage,", title="regarde la\n*fumée*."),
  S(title="Bleue", comp=[VERDICT("Huile", 'bad', "Le moteur brûle de l'huile.")]),
  S(title="Blanche\net épaisse", comp=[VERDICT("Danger", 'bad', "Si elle reste : liquide de refroidissement, peut-être le joint de culasse.")], relance="Image 4 : la noire."),
  S(title="Noire", comp=[VERDICT("À vérifier", 'warn', "Diesel : injecteurs ou EGR. 150 à 1 000 €.")]),
], "L'échappement\nne *ment* pas."),

car('test-embrayage',
    "Tester l'embrayage d'une voiture d'occasion en 30 secondes pendant l'essai. Un embrayage usé, c'est 450 à 800 €.",
    "Tu sais tester un embrayage ?", [
  S(kicker="Pendant l'essai,", title="teste\nl'*embrayage*\nen 30 secondes."),
  S(title="Test 1", body="Il accroche **tout en haut** de la course ? Il est usé."),
  S(title="Test 2", body="En 3e, à bas régime, accélère fort. Le moteur monte et la voiture n'avance pas ? **Il patine.**", relance="Image 4 : combien ça coûte."),
  S(title="Le prix", comp=[TICKET(["Embrayage", "450 – 800 €"], ["Volant moteur (si besoin)", "400 – 800 €"], tot="jusqu'à 1 600 €", totLab="Au pire", tone='r')]),
], "30 secondes,\n*800 €* d'écart."),

car('potes-avant-achat',
    "Mes potes ne signent plus pour une voiture d'occasion sans me montrer l'annonce. Ce que je regarde en premier.",
    "Tu montres l'annonce à qui avant d'acheter ?", [
  S(kicker="Mes potes m'envoient l'annonce", title="avant de signer.\n*Tous*."),
  S(title="Ce que\nje regarde", comp=[LIST("Le moteur : fiable ou à fuir", "Le prix face au marché", "Les mots qui coûtent cher", "Les papiers")]),
  S(title="Le problème", body="Je ne peux pas répondre à tout le monde à 23 h. **Alors j'ai mis ma méthode dans un outil.**", relance="Image 4 : ce qu'ils reçoivent."),
  S(title="Ce qu'ils\nreçoivent", comp=[VERDICT("Prix correct", 'warn', "Pneus à prévoir : **négocie 200 €**. CT et carnet à demander.")]),
], "Ton avis d'expert,\n*sans* l'expert."),

car('ce-que-vendeurs-taisent',
    "J'achète des voitures d'occasion depuis 6 mois. 3 choses que les vendeurs ne disent jamais dans une annonce.",
    "Tu en rajoutes une ?", [
  S(kicker="J'achète des voitures depuis 6 mois.", title="3 choses que\nles vendeurs\n*taisent*."),
  S(title="1. La date\nde la distribution", body="« Entretien à jour », sans facture. **La distribution, c'est 400 à 750 €.**"),
  S(title="2. Le voyant", body="Effacé avant ta visite. Il revient deux jours après.", relance="Image 4 : la dernière, la plus chère."),
  S(title="3. Le moteur", body="Ils écrivent « 1.2 essence ». Ils n'écrivent pas **PureTech**.", comp=[PILLS(["1.2 PureTech", 'bad'])]),
], "Lis ce qui\n*n'est pas* écrit."),

car('annonce-parfaite',
    "Une annonce de voiture d'occasion parfaite : ce qui doit te rassurer, point par point. Le contraire des pièges.",
    "Tu en as déjà vu une comme ça ?", [
  S(kicker="Elle existe.", title="L'annonce\n*parfaite*."),
  S(title="Ce qu'elle dit", comp=[QUOTE("Première main, ++carnet Renault complet++, ++factures++, ++distribution faite à 118 000 km++, CT vierge de janvier.")]),
  S(title="Pourquoi\nça rassure", comp=[ROWS(["Première main", "OK", 'ok'], ["Factures", "OK", 'ok'], ["Distribution prouvée", "OK", 'ok'], ["CT de moins de 6 mois", "OK", 'ok'])], relance="Image 4 : ce que tu vérifies quand même."),
  S(title="Quand même", body="Les factures **au nom du vendeur**, et le kilométrage cohérent avec le HistoVec."),
], "Les preuves,\npas les *promesses*."),
]
