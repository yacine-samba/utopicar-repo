"""Repères de bruitages de l'explainer 60 s, recalculés depuis les repères de la timeline (issus de la voix ou de
l'estimation de vo_marks.py). usage : python3 scripts/cues-explainer60.py"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'timeline-explainer60.json'); t = json.load(open(P)); M = t['marks']
c = [{'t': M[k], 'sfx': 'pop'} for k in ['ecoute', 'annonce', 'p1', 'p2', 'p3']]
c += [{'t': M['rien'], 'sfx': 'hit'}, {'t': M['fini'], 'sfx': 'impact'}, {'t': M['voici'], 'sfx': 'thump'}, {'t': M['poche'], 'sfx': 'whoosh'}]
for k in ['f1', 'f2', 'f3', 'f4', 'f5']: c += [{'t': M[k] - 0.15, 'sfx': 'whoosh'}, {'t': M[k], 'sfx': 'pop'}]
c += [{'t': M['colle'] + 0.5, 'sfx': 'click'}, {'t': M['deux'] + 0.1, 'sfx': 'click'}, {'t': M['note'], 'sfx': 'pop'}, {'t': M['verdict'], 'sfx': 'tick'},
      {'t': M['reste'], 'sfx': 'pop'}, {'t': M['plafond'], 'sfx': 'pop'}, {'t': M['dossiers'], 'sfx': 'pop'}, {'t': M['dossiers'] + 0.2, 'sfx': 'pop'},
      {'t': M['meilleure'], 'sfx': 'pop'}, {'t': M['surveille'], 'sfx': 'pop'}, {'t': M['sous'] - 0.05, 'sfx': 'click'}, {'t': M['mille'], 'sfx': 'hit'},
      {'t': M['chaque'], 'sfx': 'pop'}, {'t': M['chaque'] + 0.22, 'sfx': 'pop'}, {'t': M['chaque'] + 0.44, 'sfx': 'pop'}, {'t': M['dort'] + 0.4, 'sfx': 'tick'},
      {'t': M['stock'], 'sfx': 'pop'}, {'t': M['argent'], 'sfx': 'pop'}, {'t': M['marge'], 'sfx': 'pop'}, {'t': M['coup'], 'sfx': 'whoosh'},
      {'t': M['sais'], 'sfx': 'whoosh'}, {'t': M['logo'], 'sfx': 'thump'}, {'t': M['cta'] + 1.0, 'sfx': 'click'}]
# frappe douce des légendes (sans voix, le texte porte le récit)
for k, n in [('colle', 16), ('note', 20), ('reste', 26), ('plafond', 13), ('dossiers', 17), ('comparer', 12), ('surveille', 25),
             ('sous', 18), ('chaque', 24), ('dort', 21), ('stock', 10), ('argent', 21), ('marge', 17), ('coup', 21), ('sais', 23), ('revends', 28), ('cta', 15)]:
    c.append({'t': M[k], 'sfx': 'type', 'n': n, 'rate': 0.02})
t['cues'] = sorted(c, key=lambda x: x['t']); json.dump(t, open(P, 'w'), ensure_ascii=False, indent=1)
print(len(c), 'repères de bruitages')
