"""Les 10 séries (10 carrousels chacune) et les carrousels écrits. Les accroches suivent le skill art-du-hook :
une scène, un chiffre, une perte ou un écart, en 3 à 8 mots à l'écran."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'carousels-conversion'))
from app20 import (S, ROWS, PILLS, TICKET, VS, CHAT, LIST, TL, QUOTE, BIG, ISLAND, RULER, GAUGES, STACK, BARS, PRINTS, STAMP, CREDITS,
                   PREUVE, DEMO)

CC = '../carousels-conversion/'
def HERO(photo, kicker, title, pos='50% 45%'):
    a = CREDITS[photo]['auteur']
    return S(hero=dict(src=f'{CC}photos/{photo}.webp', pos=pos), top=800, kicker=kicker, title=title, swipe="Glisse →",
             credit=f"Photo : {a + ', ' if a else ''}Pexels")
def ANN(src, t, p, pos='50% 50%', ph=380):
    return dict(k='listing', src=CC + src, t=t, m=None, p=p, l=None, note=None, nx=None, ny=None, n=3, pos=pos, island=None, ph=ph, vraie=True)
COUTS = "Coûts relevés dans la presse auto et chez des propriétaires"
JUR = "Information générale, pas un conseil juridique"

T_DEB = ['#achatreventevoiture', '#debutant', '#voitureoccasion']
T_PIEGE = ['#arnaque', '#voitureoccasion', '#leboncoin']
T_ARG = ['#achatrevente', '#revenucomplementaire', '#voitureoccasion']

# ———— le plan : 10 séries × 10 (accroche de l'image 1 ; « ✓ » = écrit et rendu) ————
SERIES = {
 'S1': ("Ta 1re voiture", "épisodes 1 à 10, dans l'ordre", [
   "3 000 € de côté. La voiture : 2 600 €.", "Une 208 à 7 190 €. Moteur noté 4/10.", "30 annonces par soir. Une seule à appeler.",
   "10 minutes, 30 annonces, 3 à garder.", "5 questions au téléphone, avant 200 km de route.", "20 minutes sur place. Dans cet ordre.",
   "10 minutes d'essai : ce que tu écoutes.", "Elle est à 6 700 €. Tu proposes 6 250 €.", "4 papiers, ou tu repars sans la voiture.",
   "Achetée 6 250 €. Elle doit partir à 7 550 €."]),
 'S2': ("L'annonce décodée", "une phrase d'annonce par épisode", [
   "« Prix ferme. » Et tu négocies quand même.", "« Distribution faite. » Sans facture ?", "« Première main » : demande la carte grise.",
   "« Voyant allumé, juste un capteur. »", "« Cause départ » : le vendeur est pressé.", "« Jamais accidentée » : l'HistoVec dit autre chose ?",
   "« CT OK. » Daté de quand ?", "« Révisée » : la facture dit quoi ?", "« Petit frottement » sur la photo 6.", "« Pas sérieux s'abstenir. »"]),
 'S3': ("Vrai ou faux", "tu réponds en commentaire avant de glisser", [
   "« Vendue en l'état » : aucun recours.", "Petit kilométrage = bonne affaire.", "CT sans défaut = voiture sans défaut.",
   "Plus elle est chère, plus elle est fiable.", "Une voiture gagée, ça s'achète sans risque.", "Acheter pour revendre, souvent : tu es commerçant.",
   "Le kilométrage de l'HistoVec remonte à 2021.", "Le voyant s'est éteint : c'est réparé.", "L'âge d'un pneu se lit sur son flanc.",
   "Une voiture en contre-visite peut se vendre."]),
 'S4': ("Les arnaques", "une arnaque par épisode, à enregistrer", [
   "« Un acompte de 300 € pour la réserver. »", "La capture du virement. Pas l'argent.", "Le lien « paiement sécurisé » par SMS.",
   "Le chèque de banque du samedi soir.", "89 000 km au compteur, 162 000 au CT.", "Même modèle, même plaque, deux voitures.",
   "La carte grise n'est pas à son nom.", "« Je suis à l'étranger, le transporteur livre. »", "40 % sous le prix du marché.",
   "« J'ai payé trop, remboursez la différence. »"]),
 'S5': ("La marge, leçon par leçon", "le calcul complet en 10 leçons", [
   "1 300 € d'écart. Il te reste 539 €.", "186 € de carte grise dans ta marge.", "78 € de CT, et la contre-visite.",
   "300 km pour une voiture : 120 €.", "Un choc sur l'aile : 425 €.", "Revendue 12 000 € : 1 476 € pour l'URSSAF.",
   "Ta marge minimum : 800 €.", "Ton prix max : 7 500 €.", "45 jours dans ta cour.", "La formule complète, à enregistrer."]),
 'S6': ("Les mots du métier", "un mot par épisode", [
   "Affichée 6 700 €. Son prix réel : 7 125 €.", "Le non-gage : 2 minutes, gratuit.", "Le code de cession.", "L'HistoVec.",
   "La contre-visite.", "Courroie ou chaîne : 400 € d'écart.", "Le volant moteur bi-masse.", "« Véhicule endommagé » sur l'HistoVec.",
   "Le certificat de cession.", "Les annonces comparables."]),
 'S7': ("Les phrases à dire", "le message ou la phrase exacte, à copier", [
   "« Toujours dispo ? » ne t'apprend rien.", "Demander l'HistoVec sans vexer.", "« Vous avez les factures ? »",
   "« Je vous propose 6 250 €, le choc est à reprendre. »", "« Pourquoi vous la vendez ? »", "« C'est quoi votre dernier prix ? »",
   "Dire non sans fermer la porte.", "Le rendez-vous : où et quand.", "Le paiement : la phrase à dire.", "Quand c'est toi qui revends."]),
 'S8': ("Revendre mieux", "de l'achat à la revente", [
   "8 photos. Dans cet ordre.", "Le titre d'annonce qui fait cliquer.", "La description en 5 lignes.", "Prix affiché, prix plancher.",
   "Le nettoyage avant les photos.", "Répondre en 10 minutes.", "L'essai : toi au volant d'abord ?", "Les papiers à remettre.",
   "Quand baisser le prix.", "Le jour de la vente, dans l'ordre."]),
 'S9': ("GO ou NO GO ?", "ton verdict en commentaire, la réponse à l'image 3", [
   "Clio IV à 6 700 €.", "208 PureTech à 7 190 €.", "Yaris à 10 999 €.", "Cas d'école : affichée 3 400 €.", "Cas d'école : affichée 5 200 €.", "Cas d'école : sans facture de distribution.",
   "Cas d'école : en contre-visite.", "Cas d'école : gros kilométrage.", "Cas d'école : petit budget.", "Cas d'école : ta revente."]),
 'S10': ("Les chiffres à connaître", "un chiffre par épisode", [
   "CT de 7 mois : tu dois le refaire pour vendre.", "15 jours pour déclarer la vente.", "1 mois pour la carte grise.",
   "0 jour de rétractation entre particuliers.", "4 ans : le premier CT.", "1,6 mm : la limite d'un pneu.",
   "135 € : rouler avec un CT dépassé.", "2 ans pour agir sur un vice caché.", "Chez un pro : 2 ans de garantie.", "2 annonces gratuites par an."]),
}

def FOLLOW(title, nxt, items, ask, btn="Abonne-toi pour la suite"):
    return S(title=title), dict(lab=nxt, items=[list(i) for i in items], ask=ask, btn=btn)

def car(id_, slug, serie, titre, legende, tags, slides, fin):
    assert len(titre) <= 90, titre
    end, follow = FOLLOW(*fin)
    return dict(id=id_, slug=slug, serie=serie, car=None, offer=None, follow=follow, titre=titre, legende=legende, tags=tags, slides=slides + [end])

CAROUSELS = [
# ——— S1 · Ta 1re voiture, épisode 1 ———
car('V001', 'budget-3000', "S1 Ta 1re voiture, épisode 1/10", "Ta 1re voiture à revendre avec 3 000 € : combien sur la voiture",
    "Garde une réserve pour la carte grise, le CT et la surprise du premier mois. Épisode 1 sur 10.", T_DEB, [
  HERO('tirelire', "Ta 1re voiture, épisode 1", "3 000 € de côté.\nLa voiture : *2 600 €*."),
  S(title="Les *400 €*\nque tu gardes.", comp=[STACK("3 000 €", ("La voiture", 2600, "2 600 €", 'a'), ("Carte grise", 186, "186 €", 'f'), ("Contrôle technique", 78, "78 €", 'f2'),
                                                    ("Imprévu", 136, "136 €", 'f3'), lab="Ton budget")],
    credit="Carte grise : Clio 5 CV de plus de 10 ans en Île-de-France. CT : prix moyen 2026"),
  S(title="Pourquoi\n*pas tout* ?", comp=[LIST(("La carte grise", "à payer dans le mois", 'doc'), ("Le CT", "s'il a plus de 6 mois quand tu revends", 'check'),
                                              ("Une surprise", "batterie, pneu, plaquettes", 'outil'))]),
  S(title="La règle\nà *enregistrer*.", comp=[ROWS(("Ton budget", "3 000 €", 'neu', 'euro'), ("Ta réserve", "400 €", 'warn', 'bouclier'), ("Prix max de la voiture", "2 600 €", 'ok', 'plafond'))])],
  ("Épisode 2 :\n*le moteur*.", "Dans l'épisode 2", (("Les moteurs notés 4/10 à éviter", 'moteur'), ("Celui d'une vraie Clio : 8/10", 'check')),
   "Tu démarres avec combien ? Dis-le, je te dis quoi viser.")),
# ——— S2 · L'annonce décodée ———
car('V002', 'distribution-faite', "S2 L'annonce décodée, phrase 2", "« Distribution faite » dans une annonce : sans facture, ça ne vaut rien",
    "Sans facture datée, compte la distribution à refaire dans ton prix. La phrase à dire au vendeur est à l'image 4.", T_DEB, [
  HERO('moteur-atelier', "L'annonce décodée", "« Distribution faite. »\nSans *facture* ?", pos='55% 50%'),
  S(title="Sans facture,\ncompte-la *à refaire*.", comp=[BIG("400 à 800 €", cap="le prix d'une distribution,\nselon le moteur.", tone='r')], credit=COUTS),
  S(title="Ce qu'il\nte *faut*.", comp=[LIST(("La facture", "avec la date", 'doc'), ("Le kilométrage du jour", "écrit dessus", 'jauge'),
                                           ("Le nom du garage", "pour l'appeler si besoin", 'tel'))]),
  S(title="Ta phrase\n*au vendeur*.", comp=[CHAT(["m", "Vous avez la facture de la distribution ? Sinon, je dois la compter dans mon prix."])])],
  ("Épisode suivant :\n*« Première main »*.", "Dans le prochain épisode", (("Ce que ça veut dire vraiment", 'doc'), ("Le vérifier en une minute", 'loupe')),
   "Une phrase d'annonce que tu ne comprends pas ? Écris-la.")),
# ——— S3 · Vrai ou faux ———
car('V003', 'vendue-en-l-etat', "S3 Vrai ou faux, n°1", "« Vendue en l'état » : le vendeur n'est plus responsable de rien ? Vrai ou faux",
    "Faux en partie : la clause tient entre particuliers, sauf si le vendeur connaissait le défaut (Code civil, art. 1641 et 1643).", T_DEB, [
  HERO('vieille-rouillee', "Vrai ou faux ?", "« Vendue en l'état » :\n*aucun recours*.", pos='50% 55%'),
  S(title="Ta réponse\n*en commentaire*.", body="Vrai ou faux ? Écris-le avant de glisser.", comp=[PILLS(("Vrai", 'neu'), ("Faux", 'neu'))]),
  S(title="*Faux*,\nen partie.", body="Entre particuliers, la clause est valable. Sauf si le vendeur connaissait le défaut.",
    credit="Code civil, art. 1641 et 1643"),
  S(title="Ce qui te\n*protège*.", comp=[LIST(("Le défaut était caché", "pas visible à l'essai ni au CT", 'loupe'), ("Il existait avant la vente", None, 'cal'),
                                             ("Le vendeur le connaissait", "et ne l'a pas dit", 'alerte'))],
    body2="À prouver : garde l'annonce et les messages.", credit=JUR)],
  ("Vrai ou faux\n*n°2*.", "La prochaine affirmation", (("« Petit kilométrage = bonne affaire. »", 'jauge'),),
   "Vrai ou faux ? Réponds maintenant, la réponse arrive au prochain épisode.")),
# ——— S4 · Les arnaques ———
car('V004', 'arnaque-acompte', "S4 Les arnaques, n°1", "L'arnaque à l'acompte : « envoyez 300 € pour la réserver »",
    "Annonce sous le prix du marché, vendeur pressé, acompte avant la visite. Tu ne paies rien avant d'avoir vu la voiture et ses papiers.", T_PIEGE, [
  HERO('carte-telephone', "Arnaque n°1", "« Un acompte de 300 €\npour la *réserver*. »", pos='50% 45%'),
  S(title="Le *scénario*.", comp=[TL(("Lundi", "une annonce sous le prix du marché"), ("Mardi", "« beaucoup de demandes, envoyez un acompte »", 'x'),
                                     ("Mercredi", "plus de réponse, plus d'annonce", 'x'))]),
  S(title="La règle :\n*rien avant la visite*.", comp=[LIST(("Tu vois la voiture", "et ses papiers", 'loupe'), ("Tu lis l'HistoVec", "demandé au vendeur", 'doc'),
                                                            ("Tu paies le jour J", "virement instantané, vu sur ton appli", 'banque'))]),
  S(title="Les *signaux*.", comp=[STAMP(ROWS(("Prix très bas", "alerte", 'bad txt', 'prix'), ("Vendeur pressé", "alerte", 'bad txt', 'horloge'),
                                              ("Pas de visite possible", "stop", 'bad txt', 'x'), lab="Si tu en vois un"), "Arnaque", 'bad')])],
  ("Arnaque n°2 :\n*la capture*.", "Dans le prochain épisode", (("La capture de virement qui ne prouve rien", 'image'), ("Comment vérifier en 10 secondes", 'banque')),
   "On t'a déjà demandé un acompte ? Raconte.", "Abonne-toi, ne te fais pas avoir")),
# ——— S5 · La marge, leçon 1 ———
car('V005', 'marge-brute-nette', "S5 La marge, leçon 1/10", "Marge brute, marge nette : 1 300 € d'écart, il te reste 539 €",
    "Sur une vraie Clio : achetée 6 250 €, revendue au prix du marché 7 550 €. Après le choc, la carte grise et les frais, il reste 539 €.", T_ARG, [
  HERO('voiture-jouet-pieces', "La marge, leçon 1", "1 300 € d'écart.\nIl te reste *539 €*.", pos='50% 50%'),
  S(title="La marge\n*brute*.", comp=[TICKET(("Revente au prix du marché", "7 550 €"), ("Achat au prix conseillé", "− 6 250 €"), tot="1 300 €", totLab="Brute")], credit=DEMO),
  S(title="La marge\n*nette*.", comp=[STACK("7 550 €", ("Achat", 6250, "6 250 €", 'a'), ("Choc", 425, "425 €", 'f'), ("Carte grise", 186, "186 €", 'f2'),
                                            ("CT, nettoyage, annonce", 150, "150 €", 'f3'), ("Ta marge", 539, "539 €", 'm'), lab="Revente")], credit=DEMO),
  S(title="À *enregistrer*.", comp=[ROWS(("Marge brute", "revente − achat", 'neu txt', 'euro'), ("Les frais", "réparations, carte grise, CT", 'warn txt', 'outil'),
                                         ("Marge nette", "ce qu'il te reste", 'ok txt', 'check'))])],
  ("Leçon 2 :\n*la carte grise*.", "Dans la leçon 2", (("Le calcul, cheval par cheval", 'calc'), ("Pourquoi elle coûte 2 fois moins après 10 ans", 'cal')),
   "Ta 1re marge, c'était combien ? Brute ou nette ?")),
# ——— S6 · Les mots du métier ———
car('V006', 'prix-reel', "S6 Les mots du métier, n°1", "Le prix réel d'une voiture d'occasion : le prix affiché, plus les réparations",
    "Vraie Clio IV affichée 6 700 € avec un choc sur l'aile : prix réel 7 125 €, encore 425 € sous le marché.", T_DEB, [
  HERO('loupe', "Les mots du métier", "Affichée 6 700 €.\nSon *prix réel* : 7 125 €.", pos='50% 40%'),
  S(title="Le *prix réel*.", comp=[TICKET(("Prix affiché", "6 700 €"), ("Choc sur l'aile", "+ 425 €"), tot="7 125 €", totLab="Prix réel")], credit=PREUVE),
  S(title="À comparer\nau *marché*.", comp=[RULER(6400, 7800, (6700, "6 700 €", "Prix affiché", '', 'b'), (7125, "7 125 €", "Prix réel", 'o', 'h'),
                                                   (7550, "7 550 €", "Prix du marché", '', 'b'), band=(7125, 7550))],
    body2="425 € sous le marché : bon prix.", credit=PREUVE),
  S(title="Les 3 prix\nà *ne pas confondre*.", comp=[ROWS(("Prix affiché", "ce qu'il demande", 'neu txt', 'prix'), ("Prix réel", "+ les réparations", 'warn txt', 'outil'),
                                                          ("Prix du marché", "les annonces comparables", 'ok txt', 'loupe'))])],
  ("Mot n°2 :\n*le non-gage*.", "Dans le prochain épisode", (("Ce que c'est", 'bouclier'), ("Le demander en 2 minutes, gratuit", 'doc')),
   "Un mot du métier que tu ne comprends pas ? Écris-le.")),
# ——— S7 · Les phrases à dire ———
car('V007', 'premier-message', "S7 Les phrases à dire, n°1", "Le premier message au vendeur : arrête « toujours dispo ? »",
    "Le message rédigé par l'analyse pour une vraie annonce. Modèle, CT, HistoVec, avant de te déplacer. À copier.", T_DEB, [
  HERO('sms-pouces', "Les phrases à dire", "« Toujours dispo ? »\nne t'apprend *rien*.", pos='50% 50%'),
  S(title="Le message\nqui *trie*.", comp=[CHAT(["m", "Bonjour, je suis intéressé par cette Yaris Dynamic. Avez-vous le CT et l'HistoVec à jour ? Je souhaite valider l'historique d'entretien avant de me déplacer."])],
    credit="Message rédigé par l'analyse pour une vraie annonce du 3 octobre 2026"),
  S(title="Pourquoi\nil *marche*.", comp=[LIST(("Le modèle exact", "il voit que tu as lu l'annonce", 'loupe'), ("Le CT et l'HistoVec", "les papiers avant le trajet", 'doc'),
                                               ("Avant de te déplacer", "pas 200 km pour rien", 'route'))]),
  S(title="À *copier*.", comp=[QUOTE("Bonjour, je suis intéressé par votre ==[modèle]==. Avez-vous le CT et l'HistoVec à jour ? Je souhaite valider l'historique avant de me déplacer.",
                                     lab="Enregistre ce message :")])],
  ("Phrase n°2 :\n*l'HistoVec*.", "Dans le prochain épisode", (("Le demander sans vexer le vendeur", 'chat'), ("Ce que tu lis dedans en 1 minute", 'doc')),
   "Colle ton dernier message à un vendeur, je te dis quoi changer.")),
# ——— S8 · Revendre mieux ———
car('V008', 'huit-photos', "S8 Revendre mieux, n°1", "Revendre ta voiture : les 8 photos de l'annonce, dans l'ordre",
    "4 dehors, 4 dedans, en plein jour, voiture lavée. Enregistre-le pour ta prochaine revente.", T_ARG, [
  HERO('audi-coucher', "Revendre mieux", "8 photos.\nDans *cet ordre*.", pos='45% 55%'),
  S(title="Les 4 de\n*l'extérieur*.", comp=[LIST(("3/4 avant", "la photo de couverture", 'photo'), ("3/4 arrière", None, 'photo'), ("Profil", None, 'photo'),
                                                  ("Une roue et son pneu", None, 'pneu'))]),
  S(title="Les 4 de\n*l'intérieur*.", comp=[LIST(("Tableau de bord", "compteur allumé", 'jauge'), ("Sièges avant", None, 'image'), ("Banquette et coffre", None, 'image'),
                                                  ("Carnet et factures", None, 'doc'))]),
  S(title="Les *règles*.", comp=[ROWS(("Plein jour", "sans flash", 'ok txt', 'eclat'), ("Voiture lavée", "intérieur compris", 'ok txt', 'eclat'),
                                      ("Plaque cachée", "toujours", 'ok txt', 'bouclier'))])],
  ("Épisode suivant :\n*le titre d'annonce*.", "Dans le prochain épisode", (("Les 4 infos à mettre dans le titre", 'doc'), ("Celle qui fait cliquer", 'eclat')),
   "Tu revends quoi en ce moment ? Modèle et prix.")),
# ——— S9 · GO ou NO GO ———
car('V009', 'go-nogo-208', "S9 GO ou NO GO, n°2", "GO ou NO GO : Peugeot 208 PureTech à 7 190 €, 116 789 km",
    "Vraie annonce du 3 octobre 2026. Donne ton verdict en commentaire avant de glisser. La réponse est à l'image 3.", T_DEB, [
  S(kicker="GO ou NO GO ?", title="208 PureTech,\n*7 190 €*.", comp=[ANN('img/208-4.webp', "Peugeot 208 PureTech", "7 190 €", pos='50% 62%')], swipe="Glisse →"),
  S(title="Ton verdict\n*en commentaire*.", body="GO ou NO GO ? Écris-le avant de glisser.",
    comp=[ROWS(("Année", "2016", 'neu txt', 'cal'), ("Kilométrage", "116 789 km", 'neu txt', 'jauge'), ("Moteur", "1.2 PureTech 110", 'neu txt', 'moteur'))], credit=PREUVE),
  S(title="*NO GO*.", comp=[STAMP(GAUGES((4, "1.2 PureTech 110", "courroie dans l'huile")), "Déconseillée", 'bad')], credit=PREUVE),
  S(title="Son vrai\n*prix*.", comp=[STACK("8 840 €", ("Prix affiché", 7190, "7 190 €", 'a'), ("Pneus, freins, révision, courroie", 1650, "1 650 €", 'p'), lab="Prix réel")],
    body2="Le marché : 5 950 €.", credit=PREUVE)],
  ("Épisode suivant :\n*une Yaris à 10 999 €*.", "Le prochain verdict", (("Moteur noté 8/10, garantie 12 mois", 'moteur'), ("GO ou NO GO ?", 'alerte')),
   "Tu avais dit GO ? Dis-le, personne ne juge.")),
# ——— S10 · Les chiffres à connaître ———
car('V010', 'ct-six-mois', "S10 Les chiffres à connaître, n°1", "Vendre une voiture : le contrôle technique doit dater de moins de 6 mois",
    "Voiture de plus de 4 ans vendue à un particulier : CT de moins de 6 mois remis avant la vente (Code de la route, R323-22).", T_DEB, [
  HERO('pont-elevateur', "Le chiffre à connaître", "CT de 7 mois.\nTu dois le *refaire*.", pos='40% 50%'),
  S(comp=[BIG("6 mois", cap="l'âge maximum du CT\nquand tu vends.", tone='o')], credit="Code de la route, art. R323-22"),
  S(title="Les\n*conditions*.", comp=[LIST(("Voiture de plus de 4 ans", None, 'cal'), ("Vendue à un particulier", None, 'doc'),
                                           ("Contre-visite : dans les 2 mois", "après le contrôle", 'outil'))], credit=JUR),
  S(title="Dans ta\n*marge*.", comp=[ROWS(("Contrôle technique", "78 €", 'warn', 'check'), ("Contre-visite", "si défauts", 'warn txt', 'outil'))],
    body2="Compte-le si ton CT aura plus de 6 mois à la revente.", credit="CT : prix moyen 2026")],
  ("Chiffre n°2 :\n*15 jours*.", "Dans le prochain épisode", (("Le délai pour déclarer la vente", 'cal'), ("Ce qui arrive si tu oublies", 'alerte')),
   "Ton CT a quel âge ? Réponds, je te dis s'il faut le refaire.")),
]

# vagues suivantes
from vague2 import VAGUE2
CAROUSELS += VAGUE2
from vague3 import VAGUE3
CAROUSELS += VAGUE3
from vague4 import VAGUE4
CAROUSELS += VAGUE4
from vague5 import VAGUE5
CAROUSELS += VAGUE5
