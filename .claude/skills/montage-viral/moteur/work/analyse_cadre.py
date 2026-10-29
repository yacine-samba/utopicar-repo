"""Mesure la zone utile de la source et repère les déplacements de caméra (pour remplir projet.ZONE et projet.SCENES).

- zone : colonnes et lignes où l'image bouge dans le temps (la caméra) ; ce qui reste immobile (interface Loom, bandeau
  d'une visio, bordures noires) est hors zone. Sur une vidéo plein cadre, la zone est toute l'image.
- mouvements : différence moyenne entre images successives (5 i/s) dans la zone ; un pic qui dure = la caméra bouge
  ou change de place = une nouvelle scène.

Sorties : work/cadre.json (zone proposée) + work/mouvements.csv (t, diff), et un résumé des pics.
Usage : python work/analyse_cadre.py
"""
import csv
import json
import sys
from pathlib import Path

import cv2
import numpy as np

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI.parent / "scripts"))
import projet  # noqa: E402

for _flux in (sys.stdout, sys.stderr):  # la console Windows (cp1252) ne connaît ni ≥ ni →
    _flux.reconfigure(encoding="utf-8", errors="replace")

cap = cv2.VideoCapture(projet.SRC)
fps = cap.get(cv2.CAP_PROP_FPS)
n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
Wsrc, Hsrc = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
print(f"source {Wsrc}×{Hsrc}, {fps:.2f} i/s, {n} images ({n / fps:.1f} s)")

# 1) zone : un pixel « vivant » varie de plus d'un niveau de gris sur 40 images réparties (la caméra, même devant un mur
#    immobile : bruit, exposition) ; l'interface reste figée au niveau près. Par colonne et par ligne, la part de pixels
#    vivants ; la zone est la plus longue suite de colonnes (de lignes) à plus de 50 %, rognée de 2 px (liseré).
pile = []
for k in range(40):
    cap.set(cv2.CAP_PROP_POS_FRAMES, int((k + 0.5) * n / 40))
    ok, im = cap.read()
    if ok:
        pile.append(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32))
vivant = np.stack(pile).std(axis=0) > 1.0


def plus_longue_suite(part):
    """Début et fin (exclue) de la plus longue suite d'indices où part > 0,5."""
    meilleur, debut = (0, len(part)), None
    for i, v in enumerate(list(part > 0.5) + [False]):
        if v and debut is None:
            debut = i
        elif not v and debut is not None:
            if i - debut > meilleur[1] - meilleur[0] or meilleur == (0, len(part)):
                meilleur = (debut, i)
            debut = None
    return meilleur


x0, x1 = plus_longue_suite(vivant.mean(axis=0))
y0, y1 = plus_longue_suite(vivant.mean(axis=1))
x0, y0, x1, y1 = x0 + 2, y0 + 2, x1 - 2, y1 - 2
w, h = (x1 - x0) // 2 * 2, (y1 - y0) // 2 * 2
zone = (x0, y0, w, h)
print(f"zone proposée (x, y, largeur, hauteur) : {zone}  — à vérifier sur une image avant de la reporter dans "
      f"projet.ZONE (une interface qui bouge, un curseur, peut l'agrandir)")

# 2) mouvements de caméra : diff moyenne à 5 i/s dans la zone (réduite)
pas = max(1, int(round(fps / 5)))
prev, lignes, i = None, [], 0
cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
while True:
    if not cap.grab():
        break
    if i % pas == 0:
        ok, im = cap.retrieve()
        g = cv2.resize(cv2.cvtColor(im[y0:y0 + h, x0:x0 + w], cv2.COLOR_BGR2GRAY), (320, max(2, int(320 * h / w))),
                       interpolation=cv2.INTER_AREA).astype(np.float32)
        if prev is not None:
            lignes.append((round(i / fps, 2), round(float(np.abs(g - prev).mean()), 2)))
        prev = g
    i += 1
with open(ICI / "mouvements.csv", "w", newline="") as f:
    wr = csv.writer(f)
    wr.writerow(["t", "diff"])
    wr.writerows(lignes)
(ICI / "cadre.json").write_text(json.dumps({"zone": zone, "source": [Wsrc, Hsrc], "fps": fps, "duree": n / fps}),
                                encoding="utf-8")
d = np.array([l[1] for l in lignes])
seuil = max(4 * np.median(d), np.percentile(d, 97))
pics, debut = [], None
for t, v in lignes:
    if v > seuil and debut is None:
        debut = t
    elif v <= seuil and debut is not None:
        if t - debut >= 0.6:
            pics.append((debut, t))
        debut = None
print(f"diff médiane {np.median(d):.2f}, seuil {seuil:.2f} ; caméra qui bouge (≥ 0,6 s) :",
      ", ".join(f"{a:.1f}→{b:.1f} s" for a, b in pics) or "aucun")
