"""Planches annotées des 5 concepts : une planche par concept (5 écrans à 360 px, la largeur d'un téléphone),
avec l'instant, la voix et le mouvement prévu sous chaque écran, plus une planche des 5 hooks.
usage (depuis video/) : python scripts/planche-concepts.py → renders/planches/concepts-{1..5}.jpg, concepts-hooks.jpg"""
import glob, os, textwrap
from PIL import Image, ImageDraw, ImageFont

C = [
 ("1 · Le dictionnaire du vendeur", "Typo cinétique : la caméra plonge à travers les lettres, chaque phrase se retourne en étiquette de prix", [
  ("0,0 s", "« \"Juste un voyant, rien de grave.\" Dans une annonce, cette phrase peut te coûter 1 500 €. »", "Image 0 lisible. La phrase se tape lettre à lettre, le surligneur file sous « rien de grave », l'étiquette se retourne sur « 1 500 »."),
  ("3,0 s", "(musique, un temps)", "La caméra plonge dans le « o » de « voyant » : le blanc de la lettre avale l'écran, l'étiquette attend au fond. Flou de bougé."),
  ("6,0 s", "« Petit bruit au démarrage : de 100 à 600 €. »", "On ressort par la phrase suivante. L'étiquette se retourne : au recto les mots du vendeur, au verso le prix."),
  ("17,0 s", "« Une annonce, quatre phrases : jusqu'à 3 450 €. »", "Volet orange. Les quatre étiquettes tombent, une par temps ; le total roule jusqu'à 3 450."),
  ("21,0 s", "« Utopicar lit l'annonce et chiffre chaque phrase. Avant que tu appelles. »", "Les étiquettes glissent dans la vraie fiche et deviennent sa ligne « Travaux à prévoir ». CTA : la phrase de vendeur à traduire."),
 ]),
 ("2 · 15 minutes", "Horloge radar : l'aiguille des minutes sert de volet, puis se rembobine pour la solution", [
  ("0,0 s", "« Cette Mégane 3 à 1 500 € est restée en ligne 15 minutes. Toi, tu l'as vue à la seizième. »", "L'aiguille balaie déjà à l'image 0, le secteur orange se remplit derrière elle. La trotteuse donne le tempo."),
  ("3,5 s", "« Minute 2 : quelqu'un appelle. »", "Chaque passage de l'aiguille révèle la scène suivante. Onde d'appel sur la carte."),
  ("7,0 s", "« Minute 16 : \"Désolé, déjà vendue.\" »", "L'annonce est aspirée au centre du cadran. Les deux messages tombent, le second sur le temps fort."),
  ("12,0 s", "« Celui qui l'a eue ne cherchait pas. Il a reçu une alerte. »", "Plein orange. L'aiguille se rembobine avec sa traînée jusqu'à zéro."),
  ("18,0 s", "« Avec Utopicar, la nouvelle annonce arrive chez toi. Minute zéro. »", "La vraie alerte de l'app tombe et sonne (ondes), le curseur clique. CTA : « Commente DÉBUTANT. »"),
 ]),
 ("3 · Deux 208, un mot", "Miroir parfait qui décroche : les deux annonces bougent en symétrie jusqu'au mot qui les sépare", [
  ("0,0 s", "« Deux 208. Une à 7 190 €, une à 8 200 €. J'achète la plus chère. »", "Les deux annonces en miroir : même travelling, même lumière, l'axe au centre."),
  ("3,5 s", "« Trouve la différence. Trois secondes. »", "La loupe balaie les deux cartes, compte à rebours. Le spectateur cherche (et revoit)."),
  ("8,0 s", "« Un mot : PureTech. »", "Le miroir décroche : la PureTech se désynchronise, glisse et s'assombrit. La BlueHDi prend le centre."),
  ("12,0 s", "« Courroie dans l'huile. Et tes acheteurs le savent. »", "Schéma au trait tracé en direct, l'huile monte sur la courroie."),
  ("23,0 s", "« Utopicar te le dit avant que tu te déplaces. »", "La vraie fiche : 4/10, « Déconseillée ». La 208 BlueHDi à + 760 € glisse dessous. CTA : « Commente le moteur de ta voiture. »"),
 ]),
 ("4 · Choisis ta voiture", "Écran de sélection de jeu vidéo : socles, compte à rebours, VS, barres de vie qui deviennent la marge", [
  ("0,0 s", "« Mercedes à 19 990 € ou Yaris à 8 990 € : une des deux te fait perdre 2 700 €. »", "Les voitures tournent sur leurs socles, le cadre de sélection hésite de l'une à l'autre. Son de menu."),
  ("4,0 s", "« Trois secondes. Choisis. »", "La Mercedes remplit la barre « coup de cœur ». Compte à rebours, le curseur se pose sur elle."),
  ("8,0 s", "(impact)", "« VS » claque en diagonale, secousse, les deux voitures se font face."),
  ("10,0 s", "« La plus belle perd. »", "Les barres de vie deviennent la marge : − 2 700 € contre + 1 240 €. Tampon « K.O. »."),
  ("16,0 s", "« Utopicar a tranché en deux secondes. Et toi, laquelle tu prenais ? »", "Les vraies fiches : « Ça rapporte ? − 2 700 € » et la Yaris « Très bonne affaire ». CTA en commentaire."),
 ]),
 ("5 · Le compteur qui recule", "Tableau d'enquête : papier, punaises, et le fil rouge qui devient la courbe du kilométrage", [
  ("0,0 s", "« Annonce : 131 000 km. Photo du compteur, dans la même annonce : 184 000 km. »", "Travelling latéral continu sur le liège ; le fil rouge se tend entre les deux chiffres."),
  ("4,0 s", "« Le compteur a reculé. »", "Les contrôles se punaisent un par temps ; le fil dessine la courbe : elle monte, puis redescend."),
  ("10,0 s", "« Demande le rapport HistoVec. C'est gratuit. S'il refuse, tu passes. »", "Noir, voix seule. Le rapport glisse vers la caméra."),
  ("16,0 s", "« Utopicar lit le compteur sur les photos et compare. »", "L'alerte de l'analyse, textes réels de l'outil. Capture à faire sur un dossier démo."),
  ("25,0 s", "« Envoie ça à ton pote qui cherche une voiture. »", "Plein orange, logo. Le bouton de partage bat au tempo."),
 ]),
]

FD = 'C:/Windows/Fonts/'
F = lambda s, b=False: ImageFont.truetype(FD + ('segoeuib.ttf' if b else 'segoeui.ttf'), s)
fs = sorted(glob.glob('renders/maquette-concepts/f*.png'))
os.makedirs('renders/planches', exist_ok=True)
cw, ch, pad, txt, head = 360, 640, 28, 300, 150
BG, INK, OR, MUT = (244, 240, 233), (28, 22, 18), (224, 87, 26), (88, 78, 70)

for c, (title, sig, shots) in enumerate(C):
    S = Image.new('RGB', (5 * cw + 6 * pad, head + ch + txt + pad), BG); d = ImageDraw.Draw(S)
    d.text((pad, 26), title, fill=INK, font=F(48, True)); d.text((pad, 92), sig, fill=OR, font=F(26, True))
    for k, (t, v, m) in enumerate(shots):
        x, y = pad + k * (cw + pad), head
        S.paste(Image.open(fs[c * 5 + k]).convert('RGB').resize((cw, ch), Image.LANCZOS), (x, y))
        d.text((x, y + ch + 12), f'{c + 1}.{k + 1} · {t}', fill=OR, font=F(22, True))
        yy = y + ch + 44
        for ln in textwrap.wrap(v, 34)[:4]: d.text((x, yy), ln, fill=INK, font=F(20, True)); yy += 26
        yy += 8
        for ln in textwrap.wrap(m, 38)[:6]: d.text((x, yy), ln, fill=MUT, font=F(19)); yy += 24
    out = f'renders/planches/concepts-{c + 1}.jpg'; S.save(out, quality=90); print(out, S.size)

# planche des 5 hooks : l'image 0 de chaque concept
S = Image.new('RGB', (5 * cw + 6 * pad, ch + 150), BG); d = ImageDraw.Draw(S)
d.text((pad, 26), "Les 5 hooks · image 0", fill=INK, font=F(44, True))
for c in range(5):
    x = pad + c * (cw + pad); S.paste(Image.open(fs[c * 5]).convert('RGB').resize((cw, ch), Image.LANCZOS), (x, 100))
    d.text((x, 100 + ch + 12), C[c][0], fill=OR, font=F(22, True))
S.save('renders/planches/concepts-hooks.jpg', quality=90); print('renders/planches/concepts-hooks.jpg', S.size)
