"""Crée un projet de montage à partir d'une source : le moteur (scripts/, work/), les polices, les bruitages, les
fichiers HyperFrames, et un projet.py prérempli (source, durée, zone = toute l'image).

Usage : python init_projet.py <dossier du projet> <source.mp4> [--nom slug] [--force]
Exemple : python init_projet.py "C:/Users/ysamb/Desktop/Client/montage" "C:/Users/ysamb/Desktop/Client/interview.mp4"
"""
import argparse
import json
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # console Windows
SKILL = Path(__file__).resolve().parents[1]
HF_VERSION = "0.8.210"


def sonde(src):
    """Durée, taille et cadence de la source (ffprobe)."""
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=width,height,avg_frame_rate:format=duration", "-of", "json", str(src)],
                       capture_output=True, text=True, check=True)
    d = json.loads(r.stdout)
    st = d["streams"][0]
    num, den = (int(x) for x in st["avg_frame_rate"].split("/"))
    return float(d["format"]["duration"]), int(st["width"]), int(st["height"]), num / max(1, den)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dossier")
    ap.add_argument("source")
    ap.add_argument("--nom", default=None)
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    dest, src = Path(a.dossier), Path(a.source).resolve()
    if not src.exists():
        raise SystemExit(f"source introuvable : {src}")
    if (dest / "scripts" / "projet.py").exists() and not a.force:
        raise SystemExit(f"{dest} contient déjà un projet (scripts/projet.py) ; --force pour réinstaller le moteur "
                         f"sans toucher à projet.py ni aux découpages")
    nom = a.nom or dest.resolve().parent.name.lower().replace(" ", "-")
    duree, w, h, fps = sonde(src)

    # moteur : les scripts propres au projet (projet.py, découpages) ne sont jamais écrasés
    for sous in ("scripts", "work"):
        (dest / sous).mkdir(parents=True, exist_ok=True)
        for f in (SKILL / "moteur" / sous).iterdir():
            cible = dest / sous / f.name
            if f.name in ("projet.py", "decoupage.py", "decoupage_yt.py") and cible.exists():
                continue
            shutil.copy2(f, cible)
    for sous in ("assets/fonts", "assets/audio/sfx", "assets/audio/musique", "assets/plans", "assets/fonds",
                 "livraison/telephone", "work/suivi"):
        (dest / sous).mkdir(parents=True, exist_ok=True)
    for f in (SKILL / "assets" / "fonts").iterdir():
        shutil.copy2(f, dest / "assets" / "fonts" / f.name)
    for f in (SKILL / "assets" / "sfx").iterdir():
        shutil.copy2(f, dest / "assets" / "audio" / "sfx" / f.name)

    # fichiers HyperFrames
    pkg = {"name": nom, "private": True, "type": "module",
           "scripts": {k: f"npx --yes hyperframes@{HF_VERSION} {k if k != 'dev' else 'preview'}"
                       for k in ("dev", "check", "render")}}
    (dest / "package.json").write_text(json.dumps(pkg, indent=2), encoding="utf-8")
    (dest / "hyperframes.json").write_text(json.dumps({
        "$schema": "https://hyperframes.heygen.com/schema/hyperframes.json",
        "paths": {"blocks": "compositions", "components": "compositions/components", "assets": "assets"},
        "media": {"autoProxy": True}, "authoringSkill": "hyperframes"}, indent=2), encoding="utf-8")
    (dest / "meta.json").write_text(json.dumps({"id": nom, "name": nom,
                                                "createdAt": datetime.now(timezone.utc).isoformat()}, indent=2),
                                    encoding="utf-8")

    # projet.py prérempli (si neuf)
    p = dest / "scripts" / "projet.py"
    t = p.read_text(encoding="utf-8")
    if 'SRC = r"C:\\chemin\\vers\\source.mp4"' in t:
        t = t.replace('SRC = r"C:\\chemin\\vers\\source.mp4"', f'SRC = r"{src}"')
        t = t.replace("DUREE = 60.0 ", f"DUREE = {int(duree * 10 + 1) / 10:.1f} ")
        t = t.replace("ZONE = (0, 0, 1920, 1080)", f"ZONE = (0, 0, {w - w % 2}, {h - h % 2})")
        t = t.replace('NOMS = {"tiktok-1": "tiktok-1-sujet", "youtube": "youtube-titre"}',
                      f'NOMS = {{"tiktok-1": "tiktok-1-sujet", "youtube": "youtube-{nom}"}}')
        p.write_text(t, encoding="utf-8")
    print(f"projet prêt : {dest}")
    print(f"source : {w}×{h}, {fps:.2f} i/s, {duree:.1f} s")
    print("suite : references/preparation.md (voix, zone, transcription, scènes, suivi, plans)")


if __name__ == "__main__":
    main()
