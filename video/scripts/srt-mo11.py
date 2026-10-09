"""MO11 « La préparation » : sous-titres de la voix, une réplique par carton, temps de la voix posée.
    python3 scripts/srt-mo11.py → renders/9x16-mo11.srt

Lit audio/vo-mo11/vo-timing.json (scripts/vo-mo11.py) : texte écrit avec chiffres, deux lignes de 32 caractères au
plus, un nombre (« 2 000 ») jamais coupé. Tant que la voix est provisoire, les temps le sont aussi : relancer après
`python3 scripts/vo-mo11.py takeA.mp3 --retenue`.
"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = json.load(open(os.path.join(ROOT, 'audio/vo-mo11/vo-timing.json')))
N = 32
ts = lambda t: f"{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{int(t % 60):02d},{int(round(t % 1 * 1000)) % 1000:03d}"


def wrap(s, n=N):
    """Une ligne si elle tient, sinon deux lignes équilibrées ; les espaces des nombres ne coupent pas."""
    if len(s) <= n: return s
    w = re.sub(r'(\d) (?=\d{3}\b)', '\\1\u00a0', s).split(' ')
    cuts = [i for i in range(1, len(w)) if max(len(' '.join(w[:i])), len(' '.join(w[i:]))) <= n]
    if not cuts: sys.exit(f'« {s} » ne tient pas en deux lignes de {n} caractères')
    best = min(cuts, key=lambda i: abs(len(' '.join(w[:i])) - len(' '.join(w[i:]))))
    return (' '.join(w[:best]) + '\n' + ' '.join(w[best:])).replace('\u00a0', ' ')


# « Tu l'achètes 2 000, » et « tu la revends 2 900. » forment une seule phrase, donc un seul carton
L, out, i = V['lines'], [], 0
while i < len(L):
    a = L[i]
    if a['key'] == 'h1' and i + 1 < len(L) and L[i + 1]['key'] == 'h2':
        out.append((a['t'], L[i + 1]['end'], a['text'] + ' ' + L[i + 1]['text'])); i += 2; continue
    out.append((a['t'], a['end'], a['text'])); i += 1
dst = os.path.join(ROOT, 'renders/9x16-mo11.srt')
with open(dst, 'w') as f:
    for k, (a, b, t) in enumerate(out, 1):
        f.write(f"{k}\n{ts(a)} --> {ts(min(b + 0.25, out[k][0] - 0.04) if k < len(out) else b + 0.3)}\n{wrap(t)}\n\n")
print('→ renders/9x16-mo11.srt', len(out), 'cartons' + (' (minutage PROVISOIRE : aucune prise)' if V.get('provisional') else ''))
