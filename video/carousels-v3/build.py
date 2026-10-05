"""200 carrousels TikTok v3 (5 images), accroches écrites avec le skill « L'art du hook » (CLAC, 4 verrous, 5 frameworks)
et les 4 types d'accroche SaaS de Conbersa. Charte du site utopicar.fr (gabarit repris de la v2).
Groupes : A = acheteurs particuliers (67), D = débutants en achat-revente (67), P = pros de l'achat-revente (66).
→ carousels.json (lu par slide.html) + legendes.md (accroche, type, légende, question, hashtags).
usage : python3 carousels-v3/build.py [A|D|P ...]   (sans argument : les trois groupes)"""
import json, os, sys, importlib
from collections import Counter
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from common import HOOKS

def load(*mods):
    out = []
    for m in mods:
        try: out += importlib.import_module(m).CARS
        except ModuleNotFoundError: pass
    return out

GROUPS = [('A', 'ACHETEUR', "Acheter ton occasion sans te faire avoir", load('data_a1', 'data_a2'), 'Acheteurs particuliers'),
          ('D', 'DÉBUTANT', "Ta première revente, étape par étape", load('data_d1', 'data_d2'), 'Débutants en achat-revente'),
          ('P', 'PRO', "Trier 40 annonces en 10 minutes", load('data_p1', 'data_p2'), "Pros de l'achat-revente")]
ONLY = set(sys.argv[1:]) or {'A', 'D', 'P'}

# Vraies voitures détourées : assets/cars/<clé>.png + assets/cars/credits.json (scripts/fetch-cars.py, photos Pexels).
# Le modèle cité dans l'accroche, puis dans le carrousel, décide de la photo ; sinon une citadine courante, en rotation.
CARS_DIR = os.path.join(HERE, '..', 'assets', 'cars')
CREDITS = json.load(open(os.path.join(CARS_DIR, 'credits.json'))) if os.path.exists(os.path.join(CARS_DIR, 'credits.json')) else {}
MODELS = [('golf7', r'golf'), ('clio2', r'clio ?(2|ii)\b'), ('clio3', r'clio ?(3|iii)\b'), ('clio4', r'clio'),
          ('p208', r'\b208\b'), ('p207', r'\b20[67]\b'), ('c3', r'\bc3\b'), ('megane3', r'm[ée]gane'),
          ('yaris', r'yaris'), ('jazz', r'jazz'), ('swift', r'swift'), ('mazda2', r'mazda'), ('aygo', r'aygo|\bc1\b|\b10[78]\b'),
          ('sandero', r'sandero|logan'), ('fiesta', r'fiesta'), ('i20', r'\bi20\b|\brio\b'), ('polo', r'\bpolo\b'),
          ('twingo', r'twingo'), ('fabia', r'fabia'), ('auris', r'auris')]
ROTATION = ['clio4', 'p208', 'c3', 'sandero', 'yaris', 'golf7', 'polo', 'clio3', 'p207', 'fiesta']
import re
def pick_car(c, i):
    txt = json.dumps(c['slides'], ensure_ascii=False).lower()
    first = c['slides'][0]; head = ' '.join(str(first.get(k, '')) for k in ('kicker', 'title')).lower()
    for src in (head, txt):
        for key, rx in MODELS:
            if key in CREDITS and re.search(rx, src): return key
    keys = [k for k in ROTATION if k in CREDITS]
    return keys[i % len(keys)] if keys else None

# 3 jeux de hashtags par cible, en rotation A / B / C (protocole : docs/hashtags_test.md)
TAGS = {
    'A': [['#voitureoccasion', '#acheterunevoiture', '#conseilauto', '#leboncoin'],
          ['#voitureoccasion', '#arnaque', '#premierevoiture', '#astuceauto'],
          ['#voiture', '#occasion', '#mecanique', '#bonplan']],
    'D': [['#achatrevente', '#achatreventevoiture', '#voitureoccasion', '#entrepreneur'],
          ['#achatrevente', '#revenucomplementaire', '#businessauto', '#debutant'],
          ['#achatreventeauto', '#argent', '#sidebusiness', '#voiture']],
    'P': [['#marchandauto', '#achatrevente', '#negoceauto', '#voitureoccasion'],
          ['#marchandvo', '#professionnelauto', '#garage', '#achatreventeauto'],
          ['#achatrevente', '#automobile', '#entrepreneurfrancais', '#marge']],
}

def plain(s):
    for a in ('**', '*', '[r]', '[/r]', '[g]', '[/g]', '==', '++'): s = s.replace(a, '')
    return s.replace('\n', ' ')

cars, md, stats = [], ["# Légendes des 200 carrousels v3\n",
                       "Pour chaque carrousel : l'accroche de l'image 1, son type (skill « L'art du hook » ou Conbersa), puis la "
                       "légende à copier telle quelle (mots de recherche, question, mot à commenter, 4 hashtags). "
                       "Hashtags en rotation A / B / C : protocole dans `docs/hashtags_test.md`.\n"], Counter()
for g, word, guide, group, name in GROUPS:
    if g not in ONLY: continue
    md.append(f"\n## {g} · {name} ({len(group)})\n")
    for i, c in enumerate(group):
        cid = f"{g}{i + 1:03d}"; tset = 'ABC'[i % 3]; tags = TAGS[g][i % 3]; stats[c['hook']] += 1
        key = pick_car(c, len(cars))
        car_ = dict(src=f"../assets/cars/{key}.png", credit=CREDITS[key].get('credit', ''), key=key) if key else None
        cars.append(dict(id=cid, slug=c['slug'], word=word, guide=guide, slides=c['slides'], car=car_))
        h = c['slides'][0]; hook = plain(' '.join(x for x in [h.get('kicker'), h.get('title')] if x))
        md.append(f"### {cid} · {c['slug']}\n\n**Image 1 :** {hook}  \n**Type d'accroche :** {HOOKS[c['hook']]}\n\n"
                  f"```\n{c['caption']}\n{c['question']}\nCommente {word} et je t'envoie le guide.\n\n{' '.join(tags)}\n```\n"
                  f"Hashtags : jeu {tset}" + (f" · Son : {c['sound']}" if c.get('sound') else '') + "\n")
md.append("\n## Répartition des types d'accroche\n\n| Type | Carrousels |\n|---|---|\n" +
          '\n'.join(f"| {HOOKS[k]} | {v} |" for k, v in sorted(stats.items(), key=lambda x: -x[1])) + "\n")
json.dump(dict(carousels=cars), open(os.path.join(HERE, 'carousels.json'), 'w'), ensure_ascii=False, indent=1)
open(os.path.join(HERE, 'legendes.md'), 'w').write('\n'.join(md))
print(len(cars), 'carrousels :', ', '.join(f"{g} {len(x)}" for g, _, _, x, _ in GROUPS if g in ONLY), '·', dict(stats))
