# Contrôler et livrer

## Avant le rendu

- `npx hyperframes check --json` dans chaque dossier (`tiktok-N/`, `youtube/`) : 0 erreur. Avertissements connus et
  acceptés : pistes denses, contraste du chiffre rouge sur un mur clair (halo), plans « figés » pendant les cartes.
- Snapshots : `npx hyperframes snapshot --at 0.3,1.5,3.0,… --no-end -o work/snapN`, puis lire la planche. À regarder :
  l'accroche ne touche pas la tête ; le contexte est lisible à 3 s ; les cartes ne couvrent pas le visage de celui qui
  parle ; aucun texte ne déborde sur une pastille de chapitre ; la fin.

## Rendu

`bash scripts/rendre.sh tiktok-1 … youtube` : rendu HyperFrames, son à −14 LUFS (crête −1,5 dBTP), planche dans
`livraison/`. Ordres de grandeur : 60-90 s par clip de 30-50 s, 13-21 min pour 7 min 30 de 16:9.

## Contrôle

`PYTHONUTF8=1 python <utopicar-repo>/.claude/skills/motion-studio/scripts/qa_video.py <mp4> --format vertical`
(ou `desktop` pour le 16:9) : aucun FAIL. Les zones interdites signalées sur le décor filmé ou le bord d'un panneau
ne sont pas du texte. Vérifier les dernières images de chaque clip (la signature).

## Livraison

- Versions téléphone : `ffmpeg -i x.mp4 -c:v libx264 -crf 23 -preset slow -c:a aac -b:a 160k` ; pour l'envoi à
  distance (SendUserFile), moins de 30 Mo (le 16:9 long en 540p, ~420 kb/s).
- `REVIEW.md` : livrables, choix de montage, accroches, mesures, alertes restantes, ce qui n'a pas été écouté,
  [À FOURNIR]. Chapitres YouTube prêts à coller.
- Drive (si demandé) : copier dans `G:\Mon Drive\<dossier>\`, vérifier la taille en ligne ; ne jamais écraser une
  ancienne version sans accord, mettre la nouvelle à côté.
- Les anciennes versions vont dans `livraison/ancienne-version/`.
