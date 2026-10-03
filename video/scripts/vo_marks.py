"""Repères du film calés sur la voix off, mot à mot.
usage : CUT=explainer60 python3 scripts/vo_marks.py
Lit timeline-<CUT>.json : "vo" (script avec balises v3 entre crochets), "voLead" (décalage de la voix, s),
"anchors" ({repère: "premiers mots de la phrase"}). Si audio/vo-<CUT>.mp3 (ou .wav) existe, le transcrit
(faster-whisper, horodatage par mot) ; sinon estime un minutage provisoire (débit mesuré de la voix choisie,
pauses de ponctuation). Chaque repère = début du premier mot de sa phrase, cherché dans l'ordre du script.
Écrit "marks" (fusionnés avec les repères fixes "marksFixed"), "words" et "voSource" dans la timeline."""
import json, os, re, sys, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CUT = os.environ.get('CUT', 'explainer60')
P = os.path.join(ROOT, f'timeline-{CUT}.json')
TL = json.load(open(P))
norm = lambda s: re.sub(r"[^a-z0-9]", '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
NUM = {'1200': 'milledeuxcents', '1450': 'millequatrecentcinquante', '100': 'cent', '2': 'deux', '30': 'trente', '1': 'un',
       '3': 'trois', '4': 'quatre', '5': 'cinq'}

def split_words(text):
    toks = re.findall(r"\[[^\]]+\]|[^\s]+", text)
    out = []
    for t in toks:
        if t.startswith('['):
            if t == '[pause]': out.append(('', 'pause'))
            continue
        # « l'annonce », « d'achat-revente » : une unité par apostrophe/trait d'union comme whisper les découpe souvent
        out.append((t, 'w'))
    return out

src = None
for ext in ('mp3', 'wav'):
    f = os.path.join(ROOT, f'audio/vo-{CUT}.{ext}')
    if os.path.exists(f): src = f; break
lead = TL.get('voLead', 0.15)
words = []
if src:
    from faster_whisper import WhisperModel
    m = WhisperModel('small', device='cpu', compute_type='int8')
    # le script en indice aide parfois la transcription, mais peut lui faire sauter le début : optionnel (VO_PROMPT=1)
    hint = re.sub(r'\[[^\]]+\]', '', TL['vo']) if os.environ.get('VO_PROMPT') else None
    segs, _ = m.transcribe(src, language='fr', word_timestamps=True, initial_prompt=hint)
    for s in segs:
        for w in s.words:
            k = norm(w.word); k = NUM.get(k, k)
            if k: words.append([w.word.strip(), round(w.start + lead, 3), round(w.end + lead, 3), k])
    source = os.path.relpath(src, ROOT)
else:
    rate = TL.get('voRate', 3.3)                     # mots/s mesurés sur l'extrait de la voix
    t = lead
    for w, kind in split_words(TL['vo']):
        if kind == 'pause': t += 0.45; continue
        k = norm(w); d = max(0.14, 0.9 / rate * (0.45 + 0.08 * len(k)))
        words.append([w, round(t, 3), round(t + d, 3), k]); t += d
        if w[-1] in '.?!': t += 0.34
        elif w[-1] in ',:;': t += 0.14
        elif w.endswith('…'): t += 0.3
    source = f'estimation ({rate} mots/s)'

# recherche des ancres dans l'ordre : la séquence normalisée des premiers mots, tolérante aux découpages
flat = ''.join(w[3] for w in words); starts = []
pos = 0
for w in words: starts.append(pos); pos += len(w[3])
marks = {k: v for k, v in TL.get('marksFixed', {}).items() if k != 'end'}
cur = 0
for name, phrases in TL['anchors'].items():
    # une ancre peut lister des variantes (la transcription entend parfois « Tout est dossier » ou « 1450 »)
    i = -1
    for phrase in ([phrases] if isinstance(phrases, str) else phrases):
        key = norm(phrase)
        for a, b in NUM.items(): key = key.replace(a, b)
        i = flat.find(key, cur)
        if i < 0: i = flat.find(key[:max(6, len(key) // 2)], cur)
        if i >= 0: break
    if i < 0: print('ancre introuvable :', name, phrases, file=sys.stderr); continue
    wi = max(j for j, s in enumerate(starts) if s <= i)
    marks[name] = words[wi][1]; cur = i + 1
TL['marks'] = dict(sorted(marks.items(), key=lambda kv: kv[1]))
TL['words'] = [w[:3] for w in words]
TL['voSource'] = source
TL['voEnd'] = words[-1][2]
# durée du film : la voix + 2,2 s de carton final (≤ 3 s), arrondie à l'image
# sans voix (estimation) : carton final ≤ 3 s après le début du CTA ; avec voix : fin de la voix + 2,2 s
# (MAXDUR=64 ENDHOLD=2.6 pour une voix plus posée qui dépasse 60 s)
TL['dur'] = min(float(os.environ.get('MAXDUR', 60)), round(((words[-1][2] + float(os.environ.get('ENDHOLD', 2.2))) if src else (marks.get('cta', words[-1][2]) + 2.8)) * TL['fps']) / TL['fps']); marks['end'] = TL['dur']; TL['marks'] = dict(sorted(marks.items(), key=lambda kv: kv[1]))
json.dump(TL, open(P, 'w'), ensure_ascii=False, indent=1)
print(f'{source} : {len(words)} mots, fin de la voix {words[-1][2]:.2f} s, {len(marks)} repères')
for k, v in TL['marks'].items(): print(f'  {k:10s} {v:6.2f}')
