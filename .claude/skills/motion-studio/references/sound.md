# Musique, sound design et mix (phase 4)

## Ordre de travail
Voix d'abord (elle fixe le minutage), puis musique à un BPM compatible, puis grille mesurée, puis image calée sur
voix + grille, puis bruitages, puis mix et mastering, puis **mesure du MP4 encodé**.

## Musique

**Option 1 — ElevenLabs Music (niveau pro)** : node `music` (`eleven_music_v2_5`), `instrumental: true`,
`duration_seconds` = durée du film + 1 s. Prompt précis :
genre, BPM exact, tonalité ou mode, instrumentation, énergie par section **avec les temps** (« 0–3 s attaque franche
avec kick et stab, pas d'intro douce ; 3–22 s groove léger sous la voix, médiums dégagés ; 22 s montée ; 27 s accord
final et fin nette »), « no vocals », « mix for phone speakers: present mids, controlled sub ». `estimate_only`
d'abord. Option `video-to-music` pour scorer un montage déjà rendu.
Ensuite toujours **mesurer** le BPM et la grille réels (`beats.py`) : on ne cale pas l'image sur le BPM demandé.

Déroulé éprouvé sur master60 (oct. 2026) :
1. **Générer dans un flow** (`creative_create_flow`, puis un node par son), en gardant `generations_count` par défaut
   (4 variations). Attendre avec `creative_get_flow_run_status`.
2. **Télécharger tout de suite** : les liens signés expirent après environ 2 h (HTTP 400). Quand la réponse de statut
   est trop longue pour la conversation (45 ko pour 4 musiques et 44 bruitages), elle est écrite dans un fichier :
   `python3 scripts/eleven-dl.py <fichier> --out video/audio/<projet>/eleven --map "electronic pop=musique,impact hit=impact,…"`.
   Fichiers nommés `<type>-<id de génération>.mp3`. Lien expiré : relancer `creative_get_flow_run_status` avec les
   mêmes `session_ids`, puis relancer le script.
3. **Choisir la prise par mesure** :
   `python3 scripts/music-pick.py video/audio/<projet>/eleven/musique-*.mp3 --bpm 112 --sim 14-24`. Il donne, par prise :
   - le tempo réel et sa stabilité : résidu au-delà de 30 ms = prise écartée (master60 : 112,67 BPM, 133 ms) ;
   - le premier temps de mesure ;
   - par mesure : montée, coupure, trou, drop, fin ;
   - des spectrogrammes ;
   - la ressemblance des mesures, pour choisir les coupes.

   On retient la prise dont la **forme** sert le film : un drop qu'on peut poser sur le pivot, une fin nette. Ce n'est
   pas « la plus belle », qu'on ne peut de toute façon pas écouter ici.
4. **La ramener au BPM exact** : `resample_poly(y, up, down, axis=0)` (rapport donné par le script, 4869/4870 pour
   111,98 → 112 BPM), puis la monter sur la grille de la voix (`sound-design.md` § 9).

**Option 2 — synthèse en code** (`video/scripts/music-*.py`, numpy) : totalement maîtrisée et déterministe, sortie
`audio/music-<projet>.wav` + stem `drums-<projet>.wav` pour la détection. Timbres simples : à réserver aux films sans
voix ou quand l'utilisateur refuse les crédits. Écouter le résultat n'étant pas possible ici, le dire.

Règles communes :
- Le son **attaque à 0 s** (la v5 était à −35,7 LUFS sur les 2 premières secondes : un hook muet).
- Respirations musicales sous les phrases importantes, silence volontaire autorisé (pause noire v6) — jamais par
  accident.
- Référence musicale = registre (tempo, énergie, instrumentation), jamais la mélodie ni un son reconnaissable.

## Grille et synchro
- `CUT=<projet> python3 video/scripts/beats.py audio/music-<projet>.wav --stem audio/drums-<projet>.wav` : kick isolé
  (passe-bas 150 Hz), montées d'enveloppe, période ajustée aux moindres carrés, temps forts par accents.
  Avec une musique générée sans stem : lancer sur la musique entière, vérifier les downbeats à l'oreille des mesures
  (écart max affiché).
- `CUT=<projet> node video/scripts/sync.mjs` : chaque repère `beat: true` à ≤ 15 ms d'un temps ou demi-temps,
  logo sur un temps fort, CTA sur un temps. `--apply` seulement après avoir lu le rapport (un recalage aveugle a déjà
  corrompu une timeline).
- Les grands moments tombent sur les temps forts, les impacts sur les temps, les frappes de texte peuvent être libres.
- **Caler la voix sur la grille** (master60, `video/scripts/cale-master60.py`) :
  - chaque mot fort qui suit un silence (« Ah. », « Non. », « Hop ! », « Ding ! ») est amené sur le temps le plus
    proche ;
  - seul ce silence change : jamais sous 0,12 s, jamais plus d'un demi-temps de décalage ; la prise et la diction
    restent intactes ;
  - sortie `grille.json` (`bpm`, `beat`, `ancre` = premier temps du corps), puis le minutage est retranscrit ;
  - le film lit `BT(n) = ancre + n × beat`, la musique est montée sur la même grille : mots forts, impacts et premiers
    temps de mesure tombent ensemble (à quelques ms près).

## Bruitages
- Synthèse (`video/scripts/sfx.mjs` : click, key, tick, pop, whoosh, hit, impact, thump) depuis les `cues`, ou
  ElevenLabs node `sfx` (`eleven_text_to_sound_v2`) pour des sons réalistes (clic de souris, clavier, whoosh
  précis). Discrets : ils ponctuent, ils ne couvrent pas la voix.
- **Banque ElevenLabs d'un film** (master60) : un node par type de geste, 4 variations chacun, environ 2 crédits le
  son, environ 100 crédits pour 11 types. Le prompt décrit **un seul** son court et propre, avec sa durée
  (0,5–1,2 s) : « Paper notebook and a calculator dropping onto a wooden desk, short soft thud », « Fast reverse whoosh
  sucking everything in, quick suction riser ending abruptly ».
- **Choisir chaque variation par son enveloppe** (attaque, position du pic, durée utile), pas au hasard :
  - les fichiers « clic » contiennent 3 ou 4 clics : ne garder que le premier transitoire (65 ms) ;
  - une aspiration a son pic à la fin : le caler sur le pivot et couper 20 ms après ;
  - un impact presque tout en sub (centroïde ≈ 120 Hz) ne s'entend pas sur un téléphone : ajouter 45 % d'une copie
    saturée (`tanh`) filtrée entre 300 Hz et 6 kHz ;
  - un fichier presque muet (crête à −50 dBFS) est écarté ;
  - plusieurs variations retenues sont jouées à tour de rôle, pour qu'une même action ne sonne pas comme une mitraillette.

## Mix et mastering
- Voix devant : musique −10 à −14 dB sous la voix (ducking avec attaque 20 ms, relâchement 250 ms), voix compressée
  légèrement, dé-essée si besoin, filtrée sous 80 Hz.
- **Niveau de la musique déduit de l'écart voix / musique visé**, pas d'un gain de bus fixe : mesurer l'écart par
  phrase et régler la musique pour une médiane de 11 dB (minimum ≥ 5). master60 : un gain fixe donnait une médiane de
  1,4 dB et un minimum de −4,5 dB.
- **Le ducking s'arrête sur les grands moments** : fenêtre de 0,35 s sans ducking sur le drop, l'apparition du logo et
  le coup final, même si la voix parle.
- Dernier réglage : `gain = min(−14 − LUFS, −3,5 − true peak)` : on atteint −14 LUFS sans dépasser −3,5 dBTP.
- **Pensé pour un téléphone** : l'énergie sous 150 Hz ne doit pas dominer (v5 : 88 % sous 150 Hz, 1,4 % entre 1 et
  5 kHz → film « faible » sur un haut-parleur). Garder la présence 1–5 kHz (voix, attaques, plucks).
- `MIX_CEIL=-3.5 CUT=<projet> python3 video/scripts/mix.py` : −14 LUFS intégrés, plafond de travail −3,5 dBTP,
  car l'encodage AAC ajoute jusqu'à 2 dB sur les crêtes (v5 : −1,1 dBTP en WAV → +0,9 dBTP dans le MP4).
- Un mix par langue : `audio/mix-<projet>-<lang>.wav` (même musique et bruitages, voix de la langue).
- Vérification finale **sur chaque MP4** avec `qa_video.py` : −14 ±1 LUFS, true peak ≤ −1 dBTP, son des 2 premières
  secondes à moins de 8 LU du reste, équilibre téléphone.
- Si un MP4 dépasse : refaire le mix avec plus de marge et remuxer l'audio sans réencoder l'image
  (`ffmpeg -i film.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -movflags +faststart`).
