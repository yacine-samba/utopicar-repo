"""Après le rendu : son à -14 LUFS (deux passes, crête -1,5 dBTP), vidéo copiée telle quelle, puis planche de contrôle.

Usage : python scripts/finir.py <rendu.mp4> <sortie.mp4> [--planche]
La planche : une image toutes les 0,25 s sur les 3 premières secondes (l'accroche), puis une par seconde.
"""
import json
import subprocess
import sys
from pathlib import Path

for _flux in (sys.stdout, sys.stderr):  # la console Windows (cp1252) ne connaît ni ≥ ni →
    _flux.reconfigure(encoding="utf-8", errors="replace")


def mesure(src):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(src), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json",
                        "-vn", "-f", "null", "-"], capture_output=True, text=True)
    t = r.stderr
    return json.loads(t[t.rfind("{"):t.rfind("}") + 1])


def master(src, dst):
    m = mesure(src)
    ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-map", "0:v", "-map", "0:a", "-c:v", "copy",
                    "-af", f"alimiter=limit=0.84:level=false,{ln}", "-ar", "48000", "-c:a", "aac", "-b:a", "256k",
                    "-movflags", "+faststart", str(dst)], check=True)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(dst), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    lignes = [l.strip() for l in r.splitlines() if l.strip().startswith(("I:", "Peak:", "LRA:"))]
    print(dst.name, " | ".join(lignes[-3:]))


def planche(video, sortie):
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)],
                               capture_output=True, text=True).stdout)
    ts = [i * 0.25 for i in range(12)] + [float(t) for t in range(3, int(dur))]
    tmp = sortie.parent / (sortie.stem + "_img")
    tmp.mkdir(parents=True, exist_ok=True)
    for f in tmp.glob("*.jpg"):
        f.unlink()
    for i, t in enumerate(ts):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", str(video), "-frames:v", "1",
                        "-vf", f"scale=-2:480,drawtext=text='{t:.2f}':x=8:y=8:fontsize=26:fontcolor=yellow:box=1:boxcolor=black@0.6",
                        str(tmp / f"i_{i:03d}.jpg")], check=True)
    cols = 8
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", "1", "-i", str(tmp / "i_%03d.jpg"), "-vf",
                    f"tile={cols}x{(len(ts) + cols - 1) // cols}:padding=4", "-frames:v", "1", str(sortie)], check=True)
    print("planche :", sortie)


if __name__ == "__main__":
    src, dst = Path(sys.argv[1]), Path(sys.argv[2])
    master(src, dst)
    if "--planche" in sys.argv:
        planche(dst, dst.with_suffix(".planche.jpg"))
