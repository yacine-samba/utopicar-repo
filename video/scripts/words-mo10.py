import json, sys
from faster_whisper import WhisperModel
take, size = sys.argv[1], sys.argv[2]
m = WhisperModel(size, device='cpu', compute_type='int8')
import subprocess, numpy as np
raw = subprocess.run(['ffmpeg','-v','error','-i',take,'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True,check=True).stdout
audio = np.frombuffer(raw, np.float32)
segs, _ = m.transcribe(audio, language='fr', word_timestamps=True, beam_size=5, vad_filter=False)
W = []
for s in segs:
    for w in s.words: W.append({'s': round(w.start, 2), 'e': round(w.end, 2), 'w': w.word.strip()})
json.dump(W, open(sys.argv[3], 'w'), ensure_ascii=False, indent=0)
print(' '.join(f"{i}:{w['w']}" for i, w in enumerate(W)))
for i, w in enumerate(W): print(i, w['s'], w['e'], w['w'])
