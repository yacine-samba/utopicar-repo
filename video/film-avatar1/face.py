"""Avatar qui parle, sans modèle vidéo : on anime le selfie généré (assets/avatar1/selfie.png, 1536×2752).
- bouche : la lèvre inférieure et le menton descendent selon l'enveloppe de la voix (env.json), intérieur de bouche
  et dents dessinés dans l'ouverture ; la lèvre supérieure remonte un peu ;
- paupières : la peau de la paupière glisse sur l'œil (clignements à intervalles réguliers mais irréguliers) ;
- tête : caméra tenue à la main (bruit lent déterministe), respiration, petit hochement quand la voix monte.
Repères mesurés sur le selfie (pixels de l'image source). Sortie : film-avatar1/frames/f0000.jpg… (1080×1920, 30 i/s).
usage : python film-avatar1/face.py [--at 3.2,7.5]   (images de contrôle dans film-avatar1/check/)"""
import json, math, os, sys
import cv2, numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = cv2.imread(os.path.join(HERE, '..', 'assets', 'avatar1', 'selfie.png'))
H0, W0 = SRC.shape[:2]
FPS = 30
ENV = json.load(open(os.path.join(HERE, 'env.json')))
DUR = json.load(open(os.path.join(HERE, 'words.json'), encoding='utf-8'))['dur'] + 0.6   # tenue après la dernière syllabe

# ---------- repères (image source) ----------
MX = 797.0                                                        # centre de la bouche
# ligne des lèvres y(x) passant par la commissure gauche, le milieu et la commissure droite
LIPC = np.polyfit([705.0, 800.0, 888.0], [1352.0, 1360.0, 1344.0], 2)
CHIN = 1512.0                                                     # le bas du menton ne bouge pas
EYES = [dict(cx=679.0, cy=1131.0, hw=54.0, up=18.0, dn=17.0), dict(cx=890.0, cy=1116.0, hw=54.0, up=17.0, dn=16.0)]

def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

# ---------- bouche ----------
def env_at(t):
    e = ENV['env']; i = t * ENV['fps']; i0 = int(i)
    if i0 >= len(e) - 1: return 0.0
    return e[i0] + (e[i0 + 1] - e[i0]) * (i - i0)

def openness(t):
    """Ouverture 0..1 : attaque rapide, relâche plus lente (on regarde 40 ms avant et 80 ms après), courbe douce."""
    fast = (env_at(t - 0.017) + 2 * env_at(t) + env_at(t + 0.017)) / 4
    slow = sum(env_at(t + d) for d in np.linspace(-0.15, 0.15, 13)) / 13
    o = np.clip((fast - 0.16) / 0.85, 0, 1) ** 0.9
    syll = np.clip(0.5 + (fast - slow) * 2.4, 0, 1)                    # la bouche se referme entre les syllabes
    return float(o * (0.3 + 0.7 * syll))

def mouth(img, o, rnd):
    if o < 0.02: return img
    D = 26.0 * o * (0.85 + 0.3 * rnd)            # ouverture de la mâchoire, en pixels source
    x0, x1, y0, y1 = 660, 940, 1300, 1530
    crop = img[y0:y1, x0:x1].astype(np.float32)
    h, w = crop.shape[:2]
    X, Y = np.meshgrid(np.arange(w, dtype=np.float32) + x0, np.arange(h, dtype=np.float32) + y0)
    yl = np.polyval(LIPC, X)
    gx = np.exp(-((X - MX) / 72.0) ** 4)                             # ouverture en lentille, commissures presque fermées
    below = Y >= yl
    # lèvre inférieure et menton : descendent de d, l'effet s'éteint vers le bas du menton (contour fixe)
    gy = 1 - smooth(yl + 30, CHIN, Y)
    d = D * gx * gy
    # lèvre supérieure : remonte de u au plus, sur 26 px au-dessus de la ligne
    u0 = 0.22 * D * gx
    gu = 1 - np.clip((yl - Y) / 26.0, 0, 1)
    mapy = np.where(below, Y - d, Y + u0 * gu * (Y < yl))
    lowtop = yl + D * gx                                              # haut de la lèvre inférieure déplacée
    uptop = yl - u0                                                   # bas de la lèvre supérieure relevée
    mapy = np.where(below & (Y < lowtop), yl + 1, mapy)              # (recouvert par l'intérieur de la bouche)
    out = cv2.remap(img, X.astype(np.float32), mapy.astype(np.float32), cv2.INTER_CUBIC).astype(np.float32)
    # intérieur de la bouche entre uptop et lowtop
    gap = np.maximum(lowtop - uptop, 0)
    inside = smooth(uptop - 0.8, uptop + 1.2, Y) * (1 - smooth(lowtop - 1.2, lowtop + 0.8, Y)) * (gap > 1.5)
    rel = np.clip((Y - uptop) / np.maximum(gap, 1), 0, 1)
    dark = np.array([12, 11, 30], np.float32)                         # BGR : brun très sombre, un peu rouge
    lip = np.array([34, 34, 86], np.float32)
    col = dark + (lip - dark) * (np.abs(rel - 0.45) * 2)[..., None] ** 2 * 0.55
    # dents du haut : bande claire sous la lèvre supérieure quand la bouche est assez ouverte
    th = np.minimum(6.5, gap * 0.26)
    teeth = (rel * gap < th) * (np.abs(X - MX) < 58) * smooth(0.3, 0.6, o)
    teeth = cv2.GaussianBlur(teeth.astype(np.float32), (0, 0), 1.3) * 0.72 * (1 - 0.5 * (np.abs(X - MX) / 58) ** 2)
    col = col * (1 - teeth[..., None]) + np.array([150, 166, 184], np.float32) * teeth[..., None]
    # langue au fond pour les grandes ouvertures
    tongue = smooth(0.55, 1.0, rel) * smooth(0.5, 0.9, o) * (np.abs(X - MX) < 50) * 0.45
    col = col * (1 - tongue[..., None]) + np.array([52, 58, 122], np.float32) * tongue[..., None]
    a = cv2.GaussianBlur(inside.astype(np.float32), (0, 0), 0.9)[..., None]
    out = out * (1 - a) + col * a
    img = img.copy(); img[y0:y1, x0:x1] = np.clip(out, 0, 255).astype(np.uint8)
    return img

# ---------- paupières ----------
BLINKS = []
_t, _k = 1.3, 0
while _t < DUR:
    BLINKS.append(_t); _k += 1; _t += 3.1 + 1.4 * ((_k * 0.618) % 1)
PROF = [(0, 0), (0.035, 0.45), (0.07, 0.95), (0.1, 1.0), (0.14, 0.7), (0.19, 0.3), (0.25, 0.0)]

def closure(t):
    for b in BLINKS:
        dt = t - b
        if 0 <= dt <= PROF[-1][0]:
            for (a0, v0), (a1, v1) in zip(PROF, PROF[1:]):
                if a0 <= dt <= a1: return v0 + (v1 - v0) * (dt - a0) / (a1 - a0)
    return 0.0

def eyelids(img, c):
    if c < 0.02: return img
    img = img.copy()
    for e in EYES:
        x0, x1 = int(e['cx'] - e['hw'] - 8), int(e['cx'] + e['hw'] + 8)
        y0, y1 = int(e['cy'] - e['up'] - 30), int(e['cy'] + e['dn'] + 6)
        X, Y = np.meshgrid(np.arange(x0, x1, dtype=np.float32), np.arange(y0, y1, dtype=np.float32))
        prof = np.sqrt(np.clip(1 - ((X - e['cx']) / e['hw']) ** 2, 0, 1))
        yu = e['cy'] - e['up'] * prof; yd = e['cy'] + e['dn'] * prof
        ytop = yu - 22
        ylid = yu + c * (yd - yu - 1.5)
        mapy = Y.copy()
        m1 = (Y >= ytop) & (Y < ylid)
        mapy[m1] = (ytop + (Y - ytop) * (yu - ytop) / np.maximum(ylid - ytop, 1e-3))[m1]
        m2 = (Y >= ylid) & (Y < yd)
        mapy[m2] = (yu + (Y - ylid) * (yd - yu) / np.maximum(yd - ylid, 1e-3))[m2]
        warped = cv2.remap(img, X, mapy.astype(np.float32), cv2.INTER_CUBIC).astype(np.float32)
        # trait de cils sur la paupière fermée
        lash = np.exp(-((Y - ylid) / 1.6) ** 2) * prof * smooth(0.6, 1.0, c) * 0.55
        warped = warped * (1 - lash[..., None]) + np.array([30, 28, 34], np.float32) * lash[..., None]
        wx = smooth(e['hw'] + 6, e['hw'] - 4, np.abs(X - e['cx']))[..., None]
        base = img[y0:y1, x0:x1].astype(np.float32)
        img[y0:y1, x0:x1] = np.clip(base * (1 - wx) + warped * wx, 0, 255).astype(np.uint8)
    return img

# ---------- tête et caméra ----------
def noise(t, seed, freqs=(0.23, 0.41, 0.77, 1.31)):
    return sum(math.sin(2 * math.pi * f * t + seed * (i + 1) * 1.7) / (i + 1) for i, f in enumerate(freqs)) / 1.9

def frame(t):
    o = openness(t)
    rnd = 0.5 + 0.5 * math.sin(t * 17.3)
    img = mouth(SRC, o, rnd)
    img = eyelids(img, closure(t))
    # caméra à la main + tête : rotation, translation, respiration, hochement sur la voix
    oo = sum(openness(t - k * 0.05) for k in range(6)) / 6 * 1.4
    ang = 0.55 * noise(t, 1) + 0.9 * oo * math.sin(t * 2.1)
    tx = 7.0 * noise(t, 2); ty = 6.0 * noise(t, 3) + 5.0 * oo
    s = 1.0 + 0.004 * math.sin(2 * math.pi * t / 4.2) + 0.006 * oo
    M = cv2.getRotationMatrix2D((MX, 1250), ang, s); M[0, 2] += tx; M[1, 2] += ty
    img = cv2.warpAffine(img, M, (W0, H0), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    # 1536×2752 → 1080 de large, recadré au centre en 1920 de haut (léger zoom de sécurité pour les bords)
    k = 1080 / W0 * 1.02
    img = cv2.resize(img, (round(W0 * k), round(H0 * k)), interpolation=cv2.INTER_AREA)
    ox = (img.shape[1] - 1080) // 2; oy = (img.shape[0] - 1920) // 2
    return img[oy:oy + 1920, ox:ox + 1080]

if __name__ == '__main__':
    if '--at' in sys.argv:
        os.makedirs(os.path.join(HERE, 'check'), exist_ok=True)
        for t in map(float, sys.argv[sys.argv.index('--at') + 1].split(',')):
            cv2.imwrite(os.path.join(HERE, 'check', f'face-{t:.2f}.jpg'), frame(t), [cv2.IMWRITE_JPEG_QUALITY, 92])
            print(t, 'ouverture', round(openness(t), 2), 'paupières', round(closure(t), 2))
        sys.exit()
    out = os.path.join(HERE, 'frames'); os.makedirs(out, exist_ok=True)
    n = int(DUR * FPS) + 1
    for f in range(n):
        cv2.imwrite(os.path.join(out, f'f{f:04d}.jpg'), frame(f / FPS), [cv2.IMWRITE_JPEG_QUALITY, 90])
        if f % 90 == 0: print(f'{f}/{n}')
    json.dump(dict(fps=FPS, n=n), open(os.path.join(out, 'index.json'), 'w'))
    print('images :', n)
