"""Sound design de MO4, refait de A à Z (méthode : .claude/skills/motion-studio/references/sound-design.md).
usage : python3 scripts/audio-mo4-sd.py → audio/mix-mo4.wav, audio/stems-mo4/*.wav, docs/mix_report-mo4.txt
         SANS_MUSIQUE=1 … → bruitages seuls

1. Musique (audio/bank/music-user.mp3, « Controlled Drop », 123 BPM) : analysée mesure par mesure sur tout le morceau.
   Retenu : 1:41 → 1:56, trois mesures qui montent puis une coupure de basse, puis le drop à 1:47.30. Ramenée à
   120 BPM, une mesure = 2 s = une mesure du montage : aucun collage, le drop tombe sur le pivot (6,0 s).
2. Repérage : chaque bruitage a un rôle (accent, interface, transition, ornement) et une priorité. Un seul son
   principal à la fois : un son moins prioritaire qui tombe à moins de 0,12 s d'un plus prioritaire est supprimé.
3. Préparation : chaque son est coupé à son attaque, raccourci à sa durée utile, fondu en sortie, filtré dans sa
   bande (les souffles ne prennent ni le grave des impacts ni l'aigu des clics), normalisé en crête selon son rôle.
4. Mix en bandes : la musique cède la place sans disparaître. Grave (< 180 Hz) baissé sous les impacts, médium
   (1,5–6 kHz) baissé sous les clics et les souffles, plus une courbe de mise en scène (étouffée en tension, vide
   juste avant le pivot, pleine sur l'élan, en retrait pendant la traînée, fondu de boucle).
5. Une réverbération courte commune met tous les bruitages dans la même pièce. Bus : compression douce,
   −14 LUFS intégrés, plafond −3,5 dBTP (l'AAC ajoute jusqu'à 2 dB)."""
import json, os
import numpy as np, soundfile as sf, librosa, pyloudnorm as pyln
from scipy.signal import resample_poly, butter, sosfilt, fftconvolve
from scipy.ndimage import minimum_filter1d, uniform_filter1d, maximum_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); B = os.path.join(ROOT, 'audio/bank')
TL = json.load(open(os.path.join(ROOT, 'timeline-mo4.json'))); E = TL['ev']; SR = 48000; DUR = TL['dur']; N = int(DUR * SR)
PIVOT = 6.0
bq = lambda kind, f, o=2: butter(o, f, kind, fs=SR, output='sos')
filt = lambda x, sos: sosfilt(sos, x, axis=0)
db = lambda v: 10 ** (v / 20)

# ---------------- 1. musique ----------------
SRC_BPM, DROP_SRC, LEAD_BARS = 123.05, 107.30, 3
y, _ = librosa.load(os.path.join(B, 'music-user.mp3'), sr=SR, mono=False)
mono = librosa.to_mono(y)
on = librosa.onset.onset_strength(y=mono, sr=SR, hop_length=256)
w = int(0.12 * SR) // 256; c = int(DROP_SRC * SR) // 256
drop = (c - w + int(np.argmax(on[c - w:c + w]))) * 256                     # attaque réelle du drop dans le morceau
rate = SRC_BPM / 120.0
a = drop - int((PIVOT + 0.6) * rate * SR); b = drop + int((DUR - PIVOT + 0.6) * rate * SR)
seg = np.vstack([librosa.effects.time_stretch(ch, rate=rate) for ch in y[:, a:b]]).T
d_new = int((drop - a) / rate)                                               # drop après étirement
m_on = librosa.onset.onset_strength(y=seg.mean(1), sr=SR, hop_length=128)
k = d_new // 128; d_new = (k - 20 + int(np.argmax(m_on[k - 20:k + 20]))) * 128
mus = seg[d_new - int(PIVOT * SR): d_new - int(PIVOT * SR) + N].copy()

# ---------------- 2. bibliothèque et préparation des sons ----------------
def load(i):
    x, _ = librosa.load(os.path.join(B, f'sfx-{i}.mp3'), sr=SR, mono=True); return x
ROLE = {  # crête visée (dBFS) et bande utile
    'accent': (-3, (40, 16000)), 'ui': (-9, (400, 14000)), 'chime': (-12, (500, 12000)),
    'whoosh': (-13, (250, 9000)), 'orn': (-16, (1500, 15000)), 'tick': (-22, (1500, 12000))}
def prep(i, role, length=None, semis=0, reverse=False, fade=0.06):
    x = load(i)
    if reverse: x = x[::-1]
    e = np.abs(x); s0 = int(np.argmax(e > e.max() * 0.06)); x = x[max(0, s0 - int(0.002 * SR)):]
    if semis: x = resample_poly(x, 1000, int(round(1000 * 2 ** (semis / 12))))
    if length: x = x[:int(length * SR)]
    n = min(len(x), int(fade * SR)); x[-n:] *= np.linspace(1, 0, n) ** 2
    x[:int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
    pk, (lo, hi) = ROLE[role]
    x = filt(filt(x, bq('high', lo)), bq('low', hi))
    return x / (np.abs(x).max() + 1e-9) * db(pk)
def peak_at(x):
    e = uniform_filter1d(np.abs(x), int(0.02 * SR)); return int(np.argmax(e)) / SR

# ---------------- 3. repérage : (temps, son, rôle, priorité, gain dB, pan, options) ----------------
# les souffles sont posés pour que leur pic tombe sur le pic de vitesse mesuré sur le rendu (scripts/ref-motion.py)
CUES = []
def cue(t, i, role, prio, g=0.0, pan=0.0, align='attack', **kw): CUES.append(dict(t=t, i=i, role=role, prio=prio, g=g, pan=pan, align=align, kw=kw))
cue(0.00, 2909, 'accent', 1, -4)                                     # le point éclate
cue(0.07, 1492, 'whoosh', 2, -2, align='peak', length=0.5)           # l'annonce jaillit
cue(E['hook'][3] + 0.03, 1109, 'tick', 3, 0, 0.15)                   # « piège ? »
cue(E['press'], 2577, 'ui', 2, -6, 0.25)                             # appui long
cue(2.08, 1490, 'whoosh', 2, -1, align='peak', length=0.45)          # l'annonce se replie dans le champ
cue(E['paste'], 1120, 'ui', 1, 0, 0.1)                               # collage
cue(E['enable'] + 0.02, 2573, 'ui', 3, -9, 0.1)                      # le bouton s'allume
cue(E['tap'], 2568, 'ui', 1, 0, 0.05)                                # « Analyser ce lien »
cue(3.52, 3120, 'whoosh', 2, -2, align='peak', length=0.5)           # le bouton s'ouvre en fiche
for j, t in enumerate(E['steps']):                                   # coches : la même note qui monte d'un ton
    cue(t + 0.02, 1107, 'chime', 2, -2, -0.2 + 0.13 * j, semis=[0, 2, 4, 7][j], length=0.45)
cue(PIVOT, 2901, 'accent', 1, 0)                                     # pivot : la fiche se révèle
cue(E['pill'], 2357, 'ui', 2, -5, 0.2)                               # « Bon prix »
cue(6.98, 914, 'chime', 2, -3, 0.0, length=0.6)                      # 8/10
for j, t in enumerate(E['rows']): cue(t + 0.02, 2356, 'tick', 3, 4, [-0.25, 0.25][j % 2])  # lignes
cue(9.57, 2608, 'whoosh', 2, -3, align='peak', length=0.55)          # plongée sur la dernière ligne
cue(E['pop'], 2919, 'accent', 1, -2)                                 # le prix sort de la carte
cue(E['collapse'] - 0.32, 1486, 'whoosh', 2, -5, reverse=True, length=0.34)   # aspiré dans le point
cue(E['trail'], 2350, 'orn', 2, -5, length=0.85)                      # la traînée dessine
cue(E['fill'], 2909, 'accent', 1, -7)                                # le symbole se remplit
cue(E['button'] + 0.02, 2356, 'tick', 3, 2, 0.0)                     # le bouton apparaît
cue(E['tapEnd'], 2568, 'ui', 1, 0, 0.05)                             # « Estimer une affaire »
cue(14.57, 1490, 'whoosh', 2, -3, align='peak', reverse=True, length=0.45)  # tout rentre dans le point

# un seul son principal à la fois
CUES.sort(key=lambda c: c['t'])
keep = [c for c in CUES if not any(o is not c and o['prio'] < c['prio'] and abs(o['t'] - c['t']) < 0.12 for o in CUES)]
dropped = [c for c in CUES if c not in keep]

# ---------------- 4. placement, réverbération commune ----------------
sfx = np.zeros((N, 2)); env_imp = np.zeros(N); env_mid = np.zeros(N)
for c in keep:
    x = prep(c['i'], c['role'], **c['kw']) * db(c['g'])
    t0 = c['t'] - (peak_at(x) if c['align'] == 'peak' else 0)
    i0 = int(round(t0 * SR));
    if i0 < 0: x = x[-i0:]; i0 = 0
    x = x[:max(0, N - i0)]
    l, r = np.sqrt((1 - c['pan']) / 2) * np.sqrt(2), np.sqrt((1 + c['pan']) / 2) * np.sqrt(2)
    sfx[i0:i0 + len(x), 0] += x * l; sfx[i0:i0 + len(x), 1] += x * r
    e = np.abs(x); (env_imp if c['role'] == 'accent' else env_mid)[i0:i0 + len(x)] += e
rng = np.random.default_rng(4)
ir_t = np.arange(int(0.45 * SR)) / SR
ir = rng.standard_normal((len(ir_t), 2)) * np.exp(-ir_t / 0.11)[:, None]; ir[:int(0.012 * SR)] = 0
ir = filt(filt(ir, bq('high', 400)), bq('low', 7000)); ir /= np.sqrt((ir ** 2).sum(0))
wet = np.stack([fftconvolve(sfx[:, k], ir[:, k])[:N] for k in range(2)], 1)
sfx = sfx + wet * db(-15)

# ---------------- 5. musique : mise en scène et ducking par bandes ----------------
def curve(keys): t = np.arange(N) / SR; ts, vs = zip(*keys); return np.interp(t, ts, vs)
def follow(e, att, rel):
    out = np.empty(N); y_ = 0.0; ka, kr = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR))
    for i, v in enumerate(e): k_ = ka if v > y_ else kr; y_ = k_ * y_ + (1 - k_) * v; out[i] = y_
    return out
lo = filt(mus, bq('low', 180, 4)); hi_ = filt(mus, bq('high', 6000, 4)); mid = mus - lo - hi_
pres = filt(mid, bq('band', (1500, 6000), 2))                          # la zone des clics, des coches et des souffles
step = 240
ei = follow(np.repeat(maximum_filter1d(env_imp, step)[::step], step)[:N], 0.004, 0.25)
em = follow(np.repeat(maximum_filter1d(env_mid, step)[::step], step)[:N], 0.004, 0.16)
ei /= ei.max() + 1e-9; em /= em.max() + 1e-9
g_lo = db(-9 * np.clip(ei * 1.5, 0, 1)); g_pres = db(-7 * np.clip(em * 1.8, 0, 1))
music = lo * g_lo[:, None] + (mid - pres) + pres * g_pres[:, None] + hi_
P = PIVOT
scene = curve([(0, -8), (1.9, -7), (3.4, -6), (5.5, -4), (5.84, -3), (5.86, -30), (5.99, -30), (P, 0), (9.3, -1),
               (9.9, -4), (10.0, 0), (10.9, -1), (11.1, -9), (11.9, -8), (11.98, -1), (14.3, -2), (14.98, -40), (15, -60)])
dark = curve([(0, 2200), (3.5, 3500), (5.5, 9000), (5.86, 18000), (P, 19000), (10.9, 19000), (11.1, 1600), (11.9, 4000), (11.98, 19000), (14.2, 19000), (15, 2000)])
out = np.zeros_like(music); zi = None
for i in range(0, N, 512):
    sos = bq('low', float(min(dark[i], 19000)))
    if zi is None: zi = np.zeros((sos.shape[0], 2, 2))
    out[i:i + 512], zi = sosfilt(sos, music[i:i + 512], axis=0, zi=zi)
music = out * db(scene)[:, None]
if os.environ.get('SANS_MUSIQUE'): music *= 0

# ---------------- 6. bus et master ----------------
mix = music * db(-4) + sfx
mix = filt(mix, bq('high', 60, 4))
lvl = follow(np.abs(mix).max(1), 0.01, 0.2); thr = np.percentile(lvl, 80)
gr = np.where(lvl > thr, (thr / (lvl + 1e-9)) ** (1 - 1 / 1.8), 1.0); mix *= gr[:, None]   # compression 1,8:1 douce
meter = pyln.Meter(SR); tp = lambda x: 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max() + 1e-12); Lw = int(0.005 * SR)
for _ in range(12):
    mix *= db(-14 - meter.integrated_loudness(mix))
    if tp(mix) <= -3.5: break
    pk = np.abs(mix).max(1); g2 = np.minimum(1, db(-4.2) / np.maximum(pk, 1e-9))
    mix *= uniform_filter1d(minimum_filter1d(g2, Lw * 2 + 1), Lw)[:, None]
sf.write(os.path.join(ROOT, 'audio/mix-mo4.wav'), mix, SR, subtype='PCM_24')
os.makedirs(os.path.join(ROOT, 'audio/stems-mo4'), exist_ok=True)
sf.write(os.path.join(ROOT, 'audio/stems-mo4/musique.wav'), music * db(-4), SR, subtype='PCM_24')
sf.write(os.path.join(ROOT, 'audio/stems-mo4/bruitages.wav'), sfx, SR, subtype='PCM_24')
L = lambda a_, b_: 20 * np.log10(np.sqrt((mix[int(a_ * SR):int(b_ * SR)] ** 2).mean()) + 1e-12)
rep = (f'MO4 sound design : {meter.integrated_loudness(mix):.1f} LUFS · true peak {tp(mix):.1f} dBTP\n'
       f'musique : Controlled Drop, {SRC_BPM} → 120 BPM, extrait {a / SR / 1:.2f}–{b / SR:.2f} s du morceau, drop à {DROP_SRC} s posé sur {PIVOT} s\n'
       f'niveaux RMS : tension {L(0.3, 5.8):.1f} dB · vide {L(5.87, 5.98):.1f} · élan {L(6.1, 9.3):.1f} · prix {L(10, 10.9):.1f} · traînée {L(11.1, 11.9):.1f} · fin {L(12, 14.4):.1f}\n'
       f'{len(keep)} bruitages placés, {len(dropped)} écartés (collision avec un son prioritaire) : ' + ', '.join(f"{c['i']}@{c['t']:.2f}" for c in dropped) + '\n')
open(os.path.join(ROOT, 'docs/mix_report-mo4.txt'), 'w').write(rep); print(rep, end='')
