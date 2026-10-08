"""MO10 « Deux voitures » : sous-titres de la voix, une réplique par carton, temps de la voix posée.
    python3 scripts/srt-mo10.py → renders/9x16-mo10.srt"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = json.load(open(os.path.join(ROOT, 'audio/vo-mo10/vo-timing.json')))
ts = lambda t: f"{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{int(t % 60):02d},{int(round(t % 1 * 1000)) % 1000:03d}"
def wrap(s, n=32):
    if len(s) <= n: return s
    w = s.split(); best = min(range(1, len(w)), key=lambda i: abs(len(' '.join(w[:i])) - len(' '.join(w[i:]))))
    return ' '.join(w[:best]) + '\n' + ' '.join(w[best:])
L = {l['key']: l for l in V['lines']}
out = []
for l in V['lines']:
    if l['key'] in ('soupir', 'reste'): continue
    if l['key'] == 'deux2': out.append((l['t'], L['reste']['end'], 'La deuxième… reste.')); continue
    out.append((l['t'], l['end'], l['text']))
with open(os.path.join(ROOT, 'renders/9x16-mo10.srt'), 'w') as f:
    for k, (a, b, t) in enumerate(out, 1):
        f.write(f"{k}\n{ts(a)} --> {ts(min(b + 0.25, out[k][0] - 0.04) if k < len(out) else b + 0.3)}\n{wrap(t)}\n\n")
print('→ renders/9x16-mo10.srt', len(out), 'cartons')
