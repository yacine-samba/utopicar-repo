"""Musique des pubs TikTok courtes (ads1–3), 120 BPM, même instrumentarium que la v7/v8, synthèse numpy déterministe.
Attaque franche à 0 s, groove sous la voix, accents sur les mots clés de chaque pub, arrêt net façon disque sur la
surprise de la pub 1 (« moins 1 200 € »), montée avant le CTA, accord final sous le clic.
usage : CUT=ads1 python3 scripts/music-ads.py → audio/music-ads1.wav + audio/drums-ads1.wav"""
import os, runpy, sys
CUT = os.environ.get('CUT', 'ads1')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'scripts/music-explainer60.py')).read()
# même moteur que l'explainer, sections et accents propres à chaque pub
src = src.replace("timeline-explainer60.json", f"timeline-{CUT}.json").replace("music-explainer60", f"music-{CUT}").replace("drums-explainer60", f"drums-{CUT}")
ACC = {'ads1': ['stop', 'moins', 'deux'], 'ads2': ['mille', 'publiee', 'presque'], 'ads3': ['stock', 'coup', 'sais']}[CUT]
src = src.replace("""M = dict(M); M['stop'] = M['fini'] - 0.15; M['drop'] = grid(M['voici'])""",
  """M = dict(M)
if 'moins' in M: M['stop'] = M['moins'] - 0.15; M['drop'] = grid(M['deux'])
else: M['stop'] = M['drop'] = 1e9
M['annonce'] = 0.0; M['logo'] = M['cta']""")
src = src.replace("for key in ['drop', 'f1', 'f2', 'f3', 'mille', 'f4', 'f5', 'sais', 'logo']:", f"for key in {ACC + ['cta']}:")
src = src.replace("put(mus, riser(M['drop'] - M['stop']), M['stop'], 0.6); ", "")
src = src.replace("    if t < M['stop']: return 'low'", "    if t < M['stop']: return 'full'")
src = src.replace("for e in range(int((M['stop'] - M['annonce']) / BEAT)):", "for e in range(0):")
src = src.replace("i0 = int(M['stop'] * SR); n0 = int(0.3 * SR); i1 = int(M['drop'] * SR)\nfor x in (out, drums):", "i0 = int(min(M['stop'], 1e4) * SR); n0 = int(0.3 * SR); i1 = int(min(M['drop'], 1e4) * SR)\nfor x in ((out, drums) if M['stop'] < 1e8 else ()):")
exec(compile(src, 'music-ads', 'exec'), {'__name__': '__main__', '__file__': os.path.join(ROOT, 'scripts/music-ads.py')})
