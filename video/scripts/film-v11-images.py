"""Images du film v11 : écrans du téléphone, bandes de pages à faire défiler, cartes qui sortent de l'écran.
Tout vient des vraies captures de l'app (main) : assets/presente-v11/app (capturer-v11.mjs, capturer-v11b.mjs, mail-v11.mjs)
et la place des blocs mesurée dans l'app (rects.json, rects2.json, textes-b.json ; px CSS, pages à plat).

Sorties dans assets/presente-v11/film/ :
  haut.png              barre du haut de l'app (780 × 128, 2×), commune à tous les écrans
  bas-<onglet>.png      barre du bas (780 × 148), onglet actif : analyser, rapports, parc, accueil
  bande-<page>.png      page à plat sous la barre du haut, à faire défiler : polo, clio, recherche, vendues
  parc-avant.png        le parc, la Clio « Repérée » (avant l'appui sur « Acheter »)
  parc-apres.png        le parc après l'appui, sans l'avis (le haut vient de l'écran d'avant : rien n'y bouge)
  avis.png              l'avis « Achetée : Renault Clio » (2×) qui descend dans l'écran
  pop-*.png             les cartes qui sortent du téléphone (3× quand elles existent)
  geo.json              place des blocs dans les écrans et les bandes (px 2×), tailles des cartes
usage : python3 scripts/film-v11-images.py
"""
import json, os, shutil
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'presente-v11')
APP, OUT = os.path.join(ROOT, 'app'), os.path.join(ROOT, 'film')
os.makedirs(OUT, exist_ok=True)
R = json.load(open(os.path.join(APP, 'rects.json')))
R2 = json.load(open(os.path.join(APP, 'rects2.json')))
TB = json.load(open(os.path.join(APP, 'textes-b.json')))
im = lambda n: Image.open(os.path.join(APP, n)).convert('RGB')
HAUT, BAS = 128, 1540
G = {'ecran': [780, 1688], 'haut': HAUT, 'bas': BAS}


def sauve(img, nom):
    img.save(os.path.join(OUT, nom)); print('→', nom, img.size)


# barres de l'app
sauve(im('ecran-polo-haut.png').crop((0, 0, 780, HAUT)), 'haut.png')
for onglet, src in (('analyser', 'ecran-analyser.png'), ('rapports', 'ecran-polo-haut.png'), ('parc', 'ecran-parc.png'), ('accueil', 'ecran-alerte-on.png'), ('recherche', 'ecran-recherche.png')):
    sauve(im(src).crop((0, BAS, 780, 1688)), f'bas-{onglet}.png')

# bandes à faire défiler : la page à plat sous sa barre du haut (y = 0 de la bande = y_css × 2 de la page)
def bande(page, y0_css, y1_css, nom):
    p = im(page); y1 = min(p.height, y1_css * 2)
    sauve(p.crop((0, y0_css * 2, 780, y1)), f'bande-{nom}.png')
    G[f'bande-{nom}'] = {'y0': y0_css, 'h': y1 - y0_css * 2}

bande('page-polo.png', 505, 4100, 'polo')     # jusqu'au plafond (3 544) plus un écran
bande('page-clio.png', 505, 4000, 'clio')
bande('page-recherche.png', R['recherche']['marque']['y'] - 110, R['recherche']['haut'], 'recherche')
bande('page-parc-vendues.png', 64, TB['vendues-haut'], 'vendues')

# écrans pleins (2×)
for src, nom in (('ecran-analyser.png', 'analyser'), ('ecran-colle.png', 'colle'), ('ecran-alerte-on.png', 'mes-recherches'), ('ecran-alerte-off.png', 'mes-recherches-off')):
    shutil.copy(os.path.join(APP, src), os.path.join(OUT, f'ecran-{nom}.png')); print('→', f'ecran-{nom}.png')
sauve(im('ecran-mail.png').resize((780, 1688), Image.LANCZOS), 'ecran-mail.png')
# l'attente de l'analyse, image par image (capturer-v11b.mjs) : copiées telles quelles, avec leur instant
os.makedirs(os.path.join(OUT, 'analyse'), exist_ok=True)
G['analyse'] = []
for s in TB['seq-analyse']:
    n = os.path.basename(s['f']); shutil.copy(os.path.join(APP, s['f']), os.path.join(OUT, 'analyse', n)); G['analyse'].append([n, s['t']])
print('→ analyse/', len(G['analyse']), 'images')

# le parc : avant l'appui (capture d'origine, sans « 1 jour depuis l'achat ») ; après, sans l'avis : les 250 premiers px
# (barre du haut et titre « Parc », que l'avis recouvre) viennent de l'écran d'avant
avant, apres = im('ecran-parc.png'), im('ecran-parc-achetee.png')
sauve(avant, 'parc-avant.png')
p = apres.copy(); p.paste(avant.crop((0, 0, 780, 250)), (0, 0)); sauve(p, 'parc-apres.png')
a = TB['avis']; sauve(apres.crop((a['x'] * 2, a['y'] * 2, (a['x'] + a['w']) * 2, (a['y'] + a['h']) * 2)), 'avis.png')
G['avis'] = {k: v * 2 for k, v in a.items()}
G['acheter'] = {k: round(v * 2, 1) for k, v in TB['acheter'].items()}
G['onglet-vendues'] = {k: round(v * 2, 1) for k, v in TB['onglet-vendues'].items()}

# cartes qui sortent de l'écran
POPS = {
    'lien': ('ecran-colle.png', (50, 585, 730, 820)),          # champ du lien collé et bouton (sans le libellé des plateformes)
    'cote268': ('polo-calcul.png', (0, 0, 1194, 410)),          # « Vente normale · Cote de l'outil sur 268 annonces · 7 150 € »
    'polo-prix': ('polo-prix.png', None),
    'polo-verdict': ('polo-verdict.png', (0, 0, 1194, 1130)),   # 29 sur 100, « À éviter », l'explication, « À faire »
    'polo-plafond': ('polo-plafond.png', None),
    'generation': ('page-recherche.png', None),               # « Génération : Clio 4 (2012 – 2019) »
    'souscote': ('page-recherche.png', None),
    'alerte': ('recherche-suivie.png', None),
    'clio-prix': ('clio-prix.png', None),
    'clio-verdict': ('clio-verdict.png', (0, 0, 1194, 1110)),
    'clio-offre': ('clio-offre.png', None),
    'clio-plafond': ('clio-plafond.png', None),
    'clio-message': ('clio-demander.png', (0, 1760, 1194, 2580)),   # « Premier message, prêt à envoyer » et le message
    'avis': ('avis-achetee.png', None),
}
for nom, (src, box) in POPS.items():
    if nom in ('souscote', 'generation'):
        s, m = R['recherche'][nom], 14
        c = im(src).crop(((s['x'] - m) * 2, (s['y'] - m) * 2, (s['x'] + s['w'] + m) * 2, (s['y'] + s['h'] + m) * 2))
    else:
        c = im(src); c = c.crop(box) if box else c
    sauve(c, f'pop-{nom}.png'); G[f'pop-{nom}'] = list(c.size)
c = im('parc-clio-chiffres.png'); c = c.crop((0, round(c.height * 0.5), c.width, c.height)); sauve(c, 'pop-vendue.png'); G['pop-vendue'] = list(c.size)

# place des blocs (px CSS) : rapports, recherche, mes recherches, ventes
G['rects'] = {'polo': R2['polo'], 'clio': R2['clio'], 'recherche': R['recherche'], 'mesrecherches': R2['mesrecherches'], 'vendue': TB['vendue-clio']}
json.dump(G, open(os.path.join(OUT, 'geo.json'), 'w'), ensure_ascii=False, indent=1)
print('→ geo.json')
