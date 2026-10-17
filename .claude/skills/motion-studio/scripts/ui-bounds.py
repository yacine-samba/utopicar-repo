"""Bornes du contenu d'une séquence de captures du site (techniques.md § 20).

Usage : python ui-bounds.py <dossier contenant u000.jpg…> → écrit bounds.json : [[haut, bas], …] par image
(première et dernière ligne qui ont au moins 20 pixels plus clairs que 40/255).
"""
import sys, os, glob, json
import numpy as np
from PIL import Image

d = sys.argv[1]
out = []
for f in sorted(glob.glob(os.path.join(d, 'u*.jpg'))):
    a = np.array(Image.open(f).convert('L')).astype(int)
    rows = np.where((a > 40).sum(1) > 20)[0]
    out.append([int(rows.min()), int(rows.max())] if len(rows) else [0, 0])
json.dump(out, open(os.path.join(d, 'bounds.json'), 'w'))
print(len(out), 'images')
