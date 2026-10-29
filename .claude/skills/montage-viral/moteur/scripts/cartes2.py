"""Cartes animées, suite : message, Loom, liste, semaine, horaires, duel, chiffres (vertical 1080 × 1920)."""
from cartes import OR, ROUGE, _doc

VERT = "#49D17D"


def _apparait(sel, t, dy=60, dur=0.32, flou=10):
    return (f'  tl.fromTo(q("{sel}"), {{ y: {dy}, opacity: 0, filter: "blur({flou}px)" }}, {{ y: 0, opacity: 1, '
            f'filter: "blur(0px)", duration: {dur}, ease: "power3.out", immediateRender: true }}, {t:.3f});\n')


def _fin(cid, d):
    import cartes
    if cartes.GLISSE:  # style @yass.views : la carte repart sur une coupe franche, sans fondu des éléments
        return ""
    return (f'  tl.to(R.querySelectorAll(".{cid}-z"), {{ opacity: 0, filter: "blur(10px)", duration: 0.16, '
            f'ease: "power2.in" }}, {d - 0.17:.3f});\n')


def chat(cid, d, fond, t_texte, texte):
    """1er message (contenu inconnu : lignes grises) → réponse → 2ᵉ message : une vidéo Loom + ses mots à lui."""
    css = f"""
.{cid}-z {{ position:absolute; }}
.{cid}-lab {{ font:700 40px/1 "Satoshi"; letter-spacing:.12em; color:var(--doux); margin-bottom:14px; }}
.{cid}-bulle {{ border-radius:34px; padding:30px 34px; display:flex; flex-direction:column; gap:16px; }}
.{cid}-g {{ background:var(--carte); border:1.5px solid var(--bord); border-bottom-left-radius:10px; }}
.{cid}-d {{ background:var(--accent-doux); border:1.5px solid var(--accent-bord); border-bottom-right-radius:10px; }}
.{cid}-trait {{ height:18px; border-radius:9px; background:var(--trait); }}
.{cid}-video {{ position:relative; width:640px; height:360px; border-radius:24px; overflow:hidden;
  background:linear-gradient(135deg,#2b2b33,#17171b); }}
.{cid}-play {{ position:absolute; left:260px; top:120px; width:120px; height:120px; border-radius:50%; background:rgba(255,255,255,.95); }}
.{cid}-tri {{ position:absolute; left:48px; top:36px; width:0; height:0; border-left:40px solid #17171b;
  border-top:24px solid transparent; border-bottom:24px solid transparent; }}
.{cid}-cam {{ position:absolute; left:24px; bottom:24px; width:96px; height:96px; border-radius:50%;
  background:var(--trait); border:3px solid rgba(255,255,255,.6); }}
.{cid}-nomvid {{ position:absolute; right:26px; top:22px; font:700 40px/1 "Satoshi"; color:var(--encre); }}
.{cid}-txt {{ font:500 44px/1.25 "Satoshi"; color:var(--encre); max-width:640px; }}
"""
    corps = f"""
<div class="{cid}-z" id="{cid}-m1" style="left:110px; top:330px; width:600px;">
  <div class="{cid}-lab">1ER MESSAGE</div>
  <div class="{cid}-bulle {cid}-g"><div class="{cid}-trait" style="width:470px"></div><div class="{cid}-trait" style="width:380px"></div></div>
</div>
<div class="{cid}-z" id="{cid}-m2" style="left:400px; top:610px; width:520px;">
  <div class="{cid}-bulle {cid}-d"><div class="{cid}-trait" style="width:430px; background:var(--trait-fort)"></div><div class="{cid}-trait" style="width:250px; background:var(--trait-fort)"></div></div>
</div>
<div class="{cid}-z" id="{cid}-m3" style="left:110px; top:820px; width:720px;">
  <div class="{cid}-lab" style="color:var(--accent)">2ᵉ MESSAGE</div>
  <div class="{cid}-bulle {cid}-g">
    <div class="{cid}-video"><div class="{cid}-play"><div class="{cid}-tri"></div></div><div class="{cid}-cam"></div><div class="{cid}-nomvid">Loom</div></div>
    <div class="{cid}-txt" id="{cid}-txt">« {texte} »</div>
  </div>
</div>
"""
    js = _apparait(f"#{cid}-m1", 0.0) + _apparait(f"#{cid}-m2", 0.28) + _apparait(f"#{cid}-m3", 0.56, 90, 0.36)
    js += (f'  tl.fromTo(q("#{cid}-txt"), {{ opacity: 0 }}, {{ opacity: 1, duration: 0.25, ease: "power2.out", '
           f'immediateRender: true }}, {t_texte:.3f});\n')
    js += _fin(cid, d)
    return _doc(cid, 1080, 1920, css, corps, js, fond, 0.55, pousse=d)


def audit(cid, d, fond, t_forts, t_faibles, t_ameliorer, visage=None):
    """Le Loom : le compte Insta à l'écran, puis points forts, points faibles, choses à améliorer."""
    css = f"""
.{cid}-z {{ position:absolute; }}
.{cid}-cadre {{ left:70px; top:300px; width:860px; height:560px; border-radius:34px; overflow:hidden;
  background:var(--carte); border:2px solid var(--bord); box-shadow:var(--ombre); }}
.{cid}-tete {{ position:absolute; left:46px; top:42px; display:flex; align-items:center; gap:26px; }}
.{cid}-av {{ width:110px; height:110px; border-radius:50%; background:linear-gradient(135deg,#3a3a44,#24242a); border:3px solid var(--accent); }}
.{cid}-trait {{ height:20px; border-radius:10px; background:var(--trait); margin:10px 0; }}
.{cid}-grille {{ position:absolute; left:46px; top:190px; display:grid; grid-template-columns:repeat(3, 240px); gap:16px; }}
.{cid}-post {{ height:150px; border-radius:16px; background:var(--bloc); }}
.{cid}-lab {{ position:absolute; right:40px; top:40px; font:700 40px/1 "Satoshi"; letter-spacing:.1em; color:var(--doux); }}
.{cid}-bulle {{ position:absolute; left:34px; bottom:30px; width:150px; height:150px; border-radius:50%; overflow:hidden;
  border:4px solid #fff; background:#333 center/cover no-repeat; }}
.{cid}-col {{ width:270px; top:930px; }}
.{cid}-chip {{ display:flex; align-items:center; gap:12px; font:700 36px/1.05 "Satoshi"; color:var(--encre); }}
.{cid}-pt {{ width:24px; height:24px; border-radius:50%; flex:none; }}
.{cid}-note {{ margin-top:22px; height:120px; border-radius:18px; background:var(--bloc); border:1.5px solid var(--bord); }}
.{cid}-note2 {{ margin-top:14px; height:90px; border-radius:18px; background:var(--bloc); border:1.5px solid var(--bord); }}
"""
    bulle = f'<div class="{cid}-bulle" style="background-image:url({visage})"></div>' if visage else ""
    cols = ""
    for i, (txt, coul) in enumerate((("Points forts", VERT), ("Points faibles", ROUGE), ("À améliorer", OR))):
        cols += (f'<div class="{cid}-z {cid}-col" id="{cid}-c{i}" style="left:{70 + i * 290}px">'
                 f'<div class="{cid}-chip"><span class="{cid}-pt" style="background:{coul}"></span>{txt}</div>'
                 f'<div class="{cid}-note"></div><div class="{cid}-note2"></div></div>')
    posts = "".join(f'<div class="{cid}-post"></div>' for _ in range(6))
    corps = f"""
<div class="{cid}-z {cid}-cadre" id="{cid}-cadre">
  <div class="{cid}-tete"><div class="{cid}-av"></div><div><div class="{cid}-trait" style="width:260px"></div><div class="{cid}-trait" style="width:180px"></div></div></div>
  <div class="{cid}-lab">COMPTE INSTA</div>
  <div class="{cid}-grille">{posts}</div>
  {bulle}
</div>
{cols}
"""
    js = (f'  tl.fromTo(q("#{cid}-cadre"), {{ scale: 0.86, opacity: 0, filter: "blur(14px)" }}, {{ scale: 1, opacity: 1, '
          f'filter: "blur(0px)", duration: 0.36, ease: "expo.out", immediateRender: true }}, 0.0);\n')
    for i, t in enumerate((t_forts, t_faibles, t_ameliorer)):
        js += _apparait(f"#{cid}-c{i}", t, 50, 0.3)
    js += _fin(cid, d)
    return _doc(cid, 1080, 1920, css, corps, js, fond, 0.55, pousse=d)


def liste(cid, d, fond, items):
    """Ce que « tout le monde sait » : chaque conseil se raye quand il le dit. items = [(texte, t_apparition, t_raye)]."""
    css = f"""
.{cid}-z {{ position:absolute; left:90px; width:840px; }}
.{cid}-row {{ padding:34px 38px; border-radius:30px; background:var(--carte); border:1.5px solid var(--bord); }}
.{cid}-t {{ position:relative; display:inline-block; font:700 46px/1.1 "Satoshi"; color:var(--encre); white-space:nowrap; }}
.{cid}-barre {{ position:absolute; left:-6px; right:-6px; top:54%; height:7px; background:var(--accent); transform-origin:0 50%; }}
.{cid}-sait {{ display:block; margin-top:14px; font:italic 400 64px/1 "Instrument Serif"; color:var(--accent); }}
"""
    corps, js = "", ""
    for i, (txt, t_app, t) in enumerate(items):
        corps += (f'<div class="{cid}-z" id="{cid}-r{i}" style="top:{560 + i * 330}px"><div class="{cid}-row">'
                  f'<span class="{cid}-t">{txt}<span class="{cid}-barre" id="{cid}-b{i}"></span></span>'
                  f'<span class="{cid}-sait" id="{cid}-s{i}">tout le monde le sait</span></div></div>')
        js += _apparait(f"#{cid}-r{i}", t_app, 60, 0.32)
        js += (f'  tl.fromTo(q("#{cid}-b{i}"), {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.3, ease: "power2.inOut", '
               f'immediateRender: true }}, {t:.3f});\n')
        js += (f'  tl.fromTo(q("#{cid}-s{i}"), {{ opacity: 0, x: -20 }}, {{ opacity: 1, x: 0, duration: 0.24, '
               f'ease: "power3.out", immediateRender: true }}, {t + 0.05:.3f});\n')
    js += _fin(cid, d)
    return _doc(cid, 1080, 1920, css, corps, js, fond, 0.55, pousse=d)


TEL = ('<svg viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97'
       'c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19'
       'C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>')


def semaine(cid, d, fond, titre, cases, sous=None):
    """Une semaine (L M M J V S D), le 1er jour = aujourd'hui ; cases = [(index du jour, t, libellé)]."""
    css = f"""
.{cid}-z {{ position:absolute; }}
.{cid}-titre {{ left:0; right:0; top:420px; text-align:center; color:var(--encre); }}
.{cid}-titre b {{ display:block; font:400 142px/.95 "Impact Yass"; letter-spacing:0; }}
.{cid}-titre i {{ display:block; margin-top:16px; font:italic 400 70px/1 "Instrument Serif"; color:var(--accent); }}
.{cid}-sem {{ left:80px; width:840px; top:800px; display:grid; grid-template-columns:repeat(7, 1fr); gap:12px; }}
.{cid}-j {{ height:300px; border-radius:24px; background:var(--carte); border:1.5px solid var(--bord);
  display:flex; flex-direction:column; align-items:center; padding-top:22px; font:700 40px/1 "Satoshi"; color:var(--doux); position:relative; }}
.{cid}-chip {{ position:absolute; left:8px; right:8px; bottom:16px; height:150px; border-radius:16px; background:var(--accent); color:var(--sur-accent);
  font:700 30px/1.1 "Satoshi"; display:flex; align-items:center; justify-content:center; text-align:center; padding:4px; }}
.{cid}-chip svg {{ width:62px; height:62px; fill:var(--sur-accent); }}
.{cid}-auj {{ border:2px solid var(--encre); color:var(--encre); }}
"""
    sem = ""
    for i, j in enumerate("LMMJVSD"):
        auj = f" {cid}-auj" if i == 0 else ""
        chip = "".join(f'<div class="{cid}-chip" id="{cid}-ch{i}">{TEL if lab == "APPEL" else lab}</div>'
                       for (k, t, lab) in cases if k == i)
        sem += f'<div class="{cid}-j{auj}">{j}{chip}</div>'
    sous_html = f'<i>{sous}</i>' if sous else ""
    corps = (f'<div class="{cid}-z {cid}-titre" id="{cid}-titre"><b>{titre}</b>{sous_html}</div>'
             f'<div class="{cid}-z {cid}-sem" id="{cid}-sem">{sem}</div>')
    js = _apparait(f"#{cid}-titre", 0.0, 40, 0.3) + _apparait(f"#{cid}-sem", 0.12, 70, 0.34)
    for (k, t, lab) in cases:
        js += (f'  tl.fromTo(q("#{cid}-ch{k}"), {{ scale: 0.6, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.24, '
               f'ease: "power3.out", immediateRender: true }}, {t:.3f});\n')
    js += _fin(cid, d)
    return _doc(cid, 1080, 1920, css, corps, js, fond, 0.55, pousse=d)


def horaires(cid, d, fond, t_debut, t_fin, qui="LE PATRON"):
    """« Faut que tu viennes ici à 8 h et tu pars à 17 h » : deux heures et la journée qui se remplit."""
    css = f"""
.{cid}-z {{ position:absolute; left:0; right:0; text-align:center; color:var(--encre); }}
.{cid}-qui {{ top:470px; font:700 44px/1 "Satoshi"; letter-spacing:.18em; color:var(--doux); }}
.{cid}-h {{ font:400 271px/.9 "Impact Yass"; letter-spacing:0; }}
.{cid}-barre {{ left:140px; right:160px; top:930px; height:26px; border-radius:13px; background:var(--trait); overflow:hidden; }}
.{cid}-plein {{ width:100%; height:100%; background:var(--accent); transform-origin:0 50%; }}
"""
    corps = (f'<div class="{cid}-z {cid}-qui" id="{cid}-qui">{qui}</div>'
             f'<div class="{cid}-z {cid}-h" id="{cid}-h1" style="top:610px">8H</div>'
             f'<div class="{cid}-z {cid}-barre" id="{cid}-barre"><div class="{cid}-plein" id="{cid}-plein"></div></div>'
             f'<div class="{cid}-z {cid}-h" id="{cid}-h2" style="top:1010px; color:var(--accent)">17H</div>')
    js = _apparait(f"#{cid}-qui", 0.0, 30, 0.26)
    js += (f'  tl.fromTo(q("#{cid}-h1"), {{ scale: 1.4, opacity: 0, filter: "blur(14px)" }}, {{ scale: 1, opacity: 1, '
           f'filter: "blur(0px)", duration: 0.22, ease: "power4.out", immediateRender: true }}, {t_debut:.3f});\n')
    js += (f'  tl.fromTo(q("#{cid}-barre"), {{ opacity: 0 }}, {{ opacity: 1, duration: 0.2, immediateRender: true }}, '
           f'{t_debut + 0.1:.3f});\n')
    js += (f'  tl.fromTo(q("#{cid}-plein"), {{ scaleX: 0 }}, {{ scaleX: 1, duration: {max(0.3, t_fin - t_debut):.2f}, '
           f'ease: "power1.inOut", immediateRender: true }}, {t_debut + 0.1:.3f});\n')
    js += (f'  tl.fromTo(q("#{cid}-h2"), {{ scale: 1.4, opacity: 0, filter: "blur(14px)" }}, {{ scale: 1, opacity: 1, '
           f'filter: "blur(0px)", duration: 0.22, ease: "power4.out", immediateRender: true }}, {t_fin:.3f});\n')
    js += _fin(cid, d)
    return _doc(cid, 1080, 1920, css, corps, js, fond, 0.6, pousse=d)


def duel(cid, d, fond, t_haut, t_bas, haut="TON POTE", bas="pas ton patron"):
    """Deux mots qui s'opposent, l'un au-dessus de l'autre."""
    css = f"""
.{cid}-z {{ position:absolute; left:0; right:0; text-align:center; }}
.{cid}-a {{ left:60px; right:140px; top:520px; font:400 184px/.9 "Impact Yass"; letter-spacing:0; color:var(--accent); }}
.{cid}-sep {{ left:200px; right:280px; top:900px; height:4px; background:var(--trait-fort); transform-origin:50% 50%; }}
.{cid}-b {{ left:60px; right:140px; top:990px; font:italic 400 150px/.95 "Instrument Serif"; color:var(--doux); }}
"""
    corps = (f'<div class="{cid}-z {cid}-a" id="{cid}-a">{haut}</div><div class="{cid}-z {cid}-sep" id="{cid}-sep"></div>'
             f'<div class="{cid}-z {cid}-b" id="{cid}-b">{bas}</div>')
    js = (f'  tl.fromTo(q("#{cid}-a"), {{ scale: 1.35, opacity: 0, filter: "blur(16px)" }}, {{ scale: 1, opacity: 1, '
          f'filter: "blur(0px)", duration: 0.24, ease: "power4.out", immediateRender: true }}, {t_haut:.3f});\n')
    js += (f'  tl.fromTo(q("#{cid}-sep"), {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.35, ease: "expo.out", '
           f'immediateRender: true }}, {t_haut + 0.1:.3f});\n')
    js += (f'  tl.fromTo(q("#{cid}-b"), {{ y: 40, opacity: 0, filter: "blur(10px)" }}, {{ y: 0, opacity: 1, '
           f'filter: "blur(0px)", duration: 0.26, ease: "power3.out", immediateRender: true }}, {t_bas:.3f});\n')
    js += _fin(cid, d)
    return _doc(cid, 1080, 1920, css, corps, js, fond, 0.6, pousse=d)


def stat(cid, d, fond, t_1000, t_8000, t_label, t_2000):
    """Son meilleur mois 1 000 € → 8 000 € le 1er mois de collaboration (barres à l'échelle) → 2 000 € la 1re semaine."""
    base, hmax = 1300, 760
    h1, h8 = hmax / 8, hmax
    css = f"""
.{cid}-z {{ position:absolute; }}
.{cid}-col {{ width:400px; text-align:center; color:var(--encre); }}
.{cid}-lab {{ font:700 40px/1.15 "Satoshi"; letter-spacing:.1em; color:var(--doux); }}
.{cid}-val {{ font:400 123px/1 "Impact Yass"; letter-spacing:0; margin-top:12px; white-space:nowrap; }}
.{cid}-esp {{ display:inline-block; width:.24em; }}
.{cid}-barre {{ width:260px; bottom:{1920 - base}px; border-radius:24px 24px 6px 6px; transform-origin:50% 100%; }}
.{cid}-chip {{ left:130px; right:160px; top:{base + 50}px; padding:26px 30px; border-radius:999px; text-align:center;
  background:var(--accent-doux); border:2px solid var(--accent); font:700 46px/1 "Satoshi"; color:var(--encre); }}
.{cid}-chip b {{ color:var(--accent); font-weight:900; }}
"""
    corps = f"""
<div class="{cid}-z {cid}-barre" id="{cid}-b1" style="left:150px; height:{h1:.0f}px; background:var(--trait-fort)"></div>
<div class="{cid}-z {cid}-barre" id="{cid}-b8" style="left:570px; height:{h8:.0f}px; background:var(--accent)"></div>
<div class="{cid}-z {cid}-col" id="{cid}-c1" style="left:80px; top:{base - h1 - 290:.0f}px"><div class="{cid}-lab">SON MEILLEUR MOIS</div><div class="{cid}-val" id="{cid}-v1">1<span class="{cid}-esp"></span>000&nbsp;€</div></div>
<div class="{cid}-z {cid}-col" id="{cid}-c8" style="left:480px; width:440px; top:{base - h8 - 262:.0f}px"><div class="{cid}-lab" id="{cid}-l8">1ER MOIS DE COLLABORATION</div><div class="{cid}-val" style="color:var(--accent)"><span id="{cid}-n8">0</span>&nbsp;€</div></div>
<div class="{cid}-z {cid}-chip" id="{cid}-chip"><b>2 000 €</b> dès la 1re semaine</div>
"""
    js = (f'  tl.fromTo(q("#{cid}-b1"), {{ scaleY: 0 }}, {{ scaleY: 1, duration: 0.4, ease: "expo.out", '
          f'immediateRender: true }}, {t_1000 - 0.1:.3f});\n')
    js += _apparait(f"#{cid}-c1", 0.1, 30, 0.28)
    js += (f'  tl.fromTo(q("#{cid}-v1"), {{ opacity: 0, scale: 1.3, filter: "blur(10px)" }}, {{ opacity: 1, scale: 1, '
           f'filter: "blur(0px)", duration: 0.22, ease: "power4.out", immediateRender: true }}, {t_1000 - 0.05:.3f});\n')
    js += (f'  tl.fromTo(q("#{cid}-b8"), {{ scaleY: 0 }}, {{ scaleY: 1, duration: 0.7, ease: "expo.out", '
           f'immediateRender: true }}, {t_8000 - 0.1:.3f});\n')
    js += _apparait(f"#{cid}-c8", t_8000 - 0.1, 30, 0.28)
    js += (f'  var n8 = {{ v: 0 }};\n  tl.fromTo(n8, {{ v: 0 }}, {{ v: 8000, duration: 0.7, ease: "expo.out", immediateRender: true, '
           f'onUpdate: function () {{ var v = Math.round(n8.v / 10) * 10; q("#{cid}-n8").textContent = '
           f'v >= 1000 ? Math.floor(v / 1000) + "\\u00a0" + String(v % 1000).padStart(3, "0") : String(v); }} }}, {t_8000 - 0.1:.3f});\n')
    js += (f'  tl.fromTo(q("#{cid}-l8"), {{ opacity: 0.3 }}, {{ opacity: 1, duration: 0.2, immediateRender: true }}, '
           f'{t_label:.3f});\n')
    js += _apparait(f"#{cid}-chip", t_2000 - 0.05, 40, 0.3)
    js += _fin(cid, d)
    return _doc(cid, 1080, 1920, css, corps, js, fond, 0.6, pousse=d)


def stat_simple(cid, d, fond, chiffre, ligne1, ligne2=""):
    """Un chiffre dit, en grand : « 2 500 » / « vues sur YouTube » / « et pas mal de cash collecté »."""
    css = f"""
.{cid}-z {{ position:absolute; left:0; right:0; text-align:center; color:var(--encre); }}
.{cid}-n {{ top:640px; font:400 307px/.9 "Impact Yass"; letter-spacing:0; color:var(--accent); }}
.{cid}-a {{ top:920px; font:italic 400 110px/1 "Instrument Serif"; }}
.{cid}-b {{ top:1070px; font:700 48px/1.2 "Satoshi"; color:var(--doux); }}
"""
    corps = (f'<div class="{cid}-z {cid}-n" id="{cid}-n">{chiffre}</div>'
             f'<div class="{cid}-z {cid}-a" id="{cid}-a">{ligne1}</div>'
             f'<div class="{cid}-z {cid}-b" id="{cid}-b">{ligne2}</div>')
    js = (f'  tl.fromTo(q("#{cid}-n"), {{ scale: 1.4, opacity: 0, filter: "blur(16px)" }}, {{ scale: 1, opacity: 1, '
          f'filter: "blur(0px)", duration: 0.26, ease: "power4.out", immediateRender: true }}, 0.15);\n')
    js += _apparait(f"#{cid}-a", 0.45, 40, 0.3)
    js += _apparait(f"#{cid}-b", min(d - 1.0, 2.2), 30, 0.3)
    js += _fin(cid, d)
    return _doc(cid, 1080, 1920, css, corps, js, fond, 0.6, pousse=d)
