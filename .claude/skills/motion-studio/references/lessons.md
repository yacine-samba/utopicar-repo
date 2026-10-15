# Leçons des films UTOPICAR (v1 → v9, MO1 → MO10, master60, semaines d'oct.)

À relire avant de construire. Chaque ligne est arrivée pour de vrai.

## Erreurs et leur correction

| Où | Erreur | Correction durable |
|---|---|---|
| v1 | « Ça va trop vite, beaucoup d'info » (retour utilisateur) : 9 titres en 15 s | Une idée par plan, 2–4 s par idée, écrans de ≤ 6 mots |
| Captures | Police remplacée par Chromium (proxy) | Servir Archivo en local via une route Playwright |
| Captures | Dock et barres fixes incrustés dans les captures | Masquer les éléments fixes pendant la capture ; verre capturé en PNG transparent |
| Captures | Marge de page grise autour des cartes | Détourer (retirer la marge, rayons réels du site) |
| Captures | Placeholder réel contenant « leboncoin » | Ne pas cadrer / masquer toute plateforme tierce |
| Son | Détection du tempo décalée (phase librosa, −50 ms, faux départs) | Kick isolé, montées d'enveloppe, écart min 0,35 s, grille ajustée ; downbeats par accents |
| Son | `sync.mjs` a réécrit la timeline à l'aveugle | Lecture seule par défaut, `--apply` après lecture du rapport |
| Anim | Compteur sur spring lourd : mauvais chiffre affiché en fin de course | `min(1, p / 0.99)` pour tomber exactement sur la valeur |
| 3D | Bloom qui brûle les panneaux, noirs gris | Couleurs sous le seuil de bloom, étalonnage plus sombre |
| v4 | Écran du téléphone caché dans le boîtier, encoche lue comme une censure | Ordre de profondeur vérifié, encoche en pastille |
| v5 | Conteneurs de taille nulle : tout décentré | Conteneur à la taille de son contenu (`.abs > .crop { position: relative }`), pas de `position` inline qui écrase le CSS |
| v5 | `fit()` mesurait une boîte pleine largeur : « 14 820 € » et le CTA sous les boutons TikTok | Mesurer le texte lui-même ; contrôler les zones sûres **par mesure** (`qa_video.py`) |
| v5 | Première image vide (vignette blanche) | Image 0 déjà composée : hook lisible dès la frame 0 |
| v5 | Intro musicale à −35,7 LUFS pendant 2 s | Attaque sonore à 0 s (voix + impact), vérifiée par mesure |
| v5 | 88 % de l'énergie sous 150 Hz | Mix pensé téléphone : sub contenu, présence 1–5 kHz |
| v5 | True peak +0,9 dBTP après AAC alors que le WAV était à −1,1 | Plafond de travail −3,5 dBTP, mesure sur le MP4 |
| v5 | Textes qui finissaient de sortir sur le plan suivant (flash orange) | Couper net à la frame de coupe |
| v5 | Grille vide à chaque coupe (micro-flash blanc) | Le plan suivant entre avec un élément déjà visible |
| v5 | Sortie en simple fondu | Sortie en mouvement (glissement, échelle) |
| v5 | Recherche lancée sur un formulaire vide | Démo crédible pas à pas : remplir puis cliquer |
| v5 | Réponse « Avec » affichée avant la question, prix superposés pendant le changement | Ordre narratif respecté ; remplacement en deux temps (sortie puis entrée) |
| v5/v6 | Tuile du logo invisible sur fond sombre | Liseré clair ou fond contrasté |
| v5 | Chiffres démo présentés comme résultats | Mention « Données de démonstration » ou vrais chiffres autorisés |
| v5 | 60 s, CTA à 54 s | Pub : 21–34 s, CTA avant la fin, carton ≤ 3 s ; 60 s = version longue |
| v5 | Explosion de cartes floues très lumineuses | Cartes nettes, mouvement lisible, pas de flash |
| v6 | Barre de recherche trop petite dans la 1re seconde, texte qui touchait la loupe | Texte court, plus grand, mesuré dans son conteneur |
| Réfs | Vimeo privé (401/403) | Demander le fichier ; ne jamais contourner l'accès |
| Réfs | Texte proche d'une phrase de la référence | Réécrire : la référence donne une grammaire, pas des mots |
| Logo | Logo reçu en image dans la conversation, retracé | Demander le fichier source (SVG/PNG HD) dès le brief |
| Critique | Rounds notés 8/8 à l'œil malgré des défauts mesurables | Mesures automatiques à chaque round, notes plafonnées par les FAIL |
| Livraison | Fichier > 30 Mo refusé à l'envoi | Aperçu compressé + chemin du fichier complet |
| v7 | Voix posées (« trop IA, trop calmes »), puis énergiques (« pas assez humaines »), puis bande-annonce (« trop dramatique ») | Chercher la voix par l'**intention** : une démo commentée avec le sourire, des **réactions** (surprise, petit rire, « Ah ouais. ») jouées avec les balises eleven_v3 ; retenue à la Apple, jamais d'emphase |
| v7 | Voix écoutées à sec, hors contexte | Chaque extrait posé sur un lit musical calé sur ses mots (`voice_demo.py`, transcription mot à mot) |
| v7 | Voix de la bibliothèque bloquées (« creator tier »), puis accès gratuit coupé par ElevenLabs en cours de casting | `estimate_only` sur chaque voix avant de promettre un casting ; le dire tout de suite ; l'offre se change côté utilisateur |
| Git | Tentation de committer un MP4 en cours de rendu | Attendre la fin du rendu, expliquer au besoin |
| Centrage | Tout centré sur x = 500 (centre de la zone sûre) : « tout est décalé à gauche, c'est bâclé » | Centre x = 540, colonne 140 → 940, centre de l'encre mesuré (± 4 px) |
| Code | `a?.b ?? -9 + 0.12` : précédence mal lue → `NaN` dans un `transform`, compteur bloqué en haut | Parenthéser chaque `??`, tester le plan à l'image où l'élément doit bouger |
| Réfs | Analyse à 0,5 s : coupes et transitions ratées | `ref-frames.py` image par image, planches 0,1 s, bandes −4…+4 images |
| Réfs | Transcription en français forcé d'une voix anglaise : on obtient une traduction, pas les mots | Langue détectée (`--lang auto`) ; vérifier aussi que les sous-titres fournis sont bien ceux de la vidéo (réf. 5 : non) |
| Réfs | « 4 coupes en 70 s » : le motion design enchaîne sans couper | Compter les **scènes** (corrélation basse définition sur ± 0,15 s), pas seulement les coupes : réf. 5 = 33 scènes, une toutes les 2,1 s |
| MO5 | Brief écrit pour des particuliers alors que la cible était les débutants en achat-revente | Relire la cible du brief avant d'écrire une ligne ; « recommence à 0 » = nouveau brief, pas une retouche |
| MO5 | Chiffre inventé (« 46 h de travail ») présenté comme vrai | Chaque chiffre sourcé ou annoncé comme exemple ; ce qu'on ne sait pas, on ne l'écrit pas |
| MO5 | DA « trop statique, trop frontale », serif orange jugée moche | Verre, lueurs, caméra 3D, profondeur de champ, flou de bougé ; serif choisie sur planche de 7 (Fraunces) |
| MO5 | Détourage « dégueulasse » (isnet) | BiRefNet + décontamination + liseré de lumière sur le contour (`scripts/cutout.py`) |
| MO5 | Correspondance titre → id Mixkit fausse | Choisir sur une planche de vignettes étiquetées (`scripts/mixkit.py search --sheet`) |
| MO5 | `decode()` parallèle de centaines d'images : « cannot be decoded » | Chargement séquentiel avec relance |
| MO5 | Mix à −18,9 LUFS à cause des transitoires, voix à 0,4 dB de la musique | Limiteur à anticipation ; nivellement par réplique et ducking par bande (écart min 4 dB) |
| MO5 | Une part de rendu valide supprimée par erreur après un redémarrage du conteneur | Regarder un dossier avant de le vider ; le dire tout de suite et refaire |
| MO6 | Trois concepts refusés (conseil d'annonce, émotion sans valeur, fiche « à enregistrer ») | Envie + valeur concrète + rien de proposé + chute (`codes-attention.md`) |
| MO6 | Prix illisibles sur la carrosserie quand la caméra zoome | Viser le point sous le texte (`y − (Y − FY)/s`) + voile sombre en haut indexé sur le zoom |
| MO6 | Fils d'étiquettes invisibles | Un filtre SVG ne dessine pas un trait de largeur nulle : courbe `Q` |
| MO6 | Écart de boucle 2,9 sur 255 | Bruit de caméra en rampe, fond périodique, grain modulo : 0,21 |
| MO6 | ElevenLabs : offre gratuite coupée (« activité inhabituelle », proxy de l'environnement) en pleine étape voix | Ne pas relancer ; le dire avec le message exact ; options : abonnement, voix de l'utilisateur, ou attendre |
| MO6 | `pkill -f sheet-mo6.mjs` a tué sa propre commande | `pkill` dans un appel séparé |
| MO6 | Moniteur `until ! pgrep -f "render.mjs --all"` jamais terminé : il se trouvait lui-même | Attendre un fichier de sortie (ou `pgrep -f '[r]ender.mjs'`), jamais un motif présent dans la commande d'attente |
| MO6 | Rendu final de 30 s avec verre dépoli : ≈ 2 h en 4 parties (6 à 15 s par image) | Prévenir l'utilisateur de la durée ; planches et images fixes pour tout contrôle avant |
| MO8 | Silhouettes de voitures dessinées en SVG jugées « chiasse » | Vraies photos des modèles exacts (Wikimedia Commons, versions et générations exactes, licences notées), détourées, plaques et logos effacés, toutes tournées du même côté |
| MO8 | Photos Pexels « proches » (mauvaise génération, mauvais modèle) refusées : « ce ne sont pas les vrais modèles » | Chercher la version exacte (moteur, génération) ; Commons a des photos par motorisation ; l'API Commons limite le débit : requêtes espacées, vignettes aux tailles standard (1920 px) |
| MO8 | « 1.4 TSI » lu « un-quatre T-S-I » | La cylindrée se dit en litres : « un litre quatre », « un litre deux », « deux litres » (`script-voice.md`) ; ne refaire que les répliques fautives et les remonter dans la prise retenue |
| MO8 | Repères de mots trop tôt : whisper compte le silence d'avant dans le premier mot d'une réplique | Borner chaque mot au début du son de son morceau ; repères donnés par réplique et rang, pas par indice global |
| MO8 | Pièces 3D (Three.js en rendu logiciel) + flou de bougé : ≈ 2 h 30 pour 30 s en 4 parties (4 à 20 s par image) | Planches 0,1 s pour tout contrôle ; ne relancer le rendu final qu'une fois la voix figée |
| MO9 | `estimate_only` a annoncé 1 052 crédits sans signaler le solde ; la génération a échoué : « This request exceeds your quota of 10000. You have 232 credits remaining, while 526 credits are required » | L'estimation ne vérifie pas le solde. Demander à l'utilisateur son solde ElevenLabs (ou générer une phrase courte) avant de promettre une prise ; ne jamais relancer après un échec de quota |
| MO9 | faster-whisper *small* écrit « banquets », « Pneulis », « fargenis » et avale le rire `[chuckles]` dans le mot suivant (0,9 s pour « Même ») | Contrôler la prononciation avec le modèle *medium* (il relit le texte exact), sur la prise puis sur le mix ; recaler à l'enveloppe les mots que *small* étire |
| MO9 | Rendu `--draft` à 60 i/s : ≈ 1,1 s par image, 33 min pour 30 s | Brouillon d'écoute à 30 i/s (`fps` du timeline le temps du rendu), 60 i/s pour le rendu final |
| MO9 | Caméra qui cadre de près et calques en profondeur (`translateZ` 160-200) : « 974 € » sortait de la colonne, « MARGE » montait dans la bande du haut ; vu seulement par `qa_video.py` sur le MP4, deux rendus finaux de 40 min de plus | Dimensionner les gros chiffres avec le grossissement de la caméra la plus proche ; avant chaque rendu final, mesurer les bandes interdites sur des images fixes (`at.mjs` + seuil de luminance) aux temps où la caméra bouge |
| master60 | Maquette validée (« la dernière est bien, anime bien les textes »), puis détour proposé (essai de 15 s, retouche du calage de la voix) : refusé | Une maquette validée se produit telle quelle ; les vérifications se font sur images fixes, sans demander de détour |
| master60 | « Recréer pas les 2 vidéos, fait direct sound design » : retouches d'image et son demandés ensemble | Grouper les retouches, faire le son, puis **un seul** rendu final avec le mix |
| master60 | Logo animé : creux du o, du p et du a remplis (capture de l'utilisateur) | Un seul `path` par lettre quand on découpe le mot-symbole (`techniques.md` § 14) |
| master60 | Compteur « 50 » : le 0 rogné (capture de l'utilisateur) | Colonnes de chiffres en `clip-path: inset(0 -.35em)`, pas `overflow:hidden` |
| master60 | Mention « Vraies annonces… » à retirer (demande de l'utilisateur) | Seulement les mentions exigées : « Données de démonstration », « Exemples chiffrés, pas une promesse de gain », option payante nommée |
| master60 | 4 musiques demandées à 112 BPM : l'une tournait à 112,67 BPM avec 133 ms d'écart | `scripts/music-pick.py` sur chaque prise ; ne jamais caler sur le BPM demandé |
| master60 | Musique trop forte : écart voix / musique médian de 1,4 dB avec un gain de bus fixe | Régler la musique sur l'écart visé (médiane 11 dB, minimum ≥ 5) |
| master60 | Liens ElevenLabs expirés (HTTP 400) environ 2 h après la génération ; réponse de statut de 45 ko | `scripts/eleven-dl.py` dès la fin des générations ; liens neufs par un nouveau `creative_get_flow_run_status` |
| master60 | Titres desktop posés à x = 96, vus à x ≈ 70 dans le MP4 | La poussée de caméra (zoom depuis le centre) élargit tout : prévoir la marge (`motion-craft.md` § 3) |
| master60 | Aplats vides de 0,2 à 0,4 s à deux coupes (`qa_video.py`) | Le premier élément entre à la frame de coupe ; la coupe tombe sur le mot qui amène l'élément |
| master60 | `matplotlib` absent, `sleep` bloqué dans Bash | Spectrogrammes en PIL (`music-pick.py`) ; rendus en tâche de fond, attendre la notification de fin |
| Débuts BO | « Manque d'originalité » : fiche d'annonce + ticket de 5 lignes | Moins de texte : chaque chiffre porté par un objet (étiquette qui se retourne, étoile, repères sur la voiture) ; grammaire relevée sur Behance avant de redessiner |
| BO1 | « Boîte DSG » et « Quickshift » à l'écran alors que les 3 annonces étaient en boîte manuelle | Vérifier chaque point « à vérifier » dans l'annonce (colonne `boite` de `marche_annonces`) et dans la liste de l'outil (`web/src/lib/analyse/fiabilite.ts`) |
| Polo v2 → v4 | « Fais 978 de bénef avec ça » (pronom sans objet), puis « 3 analyses offertes » sans avoir montré ce qu'est une analyse | Objet nommé dans la 1re phrase ; le produit produit chaque résultat à l'écran (« tu colles l'annonce », barre, clic, scanner) avant le CTA |
| Planches | Chiffres calculés de mémoire (× 0,95, 20 € de frais) : l'outil fait × 0,96, 150 € de frais, prix max arrondi aux 50 € inférieurs | Lire la formule dans le code du produit (`bilan.ts`) avant de chiffrer ; mention « hors travaux » quand une partie manque |
| Semaines oct. | Textes posés à y ≥ 1 480 : dans la bande du bas couverte par TikTok, 14 rendus à refaire | Bas de chaque texte ≤ 1 480 dès la config ; planche de contrôle avec la ligne 1 480 tracée avant le rendu final |
| Semaines oct. | Carton de fin déclenché par « 3 100 » au lieu de « Trois » (mot cherché par préfixe) | Mot-clé numérique court : égalité stricte ; chercher « trois » d'abord, « 3 » ensuite |
| Semaines oct. | Whisper saute des passages entiers (liste de chiffres dite vite) | Retranscrire le passage seul (VAD, sans contexte) et recoller les mots dans le `.words.json` |
| Semaines oct. | Chiffre orange posé sur le disque orange : illisible | Pastille sombre derrière tout texte posé sur un fond coloré |
| Semaines oct. | `taskkill /IM node.exe` pour arrêter un rendu : tous les node du PC tués, serveur de dev compris | N'arrêter que ses propres processus (PID du script de rendu) |
| Twingo BO3 | Flou de la photo sur le pare-brise, détourage avec un pavé flou ; puis raccord visible | Reconstruire la voiture par symétrie depuis la moitié propre ; vérifier chaque flou sur un recadrage zoomé |
| Top 3 / 14 vidéos | Bénéfices « trop beaux » : revente à la médiane, travaux probables oubliés ; 5 vidéos sur 13 passaient en perte une fois recalculées | Chiffrer avec l'hypothèse **prudente** du produit (bas de fourchette, travaux, frais, marge) ; si le sujet ne tient plus, réécrire l'angle (« le piège ») plutôt que garder un chiffre flatteur |
| Top 3 | « Polo 1.6 TDI la plus fiable » : faux | Tout fait technique dit à l'écran (moteur, génération, boîte) se vérifie par recherche + dans la source du produit avant le script |
| Top 3 | La voix lit « 1,4 » « un virgule quatre » | Écrire les nombres comme on les dit (« un litre quatre », « six mille six cent cinquante ») dans le texte envoyé au TTS |
| Top 3 | Bégaiements « code code » après resserrage des silences | Marges de découpe qui se chevauchent : ne jamais reprendre un bout déjà pris (`a = max(prev_b, a - pre)`), ignorer les segments vides |
| Top 3 | Flous « chelou » sur logos et phares | Ne flouter que ce qui l'exige (plaque), sur la photo originale, contrôle sur recadrage zoomé |
| Top 3 | Interface « exemple » à l'écran, rapport qui contredisait le verdict | Capturer la vraie UI avec les données du cas montré, retirer les libellés de démo, et vérifier que fiche, tampon et voix disent la même chose |
| 13 vidéos | Tampon « J'ACHÈTE » alors que le prix dépassait le prix max de la fiche | Le verdict à l'écran découle des chiffres affichés, pas du ton voulu (« NÉGOCIE » si prix > max) |
| 13 vidéos | Photo d'une autre génération que celle annoncée (Polo 5 pour une Polo 4) | Pas de photo exacte = changer de sujet ou le signaler avant production, jamais en douce |
| Capital an 1 | Repère présenté comme une loi (« 3 à 6 cartes grises »), total valable seulement pour le haut de fourchette | Dire « repère » quand ce n'est pas un texte ; afficher l'hypothèse du calcul (6 voitures) ; vérifier les taux officiels (12,3 % URSSAF) avant le rendu |
| Toutes | Emojis, mentions « exemple », sources à l'écran jugés cheap | Mots-chocs en texte seul ; sources dans le brief, pas à l'écran (sauf obligation légale) |
| Hooks HK1–HK3 | « C'est du Canva, pas du motion design » : pastilles, anneaux, halos, bandeaux, étiquettes qui tombent | Lire `motion-pro.md` et regarder des références avant d'animer ; un seul objet porteur qui se transforme, du vide, des bords sur deux ressorts |
| Hooks | Animé sans relire le skill ni chercher de références | Toujours : skill → 2–3 références décomposées image par image → construction → mesure `ref-motion.py` contre les références |
| NEGO | « La voix de Simon s'arrête » : silences ajoutés (0,6–0,9 s) + arrêt de musique au même endroit = vide total | Jamais de silence ajouté dans la voix ; ce sont les images qui débordent sur la phrase suivante ; vérifier la piste voix (aucun blanc > 0,4 s) |
| ETT | Un texte créé (`KT`) mais jamais animé reste visible par défaut et se superpose (« Prix max » sur « −350 € ») | Supprimer l'élément, pas seulement son animation ; planche de contrôle à chaque scène |
| ETT | Cadre de surlignage posé « à l'œil » en % : décalé de la ligne | Mesurer la boîte au pixel sur la capture (couleur de fond de la ligne), convertir en % de la carte |
| ETT | En-tête « Fiche Utopicar · en 2 secondes, sans compte » jugé inutile | Retirer les libellés de l'interface qui n'apportent rien dans la vidéo, dans la page avant capture |
| Téléphones | Fiche incrustée dans des clips Mixkit à écran vert : « trop mal foutu » (720p agrandi, carte plaquée) | Utiliser le site source capturé en HD (3×) dans une carte en code ; la vidéo de stock seulement si elle est nette en 1080×1920 |
| Vidéos d'oct. | « On en a marre de voir ta Polo » | Varier la voiture d'une vidéo à l'autre (base : Clio, 207, Fiesta, Twingo…), vérifier la génération sur la photo |
| Présentation v3 | « Je ne veux pas représenter l'interface par un simple écran… on est dans l'interface, comme dans les références » : vraie app figée dans un téléphone, blocs qui en sortent | Recoder les composants de l'app (mêmes textes, chiffres démo, jetons, polices, courbes de l'app) à l'échelle du film : l'écran entier est l'interface, chaque élément devient le suivant, paroles en grande typographie (`techniques.md` § 22) |
| Présentation v6 | « Décompose chaque élément de l'interface pour les rendre plus satisfaisants ; c'est pas grave si la vidéo est plus longue » | Chaque composant se construit pièce par pièce dans l'ordre de lecture (trait → carte → libellé → valeur sur rouleaux → barre → reflet) ; le temps vient de silences ajoutés entre les phrases (`vo-espaces.py`), jamais d'une voix ralentie ; `techniques.md` § 23 |
| Conversion | Promesses « 30 % / 40 % de conversion » | Séparer ce qui se mesure : part des spectateurs qui voient le mot-clé (≈ 30–45 % possible) et commentaires mot-clé ÷ vues (1–3 % = très bon) ; ce sont des estimations tant que les stats ne sont pas lues |

## Ce qui a marché (à reprendre)

- Oct. 2026 : MO5 « 47 € » publiée, plus de 6 000 vues, notre meilleur résultat (le meilleur carrousel : 1 000).
  Sa recette est devenue le skill `recette-47`, avec un journal des résultats à compléter après chaque publication.
- Vraie UI + curseur + surligneur sur le montant : c'est ce qui rend une démo lisible sur téléphone.
- Chiffre géant qui tranche (7 500 €, 1 450 € sous la cote) après chaque preuve.
- Phrases en deux graisses tapées lettre à lettre (léger gris → gras encre) ; aplat d'accent plein cadre au moment clé.
- Ton conversationnel adressé au spectateur (« Bon. Tu as 60 secondes ? ») sur aplat profond.
- Fenêtre inclinée en perspective + pastille flottante ; panneaux pastel par fonction (couleurs douces du site).
- Grille musicale mesurée : impacts à 0 frame des changements d'image ; silence volontaire avant le dernier acte.
- Film = fonction du temps : rendu reproductible, retouche d'un plan sans tout casser, déclinaisons par paramètres.
- Oct. 2026 : « GO / NO GO » laissait les spectateurs perdus, pros compris → verdict en verbe + conséquence en euros. Textes jugés « trop IA » → Stop Slop sur tout texte avant de le montrer. Carrousels : plus de mention « Données de démonstration » (décision de l'utilisateur).
- Oct. 2026 (MO4, 9 références « fluides ») : nos films bougeaient sur 22–40 % des images contre 81–94 % → caméra
  permanente, chaîne sans coupe, flou de bougé par sur-échantillonnage (`references/fluidite.md`). Son : bruitages
  « collés » au même niveau sur une musique à plat, jugé horrible → méthode d'ingénieur du son
  (`references/sound-design.md`). Musique : « un désastre » en synthèse ; banques libres puis morceau fourni par
  l'utilisateur, calé sur le pivot. Pixabay, ZapSplat et Sonniss sont bloqués ici : Mixkit fonctionne.
- MO5/MO6 (vidéos d'attention) : la photo réelle de l'utilisateur détourée et redessinée à la lumière ; les textes
  écrits lettre par lettre ; un compteur qui roule ; des raccords par la forme (disque → cadran, bouchon → loupe) ; une
  boucle mesurée ; une chute qui relance la première phrase. Recettes : `references/techniques.md`.
- Oct. 2026, master60 (pub « wow » de 60 s, ouvertures A débutant et B marchand, 16:9 puis 9:16). Demande de
  l'utilisateur : « du wow, des écrans qui changent, des sous-titres écrits en gros en motion », d'après prompt-motion.com.
  Les 4 MP4 sont livrés sans FAIL ; voici ce qui a marché :
  - **Image** :
    - un écran plein par idée ;
    - la réplique écrite en géant, mot par mot sur sa syllabe ;
    - flou de bougé directionnel par élément (60 s rendues en ≈ 4 min) ;
    - curseur qui joue la démo ;
    - logo animé depuis le vrai SVG.
  - **Son** : musique et bruitages ElevenLabs choisis par mesure et posés aux repères publiés par le film, drop sur
    « Hop ! ».
  - **Formats** : le 9:16 vient du même code, et le 16:9 est resté identique au pixel près.

  Recettes : `techniques.md` § 15–16, `sound-design.md` § 9.
- Oct. 2026, concept « l'analyse sort tout » : la Polo v4 validée (« ok on enregistre ça »), puis 14 vidéos produites
  en une passe (semaines du 12 et du 19 oct.). Ce qui a marché :
  - **Image** : voiture-autocollant (liseré blanc, ombre en trame, disque orange), étiquette de prix sur sa ficelle qui
    se retourne (achat → revente), étoile verte qui roule jusqu'au mot, barre UTOPICAR « tu colles l'annonce » qui
    devient « Analyse UTOPICAR ✓ », scanner qui change la photo en plan au trait, repères qui tombent sur leur mot,
    carte « Ton prix max » sur le coup final, carton « 3 analyses offertes · code TIKTOK » avec le logo.
  - **Fabrication** : un seul moteur (`semaine()` dans `film-c7/_specs.js`) et une config par vidéo ; repères
    musicaux calculés sur les mots de Simon (`build-c7.py`) ; `video/scripts/semaines.sh` mixe, rend et contrôle tout.
  - **Sujets** : peur de se faire avoir (compteur, arnaque), perte chiffrée (boîte auto, petit kilométrage), erreur de
    calcul (frais, « dernier prix »), puis la récompense ; verdicts variés (fonce, négocie, passe, prudence).

  Recettes : `techniques.md` § 17–18.
- Oct. 2026, modèle court « Top 3 » puis 14 vidéos de 15–20 s : validé après une dizaine d'itérations. Ce qui a marché :
  - **Ouverture** : petite étiquette de contexte (pour qui) + titre sur deux lignes + objet détouré qui claque, avant 0,5 s.
  - **Autodérision** : le mot drôle de la voix claque en grosse pastille qui tremble puis s'envole ; l'humour court sur
    toute la vidéo, pas seulement au début.
  - **Objet plein cadre** : photo qui zoome en continu, plaque d'identité qui se déplie (lettres qui montent, détails
    un à un, compteur qui roule), étapes chiffrées sur leur mot (barré → valeur, pastille couleur du verdict).
  - **Vraie interface** capturée en séquence d'images et rejouée dans un téléphone 3D avec curseur et clics, puis un
    tampon de verdict ; fin fixe.
  - **Mouvement continu** : marquee géant en contour, points qui dérivent, halo qui respire, traînées de vitesse,
    anneaux d'impact : 67–72 % d'images en mouvement au lieu de 37 %.

  Recettes : `techniques.md` § 19, vérifications : `qa-delivery.md` « Vérifications de fond ».
- Oct. 2026, film complet « Et la tienne ? » v4 (ETT) en grammaire pro, après recherche (prompt-motion.com, Dribbble,
  Material 3, IBM Carbon, références mesurées). Ce qui a marché :
  - **un seul objet porteur** du début à la fin : point orange → étiquette percée → zoom-éclair à travers son trou →
    Clio en 2.5D → prix qui roule → goutte « −350 € » → fiche qui naît du prix → case parmi 400 → pépite → « Ton annonce »
    → point orange (boucle parfaite, pas de carton final) ;
  - **mesures** : ouverture 86 % d'images en mouvement, à-coups 0,078 (références 0,02–0,08) ; film entier 69 %, plan
    figé max 1,07 s après poussée de caméra continue (`S(…, 0.05)`) et flottements 3D ;
  - **site source en HD** (capture 3×) dans une carte qui prend la hauteur du contenu à chaque image.

  Recettes : `techniques.md` § 20–21, `motion-pro.md`.
- Oct. 2026, P1–P5 (présentation, 5 vidéos) : la voix de base de Simon est **eleven_v4**, à vitesse d'origine
  (déjà vive ; la v3 demandait × 1,1). Faster-whisper place certains mots qui suivent un silence 0,4 à 0,7 s trop
  tard (« raté », « 1 650 ») : `video/scripts/words_snap.py` recale chaque début de mot sur l'attaque réelle de la
  voix, appliqué automatiquement par `vo-c7-pose.py`. Les repères du film s'ancrent sur le mot précédent
  (`TA(['5900', '5'], TA(['verdict']))`), jamais sur une seconde fixe : changer de prise ne casse plus le calage.
