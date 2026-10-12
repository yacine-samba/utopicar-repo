"""Carrousels « dingueries » : anecdotes d'achat-revente tirées par les cheveux, pour les débutants qui veulent se lancer,
faites pour être envoyées au pote avec qui ils veulent se lancer.
Histoires inventées (ne jamais les présenter comme vraies) ; les montants (cote, prix) restent réalistes.
Racontées en POV (« tu ») : le débutant se voit dedans, et on l'envoie au pote « c'est trop toi ».
Accroches écrites avec le skill « L'art du hook ». Gabarit : slide.html (charte du site + visuels ajoutés).
→ carousels.json (lu par slide.html) + legendes.md.
usage : python carousels-dingueries/build.py
rendu : CAR=carousels-dingueries node scripts/render-carousels.mjs"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'carousels-v3'))
from common import S, QUOTE, CHAT, TICKET

def NOKIA(head=None, time=None, msg=None, sub=None, foot=None, batt=4):
    return dict(k='nokia', head=head, time=time, msg=msg, sub=sub, foot=foot, batt=batt)
# Visuels ajoutés : annonce façon capture, chrono, pensée, format mème, bilan, grand chiffre orange.
# Photo plein cadre de l'image 1 : S(hero=dict(src=…, tag=(ancien prix, nouveau prix), bub=(x, y)), top=…)
CLIO = '../assets/demo/clio-2.webp'   # vraie photo d'annonce (plaque floutée), déjà utilisée dans les films
def LISTING(src, t, m, p, l, note=None, nx=None, ny=None, n=8): return dict(k='listing', src=src, t=t, m=m, p=p, l=l, note=note, nx=nx, ny=ny, n=n)
def CHRONO(t, p, price, olds=(), plus=None, cap=None): return dict(k='chrono', t=t, p=p, price=price, olds=list(olds), plus=plus, cap=cap)
def THOUGHT(t, lab='Dans ta tête :', size=None): return dict(k='thought', t=t, lab=lab, size=size)
def SPLIT(a, b): return dict(k='split', a=list(a), b=list(b))
def STATS(*items): return dict(k='stats', items=[list(i) for i in items])
def BIGO(v, cap=None): return dict(k='big', v=v, cap=cap, tone='o')

def car(slug, hook, caption, question, slides, end, share, tags, cta, sound=None):
    """slides = images de contenu ; `end` = morale de la dernière image (sous la grande bulle « … ») ;
    share = (avant, mot orange, suite, signature) ; cta = phrase de la légende (le mot à commenter)."""
    lead, k, sub, sign = share
    return dict(slug=slug, hook=hook, caption=caption, question=question, sound=sound, tags=tags, cta=cta,
                share=dict(lead=lead, k=k, sub=sub, sign=sign), slides=slides + [S(title=end, bigdots=True)])

# 5 images, une idée chacune. La boucle : tu te tais, il baisse (1 300 €) ; tu revends, l'acheteur se tait, tu baisses
# d'autant. Marge : 0 €. Les images 2 et 4 sont la même conversation, rôles inversés : le retournement se voit.
CARS = [
car('tu-ne-dis-pas-un-mot', 'POV / scénario + résultat impossible, retournement en image 4',
    "POV : ta première visite pour acheter une voiture à revendre. Tu ne dis pas un mot, le vendeur baisse tout seul "
    "de 1 300 €. Une semaine après, c'est toi qui revends…",
    "Toi, tu craques au bout de combien de secondes ?", [
  S(hero=dict(src=CLIO, pos='50% 40%', tag=("5 900 €", "4 600 €"), tx=520, ty=290, bub=(730, 560)), top=800,
    kicker="POV : ta 1re visite", title="Tu ne dis pas\nun *mot*."),
  S(comp=[CHAT(["v", "Bon… 5 500.", "Le vendeur · 0:12"], ["m", "…"],
               ["v", "5 200, dernier prix.", "Le vendeur · 1:40"], ["m", "…"],
               ["v", "4 700 et je fais le plein !", "Le vendeur · 3:58"]),
          THOUGHT("J'ai oublié mon prénom.", size=64)], glow=('105% 25%', .24)),
  S(comp=[CHAT(["m", "Je… je peux réfléchir ?", "Toi, enfin"]), BIGO("4 600 €", "répond le vendeur.")],
    glow=('50% 95%', .45)),
  S(title="Une semaine après,\ntu la *revends*.",
    comp=[CHAT(["v", "…", "L'acheteur"], ["m", "Bon… 5 500."], ["v", "…", "L'acheteur"], ["m", "4 600 et je fais le plein !"]),
          dict(k='verdict', v="Marge : 0 €", tone='bad')], glow=('-5% 60%', .26)),
], "Le premier\nqui parle *perd*.",
   ("Envoie ça à", "ton pote", "qui parle trop.", ""),
   ['#achatrevente', '#negociation', '#debutant', '#voitureoccasion'],
   cta="Commente DÉBUTANT et je t'envoie le guide « Ta première revente, étape par étape »."),
]

def plain(s):
    for a in ('**', '*', '[r]', '[/r]', '[g]', '[/g]', '==', '++'): s = s.replace(a, '')
    return s.replace('\n', ' ')

out, md = [], ["# Légendes des carrousels « dingueries »\n",
               "Cible : les débutants qui veulent se lancer en achat-revente. Histoires inventées, faites pour être partagées : "
               "ne jamais écrire « histoire vraie » ni « ça m'est arrivé ». "
               "Pour chaque carrousel : l'accroche de l'image 1, son type, puis la légende à copier telle quelle.\n"]
for i, c in enumerate(CARS):
    cid = f"DG{i + 1:02d}"
    out.append(dict(id=cid, slug=c['slug'], share=c['share'], slides=c['slides'], car=None))
    h = c['slides'][0]; hook = plain(' '.join(x for x in [h.get('kicker'), h.get('title'), h.get('body')] if x))
    md.append(f"## {cid} · {c['slug']}\n\n**Image 1 :** {hook}  \n**Type d'accroche :** {c['hook']}  \n"
              f"**Images :** {len(c['slides'])}\n\n"
              f"```\n{c['caption']}\n{c['question']}\n{c['cta']}\n\n{' '.join(c['tags'])}\n```\n"
              + (f"Son : {c['sound']}\n" if c.get('sound') else "Son : un son tendance, choisi dans TikTok au moment de publier.\n"))
json.dump(dict(carousels=out), open(os.path.join(HERE, 'carousels.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(os.path.join(HERE, 'legendes.md'), 'w', encoding='utf-8').write('\n'.join(md))
print(len(out), 'carrousel(s) :', ', '.join(f"{x['id']} {x['slug']} ({len(x['slides'])} images)" for x in out))
