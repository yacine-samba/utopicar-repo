#!/bin/sh
# Storyboard master60 : une image clé par plan, 9:16 et 16:9, ouvertures A et B → renders/storyboard-master60/
# usage (depuis video/) : sh scripts/storyboard-master60.sh
set -e
OUT=renders/storyboard-master60; rm -rf $OUT; mkdir -p $OUT
TA="0,2.8,5.9,7.6,8.1,9.7,12.8,17.9,21.2,23.6,29.9,31.2,32.6,36.6,39.6,42.0,46.0,48.9,51.0,53.6,57.0"
TB="1.2,2.8"
for FMT in vertical desktop; do
  rm -rf renders/stills-master60
  CUT=master60 FMT=$FMT HOOK=A node scripts/render.mjs --at $TA > /dev/null
  for f in renders/stills-master60/*.png; do mv $f $OUT/$FMT-A-$(basename $f); done
  CUT=master60 FMT=$FMT HOOK=B node scripts/render.mjs --at $TB > /dev/null
  for f in renders/stills-master60/*.png; do mv $f $OUT/$FMT-B-$(basename $f); done
done
ls $OUT | wc -l
