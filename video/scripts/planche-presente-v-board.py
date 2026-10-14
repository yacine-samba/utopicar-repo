"""Assemble la planche de la présentation avec Simon : 12 images clés + légendes (temps, voix, mouvement).
usage : python3 scripts/planche-presente-v-board.py   (depuis video/) → renders/planche-presente-v.png"""
from PIL import Image, ImageDraw, ImageFont
import textwrap
D = 'renders/planche-presente-v'
F = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'; FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; FI = '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'
P = [  # (temps prévu, réplique de Simon, mouvement / technique)
    ('0,0 s', '« Cette 208 à 7 190 € ? »', 'Image 0 : objet + chiffre. Étiquette percée (son trou = le point orange porteur), caméra 3D qui pousse et tourne, fond = la même photo floutée (2.5D).'),
    ('2,4 s', '« Elle va t\'en coûter 8 840. »', 'Le prix roule 7 190 → 8 840 en rouge ; la goutte « +1 650 € travaux » naît dans l\'étiquette et se détache (liquide, pont).'),
    ('4,8 s', '« Tu colles l\'annonce… »', 'Zoom-éclair ×28 en 0,28 s à travers le trou de l\'étiquette, flou de bougé : on débouche sur l\'orange. Aucune coupe.'),
    ('5,6 s', '« …dans utopicar : »', 'Le trou s\'étire en champ (bords sur deux ressorts), l\'URL s\'écrit, clic : le bouton s\'écrase puis rebondit.'),
    ('7,2 s', '« en deux secondes, »', 'Le champ devient la vraie fiche du site (capture 3×) : la carte prend la hauteur du contenu, image par image.'),
    ('8,2 s', '« la cote, les travaux, le vrai prix… et le verdict. Passe. »', 'Un surlignage par mot (mesuré au pixel). « Passe. » sort d\'un masque, en rouge.'),
    ('11,0 s', '« Et les bonnes affaires ? Arrête de scroller. »', 'La fiche se replie en point ; le mur d\'annonces défile (flou), le point tombe en arc et l\'arrête net.'),
    ('13,4 s', '« Ta recherche tourne toute seule, plusieurs fois par jour. »', 'Onde dans la grille depuis le point (retard = distance) ; un tour d\'anneau = un passage.'),
    ('16,0 s', '« Toi, tu dors. Lui, il bosse. »', 'Humour : coupe de couleur nuit sur le temps fort, horloge qui tourne, l\'onde continue.'),
    ('18,0 s', '« Une annonce passe sous la cote ? »', 'Une case sort du mur ×2,6 avec liseré blanc, les autres s\'éteignent ; pastille « 1 450 € sous la cote ».'),
    ('19,8 s', '« Tu reçois un mail. T\'as plus qu\'à appeler. »', 'La case se déplie en vrai e-mail d\'alerte (modèle du produit) ; curseur, clic sur l\'annonce.'),
    ('22,5 s', '« utopicar. Achète juste, revends mieux. »', 'L\'e-mail se replie en point → flèche du logo (SVG officiel) ; « lien en bio ». Boucle : le point repart vers l\'image 0.'),
]
TW, TH, CH, M = 340, 604, 250, 28
W = M + 6 * (TW + M); H = 150 + 2 * (TH + CH + M) + 20
o = Image.new('RGB', (W, H), (18, 16, 15)); d = ImageDraw.Draw(o)
d.text((M, 34), 'Présentation utopicar avec Simon · planche (porte 3) · 9:16, 30 s max', font=ImageFont.truetype(FB, 34), fill=(255, 255, 255))
d.text((M, 86), 'Un seul objet porteur du début à la fin : le point orange (trou de l\'étiquette → champ → fiche → point → onde → pépite → e-mail → logo). Tracés bleus = mouvement. Rouge pointillé = zones sûres.',
       font=ImageFont.truetype(F, 19), fill=(200, 195, 190))
fb, fi, fr = ImageFont.truetype(FB, 19), ImageFont.truetype(FI, 17), ImageFont.truetype(F, 15)
for i, (tm, vo, mv) in enumerate(P):
    x = M + (i % 6) * (TW + M); y = 150 + (i // 6) * (TH + CH + M)
    im = Image.open(f'{D}/f{i + 1:02d}.png').convert('RGB'); g = ImageDraw.Draw(im)
    for seg in [((0, 220), (1080, 220)), ((0, 1480), (1080, 1480)), ((940, 0), (940, 1920)), ((60, 0), (60, 1920))]:
        (x0, y0), (x1, y1) = seg; n = 40
        for k in range(0, n, 2): g.line([(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n), (x0 + (x1 - x0) * (k + 1) / n, y0 + (y1 - y0) * (k + 1) / n)], fill=(230, 60, 60), width=4)
    o.paste(im.resize((TW, TH), Image.LANCZOS), (x, y))
    yy = y + TH + 12
    d.text((x, yy), f'{i + 1} · {tm}', font=fb, fill=(255, 122, 66)); yy += 28
    for ln in textwrap.wrap(vo, 36): d.text((x, yy), ln, font=fi, fill=(245, 240, 232)); yy += 22
    yy += 6
    for ln in textwrap.wrap(mv, 42): d.text((x, yy), ln, font=fr, fill=(170, 165, 160)); yy += 19
o.save('renders/planche-presente-v.png', optimize=True); print(o.size)
