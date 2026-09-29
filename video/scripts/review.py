"""Contrôle qualité sur le MP4 réellement rendu (pas sur la page).
usage : python3 scripts/review.py <nom> [renders/9x16.mp4]
Produit dans renders/review/ :
  <nom>-contact.png  contact sheet à 2 images/s
  <nom>-strip.png    12 frames autour de l'action la plus rapide (mesurée par différence entre frames)
  <nom>-phone.png    frames clés réduites à 360 px de large (lecture téléphone)
  <nom>-loop.png     3 dernières + 3 premières frames (jonction de la boucle)"""
import sys, os, subprocess, json, io
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
name = sys.argv[1] if len(sys.argv) > 1 else 'round'
src = os.path.join(ROOT, sys.argv[2] if len(sys.argv) > 2 else 'renders/9x16.mp4')
out = os.path.join(ROOT, 'renders/review'); os.makedirs(out, exist_ok=True)
TL = json.load(open(os.path.join(ROOT, 'timeline.json'))); FPS = TL['fps']
W, H = 270, 480
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
def full(i):
    png = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'select=eq(n\\,{i})', '-vsync', '0', '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True, check=True).stdout
    return Image.open(io.BytesIO(png))
try: F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 16)
except Exception: F = None

def sheet(idx, cols, cw, file, from_full=False):
    ch = int(cw * 16 / 9); pad, lab = 8, 22; rows = (len(idx) + cols - 1) // cols
    S = Image.new('RGB', (cols * (cw + pad) + pad, rows * (ch + pad + lab) + pad), '#1b1f27'); d = ImageDraw.Draw(S)
    for k, i in enumerate(idx):
        im = (full(i).convert('RGB') if from_full else Image.fromarray(fr[i])).resize((cw, ch), Image.LANCZOS)
        x, y = pad + (k % cols) * (cw + pad), pad + (k // cols) * (ch + pad + lab)
        S.paste(im, (x, y + lab)); d.text((x + 2, y + 2), f'{i / FPS:.2f}s  f{i}', fill='#FFC928', font=F)
    S.save(os.path.join(out, file)); print('→ renders/review/' + file)

n = len(fr)
sheet([min(n - 1, int((k + 0.5) * FPS / 2)) for k in range(int(n / (FPS / 2)))], 10, 180, f'{name}-contact.png')
diff = np.array([np.abs(fr[i].astype(int) - fr[i - 1].astype(int)).mean() for i in range(1, n)])
fast = int(np.argmax(diff)) + 1
sheet(list(range(max(0, fast - 6), min(n, fast + 6))), 6, 220, f'{name}-strip.png', from_full=True)
key = [int(t * FPS) for t in (0.4, 1.5, 3.6, 4.6, 6.4, 8.2, 9.4, 10.9, 12.6, 14.5)]
sheet(key, 5, 360, f'{name}-phone.png', from_full=True)
sheet([n - 3, n - 2, n - 1, 0, 1, 2], 6, 220, f'{name}-loop.png', from_full=True)
top = np.argsort(diff)[::-1][:5] + 1
print('mouvement le plus rapide :', ', '.join(f'{i / FPS:.2f}s ({diff[i - 1]:.1f})' for i in top))
still = [i / FPS for i in range(1, n) if diff[i - 1] < 0.15]
runs, cur = [], None
for t in still:
    if cur and t - cur[1] <= 1.5 / FPS: cur[1] = t
    else:
        if cur: runs.append(cur)
        cur = [t, t]
if cur: runs.append(cur)
print('plans figés > 0,6 s :', [f'{a:.2f}-{b:.2f}s' for a, b in runs if b - a > 0.6] or 'aucun')
