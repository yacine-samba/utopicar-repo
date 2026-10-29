"""Génère les compositions HyperFrames v4 (langage design/LANGAGE-V4.md) des deux parties de « 4 000 € ».

Usage : python scripts/gen4.py clip-1 [clip-2]
Reprend le montage de la voix de la v3 (noyau.Montage, mêmes plans, mêmes coupes) et remplace l'habillage :
accroche, pastille unique, couleurs pleines, années sur la flèche, sous-titres en groupes calés sur les coupes,
filés réels, plans d'illustration sans poussée, carte de fin v4. Écrit aussi work/<clip>-audio4.json, la timeline des
événements que le mix hors ligne habille (work/mix4.py).
"""
import json
import math
import sys
from pathlib import Path

import gen as G
import noyau
import v4

W, H = 1080, 1920
FPS = 24
MOTS_OUTILS = {"le", "la", "les", "l'", "l’", "un", "une", "des", "du", "de", "d'", "d’", "à", "au", "aux", "en", "et",
               "ou", "mais", "ton", "ta", "tes", "ce", "cette", "c'est", "c’est", "qu'", "qu’", "que", "qui", "sur",
               "sous", "dans", "par", "pour", "si", "pas", "a", "je", "tu", "te", "t'", "t’", "elle", "il", "est",
               "plus", "très", "trop", "moins", "qu'elle", "qu’elle", "qu'il", "qu’il", "qu'on", "qu’on", "s'il", "s’il",
               "n'est", "n’est", "chaque", "tout", "toute", "tous", "toutes", "mon", "ma", "mes", "son", "sa", "ses",
               "leur", "leurs", "notre", "votre", "nos", "vos", "cet", "ces"}


COMPOSES = {("bas", "de"), ("de", "caisse"), ("tout", "le"), ("le", "monde"), ("vanne", "egr"), ("boîte", "robotisée"),
            ("joint", "de"), ("de", "culasse"), ("achat", "revente"), ("mécanique", "simple"), ("un", "peu"),
            ("jamais", "été"), ("propre", "compte")}


def norm(m):
    return m.lower().strip("…,.;:!?«» ").replace("’", "'")


def tok_outil(t):
    return t["aff"].lower().strip("…,.;:!?") in MOTS_OUTILS


# l'outil de mesure : à côté de ce script (skill montage-viral) ou dans outils/ du dossier de travail
OUTILS = next((p for p in (Path(__file__).resolve().parent, Path(__file__).resolve().parents[2] / "outils")
               if (p / "mesure_texte.js").exists()), Path(__file__).resolve().parent)


def mesureur(mots, police="700 58px Satoshi", espacement="-0.4px"):
    """Largeur réelle (px) d'un groupe de mots dans la police des sous-titres, mesurée dans Chromium (le moteur du
    rendu) : somme des mots + les espaces. Les mesures sont gardées dans work/largeurs-st.json."""
    cache = noyau.WORK / "largeurs-st.json"
    connu = json.loads(cache.read_text()) if cache.exists() else {}
    cle = f"{police}|{espacement}"
    table = connu.setdefault(cle, {})
    manque = sorted({m for m in mots if m not in table} | ({"a", "a a"} - set(table)))
    if manque:
        import subprocess, tempfile
        with tempfile.TemporaryDirectory() as d:
            e, o = Path(d) / "e.json", Path(d) / "o.json"
            e.write_text(json.dumps({"polices": {"Satoshi|700": str(G.RACINE / "assets" / "fonts" / "Satoshi-700.woff2")},
                                     "styles": {"st": {"font": police, "letterSpacing": espacement}},
                                     "textes": {"st": manque}}, ensure_ascii=False))
            subprocess.run(["node", str(OUTILS / "mesure_texte.js"), str(e), str(o)], check=True, timeout=180)
            table.update(json.loads(o.read_text())["st"])
        cache.write_text(json.dumps(connu, ensure_ascii=False))
    espace = table["a a"] - 2 * table["a"]
    return lambda ts: sum(table[t["aff"]] for t in ts) + espace * max(0, len(ts) - 1)


def groupes4(toks, caches, coupes, y, large, L):
    """Groupes de 2 à 5 mots tenant sur UNE ligne (largeur mesurée L(mots) ≤ colonne − marges du voile), coupés sur la
    syntaxe, jamais entre l'article et le nom ; ≥ 20 images quand la voix le permet ; cadre calé sur les coupes (règle
    des 12 images) ; un seul mot orange par groupe."""
    limite = large - 48 - 4       # le voile a 24 px de marge de chaque côté
    # une proposition dont le début est caché (sous une couleur pleine) n'est pas sous-titrée du tout : sa fin seule
    # (« pas, c'est la 208 ») se lirait de travers
    propositions, cur = [], []
    for t in toks:
        cur.append(t)
        if t["t"].rstrip().endswith((",", ".", "?", "!", "…", ":")):
            propositions.append(cur)
            cur = []
    if cur:
        propositions.append(cur)
    # masques (a, b, mots) : mots None = tout est caché (accroche sur le torse, plage d'années) ; sinon une couleur
    # pleine, qui porte elle-même ses mots (cachés) ; un autre mot dit sous elle s'affiche à sa réouverture s'il n'y
    # perd pas plus de 0,35 s, sinon il est caché (un sous-titre en retard se lit de travers)
    def etat(t):
        for a, b, mots in caches:
            if a - 1e-3 <= t["s"] < b - 0.10:
                if mots is None or norm(t["aff"]) in mots or b - t["s"] > 0.35:
                    return "cache", None
                return "retard", b
        return "vu", None
    vis = []
    for prop in propositions:
        etats = [etat(t) for t in prop]
        for t, (e, b) in zip(prop, etats):
            if e == "retard":
                t["retard"] = b
        reste = [t for t, (e, _b) in zip(prop, etats) if e != "cache"]
        if any(e == "cache" for e, _b in etats) and len(reste) <= 2:
            continue          # un reste d'un ou deux mots
        vis += reste
    phrases = []
    for t in vis:
        if phrases:
            der = phrases[-1][-1]
            entre = any(der["s"] < a <= t["s"] for a, b, _m in caches)
            saut = t["src"] - der["src"] > 2.5 or t["src"] < der["src"]
            if der["fin_phrase"] or t["s"] - der["e"] > 0.30 or entre or saut:
                phrases.append([t])
                continue
            phrases[-1].append(t)
        else:
            phrases.append([t])
    # découpage optimal de chaque phrase (programmation dynamique) : chaque groupe tient sur une ligne mesurée (ou deux
    # lignes coupées sur la syntaxe, si un groupe d'une ligne resterait moins de 20 images) ; le coût d'une coupure
    # vient de la syntaxe, celui d'un groupe de sa durée lisible et de son nombre de mots
    gs, br = [], {}
    for p_i, ph in enumerate(phrases):
        n = len(ph)
        # le dernier groupe d'une phrase s'arrête au plus tard au début de la phrase suivante (ou d'un masque)
        fin_max = phrases[p_i + 1][0]["s"] - 0.06 if p_i + 1 < len(phrases) else math.inf
        fin_max = min([fin_max] + [a for a, b, _m in caches if a > ph[-1]["s"]])

        def cout_coupure(j):            # coupure entre ph[j - 1] et ph[j]
            a, b = ph[j - 1], ph[j]
            ma, mb = a["aff"].lower().strip("…,.;:!?"), b["aff"].lower().strip("…,.;:!?")
            c = 0.0
            ponct = a["t"].rstrip().endswith((",", ";", ":", "…", ".", "?", "!"))
            if ponct:
                c -= 15                  # la virgule est la meilleure coupure
            if tok_outil(a) and not ponct:
                c += 100                 # jamais finir sur un article, une préposition, un pronom sujet (sauf « pas, »)
            if mb in ("de", "du", "des") or mb.startswith(("d'", "d’")):
                c += 30                  # complément du nom (« bas | de caisse »)
            nom_propre = lambda w: w[:1].isupper() or w[:1].isdigit()
            if nom_propre(a["aff"]) and nom_propre(b["aff"]) and not a["t"].rstrip().endswith((",", ".", ":")):
                c += 60                  # « Toyota | Yaris », « Clio | 3 », « 1.2 | PureTech »
            if (ma, mb) in COMPOSES:
                c += 100
            # une coupure tombe mieux avant un mot outil (début d'un groupe de sens : « fait tourner | ton stock ») qu'entre
            # deux mots pleins (« fait | tourner »)
            c += -5 if tok_outil(b) or mb[:3] in ("qu'", "qu’") else 8
            return c

        def duree(i, j):                # durée d'affichage du groupe ph[i:j]
            fin = ph[j]["s"] if j < n else min(ph[-1]["e"] + 0.45, fin_max)
            return fin - ph[i]["s"]

        def cout_groupe(i, j):
            m = j - i
            if m > 7:
                return math.inf, None
            c = {1: 18 if n > 1 else 0, 2: 0, 3: 0, 4: 0, 5: 4, 6: 10, 7: 16}[m]
            d = duree(i, j)
            if d < 20 / FPS:
                c += 20 + 60 * (20 / FPS - d) / (20 / FPS)
            if L(ph[i:j]) <= limite:
                return c, None
            # deux lignes : la meilleure coupure syntaxique dont les deux lignes tiennent, la plus équilibrée
            best = None
            for k in range(i + 1, j):
                l1, l2 = L(ph[i:k]), L(ph[k:j])
                if l1 <= limite and l2 <= limite:
                    cc = cout_coupure(k) + abs(l1 - l2) / 60 + (10 if min(k - i, j - k) == 1 else 0)
                    if best is None or cc < best[0]:
                        best = (cc, k - i)
            if best is None:
                return math.inf, None
            return c + 25 + max(0.0, best[0]), best[1]

        meilleur = [0.0] + [math.inf] * n
        arriere = [None] * (n + 1)
        for j in range(1, n + 1):
            for i in range(max(0, j - 7), j):
                if meilleur[i] == math.inf:
                    continue
                cg, k2 = cout_groupe(i, j)
                c = meilleur[i] + cg + (cout_coupure(j) if j < n else 0.0)
                if c < meilleur[j]:
                    meilleur[j], arriere[j] = c, (i, k2)
        bornes, j = [], n
        while j > 0:
            i, k2 = arriere[j]
            bornes.append((i, j, k2))
            j = i
        for i, j, k2 in reversed(bornes):
            gs.append(ph[i:j])
            if k2:
                br[len(gs) - 1] = k2
    out = []
    for i, g in enumerate(gs):
        debut = max(g[0]["s"] - 0.06, out[-1]["fin"] if out else 0.0, max(t.get("retard", 0.0) for t in g))
        nxt = gs[i + 1][0]["s"] - 0.06 if i + 1 < len(gs) else None
        fin = g[-1]["e"] + 0.45
        if nxt is not None:
            fin = min(max(fin, debut + 20 / FPS), nxt)
        for a, b, _m in caches:        # jamais sur une couleur pleine, une accroche, une plage d'années
            if debut < a < fin:
                fin = a
        # cadre calé sur les coupes : ouvre sur la coupe si elle tombe moins de 12 images avant ; tient jusqu'à 2
        # images avant une coupe qui tombe moins de 12 images après sa fin (si le groupe suivant commence après)
        for c in coupes:
            if 0 < debut - c < 12 / FPS and (not out or out[-1]["fin"] <= c):
                debut = c
            if 0 < c - fin < 12 / FPS and (nxt is None or nxt >= c) and not any(a - 1e-3 <= c <= b for a, b, _m in caches):
                fin = c - 2 / FPS
        accents = [k for k, t in enumerate(g) if t.get("accent")]
        mots = [{"t": t["s"], "aff": t["aff"], "accent": bool(accents) and k == accents[-1]} for k, t in enumerate(g)]
        out.append({"debut": round(debut, 3), "fin": round(fin, 3), "y": y, "large": large, "voile": True,
                    "mots": mots, "br": br.get(i)})
    # un éclair de moins de 0,3 s se lit mal, un mot outil seul (« sur ») ne dit rien : on ne les montre pas
    return [g for g in out if g["fin"] - g["debut"] >= 0.30
            and not all(norm(w["aff"]) in MOTS_OUTILS for w in g["mots"])]


def generer(nom, clip=None, proj=None):
    """nom : identifiant (clip-1, court-208…) ; clip : son découpage (par défaut decoupage4.CLIPS[nom]) ; proj : dossier
    HyperFrames (par défaut tiktok-N du projet). Les vidéos courtes n'ont ni carte de fin (« fin »: False, la boucle
    reprend l'image 0) ni, parfois, de pastille."""
    if clip is None:
        from decoupage4 import CLIPS
        clip = CLIPS[nom]
    proj = proj or G.dossier_projet(nom)
    (proj / "compositions").mkdir(parents=True, exist_ok=True)
    comp_dir = proj / "compositions"
    for f in comp_dir.glob("*.html"):
        f.unlink()
    segs = [dict(de=a, a=b, cadre=c, **o) for a, b, c, o in clip["segs"]]
    m = noyau.Montage(segs)
    toks = G.jetons(m, {"corr": clip.get("corr"), "style": {}})
    for t in toks:
        t["accent"] = any(abs(t["src"] - a) < 0.035 for a in clip["accents"])
    queue = clip["queue"]
    duree = round(m.duree + queue, 3)
    E = m.edit
    utilises = {f"assets/plans/v_{s['cadre']}.mp4" for s in m.segs} | \
        {f"assets/fonts/{f.name}" for f in (G.RACINE / "assets" / "fonts").iterdir()}
    if clip.get("fin", True):
        utilises.add("assets/brand/utopicar-logo-ligne-fond-sombre.svg")
    hotes, evenements = [], {"broll": [], "couleur": [], "note": [], "risque": [], "annees": [], "file": [],
                             "accroche": 0.0, "fin": m.duree}

    def hote(cid, s0, d, z, piste, kind="graphics"):
        hotes.append(f'  <div id="{cid}" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" '
                     f'data-start="{s0:.3f}" data-duration="{d:.3f}" data-track-index="{piste}" data-track-kind="{kind}" '
                     f'data-width="{W}" data-height="{H}" style="position:absolute; inset:0; z-index:{z}"></div>')

    caches, coupes = [], [s["start"] for s in m.segs[1:]]

    # --- accroche (déjà posée à l'image 0)
    acc = clip["accroche"]
    fin_acc = round(E(acc["fin_src"]) - 0.03, 3)
    # l'accroche est sortie avant que la pastille entre au même endroit (la pastille glisse dès E(1er item) − 0,10)
    if clip.get("pastille"):
        fin_acc = round(min(fin_acc, E(clip["pastille"]["items"][0][0]) - 0.14), 3)
    cid = f"{nom}-accroche"
    (comp_dir / f"{cid}.html").write_text(v4.accroche(
        cid, fin_acc, acc["contexte"], acc["chiffre"], acc["promesse"], acc["accent"], acc["y"], tuple(acc["tailles"]),
        fin_t=fin_acc, derriere=acc.get("derriere", False), ecart_chiffre=acc.get("ecart_chiffre", 40),
        ordre=acc.get("ordre")), encoding="utf-8")
    hote(cid, 0.0, fin_acc, 20, 3)
    detour = None
    if acc.get("derriere"):
        detour = acc.get("detour") or f"assets/plans/detour-{nom}.webm"
        utilises.add(detour)
    if not acc.get("derriere") and acc["y"] > 700:
        caches.append((0.0, fin_acc, None))   # l'accroche prend la place des sous-titres sur le torse

    # --- couleurs pleines, sur les coupes de chapitre
    for k, (iseg, mot, ton, sens) in enumerate(clip.get("couleurs", [])):
        # un entier : la couleur couvre sur la coupe qui ouvre ce segment ; un réel : sur ce mot (temps de la source)
        seam = m.segs[iseg]["start"] if isinstance(iseg, int) else E(iseg)
        t_couvre, tient = 0.32, 0.42
        s0 = round(seam - 0.02 - t_couvre - 0.02, 3)
        d = round(t_couvre + 0.02 + tient + 0.30 + 0.02, 3)
        cid = f"{nom}-couleur{k + 1}"
        (comp_dir / f"{cid}.html").write_text(v4.couleur(cid, d, mot, t_couvre + 0.02, t_couvre + 0.02 + tient, ton=ton,
                                                         sens=sens), encoding="utf-8")
        hote(cid, s0, d, 50, 6)
        # les sous-titres restent jusqu'à ce que l'aplat couvre (il passe devant eux) ; sous la couleur, ses mots à elle
        caches.append((s0 + t_couvre + 0.02 - 0.05, s0 + t_couvre + 0.02 + tient + 0.18,
                       {norm(x) for x in mot.replace("/", " ").split()}))
        evenements["couleur"].append({"debut": s0, "couvre": round(s0 + t_couvre + 0.02, 3),
                                      "ouvre": round(s0 + t_couvre + 0.02 + tient, 3), "sens": sens, "ton": ton,
                                      "mot": mot})

    # --- plages d'années
    for k, (a, b, an1, an2, ta, tb) in enumerate(clip.get("annees", [])):
        s0 = round(E(a) - 0.04, 3)
        s1 = round(E(tb) + 0.95, 3)
        cid = f"{nom}-annees{k + 1}"
        (comp_dir / f"{cid}.html").write_text(v4.annees(cid, s1 - s0, an1, an2, E(ta) - s0, E(tb) - s0), encoding="utf-8")
        hote(cid, s0, s1 - s0, 30, 7)
        caches.append((s0, s1, None))
        evenements["annees"].append({"a": round(E(ta), 3), "b": round(E(tb), 3)})

    # --- plans d'illustration
    for k, (a, b, nom_clip, plan) in enumerate(clip.get("brolls", [])):
        s0 = round(max(0.0, E(a) - 0.03), 3)
        sb = next(s for s in m.segs if s["in"] - 0.8 <= b <= s["out"])
        s1 = round(sb["start"] + sb["dur"] if plan else E(b) - 0.03, 3)
        cid = f"{nom}-broll{k + 1}"
        rel = f"assets/broll/{nom_clip}.mp4"
        utilises.add(rel)
        (comp_dir / f"{cid}.html").write_text(v4.broll(cid, s1 - s0, rel), encoding="utf-8")
        hote(cid, s0, s1 - s0, 12, 2 + k % 2)
        coupes += [s0, s1]
        evenements["broll"].append({"debut": s0, "fin": s1, "clip": nom_clip})

    # --- la pastille (objet porteur)
    pa = clip.get("pastille")
    if pa:
        s0 = round(E(pa["items"][0][0]) - 0.16, 3)
        s1 = round(min(E(pa["fin_src"]), m.duree + clip["queue"]), 3)
        cid = f"{nom}-pastille"
        items = [(round(E(t) - s0, 3), n, txt) for t, n, txt in pa["items"]]
        (comp_dir / f"{cid}.html").write_text(v4.pastille(cid, s1 - s0, items, pa["y"]), encoding="utf-8")
        hote(cid, s0, s1 - s0, 45, 4)
        for k, (t, n, txt) in enumerate(pa["items"]):
            (evenements["risque"] if n == "x" else evenements["note"]).append({"t": round(E(t), 3), "rang": k})

    # --- sous-titres
    y = clip["y_st"]
    large = 620 if y + 80 > 1150 else 800      # sous y = 1150, la colonne 230-850 (rail des boutons Instagram)
    # la taille suit la colonne : 58 px dans 800 px ; dans la colonne étroite (−22 %), 54 px, pour garder des groupes
    # de 3-4 mots sur une ligne
    taille_st = 58 if large >= 800 else 54
    gs = groupes4(toks, caches, sorted(set(round(c, 3) for c in coupes)), y, large,
                  mesureur([t["aff"] for t in toks], police=f"700 {taille_st}px Satoshi"))
    for g in gs:
        g["taille"] = taille_st
    sid = f"{nom}-sous-titres"
    (comp_dir / f"{sid}.html").write_text(v4.sous_titres(sid, gs), encoding="utf-8")
    hote(sid, 0.0, duree, 40, 5, kind="captions")

    # --- carte de fin (pas dans les vidéos courtes : la boucle reprend l'image 0)
    if clip.get("fin", True):
        cid = f"{nom}-fin"
        (comp_dir / f"{cid}.html").write_text(v4.fin(cid, queue), encoding="utf-8")
        hote(cid, m.duree, queue, 70, 8)

    # --- plans du visage, filés réels entre deux prises de même cadre
    videos, anims = [], []
    fen_couleurs = [(c["debut"], c["ouvre"] + 0.3) for c in evenements["couleur"]]
    fen_broll = [(b["debut"], b["fin"]) for b in evenements["broll"]]
    T_OUT, T_IN = 0.10, 0.18
    filés = set()
    for s in m.segs[1:]:
        t0 = s["start"]
        sous_carte = any(a - 0.05 <= t0 <= b + 0.05 for a, b in fen_couleurs + fen_broll)
        if s.get("entree") == "file" and not sous_carte:
            filés.add(s["k"])
    for s in m.segs:
        k = s["k"]
        debut, dur, mstart = s["start"], s["dur"], s["in"]
        if k in filés:            # l'image entrante arrive avant la jointure (T_OUT plus tôt)
            debut, dur, mstart = debut - T_OUT, dur + T_OUT, mstart - T_OUT
        if k + 1 in filés:        # l'image sortante continue après la jointure (T_IN de plus)
            dur += T_IN
        if k == m.segs[-1]["k"] and not clip.get("fin", True):
            dur += queue          # sans carte de fin, le dernier plan tient jusqu'à la dernière image (pas de noir)
        videos.append(f'  <div class="cam" id="cam{k}" style="z-index:{1 + k % 2}"><video id="v{k}" class="clip" '
                      f'src="assets/plans/v_{s["cadre"]}.mp4" data-start="{debut:.3f}" data-duration="{dur:.3f}" '
                      f'data-media-start="{mstart:.3f}" data-track-index="{0 if k % 2 == 0 else 10}" data-has-audio="true" playsinline></video></div>')
        if k in filés:
            t0 = s["start"]
            d_out = W * T_OUT / (T_OUT + T_IN)     # même vitesse de pointe des deux côtés de la jointure
            anims.append(f'  tl.fromTo("#cam{k - 1}", {{ x: 0 }}, {{ x: {-d_out:.1f}, duration: {T_OUT}, ease: "power3.in", immediateRender: false }}, {t0 - T_OUT:.3f});')
            anims.append(f'  tl.fromTo("#cam{k - 1}", {{ x: {-d_out:.1f} }}, {{ x: {-W}, duration: {T_IN}, ease: "power3.out", immediateRender: false }}, {t0:.3f});')
            anims.append(f'  tl.fromTo("#cam{k}", {{ x: {W} }}, {{ x: {W - d_out:.1f}, duration: {T_OUT}, ease: "power3.in", immediateRender: false }}, {t0 - T_OUT:.3f});')
            anims.append(f'  tl.fromTo("#cam{k}", {{ x: {W - d_out:.1f} }}, {{ x: 0, duration: {T_IN}, ease: "power3.out", immediateRender: false }}, {t0:.3f});')
            evenements["file"].append(round(t0, 3))
    if detour:
        videos.append(f'  <video id="detour" class="clip" src="{detour}" data-start="0" data-duration="{fin_acc:.3f}" '
                      f'data-media-start="0" data-track-index="9" muted playsinline data-layout-allow-occlusion '
                      f'style="position:absolute; left:0; top:0; width:{W}px; height:{H}px; z-index:25"></video>')

    # --- timeline des événements pour le mix hors ligne
    sons = [(E(t), n) for t, n in clip.get("sons", [])]
    (noyau.WORK / f"{nom}-audio4.json").write_text(json.dumps({
        "duree": duree, "fin_voix": m.duree,
        "segments": [{"start": s["start"], "dur": s["dur"], "in": s["in"], "out": s["out"],
                      "contigu_avant": bool(s.get("contigu_avant")), "contigu_apres": bool(s.get("contigu_apres"))}
                     for s in m.segs],
        "evenements": evenements, "sons": sons, "carte_fin": bool(clip.get("fin", True)),
        "mots": [{"s": t["s"], "e": t["e"], "aff": t["aff"]} for t in toks]}, ensure_ascii=False, indent=1),
        encoding="utf-8")

    doc = f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width={W}, height={H}" />
<title>{clip["titre"]}</title>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
* {{ margin:0; padding:0; box-sizing:border-box; }}
html, body {{ width:{W}px; height:{H}px; overflow:hidden; background:#0b0a09; }}
#root {{ position:relative; width:100%; height:100%; overflow:hidden; background:#0b0a09; }}
.cam {{ position:absolute; inset:0; overflow:hidden; }}
.cam video {{ position:absolute; left:0; top:0; width:{W}px; height:{H}px; object-fit:cover; }}
</style>
</head>
<body>
<div id="root" data-composition-id="{nom}" data-start="0" data-duration="{duree:.3f}" data-width="{W}" data-height="{H}" data-motion-blur="on" data-motion-blur-events="on" data-motion-blur-shutter="300">
{chr(10).join(videos)}
{chr(10).join(hotes)}
</div>
<script>
(function () {{
  var tl = gsap.timeline({{ paused: true }});
{chr(10).join(anims)}
  window.__timelines["{nom}"] = tl;
}})();
</script>
</body>
</html>
"""
    (proj / "index.html").write_text(doc, encoding="utf-8")
    for rel in sorted(utilises):
        G.lier(proj, rel)
    rap = [f"{nom} v4 · {clip['titre']} · {duree:.2f} s · {len(m.segs)} plans · {len(gs)} groupes · filés {sorted(filés)}"]
    for g in gs:
        rap.append(f"  {g['debut']:6.2f} → {g['fin']:6.2f}  " + " ".join(("*" if w["accent"] else "") + w["aff"]
                                                                       + (" /" if g.get("br") == k + 1 else "")
                                                                       for k, w in enumerate(g["mots"])))
    (noyau.WORK / f"{nom}-rapport4.txt").write_text("\n".join(rap), encoding="utf-8")
    print("\n".join(rap[:1]))


if __name__ == "__main__":
    for n in sys.argv[1:] or ["clip-1", "clip-2"]:
        generer(n)
