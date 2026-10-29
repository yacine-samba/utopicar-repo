"""Génère les compositions HyperFrames des extraits TikTok (clip-N.html + compositions/clip-N-*.html).

Usage : python scripts/gen.py clip-1 [clip-2 ...]
Le découpage est dans decoupage.py ; les cartes dans cartes.py ; les coupes se calent sur la voix (noyau.py).
"""
import csv
import html
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

import cartes
import cartes3
import noyau
import projet

# chiffre d'accroche, mot en cours (references/styles.md) ; le rouge de la référence (#C41616) vit sur un mur sombre :
# sur un mur gris clair il tombe à 2:1, d'où un rouge plus vif et un halo sombre
ROUGE_YASS, ORANGE_YASS = "#F02A2A", "#F2742B"
STYLE = getattr(projet, "STYLE", "viral")  # viral : habillage @yass.views ; sobre : sous-titres et coupes seuls
MUSIQUE = getattr(projet, "MUSIQUE", False)
from decoupage import CLIPS

for _flux in (sys.stdout, sys.stderr):  # la console Windows (cp1252) ne connaît ni ≥ ni →
    _flux.reconfigure(encoding="utf-8", errors="replace")

RACINE = noyau.RACINE
SRC = projet.SRC
ZX, ZY, ZW, ZH = projet.ZONE
W, H = 1080, 1920
OR, ROUGE = cartes.OR, cartes.ROUGE

# ---------------------------------------------------------------------------------------------------------------
# Sons : fichier, volume (gain linéaire), position de la crête dans le fichier (mesurée)
# ---------------------------------------------------------------------------------------------------------------
SFX = {
    "whoosh": ("assets/audio/sfx/whoosh.wav", 0.32),
    "whoosh2": ("assets/audio/sfx/hf-whoosh-short.mp3", 0.20),
    "whoosh3": ("assets/audio/sfx/hf-whoosh.mp3", 0.18),
    "impact": ("assets/audio/sfx/impact-court.mp3", 0.30),
    "grave": ("assets/audio/sfx/impact-grave.mp3", 0.34),
    "pop": ("assets/audio/sfx/hf-pop.mp3", 0.30),
    "ping": ("assets/audio/sfx/ping.wav", 0.22),
    "riser": ("assets/audio/sfx/hf-riser.mp3", 0.12),
    "click": ("assets/audio/sfx/click.wav", 0.35),
    "tick": ("assets/audio/sfx/hf-click-soft.mp3", 0.22),
}
_lufs_cache = {}


def lufs(fichier):
    """Loudness intégrée d'une musique (assets/audio/musique/), mesurée une fois."""
    if fichier not in _lufs_cache:
        r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(RACINE / "assets/audio/musique" / fichier), "-af",
                            "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
        lignes = [l for l in r.splitlines() if l.strip().startswith("I:")]
        _lufs_cache[fichier] = float(lignes[-1].split()[1]) if lignes else -14.0
    return _lufs_cache[fichier]


VOIX_LUFS = -16.0
ECART_MUSIQUE = 18.0  # dB sous la voix


def duree_media(p):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                         capture_output=True, text=True).stdout.strip()
    return float(out)


_crete_cache = {}


def crete(rel):
    """Temps de la crête d'un bruitage (s), pour la poser sur l'image."""
    if rel not in _crete_cache:
        p = RACINE / rel
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                             capture_output=True).stdout
        sig = np.abs(np.frombuffer(raw, np.int16).astype(np.float32))
        _crete_cache[rel] = (float(np.argmax(sig)) / 16000.0, len(sig) / 16000.0)
    return _crete_cache[rel]


# ---------------------------------------------------------------------------------------------------------------
def scene(t_src):
    """La scène de projet.SCENES qui contient t (la dernière si t dépasse)."""
    for sc in projet.SCENES:
        if sc[0] <= t_src < sc[1]:
            return sc
    return projet.SCENES[-1]


def sujet_de(t_src):
    """Le sujet suivi à t ; dans une scène sans sujet (caméra qui bouge), celui de la scène suivante, sinon de la
    précédente."""
    sc = scene(t_src)
    if sc[2]:
        return sc[2]
    i = projet.SCENES.index(sc)
    for s in projet.SCENES[i + 1:] + projet.SCENES[:i][::-1]:
        if s[2]:
            return s[2]
    return None


def cote_libre(t_src):
    """Le côté de l'image 16:9 où il n'y a pas de visage (panneaux et mots forts de la version longue)."""
    return scene(t_src)[4]


def bande(cadre, t_src):
    """Où poser les sous-titres : comme la référence, sur le torse. En plan moyen, quand le sujet est loin (visage
    vers la moitié de l'image), plus bas (« bas2 »), sinon la ligne tombe sur le menton."""
    return scene(t_src)[5] if cadre == "M" else "bas"


def fond_flou(cid, t_src, sortie):
    """Image du plan à t, recadrée en 9:16 sur le sujet, très floue (le fond des cartes)."""
    sujet = sujet_de(t_src)
    cx = ZW / 2
    if sujet and (noyau.WORK / "suivi" / f"{sujet}.csv").exists():
        rows = list(csv.DictReader(open(noyau.WORK / "suivi" / f"{sujet}.csv")))
        ts = np.array([float(r["t"]) for r in rows])
        cx = float(np.interp(t_src, ts, [float(r["cx"]) for r in rows]))
    hz = ZH - ZH % 2
    w = hz * 9 / 16
    x0 = int(min(max(cx - w / 2, 0), ZW - w)) + ZX
    sortie.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t_src:.3f}", "-i", SRC, "-frames:v", "1",
                    "-vf", f"crop={w:.0f}:{hz}:{x0}:{ZY},scale=1080:1920:flags=lanczos,gblur=sigma=34,eq=brightness=-0.04:saturation=1.1",
                    "-q:v", "3", str(sortie)], check=True)


# ---------------------------------------------------------------------------------------------------------------
def jetons(m, clip):
    """Mots affichés, fusionnés (j + 'ai → j’ai), avec style et position de la source."""
    ws = m.mots_montage(clip.get("corr"))
    out = []
    for w in ws:
        t = w["t"]
        if out and (t.startswith("'") or t.startswith("-")) and (w["seg"] == out[-1]["seg"] or w["s"] - out[-1]["e"] < 0.3):
            out[-1]["t"] += t
            out[-1]["e"] = w["e"]
            continue
        out.append(dict(w))
    for o in out:
        o["aff"] = o["t"].replace("'", "’").strip().rstrip(",.;:…").strip()
        o["fin_phrase"] = o["t"].rstrip().endswith((".", "?", "!"))
        o["style"] = "sans" if STYLE == "sobre" else clip.get("style", {}).get(o["src"], "sans")
    return [o for o in out if o["aff"]]


def cartes_du_clip(clip):
    """Les cartes du découpage ; en style sobre, sans les intercalaires mot à mot (grammaire du style viral)."""
    return [c for c in clip.get("cartes", []) if not (STYLE == "sobre" and c[0] == "mots")]


def fenetres_pleines(m, clip):
    """Fenêtres des cartes plein cadre (la surimpression et la carte vidéo laissent passer les sous-titres)."""
    return [fenetre(m, typ, a, b, p) for typ, a, b, p in cartes_du_clip(clip) if typ not in ("nom", "video")]


def fin_accroche_reelle(m, clip):
    """L'accroche s'arrête à la fin de son plan, ou plus tôt si une carte plein cadre arrive avant."""
    debuts = [a for a, b in fenetres_pleines(m, clip) if a > 0.3]
    return min([fin_accroche(m, clip["accroche"])] + debuts)


def masques(m, clip):
    """Fenêtres (temps montage) où les sous-titres ne paraissent pas : les cartes plein cadre, et l'accroche quand elle
    est posée en bas (elle prend la place des sous-titres, sur le torse)."""
    f = fenetres_pleines(m, clip)
    acc = clip.get("accroche")
    if acc and acc.get("bande", "haut") == "bas":
        f.append((0.0, fin_accroche_reelle(m, clip)))
    return f


def fenetre(m, typ, a, b, p):
    """Fenêtre (temps montage) d'une carte. Intercalaire mot à mot et carte vidéo : au mot près, du début du mot a au
    début du mot qui suit b (ou à la fin du plan de b) ; les autres cartes : sur les plans (fenetre_carte)."""
    if typ not in ("mots", "video"):
        return fenetre_carte(m, a, b, p.get("prolonge", 0.0), p.get("depuis"))
    s0 = round(max(0.0, m.edit(a) - 0.03), 3)
    seg = next(s for s in m.segs if s["in"] - 0.8 <= b <= s["out"])
    fin_plan = seg["start"] + seg["dur"]
    j, _ = noyau.mot(b)
    ms = noyau.mots()
    s1 = fin_plan
    if typ == "mots" and j + 1 < len(ms) and seg["in"] <= ms[j + 1]["s"] <= seg["out"]:
        s1 = min(fin_plan, m.edit(ms[j + 1]["s"]) - 0.03)
        if fin_plan - s1 < 0.45:
            s1 = fin_plan
    return s0, round(max(s1 + p.get("prolonge", 0.0), s0 + 1.0), 3)


def fin_accroche(m, acc):
    """L'accroche reste jusqu'à la fin du plan qui contient le mot « jusqua » (par défaut : le 1er plan)."""
    t = acc.get("jusqua")
    if t is None:
        return m.segs[0]["start"] + m.segs[0]["dur"]
    s = next(s for s in m.segs if s["in"] - 0.8 <= t <= s["out"])
    return round(s["start"] + s["dur"], 3)


def fenetre_carte(m, a, b, prolonge=0.0, depuis=None):
    """Du début du segment qui contient le mot a (ou du mot « depuis ») à la fin du segment du mot b (+ prolongation)."""
    sa = next(s for s in m.segs if s["in"] - 0.8 <= a <= s["out"])
    sb = next(s for s in m.segs if s["in"] - 0.8 <= b <= s["out"])
    debut = m.edit(depuis) if depuis is not None else sa["start"]
    return debut, round(min(m.duree, sb["start"] + sb["dur"] + prolonge), 3)


def groupes(toks, m, clip):
    """Découpe en groupes courts, comme un monteur : jusqu'à 3 petits mots, puis le mot fort qui ferme le groupe.

    Phrases : coupées à chaque changement de plan, à la ponctuation, aux pauses de 0,25 s et aux coupes manuelles.
    Lignes : les petits mots (Satoshi) au-dessus, le mot fort (serif ou Clash) en dessous, en grand.
    """
    coupe = set(clip.get("coupe", []))
    caches = masques(m, clip)
    visibles = [t for t in toks if not any(a - 1e-3 <= t["s"] < b for a, b in caches)]
    for t in visibles:
        sg = m.segs[t["seg"]]
        t["bande"] = bande(sg["cadre"], sg["in"])
    lng = lambda ts: sum(len(t["aff"]) + 1 for t in ts)

    # 1. phrases : la bande change (le texte saute de place), fin de phrase, pause, coupe manuelle, carte entre deux
    phrases = []
    for t in visibles:
        if phrases:
            der = phrases[-1][-1]
            carte_entre = any(der["s"] < a <= t["s"] for a, b in caches)
            saut = t["src"] - der["src"] > 2.5 or t["src"] < der["src"]  # autre passage de la source (autre phrase)
            if (t["bande"] != der["bande"] or der["fin_phrase"] or t["src"] in coupe or saut
                    or t["s"] - der["e"] > 0.25 or carte_entre):
                phrases.append([t])
            else:
                phrases[-1].append(t)
        else:
            phrases.append([t])
        t["ph"] = len(phrases) - 1

    # 2. paquets : petits mots jusqu'à ~16 signes, puis le mot fort (serif ou Clash) ferme le paquet
    paquets = []
    for ph in phrases:
        cur, i = [], 0
        while i < len(ph):
            t = ph[i]
            if t["style"] != "sans":
                run = [t]
                while i + 1 < len(ph) and ph[i + 1]["style"] == t["style"] and len(run) < 4:
                    i += 1
                    run.append(ph[i])
                if lng(cur) > 22:
                    paquets.append(cur)
                    cur = []
                paquets.append(cur + run)
                cur = []
            else:
                cur.append(t)
                suivant_fort = i + 1 < len(ph) and ph[i + 1]["style"] != "sans"
                if (lng(cur) >= 16 and not suivant_fort) or len(cur) >= 5:
                    paquets.append(cur)
                    cur = []
            i += 1
        if cur:
            paquets.append(cur)

    # 3. un paquet qui resterait moins de 0,35 s à l'écran rejoint son voisin (même bande, même phrase)
    def duree_vue(k):
        fin = paquets[k + 1][0]["s"] if k + 1 < len(paquets) else paquets[k][-1]["e"] + 0.45
        return fin - paquets[k][0]["s"]

    k = 0
    while k < len(paquets):
        if duree_vue(k) < 0.35 and len(paquets) > 1:
            p = paquets[k]
            nxt = paquets[k + 1] if k + 1 < len(paquets) else None
            prv = paquets[k - 1] if k > 0 else None
            if nxt and nxt[0]["ph"] == p[-1]["ph"] and lng(p + nxt) <= 34:
                paquets[k] = p + nxt
                del paquets[k + 1]
                continue
            if prv and prv[-1]["ph"] == p[0]["ph"] and lng(prv + p) <= 34:
                paquets[k - 1] = prv + p
                del paquets[k]
                k = max(0, k - 1)
                continue
        k += 1

    # 4. lignes : une ligne par style, dans l'ordre de la voix ; un seul mot fort par groupe (le dernier),
    #    les autres redeviennent des petits mots, sinon le groupe s'empile sur 4 lignes
    gs = []
    for p in paquets:
        forts = [i for i, t in enumerate(p) if t["style"] != "sans"]
        if forts:
            dernier = p[forts[-1]]["style"]
            j = forts[-1]
            while j - 1 >= 0 and p[j - 1]["style"] == dernier:
                j -= 1
            for i, t in enumerate(p):
                if t["style"] != "sans" and i < j:
                    t["style"] = "sans"
        lignes = []
        for t in p:
            kind = t["style"].split()[0]
            limite = {"clash": 14, "serif": 18}.get(kind, 30)
            if lignes and lignes[-1]["style"] == t["style"] and                     sum(len(x["aff"]) + 1 for x in lignes[-1]["toks"]) + len(t["aff"]) <= limite:
                lignes[-1]["toks"].append(t)
            else:
                lignes.append({"kind": kind, "style": t["style"], "toks": [t]})
        gs.append({"toks": p, "lignes": lignes, "bande": p[0]["bande"]})

    # 5. temps d'affichage
    for i, g in enumerate(gs):
        g["debut"] = round(max(g["toks"][0]["s"] - 0.06, gs[i - 1]["fin"] if i else 0.0), 3)
        nxt = gs[i + 1]["toks"][0]["s"] - 0.06 if i + 1 < len(gs) else None
        fin_nat = g["toks"][-1]["e"] + 0.45
        g["fin"] = round(min(nxt, fin_nat) if nxt is not None else fin_nat, 3)
        g["fin"] = max(g["fin"], g["toks"][-1]["s"] + 0.25)
        # quand la bande change au plan suivant, le texte s'arrête avec son plan
        seg_fin = m.segs[g["toks"][-1]["seg"]]
        fin_plan = seg_fin["start"] + seg_fin["dur"]
        if seg_fin["k"] + 1 < len(m.segs):
            suiv = m.segs[seg_fin["k"] + 1]
            if bande(suiv["cadre"], suiv["in"]) != g["bande"] and g["fin"] > fin_plan:
                g["fin"] = round(fin_plan, 3)
        # ne déborde jamais sur un masque
        for a, b in caches:
            if g["debut"] < a < g["fin"]:
                g["fin"] = round(a, 3)
    # le dernier groupe reste sur l'image figée de fin
    if gs and gs[-1]["toks"][-1]["seg"] == len(m.segs) - 1:
        gs[-1]["fin"] = round(max(gs[-1]["fin"], m.duree + clip.get("queue", 0.5) - 0.05), 3)
    return gs


def bandes_continues(gs):
    """Intervalles où un voile de lisibilité reste posé (une bande, sans trou de plus de 0,4 s)."""
    out = []
    for g in gs:
        if out and out[-1]["bande"] == g["bande"] and g["debut"] - out[-1]["fin"] < 0.4:
            out[-1]["fin"] = g["fin"]
        else:
            out.append({"bande": g["bande"], "debut": g["debut"], "fin": g["fin"]})
    return out


# ---------------------------------------------------------------------------------------------------------------
def html_sous_titres(cid, gs, duree, accroche, m, fin_acc=None):
    """Sous-titres au style de la référence @yass.views (STYLE.md) : une petite ligne en Inter qui se construit mot à
    mot, le dernier mot dit en orange ; le mot fort en grand serif italique blanc, qui entre par un flou ; l'accroche
    avec son chiffre en capitales étroites rouges."""
    css = f"""
{cartes.POLICES}
#{cid} {{ position:absolute; inset:0; overflow:hidden; }}
.{cid}-g {{ position:absolute; left:75px; width:865px; text-align:center; color:#fff; }}
.{cid}-g.haut {{ top:330px; }}
.{cid}-g.bas {{ top:1060px; }}
.{cid}-g.bas2 {{ top:1190px; }}
.{cid}-l {{ display:block; white-space:nowrap; text-shadow:0 4px 18px rgba(0,0,0,.45), 0 1px 2px rgba(0,0,0,.3); }}
.{cid}-l.sans {{ font:700 46px/1.3 "Satoshi"; letter-spacing:-.4px;
  text-shadow:0 1px 3px rgba(0,0,0,.6), 0 0 14px rgba(0,0,0,.45), 0 4px 18px rgba(0,0,0,.4); }}
.{cid}-l.serif, .{cid}-l.clash {{ font:italic 400 150px/1 "Instrument Serif"; letter-spacing:-1.5px; }}
.{cid}-l.rouge {{ color:{ROUGE_YASS}; }}
.{cid}-l.rouge-g {{ font:400 210px/.9 "Impact Yass"; color:{ROUGE_YASS}; text-transform:uppercase; letter-spacing:0; margin-top:.07em;
  text-shadow:0 0 3px rgba(0,0,0,.35), 0 0 40px rgba(0,0,0,.45), 0 6px 22px rgba(0,0,0,.4); }}
.{cid}-w {{ display:inline-block; }}
.{cid}-voile {{ position:absolute; left:0; right:0; pointer-events:none; }}
.{cid}-voile.haut {{ top:0; height:980px; background:linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.32) 45%, rgba(0,0,0,0)); }}
.{cid}-voile.bas, .{cid}-voile.bas2 {{ bottom:0; height:1100px; background:linear-gradient(rgba(0,0,0,0), rgba(0,0,0,.28) 30%, rgba(0,0,0,.42)); }}
.{cid}-ctx {{ position:absolute; left:0; right:0; text-align:center; font:700 30px/1 "Satoshi"; letter-spacing:.18em;
  text-transform:uppercase; color:rgba(255,255,255,.88); text-shadow:0 2px 12px rgba(0,0,0,.55); }}
.{cid}-acc {{ position:absolute; left:75px; width:865px; text-align:center; color:#fff; }}
"""
    if STYLE == "sobre":  # sous-titres propres : une linéale, pas de mot géant, accroche en blanc
        css += f"""
.{cid}-l.sans {{ font:700 52px/1.3 "Satoshi"; }}
.{cid}-acc .{cid}-l.serif {{ font:700 66px/1.15 "Satoshi"; letter-spacing:-.5px; }}
.{cid}-acc .{cid}-l.rouge-g {{ font:900 104px/1 "Satoshi"; color:#fff; text-transform:none; letter-spacing:-1.5px;
  text-shadow:0 2px 14px rgba(0,0,0,.55); }}
"""
    orange = "#FFFFFF" if STYLE == "sobre" else ORANGE_YASS
    corps, js = [], []
    # voiles
    for k, b in enumerate(bandes_continues(gs)):
        d = b["fin"] - b["debut"]
        corps.append(f'<div class="clip {cid}-voile {b["bande"]}" id="{cid}-v{k}" data-start="{b["debut"]:.3f}" '
                     f'data-duration="{d:.3f}" data-track-index="0"></div>')
        js.append(f'  tl.fromTo("#{cid}-v{k}", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.18, ease: "power2.out", immediateRender: true }}, {b["debut"]:.3f});')
        js.append(f'  tl.to("#{cid}-v{k}", {{ opacity: 0, duration: 0.14, ease: "power2.in" }}, {b["fin"] - 0.14:.3f});')
    # accroche (image 0 : visage + contexte + première ligne déjà posée)
    if accroche:
        fin_acc = fin_acc if fin_acc is not None else fin_accroche(m, accroche)
        haut = accroche.get("bande", "haut") == "haut"
        top_ctx = 262 if haut else 1050
        top_acc = 318 if haut else 1110
        lignes_html = []
        for k, ligne in enumerate(accroche["lignes"]):
            txt, style, t = ligne[:3]
            if len(ligne) > 3 and ligne[3] is not None:
                t = round(max(0.0, m.edit(ligne[3]) - 0.03), 3)
            lignes_html.append(f'<span class="{cid}-l {style}" id="{cid}-a{k}">{html.escape(txt)}</span>')
            if t:
                js.append(f'  tl.fromTo("#{cid}-a{k}", {{ scale: 1.25, opacity: 0, filter: "blur(16px)" }}, {{ scale: 1, opacity: 1, '
                          f'filter: "blur(0px)", duration: 0.22, ease: "power4.out", immediateRender: true }}, {t:.3f});')
        corps.append(f'<div class="clip {cid}-voile {"haut" if haut else "bas"}" id="{cid}-av" data-start="0" '
                     f'data-duration="{fin_acc:.3f}" data-track-index="0"></div>')
        corps.append(f'<div class="clip {cid}-ctx" id="{cid}-ctx" data-start="0" data-duration="{fin_acc:.3f}" '
                     f'data-track-index="1" style="top:{top_ctx}px">{html.escape(accroche["contexte"])}</div>')
        corps.append(f'<div class="clip {cid}-acc" id="{cid}-acc" data-start="0" data-duration="{fin_acc:.3f}" '
                     f'data-track-index="1" style="top:{top_acc}px">{"".join(lignes_html)}</div>')
        js.append(f'  tl.to("#{cid}-acc", {{ opacity: 0, filter: "blur(10px)", duration: 0.14, ease: "power2.in" }}, {fin_acc - 0.14:.3f});')
        js.append(f'  tl.to("#{cid}-ctx", {{ opacity: 0, duration: 0.14, ease: "power2.in" }}, {fin_acc - 0.14:.3f});')
    # groupes : un mot = une boîte ; les petits mots s'allument en orange à leur tour
    for i, g in enumerate(gs):
        lignes = []
        for l in g["lignes"]:
            mots_html = [f'<span class="{cid}-w" data-t="{t["s"]:.3f}">{html.escape(t["aff"])}</span>' for t in l["toks"]]
            lignes.append(f'<span class="{cid}-l {l["style"]}">{" ".join(mots_html)}</span>')
        d = g["fin"] - g["debut"]
        corps.append(f'<div class="clip {cid}-g {g["bande"]}" id="{cid}-g{i}" data-start="{g["debut"]:.3f}" '
                     f'data-duration="{d:.3f}" data-track-index="1">{"".join(lignes)}</div>')
        js.append(f'  tl.to("#{cid}-g{i}", {{ opacity: 0, duration: 0.08, ease: "power2.in" }}, {g["fin"] - 0.08:.3f});')
    script = "\n".join(js)
    return f"""<template id="{cid}-template">
<style>{css}</style>
<div id="{cid}" data-composition-id="{cid}" data-width="{W}" data-height="{H}">
{chr(10).join(corps)}
</div>
<script>
(function () {{
  function construire() {{
    var tl = gsap.timeline({{ paused: true }});
    var R = document.getElementById("{cid}");
    // une ligne trop large rétrécit (865 px au plus) ; mesuré une fois, après le chargement des polices
    Array.prototype.forEach.call(R.querySelectorAll(".{cid}-l"), function (l) {{
      var rg = document.createRange(); rg.selectNodeContents(l);
      var w = rg.getBoundingClientRect().width, max = 865;
      if (w > max) l.style.fontSize = (parseFloat(getComputedStyle(l).fontSize) * max / w).toFixed(1) + "px";
    }});
    // petite ligne : chaque mot entre par un léger flou au début du mot dans la voix, en orange, puis repasse en blanc
    // quand le mot suivant arrive ; mot fort : entre par un flou plus large et se pose
    // un seul mot orange à la fois dans le groupe : le dernier dit (les petits mots repassent en blanc au mot suivant,
    // même s'il est sur une autre ligne)
    Array.prototype.forEach.call(R.querySelectorAll(".{cid}-g"), function (g) {{
      var tous = g.querySelectorAll(".{cid}-w");
      for (var k = 0; k + 1 < tous.length; k++) {{
        if (tous[k].parentNode.classList.contains("sans"))
          tl.set(tous[k], {{ color: "#ffffff" }}, Math.max(0, parseFloat(tous[k + 1].dataset.t) - 0.03));
      }}
    }});
    Array.prototype.forEach.call(R.querySelectorAll(".{cid}-l"), function (l) {{
      var ws = l.querySelectorAll(".{cid}-w"), petit = l.classList.contains("sans");
      for (var k = 0; k < ws.length; k++) {{
        var w = ws[k], t = parseFloat(w.dataset.t);
        if (petit) {{
          tl.fromTo(w, {{ opacity: 0, y: 10, filter: "blur(6px)", color: "{orange}" }},
            {{ opacity: 1, y: 0, filter: "blur(0px)", color: "{orange}", duration: 0.12, ease: "power2.out", immediateRender: true }},
            Math.max(0, t - 0.03));
        }} else {{
          tl.fromTo(w, {{ opacity: 0, scale: 1.08, filter: "blur(14px)" }},
            {{ opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.24, ease: "power3.out", immediateRender: true }},
            Math.max(0, t - 0.04));
        }}
      }}
    }});
{script}
    window.__timelines["{cid}"] = tl;
  }}
  var F = ['400 100px "Impact Yass"', '700 40px "Satoshi"', 'italic 400 80px "Instrument Serif"'];
  Promise.all(F.map(function (f) {{ return document.fonts.load(f); }})).then(function () {{ return document.fonts.ready; }}).then(construire, construire);
}})();
</script>
</template>
"""


def dossier_projet(nom):
    """Dossier HyperFrames de l'extrait : tiktok-N/ (index.html, compositions/, assets/ en liens physiques)."""
    p = RACINE / nom.replace("clip-", "tiktok-")
    (p / "compositions").mkdir(parents=True, exist_ok=True)
    for f in ("hyperframes.json", "AGENTS.md", "CLAUDE.md"):
        if not (p / f).exists() and (RACINE / f).exists():
            (p / f).write_bytes((RACINE / f).read_bytes())
    pkg = json.loads((RACINE / "package.json").read_text(encoding="utf-8"))
    pkg["name"] = p.name
    (p / "package.json").write_text(json.dumps(pkg, indent=2), encoding="utf-8")
    (p / "meta.json").write_text(json.dumps({"id": p.name, "name": p.name}, indent=2), encoding="utf-8")
    return p


def lier(proj, rel):
    """Lien physique proj/rel → montage/rel (même fichier, aucune copie : les plans pèsent plusieurs Go)."""
    import os
    src, dst = RACINE / rel, proj / rel
    if not src.exists():
        print("  (absent pour l'instant)", rel)
        return
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists():
        if os.path.samefile(src, dst):
            return
        dst.unlink()
    os.link(src, dst)


def morceaux(toks, s0, s1, forts):
    """Les mots dits entre s0 et s1, en morceaux comme la référence : un mot à la fois, un petit mot de 3 lettres au plus
    accolé au suivant (« Et si », « à te ») ; serif italique pour les mots forts. Temps locaux à la carte."""
    ws = [t for t in toks if s0 - 0.05 <= t["s"] < s1 - 0.05]
    out, i = [], 0
    while i < len(ws):
        t = ws[i]
        txt, j = t["aff"], i
        cle = lambda w: w["aff"].lower().strip("«» ")
        while (j + 1 < len(ws) and cle(ws[j]) not in forts and len(txt) + 1 + len(ws[j + 1]["aff"]) <= 14
               and ((sum(ch.isalpha() for ch in ws[j]["aff"]) <= 3 and ws[j + 1]["s"] - ws[j]["s"] < 0.45)
                    or ws[j + 1]["s"] - ws[j]["s"] < 0.2)):  # mot trop bref pour être lu seul (« bout » 0,06 s)
            j += 1
            txt += " " + ws[j]["aff"]
        style = "serif" if any(cle(w) in forts for w in ws[i:j + 1]) else "sans"
        out.append((round(t["s"] - s0 - 0.02, 3), txt, style))
        i = j + 1
    return out


def carte_html(typ, cid, d, fond, p, m, s0):
    if typ == "mots":
        sl = [(0, "whoosh2" if not p.get("glisse") else "whoosh")] + [(t, "tick") for t, tx, st in p["morceaux"] if st == "serif"]
        return cartes3.mots(cid, d, p.get("theme", "blanc"), p["morceaux"], glisse=p.get("glisse", False)), sl
    if typ == "video":
        return (cartes3.video(cid, d, p.get("theme", "blanc"), f"assets/plans/v_{p.get('cadre', 'C')}.mp4", p["media"],
                              p.get("legende")),
                [(0, "whoosh3")])
    """HTML de la carte + ses bruitages (temps locaux à la carte)."""
    import cartes2
    if typ == "leads":
        return cartes.leads(cid, d, fond, p["t_personne"]), [(0, "whoosh"), (0.15, "pop"), (0.47, "pop"), (0.79, "pop"),
                                                             (p["t_personne"], "impact")]
    if typ == "nom":
        seg = m.seg_a(s0 + 1e-3)
        en_haut = bande(seg["cadre"], seg["in"]) in ("bas", "bas2")
        return cartes.nom(cid, d, p["nom"], p["role"], "haut" if en_haut else "bas", visage=p.get("visage")), [(0.05, "whoosh3")]
    if typ == "graphe":
        return (cartes.graphe(cid, d, fond, p["t_titre"], p["t_11"], p["t_17"]),
                [(0, "whoosh"), (p["t_titre"] - 1.0, "riser"), (p["t_titre"], "grave"), (p["t_11"], "pop"), (p["t_17"], "pop")])
    if typ == "carte":
        return cartes.carte(cid, d, fond, p.get("vers", "MALAISIE")), [(0, "whoosh2"), (0.15 + min(0.9, d * 0.5), "ping")]
    if typ == "chat":
        return cartes2.chat(cid, d, fond, p["t_texte"], p["texte"]), [(0, "whoosh"), (0.28, "click"), (0.56, "pop")]
    if typ == "audit":
        return (cartes2.audit(cid, d, fond, p["t_forts"], p["t_faibles"], p["t_ameliorer"], p.get("visage")),
                [(0, "whoosh"), (p["t_forts"], "pop"), (p["t_faibles"], "pop"), (p["t_ameliorer"], "pop")])
    if typ == "liste":
        items = [(txt, p[f"t_app{i}"], p[f"t_raye{i}"]) for i, txt in enumerate(p["textes"])]
        return cartes2.liste(cid, d, fond, items), [(0, "whoosh")] + [(it[2], "click") for it in items]
    if typ == "semaine":
        cases = [(k, p[f"t_case{i}"], lab) for i, (k, lab) in enumerate(p["cases"])]
        return (cartes2.semaine(cid, d, fond, p["titre"], cases, p.get("sous")),
                [(0, "whoosh")] + [(c[1], "pop") for c in cases])
    if typ == "horaires":
        return (cartes2.horaires(cid, d, fond, p["t_debut"], p["t_fin"]),
                [(0, "whoosh"), (p["t_debut"], "impact"), (p["t_fin"], "impact")])
    if typ == "duel":
        return (cartes2.duel(cid, d, fond, p["t_haut"], p["t_bas"], p.get("haut", "TON POTE"), p.get("bas", "pas ton patron")),
                [(0, "whoosh2"), (p["t_haut"], "impact"), (p["t_bas"], "pop")])
    if typ == "stat":
        return (cartes2.stat(cid, d, fond, p["t_1000"], p["t_8000"], p["t_label"], p["t_2000"]),
                [(0, "whoosh"), (p["t_1000"], "pop"), (p["t_8000"] - 1.0, "riser"), (p["t_8000"], "grave"), (p["t_2000"], "ping")])
    raise ValueError(typ)


def generer(nom):
    clip = CLIPS[nom]
    proj = dossier_projet(nom)
    segs = [dict(de=a, a=b, cadre=c, **o) for a, b, c, o in clip["segs"]]
    m = noyau.Montage(segs)
    toks = jetons(m, clip)
    gs = groupes(toks, m, clip)
    queue = clip.get("queue", 0.5)
    duree = round(m.duree + queue, 3)
    comp_dir = proj / "compositions"
    utilises = {"assets/plans/v_M.mp4", "assets/plans/v_C.mp4"}
    if MUSIQUE:
        utilises.add(f"assets/audio/musique/{clip['musique'][0]}")
    utilises |= {f"assets/fonts/{f.name}" for f in (RACINE / "assets" / "fonts").iterdir()}

    # --- cartes
    hotes, sons, fen_cartes = [], [], []
    liste_cartes = cartes_du_clip(clip)
    for k, (typ, a, b, p) in enumerate(liste_cartes):
        s0, s1 = fenetre(m, typ, a, b, p)
        if k == len(liste_cartes) - 1 and s1 >= m.duree - 1e-3:
            s1 = duree  # la dernière carte tient jusqu'à la fin
        d = round(s1 - s0, 3)
        n_typ = sum(1 for t2, *_ in liste_cartes[:k] if t2 == typ)
        cid = f"{nom}-{typ}" if n_typ == 0 else f"{nom}-{typ}{n_typ + 1}"
        fond_rel = f"assets/fonds/{cid}.jpg"
        if typ not in ("nom", "mots", "video"):
            seg0 = m.seg_a(s0 + 1e-3)
            fond_flou(cid, seg0["in"] + (s0 - seg0["start"]), RACINE / fond_rel)
            utilises.add(fond_rel)
        if p.get("visage"):
            utilises.add(p["visage"])
        loc = lambda t_src: round(m.edit(t_src) - s0, 3)
        p2 = {k: (loc(v) if k.startswith("t_") else v) for k, v in p.items() if k not in ("prolonge", "depuis")}
        if typ == "mots":
            p2["morceaux"] = morceaux(toks, s0, s1, p.get("forts", []))
        doc, sl = carte_html(typ, cid, d, fond_rel, p2, m, s0)
        sons += [(s0 + t, n) for t, n in sl]
        (comp_dir / f"{cid}.html").write_text(doc, encoding="utf-8")
        fen_cartes.append((s0, s1))
        hotes.append(f'  <div id="{cid}" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" '
                     f'data-start="{s0:.3f}" data-duration="{d:.3f}" data-track-index="{2 + k % 2}" '
                     f'data-track-kind="graphics" data-width="{W}" data-height="{H}" style="position:absolute; inset:0; z-index:{20 + k}"></div>')

    # --- sous-titres
    sid = f"{nom}-sous-titres"
    fin_acc = fin_accroche_reelle(m, clip) if clip.get("accroche") else None
    (comp_dir / f"{sid}.html").write_text(html_sous_titres(sid, gs, duree, clip.get("accroche"), m, fin_acc), encoding="utf-8")
    # le chiffre d'accroche arrive sur un souffle et un impact, comme « 1,6 MILLIARD » dans la référence (1,95–2,05 s)
    for ligne in (clip.get("accroche") or {}).get("lignes", []):
        if len(ligne) > 3 and ligne[3] is not None:
            t_rev = max(0.0, m.edit(ligne[3]) - 0.03)
            sons += [(max(0.0, t_rev - 0.12), "whoosh2"), (t_rev, "grave")]

    # --- plans (vidéo) + mouvements de caméra
    videos, anims = [], []
    for s in m.segs:
        k = s["k"]
        src = f"assets/plans/v_{s['cadre']}.mp4"
        videos.append(f'  <div class="cam" id="cam{k}" style="z-index:{1 + k % 2}">'
                      f'<div class="push" id="push{k}" data-layout-allow-overflow><video id="v{k}" class="clip" src="{src}" data-start="{s["start"]:.3f}" data-duration="{s["dur"]:.3f}" '
                      f'data-media-start="{s["in"]:.3f}" data-track-index="0" data-has-audio="true" '
                      f'data-fade-in="{0 if s.get("contigu_avant") else 0.012}" data-fade-out="{0 if s.get("contigu_apres") else 0.025}" playsinline></video></div></div>')
        t0, d = s["start"], s["dur"]
        entree = s.get("entree", "cut") if STYLE != "sobre" else "cut"
        if any(a + 0.05 < t0 < b - 0.05 for a, b in fen_cartes):
            entree = "cut"  # le plan commence sous une carte : ni filé ni bruitage, on ne le verrait pas
        pousse = s.get("pousse", 1 if s["cadre"] == "M" else 0)
        if entree == "zoom":
            anims.append(f'  tl.fromTo("#cam{k}", {{ scale: 1.24, filter: "blur(12px)" }}, {{ scale: 1, filter: "blur(0px)", duration: 0.32, ease: "power3.out", immediateRender: false }}, {t0:.3f});')
            sons.append((t0, "whoosh2"))
        elif entree == "file":
            anims.append(f'  tl.fromTo("#cam{k}", {{ xPercent: 9, filter: "blur(22px)" }}, {{ xPercent: 0, filter: "blur(0px)", duration: 0.22, ease: "power3.out", immediateRender: false }}, {t0:.3f});')
            sons.append((t0, "whoosh"))
        if pousse and d > 0.6:
            debut = t0 + (0.32 if entree == "zoom" else 0)
            anims.append(f'  tl.fromTo("#push{k}", {{ scale: 1 }}, {{ scale: 1.035, duration: {t0 + d - debut:.3f}, ease: "none", immediateRender: false }}, {debut:.3f});')
        if s.get("choc"):
            anims.append(f'  secousse("#cam{k}", {t0:.3f});')

    # --- fin : si aucune carte ne couvre la queue, la dernière image du dernier plan se fige (pas d'écran noir)
    if queue > 0.05 and not any(b >= duree - 1e-3 for a, b in fen_cartes):
        der = m.segs[-1]
        fige = f"assets/fonds/{nom}-fin.jpg"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{der['out'] + clip.get('fige', -0.05):.3f}", "-i",
                        str(RACINE / f"assets/plans/v_{der['cadre']}.mp4"), "-frames:v", "1", "-q:v", "2", str(RACINE / fige)],
                       check=True)
        utilises.add(fige)
        k = len(m.segs)
        echelle = 1.035 if der.get("pousse", 1 if der["cadre"] == "M" else 0) and der["dur"] > 0.6 else 1.0
        videos.append(f'  <div class="cam" id="cam{k}" style="z-index:3"><div class="push" id="push{k}" data-layout-allow-overflow>'
                      f'<img id="fige" class="clip" src="{fige}" alt="" data-start="{m.duree:.3f}" data-duration="{queue:.3f}" '
                      f'data-track-index="0" style="position:absolute; left:0; top:0; width:{W}px; height:{H}px; object-fit:cover"></div></div>')
        anims.append(f'  tl.fromTo("#push{k}", {{ scale: {echelle} }}, {{ scale: {echelle + 0.025:.3f}, duration: {queue:.3f}, '
                     f'ease: "power1.out", immediateRender: false }}, {m.duree:.3f});')

    # --- sons
    audio = []
    mus, mus_debut = clip["musique"]
    gain_db = (VOIX_LUFS - ECART_MUSIQUE) - (lufs(mus) if MUSIQUE else -14.0)
    vol = 10 ** (gain_db / 20)
    fin_voix = m.duree
    lane = {"version": 1, "lanes": [{"target": "volume", "points": [
        {"t": 0, "v": round(vol, 4)}, {"t": round(fin_voix, 3), "v": round(vol, 4)},
        {"t": round(fin_voix + 0.25, 3), "v": round(vol * 2.2, 4)}, {"t": round(duree, 3), "v": 0}]}]}
    if MUSIQUE:
        audio.append(f'  <audio id="musique" src="assets/audio/musique/{mus}" data-start="0" data-duration="{duree:.3f}" '
                     f'data-media-start="{mus_debut:.3f}" data-track-index="8" data-volume="1" '
                     f"data-automation='{json.dumps(lane)}'></audio>")
    if STYLE == "sobre":
        sons = []  # la voix seule (et la musique si elle est demandée)
    sons.sort()
    # un même bruitage deux fois à moins de 0,15 s (coupe + entrée de carte) : on n'en garde qu'un
    uniques = []
    for t, nomson in sons:
        famille = nomson.rstrip("23")
        if any(abs(t - t2) < 0.15 and n2.rstrip("23") == famille for t2, n2 in uniques):
            continue
        uniques.append((t, nomson))
    pistes_fin = []  # une piste par bruitage qui se chevauche (Studio les montre côte à côte)
    for i, (t, nomson) in enumerate(uniques):
        rel, v = SFX[nomson]
        utilises.add(rel)
        pic, long = crete(rel)
        debut = round(t + 1 / 30 - pic, 3)
        coupe_debut = 0.0
        if debut < 0:
            coupe_debut, debut = -debut, 0.0
        d = round(min(long - coupe_debut, duree - debut), 3)
        if d <= 0.05:
            continue
        piste = next((k for k, f in enumerate(pistes_fin) if f <= debut), None)
        if piste is None:
            pistes_fin.append(0.0)
            piste = len(pistes_fin) - 1
        pistes_fin[piste] = debut + d
        audio.append(f'  <audio id="sfx{i}" src="{rel}" data-start="{debut:.3f}" data-duration="{d:.3f}" '
                     f'data-media-start="{coupe_debut:.3f}" data-track-index="{9 + piste}" data-volume="{v}"></audio>')

    doc = f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width={W}, height={H}" />
<title>{html.escape(clip["titre"])}</title>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js"></script>
<style>
* {{ margin:0; padding:0; box-sizing:border-box; }}
html, body {{ width:{W}px; height:{H}px; overflow:hidden; background:#0b0a09; }}
#root {{ position:relative; width:100%; height:100%; overflow:hidden; background:#0b0a09; }}
.cam {{ position:absolute; inset:0; overflow:hidden; }}
.push {{ position:absolute; inset:0; transform-origin:50% 42%; }}
.cam video {{ position:absolute; left:0; top:0; width:{W}px; height:{H}px; object-fit:cover; }}
#flash {{ position:absolute; inset:0; background:#fff6ea; opacity:0; z-index:60; pointer-events:none; }}
</style>
</head>
<body>
<div id="root" data-composition-id="{nom}" data-start="0" data-duration="{duree:.3f}" data-width="{W}" data-height="{H}">
{chr(10).join(videos)}
{chr(10).join(hotes)}
  <div id="{sid}" data-composition-id="{sid}" data-composition-src="compositions/{sid}.html" data-start="0" data-duration="{duree:.3f}" data-track-index="5" data-track-kind="captions" data-width="{W}" data-height="{H}" style="position:absolute; inset:0; z-index:40"></div>
  <div id="flash"></div>
{chr(10).join(audio)}
</div>
<script>
(function () {{
  var tl = gsap.timeline({{ paused: true }});
  function secousse(sel, t) {{
    var dx = [9, -7, 6, -4, 3, -2, 0], dy = [-6, 5, -4, 3, -2, 1, 0];
    for (var i = 0; i < dx.length; i++) tl.to(sel, {{ x: dx[i], y: dy[i], duration: 0.04, ease: "none" }}, t + i * 0.04);
  }}
{chr(10).join(anims)}
{chr(10).join(clip.get("flashs_js", []))}
  window.__timelines["{nom}"] = tl;
}})();
</script>
</body>
</html>
"""
    (proj / "index.html").write_text(doc, encoding="utf-8")
    for rel in sorted(utilises):
        lier(proj, rel)
    # rapport lisible
    rap = [f"{nom} · {clip['titre']} · {duree:.2f} s · {len(m.segs)} plans · {len(gs)} groupes de sous-titres"]
    for s in m.segs:
        rap.append(f"  plan {s['k']:2d}  {s['start']:6.2f} → {s['start'] + s['dur']:6.2f}  source {s['in']:7.3f} → {s['out']:7.3f}  {s['cadre']}  {s.get('entree', 'cut')}")
    for g in gs:
        rap.append(f"  {g['debut']:6.2f} → {g['fin']:6.2f}  [{g['bande']}]  " + " / ".join(
            " ".join(t["aff"] for t in l["toks"]) + f" ({l['style']})" for l in g["lignes"]))
    (noyau.WORK / f"{nom}-rapport.txt").write_text("\n".join(rap), encoding="utf-8")
    print("\n".join(rap))


if __name__ == "__main__":
    for n in sys.argv[1:] or list(CLIPS):
        generer(n)
