"""Outils partagés : mots minutés, énergie de la voix, coupes calées sur les silences, temps de la source → temps du montage.

Les temps « source » sont ceux de l'enregistrement Loom (et des plans, qui ont la même base de temps).
"""
import json
import bisect
import functools
import wave
from functools import lru_cache
from pathlib import Path

import numpy as np

RACINE = Path(__file__).resolve().parents[1]
WORK = RACINE / "work"
FPS = 30


@lru_cache(None)
def mots():
    d = json.loads((WORK / "words.json").read_text(encoding="utf-8"))
    out = []
    for s in d["segments"]:
        for w in s["words"]:
            out.append({"t": w["w"].strip(), "s": w["s"], "e": w["e"], "p": w["p"]})
    return out


@lru_cache(None)
@functools.lru_cache(maxsize=None)
def energie():
    """RMS de la voix nettoyée, une valeur toutes les 5 ms (dB)."""
    with wave.open(str(WORK / "voix16k.wav"), "rb") as wf:
        sig = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    hop = 80  # 5 ms à 16 kHz
    n = len(sig) // hop
    fr = sig[: n * hop].reshape(n, hop)
    rms = np.sqrt((fr ** 2).mean(axis=1) + 1e-12)
    # lissage sur 15 ms
    k = np.ones(3) / 3
    rms = np.convolve(rms, k, mode="same")
    return 20 * np.log10(rms + 1e-9)


def _db(t):
    e = energie()
    return e[min(len(e) - 1, max(0, int(t / 0.005)))]


def creux(a, b):
    """Instant le plus silencieux entre a et b (source)."""
    e = energie()
    i0, i1 = max(0, int(a / 0.005)), min(len(e) - 1, int(b / 0.005))
    if i1 <= i0:
        return (a + b) / 2
    return (i0 + int(np.argmin(e[i0:i1 + 1]))) * 0.005


def mot(t):
    """Le mot qui commence à t (à 0,011 s près)."""
    ms = mots()
    for i, w in enumerate(ms):
        if abs(w["s"] - t) < 0.011:
            return i, w
    raise KeyError(f"aucun mot ne commence à {t}")


SEUIL = -38.0  # dB : en dessous, silence (bruit de fond vers -53 dB, voix entre -15 et -30 dB)


QUEUE, AVANT = 0.07, 0.05  # on garde 70 ms après la dernière syllabe (traîne, réverbération) et 50 ms avant l'attaque


@functools.lru_cache(maxsize=None)
def seuils():
    """Seuils de silence et de voix pour chaque pas de 5 ms, d'après le bruit de fond local.

    Le bruit de la pièce varie (-55 à -42 dB) et une respiration peut monter à -42 dB : est calme ce qui est à la fois
    9 dB au-dessus du plancher local (5e centile sur ±1,5 s) et 24 dB sous les crêtes de la voix (95e centile sur
    ±1 s), entre -47 et -36 dB. La voix commence 6 dB au-dessus.
    """
    e = energie()
    n, pas = len(e), 100  # un calcul toutes les 0,5 s
    pts = np.arange(0, n, pas)
    planch = np.array([np.percentile(e[max(0, k - 300): k + 300], 5) for k in pts])
    cretes = np.array([np.percentile(e[max(0, k - 200): k + 200], 95) for k in pts])
    calme = np.clip(np.maximum(planch + 9.0, cretes - 24.0), -47.0, -36.0)
    calme = np.interp(np.arange(n), pts, calme)
    return calme, calme + 6.0


@functools.lru_cache(maxsize=None)
def ilots():
    """Îlots de parole (début, fin) en secondes : la parole démarre au-dessus du seuil de voix, recule tant que le son
    reste au-dessus du calme (attaques douces : f, s, ch) et finit quand le son reste 50 ms sous le calme."""
    e = energie()
    calme, voix = seuils()
    n, res, i = len(e), [], 0
    while i < n:
        if e[i] <= voix[i]:
            i += 1
            continue
        d = i
        while d > 0 and e[d - 1] > calme[d - 1]:
            d -= 1
        j, c = i, 0
        while j < n:
            c = c + 1 if e[j] < calme[j] else 0
            if c >= 10:
                break
            j += 1
        f = j - c + 1
        if res and d * 0.005 <= res[-1][1]:
            res[-1] = (res[-1][0], f * 0.005)
        else:
            res.append((d * 0.005, f * 0.005))
        i = j + 1
    return tuple(res)


def ilot(t):
    """L'îlot de parole qui contient t, sinon None."""
    I = ilots()
    k = bisect.bisect_right([a for a, b in I], t) - 1
    if 0 <= k < len(I) and I[k][0] <= t <= I[k][1]:
        return I[k]
    return None


def _apres(t):
    """Le premier îlot qui commence après t."""
    return next((ab for ab in ilots() if ab[0] > t + 1e-6), (t + 1.0, t + 1.5))


def _avant(t):
    """Le dernier îlot qui finit avant t."""
    return next((ab for ab in reversed(ilots()) if ab[1] < t - 1e-6), (t - 1.5, t - 1.0))


def _decroit(a, b, sens=+1):
    """Vrai si, de a vers b (sens +1) ou de b vers a (sens -1), le son ne fait que décroître : aucune nouvelle syllabe
    (rien ne remonte de plus de 3 dB au-dessus du point de départ)."""
    e = energie()
    i0, i1 = int(a / 0.005), int(b / 0.005) + 1
    seg = e[i0:i1] if sens > 0 else e[i0:i1][::-1]
    return len(seg) < 2 or seg[1:].max() <= seg[0] + 3.0


def etire(w):
    """Vrai si Whisper a étiré le mot (il a avalé un silence) : sa frontière n'est pas fiable."""
    lettres = sum(ch.isalpha() for ch in w["t"])
    return w["e"] - w["s"] > 1.8 * (0.055 * lettres + 0.06) + 0.05


def borne_segment(a, b):
    """(début du 1er mot, début du dernier mot) → (entrée, sortie) calées sur la voix réelle.

    Whisper place mal les frontières (un mot suivant qui « commence » 0,3 s trop tôt faisait couper la fin du mot
    précédent ; un mot qui « commence » dans la traîne du précédent faisait entendre cette traîne). On lit les îlots de
    parole :
    - sortie : si, après la frontière Whisper, le son ne fait que décroître jusqu'à la fin de l'îlot, le mot suivant
      n'y est pas : on coupe 70 ms après la traîne (ou au milieu d'un silence court) ; sinon la parole est enchaînée et
      on coupe au creux d'énergie près de la frontière ;
    - entrée : symétrique (attaque qui ne fait que monter depuis le début de l'îlot = le mot commence l'îlot).
    """
    ms = mots()
    i, wa = mot(a)
    j, wb = mot(b)
    # sortie
    suivant_fiable = j + 1 < len(ms) and not etire(ms[j + 1])
    fr = (wb["e"] + ms[j + 1]["s"]) / 2 if suivant_fiable else wb["e"]
    ref = fr if (suivant_fiable and ilot(fr)) else (wb["s"] + wb["e"]) / 2
    I = ilot(ref) or _avant(ref)
    lo, hi = max(wb["s"] + 0.05, fr - 0.06), fr + 0.04
    v = creux(lo, max(hi, lo + 0.02))
    if not suivant_fiable or I[1] <= v or _decroit(v, I[1], +1):
        nxt = _apres(I[1])[0]
        sortie = I[1] + QUEUE if nxt - I[1] >= 2 * QUEUE else (I[1] + nxt) / 2
    else:
        sortie = v
    # entrée
    fr = (ms[i - 1]["e"] + wa["s"]) / 2 if i > 0 else wa["s"]
    J = ilot(fr)
    if etire(wa):
        # mot étiré : Whisper a collé un silence au mot, avant ou après lui. Si sa durée normale tient dans la parole
        # qui suit son début, il est dit là (le silence est après) ; sinon il est dans l'îlot suivant.
        lettres = sum(ch.isalpha() for ch in wa["t"])
        I0 = ilot(wa["s"])
        tient = I0 is not None and I0[1] - wa["s"] >= 0.7 * (0.06 + 0.045 * lettres)
        K = None if tient else (ilot(wa["e"] - 0.05) or _apres(wa["s"]))
        if K is not None and K[0] > wa["s"]:
            prv = _avant(K[0])[1]
            return (round(K[0] - AVANT if K[0] - prv >= 2 * AVANT else (prv + K[0]) / 2, 3), round(sortie, 3),
                    list(range(i, j + 1)))
    if J is None:  # la frontière tombe dans un silence : le mot commence le prochain îlot
        J = _apres(fr)
        prv = _avant(J[0])[1]
        entree = J[0] - AVANT if J[0] - prv >= 2 * AVANT else (prv + J[0]) / 2
    else:
        lo, hi = fr - 0.06, min(wa["e"] - 0.03, fr + 0.03)
        v = creux(lo, max(hi, lo + 0.02))
        if _decroit(J[0], v, -1) and v - J[0] < 0.3:
            # rien d'autre avant le mot dans cet îlot : il commence l'îlot
            prv = _avant(J[0])[1]
            entree = J[0] - AVANT if J[0] - prv >= 2 * AVANT else (prv + J[0]) / 2
        elif _decroit(v, J[1], +1) and J[1] - v < 0.35:
            # après la frontière, l'îlot n'est que la traîne du mot précédent : le mot commence l'îlot suivant
            K = _apres(J[1])
            entree = K[0] - AVANT if K[0] - J[1] >= 2 * AVANT else (J[1] + K[0]) / 2
        else:
            entree = v
    return round(entree, 3), round(sortie, 3), list(range(i, j + 1))


# casse des noms propres : les graphies génériques ici, celles du projet dans projet.PROPRES
PROPRES = {"ebay": "eBay", "youtube": "YouTube", "insta": "Insta", "instagram": "Instagram", "loom": "Loom",
           "tiktok": "TikTok", "france": "France", "ok": "OK", "ya": "y a"}  # et deux graphies de Whisper (« Ok », « il ya »)
try:
    import projet as _projet
    PROPRES.update(getattr(_projet, "PROPRES", {}))
except ImportError:
    pass


def casse(txt):
    """Rétablit la casse des noms propres en gardant la ponctuation autour du mot."""
    coeur = txt.strip(".,;:!?…«» ")
    if coeur.lower() in PROPRES:
        return txt.replace(coeur, PROPRES[coeur.lower()])
    return txt


class Montage:
    """Suite de segments de la source posés bout à bout ; convertit les temps."""

    def __init__(self, segments):
        self.segs = []
        t = 0.0
        for k, sg in enumerate(segments):
            a, b, idx = borne_segment(sg["de"], sg["a"])
            # entrée / sortie imposées à la main (quand Whisper place mal un début de mot : lu sur l'énergie)
            a = sg.get("entree_src", a)
            b = sg.get("sortie_src", b)
            # deux plans qui se suivent dans la source (simple changement de cadre) : un seul point de coupe, sinon un
            # bout de son est répété ou sauté. Mais si la parole reprend après un vrai silence, c'est une coupe normale
            # (le silence part) ; et si la sortie du plan précédent a avalé les premiers mots de celui-ci (îlot pris
            # jusqu'au bout), le point de coupe est l'entrée de celui-ci.
            consecutif = bool(self.segs) and self.segs[-1]["mots"][-1] + 1 == idx[0] and "entree_src" not in sg
            contigu = False
            if consecutif and a <= self.segs[-1]["out"] + 0.15:
                prec = self.segs[-1]
                contigu = True
                if prec["out"] > mots()[idx[0]]["s"] + 0.1 and "sortie_src" not in prec:
                    t -= prec["out"] - a
                    prec["out"] = a
                    prec["dur"] = round(a - prec["in"], 3)
                a = prec["out"]
                prec["contigu_apres"] = True
            d = round(b - a, 3)
            self.segs.append({**sg, "in": a, "out": b, "dur": d, "start": round(t, 3), "mots": idx, "k": k,
                              "contigu_avant": contigu, "contigu_apres": False})
            t += d
        self.duree = round(t, 3)

    def edit(self, ts):
        """Temps source → temps montage (le premier segment qui contient ts)."""
        for s in self.segs:
            if s["in"] - 1e-6 <= ts <= s["out"] + 1e-6:
                return round(s["start"] + ts - s["in"], 3)
        # le début d'un mot peut précéder l'entrée calée sur la voix (Whisper colle parfois la pause au mot suivant) :
        # on le ramène au début du plan
        for s in self.segs:
            if s["in"] - 0.8 <= ts < s["in"]:
                return round(s["start"], 3)
        raise ValueError(f"{ts} n'est dans aucun segment")

    def seg_a(self, t_edit):
        for s in self.segs:
            if s["start"] <= t_edit < s["start"] + s["dur"]:
                return s
        return self.segs[-1]

    def mots_montage(self, corr=None, retire=()):
        """Les mots gardés, en temps montage, corrections appliquées."""
        corr = corr or {}
        ms = mots()
        out = []
        for s in self.segs:
            for i in s["mots"]:
                w = ms[i]
                cle = round(w["s"], 2)
                if cle in retire:
                    continue
                # clé (temps, mot) d'abord : deux mots peuvent commencer au même instant (« ce@704.06 que@704.06 »)
                txt = casse(corr.get((cle, w["t"]), corr.get(cle, w["t"])))
                if txt == "":
                    continue
                out.append({"t": txt, "s": round(s["start"] + max(0.0, w["s"] - s["in"]), 3),
                            "e": round(s["start"] + min(s["dur"], w["e"] - s["in"]), 3), "src": cle, "seg": s["k"]})
        return out
