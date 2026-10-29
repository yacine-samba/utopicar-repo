"""Niveau de la voix à chaque vraie coupe de tous les montages (calage actuel de noyau.borne_segment).

Une coupe « dans la voix » (au-dessus de -36 dB dans les 30 ms qui la touchent) n'est acceptable que dans le creux
entre deux mots enchaînés sans pause. Au-dessus de -30 dB, elle se vérifie toujours (references/coupes.md) : profil
d'énergie toutes les 20 ms et seconde écoute (work/retranscrire.py), puis entree_src / sortie_src à la main.

Usage : python work/diag_coupes.py [clip-1 youtube …]   (tous les montages par défaut)
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import noyau  # noqa: E402

for _flux in (sys.stdout, sys.stderr):  # la console Windows (cp1252) ne connaît ni ≥ ni →
    _flux.reconfigure(encoding="utf-8", errors="replace")

e = noyau.energie()
ms = noyau.mots()


def niv(a, b):
    i0, i1 = max(0, int(a / 0.005)), min(len(e) - 1, int(b / 0.005))
    return float(e[i0:i1 + 1].max()) if i1 >= i0 else -99


def mot_a(t):
    for w in ms:
        if w['s'] - 0.02 <= t <= w['e'] + 0.02:
            return w['t']
    return ''


montages = {}
try:
    from decoupage import CLIPS
    montages.update({c: [dict(de=a, a=b, cadre=cc, **o) for a, b, cc, o in CLIPS[c]['segs']] for c in CLIPS})
except ImportError:
    pass
try:
    from decoupage_yt import CORPS, OUVERTURE
    montages['youtube'] = [dict(de=a, a=b, **o) for a, b, o in OUVERTURE] + [dict(de=a, a=b, **o) for a, b, o in CORPS]
except ImportError:
    pass
voulus = sys.argv[1:] or list(montages)
a_verifier = 0
for nom in voulus:
    m = noyau.Montage(montages[nom])
    so, en = [], []
    for s in m.segs:
        a, b = s['in'], s['out']
        av = niv(b - 0.03, b)
        if av > -36 and not s['contigu_apres']:
            so.append((round(b, 2), round(av, 1), mot_a(b - 0.03), (s['de'], s['a'])))
        avant = niv(a - 0.03, a)
        if avant > -36 and not s['contigu_avant']:
            en.append((round(a, 2), round(avant, 1), mot_a(a + 0.04), (s['de'], s['a'])))
    fortes = [x for x in so + en if x[1] > -30]
    a_verifier += len(fortes)
    print(f'{nom:9} {len(m.segs):3d} plans · sorties dans la voix : {len(so):3d} · entrées : {len(en):3d} · '
          f'à vérifier (> -30 dB) : {len(fortes)}')
    for x in so:
        print(f'    sortie {x[0]:8.2f}  {x[1]:6.1f} dB  « {x[2]} »  plan {x[3]}' + ('   ← à vérifier' if x[1] > -30 else ''))
    for x in en:
        print(f'    entrée {x[0]:8.2f}  {x[1]:6.1f} dB  « {x[2]} »  plan {x[3]}' + ('   ← à vérifier' if x[1] > -30 else ''))
print(f'\n{a_verifier} coupe(s) au-dessus de -30 dB à vérifier (profil d\'énergie + work/retranscrire.py).')
