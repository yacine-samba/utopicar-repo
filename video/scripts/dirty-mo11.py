"""MO11 « La préparation » : les états de la Clio III (assets/cars-libres/car-clio3.png), posés sur la voiture propre.

    python3 scripts/dirty-mo11.py            → assets/photos-mo11/ (calques + SVG + copie de la voiture et du contour)
    python3 scripts/dirty-mo11.py --check D  → en plus, planches de contrôle dans le dossier D (fond #08070a)

Méthode de scripts/dirty-mo9.py et scripts/polo-dirty-mo6.py, copiée (pas importée) : bruit à graine fixe, résultat
identique à chaque exécution. Coordonnées en pixels de car-clio3.png (1 809 × 1 232, l'avant regarde à gauche),
relevées sur une grille de 25 à 50 px (planches z-*.jpg de la session du 9 octobre 2026).

Calques RGBA de la taille du PNG (le film les peint par-dessus la voiture propre, dans cet ordre, chacun effacé par sa
ligne de partage) :
  clio3-poussiere.png    la voiture entière, sale : poussière brune en dégradé (dense sur le tiers bas et le bas de
                         caisse), projections au-dessus des roues, coulures sous les vitres et sous les optiques, vernis
                         sans éclat, « LAVE-MOI » tracé au doigt sur la portière avant (la peinture propre réapparaît
                         dans les lettres). Opaque sur la carrosserie : il remplace la voiture tant que le lavage n'est
                         pas passé. Salissure exagérée exprès : la peinture grise (luminance 102 / 255) ne ferait que
                         foncer sous une poussière réaliste, et il faut lire « sale » à 200 px.
  clio3-phares.png       voile jaune saturé et laiteux sur les deux optiques
  clio3-pare-brise.png   voile gris sur la face intérieure du pare-brise (≈ 40 %), traces d'essuyage ; derrière, trois
                         auréoles claires sur le dossier passager (le coup « Les sièges »)
  clio3-vitres.png       voile jaunâtre du tabac sur les vitres latérales, plus dense sur les bords
Vectoriels (viewBox = pixels du PNG, nets à tout grossissement, la caméra va jusqu'à × 1,6) :
  clio3-rayure.svg              rayure claire, effilée et interrompue, et deux éraflures sur l'aile avant, au-dessus de
                                la roue (trait principal de (1165, 657) à (1346, 592))
  clio3-enjoliveurs.svg         les deux enjoliveurs à l'achat : la photo des enjoliveurs salie pixel par pixel (image
                                PNG opaque intégrée, à la résolution de la photo : rayons gardés, creux noircis, voile
                                brun mat), puis en vectoriel le bord frotté, l'éclat et la fissure du rayon fendu
  clio3-enjoliveurs-neufs.svg   le reflet des enjoliveurs neufs (arc de lumière sur le bord, rien d'autre : la photo
                                montre déjà des enjoliveurs gris argent propres, losanges effacés)
  clio3-parechocs.png           (round 2) le coin avant gauche du bouclier frotté sur une bordure (lèvre basse,
                                x 42 → 246) : jamais réparé, la 3e règle de la carte ; visible tout le film
Copies pour le film : car-clio3.png, car-clio3-contour.js (window.CAR_CLIO3_CONTOUR), crédits dans CREDITS.tsv.
"""
import shutil, sys
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIB = ROOT / 'assets/cars-libres'
OUT = ROOT / 'assets/photos-mo11'
OUT.mkdir(parents=True, exist_ok=True)
CHECK = Path(sys.argv[sys.argv.index('--check') + 1]) if '--check' in sys.argv else None

for f in ('car-clio3.png', 'car-clio3-contour.js'):
    shutil.copyfile(LIB / f, OUT / f)
# crédits : la ligne de la bibliothèque (licence relue sur la page File: le 9 octobre 2026 : PD-self, « I, the copyright
# holder of this work, release this work into the public domain », auteur M 93 / Matthias93, photo du 27 mai 2009)
row = next(l for l in (LIB / 'CREDITS.tsv').read_text().splitlines() if l.startswith('clio3\t'))
(OUT / 'CREDITS.tsv').write_text(
    'voiture\tfichier\tauteur\tlicence\tpage\tsource locale\n'
    + row + '\t../cars-libres/car-clio3.png (détourée, logo, losanges, vignette et plaque effacés par '
    'scripts/cars-libres-clio3.py) ; calques clio3-* tirés de la même photo par scripts/dirty-mo11.py\n')

rng = np.random.default_rng(11)
car = Image.open(LIB / 'car-clio3.png').convert('RGBA'); W, H = car.size
rgb = np.asarray(car).astype(np.float32)[..., :3] / 255
alpha = np.asarray(car)[..., 3].astype(np.float32) / 255

# ---------------------------------------------------------------------------------------------------------------
# zones relevées sur la photo
# ---------------------------------------------------------------------------------------------------------------
WINDSHIELD = [(782, 70), (1000, 72), (1200, 79), (1365, 86), (1352, 170), (1336, 260), (1320, 330), (1300, 385),
              (1100, 388), (940, 378), (800, 362), (700, 350), (600, 338), (500, 322), (530, 285), (600, 205), (700, 125)]
SIDE_FRONT = [(1450, 83), (1473, 76), (1500, 73), (1523, 100), (1545, 200), (1563, 290), (1578, 332), (1500, 333),
              (1440, 330), (1400, 325), (1388, 287), (1395, 190), (1420, 118)]
SIDE_REAR = [(1532, 68), (1590, 72), (1625, 88), (1658, 113), (1680, 190), (1692, 258), (1640, 290), (1600, 315),
             (1568, 200), (1545, 110)]
LAMP_BIG = [(672, 819), (775, 814), (900, 804), (1000, 776), (1056, 745), (1094, 701), (1112, 632), (1117, 576),
            (1109, 554), (1081, 542), (1025, 539), (987, 548), (944, 570), (887, 607), (825, 645), (756, 689), (706, 726),
            (675, 782)]
LAMP_SMALL = [(100, 526), (80, 560), (62, 600), (50, 632), (44, 664), (60, 690), (90, 716), (98, 712), (106, 670),
              (114, 628), (132, 572), (152, 520), (176, 488), (194, 462), (186, 452), (160, 470), (130, 492)]
HUBS = [(1256, 991, 67, 169, 10), (1750, 613, 22, 96, 4)]        # enjoliveurs : centre, demi-axes, rotation (°)
ARCHES = [(1270, 760, 150, 120), (1745, 600, 70, 160)]           # passages de roue : projections de boue autour
BELT = [(1395, 335), (1580, 334), (1700, 262)]                    # bas des vitres latérales : départ des coulures
LAVE_QUAD = [(1375, 509), (1625, 461), (1625, 571), (1377, 646)]  # « LAVE-MOI » : haut-g, haut-d, bas-d, bas-g (× 1,25,
                                                                  # round 2 : lisible à 200 px)


def poly_mask(polys, blur=0.0):
    m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    for p in polys: d.polygon(p, fill=255)
    if blur: m = m.filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(m).astype(np.float32) / 255


def blur_noise(scale, sigma):
    n = rng.random((H // scale + 2, W // scale + 2)).astype(np.float32)
    im = Image.fromarray((n * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
    return np.asarray(im.filter(ImageFilter.GaussianBlur(sigma))).astype(np.float32) / 255


def save(a_rgb, a_alpha, name):
    a8 = (np.clip(a_alpha, 0, 1) * 255).astype(np.uint8)
    c8 = (np.clip(a_rgb, 0, 1) * 255).astype(np.uint8) * (a8 > 0)[..., None]   # RGB nul hors calque : fichier léger
    Image.fromarray(np.dstack([c8, a8]), 'RGBA').save(OUT / name, optimize=True)


glass = poly_mask([WINDSHIELD, SIDE_FRONT, SIDE_REAR], 2)
lamps = poly_mask([LAMP_BIG, LAMP_SMALL], 3)
lum = rgb.mean(-1, keepdims=True)
dark = np.clip((0.22 - lum[..., 0]) / 0.12, 0, 1)                 # pneus, grilles, joints : moins de poussière visible

# ---------------------------------------------------------------------------------------------------------------
# 1. poussière : la voiture entière, sale
# ---------------------------------------------------------------------------------------------------------------
dull = 0.10 + (lum + (rgb - lum) * 0.45) * 0.74                   # vernis sans éclat, noirs relevés
light = np.array([0.70, 0.65, 0.55], np.float32)                  # poussière sèche, claire et mate (surfaces du haut)
mud = np.array([0.34, 0.25, 0.15], np.float32)                    # boue brune (bas de caisse, bouclier, passages de roue)
YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)
# 1a. voile de poussière claire, en plaques : le haut de la voiture devient mat et beige
patch = blur_noise(40, 26); patch = (patch - patch.min()) / (np.ptp(patch) + 1e-6)
film = np.clip(0.34 + 0.34 * patch + 0.10 * blur_noise(6, 3), 0, 0.85)
film *= 1 - 0.55 * glass - 0.45 * lamps - 0.6 * dark              # vitres et optiques : voile plus léger
out = dull * (1 - film[..., None]) + light * film[..., None]
# 1b. boue : mesurée depuis le bas de la voiture, colonne par colonne (bouclier, bas de caisse), bord irrégulier
bottom = np.where(alpha.any(0), H - 1 - np.argmax(alpha[::-1] > 0.5, 0), 0).astype(np.float32)
bottom = cv2.blur(cv2.erode(bottom[None], np.ones((1, 61), np.float32))[0][None], (121, 1))[0]
dist = bottom[None, :] - YY                                       # pixels au-dessus du bas de la voiture
edge_n = 70 * (blur_noise(18, 10) - 0.5) + 35 * (blur_noise(5, 2) - 0.5)
mudc = np.clip((300 + edge_n - dist) / 140, 0, 1) ** 1.1
for cx, cy, rx, ry in ARCHES:                                     # projections autour des passages de roue
    r = np.sqrt(((XX - cx) / rx) ** 2 + ((YY - cy) / ry) ** 2)
    mudc = np.maximum(mudc, np.clip(1.3 - np.abs(r - 1.08) * 2.4, 0, 1) * (0.35 + 0.5 * np.clip((blur_noise(2, 1.2) - 0.35) * 2.5, 0, 1)))
speck = np.clip((blur_noise(1, 0.8) - 0.52) * 4, 0, 1)            # éclaboussures au-dessus de la limite
splash = np.clip((420 - dist) / 260, 0, 1) * speck * (0.5 + 0.5 * blur_noise(12, 6))
mudc = np.clip(np.maximum(mudc * (0.75 + 0.25 * blur_noise(9, 4)), splash), 0, 0.92) * (1 - glass) * (1 - dark * 0.55)
out = out * (1 - mudc[..., None]) + mud * (0.85 + 0.3 * blur_noise(7, 3))[..., None] * mudc[..., None]
# 1c. coulures sombres, irrégulières et effilées : sous les vitres latérales, sous les optiques et la calandre
st = Image.new('L', (W, H), 0); d = ImageDraw.Draw(st)
def belt_y(x):
    return float(np.interp(x, [p[0] for p in BELT], [p[1] for p in BELT]))
def drip(x, y0, L, w, v):
    x1 = x + rng.normal(0, 2.0); x2 = x1 + rng.normal(0, 1.5)
    d.line([(x, y0), (x1, y0 + L * 0.55)], fill=v, width=w)
    d.line([(x1, y0 + L * 0.55), (x2, y0 + L)], fill=int(v * 0.6), width=max(1, w - 2))
for _ in range(42):                                               # sous les vitres latérales
    x = rng.uniform(1400, 1700); drip(x, belt_y(x) + rng.uniform(2, 30), rng.uniform(30, 200), int(rng.uniform(2, 6)), int(rng.uniform(60, 190)))
for _ in range(34):                                               # bouclier et calandre, sous les optiques
    x = rng.uniform(60, 1090); y0 = float(np.interp(x, [60, 400, 700, 1000, 1090], [720, 800, 822, 790, 760])) + rng.uniform(0, 60)
    drip(x, y0, rng.uniform(25, 140), int(rng.uniform(2, 5)), int(rng.uniform(50, 170)))
streak = np.asarray(st.filter(ImageFilter.GaussianBlur(1.8))).astype(np.float32) / 255 * (1 - glass) * (1 - dark)
fine = np.clip((blur_noise(1, 0.6) - 0.60) * 4, 0, 1) * (0.4 + 0.6 * blur_noise(30, 20)) * (1 - glass)
spots = np.clip(streak * 0.8 + fine * 0.3, 0, 1)[..., None]
out = np.clip(out * (1 - spots * 0.6) + mud * 0.75 * spots * 0.6, 0, 1)

# « LAVE-MOI » au doigt : lettres tracées dans la poussière, la peinture propre réapparaît. Round 2 : la peinture
# éclaircie (× 1,12 + 0,03, luminance 0,41) se confondait avec la poussière pâle du haut de la portière (0,37-0,58),
# illisible à 200 px. Le doigt écrit donc dans une plaque de poussière épaisse et claire (≈ 0,64), et la peinture
# frottée reste plus sombre que la photo (≈ 0,29) : l'écart de luminance passe d'environ 0,05 à 0,35.
qm = cv2.dilate(poly_mask([LAVE_QUAD], 0), np.ones((31, 31), np.uint8))
_rq = np.random.default_rng(1125)                                  # tirage à part : les calques suivants ne changent pas
_nq = np.asarray(Image.fromarray((_rq.random((H // 8 + 2, W // 8 + 2)) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
                 .filter(ImageFilter.GaussianBlur(4))).astype(np.float32) / 255
thick = np.clip(cv2.GaussianBlur(qm, (0, 0), 16) * 1.15, 0, 1) * (1 - glass) * (1 - dark * 0.8) * (0.88 + 0.12 * _nq)
out = out * (1 - 0.8 * thick[..., None]) + light * 0.8 * thick[..., None]
def quad_pt(u, v):
    (x0, y0), (x1, y1), (x2, y2), (x3, y3) = LAVE_QUAD
    top = (x0 + (x1 - x0) * u, y0 + (y1 - y0) * u); bot = (x3 + (x2 - x3) * u, y3 + (y2 - y3) * u)
    return (top[0] + (bot[0] - top[0]) * v, top[1] + (bot[1] - top[1]) * v)
GLYPHS = {   # traits dans une boîte unité (largeur, hauteur 1), avance en unités
    'L': (0.62, [[(0, 0), (0, 1), (0.6, 1)]]),
    'A': (0.70, [[(0, 1), (0.33, 0), (0.66, 1)], [(0.14, 0.62), (0.52, 0.62)]]),
    'V': (0.70, [[(0, 0), (0.33, 1), (0.66, 0)]]),
    'E': (0.62, [[(0.6, 0), (0, 0), (0, 1), (0.6, 1)], [(0, 0.5), (0.48, 0.5)]]),
    '-': (0.48, [[(0.06, 0.55), (0.40, 0.55)]]),
    'M': (0.84, [[(0, 1), (0, 0), (0.39, 0.62), (0.78, 0), (0.78, 1)]]),
    'O': (0.70, [[(0.33 + 0.33 * np.cos(a), 0.5 + 0.5 * np.sin(a)) for a in np.linspace(0, 2 * np.pi, 33)]]),
    'I': (0.22, [[(0.08, 0), (0.08, 1)]]),
}
TEXT = 'LAVE-MOI'; GAP = 0.20
total = sum(GLYPHS[c][0] for c in TEXT) + GAP * (len(TEXT) - 1)
lt = Image.new('L', (W, H), 0); d = ImageDraw.Draw(lt)
ux = 0.0
for c in TEXT:
    adv, strokes = GLYPHS[c]
    for s in strokes:
        pts = []
        for (gx, gy) in s:
            u = (ux + gx) / total; v = 0.08 + gy * 0.84
            px, py = quad_pt(u, v)
            pts.append((px + rng.normal(0, 0.7), py + rng.normal(0, 0.7)))
        d.line(pts, fill=255, width=18, joint='curve')            # un doigt, pas une pointe (round 2 : 11 → 18 px)
        for p in (pts[0], pts[-1]): d.ellipse([p[0] - 9, p[1] - 9, p[0] + 9, p[1] + 9], fill=255)
    ux += adv + GAP
letters = np.asarray(lt.filter(ImageFilter.GaussianBlur(1.1))).astype(np.float32) / 255
letters *= 0.82 + 0.18 * blur_noise(2, 1.0)                      # bord du doigt irrégulier, un peu de poussière reste
L3 = letters[..., None]
out = out * (1 - L3) + np.clip(rgb * 0.86, 0, 1) * L3              # la peinture frottée par le doigt, sombre et nette
poussiere = out
save(poussiere, alpha, 'clio3-poussiere.png')

# ---------------------------------------------------------------------------------------------------------------
# 2. phares : voile jaune saturé, laiteux, craquelé
# ---------------------------------------------------------------------------------------------------------------
m = poly_mask([LAMP_BIG, LAMP_SMALL], 4)
haze = 0.62 + 0.38 * blur_noise(14, 9)
craze = np.clip((blur_noise(3, 1.2) - 0.5) * 3, 0, 1) * 0.15
a = m * np.clip(haze + craze, 0, 1) * 0.88
col = np.array([0.90, 0.70, 0.30], np.float32) * (0.88 + 0.12 * blur_noise(6, 2)[..., None])
col = col * (1 - 0.25 * lum) + 0.25 * lum * np.array([1.0, 0.86, 0.55], np.float32)   # reflets de l'optique conservés
save(col, a, 'clio3-phares.png')

# ---------------------------------------------------------------------------------------------------------------
# 3. pare-brise : voile gris sur la face intérieure, traces d'essuyage circulaires
# ---------------------------------------------------------------------------------------------------------------
m = poly_mask([WINDSHIELD], 3)
wipe = Image.new('L', (W, H), 0); d = ImageDraw.Draw(wipe)
for _ in range(16):                                               # arcs laissés par un chiffon sec
    cx, cy = rng.uniform(620, 1300), rng.uniform(130, 360); r = rng.uniform(40, 110)
    a0 = rng.uniform(0, 360)
    d.arc([cx - r, cy - r * 0.6, cx + r, cy + r * 0.6], a0, a0 + rng.uniform(80, 200), fill=int(rng.uniform(90, 180)), width=int(rng.uniform(6, 14)))
wipe = np.asarray(wipe.filter(ImageFilter.GaussianBlur(5))).astype(np.float32) / 255
# voile ramené vers 40 % (round 1) : on doit voir les sièges derrière, et leurs auréoles
a = m * np.clip(0.30 + 0.14 * blur_noise(16, 12) + 0.20 * wipe, 0, 0.70)
col = np.broadcast_to(np.array([0.66, 0.65, 0.62], np.float32), (H, W, 3)) * (0.92 + 0.08 * blur_noise(4, 2)[..., None])
# 3b. auréoles claires sur le dossier passager, derrière la vitre (x 1 060-1 230, y 160-290) : le coup « Les sièges »
#     montre des sièges tachés, pas une vitre. Tirage à part (graine 311) : la suite des calques ne change pas.
rs = np.random.default_rng(311)
# deux auréoles coupées en deux par l'arrêt de la ligne (x = 1 140), au-dessus et au-dessous de sa poignée (y 204-254),
# une troisième entière du côté encore sale
STAINS = [(1150, 164, 54, 36, -10), (1134, 298, 56, 36, 6), (1215, 236, 40, 30, 12)]   # centre, demi-axes, rotation (°)
fill_m = Image.new('L', (W, H), 0); ring_m = Image.new('L', (W, H), 0)
df, dr = ImageDraw.Draw(fill_m), ImageDraw.Draw(ring_m)
for cx, cy, rx, ry, ang in STAINS:
    th = np.linspace(0, 2 * np.pi, 72, endpoint=False); ph = rs.uniform(0, 2 * np.pi, 3)
    k = 1 + 0.10 * np.sin(3 * th + ph[0]) + 0.06 * np.sin(5 * th + ph[1]) + 0.04 * np.sin(9 * th + ph[2])
    ca, sa = np.cos(np.radians(ang)), np.sin(np.radians(ang))
    pts = [(cx + rx * kk * np.cos(t) * ca - ry * kk * np.sin(t) * sa, cy + rx * kk * np.cos(t) * sa + ry * kk * np.sin(t) * ca) for t, kk in zip(th, k)]
    df.polygon(pts, fill=235); dr.line(pts + [pts[0]], fill=255, width=10, joint='curve')
# round 2 : à 360 px, des plaques beiges de 25 px ne se lisaient pas comme des taches sur un siège. Fond saturé
# (#c49a5c, l'eau sale qui a séché dans le tissu), liseré sombre à part (#5c4128 à 90 %, la marque d'une auréole
# séchée), voile du pare-brise éclairci sur les taches.
fill = np.asarray(fill_m.filter(ImageFilter.GaussianBlur(6))).astype(np.float32) / 255
ring = np.asarray(ring_m.filter(ImageFilter.GaussianBlur(3))).astype(np.float32) / 255
stain = np.maximum(fill, ring)
a = a * (1 - 0.75 * stain)                                        # voile plus léger devant les taches
a_f, a_r = m * 0.95 * fill, m * 0.9 * ring             # mesuré à 360 px : R − B 54 avec 0,85 et un fond à 200
c_s = np.array([0.769, 0.604, 0.361], np.float32)                 # #c49a5c
c_r = np.array([0.361, 0.255, 0.157], np.float32)                 # #5c4128
a_b = a_r + a_f * (1 - a_r)                                       # le liseré sur le fond de la tache, derrière la vitre
col_b = (c_r * a_r[..., None] + c_s * (a_f * (1 - a_r))[..., None]) / np.maximum(a_b, 1e-6)[..., None]
A = a + a_b * (1 - a)                                             # la tache derrière, le voile devant
col = (col * a[..., None] + col_b * (a_b * (1 - a))[..., None]) / np.maximum(A, 1e-6)[..., None]
a = A
save(col, a, 'clio3-pare-brise.png')

# ---------------------------------------------------------------------------------------------------------------
# 4. vitres latérales : voile jaunâtre du tabac, plus dense sur les bords et en haut
# ---------------------------------------------------------------------------------------------------------------
m = poly_mask([SIDE_FRONT, SIDE_REAR], 2)
inner = poly_mask([SIDE_FRONT, SIDE_REAR], 0)
edge = np.clip(1 - cv2.GaussianBlur(cv2.erode(inner, np.ones((3, 3), np.uint8), iterations=14), (0, 0), 10) * 1.0, 0, 1)
top = np.clip((260 - YY) / 220, 0, 1)
a = m * np.clip(0.52 + 0.20 * edge + 0.12 * top + 0.12 * (blur_noise(12, 8) - 0.5), 0, 0.88)
col = np.broadcast_to(np.array([0.74, 0.62, 0.36], np.float32), (H, W, 3)) * (0.9 + 0.1 * blur_noise(5, 2)[..., None])
save(col, a, 'clio3-vitres.png')

# ---------------------------------------------------------------------------------------------------------------
# 5. vectoriels : rayure, enjoliveurs à l'achat, reflet des enjoliveurs neufs
# ---------------------------------------------------------------------------------------------------------------
def svg(body, defs=''):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
            f'<defs>{defs}</defs>{body}</svg>\n')

def path(pts, close=False):
    s = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)
    return s + (' Z' if close else '')

def jitter_line(x0, y0, x1, y1, n, j, bow=0.0):
    pts = []
    for i in range(n + 1):
        t = i / n; bx = -(y1 - y0) * bow * 4 * t * (1 - t); by = (x1 - x0) * bow * 4 * t * (1 - t)
        pts.append((x0 + (x1 - x0) * t + bx + rng.normal(0, j), y0 + (y1 - y0) * t + by + rng.normal(0, j)))
    return pts

# rayure : un trait principal clair, effilé aux deux bouts, interrompu deux fois (la clé a sauté), avec une ombre fine
# dessous et un halo de vernis rayé autour ; deux éraflures plus fines et quelques micro-rayures, sur l'aile avant
# au-dessus de la roue. Polygones à largeur variable (pas de trait à bord constant), ligne médiane presque droite
# (une ondulation lente, pas de zigzag point par point) : à × 1,6 elle doit se lire comme une rayure, pas comme un dessin.
def scratch(x0, y0, x1, y1, wmax, segs=((0, 1),), bow=0.0, wav=0.5, n=80):
    """Polygones (un par segment [t0, t1]) d'une rayure effilée ; renvoie (polygones, demi-largeurs)."""
    ph = rng.uniform(0, 2 * np.pi, 3); L = np.hypot(x1 - x0, y1 - y0)
    tx, ty = (x1 - x0) / L, (y1 - y0) / L; nx, ny = -ty, tx
    polys = []
    for t0, t1 in segs:
        ts = np.linspace(t0, t1, max(8, int(n * (t1 - t0))))
        off = bow * L * 4 * ts * (1 - ts) + wav * (np.sin(ts * 7.1 + ph[0]) + 0.5 * np.sin(ts * 17.3 + ph[1]))
        cxs, cys = x0 + (x1 - x0) * ts + nx * off, y0 + (y1 - y0) * ts + ny * off
        def ss(e0, e1, x):
            k = np.clip((x - e0) / (e1 - e0), 0, 1); return k * k * (3 - 2 * k)
        taper = ss(0, 0.12, ts) * ss(1, 0.86, ts)                   # effilée aux deux bouts de la rayure entière
        cut = ss(t0, t0 + 0.02, ts) * ss(t1, t1 - 0.02, ts)          # coupures nettes là où la clé a sauté
        irr = 0.62 + 0.38 * (0.5 + 0.25 * np.sin(ts * 31 + ph[2]) + 0.25 * np.sin(ts * 67 + ph[1]))
        w = wmax * np.maximum(taper * (cut if (t0, t1) != (0, 1) else 1), 0.04) * irr
        left = [(x + nx * ww, y + ny * ww) for x, y, ww in zip(cxs, cys, w)]
        right = [(x - nx * ww, y - ny * ww) for x, y, ww in zip(cxs, cys, w)]
        polys.append(left + right[::-1])
    return polys

def poly_svg(polys, fill, op, dx=0.0, dy=0.0):
    return ''.join(f'<path d="{path([(x + dx, y + dy) for x, y in P], True)}" fill="{fill}" fill-opacity="{op}"/>'
                   for P in polys)

def scratch_layers(x0, y0, x1, y1, wmax, segs=((0, 1),), bow=0.0, wav=0.5, core=.95):
    st = rng.bit_generator.state
    halo = scratch(x0, y0, x1, y1, wmax * 2.3, segs, bow, wav)    # même ligne médiane (même tirage), plus large
    rng.bit_generator.state = st
    shad = scratch(x0, y0, x1, y1, wmax * 1.25, segs, bow, wav)
    rng.bit_generator.state = st
    mid = scratch(x0, y0, x1, y1, wmax, segs, bow, wav)
    return (poly_svg(halo, '#e9e2d6', '.40') + poly_svg(shad, '#231d19', '.35', 0.0, -0.8)   # sillon : bord haut dans l'ombre
            + poly_svg(mid, '#fbf8f2', core))

body = (scratch_layers(1165, 657, 1346, 592, 5.0, segs=((0, 0.41), (0.44, 0.82), (0.85, 1.0)), bow=0.012, wav=0.45)
        + scratch_layers(1192, 676, 1292, 641, 2.6, segs=((0, 0.62), (0.66, 1.0)), bow=0.01, wav=0.3, core=.8)
        + scratch_layers(1218, 641, 1302, 613, 1.6, bow=-0.01, wav=0.25, core=.7)
        + ''.join(scratch_layers(x, y, x + dx, y - dx * 0.36, 0.5, wav=0.1, core=.6)
                  for x, y, dx in [(1158, 668, 14), (1172, 662, 9), (1330, 604, 12), (1250, 660, 10)]))
(OUT / 'clio3-rayure.svg').write_text(svg(body))

def hub_pt(h, th, r):
    cx, cy, rx, ry, ang = h; a = np.radians(ang); x, y = rx * r * np.cos(np.radians(th)), ry * r * np.sin(np.radians(th))
    return (cx + x * np.cos(a) - y * np.sin(a), cy + x * np.sin(a) + y * np.cos(a))

# enjoliveurs à l'achat : la photo des enjoliveurs elle-même, salie pixel par pixel (rayons gardés, creux noircis par
# la poussière de frein, voile brun mat, plus dense vers le bord), posée en image opaque à la résolution de la photo
# (aussi nette que la voiture dessous, à tout grossissement) ; par-dessus, en vectoriel, le bord frotté, l'éclat
# manquant et la fissure du rayon fendu.
import base64, io
def hub_texture(h):
    cx, cy, rx, ry, ang = h; a = np.radians(ang)
    bx = np.hypot(rx * np.cos(a), ry * np.sin(a)); by = np.hypot(rx * np.sin(a), ry * np.cos(a))
    x0, x1, y0, y1 = int(cx - bx - 4), int(cx + bx + 5), int(cy - by - 4), int(cy + by + 5)
    sub = rgb[y0:y1, x0:x1]; al = alpha[y0:y1, x0:x1]
    dx, dy = XX[y0:y1, x0:x1] - cx, YY[y0:y1, x0:x1] - cy
    u = (dx * np.cos(a) + dy * np.sin(a)) / rx; v = (-dx * np.sin(a) + dy * np.cos(a)) / ry
    r = np.hypot(u, v); th = np.arctan2(v, u)
    m = np.clip((1.065 - r) / 0.035, 0, 1) * al                  # jusqu'au bord roulé de l'enjoliveur
    Ls = sub.mean(-1, keepdims=True)
    n1, n2, n3 = (blur_noise(6, 3)[y0:y1, x0:x1], blur_noise(2, 0.8)[y0:y1, x0:x1], blur_noise(14, 8)[y0:y1, x0:x1])
    col = sub * 0.3 + Ls * 0.7                                    # gris terne, sans reflet métallique
    col = 0.03 + col * 0.45                                       # plus sombre que le neuf, même lavé (round 1)
    col = np.where(col > 0.46, 0.46 + (col - 0.46) * 0.35, col)    # hautes lumières écrasées : plus d'éclat
    col = col * np.array([1.10, 0.85, 0.60], np.float32)           # voile brun
    rec = np.clip((0.30 - Ls[..., 0]) / 0.18, 0, 1)[..., None]     # creux entre les rayons : poussière de frein noire
    col = col * (1 - 0.65 * rec) + np.array([0.10, 0.075, 0.055], np.float32) * 0.65 * rec
    d = (0.85 * np.clip((r - 0.50) / 0.42, 0, 1) * (0.55 + 0.7 * n1) * (0.75 + 0.25 * (np.sin(th) > 0)))[..., None]
    col = col * (1 - d) + np.array([0.21, 0.15, 0.10], np.float32) * d   # poussière de frein, plus dense au bord
    blot = np.clip((n3 - 0.55) * 3.0, 0, 1)[..., None] * 0.35       # taches plus sombres, en plaques
    col = col * (1 - blot) + np.array([0.16, 0.12, 0.08], np.float32) * blot
    col = np.clip(col * (0.86 + 0.26 * n2[..., None]), 0, 1)        # grain mat
    a8 = (np.clip(m, 0, 1) * 255).astype(np.uint8)
    im = Image.fromarray(np.dstack([(col * 255).astype(np.uint8), a8]), 'RGBA')
    buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True)
    return (f'<image x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" '
            f'href="data:image/png;base64,{base64.b64encode(buf.getvalue()).decode()}"/>')

defs = ''
body = ''
for k, h in enumerate(HUBS):
    cx, cy, rx, ry, ang = h; s = ry / 169                       # échelle : la roue arrière est plus petite
    body += hub_texture(h)
    # bord frotté contre le trottoir (en bas, côté avant) : éraflures claires sur l'anneau extérieur
    for _ in range(9 if k == 0 else 4):                          # le long de l'anneau, pas en travers
        th = rng.uniform(30, 120); r0 = rng.uniform(1.0, 1.035)
        arc = [hub_pt(h, t_, r0 + rng.normal(0, 0.003)) for t_ in np.linspace(th, th + rng.uniform(4, 11), 5)]
        body += f'<path d="{path(arc)}" stroke="#cfc6b8" stroke-opacity="{rng.uniform(.30, .50):.2f}" stroke-width="{0.9 * max(s, .6):.2f}" stroke-linecap="round" fill="none"/>'
    if k == 0:   # le rayon fendu : un éclat manquant au bord, une fissure qui part vers le centre
        chip = [hub_pt(h, th, r) for th, r in [(-52, 1.0), (-38, 1.0), (-40, 0.9), (-44, 0.86), (-49, 0.9)]]
        body += f'<path d="{path(chip, True)}" fill="#120e0b" fill-opacity=".92"/>'
        crack = [hub_pt(h, th, r) for th, r in [(-45, 0.87), (-47, 0.8), (-44, 0.73), (-48, 0.66), (-46, 0.6), (-50, 0.52), (-48, 0.46)]]
        body += f'<path d="{path(crack)}" stroke="#16110d" stroke-width="2.4" stroke-linejoin="round" fill="none"/>'
        body += f'<path d="{path([(x + 1.6, y + 0.4) for x, y in crack])}" stroke="#efe8dc" stroke-opacity=".55" stroke-width=".9" fill="none"/>'
        branch = [hub_pt(h, th, r) for th, r in [(-46, 0.6), (-38, 0.56), (-33, 0.5)]]
        body += f'<path d="{path(branch)}" stroke="#16110d" stroke-width="1.5" fill="none"/>'
(OUT / 'clio3-enjoliveurs.svg').write_text(svg(body, defs))

defs = ('<filter id="doux" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.6"/></filter>')
body = '<g filter="url(#doux)" fill="none" stroke-linecap="round">'
for h in HUBS:
    s = h[3] / 169
    arc = [hub_pt(h, th, 0.95) for th in np.linspace(-165, -75, 24)]
    body += f'<path d="{path(arc)}" stroke="#ffffff" stroke-opacity=".75" stroke-width="{5 * max(s, .5):.1f}"/>'
    arc2 = [hub_pt(h, th, 0.62) for th in np.linspace(-150, -110, 10)]
    body += f'<path d="{path(arc2)}" stroke="#ffffff" stroke-opacity=".45" stroke-width="{3 * max(s, .5):.1f}"/>'
body += '</g>'
(OUT / 'clio3-enjoliveurs-neufs.svg').write_text(svg(body, defs))

# pare-chocs (round 2) : le coin avant gauche du bouclier frotté contre une bordure, sur la lèvre basse (x 40 → 250).
# Le film ne le répare jamais : c'est la 3e règle de la carte (« Pare-chocs · 600 € » > 15 % de 3 300 €), on vend en
# l'état. Visible tout le film, photo 1 comprise. Bords de la lèvre relevés colonne par colonne sur la photo (luminance
# 70-150 entre la grille noire et l'ombre du dessous). Calque raster comme les autres (un dessin vectoriel se lisait
# comme un éclair collé) : vernis abrasé blanchi, stries dans le sens du frottement, plastique noir à nu dans les
# sillons et au coin. Tirage à part (graine 4711) : les autres calques ne changent pas.
rp = np.random.default_rng(4711)
LIP_X = [30, 50, 80, 110, 150, 200, 250, 300]
LIP_T = [896, 904, 926, 950, 980, 1005, 1030, 1046]
LIP_B = [984, 988, 998, 1014, 1036, 1054, 1070, 1086]
X0, X1 = 30, 280
lt_ = np.interp(XX, LIP_X, LIP_T); lb_ = np.interp(XX, LIP_X, LIP_B)
v = (YY - lt_) / np.maximum(lb_ - lt_, 1)                         # 0 au haut de la lèvre, 1 en bas
u = np.clip((XX - X0) / (X1 - X0), 0, 1)
def nz(scale, sig): # bruit à graine propre
    n = rp.random((H // scale + 2, W // scale + 2)).astype(np.float32)
    im = Image.fromarray((n * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
    return np.asarray(im.filter(ImageFilter.GaussianBlur(sig))).astype(np.float32) / 255
rough = nz(6, 3) - 0.5
v_top = 0.06 + 0.46 * u ** 0.9 + 0.12 * rough                     # épais au coin, plus fin vers la plaque
inside = np.clip((v - v_top) * 14, 0, 1) * np.clip((0.97 - v) * 14, 0, 1)
inside *= np.clip((XX - X0) / 6, 0, 1) * np.clip((X1 + 30 * rough - XX) / 22, 0, 1)
inside *= (XX < X1 + 40) * (XX > X0 - 5)
# stries dans le sens de la lèvre (pente ≈ 0,47 au coin, 0,33 vers la plaque) : bruit fin étiré par un noyau ligne
ang = np.degrees(np.arctan(0.42)); L_ = 41
ker = np.zeros((L_, L_), np.float32); ker[L_ // 2, :] = 1
ker = cv2.warpAffine(ker, cv2.getRotationMatrix2D((L_ // 2, L_ // 2), -ang, 1.0), (L_, L_)); ker /= ker.sum()
sub = (slice(820, 1120), slice(0, 360))                           # le calcul seulement autour du coin
fine = cv2.filter2D(rp.random((300, 360)).astype(np.float32), -1, ker)
fine = (fine - fine.mean()) / (fine.std() + 1e-6)
streak = np.zeros((H, W), np.float32); streak[sub] = fine
dark_s = np.clip((streak - 0.6) * 1.4, 0, 1)                      # sillons : plastique noir
lite_s = np.clip((-streak - 0.6) * 1.0, 0, 1)                     # stries claires : apprêt
abr = inside * (0.75 + 0.25 * nz(3, 1.5))                        # vernis abrasé (mat, blanchi)
base = np.clip(rgb * 0.4 + np.array([0.86, 0.85, 0.83], np.float32) * 0.6, 0, 1)
colp = base * (1 - 0.85 * dark_s[..., None]) + np.array([0.08, 0.07, 0.06], np.float32) * 0.85 * dark_s[..., None]
colp = colp * (1 - 0.7 * lite_s[..., None]) + np.array([0.95, 0.94, 0.92], np.float32) * 0.7 * lite_s[..., None]
# entaille profonde au coin : plastique noir à nu, bord clair (vernis éclaté)
GOUGE = [(33, 928), (58, 934), (92, 954), (128, 980), (156, 1000), (150, 1006), (118, 998), (82, 984), (52, 970), (35, 958)]
gx, gy = zip(*(GOUGE + GOUGE[:1])); gt = np.r_[0, np.cumsum(np.hypot(np.diff(gx), np.diff(gy)))]
gs = np.linspace(0, gt[-1], 90, endpoint=False)                   # bord déchiqueté : 90 points, ± 2,5 px
g = poly_mask([[(float(np.interp(t_, gt, gx)) + rp.normal(0, 2.5), float(np.interp(t_, gt, gy)) + rp.normal(0, 2.5)) for t_ in gs]], 0.8)
ge = np.clip(cv2.dilate(g, np.ones((7, 7), np.uint8)) - g, 0, 1) * (0.6 + 0.4 * nz(2, 1))   # vernis éclaté autour
colp = colp * (1 - g[..., None]) + np.array([0.07, 0.06, 0.055], np.float32) * g[..., None]
colp = colp * (1 - 0.8 * ge[..., None]) + np.array([0.93, 0.92, 0.9], np.float32) * 0.8 * ge[..., None]
a_pc = np.clip(np.maximum(abr * 0.92, np.maximum(g, ge * 0.8)) , 0, 1) * (alpha > 0.5)
a_pc = cv2.GaussianBlur(a_pc, (0, 0), 0.7)
save(colp, a_pc, 'clio3-parechocs.png')
print('ok', OUT)

# ---------------------------------------------------------------------------------------------------------------
# contrôle : états composés sur fond #08070a, plein cadre et à 200 px de large
# ---------------------------------------------------------------------------------------------------------------
if CHECK:
    import subprocess, json
    CHECK.mkdir(parents=True, exist_ok=True)
    names = ['clio3-rayure.svg', 'clio3-enjoliveurs.svg', 'clio3-enjoliveurs-neufs.svg']
    # rendu par Chromium (Playwright de video/node_modules), comme dans le film ; un seul navigateur, fermé aussitôt
    js = ("import { chromium } from 'playwright'; import fs from 'fs';"
          "const [W, H, out, ...files] = JSON.parse(process.argv[1]); const b = await chromium.launch();"
          "const p = await b.newPage({ viewport: { width: W, height: H } });"
          "for (const f of files) { await p.setContent('<body style=\"margin:0;background:transparent\">' + fs.readFileSync(f, 'utf8') + '</body>');"
          "await p.screenshot({ path: out + '/' + f.split('/').pop() + '.png', omitBackground: true }); } await b.close();")
    subprocess.run(['node', '--input-type=module', '-e', js, json.dumps([W, H, str(CHECK), *[str(OUT / n) for n in names]])], cwd=ROOT, check=True)
    def svg_png(name):
        return Image.open(CHECK / f'{name}.png').convert('RGBA')
    clean = car
    def comp(layers):
        bg = Image.new('RGBA', (W, H), (8, 7, 10, 255)); bg.alpha_composite(clean)
        for L in layers: bg.alpha_composite(L)
        return bg
    P = {n: Image.open(OUT / n).convert('RGBA') for n in ('clio3-poussiere.png', 'clio3-phares.png', 'clio3-pare-brise.png', 'clio3-vitres.png')}
    PC = Image.open(OUT / 'clio3-parechocs.png').convert('RGBA')
    R, E, N = svg_png('clio3-rayure.svg'), svg_png('clio3-enjoliveurs.svg'), svg_png('clio3-enjoliveurs-neufs.svg')
    sale = comp([P['clio3-poussiere.png'], PC, P['clio3-phares.png'], P['clio3-pare-brise.png'], P['clio3-vitres.png'], R, E])
    lavee = comp([PC, P['clio3-phares.png'], P['clio3-pare-brise.png'], P['clio3-vitres.png'], R, E])
    propre = comp([PC, N])
    for n, im in [('sale', sale), ('lavee', lavee), ('propre', propre)]: im.convert('RGB').save(CHECK / f'mo11-etat-{n}.jpg', quality=90)
    small = [im.convert('RGB').resize((200, int(200 * H / W)), Image.LANCZOS) for im in (sale, propre)]
    S = Image.new('RGB', (420, small[0].height + 20), (8, 7, 10)); S.paste(small[0], (5, 10)); S.paste(small[1], (215, 10))
    S.save(CHECK / 'mo11-etat-200px.png')
    print('contrôle', CHECK)
