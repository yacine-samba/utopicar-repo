"""100 carrousels « valeur » pour les débutants en achat-revente auto (V001 à V100), en 10 séries de 10.
But : donner une raison de s'abonner (séries à épisodes, la suite annoncée) et de commenter (verdict, vrai ou faux,
question). Pas d'offre à la fin : la dernière image annonce l'épisode suivant. Les pros viendront plus tard.
Même DA que carousels-conversion (gabarit copié, fin « abonnement » ajoutée), mêmes éléments graphiques.
Chiffres : vraies annonces analysées le 3 oct. 2026 (web/src/lib/demo.ts), réglages de l'outil, faits vérifiés et sourcés
sur l'image. Cas d'école : toujours présentés comme des exemples.
usage : python carousels-debutants/build.py [--rendu [indices]]"""
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); VIDEO = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(VIDEO, 'carousels-conversion'))
from app20 import CREDITS
from series import SERIES, CAROUSELS

# un dossier par post : titre TikTok, légende, 3 hashtags, et la série (pour le suivi)
for c in CAROUSELS:
    d = os.path.join(VIDEO, 'renders', 'carousels-debutants', f"{c['id']}-{c['slug']}"); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'post.txt'), 'w', encoding='utf-8').write('\n'.join(
        ["TITRE", c['titre'], "", "LÉGENDE", c['legende'], "", ' '.join(c['tags']), "", "SÉRIE (ne pas publier)", c['serie']]) + '\n')

json.dump(dict(carousels=CAROUSELS), open(os.path.join(HERE, 'carousels.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(CAROUSELS), 'carrousel(s) :', ', '.join(f"{c['id']} {c['slug']}" for c in CAROUSELS))
if '--rendu' in sys.argv:
    env = dict(os.environ, CAR='carousels-debutants', PYTHON=os.environ.get('PYTHON', sys.executable))
    subprocess.run(['node', 'scripts/render-carousels.mjs'] + [a for a in sys.argv[1:] if a != '--rendu'], cwd=VIDEO, env=env, check=True)
