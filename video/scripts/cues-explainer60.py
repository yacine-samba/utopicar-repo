"""Sound design de l'explainer 60 s, recalculé depuis les repères de la timeline (issus de la voix ou de l'estimation
de vo_marks.py). Bruitages réels ElevenLabs (s:<nom>, audio/sfx-lib) pour les gestes et les moments clés, synthèse
(sfx.mjs) pour les impacts sous les chiffres et le logo. Avec voix off : pas de frappe sous les légendes (la voix porte
le texte). usage : python3 scripts/cues-explainer60.py"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'timeline-explainer60.json'); t = json.load(open(P)); M = t['marks']
voice = not t.get('voSource', 'estimation').startswith('estimation')
c = []
S = lambda k, at, **kw: c.append({'t': round(at, 3), 'sfx': 's:' + k, **kw})
# accroche et problème
S('slide', M['annonce'], g=0.8)
for i in range(4): S('slide', M['frais'] + i * 0.25, g=0.55, pan=[-0.3, 0.3, -0.2, 0.2][i])
c.append({'t': M['rien'], 'sfx': 'hit'})
for k in ['p1', 'p2', 'p3']: S('slide', M[k], g=0.6)
S('scratch', M['fini'] - 0.18)
c.append({'t': M['voici'], 'sfx': 'thump'}); S('whoosh', M['poche'], pre=0.25)
# chapitres : whoosh dont le sommet tombe sur le numéro
for k in ['f1', 'f2', 'f3', 'f4', 'f5']: S('whoosh', M[k], pre=0.3); c.append({'t': M[k], 'sfx': 'pop'})
# 1 Analyser
S('paste', M['colle'] + 0.42); S('click', M['deux'] + 0.1)
S('slide', M['note'], g=0.7); c.append({'t': M['verdict'], 'sfx': 'tick'}); S('slide', M['reste'], g=0.7)
S('slide', M['plafond'], g=0.7); c.append({'t': M['plafond'] + 0.5, 'sfx': 'pop'})
# 2 Rapports
dIn = min(M['dossiers'], M['f2'] + 0.45); S('slide', dIn, g=0.7); S('slide', dIn + 0.2, g=0.6)
S('slide', M['comparer'], g=0.5); c.append({'t': M['meilleure'], 'sfx': 'pop'})
# 3 Recherche : notification quand la nouvelle annonce arrive, clic, chiffre
S('ping', min(M['surveille'], M['f3'] + 0.8), g=0.8); S('click', M['sous'] - 0.05)
c.append({'t': M['mille'], 'sfx': 'hit'}); S('ping', M['premier'])
# 4 Parc
rIn = min(M['chaque'], M['f4'] + 0.7); S('slide', M['f4'] + 0.3, g=0.5); S('slide', rIn, g=0.6); S('slide', rIn + 0.22, g=0.6)
c.append({'t': M['dort'] + 0.4, 'sfx': 'tick'})
# 5 Tableau de bord
for k in ['stock', 'argent', 'marge']: c.append({'t': M[k], 'sfx': 'pop'})
S('whoosh', M['coup'], pre=0.25)
# fin
S('whoosh', M['sais'], pre=0.25); c.append({'t': M['logo'], 'sfx': 'thump'}); S('click', M['cta'] + 1.0)
if not voice:
    for k, n in [('colle', 16), ('note', 20), ('reste', 26), ('plafond', 13), ('dossiers', 17), ('comparer', 12), ('surveille', 25),
                 ('sous', 18), ('chaque', 24), ('dort', 21), ('stock', 10), ('argent', 21), ('marge', 17), ('coup', 21), ('sais', 23), ('revends', 28), ('cta', 15)]:
        c.append({'t': M[k], 'sfx': 'type', 'n': n, 'rate': 0.02})
t['cues'] = sorted(c, key=lambda x: x['t']); json.dump(t, open(P, 'w'), ensure_ascii=False, indent=1)
print(len(c), 'repères de bruitages', '(avec voix)' if voice else '(sans voix)')
