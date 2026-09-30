# Brief — la vidéo validée (explainer 60 s) refaite dans 2 styles de référence, avec et sans voix

UTOPICAR Garage · TikTok · acheteurs-revendeurs auto · Vertical 9:16 · Français · 60 s
Même récit que l'explainer validé : mêmes phrases, mêmes fonctions (Analyse, Compare, Trouve, Organise, Pilote), même
vraie interface avec données démo, même CTA « Commente GARAGE ». Seule la mise en forme change. Chaque style existe
avec la voix de Simon (la prise déjà validée, aucun crédit dépensé) et sans voix (« Écoute. » devient « Regarde. »,
la musique et les bruitages portent seuls).

Les références donnent une grammaire, rien d'autre : pas de texte, de logo, d'image ni de musique repris. Elles
restent hors du dépôt.

| Style | Grammaire reprise de la référence | Ce que ça donne pour UTOPICAR |
|---|---|---|
| MO1 (réf. 1) | Fond marine profond avec halos, typographie qui arrive lettre par lettre (flou et glissement), mot d'accent coloré, forme florale derrière les mots-clés, goutte qui voyage de plan en plan, transitions où la fleur envahit l'écran | Accent orange UTOPICAR, gros mots (« Fini. », « Analyse. »…) sur la fleur marine, goutte orange avec traînée qui guide l'œil puis tourne autour du logo, deux transitions fleur orange (logo, carton final) |
| MO2 (réf. 2) | Rideau de lumière bleue, particules en suspension, texte tapé dans des bulles de verre dépoli, curseur de verre, bulle liquide avec étiquettes en orbite, carte de chargement, comparateur avant/après | Phrases tapées dans la bulle avec touches, bulle-logo avec les 5 fonctions en orbite, « Analyse du dossier… » pendant « 2 secondes », rideau NO GO → GO entre la Golf et la Clio, cartes de l'interface sous cadre de verre |

Fichiers : `film-mo/` (récit et éléments d'interface communs), `film-mo1/`, `film-mo2/`, `timeline-mo1.json`,
`timeline-mo2.json`, `scripts/cues-mo.mjs` (bruitages dérivés des battements et des animations de chaque style).
Chaîne : `CUT=moN node scripts/cues-mo.mjs` → `CUT=moN HOOK=voix|sansvoix node scripts/sfx.mjs` →
`MIX_CEIL=-3.5 SFX_HP=90 CUT=moN HOOK=voix python3 scripts/mix.py` (sans voix : `NO_VO=1 … HOOK=sansvoix`) →
`CUT=moN HOOK=voix|sansvoix node scripts/render.mjs --all` → `renders/9x16-moN-voix.mp4`, `renders/9x16-moN-sansvoix.mp4`.
Musique : la piste 120 BPM de l'explainer validé.
