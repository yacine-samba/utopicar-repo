import os, json, io
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))   # depuis video/

# ---------- réglages musicaux et durées (lus par le film et par scripts/audio-c7.py) ----------
# stop : arrêt de bande ; muf : retour étouffé de la musique avant le drop ; pivot : drop (mesure 16) ; hit : coup final (mesure 24)
MU = {
    'dico2': {'stop': 10.92, 'muf': 12.62, 'pivot': 14.48, 'hit': 18.40, 'dur': 20.0},
    'A01':   {'stop': 14.42, 'muf': None, 'pivot': 16.50, 'hit': 18.14, 'dur': 20.0},
    'A02':   {'stop': 12.30, 'muf': None, 'pivot': 12.96, 'hit': 16.38, 'dur': 18.4},
    'A03':   {'stop': 10.35, 'muf': 12.20, 'pivot': 14.24, 'hit': None, 'dur': 17.0},
    'A04':   {'stop': 11.30, 'muf': None, 'pivot': 11.86, 'hit': 14.76, 'dur': 17.2},
    'A05':   {'stop': 8.40, 'muf': None, 'pivot': 11.16, 'hit': 15.22, 'dur': 19.4},
    'A06':   {'stop': 9.50, 'muf': None, 'pivot': 11.54, 'hit': 13.80, 'dur': 16.1},
    'A07':   {'stop': 9.60, 'muf': None, 'pivot': 10.00, 'hit': 16.82, 'dur': 18.8},
    'PS1':   {'stop': 7.95, 'muf': 10.05, 'pivot': 13.40, 'hit': 15.85, 'dur': 19.4},
    'PS2':   {'stop': 8.22, 'muf': 11.45, 'pivot': 15.08, 'hit': 19.34, 'dur': 26.0, 'rew': [10.3, 11.42, 0.55]},
    'FI1':   {'stop': 2.5, 'muf': None, 'pivot': 3.84, 'hit': 6.78, 'dur': 7.9},
    'FI2':   {'stop': 4.0, 'muf': None, 'pivot': 4.32, 'hit': 6.54, 'dur': 7.8},
    'FI3':   {'stop': 2.42, 'muf': None, 'pivot': 4.56, 'hit': 6.94, 'dur': 7.95},
    'BO1':   {'stop': 3.1, 'muf': None, 'pivot': 4.74, 'hit': 11.35, 'dur': 15.6},
    'BO2':   {'stop': 1.45, 'muf': None, 'pivot': 1.95, 'hit': 4.3, 'dur': 5.6},
    'BO3':   {'stop': 1.45, 'muf': None, 'pivot': 1.95, 'hit': 4.3, 'dur': 5.6},
}

# vidéos des semaines du 12 et du 19 oct. : repères calculés sur les mots de Simon (arrêt avant « tu colles », drop sur le clic
# « Utopicar », coup final sur le chiffre ou le verdict), durée = dernier mot + carton
import unicodedata, re
def _n(w): return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', w.lower()).encode('ascii', 'ignore').decode())
def _T(W, keys, after=0.0):
    for w in W:
        if w['s'] >= after - 0.01 and any(_n(w['w']).startswith(k) for k in keys): return w['s']
    raise SystemExit(f'mot absent {keys} après {after}')
HITW = {'S1V2': ('3100', 0), 'S1V3': ('3750', 0), 'S1V4': ('4150', 0), 'S1V5': ('passe', 8), 'S1V6': ('payer', 0), 'S1V7': ('3250', 8), 'S2V1': ('passe', 9),
        'S2V2': ('prend', 0), 'S2V4': ('4100', 0), 'S2V5': ('000', 11), 'S2V6': ('fonce', 0), 'S2V7': ('classique', 0)}
for _id in ['S1V1', 'S1V2', 'S1V3', 'S1V4', 'S1V5', 'S1V6', 'S1V7', 'S2V1', 'S2V2', 'S2V3', 'S2V4', 'S2V5', 'S2V6', 'S2V7']:
    W = json.load(open(f'audio/vo-c7/{_id}.words.json', encoding='utf8'))
    end = max(w['e'] for w in W)
    if _id == 'S1V1': st, pv, ht = _T(W, ['numero'], 10) - 0.45, _T(W, ['2048'], 13), _T(W, ['utopicar'], 15) + 0.1
    elif _id == 'S2V3': st, pv, ht = _T(W, ['non']) - 0.1, _T(W, ['1448']), _T(W, ['utopicar'], 10) + 0.1
    else:
        g = 10 if _id == 'S2V3' else 0
        st, pv = _T(W, ['coll']) - 0.5, _T(W, ['utopicar']) + 0.1
        k, a = HITW[_id]; ht = _T(W, [k], a) + 0.3
    MU[_id] = {'stop': round(st, 2), 'muf': None, 'pivot': round(pv, 2), 'hit': round(ht, 2), 'dur': round(end + 1.25, 2)}
    json.dump(MU, open('audio/c7-musique.json', 'w', encoding='utf8'), indent=1)
# présentation en 5 vidéos (oct. 2026) : arrêt avant « tu colles » (ou la chute), drop sur « Utopicar » (P4 : « Trois annonces »),
# coup final sur le chiffre ou la dernière phrase ; carton muet de 2,4 s (logo, « lien en bio »)
PREZ = {'P1': (['coll'], 0, ['utopic'], 0, ['300'], 14, 0.3), 'P2': (['coll'], 0, ['utopic'], 0, ['5900'], 0, 0.3),
        'P3': (['coll'], 0, ['utopic'], 0, ['minute'], 0, 0.2), 'P4': (['un'], 8, ['trois'], 9, ['appeler'], 0, 0.2),
        'P5': (['mets'], 0, ['utopic'], 0, ['g'], 8, 0.3)}
for _id, (ks, ka, kp, kpa, kh, kha, dh) in PREZ.items():
    W = json.load(open(f'audio/vo-c7/{_id}.words.json', encoding='utf8')); end = max(w['e'] for w in W)
    pv = _T(W, kp, kpa) + (0.0 if _id == 'P4' else 0.1)
    MU[_id] = {'stop': round(_T(W, ks, ka) - 0.45, 2), 'muf': None, 'pivot': round(pv, 2), 'hit': round(_T(W, kh, kha) + dh, 2), 'dur': round(end + 2.4, 2)}
json.dump(MU, open('audio/c7-musique.json', 'w', encoding='utf8'), indent=1)
POSTER = {'dico2': 1.9, 'A01': 1.6, 'A02': 3.2, 'A03': 1.9, 'A04': 2.1, 'A05': 2.2, 'A06': 2.1, 'A07': 2.0, 'PS1': 3.4, 'PS2': 8.8, 'FI1': 0.0, 'FI2': 0.0, 'FI3': 0.0, 'BO1': 0.9, 'BO2': 2.2, 'BO3': 2.2}
for _id in [k for k in MU if k.startswith('S') or k in PREZ]: POSTER[_id] = 0.9
json.dump({'version': 1, 'style': 'Motions de 15 à 20 s (dictionnaire du vendeur, carrousels A01 à A07) dans la grammaire master60w ; HOOK = id de la vidéo',
           'fps': 30, 'bpm': 112, 'size': [1080, 1920], 'dur': 20.0,
           'hooks': {k: {'dur': v['dur'], 'poster': POSTER[k]} for k, v in MU.items()}},
          open('timeline-c7.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)

# ---------- film ----------
e = io.open('film-dico/_engine.js', encoding='utf8').read()
cut = e.index('  // ---------- scènes : un écran plein chacune')
e = e[:cut]
def rep(a, b):
    global e
    assert a in e, a[:60]; e = e.replace(a, b)
rep("  const WD = await J('../audio/vo-dico/prise-1.words.json');   // mots horodatés de la prise 1 de Simon (scripts/vo-dico-mots.py)\n",
    "  const ID = new URLSearchParams(location.search).get('hook') || 'dico2';\n"
    "  const WD = await J('../audio/vo-c7/' + ID + '.words.json');   // voix posée de Simon (scripts/vo-c7-pose.py)\n"
    "  const MU = (await J('../audio/c7-musique.json'))[ID];          // repères musicaux, communs avec scripts/audio-c7.py\n")
rep("  const DUR = 33.0;", "  const DUR = MU.dur;")
i = e.index("  // musique de master60 (scripts/audio-dico.py)"); j = e.index("  // interpolation exponentielle")
e = e[:i] + """  // musique de master60 (scripts/audio-c7.py) : mesure 4 sur l'image 0, arrêt de bande (stop), drop (pivot), coup final (hit)
  const BEAT = 60 / 112;
  const pulse = (t) => { let x; if (t >= 0 && t < MU.stop) x = t / BEAT; else if (t >= MU.pivot && (MU.hit == null || t < MU.hit)) x = (t - MU.pivot) / BEAT; else if (MU.hit != null && t >= MU.hit) x = (t - MU.hit) / BEAT; else return 0; const n = Math.floor(x); return Math.exp(-((x - n) * BEAT) / 0.11) * (n % 4 === 0 ? 1 : 0.55); };
""" + e[j:]
rep("  let FID = 0; const K = 0.0065;", "  let FID = 0; const K = 0.0065; let KF = 1;   // KF : flou CSS réduit pendant les transitions (vrai flou de bougé au rendu)")
rep("    bx = Math.min(40, bx + b0); by = Math.min(40, by + b0);", "    bx = Math.min(40, (bx + b0) * KF); by = Math.min(40, (by + b0) * KF);")
hdr = """// Motions de 15 à 20 s dans la grammaire du film « wow » (master60w), un seul film pour 8 vidéos (?hook=<id>) :
// dico2 (Le dictionnaire du vendeur, version courte) et A01 à A07 (les carrousels de la semaine A, en motion).
// Moteur repris de film-master60w (texte cinétique, rouleaux, curseur, logo animé, flou directionnel) ; transitions
// nouvelles : portail par une lettre ou un chiffre, glissé de carrousel, zoom arrière, avec un vrai flou de bougé au rendu.
// Contrat : window.seek(t) peint la frame t, sans état entre les frames.
"""
core = io.open('film-c7/_core.js', encoding='utf8').read(); specs = io.open('film-c7/_specs.js', encoding='utf8').read()
io.open('film-c7/film.js', 'w', encoding='utf8').write(hdr + e + core + specs)

h = io.open('film-dico/index.html', encoding='utf8').read()
h = h.replace('<title>Le dictionnaire du vendeur · 9:16</title>', '<title>Motions 15-20 s · 9:16</title>')
h = h.replace('#stage{position:absolute;inset:0;overflow:hidden}', '#stage{position:absolute;inset:0;overflow:hidden;background:#141110}')
extra = """
/* composants des motions (carrousels animés) */
.tkt{border-radius:44px;background:#fff;padding:30px 44px 36px;box-shadow:0 60px 110px -30px rgba(28,22,18,.45),0 0 0 1px rgba(28,22,18,.06)}
.tkt .tr{display:flex;justify-content:space-between;align-items:baseline;gap:30px;font:500 36px Satoshi;color:rgba(28,22,18,.72);padding:16px 0;border-bottom:2px dashed rgba(28,22,18,.13);white-space:nowrap}
.tkt .tr b{font:600 44px Clash;color:var(--ink);letter-spacing:-.01em}
.tkt .tt{display:flex;justify-content:space-between;align-items:baseline;margin-top:18px;font:700 38px Satoshi;white-space:nowrap;transform-origin:100% 50%}
.tkt .tt b{font:600 104px/1 Clash;letter-spacing:-.03em}
.tkt .tt.r b{color:var(--r)}.tkt .tt.g b{color:var(--ok)}.tkt .tt.o b{color:var(--o)}
.bub2{max-width:760px;padding:26px 34px;border-radius:36px;font:600 40px/1.28 Satoshi;box-shadow:0 26px 50px -20px rgba(0,0,0,.4)}
.bub2.th{background:#fff;color:var(--ink);border-bottom-left-radius:10px}
.bub2.me{background:var(--o);color:#1a1310;border-bottom-right-radius:10px}
.bub2 small{display:block;font:500 24px Satoshi;opacity:.6;margin-top:8px}
.stamp2{font:700 120px/1 Clash;border:12px solid;border-radius:26px;padding:10px 34px;white-space:nowrap;letter-spacing:-.03em;background:rgba(255,255,255,.04)}
.notif2{width:780px;padding:34px 40px 40px;border-radius:40px;background:#fff;box-shadow:0 60px 110px -30px rgba(28,22,18,.45),0 0 0 1px rgba(28,22,18,.06);font:500 40px/1.38 Satoshi;color:var(--ink)}
.notif2 .h{display:flex;gap:18px;align-items:center;font:700 28px Satoshi;opacity:.6;margin-bottom:16px}
.notif2 .ic{display:inline-block;width:52px;height:52px;border-radius:14px;background:#3ccf7a}
.notif2 u{color:var(--o);text-decoration-thickness:4px;text-underline-offset:6px;font-weight:700}
.card2{border-radius:40px;background:#fff;padding:32px 40px;box-shadow:0 50px 100px -30px rgba(28,22,18,.4),0 0 0 1px rgba(28,22,18,.06)}
"""
h = h.replace('</style>', extra + '</style>')
io.open('film-c7/index.html', 'w', encoding='utf8').write(h)
print('ok', len(hdr + e + core + specs))
