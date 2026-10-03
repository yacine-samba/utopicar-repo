"""100 carrousels TikTok v2 (5 images) en 3 groupes : A = acheteurs particuliers (33), D = débutants en achat-revente
(33), P = pros de l'achat-revente (34). Charte du site utopicar.fr (branche main).
→ carousels.json (lu par slide.html) + legendes.md (légende, question, hashtags par carrousel).
usage : python3 carousels-v2/build.py"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from data_acheteur import CARS as A
from data_debutant import CARS as D
from data_pro import CARS as P

# un mot à commenter et un guide du site par cible (web/src/lib/guides/index.ts sur main)
GROUPS = [('A', 'ACHETEUR', "Acheter ton occasion sans te faire avoir", A),
          ('D', 'DÉBUTANT', "Ta première revente, étape par étape", D),
          ('P', 'PRO', "Trier 40 annonces en 10 minutes", P)]

# 3 jeux de hashtags par cible, en rotation (A, B, C) pour comparer les vues à 48 h : voir docs/hashtags_test.md
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

cars, md = [], ["# Légendes des 100 carrousels v2\n",
                "Une légende = 2 lignes avec les mots que les gens tapent dans la recherche TikTok, une question pour les "
                "commentaires, puis 4 hashtags sur une ligne à part. Jeux de hashtags A / B / C en rotation : "
                "le protocole de test est dans `docs/hashtags_test.md`.\n"]
for g, word, guide, group in GROUPS:
    md.append(f"\n## {g} · {'Acheteurs particuliers' if g == 'A' else 'Débutants en achat-revente' if g == 'D' else 'Pros de l’achat-revente'} ({len(group)})\n")
    for i, c in enumerate(group):
        cid = f"{g}{i + 1:02d}"; tset = 'ABC'[i % 3]; tags = TAGS[g][i % 3]
        cars.append(dict(id=cid, slug=c['slug'], word=word, guide=guide, slides=c['slides']))
        hook = c['slides'][0]
        h = ' '.join(x for x in [hook.get('kicker'), hook.get('title')] if x).replace('\n', ' ')
        for a, b in (('*', ''), ('[r]', ''), ('[/r]', ''), ('[g]', ''), ('[/g]', ''), ('**', '')): h = h.replace(a, b)
        md.append(f"### {cid} · {c['slug']}\n\n**Image 1 :** {h}\n\n```\n{c['caption']}\n{c['question']}\nCommente {word} et je t'envoie le guide.\n\n{' '.join(tags)}\n```\n"
                  f"Hashtags : jeu {tset} · Mot à commenter : {word}" + (f" · Son : {c['sound']}" if c.get('sound') else '') + "\n")
json.dump(dict(carousels=cars), open(os.path.join(HERE, 'carousels.json'), 'w'), ensure_ascii=False, indent=1)
open(os.path.join(HERE, 'legendes.md'), 'w').write('\n'.join(md))
print(len(cars), 'carrousels :', ', '.join(f"{g} {len(x)}" for g, _, _, x in GROUPS))
