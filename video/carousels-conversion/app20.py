"""20 carrousels de conversion vers l'app (offre : 3 jours de Benef Starter offerts, option (a)).
Chaque carrousel : une accroche (histoire, concept ou chiffre), la preuve, la proposition de valeur de l'outil
(« tu colles ton annonce, tu as… »), puis le pass. Une idée par image, vocabulaire de débutant.
Chiffres : vraies annonces analysées le 3 oct. 2026 (web/src/lib/demo.ts), guide débutant, calculateur de la page Benef,
faits vérifiés (carte grise 2026, CT 78 €, URSSAF 12,3 %, HistoVec, Leboncoin). Histoires POV : inventées, jamais présentées comme vraies.
Gains montrés comme des exemples calculés, jamais promis (Code de la consommation, L121-2)."""

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

OFFRE = {'pass': True, 'badge': "Sans carte bancaire", 'n': "3", 'l1': "jours de Benef\nofferts", 'codeLab': "Sur le site",
         'word': "utopicar.fr", 'l2': "Marge, prix d'offre,\nprix max", 'gets': [], 'btn': "Lien dans ma bio →",
         'ou': "Colle l'annonce, vois ta marge."}
CLIO = dict(src='img/clio-1.webp', t="Renault Clio IV", p="6 700 €", pos='30% 70%')
YARIS = dict(src='img/yaris-1.webp', t="Toyota Yaris III", p="10 999 €", pos='50% 60%')
P208 = dict(src='img/208-4.webp', t="Peugeot 208 PureTech", p="7 190 €", pos='50% 62%')
PREUVE = "Vraie annonce Leboncoin du 3 octobre 2026, analysée par utopicar"
DEMO = "Exemple chiffré, pas une promesse de gain. Avant trajet et charges."

def ANN(a, island="Analyse en cours…", **k): return dict(LISTING(a['src'], a['t'], a['p'], pos=a['pos'], island=dict(t=island) if island else None, **k), vraie=True)
# la proposition de valeur, toujours la même : ce que la personne a en collant son annonce
def VALEUR(titre="Tu colles l'annonce.\nTu as *ça* :"):
    return S(title=titre, comp=[ROWS(("Ta marge nette", "✓", 'ok'), ("Ton prix d'offre", "✓", 'ok'), ("Ton prix max", "✓", 'ok'),
                                     ("Le verdict GO / NO GO", "✓", 'ok'))])
FIN = S(title="Essaie avec\n*ta prochaine annonce*.")

def car(id_, slug, titre, legende, tags, slides):
    assert len(titre) <= 90, titre
    return dict(id=id_, slug=slug, offer=OFFRE, car=None, titre=titre, legende=legende, tags=tags,
                slides=slides + [VALEUR(), FIN])

T_DEB = ['#achatreventevoiture', '#leboncoinvoiture', '#debutant']
T_ARG = ['#achatrevente', '#revenucomplementaire', '#voitureoccasion']
T_PIEGE = ['#voitureoccasion', '#leboncoin', '#achatrevente']

APP20 = [
car('P01', 'marge-89-ou-539', "Même Clio : 89 € de marge, ou 539 €", "Vraie annonce, Clio IV à 6 700 €. Au prix affiché, il te reste 89 €. Au prix conseillé par l'analyse, 539 €.", T_DEB, [
  S(kicker="Ta 1re voiture à revendre", title="89 € de marge.\nOu *539 €*.", comp=[ANN(CLIO)], swipe="Glisse →"),
  S(comp=[ISLAND("Verdict : bon prix", 'ok'), BIG("425 €", cap="sous le prix du marché.", tone='g')], credit=PREUVE),
  S(title="La négo vaut\n*450 €*.", comp=[VS(("Au prix affiché", ["Payée 6 700 €", "**89 €**\nde marge"]), ("Au prix conseillé", ["Payée 6 250 €", "**539 €**\nde marge"]))], credit=DEMO)]),
car('P02', 'yaris-3000-trop-chere', "Yaris à 10 999 € : près de 3 000 € au-dessus du marché", "Vraie annonce. Moteur fiable, garantie 12 mois, mais l'analyse propose 8 050 €.", T_PIEGE, [
  S(kicker="Belle, fiable, garantie", title="Et *2 949 €*\ntrop chère.", comp=[ANN(YARIS)], swipe="Glisse →"),
  S(comp=[ISLAND("Verdict : trop cher", 'ok'), BIG("8 350 €", cap="le prix du marché\npour cette Yaris.", tone='o')], credit=PREUVE),
  S(title="Tu proposes\n*8 050 €*.", comp=[PILLS(("2 949 € de moins que l'annonce", 'ok'))])]),
car('P03', '208-1650-travaux', "208 PureTech à 7 190 € : 1 650 € de travaux que l'annonce ne dit pas", "Vraie annonce : pas un mot sur la courroie. L'analyse : moteur noté 4/10, déconseillée.", T_PIEGE, [
  S(kicker="Rien sur la courroie", title="*1 650 €*\nde travaux cachés.", comp=[ANN(P208)], swipe="Glisse →"),
  S(title="Son vrai prix :\n*8 840 €*.", comp=[TICKET(("Prix affiché", "7 190 €"), ("Pneus, freins, révision, courroie", "+ 1 650 €"), tot="8 840 €", totLab="Prix réel", tone='r')], credit=PREUVE),
  S(comp=[ISLAND("Verdict : déconseillée", 'ok'), BIG("4/10", cap="la note du moteur\n1.2 PureTech 110.", tone='r')])]),
car('P04', 'trois-annonces-une-seule', "3 vraies annonces, une seule à acheter : laquelle ?", "Clio à 6 700 €, Yaris à 10 999 €, 208 à 7 190 €. Trois verdicts de l'analyse. Tu avais choisi laquelle ?", T_DEB, [
  S(kicker="3 vraies annonces Leboncoin", title="Une seule\nest à *acheter*.", comp=[ROWS(("Clio IV · 6 700 €", "?", 'neu'), ("Yaris · 10 999 €", "?", 'neu'), ("208 · 7 190 €", "?", 'neu'))], swipe="Glisse →"),
  S(title="La *Clio*.", comp=[ROWS(("Clio IV", "Bon prix", 'ok'), ("Yaris", "Trop cher", 'warn'), ("208", "Déconseillée", 'bad'))], credit="Vraies annonces du 3 octobre 2026, analysées par utopicar"),
  S(title="La moins belle\nétait la *bonne*.", body="Un choc sur l'aile, et 425 € sous le prix du marché.")]),
car('P05', 'pov-premier-appel', "POV : premier appel au vendeur, tu ne sais pas quoi proposer", "Le vendeur demande ton prix. Sans chiffre, tu dis oui au prix affiché. Avec l'analyse, tu as ton prix d'offre avant d'appeler.", T_DEB, [
  S(kicker="POV : ton premier appel", title="« Vous proposez\n*combien* ? »", comp=[CHAT(["v", "Alors, vous proposez combien ?"], ["m", "Euh…"])], swipe="Glisse →"),
  S(title="Sans chiffre,\ntu dis *oui*.", comp=[CHAT(["m", "6 700, c'est bon pour moi."])], body2="Il te reste 89 € de marge."),
  S(title="Avec l'analyse :\n*6 250 €*.", comp=[CHAT(["m", "Je vous propose 6 250 €, le choc est à reprendre."])], body2="Il te reste 539 €.", credit=DEMO)]),
car('P06', 'golf-perte-1200', "Golf achetée 9 500 €, revendue 9 800 €, et 1 200 € de perte", "300 € d'écart sur le papier, 1 500 € de frais en vrai. Le prix max était 7 500 €.", T_ARG, [
  S(kicker="Achetée 9 500 €, revendue 9 800 €", title="Et tu perds\n*1 200 €*.", swipe="Glisse →"),
  S(title="Les *frais*\nqu'on oublie.", comp=[TICKET(("Remise en état", "1 100 €"), ("Carte grise", "186 €"), ("Trajet", "64 €"), ("CT, nettoyage, annonce", "150 €"), tot="1 500 €", totLab="Frais", tone='r')], credit="Exemple calculé par l'outil sur des données de démonstration"),
  S(title="Ton prix max :\n*7 500 €*.", body="Au-dessus, tu passes à l'annonce suivante.")]),
car('P07', 'embrayage-oublie', "Même Clio, même prix : +670 € ou −130 €", "Un embrayage oublié efface la marge. L'analyse chiffre chaque défaut écrit dans l'annonce.", T_ARG, [
  S(kicker="Même Clio, même prix", title="*+670 €*\nou −130 €.", swipe="Glisse →"),
  S(title="Bien achetée :\n*+670 €*.", comp=[TICKET(("Revente", "6 300 €"), ("Achat", "− 5 000 €"), ("Frais", "− 630 €"), tot="+ 670 €", totLab="Marge", tone='g')], credit=DEMO),
  S(title="Embrayage oublié :\n*−130 €*.", comp=[TICKET(("Revente", "6 300 €"), ("Achat", "− 5 000 €"), ("Frais + embrayage", "− 1 430 €"), tot="− 130 €", totLab="Marge", tone='r')], credit=DEMO)]),
car('P08', 'cinq-minutes', "La bonne affaire part en 5 minutes : ton verdict, avant", "Sur Leboncoin, les bonnes annonces partent vite. Colle le lien, tu as ta marge avant d'appeler.", T_DEB, [
  S(kicker="18 h 02 : la Clio sort", title="18 h 07 :\n*vendue*.", swipe="Glisse →"),
  S(title="Tu calculais\nencore ta *marge*.", body="Cote, frais, carte grise, prix max : à la main, ça prend une soirée."),
  S(title="Colle le lien.\nTa marge *tombe*.", comp=[ISLAND("Analyse terminée : GO", 'ok')])]),
car('P09', 'carte-grise-oubliee', "La carte grise que les débutants oublient dans leur marge", "Chevaux × tarif de ta région, divisé par 2 après 10 ans, + 13,76 €. De 119 € à 186 € pour une Clio de 5 CV.", T_DEB, [
  S(kicker="Ta 1re voiture à revendre", title="*186 €*\nque tu n'as\npas comptés.", swipe="Glisse →"),
  S(title="La carte grise\nse *calcule*.", body="Chevaux × tarif de ta région, ÷ 2 après 10 ans, + 13,76 €.", credit="Tarifs 2026 : 42 €/CV (Hauts-de-France) à 68,95 €/CV (Île-de-France)"),
  S(title="L'analyse la\ncompte *pour toi*.", comp=[PILLS(("Carte grise ✓", 'ok'), ("Trajet ✓", 'ok'), ("CT ✓", 'ok'), ("Réparations ✓", 'ok'))])]),
car('P10', 'urssaf-1476', "Achetée 10 000 €, revendue 12 000 € : l'URSSAF prend 1 476 €", "En micro-entreprise, l'URSSAF prend 12,3 % du prix de vente, pas de la marge. Compte-le avant d'acheter.", T_ARG, [
  S(kicker="Micro-entreprise", title="+2 000 € de marge.\nL'URSSAF : *1 476 €*.", swipe="Glisse →"),
  S(title="12,3 % du\n*prix de vente*.", body="Pas de la marge. Source : economie.gouv.fr, 2026."),
  S(title="Ta marge se décide\nà *l'achat*.", body="Plus ton prix d'achat est juste, plus il te reste.")]),
car('P11', 'compteur-histovec', "89 000 km au compteur, 162 000 au dernier contrôle technique", "Demande le rapport HistoVec avant le trajet : il montre le kilométrage de chaque CT depuis 2021.", T_PIEGE, [
  S(kicker="Clio de 2012, annonce Leboncoin", title="89 000 km.\nLe CT dit *162 000*.", swipe="Glisse →"),
  S(title="Le *HistoVec*.", body="Gratuit et officiel. Le kilométrage de chaque contrôle technique, depuis 2021."),
  S(title="L'analyse lit\nles *signaux*.", comp=[PILLS(("Compteur suspect", 'bad'), ("Gage", 'bad'), ("Défaut bloquant", 'bad'))], body2="Un seul : verdict NO GO.")]),
car('P12', 'trajet-pour-rien', "4 heures de route pour une voiture qui ne valait pas le trajet", "Avant de rouler, colle l'annonce : verdict, défauts et questions au vendeur.", T_DEB, [
  S(kicker="POV : samedi, 6 h du matin", title="4 h de route.\nPour *rien*.", swipe="Glisse →"),
  S(title="Les défauts\nétaient *écrits*.", body="« Petit bruit », « clim à recharger » : l'annonce prévenait."),
  S(title="L'analyse les\n*chiffre*.", comp=[ROWS(("Clim à recharger", "50 à 100 €", 'warn'), ("Embrayage à prévoir", "600 € et +", 'bad'))])]),
car('P13', 'dico-annonces', "« Petit bruit, rien de grave » : ce que l'annonce veut dire", "Chaque phrase d'annonce cache une ligne de frais. L'analyse la chiffre avant ton appel.", T_PIEGE, [
  S(kicker="Le dico des annonces", title="« Petit bruit,\nrien de *grave* »", swipe="Glisse →"),
  S(title="Traduction :", comp=[ROWS(("« Clim à recharger »", "fuite ?", 'warn'), ("« Embrayage un peu dur »", "600 € +", 'bad'), ("« Vendue sans CT »", "à toi", 'bad'))]),
  S(title="L'analyse lit\nl'annonce *pour toi*.")]),
car('P14', 'prix-max-avant-appel', "Le seul chiffre à connaître avant d'appeler un vendeur", "Prix max = revente − frais − ta marge minimum. Au-dessus, tu passes.", T_DEB, [
  S(kicker="Avant d'appeler", title="Un seul\n*chiffre*.", swipe="Glisse →"),
  S(title="Ton *prix max*.", body="Revente − frais − ta marge minimum."),
  S(title="Au-dessus,\ntu *passes*.", comp=[VS(("Le vendeur", ["Demande 9 500 €"]), ("Ton prix max", ["**7 500 €**"]))], credit="Exemple : données de démonstration du guide")]),
car('P15', 'moteurs-a-fuir', "5 moteurs qui mangent ta marge (jusqu'à 10 000 €)", "PureTech, TCe 120, EcoBoost, TSI, N13 : les années à éviter. L'analyse note chaque moteur.", T_PIEGE, [
  S(kicker="5 moteurs à fuir", title="Jusqu'à *10 000 €*\nde moteur.", swipe="Glisse →"),
  S(title="La *liste*.", comp=[ROWS(("1.2 PureTech", "2013-2022", 'bad'), ("1.2 TCe 120", "2012-2016", 'bad'), ("1.0 EcoBoost", "2011-2018", 'bad'), ("1.4 TSI", "2008-2012", 'bad'))], credit="Coûts relevés dans la presse auto et chez des propriétaires"),
  S(title="L'analyse note\nle *moteur*.", comp=[PILLS(("Clio 0.9 TCe : 8/10", 'ok'), ("208 PureTech : 4/10", 'bad'))])]),
car('P16', 'leboncoin-3e-annonce', "Ta 3e voiture de l'année sur Leboncoin : l'annonce devient payante", "2 annonces auto gratuites sur 12 mois, la 3e payante. Encore un frais à mettre dans ta marge.", T_ARG, [
  S(kicker="Ta 3e voiture de l'année", title="L'annonce\ndevient *payante*.", swipe="Glisse →"),
  S(title="2 gratuites,\npuis *59,90 à 79,90 €*.", credit="Conditions Leboncoin, 12 mois glissants ; montants selon la presse"),
  S(title="Chaque frais\nmange ta *marge*.", body="L'analyse les compte tous, avant l'achat.")]),
car('P17', 'trois-cartes-grises-faux', "« 3 cartes grises par an maximum » : faux", "La loi ne fixe aucun nombre : elle regarde l'habitude et l'intention de revendre (Code de commerce, L110-1 et L121-1).", T_DEB, [
  S(kicker="Tu te lances à côté du boulot", title="« 3 cartes grises\npar an max. » *Faux*.", swipe="Glisse →"),
  S(title="La loi regarde\nl'*habitude*.", body="Acheter pour revendre, souvent : tu es commerçant.", credit="Code de commerce, art. L110-1 et L121-1"),
  S(title="Déclaré, tu suis\nta *vraie marge*.", body="Information générale, pas un conseil juridique.")]),
car('P18', 'deux-mille-euros', "Te lancer avec 2 000 € : jamais plus de 1 500 € sur la voiture", "Garde 500 € pour la carte grise, les pneus et l'imprévu. Ton prix max se calcule avant l'appel.", T_ARG, [
  S(kicker="Tu te lances avec 2 000 €", title="Ta voiture :\n*1 500 €* max.", swipe="Glisse →"),
  S(title="Les *500 €*\nqui restent.", comp=[ROWS(("Carte grise", "≈ 110 €", 'neu'), ("2 pneus", "≈ 120 €", 'neu'), ("Imprévu", "le reste", 'neu'))]),
  S(title="Une voiture,\nun *prix max*.", body="Calculé avant l'appel, pas au feeling.")]),
car('P19', 'achete-6250-revends-7550', "Achète 6 250 €, revends 7 550 € : ce qui reste vraiment", "Revente − achat − réparation − carte grise − frais : 539 € sur cette vraie Clio.", T_ARG, [
  S(kicker="Ta 1re voiture à revendre", title="Achète 6 250 €.\nRevends *7 550 €*.", comp=[ANN(CLIO, island=None)], swipe="Glisse →"),
  S(title="Il reste\n*539 €*.", comp=[TICKET(("Revente", "7 550 €"), ("Achat", "− 6 250 €"), ("Choc", "− 425 €"), ("Carte grise", "− 186 €"), ("CT, nettoyage, annonce", "− 150 €"), tot="539 €", totLab="Marge", tone='g')], credit=DEMO, align='flex-start'),
  S(title="Pas *1 300 €*.", body="L'écart affiché n'est pas ta marge.")]),
car('P20', 'pov-dimanche-soir', "POV : dimanche soir, 12 annonces ouvertes, laquelle appeler ?", "Colle chaque lien : marge, prix d'offre, verdict. Tu appelles seulement celles qui passent.", T_DEB, [
  S(kicker="POV : dimanche soir", title="12 annonces.\nLaquelle *appeler* ?", swipe="Glisse →"),
  S(title="Tu colles\nles *liens*.", comp=[ROWS(("Annonce 1", "NO GO", 'bad'), ("Annonce 2", "GO", 'ok'), ("Annonce 3", "NO GO", 'bad'))]),
  S(title="Tu appelles\n*la bonne*.", body="Les autres ne te coûtent pas un trajet.")]),
]
