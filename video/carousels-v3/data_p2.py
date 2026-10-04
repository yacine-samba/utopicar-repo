"""Groupe P (2/2) : pros de l'achat-revente. Thèmes nouveaux : fonctions de l'outil (comparer, rapports, export, seuil de
marge, tri rapide, analyse des photos, extension), arnaques côté vendeur, quiz, rotation et marge par jour. 33 carrousels."""
from common import *
CARS = [
car('argent-immobilise', 'PI',
    "Ton argent immobilisé dans le parc d'achat-revente : le chiffre que tu ne regardes pas, et qui décide combien tu peux acheter ce mois-ci.",
    "Combien dort dans ton parc, là ?", [
  S(kicker="Ton parc, ce soir :", title="combien\nd'argent *dort*\ndedans ?"),
  S(title="Exemple", comp=[TICKET(["4 voitures en stock", "23 800 €"], ["Vendues, pas encaissées", "6 600 €"], tot="30 400 €", totLab="Immobilisés")]),
  S(title="Ce que\nça décide", body="Ton prochain achat. **Chaque euro qui dort ne peut pas acheter la suivante.**", relance="Image 4 : le faire baisser."),
  S(title="Le faire\nbaisser", comp=[LIST("Vendre ce qui dépasse 60 jours", "Encaisser avant de racheter", "Acheter ce qui tourne vite")]),
], "Ton argent\n*doit* tourner."),

car('comparer-deux-annonces', 'FC',
    "Deux annonces de voitures côte à côte : cote, défauts, moteur, marge. La comparaison qui tranche avant l'appel.",
    "Tu compares comment deux annonces ?", [
  S(kicker="Golf ou Clio ?", title="Mets-les\n*côte à côte*.\nUne seule gagne."),
  S(title="La Golf", comp=[ROWS(["Prix", "9 500 €", 'warn'], ["Défauts chiffrés", "1 100 €", 'bad'], ["Marge estimée", "− 1 200 €", 'bad'])]),
  S(title="La Clio", comp=[ROWS(["Prix", "6 400 €", 'ok'], ["Défauts chiffrés", "200 €", 'warn'], ["Marge estimée", "+ 1 932 €", 'ok'])], relance="Image 4 : le verdict."),
  S(title="Le verdict", comp=[VERDICT("La Clio", 'ok', "Plus de 3 000 € d'écart de marge entre les deux.")]),
], "Compare,\n*puis* appelle."),

car('rapports-historique', 'FC',
    "L'historique de tes analyses d'annonces : retrouver le calcul fait il y a 3 semaines quand le vendeur rappelle avec un nouveau prix.",
    "Le vendeur t'a déjà rappelé ?", [
  S(kicker="Le vendeur rappelle 3 semaines après.", title="Ton calcul,\ntu l'as *encore* ?"),
  S(title="Sans historique", body="Tu refais tout de tête, au téléphone. **Tu dis oui trop vite.**"),
  S(title="Avec", comp=[ROWS(["Clio IV · 3 sept.", "Marge 980 €", 'ok'], ["208 HDi · 28 août", "Marge 1 120 €", 'ok'], ["Golf VII · 25 août", "À éviter", 'bad'])], relance="Image 4 : la réponse au vendeur."),
  S(title="La réponse", comp=[CHAT(["v", "Je peux vous la faire à 6 600 €."], ["m", "À 6 600 €, ça passe. Je viens demain."])]),
], "Garde tes\n*calculs*."),

car('export-compta', 'FC',
    "Ton comptable te demande tes achats et ventes de voitures : un export CSV du parc, au lieu de recopier tes notes.",
    "Tu prépares ta compta comment ?", [
  S(kicker="Ton comptable te demande tes ventes.", title="Tu as\n*un* fichier\nà envoyer ?"),
  S(title="Avant", comp=[PILLS(["Notes du téléphone"], ["Excel"], ["Photos de factures"], ["Mémoire"])], body="Un week-end à tout recopier."),
  S(title="Maintenant", body="Le parc, voiture par voiture : achat, frais, vente, marge. **Un export CSV.**", relance="Image 4 : ce qu'il contient."),
  S(title="Le fichier", comp=[ROWS(["Modèle et plaque", "✓", 'ok'], ["Achat et vente", "✓", 'ok'], ["Frais", "✓", 'ok'], ["Marge", "✓", 'ok'])]),
], "Ta compta\n*en un clic*."),

car('seuil-de-marge', 'FC',
    "Régler ton seuil de marge dans l'outil : toutes les annonces sont jugées sur ta barre à toi, pas sur une moyenne.",
    "Ta barre, c'est combien ?", [
  S(kicker="Ta marge minimum est à 750 € ?", title="Règle-la\n*une* fois."),
  S(title="Sans réglage", body="Chaque annonce, tu refais le calcul. **Tu te demandes si 600 € suffisent.**"),
  S(title="Avec", comp=[ROWS(["Seuil de marge", "750 €", 'ok'], ["Annonce A : 980 €", "Au-dessus", 'ok'], ["Annonce B : 420 €", "En dessous", 'bad'])], relance="Image 4 : ce que ça change."),
  S(title="Ce que\nça change", body="Le verdict suit **ta** règle. Tu ne débats plus avec toi-même."),
], "Ta barre,\n*appliquée*."),

car('tri-rapide-lot', 'FC',
    "Le tri rapide : un lot d'annonces de voitures classées d'un coup, de la plus rentable à la moins rentable.",
    "Tu tries tes annonces une par une ?", [
  S(kicker="20 annonces ouvertes dans 20 onglets ?", title="Trie-les\n*d'un coup*."),
  S(title="Le principe", body="Tu donnes un lot d'annonces. **Elles reviennent classées** par marge estimée."),
  S(title="Le résultat", comp=[ROWS(["208 1.6 HDi", "+ 1 020 €", 'ok'], ["Clio IV dCi", "+ 910 €", 'ok'], ["C3 1.4 HDi", "+ 780 €", 'ok'], ["Golf 1.6 TDI", "− 300 €", 'bad'])], relance="Image 4 : ce que tu fais ensuite."),
  S(title="Ensuite", body="Tu appelles **les trois premières**. Les autres, tu les fermes."),
], "Classe,\n*puis* appelle."),

car('analyse-des-photos', 'FC',
    "L'analyse des photos d'une annonce de voiture : défauts visibles et vues manquantes repérés avant la visite.",
    "Tu analyses les photos ?", [
  S(kicker="Les photos de l'annonce", title="cachent des\ndéfauts que tu\nne *vois* pas."),
  S(title="Ce qui\nest repéré", comp=[LIST("Rayures et chocs visibles", "Teinte différente entre éléments", "Jantes frottées")]),
  S(title="Ce qui\nmanque", comp=[LIST("Le compteur", "Les pneus", "Un côté de la voiture")], body="Une vue absente : **une question à poser**.", relance="Image 4 : le résultat."),
  S(title="Le résultat", comp=[VERDICT("Photos : 6/10", 'warn', "Aile arrière gauche rayée, compteur absent. **Demande 2 photos.**")]),
], "Lis les photos\n*avant* le trajet."),

car('extension-scanner', 'FC',
    "L'extension Chrome qui analyse une annonce de voiture directement sur Leboncoin, La Centrale, AutoScout24 ou LeParking.",
    "Tu copies-colles encore tes annonces ?", [
  S(kicker="Tu copies-colles chaque annonce ?", title="Une extension\nle fait *sur*\nla page."),
  S(title="Où", comp=[PILLS(["Leboncoin"], ["La Centrale"], ["AutoScout24"], ["LeParking"])]),
  S(title="Comment", body="Tu ouvres l'annonce. **Un clic**, l'analyse arrive : cote, défauts, moteur, marge.", relance="Image 4 : le temps gagné."),
  S(title="Le temps", comp=[VS(["Avant", ["Copier", "Coller", "Attendre", "Revenir"]], ["Maintenant", ["Un clic"]])]),
], "Un clic,\n*une* analyse."),

car('seuils-km-pro', 'FC',
    "Le kilométrage maximum par modèle pour acheter une voiture à revendre : 200 000 km pour une Clio, 170 000 km pour une Aygo.",
    "Tu as un seuil de kilométrage ?", [
  S(kicker="Ta voiture a 210 000 km ?", title="Elle va\n*dormir*."),
  S(title="Les seuils", comp=[ROWS(["Clio, Sandero, 208 diesel", "200 000 km", 'ok'], ["Yaris, Jazz, 207, Fiesta", "190 000 km", 'ok'], ["Swift, Mazda 2", "180 000 km", 'ok'], ["Aygo, C1, i10", "170 000 km", 'ok'])]),
  S(title="Au-delà", body="Les acheteurs filtrent par kilométrage. **Ton annonce sort de leurs résultats.**", relance="Image 4 : l'exception."),
  S(title="L'exception", body="Un prix très bas **et** des factures complètes. Sinon, passe ton tour."),
], "Achète sous\nle *seuil*."),

car('cheque-de-banque-samedi', 'CC',
    "Le faux chèque de banque du samedi : l'arnaque qui vise aussi les marchands. La voiture part, la banque est fermée.",
    "On t'a déjà proposé un chèque le samedi ?", [
  S(kicker="Un acheteur, un samedi, un chèque.", title="La banque\nest *fermée*.\nIl le sait."),
  S(title="Le scénario", comp=[TL(["Samedi 17 h", "Chèque de banque, il repart avec la voiture."], ["Lundi 10 h", "Ta banque : chèque faux.", 'x'])]),
  S(title="La parade", body="Appelle la banque émettrice avec **un numéro trouvé toi-même**. Fermée ? La voiture attend lundi.", relance="Image 4 : le plus simple."),
  S(title="Le plus\nsimple", comp=[VERDICT("Virement instantané", 'ok', "Reçu sur ton compte avant de rendre les clés.")]),
], "Les clés\n*après* l'argent."),

car('acheteur-transporteur', 'DO',
    "L'arnaque de l'acheteur à l'étranger qui envoie un transporteur et paie trop : le trop-perçu que tu rembourses n'existe pas.",
    "Tu as déjà reçu ce message ?", [
  S(kicker="« Je suis à l'étranger, mon transporteur passe. »", title="Il paie *trop*.\nC'est l'arnaque."),
  S(title="Le message", comp=[CHAT(["v", "Je vous envoie 1 000 € de plus pour le transporteur. Vous lui remettez la différence en espèces."], v='Un acheteur')]),
  S(title="La suite", body="Le paiement est faux ou annulé. **Les 1 000 € en espèces, eux, sont partis.**", relance="Image 4 : ta règle."),
  S(title="Ta règle", comp=[VERDICT("Annonce retirée", 'bad', "Jamais de trop-perçu. Jamais de remboursement en espèces.")]),
], "Vends à\n*ceux qui viennent*."),

car('une-recherche-quatre-sites', 'AA',
    "Chercher une voiture sur quatre sites d'annonces en même temps, ou recevoir une alerte qui regroupe tout. Avant / après.",
    "Tu regardes combien de sites ?", [
  S(kicker="Leboncoin, La Centrale, AutoScout24…", title="4 onglets\nouverts *toute*\nla journée ?"),
  S(title="Avant", comp=[LIST("Une recherche par site", "Les mêmes voitures en double", "Les bonnes vues trop tard")]),
  S(title="Après", body="Une recherche. **Une alerte par mail** quand une annonce correspond.", relance="Image 4 : le contenu de l'alerte."),
  S(title="L'alerte", comp=[NOTIF("C3 II 1.6 HDi · 2013", "[g]Sous la cote[/g] · marge estimée 840 €", "il y a 6 min")]),
], "Une recherche,\n*tous* les sites."),

car('quiz-208-hdi', 'DM',
    "Quiz achat-revente : Peugeot 208 1.6 HDi, 2013, 142 000 km, affichée 6 900 €. Tu achètes ou pas ? Réponse en image 4.",
    "Ta réponse en commentaire, avant de glisser.", [
  S(kicker="Réponds avant de glisser.", title="208 HDi\nà 6 900 €.\nTu *achètes* ?"),
  S(title="L'annonce", comp=[QUOTE("208 1.6 HDi 92 · 2013 · 142 000 km. ++Distribution faite++, ++factures++, ==2 pneus à prévoir==. 6 900 €.")]),
  S(title="Le marché", comp=[COTE(7600, 6900, 6000, 8800)], relance="Image 4 : ma réponse."),
  S(title="Ma réponse", comp=[VERDICT("J'achète", 'ok', "Sous la cote, distribution prouvée. **Offre 6 400 €** avec les pneus.")]),
], "Ton verdict,\n*calculé*."),

car('quiz-yaris', 'DM',
    "Quiz achat-revente : Toyota Yaris 1.33, 2012, 98 000 km, affichée 7 900 €. Bonne affaire ou trop chère ? Réponse en image 4.",
    "Ton avis en commentaire avant de glisser.", [
  S(kicker="Réponds avant de glisser.", title="Yaris à\n7 900 €.\nTrop *chère* ?"),
  S(title="L'annonce", comp=[QUOTE("Yaris 1.33 VVT-i · 2012 · 98 000 km. ++Carnet Toyota++, ++première main++. Prix ferme 7 900 €.")]),
  S(title="Le marché", comp=[COTE(7100, 7900, 6000, 8800)], relance="Image 4 : ma réponse."),
  S(title="Ma réponse", comp=[VERDICT("Trop chère", 'bad', "800 € au-dessus. Belle voiture, **mauvaise affaire à ce prix**.")]),
], "Une belle voiture\nn'est pas une *affaire*."),

car('repondre-vite', 'PI',
    "En achat-revente, l'acheteur qui t'écrit contacte aussi trois autres vendeurs. Le premier qui répond fait la visite.",
    "Tu réponds en combien de temps ?", [
  S(kicker="Un acheteur t'écrit.", title="Il écrit à\n*trois* autres\nen même temps."),
  S(title="Ce qui\nse passe", comp=[TL(["10 h 00", "Il écrit à 4 vendeurs."], ["10 h 05", "Un vendeur répond, avec les papiers.", 'v'], ["14 h 00", "Tu réponds. Il a déjà rendez-vous.", 'x'])]),
  S(title="La règle", body="Réponds **dans l'heure**, avec le CT, les factures et un créneau.", relance="Image 4 : le message tout prêt."),
  S(title="Le message", comp=[CHAT(["m", "Bonjour, oui elle est dispo. CT, factures et HistoVec en pièce jointe. Samedi 10 h ou 14 h ?"])]),
], "Réponds\n*le premier*."),

car('annonce-pro', 'DM',
    "L'annonce de revente d'un pro de l'achat-revente : titre, texte, papiers, prix. La structure qui fait appeler.",
    "Tu écris tes annonces comment ?", [
  S(kicker="Ton annonce fait peu d'appels ?", title="Elle ne\nrépond pas à\nleurs *questions*."),
  S(title="Le titre", comp=[QUOTE("++Peugeot 208 1.6 HDi 92 · 2013 · 142 000 km · Distribution faite++", lab="Titre")]),
  S(title="Le texte", comp=[LIST("Entretien prouvé, factures listées", "CT : date et résultat", "Défauts écrits, avec photo", "Créneaux de visite")], relance="Image 4 : la dernière ligne."),
  S(title="La dernière\nligne", comp=[QUOTE("++CT, factures et HistoVec envoyés avant la visite.++", lab="Fin d'annonce")]),
], "Une annonce\nqui *appelle*."),

car('photos-pro', 'DM',
    "Les photos de revente d'un pro : même ordre, même lumière, même fond pour chaque voiture. L'acheteur reconnaît ton sérieux.",
    "Tu as un ordre pour tes photos ?", [
  S(kicker="Tes photos changent à chaque voiture ?", title="Fixe un\n*ordre*. Toujours\nle même."),
  S(title="L'ordre", comp=[LIST("3/4 avant", "3/4 arrière", "Profil", "Compteur allumé", "Sièges avant", "Banquette", "Coffre", "Pneus")]),
  S(title="Le lieu", body="**Le même fond** pour chaque voiture. Un mur neutre, un parking vide.", relance="Image 4 : ce que ça change."),
  S(title="Ce que\nça change", body="L'acheteur qui voit deux annonces de toi **reconnaît un pro**. Il négocie moins."),
], "Des photos\n*de pro*."),

car('modeles-fiables-pro', 'FC',
    "Les modèles fiables à acheter pour revendre, avec le bon moteur : la liste à garder sous la main en achat-revente.",
    "Tu as ta liste de modèles ?", [
  S(kicker="Tes acheteurs connaissent ces modèles.", title="Ils les\n*recherchent*."),
  S(title="Citadines", comp=[ROWS(["Clio III / IV", "1.2 16V, 1.5 dCi", 'ok'], ["208", "HDi seulement", 'ok'], ["C3 II", "HDi, essence TU", 'ok'], ["Yaris", "VVT-i, hybride", 'ok'])]),
  S(title="Petits prix", comp=[ROWS(["Sandero", "1.2 16V, dCi", 'ok'], ["Aygo, C1, 107", "1.0 Toyota", 'ok'], ["Twingo II", "1.2 16V manuelle", 'ok'])], relance="Image 4 : ce qu'ils ont en commun."),
  S(title="En commun", body="Pièces partout, garagistes qui connaissent, **revente rapide**."),
], "Achète ce qu'ils\n*cherchent*."),

car('vendeur-presse-affaire', 'CV',
    "Tu crois qu'un vendeur pressé est suspect. Quand il déménage pour de vrai, c'est souvent la meilleure négo du mois.",
    "Ta meilleure négo, c'était quoi ?", [
  S(kicker="« Je déménage samedi. »", title="Pressé ne veut\npas dire\n*arnaqueur*."),
  S(title="Le vrai\npressé", comp=[LIST("Il te montre la voiture", "Il a tous les papiers", "Il veut vendre avant une date")]),
  S(title="Le faux", comp=[LIST("Pas de visite possible", "Paiement d'abord", "Prix ridicule")], relance="Image 4 : comment négocier avec le vrai."),
  S(title="Avec le vrai", comp=[CHAT(["m", "Je peux venir ce soir avec la somme. À 5 800 €, on signe tout de suite."])]),
], "La date\nfait le *prix*."),

car('leviers-pieges-pro', 'DM',
    "Les défauts que tu négocies et ceux qui te font partir en achat-revente : la grille du pro.",
    "Tu as une grille, toi ?", [
  S(kicker="À chaque visite :", title="*leviers*\nou pièges ?"),
  S(title="Leviers", comp=[PILLS(["Pneus", 'ok'], ["Freins", 'ok'], ["Batterie", 'ok'], ["Vidange", 'ok'], ["Rayures", 'ok'], ["Optiques", 'ok'], ["Pare-brise", 'ok'])], body="Chiffrés, déduits."),
  S(title="Pièges", comp=[PILLS(["Joint de culasse", 'bad'], ["Moteur", 'bad'], ["Boîte", 'bad'], ["Non roulante", 'bad'], ["Compteur", 'bad'])], relance="Image 4 : la zone grise."),
  S(title="La zone\ngrise", comp=[PILLS(["Bruit inconnu", 'warn'], ["Voyant moteur", 'warn'], ["Fumée", 'warn'])], body="Diagnostic avant de payer, **ou tu pars**."),
], "Ta grille,\n*à chaque* visite."),

car('prix-max-au-telephone', 'PI',
    "Annonce ton prix maximum au téléphone, avant le trajet. Sur place, tu ne négocies plus à l'émotion.",
    "Tu annonces ton prix avant ?", [
  S(kicker="Sur place, tu craques ?", title="Annonce\nton prix *avant*\nle trajet."),
  S(title="Au téléphone", comp=[CHAT(["m", "Avec les pneus à faire, je suis à 6 400 € maximum. Si ça vous va, je viens demain."])]),
  S(title="Ce que\nça trie", comp=[ROWS(["« D'accord, venez »", "Tu y vas", 'ok'], ["« On verra sur place »", "À toi de voir", 'warn'], ["« Non, prix ferme »", "Tu restes", 'bad'])], relance="Image 4 : sur place."),
  S(title="Sur place", body="Le prix est déjà posé. **Tu vérifies, tu signes ou tu pars.**"),
], "Le prix,\n*avant* les km."),

car('calcul-avant-visite', 'AA',
    "Calculer sa marge avant la visite ou après l'achat : deux façons d'acheter des voitures, deux résultats. Avant / après.",
    "Tu calcules quand, toi ?", [
  S(kicker="Ta marge, tu la calcules :", title="avant la visite\nou *après*\nl'achat ?"),
  S(title="Après l'achat", comp=[LIST("Tu découvres les travaux", "Tu découvres les frais", "Tu découvres ta marge")]),
  S(title="Avant la visite", comp=[LIST("Travaux chiffrés depuis l'annonce", "Frais déjà comptés", "Prix max fixé")], relance="Image 4 : la différence."),
  S(title="La\ndifférence", body="Après l'achat, tu subis. **Avant la visite, tu choisis.**"),
], "Calcule\n*avant*."),

car('marge-par-jour', 'FC',
    "La marge par jour en stock : 900 € en 10 jours rapportent plus que 1 200 € en 60 jours. Le chiffre qui classe tes voitures.",
    "Tu calcules ta marge par jour ?", [
  S(kicker="1 200 € de marge, c'est mieux que 900 € ?", title="Pas si elle\nmet *60 jours*."),
  S(title="Le calcul", comp=[VS(["Voiture A", ["1 200 € de marge", "60 jours en stock", "= 20 € par jour"]], ["Voiture B", ["900 € de marge", "10 jours en stock", "= 90 € par jour"]])]),
  S(title="Ce que\nça dit", body="La voiture B **libère ton argent 6 fois plus vite**. Tu en rachètes une autre.", relance="Image 4 : ce que tu achètes."),
  S(title="Tu achètes", body="Les modèles qui ont **la meilleure marge par jour**, pas la plus grosse marge."),
], "Compte\n*par jour*."),

car('plafond-preparation', 'PI',
    "Fixe un plafond de préparation par voiture en achat-revente. Au-delà, les travaux mangent la marge sans faire monter le prix.",
    "Tu as un plafond de préparation ?", [
  S(kicker="La préparation qui dérape :", title="400 € prévus,\n*1 100 €*\ndépensés."),
  S(title="Comment\nça dérape", comp=[LIST("Un petit défaut en cache un autre", "« Tant qu'on y est »", "Des travaux que l'acheteur ne voit pas")]),
  S(title="Le plafond", body="Fixe **un montant par voiture** avant l'achat. Il fait partie de ton calcul de prix max.", relance="Image 4 : si tu dépasses."),
  S(title="Si tu\ndépasses", comp=[VERDICT("Stop", 'warn', "Tu vends en l'état, au bon prix. Tu ne rajoutes rien.")]),
], "Un plafond,\n*tenu*."),

car('dossier-par-voiture', 'EI',
    "Les bons revendeurs perdent des ventes à cause d'un papier introuvable. Un dossier par voiture, dès l'achat.",
    "Tu retrouves tes papiers vite ?", [
  S(kicker="Erreur des revendeurs occupés :", title="la facture\n*introuvable*\nle jour J."),
  S(title="Ce qui\nse passe", body="L'acheteur demande la facture de distribution. **Tu cherches 20 minutes.** Il doute, il négocie."),
  S(title="Le dossier", comp=[LIST("Carte grise et cession", "CT et HistoVec", "Factures, achat et travaux", "Photos de l'état à l'achat")], relance="Image 4 : où le garder."),
  S(title="Où", body="**Avec la voiture dans l'outil**, au même endroit que le calcul. Plus de Drive à fouiller."),
], "Un dossier,\n*une* voiture."),

car('visites-groupees', 'DM',
    "Regrouper les visites des acheteurs sur un créneau : moins de déplacements, et des acheteurs qui se voient entre eux.",
    "Tu fais tes visites comment ?", [
  S(kicker="Une visite par acheteur, toute la semaine ?", title="Regroupe-les.\nSamedi, *10 h*."),
  S(title="Le principe", body="Deux créneaux proches, **samedi 10 h et 10 h 30**. Tu proposes l'un ou l'autre."),
  S(title="Ce que\nça change", comp=[LIST("Une seule matinée bloquée", "Les acheteurs se croisent", "Le premier décide plus vite")], relance="Image 4 : le message."),
  S(title="Le message", comp=[CHAT(["m", "Visites samedi matin : 10 h ou 10 h 30, lequel vous va ?"])]),
], "Une matinée,\n*une* vente."),

car('pire-voiture-du-mois', 'CV',
    "Tu crois que ta pire voiture du mois est un accident. Regarde-la de près : elle te dit quoi ne plus acheter.",
    "C'était quoi, ta pire voiture du mois ?", [
  S(kicker="Ta pire voiture du mois,", title="ce n'est pas\nla *malchance*."),
  S(title="Regarde", comp=[ROWS(["Modèle", "Mégane III", 'warn'], ["Jours en stock", "71", 'bad'], ["Négo de l'acheteur", "− 600 €", 'bad'], ["Marge finale", "+ 270 €", 'bad'])]),
  S(title="La cause", body="Pas un imprévu : **un modèle qui tourne lentement** dans ta région, et un prix d'achat trop haut.", relance="Image 4 : ce que tu changes."),
  S(title="Tu changes", comp=[LIST("Ce modèle sort de tes recherches", "Ou ta marge minimum monte pour lui")]),
], "Ta pire voiture\nt'*apprend* tout."),

car('cote-qui-baisse', 'CC',
    "Chaque mois en stock, la cote de ta voiture baisse : année, kilométrage, nouvelles annonces. Le coût invisible du stock qui dort.",
    "Tu baisses tes prix au bout de combien de temps ?", [
  S(kicker="Ta voiture est en stock depuis 2 mois.", title="Sa cote a\nbaissé *sans*\ntoi."),
  S(title="Pourquoi", comp=[LIST("De nouvelles annonces moins chères", "Les kilomètres des autres baissent la moyenne", "Le millésime vieillit")]),
  S(title="Le résultat", body="Ton prix d'il y a 2 mois est **au-dessus du marché**. Plus personne n'appelle.", relance="Image 4 : la parade."),
  S(title="La parade", body="Recalcule la cote **toutes les 2 semaines**. Ajuste avant que la voiture dorme."),
], "Suis\nle *marché*."),

car('meme-modele-meme-ville', 'EI',
    "Les revendeurs efficaces font parfois cette erreur : trois voitures identiques en vente dans la même ville. Ils se font concurrence.",
    "Tu as déjà eu deux fois le même modèle ?", [
  S(kicker="Erreur des revendeurs efficaces :", title="se faire\n*concurrence*\ntout seuls."),
  S(title="Le cas", body="Trois Clio IV dCi en vente, même ville, même prix. **L'acheteur compare tes trois annonces.**"),
  S(title="Ce qui\nse passe", comp=[LIST("Tu baisses le prix de l'une", "Les deux autres paraissent chères", "Les trois dorment plus longtemps")], relance="Image 4 : la règle."),
  S(title="La règle", body="**Un exemplaire à la fois** par modèle et par ville. Varie les modèles."),
], "Varie\n*ton* stock."),

car('relance-vendeur', 'DM',
    "Le message de relance au vendeur de voiture qui n'a pas répondu : court, avec une raison de répondre.",
    "Tu relances les vendeurs ?", [
  S(kicker="Le vendeur n'a pas répondu ?", title="Relance-le.\n*Une* fois."),
  S(title="Le message", comp=[CHAT(["m", "Bonjour, je reviens vers vous pour la 208. Je peux passer ce soir, paiement par virement instantané."])]),
  S(title="Pourquoi\nça marche", comp=[LIST("Un rendez-vous précis", "Un paiement simple", "Une seule relance")], relance="Image 4 : s'il ne répond toujours pas."),
  S(title="Toujours\nrien ?", comp=[VERDICT("Annonce suivante", 'warn', "Une autre arrive dans 15 minutes.")]),
], "Une relance,\n*puis* la suivante."),

car('offre-refusee', 'DM',
    "Ton offre est refusée par le vendeur : 3 réponses selon ce qu'il dit, sans dépasser ton prix max.",
    "Tu réponds quoi quand on refuse ton offre ?", [
  S(kicker="« Non, c'est trop bas. »", title="*3* réponses\nselon ce qu'il\ndit ensuite."),
  S(title="« Prix ferme »", comp=[CHAT(["m", "Je comprends. Je laisse mon numéro, si elle est encore là dans 15 jours."])]),
  S(title="« Faites\nun effort »", comp=[CHAT(["m", "Je peux monter à 6 600 € avec les pneus à faire. C'est mon maximum."])], relance="Image 4 : la troisième."),
  S(title="« Combien\nmaximum ? »", comp=[CHAT(["m", "Mon maximum, c'est 6 800 €. Au-delà, elle ne me laisse plus de marge."])]),
], "Ton max,\n*dit* calmement."),

car('6-mois-mes-chiffres', 'RE',
    "6 mois d'achat-revente de voitures : départ avec 400 €, marge minimum de 750 €, alertes toutes les 15 minutes. Mes règles en chiffres.",
    "Tes chiffres à toi ?", [
  S(kicker="6 mois d'achat-revente :", title="mes règles\nen *chiffres*."),
  S(title="Le départ", comp=[BIG("400 €", "et une Clio 2 à problèmes, revendue 950 €.")]),
  S(title="Les règles", comp=[ROWS(["Marge minimum", "750 €", 'ok'], ["Marge visée", "1 000 €", 'ok'], ["Alertes", "15 min ou 1 h", 'ok'], ["Questions au vendeur", "3", 'ok'])], relance="Image 4 : ce qui a tout changé."),
  S(title="Ce qui a\ntout changé", body="Calculer **avant** d'acheter. Tout le reste en découle."),
], "Tes règles,\n*en chiffres*."),
car('journee-avant-apres', 'AA',
    "Une journée d'achat-revente avant et après les alertes : le temps passé sur les annonces, les appels, les achats.",
    "Ta journée ressemble à laquelle ?", [
  S(kicker="Ta journée d'achat-revente,", title="elle passe\n*où* ?"),
  S(title="Avant", comp=[TL(["Matin", "2 h sur les annonces."], ["Midi", "Les bonnes déjà parties.", 'x'], ["Soir", "Encore 2 h. Zéro appel utile.", 'x'])]),
  S(title="Après", comp=[TL(["Matin", "3 alertes reçues, 2 passent le calcul.", 'v'], ["Midi", "Deux appels, un rendez-vous.", 'v'], ["Soir", "Une visite, un achat sous le prix max.", 'v'])], relance="Image 4 : ce qui a changé."),
  S(title="Ce qui\na changé", body="**Je ne cherche plus.** Les annonces arrivent, déjà calculées. Mon temps part dans les appels et les visites."),
], "Ton temps\n*sur le terrain*."),
]
