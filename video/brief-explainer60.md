# Brief — explainer60 (v8) — « UTOPICAR, chaque fonction » avec la voix de Simon

UTOPICAR Garage · pub TikTok qui explique l'outil · acheteurs-revendeurs auto · 60 s · Vertical 9:16 · Français
Voix : Simon — Voix Radio (ElevenLabs `mvhJVdVoTWVUtL4keT7W`, modèle eleven_v3, balises d'émotion), celle de
l'extrait `audio/voix-choix/v2/simon.mp3`. Ton : pub radio énergique, tutoiement, sourire, un peu d'ironie.
Structure : besoin (douleur) → UTOPICAR → 5 fonctions numérotées (Analyser, Rapports, Recherche en direct, Parc,
Tableau de bord) → promesse → CTA « Commente GARAGE ». Chaque fonction = vraie capture + curseur + un chiffre qui tranche.
Musique : pop lumineuse 120 BPM sous la voix (voix devant, ducking), attaque à 0 s. Données démo + mention à l'écran.
Tri rapide non montré (nécessite l'IA, pas capturable en démo).

## Script voix (≈ 165 mots)
[excited] Tu fais de l'achat-revente auto ? Alors écoute bien. Une annonce qui a l'air top… [sarcastic] une fois les
frais payés, il te reste parfois moins que rien.
Des annonces partout, des calculs à la main, une marge au pif. [pause] C'est fini.
[excited] Voici UTOPICAR : ton outil d'achat-revente, dans ta poche.
Un : tu analyses. Tu colles l'annonce, et en deux secondes : une note sur cent, un verdict, ce qu'il te reste vraiment,
frais compris… et le prix à ne jamais dépasser.
Deux : tes rapports. Tous tes dossiers au même endroit, pour comparer et garder la meilleure affaire.
Trois : la recherche en direct. UTOPICAR surveille les nouvelles annonces et te sort celles qui sont sous la cote.
[happy] Mille quatre cent cinquante euros en dessous ? T'es le premier au courant.
Quatre : ton parc. Chaque voiture, son statut, sa marge, et depuis combien de jours elle dort.
Et cinq : ton tableau de bord. Ton stock, ton argent immobilisé, ta marge réalisée… [pause] tout, en un coup d'œil.
Tu sais avant d'acheter. Tu revends avec de la marge. [pause] UTOPICAR. [excited] Commente GARAGE pour recevoir l'accès.

## Chaîne de production (voix → film)
1. Voix : ElevenLabs, Simon (`mvhJVdVoTWVUtL4keT7W`), eleven_v3, script ci-dessus → `audio/vo-explainer60.mp3`.
2. `CUT=explainer60 python3 scripts/vo_marks.py` : transcription mot à mot, 40 repères du film posés sur les mots
   (sans fichier voix : minutage provisoire estimé au débit de Simon, 3,1 mots/s).
3. `python3 scripts/music-explainer60.py` (sections calées sur les repères), repères SFX, `node scripts/sfx.mjs`,
   `MIX_CEIL=-3.5 SFX_HP=90 CUT=explainer60 python3 scripts/mix.py` (voix devant, musique baissée sous la voix).
4. `CUT=explainer60 node scripts/render.mjs --all`, puis `qa_video.py`.

État : film, musique, bruitages et mix prêts ; **voix bloquée** (ElevenLabs a désactivé l'accès gratuit du compte :
« Unusual activity… Please upgrade to a paid subscription »). Aperçu 540p sur minutage provisoire :
`renders/draft-explainer60-9x16.mp4`.

## Décision : version **sans voix** (choix de l'utilisateur, ElevenLabs bloqué)
Le film garde le rythme du script de Simon (minutage estimé à 3,0 mots/s, 59 s) et porte le récit à l'écran :
une légende courte (≤ 6 mots) sous l'en-tête de chaque étape — « Colle l'annonce. », « Une note. Un verdict. »,
« Ce qu'il te reste, vraiment. », « Ton prix max. », « Tous tes dossiers. », « Tu compares. », « Il surveille les
annonces. », « Et sort les bonnes. », « Chaque voiture, sa marge. », « Et ses jours en stock. », « Ton stock. »,
« Ton argent immobilisé. », « Ta marge réalisée. », « Tout, d'un coup d'œil. ». L'accroche devient « Regarde bien. ».
Frappe douce sous chaque légende (`scripts/cues-explainer60.py`). Si la voix de Simon arrive plus tard : la déposer en
`audio/vo-explainer60.mp3` et relancer la chaîne ci-dessus ; les légendes peuvent rester (visionnage sans son).
