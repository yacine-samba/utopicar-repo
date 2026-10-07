"""MO6 : calques « voiture qui fait fuir » posés sur la Polo détourée (polo-cut.png).

Trois calques RGBA alignés sur polo-cut.png, effacés un par un dans le film :
  crasse.png  la voiture entière ternie, poussiéreuse, traces de pluie séchée
  phares.png  voile jaune et opaque sur les deux optiques
  rayure.png  rayure claire sur la portière avant
Bruit à graine fixe : le résultat est identique à chaque exécution.
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/photos-mo5/polo-cut.png'
OUT = ROOT / 'assets/photos-mo6'
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(6)

car = Image.open(SRC).convert('RGBA')
W, H = car.size
rgb = np.asarray(car).astype(np.float32)[..., :3] / 255
alpha = np.asarray(car)[..., 3].astype(np.float32) / 255


def blur_noise(scale, sigma):
    n = rng.random((H // scale + 2, W // scale + 2)).astype(np.float32)
    im = Image.fromarray((n * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
    return np.asarray(im.filter(ImageFilter.GaussianBlur(sigma))).astype(np.float32) / 255


# --- crasse : vernis terne, poussière plus dense en bas, gouttes séchées sur le capot et le pare-brise
lum = rgb.mean(-1, keepdims=True)
dull = lum + (rgb - lum) * 0.55                     # désaturé
dull = 0.16 + dull * 0.78                           # noirs relevés, brillance écrasée
dust_col = np.array([0.50, 0.44, 0.36], np.float32)
yy = np.linspace(0, 1, H, dtype=np.float32)[:, None]
grime = np.clip((yy - 0.45) / 0.5, 0, 1) ** 1.4     # bas de caisse
grime = grime * (0.55 + 0.45 * blur_noise(24, 18)) + 0.18 * blur_noise(8, 3)
grime = np.clip(grime, 0, 0.85)[..., None]
dull = dull * (1 - grime * 0.6) + dust_col * grime * 0.6
# poussière fine (grains) et coulures sous les vitres, sans motif répété
speck = blur_noise(1, 0.6)
speck = np.clip((speck - 0.62) * 4, 0, 1) * (0.4 + 0.6 * blur_noise(30, 20))
st = Image.new('L', (W, H), 0)
d = ImageDraw.Draw(st)
for _ in range(90):                                 # coulures verticales sous la ligne des vitres
    x = rng.uniform(120, 1420)
    y0 = rng.uniform(300, 420) if x > 1000 else rng.uniform(320, 470)
    d.line([(x, y0), (x + rng.normal(0, 3), y0 + rng.uniform(40, 160))], fill=int(rng.uniform(60, 140)), width=int(rng.uniform(2, 5)))
streak = np.asarray(st.filter(ImageFilter.GaussianBlur(3))).astype(np.float32) / 255
spots = (speck * 0.5 + streak * 0.6)[..., None]
dull = np.clip(dull * (1 - spots * 0.5) + dust_col * spots * 0.5, 0, 1)
Image.fromarray(np.dstack([dull * 255, alpha * 255]).astype(np.uint8), 'RGBA').save(OUT / 'crasse.png')

# --- phares : voile jaune laiteux, plus dense au centre de l'optique
mask = Image.new('L', (W, H), 0)
d = ImageDraw.Draw(mask)
d.polygon([(482, 628), (506, 576), (560, 546), (700, 520), (822, 500), (826, 540), (782, 600), (650, 640), (532, 652)], fill=255)
d.polygon([(22, 552), (28, 486), (60, 430), (90, 414), (86, 482), (60, 548)], fill=255)
m = np.asarray(mask.filter(ImageFilter.GaussianBlur(5))).astype(np.float32) / 255
haze = 0.55 + 0.45 * blur_noise(16, 10)
a = m * haze * 0.88
col = np.array([0.86, 0.72, 0.42], np.float32) * (0.85 + 0.15 * blur_noise(6, 2)[..., None])
Image.fromarray(np.dstack([col * 255, a * 255]).astype(np.uint8), 'RGBA').save(OUT / 'phares.png')

# --- rayure : un trait principal irrégulier et deux éraflures fines sur la portière avant
sc = Image.new('L', (W, H), 0)
d = ImageDraw.Draw(sc)
def scratch(x0, y0, x1, y1, w, n=40, jit=1.6):
    pts = []
    for i in range(n + 1):
        t = i / n
        pts.append((x0 + (x1 - x0) * t + rng.normal(0, jit), y0 + (y1 - y0) * t + rng.normal(0, jit)))
    for p, q in zip(pts, pts[1:]):
        d.line([p, q], fill=int(rng.uniform(170, 255)), width=w)
scratch(1062, 486, 1268, 418, 4, jit=0.9)
scratch(1080, 498, 1210, 458, 2, jit=1.0)
scratch(1120, 470, 1236, 436, 1, jit=0.8)
s = np.asarray(sc.filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32) / 255
s = s * alpha
Image.fromarray(np.dstack([np.full((H, W, 3), 236, np.float32), s * 255]).astype(np.uint8), 'RGBA').save(OUT / 'rayure.png')
print('ok', OUT)
