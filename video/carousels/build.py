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
TKTOP = lambda w=820: U('ticket', [0, 0, 340, 98], w, pad=16)
TKTOT = lambda w=820: U('ticket', [0, 442, 340, 76], w, [[155, 456, 172, 32]], pad=18)
TKLINES = lambda w=760: U('ticket', [0, 90, 340, 340], w, rad=18, pad=12)
PLAF = lambda w=820: U('plaf', [8, 8, 320, 130], w, [[18, 50, 108, 30]])
LG = lambda n, w=820: U(f'lg{n}', None, w, rad=10, pad=10)
LU = lambda w=820: U('lu', [8, 8, 332, 144], w)
TEXTE = lambda w=820: U('scan', [25, 955, 357, 207], w, rad=20, pad=12)
DOSSIER = lambda w=860: U('scan', [14, 200, 330, 112], w, rad=16)
LIVE_PRIX = lambda w=840: U('card-lv1', [115, 384, 236, 86], w, [[125, 446.75, 163, 19.5]], rad=16, pad=14)
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

import re
def _mk(t): return re.sub(r'==(.+?)==', lambda m: '\n'.join('==' + p + '==' for p in m.group(1).split('\n')), t, flags=re.S) if isinstance(t, str) else t
def car(slug, bg, caption, slides):
    for sl in slides:
        for k in ('title', 'body', 'body2'):
            if k in sl: sl[k] = _mk(sl[k])
    return dict(slug=slug, bg=bg, caption=caption, slides=slides)
S = lambda **k: k
HT = '#achatrevente #voitureoccasion #marchandvo #achatreventeauto #bonplanauto #utopicar'

CLIO_TOP = lambda w=820, hl=True: U('dcard2', [8, 8, 362, 110], w, [[162, 96, 42, 15]] if hl else [])

# Hooks réécrits selon « L'art du hook » (docs/hooks_carrousels.md) : image 1 = un seul hook en « tu », mot du sujet
# dans les premiers mots, un levier, un mot de contradiction, une boucle ouverte, un seul mot en CAPITALES ;
# image 2 = la tension (pourquoi ça rate chez lui) ; une relance vraie en image 3 ; image 5 = promesse tenue + CTA en « tu ».
C = [
car('golf-1200', 'white', "Cette Golf à 9 500 € avait l'air rentable. Sauf que 4 frais passent avant ta marge : remise en état, carte grise, trajet, frais fixes. Tu les comptes avant d'acheter ?", [
  S(kicker="Cette Golf à 9 500 € avait l'air rentable.", title="Sauf qu'elle\nt'aurait fait\n[rd]PERDRE 1 200 €.[/rd]", size=124, ui=[GOLF_TOP(760)]),
  S(title="Tu compares le prix\n_à la revente : + 300 €._", body="Tu signes. Sauf que le prix affiché **ne compte aucun frais**.", ui=[LG(1)]),
  S(title="Les 4 frais\n==qui tombent après.==", ui=[LG(3, 740), LG(4, 740), LG(5, 740), LG(6, 740)], relance="Image 4 : ce qu'il te reste vraiment sur cette Golf."),
  S(title="Il te reste :\n[rd]− 1 200 €.[/rd]", ui=[TKTOP(), TKTOT()]),
  S(title="Tes frais, comptés\n_avant d'acheter._"),
]),
car('5-frais-oublies', 'dark', "Ta marge en achat-revente auto, ce n'est pas revente moins achat. Les 5 frais qui la mangent : enregistre ce post avant ton prochain achat.", [
  S(kicker="Ta marge en achat-revente, ce n'est pas revente − achat.", title="5 frais la\n==MANGENT== avant.", size=124),
  S(title="Ils arrivent\n_après l'achat._", body="C'est pour ça qu'on les oublie. Et c'est **ta marge** qui paie."),
  S(title="1. La remise en état\n2. La carte grise", ui=[LG(3, 760), LG(4, 760)], relance="Image 4 : le 5ᵉ frais n'apparaît sur aucune facture."),
  S(title="3. Le trajet\n4. Les frais fixes\n5. Le temps en stock", body="Chaque jour en stock, ton argent est **bloqué**.", ui=[LG(5, 740), LG(6, 740)]),
  S(title="Tes 5 frais, comptés\n_sur chaque annonce._"),
]),
car('prix-max', 'white', "N'appelle jamais le vendeur d'une voiture avant d'avoir calculé ton prix max : revente, frais, marge minimum. Le calcul complet sur une vraie annonce.", [
  S(kicker="Tu repères une voiture à revendre ?", title="N'appelle JAMAIS\nle vendeur sans\n==ce chiffre==.", size=124, ui=[GOLF_TOP(700, False)]),
  S(title="Sans lui, tu négocies\n_à l'instinct._", body="Le vendeur, lui, **connaît son prix**. Et tu paies trop."),
  S(title="Ton prix max", body="**Revente estimée**\n− tous les frais\n− ta marge minimum\n= **ton prix plafond**", size=110, relance="Image 4 : le calcul sur une vraie annonce."),
  S(title="Pour cette Golf :\n==7 500 € maximum.==", ui=[PLAF()], body2="Au-dessus, il te reste moins de 800 €. Offre de départ : **7 050 €**."),
  S(title="Ton prix max,\n_calculé sur chaque annonce._"),
]),
car('go-nogo', 'orange', "Golf ou Clio : une seule te fait gagner de l'argent. Tu aurais choisi laquelle ? Réponse en commentaire avant de glisser.", [
  S(kicker="Golf ou Clio :", title="une seule\nte fait ==GAGNER==\nde l'argent.", size=124, ui=[GOLF_TOP(640, False), CLIO_TOP(640, False)]),
  S(title="Tu regardes le prix\n_et le kilométrage._", body="C'est justement le piège : ce qui compte, c'est **ce qu'il te reste après frais**."),
  S(title="La Golf :\n[rd]38/100. NO GO.[/rd]", ui=[GOLF()], relance="Image 4 : l'écart entre les deux dépasse 3 000 €."),
  S(title="La Clio :\n==92/100. GO.==", ui=[CLIO()], body2="**+ 1 932 €** de marge estimée, contre **− 1 200 €** pour la Golf."),
  S(title="Colle tes deux annonces :\n_le verdict en 2 secondes._"),
]),
car('sous-la-cote', 'white', "Une Clio à 1 450 € sous la cote publiée il y a 12 minutes. Les bonnes affaires en voiture d'occasion partent vite : voilà comment les voir avant les autres.", [
  S(kicker="Une Clio à 1 450 € sous la cote vient d'être publiée.", title="Pourtant, tu ne\nl'as ==PAS== vue.", size=124, ui=[LIVE_PRIX(780)]),
  S(title="Les bonnes affaires\n_partent vite._", body="Et toi, tu les cherches **à la main**, quand tu as le temps."),
  S(title="UTOPICAR suit ta recherche\n_et compare à la cote._", ui=[LVMINI(620)], relance="Image 4 : ce que cette Clio te laisse après frais."),
  S(title="[gr]+ 1 932 €[/gr]\n_de marge estimée._", ui=[CLIO()]),
  S(title="Les annonces sous la cote,\n_avant les autres._"),
]),
car('pov-feeling', 'dark', "La voiture brille, le vendeur est sympa, tu signes. Puis la facture du garage tombe. La question à te poser avant de signer.", [
  S(kicker="La voiture brille. Le vendeur est sympa.", title="Mais la facture\ndu ==GARAGE==\ntombe après.", size=124),
  S(title="Pneus, freins, carrosserie :\n[rd]1 100 € de remise en état.[/rd]", ui=[LG(3)]),
  S(title="Et ta marge\n[rd]disparaît.[/rd]", ui=[TKTOT()], relance="Image 4 : la question à te poser avant de signer."),
  S(title="Avant de signer :\n==combien il te reste\naprès frais ?==", size=100),
  S(title="Signe avec un chiffre,\n_pas au feeling._"),
]),
car('parc-clair', 'white', "Le problème de ton parc auto, ce n'est pas les voitures qui se vendent : c'est celles qui dorment. Repère-les en un coup d'œil.", [
  S(kicker="Le problème de ton parc auto :", title="les voitures\nqui ==DORMENT==.", size=124, ui=[VROW(1, 700)]),
  S(title="Une voiture qui dort\n_bloque ton argent._", body="Chaque jour, **ta trésorerie** reste immobilisée dedans."),
  S(title="Chaque voiture\n_a son statut._", ui=[FILTERS()], relance="Image 4 : celles qui dorment sautent aux yeux."),
  S(title="Les jours en stock,\n==voiture par voiture.==", ui=[VROW(1), VROW(2)]),
  S(title="Tu vois ton parc\n_d'un coup d'œil._"),
]),
car('tableau-de-bord', 'dark', "Tu passes ton dimanche sur un tableur alors que ta marge peut se calculer toute seule. Stock, capital, marge, rotation : le tableau de bord UTOPICAR.", [
  S(kicker="Tu passes ton dimanche sur un tableur ?", title="Alors que\nta marge se calcule\n==TOUTE== seule.", size=124, ui=[KPI(3, 480)]),
  S(title="Un tableur\n_oublie ce que tu oublies._", body="Un frais pas saisi, et **ta marge du mois est fausse**."),
  S(title="Stock, capital,\n_marge, rotation._", ui=[KPIS(740)], relance="Image 4 : tes voitures les plus rentables, classées."),
  S(title="Tes meilleures affaires,\n_classées pour toi._", ui=[BEST()]),
  S(title="Tes chiffres à jour,\n_sans tableur._"),
]),
car('3-questions', 'white', "Avant d'acheter une voiture pour la revendre, 3 questions. La 3ᵉ, peu de gens se la posent. Enregistre pour ton prochain achat.", [
  S(kicker="Avant d'acheter une voiture pour la revendre : 3 questions.", title="La 3ᵉ, peu de gens\nse la ==POSENT==.", size=124),
  S(num=1, title="À combien tu la\nrevends vraiment ?", body="Pas au doigt mouillé : avec une **revente estimée**.", ui=[LG(1)]),
  S(num=2, title="Combien elle te coûte\navant la revente ?", body="Remise en état, carte grise, trajet, frais fixes.", ui=[LG(3, 740)], relance="Image 4 : la question que peu de gens se posent."),
  S(num=3, title="Combien de temps\nelle va dormir chez toi ?", body="Une voiture qui dort, c'est **ton argent qui dort**.", ui=[KPI(5, 440)]),
  S(title="Les 3 réponses\n_en 2 secondes._"),
]),
car('avant-apres', 'orange', "Tu analyses une annonce de voiture avec 10 onglets ouverts, alors qu'il suffit de la coller. Avant / après.", [
  S(kicker="Tu analyses une annonce avec 10 onglets ouverts ?", title="Alors qu'il suffit\nde la ==COLLER==.", size=124),
  S(title="Chaque onglet,\n_c'est un frais\nque tu peux oublier._", body="Cote, carte grise, trajet, réparations… **à la main**."),
  S(title="Après :\n_tu colles l'annonce._", ui=[TEXTE(), LAUNCH(680)], relance="Image 4 : le verdict, en 2 secondes."),
  S(title="Et tu as\n==le verdict.==", ui=[GOLF(620), CLIO(620)]),
  S(title="Une annonce, un collage,\n_un verdict._"),
]),
car('marge-au-pif', 'white', "Le problème de ta marge en achat-revente : tu la calcules avant les frais. La vraie marge, ligne par ligne.", [
  S(kicker="Le problème de ta marge en achat-revente :", title="tu la calcules\n==AVANT== les frais.", size=124),
  S(title="« Ça devrait passer. »", body="Revente moins achat… et **le reste, on verra**."),
  S(title="La vraie marge", body="**Revente** − **achat** − **tous les frais**.\nPas un de moins.", relance="Image 4 : le détail ligne par ligne sur une vraie annonce."),
  S(title="Ligne par ligne.", ui=[TKLINES(680)]),
  S(title="Ta vraie marge,\n_avant d'acheter._"),
]),
car('piege-bonne-affaire', 'dark', "Tu crois qu'une voiture pas chère est une bonne affaire. Sauf qu'un prix bas peut cacher 1 100 € de réparations.", [
  S(kicker="Tu crois qu'une voiture pas chère est une bonne affaire ?", title="Un prix bas peut\n==CACHER== 1 100 €\nde réparations.", size=124),
  S(title="Cette Golf à 9 500 €\n_se revend 9 800 €._", ui=[GOLF_TOP()], body2="Sur le papier : **+ 300 €**."),
  S(title="Mais elle demande\n[rd]1 100 € de remise en état.[/rd]", ui=[LG(3)], relance="Image 4 : à quoi reconnaître une vraie bonne affaire."),
  S(title="Une bonne affaire,\n==c'est une marge\naprès frais.==", ui=[CLIO(740)]),
  S(title="Tu reconnais une bonne affaire\n_en 2 secondes._"),
]),
car('negocie-chiffre', 'white', "Ta première offre sur une voiture, tu la fais au hasard ? Le vendeur, lui, a déjà son chiffre. Ton offre et ton plafond, calculés.", [
  S(kicker="Tu achètes une voiture : le vendeur, lui, a déjà son chiffre.", title="Ta première offre,\ntu la fais\nau ==HASARD== ?", size=124),
  S(title="Trop haute : ta marge part.\n_Trop basse : il raccroche._", body="Sans chiffre, tu négocies **à l'affect**."),
  S(title="Il annonce\n_9 500 €._", ui=[GOLF_TOP(820, False)], relance="Image 4 : ton offre et ton plafond, calculés."),
  S(title="Ton offre : ==7 050 €==\n_Ton plafond : 7 500 €_", ui=[PLAF()]),
  S(title="Tu négocies avec un chiffre,\n_pas au hasard._"),
]),
car('lu-sans-ia', 'orange', "Tu relis chaque annonce de voiture 3 fois pour trouver le CT et la distribution ? Les infos qui comptent tiennent en 4 lignes.", [
  S(kicker="Tu relis chaque annonce de voiture 3 fois ?", title="Ce qui compte tient\nen ==4 LIGNES==.", size=124),
  S(title="Et une info ratée\n_peut te coûter une réparation._", body="Une distribution pas faite, et **ta marge** y passe."),
  S(title="Tu colles le texte,\n_tel quel._", ui=[TEXTE()], relance="Image 4 : les 4 lignes qui comptent."),
  S(title="CT, distribution,\n==propriétaires : repérés.==", ui=[LU()]),
  S(title="Tu lis moins,\n_tu décides mieux._"),
]),
car('4-papiers', 'white', "N'achète jamais une voiture pour la revendre sans demander ces 4 papiers : HistoVec, PV de contrôle technique, carnet d'entretien, carte grise.", [
  S(kicker="Tu achètes une voiture pour la revendre ?", title="JAMAIS sans\n==ces 4 papiers==.", size=124),
  S(title="Sans eux,\n_c'est ta revente qui bloque._", body="L'acheteur suivant les demandera. **À toi.**"),
  S(num='1–2', title="HistoVec\n_et le PV de contrôle technique._", size=90, relance="Image 4 : les 2 derniers, et ce qui manque à ton dossier."),
  S(num='3–4', title="Le carnet d'entretien\n_et la carte grise._", size=90, ui=[DOSSIER(820)], body2="UTOPICAR te dit **ce qui manque**."),
  S(title="Ton dossier complet\n_avant de revendre._"),
]),
car('jours-en-stock', 'dark', "Ta voiture est garée, elle ne roule pas. Pourtant, elle te coûte de l'argent chaque jour. Tes jours en stock, voiture par voiture.", [
  S(kicker="Ta voiture est garée, elle ne roule pas.", title="Pourtant, elle te\n==COÛTE==\nchaque jour.", size=124),
  S(title="Ton argent est bloqué dedans.\n_Et sa cote baisse._", body="Plus elle dort, **moins il te reste**."),
  S(title="Tes jours en stock,\n_calculés._", ui=[KPI(5, 500)], relance="Image 4 : le compteur de jours, voiture par voiture."),
  S(title="Voiture par voiture,\n_le compteur tourne._", ui=[VROW(1), VROW(3)]),
  S(title="Tu vends plus vite,\n_tu immobilises moins._"),
]),
car('papiers-vente', 'white', "Imagine : ton acheteur arrive demain et ton contrôle technique a plus de 6 mois. Les papiers pour vendre une voiture d'occasion, et l'alerte qui te prévient.", [
  S(kicker="Imagine : ton acheteur arrive demain.", title="Ton contrôle\ntechnique a plus\nde ==6 MOIS==.", size=124),
  S(title="Pas de CT récent,\n_pas de vente._", body="Pour vendre, le contrôle technique doit avoir **moins de 6 mois**."),
  S(title="CT de moins de 6 mois,\nnon-gage de moins de 15 jours,\ncarte grise.", size=80, relance="Image 4 : l'alerte qui te prévient avant."),
  S(title="UTOPICAR te prévient,\n_voiture par voiture._", ui=[ALERTS()]),
  S(title="Plus de vente\n_bloquée par un papier._"),
]),
car('pipeline', 'orange', "Où en est chaque voiture de ton parc ? Si la réponse est dans ta tête, tu finiras par en oublier une. Repéré, en préparation, en vente, vendu.", [
  S(kicker="Où en est chaque voiture de ton parc ? Si la réponse est dans ta tête :", title="tu finiras par\nen ==OUBLIER== une.", size=124),
  S(title="Une voiture oubliée\nen préparation,\n_c'est une vente en retard._", size=96),
  S(title="Repéré, en préparation,\n_en vente, vendu._", ui=[PIPE()], relance="Image 4 : ton parc filtré en un geste."),
  S(title="Filtre\n_par statut._", ui=[FILTERS()]),
  S(title="Tu sais où en est\n_chaque voiture._"),
]),
car('recherche-suivie', 'white', "Une voiture sous la cote est publiée à 7 h. Le premier qui appelle la récupère. Crée ta recherche une fois, UTOPICAR la suit pour toi.", [
  S(kicker="Une voiture sous la cote est publiée à 7 h.", title="Le premier\nqui appelle\nla ==RÉCUPÈRE==.", size=124, ui=[SCHIP(560)]),
  S(title="Toi, tu cherches\n_à la main, le soir._", body="Quand tu la trouves, **elle est déjà partie**."),
  S(title="Tu crées ta recherche\n_une seule fois._", ui=[QS(470)], relance="Image 4 : chaque nouvelle annonce, comparée à la cote."),
  S(title="Les nouvelles annonces,\n==comparées à la cote.==", ui=[LVMINI(640)]),
  S(title="Tu arrives\n_avant les autres._"),
]),
car('revente-estimee', 'dark', "Toute ta marge en achat-revente dépend d'un seul chiffre, et ce n'est pas le prix d'achat. C'est ton prix de revente réel.", [
  S(kicker="Toute ta marge en achat-revente dépend d'un seul chiffre.", title="Et ce n'est ==PAS==\nle prix d'achat.", size=124),
  S(title="C'est ton prix de revente.\n_Et tu le vois souvent trop haut._", body="Une revente rêvée, c'est **une marge rêvée**."),
  S(title="Revente estimée\n_et délai._", ui=[LG(1)], relance="Image 4 : comment savoir si l'estimation est fiable."),
  S(title="Un niveau de confiance\n==affiché.==", body="Tu sais si l'estimation est **solide ou fragile**.", ui=[TKLINES(620)]),
  S(title="Une revente réaliste,\n_pas rêvée._"),
]),
car('checklist', 'orange', "9 points à cocher avant d'acheter une voiture pour la revendre. Le dernier, beaucoup l'oublient. Enregistre la checklist.", [
  S(kicker="9 points à cocher avant d'acheter une voiture à revendre.", title="Le dernier,\nbeaucoup\nl'==OUBLIENT==.", size=124),
  S(check=["Revente estimée", "Remise en état", "Carte grise"], body="Un seul point oublié, et **ta marge y passe**."),
  S(check=["Trajet", "Frais fixes", "Papiers du dossier"], relance="Image 4 : le point que beaucoup oublient."),
  S(check=["Prix max", "Offre de départ", "==Marge minimum=="]),
  S(title="Les 9 points,\n_vérifiés en 2 secondes._"),
]),
car('calcul-de-tete', 'white', "Tu calcules tes frais de tête ? Calcule la carte grise d'une 5 CV de plus de 10 ans en 10 secondes. Réponse image 2.", [
  S(kicker="Tu calcules tes frais de tête ? Carte grise d'une 5 CV de plus de 10 ans :", title="tu as\n==10 SECONDES==.", size=124),
  S(title="Réponse :\n==186 €.==", ui=[LG(4)], body2="5 CV × 68,95 € ÷ 2 + 13,76 €. Et le tarif **change selon ta région**."),
  S(title="Trajet :\n_128 km aller-retour._", ui=[LG(5)], body2="128 km × 2 × 0,25 € = **64 €**.", relance="Image 4 : combien de fois tu refais ça par jour."),
  S(title="Pour chaque\nannonce ?", body="Tu veux vraiment refaire ça **dix fois par jour** ?"),
  S(title="Tous tes frais calculés,\n_en 2 secondes._"),
]),
car('ma-journee', 'dark', "9 h : une Clio sort 1 450 € sous la cote. 9 h 02 : tu sais déjà si elle est rentable. Ta journée d'achat-revente, version simple.", [
  S(kicker="9 h : une Clio sort 1 450 € sous la cote.", title="9 h 02 :\ntu sais si elle\nest ==RENTABLE==.", size=124, ui=[LIVE_PRIX(760)]),
  S(title="Sans outil, à 9 h 02,\n_tu es encore sur ta calculette._", size=96),
  S(title="9 h 02 :\n==GO, 92/100.==", ui=[CLIO(740)], relance="Image 4 : ta fin de journée, en un écran."),
  S(title="18 h :\n_ta marge du mois._", ui=[KPI(3, 500)]),
  S(title="Moins de calculs,\n_plus d'affaires._"),
]),
car('marge-moyenne', 'white', "Tu connais le prix de vente de chaque voiture, mais ta marge par voiture, tu la devines ? Marge moyenne et marge nette, voiture par voiture.", [
  S(kicker="Tu connais le prix de vente de chaque voiture.", title="Mais ta marge,\ntu la ==DEVINES==.", size=124),
  S(title="Et certaines voitures\n_te coûtent plus\nqu'elles ne rapportent._", size=96),
  S(title="Ta marge moyenne,\n_calculée._", ui=[KPI(4, 500)], relance="Image 4 : laquelle te rapporte le plus."),
  S(title="Voiture\n_par voiture._", ui=[MCHART(540, 740)]),
  S(title="Tu sais ce que chaque voiture\n_te rapporte vraiment._"),
]),
car('pourquoi-38', 'orange', "Cette Golf a un bon dossier. Pourtant, elle est NO GO : 38/100. Voilà comment se calcule la note.", [
  S(kicker="Cette Golf a un bon dossier.", title="Pourtant, elle est\n[rd]NO GO : 38/100.[/rd]", size=124, ui=[GOLF_TOP(700, False)]),
  S(title="La note =\n_moyenne de deux notes._", ui=[TKTOP()]),
  S(title="Dossier : 76/100.", body="Les papiers et l'annonce sont **plutôt bons**.", relance="Image 4 : la note qui fait tout chuter."),
  S(title="Marge : 0/100.", body="Après frais, **il ne reste rien**.", ui=[TKTOT()]),
  S(title="Une note que tu comprends,\n_sur chaque annonce._"),
]),
car('seuil-marge', 'white', "Acheter une voiture pour 200 € de marge, c'est souvent travailler gratuitement. Fixe ta marge minimum : ton prix plafond en découle.", [
  S(kicker="Acheter une voiture pour 200 € de marge :", title="c'est souvent\ntravailler\n==GRATUITEMENT==.", size=124),
  S(title="Ton temps, ton risque,\n_ta trésorerie :_\n_ils ont un prix._", size=100),
  S(title="Fixe ton seuil.\n_Par exemple : 800 €._", relance="Image 4 : ce que ton seuil change sur une vraie annonce."),
  S(title="Il te reste\n[rd]− 1 200 €[/rd]\n_pour un seuil de 800 €._", ui=[TKTOT()], body2="Ton prix plafond en découle : **7 500 €**."),
  S(title="Ta marge minimum,\n_protégée à chaque achat._"),
]),
car('5-infos-annonce', 'dark', "5 infos à trouver dans une annonce de voiture d'occasion. La 5ᵉ n'est écrite nulle part : tu dois la calculer.", [
  S(kicker="5 infos à trouver dans une annonce de voiture.", title="La 5ᵉ, tu dois\nla ==CALCULER==.", size=124),
  S(title="1. Le contrôle technique\n2. La distribution", body="Sans elles, tu appelles pour rien.", size=90),
  S(title="3. Le nombre\nde propriétaires\n4. Le carnet d'entretien", size=90, relance="Image 4 : la 5ᵉ, celle qu'il faut calculer."),
  S(title="5. Le kilométrage\n_par rapport à l'âge._", ui=[LU()], body2="UTOPICAR repère les infos clés **dans le texte**."),
  S(title="Les infos clés,\n_trouvées pour toi._"),
]),
car('debutant', 'white', "Tu débutes en achat-revente auto ? 3 règles pour éviter ta première voiture à perte. Enregistre-les.", [
  S(kicker="Tu débutes en achat-revente auto ?", title="3 règles pour éviter\nta 1ʳᵉ voiture\nà ==PERTE==.", size=124),
  S(num=1, title="Jamais d'achat\n_sans prix max._", ui=[PLAF(700)], body="La perte vient souvent **des frais**, pas du prix."),
  S(num=2, title="Compte tous les frais,\n_même les petits._", ui=[LG(6, 740)], relance="Image 4 : la règle qui protège ta trésorerie."),
  S(num=3, title="Ne laisse pas\n_dormir une voiture._", ui=[VROW(1, 760)]),
  S(title="Les 3 règles,\n_appliquées pour toi._"),
]),
car('vois-vs-gagnes', 'orange', "Cette Clio est affichée 6 400 €. Ce qu'elle te fait gagner, l'annonce ne le dit pas. + 1 932 € après frais.", [
  S(kicker="Cette Clio est affichée 6 400 €.", title="Ce qu'elle te fait\n==GAGNER==,\nl'annonce le tait.", size=124, ui=[CLIO_TOP(720)]),
  S(title="Le prix est écrit.\n_La marge, jamais._", size=110),
  S(title="Revente, frais, papiers :\n_tout compté._", ui=[TKLINES(600)], relance="Image 4 : le chiffre que l'annonce ne montre pas."),
  S(title="Ce qu'elle te fait gagner :\n==+ 1 932 €.==", ui=[CLIO(740)]),
  S(title="Tu vois la marge,\n_pas seulement le prix._"),
]),
car('en-5-ecrans', 'dark', "Tableur, calculette, onglets d'annonces : tu jongles entre 3 outils pour une seule voiture ? Analyse, recherche, parc et marge au même endroit.", [
  S(kicker="Tableur, calculette, onglets d'annonces :", title="3 ==OUTILS==\npour une seule\nvoiture ?", size=124),
  S(title="Et entre les trois,\n_un frais finit par tomber._", size=100),
  S(title="Analyser\n_une annonce._", ui=[TKTOP(), TKTOT()], relance="Image 4 : la recherche et le parc, au même endroit."),
  S(title="Recherche\n_et parc._", ui=[LVMINI(560, 700)]),
  S(title="Tout ton achat-revente,\n_dans ta poche._"),
]),
]
assert len(C) == 30, len(C)
json.dump({'carousels': C}, open(os.path.join(HERE, 'carousels.json'), 'w'), ensure_ascii=False, indent=1)
# légendes : le hook en première ligne (mots-clés cherchés sur TikTok), le CTA en « tu », 3 jeux de hashtags en rotation
HTS = ['#achatrevente #voitureoccasion #marchandvo #achatreventeauto #utopicar',
       '#voitureoccasion #bonplanauto #négoceauto #revendreunevoiture #utopicar',
       '#achatreventeauto #margeauto #voituredoccasion #garagiste #utopicar']
with open(os.path.join(HERE, 'captions.md'), 'w') as f:
    f.write('# Légendes des 30 carrousels TikTok UTOPICAR\n\nÀ coller en description de chaque carrousel (5 images, 1080×1920). '
            'Hooks et méthode : docs/hooks_carrousels.md.\n\n')
    for i, c in enumerate(C, 1):
        f.write(f"## {i:02d} · {c['slug']}\n{c['caption']}\n\n👉 Commente GARAGE et reçois ton accès.\n\n{HTS[i % 3]}\n\n")
print(len(C), 'carrousels,', sum(len(c['slides']) for c in C), 'images')
