"""Fabrique les vidéos courtes de la série (courts/serie.py) avec le langage v4 : composition, rendu, mix, contrôle.

Usage : python courts/court.py generer [<id> …]    compositions HyperFrames (sans id : toutes)
        python courts/court.py rendre [<id> …]     rendu, mix v4 posé (synchro vérifiée), contrôle qualité
Chaque projet source (montage-4k, montage-dv, montage-cg) a ses propres mots, sa voix et ses plans : une vidéo se
fabrique dans un sous-processus dont le chemin d'import commence par le dossier scripts/ de son projet ; l'habillage
v4 (v4.py, gen4.py) et le mix (mix4.py) viennent de montage-4k.
Sorties : <projet>/courts/<id>/ (projet HyperFrames), <projet>/work/<id>-* (timeline, mix, rapports),
courts/livraison/<fichier>.mp4 et son contrôle courts/qa/<fichier>-qa.md.
"""
import json
import os
import subprocess
import sys
from pathlib import Path

ICI = Path(__file__).resolve().parent
S = ICI.parent
M4 = S / "montage-4k"
sys.path.insert(0, str(ICI))
from serie import COURTS  # noqa: E402

LIVRAISON = ICI / "livraison"
QA = Path("/home/user/utopicar-repo/.claude/skills/motion-studio/scripts/qa_video.py")


def dossier(cid):
    return S / COURTS[cid]["projet"] / "courts" / cid


def lien(src, dst):
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists():
        if os.path.samefile(src, dst):
            return
        dst.unlink()
    os.link(src, dst)


def generer_un(cid):
    """(dans le sous-processus) la composition de la vidéo cid."""
    c = COURTS[cid]
    racine = S / c["projet"]
    sys.path[:0] = [str(racine / "scripts"), str(M4 / "scripts")]
    import gen4
    proj = dossier(cid)
    (proj / "compositions").mkdir(parents=True, exist_ok=True)
    for f in ("hyperframes.json", "package.json"):
        (proj / f).write_bytes((racine / f).read_bytes())
    (proj / "meta.json").write_text(json.dumps({"id": cid, "name": cid}, indent=2), encoding="utf-8")
    # plans d'illustration et détourage : ceux de montage-4k, liés dans les assets du projet (aucune copie)
    for _a, _b, n, _p in c.get("brolls", []):
        lien(M4 / "assets" / "broll" / f"{n}.mp4", racine / "assets" / "broll" / f"{n}.mp4")
    if c["accroche"].get("detour"):
        lien(M4 / c["accroche"]["detour"], racine / c["accroche"]["detour"])
    gen4.generer(cid, c, proj)


def generer(ids):
    for cid in ids:
        p = subprocess.run([sys.executable, __file__, "_un", cid], capture_output=True, text=True)
        print(p.stdout.strip() or p.stderr.strip()[-2000:])
        if p.returncode:
            sys.exit(f"{cid} : échec de la génération")


def rendre(ids):
    LIVRAISON.mkdir(exist_ok=True)
    sys.path.insert(0, str(M4 / "work"))
    import mix4
    import poser_mix
    for cid in ids:
        c = COURTS[cid]
        work = S / c["projet"] / "work"
        proj = dossier(cid)
        r = subprocess.run(["npx", "--yes", "hyperframes@0.8.210", "render", "--fps", "24", "--quality", "delivery",
                            "-o", f"renders/{cid}.mp4"], cwd=proj, capture_output=True, text=True)
        (work / f"rendu-{cid}.log").write_text(r.stdout[-20000:] + r.stderr[-20000:], encoding="utf-8")
        rendu = proj / "renders" / f"{cid}.mp4"
        if r.returncode or not rendu.exists():
            print(f"{cid} : ÉCHEC du rendu, voir {work}/rendu-{cid}.log")
            continue
        mix4.mixer(cid, work)
        sortie = LIVRAISON / f"{c['fichier']}.mp4"
        poser_mix.poser(cid, rendu, sortie, "4", work)
        subprocess.run([sys.executable, str(QA), str(sortie), "--out", str(ICI / "qa")], capture_output=True)


if __name__ == "__main__":
    action, ids = sys.argv[1], sys.argv[2:] or list(COURTS)
    if action == "_un":
        generer_un(ids[0])
    elif action == "generer":
        generer(ids)
    elif action == "rendre":
        rendre(ids)
