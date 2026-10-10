"""Carrousels de conversion : la DA de base des carrousels utopicar, en mode clair (couleurs du site public), poussée en
« 2027 » : fond aurore avec grain, surfaces en verre, pastille d'analyse en direct, offre en pass.
But : emmener l'audience TikTok sur utopicar.fr pour faire une analyse (lien en bio). Offre : 3 analyses offertes.
Règle d'écriture (10 oct. 2026) : une idée par image, 15 mots lisibles au plus, vocabulaire de débutant
(« prix du marché » plutôt que « cote »). On lit environ 20 % des mots d'une page (Nielsen, 2008) : le reste est perdu.
Preuves : les vraies annonces Leboncoin du 3 octobre 2026 passées dans l'outil (web/src/lib/demo.ts), chiffres inchangés.
Accroches validées (skill art-du-hook, recherche de cible du 10 oct. 2026) : D1 à D5.
Étape 2 (direction graphique) : échantillon de D1, version simplifiée.
usage : python carousels-conversion/build.py [--rendu]"""
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); VIDEO = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(VIDEO, 'carousels-v3'))
from common import S

def LISTING(src, t, p, m=None, l=None, note=None, nx=None, ny=None, n=8, pos=None, island=None, ph=None):
    return dict(k='listing', src=src, t=t, m=m, p=p, l=l, note=note, nx=nx, ny=ny, n=n, pos=pos, island=island, ph=ph)
def ISLAND(t, sub=None, state=None): return dict(k='island', t=t, sub=sub, state=state)
def BIG(v, cap=None, tone=None): return dict(k='big', v=v, cap=cap, tone=tone)

def ROWS(*items, lab=None): return dict(k='rows', items=[list(i) for i in items], lab=lab)
def PILLS(*items): return dict(k='pills', items=[list(i) for i in items])

def TICKET(*items, tot, totLab='Total', tone='', lab=None): return dict(k='ticket', items=[list(i) for i in items], tot=tot, totLab=totLab, tone=tone, lab=lab)
def VS(a, b): return dict(k='vs', a=a, b=b)

# fin : le pass (3 analyses de marge offertes, sans carte bancaire, l'adresse du site) et une seule action.
# Une analyse de marge est une analyse Benef : l'offre doit ouvrir Benef (formule offerte ou crédits Benef), pas les crédits
# « particulier » actuels (verdict, coût réel, prix à proposer, sans marge).
OFFRE = {'pass': True, 'badge': "Offert", 'n': "3", 'l1': "analyses\nde marge", 'codeLab': "Sur le site", 'word': "utopicar.fr",
         'l2': "Sans carte\nbancaire", 'gets': [], 'btn': "Lien dans ma bio →", 'ou': "Colle l'annonce, vois ta marge."}
PREUVE = "Vraie annonce Leboncoin du 3 octobre 2026, analysée par utopicar"
# Marge de la Clio, ligne par ligne : prix du marché (7 550 €) et prix proposé (6 250 €) et choc (425 €) = sorties de l'outil ;
# carte grise 5 CV de plus de 10 ans au tarif par défaut de l'outil (68,95 €/CV ÷ 2 + 13,76 €) = 186 € ; CT, nettoyage,
# annonce = 150 € (guide débutant). 7 550 − 6 250 − 425 − 186 − 150 = 539 €. Au prix affiché (6 700 €) : 89 €.
# En micro-entreprise, l'URSSAF prend en plus 12,3 % du prix de vente (929 € ici) : la marge devient négative, d'où la mention.

# Test d'accroches sur D1 : même carrousel, seule l'image 1 change (une famille du skill art-du-hook par variante).
# Chiffres : ceux de la Clio (prix affiché 6 700 €, prix conseillé 6 250 €, marge 539 € ou 89 €, écart 450 €).
def ANNONCE(note=True): return dict(vraie=True, **LISTING('img/clio-1.webp', "Renault Clio IV", "6 700 €", note="un choc ?" if note else None, nx=400, ny=430,
                                       n=3, pos='30% 70%', ph=380, island=dict(t="Analyse en cours…")))
# Diversifiées le 10 oct. 2026 : le choc n'apparaît plus que dans B, pas d'annotation sur la photo, et chaque accroche
# s'appuie sur un chiffre ou un angle différent (marge, revente, prix du marché, comparaison, prix à proposer, horaire).
ACCROCHES = [  # (lettre, famille, petit texte, grand texte, annotation « un choc ? » sur la photo)
    ('A', "Contraste chiffré (référence)", "Ta 1re voiture à revendre", "89 € de marge.\nOu *539 €*.", False),
    ('B', "Croyance → vérité", "Ta 1re voiture à revendre", "Un choc sur l'aile.\n*539 €* de marge.", False),
    ('C', "Scénario POV, perte", "POV : le vendeur décroche", "« Ok pour 6 700 €. »\nTu perds *450 €*.", False),
    ('D', "Résultat d'abord", "Ta 1re voiture à revendre", "Achète 6 250 €.\nRevends *7 550 €*.", False),
    ('E', "Devinette (fait commenter)", "Clio IV à 6 700 €", "Tu proposes\n*combien* ?", False),
    ('F', "Appel d'identité", "Tu débutes en achat-revente ?", "Cette Clio\nte laisse *539 €*.", False),
    ('G', "Interdit", "Clio IV à 6 700 €", "N'appelle pas\nsans *ce chiffre*.", False),
    ('H', "Verdict d'abord", "Ta 1re voiture à revendre", "*425 €* sous le\nprix du marché.", False),
    ('I', "Scénario minuté", "18 h 02 : la Clio sort", "18 h 03 : tu connais\nta *marge*.", False),
    ('J', "Preuve par la comparaison", "Clio IV à 6 700 €", "Comparée à\n*174* autres Clio.", False),
]

def corps():
  return [
    # 2 · la réponse, en un chiffre
    S(comp=[ISLAND("Verdict : bon prix", state='ok'), BIG("425 €", cap="sous le prix du marché,\nchoc compris.", tone='g')],
      credit=PREUVE),
    # 3 · ce qu'il peut gagner : la marge, ligne par ligne
    S(title="Ta marge :\n*539 €*.",
      comp=[TICKET(("Revente au marché", "7 550 €"), ("Achat au prix conseillé", "− 6 250 €"), ("Choc à réparer", "− 425 €"),
                   ("Carte grise, 5 CV", "− 186 €"), ("CT, nettoyage, annonce", "− 150 €"), tot="539 €", totLab="Marge", tone='g')],
      credit="Avant trajet et charges. En micro-entreprise, l'URSSAF prend 12,3 % du prix de vente.", align='flex-start'),
    # 4 · ce que vaut le prix conseillé
    S(title="La négo vaut\n*450 €*.",
      comp=[VS(("Au prix affiché", ["Payée 6 700 €", "**89 €**\nde marge"]), ("Au prix conseillé", ["Payée 6 250 €", "**539 €**\nde marge"]))]),
    # 5 · l'action
    S(title="Fais pareil\navec *la tienne*."),
  ]

CAROUSELS = [dict(id=f'D1{l}', slug='accroche-' + l.lower(), famille=f, offer=OFFRE, car=None,
                  slides=[S(kicker=k, title=t, comp=[ANNONCE(n)], swipe="Glisse →")] + corps())
             for l, f, k, t, n in ACCROCHES]

from app20 import APP20
CAROUSELS += APP20
# un dossier par post : post.txt (titre TikTok, légende, 3 hashtags) à côté des images
for c in APP20:
    d = os.path.join(VIDEO, 'renders', 'carousels-conversion', f"{c['id']}-{c['slug']}"); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'post.txt'), 'w', encoding='utf-8').write(
        '\n'.join(["TITRE", c['titre'], "", "LÉGENDE", c['legende'],
                   "3 jours de Benef offerts, sans carte bancaire : lien dans ma bio.", "", ' '.join(c['tags'])]) + '\n')

# contrôle : mots lisibles par image (titres, textes, annonce, pastilles ; pas la ligne de source)
def mots(sl, c, last):
    t = ' '.join(str(sl.get(k) or '') for k in ('kicker', 'title', 'body', 'body2'))
    for x in sl.get('comp') or []:
        t += ' ' + ' '.join(str(x.get(k) or '') for k in ('t', 'p', 'm', 'l', 'note', 'v', 'cap', 'sub'))
        if x.get('island'): t += ' ' + x['island']['t']
        for it in x.get('items') or []: t += ' ' + ' '.join(str(v) for v in (it if isinstance(it, list) else [it]) if v not in ('ok', 'warn', 'bad', 'neu'))
        if x.get('lab'): t += ' ' + x['lab']
    if last and c.get('offer'):
        o = c['offer']; t += ' ' + ' '.join([o['n'], o['l1'], o['word'], o['l2'], o['btn'], o['ou'], o['badge'], *o['gets']])
    return len(re.findall(r"[\wÀ-ÿ€']+", re.sub(r'[*=+]', '', t)))
for c in CAROUSELS:
    print(c['id'], 'mots par image :', [mots(sl, c, i == len(c['slides']) - 1) for i, sl in enumerate(c['slides'])])

json.dump(dict(carousels=CAROUSELS), open(os.path.join(HERE, 'carousels.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(CAROUSELS), 'carrousel(s) :', ', '.join(f"{c['id']} {c['slug']} ({len(c['slides'])} images)" for c in CAROUSELS))
if '--rendu' in sys.argv:
    env = dict(os.environ, CAR='carousels-conversion', PYTHON=os.environ.get('PYTHON', sys.executable))
    subprocess.run(['node', 'scripts/render-carousels.mjs'] + [a for a in sys.argv[1:] if a != '--rendu'], cwd=VIDEO, env=env, check=True)
