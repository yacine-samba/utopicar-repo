"""Suivi de la tête de celui qui parle, scène par scène (correspondance de gabarit, sans modèle à télécharger).

Pour chaque sujet : une boîte de départ posée à la main sur une image (coordonnées de la zone caméra),
puis suivi vers l'avant et vers l'arrière, une image sur deux, en niveaux de gris à mi-résolution.
Le gabarit se met à jour lentement (15 %) quand la correspondance est bonne, et reste figé quand une main passe
devant le visage (score bas).

Sortie : suivi/<scene>.csv  (t, cx, cy, score) en coordonnées de la zone caméra.
Usage : python work/suivi.py [sujet ...]        (tous les sujets de projet.SUIVI par défaut)
       python work/suivi.py --image 30.0      (image quadrillée de la zone, pour poser une boîte)
"""
import csv
import sys
from pathlib import Path

import cv2
import numpy as np

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI.parent / "scripts"))
import projet  # noqa: E402

for _flux in (sys.stdout, sys.stderr):  # la console Windows (cp1252) ne connaît ni ≥ ni →
    _flux.reconfigure(encoding="utf-8", errors="replace")

OUT = ICI / "suivi"
OUT.mkdir(exist_ok=True)
SRC = projet.SRC
CX0, CY0, CW, CH = projet.ZONE
K = 0.5  # échelle de travail

# sujet : (début, fin, instant de la boîte, boîte x, y, w, h dans la zone caméra) — projet.SUIVI
SCENES = projet.SUIVI


def lire(t0, t1, pas=2):
    cap = cv2.VideoCapture(SRC)
    fps = cap.get(cv2.CAP_PROP_FPS)
    i0, i1 = int(t0 * fps), int(t1 * fps)
    cap.set(cv2.CAP_PROP_POS_FRAMES, i0)
    ims, ts = [], []
    for i in range(i0, i1):
        ok = cap.grab()
        if not ok:
            break
        if (i - i0) % pas:
            continue
        ok, im = cap.retrieve()
        g = cv2.cvtColor(im[CY0:CY0 + CH, CX0:CX0 + CW], cv2.COLOR_BGR2GRAY)
        g = cv2.resize(g, None, fx=K, fy=K, interpolation=cv2.INTER_AREA)
        ims.append(cv2.GaussianBlur(g, (0, 0), 0.8).astype(np.float32))
        ts.append(i / fps)
    return ims, np.array(ts)


def passe(ims, ordre, box):
    x, y, w, h = [int(round(v * K)) for v in box]
    tmpl = ims[ordre[0]][y:y + h, x:x + w].copy()
    ref = tmpl.copy()
    H, W = ims[0].shape
    res = {}
    R = 28  # rayon de recherche (px à mi-résolution) entre deux images analysées
    for j in ordre:
        im = ims[j]
        sx0, sy0 = max(0, x - R), max(0, y - R)
        sx1, sy1 = min(W, x + w + R), min(H, y + h + R)
        zone = im[sy0:sy1, sx0:sx1]
        if zone.shape[0] < h or zone.shape[1] < w:
            res[j] = (x, y, 0.0)
            continue
        m = cv2.matchTemplate(zone, tmpl, cv2.TM_CCOEFF_NORMED)
        # le gabarit d'origine compte aussi : évite la dérive lente
        m2 = cv2.matchTemplate(zone, ref, cv2.TM_CCOEFF_NORMED)
        m = 0.65 * m + 0.35 * m2
        _, score, _, loc = cv2.minMaxLoc(m)
        if score > 0.45:
            x, y = sx0 + loc[0], sy0 + loc[1]
            if score > 0.7:
                patch = im[y:y + h, x:x + w]
                tmpl = 0.85 * tmpl + 0.15 * patch
        res[j] = (x, y, float(score))
    return res, (w, h)


def suivre(nom):
    t0, t1, ti, box = SCENES[nom]
    ims, ts = lire(t0, t1)
    j0 = int(np.argmin(np.abs(ts - ti)))
    av, (w, h) = passe(ims, list(range(j0, len(ims))), box)
    ar, _ = passe(ims, list(range(j0, -1, -1)), box)
    av.update({k: v for k, v in ar.items() if k not in av})
    with open(OUT / f"{nom}.csv", "w", newline="") as f:
        wr = csv.writer(f)
        wr.writerow(["t", "cx", "cy", "score"])
        for j in range(len(ims)):
            x, y, s = av[j]
            wr.writerow([round(ts[j], 3), round((x + w / 2) / K, 1), round((y + h / 2) / K, 1), round(s, 3)])
    sc = np.array([av[j][2] for j in range(len(ims))])
    print(nom, len(ims), "images, score médian", round(float(np.median(sc)), 3), "part < 0.45 :",
          round(float((sc < 0.45).mean()), 3), file=sys.stderr)


def image(t, sortie):
    """Une image de la zone à t, quadrillée tous les 100 px (repères pour poser la boîte de départ d'un sujet)."""
    cap = cv2.VideoCapture(SRC)
    cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
    ok, im = cap.read()
    z = im[CY0:CY0 + CH, CX0:CX0 + CW].copy()
    for x in range(0, CW, 100):
        cv2.line(z, (x, 0), (x, CH), (0, 255, 255), 1)
        cv2.putText(z, str(x), (x + 3, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)
    for y in range(0, CH, 100):
        cv2.line(z, (0, y), (CW, y), (0, 255, 255), 1)
        cv2.putText(z, str(y), (3, y + 16), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)
    cv2.imwrite(str(sortie), z)
    print("image :", sortie)


if len(sys.argv) > 2 and sys.argv[1] == "--image":
    # python work/suivi.py --image 30.0  → work/suivi/grille-30.0.jpg
    image(float(sys.argv[2]), OUT / f"grille-{float(sys.argv[2]):.1f}.jpg")
else:
    for nom in (sys.argv[1:] or SCENES):
        suivre(nom)
