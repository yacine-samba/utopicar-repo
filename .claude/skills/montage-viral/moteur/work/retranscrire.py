"""Seconde écoute d'un passage (faster-whisper large-v3) : mots minutés en temps de la source.

Usage : python work/retranscrire.py 666 680 [690 700 ...]   (paires début fin, en secondes)
Sert à vérifier une coupe douteuse (mot étiré, phrase répétée que Whisper a fondue en une, début de mot faux).
"""
import sys
import wave
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI.parent / "scripts"))
import projet  # noqa: E402

for _flux in (sys.stdout, sys.stderr):  # la console Windows (cp1252) ne connaît ni ≥ ni →
    _flux.reconfigure(encoding="utf-8", errors="replace")
PROMPT = getattr(projet, "PROMPT_WHISPER", "") or None

with wave.open(str(ICI / "voix16k.wav"), "rb") as wf:
    sig = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
model = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=10)
bornes = [float(x) for x in sys.argv[1:]]
for a, b in zip(bornes[::2], bornes[1::2]):
    segs, _ = model.transcribe(sig[int(a * 16000):int(b * 16000)], language="fr", beam_size=5, word_timestamps=True,
                               vad_filter=False, condition_on_previous_text=False, initial_prompt=PROMPT)
    print(f"--- {a:.2f} → {b:.2f}")
    for s in segs:
        print("  " + " ".join(f"{a + w.start:.2f}-{a + w.end:.2f}:{w.word.strip()}" for w in s.words or []))
