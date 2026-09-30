"""Contrôle qualité automatique d'un film livré (MP4 réellement encodé, pas la page).
usage : python3 qa_video.py <film.mp4> [--format vertical|square|desktop] [--out dossier] [--intentional 45-46.9,52-53]
Produit <out>/<nom>-qa.md (rapport) et <out>/<nom>-safe.png (images avec zones interdites en rouge).

Pourquoi ce script : sur les films UTOPICAR v1–v6, les défauts qui ont échappé aux rounds de critique « à l'œil »
étaient tous mesurables — texte dans la zone droite de TikTok, première image vide, intro presque muette,
mix trop grave pour un haut-parleur de téléphone, true peak qui dépasse après l'encodage AAC.
Les seuils sont des garde-fous : un WARN se vérifie sur l'image produite, un FAIL se corrige avant livraison."""
import argparse, json, os, re, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw

ap = argparse.ArgumentParser()
ap.add_argument('video'); ap.add_argument('--format'); ap.add_argument('--out', default='.')
ap.add_argument('--intentional', default='', help='intervalles voulus calmes/vides, ex. "45-46.9,59-60"')
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)
name = os.path.splitext(os.path.basename(a.video))[0]
R = []  # (niveau, contrôle, détail)
def add(level, check, detail): R.append((level, check, detail))

# ---------- specs ----------
pr = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', a.video], capture_output=True, text=True).stdout)
v = next(s for s in pr['streams'] if s['codec_type'] == 'video'); au = next((s for s in pr['streams'] if s['codec_type'] == 'audio'), None)
W, H = int(v['width']), int(v['height']); fps = eval(v['r_frame_rate']); dur = float(pr['format']['duration'])
fmt = a.format or ('vertical' if H > W * 1.3 else 'square' if abs(W - H) < 10 else 'desktop')
add('OK' if v['codec_name'] == 'h264' and v.get('pix_fmt') == 'yuv420p' else 'FAIL', 'Codec vidéo', f"{v['codec_name']} {v.get('pix_fmt')} {W}×{H} {fps:.2f} i/s, {dur:.2f} s ({fmt})")
add('OK' if au and au['codec_name'] == 'aac' and au.get('sample_rate') == '48000' else 'WARN', 'Codec audio', f"{au['codec_name']} {au.get('sample_rate')} Hz" if au else 'pas de piste audio')

# zones interdites (px) : textes, logos et CTA doivent rester dehors
SAFE = {'vertical': dict(top=220, bottom=440, left=60, right=140),   # union TikTok / Reels / Shorts en 1080×1920
        'square': dict(top=60, bottom=60, left=60, right=60),
        'desktop': dict(top=54, bottom=108, left=96, right=96)}[fmt]   # 5 % titre + barre de lecture YouTube
k = W / {'vertical': 1080, 'square': 1080, 'desktop': 1920}[fmt]
SAFE = {s: int(p * k) for s, p in SAFE.items()}
inten = [tuple(map(float, x.split('-'))) for x in a.intentional.split(',') if x]
is_int = lambda t: any(lo <= t <= hi for lo, hi in inten)

# ---------- image : 4 i/s en niveaux de gris, pleine définition réduite de moitié ----------
sw, sh = W // 2, H // 2
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.video, '-vf', f'fps=4,scale={sw}:{sh},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, sh, sw).astype(np.float32); T = np.arange(len(F)) / 4
first = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.video, '-vf', f'scale={sw}:{sh},format=gray', '-frames:v', '1', '-f', 'rawvideo', '-'], capture_output=True).stdout
f0 = np.frombuffer(first, np.uint8).reshape(sh, sw).astype(np.float32)
add('FAIL' if f0.std() < 4 else 'OK', 'Première image', f"écart-type {f0.std():.1f} — {'image vide : c est la vignette et le premier contact, elle doit déjà montrer le hook' if f0.std() < 4 else 'contient déjà du contenu'}")

# contenu « net et contrasté » (texte, logo, UI nette) : gradient fort, le flou d'arrière-plan passe sous le seuil
def sharp(img):
    gx = np.abs(np.diff(img, axis=1))[:-1, :]; gy = np.abs(np.diff(img, axis=0))[:, :-1]
    return (np.maximum(gx, gy) > 60)
hits = []
for i in range(len(F)):
    m = sharp(F[i]); s = {k2: v2 // 2 for k2, v2 in SAFE.items()}
    # fenêtre glissante de 80 px (film) le long de chaque marge : un mot qui déborde fait une zone locale dense,
    # qu'une moyenne sur toute la marge diluerait
    zones = {'haut': m[:s['top'], :].T, 'bas': m[-s['bottom']:, :].T, 'gauche': m[:, :s['left']], 'droite': m[:, -s['right']:]}
    for z, mm in zones.items():
        prof = mm.sum(1); win = 40
        dens = (np.convolve(prof, np.ones(win), 'valid') / (win * mm.shape[1])).max() if len(prof) >= win else 0
        if dens > 0.035: hits.append((T[i], z, dens))
bad = [h for h in hits if not is_int(h[0])]
by = {}
for t, z, d in bad: by.setdefault(z, []).append(t)
if by:
    def ranges(ts):
        out = []
        for t in sorted(ts):
            if out and t - out[-1][1] <= 0.26: out[-1][1] = t
            else: out.append([t, t])
        return ', '.join(f'{x:.2f}–{y + 0.25:.2f}s' for x, y in out)
    det = '; '.join(f"{z} : {ranges(ts)}" for z, ts in by.items())
    add('WARN', 'Zones sûres', f"contenu net dans une zone interdite ({SAFE}) : {det} — vérifier sur {name}-safe.png ; si c'est un texte, un logo ou le CTA, c'est un FAIL")
else: add('OK', 'Zones sûres', f'aucun contenu net dans les marges {SAFE}')
# planche : les 8 instants les plus chargés en bord droit/bas + images régulières
pick = sorted(set([round(t * 4) for t, _, _ in sorted(bad, key=lambda h: -h[2])[:8]] + [int(x) for x in np.linspace(1, len(F) - 2, 8)]))[:16]
thumbs = []
for i in pick:
    png = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{i / 4:.3f}', '-i', a.video, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout
    im = Image.open(__import__('io').BytesIO(png)).convert('RGB'); d = ImageDraw.Draw(im, 'RGBA')
    d.rectangle([0, 0, W, SAFE['top']], fill=(255, 0, 0, 70)); d.rectangle([0, H - SAFE['bottom'], W, H], fill=(255, 0, 0, 70))
    d.rectangle([0, 0, SAFE['left'], H], fill=(255, 0, 0, 70)); d.rectangle([W - SAFE['right'], 0, W, H], fill=(255, 0, 0, 70))
    d.text((8, 8), f'{i / 4:.2f}s', fill=(255, 255, 0))
    tw = 270 if fmt == 'vertical' else 360; thumbs.append(im.resize((tw, int(tw * H / W))))
if thumbs:
    cols = 8 if fmt == 'vertical' else 4; rows = (len(thumbs) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (thumbs[0].width + 6), rows * (thumbs[0].height + 6)), '#1b1f27')
    for j, im in enumerate(thumbs): sheet.paste(im, ((j % cols) * (im.width + 6), (j // cols) * (im.height + 6)))
    sheet.save(os.path.join(a.out, f'{name}-safe.png'))

# images vides / plans figés
std = F.reshape(len(F), -1).std(1); empty = [T[i] for i in range(1, len(F)) if std[i] < 4 and not is_int(T[i])]
add('WARN' if empty else 'OK', 'Images vides', ('aplats sans contenu à ' + ', '.join(f'{t:.2f}s' for t in empty[:20]) + ' — souvent la frame de coupe où le plan suivant n est pas encore entré : faire entrer le premier élément dès la frame de coupe') if empty else 'aucune')
diff = np.r_[99, np.abs(np.diff(F, axis=0)).mean((1, 2))]; still = diff < 0.35; runs = []; s0 = None
for i, st in enumerate(still):
    if st and s0 is None: s0 = i
    if (not st or i == len(still) - 1) and s0 is not None:
        e = i if not st else i + 1
        if (e - s0) / 4 > 0.9 and not is_int(s0 / 4): runs.append((s0 / 4, e / 4))
        s0 = None
add('WARN' if runs else 'OK', 'Plans figés > 0,9 s', ', '.join(f'{x:.2f}–{y:.2f}s' for x, y in runs) if runs else 'aucun')

# ---------- son ----------
if au:
    eb = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', a.video, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    summ = eb[eb.rfind('Summary'):]
    I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', summ)[0]); TP = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', summ)[0])
    add('OK' if abs(I + 14) <= 1 else 'FAIL', 'Loudness intégrée (MP4)', f'{I:.1f} LUFS (cible −14 ±1)')
    add('OK' if TP <= -1.0 else 'FAIL', 'True peak (MP4 encodé)', f"{TP:.1f} dBTP (≤ −1) — {'l encodage AAC ajoute jusqu à 2 dB : masteriser à −3,5 dBTP puis remesurer le MP4' if TP > -1 else 'dans la cible'}")
    MM = np.array([float(x) for x in re.findall(r'M:\s*(-?[\d.]+)', eb[:eb.rfind('Summary')])])
    # ebur128 écrit une ligne tous les 0,1 s ; M = momentané (400 ms). Moyenne énergétique des 2 premières secondes.
    if len(MM) > 30:
        e = lambda x: 10 * np.log10(np.mean(10 ** (np.clip(x, -70, 0) / 10)))
        intro, body = e(MM[4:20]), e(MM[len(MM) // 5:])
        add('WARN' if intro < body - 8 else 'OK', 'Son des 2 premières secondes', f'{intro:.1f} LUFS momentané vs {body:.1f} sur le reste' + (' — le hook sonore est trop faible : sur TikTok le son démarre avec l image, il doit accrocher dès 0 s' if intro < body - 8 else ''))
    y = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', a.video, '-ac', '1', '-ar', '22050', '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
    Y = np.abs(np.fft.rfft(y[: 22050 * 60] * np.hanning(min(len(y), 22050 * 60)))) ** 2; fr = np.fft.rfftfreq(min(len(y), 22050 * 60), 1 / 22050)
    low = Y[fr < 150].sum() / Y.sum(); pres = Y[(fr >= 1000) & (fr < 5000)].sum() / Y.sum()
    add('WARN' if low > 0.5 else 'OK', 'Équilibre pour haut-parleur de téléphone', f'{low * 100:.0f} % de l énergie sous 150 Hz, {pres * 100:.1f} % entre 1 et 5 kHz' + (' — un téléphone ne reproduit pas ce grave : le film paraîtra faible ; remonter médiums/aigus, alléger le sub' if low > 0.5 else ''))

# ---------- rapport ----------
order = {'FAIL': 0, 'WARN': 1, 'OK': 2}
R.sort(key=lambda r: order[r[0]])
md = [f'# QA — {name}', '', f'Format détecté : **{fmt}**, zones interdites {SAFE}', '', '| Niveau | Contrôle | Détail |', '|---|---|---|']
md += [f'| {l} | {c} | {d} |' for l, c, d in R]
md += ['', f'Planche zones sûres : `{name}-safe.png` (rouge = interdit aux textes, logos, CTA).']
open(os.path.join(a.out, f'{name}-qa.md'), 'w').write('\n'.join(md) + '\n')
print('\n'.join(md))
sys.exit(1 if any(r[0] == 'FAIL' for r in R) else 0)
