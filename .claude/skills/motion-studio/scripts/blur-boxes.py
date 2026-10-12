"""Floute des zones (logos, plaques) d'une photo, avec recadrage optionnel :
    python blur-boxes.py photo.jpg sortie.jpg "x0,y0,x1,y1;x0,y0,x1,y1" [x0,y0,x1,y1]
Coordonnées en pixels de la photo source. Vérifier ensuite chaque flou sur un recadrage zoomé."""
import sys, json
from PIL import Image, ImageFilter, ImageDraw
# usage: blur.py src dst "x0,y0,x1,y1;..." [crop x0,y0,x1,y1]
src, dst, boxes = sys.argv[1:4]
im = Image.open(src).convert('RGB')
for b in boxes.split(';'):
    x0, y0, x1, y1 = map(int, b.split(','))
    reg = im.crop((x0, y0, x1, y1)).filter(ImageFilter.GaussianBlur(max(8, (x1 - x0) // 6)))
    m = Image.new('L', reg.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, reg.size[0] - 1, reg.size[1] - 1), radius=min(reg.size) // 3, fill=255)
    im.paste(reg, (x0, y0), m.filter(ImageFilter.GaussianBlur(3)))
if len(sys.argv) > 4: im = im.crop(tuple(map(int, sys.argv[4].split(','))))
im.save(dst, quality=93)
