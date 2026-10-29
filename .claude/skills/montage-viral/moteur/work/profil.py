"""Profil d'énergie de la voix autour d'une coupe douteuse : niveau toutes les 20 ms, mots de Whisper, îlots de parole.

Lecture : un creux sous -35 dB entre deux mots = vrai silence, on peut y couper ; -20 à -30 dB sans creux = parole
enchaînée, on coupe au point le plus bas entre les deux mots ; une montée brève et forte = attaque d'un mot (ne jamais
couper juste après). Le début d'un mot de Whisper peut être faux de 0,2 à 0,5 s : l'énergie fait foi.

Usage : python work/profil.py 541.1 541.5 [593.6 594.4 …]   (paires début fin, en secondes de la source)
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import noyau  # noqa: E402

for _flux in (sys.stdout, sys.stderr):  # la console Windows (cp1252) ne connaît ni ≥ ni →
    _flux.reconfigure(encoding="utf-8", errors="replace")

e = noyau.energie()
ms = noyau.mots()
bornes = [float(x) for x in sys.argv[1:]]
for a, b in zip(bornes[::2], bornes[1::2]):
    print(f"--- {a:.2f} → {b:.2f}")
    vals, t = [], a
    while t <= b + 1e-9:
        i = int(t / 0.005)
        vals.append(f"{t:.2f}:{e[i:i + 4].max():.0f}")
        t += 0.02
    print("  énergie (dB) : " + " ".join(vals))
    print("  mots : " + " ".join(f"{w['s']:.2f}-{w['e']:.2f}:{w['t']}" for w in ms if a - 0.4 <= w['s'] <= b + 0.4))
    print("  îlots : " + ", ".join(f"{x:.3f}-{y:.3f}" for x, y in noyau.ilots() if y >= a - 0.3 and x <= b + 0.3))
