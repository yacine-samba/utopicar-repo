"""Groupe A (1/2) : acheteurs particuliers qui ont peur de se faire avoir. Accroches : skill « L'art du hook » + Conbersa.
Faits : règles de l'outil et guide « Acheter votre prochaine occasion » du site (main : defauts.ts, fiabilite.ts,
regles.ts, guides/index.ts)."""
from common import *
CARS = [
car('prix-affiche-pas-le-prix', 'CC',
    "Le prix affiché d'une voiture d'occasion n'est pas ce que tu vas payer. Carte grise, pneus, distribution : le vrai total d'une voiture à 6 000 €.",
    "Ta dernière voiture t'a coûté combien en plus ?", [
  S(kicker="Tu achètes une occasion ?", title="Le prix affiché\nn'est *pas*\nce que tu paies."),
  S(title="Une voiture\nà 6 000 €", comp=[TICKET(["Prix de l'annonce", "6 000 €"], ["Carte grise", "300 €"], ["Trajet aller-retour", "60 €"], tot="6 360 €", totLab="Déjà")]),
  S(title="Et l'annonce\ndisait…", comp=[QUOTE("Bon état général, ==pneus à prévoir==, ==distribution à faire==, vidange récente.")], relance="Image 4 : le vrai total."),
  S(title="Le vrai total", comp=[TICKET(["Déjà", "6 360 €"], ["2 pneus", "220 €"], ["Distribution", "600 €"], ["Vidange + filtres", "120 €"], tot="7 300 €", totLab="Ce qu'elle coûte", tone='r')]),
], "Le *vrai* prix,\navant de signer."),

car('5-phrases-qui-coutent', 'DM',
    "5 phrases d'annonce de voiture d'occasion qui cachent une réparation, avec le prix de chacune. Lis-les avant d'appeler.",
    "Laquelle tu as déjà vue dans une annonce ?", [
  S(kicker="Lu dans une annonce :", title="« Embrayage\nun peu dur ».\nTraduction : *800 €*."),
  S(title="Les 4 autres", comp=[LIST(["« Pneus à prévoir »", "140 à 260 € les deux"], ["« Petit voyant, rien de grave »", "panne pas diagnostiquée : prix inconnu"], ["« Clim à recharger »", "70 à 450 €"], start=2)]),
  S(title="La 5e", body="« **Distribution à prévoir** » : 400 à 750 €. Et si elle casse avant, c'est le moteur.", relance="Image 4 : ce que tu fais de tout ça."),
  S(title="Ce que\ntu en fais", comp=[VERDICT("À négocier", 'warn', "Chaque phrase chiffrée sort du prix. Ou tu laisses.")]),
], "Lis l'annonce\n*en euros*."),

car('acompte-pour-bloquer', 'DO',
    "Un vendeur te demande un acompte pour « bloquer » une voiture d'occasion avant la visite ? Un scénario d'arnaque classique : comment le repérer.",
    "On t'a déjà demandé un acompte ?", [
  S(kicker="« Envoyez 200 € et je la garde. »", title="Cet acompte,\ntu ne le\n*reverras* pas."),
  S(title="Le scénario", comp=[CHAT(["v", "Beaucoup de demandes. Envoyez 200 € et je vous la garde jusqu'à samedi."], ["m", "Je peux venir la voir avant ?"], ["v", "Pas possible, je suis en déplacement."])]),
  S(title="Les 3 signaux", comp=[LIST("Il ne peut pas te montrer la voiture", "Il te presse : « beaucoup de demandes »", "Il veut de l'argent avant les papiers")], relance="Image 4 : la seule règle."),
  S(title="La règle", comp=[VERDICT("À fuir", 'bad', "**Zéro euro** avant d'avoir vu la voiture et les papiers.")]),
], "Achète\n*l'esprit* tranquille."),

car('rib-prix-ridicule', 'DO',
    "On m'a envoyé un RIB pour une voiture d'occasion à un prix ridicule. Comment repérer ces arnaques en 10 secondes, et comment payer sans risque.",
    "Tu as déjà reçu un message comme ça ?", [
  S(kicker="Ça m'est arrivé.", title="Un prix\nridicule. Un *RIB*.\nPas de visite."),
  S(title="Le prix", comp=[COTE(6950, 3900, 3000, 9000)], body="Presque **3 000 €** sous la cote."),
  S(title="Les signes", comp=[LIST("Prix très sous le marché", "Vendeur « à l'étranger », livraison proposée", "Paiement avant la visite")], relance="Image 4 : comment payer sans risque."),
  S(title="Payer\nsans risque", comp=[ROWS(["Virement instantané, ensemble", "Oui", 'ok'], ["Chèque de banque vérifié", "Oui", 'ok'], ["Acompte avant la visite", "Non", 'bad'], ["Mandat cash, coupon, crypto", "Non", 'bad'])]),
], "Repère l'arnaque\n*avant* de payer."),

car('2000-moins-cher', 'PI',
    "Une voiture d'occasion 2 000 € moins chère que les autres annonces : arnaque, défaut grave ou vraie affaire ? Comment trancher avant de te déplacer.",
    "Tu l'aurais appelé, ce vendeur ?", [
  S(kicker="Cette Golf est 2 000 € moins chère.", title="Un prix bas\na toujours\nune *raison*."),
  S(title="Les 3 raisons", comp=[LIST(["Une arnaque", "la voiture n'existe pas"], ["Un défaut grave", "joint de culasse, boîte, moteur"], ["Un vendeur pressé", "rare, mais ça arrive"])]),
  S(title="Ce que dit\nl'annonce", comp=[QUOTE("Golf 1.6 TDI, ==bruit au démarrage==, ==voyant moteur allumé==, vendue en l'état.")], relance="Image 4 : le verdict."),
  S(title="Le verdict", comp=[VERDICT("Faire inspecter", 'bad', "Un bruit et un voyant non diagnostiqués : un garagiste avant de payer.")]),
], "Trouve la\n*raison* d'abord."),

car('5-moteurs-a-fuir', 'FC',
    "5 moteurs et boîtes à fuir sur une voiture d'occasion : PureTech, THP, EcoBoost, TCe 115, boîtes robotisées. Enregistre avant d'acheter.",
    "Tu roules avec un de ces moteurs ?", [
  S(kicker="Enregistre avant d'acheter.", title="5 moteurs\nque les vendeurs\nne *nomment* pas."),
  S(title="1. Le 1.2 PureTech", body="Peugeot, Citroën, DS, Opel. Sa courroie **baigne dans l'huile**. Et il consomme de l'huile.", comp=[PILLS(["1.2 PureTech", 'bad'])]),
  S(title="2, 3 et 4", comp=[LIST(["1.6 THP / VTi", "chaîne de distribution"], ["1.0 EcoBoost", "refroidissement, surchauffe"], ["1.2 TCe 115 / 120", "huile, casse moteur"], start=2)], relance="Image 4 : le piège des boîtes."),
  S(title="5. Les boîtes\nrobotisées", comp=[PILLS(["EDC", 'bad'], ["DSG", 'bad'], ["Powershift", 'bad'], ["ETG", 'bad'], ["Quickshift", 'bad'], ["AL4", 'bad'])]),
], "Vérifie le moteur\n*avant* le prix."),

car('citadines-qui-durent', 'RE',
    "Les citadines d'occasion qui durent : Yaris, Jazz, Swift, Mazda 2, Aygo, C1, 107. Avec les moteurs à prendre.",
    "Laquelle tu prendrais ?", [
  S(kicker="Petit budget ?", title="Ces citadines\ndépassent les\n*190 000 km*."),
  S(title="Les japonaises", comp=[ROWS(["Toyota Yaris", "1.0 / 1.33 VVT-i", 'ok'], ["Honda Jazz", "1.2 / 1.4 i-VTEC", 'ok'], ["Suzuki Swift", "1.2 / 1.3", 'ok'], ["Mazda 2", "1.3 / 1.5", 'ok'])]),
  S(title="Le trio\njumeau", body="**Aygo, C1, 107** : le même moteur Toyota 1.0. Petit prix, très demandé en ville.", relance="Image 4 : ce qu'il faut vérifier quand même."),
  S(title="Quand même", comp=[LIST("La rouille des passages de roue", "L'embrayage", "Le carnet d'entretien")]),
], "Le bon modèle,\n*le bon* moteur."),

car('capot-chaud', 'PI',
    "Le premier geste quand tu vas voir une voiture d'occasion : poser la main sur le capot. Moteur chaud, démarrage difficile caché.",
    "Tu le faisais déjà ?", [
  S(kicker="En arrivant chez le vendeur,", title="Le capot\nest chaud ?\n*Méfie-toi*."),
  S(title="Ce que\nça cache", body="Il l'a fait tourner avant ton arrivée. **Un démarrage difficile, peut-être.** Demande à revenir moteur froid."),
  S(title="Moteur froid,\nregarde ça", comp=[LIST("Pas de claquement au démarrage", "Pas de fumée bleue : huile", "Pas de fumée blanche épaisse qui reste")], relance="Image 4 : le test des voyants."),
  S(title="Les voyants", body="Au contact, **tous** s'allument puis s'éteignent. Un voyant qui ne s'allume jamais a peut-être été débranché."),
], "15 minutes\nqui t'*évitent* le pire."),

car('6-papiers-sinon-repars', 'PI',
    "Les 6 papiers à exiger le jour où tu achètes une voiture d'occasion. Sans eux, tu repars sans la voiture.",
    "Il t'en manquait un, la dernière fois ?", [
  S(kicker="Le jour de l'achat :", title="6 papiers.\nSinon,\ntu *repars*."),
  S(title="Les trois\npremiers", comp=[LIST(["Carte grise barrée", "« Vendu le … à … h » + signature"], ["Certificat de cession", "cerfa 15776, 2 exemplaires"], ["Code de cession", "déclaré par le vendeur sur le site de l'ANTS"])]),
  S(title="Les trois\nautres", comp=[LIST(["Non-gage de moins de 15 jours", "pas de gage, pas d'opposition"], ["Contrôle technique", "moins de 6 mois si plus de 4 ans"], ["Nom de la carte grise", "= pièce d'identité du vendeur"], start=4)], relance="Image 4 : le piège du numéro de série."),
  S(title="Le numéro\nde série", body="Le VIN de la carte grise = celui gravé sur la voiture : **pare-brise et montant de porte**."),
], "Les papiers\n*d'abord*."),

car('ct-a-faire', 'CV',
    "« CT à faire » dans une annonce de voiture d'occasion : tu crois que c'est un détail. C'est souvent le signe que la voiture ne passera pas.",
    "Tu as déjà acheté sans CT récent ?", [
  S(kicker="« Contrôle technique à faire. »", title="Tu crois que\nc'est un *détail*."),
  S(title="La règle", body="Voiture de plus de 4 ans : le vendeur te remet un contrôle technique de **moins de 6 mois**.", comp=[ROWS(["CT de moins de 6 mois", "OK", 'ok'], ["CT « à faire »", "À demander", 'warn'], ["CT avec contre-visite", "À chiffrer", 'bad'])]),
  S(title="Pourquoi il\nne l'a pas fait", comp=[LIST("Il sait que la voiture ne passera pas", "Il veut te laisser les réparations", "Il n'a pas eu le temps (rare)")], relance="Image 4 : ta réponse."),
  S(title="Ta réponse", comp=[CHAT(["m", "Je viens dès que le contrôle technique est fait. Vous me l'envoyez ?"])]),
], "Pas de CT,\npas de *visite*."),

car('3-questions-avant-de-bouger', 'DM',
    "Les 3 questions à poser à chaque vendeur avant de te déplacer pour une voiture d'occasion : CT, défauts, carnet.",
    "Tu poses quoi, toi, en premier ?", [
  S(kicker="Avant de faire 100 km,", title="3 questions\nau vendeur.\nPas une de *plus*."),
  S(title="1. Le CT", comp=[CHAT(["m", "Le CT date de quand ?"], ["v", "Mars dernier."])], body="Moins de 6 mois, sinon il doit le refaire."),
  S(title="2. Les défauts", body="« Qu'est-ce qui ne va pas ? » Une voiture sans aucun défaut, ça n'existe pas.", relance="Image 4 : la question qui trie."),
  S(title="3. Le carnet", body="« Vous avez les factures ? » Pas de factures : la distribution est peut-être à faire.", comp=[ROWS(["Carnet + factures", "OK", 'ok'], ["« Je les cherche »", "Méfiance", 'warn'])]),
], "Les bonnes questions,\n*avant* le trajet."),

car('histovec-refuse', 'CC',
    "Un vendeur qui refuse le HistoVec d'une voiture d'occasion te cache quelque chose : propriétaires, sinistres ou kilométrage.",
    "Un vendeur t'a déjà refusé le HistoVec ?", [
  S(kicker="Il refuse de t'envoyer le HistoVec ?", title="Il te *cache*\nquelque chose."),
  S(title="Ce qu'il\nmontre", comp=[LIST("Le nombre de propriétaires", "Les sinistres déclarés", "Les kilométrages relevés au CT", "Gage ou opposition")]),
  S(title="Comment\nl'avoir", body="Le vendeur le génère sur le site officiel avec sa carte grise, puis **te l'envoie**. Gratuit, 2 minutes.", relance="Image 4 : s'il refuse."),
  S(title="S'il refuse", comp=[VERDICT("Passe ton tour", 'bad', "Un vendeur honnête l'envoie en 2 minutes.")]),
], "L'historique,\n*avant* la visite."),

car('offre-avant-essai', 'EI',
    "L'erreur des acheteurs pressés : faire une offre sur une voiture d'occasion avant l'essai. L'ordre pour négocier.",
    "Tu négocies au téléphone ou sur place ?", [
  S(kicker="Erreur des acheteurs pressés :", title="faire une offre\n*avant* l'essai."),
  S(title="L'ordre", comp=[LIST("Tu lis les papiers", "Tu fais l'essai", "Tu chiffres ce que tu as vu", "Tu proposes")]),
  S(title="Ce que\ntu chiffres", comp=[TICKET(["Plaquettes + disques avant", "150 – 300 €"], ["2 pneus", "140 – 260 €"], ["Batterie", "100 – 200 €"], tot="390 – 760 €", totLab="À déduire")], relance="Image 4 : comment le dire."),
  S(title="Comment\nle dire", comp=[CHAT(["m", "Elle me plaît. Il y a les pneus et les freins à faire, environ 500 €. Je vous propose 6 500 € ?"])]),
], "Négocie avec\ndes *chiffres*."),

car('moins-7-pour-cent', 'RE',
    "Combien proposer pour une voiture d'occasion ? Partir environ 7 % sous le prix du marché, puis déduire chaque défaut.",
    "Tu commences à combien sous le prix ?", [
  S(kicker="Tu ne sais pas combien proposer ?", title="Pars à\n*− 7 %*.\nVoilà pourquoi."),
  S(title="Le calcul", comp=[TICKET(["Prix du marché", "7 000 €"], ["− 7 %", "− 490 €"], tot="6 510 €", totLab="Offre de départ")]),
  S(title="Le prix\ndu marché", body="La moitié des annonces comparables : même modèle, **± 2 ans**, même énergie, kilométrage proche.", relance="Image 4 : et s'il dit non ?"),
  S(title="S'il dit non", body="Tu montres les défauts chiffrés et les annonces comparables. **Tu ne montes que pour une raison.**"),
], "Ton offre,\n*chiffrée*."),

car('seul-a-deux-pro', 'DM',
    "Aller voir une voiture d'occasion seul, à deux ou la faire inspecter par un garagiste : la règle pour décider.",
    "Tu y vas seul, toi ?", [
  S(kicker="Visite d'une occasion :", title="Seul, à deux\nou avec un *pro* ?"),
  S(title="Seul", comp=[VERDICT("Vas-y seul", 'ok', "Rien de grave dans l'annonce, CT propre, carnet suivi.")]),
  S(title="À deux", comp=[VERDICT("Viens à deux", 'warn', "Plusieurs petits points à vérifier sur place.")], relance="Image 4 : quand payer un garagiste."),
  S(title="Avec un pro", comp=[VERDICT("Fais inspecter", 'bad', "Bruit, voyant, fumée ou moteur à éviter : 100 € d'inspection contre 3 000 € de moteur.")]),
], "La bonne visite,\n*la bonne* décision."),

car('compteur-qui-descend', 'DM',
    "Comment repérer un compteur trafiqué sur une voiture d'occasion : croise HistoVec, contrôles techniques et factures.",
    "Tu as déjà eu un doute sur un compteur ?", [
  S(kicker="Le kilométrage de l'annonce", title="peut *baisser*.\nPas le vrai."),
  S(title="Les relevés", comp=[ROWS(["CT 2020", "121 000 km", 'ok'], ["CT 2022", "152 000 km", 'ok'], ["Annonce 2026", "[r]98 000 km[/r]", 'bad'])]),
  S(title="Où les lire", comp=[LIST("Le rapport HistoVec", "Les anciens PV de contrôle technique", "Les factures d'entretien")], relance="Image 4 : la phrase qui doit t'alerter."),
  S(title="Dans l'annonce", comp=[QUOTE("Golf 1.6 TDI, ==kilométrage non garanti==, prix à débattre.")], body="Le vendeur ne sait pas. **Ou il sait.**"),
], "Les kilomètres\n*ne mentent* pas."),

car('portiere-autre-couleur', 'FC',
    "Une portière d'une autre couleur sur une voiture d'occasion : signe d'un choc réparé. Les 3 indices à voir de biais.",
    "Tu regardes la carrosserie comment ?", [
  S(kicker="Regarde la voiture de biais.", title="Une portière\nd'une autre\n*couleur* ?"),
  S(title="Ce que\nça veut dire", body="La pièce a été **repeinte** ou changée. Souvent après un choc."),
  S(title="Les 3 indices", comp=[LIST("Écarts entre éléments irréguliers", "Teinte différente au soleil", "Trace de peinture sur les joints")], relance="Image 4 : ta question au vendeur."),
  S(title="Ta question", comp=[CHAT(["m", "La voiture a eu un accident ou une réparation de carrosserie ?"])], body="Puis tu compares avec le **HistoVec**."),
], "La carrosserie\n*raconte* tout."),

car('pneus-parlent', 'FC',
    "Les pneus d'une voiture d'occasion en disent long : date de fabrication, marque par essieu, usure. Ce qu'il faut lire.",
    "Tu regardes les pneus avant d'acheter ?", [
  S(kicker="Avant le moteur,", title="lis les *pneus*.\nIls disent ce que\nle vendeur tait."),
  S(title="La date", body="4 chiffres sur le flanc : semaine et année. **Plus de 6 ans** : à changer.", comp=[PILLS(["2319 = semaine 23 de 2019"])]),
  S(title="La marque", body="Même marque **par essieu**. Deux marques à l'avant : quelqu'un a économisé.", relance="Image 4 : ce que l'usure révèle."),
  S(title="L'usure", comp=[ROWS(["Régulière", "OK", 'ok'], ["Plus à l'intérieur", "Parallélisme", 'warn'], ["Par plaques", "Amortisseurs", 'bad'])]),
], "Les pneus\n*parlent*."),

car('payer-sans-risque', 'CV',
    "Payer une voiture d'occasion sans risque : tu crois que le chèque de banque est sûr. Le virement instantané fait ensemble l'est davantage.",
    "Tu payes comment, toi ?", [
  S(kicker="Le jour de la vente,", title="le chèque\nde banque n'est\npas si *sûr*."),
  S(title="Le plus sûr", comp=[VERDICT("Virement instantané", 'ok', "Fait ensemble. L'argent arrive avant les clés.")]),
  S(title="Le chèque\nde banque", body="Appelle la banque émettrice avec **un numéro trouvé toi-même**. Jamais celui écrit sur le chèque.", relance="Image 4 : ce que tu refuses."),
  S(title="Tu refuses", comp=[ROWS(["Acompte avant la visite", "Non", 'bad'], ["Mandat cash, coupon", "Non", 'bad'], ["Crypto", "Non", 'bad'], ["Livraison sans visite", "Non", 'bad'])]),
], "Paye l'esprit\n*tranquille*."),

car('photo-compteur-manquante', 'PI',
    "Une annonce de voiture d'occasion sans photo du compteur, de l'intérieur ou des pneus ? Les vues qui manquent en disent long.",
    "Tu demandes des photos en plus ?", [
  S(kicker="Regarde ce qui manque.", title="Pas de photo\ndu compteur ?\n*Demande*."),
  S(title="Les 4 vues\nà exiger", comp=[LIST("Le compteur, moteur allumé", "L'intérieur, sièges et volant", "Les 4 pneus", "Le côté droit")]),
  S(title="Pourquoi", body="Un volant usé avec 80 000 km au compteur, ça ne colle pas. **Les photos se croisent avec les chiffres.**", relance="Image 4 : le message à envoyer."),
  S(title="Le message", comp=[CHAT(["m", "Bonjour, vous pouvez m'envoyer une photo du compteur et des pneus ? Merci !"])]),
], "Les photos,\n*avant* le trajet."),

car('premiere-voiture-piege', 'EI',
    "Ta première voiture d'occasion : 3 modèles fiables et pas chers, et le piège dans lequel tombent beaucoup de jeunes conducteurs.",
    "C'était quoi, ta première voiture ?", [
  S(kicker="Ta première voiture ?", title="Le piège des\njeunes *conducteurs*."),
  S(title="Les 3 modèles", comp=[ROWS(["Renault Clio III / IV", "1.2 16V 75 ch", 'ok'], ["Dacia Sandero", "1.2 16V, 1.5 dCi", 'ok'], ["Peugeot 207", "1.4 essence 75 ch", 'ok'])]),
  S(title="Pourquoi elles", body="Pièces partout, garagistes qui les connaissent, **revente facile** le jour où tu changes.", relance="Image 4 : le piège."),
  S(title="Le piège", body="La **208 essence** de 2012 à 2016 : un PureTech. En diesel, elle est bien.", comp=[PILLS(["208 PureTech", 'bad'], ["208 1.6 HDi", 'ok'])]),
], "Ta première,\n*sans* galère."),

car('diesel-en-ville', 'CC',
    "Diesel d'occasion et petits trajets en ville : la vanne EGR et le FAP s'encrassent. Jusqu'à 1 500 € de facture.",
    "Tu roules surtout en ville ?", [
  S(kicker="Tu roules surtout en ville ?", title="Ton diesel\nva t'envoyer\nune *facture*."),
  S(title="Le problème", body="Sur les petits trajets, le moteur ne chauffe pas assez. **La vanne EGR et le FAP s'encrassent.**"),
  S(title="La facture", comp=[TICKET(["Vanne EGR", "250 – 600 €"], ["FAP", "jusqu'à 900 €"], tot="jusqu'à 1 500 €", totLab="Au pire", tone='r')], relance="Image 4 : quoi prendre à la place."),
  S(title="À la place", body="Moins de 10 000 km par an en ville : un **essence fiable**.", comp=[PILLS(["Yaris VVT-i", 'ok'], ["Jazz i-VTEC", 'ok'], ["Clio 1.2 16V", 'ok'])]),
], "Le bon moteur\npour *ta* route."),

car('vendeur-presse', 'PI',
    "Un vendeur de voiture d'occasion qui te presse : « beaucoup de demandes », « je pars demain ». Pourquoi tu dois ralentir.",
    "On t'a déjà mis la pression ?", [
  S(kicker="« Beaucoup de demandes. »", title="Plus il te\npresse, plus tu\n*ralentis*."),
  S(title="Les phrases", comp=[LIST("« Trois personnes viennent ce soir »", "« Je pars à l'étranger demain »", "« Venez maintenant ou je la vends »")]),
  S(title="Pourquoi", body="Pressé, tu ne lis pas les papiers. **Tu ne fais pas l'essai.** Tu ne négocies pas.", relance="Image 4 : ta réponse."),
  S(title="Ta réponse", comp=[CHAT(["m", "Pas de souci. Si elle est encore là samedi, je viens avec le CT et les factures en main."])]),
], "Ton rythme,\n*pas* le sien."),

car('10-points-15-minutes', 'DM',
    "10 points à vérifier pendant la visite d'une voiture d'occasion, en 15 minutes. La checklist à garder sur ton téléphone.",
    "Lequel tu oublies à chaque fois ?", [
  S(kicker="Enregistre-la.", title="10 points.\n15 minutes.\nZéro *regret*."),
  S(title="Moteur et boîte", comp=[LIST("Démarrage moteur froid", "Aucun voyant après démarrage", "Embrayage : pas de patinage en 3e", "Vitesses sans craquement", "Pas de fuite sous la voiture")]),
  S(title="Le reste", comp=[LIST("Freinage droit, sans vibration", "La direction ne tire pas", "Pneus de moins de 6 ans", "Écarts de carrosserie réguliers", "Clim, vitres, fermeture : OK", start=6)], relance="Image 4 : si un point bloque."),
  S(title="Un point\nbloque ?", comp=[VERDICT("Chiffre-le", 'warn', "Tu le déduis du prix. Ou tu pars.")]),
], "La checklist,\n*dans* ta poche."),

car('boite-auto-pas-chere', 'CC',
    "Boîte automatique pas chère sur une voiture d'occasion : EDC, DSG, Powershift. Le prix bas cache souvent la facture de la boîte.",
    "Tu veux une boîte auto ?", [
  S(kicker="Une automatique pas chère ?", title="Tu paies\nla boîte\n*plus tard*."),
  S(title="Les boîtes\nfragiles", comp=[PILLS(["EDC", 'bad'], ["DSG7", 'bad'], ["Powershift", 'bad'], ["Easytronic", 'bad'], ["MMT", 'bad'], ["AL4", 'bad'])]),
  S(title="À l'essai", comp=[LIST("À-coups au démarrage", "Hésitation entre deux rapports", "Voyant boîte au tableau de bord")], relance="Image 4 : ce qu'il faut demander."),
  S(title="Demande", body="Les **factures de la boîte** : vidange, embrayage, mécatronique. Sans elles, tu achètes un risque."),
], "Une auto,\n*oui*. Pas celle-là."),

car('prix-ferme-450', 'RE',
    "« Prix ferme » : cette Peugeot 208 était affichée 450 € au-dessus du marché. Comment savoir si une occasion est au bon prix.",
    "Tu compares avec combien d'annonces ?", [
  S(kicker="Le vendeur dit « prix ferme ».", title="Elle était\n*450 €*\ntrop chère."),
  S(title="Le marché", comp=[COTE(6950, 7400, 5000, 9000)]),
  S(title="La cote", body="Calculée sur les annonces **comparables** en ligne : même modèle, ± 2 ans, même énergie, kilométrage proche.", relance="Image 4 : ce que tu lui dis."),
  S(title="Ce que\ntu lui dis", comp=[CHAT(["m", "J'ai vu 12 annonces du même modèle autour de 6 950 €. Vous pouvez faire un effort ?"])]),
], "Le bon prix,\nc'est le *marché*."),

car('message-qui-obtient-reponse', 'AA',
    "Le message à envoyer au vendeur d'une voiture d'occasion pour obtenir une réponse et les bons documents. Avant / après.",
    "Les vendeurs te répondent, toi ?", [
  S(kicker="Les vendeurs ne te répondent pas ?", title="Change *une*\nphrase."),
  S(title="Avant", comp=[CHAT(["m", "Bonjour, je suis intéressé, est-ce qu'on pourrait discuter du prix et de l'entretien quand vous aurez un moment…"])]),
  S(title="Après", comp=[CHAT(["m", "Bonjour, votre Clio est toujours dispo ? Vous pourriez m'envoyer le CT et les factures ?"])], relance="Image 4 : ce que sa réponse t'apprend."),
  S(title="Sa réponse", comp=[ROWS(["Il envoie tout", "Bon signe", 'ok'], ["« On verra sur place »", "Méfiance", 'warn'], ["Pas de réponse", "Suivante", 'bad'])]),
], "Un message,\n*trois* réponses."),

car('negocie-ou-pars', 'PI',
    "Défauts d'une voiture d'occasion : ceux qui se négocient (pneus, freins, batterie) et ceux qui doivent te faire partir.",
    "Tu es déjà parti d'une visite ?", [
  S(kicker="Tous les défauts ne se valent pas.", title="Négocie.\nOu *pars*."),
  S(title="Ça se négocie", comp=[PILLS(["Pneus", 'ok'], ["Freins", 'ok'], ["Batterie", 'ok'], ["Vidange", 'ok'], ["Rayures", 'ok'], ["Optiques", 'ok'])], body="Tu les chiffres, tu les retires du prix."),
  S(title="Tu pars", comp=[PILLS(["Joint de culasse", 'bad'], ["Moteur à refaire", 'bad'], ["Boîte qui craque", 'bad'], ["Fumée blanche", 'bad'])], relance="Image 4 : le cas des papiers."),
  S(title="Et aussi", comp=[PILLS(["Kilométrage non garanti", 'bad'], ["Carte grise pas à son nom", 'bad'])], body="Un problème de papiers, c'est **non**."),
], "Sache quand\n*partir*."),

car('couleur-de-la-fumee', 'FC',
    "La couleur de la fumée d'échappement d'une voiture d'occasion : bleue, blanche ou noire. Ce que chacune annonce.",
    "Tu regardes l'échappement au démarrage ?", [
  S(kicker="Au démarrage,", title="la fumée\nannonce la\n*facture*."),
  S(title="Bleue", comp=[VERDICT("Huile", 'bad', "Le moteur brûle de l'huile.")]),
  S(title="Blanche\net épaisse", comp=[VERDICT("Danger", 'bad', "Si elle reste : liquide de refroidissement, peut-être le joint de culasse.")], relance="Image 4 : la noire."),
  S(title="Noire", comp=[VERDICT("À vérifier", 'warn', "Diesel : injecteurs ou EGR. 150 à 1 000 €.")]),
], "L'échappement\nne *ment* pas."),

car('embrayage-30-secondes', 'DM',
    "Tester l'embrayage d'une voiture d'occasion en 30 secondes pendant l'essai. Un embrayage usé, c'est 450 à 800 €.",
    "Tu sais tester un embrayage ?", [
  S(kicker="Pendant l'essai,", title="30 secondes\npour éviter\n*800 €*."),
  S(title="Test 1", body="Il accroche **tout en haut** de la course ? Il est usé."),
  S(title="Test 2", body="En 3e, à bas régime, accélère fort. Le moteur monte, la voiture n'avance pas ? **Il patine.**", relance="Image 4 : combien ça coûte."),
  S(title="Le prix", comp=[TICKET(["Embrayage", "450 – 800 €"], ["Volant moteur (si besoin)", "400 – 800 €"], tot="jusqu'à 1 600 €", totLab="Au pire", tone='r')]),
], "30 secondes,\n*800 €* d'écart."),

car('potes-envoient-annonce', 'RE',
    "Mes potes ne signent plus pour une voiture d'occasion sans m'envoyer l'annonce. Ce que je regarde, et ce qu'ils reçoivent maintenant.",
    "Tu montres l'annonce à qui avant d'acheter ?", [
  S(kicker="Mes potes m'envoient l'annonce", title="avant de\nsigner. *Tous*."),
  S(title="Ce que\nje regarde", comp=[LIST("Le moteur : fiable ou à fuir", "Le prix face au marché", "Les mots qui coûtent cher", "Les papiers")]),
  S(title="Le problème", body="Je ne peux pas répondre à tout le monde à 23 h. **Alors j'ai mis ma méthode dans un outil.**", relance="Image 4 : ce qu'ils reçoivent."),
  S(title="Ce qu'ils\nreçoivent", comp=[VERDICT("Prix correct", 'warn', "Pneus à prévoir : **négocie 200 €**. CT et carnet à demander.")]),
], "Ton avis d'expert,\n*sans* l'expert."),

car('ce-que-les-vendeurs-taisent', 'CV',
    "Tu crois que l'annonce dit tout sur la voiture d'occasion. 3 choses que les vendeurs n'écrivent jamais.",
    "Tu en rajoutes une ?", [
  S(kicker="Tu crois que l'annonce dit tout ?", title="3 choses\nqu'elle *tait*."),
  S(title="1. La distribution", body="« Entretien à jour », sans facture. **400 à 750 €** si elle est à faire."),
  S(title="2. Le voyant", body="Effacé avant ta visite. Il revient deux jours après.", relance="Image 4 : la plus chère."),
  S(title="3. Le moteur", body="Ils écrivent « 1.2 essence ». Ils n'écrivent pas **PureTech**.", comp=[PILLS(["1.2 PureTech", 'bad'])]),
], "Lis ce qui\n*n'est pas* écrit."),

car('annonce-parfaite', 'AA',
    "L'annonce de voiture d'occasion parfaite, face à l'annonce floue : ce qui doit te rassurer, point par point.",
    "Tu en as déjà vu une comme ça ?", [
  S(kicker="Deux annonces, même prix.", title="Une seule\nte *rassure*."),
  S(title="L'annonce\nfloue", comp=[QUOTE("Bon état, ==entretien à jour==, ==CT à faire==, prix à débattre.")]),
  S(title="L'annonce\nparfaite", comp=[QUOTE("Première main, ++carnet complet++, ++factures++, ++distribution faite à 118 000 km++, CT vierge de janvier.")], relance="Image 4 : ce que tu vérifies quand même."),
  S(title="Quand même", body="Les factures **au nom du vendeur**, et le kilométrage cohérent avec le HistoVec."),
], "Les preuves,\npas les *promesses*."),

car('vendeur-refuse-essai', 'PI',
    "Un vendeur de voiture d'occasion qui refuse l'essai routier : la seule réponse possible.",
    "On t'a déjà refusé un essai ?", [
  S(kicker="« Pas d'essai, l'assurance… »", title="Pas d'essai,\npas d'*achat*."),
  S(title="Ce que\nl'essai montre", comp=[LIST("L'embrayage et la boîte", "Les freins et la direction", "Les bruits à chaud")]),
  S(title="La parade", body="Propose qu'il conduise, toi à côté. **Tu écoutes, tu regardes les voyants.**", relance="Image 4 : s'il refuse encore."),
  S(title="S'il refuse\nencore", comp=[VERDICT("Tu pars", 'bad', "Un vendeur qui cache la route cache un défaut.")]),
], "Roule\n*avant* de payer."),

car('cote-ou-argus', 'CV',
    "Tu crois que la cote Argus donne le prix d'une voiture d'occasion. Le marché réel se lit dans les annonces comparables.",
    "Tu te bases sur quoi pour juger un prix ?", [
  S(kicker="Tu te fies à la cote ?", title="Le vrai prix\nest dans les\n*annonces*."),
  S(title="Les comparables", body="Même modèle, **± 2 ans**, même énergie, kilométrage proche. La moitié se situe dans une fourchette."),
  S(title="La fourchette", comp=[COTE(7850, 7850, 6500, 9500, "La moitié des annonces entre ces deux prix")], relance="Image 4 : le détail qu'on oublie."),
  S(title="Le détail", body="Les voitures se vendent **environ 5 % sous** le prix affiché. Ton offre part de là."),
], "Le prix\ndu *marché*."),
]
