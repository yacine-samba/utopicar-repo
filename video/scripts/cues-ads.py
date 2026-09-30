"""Sound design des pubs TikTok courtes, calé sur les repères issus de la voix (timeline-ads<N>.json).
Bruitages réels ElevenLabs (s:<nom>) pour les gestes, synthèse (sfx.mjs) pour les impacts sous les chiffres.
usage : python3 scripts/cues-ads.py"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def cues(n, M):
    c = []; S = lambda k, at, **kw: c.append({'t': round(at, 3), 'sfx': 's:' + k, **kw})
    if n == 1:
        c.append({'t': 0.0, 'sfx': 'hit'}); S('slide', M['golf'], g=0.6)
        S('slide', M['colle'] - 0.2, g=0.6); S('paste', M['colle'] + 0.3); S('click', min(M['moins'] - 0.35, M['colle'] + 0.9))
        S('scratch', M['moins'] - 0.18); c.append({'t': M['moins'], 'sfx': 'impact'}); S('slide', M['frais'], g=0.5)
        S('whoosh', M['deux'], pre=0.25)
    elif n == 2:
        c.append({'t': 0.0, 'sfx': 'hit'}); S('ping', M['publiee'] - 0.1); S('slide', M['publiee'] - 0.2, g=0.5)
        S('whoosh', M['surveille'], pre=0.2); c.append({'t': M['surveille'] + 0.5, 'sfx': 'pop'})
        S('slide', M['presque'] - 0.1, g=0.7); c.append({'t': M['presque'], 'sfx': 'hit'})
    else:
        c.append({'t': 0.0, 'sfx': 'hit'})
        for k in ['stock', 'argent', 'marge']: S('slide', M[k], g=0.6)
        c.append({'t': M['marge'] + 0.3, 'sfx': 'pop'}); S('whoosh', M['coup'], pre=0.25)
        for i in range(3): S('slide', M['coup'] + 0.15 + i * 0.12, g=0.4)
        S('whoosh', M['sais'], pre=0.25); c.append({'t': M['revends'] + 0.3, 'sfx': 'pop'})
    S('whoosh', M['cta'], pre=0.2); c.append({'t': M['cta'], 'sfx': 'thump'}); S('click', M['cta'] + 0.9); S('click', M['end'] - 0.7, g=0.8)
    return sorted(c, key=lambda x: x['t'])
for n in (1, 2, 3):
    P = os.path.join(ROOT, f'timeline-ads{n}.json'); t = json.load(open(P))
    t['cues'] = cues(n, t['marks']); json.dump(t, open(P, 'w'), ensure_ascii=False, indent=1)
    print(f'ads{n} : {len(t["cues"])} bruitages')
