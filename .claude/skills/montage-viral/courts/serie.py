"""Série « Débutant en achat-revente : une règle en 10 s » : 13 vidéos courtes (Reels, Shorts), une idée chacune.

Tirées des trois tournages avatar (voix et images d'origine, rien de nouveau n'est dit) :
- montage-4k : « 4 000 € pour te lancer » (5 vidéos : 208, Clio, Yaris, Corsa, diesel) ;
- montage-dv : « Déjà vendue » (4 vidéos : alertes, vendeur pressé, annonces mal faites, ventes de l'État) ;
- montage-cg : « Cartes grises » (4 vidéos : 6 par an, 3 critères, 1 mois, TVA sur la marge).

Chaque fiche : le projet source, les plans (temps de la source : début du 1er mot, début du dernier mot ; cadre « M »
moyen ou « C » serré), l'accroche (écrite avec art-du-hook, video/brief-courts-10s.md), la pastille ou la couleur
pleine, les plans d'illustration, la hauteur des sous-titres. Le langage visuel et sonore est celui de
design/LANGAGE-V4.md (habillage : montage-4k/scripts/v4.py, gen4.py ; son : montage-4k/work/mix4.py).
Pas de carte de fin : la vidéo finit 3 images après les lèvres fermées et boucle sur l'image 0.
"""

CTX = "DÉBUTANT EN ACHAT-REVENTE"
Q = 0.12   # queue : 3 images après la dernière image du dernier plan

COURTS = {}

# ------------------------------------------------------------------------------------------------ 4 000 € (montage-4k)
# Plans serrés (1, 3, 5, 7, 9) : accroche sur le torse (y 900), pastille sous le menton (972).
# Plans larges (2, 4, 6, 8, 10) : accroche et pastille au-dessus de la tête (300 / 330).
# Sous-titres à 1070 (colonne large de 800 px, sous le menton dans tous les cadres), sauf c2 qui passe par le plan 4,
# plus serré (menton vers 1095) : 1130, colonne étroite.

COURTS["c1-208"] = dict(
    projet="montage-4k", fichier="utopicar-court-01-208-puretech",
    titre="La 208 que je touche pas",
    segs=[(0.20, 1.70, "M", {"entree_src": 0.0, "sortie_src": 2.42}),        # 4 000 € pour te lancer dans l'achat-revente.
          (59.24, 62.32, "M", {"entree": "file", "entree_src": 59.21}),      # celle que je touche pas, c'est la 208 en 1.2 PureTech,
          (63.39, 64.62, "M", {"sortie_src": 65.25})],                       # si la courroie a jamais été changée.
    corr={}, accents=[0.20, 60.60, 63.66],
    accroche=dict(contexte=CTX, chiffre="4 000 €", promesse="la 208 que je touche pas", accent="208", y=900,
                  tailles=(196, 70), fin_src=2.40),
    pastille=dict(y=972, items=[(60.60, "x", "208 1.2 PureTech")], fin_src=65.25),
    brolls=[(63.39, 64.42, "p1-courroie", False)],
    y_st=1070,
)

COURTS["c2-clio"] = dict(
    projet="montage-4k", fichier="utopicar-court-02-clio-3",
    titre="Clio 3 1.2 essence : à prendre, à 2 conditions",
    segs=[(14.98, 16.32, "M", {"entree_src": 14.94}),        # la Clio 3, en essence 1.2.
          (17.64, 19.46, "M", {}),                            # La Clio, c'est l'occasion la plus vendue de France.
          (20.42, 21.02, "M", {"sortie_src": 21.50}),         # T'auras toujours un acheteur.
          (22.46, 24.08, "M", {}),                            # Regarde juste la rouille sous les bas de caisse… (plan large)
          (25.16, 26.04, "M", {"sortie_src": 26.85})],        # et essaie bien la boîte. (la pastille 2 reste 1,8 s)
    corr={15.06: "Clio 3", 15.34: ""}, accents=[15.06, 19.46, 21.02, 23.10, 26.04],
    accroche=dict(contexte=CTX, chiffre="Clio 3 · 1.2", promesse="à prendre, à 2 conditions", accent="2 conditions",
                  y=900, tailles=(170, 66), fin_src=16.32),
    pastille=dict(y=330, items=[(22.46, 1, "La rouille des bas de caisse"), (25.16, 2, "La boîte, à l'essai")],
                  fin_src=26.85),
    brolls=[(17.64, 19.46, "p1-trafic", True), (23.10, 25.28, "b3-dessous", False)],
    y_st=1130,
)

COURTS["c3-yaris"] = dict(
    projet="montage-4k", fichier="utopicar-court-03-yaris",
    titre="Toyota Yaris : 1 seul point à vérifier",
    segs=[(29.12, 35.46, "M", {"entree_src": 29.08, "sortie_src": 35.99}),  # la Toyota Yaris, entre 2005 et 2011, en essence. Pas de turbo, mécanique simple. La référence en fiabilité.
          (37.24, 38.36, "M", {}),                                          # Elle est souvent un peu au-dessus du budget, (plan large)
          (39.33, 39.72, "M", {"sortie_src": 40.17}),                       # mais elle part vite.
          (40.40, 41.62, "M", {"sortie_src": 41.88})],                      # Vérifie juste qu'elle chauffe pas.
    corr={}, accents=[29.42, 35.46, 39.72, 41.36],
    accroche=dict(contexte=CTX, chiffre="Toyota Yaris", promesse="1 seul point à vérifier", accent="1 seul point",
                  y=900, tailles=(170, 66), fin_src=32.12),
    pastille=dict(y=330, items=[(39.33, 1, "Yaris · surchauffe")], fin_src=41.88),   # dès « mais elle part vite » : 2,1 s
    brolls=[(33.36, 34.88, "b4-compte-tours", False), (39.33, 39.72, "p2-part-vite", True),
            (40.40, 41.62, "b5-fumee", True)],
    y_st=1070,
)

COURTS["c4-corsa"] = dict(
    projet="montage-4k", fichier="utopicar-court-04-corsa",
    titre="Opel Corsa 1.2 : écoute-la à froid",
    segs=[(42.72, 49.34, "M", {"entree_src": 42.66, "sortie_src": 49.78}),  # l'Opel Corsa, entre 2006 et 2014, en 1.2 essence. Elle fera pas tourner les têtes… mais elle fait tourner ton stock.
          (50.39, 51.82, "M", {}),                                          # Écoute-la à froid. Un claquement (plan large)
          (53.36, 53.64, "M", {"sortie_src": 54.10})],                      # C'est la chaîne.
    corr={}, accents=[43.30, 49.34, 50.90, 53.64],
    accroche=dict(contexte=CTX, chiffre="Opel Corsa 1.2", promesse="écoute-la à froid", accent="à froid",
                  y=900, tailles=(170, 66), fin_src=45.22),
    pastille=dict(y=330, items=[(50.39, 1, "À froid"), (51.75, "x", "Claquement : la chaîne")], fin_src=54.10),
    brolls=[(53.36, 53.90, "b7-moteur", False)],
    y_st=1070,
)

COURTS["c5-diesel"] = dict(
    projet="montage-4k", fichier="utopicar-court-05-pas-de-diesel",
    titre="Pas de diesel à 4 000 €",
    segs=[(8.40, 13.34, "M", {}),                             # Règle n°1 : essence. À ce prix-là, un diesel, c'est souvent une vanne EGR ou un FAP à refaire.
          (66.30, 66.30, "M", {}),                            # Bref.
          (67.14, 68.42, "M", {"entree_src": 67.11}),         # Essence, un modèle que tout le monde connaît.
          (69.23, 70.50, "M", {"sortie_src": 70.95})],        # Le reste, c'est du stock qui dort.
    corr={}, accents=[9.66, 11.20, 13.02, 68.42, 70.50],
    accroche=dict(contexte=CTX, chiffre="4 000 €", promesse="pas de diesel à", accent="diesel", y=300,
                  tailles=(236, 64), fin_src=11.12, derriere=True, ecart_chiffre=6,
                  detour="assets/plans/detour-clip-2.webm"),
    pastille=dict(y=330, items=[(11.20, "x", "Diesel : vanne EGR, FAP")], fin_src=13.66),
    couleurs=[(2, "Essence", "orange", 1)],
    brolls=[(11.12, 13.34, "b1-moteur", True), (69.23, 70.64, "b9-epave", False)],
    y_st=1070,
)

# ------------------------------------------------------------------------------------------- Déjà vendue (montage-dv)
# Voix d'origine (lèvres justes). Deux cadres d'un même plan : « M » (tête à y 560-1010) et « C » (serré) ; on alterne à
# chaque coupe. Accroche au-dessus de la tête (y 300), pastille 330, sous-titres 1070 (menton à 1010 au plus bas).

COURTS["d1-deja-vendue"] = dict(
    projet="montage-dv", fichier="utopicar-court-06-deja-vendue",
    titre="« Déjà vendue » à chaque bonne affaire ?",
    segs=[(0.16, 0.40, "M", {"entree_src": 0.0}),             # Déjà vendue.
          (2.22, 3.51, "C", {}),                              # Si t'entends ça à chaque bonne affaire auto,
          (4.97, 5.54, "M", {"entree_src": 4.93}),            # c'est pas que t'es trop lent,
          (6.01, 7.29, "C", {"entree_src": 5.99}),            # c'est que tu cherches comme tout le monde.
          (9.24, 10.88, "M", {}),                             # crée des alertes Leboncoin sur tes modèles et
          (11.39, 11.80, "C", {}),                            # active les notifs.
          (12.80, 14.92, "M", {"sortie_src": 15.30})],        # Une bonne affaire, c'est premier arrivé, premier servi.
    corr={}, accents=[0.40, 5.54, 9.84, 11.80, 14.92],
    accroche=dict(contexte=CTX, chiffre="Déjà vendue", promesse="à chaque bonne affaire ?", accent="chaque", y=300,
                  tailles=(132, 54), fin_src=3.51, ordre="promesse"),
    pastille=dict(y=330, items=[(9.24, 1, "Alertes Leboncoin + notifs")], fin_src=13.50),
    brolls=[(13.90, 14.92, "p2-part-vite", True)],
    y_st=1070,
)

COURTS["d2-vendeur-presse"] = dict(
    projet="montage-dv", fichier="utopicar-court-07-vendeur-presse",
    titre="Un vendeur pressé, ça se négocie",
    segs=[(17.26, 19.20, "M", {}),                            # tape urgent, cause départ, à débattre.
          (19.97, 21.08, "C", {"sortie_src": 21.65}),         # Un vendeur pressé, ça se négocie.
          (31.32, 32.40, "M", {}),                            # une annonce en ligne depuis des semaines.
          (33.58, 34.05, "C", {}),                            # Le vendeur est lassé.
          (34.86, 35.22, "M", {"sortie_src": 35.78})],        # C'est là que tu proposes.
    corr={}, accents=[17.48, 20.43, 21.08, 34.05, 35.22],
    accroche=dict(contexte=CTX, chiffre="ça se négocie", promesse="un vendeur pressé", accent="pressé", y=300,
                  tailles=(132, 54), fin_src=19.20, ordre="promesse"),
    brolls=[(34.86, 35.22, "b2-cle", True)],
    y_st=1070,
)

COURTS["d3-annonces-mal-faites"] = dict(
    projet="montage-dv", fichier="utopicar-court-08-annonces-mal-faites",
    titre="Vise les annonces mal faites",
    segs=[(22.48, 23.12, "M", {"entree_src": 22.50, "sortie_src": 23.45}),  # celle que personne fait,
          (25.15, 26.04, "C", {}),                                          # vise les annonces mal faites.
          (26.93, 27.67, "M", {}),                                          # Photos floues, deux lignes,
          (28.56, 28.90, "C", {"sortie_src": 29.34}),                       # moins de monde dessus.
          (46.31, 46.70, "M", {"sortie_src": 47.00}),                       # compare à la cote.
          (47.29, 48.04, "C", {}),                                          # Si t'as pas ta marge à l'achat,
          (48.52, 48.78, "M", {"sortie_src": 49.08})],                      # t'as pas d'affaire.
    corr={}, accents=[22.82, 25.15, 28.78, 46.70, 48.74],
    accroche=dict(contexte=CTX, chiffre="mal faites", promesse="vise les annonces", accent="vise", y=300,
                  tailles=(132, 54), fin_src=26.04, ordre="promesse"),
    pastille=dict(y=330, items=[(26.93, 1, "Photos floues"), (27.51, 2, "Deux lignes")], fin_src=29.20),
    couleurs=[(4, "La cote", "orange", 1)],
    y_st=1070,
)

COURTS["d4-ventes-etat"] = dict(
    projet="montage-dv", fichier="utopicar-court-09-ventes-de-l-etat",
    titre="Les ventes de l'État, presque personne connaît",
    segs=[(36.20, 37.47, "M", {"entree_src": 36.19}),         # celle-là, presque personne la connaît :
          (38.24, 40.19, "C", {}),                            # les ventes de l'État sur Enchères du Domaine.
          (41.15, 42.66, "M", {"sortie_src": 43.30})],        # Attention juste aux frais en plus.
    corr={}, accents=[36.85, 38.62, 42.20],
    accroche=dict(contexte=CTX, chiffre="Ventes de l'État", promesse="presque personne connaît", accent="personne",
                  y=300, tailles=(132, 54), fin_src=38.62, ordre="promesse"),
    pastille=dict(y=330, items=[(41.15, "!", "Frais en plus du prix")], fin_src=43.30),
    couleurs=[(39.77, "Enchères / du Domaine", "orange", 1)],
    y_st=1070,
)

# ------------------------------------------------------------------------------------------ Cartes grises (montage-cg)
# Mêmes cadres que Déjà vendue. Plan 1 : la carte grise SPECIMEN déchirée devant le torse (3,75-4,0 s) : l'accroche
# reste au-dessus de la tête.

COURTS["g1-6-par-an"] = dict(
    projet="montage-cg", fichier="utopicar-court-10-6-par-an",
    titre="La règle des 6 cartes grises par an",
    segs=[(0.12, 5.04, "M", {"entree_src": 0.0, "sortie_src": 5.45}),   # Carte grise en achat-revente, on t'a dit 6 par an maximum, la loi ne fixe aucune limite.
          (41.43, 43.45, "C", {}),                                      # Le vrai seuil, ce n'est pas un nombre de cartes grises.
          (45.11, 46.19, "M", {"sortie_src": 46.95})],                  # C'est le jour où ça devient une habitude.
    corr={}, accents=[2.05, 5.04, 41.69, 46.19],
    accroche=dict(contexte=CTX, chiffre="6 par an ?", promesse="la loi ne fixe aucune limite", accent="aucune limite",
                  y=300, tailles=(150, 50), fin_src=5.36, ordre="chiffre"),
    couleurs=[(46.19, "Habitude", "orange", 1)],
    y_st=1070,
)

COURTS["g2-3-criteres"] = dict(
    projet="montage-cg", fichier="utopicar-court-11-3-criteres",
    titre="Les 3 critères que le fisc regarde",
    segs=[(7.08, 8.29, "M", {"entree_src": 7.03, "sortie_src": 8.95}),  # Le fisc regarde trois critères.
          (9.65, 12.92, "C", {"sortie_src": 13.36}),                    # Tu le fais souvent, pour gagner de l'argent, et pour ton propre compte.
          (15.00, 16.66, "M", {}),                                      # Si c'est ton cas, c'est du commerce non déclaré,
          (17.87, 18.55, "C", {}),                                      # TVA sur tes marges,
          (19.87, 20.28, "M", {"sortie_src": 20.80})],                  # risque de poursuite.
    corr={}, accents=[8.29, 10.00, 11.28, 12.92, 16.66, 20.28],
    accroche=dict(contexte=CTX, chiffre="3 critères", promesse="que le fisc regarde", accent="fisc", y=300,
                  tailles=(150, 50), fin_src=8.88, ordre="chiffre"),
    pastille=dict(y=330, items=[(9.88, 1, "Souvent"), (11.00, 2, "Pour gagner de l'argent"),
                                (12.43, 3, "Pour ton propre compte"), (15.00, "x", "Commerce non déclaré")],
                  fin_src=20.80),
    y_st=1070,
)

COURTS["g3-1-mois"] = dict(
    projet="montage-cg", fichier="utopicar-court-12-1-mois",
    titre="1 mois pour la carte grise",
    segs=[(23.04, 24.88, "M", {"entree_src": 23.05}),         # revendre sans la mettre à ton nom, c'est interdit.
          (25.78, 27.15, "C", {}),                            # T'as un mois pour faire la carte grise.
          (28.25, 29.67, "M", {}),                            # En pro, tu fais une déclaration d'achat.
          (31.05, 32.50, "C", {"sortie_src": 33.00})],        # Plus de cartes grises à payer à chaque voiture.
    corr={}, accents=[24.88, 26.08, 29.05, 31.96],
    accroche=dict(contexte=CTX, chiffre="1 mois", promesse="pour la carte grise", accent="carte grise", y=300,
                  tailles=(150, 50), fin_src=25.32, ordre="chiffre"),
    couleurs=[(2, "En pro", "orange", 1)],
    y_st=1070,
)

COURTS["g4-tva-marge"] = dict(
    projet="montage-cg", fichier="utopicar-court-13-tva-sur-la-marge",
    titre="En pro : la TVA seulement sur ta marge",
    segs=[(28.25, 28.33, "M", {"entree_src": 28.22, "sortie_src": 28.55}),   # En pro,
          (34.37, 35.39, "C", {"entree_src": 34.39, "sortie_src": 36.20}),   # sur une voiture achetée à un particulier,
          (36.72, 39.20, "M", {"sortie_src": 39.50})],                       # tu paies la TVA seulement sur ta marge, pas sur le prix.
    corr={}, accents=[28.33, 35.39, 37.25, 38.40, 39.20],
    accroche=dict(contexte=CTX, chiffre="En pro", promesse="la TVA seulement sur ta marge", accent="ta marge", y=300,
                  tailles=(150, 50), fin_src=37.25, ordre="chiffre"),
    y_st=1070,
)

for _k, _c in COURTS.items():
    _c.setdefault("queue", Q)
    _c["fin"] = False
