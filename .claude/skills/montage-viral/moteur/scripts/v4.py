"""Langage utopicar v4 (design/LANGAGE-V4.md) : les sous-compositions HyperFrames du montage face caméra.

La flèche (axe θ = 31,7° du symbole officiel), le trait (ligne crème à vitesse de plume constante), la couleur pleine
(la pastille devient le monde), un seul objet porteur (la pastille), des sous-titres en groupes calés sur les coupes.
Aucune valeur n'est un préréglage : les ressorts se calculent sur la taille de l'élément (durée perçue) et sur la
propriété animée (amortissement) ; le texte ne dépasse jamais (ζ ≥ 0,92), l'opacité et la couleur jamais non plus (ζ = 1).
Tous les temps passés ici sont locaux à la sous-composition.
"""
import html
import math
import re
from pathlib import Path

from cartes import POLICES

W, H = 1080, 1920
THETA = math.degrees(math.atan2(1102 - 830, 1640 - 1199.5))  # 31,7° : la flèche du symbole officiel
ANGLE_CSS = 90 - THETA                                          # angle d'un linear-gradient qui monte le long de θ
ORANGE = "#E2683A"        # aplat (OKLCH 0,66 / 0,17 / 40°), l'orange du logo adouci de 20 %
ORANGE_TEXTE = "#F0915E"  # orange lisible sur la vidéo et sur le noir
ENCRE = "#160904"         # encre sur l'orange
CREME = "#F4F1EC"
NOIR = "#0B0907"
PLUME = 2600.0            # vitesse du trait, px/s, la même partout

LOGO_SVG = Path(__file__).resolve().parents[1] / "assets" / "brand" / "utopicar-logo-ligne-fond-sombre.svg"

# ressort en forme fermée (Apple / Material : raideur (2π/d)², ζ par propriété), injecté dans chaque composition
JS_RESSORT = """
  function ressort(d, z) {
    // facilité GSAP : progression → position d'un ressort de durée perçue d, amortissement z ; la tween dure
    // ressort.duree(d, z) et se termine exactement sur 1
    var w = 2 * Math.PI / d, T = ressortDuree(d, z);
    function x(t) {
      if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
      var wd = w * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
    }
    var fin = x(T);
    return function (p) { return p >= 1 ? 1 : x(p * T) / fin; };
  }
  function ressortDuree(d, z) { return (z >= 1 ? 1.5 : 1.2) * d; }
  function dPercue(diag) { return 0.16 + 0.0045 * Math.sqrt(diag); }   // durée perçue selon la taille (px)
"""


def d_percue(diag):
    """Durée perçue d'un ressort selon la diagonale de l'élément (px) : 0,22 s pour un chiffre, 0,47 s plein cadre."""
    return 0.16 + 0.0045 * math.sqrt(diag)


def duree_ressort(d, z):
    return (1.5 if z >= 1 else 1.2) * d


def doc(cid, css, corps, js, polices=("700 40px Satoshi",)):
    """Sous-composition : gabarit, polices chargées avant de construire la timeline."""
    f = ", ".join(f"'{p}'" for p in polices)
    return f"""<template id="{cid}-template">
<style>
{POLICES}
#{cid} {{ position:absolute; inset:0; overflow:hidden; }}
#{cid} * {{ box-sizing:border-box; margin:0; padding:0; }}
{css}
</style>
<div id="{cid}" data-composition-id="{cid}" data-width="{W}" data-height="{H}">
{corps}
</div>
<script>
(function () {{
  var R = document.getElementById("{cid}");
  function q(s) {{ return R.querySelector(s); }}
  function qa(s) {{ return Array.prototype.slice.call(R.querySelectorAll(s)); }}
{JS_RESSORT}
  function construire() {{
    var tl = gsap.timeline({{ paused: true }});
{js}
    window.__timelines["{cid}"] = tl;
  }}
  Promise.all([{f}].map(function (p) {{ return document.fonts.load(p); }}))
    .then(function () {{ return document.fonts.ready; }}).then(construire, construire);
}})();
</script>
</template>
"""


# -------------------------------------------------------------------------------------------------------------------
def logo_parts():
    """Le logo officiel en ligne, découpé : voiture (crème), flèche (orange), virgule (orange), mot « utopicar »."""
    s = LOGO_SVG.read_text()
    vb = re.search(r'viewBox="([^"]+)"', s).group(1)
    g1, g2 = re.findall(r"<g transform=\"([^\"]+)\">(.*?)</g>", s, re.S)
    paths1 = re.findall(r"<path [^>]*/>", g1[1])
    return vb, g1[0], paths1, g2[0], g2[1]


# -------------------------------------------------------------------------------------------------------------------
def pastille(cid, d, items, y, risque_txt=None):
    """L'objet porteur : une seule pastille pour toute la vidéo (disque orange + chiffre + nom).

    items : [(t_geste, chiffre ou "x", texte), ...] en temps locaux. Le premier item fait entrer la pastille (glisse de
    32 px sur θ) ; aux suivants, le chiffre roule vers le haut (le sens de la flèche) et le nom défile du même geste.
    "x" = mode risque : le disque passe au noir, le chiffre roule vers le bas (contre-sens) jusqu'à une croix tracée par
    le trait, et le nom est barré à vitesse de plume.
    y : haut de la pastille (px). La pastille sort en fin de composition (0,6 × l'entrée, sur θ).
    """
    hauteur = 76
    chiffres = [str(c) for _, c, _ in items]
    reel = "".join(f'<i class="{cid}-c" id="{cid}-c{k}" data-layout-allow-overflow>{html.escape(c) if c != "x" else ""}</i>'
                   for k, c in enumerate(chiffres))
    noms = "".join(f'<b class="{cid}-n" id="{cid}-n{k}" data-layout-allow-overflow>{html.escape(t)}</b>'
                   for k, (_, _, t) in enumerate(items))
    css = f"""
.{cid}-z {{ position:absolute; left:0; right:0; top:{y}px; height:{hauteur}px; text-align:center; }}
.{cid}-p {{ position:relative; display:inline-flex; align-items:center; gap:18px; height:{hauteur}px;
  padding:0 30px 0 6px; border-radius:{hauteur // 2}px; background:rgba(14,10,8,.80);
  box-shadow:0 8px 28px rgba(0,0,0,.22); }}
.{cid}-disque {{ position:relative; width:64px; height:64px; border-radius:50%; background:{ORANGE}; overflow:hidden; }}
.{cid}-reel {{ position:absolute; left:0; top:0; width:64px; }}
.{cid}-c {{ display:block; height:64px; font:600 40px/64px "Clash Display"; color:{ENCRE}; font-style:normal;
  text-align:center; }}
.{cid}-croix {{ position:absolute; left:0; top:0; width:64px; height:64px; }}
.{cid}-noms {{ position:relative; height:{hauteur}px; overflow:hidden; text-align:left; }}
.{cid}-n {{ display:block; width:max-content; height:{hauteur}px; font:700 40px/{hauteur}px "Satoshi"; letter-spacing:-.3px;
  color:{CREME}; white-space:nowrap; }}
.{cid}-rature {{ position:absolute; left:0; top:50%; height:6px; margin-top:-3px; }}
"""
    croix = (f'<svg class="{cid}-croix" viewBox="0 0 64 64"><path id="{cid}-x1" d="M22 22 L42 42" stroke="{CREME}" '
             f'stroke-width="6" stroke-linecap="round" fill="none" pathLength="100" stroke-dasharray="100 120" '
             f'stroke-dashoffset="110"/><path id="{cid}-x2" d="M42 22 L22 42" stroke="{CREME}" stroke-width="6" '
             f'stroke-linecap="round" fill="none" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110"/></svg>')
    corps = (f'<div class="{cid}-z"><div class="{cid}-p" id="{cid}-p"><div class="{cid}-disque" id="{cid}-disque">'
             f'<div class="{cid}-reel" id="{cid}-reel" data-layout-allow-overflow>{reel}</div>{croix}</div>'
             f'<div class="{cid}-noms" id="{cid}-noms"><div id="{cid}-pile" data-layout-allow-overflow>{noms}</div>'
             f'<svg class="{cid}-rature" id="{cid}-rature" width="10" height="6" data-layout-allow-overflow><line id="{cid}-ligne" x1="3" y1="3" '
             f'x2="7" y2="3" stroke="{CREME}" stroke-width="6" stroke-linecap="round" pathLength="100" '
             f'stroke-dasharray="100 120" stroke-dashoffset="110"/></svg></div></div></div>')
    dx, dy = 32 * math.cos(math.radians(THETA)), -32 * math.sin(math.radians(THETA))
    t0 = items[0][0]
    js = f"""
    // largeur des noms (mesurée, polices chargées) : la capsule épouse le nom affiché et respire avec lui à chaque
    // changement (même ressort que le défilement), sans vide à droite
    var larg = qa(".{cid}-n").map(function (n) {{ return Math.ceil(n.getBoundingClientRect().width); }});
    q("#{cid}-noms").style.width = larg[0] + "px";
    // seuls le nom et le chiffre affichés sont visibles : les autres attendent, cachés, dans la pile et le rouleau
    qa(".{cid}-n").forEach(function (n, i) {{ if (i) gsap.set(n, {{ visibility: "hidden" }}); }});
    qa(".{cid}-c").forEach(function (c, i) {{ if (i) gsap.set(c, {{ visibility: "hidden" }}); }});
    var dP = dPercue(Math.hypot(q("#{cid}-p").offsetWidth, {hauteur})), dC = dPercue(Math.hypot(64, 64));
    // entrée : glisse le long de la flèche, ressort de pastille (texte : ζ 0,92) ; opacité sans dépassement
    tl.fromTo(q("#{cid}-p"), {{ x: {-dx:.1f}, y: {-dy:.1f}, opacity: 0 }}, {{ x: 0, y: 0, opacity: 1,
      duration: ressortDuree(dP, 0.92), ease: ressort(dP, 0.92), immediateRender: true }}, {max(0.0, t0 - 0.1):.3f});
    tl.fromTo(q("#{cid}-p"), {{ opacity: 0 }}, {{ opacity: 1, duration: ressortDuree(dP * 0.6, 1),
      ease: ressort(dP * 0.6, 1), immediateRender: false }}, {max(0.0, t0 - 0.1):.3f});
"""
    for k, (t, c, _) in enumerate(items):
        if k == 0:
            continue
        if c == "x":
            # contre-sens : la pastille glisse vers le bas et la gauche, le disque passe au noir, le chiffre descend
            # hors du disque, la croix se trace (deux traits à vitesse de plume), le nom suivant arrive, puis il est barré
            js += f"""
    tl.to(q("#{cid}-p"), {{ x: {-dx * 0.5:.1f}, y: {-dy * 0.5:.1f}, duration: ressortDuree(dP, 0.92), ease: ressort(dP, 0.92) }}, {t - 0.12:.3f});
    tl.to(q("#{cid}-disque"), {{ backgroundColor: "{NOIR}", boxShadow: "inset 0 0 0 3px {CREME}", duration: ressortDuree(dC, 1), ease: ressort(dC, 1) }}, {t - 0.12:.3f});
    tl.to(q("#{cid}-reel"), {{ y: 64, duration: ressortDuree(dC, 1), ease: ressort(dC, 1) }}, {t - 0.12:.3f});
    tl.to(q("#{cid}-x1"), {{ attr: {{ "stroke-dashoffset": 0 }}, duration: {28 / PLUME:.3f}, ease: "none" }}, {t:.3f});
    tl.to(q("#{cid}-x2"), {{ attr: {{ "stroke-dashoffset": 0 }}, duration: {28 / PLUME:.3f}, ease: "none" }}, {t + 28 / PLUME + 0.02:.3f});
    tl.to(q("#{cid}-pile"), {{ y: {-k * hauteur}, duration: ressortDuree(dP, 0.92), ease: ressort(dP, 0.92) }}, {t - 0.1:.3f});
    tl.to(q("#{cid}-noms"), {{ width: larg[{k}], duration: ressortDuree(dP, 0.92), ease: ressort(dP, 0.92) }}, {t - 0.1:.3f});
    tl.set(q("#{cid}-n{k}"), {{ visibility: "visible" }}, {t - 0.1:.3f});
    tl.set(q("#{cid}-n{k - 1}"), {{ visibility: "hidden" }}, {t - 0.1:.3f} + ressortDuree(dP, 0.92));
    tl.set(q("#{cid}-c{k - 1}"), {{ visibility: "hidden" }}, {t - 0.12:.3f} + ressortDuree(dC, 1));
    (function () {{
      var n = q("#{cid}-n{k}"), lw = n.getBoundingClientRect().width, svg = q("#{cid}-rature"), li = q("#{cid}-ligne");
      svg.setAttribute("width", Math.ceil(lw + 6)); svg.style.left = "-3px";
      li.setAttribute("x2", (lw + 3).toFixed(1));
      tl.to(li, {{ attr: {{ "stroke-dashoffset": 0 }}, duration: lw / {PLUME:.0f}, ease: "none" }}, {t + 0.35:.3f});
    }})();
"""
        else:
            js += f"""
    tl.to(q("#{cid}-reel"), {{ y: {-k * 64}, duration: ressortDuree(dC, 1), ease: ressort(dC, 1) }}, {t - 0.12:.3f});
    tl.to(q("#{cid}-pile"), {{ y: {-k * hauteur}, duration: ressortDuree(dP, 0.92), ease: ressort(dP, 0.92) }}, {t - 0.08:.3f});
    tl.to(q("#{cid}-noms"), {{ width: larg[{k}], duration: ressortDuree(dP, 0.92), ease: ressort(dP, 0.92) }}, {t - 0.08:.3f});
    tl.set(q("#{cid}-n{k}"), {{ visibility: "visible" }}, {t - 0.08:.3f});
    tl.set(q("#{cid}-n{k - 1}"), {{ visibility: "hidden" }}, {t - 0.08:.3f} + ressortDuree(dP, 0.92));
    tl.set(q("#{cid}-c{k}"), {{ visibility: "visible" }}, {t - 0.12:.3f});
    tl.set(q("#{cid}-c{k - 1}"), {{ visibility: "hidden" }}, {t - 0.12:.3f} + ressortDuree(dC, 1));
"""
    if items[0][1] == "x":
        # la pastille entre déjà en mode risque (vidéo courte qui ouvre sur la voiture à éviter) : disque noir chaud,
        # croix tracée par le trait juste après l'entrée, puis le nom barré à vitesse de plume
        js += f"""
    gsap.set(q("#{cid}-disque"), {{ backgroundColor: "{NOIR}", boxShadow: "inset 0 0 0 3px {CREME}" }});
    tl.to(q("#{cid}-x1"), {{ attr: {{ "stroke-dashoffset": 0 }}, duration: {28 / PLUME:.3f}, ease: "none" }}, {t0 + 0.12:.3f});
    tl.to(q("#{cid}-x2"), {{ attr: {{ "stroke-dashoffset": 0 }}, duration: {28 / PLUME:.3f}, ease: "none" }}, {t0 + 0.12 + 28 / PLUME + 0.02:.3f});
    (function () {{
      var n = q("#{cid}-n0"), lw = n.getBoundingClientRect().width, svg = q("#{cid}-rature"), li = q("#{cid}-ligne");
      svg.setAttribute("width", Math.ceil(lw + 6)); svg.style.left = "-3px";
      li.setAttribute("x2", (lw + 3).toFixed(1));
      tl.to(li, {{ attr: {{ "stroke-dashoffset": 0 }}, duration: lw / {PLUME:.0f}, ease: "none" }}, {t0 + 0.45:.3f});
    }})();
"""
    js += f"""
    // sortie : sur la flèche, 0,6 × l'entrée, accélérée, finie 1 image avant la fin de la composition
    tl.to(q("#{cid}-p"), {{ x: "+={dx:.1f}", y: "+={dy:.1f}", opacity: 0, duration: 0.6 * dP, ease: "power3.in" }}, {d:.3f} - 0.6 * dP - 0.04);
"""
    return doc(cid, css, corps, js, polices=("700 40px Satoshi", '600 40px "Clash Display"'))


# -------------------------------------------------------------------------------------------------------------------
def couleur(cid, d, mot, t_couvre, t_ouvre, ton="orange", sens=1, depart=(540, 960), taille=None, sous=None):
    """La couleur pleine : un aplat qui monte le long de θ (sens 1, la flèche) ou descend à contre-sens (sens −1),
    couvre l'écran, porte un mot immobile, puis s'ouvre dans le même sens. Son bord avant est le trait (crème).

    t_couvre : instant où l'écran est entièrement couvert (local) ; t_ouvre : instant où l'ouverture commence.
    ton : « orange » (encre sombre) ou « noir » (encre crème, pour le risque).
    """
    fond, encre = (ORANGE, ENCRE) if ton == "orange" else (NOIR, CREME)
    ang = ANGLE_CSS if sens > 0 else ANGLE_CSS + 180
    L = W * math.sin(math.radians(ANGLE_CSS)) + H * math.cos(math.radians(ANGLE_CSS))  # longueur de la ligne du dégradé
    dP = d_percue(math.hypot(W, H))
    T_c = 0.30  # la couverture (vif) : bord rapide, puis il se pose
    T_o = 0.28
    lignes = [l.strip() for l in mot.split("/")]
    taille = taille or (220 if max(map(len, lignes)) <= 6 else max(110, int(1500 / max(map(len, lignes)))))
    sous_html = f'<div class="{cid}-sous">{html.escape(sous)}</div>' if sous else ""
    css = f"""
.{cid}-aplat {{ position:absolute; inset:0; background:{fond};
  -webkit-mask-image:linear-gradient({ang:.2f}deg, transparent calc(var(--a) * 100%), #000 calc(var(--a) * 100%),
    #000 calc(var(--b) * 100%), transparent calc(var(--b) * 100%));
          mask-image:linear-gradient({ang:.2f}deg, transparent calc(var(--a) * 100%), #000 calc(var(--a) * 100%),
    #000 calc(var(--b) * 100%), transparent calc(var(--b) * 100%)); }}
.{cid}-bord {{ position:absolute; left:{W / 2 - 1600}px; top:{H / 2 - 4}px; width:3200px; height:8px; background:{CREME};
  transform-origin:50% 50%; }}
.{cid}-mot {{ position:absolute; left:140px; right:140px; top:0; bottom:0; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:22px; text-align:center; color:{encre}; }}
.{cid}-m {{ font:600 {taille}px/0.92 "Clash Display"; letter-spacing:-.03em; white-space:nowrap; }}
.{cid}-sous {{ font:700 44px/1.1 Satoshi; letter-spacing:-.2px; opacity:.86; }}
.{cid}-masque {{ overflow:hidden; padding:0 .05em .12em; }}
"""
    corps = (f'<div class="{cid}-aplat" id="{cid}-aplat" style="--a:0;--b:0">'
             f'<div class="{cid}-mot" id="{cid}-mot" data-layout-allow-overlap><div class="{cid}-masque"><div class="{cid}-m" id="{cid}-m">'
             f'{"<br>".join(html.escape(l) for l in lignes)}</div></div>{sous_html}</div></div>'
             f'<div class="{cid}-bord" id="{cid}-bord"></div>')
    ux, uy = math.cos(math.radians(THETA)) * sens, -math.sin(math.radians(THETA)) * sens
    t1 = t_couvre - T_c
    js = f"""
    var L = {L:.1f}, ux = {ux:.4f}, uy = {uy:.4f}, bord = q("#{cid}-bord"), ap = q("#{cid}-aplat");
    // le bord suit la ligne du dégradé : centre + (p − ½)·L·u, perpendiculaire à θ
    gsap.set(bord, {{ rotation: {90 - THETA:.2f}, opacity: 0 }});  // perpendiculaire à θ
    function placeBord(p) {{ gsap.set(bord, {{ x: (p - 0.5) * L * ux, y: (p - 0.5) * L * uy }}); }}
    var e = {{ b: 0 }};
    tl.fromTo(e, {{ b: 0 }}, {{ b: 1.02, duration: {T_c}, ease: "power2.inOut", immediateRender: true,
      onUpdate: function () {{ ap.style.setProperty("--b", e.b); placeBord(e.b); }} }}, {t1:.3f});
    tl.fromTo(bord, {{ opacity: 0 }}, {{ opacity: 1, duration: 0.04, ease: "none", immediateRender: true }}, {t1:.3f});
    tl.to(bord, {{ opacity: 0, duration: 0.05, ease: "none" }}, {t_couvre - 0.03:.3f});
    // le mot tient dans la colonne de 800 px (mesuré, jamais agrandi), monte de son masque quand l'écran est couvert,
    // puis ne bouge plus
    var mm = q("#{cid}-m"), lm = mm.scrollWidth;
    if (lm > 800) mm.style.fontSize = ({taille} * 800 / lm).toFixed(1) + "px";
    var dm = dPercue(Math.hypot(q("#{cid}-m").offsetWidth, {taille}));
    tl.fromTo(q("#{cid}-m"), {{ yPercent: 105 }}, {{ yPercent: 0, duration: ressortDuree(dm, 0.95), ease: ressort(dm, 0.95),
      immediateRender: true }}, {t_couvre - 0.10:.3f});
    // ouverture : le bord arrière passe dans le même sens ; le mot part avec la couleur (masqué par elle)
    var o = {{ a: 0 }};
    tl.fromTo(o, {{ a: 0 }}, {{ a: 1.02, duration: {T_o}, ease: "power2.in", immediateRender: false,
      onUpdate: function () {{ ap.style.setProperty("--a", o.a); }} }}, {t_ouvre:.3f});
    // (le mot est dans l'aplat : le bord arrière l'efface avec la couleur, sans fondu)
"""
    return doc(cid, css, corps, js, polices=('600 120px "Clash Display"', "700 44px Satoshi"))


# -------------------------------------------------------------------------------------------------------------------
def fin(cid, d):
    """Carte de fin (≈ 0,85 s, abrupte) : fond noir chaud ; le symbole entre par un masque qui monte sur θ, la flèche
    file depuis l'arrière de la voiture et se pose (ζ 0,8, une forme sans texte) sur la dernière note du logo sonore ;
    « Achète juste. » (Clash 600) et « Revends mieux. » (Instrument Serif, orange texte) se révèlent sur θ et ne
    bougent plus."""
    vb, tr1, paths, tr2, mot = logo_parts()
    voiture, fleche, virgule = paths
    voiture = voiture.replace("<path ", f'<path id="{cid}-voiture" ')
    fleche = fleche.replace("<path ", f'<path id="{cid}-fleche" ')
    virgule = virgule.replace("<path ", f'<path id="{cid}-virgule" ')
    svg = (f'<svg class="{cid}-logo" id="{cid}-logo" viewBox="{vb}" width="560">'
           f'<g transform="{tr1}"><g id="{cid}-sym">{voiture}{virgule}</g>{fleche}</g>'
           f'<g id="{cid}-mot" transform="{tr2}">{mot}</g></svg>')
    css = f"""
.{cid}-fond {{ position:absolute; inset:0; background:{NOIR}; }}
.{cid}-logo {{ position:absolute; left:{(W - 560) // 2}px; top:800px; overflow:visible; }}
.{cid}-l {{ position:absolute; left:140px; width:800px; text-align:center; white-space:nowrap; }}
.{cid}-l1 {{ top:960px; font:600 92px/1 "Clash Display"; letter-spacing:-.03em; color:{CREME}; }}
.{cid}-l2 {{ top:1068px; font:italic 400 112px/1 "Instrument Serif"; letter-spacing:-1px; color:{ORANGE_TEXTE}; }}
.{cid}-cadre {{ position:absolute; inset:0; }}
.{cid}-m {{ -webkit-mask-image:linear-gradient({ANGLE_CSS:.2f}deg, #000 calc(var(--p) * 100%), transparent calc(var(--p) * 100% + 8%));
                   mask-image:linear-gradient({ANGLE_CSS:.2f}deg, #000 calc(var(--p) * 100%), transparent calc(var(--p) * 100% + 8%)); }}
"""
    corps = (f'<div class="{cid}-fond"></div><div class="{cid}-cadre {cid}-m" id="{cid}-mlogo" style="--p:0">{svg}</div>'
             f'<div class="{cid}-l {cid}-l1 {cid}-m" id="{cid}-l1" style="--p:0">Achète juste.</div>'
             f'<div class="{cid}-l {cid}-l2 {cid}-m" id="{cid}-l2" style="--p:0">Revends mieux.</div>')
    dx, dy = math.cos(math.radians(THETA)), -math.sin(math.radians(THETA))
    js = f"""
    function revele(el, t, T, p0) {{
      var o = {{ p: p0 || 0 }};
      tl.fromTo(o, {{ p: p0 || 0 }}, {{ p: 1.08, duration: T, ease: "power3.out", immediateRender: true,
        onUpdate: function () {{ el.style.setProperty("--p", o.p); }} }}, t);
    }}
    // la carte est déjà commencée sur son image 0 : le masque part de l'arrière de la voiture (sa position mesurée sur
    // l'axe du dégradé, environ 0,40 de la diagonale, + 8 % de bord doux), jamais d'image vide sur la coupe
    var lg = {W * math.sin(math.radians(ANGLE_CSS)) + H * math.cos(math.radians(ANGLE_CSS)):.1f};
    var bl = q("#{cid}-logo").getBoundingClientRect();
    var p0 = ((bl.left - {W / 2}) * {math.sin(math.radians(ANGLE_CSS)):.4f} - (bl.bottom - 18 - {H / 2}) * {math.cos(math.radians(ANGLE_CSS)):.4f}) / lg + 0.5 + 0.06;
    q("#{cid}-mlogo").style.setProperty("--p", p0);
    revele(q("#{cid}-mlogo"), 0.0, 0.30, p0);
    revele(q("#{cid}-l1"), 0.06, 0.30);
    revele(q("#{cid}-l2"), 0.12, 0.30);
    // la flèche file sur θ depuis l'arrière de la voiture et se pose (forme sans texte : ζ 0,8)
    var df = dPercue(Math.hypot(220, 140));
    // (unités du symbole : 1 unité ≈ 0,18 px à l'écran ; 700 unités ≈ 125 px)
    tl.fromTo(q("#{cid}-fleche"), {{ x: {-dx * 700:.1f}, y: {-dy * 700:.1f}, opacity: 0 }}, {{ x: 0, y: 0, opacity: 1,
      duration: ressortDuree(df, 0.8), ease: ressort(df, 0.8), immediateRender: true }}, 0.10);
"""
    return doc(cid, css, corps, js, polices=('600 92px "Clash Display"', 'italic 400 112px "Instrument Serif"'))


# -------------------------------------------------------------------------------------------------------------------
def sous_titres(cid, gs):
    """Sous-titres v4 : groupes de 2 à 4 mots, immobiles. Le groupe apparaît (0,1 s), chaque mot passe de 62 % à 100 %
    à son temps dit (le mot porteur de sens passe à l'orange texte), le groupe disparaît puis il est coupé net.

    gs : [{debut, fin, y, large, voile, mots: [{t, aff, accent}]}], temps locaux (= temps du montage).
    voile : un fond à la taille du texte (noir chaud 58 %) quand l'image derrière est claire ; sinon une ombre courte.
    large : largeur maximale de la ligne (620 sous y = 1150, à cause du rail des boutons ; 800 au-dessus).
    """
    css = f"""
.{cid}-g {{ position:absolute; left:0; right:0; text-align:center; }}
.{cid}-b {{ display:inline-block; padding:10px 24px 14px; border-radius:22px; font:700 58px/1.16 Satoshi;
  letter-spacing:-.4px; color:{CREME}; }}
.{cid}-b.voile {{ background:rgba(14,10,8,.72); }}
.{cid}-b.ombre {{ text-shadow:0 2px 3px rgba(0,0,0,.55), 0 0 1px rgba(0,0,0,.6); }}
.{cid}-w {{ color:rgba(244,241,236,.62); }}
"""
    corps, js = [], []
    for i, g in enumerate(gs):
        mots = " ".join(f'<span class="{cid}-w" id="{cid}-w{i}_{k}">{html.escape(w["aff"])}</span>'
                        + ("<br>" if g.get("br") and k + 1 == g["br"] else "")
                        for k, w in enumerate(g["mots"]))
        corps.append(f'<div class="clip {cid}-g" id="{cid}-g{i}" data-start="{g["debut"]:.3f}" '
                     f'data-duration="{g["fin"] - g["debut"]:.3f}" data-track-index="1" style="top:{g["y"]}px">'
                     f'<span class="{cid}-b {"voile" if g["voile"] else "ombre"}" style="max-width:{g["large"]}px;'
                     f'font-size:{g.get("taille", 58)}px">'
                     f'{mots}</span></div>')
        js.append(f'    tl.fromTo(q("#{cid}-g{i}"), {{ opacity: 0 }}, {{ opacity: 1, duration: 0.10, ease: "power2.out", '
                  f'immediateRender: true }}, {g["debut"]:.3f});')
        for k, w in enumerate(g["mots"]):
            couleur_mot = ORANGE_TEXTE if w.get("accent") else CREME
            js.append(f'    tl.to(q("#{cid}-w{i}_{k}"), {{ color: "{couleur_mot}", duration: 0.08, ease: "power1.out" }}, '
                      f'{max(g["debut"], w["t"] - 0.03):.3f});')
        js.append(f'    tl.to(q("#{cid}-g{i}"), {{ opacity: 0, duration: 0.08, ease: "power2.in" }}, {g["fin"] - 0.08:.3f});')
        js.append(f'    tl.set(q("#{cid}-g{i}"), {{ opacity: 0, visibility: "hidden" }}, {g["fin"]:.3f});')
    return doc(cid, css, "\n".join(corps), "\n".join(js), polices=("700 58px Satoshi",))


# -------------------------------------------------------------------------------------------------------------------
def accroche(cid, d, contexte, chiffre, promesse, accent, y, tailles=(196, 76), fin_t=None, trait=False,
             derriere=False, ecart_chiffre=40, ordre=None):
    """L'accroche v4, déjà posée à l'image 0 (l'image 0 est la miniature et le contrat) : la ligne de contexte (pour qui),
    le chiffre dit en premier (Clash 600, crème), la promesse (Clash 600) dont le mot qui porte l'enjeu est en orange
    texte ; le trait souligne la promesse à vitesse de plume, juste après l'image 0. Sortie par un masque qui monte sur
    θ. derriere : la composition passe sous un détourage de la personne (texte derrière la tête) ; la ligne de contexte et
    la promesse restent devant, au-dessus de la tête.
    y : haut du bloc (px). accent : la partie de la promesse à mettre en orange (ex. « 1 non »).
    ordre : « chiffre » (le gros texte puis la capsule, accroche sur le torse) ou « promesse » (la capsule puis le gros
    texte, accroche au-dessus de la tête : le gros texte, le plus proche du visage, se lit en dernier) ; par défaut
    « promesse » en mode derrière, « chiffre » sinon.
    """
    ordre = ordre or ("promesse" if derriere else "chiffre")
    t_chiffre, t_promesse = tailles
    if accent and accent in promesse:
        a, b = promesse.split(accent, 1)
        prom_html = f'{html.escape(a)}<span class="{cid}-acc">{html.escape(accent)}</span>{html.escape(b)}'
    else:
        prom_html = html.escape(promesse)
    css = f"""
.{cid}-champ {{ position:absolute; left:0; right:0; top:{y - 190}px; height:{t_chiffre + t_promesse + 470}px;
  background:radial-gradient(ellipse 62% 50% at 50% 52%, rgba(10,7,5,.62), rgba(10,7,5,.38) 55%, rgba(10,7,5,0) 100%);
  -webkit-mask-image:linear-gradient({ANGLE_CSS + 180:.2f}deg, #000 calc(var(--s) * 100%), transparent calc(var(--s) * 100% + 6%));
          mask-image:linear-gradient({ANGLE_CSS + 180:.2f}deg, #000 calc(var(--s) * 100%), transparent calc(var(--s) * 100% + 6%)); }}
.{cid}-bloc {{ position:absolute; left:140px; width:800px; top:{y}px; text-align:center;
  -webkit-mask-image:linear-gradient({ANGLE_CSS + 180:.2f}deg, #000 calc(var(--s) * 100%), transparent calc(var(--s) * 100% + 6%));
          mask-image:linear-gradient({ANGLE_CSS + 180:.2f}deg, #000 calc(var(--s) * 100%), transparent calc(var(--s) * 100% + 6%)); }}
.{cid}-ctx {{ font:700 30px/1 Satoshi; letter-spacing:.16em; text-transform:uppercase; color:rgba(244,241,236,.9);
  text-shadow:0 1px 3px rgba(0,0,0,.6), 0 0 14px rgba(0,0,0,.35); }}
.{cid}-chiffre {{ margin-top:10px; font:600 {t_chiffre}px/0.92 "Clash Display"; letter-spacing:-.012em; color:{CREME};
  word-spacing:.06em;
  white-space:nowrap; text-shadow:0 3px 18px rgba(0,0,0,.35); }}
.{cid}-prom {{ position:relative; display:inline-block; margin-top:18px; padding:12px 30px 16px; border-radius:999px;
  background:rgba(14,10,8,.74); font:600 {t_promesse}px/1 "Clash Display"; letter-spacing:-.02em; color:{CREME};
  white-space:nowrap; }}
.{cid}-acc {{ color:{ORANGE_TEXTE}; }}
.{cid}-sous {{ position:absolute; left:0; bottom:-14px; overflow:visible; }}
"""
    ligne = (f'<svg class="{cid}-sous" id="{cid}-sous" width="10" height="10"><line id="{cid}-trait" x1="4" y1="5" '
             f'x2="6" y2="5" stroke="{CREME}" stroke-width="7" stroke-linecap="round" pathLength="100" '
             f'stroke-dasharray="100 120" stroke-dashoffset="110"/></svg>') if trait else ""
    chiffre = chiffre.replace(" ", "\u00a0")  # milliers et unité : espace insécable (Clash n'a pas l'espace fine)
    # le champ sombre sert aussi en mode « derrière » : il est sous le détourage (z 25), donc il assombrit le toit ouvrant
    # derrière le chiffre (crème illisible sur le ciel) sans toucher la tête, qui passe devant, éclairée
    corps = (f'<div class="{cid}-champ" id="{cid}-champ" style="--s:1.2"></div>'
             f'<div class="{cid}-bloc" id="{cid}-bloc" style="--s:1.2">'
             f'<div class="{cid}-ctx">{html.escape(contexte)}</div>'
             + (f'<div class="{cid}-prom" id="{cid}-prom">{prom_html}{ligne}</div>'
                f'<div class="{cid}-chiffre" id="{cid}-chiffre" style="margin-top:{ecart_chiffre}px"><span id="{cid}-cn" '
                f'style="display:inline-block">{html.escape(chiffre)}</span></div>'
                if ordre == "promesse" else
                f'<div class="{cid}-chiffre" id="{cid}-chiffre"><span id="{cid}-cn" style="display:inline-block">'
                f'{html.escape(chiffre)}</span></div>'
                f'<div class="{cid}-prom" id="{cid}-prom">{prom_html}{ligne}</div>')
             + '</div>')
    js = """
    // le chiffre et la promesse tiennent dans la colonne de 800 px (mesurés sur leur texte, jamais agrandis)
    // (la capsule garde ses marges intérieures : seule la part du texte se réduit)
    [["#%(c)s-chiffre", "#%(c)s-cn", 800], ["#%(c)s-prom", "#%(c)s-prom", 800]].forEach(function (e) {
      var el = q(e[0]), cs = getComputedStyle(q(e[1]));
      var pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight), w = q(e[1]).getBoundingClientRect().width;
      if (w > e[2]) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * (e[2] - pad) / (w - pad)).toFixed(1) + "px";
    });
""" % {"c": cid}
    if trait:
        js += f"""
    var pr = q("#{cid}-prom"), lw = pr.getBoundingClientRect().width, sv = q("#{cid}-sous"), li = q("#{cid}-trait");
    sv.setAttribute("width", Math.ceil(lw + 8)); sv.style.left = "-4px"; li.setAttribute("x2", (lw + 4).toFixed(1));
    tl.to(li, {{ attr: {{ "stroke-dashoffset": 0 }}, duration: lw / {PLUME:.0f}, ease: "none" }}, 0.18);
"""
    if fin_t is not None:
        js += f"""
    var s = {{ v: 1.2 }}, bl = q("#{cid}-bloc"), ch = q("#{cid}-champ");
    tl.fromTo(s, {{ v: 1.2 }}, {{ v: -0.1, duration: 0.24, ease: "power2.in", immediateRender: false,
      onUpdate: function () {{ bl.style.setProperty("--s", s.v); ch.style.setProperty("--s", s.v); }} }}, {fin_t - 0.24:.3f});
"""
    return doc(cid, css, corps, js, polices=('600 196px "Clash Display"', "700 30px Satoshi"))


# -------------------------------------------------------------------------------------------------------------------
def annees(cid, d, a, b, t_a, t_b, y=1058, taille=92, ecart=150):
    """Une plage d'années (« entre 2005 et 2011 ») dite lentement : deux années sur une ligne, la seconde montée de la
    pente de la flèche (θ) ; le trait les relie à vitesse de plume, d'un bord à l'autre, le long de θ. Chaque année
    monte de son masque au moment où elle est dite, puis ne bouge plus. Remplace les sous-titres le temps de la plage,
    sous la pastille (y : haut de la seconde année). Sortie : un masque qui monte sur θ."""
    monte = ecart * math.tan(math.radians(THETA))   # 93 px pour 150 px d'écart
    css = f"""
.{cid}-z {{ position:absolute; inset:0;
  -webkit-mask-image:linear-gradient({ANGLE_CSS + 180:.2f}deg, #000 calc(var(--s) * 100%), transparent calc(var(--s) * 100% + 6%));
          mask-image:linear-gradient({ANGLE_CSS + 180:.2f}deg, #000 calc(var(--s) * 100%), transparent calc(var(--s) * 100% + 6%)); }}
.{cid}-ligne {{ position:absolute; left:0; right:0; top:{y}px; height:{taille + monte:.0f}px; text-align:center; }}
.{cid}-rang {{ position:relative; display:inline-block; height:100%; }}
.{cid}-an {{ position:absolute; height:{taille}px; overflow:hidden; }}
.{cid}-an b {{ display:block; font:600 {taille}px/1 "Clash Display"; letter-spacing:-.03em; color:{CREME};
  white-space:nowrap; text-shadow:0 3px 16px rgba(0,0,0,.5); }}
.{cid}-sv {{ position:absolute; left:0; top:0; overflow:visible; }}
.{cid}-fond {{ position:absolute; left:150px; right:150px; top:{y - 60}px; height:{taille + monte + 120:.0f}px;
  background:radial-gradient(ellipse 60% 50% at 50% 50%, rgba(10,7,5,.6), rgba(10,7,5,0) 100%); }}
"""
    corps = (f'<div class="{cid}-z" id="{cid}-z" style="--s:1.2"><div class="{cid}-fond"></div>'
             f'<div class="{cid}-ligne"><div class="{cid}-rang" id="{cid}-rang">'
             f'<div class="{cid}-an" id="{cid}-ma" style="left:0; top:{monte:.0f}px"><b id="{cid}-a">{html.escape(a)}</b></div>'
             f'<svg class="{cid}-sv" id="{cid}-sv" width="10" height="10"><line id="{cid}-l" x1="0" y1="0" x2="1" y2="0" '
             f'stroke="{CREME}" stroke-width="8" stroke-linecap="round" pathLength="100" stroke-dasharray="100 120" '
             f'stroke-dashoffset="110"/></svg>'
             f'<div class="{cid}-an" id="{cid}-mb" style="top:0"><b id="{cid}-b">{html.escape(b)}</b></div></div></div></div>')
    da = d_percue(math.hypot(260, taille))
    js = f"""
    // mise en page mesurée : [année 1] — écart le long de θ — [année 2], le tout centré sur l'axe
    var wa = q("#{cid}-a").getBoundingClientRect().width, wb = q("#{cid}-b").getBoundingClientRect().width;
    var r = q("#{cid}-rang"), e = {ecart}, mt = {monte:.1f}, marge = 26;
    r.style.width = (wa + e + wb) + "px";
    q("#{cid}-ma").style.width = wa + "px"; q("#{cid}-mb").style.width = wb + "px";
    q("#{cid}-mb").style.left = (wa + e) + "px";
    // le trait : du pied de la première année (à droite) au pied de la seconde (à gauche), pente θ exacte
    var x1 = wa + marge * 0.4, y1 = mt + {taille} * 0.82, x2 = wa + e - marge * 0.4, y2 = y1 - (x2 - x1) * {math.tan(math.radians(THETA)):.5f};
    var li = q("#{cid}-l");
    li.setAttribute("x1", x1.toFixed(1)); li.setAttribute("y1", y1.toFixed(1));
    li.setAttribute("x2", x2.toFixed(1)); li.setAttribute("y2", y2.toFixed(1));
    var lg = Math.hypot(x2 - x1, y2 - y1);
    tl.fromTo(q("#{cid}-a"), {{ yPercent: 104 }}, {{ yPercent: 0, duration: {duree_ressort(da, 0.95):.3f}, ease: ressort({da:.3f}, 0.95), immediateRender: true }}, {max(0.0, t_a - 0.06):.3f});
    tl.to(li, {{ attr: {{ "stroke-dashoffset": 0 }}, duration: lg / {PLUME:.0f}, ease: "none" }}, {max(0.0, t_a + 0.14):.3f});
    tl.fromTo(q("#{cid}-b"), {{ yPercent: 104 }}, {{ yPercent: 0, duration: {duree_ressort(da, 0.95):.3f}, ease: ressort({da:.3f}, 0.95), immediateRender: true }}, {max(0.0, t_b - 0.06):.3f});
    var s = {{ v: 1.2 }}, z = q("#{cid}-z");
    tl.fromTo(s, {{ v: 1.2 }}, {{ v: -0.1, duration: 0.22, ease: "power2.in", immediateRender: false,
      onUpdate: function () {{ z.style.setProperty("--s", s.v); }} }}, {d - 0.24:.3f});
"""
    return doc(cid, css, corps, js, polices=('600 100px "Clash Display"',))


def broll(cid, d, src, debut=0.0):
    """Plan d'illustration plein cadre, coupe franche, sans poussée ajoutée : son propre mouvement suffit (coupé sur
    son image la plus rapide, debut = décalage dans le fichier)."""
    css = f".{cid}-v {{ position:absolute; left:0; top:0; width:{W}px; height:{H}px; object-fit:cover; }}\n"
    corps = (f'<video id="{cid}-v" class="clip {cid}-v" src="{src}" data-start="0" data-duration="{d:.3f}" '
             f'data-media-start="{debut:.3f}" data-track-index="0" muted playsinline></video>')
    return doc(cid, css, corps, "", polices=("700 40px Satoshi",))
