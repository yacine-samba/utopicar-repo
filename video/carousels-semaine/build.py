"""Carrousels de la semaine, en deux variantes à comparer (A/B), tirés de la veille TikTok d'octobre 2026
(docs/veille_tiktok_oct2026.md). Une seule audience : les débutants qui veulent se lancer en achat-revente auto.

  Variante A : 7 carrousels débutants, 1 par jour (semaine du 12 octobre).
  Variante B : 21 carrousels, 3 par jour, 2 débutants + 1 pour la messagerie automatique Leboncoin (semaine du 19).

Piliers repris de la veille : « à éviter » (moteurs, montant perdu), annonce Leboncoin décryptée, arnaque à partager,
série « Ta 1re revente » (budget, durée, résultat, suite), liste à enregistrer, histoire POV à envoyer au pote.
Accroches écrites avec le skill « art-du-hook » (scène + chiffre dès l'image 1), textes passés au skill « stop-slop ».
Histoires POV inventées (jamais présentées comme vraies) ; défauts moteurs et coûts : brief-mo8.md (sources citées) ;
messagerie : ce que fait réellement l'option Messages Leboncoin (supabase/functions/messages, EspaceMessages.tsx).

Pour chaque publication : titre TikTok (90 caractères max), légende courte, 3 hashtags max, images.
→ carousels.json (lu par slide.html), legendes.md (calendrier + textes à copier), calendrier.csv,
  et renders/carousels-semaine/<id-slug>/post.txt à côté des images.
usage : python carousels-semaine/build.py            (textes seulement)
        python carousels-semaine/build.py --rendu    (textes + images, via scripts/render-carousels.mjs)"""
import csv, datetime as dt, json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); VIDEO = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(VIDEO, 'carousels-v3'))
from common import S, LIST, ROWS, PILLS, QUOTE, TICKET, VERDICT, CHAT, BIG, VS, TL

def LISTING(src, t, m, p, l, note=None, nx=None, ny=None, n=8, cut=False):
    return dict(k='listing', src=src, t=t, m=m, p=p, l=l, note=note, nx=nx, ny=ny, n=n, cut=cut)
def THOUGHT(t, lab='Dans ta tête :', size=None): return dict(k='thought', t=t, lab=lab, size=size)
def SPLIT(a, b): return dict(k='split', a=list(a), b=list(b))
def STATS(*items): return dict(k='stats', items=[list(i) for i in items])
def BIGO(v, cap=None): return dict(k='big', v=v, cap=cap, tone='o')
def BIGR(v, cap=None): return dict(k='big', v=v, cap=cap, tone='r')

# Photos : vraie annonce de Clio 4 TCe (plaque floutée) et voitures détourées de Wikimedia Commons (voir brief-mo8.md)
CLIO_ANNONCE = '../assets/demo/clio-2.webp'
_CREDITS = {'bmw': 'Photo Wikimedia Commons : Tokumeigakarinoaoshima, CC0',
            'golf': 'Photo Wikimedia Commons : Thomas doerfer, CC BY 3.0, détourée',
            'fiesta': 'Photo Wikimedia Commons : M 93, CC BY-SA 3.0 DE, détourée',
            'clio': 'Photo Wikimedia Commons : OSX, domaine public',
            'p208': 'Photo Wikimedia Commons : OSX, domaine public'}
def CAR(k): return dict(src=f'img/car-{k}.webp', credit=_CREDITS[k])
COUTS = "Coûts : ordres de grandeur relevés dans la presse auto et chez des propriétaires"

# Fins de carrousel : le geste demandé (commenter, envoyer, enregistrer, revenir pour la suite)
GUIDE = "Ta première revente, étape par étape"
CTA = {'DÉBUTANT': f"Commente DÉBUTANT et je t'envoie le guide « {GUIDE} ».",
       'MESSAGE': "Commente MESSAGE et je t'envoie en privé comment l'activer."}
AFTER = {'MESSAGE': "je t'envoie en privé\n*comment l'activer*"}
def COMMENT(title, word='DÉBUTANT'): return dict(title=title, word=word)
def SHARE(title, lead, k, sub, sign=''): return dict(title=title, share=(lead, k, sub, sign))

# 3 hashtags maximum, choisis par pilier dans les hashtags de la niche relevés par la veille
TAGS = {'eviter': ['#achatreventevoiture', '#voitureoccasion', '#debutant'],
        'annonce': ['#achatrevente', '#leboncoinvoiture', '#debutant'],
        'arnaque': ['#arnaque', '#leboncoinvoiture', '#voitureoccasion'],
        'serie': ['#achatreventeauto', '#revenucomplementaire', '#debutant'],
        'pov': ['#achatrevente', '#voitureoccasion', '#debutant'],
        'liste': ['#voitureoccasion', '#achatrevente', '#debutant'],
        'budget': ['#achatreventeauto', '#revenucomplementaire', '#debutant'],
        'outil': ['#achatreventevoiture', '#leboncoinvoiture', '#marchandauto']}

POSTS = {}
def post(slug, pilier, hook, titre, legende, question, slides, end, tags=None):
    """hook = famille d'accroche (skill art-du-hook) ; titre = champ « Titre » de TikTok ; legende = description ;
    question = relance en commentaire (facultative) ; end = COMMENT(...) ou SHARE(...)."""
    POSTS[slug] = dict(slug=slug, pilier=pilier, hook=hook, titre=titre, legende=legende, question=question,
                       slides=slides, end=end, tags=tags or TAGS[pilier])

MSG_OUTIL = "Bonjour, votre Clio est-elle toujours disponible ? Je peux me déplacer rapidement."

# ════════════════════════════ Variante A : débutants, 1 par jour ════════════════════════════

post('5-moteurs-a-fuir', 'eviter', "Scène chiffrée (perte) + liste en compte à rebours",
     "5 moteurs à fuir pour ta 1re revente (jusqu'à 10 000 € de facture)",
     "Avant d'acheter ta première voiture à revendre, lis la ligne moteur de l'annonce. Ces 5 moteurs, "
     "aux années indiquées, peuvent coûter plus cher que la voiture. Coûts relevés dans la presse auto et chez des propriétaires.",
     "Tu en ajoutes un sixième ?", [
  S(kicker="5 moteurs à fuir en achat-revente", title="Clio à 5 900 €.\nJusqu'à *10 000 €*\nde moteur.", car=CAR('clio')),
  S(kicker="N° 5 · 1.6 N13 · 2011 à 2015", title="BMW *116i*",
    body="La chaîne de distribution s'allonge. Moteur froid, tu l'entends claquer.",
    comp=[PILLS(("Jusqu'à 5 000 €", 'bad'))], car=CAR('bmw'), credit=COUTS),
  S(kicker="N° 4 · 1.4 TSI 122 et 160 ch · 2008 à 2012", title="Golf *6*",
    body="Chaîne et tendeur fragiles, pistons sur le 160 ch. Même moteur sur Polo et Scirocco.",
    comp=[PILLS(("Jusqu'à 7 000 €", 'bad'))], car=CAR('golf'), credit=COUTS),
  S(kicker="N° 3 · 1.0 EcoBoost · 2011 à 2018", title="Fiesta et *Focus*",
    body="Il chauffe, puis le joint de culasse cède.",
    comp=[PILLS(("Jusqu'à 7 000 €", 'bad'))], car=CAR('fiesta'), credit=COUTS),
  S(kicker="N° 2 · 1.2 TCe 115 et 120 · fin 2012 à mi-2016", title="Clio *4*",
    body="Il boit plus d'un litre d'huile aux 1 000 km. Même moteur sur Captur et Mégane 3.",
    comp=[PILLS(("Jusqu'à 10 000 €", 'bad'))], car=CAR('clio'), credit=COUTS),
  S(kicker="N° 1 · 1.2 PureTech · 2013 à mi-2022", title="Peugeot *208*",
    body="La courroie baigne dans l'huile et s'effrite. Ses débris bouchent la crépine.",
    comp=[PILLS(("Courroie : 400 à 600 €", 'warn'), ("Sinon : le moteur", 'bad'))], car=CAR('p208'), credit=COUTS),
], SHARE("Le 6e,\ntu le *connais* ?", "Enregistre", "la liste", "et sors-la devant chaque annonce."))

post('golf-perte-1200', 'annonce', "Scène chiffrée : résultat impossible (+300 € sur le papier, −1 200 € réels)",
     "Golf achetée 9 500 €, revendue 9 800 €, et 1 200 € de perte",
     "Achat-revente voiture : sur cette Golf, tu gagnes 300 € sur le papier et tu paies 1 500 € de frais. "
     "Le bon prix d'achat était 7 500 €, calculé avant d'appeler le vendeur.",
     "Tu comptais combien de frais, toi ?", [
  S(kicker="Golf achetée 9 500 €, revendue 9 800 €", title="Et tu perds\n*1 200 €*.", car=CAR('golf')),
  S(title="Sur le papier,\ntu gagnes *300 €*.",
    comp=[TICKET(("Revente", "9 800 €"), ("Achat", "− 9 500 €"), tot="+ 300 €", totLab="Écart", tone='g')]),
  S(title="Puis tu paies\nles *frais*.",
    comp=[TICKET(("Remise en état, scénario prudent", "1 100 €"), ("Carte grise, 5 CV", "186 €"),
                 ("Trajet, 128 km aller-retour", "64 €"), ("CT, nettoyage, annonce", "150 €"),
                 tot="1 500 €", totLab="Frais", tone='r')]),
  S(title="Il te *reste*", comp=[BIGR("−1 200 €", "une fois les frais payés.")]),
  S(title="Ton prix max\nétait *7 500 €*.",
    comp=[TICKET(("Revente", "9 800 €"), ("Frais", "− 1 500 €"), ("Ta marge minimum", "− 800 €"),
                 tot="7 500 €", totLab="Prix max")],
    body2="Il demande 9 500 € ? Tu passes à l'annonce suivante."),
], COMMENT("Ce calcul, *avant*\nchaque appel."))

post('faux-paiement-securise', 'arnaque', "Scène + résultat impossible (il achète sans voir), partage pour protéger",
     "Il achète ta voiture sans la voir : l'arnaque au faux paiement sécurisé",
     "Tu vends ta voiture sur Leboncoin. Un acheteur la prend sans visite, puis un SMS t'annonce 3 900 € reçus. "
     "Le lien ouvre une fausse page qui te demande ta carte bancaire.",
     "Envoie-le à ton pote qui vend sa voiture.", [
  S(kicker="Tu vends ta 207 à 3 900 €", title="Il l'achète\n*sans la voir*.",
    comp=[CHAT(["v", "Bonjour, je la prends sans visite. Je paie par le paiement sécurisé.", "Un acheteur · 21:14"])]),
  S(title="Puis un *SMS*\narrive.",
    comp=[QUOTE("Paiement de 3 900 € reçu. Validez vos coordonnées bancaires pour le recevoir : ==ouvrir le lien==",
                lab="SMS · 21:31")]),
  S(title="Le lien veut\nta *carte*.",
    comp=[ROWS(("Numéro de carte", "demandé", 'bad'), ("Date et cryptogramme", "demandés", 'bad'),
               ("Test de 0,01 €", "« pour valider »", 'warn'), lab="La page du lien")]),
  S(comp=[SPLIT(("Ce que tu crois", "3 900 € reçus."), ("Ce qui se passe", "Un inconnu a ta carte."))],
    glow=('50% 100%', .3)),
  S(title="Tes *règles*",
    comp=[LIST(("Pour recevoir de l'argent, personne n'a besoin de ta carte.",),
               ("Un paiement se vérifie dans l'appli, ouverte par toi.",),
               ("L'acheteur veut quitter la messagerie ? Tu arrêtes.",))]),
], SHARE("Carte donnée ?\nFais-la *opposer*.", "Envoie ça à", "ton pote", "qui vend sa voiture."))

# Série « Ta 1re revente » : même voiture, mêmes chiffres d'une partie à l'autre.
# Clio 4 TCe 90 de 2016 annoncée 7 400 € · revente estimée 8 300 € · frais 640 € · marge minimum 600 € → prix max 7 060 €
# achetée 7 000 € · annoncée 8 490 € · vendue 8 300 € · il reste 660 € · 12 jours
post('ta-1re-revente-1', 'serie', "Résultat d'abord (budget, gain, durée) + suite annoncée",
     "Ta 1re revente, partie 1 : une Clio 4 à 7 400 €, ton plafond à 7 060 €",
     "Partie 1 sur 3. Tu as 8 000 € et zéro expérience en achat-revente voiture. Avant d'appeler le vendeur, "
     "tu calcules ton prix max : 7 060 €. Il en demande 7 400.",
     "Tu aurais proposé combien ?", [
  S(hero=dict(src=CLIO_ANNONCE, pos='50% 45%', tag=("7 400 €", "7 000 €"), tx=560, ty=300), top=800,
    kicker="POV : ta 1re revente · partie 1", title="8 000 € en poche.\n*+660 €* en 12 jours."),
  S(title="Jour 1 :\nl'*annonce*.",
    comp=[QUOTE("Clio 4 TCe 90, 2016, 112 000 km. ++CT fait il y a 2 mois.++ Entretien à jour. 7 400 €, à débattre.",
                lab="L'annonce")],
    body2="Le 0.9 TCe 90 ne figure pas dans la liste des moteurs à fuir."),
  S(title="Avant d'appeler,\nton *prix max*.",
    comp=[TICKET(("Revente estimée", "8 300 €"), ("Frais prévus", "− 640 €"), ("Ta marge minimum", "− 600 €"),
                 tot="7 060 €", totLab="Prix max")]),
  S(title="Au *téléphone*.",
    comp=[CHAT(["m", "Je peux passer demain matin. Je vous propose 6 700 €."], ["v", "7 000 et elle est à vous."],
               ["m", "Avec le carnet et le double des clés ?"], ["v", "Les deux."])]),
  S(title="Jour 1, 18 h.", comp=[BIGO("7 000 €", "Tu achètes, 60 € sous ton plafond.")]),
], SHARE("Il reste\nà la *revendre*.", "Partie 2", "samedi", "640 € de frais, puis 5 jours sans un appel."))

post('trajet-300-euros', 'pov', "POV : gain qui s'annule (300 € de négo, 312 € de trajet), à envoyer au pote",
     "Tu gagnes 300 € en négo et tu rentres à −12 €",
     "POV : la Clio est à Marseille, toi à Lille. Tu arraches 300 € au vendeur, puis tu paies le train, le gazole "
     "et les péages du retour. En achat-revente voiture, compte le trajet avant d'appeler.",
     "Ton plus long trajet pour une voiture ?", [
  S(kicker="POV : tu habites Lille, la Clio est à Marseille", title="Tu gagnes *300 €*\nen négo.",
    comp=[CHAT(["v", "Allez, 3 900 au lieu de 4 200.", "Le vendeur · Marseille"])]),
  S(title="Ton *samedi*.",
    comp=[TL(("6 h 12", "TGV Lille → Marseille"), ("11 h 40", "Visite, essai, 300 € de remise", 'v'),
             ("12 h 30", "Tu signes et tu prends la route"), ("23 h 10", "Lille, enfin"))]),
  S(title="1 000 km\nde *retour*.",
    comp=[TICKET(("Train aller", "118 €"), ("Gazole, 1 000 km", "96 €"), ("Péages", "87 €"),
                 ("Sandwich et café", "11 €"), tot="312 €", totLab="Trajet", tone='r')]),
  S(title="Le *bilan*.",
    comp=[STATS(("−12 €", "ta négo, trajet payé", True), ("15 h", "de train et de route"), ("0", "voiture revendue")),
          THOUGHT("Et je dois encore la revendre.", size=58)]),
], SHARE("Le trajet se compte\n*avant* l'appel.", "Envoie ça à", "ton pote", "qui fait 1 000 km pour 300 €."))

post('ta-1re-revente-2', 'serie', "Scène chiffrée + attente (5 jours, zéro appel), suite annoncée",
     "Ta 1re revente, partie 2 : 640 € de frais et 5 jours sans un appel",
     "Partie 2 sur 3. La Clio est à toi pour 7 000 €. Tu paies 640 € de frais, tu publies à 8 490 €, "
     "et ton téléphone reste muet 5 jours. Tu ne touches pas au prix.",
     "Tu baisses le prix, toi ?", [
  S(kicker="POV : ta 1re revente · partie 2", title="Annonce à 8 490 €.\n*5 jours*, zéro appel.",
    comp=[LISTING(CLIO_ANNONCE, "Renault Clio 4 TCe 90", "2016 · 112 000 km · Essence · Manuelle", "8 490 €",
                  "En ligne depuis 5 jours · 0 message", note="0 appel", nx=430, ny=520)]),
  S(title="Jour 2 :\nles *frais*.",
    comp=[TICKET(("Carte grise, 5 CV", "290 €"), ("2 pneus avant", "160 €"), ("Plaquettes avant", "90 €"),
                 ("Nettoyage", "40 €"), ("Trajet du jour 1", "60 €"), tot="640 €", totLab="Frais")],
    body2="Pile le budget prévu."),
  S(title="Jour 3 :\nton *annonce*.",
    comp=[QUOTE("Clio 4 très bon état, CT OK. 8 490 €. ==Pas sérieux s'abstenir.==", lab="Ce que tu publies")]),
  S(title="Jours 4 à 8.", comp=[BIG("0", "message en 5 jours"), THOUGHT("Je baisse à 7 990 ?", size=62)]),
], SHARE("Tu gardes ton prix.\nTu changes *4 lignes*.", "Partie 3", "demain", "les 4 lignes qui font sonner le téléphone."))

post('ta-1re-revente-3', 'serie', "Résultat (3 appels en 2 jours) + bilan chiffré, fin de série",
     "Ta 1re revente, partie 3 : vendue 8 300 €, +660 € en 12 jours",
     "Fin de la série. Tu réécris 4 lignes de l'annonce : kilométrage, CT, factures, carnet. 3 appels en 2 jours, "
     "vendue 8 300 €. Il te reste 660 € une fois les frais payés.",
     "Prochaine série : quelle voiture ?", [
  S(hero=dict(src=CLIO_ANNONCE, pos='50% 45%', tag=("8 490 €", "8 300 €"), tx=560, ty=300), top=800,
    kicker="POV : ta 1re revente · partie 3", title="4 lignes changées.\n*3 appels* en 2 jours."),
  S(title="Tu réécris\nl'*annonce*.",
    comp=[VS(("Avant", ["Très bon état", "CT OK", "Pas sérieux s'abstenir"]),
             ("Après", ["112 000 km, 2 propriétaires", "CT d'août, aucun défaut", "Pneus et plaquettes neufs, factures",
                        "Carnet complet, 2 clés"]))]),
  S(title="Jour 10.",
    comp=[CHAT(["v", "Bonjour, vous faites 7 900 ?", "Un acheteur · 19:02"],
               ["m", "8 300. Pneus et plaquettes neufs, factures à l'appui."], ["v", "Je passe samedi. 8 300."])]),
  S(title="Jour 12 :\nles *papiers*.",
    comp=[LIST(("Certificat de cession", "en 2 exemplaires, signés"), ("Carte grise barrée", "« Vendu le… » et ta signature"),
               ("Non-gage", "moins de 15 jours"), ("Contrôle technique", "moins de 6 mois : le tien a 3 mois"))],
    body2="Puis tu déclares la cession en ligne."),
  S(title="Le *bilan*.",
    comp=[STATS(("+660 €", "il te reste, frais payés", True), ("12 jours", "de l'achat à la vente"), ("640 €", "de frais"))]),
], COMMENT("Le calcul du jour 1,\n*étape par étape* :"))

# ═══════════════ Variante B : 2 débutants + 1 messagerie par jour ═══════════════

post('demarrage-a-froid', 'eviter', "Scène chiffrée (3 premières secondes, jusqu'à 5 000 €) + interdit",
     "Le claquement à froid qui peut te coûter 5 000 € (BMW 116i, 1.4 TSI)",
     "Achat-revente voiture : demande au vendeur de ne pas démarrer la voiture avant ton arrivée. Sur une chaîne de "
     "distribution allongée, le claquement des premières secondes disparaît une fois le moteur chaud.",
     "Envoie-le à ton pote qui va voir une voiture ce week-end.", [
  S(kicker="Moteur froid, les 3 premières secondes", title="Un claquement,\njusqu'à *5 000 €*.", car=CAR('bmw')),
  S(title="La chaîne\n*s'allonge*.",
    body="Sur ces moteurs, la chaîne de distribution se détend avec les kilomètres. À froid, elle claque au démarrage.",
    comp=[ROWS(("BMW 116i · 1.6 N13", "2011 à 2015", 'bad'), ("Golf 6, Polo · 1.4 TSI", "2008 à 2012", 'bad'),
               lab="Les plus connus")], credit=COUTS),
  S(title="Il l'a fait\n*chauffer*.",
    comp=[CHAT(["v", "Je l'ai démarrée ce matin pour vous, elle est prête !", "Le vendeur · 9:02"]),
          THOUGHT("Le bruit est parti avec.", size=60)]),
  S(title="La *parade*",
    comp=[LIST(("La veille, par message", "« Ne la démarrez pas avant mon arrivée. »"),
               ("En arrivant", "la main sur le capot : tiède, il l'a démarrée."),
               ("Au contact", "capot ouvert, tu écoutes les premières secondes."))]),
  S(title="Ça *claque* ?",
    comp=[PILLS(("Chaîne à temps : 500 à 1 200 €", 'warn'), ("Si elle casse : jusqu'à 5 000 €", 'bad'))],
    body2="Tu le comptes dans ton prix max, ou tu passes.", credit=COUTS),
], SHARE("Moteur froid,\nou tu ne *signes* pas.", "Envoie ça à", "ton pote", "qui va voir une voiture ce week-end."))

post('arnaque-compteur', 'arnaque', "Scène chiffrée : deux kilométrages qui ne collent pas",
     "89 000 km au compteur, 162 000 au dernier contrôle technique",
     "Voiture d'occasion : avant de te déplacer, demande le rapport HistoVec au vendeur. Gratuit et officiel, il affiche "
     "depuis 2021 le kilométrage relevé à chaque contrôle technique. Si le chiffre baisse, tu poses des questions.",
     "Envoie-le à ton pote qui achète une voiture.", [
  S(kicker="Clio 3 de 2012, annonce Leboncoin", title="89 000 km\nau compteur.\n*162 000*\nau dernier CT."),
  S(title="Le rapport\n*HistoVec*.",
    body="Officiel et gratuit. Le vendeur le génère sur histovec.interieur.gouv.fr et te l'envoie. "
         "Depuis 2021, il affiche le kilométrage relevé à chaque contrôle technique."),
  S(title="Ses *relevés*.",
    comp=[TL(("CT 2019", "118 000 km"), ("CT 2021", "141 000 km"), ("CT 2023", "162 000 km", 'x'),
             ("Aujourd'hui", "89 000 km au compteur", 'x'))]),
  S(title="Les chiffres\n*montent*.",
    body="D'un CT à l'autre, le kilométrage augmente. Il baisse ? Tu demandes la facture du compteur remplacé, ou tu pars."),
  S(title="2 autres *preuves*",
    comp=[LIST(("Les factures d'entretien", "le kilométrage y est écrit"), ("L'usure", "volant, pédales, siège conducteur"))]),
], SHARE("Le HistoVec,\n*avant* le trajet.", "Envoie ça à", "ton pote", "qui achète sa voiture ce mois-ci."))

post('outil-premier-message', 'outil', "Scénario horaire (7 h 12 / 12 h 30) : l'affaire perdue au bureau",
     "7 h 12, la Clio sort. 12 h 30, tu la vois : trop tard",
     "Tu fais de l'achat-revente à côté du boulot ? Avec la messagerie automatique utopicar, tu écris ton message une fois "
     "pour ta recherche Leboncoin. Chaque annonce trouvée le reçoit pendant que tu travailles.",
     None, [
  S(kicker="Tu bosses de 9 h à 17 h", title="7 h 12 :\nla Clio sort.\n12 h 30 :\ntu la *vois*."),
  S(title="12 h 31.",
    comp=[CHAT(["m", "Bonjour, toujours disponible ?", "Toi · 12:31"],
               ["v", "Désolé, quelqu'un passe la voir ce soir. Il m'a écrit à 7 h 20.", "Le vendeur · 12:47"])]),
  S(title="Ton message\npart *sans toi*.",
    body="Avec la messagerie utopicar, tu choisis une recherche Leboncoin et tu écris ton message une fois. "
         "Chaque annonce trouvée reçoit ton premier message."),
  S(comp=[ROWS(("Une annonce toutes les 1 à 2 minutes", None), ("Jamais deux fois la même", None),
               ("« Pas de démarchage » : ignorée par défaut", None), lab="Comment il part")]),
  S(title="Le même jour.",
    comp=[CHAT(["m", MSG_OUTIL, "Ton message, parti seul"], ["v", "Oui, vous pouvez passer ce soir ?", "Le vendeur"])]),
], COMMENT("Tu bosses.\nTon message *part*.", 'MESSAGE'))

post('outil-copier-coller', 'outil', "Scénario (21 h 40, le canapé) + coût caché du copier-coller",
     "40 copier-coller du même message ce soir ? Plus besoin",
     "Achat-revente voiture : tu écris ton message une fois et la messagerie automatique utopicar l'envoie à chaque "
     "annonce de ta recherche Leboncoin, une toutes les 1 à 2 minutes, jamais deux fois à la même.",
     None, [
  S(kicker="21 h 40, ton canapé", title="Le même\nmessage,\ncollé *40 fois*."),
  S(comp=[CHAT(["m", "Bonjour, toujours disponible ?", "Annonce 1"], ["m", "Bonjour, toujours disponible ?", "Annonce 2"],
               ["m", "Bonjour, toujours disponible ?", "Annonce 37"]),
          THOUGHT("J'ai déjà écrit à celle-là ?", size=60)]),
  S(title="Avec la messagerie\n*utopicar*.",
    comp=[TL(("Critères", "marque, modèle, budget"), ("Annonces trouvées", "la liste de ta recherche, avec les photos"),
             ("Message et envoi", "tu l'écris une fois", 'v'))]),
  S(title="Le *rythme*.",
    comp=[STATS(("1 à 2 min", "entre deux annonces", True), ("1", "message par annonce"), ("0", "doublon"))]),
], COMMENT("Ta soirée,\n*sans copier-coller*.", 'MESSAGE'))

post('annonce-decryptee-clio-tce', 'annonce', "Citation d'annonce (« consomme un peu d'huile ») + verdict chiffré",
     "Annonce décryptée n° 1 : Clio 4 à 5 900 €, « consomme un peu d'huile »",
     "« Rien de grave », écrit le vendeur. Sur un 1.2 TCe 120 de 2014, la consommation d'huile peut finir en réparation "
     "moteur, jusqu'à 10 000 € selon des propriétaires et la presse auto.",
     "Tu l'aurais achetée ?", [
  S(kicker="Annonce décryptée n° 1 · Clio 4 à 5 900 €", title="« Consomme\nun peu d'*huile* »", car=CAR('clio')),
  S(title="L'*annonce*.",
    comp=[LISTING(CAR('clio')['src'], "Renault Clio 4 TCe 120 EDC", "2014 · 121 000 km · Essence · Automatique", "5 900 €",
                  "« Consomme un peu d'huile, rien de grave. »", note="2014 ?", nx=430, ny=520, cut=True)],
    credit=_CREDITS['clio']),
  S(title="Le moteur :\n1.2 *TCe 120*.",
    body="De fin 2012 à mi-2016, il peut boire plus d'un litre d'huile aux 1 000 km. Au bout : soupapes abîmées, parfois la casse.",
    comp=[PILLS(("Jusqu'à 10 000 €", 'bad'))], credit=COUTS),
  S(title="Ce que tu\n*vérifies*.",
    comp=[LIST(("Les factures d'entretien", "vidanges faites à temps"),
               ("La jauge, devant toi", "et la fumée bleue quand tu accélères"))]),
  S(title="Le *verdict*.",
    comp=[VERDICT("À éviter", 'bad', sub="Le moteur peut coûter **jusqu'à 10 000 €**, plus que la voiture.")]),
], COMMENT("Annonce n° 2 vendredi :\nune 208 *PureTech*."))

post('prix-ferme', 'pov', "POV : contradiction (« prix ferme », −400 € au 1er appel), à envoyer au pote",
     "Tu écris « prix ferme » et tu lâches 400 € au premier appel",
     "POV : ta première revente. L'annonce dit « prix ferme », l'acheteur propose 3 800 € au lieu de 4 200, et tu dis oui "
     "en deux minutes. Fixe ton prix plancher avant de publier, et mets la négociation dans le prix affiché.",
     "Tu tiens combien de temps, toi ?", [
  S(kicker="POV : tu revends ta 1re voiture", title="Tu écris\n« prix ferme ».\nTu lâches *400 €*."),
  S(comp=[QUOTE("Peugeot 207, 2010, 128 000 km. CT OK. 4 200 €. ==Prix ferme.==", lab="Ton annonce")]),
  S(comp=[CHAT(["v", "Bonjour, 3 800 et je viens ce soir avec l'argent.", "Le 1er appel · 19:03"], ["m", "C'est un prix ferme…"],
               ["v", "3 800, je suis devant chez vous dans 20 minutes."], ["m", "… d'accord."])]),
  S(title="2 minutes\nde *négo*.",
    comp=[STATS(("−400 €", "ta marge, partie en 2 minutes", True), ("4 200 €", "ton prix « ferme »"), ("3 800 €", "ton vrai prix")),
          THOUGHT("Je visais 500 € de marge.", size=58)]),
  S(title="Le bon *réglage*",
    comp=[LIST(("Ton prix plancher", "fixé avant l'annonce : en dessous, tu dis non"),
               ("Ton prix affiché", "le plancher + 200 à 300 € de négo"))]),
], SHARE("Ton plancher se fixe\n*avant* le 1er appel.", "Envoie ça à", "ton pote", "qui écrit « prix ferme »."))

post('budget-2000', 'budget', "Interdit chiffré (2 000 € en poche, 1 500 € maximum)",
     "Te lancer en achat-revente avec 2 000 € : jamais plus de 1 500 € sur la voiture",
     "Commencer l'achat-revente voiture avec 2 000 € : garde 500 € de côté pour la carte grise, les pneus et l'imprévu. "
     "Le jour où le contrôle technique demande une contre-visite, ta réserve paie les disques.",
     "Tu commences avec combien ?", [
  S(kicker="Tu te lances avec 2 000 €", title="Ta voiture :\n*1 500 €*\nmaximum."),
  S(title="Les *500 €*\nqui restent.",
    comp=[TICKET(("Carte grise, 4 CV, plus de 10 ans", "≈ 110 €"), ("2 pneus montés", "≈ 120 €"),
                 ("Plaquettes, balais", "≈ 80 €"), ("Trajet, nettoyage", "≈ 70 €"), ("Imprévu", "120 €"),
                 tot="500 €", totLab="Réserve")],
    credit="Carte grise : chevaux fiscaux × tarif de ta région, divisé par 2 après 10 ans, + 13,76 €"),
  S(title="Sans *réserve*,\ntu bloques.",
    comp=[CHAT(["v", "Contre-visite : disques avant à changer.", "Le contrôle technique"]), THOUGHT("Il me reste 0 €.", size=62)]),
  S(title="Ta *marge*.",
    comp=[TICKET(("Revente estimée", "2 400 €"), ("Achat", "− 1 500 €"), ("Frais", "− 500 €"), tot="400 €",
                 totLab="Il te reste", tone='g')],
    body2="Sur une voiture à 1 500 €, vise au moins 400 €, frais payés."),
  S(title="Avant ta 3e voiture :\nle *statut*.",
    body="Acheter pour revendre de façon régulière, c'est une activité commerciale. Tu la déclares, "
         "en micro-entreprise le plus souvent."),
], COMMENT("Tes 2 000 €,\n*étape par étape*."))

post('outil-pros-s-abstenir', 'outil', "Démonstration : l'annonce « pros s'abstenir » laissée de côté",
     "« Pros s'abstenir » : ton message automatique ne part pas",
     "Achat-revente voiture : la messagerie automatique utopicar envoie ton premier message aux annonces de ta recherche "
     "Leboncoin. Les annonces qui refusent le démarchage restent de côté, par défaut.",
     None, [
  S(kicker="L'annonce dit « pros s'abstenir »", title="Ton message\nne part\n*pas*."),
  S(comp=[QUOTE("Clio 4 dCi 90, 2015, 138 000 km. 6 800 €. ==Pas de démarchage, pros s'abstenir.==", lab="L'annonce")]),
  S(title="La messagerie\nla *saute*.",
    body="Avant d'envoyer, la messagerie utopicar lit l'annonce. Ces phrases la mettent de côté :",
    comp=[PILLS(("pas de démarchage", 'bad'), ("pros s'abstenir", 'bad'), ("pas de marchands", 'bad'),
                ("particuliers uniquement", 'bad'))]),
  S(title="Les autres\nreçoivent ton *message*.",
    comp=[CHAT(["m", MSG_OUTIL, "Ton message"])],
    body2="Une annonce toutes les 1 à 2 minutes, jamais deux fois la même."),
  S(title="Tu *choisis*.", body="Le filtre est actif par défaut. Tu peux le couper, campagne par campagne."),
], COMMENT("Tu écris aux vendeurs\nqui *acceptent*.", 'MESSAGE'))

post('arnaque-acompte', 'arnaque', "Scène chiffrée (Clio 1 200 € sous la cote, 300 € d'acompte), partage pour protéger",
     "Clio à 2 900 €, vendeur muté à l'étranger, 300 € d'acompte : l'arnaque",
     "Sur Leboncoin, une voiture très sous la cote, un vendeur loin et un acompte avant la visite : tu arrêtes là. "
     "Passe les photos dans Google Lens pour voir si elles viennent d'une autre annonce.",
     "Envoie-le à ton pote qui a trouvé « l'affaire du siècle ».", [
  S(kicker="Clio 3 à 2 900 €, 1 200 € sous la cote", title="Le vendeur\nest muté.\nIl veut *300 €*."),
  S(comp=[CHAT(["v", "Je suis muté à Madrid, la voiture est chez un transporteur.", "Le vendeur"],
               ["v", "Envoyez 300 € d'acompte par virement, elle est livrée chez vous jeudi.", "Le vendeur"])]),
  S(comp=[SPLIT(("Ce qu'il promet", "Livrée jeudi."), ("Ce qui arrive", "Plus de réponse après ton virement."))],
    glow=('50% 100%', .3)),
  S(title="Les *signaux*",
    comp=[LIST(("Un prix très sous la cote", "sans explication"), ("Un vendeur loin", "mutation, transporteur, armée"),
               ("De l'argent avant la visite", "acompte, réservation, frais de livraison"))]),
  S(title="Ta *règle*",
    comp=[LIST(("Pas vue, pas payée", "aucun acompte avant la visite"),
               ("Les photos dans Google Lens", "les mêmes ailleurs ? Arnaque."))]),
], SHARE("Pas vue,\n*pas payée*.", "Envoie ça à", "ton pote", "qui a trouvé « l'affaire du siècle »."))

post('dico-annonces', 'annonce', "Citation d'annonce connue + traduction (Leboncoin comme personnage)",
     "« Petit bruit, rien de grave » : 5 phrases d'annonce auto traduites",
     "Le dico des annonces Leboncoin pour ta première voiture à revendre. Chaque phrase cache une ligne de frais "
     "à mettre dans ton prix max avant d'appeler le vendeur.",
     "Tu en as une à ajouter ?", [
  S(kicker="5 phrases d'annonce, traduites", title="« Petit bruit,\nrien de *grave* »",
    comp=[PILLS(("« Clim à recharger »", 'neu'), ("« Embrayage un peu dur »", 'neu'), ("« Vendue sans CT »", 'neu'),
                ("« Sûrement un capteur »", 'neu'))]),
  S(kicker="N° 1", title="« Petit bruit,\nrien de *grave* »", comp=[THOUGHT("Personne n'a cherché d'où il vient.", lab="Traduction :")],
    body2="Moteur froid, capot ouvert : tu écoutes avant de signer."),
  S(kicker="N° 2", title="« Clim à\n*recharger* »", comp=[THOUGHT("Elle fuit, peut-être.", lab="Traduction :"),
    PILLS(("Recharge : 50 à 100 €", 'neu'), ("Fuite, compresseur : 500 € et plus", 'bad'))]),
  S(kicker="N° 3", title="« Embrayage\nun peu *dur* »", comp=[THOUGHT("Il arrive en fin de vie.", lab="Traduction :")],
    body2="Compte un embrayage dans ton prix max : 600 € et plus."),
  S(kicker="N° 4", title="« Vendue\nsans *CT* »", comp=[THOUGHT("Les réparations du CT seront pour toi.", lab="Traduction :")],
    body2="Entre particuliers, le vendeur fournit un CT de moins de 6 mois pour une voiture de plus de 4 ans."),
  S(kicker="N° 5", title="« Voyant allumé,\nsûrement un *capteur* »", comp=[THOUGHT("Il n'a pas lu les codes défaut.", lab="Traduction :")],
    body2="Demande une lecture des défauts au garage avant de signer."),
], SHARE("Ta 6e phrase\nà *traduire* ?", "Enregistre", "le dico", "et relis-le avant chaque appel."))

post('206-reparations', 'pov', "Scène chiffrée : réparations plus chères que la voiture",
     "206 achetée 1 200 €, 1 400 € de réparations, revendue 2 300 €",
     "POV : ta première affaire. « Quelques frais à prévoir », dit l'annonce. Le contrôleur relève de quoi dépenser "
     "1 400 € et tu revends à perte. En achat-revente voiture, chiffre le pire cas avant ton offre.",
     "Tu l'aurais vue venir ?", [
  S(kicker="POV : ta 1re affaire à 1 200 €", title="206 à 1 200 €.\n*1 400 €* de\nréparations."),
  S(title="Jour 1 :\nl'*affaire*.",
    comp=[QUOTE("206 1.4, 2007, 167 000 km. Roule bien, ==quelques frais à prévoir==. 1 200 €.", lab="L'annonce"),
          THOUGHT("Revendue 2 300 €, je fais +1 100.", size=58)]),
  S(title="Puis le contrôle\n*technique*.",
    comp=[TICKET(("Rotules et silentblocs", "380 €"), ("Disques et plaquettes", "240 €"), ("2 pneus", "130 €"),
                 ("Embrayage", "650 €"), tot="1 400 €", totLab="Réparations", tone='r')]),
  S(title="Le *bilan*.",
    comp=[STATS(("−300 €", "avant même la carte grise", True), ("1 200 €", "l'achat"), ("2 300 €", "la revente"))]),
  S(title="« Quelques frais\nà *prévoir* »",
    body="Lis cette phrase comme une ligne de ton calcul. Tu chiffres le pire cas, puis tu fais ton offre."),
], SHARE("L'affaire se calcule\n*frais compris*.", "Envoie ça à", "ton pote", "qui achète au prix le plus bas."))

post('outil-jamais-deux-fois', 'outil', "Scène gênante (2 messages au même vendeur) + mécanisme",
     "Tu écris deux fois au même vendeur : la messagerie l'évite",
     "La messagerie automatique utopicar relit ta boîte de réception Leboncoin avant chaque envoi. Une annonce déjà "
     "contactée, à la main ou par une campagne, ne reçoit pas de deuxième message.",
     None, [
  S(kicker="Mardi, puis jeudi", title="Tu écris\n2 fois au même\n*vendeur*."),
  S(comp=[CHAT(["m", "Bonjour, toujours disponible ?", "Toi · mardi"], ["m", "Bonjour, toujours disponible ?", "Toi · jeudi"],
               ["v", "Vous m'avez déjà écrit mardi…", "Le vendeur"])]),
  S(title="La messagerie\nlit ta *boîte*.",
    body="Avant d'envoyer, la messagerie utopicar relit ta boîte de réception Leboncoin. "
         "Une annonce déjà contactée, même à la main, sort de la file."),
  S(comp=[ROWS(("Annonce contactée à la main", "ignorée", 'warn'), ("Annonce déjà dans une campagne", "ignorée", 'warn'),
               ("Nouvelle annonce", "message envoyé", 'ok'), lab="Ta file d'envoi")]),
], COMMENT("Un message\npar *annonce*.", 'MESSAGE'))

post('outil-reponses', 'outil', "Scénario (18 h, 3 réponses) : le résultat d'abord",
     "18 h, tu sors du boulot : 3 vendeurs t'ont déjà répondu",
     "Achat-revente voiture à côté de ton travail : la messagerie automatique utopicar envoie ton premier message aux "
     "annonces de ta recherche Leboncoin. Le soir, tu lis les réponses et tu appelles.",
     None, [
  S(kicker="18 h, tu sors du boulot", title="*3 vendeurs*\nt'ont répondu."),
  S(title="Ta *boîte*.",
    comp=[CHAT(["v", "Oui toujours dispo, vous passez quand ?", "Clio 4 · 6 900 €"], ["v", "Je peux descendre à 6 400.", "208 · 7 200 €"],
               ["v", "Vendue ce matin, désolé.", "Polo · 5 500 €"])]),
  S(title="Tu n'as écrit\nà *personne*.",
    body="Ce matin, tu as choisi ta recherche et ton message. La messagerie utopicar l'a envoyé, annonce par annonce."),
  S(title="Ton *suivi*.",
    comp=[LIST(("Messages envoyés", "premier message uniquement"), ("En attente", "une annonce toutes les 1 à 2 minutes"),
               ("Réponses reçues", "lues dans ta boîte Leboncoin"))]),
  S(title="Toi, tu *réponds*.", body="Tu gardes ton temps pour les vendeurs qui répondent, et tu négocies avec ton prix max."),
], COMMENT("Tu sors du boulot,\ntu lis les *réponses*.", 'MESSAGE'))

post('annonce-decryptee-208', 'annonce', "Citation d'annonce (« courroie changée, facture ») + verdict inversé",
     "Annonce décryptée n° 2 : 208 PureTech à 8 400 €, avec la facture de courroie",
     "Les acheteurs fuient le 1.2 PureTech. Avec une facture de courroie et un entretien suivi, cette 208 se défend, "
     "et l'extension Stellantis la couvre jusqu'à 10 ans ou 175 000 km, sous conditions.",
     "Tu l'achètes ou tu passes ?", [
  S(kicker="Annonce décryptée n° 2 · 208 à 8 400 €", title="« Courroie changée,\n*facture* »", car=CAR('p208')),
  S(title="L'*annonce*.",
    comp=[LISTING(CAR('p208')['src'], "Peugeot 208 1.2 PureTech 110", "2017 · 96 000 km · Essence · Manuelle", "8 400 €",
                  "« Courroie changée en 2023, facture. Entretien Peugeot. »", note="la facture !", nx=380, ny=520, cut=True)],
    credit=_CREDITS['p208']),
  S(title="Le *défaut*.",
    body="Sur le 1.2 PureTech, de 2013 à mi-2022, la courroie baigne dans l'huile et s'effrite. Ses débris bouchent la crépine, "
         "et le moteur casse.",
    comp=[PILLS(("Courroie changée : 400 à 600 €", 'warn'))], credit=COUTS),
  S(title="Ce que tu\n*demandes*.",
    comp=[LIST(("La facture de courroie", "date et kilométrage"), ("Les 3 dernières factures d'entretien", "pour l'extension de garantie"),
               ("L'huile utilisée", "écrite sur les factures"))]),
  S(title="La *garantie*.",
    body="Depuis mars 2024, Stellantis couvre ce moteur jusqu'à 10 ans ou 175 000 km, si l'entretien suit le carnet. "
         "Un concessionnaire vérifie l'éligibilité avec le numéro de série."),
  S(title="Le *verdict*.",
    comp=[VERDICT("À acheter", 'ok', sub="Avec la facture. Sans elle, compte **400 à 600 €** de courroie dans ton prix max.")]),
], COMMENT("Annonce n° 3 dimanche :\nune Golf à *négocier*."))

post('arnaque-faux-virement', 'arnaque', "Scène chiffrée (6 900 € sur son écran, 0 € sur ton compte), partage pour protéger",
     "Il te montre un virement de 6 900 €. Ton compte affiche 0 €",
     "Tu vends ta voiture : l'acheteur te montre un virement instantané sur son téléphone et te demande les clés. "
     "Un virement instantané arrive en quelques secondes. Tu donnes les clés quand tu vois l'argent dans ton appli bancaire.",
     "Envoie-le à ton pote qui vend sa voiture ce week-end.", [
  S(kicker="Tu vends ta 208 à 6 900 €", title="Il te montre\nle virement.\nTon compte : *0 €*."),
  S(comp=[CHAT(["v", "C'est fait, virement instantané ! Regardez.", "L'acheteur · samedi 18:40"]),
          ROWS(("Virement instantané", "effectué", 'ok'), ("Montant", "6 900 €", 'ok'), lab="Sur son téléphone")]),
  S(title="Dans *ton* appli.",
    comp=[ROWS(("Solde", "inchangé", 'bad'), ("Virements reçus", "aucun", 'bad'), lab="Ton compte, 18:42")]),
  S(comp=[SPLIT(("Ce qu'il dit", "« Ça met 24 h à arriver. »"), ("Ce qui se passe", "Il part avec la voiture et la carte grise."))],
    body2="Un virement instantané arrive en quelques secondes.", glow=('50% 100%', .3)),
  S(title="Ta *règle*",
    comp=[LIST(("Les clés et la carte grise", "quand l'argent est sur ton compte, vu dans ton appli"),
               ("Une capture d'écran", "ne prouve rien"))]),
], SHARE("L'argent d'abord,\npuis les *clés*.", "Envoie ça à", "ton pote", "qui vend sa voiture ce week-end."))

post('6-verifs-visite', 'liste', "Scène (le vendeur attend, l'argent en poche) + liste à enregistrer",
     "6 vérifs à faire devant la voiture avant de payer",
     "Voiture d'occasion : le vendeur attend, l'argent est dans ta poche. Moteur froid, huile, numéro de série, pneus, "
     "voyants et embrayage : 6 contrôles avant de signer, sans outil.",
     "Tu en ajoutes une ?", [
  S(kicker="Le vendeur attend, l'argent est dans ta poche", title="6 vérifs\navant de *payer*."),
  S(title="Sous le *capot*.",
    comp=[LIST(("Le capot, moteur froid", "tiède ? Il l'a démarrée. Écoute les premières secondes."),
               ("L'huile", "une mousse beige sous le bouchon peut signaler un joint de culasse."))]),
  S(title="Autour de la *voiture*.",
    comp=[LIST(("Le numéro de série", "pare-brise et carte grise : le même, au caractère près."),
               ("Les pneus", "usés d'un seul côté ? La géométrie, ou un choc."), start=3)]),
  S(title="Au *volant*.",
    comp=[LIST(("Les voyants", "contact mis, tous s'allument. Il en manque un ? Quelqu'un l'a peut-être débranché."),
               ("L'embrayage", "en 3e, à bas régime, accélère fort : le moteur monte, la voiture traîne ? Il patine."), start=5)]),
], SHARE("Ta liste,\n*devant la voiture*.", "Enregistre", "la liste", "et ouvre-la à ta prochaine visite."))

post('outil-avant-apres', 'outil', "Avant / après chiffré (40 messages tapés ou 1 seul)",
     "40 messages tapés à la main, ou 1 seul pour toute ta recherche",
     "Achat-revente voiture : avec la messagerie automatique utopicar, tu choisis tes critères et tu écris ton message "
     "une fois. Il part à chaque annonce de ta recherche Leboncoin, une toutes les 1 à 2 minutes.",
     None, [
  S(kicker="Chercher ta prochaine voiture", title="40 messages\ntapés.\nOu *1* seul."),
  S(comp=[VS(("À la main", ["Tu tapes 40 fois", "Tu oublies qui tu as contacté", "Tu écris aux « pros s'abstenir »"]),
             ("Messagerie", ["Tu écris 1 fois", "Jamais 2 fois la même annonce", "Refus de démarchage ignorés"]))]),
  S(title="3 *étapes*.",
    comp=[TL(("Critères", "marque, modèle, budget"), ("Annonces trouvées", "la liste de ta recherche"),
             ("Message et envoi", "une annonce toutes les 1 à 2 minutes", 'v'))]),
], COMMENT("Ton prochain soir,\n*1 message*.", 'MESSAGE'))

post('carnet-oublie', 'pov', "POV : question de l'acheteur + perte chiffrée (−400 €), à envoyer au pote",
     "« Le carnet ? » Tu l'as laissé au vendeur : −400 € à la revente",
     "POV : ta première revente. L'acheteur demande le carnet d'entretien et les factures, ils sont restés chez l'ancien "
     "propriétaire, et ton prix baisse de 400 €. Le jour où tu achètes, tu repars avec tout le dossier.",
     "Envoie-le à ton pote qui part sans les papiers.", [
  S(kicker="POV : tu revends ta Clio 6 500 €", title="« Le carnet ? »\nTu l'as laissé\nau *vendeur*."),
  S(comp=[CHAT(["v", "Elle me plaît. Je peux voir le carnet et les factures ?", "L'acheteur"],
               ["m", "Euh… l'ancien propriétaire les a gardés."], ["v", "Sans historique, je propose 6 100.", "L'acheteur"])]),
  S(comp=[BIGR("−400 €", "pour un carnet resté dans un tiroir.")]),
  S(title="Le jour de\nton *achat*",
    comp=[LIST(("Le carnet d'entretien", "tamponné"), ("Les factures", "distribution, embrayage, pneus"),
               ("Le double des clés", "plus de 100 € à refaire"))]),
], SHARE("Ton dossier de revente\nse fait à l'*achat*.", "Envoie ça à", "ton pote", "qui part sans les papiers."))

post('4-questions-avant-trajet', 'liste', "Scène (100 km pour rien, carte grise au mauvais nom) + liste à enregistrer",
     "100 km de trajet, et la carte grise n'est pas à son nom",
     "Avant d'aller voir une voiture d'occasion, pose 4 questions par message : carte grise, contrôle technique, "
     "distribution et HistoVec. Tu prends la route selon ses réponses.",
     "Ta question en plus ?", [
  S(kicker="Tu as fait 100 km pour la voir", title="La carte grise\nn'est pas\nà *son nom*."),
  S(comp=[CHAT(["v", "C'est la voiture de mon beau-frère, il m'a dit de la vendre.", "Le vendeur"]),
          THOUGHT("100 km aller, 100 km retour.", size=62)]),
  S(title="4 questions\n*par message*.",
    comp=[LIST(("La carte grise est à votre nom ?",), ("Le CT date de quand, avec quels défauts ?",),
               ("La distribution est faite ? Avec facture ?",), ("Vous m'envoyez le rapport HistoVec ?",))]),
  S(title="Une réponse\n*floue* ?", body="Tu restes chez toi. Un vendeur sérieux répond aux 4, photos à l'appui."),
], SHARE("Tes 4 questions,\n*avant* le trajet.", "Enregistre", "les 4 questions", "et colle-les à chaque vendeur."))

post('annonce-decryptee-golf', 'annonce', "Citation d'annonce (« défauts mineurs ») + négociation chiffrée",
     "Annonce décryptée n° 3 : Golf à 7 900 €, « CT OK, défauts mineurs »",
     "« Défauts mineurs » : demande le procès-verbal du contrôle technique et chiffre chaque ligne. "
     "Sur cette Golf, deux lignes du PV valent 300 € de remise.",
     "Tu aurais proposé combien ?", [
  S(kicker="Annonce décryptée n° 3 · Golf à 7 900 €", title="« CT OK,\ndéfauts *mineurs* »", car=CAR('golf')),
  S(title="L'*annonce*.",
    comp=[LISTING(CAR('golf')['src'], "Volkswagen Golf 6 1.6 TDI 105", "2011 · 186 000 km · Diesel · Manuelle", "7 900 €",
                  "« CT OK, défauts mineurs. »", note="lesquels ?", nx=430, ny=520, cut=True)],
    credit=_CREDITS['golf']),
  S(title="Tu demandes\nle *PV du CT*.",
    comp=[QUOTE("Défaillances mineures : ==disques de frein avant usés==, ==pneu arrière gauche usé==. Pas de contre-visite.",
                lab="Le procès-verbal")]),
  S(title="Tu *chiffres*.",
    comp=[TICKET(("Disques et plaquettes avant", "≈ 250 €"), ("1 pneu arrière", "≈ 80 €"), tot="330 €", totLab="À prévoir", tone='r')]),
  S(title="Au *téléphone*.",
    comp=[CHAT(["m", "Le PV note les disques avant et un pneu : 330 € à prévoir. Je vous propose 7 400 €."],
               ["v", "On coupe la poire en deux : 7 600.", "Le vendeur"])]),
  S(title="Le *verdict*.", comp=[VERDICT("À négocier", 'warn', sub="Deux lignes du PV t'ont fait gagner **300 €**.")]),
], COMMENT("Négocier avec le PV,\n*étape par étape*."))

post('outil-message-personnalise', 'outil', "Démonstration : un message écrit, chaque vendeur lit sa voiture",
     "Un seul message écrit, et chaque vendeur lit le nom de sa voiture",
     "La messagerie automatique utopicar remplace {titre} par le titre de chaque annonce de ta recherche Leboncoin. "
     "Tu écris une fois, chaque vendeur reçoit un message qui parle de sa voiture.",
     None, [
  S(kicker="1 message pour toute ta recherche", title="Chaque vendeur\nlit *sa* voiture."),
  S(comp=[QUOTE("Bonjour, votre ++{titre}++ est-elle toujours disponible ? Je peux me déplacer rapidement. Bonne journée.",
                lab="Ce que tu écris, une fois")]),
  S(title="Ce qui *part*.",
    comp=[CHAT(["m", "Bonjour, votre Clio 4 TCe 90 est-elle toujours disponible ?…", "Annonce 1"],
               ["m", "Bonjour, votre 208 PureTech 110 est-elle toujours disponible ?…", "Annonce 2"],
               ["m", "Bonjour, votre Golf 6 1.6 TDI est-elle toujours disponible ?…", "Annonce 3"])]),
  S(title="Ce qui ne part *pas*.",
    comp=[LIST(("Les annonces déjà contactées", "lues dans ta boîte Leboncoin"), ("Les « pas de démarchage »", "ignorées par défaut"))]),
], COMMENT("Tu l'écris une fois,\nil part *à chaque annonce*.", 'MESSAGE'))

# ════════════════════════════ Calendrier ════════════════════════════
# A : lundi 12 → dimanche 18 octobre 2026, 18 h 30. B : lundi 19 → dimanche 25 octobre, 12 h 30 / 18 h 30 / 21 h,
# le créneau de la messagerie tourne pour ne pas confondre l'heure et le sujet.
A_START, B_START = dt.date(2026, 10, 12), dt.date(2026, 10, 19)
CAL_A = ['5-moteurs-a-fuir', 'golf-perte-1200', 'faux-paiement-securise', 'ta-1re-revente-1', 'trajet-300-euros',
         'ta-1re-revente-2', 'ta-1re-revente-3']
CAL_B = [  # (12 h 30, 18 h 30, 21 h)
    ('demarrage-a-froid', 'arnaque-compteur', 'outil-premier-message'),
    ('outil-copier-coller', 'annonce-decryptee-clio-tce', 'prix-ferme'),
    ('budget-2000', 'outil-pros-s-abstenir', 'arnaque-acompte'),
    ('dico-annonces', '206-reparations', 'outil-jamais-deux-fois'),
    ('outil-reponses', 'annonce-decryptee-208', 'arnaque-faux-virement'),
    ('6-verifs-visite', 'outil-avant-apres', 'carnet-oublie'),
    ('4-questions-avant-trajet', 'annonce-decryptee-golf', 'outil-message-personnalise'),
]
JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
PILIERS = {'eviter': 'À éviter', 'annonce': 'Annonce décryptée', 'arnaque': 'Arnaque', 'serie': 'Série « Ta 1re revente »',
           'pov': 'Histoire POV', 'liste': 'Liste à enregistrer', 'budget': 'Se lancer', 'outil': 'Messagerie Leboncoin'}

sched = [('A', i + 1, A_START + dt.timedelta(days=i), '18:30', s) for i, s in enumerate(CAL_A)]
n = 0
for d, slots in enumerate(CAL_B):
    for h, s in zip(('12:30', '18:30', '21:00'), slots):
        n += 1; sched.append(('B', n, B_START + dt.timedelta(days=d), h, s))
assert sorted(s for *_, s in sched) == sorted(POSTS), set(POSTS) ^ {s for *_, s in sched}

# ════════════════════════════ Contrôles ════════════════════════════
def plain(s):
    for a in ('**', '*', '[r]', '[/r]', '[g]', '[/g]', '==', '++'): s = s.replace(a, '')
    return s.replace('\n', ' ')
def texts(o):
    if isinstance(o, str): yield o
    elif isinstance(o, dict):
        for v in o.values(): yield from texts(v)
    elif isinstance(o, (list, tuple)):
        for v in o: yield from texts(v)
# tics d'écriture repérés par le skill stop-slop (adverbes vides, tirets cadratins, annonces creuses)
SLOP = re.compile(r"—|\b(vraiment|simplement|littéralement|honnêtement|clairement|totalement|absolument|en réalité|"
                  r"il s'avère|voici pourquoi|laisse-moi|tu ne devineras|arrête de scroller|et si je te disais)\b", re.I)
problems = []
for p in POSTS.values():
    allt = [p['titre'], p['legende'], p['question'] or ''] + list(texts(p['slides'])) + list(texts(p['end']))
    for t in allt:
        if SLOP.search(t): problems.append(f"{p['slug']} : « {SLOP.search(t).group(0)} » dans « {plain(t)[:60]} »")
    if len(p['titre']) > 90: problems.append(f"{p['slug']} : titre de {len(p['titre'])} caractères (90 max)")
    if len(p['tags']) > 3: problems.append(f"{p['slug']} : {len(p['tags'])} hashtags (3 max)")
    for s in p['slides'] + [p['end']]:
        if s.get('title') and s['title'].count('*') > 2: problems.append(f"{p['slug']} : plus d'un mot en orange dans « {plain(s['title'])} »")
if problems: sys.exit('À corriger :\n' + '\n'.join(problems))

# ════════════════════════════ Sorties ════════════════════════════
def caption(p):
    word = p['end'].get('word') or ('MESSAGE' if p['pilier'] == 'outil' else 'DÉBUTANT')
    lines = [p['legende']] + ([p['question']] if p['question'] else []) + [CTA[word], '', ' '.join(p['tags'])]
    return '\n'.join(lines)

out, rows = [], []
md = ["# Carrousels de la semaine : variantes A et B\n",
      "Cible unique : les débutants qui veulent se lancer en achat-revente auto. Sujets et accroches tirés de "
      "`docs/veille_tiktok_oct2026.md` ; accroches écrites avec le skill `art-du-hook`, textes passés au skill `stop-slop`. "
      "Histoires POV inventées : ne jamais écrire « histoire vraie » ni « ça m'est arrivé ».\n",
      "Pour chaque publication : le **titre** va dans le champ « Titre » de TikTok (photos), la **légende** dans la "
      "description, telle quelle. Images : `renders/carousels-semaine/<id>-<slug>/`, avec `post.txt` à côté. "
      "Son : un son tendance, choisi dans TikTok au moment de publier.\n",
      "Mots à commenter (outil de réponse automatique aux commentaires) : **DÉBUTANT** → le guide « " + GUIDE + " », "
      "**MESSAGE** → le message privé qui explique comment activer la messagerie Leboncoin.\n"]
cur = None
for var, k, day, hour, slug in sched:
    p = POSTS[slug]; cid = f"{var}{k:02d}"
    e = p['end']; word = e.get('word')
    item = dict(id=cid, slug=slug, slides=p['slides'] + [S(title=e['title'])], car=None)
    if 'share' in e: lead, kk, sub, sign = e['share']; item['share'] = dict(lead=lead, k=kk, sub=sub, sign=sign)
    else: item.update(word=word, guide=GUIDE, after=AFTER.get(word))
    out.append(item)
    if var != cur:
        cur = var
        md.append("\n## Variante A : 7 carrousels débutants, 1 par jour à 18 h 30\n" if var == 'A' else
                  "\n## Variante B : 21 carrousels, 3 par jour (2 débutants + 1 messagerie)\n")
    jour = f"{JOURS[day.weekday()]} {day.day} octobre"
    cible = 'Messagerie (test)' if p['pilier'] == 'outil' else 'Débutants'
    h0 = p['slides'][0]; hook = plain(' · '.join(x for x in [h0.get('kicker'), h0.get('title')] if x))
    md.append(f"### {cid} · {jour}, {hour.replace(':', ' h ')} · {cible} · {PILIERS[p['pilier']]}\n\n"
              f"**Image 1 :** {hook}  \n**Accroche :** {p['hook']}  \n**Images :** {len(item['slides'])}\n\n"
              f"**Titre :** {p['titre']}\n\n```\n{caption(p)}\n```\n")
    rows.append(dict(id=cid, variante=var, date=day.isoformat(), jour=JOURS[day.weekday()], heure=hour, cible=cible,
                     pilier=PILIERS[p['pilier']], titre=p['titre'], legende=caption(p), hashtags=' '.join(p['tags']),
                     images=len(item['slides']), dossier=f"renders/carousels-semaine/{cid}-{slug}"))
    d = os.path.join(VIDEO, 'renders', 'carousels-semaine', f"{cid}-{slug}"); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'post.txt'), 'w', encoding='utf-8').write(
        f"{cid} · {jour}, {hour} · {cible}\n\nTITRE\n{p['titre']}\n\nLÉGENDE\n{caption(p)}\n")

md.append("\n## Lire le test\n\n"
          "Relève chaque publication **48 h après** : vues, enregistrements, partages, commentaires avec le mot "
          "(DÉBUTANT ou MESSAGE) et visites du profil. Compare ensuite les deux semaines sur la **médiane** des vues par "
          "publication et sur le **total** de commentaires DÉBUTANT : la variante B gagne si elle apporte plus de "
          "commentaires DÉBUTANT sans faire chuter la médiane. Pour la messagerie : le nombre de commentaires MESSAGE et "
          "de messages privés sur ses 7 publications.\n")
json.dump(dict(carousels=out), open(os.path.join(HERE, 'carousels.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(os.path.join(HERE, 'legendes.md'), 'w', encoding='utf-8').write('\n'.join(md))
with open(os.path.join(HERE, 'calendrier.csv'), 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0]), delimiter=';'); w.writeheader(); w.writerows(rows)
print(len(out), 'carrousels :', sum(1 for r in rows if r['variante'] == 'A'), 'en A,', sum(1 for r in rows if r['variante'] == 'B'),
      'en B (dont', sum(1 for r in rows if r['cible'] != 'Débutants'), 'messagerie),', sum(r['images'] for r in rows), 'images')

if '--rendu' in sys.argv:
    env = dict(os.environ, CAR='carousels-semaine', PYTHON=os.environ.get('PYTHON', sys.executable))
    subprocess.run(['node', 'scripts/render-carousels.mjs'] + [a for a in sys.argv[1:] if a != '--rendu'], cwd=VIDEO, env=env, check=True)
