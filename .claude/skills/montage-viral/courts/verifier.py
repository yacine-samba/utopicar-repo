"""hyperframes check sur chaque projet (parties 1-2 de « 4 000 € », vidéos courtes) : erreurs et avertissements utiles."""
import json, subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from serie import COURTS
from court import dossier, S
cibles = [("p1", S / "montage-4k" / "tiktok-1"), ("p2", S / "montage-4k" / "tiktok-2")] + \
         [(cid, dossier(cid)) for cid in COURTS]
if sys.argv[1:]:
    cibles = [c for c in cibles if c[0] in sys.argv[1:]]
for nom, d in cibles:
    r = subprocess.run(["npx", "hyperframes", "check", str(d), "--json"], capture_output=True, text=True)
    try:
        j = json.loads(r.stdout)
    except Exception:
        print(nom, "check illisible", r.stderr[-300:]); continue
    lignes = []
    for sec in ("lint", "runtime", "layout", "contrast", "craft", "audio"):
        for f in j[sec]["findings"]:
            if f["code"] in ("timeline_track_too_dense",):
                continue
            lignes.append(f"   {sec} {f['severity']} {f['code']} t={f.get('time')} {f.get('selector')} "
                          f"« {(f.get('text') or '')[:28]} » {f.get('ratio', '')}")
    print(f"{nom}: {sum(j[s]['errorCount'] for s in ('lint','runtime','layout','contrast','craft','audio'))} erreur(s)")
    print("\n".join(lignes))
