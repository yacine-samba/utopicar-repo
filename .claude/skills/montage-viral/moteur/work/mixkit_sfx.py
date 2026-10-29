"""Recherche et téléchargement de bruitages Mixkit (licence Mixkit, usage commercial libre).

Usage : python work/mixkit_sfx.py chercher <mot> [<mot> …]     (id, titre, durée de chaque son trouvé)
        python work/mixkit_sfx.py prendre <dossier> <id> [<id> …]
"""
import html
import re
import sys
import urllib.request
from pathlib import Path

UA = {"User-Agent": "Mozilla/5.0"}


def fetch(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()


def chercher(mots):
    vus = set()
    for q in mots:
        page = fetch(f"https://mixkit.co/free-sound-effects/{q}/").decode("utf8", "ignore")
        # chaque son : un bloc avec son titre et l'URL de l'aperçu
        for bloc in page.split('data-controller="audio-player"')[1:]:
            m = re.search(r'sfx/(\d+)/\d+-preview\.mp3', bloc)
            t = re.search(r'class="item-grid-sfx-preview__meta-title[^"]*"[^>]*>\s*([^<]+?)\s*<', bloc) or \
                re.search(r'<h2[^>]*>\s*([^<]+?)\s*</h2>', bloc)
            d = re.search(r'(\d+:\d\d)', bloc)
            if m and m.group(1) not in vus:
                vus.add(m.group(1))
                print(f"{q:14s} {m.group(1):>6}  {d.group(1) if d else '?':>5}  {html.unescape(t.group(1)) if t else '?'}")


def prendre(dossier, ids):
    d = Path(dossier)
    d.mkdir(parents=True, exist_ok=True)
    for i in ids:
        (d / f"sfx-{i}.mp3").write_bytes(fetch(f"https://assets.mixkit.co/active_storage/sfx/{i}/{i}-preview.mp3"))
        print("ok", i)


if __name__ == "__main__":
    if sys.argv[1] == "chercher":
        chercher(sys.argv[2:])
    else:
        prendre(sys.argv[2], sys.argv[3:])
