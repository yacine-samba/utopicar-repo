"""Sous-titres SRT de MO3, une ligne par région de voix mesurée (timeline-mo3.json), texte relu à la main.
usage : python3 scripts/srt-mo3.py → renders/9x16-mo3-<A|B|C>.srt"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, 'timeline-mo3.json')))
HOOKS = {'A': ['Mmh…', 'Propre…', 'Huit mille…', 'Allez.', 'Je la prends.'],
         'B': ['Moins 1 200 euros.', 'Sur une voiture…', 'impeccable.'],
         'C': ['Je vais te montrer…', 'ma pire', 'voiture.']}
BODY = ['Ouais.', 'Les frais.', '', 'Sur une voiture…', 'parfaite.', "Maintenant, avant d'acheter,", "je colle l'annonce dans utopicar.",
        'Deux secondes.', '38 sur 100.', 'NO GO.', '', "Il me l'aurait dit.", 'Et le prix à ne jamais dépasser…', '7 500 €.',
        'Une Clio,', '1 450 € sous la cote ?', 'Je suis le premier prévenu.', "Je sais ce qu'il me reste avant d'acheter.", 'Pas après.',
        'Commente DÉBUTANT ou PRO…', "je t'envoie le guide."]
ts = lambda t: f'{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{int(t % 60):02d},{int(round(t % 1 * 1000)) % 1000:03d}'
for h, hk in TL['hooks'].items():
    items = [(a, b, s) for (a, b), s in zip(hk['regions'], HOOKS[h])]
    items += [(hk['B0'] + a, hk['B0'] + b, s) for (a, b), s in zip(TL['body'], BODY) if s]
    # fusionne « ma pire » + « voiture. » (C) et garde chaque sous-titre au moins 0,8 s sans chevauchement
    out = []
    for a, b, s in items:
        if out and out[-1][2].endswith(('pire',)): out[-1] = (out[-1][0], b, out[-1][2] + ' ' + s); continue
        out.append((a, b, s))
    with open(os.path.join(ROOT, f'renders/9x16-mo3-{h}.srt'), 'w') as f:
        for i, (a, b, s) in enumerate(out):
            nxt = out[i + 1][0] if i + 1 < len(out) else b + 1
            f.write(f'{i + 1}\n{ts(a)} --> {ts(min(max(b + 0.25, a + 0.8), nxt - 0.02))}\n{s}\n\n')
    print(h, len(out), 'sous-titres')
