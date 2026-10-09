"""MO12 « La pochette » : sous-titres de la voix, une réplique par carton, temps de la voix posée.
    python3 scripts/srt-mo12.py → renders/9x16-mo12.srt (ouverture A) et renders/9x16-mo12-B.srt (ouverture B)

Lit audio/vo-mo12/vo-timing.json (scripts/vo-mo12.py) : texte écrit avec chiffres, deux lignes de 32 caractères au
plus, coupées de préférence après une ponctuation ; un nombre (« 2 700 ») et une ponctuation isolée (« papiers : »)
ne se coupent jamais. Un carton reste 0,25 s après la fin de sa réplique, 0,04 s avant le suivant au plus tard ; le
dernier finit avec le film. Tant que la voix est provisoire, les temps le sont aussi : relancer après
`python3 scripts/vo-mo12.py takeA.mp3 --retenue`.
"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = json.load(open(os.path.join(ROOT, 'audio/vo-mo12/vo-timing.json')))
N, NB = 32, ' '
ts = lambda t: f"{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{int(t % 60):02d},{int(round(t % 1 * 1000)) % 1000:03d}"


def wrap(s, n=N):
    """Une ligne si elle tient, sinon deux lignes : coupure après une ponctuation si possible, puis la plus équilibrée."""
    if len(s) <= n: return s
    s = re.sub(r'(\d) (?=\d{3}\b)', f'\\1{NB}', s)                 # 2 700
    s = re.sub(r' (?=[:;?!…»])', NB, s)                             # papiers :
    w = s.split(' ')
    L = lambda a, b: len(' '.join(w[a:b]))
    cuts = [i for i in range(1, len(w)) if max(L(0, i), L(i, len(w))) <= n]
    if not cuts: sys.exit(f'« {s} » ne tient pas en deux lignes de {n} caractères')
    ponct = [i for i in cuts if re.search(r'[,;:.…?!]$', w[i - 1])]
    best = min(ponct or cuts, key=lambda i: abs(L(0, i) - L(i, len(w))))
    return (' '.join(w[:best]) + '\n' + ' '.join(w[best:])).replace(NB, ' ')


def ecrit(lines, nom):
    out = [(l['t'], l['end'], l['text']) for l in lines]
    dst = os.path.join(ROOT, 'renders', nom)
    with open(dst, 'w') as f:
        for k, (a, b, t) in enumerate(out, 1):
            fin = min(b + 0.25, out[k][0] - 0.04) if k < len(out) else min(b + 0.3, V['dur'])
            f.write(f"{k}\n{ts(a)} --> {ts(fin)}\n{wrap(t)}\n\n")
    print(f'→ renders/{nom}', len(out), 'cartons' + (' (minutage PROVISOIRE : aucune prise)' if V.get('provisional') else ''))


ecrit(V['lines'], '9x16-mo12.srt')
# ouverture B : ses deux répliques à la place de h1, h2 et h3, le reste du film ne bouge pas
if V.get('hookB', {}).get('lines'):
    ecrit(V['hookB']['lines'] + [l for l in V['lines'] if l['key'] not in ('h1', 'h2', 'h3')], '9x16-mo12-B.srt')
