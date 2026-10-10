#!/usr/bin/env bash
# Finit un épisode de la série recette 47 dès que la prise de Simon est déposée.
#
#   1. Générer UNE fois chez ElevenLabs le « Texte ElevenLabs » du brief (voix Simon mvhJVdVoTWVUtL4keT7W, eleven_v3,
#      generations_count 1, estimation d'abord) et l'enregistrer dans audio/vo-<projet>/takeA.mp3.
#   2. bash scripts/finir-47.sh mo11          (ou mo12, mo13)
#
# Étapes : pose de la voix (vo-<projet>.py --retenue, transcription faster-whisper, repères mot à mot, durée du film),
# sous-titres, temps des gestes (events.json), mix, rendu final 1080×1920 en 4 morceaux avec flou de bougé, contrôle
# qa_video.py. Le film lit vo-timing.json : les gestes se recalent seuls sur la vraie voix. Écouter la pose avant le rendu
# et corriger FIX / SPAN dans vo-<projet>.py si un mot est mal placé (voir docs/timeline-<projet>.md, « La voix »).
set -euo pipefail
ID=${1:?usage : bash scripts/finir-47.sh mo11|mo12|mo13}
cd "$(dirname "$0")/.."
[ -f "audio/vo-$ID/takeA.mp3" ] || { echo "audio/vo-$ID/takeA.mp3 manquante : générer la voix d'abord" >&2; exit 1; }
python3 "scripts/vo-$ID.py" takeA.mp3 --retenue
python3 "scripts/srt-$ID.py"
CUT=$ID node scripts/events.mjs
python3 "scripts/audio-$ID.py"
mkdir -p renders/_parts
for i in 0 1 2 3; do CUT=$ID MB=4 PARTS=4 PART=$i node scripts/render.mjs --all > "renders/_parts/$ID-$i.log" 2>&1 & done
wait
CUT=$ID PARTS=4 node scripts/render.mjs --assemble
python3 ../.claude/skills/motion-studio/scripts/qa_video.py "renders/9x16-$ID.mp4" --out renders/qa
echo "→ renders/9x16-$ID.mp4, renders/poster-$ID.png, renders/9x16-$ID.srt, renders/qa/9x16-$ID-qa.md"
