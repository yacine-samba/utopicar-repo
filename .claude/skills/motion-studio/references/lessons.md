# Leçons des films UTOPICAR v1 → v6

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

## Ce qui a marché (à reprendre)

- Vraie UI + curseur + surligneur sur le montant : c'est ce qui rend une démo lisible sur téléphone.
- Chiffre géant qui tranche (7 500 €, 1 450 € sous la cote) après chaque preuve.
- Phrases en deux graisses tapées lettre à lettre (léger gris → gras encre) ; aplat d'accent plein cadre au moment clé.
- Ton conversationnel adressé au spectateur (« Bon. Tu as 60 secondes ? ») sur aplat profond.
- Fenêtre inclinée en perspective + pastille flottante ; panneaux pastel par fonction (couleurs douces du site).
- Grille musicale mesurée : impacts à 0 frame des changements d'image ; silence volontaire avant le dernier acte.
- Film = fonction du temps : rendu reproductible, retouche d'un plan sans tout casser, déclinaisons par paramètres.
