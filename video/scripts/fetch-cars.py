"""Photos de vraies voitures pour les carrousels v3, depuis l'API Pexels (licence Pexels : usage libre, crédit apprécié).
La clé est lue dans la variable d'environnement PEXELS_API_KEY (jamais dans le dépôt).

1. Chercher :  python3 scripts/fetch-cars.py search            → <scratch>/cars/<clé>.jpg (planche de 8 candidates)
2. Choisir  :  éditer assets/cars/choix.json  {"golf7": 123456, ...}  (id Pexels de la photo retenue, voiture entière de 3/4)
3. Préparer :  python3 scripts/fetch-cars.py pick              → assets/cars/<clé>.png détourée + assets/cars/credits.json
"""
import io, json, os, sys, time, urllib.parse, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'cars'); os.makedirs(OUT, exist_ok=True)
SCRATCH = os.environ.get('CARS_SCRATCH', '/tmp/cars-pexels'); os.makedirs(SCRATCH, exist_ok=True)
KEY = os.environ.get('PEXELS_API_KEY')
QUERIES = {  # clé → recherche Pexels (les clés suivent carousels-v3/build.py)
    'golf7': 'Volkswagen Golf', 'clio2': 'Renault Clio 2', 'clio3': 'Renault Clio 3', 'clio4': 'Renault Clio',
    'p208': 'Peugeot 208', 'p207': 'Peugeot 207', 'c3': 'Citroen C3', 'megane3': 'Renault Megane',
    'yaris': 'Toyota Yaris', 'jazz': 'Honda Jazz', 'swift': 'Suzuki Swift', 'mazda2': 'Mazda 2', 'aygo': 'Toyota Aygo',
    'sandero': 'Dacia Sandero', 'fiesta': 'Ford Fiesta', 'i20': 'Hyundai i20', 'polo': 'Volkswagen Polo',
    'twingo': 'Renault Twingo', 'fabia': 'Skoda Fabia', 'auris': 'Toyota Auris',
}

def get(url, headers=None):
    for i in range(6):
        try: return urllib.request.urlopen(urllib.request.Request(url, headers=headers or {}), timeout=60).read()
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            time.sleep(5 * 2 ** i)
    raise RuntimeError('429 persistant')

def api(path, **q):
    if not KEY: sys.exit("PEXELS_API_KEY absente : ajoute-la dans les variables d'environnement de l'environnement cloud.")
    return json.loads(get(f'https://api.pexels.com/v1/{path}?' + urllib.parse.urlencode(q), {'Authorization': KEY}))

def search():
    for key, q in QUERIES.items():
        res = api('search', query=q, per_page=8, orientation='landscape', locale='fr-FR')['photos']
        json.dump(res, open(os.path.join(SCRATCH, f'{key}.json'), 'w'), indent=1)
        S = Image.new('RGB', (1600, 560), 'white')
        for i, p in enumerate(res[:8]):
            im = Image.open(io.BytesIO(get(p['src']['medium']))).convert('RGB'); im.thumbnail((396, 276))
            S.paste(im, ((i % 4) * 400, (i // 4) * 280))
        S.save(os.path.join(SCRATCH, f'{key}.jpg'), quality=82)
        print(key, [(p['id'], p['photographer']) for p in res[:8]]); time.sleep(1)

def pick():
    from rembg import remove, new_session
    sess = new_session('isnet-general-use')
    choix = json.load(open(os.path.join(OUT, 'choix.json')))
    cred_path = os.path.join(OUT, 'credits.json')
    credits = json.load(open(cred_path)) if os.path.exists(cred_path) else {}
    for key, pid in choix.items():
        p = api(f'photos/{pid}')
        src = Image.open(io.BytesIO(get(p['src']['large2x']))).convert('RGB')
        cut = remove(src, session=sess); cut = cut.crop(cut.getbbox())
        cut.thumbnail((1400, 1400)); cut.save(os.path.join(OUT, f'{key}.png'), optimize=True)
        credits[key] = dict(credit=f"Photo : {p['photographer']} · Pexels", photographer=p['photographer'], url=p['url'], id=pid)
        print(key, cut.size, p['photographer'])
    json.dump(credits, open(cred_path, 'w'), ensure_ascii=False, indent=1)

if __name__ == '__main__':
    {'search': search, 'pick': pick}[sys.argv[1] if len(sys.argv) > 1 else 'search']()
