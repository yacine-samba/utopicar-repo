"""Contenu des 30 carrousels TikTok UTOPICAR (5 images chacun) → carousels.json + captions.md.
Balisage des textes : **gras**, _léger_, ==surligné==, [rd]rouge[/rd], [gr]vert[/gr], \\n = retour à la ligne.
Captures réelles (données démo) : rects en px CSS des images de assets/ui et assets/ui2.
usage : python3 carousels/build.py"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))

# --- morceaux de vraie interface (rect = [x, y, w, h] en px CSS) ---
def U(ui, r=None, w=820, hl=None, **kw): return dict(ui=ui, r=r, w=w, hl=hl or [], **kw)
GOLF_TOP = lambda w=820, hl=True: U('dcard1', [8, 8, 362, 110], w, [[211, 97, 44, 16]] if hl else [])
GOLF = lambda w=820: U('dcard1', [8, 8, 362, 215], w, [[184, 154, 120, 22]])
CLIO = lambda w=820: U('dcard2', [8, 8, 362, 215], w, [[184, 154, 120, 22]])
TKTOP = lambda w=820: U('ticket', [10, 10, 320, 84], w)
TKTOT = lambda w=820: U('ticket', [10, 432, 320, 88], w, [[155, 454, 170, 44]])
TKLINES = lambda w=760: U('ticket', [10, 90, 320, 340], w, rad=18)
PLAF = lambda w=820: U('plaf', [8, 8, 320, 130], w, [[18, 50, 108, 30]])
LG = lambda n, w=820: U(f'lg{n}', None, w, rad=10, pad=10)
LU = lambda w=820: U('lu', [8, 8, 332, 144], w)
TEXTE = lambda w=820: U('scan', [30, 952, 345, 212], w, rad=20)
DOSSIER = lambda w=860: U('scan', [14, 200, 330, 112], w, rad=16)
LIVE_PRIX = lambda w=840: U('card-lv1', [6, 372, 362, 98], w, [[125, 446.75, 163, 19.5]])
LVMINI = lambda w=720, maxH=None: U('lvmini', [10, 10, 362, 432], w, [[125, 148, 82, 38]], maxH=maxH)
SCHIP = lambda w=620: U('schip', [4, 4, 171, 37], w, rad=20)
QS = lambda w=640: U('qsform', [10, 10, 362, 440], w, rad=20)
FILTERS = lambda w=840: U('filters', [6, 6, 366, 114], w)
VROW = lambda n=1, w=820, days=True: U(f'vrow{n}', [2, 2, 360, 145], w, [[251, 111, 54, 19]] if days else [], rad=20)
KPI = lambda n, w=400: U(f'kpi{n}', [8, 8, 175, 112], w, rad=18)
KPIS = lambda w=820: U('kpis', [8, 8, 362, 359], w, rad=18)
BEST = lambda w=820: U('best', [10, 10, 362, 288], w)
PIPE = lambda w=840: U('pipe', [10, 10, 362, 196], w)
ALERTS = lambda w=840: U('alerts', [10, 10, 362, 254], w)
MCHART = lambda w=680, maxH=820: U('mchart', [10, 10, 362, 446], w, maxH=maxH)
LAUNCH = lambda w=760: U('launch', None, w, rad=18, bare=True)

def car(slug, bg, caption, slides): return dict(slug=slug, bg=bg, caption=caption, slides=slides)
S = lambda **k: k
HT = '#achatrevente #voitureoccasion #marchandvo #achatreventeauto #bonplanauto #utopicar'

C = [
car('golf-1200', 'white', "Cette Golf avait l'air parfaite… jusqu'aux frais. Avant d'acheter, colle l'annonce dans UTOPICAR.", [
  S(title="_Cette Golf à 9 500 €…_\n[rd]t'aurait coûté 1 200 €.[/rd]", ui=[GOLF_TOP()]),
  S(title="Le prix affiché\n==ne dit rien.==", body="Revente estimée : **9 800 €**. Tu te dis « +300 € ». Sauf que…", ui=[LG(1)]),
  S(title="Les frais tombent.", ui=[LG(3, 780), LG(4, 780), LG(5, 780), LG(6, 780)]),
  S(title="Résultat :\n[rd]− 1 200 €.[/rd]", ui=[TKTOP(), TKTOT()]),
  S(title="Avant d'acheter,\n_colle l'annonce._"),
]),
car('5-frais-oublies', 'dark', "Les 5 frais qui mangent ta marge en achat-revente. Enregistre ce post.", [
  S(title="5 frais\nque tout le monde\n==oublie.==", body="(et qui mangent ta marge)"),
  S(num=1, title="La remise en état", body="Pneus, freins, carrosserie : prévois un scénario **prudent**, pas optimiste.", ui=[LG(3)]),
  S(num=2, title="La carte grise", body="Elle dépend des **chevaux fiscaux**, de ta **région** et de l'**âge** de la voiture.", ui=[LG(4)]),
  S(title="3. Le trajet\n4. Les frais fixes\n5. Le temps", body="Contrôle, nettoyage, annonce… et chaque jour en stock immobilise ton argent.", ui=[LG(5, 760), LG(6, 760)]),
  S(title="UTOPICAR les compte\n_tous, en 2 secondes._"),
]),
car('prix-max', 'white', "Le seul chiffre à connaître avant d'appeler un vendeur : ton prix max.", [
  S(title="Avant d'appeler\nun vendeur,\n==connais ton prix max.==", size=112),
  S(title="La formule", body="**Revente estimée**\n− tous les frais\n− ta marge minimum\n= **ton prix plafond**", size=110),
  S(title="Ne dépasse pas\n==7 500 €.==", ui=[PLAF()], body2="Offre de départ conseillée : **7 050 €**."),
  S(title="Au-dessus ?\n[rd]Tu travailles gratuitement.[/rd]", body="Au-delà du plafond, il te reste moins que ta marge minimum."),
  S(title="Ton prix max,\n_calculé pour chaque annonce._"),
]),
car('go-nogo', 'orange', "GO ou NO GO ? UTOPICAR tranche en 2 secondes.", [
  S(title="GO ou NO GO ?\n_Tu as 2 secondes._", size=130),
  S(title="La Golf :\n[rd]38/100. NO GO.[/rd]", ui=[GOLF()]),
  S(title="La Clio :\n==92/100. GO.==", ui=[CLIO()]),
  S(title="Note, verdict,\nce qu'il te reste,\nprix max.", body="Tout est calculé à partir de l'annonce que tu colles."),
  S(title="Sache avant\n_d'acheter._"),
]),
car('sous-la-cote', 'white', "1 450 € sous la cote, publiée il y a 12 minutes. UTOPICAR surveille les annonces pour toi.", [
  S(title="Publiée il y a 12 min.\n[gr]1 450 € sous la cote.[/gr]", ui=[LIVE_PRIX()]),
  S(title="UTOPICAR surveille\n_tes recherches._", ui=[SCHIP()], body2="Tu crées ta recherche une fois. Il la suit pour toi."),
  S(title="Les nouvelles annonces,\n==comparées à la cote.==", ui=[LVMINI(680)]),
  S(title="[gr]+ 1 932 €[/gr]\n_de marge estimée._", ui=[CLIO()]),
  S(title="Sois le premier\n_sur les bonnes affaires._"),
]),
car('pov-feeling', 'dark', "POV : tu achètes au feeling. Spoiler : la facture arrive toujours.", [
  S(title="POV :\ntu achètes\n==au feeling.==", size=130),
  S(title="Le vendeur est sympa.\nLa voiture brille.", body="Tu signes."),
  S(title="Puis la facture\n_du garage arrive._", ui=[LG(3)]),
  S(title="Et ta marge\n[rd]disparaît.[/rd]", ui=[TKTOT()]),
  S(title="Achète avec des chiffres,\n_pas au feeling._"),
]),
car('parc-clair', 'white', "Combien de voitures dorment dans ton parc ? Avec UTOPICAR, tu le vois d'un coup d'œil.", [
  S(title="Combien de voitures\n==dorment==\ndans ton parc ?"),
  S(title="Chaque voiture\n_a son statut._", ui=[FILTERS()]),
  S(title="Achat, vente, marge,\n_jours en stock._", ui=[VROW(1, 800, False), VROW(2, 800, False)]),
  S(title="Celles qui dorment\n==sautent aux yeux.==", ui=[VROW(1), VROW(2)]),
  S(title="Ton parc,\n_enfin clair._"),
]),
car('tableau-de-bord', 'dark', "14 820 € de marge. Et zéro tableur. Le tableau de bord UTOPICAR.", [
  S(title="[gr]14 820 €[/gr] de marge.\n==Zéro tableur.==", ui=[KPI(3, 520)]),
  S(title="Stock, capital,\n_marge, rotation._", ui=[KPIS(760)]),
  S(title="Tes meilleures affaires,\n_repérées pour toi._", ui=[BEST()]),
  S(title="La marge nette\n_de chaque voiture._", ui=[MCHART(560, 760)]),
  S(title="Tes chiffres,\n_sans tableur._"),
]),
car('3-questions', 'white', "3 questions à te poser avant d'acheter une voiture pour la revendre.", [
  S(title="3 questions\n_avant d'acheter_\n==pour revendre.==", size=120),
  S(num=1, title="À combien je la\nrevends vraiment ?", body="Pas au doigt mouillé : avec une **revente estimée**.", ui=[LG(1)]),
  S(num=2, title="Combien elle me coûte\navant la revente ?", body="Remise en état, carte grise, trajet, frais fixes.", ui=[LG(3, 760)]),
  S(num=3, title="Combien de temps\nelle reste chez moi ?", body="Une voiture qui dort, c'est de l'argent qui dort.", ui=[KPI(5, 460)]),
  S(title="UTOPICAR répond\n_aux trois._"),
]),
car('avant-apres', 'orange', "Achat-revente : avant / après UTOPICAR.", [
  S(title="Achat-revente :\n_avant / après._", size=130),
  S(title="Avant :", body="10 onglets ouverts, une calculette,\net **beaucoup d'espoir**."),
  S(title="Après :\n_tu colles l'annonce._", ui=[TEXTE(), LAUNCH(700)]),
  S(title="Et tu as\n==le verdict.==", ui=[GOLF(760), CLIO(760)]),
  S(title="Deux secondes,\n_plus de doute._"),
]),
car('marge-au-pif', 'white', "Ta marge, tu la calcules au pif ? La vraie marge = revente − achat − tous les frais.", [
  S(title="Ta marge,\ntu la calcules\n==au pif ?==", size=130),
  S(title="« Ça devrait passer. »", body="Prix d'achat, revente… et le reste, on verra."),
  S(title="La vraie marge", body="**Revente** − **achat** − **tous les frais**.\nPas un de moins."),
  S(title="Ligne par ligne.", ui=[TKLINES(700)]),
  S(title="Ta vraie marge,\n_avant d'acheter._"),
]),
car('piege-bonne-affaire', 'dark', "Moins cher ≠ bonne affaire. Une bonne affaire, c'est une marge après frais.", [
  S(title="Moins cher\n≠\n==bonne affaire.==", size=140),
  S(title="Une Golf à 9 500 €\n_peut sembler donnée…_", ui=[GOLF_TOP()]),
  S(title="…si elle demande\n[rd]1 100 € de remise en état.[/rd]", ui=[LG(3)]),
  S(title="Une bonne affaire,\n==c'est une marge\naprès frais.==", ui=[CLIO(760)]),
  S(title="Compte avant\n_d'acheter._"),
]),
car('negocie-chiffre', 'white', "Tu négocies avec quel chiffre ? Offre de départ et plafond, calculés par UTOPICAR.", [
  S(title="Tu négocies\n==avec quel chiffre ?==", size=120),
  S(title="Le vendeur annonce\n_9 500 €._", ui=[GOLF_TOP(820, False)]),
  S(title="Ton offre : ==7 050 €==\n_Ton plafond : 7 500 €_", ui=[PLAF()]),
  S(title="Tu sais\noù t'arrêter.", body="Tu ne te fais plus embarquer par l'affect."),
  S(title="Négocie\n_avec un chiffre._"),
]),
car('lu-sans-ia', 'orange', "Tu colles l'annonce, UTOPICAR la lit pour toi : CT, distribution, propriétaires.", [
  S(title="Tu colles l'annonce.\n==UTOPICAR la lit.==", size=110),
  S(title="Le texte,\n_tel quel._", ui=[TEXTE()]),
  S(title="Il repère\n_ce qui compte._", ui=[LU()]),
  S(title="CT, distribution,\npropriétaires…", body="Les infos clés, sans relire l'annonce trois fois."),
  S(title="Lis moins,\n_décide mieux._"),
]),
car('4-papiers', 'white', "Avant d'acheter, demande ces 4 papiers. UTOPICAR te dit ce qui manque au dossier.", [
  S(title="Avant d'acheter,\ndemande\n==ces 4 papiers.==", size=120),
  S(num='1–2', title="HistoVec\n_et le PV de contrôle technique._", size=90),
  S(num='3–4', title="Le carnet d'entretien\n_et la carte grise._", size=90),
  S(title="Ton dossier\n_à 30 % ?_", ui=[DOSSIER()], body2="UTOPICAR te dit **ce qui manque**."),
  S(title="Un dossier complet,\n_une revente sereine._"),
]),
car('jours-en-stock', 'dark', "23 jours : le temps moyen pour revendre. Chaque jour en plus, c'est de l'argent qui dort.", [
  S(title="==23 jours.==\n_Le temps moyen_\n_pour revendre._", size=130),
  S(title="Ta rotation,\n_calculée._", ui=[KPI(5, 520)]),
  S(title="Voiture par voiture,\n_le compteur tourne._", ui=[VROW(1), VROW(3)]),
  S(title="Chaque jour en plus,\n[rd]c'est de l'argent qui dort.[/rd]", ui=[KPI(2, 520)]),
  S(title="Vends plus vite,\n_immobilise moins._"),
]),
car('papiers-vente', 'white', "Tu vends demain : ton dossier est complet ? Les alertes UTOPICAR.", [
  S(title="Tu vends demain.\n==Ton dossier\nest complet ?==", size=120),
  S(title="UTOPICAR\n_te prévient._", ui=[ALERTS()]),
  S(title="CT de moins de 6 mois,\nnon-gage de moins de 15 jours,\ncarte grise.", size=80),
  S(title="L'alerte s'affiche\n_sur la bonne voiture._", ui=[VROW(1, 820, False)]),
  S(title="Plus de vente\n_bloquée par un papier._"),
]),
car('pipeline', 'orange', "Repéré, en préparation, en vente, vendu : tu sais toujours où en est chaque voiture.", [
  S(title="Repéré →\nEn préparation →\nEn vente →\n==Vendu.==", size=110),
  S(title="Ton pipeline,\n_d'un coup d'œil._", ui=[PIPE()]),
  S(title="Filtre\n_par statut._", ui=[FILTERS()]),
  S(title="Tu sais toujours\noù en est\n==chaque voiture.==", size=110),
  S(title="Ton activité,\n_organisée._"),
]),
car('recherche-suivie', 'white', "Les bonnes affaires ne restent pas longtemps en ligne. Crée ta recherche, UTOPICAR la suit.", [
  S(title="Les bonnes affaires\n==ne restent pas\nlongtemps en ligne.==", size=110),
  S(title="Tu crées\n_ta recherche une fois._", ui=[QS(600)]),
  S(title="UTOPICAR\n_la suit pour toi._", ui=[SCHIP()]),
  S(title="Les nouvelles annonces,\n_comparées à la cote._", ui=[LVMINI(660)]),
  S(title="Arrive\n_avant les autres._"),
]),
car('revente-estimee', 'dark', "À combien tu la revends vraiment ? Tout le calcul part de là.", [
  S(title="À combien\ntu la revends,\n==vraiment ?==", size=130),
  S(title="Revente estimée\n_et délai._", ui=[LG(1)]),
  S(title="Avec un niveau\n_de confiance affiché._", body="Tu sais si l'estimation est solide ou fragile."),
  S(title="Tout le calcul\n_part de là._", ui=[TKLINES(640)]),
  S(title="Une revente réaliste,\n_pas rêvée._"),
]),
car('checklist', 'orange', "La checklist avant d'acheter une voiture pour la revendre. Enregistre-la.", [
  S(title="La checklist\navant d'acheter\n_(enregistre-la)_", size=120),
  S(check=["Revente estimée", "Remise en état", "Carte grise"]),
  S(check=["Trajet", "Frais fixes", "Papiers du dossier"]),
  S(check=["Prix max", "Offre de départ", "Marge minimum"]),
  S(title="Ou : colle l'annonce\n_dans UTOPICAR._"),
]),
car('calcul-de-tete', 'white', "« Je calcule de tête. » Vraiment, pour chaque annonce ?", [
  S(title="« Je calcule\n==de tête.== »", size=140),
  S(title="Carte grise :", ui=[LG(4)], body2="5 CV × 68,95 € ÷ 2 + 13,76 €…"),
  S(title="Trajet :", ui=[LG(5)], body2="128 km × 2 × 0,25 €…"),
  S(title="Pour chaque\nannonce ?", body="Tu veux vraiment refaire ça dix fois par jour ?"),
  S(title="UTOPICAR le fait\n_en 2 secondes._"),
]),
car('ma-journee', 'dark', "Ma journée d'achat-revente, version simple.", [
  S(title="Ma journée\nd'achat-revente,\n==version simple.==", size=120),
  S(title="9 h :\n_nouvelles annonces\nsous la cote._", ui=[LVMINI(620, 760)]),
  S(title="9 h 02 :\n==GO, 92/100.==", ui=[CLIO(760)]),
  S(title="18 h :\n_ma marge du mois._", ui=[KPI(3, 520)]),
  S(title="Moins de calculs,\n_plus d'affaires._"),
]),
car('marge-moyenne', 'white', "Combien tu gagnes vraiment par voiture ?", [
  S(title="[gr]1 647 €.[/gr]\n_Marge moyenne\npar voiture._", size=130),
  S(title="Ta marge moyenne,\n_calculée._", ui=[KPI(4, 520)]),
  S(title="Voiture\n_par voiture._", ui=[MCHART(560, 760)]),
  S(title="Tu sais lesquelles\n==te rapportent vraiment.==", size=100),
  S(title="Ta rentabilité,\n_sans deviner._"),
]),
car('pourquoi-38', 'orange', "Cette Golf a eu 38/100. Voilà pourquoi.", [
  S(title="Cette Golf\na eu ==38/100.==\n_Voilà pourquoi._", size=120),
  S(title="La note =\n_moyenne de deux notes._", ui=[TKTOP()]),
  S(title="Dossier : 76/100.", body="Les papiers et l'annonce sont plutôt bons."),
  S(title="Marge : 0/100.", body="Après frais, **il ne reste rien**.", ui=[TKTOT()]),
  S(title="Une note\n_que tu comprends._"),
]),
car('seuil-marge', 'white', "Quelle marge minimum tu t'autorises ? Fixe ton seuil.", [
  S(title="Quelle marge minimum\n==tu t'autorises ?==", size=110),
  S(title="Fixe ton seuil.\n_Par exemple : 800 €._"),
  S(title="Il te reste\n[rd]− 1 200 €[/rd]\n_pour un seuil de 800 €._", ui=[TKTOT()]),
  S(title="Ton plafond\n_découle de ton seuil._", ui=[PLAF()]),
  S(title="Ta marge,\n_protégée._"),
]),
car('5-infos-annonce', 'dark', "5 infos à chercher dans une annonce de voiture d'occasion.", [
  S(title="5 infos à chercher\n==dans une annonce.==", size=120),
  S(title="1. Le contrôle technique\n2. La distribution", size=90),
  S(title="3. Le nombre\nde propriétaires\n4. Le carnet d'entretien", size=90),
  S(title="5. Le kilométrage\n_par rapport à l'âge._", ui=[LU()], body2="UTOPICAR repère les infos clés **dans le texte**."),
  S(title="Ne rate plus\n_un détail._"),
]),
car('debutant', 'white', "Tu débutes en achat-revente ? 3 règles simples.", [
  S(title="Tu débutes\n==en achat-revente ?==", size=130),
  S(num=1, title="Jamais d'achat\n_sans prix max._"),
  S(num=2, title="Compte tous les frais,\n_même les petits._"),
  S(num=3, title="Ne laisse pas\n_dormir une voiture._"),
  S(title="UTOPICAR applique\n_les trois pour toi._"),
]),
car('vois-vs-gagnes', 'orange', "Ce que tu vois : 6 400 €. Ce que tu gagnes : + 1 932 €.", [
  S(title="Ce que tu vois :\n_6 400 €._\nCe que tu gagnes :\n==?==", size=120),
  S(title="Une Clio IV\n_à 6 400 €._", ui=[LIVE_PRIX()]),
  S(title="Revente, frais,\n_papiers : tout compté._", ui=[TKLINES(620)]),
  S(title="Ce que tu gagnes :\n==+ 1 932 €.==", ui=[CLIO(760)]),
  S(title="Vois plus loin\n_que le prix._"),
]),
car('en-5-ecrans', 'dark', "UTOPICAR en 5 écrans : analyser, recherche en direct, parc, tableau de bord.", [
  S(title="UTOPICAR\n==en 5 écrans.==", size=140),
  S(title="Analyser\n_une annonce._", ui=[TKTOP(), TKTOT()]),
  S(title="Recherche\n_en direct._", ui=[LVMINI(640, 760)]),
  S(title="Parc\n_et tableau de bord._", ui=[VROW(1, 760, False), KPIS(620)]),
  S(title="Tout ton achat-revente,\n_dans ta poche._"),
]),
]
assert len(C) == 30, len(C)
json.dump({'carousels': C}, open(os.path.join(HERE, 'carousels.json'), 'w'), ensure_ascii=False, indent=1)
with open(os.path.join(HERE, 'captions.md'), 'w') as f:
    f.write('# Légendes des 30 carrousels TikTok UTOPICAR\n\nÀ coller en description de chaque carrousel (5 images, 1080×1920).\n\n')
    for i, c in enumerate(C, 1):
        f.write(f"## {i:02d} · {c['slug']}\n{c['caption']}\n\n👉 Commente GARAGE pour recevoir l'accès.\n\n{HT}\n\n")
print(len(C), 'carrousels,', sum(len(c['slides']) for c in C), 'images')
