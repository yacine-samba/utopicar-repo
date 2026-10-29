"""Extrait la voix de la source : voix16k.wav (transcription, énergie des coupes), voix48k.wav, voix_propre.wav (le son
des plans : passe-haut, débruitage léger, égaliseur, de-esser, compresseur).

Usage : python work/voix.py
"""
import subprocess
import sys
from pathlib import Path

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI.parent / "scripts"))
import projet  # noqa: E402

for _flux in (sys.stdout, sys.stderr):  # la console Windows (cp1252) ne connaît ni ≥ ni →
    _flux.reconfigure(encoding="utf-8", errors="replace")

NETTOYAGE = ("highpass=f=70,afftdn=nr=8:nf=-50,equalizer=f=220:t=q:w=1.0:g=-2,equalizer=f=3200:t=q:w=1.0:g=2,"
             "deesser=i=0.3,acompressor=threshold=-26dB:ratio=3:attack=6:release=120:makeup=3dB:knee=4")


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


ffmpeg("-i", projet.SRC, "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", str(ICI / "voix16k.wav"))
ffmpeg("-i", projet.SRC, "-vn", "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le", str(ICI / "voix48k.wav"))
ffmpeg("-i", str(ICI / "voix48k.wav"), "-af", NETTOYAGE, "-c:a", "pcm_s16le", str(ICI / "voix_propre.wav"))
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(ICI / "voix_propre.wav"), "-af", "ebur128=peak=true", "-f", "null",
                    "-"], capture_output=True, text=True).stderr
print("voix prête :", " | ".join(l.strip() for l in r.splitlines() if l.strip().startswith(("I:", "Peak:")))[-80:])
