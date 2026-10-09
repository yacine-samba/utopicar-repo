"""MO13 « Avec 1 500 € » : les plans réels (Mixkit) en séquences d'images pour le film.

    python3 scripts/seq-mo13.py              → film-mo13/seq/<clé>/001.jpg… (30 i/s) et film-mo13/seq.json
    python3 scripts/seq-mo13.py --check D    → en plus, une planche de 3 images par clé dans D (fond #08070a)
    python3 scripts/seq-mo13.py rue cles     → seulement ces clés

Même format que `mixkit.py seq` (ffmpeg, fps=30, -q:v 4, 720 px de large) : le film les lit avec
Kit47.loadSeqs('seq', SEQ) (SEQ = film-mo13/seq.json) et Kit47.drawSeq (lecture en aller-retour, image « cover »).
Toutes les clés sont en paysage 720 × 405 (vignettes des notifications, 372 × 276), sauf :
  rue       en portrait 720 × 1280 (fond plein écran de l'image 0) : recadrage 9:16 de la source 1080p (x 596 → 1204
            sur 1920, les deux réverbères, le ciel du soir, la rue), puis flouté (sigma 5 px à 720 px) : la rue
            « d'en face » n'est jamais nette, les passants et l'enseigne ne se lisent pas ;
  semaines  flouté (sigma 3 px) : le calendrier est en anglais (« December », « Mo Tu We ») ; fond flou seulement ;
  calc      flouté (sigma 3 px) : fond flou de la carte du renversement (calculs au crayon, pièces, calculette).
Le film peut flouter davantage (réduction dans un petit canvas au chargement), jamais moins.
Vidéos sources : assets/stock/mo13/mixkit-<id>.mp4 (hors dépôt), retéléchargées si absentes par
    python3 ../.claude/skills/motion-studio/scripts/mixkit.py get <id> --out assets/stock/mo13
Licence : Mixkit Stock Video Free License (usage commercial, modification permise, sans crédit obligatoire).
Choix et contrôle (aucun visage, aucun logo, aucune plaque, aucun texte lisible) : docs/timeline-mo13.md, « Les plans
réels ».
"""
import json, subprocess, sys, tempfile
import numpy as np, cv2
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STOCK = ROOT / 'assets/stock/mo13'
OUT = ROOT / 'film-mo13/seq'
MIXKIT = ROOT.parent / '.claude/skills/motion-studio/scripts/mixkit.py'

# clé : (id Mixkit, début s, durée s, traitement, ce qu'on y voit)
SEQ = {
    'rue':      (3429, 0.2, 4.5, 'rue',  'une rue le soir : ciel violet et orange, deux réverbères, façade rouge éclairée, '
                                         'passants au loin (portrait, flouté)'),
    'cles':     (34140, 1.0, 4.5, None,  'une main tend un trousseau de clés, veste sombre, fond clair (visage hors cadre)'),
    'contact':  (45301, 9.5, 4.5, None,  'une main tourne la clé dans le contact, tableau de bord bleuté'),
    'assur':    (45926, 1.0, 4.5, None,  'des mains feuillettent une pile de papiers sur un bureau sombre (visage hors cadre)'),
    'signe':    (241, 6.0, 4.5, None,    'une main signe une feuille sur une table en bois, un téléphone posé à côté'),
    'essence':  (31961, 1.5, 4.5, None,  'une main saisit un pistolet de pompe à essence et le décroche'),
    'moteur':   (4716, 3.0, 4.5, None,   'mains gantées dans un compartiment moteur, vase d\'expansion'),
    'pneu':     (45755, 3.0, 4.5, None,  'une main gantée passe un chiffon sur un pneu, atelier clair'),
    'phone':    (1711, 2.0, 4.5, None,   'deux mains tiennent un téléphone et tapent, écran invisible, fond bleu-vert flou'),
    'semaines': (38501, 7.5, 4.5, 'blur', 'des jours rayés au feutre sur un calendrier (flouté)'),
    'calc':     (49219, 1.0, 4.5, 'blur', 'un crayon suit une courbe, pièces et calculette sur la table (flouté)'),
}
CROP_RUE = 'crop=608:1080:596:0,scale=720:1280:flags=lanczos'


def frames(mp4, start, dur, vf=''):
    """Images 30 i/s en tableaux BGR (pleine définition, ou passées par le filtre vf)."""
    with tempfile.TemporaryDirectory() as td:
        f = ['fps=30'] + ([vf] if vf else [])
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(start), '-t', str(dur), '-i', str(mp4),
                        '-vf', ','.join(f), str(Path(td) / '%03d.png')], check=True)
        return [cv2.imread(str(p)) for p in sorted(Path(td).glob('*.png'))]


def write(key, ims, scale=True):
    d = OUT / key
    d.mkdir(parents=True, exist_ok=True)
    for p in d.glob('*.jpg'): p.unlink()
    with tempfile.TemporaryDirectory() as td:
        for i, im in enumerate(ims): cv2.imwrite(str(Path(td) / f'{i + 1:03d}.png'), im)
        vf = ['-vf', 'scale=720:-2'] if scale else []
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-start_number', '1', '-i', str(Path(td) / '%03d.png'),
                        *vf, '-q:v', '4', '-start_number', '1', str(d / '%03d.jpg')], check=True)
    return len(list(d.glob('*.jpg')))


if __name__ == '__main__':
    keys = [k for k in sys.argv[1:] if k in SEQ] or list(SEQ)
    missing = sorted({str(SEQ[k][0]) for k in keys if not (STOCK / f'mixkit-{SEQ[k][0]}.mp4').exists()})
    if missing:
        subprocess.run([sys.executable, str(MIXKIT), 'get', *missing, '--out', str(STOCK)], check=True)
    js = OUT.parent / 'seq.json'
    counts = json.loads(js.read_text()) if js.exists() else {}
    for k in keys:
        i, st, du, how, _ = SEQ[k]
        mp4 = STOCK / f'mixkit-{i}.mp4'
        if how == 'rue':
            ims = [cv2.GaussianBlur(im, (0, 0), 5) for im in frames(mp4, st, du, CROP_RUE)]
            counts[k] = write(k, ims, scale=False)
        elif how == 'blur':
            ims = [cv2.GaussianBlur(im, (0, 0), 3 * im.shape[1] / 720) for im in frames(mp4, st, du)]
            counts[k] = write(k, ims)
        else:
            counts[k] = write(k, frames(mp4, st, du))
        print(f'{k:9s} mixkit-{i:<6d} {st:5.2f} s + {du:4.2f} s → {counts[k]} images')
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
        S = Image.new('RGB', (3 * (W + 10), sum(max(im.height for im in r) + 22 for _, _, r in rows)), (8, 7, 10))
        dr = ImageDraw.Draw(S); y = 0
        for k, idx, ims in rows:
            for c, (j, im) in enumerate(zip(idx, ims)):
                S.paste(im, (c * (W + 10), y + 22)); dr.text((c * (W + 10) + 4, y + 5), f'{k} {j:03d}', fill='white')
            y += max(im.height for im in ims) + 22
        S.save(D / 'mo13-seq.jpg', quality=85); print('contrôle →', D / 'mo13-seq.jpg')
