"""20 carrousels de conversion vers l'app (offre : 3 jours de Benef Starter offerts, option (a)).
Chaque carrousel : une accroche (histoire, concept ou chiffre), la preuve, la proposition de valeur de l'outil
(« tu colles ton annonce, tu as… »), puis le pass. Une idée par image, vocabulaire de débutant.
Chiffres : vraies annonces analysées le 3 oct. 2026 (web/src/lib/demo.ts), guide débutant, calculateur de la page Benef,
faits vérifiés (carte grise 2026, CT 78 €, URSSAF 12,3 %, HistoVec, Leboncoin). Histoires POV : inventées, jamais présentées comme vraies.
Gains montrés comme des exemples calculés, jamais promis (Code de la consommation, L121-2).
Éléments graphiques (dessinés en code, aucune image générée) : échelle de prix, jauge du moteur, barre « où part l'argent »,
barres comparées, tirages photo des vraies annonces, tampon de verdict, icônes au trait. Image 1 : photo Pexels (photos/)."""
import json, os

def S(**k): return k
def LISTING(src, t, p, l=None, island=None, ph=360, pos='50% 50%', n=3, note=None, nx=None, ny=None):
    return dict(k='listing', src=src, t=t, m=None, p=p, l=l, note=note, nx=nx, ny=ny, n=n, pos=pos, island=island, ph=ph)
def ISLAND(t, state=None, sub=None): return dict(k='island', t=t, sub=sub, state=state)
def BIG(v, cap=None, tone=None): return dict(k='big', v=v, cap=cap, tone=tone)
def ROWS(*items, lab=None): return dict(k='rows', items=[list(i) for i in items], lab=lab)
def PILLS(*items): return dict(k='pills', items=[list(i) for i in items])
def TICKET(*items, tot, totLab='Total', tone='', lab=None): return dict(k='ticket', items=[list(i) for i in items], tot=tot, totLab=totLab, tone=tone, lab=lab)
def VS(a, b): return dict(k='vs', a=a, b=b)
def CHAT(*items, v='Le vendeur', m='Toi'): return dict(k='chat', items=[list(i) for i in items], v=v, m=m)
def LIST(*items): return dict(k='list', items=[list(i) if isinstance(i, tuple) else i for i in items])
def TL(*items): return dict(k='tl', items=[list(i) for i in items])
def QUOTE(t, lab=None): return dict(k='quote', t=t, lab=lab)
# échelle de prix : points (valeur, texte, libellé, ton, 'h' au-dessus ou 'b' dessous) ; bande (de, à, texte, ton)
def RULER(lo, hi, *points, band=None, lab=None): return dict(k='ruler', min=lo, max=hi, points=[list(p) for p in points], band=list(band) if band else None, lab=lab)
def GAUGES(*items): return dict(k='gauges', items=[list(i) for i in items])          # (note sur 10, libellé, sous-titre)
def STACK(tot, *segs, lab=None): return dict(k='stack', tot=tot, lab=lab, segs=[list(s) for s in segs])  # (libellé, valeur, texte, a|f|f2|f3|m|p)
def BARS(*items, room=64): return dict(k='bars', items=[list(i) for i in items], room=room)               # (libellé, valeur, texte, ton)
def PRINTS(*items, rot=None): return dict(k='prints', items=[list(i) for i in items], rot=rot)            # (photo, cadrage, légende, tampon, zoom)
def STAMP(c, t, tone='ok'): return dict(c, stamp=[t, tone])

CREDITS = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'photos', 'credits.json'), encoding='utf-8'))
def HERO(photo, kicker, title, pos='50% 45%'):
    a = CREDITS[photo]['auteur']
    return S(hero=dict(src=f'photos/{photo}.webp', pos=pos), top=800, kicker=kicker, title=title, swipe="Glisse →",
             credit=f"Photo : {a + ', ' if a else ''}Pexels")

OFFRE = {'pass': True, 'badge': "Sans carte bancaire", 'n': "3", 'l1': "jours de Benef\nofferts", 'codeLab': "Sur le site",
         'word': "utopicar.fr", 'l2': "Marge, prix d'offre,\nprix max", 'gets': [], 'btn': "Lien dans ma bio →",
         'ou': "Colle l'annonce, vois ta marge."}
CLIO = dict(src='img/clio-1.webp', t="Renault Clio IV", p="6 700 €", pos='30% 70%')
YARIS = dict(src='img/yaris-1.webp', t="Toyota Yaris III", p="10 999 €", pos='50% 60%')
P208 = dict(src='img/208-4.webp', t="Peugeot 208 PureTech", p="7 190 €", pos='50% 62%')
PREUVE = "Vraie annonce Leboncoin du 3 octobre 2026, analysée par utopicar"
PREUVES = "Vraies annonces du 3 octobre 2026, analysées par utopicar"
DEMO = "Exemple chiffré, pas une promesse de gain. Avant trajet et charges."
GOLF = "Exemple calculé par l'outil sur des données de démonstration"
# les 3 vraies annonces en tirages (zoom : coupe les filigranes de plateforme dans les coins)
T_CLIO = ('img/clio-1.webp', '40% 55%', "Clio, 6 700 €")
T_YARIS = ('img/yaris-1.webp', '50% 35%', "Yaris, 10 999 €")
T_208 = ('img/208-1.webp', '62% 35%', "208, 7 190 €")
def TIRAGES(st=None):
    st = st or [None, None, None]
    return PRINTS(T_CLIO + (st[0], 1.05), T_YARIS + (st[1], 1.25), T_208 + (st[2], 1.3))

def ANN(a, island="Analyse en cours…", **k): return dict(LISTING(a['src'], a['t'], a['p'], pos=a['pos'], island=dict(t=island) if island else None, **k), vraie=True)
# la proposition de valeur : « tu colles l'annonce, tu as ça, ça et ça ».
# Sur une vraie annonce : ce que l'outil a vraiment rendu pour elle (web/src/lib/demo.ts), tamponné du verdict ;
# Benef ajoute la marge et le prix max. Ailleurs : chaque ligne dit à quoi elle sert.
V_CLIO = (("Prix du marché", "7 550 €", 'neu', 'prix'), ("Prix à proposer", "6 250 €", 'ok', 'chat'), ("Moteur", "8/10", 'ok', 'moteur'), ("Verdict", "Bon prix", 'ok', 'check'))
V_YARIS = (("Prix du marché", "8 350 €", 'neu', 'prix'), ("Prix à proposer", "8 050 €", 'ok', 'chat'), ("Moteur", "8/10", 'ok', 'moteur'), ("Verdict", "Trop cher", 'warn', 'alerte'))
V_208 = (("Prix réel", "8 840 €", 'bad', 'prix'), ("Travaux à prévoir", "1 650 €", 'bad', 'outil'), ("Moteur", "4/10", 'bad', 'moteur'), ("Verdict", "Déconseillée", 'bad', 'x'))
V_GENERAL = (("Ta marge nette", "ce qu'il te reste", 'ok txt', 'euro'), ("Ton prix d'offre", "ce que tu dis", 'ok txt', 'chat'),
             ("Ton prix max", "ta limite", 'ok txt', 'plafond'), ("Le verdict", "GO ou NO GO", 'ok txt', 'check'))
TAMPON = {id(V_CLIO): ("Bon prix", 'ok'), id(V_YARIS): ("Trop cher", 'warn'), id(V_208): ("Déconseillée", 'bad')}
def VALEUR(rows=V_GENERAL):
    reel = rows is not V_GENERAL
    c = ROWS(*rows, lab="Résultat de l'analyse" if reel else None)
    if reel: c = STAMP(c, *TAMPON[id(rows)])
    return S(fill=0.8, title="Tu colles l'annonce.\nTu as *ça* :", comp=[c], body2="Avec Benef, en plus : ta marge et ton prix max." if reel else None)
FIN = S(title="Essaie avec\n*ta prochaine annonce*.")

def car(id_, slug, titre, legende, tags, slides, valeur=V_GENERAL):
    assert len(titre) <= 90, titre
    return dict(id=id_, slug=slug, offer=OFFRE, car=None, titre=titre, legende=legende, tags=tags,
                slides=slides + [VALEUR(valeur), FIN])

T_DEB = ['#achatreventevoiture', '#leboncoinvoiture', '#debutant']
T_ARG = ['#achatrevente', '#revenucomplementaire', '#voitureoccasion']
T_PIEGE = ['#voitureoccasion', '#leboncoin', '#achatrevente']

# échelles de prix des vraies annonces
R_CLIO = RULER(6000, 7800, (6250, "6 250 €", "Prix à proposer", 'ok', 'b'), (6700, "6 700 €", "Prix affiché", 'o', 'h'),
               (7550, "7 550 €", "Prix du marché", '', 'b'), band=(6700, 7550))
R_YARIS = RULER(7800, 11400, (8050, "8 050 €", "Prix à proposer", 'ok', 'b'), (8350, "8 350 €", "Prix du marché", '', 'h'),
                (10999, "10 999 €", "Prix affiché", 'bad', 'h'), band=(8350, 10999, None, 'bad'))

APP20 = [
car('P01', 'marge-89-ou-539', "Même Clio : 89 € de marge, ou 539 €", "Vraie annonce, Clio IV à 6 700 €. Au prix affiché, il te reste 89 €. Au prix conseillé par l'analyse, 539 €.", T_DEB, [
  S(kicker="Ta 1re voiture à revendre", title="89 € de marge.\nOu *539 €*.", comp=[ANN(CLIO)], swipe="Glisse →"),
  S(comp=[ISLAND("Verdict : bon prix", 'ok'), R_CLIO], body2="Elle est sous le prix du marché, choc compris.", credit=PREUVE),
  S(title="La négo vaut\n*450 €*.", comp=[BARS(("Payée 6 700 € : ta marge", 89, "89 €", 'neu'), ("Payée 6 250 € : ta marge", 539, "539 €", 'ok'))],
    credit=DEMO)], valeur=V_CLIO),
car('P02', 'yaris-3000-trop-chere', "Yaris à 10 999 € : près de 3 000 € au-dessus du marché", "Vraie annonce. Moteur fiable, garantie 12 mois, mais l'analyse propose 8 050 €.", T_PIEGE, [
  S(kicker="Belle, fiable, garantie", title="Et *2 949 €*\ntrop chère.", comp=[ANN(YARIS)], swipe="Glisse →"),
  S(comp=[ISLAND("Verdict : trop cher", 'ok'), R_YARIS], body2="Le marché est à 8 350 €.", credit=PREUVE),
  S(title="Tu proposes\n*8 050 €*.", comp=[BARS(("Prix affiché", 10999, "10 999 €", 'neu'), ("Ton offre", 8050, "8 050 €", 'ok'), room=58)],
    body2="2 949 € de moins que l'annonce.")], valeur=V_YARIS),
car('P03', '208-1650-travaux', "208 PureTech à 7 190 € : 1 650 € de travaux que l'annonce ne dit pas", "Vraie annonce : pas un mot sur la courroie. L'analyse : moteur noté 4/10, déconseillée.", T_PIEGE, [
  S(kicker="Rien sur la courroie", title="*1 650 €*\nde travaux cachés.", comp=[ANN(P208)], swipe="Glisse →"),
  S(title="Son vrai prix :\n*8 840 €*.", comp=[STACK("8 840 €", ("Prix affiché", 7190, "7 190 €", 'a'), ("Pneus, freins, révision, courroie", 1650, "1 650 €", 'p'), lab="Prix réel")],
    body2="Le marché, lui, est à 5 950 €.", credit=PREUVE),
  S(comp=[ISLAND("Analyse terminée", 'ok'), STAMP(GAUGES((4, "1.2 PureTech 110", "courroie dans l'huile")), "Déconseillée", 'bad')])], valeur=V_208),
car('P04', 'trois-annonces-une-seule', "3 vraies annonces, une seule à acheter : laquelle ?", "Clio à 6 700 €, Yaris à 10 999 €, 208 à 7 190 €. Trois verdicts de l'analyse. Tu avais choisi laquelle ?", T_DEB, [
  S(kicker="3 vraies annonces Leboncoin", title="Une seule\nest à *acheter*.", comp=[TIRAGES()], swipe="Glisse →"),
  S(title="La *Clio*.", comp=[TIRAGES([("Bon prix", 'ok'), ("Trop cher", 'warn'), ("Déconseillée", 'bad')])], credit=PREUVES),
  S(title="La moins belle\nétait la *bonne*.", comp=[PRINTS(('img/clio-2.webp', '50% 45%', "choc compris", None, 1.0), rot=[3])],
    body2="425 € sous le prix du marché.")]),
car('P05', 'pov-premier-appel', "POV : premier appel au vendeur, tu ne sais pas quoi proposer", "Le vendeur demande ton prix. Sans chiffre, tu dis oui au prix affiché. Avec l'analyse, tu as ton prix d'offre avant d'appeler.", T_DEB, [
  S(kicker="POV : ton premier appel", title="« Vous proposez\n*combien* ? »", comp=[CHAT(["v", "Alors, vous proposez combien ?"], ["m", "Euh…"])], swipe="Glisse →"),
  S(title="Sans chiffre,\ntu dis *oui*.", comp=[CHAT(["m", "6 700, c'est bon pour moi."]), BIG("89 €", cap="de marge.", tone='r')]),
  S(title="Avec l'analyse :\n*6 250 €*.", comp=[CHAT(["m", "Je vous propose 6 250 €, le choc est à reprendre."]), BIG("539 €", cap="de marge.", tone='g')], credit=DEMO)], valeur=V_CLIO),
car('P06', 'golf-perte-1200', "Golf achetée 9 500 €, revendue 9 800 €, et 1 200 € de perte", "300 € d'écart sur le papier, 1 500 € de frais en vrai. Le prix max était 7 500 €.", T_ARG, [
  HERO('golf-gti', "Achetée 9 500 €, revendue 9 800 €", "Et tu perds\n*1 200 €*.", pos='50% 60%'),
  S(title="Les *frais*\nqu'on oublie.", comp=[STAMP(TICKET(("Remise en état", "1 100 €"), ("Carte grise", "186 €"), ("Trajet", "64 €"), ("CT, nettoyage, annonce", "150 €"),
                                                  tot="1 500 €", totLab="Frais", tone='r', lab="Les frais de la Golf"), "Oubliés", 'bad')], credit=GOLF),
  S(title="Ton prix max :\n*7 500 €*.", comp=[STACK("9 800 €", ("Ton prix max", 7500, "7 500 €", 'a'), ("Frais", 1500, "1 500 €", 'f'), ("Ta marge minimum", 800, "800 €", 'm'), lab="Revente")],
    body2="Au-dessus, tu passes à l'annonce suivante.", credit=GOLF)]),
car('P07', 'embrayage-oublie', "Même Clio, même prix : +670 € ou −130 €", "Un embrayage oublié efface la marge. L'analyse chiffre chaque défaut écrit dans l'annonce.", T_ARG, [
  HERO('levier-vitesse', "Même Clio, même prix", "*+670 €*\nou −130 €.", pos='78% 50%'),
  S(title="Bien achetée :\n*+670 €*.", comp=[STACK("6 300 €", ("Achat", 5000, "5 000 €", 'a'), ("Frais", 630, "630 €", 'f'), ("Ta marge", 670, "670 €", 'm'), lab="Revente")], credit=DEMO),
  S(title="Embrayage oublié :\n*−130 €*.", comp=[STAMP(TICKET(("Revente", "6 300 €"), ("Achat", "− 5 000 €"), ("Frais + embrayage", "− 1 430 €"), tot="− 130 €", totLab="Marge", tone='r', lab="Avec l'embrayage"),
                                                   "Marge effacée", 'bad')], credit=DEMO)]),
car('P08', 'cinq-minutes', "La bonne affaire part en 5 minutes : ton verdict, avant", "Sur Leboncoin, les bonnes annonces partent vite. Colle le lien, tu as ta marge avant d'appeler.", T_DEB, [
  HERO('chrono', "18 h 02 : la Clio sort", "18 h 07 :\n*vendue*.", pos='50% 45%'),
  S(title="Tu calculais\nencore ta *marge*.", comp=[TL(("18 h 02", "la Clio sort"), ("18 h 03", "tu sors la calculatrice", 'x'), ("18 h 07", "vendue, à quelqu'un d'autre", 'x'))]),
  S(title="Colle le lien.\nTa marge *tombe*.", comp=[ISLAND("Analyse terminée : GO", 'ok'),
    ROWS(("Ta marge", "539 €", 'ok', 'euro'), ("Prix à proposer", "6 250 €", 'ok', 'chat'))], credit=DEMO)]),
car('P09', 'carte-grise-oubliee', "La carte grise que les débutants oublient dans leur marge", "Chevaux × tarif de ta région, divisé par 2 après 10 ans, + 13,76 €. De 119 € à 186 € pour une Clio de 5 CV.", T_DEB, [
  HERO('signature', "Ta 1re voiture à revendre", "*186 €*\nque tu n'as\npas comptés.", pos='50% 55%'),
  S(title="La carte grise\nse *calcule*.", comp=[TICKET(("Clio 5 CV × 68,95 €", "344,75 €"), ("Plus de 10 ans : ÷ 2", "172,38 €"), ("Gestion et envoi", "+ 13,76 €"),
                                                      tot="186 €", totLab="Île-de-France", tone='r')],
    credit="Tarifs 2026 : 42 €/CV (Hauts-de-France) à 68,95 €/CV (Île-de-France)"),
  S(title="L'analyse la\ncompte *pour toi*.", comp=[LIST(("Carte grise", "selon chevaux et région", 'doc'), ("Trajet", "0,20 € du kilomètre", 'route'),
                                                          ("Contrôle technique", "78 € en moyenne", 'check'), ("Réparations", "lues dans l'annonce", 'outil'))])]),
car('P10', 'urssaf-1476', "Achetée 10 000 €, revendue 12 000 € : l'URSSAF prend 1 476 €", "En micro-entreprise, l'URSSAF prend 12,3 % du prix de vente, pas de la marge. Compte-le avant d'acheter.", T_ARG, [
  HERO('impots', "Micro-entreprise", "+2 000 € de marge.\nL'URSSAF : *1 476 €*.", pos='50% 50%'),
  S(title="12,3 % du\n*prix de vente*.", body="Pas de la marge.", comp=[STACK("12 000 €", ("Achat", 10000, "10 000 €", 'a'), ("URSSAF, 12,3 %", 1476, "1 476 €", 'p'),
                                                                                    ("Il te reste", 524, "524 €", 'm'), lab="Prix de vente")],
    credit="economie.gouv.fr, 2026. Avant les autres frais"),
  S(title="Ta marge se décide\nà *l'achat*.", comp=[BARS(("Achetée 10 000 €", 524, "524 €", 'neu'), ("Achetée 9 500 €", 1024, "1 024 €", 'ok'))],
    body2="Revendue 12 000 € dans les deux cas.", credit="Exemple calculé, avant les autres frais")]),
car('P11', 'compteur-histovec', "89 000 km au compteur, 162 000 au dernier contrôle technique", "Demande le rapport HistoVec avant le trajet : il montre le kilométrage de chaque CT depuis 2021.", T_PIEGE, [
  HERO('compteur-audi', "Clio de 2012, annonce Leboncoin", "89 000 km.\nLe CT dit *162 000*.", pos='62% 50%'),
  S(title="Le *HistoVec*.", body="Gratuit et officiel :", comp=[LIST(("Kilométrage de chaque CT", "depuis 2021", 'jauge'), ("Gage ou opposition", None, 'bouclier'),
                                                                     ("Propriétaires successifs", None, 'doc'), ("Véhicule endommagé", None, 'alerte'))]),
  S(title="L'analyse lit\nles *signaux*.", comp=[ROWS(("Compteur suspect", "NO GO", 'bad', 'jauge'), ("Gage", "NO GO", 'bad', 'bouclier'), ("Défaut bloquant", "NO GO", 'bad', 'alerte'))],
    body2="Un seul suffit.")]),
car('P12', 'trajet-pour-rien', "4 heures de route pour une voiture qui ne valait pas le trajet", "Avant de rouler, colle l'annonce : verdict, défauts et questions au vendeur.", T_DEB, [
  HERO('plein-essence', "POV : samedi, 6 h du matin", "4 h de route.\nPour *rien*.", pos='45% 50%'),
  S(title="Les défauts\nétaient *écrits*.", comp=[QUOTE("« Bon état général, ==petit bruit à l'embrayage==, ==clim à recharger==. »", lab="L'annonce disait :")]),
  S(title="L'analyse les\n*chiffre*.", comp=[ROWS(("Clim à recharger", "50 à 100 €", 'warn', 'temp'), ("Embrayage à prévoir", "600 € et +", 'bad', 'outil'))])]),
car('P13', 'dico-annonces', "« Petit bruit, rien de grave » : ce que l'annonce veut dire", "Chaque phrase d'annonce cache une ligne de frais. L'analyse la chiffre avant ton appel.", T_PIEGE, [
  HERO('phare-rouille', "Le dico des annonces", "« Petit bruit,\nrien de *grave* »", pos='30% 50%'),
  S(title="Traduction :", comp=[ROWS(("« Clim à recharger »", "fuite ?", 'warn', 'temp'), ("« Embrayage un peu dur »", "600 € +", 'bad', 'outil'), ("« Vendue sans CT »", "à toi", 'bad', 'doc'))]),
  S(title="L'analyse lit\nl'annonce *pour toi*.", comp=[QUOTE("« Vendue sans CT, ==embrayage un peu dur==, ==clim à recharger==. »", lab="Les phrases qui coûtent, surlignées :")])]),
car('P14', 'prix-max-avant-appel', "Le seul chiffre à connaître avant d'appeler un vendeur", "Prix max = revente − frais − ta marge minimum. Au-dessus, tu passes.", T_DEB, [
  HERO('appel', "Avant d'appeler", "Un seul\n*chiffre*.", pos='35% 40%'),
  S(title="Ton *prix max*.", comp=[STACK("9 800 €", ("Ton prix max", 7500, "7 500 €", 'a'), ("Frais", 1500, "1 500 €", 'f'), ("Ta marge minimum", 800, "800 €", 'm'), lab="Revente")],
    body2="Revente − frais − ta marge minimum.", credit=GOLF),
  S(title="Au-dessus,\ntu *passes*.", comp=[STAMP(RULER(7000, 10000, (7500, "7 500 €", "Ton prix max", 'ok', 'b'), (9500, "9 500 €", "Le vendeur demande", 'bad', 'h'),
                                                       band=(7500, 9500, None, 'bad')), "Tu passes", 'bad bas')], credit=GOLF)]),
car('P15', 'moteurs-a-fuir', "5 moteurs qui mangent ta marge (jusqu'à 10 000 €)", "PureTech, TCe 120, EcoBoost, TSI, N13 : les années à éviter. L'analyse note chaque moteur.", T_PIEGE, [
  HERO('courroie', "5 moteurs à fuir", "Jusqu'à *10 000 €*\nde moteur.", pos='40% 50%'),
  S(title="La *liste*.", comp=[STAMP(ROWS(("1.2 PureTech", "2013-2022", 'bad'), ("1.2 TCe 120", "2012-2016", 'bad'), ("1.0 EcoBoost", "2011-2018", 'bad'), ("1.4 TSI", "2008-2012", 'bad'), lab="Années à éviter"),
                                     "À fuir", 'bad')], credit="Coûts relevés dans la presse auto et chez des propriétaires"),
  S(title="L'analyse note\nle *moteur*.", comp=[GAUGES((8, "Clio 0.9 TCe 90", "fiable"), (4, "208 1.2 PureTech", "à éviter"))], credit=PREUVES)]),
car('P16', 'leboncoin-3e-annonce', "Ta 3e voiture de l'année sur Leboncoin : l'annonce devient payante", "2 annonces auto gratuites sur 12 mois, la 3e payante. Encore un frais à mettre dans ta marge.", T_ARG, [
  HERO('photo-annonce', "Ta 3e voiture de l'année", "L'annonce\ndevient *payante*.", pos='40% 55%'),
  S(title="Sur *12 mois*.", comp=[TL(("Voiture 1", "annonce gratuite", 'v'), ("Voiture 2", "annonce gratuite", 'v'), ("Voiture 3", "59,90 à 79,90 €", 'x'))],
    credit="Conditions Leboncoin, 12 mois glissants ; montants selon la presse"),
  S(title="Chaque frais\nmange ta *marge*.", comp=[LIST(("Annonce", "dès la 3e voiture", 'prix'), ("Carte grise", "selon chevaux et région", 'doc'),
                                                         ("Trajet", "0,20 € du kilomètre", 'route'), ("Contrôle technique", "78 € en moyenne", 'check'))],
    body2="L'analyse les compte tous.")]),
car('P17', 'trois-cartes-grises-faux', "« 3 cartes grises par an maximum » : faux", "La loi ne fixe aucun nombre : elle regarde l'habitude et l'intention de revendre (Code de commerce, L110-1 et L121-1).", T_DEB, [
  HERO('justice', "Tu te lances à côté du boulot", "« 3 cartes grises\npar an max. » *Faux*.", pos='50% 55%'),
  S(title="La loi regarde\nl'*habitude*.", comp=[LIST(("Acheter pour revendre", "l'intention", 'prix'), ("Le faire souvent", "l'habitude", 'cal'))],
    body2="Les deux : tu es commerçant.", credit="Code de commerce, art. L110-1 et L121-1"),
  S(title="Déclaré, tu suis\nta *vraie marge*.", comp=[ROWS(("Micro-entreprise", "en ligne", 'ok txt', 'doc'), ("URSSAF", "12,3 % des ventes", 'warn txt', 'banque'),
                                                            ("Ta marge", "calculée nette", 'ok txt', 'euro'))],
    body2="Information générale, pas un conseil juridique.")]),
car('P18', 'deux-mille-euros', "Te lancer avec 2 000 € : jamais plus de 1 500 € sur la voiture", "Garde 500 € pour la carte grise, les pneus et l'imprévu. Ton prix max se calcule avant l'appel.", T_ARG, [
  HERO('citadine-rouge', "Tu te lances avec 2 000 €", "Ta voiture :\n*1 500 €* max.", pos='43% 60%'),
  S(title="Les *500 €*\nqui restent.", comp=[STACK("2 000 €", ("La voiture", 1500, "1 500 €", 'a'), ("Carte grise", 110, "≈ 110 €", 'f'), ("2 pneus", 120, "≈ 120 €", 'f2'),
                                                     ("Imprévu", 270, "≈ 270 €", 'f3'), lab="Ton budget")]),
  S(title="Une voiture,\nun *prix max*.", comp=[VS(("Au feeling", ["« Elle a l'air bien »"]), ("Avec ton prix max", ["**1 500 €**", "pas un euro de plus"]))],
    body2="Calculé avant l'appel.")]),
car('P19', 'achete-6250-revends-7550', "Achète 6 250 €, revends 7 550 € : ce qui reste vraiment", "Revente − achat − réparation − carte grise − frais : 539 € sur cette vraie Clio.", T_ARG, [
  S(kicker="Ta 1re voiture à revendre", title="Achète 6 250 €.\nRevends *7 550 €*.", comp=[ANN(dict(CLIO, src='img/clio-2.webp', pos='50% 45%'), island=None)], swipe="Glisse →"),
  S(title="Il reste\n*539 €*.", comp=[STACK("7 550 €", ("Achat", 6250, "6 250 €", 'a'), ("Choc", 425, "425 €", 'f'), ("Carte grise", 186, "186 €", 'f2'),
                                              ("CT, nettoyage, annonce", 150, "150 €", 'f3'), ("Ta marge", 539, "539 €", 'm'), lab="Revente au prix du marché")], credit=DEMO),
  S(title="Pas *1 300 €*.", comp=[BARS(("L'écart affiché", 1300, "1 300 €", 'neu'), ("Ta vraie marge", 539, "539 €", 'ok'))],
    body2="L'écart affiché n'est pas ta marge.")], valeur=V_CLIO),
car('P20', 'pov-dimanche-soir', "POV : dimanche soir, 12 annonces ouvertes, laquelle appeler ?", "Colle chaque lien : marge, prix d'offre, verdict. Tu appelles seulement celles qui passent.", T_DEB, [
  HERO('dimanche-soir', "POV : dimanche soir", "12 annonces.\nLaquelle *appeler* ?", pos='50% 50%'),
  S(title="Tu colles\nles *liens*.", comp=[ROWS(("Annonce 1", "NO GO", 'bad', 'lien'), ("Annonce 2", "GO", 'ok', 'lien'), ("Annonce 3", "NO GO", 'bad', 'lien'))]),
  S(title="Tu appelles\n*la bonne*.", comp=[ISLAND("Annonce 2 : GO", 'ok'), CHAT(["m", "Bonjour, elle est toujours disponible ?"])],
    body2="Les autres ne te coûtent pas un trajet.")]),
]
