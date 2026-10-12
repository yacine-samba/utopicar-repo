#!/bin/bash
# Fabrication des 14 vidéos des semaines du 12 et du 19 oct. : repères, mixage, rendu (flou de bougé), contrôle.
cd "$(dirname "$0")/.." || exit 1
export PYTHONUTF8=1
python scripts/build-c7.py > /dev/null
for id in ${1:-S1V1 S1V2 S1V3 S1V4 S1V5 S1V6 S1V7 S2V1 S2V2 S2V3 S2V4 S2V5 S2V6 S2V7}; do
  node scripts/cues-c7.mjs $id > /dev/null && ID=$id python scripts/audio-c7.py > /dev/null 2>&1 || { echo "$id AUDIO FAIL"; continue; }
  CUT=c7 HOOK=$id MB=8 node scripts/render.mjs --all 2>&1 | grep -E "→|ERR" | tail -1
  python ../.claude/skills/motion-studio/scripts/qa_video.py renders/9x16-c7-$id.mp4 --out renders/qa 2>&1 | grep -E "^\| (WARN|FAIL)|Loudness|True peak" | cut -c1-200 | sed "s/^/$id /"
done
echo FIN
