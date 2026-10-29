"""Nettoie le masque d'un détourage (hyperframes remove-background) : garde la personne seule.

Le modèle laisse des taches semi-transparentes hors de la personne (la poignée du plafond au-dessus de la tête, alpha
0,67-0,8, collée aux cheveux), qui passeraient devant le texte « derrière la tête ». Pour chaque image : le cœur sûr
(alpha > 0,9 : la personne est à 1, la tache n'y arrive jamais), composantes connexes, on garde la plus grande (la
personne), dilatée de 10 px pour garder les bords doux des cheveux, et l'alpha d'origine est multiplié par ce masque.
Usage : python scripts/detour_propre.py assets/plans/detour-clip-2.webm
"""
import subprocess
import sys

import numpy as np
from scipy import ndimage

src = sys.argv[1]
W, H = 1080, 1920
lit = subprocess.run(["ffmpeg", "-v", "error", "-c:v", "libvpx-vp9", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgba", "-"],
                     capture_output=True, check=True).stdout
images = np.frombuffer(lit, np.uint8).reshape(-1, H, W, 4).copy()
yy, xx = np.mgrid[-10:11, -10:11]
noyau = (xx ** 2 + yy ** 2) <= 100
retire = []
for im in images:
    a = im[..., 3]
    lab, n = ndimage.label(a > 230)
    if n == 0:
        continue
    tailles = ndimage.sum(np.ones_like(a), lab, index=range(1, n + 1))
    garde = ndimage.binary_dilation(lab == 1 + int(np.argmax(tailles)), structure=noyau)
    retire.append(float((a[~garde] > 8).mean()) if (~garde).any() else 0.0)
    im[..., 3] = (a * garde).astype(np.uint8)
tmp = src.replace(".webm", ".propre.webm")
p = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", "24",
                    "-i", "-", "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "24", "-row-mt", "1",
                    "-auto-alt-ref", "0", tmp], input=images.tobytes(), check=True)
print(f"{len(images)} images, part retirée hors personne : {100 * np.mean(retire):.2f} % des pixels non-personne")
