"""Briques des carrousels v2 (charte du site utopicar.fr). Une brique = un composant de slide.html.
Balisage des textes : *mot* = serif italique orange (un seul par titre), **gras**, [r]rouge[/r], [g]vert[/g],
==surligné rouge== et ++surligné vert++ (dans une annonce citée), \\n = retour à la ligne."""

def S(**k): return k
def LIST(*items, start=None): return dict(k='list', items=list(items), start=start)
def ROWS(*items, lab=None): return dict(k='rows', items=[list(i) for i in items], lab=lab)
def PILLS(*items): return dict(k='pills', items=[list(i) for i in items])
def QUOTE(t, lab="L'annonce"): return dict(k='quote', t=t, lab=lab)
def TICKET(*items, tot, totLab='Total', tone='', lab=None): return dict(k='ticket', items=[list(i) for i in items], tot=tot, totLab=totLab, tone=tone, lab=lab)
def VERDICT(v, tone, sub=None, lab=None): return dict(k='verdict', v=v, tone=tone, sub=sub, lab=lab)
def COTE(cote, prix, lo, hi, lab='Le prix face au marché'):
    e = lambda v: f"{v:,} €".replace(',', ' ')
    return dict(k='cote', cote=cote, prix=prix, min=lo, max=hi, coteTxt=e(cote), prixTxt=e(prix), minTxt=e(lo), maxTxt=e(hi), lab=lab)
def CHAT(*items, v='Le vendeur', m='Toi'): return dict(k='chat', items=[list(i) for i in items], v=v, m=m)
def NOTIF(t1, t2, time="à l'instant", h='utopicar · alerte'): return dict(k='notif', t1=t1, t2=t2, time=time, h=h)
def BIG(v, cap=None): return dict(k='big', v=v, cap=cap)
def VS(a, b): return dict(k='vs', a=a, b=b)
def TL(*items): return dict(k='tl', items=[list(i) for i in items])

# Types d'accroche : 5 frameworks du skill « L'art du hook » + 4 types de Conbersa (TikTok hooks for SaaS)
HOOKS = {'CV': 'Croyance → vérité', 'CC': 'Coût caché', 'EI': 'Erreur intelligente', 'PI': 'Phrase impossible à ignorer',
         'DM': 'Démonstration', 'DO': 'Douleur', 'AA': 'Avant / après', 'RE': 'Résultat d\'abord', 'FC': 'Fonction cachée'}

def car(slug, hook, caption, question, slides, end, sound=None):
    """hook = code du type d'accroche (HOOKS). 4 images de contenu + l'image 5 (CTA) dont `end` est le titre."""
    assert len(slides) == 4, slug
    assert hook in HOOKS, (slug, hook)
    return dict(slug=slug, hook=hook, caption=caption, question=question, sound=sound, slides=slides + [S(title=end)])
