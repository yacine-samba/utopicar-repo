"""Le découpage des extraits courts (9:16) : ce qu'on garde de la source, dans quel ordre, avec quel cadre, quels textes,
quelles cartes. Modèle à remplacer (references/decoupage.md).

Temps = temps de la source (début du mot dans work/words.json, à 2 décimales ; un temps qui n'est pas un début de mot
fait planter noyau.mot : « aucun mot ne commence à … »).
- segs : (début du 1er mot, début du dernier mot, cadre, options). Cadre : M (plan moyen) ou C (serré).
  options : entree = cut | file (filé + souffle) | zoom (zoom arrière) ; choc = secousse ; pousse = 0 pour figer ;
  entree_src / sortie_src = bornes imposées en secondes de la source (lues sur l'énergie, references/coupes.md).
- corr : texte affiché pour un mot (clé = début du mot, ou (début, mot) si deux mots commencent ensemble) ;
  "" = mot non affiché (il reste dans le son).
- style : clash | serif | sans (défaut), + or | rouge : le mot fort du groupe (serif italique en style viral).
- accroche : contexte (petite ligne, voix du compte qui publie), lignes [(texte, style, t, temps source du mot qui la
  déclenche)], jusqua (le mot dont le plan porte encore l'accroche), bande « haut » (sujet loin, tête basse) ou « bas »
  (visage haut dans le cadre : l'accroche prend la place des sous-titres).
- cartes : (type, du mot, au mot, paramètres) : intercalaires (mots), carte vidéo (video), surimpression (nom) et cartes
  de données (references/decoupage.md, « Les cartes »).
- coupe : débuts de mots où un nouveau groupe de sous-titres doit commencer.
"""

CLIPS = {}

CONTEXTE = "témoignage · Prénom, mon client"   # la voix du compte qui publie (references/types.md)
# SIGNATURE = (debut, fin, "M", {"entree": "file", "entree_src": …})  # la phrase signature du compte, en fin de clip
# SIGN_CORR, SIGN_STYLE = {}, {}

CLIPS["clip-1"] = dict(
    titre="Titre court de l'extrait",
    musique=("lit.mp3", 0.0),   # (fichier dans assets/audio/musique/, départ dans le morceau) — ignoré sans projet.MUSIQUE
    queue=0.6,                  # secondes d'image figée après la dernière phrase
    accroche=dict(contexte=CONTEXTE, lignes=[("la mise en situation :", "serif", 0.0), ("0 €", "rouge-g", 0.0, 12.34)],
                  jusqua=14.20, bande="haut"),
    segs=[
        (12.00, 13.10, "M", {}),
        (14.20, 16.80, "C", {"entree": "file"}),
        # …
    ],
    corr={},
    style={},
    cartes=[
        # ("mots", 14.20, 16.80, {"theme": "bleu", "forts": ["mot", "fort"]}),
        # ("video", 20.0, 22.0, {"media": 44.0, "cadre": "C", "theme": "blanc", "legende": ("NOM", "rôle")}),
    ],
    coupe=[],
)
