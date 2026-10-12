"""Deux calques alignés pour chaque voiture détourée (BO1 à BO3) :
  <nom>-sticker.png : la voiture avec un liseré blanc de 18 px (effet autocollant découpé, collage Behance) ;
  <nom>-line.png    : la même voiture en plan au trait blanc (arêtes Canny + silhouette), pour le passage au scanner.
    python scripts/sticker-plan.py polo5 clio3 twingo
"""
import sys
import numpy as np, cv2
from PIL import Image
W, PAD, R = 1400, 40, 18
for name in sys.argv[1:]:
    im = Image.open(f'assets/hooks-cut/{name}-cut.png').convert('RGBA')
    im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32) / 255
    h, w = a.shape[:2]; H2, W2 = h + 2 * PAD, w + 2 * PAD
    rgba = np.zeros((H2, W2, 4), np.float32); rgba[PAD:PAD + h, PAD:PAD + w] = a
    al = rgba[..., 3]
    hard = (al > 0.5).astype(np.uint8)
    dil = cv2.dilate(hard, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * R + 1, 2 * R + 1)))
    dil = cv2.GaussianBlur(dil.astype(np.float32), (0, 0), 1.2)
    out = np.zeros_like(rgba); out[..., :3] = 1; out[..., 3] = dil
    # voiture par-dessus le blanc
    out[..., :3] = rgba[..., :3] * al[..., None] + out[..., :3] * (1 - al[..., None]); out[..., 3] = np.maximum(dil, al)
    Image.fromarray((out * 255).astype(np.uint8)).save(f'assets/hooks-cut/{name}-sticker.png', optimize=True)
    # plan au trait
    g = cv2.cvtColor((rgba[..., :3] * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY)
    g = cv2.bilateralFilter(g, 9, 40, 9)
    ed = cv2.Canny(g, 30, 90)
    inner = cv2.erode(hard, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    ed = ed * inner
    ed = cv2.dilate(ed, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
    cs, _ = cv2.findContours(hard, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    sil = np.zeros_like(hard); cv2.drawContours(sil, cs, -1, 255, 6)
    ln = np.maximum(ed.astype(np.float32) / 255 * 0.85, sil.astype(np.float32) / 255)
    ln = cv2.GaussianBlur(ln, (0, 0), 0.7)
    o2 = np.zeros((H2, W2, 4), np.uint8); o2[..., :3] = 255; o2[..., 3] = (np.clip(ln, 0, 1) * 255).astype(np.uint8)
    Image.fromarray(o2).save(f'assets/hooks-cut/{name}-line.png', optimize=True)
    print(name, W2, H2)
