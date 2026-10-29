"""Génère la version YouTube (16:9) : youtube/index.html + compositions/.

Ouverture à froid (decoupage_yt.OUVERTURE) → carton titre → le corps en chapitres (decoupage_yt.CORPS) → carton de fin.
Style viral (references/styles.md) : sous-titres complets en bas (le mot dit en orange), mots forts à côté du visage
(serif italique blanc, chiffres en capitales étroites rouges), intercalaires plein cadre bleu ou blanc à trame, cartes
dans un panneau arrondi posé du côté libre de l'image, bruitages sur les transitions et les chiffres ; musique si
projet.MUSIQUE.
Usage : python scripts/gen_yt.py
"""
import sys
import html
import json
import os
import subprocess
from pathlib import Path

import cartes
import cartes2
import cartes3
import cartes_h
import decoupage_yt
import gen
import noyau
import projet
from decoupage_yt import CORPS, OUVERTURE

for _flux in (sys.stdout, sys.stderr):  # la console Windows (cp1252) ne connaît ni ≥ ni →
    _flux.reconfigure(encoding="utf-8", errors="replace")

CORR = getattr(decoupage_yt, "CORR", {})
FORTS_OUV = getattr(decoupage_yt, "FORTS_OUV", [])
FORTS = getattr(decoupage_yt, "FORTS", [])
CARTES = getattr(decoupage_yt, "CARTES", [])
LITS = getattr(decoupage_yt, "LITS", [])
MUSIQUE = getattr(projet, "MUSIQUE", False)
STYLE = getattr(projet, "STYLE", "viral")
ZX, ZY, ZW, ZH = projet.ZONE
ORANGE, ROUGE_Y, BLEU = gen.ORANGE_YASS, gen.ROUGE_YASS, cartes.BLEU

RACINE = noyau.RACINE
PROJ = RACINE / "youtube"
W, H = 1920, 1080
OR, ROUGE = cartes.OR, cartes.ROUGE
TITRE_D = 2.8
FIN_D = 3.6
ECART = 20.0  # musique sous la voix (dB)

# l'habillage propre au projet (corrections, mots forts, cartes, lits musicaux) vit dans decoupage_yt.py


def loin(t):
    """Vrai si le sujet est loin dans cette scène (sous-titres « bas2 ») : on alterne alors moyen et serré, le large
    ne montrerait que la pièce."""
    return gen.scene(t)[5] == "bas2"


def cote_libre(t_src):
    """Le côté de l'image où il n'y a pas de visage (pour le panneau et les mots forts)."""
    return gen.cote_libre(t_src)


def cadres(segs):
    """Alterne large / serré à chaque coupe ; quand le sujet est loin : moyen / serré."""
    prev_sc, i = None, 0
    for s in segs:
        sc = gen.sujet_de(s["de"])  # même sujet = même dispositif de caméra
        if sc != prev_sc:
            i = 0
        if not s.get("cadre"):
            cycle = ["M", "C"] if loin(s["de"]) else ["W", "C"]
            s["cadre"] = cycle[i % 2]
        i += 1
        prev_sc = sc
    return segs


def fond_flou_h(t_src, sortie):
    sortie.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t_src:.3f}", "-i", gen.SRC, "-frames:v", "1",
                    "-vf", f"crop={ZW}:{ZH - ZH % 2}:{ZX}:{ZY},scale=1920:1080:flags=lanczos,gblur=sigma=30,eq=brightness=-0.04:saturation=1.1",
                    "-q:v", "3", str(sortie)], check=True)


def lier(rel):
    src, dst = RACINE / rel, PROJ / rel
    if not src.exists():
        print("  (absent pour l'instant)", rel)
        return
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists():
        if os.path.samefile(src, dst):
            return
        dst.unlink()
    os.link(src, dst)


# ---------------------------------------------------------------------------------------------------------------
def sous_titres_yt(cid, m, toks, caches, forts, chapitres, duree, panneaux=()):
    """Sous-titres complets (une ligne, le mot dit en orange) + mots forts à côté du visage + pastilles de chapitre.

    forts : [(t0, t1, lignes, cote)] déjà en temps montage (ouverture et corps).
    Style de la référence @yass.views (STYLE.md) : linéale grasse pour la liaison, serif italique blanc pour le mot
    qui porte l'émotion, capitales étroites (rouges pour un chiffre) qui frappent avec un léger flou."""
    fen_forts = []
    for t0, t1, lignes, cote in forts:
        seg = m.seg_a(t0)
        w_fin = max((t["e"] for t in toks if t["s"] <= t1 + 1e-3), default=t1)
        fen_forts.append({"debut": round(max(0, t0 - 0.05), 3),
                          "fin": round(max(t0 + 1.3, min(w_fin + 0.45, seg["start"] + seg["dur"] + 2.0)), 3),
                          "lignes": lignes, "cote": cote})
    # un mot fort ne se pose pas sous un panneau, ni sur un intercalaire plein cadre, et s'efface avant un chapitre
    # (« ça gâche la proximité » débordait de 1,5 s sur la pastille « 07 Le garder »)
    for f in fen_forts:
        for t_ch, _, _ in chapitres:
            if f["debut"] < t_ch < f["fin"]:
                f["fin"] = round(t_ch - 0.05, 3)
    gardes = []
    for f in sorted(fen_forts, key=lambda f: f["debut"]):
        for a, b, c in panneaux:
            if f["debut"] < a < f["fin"]:
                f["fin"] = round(a - 0.05, 3)
        for a, b in caches:
            if f["debut"] < a < f["fin"]:
                f["fin"] = round(a - 0.05, 3)
            if a - 0.1 <= f["debut"] < b and b - f["debut"] < 0.3:  # l'intercalaire finit juste : le mot fort le suit
                f["debut"] = round(b + 0.02, 3)
        dedans = any(a - 0.1 <= f["debut"] < b - 0.1 for a, b, c in panneaux) or any(a - 0.1 <= f["debut"] < b for a, b in caches)
        if dedans or f["fin"] - f["debut"] < 0.8:
            print("  mot fort retiré (panneau ou intercalaire au même moment) :", f["lignes"][-1][0])
            continue
        gardes.append(f)
    fen_forts = gardes
    for i in range(len(fen_forts) - 1):
        fen_forts[i]["fin"] = min(fen_forts[i]["fin"], fen_forts[i + 1]["debut"] - 0.05)
    muets = caches + [(f["debut"], f["fin"]) for f in fen_forts]
    vis = [t for t in toks if not any(a - 1e-3 <= t["s"] < b for a, b in muets)]
    # groupes de sous-titres : jusqu'à ~42 signes, coupés aux fins de phrase et aux pauses
    gs, cur = [], []
    for t in vis:
        if cur:
            der = cur[-1]
            long_ = sum(len(x["aff"]) + 1 for x in cur) + len(t["aff"])
            saut = t["src"] - der["src"] > 2.5 or t["src"] < der["src"]
            if der["fin_phrase"] or saut or t["s"] - der["e"] > 0.3 or long_ > 42 or any(der["s"] < a <= t["s"] for a, b in muets):
                gs.append(cur)
                cur = []
        cur.append(t)
    if cur:
        gs.append(cur)
    groupes = []
    for i, g in enumerate(gs):
        debut = g[0]["s"] - 0.05
        fin = min(gs[i + 1][0]["s"] - 0.05 if i + 1 < len(gs) else 1e9, g[-1]["e"] + 0.5)
        for a, b in muets:
            if debut < a < fin:
                fin = a
        groupes.append({"toks": g, "debut": round(max(debut, groupes[-1]["fin"] if groupes else 0), 3), "fin": round(fin, 3)})

    css = f"""
{cartes.POLICES}
#{cid} {{ position:absolute; inset:0; overflow:hidden; }}
.{cid}-st {{ position:absolute; left:160px; right:160px; bottom:124px; text-align:center; }}
.{cid}-st span.m {{ display:inline-block; font:700 46px/1.15 "Satoshi"; color:#fff; letter-spacing:-.2px; margin:0 .14em;
  text-shadow:0 1px 3px rgba(0,0,0,.6), 0 0 14px rgba(0,0,0,.45), 0 4px 18px rgba(0,0,0,.4); }}
.{cid}-voile {{ position:absolute; left:0; right:0; bottom:0; height:300px; background:linear-gradient(rgba(0,0,0,0), rgba(0,0,0,.42)); }}
.{cid}-fort {{ position:absolute; top:200px; width:720px; color:#fff; }}
.{cid}-fort.gauche {{ left:110px; text-align:left; }}
.{cid}-fort.droite {{ right:110px; text-align:right; }}
.{cid}-l {{ display:block; white-space:nowrap; }}
.{cid}-l.serif {{ font:italic 400 100px/1.02 "Instrument Serif"; letter-spacing:-1px;
  text-shadow:0 4px 18px rgba(0,0,0,.5), 0 1px 2px rgba(0,0,0,.3); }}
.{cid}-l.clash {{ font:400 140px/.92 "Impact Yass"; text-transform:uppercase; letter-spacing:0; margin:.04em 0;
  text-shadow:0 0 3px rgba(0,0,0,.3), 0 6px 26px rgba(0,0,0,.45); }}
.{cid}-l.or, .{cid}-l.rouge {{ color:{ROUGE_Y}; font-size:168px; }}
.{cid}-voile-cote {{ position:absolute; top:0; bottom:0; width:1000px; }}
.{cid}-voile-cote.gauche {{ left:0; background:linear-gradient(90deg, rgba(0,0,0,.58), rgba(0,0,0,.42) 60%, rgba(0,0,0,0)); }}
.{cid}-voile-cote.droite {{ right:0; background:linear-gradient(270deg, rgba(0,0,0,.58), rgba(0,0,0,.42) 60%, rgba(0,0,0,0)); }}
.{cid}-chap {{ position:absolute; left:104px; top:60px; padding:16px 26px 16px 22px; border-radius:999px; background:{BLEU};
  font:700 28px/1 "Satoshi"; letter-spacing:.14em; color:#fff; white-space:nowrap; box-shadow:0 10px 30px rgba(0,0,0,.25); }}
.{cid}-chap b {{ color:rgba(255,255,255,.62); margin-right:14px; }}
"""
    corps, js, sons = [], [], []
    corps.append(f'<div class="{cid}-voile" id="{cid}-vb"></div>')
    for i, g in enumerate(groupes):
        mots = []
        for t in g["toks"]:
            mots.append(f'<span class="m" data-t="{t["s"]:.3f}" data-e="{t["e"]:.3f}">{html.escape(t["aff"])}</span>')
        d = g["fin"] - g["debut"]
        if d <= 0.05:
            continue
        pan = next((c for a, b, c in panneaux if g["debut"] < b and g["fin"] > a), None)
        decale = {"gauche": ' style="left:840px; right:110px"', "droite": ' style="left:110px; right:840px"'}.get(pan, "")
        corps.append(f'<div class="clip {cid}-st" id="{cid}-s{i}" data-start="{g["debut"]:.3f}" data-duration="{d:.3f}" '
                     f'data-track-index="1"{decale}>{"".join(mots)}</div>')
    for k, f in enumerate(fen_forts):
        d = f["fin"] - f["debut"]
        if d <= 0.2:
            continue
        lignes = "".join(f'<span class="{cid}-l {style}" id="{cid}-f{k}l{j}">{html.escape(txt)}</span>'
                         for j, (txt, style) in enumerate(f["lignes"]))
        corps.append(f'<div class="clip {cid}-voile-cote {f["cote"]}" id="{cid}-fv{k}" data-start="{f["debut"]:.3f}" '
                     f'data-duration="{d:.3f}" data-track-index="2"></div>')
        corps.append(f'<div class="clip {cid}-fort {f["cote"]}" id="{cid}-f{k}" data-start="{f["debut"]:.3f}" '
                     f'data-duration="{d:.3f}" data-track-index="3">{lignes}</div>')
        js.append(f'  tl.fromTo("#{cid}-fv{k}", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.2, immediateRender: true }}, {f["debut"]:.3f});')
        js.append(f'  tl.to("#{cid}-f{k}", {{ opacity: 0, filter: "blur(8px)", duration: 0.14, ease: "power2.in" }}, {f["fin"] - 0.15:.3f});')
        js.append(f'  tl.to("#{cid}-fv{k}", {{ opacity: 0, duration: 0.15 }}, {f["fin"] - 0.15:.3f});')
        # chaque ligne entre à son tour (0,22 s d'écart) : serif par un flou, capitales par un flou qui se pose
        for j, (txt, style) in enumerate(f["lignes"]):
            t = f["debut"] + 0.05 + 0.22 * j
            if style.startswith("clash"):
                js.append(f'  tl.fromTo("#{cid}-f{k}l{j}", {{ opacity: 0, scale: 1.22, filter: "blur(16px)" }}, {{ opacity: 1, scale: 1, '
                          f'filter: "blur(0px)", duration: 0.22, ease: "power4.out", immediateRender: true }}, {t:.3f});')
                sons.append((t, "impact" if ("or" in style or "rouge" in style) else "tick"))
            else:
                js.append(f'  tl.fromTo("#{cid}-f{k}l{j}", {{ opacity: 0, filter: "blur(12px)" }}, {{ opacity: 1, filter: "blur(0px)", '
                          f'duration: 0.2, ease: "power2.out", immediateRender: true }}, {t:.3f});')
    for k, (t, nom, numero) in enumerate(chapitres):
        corps.append(f'<div class="clip {cid}-chap" id="{cid}-ch{k}" data-start="{t:.3f}" data-duration="3.2" '
                     f'data-track-index="4"><b>{numero:02d}</b>{html.escape(nom.upper())}</div>')
        js.append(f'  tl.fromTo("#{cid}-ch{k}", {{ x: -40, opacity: 0, filter: "blur(8px)" }}, {{ x: 0, opacity: 1, filter: "blur(0px)", '
                  f'duration: 0.4, ease: "expo.out", immediateRender: true }}, {t:.3f});')
        js.append(f'  tl.to("#{cid}-ch{k}", {{ x: -30, opacity: 0, duration: 0.22, ease: "power2.in" }}, {t + 2.95:.3f});')
        sons.append((t, "whoosh2"))
    script = "\n".join(js)
    doc = f"""<template id="{cid}-template">
<style>{css}</style>
<div id="{cid}" data-composition-id="{cid}" data-width="{W}" data-height="{H}">
{chr(10).join(corps)}
</div>
<script>
(function () {{
  function construire() {{
    var tl = gsap.timeline({{ paused: true }});
    var R = document.getElementById("{cid}");
    Array.prototype.forEach.call(R.querySelectorAll(".{cid}-l"), function (l) {{
      var rg = document.createRange(); rg.selectNodeContents(l);
      var w = rg.getBoundingClientRect().width, max = 720;
      if (w > max) l.style.fontSize = (parseFloat(getComputedStyle(l).fontSize) * max / w).toFixed(1) + "px";
    }});
    // le mot dit s'allume en orange, puis redevient blanc
    Array.prototype.forEach.call(R.querySelectorAll(".{cid}-st span.m"), function (m) {{
      var t = parseFloat(m.dataset.t), e = parseFloat(m.dataset.e);
      tl.set(m, {{ color: "{ORANGE}" }}, Math.max(0, t - 0.02));
      tl.set(m, {{ color: "#ffffff" }}, Math.max(t + 0.05, e));
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
    return doc, sons


def ecrire_srt(toks, chemin):
    """Sous-titres complets pour l'onglet « Sous-titres » de YouTube (tous les mots, même ceux des cartes)."""
    def hms(t):
        h, r = divmod(max(0.0, t), 3600)
        mi, s = divmod(r, 60)
        return f"{int(h):02d}:{int(mi):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}"
    blocs, cur = [], []
    for t in toks:
        saut = cur and (t["src"] - cur[-1]["src"] > 2.5 or t["src"] < cur[-1]["src"])
        if cur and (saut or cur[-1]["fin_phrase"] or t["s"] - cur[-1]["e"] > 0.35 or sum(len(x["aff"]) + 1 for x in cur) + len(t["aff"]) > 42):
            blocs.append(cur)
            cur = []
        cur.append(t)
    if cur:
        blocs.append(cur)
    lignes = []
    for i, b in enumerate(blocs, 1):
        fin = min(b[-1]["e"] + 0.3, blocs[i][0]["s"] - 0.02) if i < len(blocs) else b[-1]["e"] + 0.3
        lignes += [str(i), f"{hms(b[0]['s'])} --> {hms(fin)}", " ".join(x["aff"] for x in b), ""]
    chemin.write_text("\n".join(lignes), encoding="utf-8")


# ---------------------------------------------------------------------------------------------------------------
def generer():
    (PROJ / "compositions").mkdir(parents=True, exist_ok=True)
    for f in ("hyperframes.json", "AGENTS.md", "CLAUDE.md"):
        if not (PROJ / f).exists():
            (PROJ / f).write_bytes((RACINE / f).read_bytes())
    pkg = json.loads((RACINE / "package.json").read_text(encoding="utf-8"))
    pkg["name"] = "henritokane-youtube"
    (PROJ / "package.json").write_text(json.dumps(pkg, indent=2), encoding="utf-8")
    (PROJ / "meta.json").write_text(json.dumps({"id": "henritokane-youtube", "name": "henritokane-youtube"}, indent=2), encoding="utf-8")

    # le carton titre s'insère entre l'ouverture et le corps : deux montages, le second décalé
    segs_o = [dict(de=a, a=b, **o) for a, b, o in OUVERTURE]
    segs_c = cadres([dict(de=a, a=b, **o) for a, b, o in CORPS])
    mo = noyau.Montage(segs_o)
    mc = noyau.Montage(segs_c)
    decal = round(mo.duree + TITRE_D, 3)
    duree = round(decal + mc.duree + FIN_D, 3)

    # un montage unique pour les sous-titres et les cartes : on décale les plans du corps
    class Tout:
        pass
    m = Tout()
    m.segs = [dict(s) for s in mo.segs] + [dict(s, start=round(s["start"] + decal, 3), k=s["k"] + len(mo.segs)) for s in mc.segs]
    for s in m.segs[len(mo.segs):]:
        s["mots"] = s["mots"]
    m.duree = duree

    def edit(ts, dans=None):
        for s in (dans or m.segs[len(mo.segs):]):
            if s["in"] - 0.12 <= ts <= s["out"] + 1e-6:
                return round(s["start"] + max(0.0, ts - s["in"]), 3)
        # le début d'un mot peut précéder l'entrée calée sur la voix (Whisper colle la pause au mot) : début du plan
        for s in (dans or m.segs[len(mo.segs):]):
            if s["in"] - 0.8 <= ts < s["in"]:
                return round(s["start"], 3)
        raise ValueError(ts)

    def seg_a(t):
        for s in m.segs:
            if s["start"] <= t < s["start"] + s["dur"]:
                return s
        return m.segs[-1]

    m.edit = edit
    m.seg_a = seg_a

    # mots (corps seulement : l'ouverture garde ses sous-titres aussi)
    toks = []
    for liste, mm, off in ((mo.segs, mo, 0.0), (mc.segs, mc, decal)):
        ws = mm.mots_montage(CORR)
        out = []
        for w in ws:
            t = w["t"]
            if out and (t.startswith("'") or t.startswith("-")) and (w["seg"] == out[-1]["seg"] or w["s"] - out[-1]["e"] < 0.3):
                out[-1]["t"] += t
                out[-1]["e"] = round(w["e"] + off, 3)
                continue
            out.append(dict(w, s=round(w["s"] + off, 3), e=round(w["e"] + off, 3)))
        for o in out:
            o["aff"] = o["t"].replace("'", "’").strip()
            o["fin_phrase"] = o["t"].rstrip().endswith((".", "?", "!"))
            o["aff"] = o["aff"].rstrip(",;:")
        toks += [o for o in out if o["aff"]]

    utilises = {"assets/plans/h_W.mp4", "assets/plans/h_C.mp4", "assets/plans/h_M.mp4", "assets/fonds/henri-visage.jpg"}
    utilises |= {f"assets/fonts/{f.name}" for f in (RACINE / "assets" / "fonts").iterdir()}

    # --- cartes (les panneaux glissent en entier : la carte qu'ils contiennent ne glisse pas en plus)
    cartes.GLISSE = False
    hotes, sons, caches, panneaux_js, panneaux = [], [], [], [], []
    for k, (typ, a, b, p) in enumerate(CARTES):
        sa = next(s for s in m.segs[len(mo.segs):] if s["in"] - 0.8 <= a <= s["out"])
        sb = next(s for s in m.segs[len(mo.segs):] if s["in"] - 0.8 <= b <= s["out"])
        s0, s1 = sa["start"], round(sb["start"] + sb["dur"] + p.get("prolonge", 0.0), 3)
        if p.get("depuis") is not None:
            s0 = edit(p["depuis"])
        if typ == "vues":
            s0 = edit(a)
        if typ == "mots":
            s0, s1 = gen.fenetre(m, typ, a, b, p)
        if p.get("duree"):
            s1 = round(min(s1, s0 + p["duree"]), 3)
        d = round(s1 - s0, 3)
        n_typ = sum(1 for t2, *_ in CARTES[:k] if t2 == typ)
        cid = f"yt-{typ}" if n_typ == 0 else f"yt-{typ}{n_typ + 1}"
        panneau = p.get("panneau")
        fond_rel = f"assets/fonds/{cid}.jpg"
        if typ not in ("nom", "mots"):
            if panneau:
                gen.fond_flou(cid, sa["in"], RACINE / fond_rel)
            else:
                fond_flou_h(sa["in"], RACINE / fond_rel)
            utilises.add(fond_rel)
        loc = lambda t_src: round(edit(t_src) - s0, 3)
        p2 = {kk: (loc(v) if kk.startswith("t_") or kk in ("t1", "t2", "t3") else v) for kk, v in p.items()
              if kk not in ("prolonge", "depuis", "duree", "cote")}
        if typ == "etapes":
            doc = cartes_h.etapes(cid, d, fond_rel, p2["t1"], p2["t2"], p2["t3"])
            sl = [(0, "whoosh"), (p2["t1"], "pop"), (p2["t2"], "pop"), (p2["t3"], "impact")]
            caches.append((s0, s1))
        elif typ == "mots":
            morceaux = gen.morceaux(toks, s0, s1, p.get("forts", []))
            doc = cartes3.mots(cid, d, p.get("theme", "blanc"), morceaux, glisse=True, fmt="h")
            sl = [(0, "whoosh")] + [(t, "tick") for t, tx, st in morceaux if st == "serif"]
            caches.append((s0, s1))
        elif typ == "vues":
            doc = cartes2.stat_simple(cid, d, fond_rel, "2 500", "vues sur YouTube", "et pas mal de cash collecté")
            sl = [(0, "whoosh"), (0.2, "pop")]
        elif typ == "nom":
            doc = cartes.nom(cid, d, p["nom"], p["role"], fmt="h", visage=p.get("visage"), cote=cote_libre(sa["in"]))
            sl = [(0.05, "whoosh3")]
        else:
            doc, sl = gen.carte_html(typ, cid, d, fond_rel, p2, m, s0)
        sons += [(s0 + t, n) for t, n in sl]
        (PROJ / "compositions" / f"{cid}.html").write_text(doc, encoding="utf-8")
        if panneau:
            cote = p.get("cote") or cote_libre(sa["in"])
            panneaux.append((s0, s1, cote))
            x = 50 if cote == "gauche" else W - 50 - 756
            ty = p.get("decale", -189) - 40  # le panneau commence à 40 px du haut (coins arrondis, comme la référence)
            hotes.append(f'  <div class="panneau" id="pan{k}" style="left:{x}px; z-index:{30 + k}">'
                         f'<div class="panneau-in" style="transform:translateY({ty}px) scale(0.7)">'
                         f'<div id="{cid}" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" '
                         f'data-start="{s0:.3f}" data-duration="{d:.3f}" data-track-index="{6 + k % 2}" data-track-kind="graphics" '
                         f'data-width="1080" data-height="1920" style="position:absolute; inset:0"></div></div></div>')
            dx = -80 if cote == "gauche" else 80
            panneaux_js.append(f'  tl.fromTo("#pan{k}", {{ opacity: 0, x: {dx}, filter: "blur(14px)" }}, {{ opacity: 1, x: 0, filter: "blur(0px)", '
                               f'duration: 0.32, ease: "power3.out", immediateRender: true }}, {s0:.3f});')
            panneaux_js.append(f'  tl.to("#pan{k}", {{ opacity: 0, x: {dx // 2}, filter: "blur(10px)", duration: 0.18, ease: "power2.in" }}, {s1 - 0.19:.3f});')
        else:
            hotes.append(f'  <div id="{cid}" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" '
                         f'data-start="{s0:.3f}" data-duration="{d:.3f}" data-track-index="{6 + k % 2}" data-track-kind="graphics" '
                         f'data-width="{W}" data-height="{H}" style="position:absolute; inset:0; z-index:{30 + k}"></div>')
        # pendant un panneau, plan large : le visage reste visible de l'autre côté
        if panneau:
            for s in m.segs:
                if s["start"] < s1 and s["start"] + s["dur"] > s0:
                    s["cadre"] = "M" if loin(s["in"]) else "W"

    # carton titre et carton de fin
    fond_titre = "assets/fonds/yt-titre.jpg"
    fond_flou_h(projet.DUREE * 0.5, RACINE / fond_titre)
    utilises.add(fond_titre)
    (PROJ / "compositions" / "yt-titre.html").write_text(cartes_h.titre("yt-titre", TITRE_D, fond_titre, *projet.TITRE), encoding="utf-8")
    hotes.append(f'  <div id="yt-titre" data-composition-id="yt-titre" data-composition-src="compositions/yt-titre.html" '
                 f'data-start="{mo.duree:.3f}" data-duration="{TITRE_D:.3f}" data-track-index="8" data-track-kind="graphics" '
                 f'data-width="{W}" data-height="{H}" style="position:absolute; inset:0; z-index:50"></div>')
    caches.append((mo.duree, decal))
    sons += [(mo.duree, "whoosh"), (mo.duree + 0.05, "grave")]
    fin0 = round(decal + mc.duree, 3)
    fond_fin = "assets/fonds/yt-fin.jpg"
    fond_flou_h(projet.DUREE * 0.5, RACINE / fond_fin)
    utilises.add(fond_fin)
    (PROJ / "compositions" / "yt-fin.html").write_text(cartes_h.fin("yt-fin", FIN_D, fond_fin, *projet.FIN), encoding="utf-8")
    hotes.append(f'  <div id="yt-fin" data-composition-id="yt-fin" data-composition-src="compositions/yt-fin.html" '
                 f'data-start="{fin0:.3f}" data-duration="{FIN_D:.3f}" data-track-index="8" data-track-kind="graphics" '
                 f'data-width="{W}" data-height="{H}" style="position:absolute; inset:0; z-index:50"></div>')
    caches.append((fin0, duree))
    sons += [(fin0, "whoosh2")]

    # chapitres
    chapitres = []
    for s in m.segs[len(mo.segs):]:
        if s.get("chap"):
            chapitres.append((s["start"], s["chap"], len(chapitres) + 1))

    # sous-titres + mots forts (+ fichier .srt pour YouTube) ; les mots forts de l'ouverture se calent sur ses plans
    ecrire_srt(toks, PROJ / "sous-titres-youtube.srt")
    forts_t = []
    for liste, dans in ((FORTS_OUV, m.segs[:len(mo.segs)]), (FORTS, None)):
        for a, b, lignes in liste:
            try:
                t0, t1 = edit(a, dans), edit(b, dans)
            except ValueError:
                print("  mot fort hors montage :", lignes[-1][0])
                continue
            forts_t.append((t0, t1, lignes, cote_libre(m.seg_a(t0)["in"])))
    sid = "yt-sous-titres"
    doc_st, sons_st = sous_titres_yt(sid, m, toks, caches, forts_t, chapitres, duree, panneaux)
    (PROJ / "compositions" / f"{sid}.html").write_text(doc_st, encoding="utf-8")
    sons += sons_st

    # --- plans
    videos, anims = [], []
    for s in m.segs:
        k = s["k"]
        src = f"assets/plans/h_{s['cadre']}.mp4"
        videos.append(f'  <div class="cam" id="cam{k}" style="z-index:{1 + k % 2}"><div class="push" id="push{k}" data-layout-allow-overflow>'
                      f'<video id="v{k}" class="clip" src="{src}" '
                      f'data-start="{s["start"]:.3f}" data-duration="{s["dur"]:.3f}" data-media-start="{s["in"]:.3f}" '
                      f'data-track-index="0" data-has-audio="true" data-fade-in="{0 if s.get("contigu_avant") else 0.012}" data-fade-out="{0 if s.get("contigu_apres") else 0.025}" playsinline></video></div></div>')
        t0, d = s["start"], s["dur"]
        entree = s.get("entree", "cut")
        if entree == "file":
            anims.append(f'  tl.fromTo("#cam{k}", {{ xPercent: 6, filter: "blur(20px)" }}, {{ xPercent: 0, filter: "blur(0px)", duration: 0.22, ease: "power3.out", immediateRender: false }}, {t0:.3f});')
            sons.append((t0, "whoosh"))
        if s.get("choc"):
            anims.append(f'  secousse("#cam{k}", {t0:.3f});')
            anims.append(f'  tl.fromTo("#flash", {{ opacity: 0.8 }}, {{ opacity: 0, duration: 0.24, ease: "power2.out", immediateRender: false }}, {t0:.3f});')
            sons.append((t0, "grave"))
        if s["cadre"] in ("W", "M") and d > 1.2:
            anims.append(f'  tl.fromTo("#push{k}", {{ scale: 1 }}, {{ scale: 1.03, duration: {d:.3f}, ease: "none", immediateRender: false }}, {t0:.3f});')

    # --- musique : un lit par chapitre, fondus de 0,8 s, sous la voix de {ECART} dB (retirée le 27 oct.)
    audio = []
    bornes = [0.0]
    noms_chap = {nom: t for t, nom, _ in chapitres}
    for f, debut, chap in (LITS[1:] if MUSIQUE else []):
        bornes.append(noms_chap[chap])
    bornes.append(duree)
    for i, (f, debut_morceau, chap) in enumerate(LITS if MUSIQUE else []):
        a, b = bornes[i], bornes[i + 1]
        if i > 0:
            a -= 0.4
        if i + 1 < len(LITS):
            b += 0.4
        d = round(b - a, 3)
        reste = gen.duree_media(RACINE / "assets/audio/musique" / f) - debut_morceau
        if reste < d + 0.3:
            debut_morceau = max(0.0, round(debut_morceau - (d + 0.5 - reste), 3))
            print(f"  musique {f} : départ avancé à {debut_morceau:.1f} s (le lit dure {d:.1f} s)")
        vol = 10 ** (((-16.0 - ECART) - gen.lufs(f)) / 20)
        pts = [{"t": 0, "v": 0}, {"t": 0.8, "v": round(vol, 4)}, {"t": round(d - 0.8, 3), "v": round(vol, 4)}, {"t": d, "v": 0}]
        if i == 0:
            pts = [{"t": 0, "v": round(vol, 4)}, {"t": round(mo.duree, 3), "v": round(vol, 4)},
                   {"t": round(mo.duree + 0.2, 3), "v": round(vol * 3.2, 4)}, {"t": round(d - 0.6, 3), "v": round(vol * 3.2, 4)}, {"t": d, "v": 0}]
        if i == len(LITS) - 1:
            pts = [{"t": 0, "v": 0}, {"t": 0.8, "v": round(vol, 4)}, {"t": round(d - FIN_D, 3), "v": round(vol, 4)},
                   {"t": round(d - FIN_D + 0.3, 3), "v": round(vol * 3.0, 4)}, {"t": round(d - 1.2, 3), "v": round(vol * 3.0, 4)}, {"t": d, "v": 0}]
        lane = {"version": 1, "lanes": [{"target": "volume", "points": pts}]}
        audio.append(f'  <audio id="musique{i}" src="assets/audio/musique/{f}" data-start="{a:.3f}" data-duration="{d:.3f}" '
                     f'data-media-start="{debut_morceau:.3f}" data-track-index="{10 + i % 2}" data-volume="1" '
                     f"data-automation='{json.dumps(lane)}'></audio>")
        utilises.add(f"assets/audio/musique/{f}")
    # bruitages (dédoublonnés, une piste par chevauchement)
    sons.sort()
    uniques = []
    for t, n in sons:
        fam = n.rstrip("23")
        if any(abs(t - t2) < 0.15 and n2.rstrip("23") == fam for t2, n2 in uniques):
            continue
        uniques.append((t, n))
    pistes = []
    for i, (t, n) in enumerate(uniques):
        rel, v = gen.SFX[n]
        utilises.add(rel)
        pic, long = gen.crete(rel)
        debut = round(t + 1 / 30 - pic, 3)
        cd = 0.0
        if debut < 0:
            cd, debut = -debut, 0.0
        d = round(min(long - cd, duree - debut), 3)
        if d <= 0.05:
            continue
        piste = next((j for j, f in enumerate(pistes) if f <= debut), None)
        if piste is None:
            pistes.append(0.0)
            piste = len(pistes) - 1
        pistes[piste] = debut + d
        audio.append(f'  <audio id="sfx{i}" src="{rel}" data-start="{debut:.3f}" data-duration="{d:.3f}" data-media-start="{cd:.3f}" '
                     f'data-track-index="{12 + piste}" data-volume="{v * 0.8:.3f}"></audio>')

    doc = f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width={W}, height={H}" />
<title>{html.escape(projet.TITRE_LONG, quote=False)}</title>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js"></script>
<style>
* {{ margin:0; padding:0; box-sizing:border-box; }}
html, body {{ width:{W}px; height:{H}px; overflow:hidden; background:#0b0a09; }}
#root {{ position:relative; width:100%; height:100%; overflow:hidden; background:#0b0a09; }}
.cam {{ position:absolute; inset:0; overflow:hidden; }}
.push {{ position:absolute; inset:0; transform-origin:50% 45%; }}
.cam video {{ position:absolute; left:0; top:0; width:{W}px; height:{H}px; object-fit:cover; }}
.panneau {{ position:absolute; top:40px; width:756px; height:1000px; overflow:hidden; opacity:0; border-radius:30px;
  box-shadow:0 30px 80px rgba(0,0,0,.45), 0 4px 14px rgba(0,0,0,.2); }}
.panneau-in {{ position:absolute; left:0; top:0; width:1080px; height:1920px; transform:translateY(-189px) scale(0.7); transform-origin:0 0; }}
#flash {{ position:absolute; inset:0; background:#fff6ea; opacity:0; z-index:60; pointer-events:none; }}
</style>
</head>
<body>
<div id="root" data-composition-id="youtube" data-start="0" data-duration="{duree:.3f}" data-width="{W}" data-height="{H}">
{chr(10).join(videos)}
{chr(10).join(hotes)}
  <div id="{sid}" data-composition-id="{sid}" data-composition-src="compositions/{sid}.html" data-start="0" data-duration="{duree:.3f}" data-track-index="5" data-track-kind="captions" data-width="{W}" data-height="{H}" style="position:absolute; inset:0; z-index:45"></div>
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
{chr(10).join(panneaux_js)}
  window.__timelines["youtube"] = tl;
}})();
</script>
</body>
</html>
"""
    (PROJ / "index.html").write_text(doc, encoding="utf-8")
    for rel in sorted(utilises):
        lier(rel)
    print(f"YouTube : {duree:.1f} s ({duree / 60:.2f} min), {len(m.segs)} plans, {len(chapitres)} chapitres, "
          f"{len(CARTES)} cartes, {len(FORTS)} mots forts, {len(uniques)} bruitages")
    with open(noyau.WORK / "youtube-rapport.txt", "w", encoding="utf-8") as f:
        for s in m.segs:
            f.write(f"{s['start']:7.2f} → {s['start'] + s['dur']:7.2f}  source {s['in']:7.2f} → {s['out']:7.2f}  {s['cadre']}  {s.get('chap', '')}\n")


if __name__ == "__main__":
    generer()
