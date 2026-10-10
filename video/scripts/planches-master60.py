"""Planches annotées du storyboard master60 (une image clé par plan, la phrase de Simon au-dessus).
usage (depuis video/) : python3 scripts/planches-master60.py [blanc]
  lit renders/storyboard-master60[-blanc]/ → renders/planches/storyboard-master60[-blanc]-{9x16,16x9}.jpg"""
import glob, sys, os
from PIL import Image, ImageDraw, ImageFont

TH = sys.argv[1] if len(sys.argv) > 1 else ''
SUF = '-' + TH if TH else ''
O = f'renders/storyboard-master60{SUF}/'
os.makedirs('renders/planches', exist_ok=True)
CAP = {'00.000': 'A · image 0 : « Payée deux fois ? »', '01.200': 'B · « 50 annonces. Ce matin. »', '02.800': '« …deux fois. »',
       '05.900': "« Celle-là… tu l'achètes ? »", '07.600': "« Je colle l'annonce. »", '08.100': 'Analyser → chargement',
       '09.700': '« Ah. Non. » verdict réel', '12.800': '« 1 650 € de travaux »', '17.900': '« et bam » : 3 étapes',
       '21.200': 'Mercedes « Prix max 16 500 »', '23.600': '« en vente trois fois ? »', '29.900': '« carnet, calculette, 14 onglets »',
       '31.200': '« Hop ! » tableau de bord', '32.600': '« ce matin » : Votre journée', '36.600': '« La 308 dort » → clic',
       '39.600': '« Ding ! » alerte A3', '42.000': '« ta vraie marge »', '46.000': 'Starter · 44 mois', '48.900': '« Un parc ? Pro. »',
       '51.000': '« Essaie 3 jours »', '53.600': "« avant d'appeler »", '57.000': 'carton final'}
try:
    F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
    F2 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 17)
except OSError:
    F = F2 = None
light = TH == 'blanc'
BG, FG = ((238, 233, 225), (28, 22, 18)) if light else ((24, 20, 17), (244, 241, 236))

def sheet(fmt, cw, ch, cols, out):
    a = sorted(glob.glob(O + fmt + '-A-*.png')); b = sorted(glob.glob(O + fmt + '-B-*.png'))[:1]
    fs = a[:1] + b + a[1:]                       # A image 0, puis B, puis la suite
    lab = 52; rows = (len(fs) + cols - 1) // cols
    S = Image.new('RGB', (cols * (cw + 10) + 10, rows * (ch + lab + 10) + 10), BG); d = ImageDraw.Draw(S)
    for i, f in enumerate(fs):
        t = f.split('-t')[-1][:-4]; x = 10 + (i % cols) * (cw + 10); y = 10 + (i // cols) * (ch + lab + 10)
        S.paste(Image.open(f).convert('RGB').resize((cw, ch), Image.LANCZOS), (x, y + lab))
        d.text((x + 2, y + 2), ('B ' if '-B-' in f else '') + '%.1f s' % float(t), fill=(224, 87, 26), font=F)
        d.text((x + 2, y + 26), CAP.get(t, ''), fill=FG, font=F2)
    S.save(out, quality=88); print(out, S.size)

sheet('vertical', 300, 533, 8, f'renders/planches/storyboard-master60{SUF}-9x16.jpg')
sheet('desktop', 460, 259, 5, f'renders/planches/storyboard-master60{SUF}-16x9.jpg')
