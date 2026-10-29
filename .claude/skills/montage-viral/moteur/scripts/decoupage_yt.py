"""Le découpage de la version longue (16:9) : ouverture à froid, titre, corps en chapitres, carton de fin, et son
habillage (corrections, mots forts, cartes, lits musicaux). Modèle à remplacer (references/decoupage.md).

Chaque plan : (début du 1er mot, début du dernier mot, options) en temps de la source.
Options : cadre (W large, C serré, M moyen ; sinon alterné tout seul), entree (file), choc, chap (début de chapitre),
entree_src / sortie_src (bornes imposées, lues sur l'énergie de la voix).
"""

# l'ouverture à froid : la promesse de celui qui publie, puis 3 à 5 preuves, ≈ 15 à 20 s
OUVERTURE = [
    (12.00, 15.40, {"cadre": "C"}),
]

# le corps, dans l'ordre de la source, resserré (blancs, redites, bégaiements coupés)
CORPS = [
    (1.40, 3.88, {"chap": "Premier chapitre"}),
    (5.20, 6.96, {}),
]

# corrections d'affichage (temps de début du mot → texte) ; "" = mot non écrit (il reste dans le son)
CORR = {}

# mots forts à côté du visage : (du mot, au mot, [(texte, style)]) — serif, clash (capitales blanches),
# clash or (capitales rouges : chiffres et accroches). FORTS_OUV : ceux de l'ouverture (temps de l'ouverture).
FORTS_OUV = []
FORTS = []

# cartes : (type, du mot, au mot, paramètres) ; « panneau » = carte verticale dans un panneau du côté libre ;
# « mots » = intercalaire plein cadre ; « nom » = surimpression (« duree » la borne) ; « cote » force le côté.
CARTES = [
    # ("nom", 1.40, 3.88, {"nom": "PRÉNOM NOM", "role": "rôle", "depuis": 1.72, "duree": 2.6}),
]

# lits musicaux (si projet.MUSIQUE) : (fichier, début dans le morceau, nom du chapitre où il commence) ;
# le premier couvre l'ouverture et vaut « ouverture »
LITS = []
