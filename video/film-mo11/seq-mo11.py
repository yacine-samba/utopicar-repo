"""MO11 « La préparation » : les plans réels (Mixkit) en séquences JPG 30 i/s, 720 px, lues par Kit47.loadSeqs.

    python3 film-mo11/seq-mo11.py              (depuis video/) → film-mo11/seq/<clé>/NNN.jpg, film-mo11/seq.json,
                                                  film-mo11/photo-ecran.json
    python3 film-mo11/seq-mo11.py --check D    → en plus, planches de contrôle dans le dossier D

Les vidéos viennent de assets/stock/mo11/ (hors dépôt) ; une vidéo absente se télécharge par
.claude/skills/motion-studio/scripts/mixkit.py get. Licence : Mixkit Stock Video Free License (usage commercial, sans
crédit obligatoire). Chaque clé a été choisie sur planche de vignettes, puis regardée sur trois images au moins : aucun
visage, aucune plaque, aucun logo lisible. Ce que montre chaque clé et où elle sert : docs/timeline-mo11.md, « Les plans
réels ».

Deux retouches, faites ici pour que le film n'ait rien à corriger :
  roue   l'emblème du cache-moyeu de la jante (illisible à la taille d'une notification, effacé quand même) : le
         cache est suivi image par image (corrélation sur l'image 1) et flouté dans un disque de 17 px ; quand l'outil
         passe devant, le flou s'efface avec la confiance du suivi
  photo  l'écran vert du téléphone devient noir (#0d0d10) ; ses quatre coins sont relevés à chaque image dans
         photo-ecran.json (pixels de l'image 720 × 406 : haut-gauche, haut-droit, bas-droit, bas-gauche, coins vifs
         obtenus en prolongeant les côtés, rayon des coins arrondis à part) et la part visible de l'écran est écrite
         en masque doux dans seq/photo-masque/NNN.png (blanc, alpha = écran) : la paume passe devant le coin
         bas-gauche. Le film peint la photo 1 de la Clio dans le quadrilatère sur un canevas à part, la découpe par le
         masque (globalCompositeOperation 'destination-in'), puis la pose sur l'image
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np, cv2

V = Path(__file__).resolve().parents[1]                       # video/
STOCK = V / 'assets/stock/mo11'
OUT = V / 'film-mo11/seq'
MASK = OUT / 'photo-masque'                                # masque de l'écran visible, PNG blanc + alpha
MIXKIT = V.parent / '.claude/skills/motion-studio/scripts/mixkit.py'
CHECK = Path(sys.argv[sys.argv.index('--check') + 1]) if '--check' in sys.argv else None

# clé : (numéro Mixkit, début s, durée s, recadrage ffmpeg sur la source ou None)
CLIPS = {
    'lavage':   (26680, 0.0, 4.5, None),            # jet haute pression puis mousse sur une vitre, vu de l'intérieur
    'phares':   (24822, 0.7, 4.0, '624:442:652:118'),  # optique avant allumée, nette (recadrée : ni calandre, ni sigle)
    'sieges':   (45040, 0.3, 4.5, None),            # buse d'injecteur-extracteur sur un tissu clair, eau sale dans la buse
    'pieces':   (18263, 0.3, 4.5, None),            # pièces versées dans une paume
    'odeur':    (15052, 0.8, 4.5, None),            # doigt qui tourne la molette de ventilation
    'rayure':   (47831, 0.3, 4.5, None),            # main gantée, applicateur de polish sur une carrosserie sombre
    'roue':     (17132, 0.5, 4.5, None),            # jante, mains gantées, clé à chocs sur les écrous
    'soleil':   (20298, 5.0, 5.0, None),            # soleil bas orange derrière des lampadaires
    'photo':    (36800, 1.0, 4.5, None),            # téléphone tenu à l'horizontale, écran vert (photo 1)
    'messages': (14669, 0.5, 4.5, None),            # mains qui écrivent sur un téléphone, fond bleu flou
    'cles':     (12877, 0.2, 4.5, None),            # main qui donne une clé dans une paume ouverte
}


def get(i):
    mp4 = STOCK / f'mixkit-{i}.mp4'
    if not mp4.exists():
        subprocess.run([sys.executable, str(MIXKIT), 'get', str(i), '--out', str(STOCK)], check=True)
    return mp4


def extract(key, i, start, dur, crop):
    d = OUT / key
    d.mkdir(parents=True, exist_ok=True)
    for f in d.glob('*.jpg'): f.unlink()
    vf = (f'crop={crop},' if crop else '') + 'fps=30,scale=720:-2'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(start), '-t', str(dur), '-i', str(get(i)), '-vf', vf,
                    '-q:v', '4', str(d / '%03d.jpg')], check=True)
    return sorted(d.glob('*.jpg'))


def fix_roue(frames):
    """Floute l'emblème du cache-moyeu : centre suivi par corrélation, interpolé quand l'outil le cache."""
    f1 = cv2.imread(str(frames[0]))
    g1 = cv2.cvtColor(f1, cv2.COLOR_BGR2GRAY)
    cx, cy = 323, 212                                          # centre du cache sur l'image 1 (relevé au zoom × 3)
    T = g1[cy - 22:cy + 22, cx - 22:cx + 22]
    track = []
    for f in frames:
        g = cv2.cvtColor(cv2.imread(str(f)), cv2.COLOR_BGR2GRAY)
        r = cv2.matchTemplate(g[cy - 60:cy + 60, cx - 80:cx + 60], T, cv2.TM_CCOEFF_NORMED)
        _, v, _, l = cv2.minMaxLoc(r)
        track.append((v, cx - 80 + l[0] + 22, cy - 60 + l[1] + 22))
    v = np.array([t[0] for t in track]); xs = np.array([t[1] for t in track], float); ys = np.array([t[2] for t in track], float)
    ok = v > 0.6                                               # suivi sûr : le cache est visible
    idx = np.arange(len(frames))
    xs = np.interp(idx, idx[ok], xs[ok]); ys = np.interp(idx, idx[ok], ys[ok])
    H, W = g1.shape
    YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)
    for k, f in enumerate(frames):
        w = float(np.clip((v[k] - 0.45) / 0.15, 0, 1))         # l'outil devant : pas de flou sur l'outil
        if w <= 0: continue
        im = cv2.imread(str(f)).astype(np.float32)
        r = np.sqrt((XX - xs[k]) ** 2 + (YY - ys[k]) ** 2)
        m = (np.clip((17 - r) / 4, 0, 1) * w)[..., None]
        bl = cv2.GaussianBlur(im, (0, 0), 5)
        cv2.imwrite(str(f), (im * (1 - m) + bl * m).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 92])
    return {'suivi_sur': int(ok.sum()), 'images': len(frames)}


def side_fit(pts, axis):
    """Droite robuste par moindres carrés (axis 0 : y = a x + b ; axis 1 : x = a y + b)."""
    p = np.asarray(pts, float)
    u, w = (p[:, 0], p[:, 1]) if axis == 0 else (p[:, 1], p[:, 0])
    a, b = np.polyfit(u, w, 1)
    res = np.abs(w - (a * u + b)); keep = res < max(1.0, np.percentile(res, 80))
    return np.polyfit(u[keep], w[keep], 1)


def fix_photo(frames):
    """Écran vert → noir, masque de l'écran visible (photo-masque/NNN.png) et coins relevés à chaque image."""
    MASK.mkdir(parents=True, exist_ok=True)
    for f in MASK.glob('*.png'): f.unlink()
    quads = []
    for f in frames:
        im = cv2.imread(str(f))
        hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
        g = ((hsv[..., 0] > 35) & (hsv[..., 0] < 85) & (hsv[..., 1] > 110) & (hsv[..., 2] > 80)).astype(np.uint8)
        n, lab, st, _ = cv2.connectedComponentsWithStats(g)
        k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
        m = (lab == k).astype(np.uint8)
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
        x0, y0, w, h = st[k, 0], st[k, 1], st[k, 2], st[k, 3]
        cols = range(x0 + int(w * 0.15), x0 + int(w * 0.85))
        rows = range(y0 + int(h * 0.2), y0 + int(h * 0.8))
        top = [(x, int(np.argmax(m[:, x]))) for x in cols if m[:, x].any()]
        bot = [(x, m.shape[0] - 1 - int(np.argmax(m[::-1, x]))) for x in cols if m[:, x].any()]
        lef = [(int(np.argmax(m[y])), y) for y in rows if m[y].any()]
        rig = [(m.shape[1] - 1 - int(np.argmax(m[y, ::-1])), y) for y in rows if m[y].any()]
        lt, lb, ll, lr = side_fit(top, 0), side_fit(bot, 0), side_fit(lef, 1), side_fit(rig, 1)

        def cross(hl, vl):                                     # y = a x + b  ∩  x = c y + d
            a, b = hl; c, d = vl
            y = (a * d + b) / (1 - a * c); return [round(float(c * y + d), 2), round(float(y), 2)]
        q = [cross(lt, ll), cross(lt, lr), cross(lb, lr), cross(lb, ll)]
        # masque doux de l'écran visible (la paume passe devant le coin bas-gauche) : dominance du vert, limitée
        # au voisinage de l'écran ; l'écran devient noir, le vert débordé sur les bords est retiré
        near = cv2.dilate(m, np.ones((9, 9), np.uint8)).astype(np.float32)
        fl = im.astype(np.float32); b_, g_, r_ = fl[..., 0], fl[..., 1], fl[..., 2]
        a = np.clip((g_ - np.maximum(r_, b_) - 25) / 90, 0, 1) * near
        dark = np.array([16, 13, 13], np.float32)
        fl = fl * (1 - a[..., None]) + dark * a[..., None]
        g2 = np.minimum(fl[..., 1], np.maximum(fl[..., 0], fl[..., 2]) + 6)
        fl[..., 1] = np.where(near > 0, g2, fl[..., 1])
        cv2.imwrite(str(f), fl.clip(0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 92])
        a8 = (a * 255).round().astype(np.uint8)
        rgba = np.dstack([np.full_like(a8, 255)] * 3 + [a8])
        cv2.imwrite(str(MASK / f.name.replace('.jpg', '.png')), rgba, [cv2.IMWRITE_PNG_COMPRESSION, 9])
        quads.append(q)
        if len(quads) == 1:                                    # rayon des coins arrondis, mesuré sur l'image 1
            Q = np.array(q, float); rs = []
            for j, p in enumerate(Q):                          # du coin vif sur la bissectrice : premier pixel d'écran
                e1, e2 = Q[(j + 1) % 4] - p, Q[(j - 1) % 4] - p
                u = e1 / np.linalg.norm(e1) + e2 / np.linalg.norm(e2); u /= np.linalg.norm(u)
                for s in np.arange(0, 60, 0.25):
                    x, y = (np.array(p) + u * s).round().astype(int)
                    if m[y, x]: rs.append(s / (np.sqrt(2) - 1)); break
            radius = round(float(np.median(rs)), 1)
    return quads, radius


def sheet(path, keys, n=3):
    from PIL import Image, ImageDraw
    rows = []
    for k in keys:
        fs = sorted((OUT / k).glob('*.jpg')); pick = [fs[0], fs[len(fs) // 2], fs[-1]][:n]
        rows.append((k, [Image.open(f).convert('RGB') for f in pick]))
    W = 360
    for _, ims in rows:
        for im in ims: im.thumbnail((W, 260))
    H = max(im.height for _, ims in rows for im in ims) + 22
    S = Image.new('RGB', (W * n + 4 * (n - 1), H * len(rows)), (8, 7, 10)); d = ImageDraw.Draw(S)
    for r, (k, ims) in enumerate(rows):
        for c, im in enumerate(ims): S.paste(im, (c * (W + 4), r * H + 22))
        d.text((6, r * H + 5), f'{k} · mixkit {CLIPS[k][0]}', fill='white')
    S.save(path, quality=86)


counts = {}
for key, (i, start, dur, crop) in CLIPS.items():
    frames = extract(key, i, start, dur, crop)
    counts[key] = len(frames)
    if key == 'roue': print('roue', fix_roue(frames))
    if key == 'photo':
        quads, radius = fix_photo(frames)
        (V / 'film-mo11/photo-ecran.json').write_text(json.dumps({
            'image': [720, 406], 'fps': 30, 'source': 'mixkit-36800 de 1,0 à 5,5 s',
            'ordre': 'haut-gauche, haut-droit, bas-droit, bas-gauche (coins vifs, côtés prolongés)',
            'rayon': radius, 'quads': quads}, separators=(',', ':'), ensure_ascii=False) + '\n')
        print('photo : coins relevés sur', len(quads), 'images ; image 1', quads[0], 'rayon', radius)
    print(key, i, len(frames), 'images')
(V / 'film-mo11/seq.json').write_text(json.dumps(counts) + '\n')
print('seq.json', counts)

if CHECK:
    CHECK.mkdir(parents=True, exist_ok=True)
    sheet(CHECK / 'mo11-seq.jpg', list(CLIPS))
    # écran du téléphone : contour relevé tracé sur trois images
    from PIL import Image, ImageDraw
    fs = sorted((OUT / 'photo').glob('*.jpg')); Q = json.loads((V / 'film-mo11/photo-ecran.json').read_text())['quads']
    ims = []
    for j in (0, len(fs) // 2, len(fs) - 1):
        im = Image.open(fs[j]).convert('RGB'); d = ImageDraw.Draw(im)
        d.polygon([tuple(p) for p in Q[j]], outline=(255, 90, 31)); ims.append(im)
    S = Image.new('RGB', (720 * 3 + 8, 406), (8, 7, 10))
    for c, im in enumerate(ims): S.paste(im, (c * 724, 0))
    S.save(CHECK / 'mo11-seq-photo.jpg', quality=88)
    fs = sorted((OUT / 'roue').glob('*.jpg'))
    S = Image.new('RGB', (180 * 4 * 3 + 8, 140 * 3), (8, 7, 10))
    for c, j in enumerate((0, 60, len(fs) - 1)):
        S.paste(Image.open(fs[j]).crop((233, 142, 413, 282)).resize((720, 420)).convert('RGB').crop((0, 0, 720, 420)), (c * 724, 0))
    S.save(CHECK / 'mo11-seq-roue.jpg', quality=88)
    print('contrôle', CHECK)
