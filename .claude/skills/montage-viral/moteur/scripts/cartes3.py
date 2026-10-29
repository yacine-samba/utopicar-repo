"""Éléments du style @yass.views (STYLE.md) : l'intercalaire mot à mot et la carte vidéo.

- mots : plein cadre bleu ou blanc à trame ; les mots dits s'affichent un par un au centre, au début du mot dans la
  voix ; les petits mots en linéale (Satoshi), les mots forts en serif italique qui entre par un fondu de 0,18 s.
  Référence : 3,0–4,6 s (blanc), 7,25–8,35 s (bleu), 8,40–9,60 s (bleu sur blanc).
- video : une carte arrondie avec un extrait du Loom, qui monte depuis le bas en freinant, légère perspective, sur le
  fond à trame. Référence : 4,70–5,45 s. Les sous-titres restent par-dessus.
"""
import html

from cartes import _doc

ENCRE = {"blanc": ("#141414", "#0848E0"), "bleu": ("#FFFFFF", "#FFFFFF")}


def mots(cid, d, theme, morceaux, glisse=False, fmt="v"):
    """morceaux = [(t, texte, style)] en temps local à la carte ; style « sans » ou « serif ». fmt « h » : 1920 × 1080."""
    sans, serif = ENCRE[theme]
    W, H = (1080, 1920) if fmt == "v" else (1920, 1080)
    marges = "left:60px; right:140px;" if fmt == "v" else "left:160px; right:160px;"
    t_sans, t_serif = (66, 128) if fmt == "v" else (78, 168)
    css = f"""
.{cid}-m {{ position:absolute; {marges} top:0; bottom:0; display:flex; align-items:center;
  justify-content:center; text-align:center; opacity:0; }}
.{cid}-m.sans {{ font:700 {t_sans}px/1.1 "Satoshi"; letter-spacing:-.5px; color:{sans}; }}
.{cid}-m.serif {{ font:italic 400 {t_serif}px/1 "Instrument Serif"; letter-spacing:-1.5px; color:{serif}; }}
"""
    corps = "".join(f'<div class="{cid}-m {st}" id="{cid}-m{i}">{html.escape(tx)}</div>'
                    for i, (t, tx, st) in enumerate(morceaux))
    js = ""
    for i, (t, tx, st) in enumerate(morceaux):
        t = max(0.0, t)
        if st == "serif":
            js += (f'  tl.fromTo(q("#{cid}-m{i}"), {{ opacity: 0, filter: "blur(10px)" }}, {{ opacity: 1, filter: "blur(0px)", '
                   f'duration: 0.18, ease: "power2.out", immediateRender: true }}, {t:.3f});\n')
        else:
            js += f'  tl.set(q("#{cid}-m{i}"), {{ opacity: 1 }}, {t:.3f});\n'
        if i + 1 < len(morceaux):
            js += f'  tl.set(q("#{cid}-m{i}"), {{ opacity: 0 }}, {max(t + 0.04, morceaux[i + 1][0]):.3f});\n'
    return _doc(cid, W, H, css, corps, js, None, pousse=d, theme=theme, glisse=glisse)


def video(cid, d, theme, src, debut_media, legende=None):
    """Carte arrondie qui monte depuis le bas (0,45 s, freine), flou de mouvement vertical, légère perspective.
    legende = (nom, rôle) : posée sur la trame au-dessus de la carte, en encre (sur l'image, elle se perdait)."""
    encre, accent = ENCRE[theme]
    haut = 430 if legende else 250
    css = f"""
.{cid}-cadre {{ position:absolute; left:100px; top:{haut}px; width:840px; height:{1650 - haut}px; border-radius:34px; overflow:hidden;
  box-shadow:0 40px 90px rgba(0,0,0,.30), 0 4px 14px rgba(0,0,0,.18); transform:perspective(2200px) rotateX(3deg) rotateY(-4deg); }}
.{cid}-cadre video {{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }}
.{cid}-leg {{ position:absolute; left:60px; right:140px; top:250px; text-align:center; }}
.{cid}-leg b {{ display:block; font:400 92px/1 "Impact Yass"; color:{encre}; letter-spacing:0; }}
.{cid}-leg i {{ display:block; margin-top:6px; font:italic 400 64px/1 "Instrument Serif"; color:{accent}; }}
"""
    leg = ""
    if legende:
        leg = (f'<div class="{cid}-leg" id="{cid}-leg"><b>{html.escape(legende[0])}</b>'
               f'<i id="{cid}-role">{html.escape(legende[1])}</i></div>')
    corps = (f'<svg width="0" height="0" style="position:absolute"><filter id="{cid}-fv" x="0" y="-30%" width="100%" '
             f'height="160%"><feGaussianBlur id="{cid}-fvb" stdDeviation="0 0"/></filter></svg>{leg}'
             f'<div class="{cid}-monte" id="{cid}-monte" style="position:absolute; inset:0; filter:url(#{cid}-fv)">'
             f'<div class="{cid}-cadre"><video id="{cid}-v" class="clip" src="{src}" data-start="0" data-duration="{d:.3f}" '
             f'data-media-start="{debut_media:.3f}" data-track-index="0" muted playsinline></video></div></div>')
    js = (f'  tl.fromTo(q("#{cid}-monte"), {{ yPercent: 105 }}, {{ yPercent: 0, duration: 0.45, ease: "expo.out", immediateRender: true }}, 0);\n'
          f'  tl.fromTo(q("#{cid}-fvb"), {{ attr: {{ stdDeviation: "0 60" }} }}, {{ attr: {{ stdDeviation: "0 0" }}, duration: 0.4, '
          f'ease: "expo.out", immediateRender: true }}, 0);\n'
          f'  tl.set(q("#{cid}-monte"), {{ filter: "none" }}, 0.46);\n')
    if legende:
        js += (f'  tl.fromTo(q("#{cid}-leg b"), {{ opacity: 0, y: 24, filter: "blur(8px)" }}, {{ opacity: 1, y: 0, filter: "blur(0px)", '
               f'duration: 0.26, ease: "power3.out", immediateRender: true }}, 0.22);\n'
               f'  tl.fromTo(q("#{cid}-role"), {{ opacity: 0, filter: "blur(10px)" }}, {{ opacity: 1, filter: "blur(0px)", '
               f'duration: 0.2, ease: "power2.out", immediateRender: true }}, 0.42);\n')
    return _doc(cid, 1080, 1920, css, corps, js, None, pousse=d, theme=theme, glisse=False)
