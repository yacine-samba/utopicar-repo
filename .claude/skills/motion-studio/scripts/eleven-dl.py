"""Télécharger les générations ElevenLabs d'un flow (musique, bruitages, voix) avant que leurs liens expirent (≈ 2 h).

usage : python3 scripts/eleven-dl.py statut.json [statut2.json …] --out dossier --map "electronic pop=musique,impact hit=impact"

statut.json : la réponse de creative_get_flow_run_status enregistrée telle quelle. Quand elle est trop longue pour la
conversation, l'outil l'écrit déjà dans un fichier de résultats : passer ce fichier. Chaque génération terminée est
enregistrée sous <nom>-<id de génération>.<ext>, <nom> venant du premier fragment de --map trouvé dans son prompt
(sinon « gen »). Les fichiers déjà présents sont ignorés. Lien expiré : relancer creative_get_flow_run_status
avec les mêmes session_ids pour obtenir des liens neufs, puis relancer ce script. Un lien expiré répond 400
(parfois 403).
Vient de master60 (oct. 2026) : 4 musiques et 11 types de bruitages × 4 variations, réponses de 45 ko.
"""
import os, sys, json, argparse, urllib.request, urllib.error

ap = argparse.ArgumentParser()
ap.add_argument('status', nargs='+'); ap.add_argument('--out', required=True); ap.add_argument('--map', default='')
A = ap.parse_args()
os.makedirs(A.out, exist_ok=True)
MAP = [tuple(s.split('=', 1)) for s in A.map.split(',') if '=' in s]


def load(path):
    txt = open(path, encoding='utf-8').read()
    try: return json.loads(txt)
    except json.JSONDecodeError: return json.loads(txt[txt.index('{'):txt.rindex('}') + 1])   # texte autour du JSON


n_ok = n_skip = n_bad = 0; pending = False
for p in A.status:
    d = load(p); pending |= not d.get('all_completed', False)
    for g in d.get('generations', []):
        if g.get('status') != 'completed' or not g.get('content_url'): pending = True; continue
        k = next((v for frag, v in MAP if frag.lower() in g.get('prompt', '').lower()), 'gen')
        ext = os.path.splitext(g['content_url'].split('?')[0])[1] or '.mp3'
        f = os.path.join(A.out, f"{k}-{g['id']}{ext}")
        if os.path.exists(f): n_skip += 1; continue
        try:
            urllib.request.urlretrieve(g['content_url'], f + '.part'); os.replace(f + '.part', f); n_ok += 1
        except urllib.error.HTTPError as e:
            n_bad += 1; print(f"{k}-{g['id']} : HTTP {e.code}{' (lien expiré : relancer creative_get_flow_run_status)' if e.code in (400, 403) else ''}", file=sys.stderr)
print(f'{n_ok} téléchargés, {n_skip} déjà là, {n_bad} en échec' + (' ; des générations ne sont pas terminées' if pending else ''))
sys.exit(1 if n_bad else 0)
