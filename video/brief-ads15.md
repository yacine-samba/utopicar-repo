# Brief — 3 pubs TikTok de 10 à 15 s (voix de Simon)

UTOPICAR Garage · TikTok Ads · acheteurs-revendeurs auto · Vertical 9:16 · Français · voix Simon (eleven_v3)
Principe : une seule idée par pub, hook lisible dès l'image 0, preuve sur la vraie interface, CTA « Commente GARAGE »
(carton final ≈ 3 s), mention « Données de démonstration », bruitages réels ElevenLabs + musique 120 BPM.

| Pub | Angle | Hook (image 0) | Voix | Preuve |
|---|---|---|---|---|
| ads1 (12,2 s) | Peur de perdre | « Ne l'achète pas. » sur la Golf à 9 500 € | Stop. Ne l'achète pas. Cette Golf à neuf mille cinq cents euros, je la colle dans UTOPICAR… moins mille deux cents euros, frais compris. En deux secondes, tu sais. Commente GARAGE. | collage, clic, NO GO 38/100, − 1 200 € ; musique coupée net (scratch) sur le verdict |
| ads2 (12,5 s) | La bonne affaire | « 1 450 € sous la cote. » sur la vraie fiche | Mille quatre cent cinquante euros sous la cote. Publiée il y a douze minutes. UTOPICAR surveille les annonces et te prévient avant tout le monde. Presque deux mille euros de marge. Commente GARAGE. | nouvelles annonces (il y a 12 min), recherche suivie, GO + 1 932 € ; notification |
| ads3 (14,1 s) | Le confort | « Zéro tableur. » sur le vrai stock | Ton stock, ton argent immobilisé, ta marge réalisée… tout, en un coup d'œil. Tu sais avant d'acheter. Tu revends avec de la marge. UTOPICAR. Commente GARAGE pour recevoir l'accès. | KPI qui arrivent sur chaque mot, tableau de bord entier, GO + 1 932 € |

Voix : ads1 et ads2 générées (2 prises chacune, prise A retenue) ; ads3 = passage de la prise de l'explainer 60 s
(ElevenLabs a de nouveau bloqué la génération : « Free Tier access has been disabled »).
Chaîne : `vo_tighten.py` → `CUT=adsN python3 scripts/vo_marks.py` → `CUT=adsN python3 scripts/music-ads.py` →
`python3 scripts/cues-ads.py` → `CUT=adsN node scripts/sfx.mjs` → `MIX_CEIL=-3.5 SFX_HP=90 CUT=adsN python3 scripts/mix.py`
→ `CUT=adsN node scripts/render.mjs --all`.
