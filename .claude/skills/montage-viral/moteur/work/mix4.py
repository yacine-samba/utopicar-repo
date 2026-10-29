"""Mix hors ligne v4 de « 4 000 € » : le langage sonore de design/LANGAGE-V4.md § 5 (recherche/v4/recherche-son.md).

Entrées : work/<clip>-audio4.json (scripts/gen4.py : segments de voix, événements de l'habillage, mots), la voix studio
v4 (work/voix_studio.wav), les bruitages réels de assets/audio/banque (Mixkit, usage commercial libre).

Le son de la marque est fait de matière réelle de voiture, accordée sur la tonalité de mi :
- le bip de verrouillage électronique (sfx-2852, sa hauteur est mesurée dans le fichier) donne les notes ;
- le clic d'un interrupteur (sfx-2582) donne l'attaque de chaque note ;
- la porte qui claque (sfx-1564) et la serrure (sfx-2849) donnent le poids de la dernière note.
Logo sonore « u-to-pi-car » : mi5, sol#5, si5, mi6 (0, +4, +7, +12 demi-tons), le contour monte comme la flèche (et va
de gauche à droite), la dernière note tombe sur la pose de la flèche de la carte de fin. Les chiffres de la pastille
jouent ces notes dans l'ordre : la vidéo épelle le logo, la carte de fin le termine.
Risque (la 208) : un démarrage raté (sfx-1540), puis la serrure qui retombe (sfx-2854, un ton plus bas).
Couleur pleine : une voiture qui passe (sfx-1484 pour l'orange, sfx-1538 pour le noir), coupée à la durée du mouvement,
crête sur l'image qui couvre, de gauche à droite dans le sens de la flèche (±0,25), et un coup bas-médium.

Règles de mix mesurées :
- ambiances ≥ 15 LU sous la voix pendant qu'elle parle (gain de chaque ambiance recalculé sur sa fenêtre) ;
- bruitages creusés de 6 dB entre 1 et 4 kHz quand la voix parle (égaliseur dynamique piloté par l'enveloppe de la voix) ;
- collisions par famille (< 0,17 s : on garde le prioritaire), 2 bruitages au plus en même temps que la voix ;
- 150-300 ms de vide (ambiances coupées) avant la phrase clé (la 208) et avant le logo ;
- chaque son grave a une couche d'harmoniques 150-1 000 Hz (le téléphone ne rend pas le sub) ;
- sons diégétiques dans un habitacle court (premières réflexions, 0,2 s) ; sons de marque secs ;
- master −14 LUFS, limiteur à crête vraie (mesurée ×4) à −1,5 dBTP, contrôle ≤ −1 dBTP après AAC, somme mono à moins de
  1 LU, test passe-haut 800 Hz des accents.

Sorties : work/<clip>-mix4.wav (48 kHz stéréo), work/<clip>-stems4/, work/<clip>-mix4.txt, work/logo-sonore.wav.
Usage : python work/mix4.py clip-1 [clip-2]
"""
import json
import subprocess
import sys
from functools import lru_cache
from pathlib import Path

import numpy as np
from scipy.signal import butter, istft, sosfilt, stft

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI))
import mix as M  # noqa: E402  (lecture, filtres, transposition, fondus, enveloppe de la voix, LUFS, écriture)

SR = M.SR
NOTES = [659.255, 830.609, 987.767, 1318.510]   # mi5, sol#5, si5, mi6


def db(x):
    return 20 * np.log10(np.sqrt(np.mean(np.square(x))) + 1e-12)


def crete(x, peak_db):
    return x / (np.abs(x).max() + 1e-12) * 10 ** (peak_db / 20)


def fen(x, a, b, f_in=0.003, f_out=0.01):
    y = x[int(a * SR):int(b * SR)].copy()
    return M.fondu(y, f_in, f_out)


def harmoniques(x, niveau_db=-8, haut=2400):
    """Couche « téléphone » d'un son grave : redressement simple alternance + saturation forte (harmoniques jusqu'à
    quelques kHz), puis 150 Hz - `haut` : un haut-parleur de téléphone, qui ne rend rien sous ~300 Hz, entend le coup."""
    h = M.bande(np.tanh(8 * np.maximum(x, 0) / (np.abs(x).max() + 1e-12)), 150, haut)
    return x + crete(h, 20 * np.log10(np.abs(x).max() + 1e-12) + niveau_db)


def pan(y, p0, p1=None):
    p = np.linspace(p0, p0 if p1 is None else p1, len(y))
    a = (p + 1) * np.pi / 4
    return np.stack([y * np.cos(a), y * np.sin(a)], 1) * np.sqrt(2)


# ---------------------------------------------------------------------------------------------------- matière
@lru_cache(None)
def hauteur_bip():
    """Hauteur du bip de verrouillage, mesurée sur son premier bip (crête du spectre au-dessus de 1 kHz)."""
    x = M.son(2852)[: int(0.02 * SR)]
    sp = np.abs(np.fft.rfft(x * np.hanning(len(x)), 1 << 16))
    f = np.fft.rfftfreq(1 << 16, 1 / SR)
    sp[f < 1000] = 0
    return float(f[np.argmax(sp)])


def bip(hz):
    """Le premier bip du verrouillage (0-34 ms), accordé sur hz (sa durée s'allonge d'autant)."""
    x = fen(M.son(2852), 0.0, 0.034, 0.001, 0.006)
    y = M.transpose(x, 12 * np.log2(hz / hauteur_bip()))
    return M.bande(y, 250, 9000)


def resonance(x, hz, duree=0.36):
    """Fait sonner une note : le bip excite un résonateur accordé (peigne à rétroaction), qui décroît en `duree`."""
    n = int(round(SR / hz))
    g = 10 ** (-3 * n / (duree * SR))           # −60 dB en `duree`
    y = np.concatenate([x, np.zeros(int(duree * SR))])
    for i in range(n, len(y)):
        y[i] += g * y[i - n]
    return M.bande(y, 300, 8000)


def clic():
    return M.bande(fen(M.son(2582), 0.0, 0.045, 0.0005, 0.01), 1200, 14000)


def coup_porte():
    x = fen(M.son(1564), 0.09, 0.62, 0.002, 0.12)
    return harmoniques(M.bande(x, 40, 1500), -8)


def serrure():
    return M.bande(fen(M.son(2849), 0.11, 0.32, 0.002, 0.05), 150, 800)


def logo_sonore():
    """« u-to-pi-car » (≤ 0,75 s, sec) : trois notes brèves qui montent et vont vers la droite, puis la tonique qui
    sonne, posée par la porte et la serrure. Rend (stéréo, instant de la dernière note)."""
    temps, pans = [0.0, 0.075, 0.150, 0.270], [-0.20, -0.07, 0.07, 0.20]
    out = np.zeros((int(0.75 * SR), 2))
    for k, (t, p) in enumerate(zip(temps, pans)):
        y = crete(bip(NOTES[k]), -15)
        if k == 3:
            y = crete(resonance(y, NOTES[k]), -13)
        cl = crete(clic(), -27 if k < 3 else -24)
        y = np.pad(y, (0, max(0, len(cl) - len(y)))) + np.pad(cl, (0, max(0, len(y) - len(cl))))
        if k == 3:
            po, se = crete(coup_porte(), -14), crete(serrure(), -22)
            m = max(len(y), len(po), len(se))
            y = np.pad(y, (0, m - len(y))) + np.pad(po, (0, m - len(po))) + np.pad(se, (0, m - len(se)))
        i0 = int(t * SR)
        y = pan(y[: len(out) - i0], p)
        out[i0:i0 + len(y)] += y
    n = int(0.12 * SR)
    out[-n:] *= np.linspace(1, 0, n)[:, None] ** 2
    return out, temps[3]


def note_pastille(k):
    y = crete(bip(NOTES[k]), -19)
    cl = crete(clic(), -29)
    m = max(len(y), len(cl))
    return np.pad(y, (0, m - len(y))) + np.pad(cl, (0, m - len(cl)))


# ---------------------------------------------------------------------------------------------------- repérage
def cue(t, x, famille, prio, bus, note, stereo=False, p0=0.0, p1=None):
    """Un son déjà fabriqué (mono ou stéréo) dont le début tombe à t (s). bus : « marque » (sec) ou « lieu » (habitacle).
    famille / prio : collisions (< 0,17 s dans une famille, on garde la plus petite prio)."""
    return dict(t=t, x=x, famille=famille, prio=prio, bus=bus, note=note, stereo=stereo, p0=p0, p1=p1)


def ambiance(i, a, b, debut, gain_db=-24, pan0=0.0, pan1=None, note=""):
    """Le son réel d'un plan d'illustration : il arrive 0,25 s avant l'image (J) et s'éteint 0,2 s après (L)."""
    x = M.son(i)
    d = (b - a) + 0.45
    y = M.bande(x[int(debut * SR):int((debut + d) * SR)], 120, 9000)
    y = M.fondu(y, 0.20, 0.22)
    return dict(t=a - 0.25, x=crete(y, gain_db), famille="lieu", prio=4, bus="lieu", note=note, stereo=False, p0=pan0,
                p1=pan1, ambiance=True, fenetre=(a, b))


def cues_illustrations(brolls):
    out = []
    for c in brolls:
        a, b, n = c["debut"], c["fin"], c["clip"]
        if n in ("p1-panne", "b5-fumee"):
            out.append(ambiance(1458, a, b, 0.05, -22, note=n))
        elif n == "p1-trafic":
            out.append(ambiance(2930, a, b, 20.0, -24, note=n))
        elif n == "b2-cle":
            y = M.bande(fen(M.son(1558), 0.0, 1.0, 0.003, 0.15), 200, 12000)
            out.append(cue(a + 0.55, crete(y, -24), "lieu", 3, "lieu", n))
        elif n == "b4-compte-tours":
            out.append(ambiance(1560, a, b, 5.4, -21, note=n))
        elif n in ("p1-courroie", "b1-moteur"):
            out.append(ambiance(1131, a, b, 1.0 if n == "b1-moteur" else 2.2, -25, note=n))
        elif n == "b3-dessous":
            out.append(ambiance(817, a, b, 0.0, -25, note=n))
        elif n == "p2-part-vite":
            out.append(ambiance(1538, a, b, 0.75, -20, -0.5, 0.5, note=n))
        elif n == "b6-cle-contact":
            out.append(ambiance(1566, a, b, 0.0, -21, note=n))
        elif n == "b7-moteur":
            out.append(ambiance(1560, a, b, 9.0, -24, note=n))
        elif n == "b9-epave":
            out.append(ambiance(1554, a, b, 1.0, -27, note=n))
    return out


def cues_habillage(ev, sons, premier_mot):
    out = []
    # image 0 : un coup sourd sous le chiffre (sous 160 Hz) et ses harmoniques, pour que le téléphone l'entende
    y = harmoniques(M.bande(fen(M.son(2909), 0.0, 0.7, 0.001, 0.3), 30, 160), -7)
    # le corps médium du même impact, c'est lui que le haut-parleur d'un téléphone rend ; il s'arrête avant le premier
    # mot (il ne le masque pas) : 0,18 s si la voix commence à 0,2 s, rien si elle commence tout de suite
    d_corps = min(0.22, premier_mot - 0.02)
    if d_corps > 0.06:
        corps = M.bande(fen(M.son(2909), 0.0, d_corps, 0.001, d_corps / 2), 300, 3000)
        y = y + np.pad(crete(corps, 20 * np.log10(np.abs(y).max()) - 5), (0, len(y) - len(corps)))
    out.append(cue(0.0, crete(y, -10), "accroche", 1, "marque", "accroche : coup sourd"))
    for t, nom in sons:
        if nom == "billets":   # la liasse part puis tombe : froissé, puis chute étouffée
            out.append(cue(t - 0.26, crete(M.bande(M.son(2380), 200, 12000), -20), "lieu", 2, "lieu", "liasse lâchée"))
            out.append(cue(t + 0.02, crete(M.bande(M.son(386), 150, 2500), -26), "lieu2", 2, "lieu", "liasse qui tombe"))
    # chiffres de la pastille : les notes du logo, dans l'ordre ; l'attaque juste avant le chiffre dit (dans le trou)
    for k, n in enumerate(ev["note"]):
        out.append(cue(n["t"] - 0.05, note_pastille(min(k, 3)), "note", 1, "marque", f"pastille {k + 1} : note {k + 1}"))
    # risque : démarrage raté (le démarreur tourne et ne prend pas), puis la serrure qui retombe
    for r in ev["risque"]:
        dem = M.bande(fen(M.son(1540), 0.30, 0.95, 0.01, 0.18), 120, 9000)
        out.append(cue(r["t"] - 0.12, crete(dem, -19), "risque", 1, "lieu", "risque : démarrage raté"))
        ser = M.transpose(M.bande(fen(M.son(2854), 0.0, 0.12, 0.001, 0.03), 150, 6000), -2)
        out.append(cue(r["t"] + 0.42, crete(harmoniques(ser, -12), -18), "risque2", 1, "marque", "risque : serrure"))
    # couleurs pleines : la voiture qui passe, crête sur l'image qui couvre ; un coup bas-médium à la couverture
    for c in ev["couleur"]:
        i = 1484 if c["ton"] == "orange" else 1538
        x = M.son(i)
        _att, pk = M.reperes(i)
        y = M.bande(x[int((pk - 0.42) * SR):int((pk + 0.24) * SR)], 120, 11000)
        if c["ton"] != "orange":
            y = M.transpose(y, -2)
        y = M.fondu(y, 0.12, 0.10)
        s = c["sens"]
        decal = 0.42 * (2 ** (2 / 12) if c["ton"] != "orange" else 1)
        out.append(cue(c["couvre"] - decal, crete(y, -17), "transition", 2, "lieu", f"couleur « {c['mot']} » : passage",
                       p0=-0.25 * s, p1=0.25 * s))
        th = crete(M.bande(coup_porte(), 70, 420), -15)
        out.append(cue(c["couvre"] - 0.008, harmoniques(th, -7), "coup", 2, "marque", f"couleur « {c['mot']} » : coup"))
    # filés réels : un souffle court, crête sur la jointure, de droite à gauche (le plan sort à gauche)
    for t0 in ev["file"]:
        x = M.son(1492)
        _att, pk = M.reperes(1492)
        y = M.fondu(M.bande(x[int((pk - 0.20) * SR):int((pk + 0.12) * SR)], 300, 9000), 0.08, 0.08)
        out.append(cue(t0 - 0.20, crete(y, -21), "transition", 3, "lieu", "filé", p0=0.25, p1=-0.25))
    return out


# ---------------------------------------------------------------------------------------------------- espace et règles
def habitacle():
    """Premières réflexions d'un habitacle (pare-brise, vitres, toit : 4-23 ms) et une queue courte (RT60 0,2 s)."""
    rng = np.random.default_rng(7)
    n = int(0.24 * SR)
    ir = np.zeros((n, 2))
    for ms, g, p in [(4.1, 0.55, -0.4), (6.8, 0.45, 0.5), (9.7, 0.38, -0.2), (13.3, 0.30, 0.3), (17.9, 0.24, -0.5),
                     (22.6, 0.2, 0.4)]:
        k = int(ms * SR / 1000)
        ir[k, 0] += g * np.cos((p + 1) * np.pi / 4)
        ir[k, 1] += g * np.sin((p + 1) * np.pi / 4)
    t = np.arange(n) / SR
    queue = rng.standard_normal((n, 2)) * np.exp(-6.91 * t / 0.2)[:, None] * 0.12
    queue[: int(0.012 * SR)] = 0
    for k in range(2):
        ir[:, k] += M.bande(queue[:, k], 400, 7000)
    return ir


def creuse(st, env, baisse_db=6.0):
    """Égaliseur dynamique : les bruitages perdent baisse_db entre 1 et 4 kHz quand la voix parle (env ∈ [0, 1])."""
    f, tt, Z = stft(st.T, fs=SR, nperseg=1024, noverlap=768)
    g = np.interp(tt, np.arange(len(env)) / SR, env)
    bande_v = (f >= 1000) & (f <= 4000)
    att = 1 - (1 - 10 ** (-baisse_db / 20)) * g
    Z[:, bande_v, :] *= att[None, None, :]
    _, y = istft(Z, fs=SR, nperseg=1024, noverlap=768)
    y = y.T[: len(st)]
    return np.pad(y, ((0, len(st) - len(y)), (0, 0)))


def tp_limite(x, plafond=-1.5):
    """Limiteur à anticipation, réglé jusqu'à ce que la crête vraie (mesurée ×4 par ebur128) soit ≤ plafond."""
    c = plafond
    for _ in range(6):
        y = M.limiteur(x, c)
        _i, tp = M.lufs(y)
        if tp <= plafond:
            return y, c, tp
        c -= (tp - plafond) + 0.1
    return y, c, tp


def apres_aac(x):
    """Crête vraie après encodage AAC 192 kb/s (ce que la plateforme reçoit)."""
    with subprocess.Popen(["ffmpeg", "-nostdin", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                           "-c:a", "aac", "-b:a", "192k", "-f", "adts", "-"], stdin=subprocess.PIPE,
                          stdout=subprocess.PIPE) as p:
        aac, _ = p.communicate(x.astype(np.float32).tobytes())
    d = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-f", "aac", "-i", "-", "-f", "f32le", "-ar", str(SR), "-ac",
                        "2", "-"], input=aac, capture_output=True, check=True).stdout
    return M.lufs(np.frombuffer(d, np.float32).astype(np.float64).reshape(-1, 2))[1]


# ---------------------------------------------------------------------------------------------------- mix
def mixer(nom, work=ICI):
    """work : le dossier work/ du projet (sa voix studio, sa timeline) ; montage-4k par défaut."""
    work = Path(work)
    tl = json.loads((work / f"{nom}-audio4.json").read_text(encoding="utf-8"))
    N = int(np.ceil(tl["duree"] * SR))
    ev = tl["evenements"]
    rap = [f"{nom} v4 : {tl['duree']:.2f} s (voix jusqu'à {tl['fin_voix']:.2f} s)"]

    # 1. voix
    vs = M.ff_lit(work / "voix_studio.wav")
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
    env = M.enveloppe_voix(voix)
    parle = env > 0.5

    # 2. repérage, collisions par famille (< 0,17 s), 2 bruitages au plus avec la voix
    cues = cues_habillage(ev, tl["sons"], tl["mots"][0]["s"]) + cues_illustrations(ev["broll"])
    logo, t_car = logo_sonore()
    M.ecrit(ICI / "logo-sonore.wav", logo)
    carte = tl.get("carte_fin", True)
    # la dernière note tombe sur la pose de la flèche : ressort ζ 0,8, d = 0,16 + 0,0045·√(diag 260 px), départ 0,10 s ;
    # premier passage à la cible : ωd·t = π − atan(ωd / (ζω))
    d = 0.16 + 0.0045 * np.sqrt(np.hypot(220, 140))
    w = 2 * np.pi / d
    wd = w * np.sqrt(1 - 0.8 ** 2)
    pose = 0.10 + (np.pi - np.arctan(wd / (0.8 * w))) / wd
    t_logo = ev["fin"] + pose - t_car
    if carte:   # le logo sonore termine la vidéo sur la carte de fin ; une vidéo courte boucle, sans logo
        cues.append(dict(t=t_logo, x=logo, famille="logo", prio=0, bus="marque",
                         note=f"logo sonore (pose à +{pose:.3f} s)", stereo=True, p0=0.0, p1=None))
    cues.sort(key=lambda c: c["t"])
    garde, retire = [], []
    for c in cues:
        if any(o is not c and o["famille"] == c["famille"] and o["prio"] < c["prio"] and abs(o["t"] - c["t"]) < 0.17
               for o in cues):
            retire.append((c, "collision dans la famille"))
        else:
            garde.append(c)
    final = []
    for c in garde:
        dur = len(c["x"]) / SR
        if c.get("ambiance"):
            final.append(c)
            continue
        simult = [o for o in final if not o.get("ambiance") and o["t"] < c["t"] + dur and c["t"] < o["t"] + len(o["x"]) / SR]
        if len(simult) >= 2 and parle[int(min(N - 1, max(0, c["t"]) * SR))]:
            retire.append((c, "3e bruitage sur la voix"))
        else:
            final.append(c)

    # 3. placement : bus marque (sec), bus lieu (habitacle) ; les ambiances recalées à ≥ 15 LU sous la voix
    marque, lieu = np.zeros((N, 2)), np.zeros((N, 2))
    vides = [r["t"] for r in ev["risque"]] + ([t_logo] if carte else [])
    lignes = []
    for c in final:
        x = c["x"] if c["stereo"] else pan(c["x"], c["p0"], c["p1"])
        i0 = int(round(c["t"] * SR))
        if i0 < 0:
            x, i0 = x[-i0:], 0
        x = x[: max(0, N - i0)].copy()
        ecart = None
        if c.get("ambiance"):
            # vide avant la phrase clé / le logo : l'ambiance s'éteint 0,2 s avant (fondu 0,08 s)
            for tv in vides:
                j = int((tv - 0.20 - c["t"]) * SR)
                if 0 < j < len(x):
                    k = int(0.08 * SR)
                    x[max(0, j - k):j] *= np.linspace(1, 0, min(k, j))[:, None]
                    x[j:] = 0
            m = parle[i0:i0 + len(x)]
            if m.sum() > SR * 0.1:
                v = db(voix[i0:i0 + len(x)][m])
                a = db(x.mean(1)[m])
                ecart = v - a
                if ecart < 15:
                    x *= 10 ** (-(15 - ecart) / 20)
                    ecart = 15.0
        (marque if c["bus"] == "marque" else lieu)[i0:i0 + len(x)] += x
        lignes.append((c, ecart))
    ir = habitacle()
    lieu = lieu + np.stack([np.convolve(lieu[:, k], ir[:, k])[:N] for k in range(2)], 1) * 10 ** (-9 / 20)
    bruitages = creuse(marque + lieu, env, 6.0)

    # 4. master : −14 LUFS, crête vraie ≤ −1,5 dBTP, puis contrôle après AAC
    mix = np.stack([voix, voix], 1) + bruitages
    for _ in range(3):
        i, _tp = M.lufs(mix)
        mix = mix * 10 ** ((-14 - i) / 20)
        mix, plafond, tp = tp_limite(mix, -1.5)
    i, tp = M.lufs(mix)
    tp_aac = apres_aac(mix)
    mono = np.stack([mix.mean(1), mix.mean(1)], 1)
    i_mono, _ = M.lufs(mono)
    (work / f"{nom}-stems4").mkdir(exist_ok=True)
    M.ecrit(work / f"{nom}-mix4.wav", mix)
    M.ecrit(work / f"{nom}-stems4" / "voix.wav", np.stack([voix, voix], 1))
    M.ecrit(work / f"{nom}-stems4" / "bruitages.wav", bruitages)

    # 5. rapport
    rap.append(f"master : {i:.1f} LUFS, crête vraie {tp:.1f} dBTP (plafond du limiteur {plafond:.1f}), "
               f"après AAC 192 kb/s {tp_aac:.1f} dBTP, somme mono {i_mono - i:+.1f} LU")
    rap.append(f"{len(lignes)} sons ; retirés : {len(retire)}")
    hp = butter(4, 800, "highpass", fs=SR, output="sos")
    for c, ecart in lignes:
        j = int(max(0, c["t"]) * SR)
        x = c["x"] if c["stereo"] else c["x"][:, None]
        x = x.mean(1)
        test = db(sosfilt(hp, x)) - db(x)
        extra = f"  écart voix {ecart:4.1f} LU" if ecart is not None else ""
        rap.append(f"  {c['t']:6.2f} s  {c['bus']:6s} {c['famille']:10s} {c['note']:38s} passe-haut 800 Hz {test:+5.1f} dB"
                   f"  voix {'oui' if parle[min(N - 1, j)] else 'non'}{extra}")
    for c, pourquoi in retire:
        rap.append(f"  retiré {c['t']:6.2f} s  {c['note']} ({pourquoi})")
    (work / f"{nom}-mix4.txt").write_text("\n".join(rap), encoding="utf-8")
    print("\n".join(rap))


if __name__ == "__main__":
    for n in sys.argv[1:]:
        mixer(n)
