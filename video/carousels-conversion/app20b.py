"""20 autres carrousels de conversion (Q01 à Q20) : même offre (3 jours de Benef), mais d'autres choses à tester.
Image 1 : une vraie photo Pexels plein cadre (photos/, crédits dans photos/credits.json), une différente par carrousel.
Chaque carrousel note ce qu'il teste (format ou sujet) dans `test`, repris dans le post.txt.
Chiffres : vraies annonces du 3 oct. 2026 (web/src/lib/demo.ts), réglages de l'outil (0,20 €/km, carte grise à 68,95 €/CV),
faits vérifiés (CT 78 € en moyenne en 2026, R322-5, HistoVec, virement instantané en 10 s, L'argus 2023). Gains : exemples, jamais promis.
Éléments graphiques : ceux d'app20 (échelle de prix, jauges, tirages, tampons, icônes)."""
from app20 import (S, ROWS, PILLS, TICKET, VS, CHAT, LIST, TL, BIG, ISLAND, VALEUR, FIN, OFFRE, PREUVE, PREUVES, DEMO,
                   RULER, GAUGES, PRINTS, STAMP, HERO, R_YARIS, V_CLIO, V_YARIS, V_208, V_GENERAL, T_DEB, T_ARG, T_PIEGE)

def car(id_, slug, test, titre, legende, tags, slides, valeur=V_GENERAL):
    assert len(titre) <= 90, titre
    return dict(id=id_, slug=slug, test=test, offer=OFFRE, car=None, titre=titre, legende=legende, tags=tags,
                slides=slides + [VALEUR(valeur), FIN])

COUTS = "Coûts relevés dans la presse auto et chez des propriétaires"

APP20B = [
car('Q01', 'papiers-jour-j', "Liste à enregistrer (papiers)", "Les clés en main : les 4 papiers à récupérer le jour J",
    "Le jour où tu achètes ta voiture à revendre, repars avec ces 4 papiers. Ensuite, tu as un mois pour la carte grise à ton nom.", T_DEB, [
  HERO('cles-main', "Tu viens de payer 6 700 €", "Les clés.\nEt les *papiers* ?"),
  S(title="4 papiers,\n*le jour J*.", comp=[LIST(("Certificat de cession", "rempli et signé par vous deux", 'doc'), ("Carte grise barrée", "« Vendu le… » et sa signature", 'carte'),
                                               ("Code de cession", "le vendeur l'obtient en ligne", 'lien'), ("Non-gage", "moins de 15 jours", 'bouclier'))]),
  S(title="Puis *1 mois*\npour la carte grise.", comp=[BIG("135 €", cap="d'amende si elle n'est pas\nà ton nom après un mois.", tone='r')],
    credit="Code de la route, art. R322-5")]),
car('Q02', 'capot-ouvert', "Liste à enregistrer (visite)", "Capot ouvert devant le vendeur : les 5 vérifs à faire",
    "Moteur froid, démarrage, bouchon d'huile, voyants, facture de distribution. Enregistre-la pour ta prochaine visite.", T_PIEGE, [
  HERO('moteur-capot', "Capot ouvert devant le vendeur", "Tu regardes\n*quoi*, au juste ?"),
  S(title="5 vérifs\n*sur place*.", comp=[LIST(("Moteur froid", "capot tiède : il l'a déjà démarré", 'temp'), ("Démarrage", "écoute les premières secondes", 'power'),
                                               ("Bouchon d'huile", "mousse beige : à faire vérifier", 'goutte'), ("Voyants", "allumés au contact, puis éteints", 'voyant'),
                                               ("Distribution", "la facture, avec date et kilométrage", 'doc'))]),
  S(title="Avant de partir,\nl'analyse lit l'*annonce*.", body="La Clio IV à 6 700 € :", comp=[PILLS(("Moteur 8/10", 'ok'), ("Choc sur l'aile", 'warn'), ("Distribution à contrôler", 'warn'))],
    body2="Tu sais quoi vérifier sur place.", credit=PREUVE)]),
car('Q03', 'quelquun-dautre-interesse', "Dialogue (pression du vendeur)", "« Quelqu'un d'autre est intéressé » : quoi répondre au vendeur",
    "La pression classique du vendeur. Avec ton prix max calculé avant, tu réponds sans trembler.", T_DEB, [
  HERO('telephone-nuit-voiture', "POV : 23 h, le vendeur rappelle", "« Quelqu'un d'autre\nest *intéressé*. »", pos='50% 35%'),
  S(title="Tu as\n*2 secondes*.", comp=[CHAT(["v", "J'ai un autre acheteur demain matin. Vous la prenez à 6 700 ?"], ["m", "…"])]),
  S(title="Avec ton prix,\ntu *réponds*.", comp=[CHAT(["m", "Mon maximum, c'est 6 250 €. S'il paie plus, je comprends."])],
    body2="Sans chiffre, tu dis oui.")], valeur=V_CLIO),
car('Q04', 'paiement-sur', "Sécurité (paiement)", "Tu vends ta voiture : comment vérifier le paiement avant de donner les clés",
    "Le plus sûr : un virement instantané, vu dans ton appli bancaire. Une capture d'écran ne prouve rien.", T_PIEGE, [
  HERO('billets-comptes', "Samedi soir, tu vends ta voiture", "Il paie.\nTu vérifies *comment* ?", pos='50% 50%'),
  S(title="Le virement\n*instantané*.", comp=[LIST(("Il envoie un virement instantané", "il arrive en 10 secondes", 'banque'), ("Tu le vois dans ton appli", "pas sur son téléphone", 'tel'),
                                                  ("Puis tu donnes les clés", None, 'cle'))]),
  S(title="Les *pièges*", comp=[ROWS(("Une capture d'écran", "ne prouve rien", 'bad txt', 'image'), ("Un chèque le samedi soir", "banque fermée", 'bad txt', 'doc'),
                                     ("Un lien « paiement » par SMS", "faux site", 'bad txt', 'sms'))])]),
car('Q05', 'aiguille-botte-de-foin', "Concept (comparaison au marché)", "174 Clio en vente : comment trouver celle qui est sous le marché",
    "L'analyse compare l'annonce aux voitures similaires en vente : même modèle, même âge, kilométrage proche.", T_DEB, [
  HERO('parking-rangee', "174 Clio IV en vente", "Une seule\n*sous le marché*.", pos='50% 60%'),
  S(title="L'analyse les\n*compare*.", comp=[LIST(("Même modèle", None, 'loupe'), ("± 2 ans", None, 'cal'), ("Même énergie", None, 'goutte'), ("Kilométrage proche", None, 'jauge'))]),
  S(comp=[ISLAND("Verdict : bon prix", 'ok'), STAMP(BIG("425 €", cap="sous le prix du marché,\npour la Clio à 6 700 €.", tone='g'), "Bon prix", 'ok')], credit=PREUVE)], valeur=V_CLIO),
car('Q06', 'preparer-la-revente', "Conseils (revendre)", "Ce qui fait sonner le téléphone quand tu revends ta voiture",
    "Photos en plein jour, annonce complète, factures jointes, et un prix calé sur le marché.", T_ARG, [
  HERO('lavage', "Avant de la remettre en vente", "Ce qui fait\n*sonner* le téléphone."),
  S(title="3 choses qui ne\ncoûtent *presque rien*.", comp=[LIST(("Photos en plein jour", "voiture propre, intérieur compris", 'photo'),
                                                                    ("Annonce complète", "kilométrage, CT, distribution, entretien", 'doc'),
                                                                    ("Factures jointes", "elles justifient ton prix", 'prix'))]),
  S(title="Et un prix\n*juste*.", comp=[BIG("7 550 €", cap="le prix du marché de la Clio IV,\ncalculé sur 174 annonces comparables.", tone='o')], credit=PREUVE)]),
car('Q07', 'trois-lignes-oubliees', "Comparaison (à la main ou avec l'outil)", "Ta marge calculée à la main : les 3 lignes que tu oublies",
    "Carte grise, contrôle technique, trajet : 324 € sur cet exemple. L'analyse les compte toutes.", T_ARG, [
  HERO('calculatrice', "Ta marge, à la main", "Tu oublies\n*3 lignes*."),
  S(title="*324 €*\nd'oubliés.", comp=[STAMP(TICKET(("Carte grise, Clio 5 CV", "186 €"), ("Contrôle technique", "78 €"), ("Trajet, 150 km aller", "60 €"),
                                                       tot="324 €", totLab="Oubliés", tone='r', lab="Les 3 lignes"), "Oubliées", 'bad')],
    credit="Carte grise : plus de 10 ans, tarif par défaut de l'outil. CT : prix moyen 2026. Trajet : 0,20 €/km"),
  S(title="Le même\n*calcul*.", comp=[VS(("À la main", ["Une soirée", "3 lignes oubliées"]), ("Avec l'analyse", ["Une minute", "Toutes les lignes"]))])]),
car('Q08', 'vu-sur-la-photo', "Fonction (lecture des photos)", "Pneus usés : vus sur la photo, pas écrits dans l'annonce",
    "Sur cette vraie Yaris, l'analyse a repéré des pneus avant usés sur les photos : 250 à 350 €.", T_PIEGE, [
  HERO('compteur', "Yaris à 10 999 €", "Sur la photo,\n*pas dans le texte*."),
  S(comp=[ISLAND("Défaut vu sur les photos", 'ok'), PRINTS(('img/yaris-1.webp', '45% 55%', "pneus avant usés", None, 1.2), rot=[-3])], credit=PREUVE),
  S(title="Elle lit les\n*photos*.", comp=[BIG("300 €", cap="pneus avant à changer\n(250 à 350 €).", tone='r')], credit=PREUVE)], valeur=V_YARIS),
car('Q09', 'trajet-120-euros', "Perte chiffrée (trajet)", "300 km pour voir une voiture : 120 € de trajet avant de négocier",
    "600 km aller-retour à 0,20 € du kilomètre : 120 €. Le trajet entre dans ta marge.", T_ARG, [
  HERO('route-cabine', "Samedi, 300 km pour une voiture", "*120 €* de trajet.\nAvant de négocier."),
  S(title="Le *calcul*.", comp=[TICKET(("Aller-retour", "600 km"), ("Coût au kilomètre", "× 0,20 €"), tot="120 €", totLab="Trajet", tone='r')],
    credit="Coût au kilomètre utilisé par défaut par l'analyse"),
  S(title="Le trajet entre\ndans ta *marge*.", comp=[ISLAND("Trajet compté : 120 €", 'ok'), ROWS(("Trajet", "120 €", 'warn', 'route'), ("Carte grise", "186 €", 'warn', 'doc'),
                                                                                                 ("Contrôle technique", "78 €", 'warn', 'check'))],
    body2="Avant que tu prennes la route.")]),
car('Q10', 'poignee-450', "Perte chiffrée (négociation)", "Tu serres la main du vendeur : tu viens de payer 450 € de trop",
    "Clio à 6 700 €, prix conseillé par l'analyse 6 250 €. La négo se prépare avant la poignée de main.", T_DEB, [
  HERO('poignee-de-main', "Clio à 6 700 €, tu serres la main", "Tu viens de payer\n*450 €* de trop."),
  S(title="La *différence*.", comp=[RULER(6000, 7800, (6250, "6 250 €", "Prix conseillé", 'ok', 'b'), (6700, "6 700 €", "Ce que tu as payé", 'bad', 'h'),
                                          (7550, "7 550 €", "Prix du marché", '', 'b'), band=(6250, 6700, None, 'bad'))], body2="450 € de trop.", credit=PREUVE),
  S(title="Ton prix d'offre,\n*avant* la poignée de main.", comp=[ISLAND("Prix à proposer : 6 250 €", 'ok')], body2="Tu l'as avant d'appeler.")], valeur=V_CLIO),
car('Q11', 'travaux-208', "Preuve (travaux cachés)", "208 PureTech à 7 190 € : 1 650 € de travaux que l'annonce ne dit pas",
    "Pneus, freins, révision, contrôle de la courroie : l'analyse les a listés sur cette vraie annonce.", T_PIEGE, [
  HERO('mecano-tablette', "208 PureTech à 7 190 €", "*1 650 €* de travaux.\nL'annonce n'en dit rien."),
  S(title="Ce que l'analyse\na *listé*.", comp=[ROWS(("Pneus", "à prévoir", 'warn txt', 'pneu'), ("Freins", "à prévoir", 'warn txt', 'outil'), ("Révision", "à prévoir", 'warn txt', 'outil'),
                                                      ("Courroie", "à contrôler", 'bad txt', 'moteur'))]),
  S(comp=[STAMP(BIG("8 840 €", cap="son vrai prix.\nLe marché : 5 950 €.", tone='r'), "Déconseillée", 'bad')], credit=PREUVE)], valeur=V_208),
car('Q12', 'combien-vraiment', "Transparence (gains réalistes)", "Achat-revente auto : combien on gagne vraiment par voiture",
    "Les pros tournent autour de 500 € HT par voiture d'occasion (L'argus, 2023). La marge se joue au prix d'achat.", T_ARG, [
  HERO('billets-500', "Achat-revente : combien tu gagnes ?", "Pas *10 000 €*\npar mois."),
  S(title="Les *pros*.", comp=[BIG("500 € HT", cap="de marge moyenne\npar voiture d'occasion.", tone='o')], credit="L'argus, baromètre occasion, 2023"),
  S(title="Elle se joue\nau prix d'*achat*.", comp=[VS(("Au prix affiché", ["Payée 6 700 €", "**89 €**\nde marge"]), ("Au prix conseillé", ["Payée 6 250 €", "**539 €**\nde marge"]))],
    credit=DEMO)]),
car('Q13', 'trois-criteres', "Liste courte (choisir sa voiture)", "Ta 1re voiture à revendre : 3 critères, pas un de plus",
    "Un moteur fiable, un prix sous le marché, des papiers complets. Les trois sortent d'une seule analyse.", T_DEB, [
  HERO('cle-fob', "Ta 1re voiture à revendre", "*3 critères*,\npas un de plus.", pos='50% 40%'),
  S(title="Les *3*.", comp=[LIST(("Un moteur fiable", "la note de l'analyse", 'moteur'), ("Un prix sous le marché", "comparé aux annonces similaires", 'prix'),
                                 ("Des papiers complets", "CT, carnet, factures", 'doc'))]),
  S(title="Les 3, en\n*un lien*.", comp=[PILLS(("Moteur 8/10", 'ok'), ("425 € sous le marché", 'ok'), ("Distribution à contrôler", 'warn'))], credit=PREUVE)],
    valeur=V_CLIO),
car('Q14', 'deux-heures-par-soir', "Douleur (temps perdu)", "2 heures par soir sur Leboncoin, et aucune voiture achetée",
    "Tu ne sais pas laquelle vaut le coup. Colle les liens, garde les GO, appelle seulement ceux-là.", T_DEB, [
  HERO('telephone-rue', "Tous les soirs, 2 h sur Leboncoin", "Et *aucune* voiture\nachetée."),
  S(title="Laquelle\n*vaut le coup* ?", comp=[ROWS(("Clio IV · 6 700 €", "?", 'neu', 'lien'), ("Yaris · 10 999 €", "?", 'neu', 'lien'), ("208 · 7 190 €", "?", 'neu', 'lien'))]),
  S(title="Colle les liens.\nAppelle la *bonne*.", comp=[ROWS(("Clio IV", "Bon prix", 'ok', 'check'), ("Yaris", "Trop cher", 'warn', 'alerte'), ("208", "Déconseillée", 'bad', 'x'))],
    credit=PREUVES)]),
car('Q15', 'vendredi-soir', "Histoire (planning du week-end)", "Vendredi soir, 3 annonces, un seul samedi : laquelle aller voir",
    "Tu colles les 3 liens le vendredi, tu vas voir la seule qui passe le samedi.", T_DEB, [
  HERO('autoroute-coucher', "Vendredi soir", "3 annonces.\nUn seul *samedi*."),
  S(title="Ton *vendredi*.", comp=[TL(("21 h", "tu colles les 3 liens"), ("21 h 05", "2 NO GO, 1 GO", 'v'), ("Samedi 10 h", "tu vas voir la bonne", 'v'))]),
  S(title="Ton samedi\nn'est pas *perdu*.", comp=[VS(("Sans analyse", ["3 visites", "2 pour rien"]), ("Avec l'analyse", ["1 visite", "la bonne"]))])]),
car('Q16', 'quiz-moteur-fiable', "Quiz vrai ou faux", "Vrai ou faux : un moteur fiable, c'est une bonne affaire ?",
    "Faux. Cette Yaris a un moteur noté 8/10, et elle est 2 949 € au-dessus du marché.", T_PIEGE, [
  HERO('tableau-de-bord', "Vrai ou faux ?", "« Moteur fiable =\n*bonne affaire*. »"),
  S(title="*Faux*.", body="Cette Yaris à 10 999 € :", comp=[GAUGES((8, "Moteur 1.33 VVT-i", "fiable")), PILLS(("2 949 € au-dessus du marché", 'bad'))], credit=PREUVE),
  S(title="Il faut\n*les deux*.", comp=[STAMP(ROWS(("Moteur fiable", "oui", 'ok', 'moteur'), ("Prix sous le marché", "non", 'bad', 'prix'), lab="La Yaris à 10 999 €"),
                                               "Trop cher", 'warn')], credit=PREUVE)], valeur=V_YARIS),
car('Q17', 'quiz-prix-affiche', "Quiz vrai ou faux", "Vrai ou faux : le prix affiché, c'est le prix du marché ?",
    "Faux. Yaris affichée 10 999 €, prix du marché 8 350 € d'après l'analyse.", T_PIEGE, [
  HERO('billets-eventail', "Vrai ou faux ?", "« Prix affiché =\nprix du *marché*. »"),
  S(title="*Faux*.", comp=[R_YARIS], body2="Cette Yaris est affichée bien au-dessus.", credit=PREUVE),
  S(title="Le marché se\n*calcule*.", comp=[LIST(("Même modèle", None, 'loupe'), ("Même âge, à 2 ans près", None, 'cal'), ("Kilométrage proche", None, 'jauge'))],
    body2="Sur les annonces comparables en vente.")], valeur=V_YARIS),
car('Q18', 'litre-huile', "Moteur à éviter", "1.2 TCe 115 et 120 : un litre d'huile aux 1 000 km",
    "Clio 4, Captur, Mégane 3, de fin 2012 à mi-2016 : consommation d'huile, jusqu'à 10 000 € de moteur.", T_PIEGE, [
  HERO('jauge-huile', "Clio 4, Captur, Mégane 3", "Un litre d'huile\naux *1 000 km*."),
  S(title="Le *1.2 TCe*\n115 et 120.", body="Fin 2012 à mi-2016 : soupapes abîmées, parfois la casse.",
    comp=[STAMP(BIG("10 000 €", cap="au pire, le moteur.", tone='r'), "À éviter", 'bad')], credit=COUTS),
  S(title="L'analyse note\nchaque *moteur*.", comp=[GAUGES((8, "Clio 0.9 TCe 90", "fiable"), (4, "208 1.2 PureTech", "à éviter"))], credit=PREUVES)]),
car('Q19', 'trois-etapes', "Démonstration de l'outil", "Analyser une annonce de voiture en 3 étapes, en une minute",
    "Tu colles le lien Leboncoin, La Centrale ou AutoScout24. L'analyse lit l'annonce, tu as ton verdict.", T_DEB, [
  HERO('cles-voiture-blanche', "Ta prochaine voiture", "*3 étapes*,\nune minute.", pos='50% 30%'),
  S(title="Comment ça\n*marche*.", comp=[TL(("1 · Tu colles le lien", "Leboncoin, La Centrale ou AutoScout24"),
                                             ("2 · L'analyse lit l'annonce", "prix, moteur, défauts, photos"),
                                             ("3 · Tu as ton verdict", "marge, prix d'offre, prix max", 'v'))]),
  S(title="Tu appelles\n*avec un chiffre*.", comp=[ISLAND("Analyse terminée : GO", 'ok'), CHAT(["m", "Bonjour, je vous propose 6 250 €."])], credit=PREUVE)]),
car('Q20', 'point-faible', "Commentaires (participation)", "Dis-moi ta voiture, je te dis son point faible",
    "PureTech, TCe 120, 1.4 TSI, EcoBoost : chaque moteur a son point faible. Écris ton modèle en commentaire.", T_DEB, [
  HERO('parking-occasions', "Dis-moi ta voiture", "Je te dis\nson *point faible*."),
  S(title="Quelques\n*exemples*.", comp=[ROWS(("208 1.2 PureTech", "courroie", 'bad txt', 'moteur'), ("Clio 4 1.2 TCe 120", "huile", 'bad txt', 'goutte'),
                                                 ("Golf 6 1.4 TSI", "chaîne", 'bad txt', 'outil'), ("Fiesta 1.0 EcoBoost", "surchauffe", 'bad txt', 'temp'))], credit=COUTS),
  S(title="Écris ton modèle\nen *commentaire*.", comp=[CHAT(["m", "Clio 4, 1.2 TCe 120, 2014", "Ton commentaire"])],
    body2="Et colle l'annonce sur le site pour la note du moteur.")]),
]
