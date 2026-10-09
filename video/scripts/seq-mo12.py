"""MO12 « La pochette » : les plans réels (Mixkit) en séquences d'images pour le film.

    python3 scripts/seq-mo12.py              → film-mo12/seq/<clé>/001.jpg… (30 i/s, 720 px de large) et film-mo12/seq.json
    python3 scripts/seq-mo12.py --check D    → en plus, une planche de 3 images par clé dans D (fond #08070a)
    python3 scripts/seq-mo12.py signe        → une seule clé

Même format que `mixkit.py seq` (ffmpeg, fps=30, scale=720:-2, -q:v 4) : film-mo12/film.js les lit avec
Kit47.loadSeqs('seq', SEQ) et Kit47.drawSeq (lecture en aller-retour). Quatre clés demandent un traitement que
`mixkit.py seq` ne fait pas, d'où ce script :
  signe   le mot anglais « Signature » imprimé sous la ligne est effacé image par image : son encre grise est relevée
          sur chaque image dans un polygone fixe (la mise au point respire), puis bouchée par inpainting ; la
          signature bleue, le doigt et les points de la ligne restent ;
  ct2     recadré à droite (x ≥ 410 sur 1280) : le mécanicien, visage visible, reste hors du cadre ;
  jours   flouté (sigma 3 px à 720 px) : le calendrier est en anglais (« December », « Mo Tu We »), il ne sert que de
          fond flou, il ne doit jamais se lire ;
  ct      ombres relevées (gamma 1,3) : le plan est très sombre, il doit se lire dans une carte de 170 px de haut.
Vidéos sources : assets/stock/mo12/mixkit-<id>.mp4 (hors dépôt), retéléchargées par
    python3 ../.claude/skills/motion-studio/scripts/mixkit.py get <id> --out assets/stock/mo12
Licence : Mixkit Stock Video Free License (usage commercial, modification permise, sans crédit obligatoire).
Choix et contrôle (aucun visage, aucun logo, aucune plaque, aucun texte lisible) : docs/timeline-mo12.md.
"""
import json, subprocess, sys, tempfile
import numpy as np, cv2
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STOCK = ROOT / 'assets/stock/mo12'
OUT = ROOT / 'film-mo12/seq'
MIXKIT = ROOT.parent / '.claude/skills/motion-studio/scripts/mixkit.py'

# clé : (id Mixkit, début s, durée s, traitement, ce qu'on y voit)
SEQ = {
    'essai':  (13976, 11.3, 3.5, None,   'mains sur un volant, route de jour, aucune voiture croisée'),
    'ct':     (17133, 6.5, 4.5, 'eq',    'dessous d\'une voiture qui monte sur un pont élévateur, bras rouges du pont'),
    'ct2':    (13260, 12.05, 1.85, 'crop', 'dessous d\'une voiture sur un pont, atelier clair (recadré, sans le mécanicien)'),
    'phone':  (4915, 2.0, 4.5, None,     'deux mains qui tapent sur un téléphone, écran flou'),
    'signe':  (17416, 1.6, 4.4, 'word',  'un stylo signe sur une ligne pointillée, gros plan (mot « Signature » effacé)'),
    'signe2': (241, 4.0, 4.5, None,      'une main qui signe une feuille sur une table en bois'),
    'cles':   (34140, 1.0, 4.5, None,    'une main qui tend des clés, fond clair'),
    'cafe':   (44956, 1.0, 4.5, None,    'tasse blanche fumante sur sa soucoupe, lumière de jour'),
    'cafe2':  (808, 1.0, 4.5, None,      'tasse grise et sa cuillère, lumière chaude de côté, fond sombre'),
    'jours':  (38501, 8.5, 4.5, 'blur',  'des jours rayés au feutre sur un calendrier (flouté)'),
}

# « Signature » dans mixkit-17416.mp4 (1280 × 720, plan fixe) : polygone autour du mot, sous la ligne pointillée
WORD = np.array([(462, 624), (712, 600), (712, 637), (462, 661)], np.int32)
CROP_CT2 = 'crop=870:720:410:0'
EQ_CT = 'eq=gamma=1.3'


def frames(mp4, start, dur, vf=''):
    """Images 30 i/s, pleine définition, en tableaux BGR."""
    with tempfile.TemporaryDirectory() as td:
        f = ['fps=30'] + ([vf] if vf else [])
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(start), '-t', str(dur), '-i', str(mp4),
                        '-vf', ','.join(f), str(Path(td) / '%03d.png')], check=True)
        return [cv2.imread(str(p)) for p in sorted(Path(td).glob('*.png'))]


def erase_word(ims):
    """Efface le mot imprimé image par image : la mise au point respire pendant le plan, le mot bouge d'un pixel ou
    deux et change de netteté, donc son masque se relève sur chaque image. Encre du mot = pixels du polygone plus
    sombres que le papier voisin (médiane 25 px), gris (pas la signature bleue, pas la peau du doigt), en traits d'au
    moins 14 px ; les points de la ligne pointillée restent."""
    poly = np.zeros(ims[0].shape[:2], np.uint8); cv2.fillPoly(poly, [WORD], 255)
    out = []
    for im in ims:
        g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
        paper = cv2.medianBlur(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY), 25).astype(np.float32)
        f = im.astype(np.float32); sat = f.max(2) - f.min(2)
        ink = ((paper - g > 14) & (sat < 45) & (poly > 0)).astype(np.uint8)
        n, lab, st, cen = cv2.connectedComponentsWithStats(ink, connectivity=8)
        # petits points : ceux de la ligne pointillée longent le bord haut du polygone et restent ; le point du « i »,
        # plus bas, part avec le mot
        top = lambda x: WORD[0][1] + (WORD[1][1] - WORD[0][1]) * (x - WORD[0][0]) / (WORD[1][0] - WORD[0][0])
        ids = [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] >= 14
               or (st[i, cv2.CC_STAT_AREA] >= 3 and cen[i][1] > top(cen[i][0]) + 7)]
        keep = np.isin(lab, ids).astype(np.uint8) * 255
        m = cv2.dilate(keep, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
        out.append(cv2.inpaint(im, m, 4, cv2.INPAINT_TELEA) if m.any() else im)
    return out


def write(key, ims):
    d = OUT / key
    d.mkdir(parents=True, exist_ok=True)
    for p in d.glob('*.jpg'): p.unlink()
    with tempfile.TemporaryDirectory() as td:
        for i, im in enumerate(ims): cv2.imwrite(str(Path(td) / f'{i + 1:03d}.png'), im)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-start_number', '1', '-i', str(Path(td) / '%03d.png'),
                        '-vf', 'scale=720:-2', '-q:v', '4', '-start_number', '1', str(d / '%03d.jpg')], check=True)
    return len(list(d.glob('*.jpg')))


keys = [k for k in sys.argv[1:] if k in SEQ] or list(SEQ)
missing = sorted({str(SEQ[k][0]) for k in keys if not (STOCK / f'mixkit-{SEQ[k][0]}.mp4').exists()})
if missing:
    subprocess.run([sys.executable, str(MIXKIT), 'get', *missing, '--out', str(STOCK)], check=True)
js = OUT.parent / 'seq.json'
counts = json.loads(js.read_text()) if js.exists() else {}
for k in keys:
    i, st, du, how, _ = SEQ[k]
    mp4 = STOCK / f'mixkit-{i}.mp4'
    if how == 'crop': ims = frames(mp4, st, du, CROP_CT2)
    elif how == 'eq': ims = frames(mp4, st, du, EQ_CT)
    elif how == 'blur': ims = [cv2.GaussianBlur(im, (0, 0), 3 * im.shape[1] / 720) for im in frames(mp4, st, du)]
    elif how == 'word': ims = erase_word(frames(mp4, st, du))
    else: ims = frames(mp4, st, du)
    counts[k] = write(k, ims)
    print(f'{k:7s} mixkit-{i:<6d} {st:5.2f} s + {du:4.2f} s → {counts[k]} images')
js.write_text(json.dumps({k: counts[k] for k in SEQ if k in counts}, ensure_ascii=False) + '\n')
print('→', js)

if '--check' in sys.argv:
    from PIL import Image, ImageDraw
    D = Path(sys.argv[sys.argv.index('--check') + 1]); D.mkdir(parents=True, exist_ok=True)
    W = 360
    rows = []
    for k in keys:
        n = counts[k]; idx = [1, (n + 1) // 2, n]
        ims = [Image.open(OUT / k / f'{j:03d}.jpg').convert('RGB') for j in idx]
        for im in ims: im.thumbnail((W, 400))
        rows.append((k, idx, ims))
    Hh = max(im.height for _, _, r in rows for im in r)
    S = Image.new('RGB', (3 * W, len(rows) * (Hh + 22)), (8, 7, 10)); dr = ImageDraw.Draw(S)
    for r, (k, idx, ims) in enumerate(rows):
        for c, (j, im) in enumerate(zip(idx, ims)):
            S.paste(im, (c * W, r * (Hh + 22) + 22)); dr.text((c * W + 4, r * (Hh + 22) + 5), f'{k} {j:03d}', fill='white')
    S.save(D / 'mo12-seq-check.jpg', quality=85); print('contrôle →', D / 'mo12-seq-check.jpg')
