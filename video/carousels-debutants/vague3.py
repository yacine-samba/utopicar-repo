"""Vague 3 : V031 à V050. Faits vérifiés : pas de rétractation entre particuliers (vices cachés : 2 ans après la découverte,
Code civil 1641 et 1648 ; tromperie), 1er CT dans les 6 mois avant les 4 ans puis tous les 2 ans, défaillance majeure ou
critique et contre-visite sous 2 mois, faux chèques de banque, choc de carrosserie chiffré 150 à 700 € par l'analyse (demo.ts).
Cas d'école : toutes les hypothèses sont écrites sur l'image."""
from series import (S, ROWS, PILLS, TICKET, VS, CHAT, LIST, TL, QUOTE, BIG, RULER, GAUGES, STACK, BARS, STAMP, HERO, car,
                    COUTS, JUR, T_DEB, T_PIEGE, T_ARG, PREUVE, DEMO)
from app20 import PREUVES, R_CLIO
from vague2 import VF, NOPAS
EX = "Cas d'école : hypothèses écrites sur l'image, pas une vraie annonce"

def CAS(id_, slug, n, affiche, revente, frais, mini, verdict_slides, titre, legende, suite):
    pmax = revente - frais - mini
    f = lambda v: f"{v:,}".replace(',', ' ') + " €"
    return car(id_, slug, f"S9 GO ou NO GO, cas d'école n°{n}", titre, legende, T_DEB, [
      S(kicker="GO ou NO GO ? Cas d'école", title=f"Affichée\n*{f(affiche)}*.", comp=[ROWS(("Revente estimée", f(revente), 'neu', 'prix'), ("Frais à prévoir", f(frais), 'warn', 'outil'),
                                                                                          ("Ta marge minimum", f(mini), 'neu', 'euro'), lab="Les hypothèses")], swipe="Glisse →", credit=EX),
      S(title="Ton verdict\n*en commentaire*.", body=f"GO ou NO GO à {f(affiche)} ? Calcule avant de glisser.",
        comp=[TICKET(("Revente estimée", f(revente)), ("Frais", "− " + f(frais)), ("Ta marge minimum", "− " + f(mini)), tot="?", totLab="Ton prix max")]),
      *verdict_slides(pmax, f)], suite)

VAGUE3 = [
# ——— S1 · Ta 1re voiture, épisodes 4 et 5 ———
car('V031', 'trier-10-minutes', "S1 Ta 1re voiture, épisode 4/10", "Trier 30 annonces de voitures en 10 minutes : ce que tu lis d'abord",
    "Prix, moteur, kilométrage : 3 lignes suffisent pour fermer 27 annonces sur 30. Épisode 4 sur 10.", T_DEB, [
  HERO('laptop-nuit', "Ta 1re voiture, épisode 4", "10 minutes, 30 annonces.\n*3 à garder*.", pos='60% 45%'),
  S(title="Les 3 lignes\nà *lire d'abord*.", comp=[LIST(("Le prix", "au-dessus de ton prix max : fermée", 'plafond'), ("Le moteur", "noté bas : fermée", 'moteur'),
                                                        ("Le kilométrage et l'année", "hors de tes filtres : fermée", 'jauge'))]),
  S(title="Fermée\n*tout de suite*.", comp=[ROWS(("Pas de photo du compteur", "fermée", 'bad txt', 'image'), ("« Vendue en l'état », sans détail", "fermée", 'bad txt', 'doc'),
                                                 ("Prix très bas, sans raison", "fermée", 'bad txt', 'alerte'))]),
  S(title="Les 3 qui\n*restent*.", comp=[TL(("21 h", "30 annonces ouvertes"), ("21 h 10", "27 fermées", 'x'), ("21 h 11", "3 à analyser", 'v'))])],
  ("Épisode 5 :\n*l'appel*.", "Dans l'épisode 5", (("5 questions avant 200 km de route", 'tel'),),
   "Sur 30 annonces, tu en gardes combien ?")),
car('V032', 'appel-5-questions', "S1 Ta 1re voiture, épisode 5/10", "Appeler le vendeur : 5 questions avant de faire 200 km",
    "Depuis quand, distribution, CT, défauts, HistoVec. Et ce que tu écoutes dans ses réponses. Épisode 5 sur 10.", T_DEB, [
  HERO('telephone-sombre', "Ta 1re voiture, épisode 5", "5 questions au téléphone.\nAvant *200 km* de route.", pos='50% 45%'),
  S(title="Les *5 questions*.", comp=[LIST(("Depuis quand vous l'avez ?", None, 'cal'), ("Distribution faite, avec facture ?", None, 'moteur'), ("Le CT a quelle date ?", None, 'check'),
                                           ("Des défauts pas dans l'annonce ?", None, 'alerte'), ("Vous pouvez m'envoyer l'HistoVec ?", None, 'doc'))]),
  S(title="Ce que tu\n*écoutes*.", comp=[LIST(("Il hésite", "sur une date ou une facture", 'alerte'), ("Il change de sujet", None, 'x'),
                                              ("Il te presse", "« un autre acheteur vient demain »", 'horloge'))]),
  S(title="Ta *règle*.", comp=[ROWS(("Réponses claires", "tu y vas", 'ok txt', 'route'), ("Réponses floues", "tu passes", 'bad txt', 'x'))])],
  ("Épisode 6 :\n*la visite*.", "Dans l'épisode 6", (("20 minutes sur place, dans l'ordre", 'loupe'),),
   "Tu poses quelle question en premier au téléphone ?")),
# ——— S2 · L'annonce décodée ———
car('V033', 'voyant-capteur', "S2 L'annonce décodée, phrase 4", "« Voyant allumé, juste un capteur » : ce que dit vraiment l'annonce",
    "Petit capteur ou vraie panne : sans lecture des codes défaut, personne ne sait. La phrase à dire est à l'image 4.", T_DEB, [
  HERO('bouton-demarrage', "L'annonce décodée", "« Voyant allumé,\njuste un *capteur*. »", pos='40% 50%'),
  S(title="Peut-être.\n*Ou pas*.", body="Un voyant moteur peut venir d'un petit capteur ou d'une vraie panne. Sans diagnostic, personne ne sait."),
  S(title="Ce qu'il\nte *faut*.", comp=[LIST(("La lecture des codes défaut", "au garage, avec une valise", 'outil'), ("Le code écrit", "pas « rien de grave »", 'doc'),
                                             ("Le prix de la réparation", "avant ton offre", 'euro'))]),
  S(title="Ta *phrase*.", comp=[CHAT(["m", "Vous avez fait lire le code défaut ? Sans diagnostic, je dois compter une réparation dans mon prix."])])],
  ("Épisode suivant :\n*« Cause départ »*.", "Dans le prochain épisode", (("Le vendeur pressé, et ce que tu en fais", 'horloge'),),
   "Tu achèterais avec un voyant allumé ? Oui ou non ?")),
car('V034', 'cause-depart', "S2 L'annonce décodée, phrase 5", "« Cause départ » dans une annonce : le vendeur a une date limite",
    "Tu es disponible vite, tu paies le jour même, tu fais une offre juste. Et tu vérifies tout quand même.", T_DEB, [
  HERO('cartons', "L'annonce décodée", "« Cause départ. »\nLe vendeur est *pressé*.", pos='50% 50%'),
  S(title="Ce que ça\n*veut dire*.", body="Il a une date limite. Toi, tu as du temps."),
  S(title="Comment\n*t'en servir*.", comp=[LIST(("Tu es disponible vite", "« je peux venir demain »", 'cal'), ("Tu paies le jour même", "virement instantané", 'banque'),
                                                 ("Tu fais une offre juste", "avec une raison", 'chat'))]),
  S(title="Mais *vérifie*\ntout.", comp=[ROWS(("HistoVec", "toujours", 'ok txt', 'doc'), ("Non-gage", "moins de 15 jours", 'ok txt', 'bouclier'),
                                              ("Pressé à l'excès", "attention", 'bad txt', 'alerte'))])],
  ("Épisode suivant :\n*« Jamais accidentée »*.", "Dans le prochain épisode", (("Ce que l'HistoVec en dit", 'doc'),),
   "Tu as déjà acheté à quelqu'un qui déménageait ? Raconte.")),
# ——— S3 · Vrai ou faux ———
car('V035', 'chere-fiable', "S3 Vrai ou faux, n°4", "Plus une voiture d'occasion est chère, plus elle est fiable ? Vrai ou faux",
    "Faux : sur deux vraies annonces, la 208 à 7 190 € a un moteur noté 4/10, la Clio à 6 700 € un moteur noté 8/10.", T_DEB, [
  HERO('showroom', "Vrai ou faux ?", "Plus elle est chère,\nplus elle est *fiable*.", pos='50% 60%'),
  VF(),
  S(title="*Faux*.", body="La plus chère des deux a le moteur le moins fiable.",
    comp=[ROWS(("Clio IV, 6 700 €", "8/10", 'ok', 'moteur'), ("208 PureTech, 7 190 €", "4/10", 'bad', 'moteur'))], credit=PREUVES),
  S(title="La fiabilité,\nc'est *ça*.", comp=[LIST(("Le moteur", "sa note", 'moteur'), ("L'entretien", "les factures", 'doc'), ("Le kilométrage", "vérifié à l'HistoVec", 'jauge'))])],
  ("Vrai ou faux\n*n°5*.", "La prochaine affirmation", (("« Une voiture gagée, ça s'achète sans risque. »", 'banque'),),
   "Vrai ou faux ? Réponds maintenant, la réponse arrive au prochain épisode.")),
car('V036', 'voiture-gagee', "S3 Vrai ou faux, n°5", "Acheter une voiture gagée, c'est sans risque ? Vrai ou faux",
    "Faux : un gage peut bloquer ta carte grise tant qu'il n'est pas levé. Le non-gage de moins de 15 jours, avant de payer.", T_DEB, [
  HERO('factures-calcul', "Vrai ou faux ?", "Une voiture gagée,\nça s'achète *sans risque*.", pos='50% 50%'),
  VF(),
  S(title="*Faux*.", body="Un gage peut bloquer ta carte grise tant qu'il n'est pas levé."),
  S(title="Avant de\n*payer*.", comp=[LIST(("Le non-gage", "moins de 15 jours", 'bouclier'), ("S'il y a un gage", "la mainlevée du créancier", 'doc'),
                                           ("Pas de document", "pas d'achat", 'x'))], credit=JUR)],
  ("Vrai ou faux\n*n°6*.", "La prochaine affirmation", (("« Acheter pour revendre, souvent : tu es commerçant. »", 'prix'),),
   "Vrai ou faux ? Réponds maintenant, la réponse arrive au prochain épisode.")),
# ——— S4 · Les arnaques ———
car('V037', 'arnaque-cheque-banque', "S4 Les arnaques, n°4", "L'arnaque au faux chèque de banque du samedi soir",
    "Tu appelles la banque qui l'a émis, avec un numéro trouvé par toi, aux heures d'ouverture. Ou virement instantané.", T_PIEGE, [
  HERO('cheque', "Arnaque n°4", "Le chèque de banque\ndu *samedi soir*.", pos='50% 45%'),
  S(title="Le *scénario*.", comp=[TL(("Samedi 19 h", "il paie par chèque de banque"), ("Samedi 19 h 30", "il repart avec la voiture", 'x'), ("Lundi", "ta banque : le chèque est faux", 'x'))]),
  S(title="La *règle*.", comp=[LIST(("Appelle la banque qui l'a émis", "numéro trouvé par toi, pas sur le chèque", 'tel'), ("Aux heures d'ouverture", "pas le samedi soir", 'horloge'),
                                    ("Ou virement instantané", "vu sur ton appli", 'banque'))]),
  S(title="Les *signaux*.", comp=[STAMP(ROWS(("Rendez-vous banque fermée", "alerte", 'bad txt', 'horloge'), ("Chèque déjà rempli", "alerte", 'bad txt', 'doc'),
                                              ("« Mon cousin passera »", "alerte", 'bad txt', 'alerte'), lab="Si tu vois ça"), "Arnaque", 'bad')])],
  ("Arnaque n°5 :\n*le compteur*.", "Dans le prochain épisode", (("89 000 km au compteur, 162 000 au CT", 'jauge'),),
   "On t'a déjà proposé un chèque de banque ? Raconte.", NOPAS)),
car('V038', 'arnaque-compteur', "S4 Les arnaques, n°5", "Compteur trafiqué : 89 000 km dans l'annonce, 162 000 au dernier CT",
    "L'HistoVec montre le kilométrage de chaque CT depuis 2021. Les factures et l'usure confirment.", T_PIEGE, [
  HERO('route-orange', "Arnaque n°5", "89 000 km au compteur.\n*162 000* au CT.", pos='50% 60%'),
  S(title="Le *scénario*.", comp=[TL(("L'annonce", "« 89 000 km, très bon état »"), ("L'HistoVec", "dernier CT : 162 000 km", 'x'), ("La vérité", "73 000 km effacés", 'x'))],
    credit="Exemple"),
  S(title="Comment\n*vérifier*.", comp=[LIST(("L'HistoVec", "le kilométrage à chaque CT depuis 2021", 'doc'), ("Les factures", "le kilométrage écrit dessus", 'outil'),
                                             ("L'usure", "volant, pédales, siège", 'loupe'))]),
  S(title="Si ça\n*ne colle pas*.", comp=[ROWS(("Kilométrage qui baisse", "stop", 'bad txt', 'jauge'), ("Pas d'HistoVec", "stop", 'bad txt', 'x'))],
    body2="Un compteur trafiqué peut faire annuler la vente.", credit=JUR)],
  ("Arnaque n°6 :\n*la fausse plaque*.", "Dans le prochain épisode", (("Même modèle, même plaque, deux voitures", 'alerte'),),
   "Tu vérifies le kilométrage à l'HistoVec ? Oui ou non ?", NOPAS)),
# ——— S5 · La marge ———
car('V039', 'marge-trajet', "S5 La marge, leçon 4/10", "Le trajet dans ta marge : 300 km pour voir une voiture, 120 €",
    "600 km aller-retour à 0,20 € du kilomètre. Et s'il n'y a rien à acheter, tu repars avec 120 € de moins.", T_ARG, [
  HERO('plein-vert', "La marge, leçon 4", "300 km pour une voiture :\n*120 €*.", pos='55% 50%'),
  S(title="Le *calcul*.", comp=[TICKET(("Aller-retour", "600 km"), ("Coût au kilomètre", "× 0,20 €"), tot="120 €", totLab="Trajet", tone='r')],
    credit="Coût au kilomètre utilisé par défaut par l'analyse"),
  S(title="Si tu repars\n*sans la voiture*.", comp=[BIG("− 120 €", cap="un samedi pour rien.", tone='r')]),
  S(title="Ta *règle*.", comp=[LIST(("L'appel avant le trajet", "les 5 questions", 'tel'), ("L'HistoVec avant le trajet", None, 'doc'),
                                    ("Le trajet dans ta marge", "0,20 € du kilomètre", 'route'))])],
  ("Leçon 5 :\n*les réparations*.", "Dans la leçon 5", (("Un choc sur l'aile : 425 €", 'outil'),),
   "Tu fais combien de km au maximum pour voir une voiture ?")),
car('V040', 'marge-reparations', "S5 La marge, leçon 5/10", "Les réparations dans ta marge : un choc sur l'aile chiffré 425 €",
    "Sur une vraie annonce, l'analyse lit le défaut, le chiffre de 150 à 700 €, retient 425 €, et le met dans ta marge.", T_ARG, [
  HERO('capot-homme', "La marge, leçon 5", "Un choc sur l'aile :\n*425 €*.", pos='60% 40%'),
  S(title="Lu dans\n*l'annonce*.", comp=[QUOTE("« Seulement 57 840 km, 2 pneus avant neufs. Distribution à contrôler. À signaler : ==un choc sur le passage de roue avant gauche==. Vendu en l'état. »",
                                               lab="La vraie annonce :")], credit=PREUVE),
  S(title="Chiffré en\n*fourchette*.", comp=[BIG("150 à 700 €", cap="un choc de carrosserie.\nL'analyse retient 425 €.", tone='o')], credit=PREUVE),
  S(title="Dans ta\n*marge*.", comp=[STACK("7 550 €", ("Achat", 6250, "6 250 €", 'a'), ("Choc", 425, "425 €", 'f'), ("Carte grise", 186, "186 €", 'f2'),
                                             ("CT, nettoyage, annonce", 150, "150 €", 'f3'), ("Ta marge", 539, "539 €", 'm'), lab="Revente")], credit=DEMO)],
  ("Leçon 6 :\n*l'URSSAF*.", "Dans la leçon 6", (("Revendue 12 000 € : 1 476 €", 'banque'),),
   "Tu chiffres les défauts avant d'appeler ? Oui ou non ?")),
# ——— S6 · Les mots du métier ———
car('V041', 'histovec', "S6 Les mots du métier, n°4", "L'HistoVec : le rapport officiel et gratuit sur l'historique d'une voiture",
    "Les CT depuis 2021, les propriétaires, gage, opposition, vol, véhicule endommagé. Seul le titulaire peut le générer.", T_DEB, [
  HERO('bloc-calculatrice', "Les mots du métier", "L'*HistoVec* :\ngratuit et officiel.", pos='50% 50%'),
  S(title="C'est\n*quoi* ?", body="Le rapport officiel sur l'historique d'une voiture. Seul le titulaire de la carte grise peut le générer."),
  S(title="Ce qu'il\n*contient*.", comp=[LIST(("Les CT", "date, résultat, kilométrage, depuis 2021", 'check'), ("Les propriétaires", "avec les dates", 'doc'),
                                              ("La situation", "gage, opposition, vol", 'bouclier'), ("Véhicule endommagé", "les procédures", 'alerte'))]),
  S(title="Ce qu'il\n*ne dit pas*.", comp=[ROWS(("L'entretien", "les factures", 'warn txt', 'outil'), ("L'état du moteur", "l'essai", 'warn txt', 'moteur'))])],
  ("Mot n°5 :\n*la contre-visite*.", "Dans le prochain épisode", (("2 mois pour réparer", 'outil'),),
   "Tu as déjà lu un HistoVec ? Oui ou non ?")),
car('V042', 'contre-visite', "S6 Les mots du métier, n°5", "La contre-visite au contrôle technique : 2 mois pour réparer",
    "Défaillance majeure : contre-visite dans les 2 mois. Défaillance critique : la voiture ne roule plus après le jour du contrôle.", T_DEB, [
  HERO('mecano-moteur', "Les mots du métier", "*Contre-visite* :\n2 mois pour réparer.", pos='50% 50%'),
  S(title="C'est\n*quoi* ?", body="Le second passage au CT, après la réparation des défaillances majeures ou critiques."),
  S(title="*Majeure*\nou critique.", comp=[LIST(("Défaillance majeure", "contre-visite dans les 2 mois", 'alerte'),
                                                ("Défaillance critique", "elle ne roule plus après le jour du contrôle", 'x'))]),
  S(title="Si tu achètes\n*en contre-visite*.", comp=[LIST(("Les réparations", "en général pour toi", 'outil'), ("Le délai", "2 mois après le contrôle", 'cal'),
                                                           ("Ton prix", "réparations comptées dedans", 'euro'))], credit=JUR)],
  ("Mot n°6 :\n*courroie ou chaîne*.", "Dans le prochain épisode", (("Deux distributions, deux budgets", 'moteur'),),
   "Tu achèterais une voiture en contre-visite ? Oui ou non ?")),
# ——— S7 · Les phrases à dire ———
car('V043', 'faire-son-offre', "S7 Les phrases à dire, n°4", "Faire ton offre au vendeur : un chiffre précis, une raison, un ton calme",
    "« Je vous propose 6 250 €, le choc est à reprendre. » Le chiffre vient de l'analyse d'une vraie annonce.", T_DEB, [
  HERO('cles-poignee-concession', "Les phrases à dire", "« Je vous propose 6 250 €,\nle choc est à *reprendre*. »", pos='50% 45%'),
  S(title="Pourquoi\nelle *marche*.", comp=[LIST(("Un chiffre précis", "pas « vous faites combien ? »", 'euro'), ("Une raison", "le défaut écrit dans l'annonce", 'alerte'),
                                                 ("Un ton calme", "pas « c'est trop cher »", 'chat'))]),
  S(title="Le chiffre\n*vient d'où* ?", comp=[R_CLIO], credit=PREUVE),
  S(title="S'il\n*contre*.", comp=[CHAT(["v", "6 500, pas moins."], ["m", "Je comprends. 6 350 et je vous paie maintenant, par virement instantané."])])],
  ("Phrase n°5 :\n*« Pourquoi vous la vendez ? »*", "Dans le prochain épisode", (("Les réponses normales, et celles à creuser", 'chat'),),
   "Tu proposes combien sous le prix affiché, d'habitude ?")),
car('V044', 'pourquoi-vous-la-vendez', "S7 Les phrases à dire, n°5", "« Pourquoi vous la vendez ? » : les réponses à creuser",
    "« J'en ai acheté une autre », c'est normal. « Elle consomme un peu », c'est à creuser. La phrase pour le demander est à l'image 4.", T_DEB, [
  HERO('garagiste-cles', "Les phrases à dire", "« Pourquoi vous\nla *vendez* ? »", pos='50% 45%'),
  S(title="Les réponses\n*normales*.", comp=[ROWS(("« J'en ai acheté une autre »", "normal", 'ok txt', 'check'), ("« On a un 2e enfant »", "normal", 'ok txt', 'check'),
                                                  ("« Je déménage »", "normal", 'ok txt', 'check'))]),
  S(title="Les réponses\n*à creuser*.", comp=[ROWS(("« Elle consomme un peu »", "huile ?", 'warn txt', 'goutte'), ("« Je n'ai plus le temps »", "entretien ?", 'warn txt', 'outil'),
                                                   ("« Pour rien »", "pourquoi ?", 'warn txt', 'alerte'))]),
  S(title="Ta *phrase*.", comp=[CHAT(["m", "Elle vous a posé un souci ces derniers mois ? Je préfère le savoir avant, je ne vous en voudrai pas."])])],
  ("Phrase n°6 :\n*le dernier prix*.", "Dans le prochain épisode", (("« C'est quoi votre dernier prix ? »", 'prix'),),
   "La pire réponse qu'on t'ait donnée à cette question ?")),
# ——— S8 · Revendre mieux ———
car('V045', 'prix-plancher', "S8 Revendre mieux, n°4", "Revendre ta voiture : prix affiché et prix plancher, la marge entre les deux",
    "Affiché au prix du marché, 7 550 € pour la Clio. Plancher : achat, frais et ta marge minimum. Entre les deux, tu négocies.", T_ARG, [
  HERO('etiquette', "Revendre mieux", "Affiché *7 550 €*.\nTon plancher : 7 311 €.", pos='50% 50%'),
  S(title="Le prix\n*affiché*.", comp=[BIG("7 550 €", cap="le prix du marché de la Clio,\nles annonces comparables.", tone='o')], credit=PREUVE),
  S(title="Ton prix\n*plancher*.", comp=[TICKET(("Achat", "6 250 €"), ("Choc, carte grise, CT, annonce", "+ 761 €"), ("Ta marge minimum", "+ 300 €"),
                                                 tot="7 311 €", totLab="Plancher")], credit="Exemple : marge minimum de 300 €"),
  S(title="Entre les deux,\n*tu négocies*.", comp=[RULER(7100, 7700, (7311, "7 311 €", "Ton plancher", 'bad', 'b'), (7550, "7 550 €", "Affiché", 'ok', 'h'),
                                                          band=(7311, 7550))], body2="Sous le plancher, tu dis non.")],
  ("Épisode suivant :\n*le nettoyage*.", "Dans le prochain épisode", (("Avant les photos, pas après", 'eclat'),),
   "Tu fixes ton prix plancher avant de publier ? Oui ou non ?")),
car('V046', 'nettoyage', "S8 Revendre mieux, n°5", "Nettoyer ta voiture avant les photos de l'annonce : la liste",
    "Intérieur, extérieur, et ce que tu enlèves. Enregistre-la pour ta prochaine revente.", T_ARG, [
  HERO('aspirateur-siege', "Revendre mieux", "Lavée *avant*\nles photos.", pos='50% 50%'),
  S(title="L'*intérieur*.", comp=[LIST(("Aspirateur", "sièges, tapis, coffre", 'eclat'), ("Tableau de bord", "poussière et traces", 'jauge'), ("Vitres", "dedans et dehors", 'image'))]),
  S(title="L'*extérieur*.", comp=[LIST(("Carrosserie lavée", None, 'eclat'), ("Jantes", None, 'pneu'), ("Photos au sec", "pas sous la pluie", 'photo'))]),
  S(title="Ce que tu\n*enlèves*.", comp=[ROWS(("Objets perso", "tout", 'ok txt', 'x'), ("Désodorisant fort", "il cache une odeur", 'warn txt', 'alerte'))])],
  ("Épisode suivant :\n*répondre en 10 minutes*.", "Dans le prochain épisode", (("Les acheteurs qui partent si tu tardes", 'horloge'),),
   "Tu laves toi-même ou tu payes un lavage ?")),
# ——— S9 · GO ou NO GO, cas d'école ———
CAS('V047', 'cas-ecole-3400', 1, 3400, 4000, 600, 400,
    lambda pmax, f: [
      S(title=f"*NO GO*\nà 3 400 €.", comp=[STACK("4 000 €", ("Ton prix max", pmax, f(pmax), 'a'), ("Frais", 600, "600 €", 'f'), ("Ta marge minimum", 400, "400 €", 'm'), lab="Revente estimée")], credit=EX),
      S(title=f"*GO*\nà {f(pmax)}.", body="Tu proposes 3 000 €, avec une raison. Au-dessus, tu passes.",
        comp=[RULER(2800, 3600, (3000, "3 000 €", "Ton prix max", 'ok', 'b'), (3400, "3 400 €", "Affichée", 'bad', 'h'), band=(3000, 3400, None, 'bad'))])],
    "GO ou NO GO : citadine affichée 3 400 €, revente estimée 4 000 €",
    "Cas d'école : 600 € de frais, 400 € de marge minimum. Ton prix max ? Calcule en commentaire avant de glisser.",
    ("Épisode suivant :\n*cas d'école n°2*.", "Le prochain verdict", (("Affichée 5 200 €", 'prix'),), "Tu avais trouvé 3 000 € ? Dis-le.")),
CAS('V048', 'cas-ecole-5200', 2, 5200, 6500, 700, 500,
    lambda pmax, f: [
      S(title="*GO*.", body="100 € sous ton prix max.", comp=[STACK("6 500 €", ("Achat", 5200, "5 200 €", 'a'), ("Frais", 700, "700 €", 'f'), ("Ta marge", 600, "600 €", 'm'), lab="Revente estimée")],
        credit=EX),
      S(title=f"Ton prix max :\n*{f(pmax)}*.", comp=[TICKET(("Revente estimée", "6 500 €"), ("Frais", "− 700 €"), ("Ta marge minimum", "− 500 €"), tot=f(pmax), totLab="Prix max", tone='g')],
        body2="Tu peux même proposer moins.")],
    "GO ou NO GO : affichée 5 200 €, revente estimée 6 500 €",
    "Cas d'école : 700 € de frais, 500 € de marge minimum. Ton prix max ? Calcule en commentaire avant de glisser.",
    ("Épisode suivant :\n*cas d'école n°3*.", "Le prochain verdict", (("Une voiture sans facture de distribution", 'moteur'),), "Tu avais dit GO ? Dis-le.")),
# ——— S10 · Les chiffres à connaître ———
car('V049', 'zero-retractation', "S10 Les chiffres à connaître, n°4", "Acheter une voiture à un particulier : 0 jour de rétractation",
    "Pas de délai pour changer d'avis entre particuliers. Restent le vice caché (2 ans après la découverte), la tromperie, l'accord amiable.", T_DEB, [
  HERO('justice-livres', "Le chiffre à connaître", "*0 jour* de rétractation\nentre particuliers.", pos='50% 50%'),
  S(comp=[BIG("0 jour", cap="pour changer d'avis après\nun achat à un particulier.", tone='r')], credit=JUR),
  S(title="Ce qui reste\n*possible*.", comp=[LIST(("Le vice caché", "2 ans après sa découverte", 'loupe'), ("La tromperie", "un compteur trafiqué", 'jauge'),
                                                  ("Un accord avec le vendeur", "à l'amiable", 'chat'))], credit="Code civil, art. 1641 et 1648"),
  S(title="Donc, *avant*\nde signer.", comp=[LIST(("L'HistoVec", None, 'doc'), ("Les factures", None, 'outil'), ("L'essai", None, 'route'))])],
  ("Chiffre n°5 :\n*4 ans*.", "Dans le prochain épisode", (("L'âge du premier CT", 'check'),),
   "Tu pensais avoir 14 jours ? Oui ou non ?")),
car('V050', 'quatre-ans-premier-ct', "S10 Les chiffres à connaître, n°5", "4 ans : l'âge du premier contrôle technique, puis tous les 2 ans",
    "Premier CT dans les 6 mois avant les 4 ans de la voiture, puis tous les 2 ans. Pour vendre : CT de moins de 6 mois.", T_DEB, [
  HERO('capot-vw', "Le chiffre à connaître", "*4 ans* :\nle premier CT.", pos='40% 50%'),
  S(comp=[BIG("4 ans", cap="le premier CT, dans les 6 mois\navant les 4 ans de la voiture.", tone='o')]),
  S(title="Pour toi\nqui *achètes*.", comp=[LIST(("Moins de 4 ans", "pas encore de CT", 'cal'), ("Plus de 4 ans, à la revente", "CT de moins de 6 mois", 'check'))]),
  S(title="À *retenir*.", comp=[ROWS(("1er CT", "avant les 4 ans", 'neu txt', 'cal'), ("Ensuite", "tous les 2 ans", 'neu txt', 'horloge'),
                                     ("Pour vendre", "moins de 6 mois", 'ok txt', 'check'))])],
  ("Chiffre n°6 :\n*1,6 mm*.", "Dans le prochain épisode", (("La limite légale d'un pneu", 'pneu'),),
   "Ta voiture a quel âge ? Je te dis quand tombe son CT.")),
]
