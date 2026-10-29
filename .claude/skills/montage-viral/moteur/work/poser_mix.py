"""Pose le mix hors ligne (work/<clip>-mix.wav, work/mix.py) sur la vidéo rendue, à la place du son de HyperFrames.

- image copiée telle quelle ; son AAC 256 kb/s, 48 kHz, à la durée exacte de la vidéo ;
- synchro vérifiée avant de poser, par corrélation des enveloppes (résolution 1 ms) : le son du rendu HyperFrames
  est celui des plans (work/voix_propre.wav, chaîne v1/v2, mesurée 23 ms en retard sur la source, dont l'image des
  plans est copiée) ; une fois ce retard connu retiré, la voix du mix doit tomber sur la source à une demi-image
  près, sinon arrêt ;
- crête vraie mesurée APRÈS encodage : au-dessus de -1 dBTP, le plafond du limiteur (suréchantillonné ×4) baisse
  d'autant et on réencode.

Usage : python work/poser_mix.py <clip> <rendu.mp4> <sortie.mp4> [version]   (version « 4 » : work/<clip>-mix4.wav)
"""
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfiltfilt

ICI = Path(__file__).resolve().parent
TP_MAX = -1.0


def lit(f, sr):
    raw = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", str(f), "-vn", "-ac", "1", "-ar", str(sr), "-f",
                          "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def enveloppe(x, sr):
    x = sosfiltfilt(butter(4, [300, 3400], "bandpass", fs=sr, output="sos"), x)
    e = sosfiltfilt(butter(2, 40, "lowpass", fs=sr, output="sos"), np.abs(x))
    e = e[:: sr // 1000]  # 1 kHz
    return (e - e.mean()) / (e.std() + 1e-12)


def decalage_ms(rendu, voix):
    """Décalage (ms) de la voix du mix par rapport à celle du rendu : > 0, le mix est en retard."""
    a, b = enveloppe(lit(rendu, 16000), 16000), enveloppe(lit(voix, 16000), 16000)
    n = min(len(a), len(b))
    a, b = a[:n], b[:n]
    m = 1 << int(np.ceil(np.log2(2 * n)))
    c = np.fft.irfft(np.fft.rfft(b, m) * np.conj(np.fft.rfft(a, m)), m)
    lags = np.r_[np.arange(0, 300), np.arange(-300, 0)]
    vals = np.r_[c[:300], c[-300:]]
    k = int(np.argmax(vals))
    return int(lags[k]), float(vals[k] / n)


def duree(f):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)],
                                capture_output=True, text=True, check=True).stdout)


def mesure(f):
    t = subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-i", str(f), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    t = t[t.rfind("Summary:"):]
    return float(re.search(r"I:\s+(-?[\d.]+) LUFS", t).group(1)), float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", t).group(1))


def poser(clip, rendu, sortie, version="", work=ICI):
    work = Path(work)
    mix = work / f"{clip}-mix{version}.wav"
    lag, r = decalage_ms(rendu, work / f"{clip}-stems{version}" / "voix.wav")
    retard_plans, _ = decalage_ms(work / "voix48k.wav", work / "voix_propre.wav")
    ecart = lag + retard_plans
    print(f"{clip} : voix du mix {lag:+d} ms / son du rendu, dont le retard est de {retard_plans} ms ; "
          f"écart à l'image {ecart:+d} ms (corrélation {r:.2f})")
    if abs(ecart) > 21 or r < 0.5:
        sys.exit(f"{clip} : synchro douteuse ({ecart:+d} ms, r = {r:.2f}), rien n'est posé")
    d = duree(rendu)
    plafond = None
    for _ in range(4):
        af = "apad"
        if plafond is not None:  # limiteur suréchantillonné : il voit les crêtes entre les échantillons
            af = (f"aresample=192000,alimiter=limit={10 ** (plafond / 20):.4f}:attack=2:release=50:level=false,"
                  f"aresample=48000,apad")
        tmp = sortie.with_suffix(".tmp.mp4")
        subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(rendu), "-i", str(mix), "-map", "0:v",
                        "-map", "1:a", "-c:v", "copy", "-af", af, "-t", f"{d:.3f}", "-ar", "48000", "-c:a", "aac",
                        "-b:a", "256k", "-movflags", "+faststart", str(tmp)], check=True)
        i, tp = mesure(tmp)
        print(f"   plafond {'—' if plafond is None else f'{plafond:.1f} dBFS'} : {i:.1f} LUFS, crête vraie {tp:+.1f} dBTP"
              f" après AAC")
        if tp <= TP_MAX:
            break
        plafond = (plafond if plafond is not None else -2.5) - (tp - TP_MAX) - 0.3
    tmp.replace(sortie)
    print(f"   → {sortie} ({d:.2f} s)")


if __name__ == "__main__":
    poser(sys.argv[1], Path(sys.argv[2]), Path(sys.argv[3]), sys.argv[4] if len(sys.argv) > 4 else "")
