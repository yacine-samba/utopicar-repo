# Préparer la source

Tout se lance depuis le dossier du projet. Temps mesurés sur un PC à 10 cœurs (oct. 2026).

1. **Créer le projet** : `python ~/.claude/skills/montage/scripts/init_projet.py <dossier>/montage <source> --nom slug`.
   Copie le moteur (`scripts/`, `work/`), les polices et les bruitages, écrit les fichiers HyperFrames et préremplit
   `projet.py` (source, durée, zone = toute l'image). `--force` réinstalle le moteur sans toucher à `projet.py` ni
   aux découpages.
2. **Voix** : `python work/voix.py` → `voix16k.wav`, `voix48k.wav`, `voix_propre.wav` (passe-haut, débruitage léger,
   égaliseur, de-esser, compresseur). La loudness finale se règle après le rendu.
3. **Zone et scènes** : `python work/analyse_cadre.py`. Propose la zone caméra (pixels qui varient dans le temps ;
   retrouvée à 1 px près sur un Loom) et liste les moments où la caméra bouge. Vérifie la zone sur une image, reporte
   dans `projet.ZONE`. Découpe en scènes (`projet.SCENES`) : une scène par dispositif de caméra ; une scène sans sujet
   (`None`) pour un passage où la caméra bouge.
4. **Transcription** : `python work/transcrire.py` en arrière-plan → `work/words.json`. Mettre les noms propres et le
   jargon dans `projet.PROMPT_WHISPER` avant, et la casse dans `projet.PROPRES`. Relire la transcription : Whisper perd
   des mots qui changent le sens (« je me rappelle *plus* »), seconde écoute des passages douteux avec
   `work/retranscrire.py`.
5. **Suivi de la tête** : `python work/suivi.py --image 30` (image quadrillée de la zone à 30 s), poser la boîte de
   départ (x, y, w, h) de chaque sujet dans `projet.SUIVI`, puis `python work/suivi.py`. Score médian attendu > 0,8.
6. **Plans** : `python work/plans.py v_M v_C` (vertical) et `h_W h_C h_M` (16:9). Régler `projet.HAUTEUR` (taille de la
   fenêtre par plan et par sujet) et `projet.TETE` avant. ≈ 90 s pour deux plans de 39 s ; plusieurs Go pour 12 min.
   Les plans couvrent toute la source à cadence constante : dans HyperFrames, `data-media-start` = temps de la source.
