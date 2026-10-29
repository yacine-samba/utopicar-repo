"""Découpage v4 du TikTok « 4 000 € » (langage design/LANGAGE-V4.md, recherche v4).

Les plans et les coupes de la voix sont ceux de la v3 (decoupage.py) : seul l'habillage change.
- Accroche déjà posée à l'image 0 ; partie 2 : le chiffre passe derrière la tête (détourage).
- Une seule pastille par vidéo (objet porteur) : son chiffre roule vers le haut sur le geste ; « la 208 » la fait
  passer en mode risque (contre-sens, croix tracée, nom barré).
- Deux couleurs pleines par vidéo, aux changements de chapitre, sur la coupe : « 3 oui » (orange, sens de la flèche),
  « 1 non » (noir, contre-sens) ; partie 2 : « Essence » avant la règle finale.
- Les plages d'années dites lentement deviennent deux années posées sur l'axe de la flèche, reliées par le trait.
- Filés réels (deux images côte à côte, même vitesse à la jointure, flou de bougé) entre deux prises de même cadre.
- Correction v4 : l'étiquette « Yaris · joint de culasse » disait ce que la voix ne dit pas (source [À FOURNIR] dans le
  brief) ; elle devient « Yaris · surchauffe », ce que dit la voix (« Vérifie juste qu'elle chauffe pas »).
Temps : débuts de mots de work/words.json, en secondes de la source.
"""
from decoupage import CLIPS as V3

CLIPS = {}

CLIPS["clip-1"] = dict(
    titre="4 000 € : 3 oui, 1 non",
    queue=0.85,
    segs=V3["clip-1"]["segs"],
    corr=V3["clip-1"]["corr"],
    accents=[15.06, 19.46, 21.02, 29.42, 35.46, 43.30, 49.34, 60.60, 64.62],  # Clio 3, France, acheteur, Yaris, fiabilité, Corsa, stock, 208, changée
    y_st=1070,
    accroche=dict(contexte="DÉBUTANT EN ACHAT-REVENTE", chiffre="4 000 €", promesse="3 oui, 1 non", accent="1 non",
                  y=900, tailles=(196, 76), fin_src=3.10),
    pastille=dict(y=972, items=[(14.50, 1, "Clio 3 · 1.2 essence"), (28.55, 2, "Yaris · 2005-2011"),
                                 (42.40, 3, "Corsa · 2006-2014"), (60.60, "x", "208 PureTech")], fin_src=65.40),
    couleurs=[(1, "3 oui", "orange", 1), (6, "1 non", "noir", -1)],  # (segment qui commence après la coupe, mot, ton, sens)
    annees=[(30.24, 32.12, "2005", "2011", 30.42, 31.58), (43.68, 45.84, "2006", "2014", 44.28, 45.22)],
    brolls=[(4.75, 6.36, "p1-panne", True), (17.64, 19.46, "p1-trafic", True), (20.42, 21.02, "b2-cle", True),
            (33.36, 34.88, "b4-compte-tours", False), (63.39, 64.42, "p1-courroie", False)],
    sons=[(2.72, "billets")],
)

CLIPS["clip-2"] = dict(
    titre="4 000 € : 4 pièges à éviter",
    queue=0.85,
    segs=V3["clip-2"]["segs"],
    corr=V3["clip-2"]["corr"],
    accents=[9.66, 11.20, 13.02, 23.10, 26.04, 39.72, 41.36, 50.90, 53.64, 55.98, 68.42, 70.50],
    y_st=1130,
    accroche=dict(contexte="DÉBUTANT EN ACHAT-REVENTE", chiffre="4 000 €", promesse="4 pièges à éviter", accent="4 pièges",
                  y=300, tailles=(236, 64), fin_src=11.12, derriere=True, ecart_chiffre=6),
    pastille=dict(y=330, items=[(11.12, 1, "Diesel : vanne EGR, FAP"), (22.46, 2, "Clio 3 · bas de caisse + boîte"),
                                (37.24, 3, "Yaris · surchauffe"), (50.39, 4, "Corsa · chaîne + Easytronic")],
                  fin_src=56.80),
    couleurs=[(10, "Essence", "orange", 1)],
    annees=[],
    brolls=[(11.12, 13.34, "b1-moteur", True), (23.10, 25.28, "b3-dessous", False), (39.33, 39.72, "p2-part-vite", True),
            (40.40, 41.62, "b5-fumee", True), (50.39, 51.50, "b6-cle-contact", False), (53.36, 55.20, "b7-moteur", False),
            (69.23, 70.75, "b9-epave", False)],
    sons=[],
)
