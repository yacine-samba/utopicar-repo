"""MO12 « La pochette » : la voiture du film, prise dans la bibliothèque des voitures libres, et ce que le film en tire.

    python3 scripts/photos-mo12.py            → assets/photos-mo12/ (copies, repères, voiture floue, CREDITS.tsv)
    python3 scripts/photos-mo12.py --check D  → en plus, planches de contrôle dans le dossier D (fond #08070a)

La voiture : Citroën C3 première génération (phase 1, 2002-2005), cinq portes, bleu clair métallisé, photo de M 93
versée au domaine public (« Citroën C3 front.jpg », Wikimedia Commons). Elle est déjà traitée par
scripts/cars-libres-twingo-c3.py (chevrons de la calandre et des enjoliveurs effacés, texte du cadre de plaque effacé,
plaque vierge, détourage BiRefNet, bords décontaminés, étalonnage de la charte, avant vers la gauche) : on la copie
telle quelle, sans retoucher ni la photo ni son contour.

Le film n'a besoin d'aucun état de la voiture (ni sale, ni phares jaunis, ni rayure : c'est une vente qui se passe
bien). Il lui faut en revanche :
  car-c3.png, car-c3-contour.js   copies de assets/cars-libres/ (window.CAR_C3_CONTOUR, repère 1000 px de large)
  car-c3-flou.png                 la même voiture floutée, à demi-résolution (879 × 621), pour les temps où elle
                                  n'est plus qu'un décor flou (papiers, chute, renversement). Flou gaussien sur
                                  couleurs prémultipliées (pas de halo sombre au bord), sigma 6 px à demi-résolution
                                  (12 px en pleine résolution). Un fondu entre les deux images coûte bien moins cher
                                  au rendu qu'un filter: blur() CSS sur un PNG de 1757 px (rendu de MO6 : ≈ 2 h).
  car-c3-reperes.js               window.CAR_C3_REPERES : les points utiles au film, en pixels du PNG et dans le repère
                                  du contour (1000 px de large) : le pare-brise (quadrilatère pour poser l'étiquette
                                  « 2 700 € » en perspective avec matrix3d), une étiquette proposée dans ce plan, le
                                  point d'impact du tampon VENDUE, les points de contact des roues (sol), la plaque
                                  vierge et la boîte englobante.
Relevés sur une grille de 50 px (planche c3-ws-grid de la session du 9 octobre 2026).
"""
import json, shutil, sys
import numpy as np, cv2
from PIL import Image, ImageDraw
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIB = ROOT / 'assets/cars-libres'
OUT = ROOT / 'assets/photos-mo12'
OUT.mkdir(parents=True, exist_ok=True)
CHECK = Path(sys.argv[sys.argv.index('--check') + 1]) if '--check' in sys.argv else None

# 1. copies telles quelles
for f in ('car-c3.png', 'car-c3-contour.js'):
    shutil.copyfile(LIB / f, OUT / f)
im = Image.open(OUT / 'car-c3.png').convert('RGBA')
W, H = im.size                                                   # 1757 × 1241
K = 1000 / W                                                     # pixels du PNG → repère du contour

# 2. voiture floue, demi-résolution, flou sur couleurs prémultipliées
a = np.asarray(im).astype(np.float32) / 255
half = cv2.resize(a, (W // 2, H // 2), interpolation=cv2.INTER_AREA)
pm = half[..., :3] * half[..., 3:4]
pm = cv2.GaussianBlur(pm, (0, 0), 6.0); al = cv2.GaussianBlur(half[..., 3], (0, 0), 6.0)
rgb = pm / np.maximum(al[..., None], 1e-4)
flou = np.dstack([np.clip(rgb, 0, 1), al]) * 255
Image.fromarray(flou.round().astype(np.uint8), 'RGBA').save(OUT / 'car-c3-flou.png', optimize=True)

# 3. repères
WS = [(712, 75), (1325, 100), (1252, 445), (398, 345)]           # pare-brise : haut-g, haut-d, bas-d, bas-g (vitre)


def homography(quad):
    """Carré unité (u, v) → quadrilatère (haut-g, haut-d, bas-d, bas-g)."""
    return cv2.getPerspectiveTransform(np.float32([(0, 0), (1, 0), (1, 1), (0, 1)]), np.float32(quad))


def on_plane(Hm, u, v):
    p = Hm @ np.array([u, v, 1.0]); return (float(p[0] / p[2]), float(p[1] / p[2]))


Hw = homography(WS)
# étiquette proposée : côté passager (à gauche de l'image), au-dessus des balais d'essuie-glace. Plus grande qu'une
# feuille A4 (40 % de la largeur du pare-brise au lieu de 23 %) pour que « 2 700 € » se lise à 360 px : la voiture
# affichée à ≈ 950 px de large (× 0,54), l'étiquette (≈ 135 px de haut dans le PNG) fait ≈ 75 px à l'écran, assez
# pour un prix de 48 px
LAB_UV = [(0.05, 0.28), (0.45, 0.28), (0.45, 0.76), (0.05, 0.76)]
LAB = [on_plane(Hw, u, v) for u, v in LAB_UV]
STAMP = on_plane(Hw, 0.25, 0.52)                                  # centre de l'étiquette : impact du tampon VENDUE
GROUND = {'roue_avant': (1180, 1231), 'roue_arriere': (1650, 819)}   # bas des pneus côté visible (sol)
PLATE = [(181, 862), (531, 930), (533, 1010), (182, 940)]        # plaque vierge : celle du script de la bibliothèque,
#   décalée du rognage (− 80, − 98 px, mesuré par corrélation entre car-c3.png et src/wm-c3.jpg)
ys, xs = np.nonzero(np.asarray(im)[..., 3] > 128)
BBOX = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]

r1 = lambda p: [round(p[0], 1), round(p[1], 1)]
k1 = lambda p: [round(p[0] * K, 1), round(p[1] * K, 1)]
R = {
    'png': {'w': W, 'h': H}, 'contour_w': 1000, 'contour_h': round(H * K, 1),
    'avant': 'gauche',
    'pare_brise': {'px': [r1(p) for p in WS], 'contour': [k1(p) for p in WS],
                   'ordre': 'haut-g, haut-d, bas-d, bas-g (la vitre ; le bord gauche réel est courbe et passe à '
                            'l\'extérieur de ce quadrilatère)'},
    'etiquette': {'px': [r1(p) for p in LAB], 'contour': [k1(p) for p in LAB], 'uv': LAB_UV},
    'tampon': {'px': r1(STAMP), 'contour': k1(STAMP)},
    'sol': {k: {'px': list(v), 'contour': k1(v)} for k, v in GROUND.items()},
    'plaque': {'px': [list(p) for p in PLATE], 'contour': [k1(p) for p in PLATE]},
    'boite': {'px': BBOX, 'contour': [round(v * K, 1) for v in BBOX]},
    'flou': {'fichier': 'car-c3-flou.png', 'echelle': 0.5, 'sigma_px_pleine_resolution': 12},
}
(OUT / 'car-c3-reperes.js').write_text(
    '// MO12 : repères de la C3 (scripts/photos-mo12.py). px = pixels de car-c3.png ; contour = repère de\n'
    '// window.CAR_C3_CONTOUR (1000 px de large). Pour car-c3-flou.png, multiplier les px par 0,5.\n'
    'window.CAR_C3_REPERES = ' + json.dumps(R, ensure_ascii=False) + ';\n')

# 4. crédits
(OUT / 'CREDITS.tsv').write_text(
    'voiture\tfichier\tauteur\tlicence\tpage\tsource locale\n'
    'c3\tCitroën C3 front.jpg\tM 93\tPublic domain\thttps://commons.wikimedia.org/wiki/File%3ACitro%C3%ABn_C3_front.jpg'
    '\t../cars-libres/src/wm-c3.jpg (hors git ; déjà détourée : ../cars-libres/car-c3.png, '
    'scripts/cars-libres-twingo-c3.py)\n')
print('→', OUT, sorted(p.name for p in OUT.iterdir() if p.is_file()))

# 5. contrôle : sur le fond du film, étiquette et repères dessinés ; voiture floue à côté
if CHECK:
    CHECK.mkdir(parents=True, exist_ok=True)
    BG = (8, 7, 10, 255)
    base = Image.new('RGBA', (W, H), BG); base.alpha_composite(im)
    d = ImageDraw.Draw(base)
    d.polygon(WS, outline=(255, 140, 40, 255), width=4)
    d.polygon(LAB, fill=(240, 232, 214, 255), outline=(30, 30, 30, 255))
    d.ellipse([STAMP[0] - 8, STAMP[1] - 8, STAMP[0] + 8, STAMP[1] + 8], fill=(255, 90, 20, 255))
    for p in GROUND.values(): d.ellipse([p[0] - 10, p[1] - 10, p[0] + 10, p[1] + 10], outline=(80, 255, 120, 255), width=3)
    d.polygon(PLATE, outline=(80, 160, 255, 255), width=3)
    base.convert('RGB').resize((W // 2, H // 2)).save(CHECK / 'mo12-c3-reperes.jpg', quality=88)
    fl = Image.open(OUT / 'car-c3-flou.png')
    sheet = Image.new('RGBA', (W // 2 * 2 + 20, H // 2), BG)
    sharp = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sharp.alpha_composite(im)
    sheet.alpha_composite(sharp.resize((W // 2, H // 2)), (0, 0)); sheet.alpha_composite(fl, (W // 2 + 20, 0))
    sheet.convert('RGB').save(CHECK / 'mo12-c3-flou.jpg', quality=88)
    print('contrôle →', CHECK)
