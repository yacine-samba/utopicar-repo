"""Mix hors ligne de « 4 000 € » v3 (méthode de .claude/skills/motion-studio/references/sound-design.md, comme MO5).

Entrées :
- work/<clip>-audio.json, la timeline exportée par scripts/gen.py : segments de voix, sons d'action, cartes et
  plans d'illustration, aux temps du montage ;
- work/voix_studio.wav (work/voix_studio.py) ;
- assets/audio/banque/sfx-<id>.mp3 : bruitages Mixkit (licence Mixkit, usage commercial libre).

Règles appliquées :
- chaque son calé sur l'action, par son attaque (clic, pop, tic) ou par sa crête (souffle, impact, passage), ce
  calage étant mesuré dans le fichier ;
- un rôle par son (crête visée, bande, priorité) ; un son moins prioritaire à moins de 0,12 s d'un plus prioritaire
  est retiré ;
- une même famille qui monte : les numéros ①②③④ claquent sur +0, +2, +4, +5 demi-tons ;
- des sons réels sous les plans d'illustration (vapeur, clés, régime, démarrage, voiture qui passe d'un côté à
  l'autre), bas et baissés sous la voix ;
- une réverbération courte commune (0,45 s, −15 dB) sur les bruitages ponctuels ;
- les bruitages baissent de 4 dB sous la voix, les ambiances de 6 dB ; les accents (numéro, croix, signature) jamais ;
- master : −14 LUFS intégrés, limiteur à anticipation, plafond −3 dBFS (l'AAC ajoute jusqu'à 2 dB).

Sorties : work/<clip>-mix.wav (48 kHz stéréo), work/<clip>-stems/{voix,bruitages}.wav, work/<clip>-mix.txt.

Usage : python work/mix.py clip-1 [clip-2]
"""
import json
import subprocess
import sys
from functools import lru_cache
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfilt

ICI = Path(__file__).resolve().parent
RACINE = ICI.parent
BANQUE = RACINE / "assets" / "audio" / "banque"
SR = 48000

# rôle : (crête visée en dBFS, passe-haut, passe-bas, priorité, baisse sous la voix en dB, réverbération)
ROLES = {
    "accent": (-9, 30, 16000, 1, 0, True),
    "pop": (-17, 250, 12000, 1, 0, True),
    "buzz": (-16, 150, 9000, 1, 0, True),
    "foley": (-15, 150, 14000, 2, 4, True),
    "whoosh": (-17, 250, 9000, 2, 4, True),
    "souffle": (-22, 300, 9000, 3, 4, True),
    "tick": (-26, 1500, 12000, 3, 4, True),
    "chime": (-18, 500, 12000, 1, 0, True),
    "ambiance": (-24, 120, 9000, 4, 6, False),
}


def ff_lit(f):
    raw = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", str(f), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


@lru_cache(None)
def son(i):
    return ff_lit(BANQUE / f"sfx-{i}.mp3")


@lru_cache(None)
def reperes(i):
    """Attaque (premier passage à −30 dB sous la crête) et crête du fichier, en secondes (tranches de 10 ms)."""
    x = son(i)
    h = SR // 100
    e = 20 * np.log10(np.sqrt((x[: len(x) // h * h].reshape(-1, h) ** 2).mean(1)) + 1e-9)
    return int(np.argmax(e > e.max() - 30)) * 0.01, int(np.argmax(e)) * 0.01


def bande(x, lo, hi):
    sos = []
    if lo > 20:
        sos.append(butter(2, lo, "highpass", fs=SR, output="sos"))
    if hi < SR / 2 - 100:
        sos.append(butter(2, hi, "lowpass", fs=SR, output="sos"))
    for s in sos:
        x = sosfilt(s, x)
    return x


def transpose(x, demi_tons):
    if not demi_tons:
        return x
    r = 2 ** (demi_tons / 12)
    return np.interp(np.arange(0, len(x) - 1, r), np.arange(len(x)), x)


def fondu(x, a=0.004, b=0.06):
    x = x.copy()
    na, nb = min(len(x), int(a * SR)), min(len(x), int(b * SR))
    if na:
        x[:na] *= np.linspace(0, 1, na)
    if nb:
        x[-nb:] *= np.linspace(1, 0, nb) ** 2
    return x


def cue(t, i, role, ancre="attaque", debut=None, duree=None, gain=0.0, pan=0.0, pan_fin=None, demi_tons=0,
        passe_bas=None, sortie=0.06, note=""):
    """Un son : l'ancre (attaque ou crête du fichier) tombe à t. debut / duree : extrait du fichier, en secondes du
    fichier (par défaut : de 30 ms avant l'attaque jusqu'à la fin)."""
    return dict(t=t, i=i, role=role, ancre=ancre, debut=debut, duree=duree, gain=gain, pan=pan, pan_fin=pan_fin,
                demi_tons=demi_tons, passe_bas=passe_bas, sortie=sortie, note=note)


# --- sons d'action exportés par gen.py → bruitages
def cues_actions(sons, clip):
    out, n_pop = [], 0
    for t, nom in sons:
        if nom == "whoosh":      # filé entre deux plans : crête du souffle sur le pic de vitesse (début du filé)
            out.append(cue(t + 0.03, 1492, "whoosh", "crête", debut=0.65, duree=0.65, note="filé"))
        elif nom == "whoosh2":   # intercalaire qui glisse depuis la droite
            out.append(cue(t + 0.04, 1490, "whoosh", "crête", debut=0.42, duree=0.5, gain=-1, note="intercalaire"))
        elif nom == "souffle":   # coupe franche vers un plan d'illustration
            out.append(cue(t, 3120, "souffle", "crête", debut=0.0, duree=0.4, note="illustration"))
        elif nom == "tick":      # mot fort de l'intercalaire
            out.append(cue(t, 1119, "tick", "attaque", note="mot fort"))
        elif nom == "pop":       # le numéro claque : la famille monte (+0, +2, +4, +5)
            out.append(cue(t, 2354, "pop", "attaque", demi_tons=[0, 2, 4, 5, 7][min(n_pop, 4)],
                           pan=[-0.12, 0.12][n_pop % 2], note=f"numéro {n_pop + 1}"))
            n_pop += 1
        elif nom == "coup":      # le coup sourd sous le numéro
            out.append(cue(t, 2909, "accent", "crête", debut=0.0, duree=0.55, gain=-4, passe_bas=5000, sortie=0.2,
                           note="coup du numéro"))
        elif nom == "buzz":      # la croix de la 208 : buzzer de jeu, court
            out.append(cue(t, 950, "buzz", "attaque", debut=0.0, duree=0.34, sortie=0.08, note="croix 208"))
        elif nom == "billets":   # la liasse part (2,46-2,64 s) puis tombe : froissé, puis chute étouffée
            out.append(cue(t - 0.20, 2380, "foley", "crête", note="liasse lâchée"))
            out.append(cue(t + 0.06, 386, "foley", "crête", gain=-7, passe_bas=2500, note="liasse qui tombe"))
        elif nom == "signature":  # carte de fin : impact de logo (sa crête) + carillon de la maison
            out.append(cue(t + 0.04, 2900, "accent", "crête", debut=4.30, duree=0.85, gain=1, sortie=0.32,
                           note="signature : impact"))
            out.append(cue(t + 0.07, 951, "chime", "crête", duree=None, sortie=0.3, note="signature : carillon"))
    return out


# --- sons réels sous les plans d'illustration (fenêtres exportées par gen.py)
def cues_illustrations(cartes):
    out = []
    for c in cartes:
        if c["typ"] != "broll":
            continue
        a, b, n = c["s0"], c["s1"], c["clip"]
        d = b - a
        if n in ("p1-panne", "b5-fumee"):   # vapeur sous le capot
            out.append(cue(a, 1458, "ambiance", "attaque", debut=0.05, duree=d + 0.15, gain=2, sortie=0.2, note=n))
        elif n == "p1-trafic":              # circulation vue du ciel
            out.append(cue(a, 2930, "ambiance", "attaque", debut=20.0, duree=d, gain=-2, sortie=0.15, note=n))
        elif n == "b2-cle":                 # la clé passe d'une main à l'autre (~0,8 s dans le plan)
            out.append(cue(a + 0.8, 1558, "foley", "crête", gain=-5, note=n))
        elif n == "b4-compte-tours":        # le régime monte avec l'aiguille
            out.append(cue(a + 0.95, 1560, "ambiance", "crête", debut=6.1, duree=1.4, gain=2, sortie=0.25, note=n))
        elif n in ("p1-courroie", "b1-moteur"):  # clics d'outil dans le moteur
            out.append(cue(a, 1131, "ambiance", "attaque", debut=1.0 if n == "b1-moteur" else 2.2, duree=d,
                           sortie=0.12, note=n))
        elif n == "b3-dessous":             # visseuse pneumatique sous la voiture
            out.append(cue(a + 0.5, 817, "foley", "crête", gain=-8, note=n))
        elif n == "p2-part-vite":           # la voiture passe de gauche à droite
            out.append(cue(a + 0.45, 1538, "ambiance", "crête", debut=0.5, duree=1.4, gain=6, pan=-0.5, pan_fin=0.5,
                           sortie=0.3, note=n))
        elif n == "b6-cle-contact":         # on tourne la clé : démarreur, le moteur prend
            out.append(cue(a + 0.02, 1566, "ambiance", "attaque", debut=0.12, duree=d + 0.25, gain=4, sortie=0.25,
                           note=n))
        elif n == "b7-moteur":              # moteur au ralenti (la chaîne)
            out.append(cue(a, 1560, "ambiance", "attaque", debut=9.0, duree=d, gain=-2, sortie=0.15, note=n))
    return out


def accroche(clip):
    """Image 0 : un coup sourd sous le chiffre (sous 160 Hz : il ne masque pas le premier mot)."""
    return [cue(0.0, 2909, "accent", "attaque", debut=0.0, duree=0.7, gain=-3, passe_bas=160, sortie=0.3,
                note="accroche : coup sourd")]


def reverb_ir():
    rng = np.random.default_rng(45)
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    env = np.exp(-6.91 * t / 0.45)  # RT60 = 0,45 s
    ir = np.stack([rng.standard_normal(n) * env, rng.standard_normal(n) * env], 1)
    for k in range(2):
        ir[:, k] = bande(ir[:, k], 300, 6000)
    return ir / np.sqrt((ir ** 2).sum(0)).max()


def enveloppe_voix(v):
    h = SR // 100
    n = len(v) // h
    e = 20 * np.log10(np.sqrt((v[: n * h].reshape(n, h) ** 2).mean(1)) + 1e-9)
    c = np.clip((e + 45) / 15, 0, 1)  # 0 sous −45 dBFS, 1 au-dessus de −30 dBFS
    g, x = np.zeros(n), 0.0
    a, r = np.exp(-1 / 1.5), np.exp(-1 / 25)  # attaque 15 ms, relâchement 250 ms
    for k in range(n):
        x = a * x + (1 - a) * c[k] if c[k] > x else r * x + (1 - r) * c[k]
        g[k] = x
    return np.interp(np.arange(len(v)), np.arange(n) * h + h / 2, g)


def lufs(x):
    p = subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-f", "f32le", "-ar", str(SR), "-ac", str(x.shape[1]), "-i", "-",
                        "-af", "ebur128=peak=true", "-f", "null", "-"], input=x.astype(np.float32).tobytes(),
                       capture_output=True)
    t = p.stderr.decode()
    i = float([l for l in t.splitlines() if l.strip().startswith("I:")][-1].split()[1])
    tp = float([l for l in t.splitlines() if l.strip().startswith("Peak:")][-1].split()[1])
    return i, tp


def limiteur(x, plafond_db=-3.0):
    p = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                        "-af", f"alimiter=limit={10 ** (plafond_db / 20):.4f}:attack=4:release=80:level=false:latency=1",
                        "-f", "f32le", "-ar", str(SR), "-ac", "2", "-"], input=x.astype(np.float32).tobytes(),
                       capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.float32).astype(np.float64).reshape(-1, 2)


def ecrit(f, x):
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", str(x.shape[1]), "-i", "-",
                    "-c:a", "pcm_s24le", str(f)], input=x.astype(np.float32).tobytes(), check=True)


def mixer(nom):
    tl = json.loads((ICI / f"{nom}-audio.json").read_text(encoding="utf-8"))
    N = int(np.ceil(tl["duree"] * SR))
    rap = [f"{nom} : {tl['duree']:.2f} s (voix jusqu'à {tl['fin_voix']:.2f} s)"]

    # 1. voix : chaque segment de la voix studio, fondus de 8 ms à l'entrée et 15 ms à la sortie (sauf raccord continu)
    vs = ff_lit(ICI / "voix_studio.wav")
    voix = np.zeros(N)
    for s in tl["segments"]:
        x = vs[int(round(s["in"] * SR)):int(round(s["out"] * SR))].copy()
        if not s["contigu_avant"]:
            k = int(0.008 * SR)
            x[:k] *= np.linspace(0, 1, k)
        if not s["contigu_apres"]:
            k = int(0.015 * SR)
            x[-k:] *= np.linspace(1, 0, k)
        i0 = int(round(s["start"] * SR))
        x = x[: max(0, N - i0)]
        voix[i0:i0 + len(x)] += x
    env = enveloppe_voix(voix)

    # 2. repérage : actions + illustrations + accroche, puis collisions
    cues = cues_actions(tl["sons"], nom) + cues_illustrations(tl["cartes"]) + accroche(nom)
    cues.sort(key=lambda c: c["t"])
    gardes, retires = [], []
    for c in cues:
        pr = ROLES[c["role"]][3]
        if pr < 4 and any(o is not c and ROLES[o["role"]][3] < pr and abs(o["t"] - c["t"]) < 0.12 for o in cues):
            retires.append(c)
        else:
            gardes.append(c)

    # 3. bruitages : extrait, transposition, bande, niveau de rôle, fondus, panoramique, baisse sous la voix
    sec, amb = np.zeros((N, 2)), np.zeros((N, 2))
    for c in gardes:
        crete_db, lo, hi, pr, baisse, rev = ROLES[c["role"]]
        x = son(c["i"])
        att, pk = reperes(c["i"])
        d0 = c["debut"] if c["debut"] is not None else max(0.0, att - 0.03)
        y = x[int(d0 * SR):]
        if c["duree"] is not None:
            y = y[: int(c["duree"] * SR)]
        y = transpose(y, c["demi_tons"])
        y = bande(y, lo, min(hi, c["passe_bas"] or hi))
        y = fondu(y, 0.004, c["sortie"])
        y = y / (np.abs(y).max() + 1e-9) * 10 ** ((crete_db + c["gain"]) / 20)
        ancre = (att if c["ancre"] == "attaque" else pk) - d0
        ancre /= 2 ** (c["demi_tons"] / 12)
        i0 = int(round((c["t"] - ancre) * SR))
        if i0 < 0:
            y, i0 = y[-i0:], 0
        y = y[: max(0, N - i0)]
        if baisse:
            y = y * (1 - (1 - 10 ** (-baisse / 20)) * env[i0:i0 + len(y)])
        p0 = c["pan"]
        p1 = c["pan_fin"] if c["pan_fin"] is not None else p0
        pan = np.linspace(p0, p1, len(y))
        ang = (pan + 1) * np.pi / 4
        st = np.stack([y * np.cos(ang), y * np.sin(ang)], 1) * np.sqrt(2)
        (sec if rev else amb)[i0:i0 + len(y)] += st
        c["calage_ms"] = round(((i0 / SR) + ancre - c["t"]) * 1000, 1)
    # réverbération courte commune sur les bruitages ponctuels (−15 dB)
    ir = reverb_ir()
    wet = np.stack([np.convolve(sec[:, k], ir[:, k])[:N] for k in range(2)], 1) * 10 ** (-15 / 20)
    bruitages = sec + wet + amb

    # 4. master : voix (centre) + bruitages, −14 LUFS, limiteur, plafond −3 dBFS
    mix = np.stack([voix, voix], 1) + bruitages
    for _ in range(3):
        i, _tp = lufs(mix)
        mix = limiteur(mix * 10 ** ((-14 - i) / 20), -3.0)
    i, tp = lufs(mix)
    (ICI / f"{nom}-stems").mkdir(exist_ok=True)
    ecrit(ICI / f"{nom}-mix.wav", mix)
    ecrit(ICI / f"{nom}-stems" / "voix.wav", np.stack([voix, voix], 1))
    ecrit(ICI / f"{nom}-stems" / "bruitages.wav", bruitages)

    # 5. rapport : chaque son, son niveau, la voix au même instant, le calage
    rap.append(f"master : {i:.1f} LUFS, crête vraie {tp:.1f} dBTP (avant encodage AAC)")
    rap.append(f"{len(gardes)} sons gardés, {len(retires)} retirés (collision < 0,12 s avec un son plus prioritaire)")
    for c in gardes:
        j = int(c["t"] * SR)
        fen = slice(max(0, j - SR // 20), j + SR // 5)
        v_db = 20 * np.log10(np.sqrt(np.mean(voix[fen] ** 2)) + 1e-9)
        rap.append(f"  {c['t']:6.2f} s  {c['role']:8s} sfx-{c['i']:<5} {c['note']:28s} crête {ROLES[c['role']][0] + c['gain']:+.0f} dBFS"
                   f"  voix {v_db:6.1f} dBFS  calage {c['calage_ms']:+.1f} ms")
    for c in retires:
        rap.append(f"  retiré {c['t']:6.2f} s  {c['role']} sfx-{c['i']} {c['note']}")
    (ICI / f"{nom}-mix.txt").write_text("\n".join(rap), encoding="utf-8")
    print("\n".join(rap[:3]))


if __name__ == "__main__":
    for n in sys.argv[1:]:
        mixer(n)
