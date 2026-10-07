"""Mesure de la fluidité d'une vidéo par flux optique (OpenCV Farneback), image par image.
Complète ref-frames.py (montage, voix, son) : ici on mesure COMMENT ça bouge.

usage : python3 scripts/ref-motion.py a.mp4 [b.mp4 …] [--out dossier] [--label nom,nom,…]
Sorties : <out>/motion.json (une entrée par vidéo), <out>/motion.md (tableau comparatif),
          <out>/<nom>_motion.png (courbe d'énergie de mouvement, coupes en rouge, plans figés en gris).

Unités : les vitesses sont en % du petit côté de l'image par seconde (comparable entre 9:16 et 16:9).
- mouvement      : part des images où quelque chose bouge (vitesse moyenne > 1,5 %/s)
- figé           : plans immobiles de plus de 0,3 s (nombre, durée médiane, part du temps)
- vitesse p50/p90: vitesse moyenne de l'image pendant le mouvement
- à-coups        : variation de la vitesse d'une image à l'autre, rapportée à la vitesse (bas = accélérations douces)
- départ / arrêt : pour chaque mouvement, durée de montée jusqu'au pic et de descente (ease-out long = arrêt > départ)
- couches        : part du mouvement qui n'est pas un déplacement d'ensemble (0 = tout bouge d'un bloc, 1 = éléments
                   indépendants, parallaxe, profondeur)
- caméra         : part des images en panoramique, zoom, rotation (modèle affine ajusté sur le flux)
- flou de mvt    : pour chaque mouvement, netteté de l'image la plus rapide rapportée à celle de l'image posée juste
                   après, médiane sur la vidéo (1 = aucun flou ; < 0,7 = flou de bougé visible)
- coupes         : changements d'image sans continuité de mouvement (par 10 s)"""
import sys, os, json, argparse, subprocess
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

ap = argparse.ArgumentParser()
ap.add_argument('src', nargs='+'); ap.add_argument('--out', default=None); ap.add_argument('--label', default=None)
ap.add_argument('--short', type=int, default=180, help='petit côté de l\'image analysée (px)')
A = ap.parse_args()
OUT = A.out or os.path.join(os.path.dirname(os.path.abspath(A.src[0])), 'motion')
os.makedirs(OUT, exist_ok=True)
LABELS = A.label.split(',') if A.label else [os.path.splitext(os.path.basename(s))[0] for s in A.src]
try: FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
except Exception: FONT = None

def probe(src):
    j = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', src],
                                  capture_output=True, text=True).stdout)
    v = next(s for s in j['streams'] if s['codec_type'] == 'video'); n, d = map(int, v['r_frame_rate'].split('/'))
    return int(v['width']), int(v['height']), n / d, float(j['format']['duration'])

def frames(src, w, h):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'scale={w}:{h}:flags=area', '-f', 'rawvideo',
                          '-pix_fmt', 'gray', '-'], stdout=subprocess.PIPE)
    n = w * h
    while True:
        b = p.stdout.read(n)
        if len(b) < n: break
        yield np.frombuffer(b, np.uint8).reshape(h, w)

def runs(mask):
    """segments [a, b) où mask est vrai"""
    out, a = [], None
    for i, m in enumerate(list(mask) + [False]):
        if m and a is None: a = i
        if not m and a is not None: out.append((a, i)); a = None
    return out

def analyse(src, label):
    W, H, FPS, DUR = probe(src)
    s = A.short / min(W, H); w, h = int(round(W * s / 2) * 2), int(round(H * s / 2) * 2)
    short = min(w, h)
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32); xs -= w / 2; ys -= h / 2
    Xd = np.stack([xs.ravel(), ys.ravel(), np.ones(w * h, np.float32)], 1)[::7]   # échantillon pour l'ajustement affine
    sp, glob, loc, zoom, rot, diff, corr, sharp = [], [], [], [], [], [], [], []
    prev = None
    for g in frames(src, w, h):
        sharp.append(cv2.Laplacian(g, cv2.CV_32F).var())
        if prev is None:
            prev = g; sp.append(0); glob.append(0); loc.append(0); zoom.append(0); rot.append(0); diff.append(0); corr.append(1); continue
        f = cv2.calcOpticalFlowFarneback(prev, g, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        fx, fy = f[..., 0].ravel()[::7], f[..., 1].ravel()[::7]
        mag = np.hypot(f[..., 0], f[..., 1])
        # modèle affine : flux = M · [x, y, 1] → translation (panoramique), divergence (zoom), rotation
        Mx, *_ = np.linalg.lstsq(Xd, fx, rcond=None); My, *_ = np.linalg.lstsq(Xd, fy, rcond=None)
        res = np.hypot(fx - Xd @ Mx, fy - Xd @ My)
        sp.append(mag.mean() / short * 100 * FPS)                              # %/s
        glob.append(np.hypot(Mx[2], My[2]) / short * 100 * FPS)
        loc.append(res.mean() / short * 100 * FPS)
        zoom.append((Mx[0] + My[1]) / 2 * FPS * 100)                            # %/s d'échelle
        rot.append((My[0] - Mx[1]) / 2 * FPS * 180 / np.pi)                     # °/s
        a, b = prev.astype(np.float32), g.astype(np.float32)
        diff.append(np.abs(a - b).mean())
        a -= a.mean(); b -= b.mean(); corr.append(float((a * b).sum() / (np.sqrt((a * a).sum() * (b * b).sum()) + 1e-6)))
        prev = g
    sp, glob, loc, zoom, rot, diff, corr, sharp = map(np.array, (sp, glob, loc, zoom, rot, diff, corr, sharp))
    N = len(sp)
    # coupe : l'image change d'un coup (écart fort, corrélation faible) et le flux ne l'explique pas
    cut = (diff > 18) & (corr < 0.55)
    cut[0] = False
    spc = sp.copy(); spc[cut] = np.nan                                         # les coupes ne sont pas du mouvement
    spn = np.nan_to_num(spc)
    sm = np.convolve(spn, np.ones(3) / 3, 'same')                              # lissé sur 3 images (bruit d'encodage)
    moving = sm > 1.5
    holds = [(a, b) for a, b in runs(~moving) if (b - a) / FPS >= 0.3]
    hold_t = sum(b - a for a, b in holds) / FPS
    mv = sm[moving]
    # à-coups : |Δ vitesse| / vitesse, pendant le mouvement, hors coupes
    dv = np.abs(np.diff(sm)); ok = moving[1:] & moving[:-1] & ~cut[1:] & ~cut[:-1]
    jerk = float(np.median(dv[ok] / (sm[1:][ok] + 1e-6))) if ok.any() else 0.0
    # profils départ / arrêt de chaque mouvement de plus de 0,25 s
    prof = []
    for a, b in runs(moving):
        if (b - a) / FPS < 0.25: continue
        seg = sm[a:b]; k = int(np.argmax(seg))
        prof.append(((k + 1) / FPS, (b - a - k) / FPS))
    rise = float(np.median([p[0] for p in prof])) if prof else 0
    fall = float(np.median([p[1] for p in prof])) if prof else 0
    # flou de mouvement : pour chaque mouvement, netteté de l'image la plus rapide / netteté de l'image posée juste après
    # (même contenu, arrêté). < 0,7 : l'image rapide est floue, donc flou de mouvement appliqué.
    br = []
    for a, b in runs(moving):
        if (b - a) / FPS < 0.2 or b + 4 >= N or cut[a:b + 4].any(): continue
        k = a + int(np.argmax(sm[a:b])); settle = np.median(sharp[b:b + 4])
        if settle > 5: br.append(sharp[k] / settle)
    blur = float(np.median(br)) if br else float('nan')
    gm = np.nan_to_num(glob); lm = np.nan_to_num(loc)
    layers = float(np.median(lm[moving] / (gm[moving] + lm[moving] + 1e-6))) if moving.any() else 0
    cam = dict(pan=float(np.mean(gm > 3)), zoom=float(np.mean(np.abs(zoom) > 2)), rot=float(np.mean(np.abs(rot) > 2)))
    r = dict(label=label, src=os.path.relpath(src), size=f'{W}x{H}', fps=FPS, dur=round(DUR, 2), frames=N,
             moving=round(float(moving.mean()), 3), holds=len(holds),
             hold_med=round(float(np.median([(b - a) / FPS for a, b in holds])) if holds else 0, 2),
             hold_max=round(max([(b - a) / FPS for a, b in holds], default=0), 2), hold_share=round(hold_t / (N / FPS), 3),
             speed_p50=round(float(np.median(mv)) if mv.size else 0, 1), speed_p90=round(float(np.percentile(mv, 90)) if mv.size else 0, 1),
             jerk=round(jerk, 3), rise=round(rise, 2), fall=round(fall, 2), moves=len(prof),
             layers=round(layers, 2), cam_pan=round(cam['pan'], 2), cam_zoom=round(cam['zoom'], 2), cam_rot=round(cam['rot'], 2),
             blur=round(blur, 2), cuts=int(cut.sum()), cuts_per10=round(cut.sum() / (N / FPS) * 10, 1))
    # courbe
    PW, PH = 1400, 300; im = Image.new('RGB', (PW, PH + 40), (18, 18, 22)); d = ImageDraw.Draw(im)
    top = max(np.percentile(sm, 99), 5)
    X = lambda i: int(i / max(N - 1, 1) * (PW - 1))
    for a, b in holds: d.rectangle([X(a), 0, X(b), PH], fill=(45, 45, 52))
    pts = [(X(i), PH - int(min(v, top) / top * (PH - 10))) for i, v in enumerate(sm)]
    d.line(pts, fill=(255, 138, 76), width=2)
    for i in np.where(cut)[0]: d.line([X(i), 0, X(i), PH], fill=(220, 60, 60), width=1)
    for sec in range(int(N / FPS) + 1): d.line([X(sec * FPS), PH, X(sec * FPS), PH + 6], fill=(150, 150, 150)); d.text((X(sec * FPS) + 2, PH + 8), f'{sec}s', fill=(150, 150, 150), font=FONT)
    d.text((8, 6), f"{label} · mouvement {r['moving']*100:.0f} % · figé {r['hold_share']*100:.0f} % · vitesse p50 {r['speed_p50']} %/s · à-coups {r['jerk']} · coupes {r['cuts']}", fill=(235, 235, 235), font=FONT)
    im.save(os.path.join(OUT, f'{label}_motion.png'))
    np.save(os.path.join(OUT, f'{label}_speed.npy'), sm)
    return r

rows = []
for src, lab in zip(A.src, LABELS):
    r = analyse(src, lab); rows.append(r); print(json.dumps(r, ensure_ascii=False))
prev = json.load(open(os.path.join(OUT, 'motion.json'))) if os.path.exists(os.path.join(OUT, 'motion.json')) else []
keep = [p for p in prev if p['label'] not in {r['label'] for r in rows}] + rows
json.dump(keep, open(os.path.join(OUT, 'motion.json'), 'w'), ensure_ascii=False, indent=1)
H_ = ['vidéo', 'format', 'durée', 'mouvement', 'figé (part)', 'figé méd./max', 'vitesse p50 / p90 %/s', 'à-coups', 'départ / arrêt (s)', 'couches', 'pano / zoom / rot.', 'flou mvt', 'coupes /10 s']
L = ['| ' + ' | '.join(H_) + ' |', '|' + '---|' * len(H_)]
for r in keep:
    L.append(f"| {r['label']} | {r['size']} | {r['dur']} s | {r['moving']*100:.0f} % | {r['hold_share']*100:.0f} % | {r['hold_med']} / {r['hold_max']} s | "
             f"{r['speed_p50']} / {r['speed_p90']} | {r['jerk']} | {r['rise']} / {r['fall']} | {r['layers']} | "
             f"{r['cam_pan']*100:.0f} / {r['cam_zoom']*100:.0f} / {r['cam_rot']*100:.0f} % | {r['blur']} | {r['cuts_per10']} |")
open(os.path.join(OUT, 'motion.md'), 'w').write('\n'.join(L) + '\n')
print('\n'.join(L))
