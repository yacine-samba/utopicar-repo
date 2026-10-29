"""Cartes plein cadre en 16:9 (version YouTube) : titre, étapes, fin."""
import html

from cartes import OR, POLICES, _doc


def titre(cid, d, fond, haut="POURQUOI IL M'A CHOISI", bas="malgré les autres", signature="HENRI TOKANE · OPÉRATEUR"):
    """Carton titre : une ligne en capitales étroites, sa suite en serif italique, une signature en petites capitales."""
    css = f"""
.{cid}-z {{ position:absolute; left:0; right:0; text-align:center; color:var(--encre); }}
.{cid}-a {{ top:345px; font:400 146px/.92 "Impact Yass"; letter-spacing:0; }}
.{cid}-b {{ top:500px; font:italic 400 140px/1 "Instrument Serif"; color:var(--accent); }}
.{cid}-c {{ top:700px; font:700 34px/1 "Satoshi"; letter-spacing:.24em; color:var(--doux); }}
.{cid}-ch {{ display:inline-block; }}
.{cid}-sp {{ width:.3em; }}
"""
    lettres = "".join(f'<span class="{cid}-ch">{c}</span>' if c != " " else f'<span class="{cid}-ch {cid}-sp"></span>'
                      for c in haut)
    corps = (f'<div class="{cid}-z {cid}-a" id="{cid}-a">{lettres}</div>'
             f'<div class="{cid}-z {cid}-b" id="{cid}-b">{html.escape(bas)}</div>'
             f'<div class="{cid}-z {cid}-c" id="{cid}-c">{html.escape(signature)}</div>')
    js = (f'  tl.fromTo(qa(".{cid}-ch"), {{ yPercent: 110, opacity: 0, filter: "blur(8px)" }}, {{ yPercent: 0, opacity: 1, '
          f'filter: "blur(0px)", duration: 0.3, ease: "power3.out", stagger: 0.025, immediateRender: true }}, 0.05);\n')
    js += (f'  tl.fromTo(q("#{cid}-b"), {{ opacity: 0, filter: "blur(14px)", scale: 1.08 }}, {{ opacity: 1, filter: "blur(0px)", '
           f'scale: 1, duration: 0.4, ease: "power3.out", immediateRender: true }}, 0.6);\n')
    js += (f'  tl.fromTo(q("#{cid}-c"), {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3, ease: "power2.out", immediateRender: true }}, 1.0);\n')
    js += (f'  tl.to(R.querySelectorAll(".{cid}-z"), {{ opacity: 0, filter: "blur(12px)", duration: 0.2, ease: "power2.in" }}, {d - 0.21:.3f});\n')
    return _doc(cid, 1920, 1080, css, corps, js, fond, 0.62, pousse=d)


def etapes(cid, d, fond, t1, t2, t3):
    """« trouver votre créateur, le signer et le garder » : trois mots, le dernier en or."""
    css = f"""
.{cid}-z {{ position:absolute; left:0; right:0; text-align:center; font:400 177px/1 "Impact Yass"; letter-spacing:0; color:var(--encre); }}
.{cid}-sous {{ position:absolute; left:0; right:0; top:820px; text-align:center; font:italic 400 84px/1 "Instrument Serif";
  color:var(--doux); }}
"""
    corps = (f'<div class="{cid}-z" id="{cid}-1" style="top:170px">TROUVER</div>'
             f'<div class="{cid}-z" id="{cid}-2" style="top:380px">SIGNER</div>'
             f'<div class="{cid}-z" id="{cid}-3" style="top:590px; color:var(--accent)">GARDER</div>'
             f'<div class="{cid}-sous" id="{cid}-s">votre créateur</div>')
    js = ""
    for i, t in enumerate((t1, t2, t3), 1):
        js += (f'  tl.fromTo(q("#{cid}-{i}"), {{ y: 60, opacity: 0, filter: "blur(12px)" }}, {{ y: 0, opacity: 1, '
               f'filter: "blur(0px)", duration: 0.3, ease: "power3.out", immediateRender: true }}, {t:.3f});\n')
    js += (f'  tl.fromTo(q("#{cid}-s"), {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3, immediateRender: true }}, {t1 + 0.2:.3f});\n')
    js += (f'  tl.to(R.querySelectorAll("#{cid} > div:not(.{cid}-fond):not(.{cid}-voile)"), {{ opacity: 0, filter: "blur(10px)", '
           f'duration: 0.18, ease: "power2.in" }}, {d - 0.19:.3f});\n')
    return _doc(cid, 1920, 1080, css, corps, js, fond, 0.6, pousse=d)


def fin(cid, d, fond, haut="TROUVEZ VOTRE CRÉATEUR.", bas="Gardez-le.", signature="HENRI TOKANE"):
    """Carton de fin : la phrase qui reste (capitales étroites + serif italique), puis la signature."""
    css = f"""
.{cid}-z {{ position:absolute; left:0; right:0; text-align:center; color:var(--encre); }}
.{cid}-a {{ top:365px; font:400 123px/.95 "Impact Yass"; letter-spacing:0; }}
.{cid}-b {{ top:500px; font:italic 400 150px/1 "Instrument Serif"; color:var(--accent); }}
.{cid}-c {{ top:720px; font:700 32px/1 "Satoshi"; letter-spacing:.24em; color:var(--doux); }}
"""
    corps = (f'<div class="{cid}-z {cid}-a" id="{cid}-a">{html.escape(haut)}</div>'
             f'<div class="{cid}-z {cid}-b" id="{cid}-b">{html.escape(bas)}</div>'
             f'<div class="{cid}-z {cid}-c" id="{cid}-c">{html.escape(signature)}</div>')
    js = (f'  tl.fromTo(q("#{cid}-a"), {{ opacity: 0, filter: "blur(12px)" }}, {{ opacity: 1, filter: "blur(0px)", duration: 0.35, '
          f'ease: "power3.out", immediateRender: true }}, 0.1);\n')
    js += (f'  tl.fromTo(q("#{cid}-b"), {{ opacity: 0, y: 30, filter: "blur(12px)" }}, {{ opacity: 1, y: 0, filter: "blur(0px)", '
           f'duration: 0.4, ease: "power3.out", immediateRender: true }}, 0.6);\n')
    js += (f'  tl.fromTo(q("#{cid}-c"), {{ opacity: 0 }}, {{ opacity: 1, duration: 0.4, immediateRender: true }}, 1.2);\n')
    return _doc(cid, 1920, 1080, css, corps, js, fond, 0.66, pousse=d)
