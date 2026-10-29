"""Captures de revue des vidéos courtes : 5 instants par vidéo (0,05 s, 1,2 s, 35 %, 60 %, 85 %), une planche par
projet (courts/revue/<projet>.jpg). Usage : python courts/captures.py [<id> …]"""
import json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw
sys.path.insert(0, str(Path(__file__).resolve().parent))
from serie import COURTS
from court import dossier, S
ids = sys.argv[1:] or list(COURTS)
rev = Path(__file__).resolve().parent / "revue"
rev.mkdir(exist_ok=True)
lignes = {}
for cid in ids:
    c = COURTS[cid]
    tl = json.loads((S / c["projet"] / "work" / f"{cid}-audio4.json").read_text())
    d = tl["duree"]
    ts = [0.05, 1.2, round(0.35 * d, 2), round(0.6 * d, 2), round(0.85 * d, 2)]
    out = rev / cid
    subprocess.run(["npx", "hyperframes", "snapshot", str(dossier(cid)), "--at", ",".join(map(str, ts)), "--no-end",
                    "-o", str(out)], capture_output=True)
    ims = []
    for f in sorted(out.glob("frame-*.png")):
        im = Image.open(f).convert("RGB").resize((270, 480))
        ImageDraw.Draw(im).text((6, 6), f"{cid} {f.stem.split('-at-')[1]}", fill=(255, 255, 0))
        ims.append(im)
    lignes.setdefault(c["projet"], []).append(ims)
for p, rows in lignes.items():
    m = Image.new("RGB", (5 * 274, len(rows) * 484), "black")
    for r, ims in enumerate(rows):
        for i, im in enumerate(ims):
            m.paste(im, (i * 274, r * 484))
    m.save(rev / f"{p}.jpg", quality=86)
    print(rev / f"{p}.jpg")
