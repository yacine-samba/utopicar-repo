"""Timeline de MO3, calée sur la voix mesurée (audio/vo-mo3.json, scripts/vo-mo3.py).
usage : python3 scripts/timeline-mo3.py → timeline-mo3.json
Chaque ouverture (A, B, C) dure ce que dure sa voix + 0,16 s ; vient ensuite la pluie de frais, 1,25 s sans voix
(le gag se joue dans le silence, comme dans la réf. 5), puis le corps commun. Les événements du corps sont donnés en
temps « corps » u (u = 0 au premier mot du corps) : le film et le son les lisent tous les deux."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = json.load(open(os.path.join(ROOT, 'audio/vo-mo3.json')))
R = [r[:2] for r in V['body']['regions']]
a = lambda i: R[i][0]; b = lambda i: R[i][1]
FEES = 1.25; HOLD = 1.7
ev = {
    'fee0': -FEES + 0.12,           # 1er ticket ; les suivants toutes les 0,27 s
    'ouais': a(0), 'frais': a(1), 'voiture': a(3), 'parfaite': a(4),
    'zoom': b(4) + 0.05,            # zoom à travers « parfaite. », bascule de palette
    'logo': b(4) + 0.42,            # logo + éclat de traits
    'maint': a(5), 'colle': a(6), 'paste': a(6) + 0.32, 'clic': b(6) + 0.22,
    'deux': a(7), 'note': a(8), 'nogo': a(9), 'dit': a(11),
    'prix': a(12), 'slide': b(12) - 0.7, 'sept': a(13),
    'clio': a(14), 'cote': a(15), 'prem': a(16) - 0.2, 'sais': a(17), 'apres': a(18),
    'cta': a(19), 'deb': a(19) + 0.75, 'pro': a(19) + 1.65, 'guide': a(20),
    'end': b(20) + HOLD,
}
hooks = {}
for h in 'ABC':
    H = round(V[h]['dur'] + 0.16, 3); B0 = round(H + FEES, 3)
    hooks[h] = {'H': H, 'B0': B0, 'dur': round(B0 + ev['end'], 3), 'regions': [r[:2] for r in V[h]['regions']],
                'poster': round(B0 + ev['sept'] + 0.6, 2)}
TL = {'version': 1, 'style': 'MO3 : plus d\'humain, gros hooks (grammaire de la réf. 5), voix de Simon en personnage',
      'fps': 60, 'bpm': 108, 'size': [1080, 1920], 'dur': hooks['A']['dur'], 'poster': hooks['A']['poster'],
      'fees': FEES, 'hooks': hooks, 'body': R, 'ev': {k: round(v, 3) for k, v in ev.items()}}
json.dump(TL, open(os.path.join(ROOT, 'timeline-mo3.json'), 'w'), ensure_ascii=False, indent=1)
for h, x in hooks.items(): print(h, x['H'], x['B0'], x['dur'])
