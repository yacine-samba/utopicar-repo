"""Écrans du téléphone et gros plans de la présentation v11, découpés dans les vraies captures de l'app (main).

Entrée : assets/presente-v11/app/ (capturer-v11.mjs, mail-v11.mjs) et rects.json (positions des blocs, px CSS).
Sorties : assets/presente-v11/ecrans/fN.png (écran 390×844 en 2×, barre du haut et barre du bas de l'app comprises)
          assets/presente-v11/cartes/fN*.png (blocs en gros plan, 3× quand ils existent)
usage : python3 scripts/ecrans-v11.py
"""
import json, os
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'presente-v11')
APP, EC, CA = (os.path.join(ROOT, d) for d in ('app', 'ecrans', 'cartes'))
for d in (EC, CA): os.makedirs(d, exist_ok=True)
R = json.load(open(os.path.join(APP, 'rects.json')))
im = lambda n: Image.open(os.path.join(APP, n)).convert('RGB')
HAUT, BAS = 128, 1540              # barre du haut (0 → 128) et barre du bas (1540 → 1688) de l'app, en px 2×


def ecran_depuis_page(page, y_css, nav):
    """Écran défilé : barre du haut + la page entière (à plat) à partir de y_css + la barre du bas de l'écran `nav`."""
    p, n = im(page), im(nav)
    e = Image.new('RGB', (780, 1688))
    e.paste(n.crop((0, 0, 780, HAUT)), (0, 0))
    e.paste(p.crop((0, y_css * 2, 780, y_css * 2 + BAS - HAUT)), (0, HAUT))
    e.paste(n.crop((0, BAS, 780, 1688)), (0, BAS))
    return e


def sauve(img, nom, dossier=EC):
    img.save(os.path.join(dossier, nom)); print('→', nom, img.size)


# écrans du téléphone, scène par scène
sauve(im('ecran-colle.png'), 'f2.png')                                                     # lien collé, bouton orange
sauve(im('ecran-analyse.png'), 'f3.png')                                                   # « Analyse en cours… »
sauve(ecran_depuis_page('page-polo.png', R['polo']['verdict']['y'] - 16, 'ecran-polo-haut.png'), 'f4.png')  # verdict de la Polo : 29, À éviter
sauve(ecran_depuis_page('page-recherche.png', R['recherche']['marque']['y'] - 110, 'ecran-recherche.png'), 'f5.png')
sauve(im('ecran-mail.png').resize((780, 1688), Image.LANCZOS), 'f6.png')                    # l'e-mail d'alerte
sauve(ecran_depuis_page('page-clio.png', R['clio']['verdict']['y'] - 16, 'ecran-clio-haut.png'), 'f7.png')  # verdict de la Clio : 80
sauve(ecran_depuis_page('page-clio.png', R['clio']['demander']['y'] - 16, 'ecran-clio-haut.png'), 'f8.png')  # questions + 1er message
sauve(im('ecran-parc.png'), 'f9.png')                                                      # la Clio arrive « Repérée »

# gros plans (blocs de l'app)
c = im('ecran-colle.png').crop((50, 585, 730, 820)); sauve(c, 'f2-lien.png', CA)          # champ et bouton, sans le libellé des plateformes
for n in ('polo-prix', 'polo-plafond', 'clio-prix', 'clio-offre', 'clio-plafond', 'parc-clio', 'polo-rapporte', 'clio-rapporte', 'polo-verdict', 'clio-verdict'):
    sauve(im(n + '.png'), n + '.png', CA)
c = im('parc-clio-chiffres.png'); sauve(c.crop((0, round(c.height * 0.5), c.width, c.height)), 'parc-clio-chiffres.png', CA)   # la fiche sans l'image vide du haut
s = R['recherche']['souscote']; m = 14
sauve(im('page-recherche.png').crop(((s['x'] - m) * 2, (s['y'] - m) * 2, (s['x'] + s['w'] + m) * 2, (s['y'] + s['h'] + m) * 2)), 'f5-souscote.png', CA)
sauve(im('recherche-suivie.png'), 'f6-alerte.png', CA)                                       # la recherche suivie, « Alerte e-mail » allumée (3×)
