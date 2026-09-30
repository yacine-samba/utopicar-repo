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

## Bruitages
- Synthèse (`video/scripts/sfx.mjs` : click, key, tick, pop, whoosh, hit, impact, thump) depuis les `cues`, ou
  ElevenLabs node `sfx` (`eleven_text_to_sound_v2`) pour des sons réalistes (clic de souris, clavier, whoosh
  précis). Discrets : ils ponctuent, ils ne couvrent pas la voix.

## Mix et mastering
- Voix devant : musique −10 à −14 dB sous la voix (ducking avec attaque 20 ms, relâchement 250 ms), voix compressée
  légèrement, dé-essée si besoin, filtrée sous 80 Hz.
- **Pensé pour un téléphone** : l'énergie sous 150 Hz ne doit pas dominer (v5 : 88 % sous 150 Hz, 1,4 % entre 1 et
  5 kHz → film « faible » sur un haut-parleur). Garder la présence 1–5 kHz (voix, attaques, plucks).
- `MIX_CEIL=-3.5 CUT=<projet> python3 video/scripts/mix.py` : −14 LUFS intégrés, plafond de travail −3,5 dBTP,
  car l'encodage AAC ajoute jusqu'à 2 dB sur les crêtes (v5 : −1,1 dBTP en WAV → +0,9 dBTP dans le MP4).
- Un mix par langue : `audio/mix-<projet>-<lang>.wav` (même musique et bruitages, voix de la langue).
- Vérification finale **sur chaque MP4** avec `qa_video.py` : −14 ±1 LUFS, true peak ≤ −1 dBTP, son des 2 premières
  secondes à moins de 8 LU du reste, équilibre téléphone.
- Si un MP4 dépasse : refaire le mix avec plus de marge et remuxer l'audio sans réencoder l'image
  (`ffmpeg -i film.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -movflags +faststart`).
