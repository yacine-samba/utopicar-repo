"""MO9 « 974 € » : sous-titres de la voix, une réplique par carton, temps de la voix posée.
    python3 scripts/srt-mo9.py → renders/9x16-mo9.srt"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = json.load(open(os.path.join(ROOT, 'audio/vo-mo9/vo-timing.json')))
ts = lambda t: f"{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{int(t % 60):02d},{int(round(t % 1 * 1000)) % 1000:03d}"
def wrap(s, n=32):
    if len(s) <= n: return s
    w = s.split(); best = min(range(1, len(w)), key=lambda i: abs(len(' '.join(w[:i])) - len(' '.join(w[i:]))))
    return ' '.join(w[:best]) + '\n' + ' '.join(w[best:])
L = [l for l in V['lines'] if l['key'] != 'rire']
# « Tu l'achètes 3 900, » et « tu la revends 5 600. » forment une seule phrase
out, i = [], 0
while i < len(L):
    a = L[i]
    if a['key'] == 'h1': b = L[i + 1]; out.append((a['t'], b['end'], a['text'] + ' ' + b['text'])); i += 2; continue
    out.append((a['t'], a['end'], a['text'])); i += 1
with open(os.path.join(ROOT, 'renders/9x16-mo9.srt'), 'w') as f:
    for k, (a, b, t) in enumerate(out, 1):
        f.write(f"{k}\n{ts(a)} --> {ts(min(b + 0.25, out[k][0] - 0.04) if k < len(out) else b + 0.3)}\n{wrap(t)}\n\n")
print('→ renders/9x16-mo9.srt', len(out), 'cartons')
