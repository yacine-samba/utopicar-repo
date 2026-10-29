"""Les cartes animées (sous-compositions HyperFrames), vertical 1080 × 1920 ou horizontal 1920 × 1080.

Règles : aucun logo de plateforme, aucun faux texte présenté comme une capture, seulement les mots et les chiffres
dits dans la vidéo. Entrées longues et douces (power3/expo.out), sorties plus courtes, pas de rebond sur la typo.
Chaque carte : fond = image du plan floutée et assombrie (même pièce, mêmes couleurs), puis le motif.
Tous les temps passés ici sont locaux à la carte (0 = début de la carte).
"""

POLICES = """
@font-face{font-family:"Clash Display";font-weight:700;font-display:block;src:url("assets/fonts/ClashDisplay-700.woff2") format("woff2");}
@font-face{font-family:"Clash Display";font-weight:600;font-display:block;src:url("assets/fonts/ClashDisplay-600.woff2") format("woff2");}
@font-face{font-family:"Satoshi";font-weight:500;font-display:block;src:url("assets/fonts/Satoshi-500.woff2") format("woff2");}
@font-face{font-family:"Satoshi";font-weight:700;font-display:block;src:url("assets/fonts/Satoshi-700.woff2") format("woff2");}
@font-face{font-family:"Satoshi";font-weight:900;font-display:block;src:url("assets/fonts/Satoshi-900.woff2") format("woff2");}
@font-face{font-family:"Instrument Serif";font-weight:400;font-style:italic;font-display:block;src:url("assets/fonts/InstrumentSerif-Regular-Italic.woff2") format("woff2");}
@font-face{font-family:"Impact Yass";font-weight:400;font-display:block;src:local("Impact");}
"""

OR = "#F5C542"
ROUGE = "#FF5A4E"

# Style de la référence @yass.views (STYLE.md) : chaque carte est un intercalaire plein cadre, bleu ou blanc à trame,
# qui arrive en glissant depuis la droite avec un flou de mouvement et repart sur une coupe franche.
BLEU = "#0848E0"
THEMES = {"leads": "blanc", "graphe": "bleu", "carte": "blanc", "chat": "blanc", "audit": "bleu", "liste": "blanc",
          "semaine": "bleu", "horaires": "blanc", "duel": "bleu", "stat": "blanc", "vues": "bleu", "etapes": "bleu",
          "titre": "blanc", "fin": "bleu"}
VARIABLES = {
    "blanc": ("--encre:#121212; --doux:rgba(18,18,18,.62); --accent:#0848E0; --sur-accent:#FFFFFF; "
              "--accent-doux:rgba(8,72,224,.10); --accent-bord:rgba(8,72,224,.35); --rouge:#C41616; --carte:#FFFFFF; "
              "--bord:rgba(0,0,0,.10); --bloc:rgba(0,0,0,.05); --trait:rgba(0,0,0,.12); --trait-fort:rgba(0,0,0,.2); "
              "--ombre:0 18px 44px rgba(0,0,0,.16), 0 2px 6px rgba(0,0,0,.06); --terre:#D3D3D3; --frontiere:rgba(255,255,255,.95); --point:#121212;"),
    "bleu": ("--encre:#FFFFFF; --doux:rgba(255,255,255,.78); --accent:#FFFFFF; --sur-accent:#0848E0; "
             "--accent-doux:rgba(255,255,255,.16); --accent-bord:rgba(255,255,255,.5); --rouge:#FFFFFF; "
             "--carte:rgba(255,255,255,.12); --bord:rgba(255,255,255,.22); --bloc:rgba(255,255,255,.10); "
             "--trait:rgba(255,255,255,.28); --trait-fort:rgba(255,255,255,.45); --ombre:0 24px 60px rgba(0,0,0,.18); "
             "--terre:rgba(255,255,255,.22); --frontiere:rgba(8,72,224,.7); --point:#FFFFFF;"),
    None: ("--encre:#FFFFFF; --doux:rgba(255,255,255,.88); --accent:#FFFFFF; --sur-accent:#121212; "
           "--accent-doux:rgba(255,255,255,.16); --accent-bord:rgba(255,255,255,.5); --rouge:#E0201F; "
           "--carte:rgba(18,18,20,.6); --bord:rgba(255,255,255,.18); --bloc:rgba(255,255,255,.08); "
           "--trait:rgba(255,255,255,.22); --trait-fort:rgba(255,255,255,.4); --ombre:0 24px 60px rgba(0,0,0,.35); "
           "--terre:#2a2a30; --frontiere:rgba(255,255,255,.1); --point:#FFFFFF;"),
}
FONDS_CSS = """
.{c}-bg {{ position:absolute; inset:0; }}
.{c}-bg.blanc {{ background:
  radial-gradient(ellipse 58% 42% at 50% 50%, #F8F8F8 0%, rgba(247,247,247,.96) 42%, rgba(240,240,240,0) 80%),
  radial-gradient(circle, rgba(0,0,0,.22) 1.2px, transparent 1.7px) 0 0 / 8px 8px,
  linear-gradient(#EDEDED, #E4E4E4); }}
.{c}-bg.bleu {{ background:radial-gradient(ellipse 75% 60% at 50% 45%, #1352EC 0%, #0848E0 58%, #063FC6 100%); }}
"""
GLISSE = True  # False pour les panneaux YouTube : c'est le panneau qui glisse, pas la carte


def _doc(cid, w, h, css, corps, js, fond=None, assombrir=0.5, donnees=None, pousse=None, theme=None, glisse=None):
    """donnees : URL d'un JSON chargé avant de construire (la timeline s'enregistre après la construction).
    pousse : durée de la carte ; le contenu avance lentement (0,5 % par seconde, 4 % au plus) devant le fond immobile,
    pour qu'aucun plan ne reste figé pendant que la personne parle.
    Le thème (bleu, blanc à trame, ou rien pour une surimpression) se lit sur le type de carte (fin de l'identifiant)."""
    theme = theme or THEMES.get(cid.split("-")[-1])
    glisse = GLISSE if glisse is None else glisse
    if pousse:
        js = (f'  tl.fromTo(q("#{cid}-scene"), {{ scale: 1 }}, {{ scale: {1 + min(0.04, 0.005 * pousse):.4f}, duration: {pousse:.3f}, ease: "none", '
              f'immediateRender: true }}, 0);\n') + js
    fond_html, filtre = "", ""
    if theme:
        fond_html = f'<div class="{cid}-bg {theme}"></div>'
        if glisse:
            # arrive de la droite et freine (expo.out), flou de mouvement horizontal qui tombe à 0
            filtre = (f'<svg width="0" height="0" style="position:absolute"><filter id="{cid}-fh" x="-30%" y="0" '
                      f'width="160%" height="100%"><feGaussianBlur id="{cid}-fhb" stdDeviation="0 0"/></filter></svg>')
            js = (f'  tl.fromTo(q("#{cid}-panneau"), {{ xPercent: 100 }}, {{ xPercent: 0, duration: 0.32, ease: "expo.out", '
                  f'immediateRender: true }}, 0);\n'
                  f'  tl.fromTo(q("#{cid}-fhb"), {{ attr: {{ stdDeviation: "70 0" }} }}, {{ attr: {{ stdDeviation: "0 0" }}, '
                  f'duration: 0.3, ease: "expo.out", immediateRender: true }}, 0);\n'
                  f'  tl.set(q("#{cid}-panneau"), {{ filter: "none" }}, 0.33);\n') + js
    elif fond:
        fond_html = (f'<img class="{cid}-fond" src="{fond}" alt="">'
                     f'<div class="{cid}-voile" style="background:rgba(8,8,10,{assombrir})"></div>')
    if donnees:
        js = (f'  d3.json("{donnees}").then(function (monde) {{\n{js}\n'
              f'    window.__timelines["{cid}"] = tl;\n  }});\n')
        enregistre = ""
    else:
        enregistre = f'  window.__timelines["{cid}"] = tl;'
    style_panneau = f' style="filter:url(#{cid}-fh)"' if filtre else ""
    return f"""<template id="{cid}-template">
<style>
{POLICES}
#{cid} {{ position:absolute; inset:0; overflow:hidden; {VARIABLES[theme]} }}
#{cid} * {{ box-sizing:border-box; margin:0; padding:0; }}
.{cid}-panneau {{ position:absolute; inset:0; }}
.{cid}-fond {{ position:absolute; left:0; top:0; width:{w}px; height:{h}px; object-fit:cover; }}
.{cid}-voile {{ position:absolute; inset:0; }}
.{cid}-scene {{ position:absolute; inset:0; transform-origin:50% 50%; }}
{FONDS_CSS.format(c=cid)}
{css}
</style>
<div id="{cid}" data-composition-id="{cid}" data-width="{w}" data-height="{h}">
  {filtre}
  <div class="{cid}-panneau" id="{cid}-panneau"{style_panneau}>
  {fond_html}
  <div class="{cid}-scene" id="{cid}-scene">{corps}</div>
  </div>
</div>
<script>
(function () {{
  var tl = gsap.timeline({{ paused: true }});
  var R = document.getElementById("{cid}");
  function q(s) {{ return R.querySelector(s); }}
  function qa(s) {{ return Array.prototype.slice.call(R.querySelectorAll(s)); }}
{js}
{enregistre}
}})();
</script>
</template>
"""


def _entree_carte(sel, t=0.0, dx=0.12):
    """Arrivée en filé : glisse de 12 % avec un flou horizontal qui tombe à 0 (0,26 s)."""
    return (f'  tl.fromTo(q("{sel}"), {{ xPercent: {dx * 100:.0f}, opacity: 0, filter: "blur(18px)" }}, '
            f'{{ xPercent: 0, opacity: 1, filter: "blur(0px)", duration: 0.26, ease: "power3.out", immediateRender: true }}, {t:.3f});\n')


def _sortie_carte(sel, t, dx=-0.10):
    if GLISSE:
        return ""
    return (f'  tl.to(q("{sel}"), {{ xPercent: {dx * 100:.0f}, opacity: 0, filter: "blur(14px)", duration: 0.16, '
            f'ease: "power3.in" }}, {t:.3f});\n')


# ---------------------------------------------------------------------------------------------------------------
def leads(cid, d, fond, t_personne, fmt="v"):
    """« Il y a eu quelques leads… mais vraiment personne qui a acheté » : 3 leads arrivent, puis VENTES 0."""
    W, H = (1080, 1920) if fmt == "v" else (1920, 1080)
    if fmt == "v":
        pile_css = "left:100px; width:820px; top:520px;"
        gros_css = "left:0; width:1080px; top:1060px;"
        taille_ligne, taille_gros = 46, 300
    else:
        pile_css = "left:220px; width:700px; top:300px;"
        gros_css = "left:960px; width:820px; top:250px;"
        taille_ligne, taille_gros = 40, 300
    css = f"""
.{cid}-pile {{ position:absolute; {pile_css} display:flex; flex-direction:column; gap:26px; }}
.{cid}-ligne {{ display:flex; align-items:center; gap:26px; padding:30px 34px; border-radius:30px;
  background:var(--carte); border:1.5px solid var(--bord); color:var(--encre);
  font:700 {taille_ligne}px/1 "Satoshi"; box-shadow:var(--ombre); }}
.{cid}-point {{ width:22px; height:22px; border-radius:50%; background:var(--accent); flex:none; }}
.{cid}-heure {{ margin-left:auto; font:500 {taille_ligne - 10}px/1 "Satoshi"; color:var(--doux); }}
.{cid}-gros {{ position:absolute; {gros_css} text-align:center; color:var(--encre); }}
.{cid}-gros small {{ display:block; font:700 52px/1 "Satoshi"; letter-spacing:.14em; color:var(--doux); }}
.{cid}-gros b {{ display:block; font:400 {taille_gros}px/.95 "Impact Yass"; color:var(--rouge); letter-spacing:0; }}
"""
    lignes = "".join(f'<div class="{cid}-ligne" id="{cid}-l{i}"><span class="{cid}-point"></span>Nouveau lead'
                     f'<span class="{cid}-heure">{h}</span></div>' for i, h in enumerate(["lead 1", "lead 2", "lead 3"]))
    corps = f'<div class="{cid}-pile" id="{cid}-pile">{lignes}</div>' \
            f'<div class="{cid}-gros" id="{cid}-gros"><small>VENTES</small><b>0</b></div>'
    js = ""
    for i in range(3):
        js += (f'  tl.fromTo(q("#{cid}-l{i}"), {{ y: 70, opacity: 0, filter: "blur(10px)" }}, {{ y: 0, opacity: 1, '
               f'filter: "blur(0px)", duration: 0.32, ease: "power3.out", immediateRender: true }}, {0.15 + 0.32 * i:.3f});\n')
    js += f'  tl.to(q("#{cid}-pile"), {{ opacity: 0.32, filter: "blur(3px)", duration: 0.25, ease: "power2.out" }}, {t_personne - 0.1:.3f});\n'
    js += (f'  tl.fromTo(q("#{cid}-gros"), {{ scale: 1.6, opacity: 0, filter: "blur(16px)" }}, {{ scale: 1, opacity: 1, '
           f'filter: "blur(0px)", duration: 0.2, ease: "power4.out", immediateRender: true }}, {t_personne:.3f});\n')
    js += _sortie_carte(f"#{cid}-gros", d - 0.16)
    # les lignes de lead n'ont pas d'heure inventée : on retire le libellé « lead n »
    corps = corps.replace('<span class="' + cid + '-heure">lead 1</span>', "").replace(
        '<span class="' + cid + '-heure">lead 2</span>', "").replace('<span class="' + cid + '-heure">lead 3</span>', "")
    return _doc(cid, W, H, css, corps, js, fond, 0.52, pousse=d)


# ---------------------------------------------------------------------------------------------------------------
def nom(cid, d, nom_txt, role, bande="haut", fmt="v", visage=None, cote=None):
    """Bandeau nominatif en surimpression : la photo de la personne dont on parle, son nom, son rôle.

    La photo évite le contresens (un nom posé sur le visage de quelqu'un d'autre se lit comme le sien).
    cote (16:9) : le côté libre de l'image, pour ne pas poser le nom sur la personne qui parle.
    """
    W, H = (1080, 1920) if fmt == "v" else (1920, 1080)
    top = 300 if bande == "haut" else 1150
    if fmt == "h":
        top = 380 if cote else 560
    t_nom = 84 if fmt == "v" else 70
    t_role = 72 if fmt == "v" else 60
    av = 170 if fmt == "v" else 140
    css = f"""
.{cid}-bloc {{ position:absolute; left:{60 if fmt == 'v' else 0}px; right:{140 if fmt == 'v' else 0}px; top:{top}px; display:flex; justify-content:center; align-items:center; gap:30px; }}
{f".{cid}-bloc {{ left:{'auto' if cote == 'droite' else '110px'}; right:{'110px' if cote == 'droite' else 'auto'}; }}" if fmt == "h" and cote else ""}
.{cid}-av {{ width:{av}px; height:{av}px; border-radius:50%; border:5px solid var(--accent); background:#333 center/cover no-repeat;
  box-shadow:0 14px 40px rgba(0,0,0,.5); flex:none; }}
.{cid}-txt {{ text-align:left; }}
.{cid}-nom {{ display:block; font:400 {t_nom}px/1 "Impact Yass"; color:var(--encre); letter-spacing:0; white-space:nowrap;
  text-shadow:0 6px 24px rgba(0,0,0,.55); }}
.{cid}-role {{ display:block; margin-top:8px; font:italic 400 {t_role}px/1 "Instrument Serif"; color:var(--accent);
  text-shadow:0 6px 24px rgba(0,0,0,.55); }}
.{cid}-ch {{ display:inline-block; }}
"""
    lettres = "".join('<span class="%s-ch">%s</span>' % (cid, c if c != " " else "&nbsp;") for c in nom_txt)
    photo = f'<div class="{cid}-av" id="{cid}-av" style="background-image:url({visage})"></div>' if visage else ""
    corps = (f'<div class="{cid}-bloc" id="{cid}-bloc">{photo}<div class="{cid}-txt"><span class="{cid}-nom">{lettres}</span>'
             f'<span class="{cid}-role" id="{cid}-role">{role}</span></div></div>')
    js = ""
    if visage:
        js += (f'  tl.fromTo(q("#{cid}-av"), {{ scale: 0.5, opacity: 0, filter: "blur(10px)" }}, {{ scale: 1, opacity: 1, '
               f'filter: "blur(0px)", duration: 0.32, ease: "expo.out", immediateRender: true }}, 0.0);\n')
    js += (f'  tl.fromTo(qa(".{cid}-ch"), {{ yPercent: 110, opacity: 0, filter: "blur(6px)" }}, {{ yPercent: 0, opacity: 1, '
           f'filter: "blur(0px)", duration: 0.26, ease: "power3.out", stagger: 0.025, immediateRender: true }}, 0.08);\n')
    js += (f'  tl.fromTo(q("#{cid}-role"), {{ opacity: 0, filter: "blur(8px)" }}, {{ opacity: 1, filter: "blur(0px)", '
           f'duration: 0.2, ease: "power2.out", immediateRender: true }}, 0.4);\n')
    js += (f'  tl.to(q("#{cid}-bloc"), {{ opacity: 0, filter: "blur(8px)", duration: 0.16, ease: "power2.in" }}, '
           f'{d - 0.17:.3f});\n')
    return _doc(cid, W, H, css, corps, js, pousse=d)


# ---------------------------------------------------------------------------------------------------------------
def graphe(cid, d, fond, t_titre, t_11, t_17, fmt="v", mois1=True):
    """Mois 1 ≈ 5K, puis « deuxième mois : explosion totale », 11K collectés, 17K contractés (barres à l'échelle)."""
    W, H = (1080, 1920) if fmt == "v" else (1920, 1080)
    if fmt == "v":
        base, hmax, larg, gap, x0, titre_top = 1320, 660, 210, 50, 90, 300  # libellés au-dessus de 1 480 px, poussée comprise
    else:
        base, hmax, larg, gap, x0, titre_top = 930, 600, 230, 70, 580, 90
    h5, h11, h17 = hmax * 5 / 17, hmax * 11 / 17, hmax
    xs = [x0, x0 + larg + gap * 2, x0 + 2 * larg + gap * 3]
    css = f"""
.{cid}-titre {{ position:absolute; left:{60 if fmt == 'v' else 0}px; right:{140 if fmt == 'v' else 0}px; top:{titre_top}px; text-align:center; color:var(--encre); }}
.{cid}-titre small {{ display:block; font:700 46px/1 "Satoshi"; letter-spacing:.16em; color:var(--doux); }}
.{cid}-titre b {{ display:block; margin-top:14px; font:italic 400 {132 if fmt == 'v' else 120}px/.9 "Instrument Serif"; color:var(--encre); }}
.{cid}-barre {{ position:absolute; width:{larg}px; bottom:{H - base}px; border-radius:22px 22px 6px 6px; transform-origin:50% 100%; }}
.{cid}-b5 {{ left:{xs[0]}px; height:{h5:.0f}px; background:var(--trait); }}
.{cid}-b11 {{ left:{xs[1]}px; height:{h11:.0f}px; background:var(--accent); }}
.{cid}-b17 {{ left:{xs[2]}px; height:{h17:.0f}px; background:var(--accent-doux); border:5px solid var(--accent); }}
.{cid}-val {{ position:absolute; width:{larg + 120}px; text-align:center; font:400 123px/1 "Impact Yass"; color:var(--encre); letter-spacing:0; }}
.{cid}-lab {{ position:absolute; width:{larg + 120}px; text-align:center; top:{base + 26}px; font:700 40px/1.15 "Satoshi"; color:var(--doux); }}
.{cid}-lab i {{ font:italic 400 46px/1 "Instrument Serif"; color:var(--accent); display:block; margin-top:6px; }}
"""
    def val(x, h, txt, i):
        return (f'<div class="{cid}-val" id="{cid}-v{i}" style="left:{x - 60}px; top:{base - h - 120:.0f}px">{txt}</div>')

    corps = (f'<div class="{cid}-titre" id="{cid}-titre"><small>DEUXIÈME MOIS</small><b id="{cid}-explo">explosion totale</b></div>'
             f'<div class="{cid}-barre {cid}-b5" id="{cid}-b5"></div>'
             f'<div class="{cid}-barre {cid}-b11" id="{cid}-b11"></div>'
             f'<div class="{cid}-barre {cid}-b17" id="{cid}-b17"></div>'
             + val(xs[0], h5, "≈ 5K", 5) + val(xs[1], h11, "≈ 11K", 11) + val(xs[2], h17, "≈ 17K", 17)
             + f'<div class="{cid}-lab" style="left:{xs[0] - 60}px">mois 1</div>'
             + f'<div class="{cid}-lab" style="left:{xs[1] - 60}px">mois 2<i>collectés</i></div>'
             + f'<div class="{cid}-lab" style="left:{xs[2] - 60}px">mois 2<i>contractés</i></div>')
    js = ""
    js += (f'  tl.fromTo(q("#{cid}-b5"), {{ scaleY: 0 }}, {{ scaleY: 1, duration: 0.45, ease: "expo.out", immediateRender: true }}, 0.05);\n')
    js += (f'  tl.fromTo(q("#{cid}-v5"), {{ opacity: 0, y: 30 }}, {{ opacity: 1, y: 0, duration: 0.3, ease: "power3.out", immediateRender: true }}, 0.2);\n')
    js += (f'  tl.fromTo(q("#{cid}-titre small"), {{ opacity: 0, filter: "blur(8px)" }}, {{ opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power2.out", immediateRender: true }}, 0.05);\n')
    js += (f'  tl.fromTo(q("#{cid}-explo"), {{ opacity: 0, scale: 1.25, filter: "blur(14px)" }}, {{ opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.24, ease: "power4.out", immediateRender: true }}, {t_titre:.3f});\n')
    for nomb, t, h in ((11, t_11, h11), (17, t_17, h17)):
        js += (f'  tl.fromTo(q("#{cid}-b{nomb}"), {{ scaleY: 0 }}, {{ scaleY: 1, duration: 0.55, ease: "expo.out", immediateRender: true }}, {t - 0.05:.3f});\n')
        js += (f'  tl.fromTo(q("#{cid}-v{nomb}"), {{ opacity: 0, y: 40 }}, {{ opacity: 1, y: 0, duration: 0.3, ease: "power3.out", immediateRender: true }}, {t + 0.15:.3f});\n')
    js += (f'  tl.to(R.querySelectorAll(".{cid}-barre, .{cid}-val, .{cid}-lab, .{cid}-titre"), {{ opacity: 0, filter: "blur(10px)", duration: 0.16, ease: "power2.in" }}, {d - 0.17:.3f});\n')
    return _doc(cid, W, H, css, corps, js, fond, 0.58, pousse=d)


# ---------------------------------------------------------------------------------------------------------------
def carte(cid, d, fond, vers="MALAISIE", fmt="v"):
    """La France, puis l'arc jusqu'à la Malaisie, sur la vraie géographie (Natural Earth, world-atlas 110m)."""
    W, H = (1080, 1920) if fmt == "v" else (1920, 1080)
    if fmt == "v":
        ext = [[110, 590], [910, 1170]]
        lab_top = 1245  # le titre finit vers 1 440 px : au-dessus de la bande basse de TikTok (1 480)
    else:
        ext = [[160, 120], [1760, 900]]
        lab_top = 900
    css = f"""
.{cid}-svg {{ position:absolute; left:0; top:0; width:{W}px; height:{H}px; }}
.{cid}-pays {{ fill:var(--terre); stroke:var(--frontiere); stroke-width:.8; }}
.{cid}-fr, .{cid}-my {{ fill:var(--accent); }}
.{cid}-arc {{ fill:none; stroke:var(--accent); stroke-width:6; stroke-linecap:round; }}
.{cid}-pt {{ fill:var(--point); }}
.{cid}-lab {{ position:absolute; left:0; right:0; top:{lab_top}px; text-align:center; color:var(--encre); }}
.{cid}-lab small {{ display:block; font:700 44px/1 "Satoshi"; letter-spacing:.16em; color:var(--doux); }}
.{cid}-lab b {{ display:block; margin-top:12px; font:400 {178 if fmt == 'v' else 142}px/.9 "Impact Yass"; letter-spacing:0; }}
"""
    corps = (f'<svg class="{cid}-svg" id="{cid}-svg" viewBox="0 0 {W} {H}"></svg>'
             f'<div class="{cid}-lab" id="{cid}-lab"><small>À L\'AUTRE BOUT DU MONDE</small><b>{vers}</b></div>')
    js = f"""
  var svg = d3.select(q("#{cid}-svg"));
  var proj = d3.geoNaturalEarth1().fitExtent({ext}, {{ type: "MultiPoint", coordinates: [[-11, 60], [128, -11]] }});
  var path = d3.geoPath().projection(proj);
  var g = svg.append("g").attr("id", "{cid}-monde");
  var pays = topojson.feature(monde, monde.objects.countries).features;
  g.selectAll("path").data(pays).enter().append("path").attr("d", path)
    .attr("class", function (p) {{ var c = String(p.id).padStart(3, "0"); return c === "250" ? "{cid}-pays {cid}-fr" : (c === "458" ? "{cid}-pays {cid}-my" : "{cid}-pays"); }});
  var A = proj([2.35, 46.6]), B = proj([101.7, 3.1]);
  var cx = (A[0] + B[0]) / 2, cy = Math.min(A[1], B[1]) - Math.abs(B[0] - A[0]) * 0.32;
  var arc = svg.append("path").attr("class", "{cid}-arc").attr("d", "M" + A[0] + "," + A[1] + " Q" + cx + "," + cy + " " + B[0] + "," + B[1]);
  var L = arc.node().getTotalLength();
  arc.attr("stroke-dasharray", L).attr("stroke-dashoffset", L);
  var pa = svg.append("circle").attr("class", "{cid}-pt").attr("cx", A[0]).attr("cy", A[1]).attr("r", 10);
  var pb = svg.append("circle").attr("class", "{cid}-pt").attr("cx", B[0]).attr("cy", B[1]).attr("r", 14);
  tl.fromTo(q("#{cid}-monde"), {{ opacity: 0 }}, {{ opacity: 1, duration: 0.25, ease: "power2.out", immediateRender: true }}, 0);
  tl.fromTo(pa.node(), {{ attr: {{ r: 0 }} }}, {{ attr: {{ r: 10 }}, duration: 0.2, ease: "power3.out", immediateRender: true }}, 0.1);
  tl.fromTo(arc.node(), {{ attr: {{ "stroke-dashoffset": L }} }}, {{ attr: {{ "stroke-dashoffset": 0 }}, duration: {min(0.9, d * 0.5):.2f}, ease: "power2.inOut", immediateRender: true }}, 0.15);
  tl.fromTo(pb.node(), {{ attr: {{ r: 0 }} }}, {{ attr: {{ r: 14 }}, duration: 0.22, ease: "power3.out", immediateRender: true }}, {0.15 + min(0.9, d * 0.5):.2f});
  tl.fromTo(q("#{cid}-lab"), {{ opacity: 0, y: 30, filter: "blur(10px)" }}, {{ opacity: 1, y: 0, filter: "blur(0px)", duration: 0.28, ease: "power3.out", immediateRender: true }}, {0.1 + min(0.9, d * 0.5):.2f});
"""
    return _doc(cid, W, H, css, corps, js, fond, 0.62,
                donnees="https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json", pousse=d)
