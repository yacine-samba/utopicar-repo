"""Analyse d'une vidéo de référence à l'image près (grammaire seulement : on n'en reprend jamais le contenu).

usage : python3 scripts/ref-frames.py refs/<ref>/<video>.mp4 [--step 0.1] [--lang auto|fr|en] [--no-voice]
Sorties dans refs/<ref>/analysis/ (dossier ignoré par git) :
  frames.csv          une ligne par image native (60 i/s → 1/60 s) : luminance, écart à l'image précédente,
                      distance d'histogramme, déplacement global (dx, dy en px de la source), coupe oui/non
  shots.md            scènes (coupes + enchaînements sans coupe : flou, zoom, traversée) puis table des plans à l'image près : début/fin (image et s), durée, transition (franche, flash,
                      fondu, glissé), mouvement de caméra, couleur dominante, mots dits pendant le plan, bruitages
  sheets/sheet_XX.jpg planches toutes les --step s (0,1 s par défaut) : 10 vignettes par ligne = 1 s par ligne
  cuts/cut_XXX.jpg    chaque coupe image par image (−4 … +4 images natives), pour étudier la transition
  audio.md            débit et pauses de la voix, hauteur (ton, amplitude en demi-tons) par phrase, bruitages
                      détectés (attaques classées grave / médium / aigu / souffle), tempo et temps forts, loudness
  words.json          mots horodatés (faster-whisper) avec hauteur moyenne et énergie de chaque mot
  report.md           synthèse : rythme de montage, hooks (0–3 s), densité d'événements par seconde"""
import sys, os, json, subprocess, argparse, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('--step', type=float, default=0.1); ap.add_argument('--no-voice', action='store_true')
ap.add_argument('--lang', default='auto', help="langue de la voix (fr, en…) ; auto = détectée (une langue forcée à tort donne une traduction)")
A = ap.parse_args()
SRC = os.path.abspath(A.src); OUT = os.path.join(os.path.dirname(SRC), 'analysis')
for d in ('', 'sheets', 'cuts'): os.makedirs(os.path.join(OUT, d), exist_ok=True)
P = lambda *p: os.path.join(OUT, *p)
try: FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
except Exception: FONT = None

probe = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', SRC], capture_output=True, text=True).stdout)
vs = next(s for s in probe['streams'] if s['codec_type'] == 'video')
W, H = int(vs['width']), int(vs['height']); num, den = map(int, vs['r_frame_rate'].split('/')); FPS = num / den
DUR = float(probe['format']['duration'])
print(f'{os.path.basename(SRC)} : {W}x{H}, {FPS:g} i/s, {DUR:.2f} s')

# ---------- 1. toutes les images natives, en petit (gris 192×108 + couleur 48×27) ----------
def frames(w, h, pix):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', SRC, '-vf', f'scale={w}:{h}:flags=area', '-f', 'rawvideo', '-pix_fmt', pix, '-'], stdout=subprocess.PIPE)
    n = w * h * (3 if pix == 'rgb24' else 1); out = []
    while True:
        b = p.stdout.read(n)
        if len(b) < n: break
        out.append(np.frombuffer(b, np.uint8).reshape(h, w, -1).squeeze())
    return np.array(out)
G = frames(192, 108, 'gray').astype(np.float32); C = frames(48, 27, 'rgb24').astype(np.float32)
N = len(G); T = np.arange(N) / FPS
print(f'{N} images analysées')

lum = G.mean((1, 2))
diff = np.r_[0, np.abs(np.diff(G, axis=0)).mean((1, 2))]
def hist(g): h = np.histogram(g, 32, (0, 256))[0].astype(np.float32); return h / h.sum()
Hs = np.array([hist(g) for g in G])
hd = np.r_[0, 0.5 * (np.abs(np.diff(Hs, axis=0))).sum(1)]          # distance de variation totale, 0..1
# déplacement global par corrélation de phase (caméra / glissés)
win = np.outer(np.hanning(108), np.hanning(192)).astype(np.float32)
F = np.fft.rfft2((G - G.mean((1, 2), keepdims=True)) * win)
dx = np.zeros(N); dy = np.zeros(N); conf = np.zeros(N)
for i in range(1, N):
    R = F[i] * np.conj(F[i - 1]); R /= np.abs(R) + 1e-6
    r = np.fft.irfft2(R, s=(108, 192)); k = np.unravel_index(np.argmax(r), r.shape)
    y, x = k; y = y - 108 if y > 54 else y; x = x - 192 if x > 96 else x
    dx[i], dy[i], conf[i] = x * W / 192, y * H / 108, r.max()

# ---------- 2. coupes et transitions à l'image près ----------
med = np.array([np.median(hd[max(0, i - 15):i + 16]) for i in range(N)])
cand = [i for i in range(1, N) if hd[i] > max(0.18, 4 * med[i]) and hd[i] >= hd[max(0, i - 2):i + 3].max()]
cuts = []
for i in cand:
    if cuts and i - cuts[-1] < 3: continue
    cuts.append(i)
def kind(i):
    a = max(0, i - 6); b = min(N, i + 7); seq = hd[a:b]
    jump = lum[min(N - 1, i + 1)] - lum[i - 1]
    if lum[i] > max(lum[i - 1], lum[min(N - 1, i + 1)]) + 25: return 'flash'
    if (seq > 0.08).sum() >= 5: return 'transition sur %d images' % (seq > 0.08).sum()
    if abs(dx[i]) + abs(dy[i]) > 0.15 * W and conf[i] > 0.1: return 'glissé'
    return 'franche'
shots = [0] + cuts + [N]
# changements de scène SANS coupe (flou, zoom, traversée, volet) : corrélation des images très réduites (27×48)
# entre i − K et i + K (K ≈ 0,15 s). Le motion design enchaîne souvent tout un film sans une seule coupe franche.
S = G.reshape(N, 27, 4, 48, 4).mean((2, 4)).reshape(N, -1); S = S - S.mean(1, keepdims=True)
S /= np.linalg.norm(S, axis=1, keepdims=True) + 1e-6
K = max(2, int(round(0.15 * FPS))); dsc = np.zeros(N)
for i in range(K, N - K): dsc[i] = 1 - (S[i + K] * S[i - K]).sum()
thr = max(0.35, 3 * np.median(dsc)); half = int(0.5 * FPS)
scenes = [i for i in range(K, N - K) if dsc[i] > thr and dsc[i] == dsc[max(0, i - half):i + half + 1].max()]
scenes = sorted(set(scenes) | set(cuts))

# ---------- 3. voix : mots horodatés, hauteur, énergie ----------
import librosa
wav = P('audio.wav'); subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SRC, '-ac', '1', '-ar', '22050', wav], check=True)
y, sr = librosa.load(wav, sr=22050)
words = []; LANG = '—'
if not A.no_voice:
    from faster_whisper import WhisperModel
    m = WhisperModel('small', device='cpu', compute_type='int8')
    segs, info = m.transcribe(wav, language=None if A.lang == 'auto' else A.lang, word_timestamps=True, vad_filter=True)
    LANG = f'{info.language} ({info.language_probability:.0%})'; print('langue de la voix :', LANG)
    for s in segs:
        for w in s.words: words.append({'w': w.word.strip(), 't0': round(w.start, 3), 't1': round(w.end, 3)})
# hauteur sur la part harmonique filtrée 80–1000 Hz (la musique et les bruitages faussent pyin), images voisées sûres seulement
import scipy.signal as ss
yv = ss.sosfiltfilt(ss.butter(4, [80, 1000], 'band', fs=sr, output='sos'), librosa.effects.harmonic(y))
f0, vflag, vprob = librosa.pyin(yv, fmin=75, fmax=350, sr=sr, frame_length=1024, hop_length=256)
f0[vprob < 0.2] = np.nan
tf0 = librosa.times_like(f0, sr=sr, hop_length=256)
rms = librosa.feature.rms(y=y, frame_length=1024, hop_length=256)[0]
for w in words:
    sel = (tf0 >= w['t0']) & (tf0 <= w['t1'])
    v = f0[sel & ~np.isnan(f0)]
    w['hz'] = round(float(np.median(v)), 1) if len(v) else None
    w['db'] = round(float(20 * np.log10(rms[sel].mean() + 1e-9)), 1) if sel.any() else None
json.dump(words, open(P('words.json'), 'w'), ensure_ascii=False, indent=0)

# ---------- 4. bruitages (attaques) et musique ----------
yh, yp = librosa.effects.hpss(y)
on = librosa.onset.onset_detect(y=yp, sr=sr, hop_length=128, units='time', backtrack=False, delta=0.12)
env = librosa.onset.onset_strength(y=yp, sr=sr, hop_length=128); tenv = librosa.times_like(env, sr=sr, hop_length=128)
def sfx_class(t):
    a = int(t * sr); seg = y[a:a + int(0.25 * sr)]
    if len(seg) < 512: return 'court', 0
    S = np.abs(np.fft.rfft(seg * np.hanning(len(seg)))); fr = np.fft.rfftfreq(len(seg), 1 / sr)
    cen = float((S * fr).sum() / (S.sum() + 1e-9)); flat = float(np.exp(np.log(S + 1e-9).mean()) / (S.mean() + 1e-9))
    lab = 'souffle / whoosh' if flat > 0.25 and cen > 2000 else 'grave (impact, boum)' if cen < 400 else 'aigu (clic, tic, cristal)' if cen > 3000 else 'médium (pop, frappe)'
    return lab, cen
in_word = lambda t: any(w['t0'] - 0.03 <= t <= w['t1'] + 0.03 for w in words)
sfx = []
for t in on:
    k = int(np.argmin(np.abs(tenv - t))); lab, cen = sfx_class(t)
    sfx.append({'t': round(float(t), 3), 'force': round(float(env[k]), 2), 'type': lab, 'centroide': round(cen), 'pendant_la_voix': in_word(t)})
tempo, beats = librosa.beat.beat_track(y=yh + yp, sr=sr, units='time')
tempo = float(np.atleast_1d(tempo)[0])
import pyloudnorm as pyln
y48, _ = librosa.load(SRC, sr=48000, mono=False)
meter = pyln.Meter(48000); lufs = meter.integrated_loudness(y48.T if y48.ndim > 1 else y48)

# ---------- 5. planches toutes les --step s, et chaque coupe image par image ----------
def grab(t, w):
    i = min(N - 1, max(0, int(round(t * FPS))))
    p = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{i / FPS:.4f}', '-i', SRC, '-frames:v', '1', '-vf', f'scale={w}:-2', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True)
    import io; return Image.open(io.BytesIO(p.stdout)).convert('RGB')
# planches : extraction d'un coup à la cadence voulue (plus rapide que ffmpeg par vignette)
tw = 192; th = int(tw * H / W); per_row = int(round(1 / A.step)) if A.step <= 0.5 else 10; rows_per = 10
tmp = P('sheets', '_t'); os.makedirs(tmp, exist_ok=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SRC, '-vf', f'fps={1 / A.step},scale={tw}:{th}', '-q:v', '3', os.path.join(tmp, '%05d.jpg')], check=True)
thumbs = sorted(os.listdir(tmp)); per_sheet = per_row * rows_per
for s0 in range(0, len(thumbs), per_sheet):
    chunk = thumbs[s0:s0 + per_sheet]; rows = (len(chunk) + per_row - 1) // per_row
    S = Image.new('RGB', (per_row * (tw + 4) + 4, rows * (th + 20) + 4), '#15181f'); d = ImageDraw.Draw(S)
    for j, f in enumerate(chunk):
        t = (s0 + j) * A.step; x = 4 + (j % per_row) * (tw + 4); yy = 4 + (j // per_row) * (th + 20)
        S.paste(Image.open(os.path.join(tmp, f)), (x, yy + 18))
        cut_here = any(abs(c / FPS - t) < A.step / 2 for c in cuts)
        d.text((x, yy + 1), f'{t:.1f}s' + ('  ✂' if cut_here else ''), fill='#FF6A3D' if cut_here else '#E8D58A', font=FONT)
    S.save(P('sheets', f'sheet_{s0 // per_sheet + 1:02d}.jpg'), quality=88)
for f in thumbs: os.remove(os.path.join(tmp, f))
os.rmdir(tmp)
cw = 240; ch = int(cw * H / W)
for k, c in enumerate(cuts):
    S = Image.new('RGB', (9 * (cw + 4) + 4, ch + 26), '#15181f'); d = ImageDraw.Draw(S)
    for j, o in enumerate(range(-4, 5)):
        i = min(N - 1, max(0, c + o)); x = 4 + j * (cw + 4)
        S.paste(grab(i / FPS, cw), (x, 22)); d.text((x, 3), f'{i} ({i / FPS:.3f}s){"  ←" if o == 0 else ""}', fill='#FF6A3D' if o == 0 else '#E8D58A', font=FONT)
    S.save(P('cuts', f'cut_{k + 1:03d}.jpg'), quality=85)

# ---------- 6. tables ----------
with open(P('frames.csv'), 'w') as f:
    f.write('image,t,lum,ecart,hist,dx,dy,coupe\n')
    cs = set(cuts)
    for i in range(N): f.write(f'{i},{T[i]:.4f},{lum[i]:.1f},{diff[i]:.2f},{hd[i]:.3f},{dx[i]:.0f},{dy[i]:.0f},{int(i in cs)}\n')
def hexcol(a, b):
    c = C[a:b].reshape(-1, 3).mean(0); return '#%02X%02X%02X' % tuple(c.round().astype(int))
def cam(a, b):
    if b - a < 3: return '—'
    mx, my = dx[a + 1:b].mean() * FPS, dy[a + 1:b].mean() * FPS; act = diff[a + 1:b].mean()
    parts = []
    if abs(mx) > 40: parts.append(('panoramique →' if mx < 0 else 'panoramique ←') + f' {abs(mx):.0f} px/s')
    if abs(my) > 40: parts.append(('monte' if my < 0 else 'descend') + f' {abs(my):.0f} px/s')
    if not parts: parts.append('fixe' if act < 1.2 else 'animation dans le cadre')
    return ', '.join(parts) + f' (activité {act:.1f})'
with open(P('shots.md'), 'w') as f:
    f.write(f'# Plans — {os.path.basename(SRC)} ({FPS:g} i/s, {N} images, {DUR:.2f} s)\n\n')
    durs = np.diff(shots) / FPS
    f.write(f'{len(shots) - 1} plans · durée médiane {np.median(durs):.2f} s · plus court {durs.min():.2f} s · plus long {durs.max():.2f} s\n\n')
    sc = [0] + scenes + [N]; sd = np.diff(sc) / FPS
    f.write(f'{len(sc) - 1} scènes (coupes + enchaînements sans coupe) · durée médiane {np.median(sd):.2f} s · moyenne {sd.mean():.2f} s\n\n')
    f.write('## Scènes\n\n| # | début (s) | durée | coupe ? | voix pendant la scène |\n|---|---|---|---|---|\n')
    for k in range(len(sc) - 1):
        t0, t1 = sc[k] / FPS, sc[k + 1] / FPS
        f.write(f"| {k + 1} | {t0:.2f} | {t1 - t0:.2f} s | {'✂' if sc[k] in cuts else ('ouverture' if not sc[k] else 'enchaîné')} | {' '.join(w['w'] for w in words if t0 <= (w['t0'] + w['t1']) / 2 < t1)} |\n")
    f.write('\n## Plans (coupes franches)\n\n')
    f.write('| # | images | début → fin (s) | durée | entrée | caméra / mouvement | couleur | voix pendant le plan | bruitages |\n|---|---|---|---|---|---|---|---|---|\n')
    for k in range(len(shots) - 1):
        a, b = shots[k], shots[k + 1]; t0, t1 = a / FPS, b / FPS
        wd = ' '.join(w['w'] for w in words if t0 <= (w['t0'] + w['t1']) / 2 < t1)
        sf = ', '.join(f"{s['t']:.2f} {s['type'].split(' ')[0]}" for s in sfx if t0 <= s['t'] < t1 and not s['pendant_la_voix'] and s['force'] > 2)
        f.write(f"| {k + 1} | {a}–{b - 1} | {t0:.3f} → {t1:.3f} | {t1 - t0:.2f} s | {kind(a) if a else 'ouverture'} | {cam(a, b)} | {hexcol(a, b)} | {wd} | {sf} |\n")
# voix : phrases = groupes de mots séparés par une pause > 0,3 s
phr = []; cur = []
for w in words:
    if cur and w['t0'] - cur[-1]['t1'] > 0.3: phr.append(cur); cur = []
    cur.append(w)
if cur: phr.append(cur)
st = lambda hz: 12 * math.log2(hz / 100)
with open(P('audio.md'), 'w') as f:
    f.write(f'# Audio — {os.path.basename(SRC)}\n\nLangue détectée : {LANG} · loudness intégrée : {lufs:.1f} LUFS · tempo musique ≈ {tempo:.0f} BPM ({len(beats)} temps)\n\n')
    if words:
        spoken = sum(w['t1'] - w['t0'] for w in words); span = words[-1]['t1'] - words[0]['t0']
        pauses = [(phr[i][-1]['t1'], phr[i + 1][0]['t0']) for i in range(len(phr) - 1)]
        f.write(f'## Voix\n\n{len(words)} mots en {span:.1f} s → {len(words) / span:.2f} mots/s (parole pure {len(words) / spoken:.2f} mots/s) · '
                f'{len(pauses)} pauses > 0,3 s (médiane {np.median([b - a for a, b in pauses]) if pauses else 0:.2f} s)\n\n')
        f.write('| phrase | début → fin | débit | ton (médiane) | amplitude | énergie | pause après |\n|---|---|---|---|---|---|---|\n')
        for i, p in enumerate(phr):
            db = [w['db'] for w in p if w['db'] is not None]
            sel = (tf0 >= p[0]['t0']) & (tf0 <= p[-1]['t1']); hz = f0[sel & ~np.isnan(f0)]
            # amplitude = écart entre 10e et 90e centiles (insensible aux sauts d'octave isolés)
            rng = (st(np.percentile(hz, 90)) - st(np.percentile(hz, 10))) if len(hz) > 8 else 0
            pa = f"{phr[i + 1][0]['t0'] - p[-1]['t1']:.2f} s" if i + 1 < len(phr) else '—'
            f.write(f"| {' '.join(w['w'] for w in p)} | {p[0]['t0']:.2f} → {p[-1]['t1']:.2f} | {len(p) / max(0.1, p[-1]['t1'] - p[0]['t0']):.1f} mots/s | "
                    f"{f'{np.median(hz):.0f} Hz' if len(hz) > 8 else '—'} | {f'{rng:.1f} demi-tons' if len(hz) > 8 else '—'} | {np.mean(db) if db else 0:.0f} dB | {pa} |\n")
    f.write('\n## Bruitages et attaques (hors voix, force > 2)\n\n| t (s) | image | type | force | centroïde |\n|---|---|---|---|---|\n')
    for s in sfx:
        if not s['pendant_la_voix'] and s['force'] > 2: f.write(f"| {s['t']:.3f} | {round(s['t'] * FPS)} | {s['type']} | {s['force']} | {s['centroide']} Hz |\n")
    f.write('\n## Temps forts de la musique\n\n' + ' '.join(f'{b:.2f}' for b in beats) + '\n')
# synthèse
ev = np.zeros(int(DUR) + 1)
for c in scenes: ev[int(c / FPS)] += 1
for s in sfx:
    if s['force'] > 2 and not s['pendant_la_voix']: ev[min(len(ev) - 1, int(s['t']))] += 1
with open(P('report.md'), 'w') as f:
    durs = np.diff(shots) / FPS
    f.write(f'# Synthèse — {os.path.basename(SRC)}\n\n- {W}x{H}, {FPS:g} i/s, {DUR:.2f} s, {N} images\n')
    f.write(f'- {len(cuts)} coupes, plan médian {np.median(durs):.2f} s ({np.median(durs) * FPS:.0f} images), {(durs < 1).sum()} plans de moins d\'1 s\n')
    sd = np.diff([0] + scenes + [N]) / FPS
    f.write(f'- {len(scenes)} changements de scène en tout (coupes + enchaînements sans coupe) : une scène toutes les {sd.mean():.2f} s en moyenne (médiane {np.median(sd):.2f} s)\n')
    f.write(f"- transitions : " + ', '.join(f'{k} × {v}' for k, v in __import__('collections').Counter(kind(c).split(' sur')[0] for c in cuts).most_common()) + '\n')
    if words: f.write(f"- premiers mots (hook) : « {' '.join(w['w'] for w in words if w['t0'] < 3)} » ; premier mot à {words[0]['t0']:.2f} s\n")
    f.write(f'- {sum(1 for s in sfx if s["force"] > 2 and not s["pendant_la_voix"])} bruitages hors voix ; densité d\'événements (changements de scène + bruitages) par seconde :\n\n```\n')
    for i, e in enumerate(ev): f.write(f'{i:3d} s {"█" * int(e)}\n')
    f.write('```\n')
print('→', OUT)
