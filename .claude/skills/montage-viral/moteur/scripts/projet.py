"""Réglages du projet de montage : rempli à la préparation (references/preparation.md), lu par tous les scripts.

Tous les temps sont ceux de la source, en secondes. Les valeurs ci-dessous sont un exemple à remplacer.
"""

# --- la source ---------------------------------------------------------------------------------------------------
SRC = r"C:\chemin\vers\source.mp4"  # l'enregistrement d'origine (jamais modifié)
DUREE = 60.0                        # durée de la source (ffprobe), arrondie au dixième au-dessus
FPS = 30                            # cadence des plans fabriqués (constante, même si la source est variable)
# Zone utile (x, y, largeur, hauteur) en px de la source : toute l'image, ou la seule zone caméra d'un Loom, d'une
# visio, d'un live (l'interface ne doit jamais paraître). Hauteur et largeur paires. Mesurée par work/analyse_cadre.py.
ZONE = (0, 0, 1920, 1080)

# --- le choix du type de montage (SKILL.md, étape 0) ------------------------------------------------------------
TYPE = "temoignage"   # temoignage | interview | face-camera        → references/types.md
STYLE = "viral"       # viral | sobre                               → references/styles.md
MUSIQUE = False       # lit musical sous la voix (assets/audio/musique/) ; par défaut la voix et les bruitages seuls

# --- les scènes ----------------------------------------------------------------------------------------------------
# Une scène = un passage où la caméra ne bouge pas. (début, fin, sujet suivi ou None, hauteur de tête en px de la
# zone, côté libre de l'image en 16:9 « gauche »/« droite », bande des sous-titres en plan moyen vertical « bas » ou
# « bas2 » quand le sujet est loin). Sujet None : caméra qui bouge, plan large fixe ; le suivi de la scène suivante
# sert pour les fonds flous.
SCENES = [
    (0.0, 60.0, "s1_parleur", 300, "gauche", "bas"),
]
# Suivi de la tête (work/suivi.py) : sujet → (début, fin, instant de la boîte, boîte x, y, w, h dans la zone)
SUIVI = {
    "s1_parleur": (0.0, 60.0, 10.0, (800, 100, 250, 320)),
}
# Hauteur de la fenêtre de recadrage (px de la zone) par plan et par sujet ; None = scène sans sujet suivi.
# v_M plan moyen vertical, v_C serré vertical, h_W large 16:9, h_C serré 16:9, h_M moyen 16:9.
HAUTEUR = {
    "v_M": {"s1_parleur": 1080, None: 1080},
    "v_C": {"s1_parleur": 760, None: 1080},
    "h_W": {"s1_parleur": 1080, None: 1080},
    "h_C": {"s1_parleur": 720, None: 1080},
    "h_M": {"s1_parleur": 1080, None: 1080},
}
TETE = {"v_C": 0.38, "h_C": 0.40, "h_M": 0.42}  # où tombe le centre de la tête, en part de la hauteur du plan

# --- les mots ------------------------------------------------------------------------------------------------------
PROPRES = {}           # casse des noms propres dans les sous-titres : {"henri": "Henri", "tokane": "Tokane"}
PROMPT_WHISPER = ""    # noms propres et jargon dits dans la vidéo, pour que Whisper les écrive bien

# --- la version longue (YouTube) -----------------------------------------------------------------------------------
TITRE = ("LE TITRE EN CAPITALES", "la suite en serif", "SIGNATURE · RÔLE")  # carton titre après l'ouverture
FIN = ("LA PHRASE DE FIN.", "La chute.", "SIGNATURE")                       # carton de fin
TITRE_LONG = "Le titre de la vidéo"                                        # <title> de la composition

# --- la livraison --------------------------------------------------------------------------------------------------
NOMS = {"tiktok-1": "tiktok-1-sujet", "youtube": "youtube-titre"}  # nom des fichiers dans livraison/
