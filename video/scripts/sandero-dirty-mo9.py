"""MO9 : calques « à l'achat » posés sur la Sandero détourée (sandero-a.png), effacés par le trait de lumière dans le film.
  terne.png   la voiture ternie, poussiéreuse (méthode MO6)
  phares.png  voile jaune sur les optiques
  rayure.png  rayure claire sur l'aile avant
Bruit à graine fixe : résultat identique à chaque exécution.
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/photos-mo9/sandero-a.png'
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
for _ in range(80):
    x = rng.uniform(380, 1640); y0 = rng.uniform(330, 470)
    d.line([(x, y0), (x + rng.normal(0, 3), y0 + rng.uniform(40, 150))], fill=int(rng.uniform(60, 140)), width=int(rng.uniform(2, 5)))
spots = (speck * 0.5 + np.asarray(st.filter(ImageFilter.GaussianBlur(3))).astype(np.float32) / 255 * 0.6)[..., None]
dull = np.clip(dull * (1 - spots * 0.5) + dust * spots * 0.5, 0, 1)
Image.fromarray(np.dstack([dull * 255, alpha * 255]).astype(np.uint8), 'RGBA').save(OUT / 'terne.png')

# phares : voile jaune laiteux
mask = Image.new('L', (W, H), 0); d = ImageDraw.Draw(mask)
d.polygon([(530, 690), (560, 640), (640, 615), (820, 600), (940, 590), (930, 640), (870, 700), (720, 760), (580, 775)], fill=255)
d.polygon([(30, 610), (40, 540), (70, 500), (92, 500), (84, 570), (56, 630)], fill=255)
m = np.asarray(mask.filter(ImageFilter.GaussianBlur(6))).astype(np.float32) / 255
a = m * (0.55 + 0.45 * blur_noise(16, 10)) * 0.85
col = np.array([0.86, 0.72, 0.42], np.float32) * (0.85 + 0.15 * blur_noise(6, 2)[..., None])
Image.fromarray(np.dstack([col * 255, a * 255]).astype(np.uint8), 'RGBA').save(OUT / 'phares.png')

# rayure : trait principal irrégulier et deux éraflures sur l'aile avant
sc = Image.new('L', (W, H), 0); d = ImageDraw.Draw(sc)
def scratch(x0, y0, x1, y1, w, n=40, jit=1.4):
    pts = [(x0 + (x1 - x0) * i / n + rng.normal(0, jit), y0 + (y1 - y0) * i / n + rng.normal(0, jit)) for i in range(n + 1)]
    for p, q in zip(pts, pts[1:]): d.line([p, q], fill=int(rng.uniform(170, 255)), width=w)
scratch(985, 700, 1150, 640, 4, jit=0.9); scratch(1000, 712, 1110, 676, 2); scratch(1030, 690, 1130, 660, 1, jit=0.8)
s = np.asarray(sc.filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32) / 255 * alpha
Image.fromarray(np.dstack([np.full((H, W, 3), 236, np.float32), s * 255]).astype(np.uint8), 'RGBA').save(OUT / 'rayure.png')
print('ok', OUT)
