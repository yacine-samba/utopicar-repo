"""Forme des accélérations d'une vidéo : pour chaque geste (montée de vitesse entre deux repos), où tombe la vitesse
maximale, combien de temps dure la retombée, et si le mouvement dépasse puis revient (ressort).
Complète ref-motion.py (combien ça bouge) : ici on mesure COMMENT chaque geste démarre et s'arrête.

usage : python3 scripts/ref-easing.py a.mp4 [b.mp4 …] --out dossier [--label nom,…]
Sorties : <out>/easing.json (un objet par vidéo, avec la liste des gestes), <out>/easing.md (tableau comparatif).

Méthode : flux optique Farneback à 180 px de petit côté, image par image native. Vecteur dominant de l'image = médiane
du flux des pixels qui bougent (> 0,4 px/image). Un geste = suite d'images où la vitesse dominante dépasse 12 % du
pic du geste, encadrée par des repos ; on ignore les gestes de moins de 3 images et les coupes.
- pic (fraction)  : instant du pic de vitesse / durée du geste (0,2 = départ franc puis longue décélération, « ease-out » ;
                    0,5 = symétrique, « ease-in-out » ; 0,8 = accélération lente, « ease-in »)
- retombée        : temps du pic jusqu'à 10 % du pic (s) — la « queue » de l'arrêt
- dépassement     : le déplacement dépasse sa position finale puis revient (vitesse opposée ≥ 8 % du pic juste après)
- profil          : ease-out / ease-in-out / ease-in / ressort (dépassement) / linéaire (plateau > 40 % du geste)"""
import sys, os, json, argparse, subprocess
import numpy as np, cv2

ap = argparse.ArgumentParser()
ap.add_argument('src', nargs='+'); ap.add_argument('--out', required=True); ap.add_argument('--label', default=None)
ap.add_argument('--short', type=int, default=180)
A = ap.parse_args(); os.makedirs(A.out, exist_ok=True)
LABELS = A.label.split(',') if A.label else [os.path.splitext(os.path.basename(s))[0] for s in A.src]

def probe(src):
    j = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-of', 'json', src], capture_output=True, text=True).stdout)
    v = next(s for s in j['streams'] if s['codec_type'] == 'video'); n, d = map(int, v['r_frame_rate'].split('/'))
    return int(v['width']), int(v['height']), n / d

def frames(src, w, h):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'scale={w}:{h}:flags=area', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], stdout=subprocess.PIPE)
    n = w * h
    while True:
        b = p.stdout.read(n)
        if len(b) < n: break
        yield np.frombuffer(b, np.uint8).reshape(h, w)

def analyse(src):
    W, H, FPS = probe(src); s = A.short / min(W, H); w, h = int(round(W * s / 2) * 2), int(round(H * s / 2) * 2)
    prev = None; V = []; CUT = []
    for g in frames(src, w, h):
        if prev is None: prev = g; V.append((0.0, 0.0)); CUT.append(False); continue
        d = float(np.abs(g.astype(np.int16) - prev).mean())
        f = cv2.calcOpticalFlowFarneback(prev, g, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        m = np.hypot(f[..., 0], f[..., 1]); mv = m > 0.4
        if mv.mean() > 0.002: V.append((float(np.median(f[..., 0][mv])), float(np.median(f[..., 1][mv]))))
        else: V.append((0.0, 0.0))
        # coupe : grosse différence d'image que le flux n'explique pas
        warped = cv2.remap(prev, (np.indices((h, w))[1] + f[..., 0]).astype(np.float32), (np.indices((h, w))[0] + f[..., 1]).astype(np.float32), cv2.INTER_LINEAR)
        CUT.append(d > 18 and float(np.abs(warped.astype(np.int16) - g).mean()) > 12)
        prev = g
    V = np.array(V) * (100.0 / min(w, h)) * FPS          # % du petit côté par seconde
    sp = np.hypot(V[:, 0], V[:, 1]); n = len(sp)
    moving = sp > 1.5
    gestures = []; i = 0
    while i < n:
        if not moving[i] or CUT[i]: i += 1; continue
        a = i
        while i < n and moving[i] and not CUT[i]: i += 1
        b = i                                             # [a, b)
        if b - a < 3: continue
        seg = sp[a:b]; k = int(np.argmax(seg)); pk = float(seg[k])
        if pk < 3: continue
        # direction principale du geste (vecteur moyen pondéré)
        dvec = V[a:b].sum(0); nd = np.hypot(*dvec)
        if nd < 1e-6: continue
        u = dvec / nd; proj = V[a:b] @ u
        dur = (b - a) / FPS; frac = (k + 0.5) / (b - a)
        tail = next((j for j in range(k, b - a) if seg[j] < 0.1 * pk), b - a - 1)
        decay = (tail - k) / FPS
        # dépassement : vitesse opposée juste après la phase principale (dans le geste ou les 6 images suivantes)
        after = V[b:min(n, b + 6)] @ u if b < n else np.array([])
        neg = np.concatenate([proj[k:], after]); over = bool((neg < -0.08 * pk).any())
        plateau = float((seg > 0.8 * pk).mean())
        prof = 'ressort' if over else 'linéaire' if plateau > 0.4 else 'ease-out' if frac < 0.38 else 'ease-in' if frac > 0.62 else 'ease-in-out'
        gestures.append({'t0': round(a / FPS, 3), 'dur': round(dur, 3), 'pic': round(pk, 1), 'pic_frac': round(frac, 2),
                         'retombee': round(decay, 3), 'depassement': over, 'plateau': round(plateau, 2), 'profil': prof,
                         'dir': [round(float(u[0]), 2), round(float(u[1]), 2)]})
    return {'fps': FPS, 'gestes': gestures}

res = {}
for src, lab in zip(A.src, LABELS):
    r = analyse(src); res[lab] = r
    g = r['gestes']; print(f'{lab}: {len(g)} gestes')
json.dump(res, open(os.path.join(A.out, 'easing.json'), 'w'), ensure_ascii=False, indent=1)
rows = ['| vidéo | gestes | durée méd. (s) | pic méd. (fraction) | retombée méd. (s) | ease-out | ease-in-out | ease-in | ressort | linéaire |', '|---|---|---|---|---|---|---|---|---|---|']
for lab, r in res.items():
    g = r['gestes']
    if not g: rows.append(f'| {lab} | 0 | | | | | | | | |'); continue
    c = lambda p: f"{100 * sum(x['profil'] == p for x in g) / len(g):.0f} %"
    med = lambda k: float(np.median([x[k] for x in g]))
    rows.append(f"| {lab} | {len(g)} | {med('dur'):.2f} | {med('pic_frac'):.2f} | {med('retombee'):.2f} | {c('ease-out')} | {c('ease-in-out')} | {c('ease-in')} | {c('ressort')} | {c('linéaire')} |")
open(os.path.join(A.out, 'easing.md'), 'w').write('\n'.join(rows) + '\n')
print('\n'.join(rows))
