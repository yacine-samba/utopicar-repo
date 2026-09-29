"""Analyse d'une vidéo de référence (grammaire visuelle uniquement, jamais son contenu).
usage : python3 scripts/analyze-ref.py [refs/reference.mp4]
Produit (non versionné, voir .gitignore) :
  refs/frames/f_001.jpg …      une image toutes les 0,5 s (ffmpeg fps=2)
  refs/contact.jpg             planche de toutes ces images, horodatées
  refs/scenes.txt              changements de plan (ffmpeg select gt(scene,0.3)) et durée de chaque plan
  refs/palette.txt             couleurs dominantes (k-means sur toutes les frames) en hex et en %
  refs/motion.txt              mouvement moyen entre images, pour repérer caméra, coupes et temps calmes"""
import sys, os, re, glob, subprocess, json
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = os.path.join(ROOT, sys.argv[1] if len(sys.argv) > 1 else 'refs/reference.mp4')
R = lambda p: os.path.join(ROOT, 'refs', p)
os.makedirs(R('frames'), exist_ok=True)
for f in glob.glob(R('frames/*.jpg')): os.remove(f)

# 1. une image toutes les 0,5 s
subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vf', 'fps=2', '-q:v', '2', R('frames/f_%03d.jpg')], check=True)
frames = sorted(glob.glob(R('frames/*.jpg')))
probe = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', src], capture_output=True, text=True).stdout)
v = next(s for s in probe['streams'] if s['codec_type'] == 'video')
dur = float(probe['format']['duration'])
print(f"{os.path.basename(src)} : {v['width']}x{v['height']}, {v.get('r_frame_rate')}, {dur:.2f} s, {len(frames)} images à 0,5 s")

# 2. changements de plan
log = subprocess.run(['ffmpeg', '-i', src, '-vf', "select='gt(scene,0.3)',showinfo", '-f', 'null', '-'], capture_output=True, text=True).stderr
cuts = [float(x) for x in re.findall(r'pts_time:([\d.]+)', log)]
bounds = [0.0] + cuts + [dur]
with open(R('scenes.txt'), 'w') as f:
    f.write(f'{len(cuts)} coupes, {len(bounds) - 1} plans, durée moyenne {dur / (len(bounds) - 1):.2f} s\n')
    for i in range(len(bounds) - 1): f.write(f'plan {i + 1:>2} : {bounds[i]:6.2f} → {bounds[i + 1]:6.2f} s  ({bounds[i + 1] - bounds[i]:.2f} s)\n')
print(open(R('scenes.txt')).read().splitlines()[0])

# 3. palette dominante
px = np.concatenate([np.asarray(Image.open(f).convert('RGB').resize((64, 64))).reshape(-1, 3) for f in frames]).astype(float)
rng = np.random.default_rng(0); C = px[rng.choice(len(px), 10, replace=False)]
for _ in range(25):
    lab = np.argmin(((px[:, None] - C[None]) ** 2).sum(2), 1)
    C = np.array([px[lab == k].mean(0) if (lab == k).any() else C[k] for k in range(len(C))])
share = np.bincount(lab, minlength=len(C)) / len(px)
with open(R('palette.txt'), 'w') as f:
    for k in np.argsort(share)[::-1]: f.write('#%02X%02X%02X  %4.1f %%\n' % (*C[k].round().astype(int), share[k] * 100))

# 4. mouvement entre images successives (0,5 s)
small = [np.asarray(Image.open(f).convert('L').resize((160, 90)), float) for f in frames]
with open(R('motion.txt'), 'w') as f:
    for i in range(1, len(small)): f.write(f'{i * 0.5:5.1f} s  {np.abs(small[i] - small[i - 1]).mean():6.2f}\n')

# 5. planche horodatée
cw = 240; ch = int(cw * v['height'] / v['width']); cols = 8; rows = (len(frames) + cols - 1) // cols
S = Image.new('RGB', (cols * (cw + 6) + 6, rows * (ch + 28) + 6), '#1b1f27'); d = ImageDraw.Draw(S)
try: F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
except Exception: F = None
for i, fp in enumerate(frames):
    x, y = 6 + (i % cols) * (cw + 6), 6 + (i // cols) * (ch + 28)
    S.paste(Image.open(fp).convert('RGB').resize((cw, ch)), (x, y + 22)); d.text((x, y + 2), f'{i * 0.5:.1f} s', fill='#FFC928', font=F)
S.save(R('contact.jpg'), quality=90)
print('→ refs/frames/, refs/contact.jpg, refs/scenes.txt, refs/palette.txt, refs/motion.txt')
