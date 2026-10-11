"""Pièces d'interface du film master60, tirées des vraies captures de l'app (video/capture-web, données démo).
usage (depuis video/) : python3 scripts/ui-master60.py [sombre|blanc]
  sombre → film-master60/ui/        (version sombre : tout en thème sombre)
  blanc  → film-master60/ui-blanc/  (version blanche : ce qui est clair sur le vrai site l'est aussi — fiche 208 de l'accueil,
           formules, bouton d'essai ; l'espace /app (tableau de bord, rapport) n'existe qu'en sombre : ses cartes restent
           sombres, rendues opaques pour se poser sur le fond blanc)
Masques : nom du vendeur (verdict Mercedes recadré), numéros d'annonce (historique recadré), lignes Leboncoin de la
carte Pro (floutées)."""
import shutil, sys, os
from PIL import Image, ImageFilter

VERSION = sys.argv[1] if len(sys.argv) > 1 else 'sombre'
SRC = 'assets/master60/ui/png/elements/'
D = 'film-master60/ui/' if VERSION == 'sombre' else 'film-master60/ui-blanc/'
os.makedirs(D, exist_ok=True)
SITE = 'sombre' if VERSION == 'sombre' else 'clair'    # pages publiques (accueil, formules, bouton)
THEME = 'sombre'                                        # espace /app : sombre dans le vrai produit

# pièces que le film recadre dans une boîte arrondie (cut) : posées en entier sur le fond de l'app
PLEIN = {'tb-entete.png', 'tb-marges.png', 'tb-marche-annonce-1.png', 'tb-marche.png', 'tb-parc.png', 'tb-affaires.png', 'tb-journee.png',
         'tb-chiffres.png', 'merc-argent.png', 'merc-historique.png', 'merc-verdict.png'}

def opaque(im, plein):
    """Cartes translucides de l'app posées sur le fond sombre de l'app : en entier (plein) ou en gardant leur contour."""
    im = im.convert('RGBA'); bg = Image.new('RGBA', im.size, (18, 14, 11, 255)); bg.alpha_composite(im)
    if not plein: bg.putalpha(im.getchannel('A').point(lambda v: max(0, min(255, (v - 8) * 255 // 100))))
    return bg

def cp(a, b):
    src = SRC + a.format(T=THEME, S=SITE)
    if VERSION == 'blanc' and '{S}' not in a: opaque(Image.open(src), b in PLEIN).save(D + b)
    else: shutil.copy(src, D + b)

cp('accueil-208-{S}-390-fiche.png', 'fiche-208.png')
cp('rapport-mercedes-{T}-390-pilier-4.png', 'merc-rapporte.png')
cp('bouton-{S}-390-bouton.png', 'bouton-essai.png')
cp('offres-{S}-390-carte-1.png', 'offre-starter.png')
for n in ['entete', 'journee', 'journee-action-1', 'journee-action-2', 'journee-action-3', 'journee-action-4', 'chiffre-1', 'chiffre-2',
          'chiffre-3', 'chiffre-4', 'chiffres', 'marche-annonce-1', 'marche', 'marges', 'parc', 'affaires']:
    cp(f'tableau-{{T}}-390-{n}.png', f'tb-{n}.png')
k = 1074 / 440      # px image par px CSS (capture 390 de large, densité 3, cadre 358 + marges)
fin = (lambda im: opaque(im, True)) if VERSION == 'blanc' else (lambda im: im)
v = Image.open(SRC + f'rapport-mercedes-{THEME}-390-verdict.png'); fin(v.crop((0, 0, v.width, int(560 * k)))).save(D + 'merc-verdict.png')
fin(Image.open(SRC + f'rapport-mercedes-{THEME}-390-argent.png')).save(D + 'merc-argent.png')
h = Image.open(SRC + f'rapport-mercedes-{THEME}-390-historique.png'); fin(h.crop((0, 0, h.width, int(470 * k)))).save(D + 'merc-historique.png')
p = Image.open(SRC + f'offres-{SITE}-390-carte-2.png').convert('RGBA'); kk = p.width / 440
box = (0, int(318 * kk), p.width, int(462 * kk)); p.paste(p.crop(box).filter(ImageFilter.GaussianBlur(18)), box); p.save(D + 'offre-pro.png')
for f in sorted(os.listdir(D)):
    print(f, Image.open(D + f).size)
