#!/usr/bin/env bash
# Rend les projets demandés (tiktok-1 … tiktok-N, youtube), puis son à -14 LUFS + planche de contrôle.
# Le nom du fichier livré vient de projet.NOMS (sinon le nom du projet).
# Usage : bash scripts/rendre.sh tiktok-1 tiktok-2 … youtube
set -u
cd "$(dirname "$0")/.."
mkdir -p livraison
for p in "$@"; do
  debut=$(date +%s)
  nom=$(cd scripts && python -c "import projet; print(getattr(projet, 'NOMS', {}).get('$p', '$p'))")
  echo "== $p : rendu"
  ( cd "$p" && npx hyperframes render -o "renders/$p.mp4" > "../work/rendu-$p.log" 2>&1 )
  code=$?
  if [ $code -ne 0 ] || [ ! -f "$p/renders/$p.mp4" ]; then
    echo "== $p : ÉCHEC du rendu (code $code), voir work/rendu-$p.log"
    tail -5 "work/rendu-$p.log"
    continue
  fi
  PYTHONUTF8=1 python scripts/finir.py "$p/renders/$p.mp4" "livraison/$nom.mp4" --planche
  echo "== $p : fini en $(( $(date +%s) - debut )) s"
done
