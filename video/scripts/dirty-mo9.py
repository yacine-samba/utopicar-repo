"""MO9 : calques « à l'achat » posés sur la voiture détourée, effacés par le trait de lumière dans le film.
    python3 scripts/dirty-mo9.py [clio-a|sandero-a]   (clio-a par défaut, la voiture retenue)
  <nom>-terne.png   la voiture ternie, poussiéreuse (méthode MO6)
  <nom>-phares.png  voile jaune sur les optiques
  <nom>-rayure.png  rayure claire sur l'aile avant
Bruit à graine fixe : résultat identique à chaque exécution.
"""
import numpy as np, sys
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CAR = sys.argv[1] if len(sys.argv) > 1 else 'clio-a'
# coordonnées dans <nom>.png : coulures (x0, x1, y0 min, y0 max), optiques (polygones), rayures (x0, y0, x1, y1, largeur)
CFG = {
    'sandero-a': dict(streak=(380, 1640, 330, 470),
                      lamps=[[(530, 690), (560, 640), (640, 615), (820, 600), (940, 590), (930, 640), (870, 700), (720, 760), (580, 775)],
                             [(30, 610), (40, 540), (70, 500), (92, 500), (84, 570), (56, 630)]],
                      scratches=[(985, 700, 1150, 640, 4), (1000, 712, 1110, 676, 2), (1030, 690, 1130, 660, 1)]),
    'clio-a': dict(streak=(520, 1700, 300, 380),
                   lamps=[[(580, 470), (640, 430), (760, 400), (870, 386), (884, 420), (830, 480), (720, 524), (600, 536)],
                          [(32, 480), (40, 420), (70, 386), (92, 392), (84, 450), (56, 494)]],
                   scratches=[(920, 478, 1080, 426, 4), (936, 490, 1046, 456, 2), (962, 468, 1062, 440, 1)]),
}[CAR]
SRC = ROOT / f'assets/photos-mo9/{CAR}.png'
OUT = ROOT / 'assets/photos-mo9'
rng = np.random.default_rng(9)
car = Image.open(SRC).convert('RGBA'); W, H = car.size
rgb = np.asarray(car).astype(np.float32)[..., :3] / 255
alpha = np.asarray(car)[..., 3].astype(np.float32) / 255

def blur_noise(scale, sigma):
    n = rng.random((H // scale + 2, W // scale + 2)).astype(np.float32)
    im = Image.fromarray((n * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
    return np.asarray(im.filter(ImageFilter.GaussianBlur(sigma))).astype(np.float32) / 255

# terne : vernis sans brillance, poussière plus dense en bas, coulures sous les vitres
lum = rgb.mean(-1, keepdims=True)
dull = 0.14 + (lum + (rgb - lum) * 0.5) * 0.72
dust = np.array([0.52, 0.46, 0.38], np.float32)
yy = np.linspace(0, 1, H, dtype=np.float32)[:, None]
grime = np.clip((yy - 0.42) / 0.55, 0, 1) ** 1.3
grime = np.clip(grime * (0.55 + 0.45 * blur_noise(24, 18)) + 0.16 * blur_noise(8, 3), 0, 0.85)[..., None]
dull = dull * (1 - grime * 0.6) + dust * grime * 0.6
speck = np.clip((blur_noise(1, 0.6) - 0.62) * 4, 0, 1) * (0.4 + 0.6 * blur_noise(30, 20))
st = Image.new('L', (W, H), 0); d = ImageDraw.Draw(st)
x0s, x1s, y0a, y0b = CFG['streak']
for _ in range(80):
    x = rng.uniform(x0s, x1s); y0 = rng.uniform(y0a, y0b)
    d.line([(x, y0), (x + rng.normal(0, 3), y0 + rng.uniform(40, 150))], fill=int(rng.uniform(60, 140)), width=int(rng.uniform(2, 5)))
spots = (speck * 0.5 + np.asarray(st.filter(ImageFilter.GaussianBlur(3))).astype(np.float32) / 255 * 0.6)[..., None]
dull = np.clip(dull * (1 - spots * 0.5) + dust * spots * 0.5, 0, 1)
Image.fromarray(np.dstack([dull * 255, alpha * 255]).astype(np.uint8), 'RGBA').save(OUT / f'{CAR}-terne.png')

# phares : voile jaune laiteux
mask = Image.new('L', (W, H), 0); d = ImageDraw.Draw(mask)
for poly in CFG['lamps']: d.polygon(poly, fill=255)
m = np.asarray(mask.filter(ImageFilter.GaussianBlur(6))).astype(np.float32) / 255
a = m * (0.55 + 0.45 * blur_noise(16, 10)) * 0.85
col = np.array([0.86, 0.72, 0.42], np.float32) * (0.85 + 0.15 * blur_noise(6, 2)[..., None])
Image.fromarray(np.dstack([col * 255, a * 255]).astype(np.uint8), 'RGBA').save(OUT / f'{CAR}-phares.png')

# rayure : trait principal irrégulier et deux éraflures sur l'aile avant
sc = Image.new('L', (W, H), 0); d = ImageDraw.Draw(sc)
def scratch(x0, y0, x1, y1, w, n=40, jit=1.4):
    pts = [(x0 + (x1 - x0) * i / n + rng.normal(0, jit), y0 + (y1 - y0) * i / n + rng.normal(0, jit)) for i in range(n + 1)]
    for p, q in zip(pts, pts[1:]): d.line([p, q], fill=int(rng.uniform(170, 255)), width=w)
for (a0, b0, a1, b1, w) in CFG['scratches']: scratch(a0, b0, a1, b1, w, jit=0.9)
s = np.asarray(sc.filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32) / 255 * alpha
Image.fromarray(np.dstack([np.full((H, W, 3), 236, np.float32), s * 255]).astype(np.uint8), 'RGBA').save(OUT / f'{CAR}-rayure.png')
print('ok', OUT)
