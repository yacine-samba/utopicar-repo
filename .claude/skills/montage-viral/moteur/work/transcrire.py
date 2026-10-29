"""Transcription mot à mot de la voix (faster-whisper large-v3, CPU) : work/voix16k.wav → work/words.json.

Usage : python work/transcrire.py   (à lancer en arrière-plan : c'est long sur le processeur)

Sortie : words.json  -> {"segments": [{start, end, text, words: [{w, s, e, p}]}]}
"""
import json
import sys
import time
import wave
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI.parent / "scripts"))
import projet  # noqa: E402

for _flux in (sys.stdout, sys.stderr):  # la console Windows (cp1252) ne connaît ni ≥ ni →
    _flux.reconfigure(encoding="utf-8", errors="replace")
AUDIO = ICI / "voix16k.wav"
SORTIE = ICI / "words.json"

# Les noms propres et le jargon dits dans la vidéo, pour que Whisper les écrive bien (projet.PROMPT_WHISPER).
PROMPT = getattr(projet, "PROMPT_WHISPER", "") or None

t0 = time.time()
# PyAV installé ne connaît pas metadata_errors : on passe le signal déjà décodé.
with wave.open(str(AUDIO), "rb") as wf:
    assert wf.getframerate() == 16000 and wf.getnchannels() == 1 and wf.getsampwidth() == 2
    signal = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
model = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=10)
segments, info = model.transcribe(
    signal,
    language="fr",
    beam_size=5,
    word_timestamps=True,
    vad_filter=False,
    condition_on_previous_text=False,
    initial_prompt=PROMPT,
)
out = []
for seg in segments:
    words = [
        {"w": w.word, "s": round(w.start, 3), "e": round(w.end, 3), "p": round(w.probability, 3)}
        for w in (seg.words or [])
    ]
    out.append({"start": round(seg.start, 3), "end": round(seg.end, 3), "text": seg.text, "words": words})
    print(f"[{seg.start:7.2f} -> {seg.end:7.2f}] {seg.text}", flush=True)

SORTIE.write_text(json.dumps({"duration": info.duration, "segments": out}, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"OK {len(out)} segments en {time.time() - t0:.0f} s", file=sys.stderr)
