"""Fabrique les « plans » de base : la zone caméra seule (aucune interface), recadrée, suivie, étalonnée.

Chaque plan couvre toute la source (0 → projet.DUREE) à cadence constante, si bien que dans HyperFrames
data-media-start = temps de la source. Le son est la voix nettoyée (voix_propre.wav).

  v_M  1080 × 1920  plan vertical, toute la hauteur de la caméra, suit celui qui parle (x seulement)
  v_C  1080 × 1920  plan vertical serré sur le visage (tête vers 38 % de la hauteur)
  h_W  1920 × 1080  plan large fixe, toute la zone caméra
  h_C  1920 × 1080  plan serré qui suit celui qui parle (tête vers 40 % de la hauteur)
  h_M  1920 × 1080  plan moyen (utile quand le sujet est loin ; sinon même fenêtre que h_W)

Décodage et encodage par ffmpeg en BT.709 (même matrice dans les deux sens), traitement image par image
en Python : fenêtre de recadrage, agrandissement Lanczos, contraste, saturation, piqué, léger vignettage.

Usage : python plans.py v_M v_C h_W h_C h_M      (morceaux en parallèle, puis assemblage + voix)
"""
import csv
import subprocess
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

import cv2
import numpy as np

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI.parent / "scripts"))
import projet  # noqa: E402

for _flux in (sys.stdout, sys.stderr):  # la console Windows (cp1252) ne connaît ni ≥ ni →
    _flux.reconfigure(encoding="utf-8", errors="replace")

SORTIE = ICI.parent / "assets" / "plans"
TMP = ICI / "morceaux"
SRC = projet.SRC
CX0, CY0, CW, CH = projet.ZONE
CH -= CH % 2  # hauteur paire : ffmpeg arrondit le recadrage en 4:2:0
FPS = projet.FPS
DUREE = projet.DUREE
N = int(round(DUREE * FPS))

# scènes : (début, fin, sujet suivi, hauteur de tête en px source) — les 4 premiers champs de projet.SCENES
SCENES = [sc[:4] for sc in projet.SCENES]
# hauteur de la fenêtre (px source) par plan et par sujet
HAUTEUR = projet.HAUTEUR
TAILLE = {"v_M": (1080, 1920), "v_C": (1080, 1920), "h_W": (1920, 1080), "h_C": (1920, 1080), "h_M": (1920, 1080)}
TETE = getattr(projet, "TETE", {"v_C": 0.38, "h_C": 0.40, "h_M": 0.42})  # centre de la tête, en part de la hauteur


def lisse(v, sigma):
    k = np.arange(-3 * sigma, 3 * sigma + 1)
    g = np.exp(-0.5 * (k / sigma) ** 2)
    g /= g.sum()
    pad = np.pad(v, (len(k) // 2, len(k) // 2), mode="edge")
    return np.convolve(pad, g, mode="valid")


def piste(nom, t):
    rows = list(csv.DictReader(open(ICI / "suivi" / f"{nom}.csv")))
    ts = np.array([float(r["t"]) for r in rows])
    cx = np.array([float(r["cx"]) for r in rows])
    cy = np.array([float(r["cy"]) for r in rows])
    ok = np.array([float(r["score"]) >= 0.45 for r in rows])
    cx = np.interp(t, ts[ok], cx[ok])
    cy = np.interp(t, ts[ok], cy[ok])
    return lisse(cx, 1.0 * FPS), lisse(cy, 1.5 * FPS)


def fenetres(plan):
    """(x0, y0, h) par image de sortie, en px de la zone caméra."""
    W, H = TAILLE[plan]
    ratio = W / H
    t = np.arange(N) / FPS
    x0 = np.zeros(N)
    y0 = np.zeros(N)
    hh = np.zeros(N)
    for a, b, sujet, _ in SCENES:
        m = (t >= a) & (t < b)
        if not m.any():
            continue
        h = HAUTEUR[plan][sujet]
        w = h * ratio
        if sujet is None or plan == "h_W":
            cx, cy = np.full(m.sum(), CW / 2), np.full(m.sum(), CH / 2)
        else:
            cx, cy = piste(sujet, t[m])
            cy = cy + (0.5 - TETE.get(plan, 0.5)) * h
        x0[m] = np.clip(cx - w / 2, 0, CW - w)
        y0[m] = np.clip(cy - h / 2, 0, CH - h)
        hh[m] = h
    return x0, y0, hh


def vignette(W, H, force=0.18):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / np.sqrt(2)
    v = (1.0 - force * np.clip((d - 0.45) / 0.55, 0, 1) ** 1.6) * 255.0
    return cv2.merge([np.round(v).astype(np.uint8)] * 3)


LUT_C = np.clip((np.arange(256) - 128) * 1.08 + 128 + 1.5, 0, 255).astype(np.uint8)
LUT_S = np.clip((np.arange(256) - 128) * 1.07 + 128, 0, 255).astype(np.uint8)


def traiter(img, x0, y0, h, W, H, vig):
    s = H / h
    M = np.float32([[s, 0, -x0 * s], [0, s, -y0 * s]])
    out = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)
    a = min(0.55, 0.22 + 0.09 * s)
    flou = cv2.GaussianBlur(out, (0, 0), 0.45 * s)
    out = cv2.addWeighted(out, 1 + a, flou, -a, 0)
    return cv2.multiply(out, vig, scale=1 / 255.0)


def morceau(args):
    plan, i0, i1 = args
    W, H = TAILLE[plan]
    x0, y0, hh = fenetres(plan)
    vig = vignette(W, H)
    t0 = i0 / FPS
    dec = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-ss", f"{t0:.4f}", "-i", SRC, "-frames:v", str(i1 - i0),
         "-vf", f"fps={FPS},crop={CW}:{CH}:{CX0}:{CY0},scale=in_color_matrix=bt709:out_color_matrix=bt709",
         "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
    dst = TMP / f"{plan}_{i0:06d}.mp4"
    enc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS),
         "-i", "-", "-vf", "scale=in_color_matrix=bt709:out_color_matrix=bt709:out_range=tv,format=yuv420p,"
         "eq=contrast=1.08:saturation=1.07:brightness=0.006",
         "-c:v", "libx264", "-preset", "fast", "-crf", "15", "-g", "15", "-threads", "2",
         "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
         str(dst)], stdin=subprocess.PIPE)
    taille = CW * CH * 3
    derniere = None
    for i in range(i0, i1):
        buf = dec.stdout.read(taille)
        while 0 < len(buf) < taille:  # lecture partielle d'un tube : on complète, sinon les lignes glissent
            plus = dec.stdout.read(taille - len(buf))
            if not plus:
                break
            buf += plus
        if len(buf) == taille:
            derniere = np.frombuffer(buf, np.uint8).reshape(CH, CW, 3)
        img = derniere
        enc.stdin.write(traiter(img, x0[i], y0[i], hh[i], W, H, vig).tobytes())
    enc.stdin.close()
    enc.wait()
    dec.stdout.close()
    dec.wait()
    return str(dst)


def assembler(plan, morceaux):
    liste = TMP / f"{plan}.txt"
    liste.write_text("".join(f"file '{Path(m).as_posix()}'\n" for m in morceaux), encoding="utf-8")
    SORTIE.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(liste),
                    "-i", str(ICI / "voix_propre.wav"), "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-shortest", "-movflags", "+faststart",
                    str(SORTIE / f"{plan}.mp4")], check=True)


if __name__ == "__main__":
    TMP.mkdir(exist_ok=True)
    plans = sys.argv[1:] or ["v_M", "v_C", "h_W", "h_C", "h_M"]
    pas = 30 * 60  # morceaux d'une minute
    taches = [(p, i, min(N, i + pas)) for p in plans for i in range(0, N, pas)]
    with ProcessPoolExecutor(max_workers=8) as ex:
        faits = list(ex.map(morceau, taches))
    for p in plans:
        assembler(p, sorted(m for m in faits if Path(m).name.startswith(p + "_")))
        print("plan prêt :", p, flush=True)
