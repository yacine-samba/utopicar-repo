"""Planches annotées de la maquette master60 : écran, réplique de Simon, mouvement prévu.
usage (depuis video/) : python3 scripts/planche-maquette-master60.py → renders/planches/maquette-master60-{1,2}.jpg"""
import glob, textwrap, os
from PIL import Image, ImageDraw, ImageFont

N = [
 ("0,0 s · A", "« Ta première voiture à revendre ? »", "Image 0 lisible. Les mots tombent un par un sur les temps (sortent d'un masque, flou de vitesse) ; la carte arrive de biais, le curseur survole le prix."),
 ("2,6 s · A", "« …deux fois. »", "Coupe nette sur « deux » : l'écran vire à l'orange. Le prix se dédouble ; le second tampon tombe sur « fois »."),
 ("0,0 s · B", "« T'es marchand ? Cinquante annonces ce matin… »", "Mur de vraies annonces couché, qui avance d'une rangée par temps ; le « 50 » compte de 0 à 50."),
 ("4,2 s", "« Celle-là… hmm… tu l'achètes ? »", "Retour au blanc par un volet. Le mot passe derrière la carte (profondeur) ; le surligneur file sous le prix."),
 ("7,4 s", "« Je colle l'annonce. »", "Noir. Le curseur glisse le lien dans un champ géant, le lien s'écrit lettre à lettre, clic : le bouton se serre en chargement."),
 ("8,5 s", "« Ah. »", "La musique coupe. Tout se fige, le chargement s'arrête, lente poussée de caméra."),
 ("9,6 s", "« Non. »", "Coupe au rouge sur le temps : « Non. » claque, plus grand que l'écran, secousse. La vraie fiche tombe de biais : 4/10, Déconseillée."),
 ("11,2 s", "« Mille six cent cinquante euros de travaux… »", "Compteur à rouleaux : chaque chiffre tourne et se pose. La ligne des travaux s'entoure sur la vraie fiche."),
 ("14,2 s", "« Bizarre. »", "Le mot penche comme un sourcil levé, la fiche penche de l'autre côté."),
 ("14,9 s", "« UTOPICAR »", "Un cercle orange s'ouvre depuis le curseur et avale l'écran ; le logo s'assemble."),
 ("17,0 s", "« …et bam, ce qu'il te reste, frais déduits. »", "« Bam. » claque ; les 3 étapes se cochent une par temps, la ligne se trace de l'une à l'autre."),
 ("19,2 s", "« Cette Mercedes ? Prix max : seize mille cinq. »", "Noir. 19 990 € se barre, le compteur descend jusqu'à 16 500 € ; le vrai bilan se retourne sous la photo."),
 ("21,9 s", "« Attends… en vente trois fois ? Ah ouais ! »", "« ×3 » pousse ; une étiquette de prix tombe par temps, celle du milieu se soulève au survol."),
 ("24,6 s", "« Quinze voitures en stock ? » (chapitre 02)", "Le motif « APRÈS L'ACHAT » défile en sens contraires ; le pavé orange se pose en biais."),
 ("26,2 s", "« Pfff… »", "Les 15 voitures arrivent en rafale (double-croches) puis s'affaissent sur « Pfff »."),
 ("28,0 s", "« Carnet, calculette, quatorze onglets… »", "Un mot et un objet par temps, les onglets en rafale ; le bureau tremble de plus en plus."),
 ("30,5 s", "« Hop ! »", "Tout est aspiré au centre (flou radial), flash orange, « Hop ! » éclate."),
 ("31,7 s", "« Tu ouvres ton tableau de bord… »", "Le vrai tableau de bord monte du fond, grand plan incliné ; la caméra glisse jusqu'à « Votre journée »."),
 ("34,3 s", "« La 308 dort depuis 63 jours ? Baisse le prix. »", "« 63 » compte jusqu'à 63 ; le curseur clique « Ajuster le prix » (onde)."),
 ("39,1 s", "« Une A3 sous la cote ? Ding ! »", "Noir, « Ding ! ». La notification tombe et sonne (ondes), le curseur clique dessus."),
 ("41,2 s", "« Et ta vraie marge, voiture par voiture. »", "La ligne de lecture descend voiture par voiture ; 4 860 € roule ; bulle sur la Mégane."),
 ("42,8 s", "« Tu débutes ? Starter. »", "Orange. Clic sur « Je débute », la carte Starter se retourne."),
 ("44,9 s", "« …une seule voiture bien achetée, tu paies trois ans. »", "L'équation s'écrit ; la jauge monte d'un quart par temps jusqu'à 44 mois."),
 ("47,9 s", "« Tu gères un parc ? Pro. »", "Noir. L'interrupteur glisse sur « J'ai un parc », Pro passe devant Starter."),
 ("49,1 s", "« Essaie trois jours, sans carte bancaire. »", "Clic sur le vrai bouton du site (onde), les coches tombent une par temps."),
 ("51,9 s", "« Tu chiffres ta prochaine marge avant d'appeler. »", "Noir, la phrase s'écrit mot par mot sur les temps."),
 ("54,6 s", "« UTOPICAR. »", "Orange : logo, bouton « 3 jours offerts » cliqué, qui bat au tempo jusqu'à la fin."),
]
fs = sorted(glob.glob('renders/maquette-master60/f*.png'))
F = lambda s, b=False: ImageFont.truetype(f'/usr/share/fonts/truetype/dejavu/DejaVuSans{"-Bold" if b else ""}.ttf', s)
os.makedirs('renders/planches', exist_ok=True)
cw, ch, cols, txt = 620, 349, 3, 150
for part, (a, b) in enumerate([(0, 15), (15, 27)]):
    sub = list(range(a, b)); rows = (len(sub) + cols - 1) // cols
    S = Image.new('RGB', (cols * (cw + 24) + 24, rows * (ch + txt + 24) + 24), (244, 240, 233)); d = ImageDraw.Draw(S)
    for k, i in enumerate(sub):
        x = 24 + (k % cols) * (cw + 24); y = 24 + (k // cols) * (ch + txt + 24)
        S.paste(Image.open(fs[i]).convert('RGB').resize((cw, ch), Image.LANCZOS), (x, y))
        t, v, m = N[i]
        d.text((x, y + ch + 10), f'{i + 1:02d} · {t}', fill=(224, 87, 26), font=F(20, True))
        d.text((x, y + ch + 36), v, fill=(28, 22, 18), font=F(19, True))
        for j, ln in enumerate(textwrap.wrap(m, 62)[:4]): d.text((x, y + ch + 64 + j * 22), ln, fill=(80, 70, 62), font=F(17))
    out = f'renders/planches/maquette-master60-{part + 1}.jpg'; S.save(out, quality=88); print(out, S.size)
