"""Vidéos libres Mixkit : chercher, voir, télécharger, extraire en séquence 30 i/s.

    python3 mixkit.py search car-wash headlight engine --grep "wash|polish|engine" --sheet planche.jpg
    python3 mixkit.py get 47830 24815 --out video/assets/stock/<projet>
    python3 mixkit.py seq video/assets/stock/<projet>/mixkit-24815.mp4 video/film-<projet>/seq/dash --start 1.0 --dur 3.5

Pourquoi : Mixkit (licence libre, usage commercial) est joignable depuis l'environnement ; Pexels, Pixabay et Freepik
ne le sont pas (défi Cloudflare, 403, clé d'API). Ne jamais contourner ces blocages.
Le titre d'un clip ne suffit pas pour choisir (MO5 : une correspondance titre → id fausse) : on choisit sur une
planche de vignettes étiquetées, puis on regarde 3 images par clip avant de l'utiliser. On écarte les plans avec visage.
Le film lit des séquences JPG (30 i/s, 720 px) peintes sur canvas : déterministe, sans <video>.
"""
import argparse, re, subprocess, sys, urllib.request
from pathlib import Path

UA = {'User-Agent': 'Mozilla/5.0'}
def fetch(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()

ap = argparse.ArgumentParser(); sp = ap.add_subparsers(dest='cmd', required=True)
s1 = sp.add_parser('search'); s1.add_argument('queries', nargs='+'); s1.add_argument('--grep', default=''); s1.add_argument('--sheet', default='')
s2 = sp.add_parser('get'); s2.add_argument('ids', nargs='+'); s2.add_argument('--out', required=True)
s3 = sp.add_parser('seq'); s3.add_argument('mp4'); s3.add_argument('dir'); s3.add_argument('--start', type=float, default=0); s3.add_argument('--dur', type=float, default=4); s3.add_argument('--width', type=int, default=720)
a = ap.parse_args()

if a.cmd == 'search':
    found = {}
    for q in a.queries:
        html = fetch(f'https://mixkit.co/free-stock-video/{q}/').decode('utf8', 'ignore')
        for slug in re.findall(r'href="/free-stock-video/([a-z0-9-]+-(\d+))/"', html):
            found[slug[1]] = slug[0]
    rows = [(i, s) for i, s in sorted(found.items(), key=lambda x: x[1]) if not a.grep or re.search(a.grep, s)]
    for i, s in rows: print(i, s)
    if a.sheet:
        from PIL import Image, ImageDraw
        import io
        W, H, cols = 360, 203, 4
        ims = []
        for i, _ in rows[:48]:
            try: ims.append((i, Image.open(io.BytesIO(fetch(f'https://assets.mixkit.co/videos/{i}/{i}-thumb-360-0.jpg'))).convert('RGB')))
            except Exception as e: print('vignette absente', i, e, file=sys.stderr)
        S = Image.new('RGB', (cols * W, ((len(ims) + cols - 1) // cols) * (H + 24)), 'black'); d = ImageDraw.Draw(S)
        for k, (i, im) in enumerate(ims):
            im.thumbnail((W, H)); x, y = (k % cols) * W, (k // cols) * (H + 24)
            S.paste(im, (x, y + 24)); d.text((x + 6, y + 5), i, fill='white')
        S.save(a.sheet, quality=85); print('→', a.sheet)

elif a.cmd == 'get':
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    for i in a.ids:
        for q in ('1080', '720'):          # le 1080 n'existe pas toujours (403) : on retombe sur le 720
            try:
                (out / f'mixkit-{i}.mp4').write_bytes(fetch(f'https://assets.mixkit.co/videos/{i}/{i}-{q}.mp4')); print(i, q); break
            except Exception: pass
        else: print('ÉCHEC', i, file=sys.stderr)

elif a.cmd == 'seq':
    d = Path(a.dir); d.mkdir(parents=True, exist_ok=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(a.start), '-t', str(a.dur), '-i', a.mp4, '-vf', f'fps=30,scale={a.width}:-2', '-q:v', '4', str(d / '%03d.jpg')], check=True)
    print(d, len(list(d.glob('*.jpg'))), 'images')
