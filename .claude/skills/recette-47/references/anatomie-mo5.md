# Anatomie de MO5 « 47 € » (la vidéo de référence)

Film final : `video/renders/9x16-mo5.mp4` (29,6 s, 1080 × 1920, 60 i/s). Planche à 0,25 s :
`video/renders/review/mo5-planche-0.25s.jpg`. Brief : `video/brief-mo5.md`. Frais sourcés : `video/docs/timeline-mo5.md`.
Code : `video/film-mo5/film.js` (image), `video/scripts/audio-mo5.py` (son), `video/audio/vo-mo5/vo-timing.json`
(voix mot à mot).

## Sommaire

1. Le scénario chiffré
2. Seconde par seconde
3. Pourquoi chaque temps fonctionne
4. Le son
5. L'image
6. Contrôle mesuré du film publié

## 1. Le scénario chiffré

Une citadine essence de 5 CV, achetée 3 500 € en Île-de-France, revente visée 5 000 €. Marge prévue : 1 500 €.

| Moment | Frais affichés (notification bancaire) | Compteur « MARGE » |
|---|---|---|
| Accumulation | Carte grise 186 · Contrôle technique 78 · Contre-visite 25 · 2 pneus 160 · Vidange 110 · Plaquettes avant 140 · Produits de nettoyage 20 · Essence, 6 visites 40 · **Kebab, après la 4e visite 12** | 1 500 → 1 314 → 1 236 → 1 211 → 1 051 → 941 → 801 → 781 → 741 → 729 |
| Attente | Assurance, 1 mois 40 · Batterie à plat 110 · Annonce remontée 32 | 729 → 689 → 579 → 547 |
| Chute | Message « 4 500 € et je la prends aujourd'hui. », virement + 4 500 € (500 de moins que prévu) | 547 → **47** |
| Renversement | Revente 4 500 − frais 950 − marge voulue 800 = **prix max 2 750 €** ; « Annonce · 3 500 € » barrée | — |

Total des frais : 953 €. Sources de chaque montant (eplaque, Ornikar, Groupama, Mecazen, Euromotor, Goodmecano) et
hypothèses déclarées : `video/docs/timeline-mo5.md`. Mention à l'écran pendant tout le récit : « Exemple · prix moyens
constatés ».

## 2. Seconde par seconde

Minutage du film final (repères du code et de `vo-timing.json`).

| t (s) | Image | Voix | Son |
|---|---|---|---|
| 0,0 | Image 0 déjà composée : « 5 000 − 3 500 » en Clash géant, pièces floues qui brillent au fond. Le trait de lumière écrit « 1 500 € », puis le « ? » en Fraunces orange (1,3 s). | « Tu l'achètes 3 500, » (0,08) « tu la revends 5 000. » (1,42) | musique dès l'image 0 |
| 2,1 | Une notification « Carte grise · − 186 € » arrive par la droite et percute le calcul, qui tremble. | « Ton compte en banque n'est pas d'accord. » (2,55-3,75) | vibration, choc |
| 4,0 | Le calcul s'efface vers le haut ; « 1 500 € » devient le compteur à rouleaux « MARGE » (y = 300). Palettes « JOUR 1 » en verre. | « Jour 1, » (4,25) « tu l'achètes. » (4,95) | palettes, clés |
| 4,85 | La voiture (la Polo de l'utilisateur, détourée) entre par la droite et freine ; son contour se trace à la lumière (5,6-6,4). | | moteur léger |
| 6,0 → 11,65 | 9 débits, un par temps : 6,0 · 6,8 · 7,3 · 7,81 · 8,23 · 8,74 · 9,45 · 9,95 · 11,65. Chaque notification joue sa vidéo Mixkit (signature, pont élévateur, pneu, moteur, éponge, pompe, route de nuit), s'empile, et colle une étiquette de prix sur la voiture. Le kebab arrive seul, plus tard, plus petit. | « Carte grise, » (6,05) « contrôle technique, pneus, vidange, plaquettes. » (6,8-9,4) « Et six allers-retours pour des visites. » (9,6-11,5) | un choc de débit par temps |
| 12,0 | La nuit tombe (voile bleu, vidéo de nuit floutée derrière). Palettes J+1 qui accélèrent jusqu'à J+23. « Toujours en vente. *Zéro appel.* » | « Et là, » (12,35) « personne n'appelle. » (13,2) | basse coupée, son assombri, palettes |
| 13,1 · 14,0 · 14,8 | Débits de l'attente sous le calendrier : assurance, batterie, annonce remontée. Compteur 547 €. | | |
| 15,7 | Le téléphone vibre ; bulle de verre : « 4 500 € et je la prends *aujourd'hui.* » | « Il négocie. » (16,0) « Tu acceptes. » (16,75) | vibration, la basse revient |
| 17,3 | Notification « Virement reçu · + 4 500,00 € » (montant en orange clair). | « Bénéfice, » (17,55) | |
| 18,1 → 18,9 | Le compteur roule 547 → 47 et se fond dans un « 47 € » géant (430 px, relief) ; tout le reste s'assombrit. | « 47 euros. » (18,6) | arrêt de bande à 18,65, silence |
| 19,9 | « *Même pas un plein.* » s'écrit à la lumière sous le 47. | « Même pas un plein. » (19,9-20,6) | |
| 20,9 → 22,3 | Rembobinage : lignes de balayage, le récit repart à l'envers jusqu'à la voiture garée sans étiquettes ; le compteur remonte 47 → 1 500. | « Ceux qui gagnent font le calcul à l'envers. » (21,0-22,8) | souffle inversé, la musique repart sur le temps à 22,0 |
| 22,3 | Fond chaud, carte de verre. La formule s'écrit ligne par ligne : Revente 4 500 · − frais 950 · − marge voulue 800. Le trait de total se trace (23,75), « *prix max* 2 750 € » (24,0), éclair. | « Ton prix max, » (23,0) « 2 750. » (24,0) | les chiffres claquent |
| 25,5 | « Annonce · 3 500 € » glisse dessous et se barre d'un trait orange (26,0). « À 3 500, tu *passes ton tour.* » | « À 3 500, » (25,6) « tu passes ton tour. » (26,55) | |
| 27,45 | Retour : la formule s'efface, le calcul de l'image 0 revient dans le même cadre. | « La prochaine fois que tu te dis… » (27,9-29,5) | la musique boucle sur la mesure |
| 29,6 | = image 0 | → « Tu l'achètes 3 500… » | |

## 3. Pourquoi chaque temps fonctionne

| Temps | Ressort | Ce qu'un nouvel épisode doit retrouver |
|---|---|---|
| Ouverture | Il entend **son** calcul, mot pour mot, avec ses chiffres. La contradiction vient d'un objet familier, avec humour, sans explication : la question « pourquoi ? » s'ouvre. | Un calcul ou un plan que la cible fait vraiment, deux chiffres ronds, un contradicteur du quotidien, aucun « parce que ». |
| Jour 1 | Une seconde de joie : on lui laisse croire qu'il a gagné. Plus l'élan est haut, plus la chute fait mal. | Le moment où il se croit gagnant. |
| Accumulation | Le geste qu'il connaît par cœur (la notification de débit) devient spectacle ; le rythme régulier crée l'angoisse ; le gag casse la tension et se partage. | 6 à 9 coups concrets, chiffrés, un par temps ; un gag vrai et petit. |
| Attente | Le silence après le bruit. Le temps qui passe coûte encore. | Un temps vide, qui coûte. |
| Chute | Le chiffre final, énorme et ridicule, puis une comparaison de tous les jours. C'est la phrase qu'on répète au pote. | Un chiffre final qui fait rire jaune, une comparaison concrète en moins de cinq mots. |
| Renversement | Le soulagement : il existe une méthode, et elle tient en trois lignes appliquées au même exemple. On l'enregistre pour la ressortir. | La méthode du pro, appliquée aux mêmes chiffres, avec un verdict net. |
| Boucle | La dernière phrase commence la première : au deuxième passage, il lit « 1 500 € ? » autrement, et il relit les notifications trop rapides. | Une demi-phrase qui enchaîne sur l'ouverture ; image finale = image 0. |

## 4. Le son

- **Voix** : Simon (ElevenLabs `eleven_v3`, voix `mvhJVdVoTWVUtL4keT7W`), pince-sans-rire, le pote qui en a revendu
  cinquante et qui te raconte ta première. Prise B, accélérée de 10 % (`atempo`). Minutage mot à mot par transcription
  locale, chaque réplique placée sur son geste (`vo-timing.json`). Chaque réplique ramenée au même niveau (± 6 dB).
- **Musique** : « Controlled Drop » (morceau fourni par l'utilisateur, `video/audio/music/`), recalé de 123,05 à
  120 BPM (une mesure = 2,000 s). Mesure 13 du morceau de 0 à 18,65 s ; basse retirée et son passé sous 1 400 Hz de
  12,4 à 15,5 s (l'attente) ; arrêt de bande en 0,22 s sur « 47 » ; silence ; 0,9 s du passage suivant à l'envers qui
  monte jusqu'au temps de 22,0 s ; mesure 55 jusqu'à la fin, fondu de boucle.
- **Bruitages** : Mixkit (licence libre), banque `video/audio/bank/mo5/`. Un son principal à la fois : 49 placés,
  16 retirés parce qu'ils tombaient à moins de 0,12 s d'un son plus important.
- **Mix** : ducking par bande sous la voix, −14,3 LUFS intégrés, true peak −3,5 dBTP mesuré sur le MP4, 48 % de
  l'énergie sous 150 Hz (contrôle téléphone OK). Niveaux par temps : hook −15,8 dBFS, pluie −17,5, attente −18,7,
  47 −15,8, formule −16,1. Rapport : `video/docs/mix_report-mo5.txt`.

## 5. L'image

- **Charte** : fond #08070a → #17100b ; orange #ff5a1f, #ff8a4c, #ffb38a, seule couleur d'accent ; encre #f6efe7, gris
  #a59a90. Clash Display pour les chiffres et les titres, Satoshi pour l'interface, Fraunces italique en dégradé
  orange pour le mot qui porte la phrase (« Zéro appel. », « aujourd'hui. », « Même pas un plein. », « prix max »,
  « passes ton tour. »).
- **Matières** : verre dépoli (`backdrop-filter: blur(26px) saturate(1.5)`, reflet en biais) pour les notifications,
  les cellules du compteur, les palettes, la bulle et la carte de la formule ; lueurs orange derrière les chiffres ;
  grain et vignettage.
- **La voiture** : photo réelle détourée (BiRefNet, `motion-studio/scripts/cutout.py`), ombre et reflet au sol, contour
  vectoriel tracé à la lumière (`video/film-mo5da/polo-contour.js`), 13 étiquettes de papier posées aux coordonnées du
  tableau `TAGS`.
- **Caméra** : une seule prise, jamais immobile ; quatre caméras enchaînées (A sur le calcul, B le long des palettes,
  C qui suit la voiture et la pile, F en orbite sur la formule), chaque axe suivi par `track()` avec ressorts fermés,
  bruit déterministe. Profondeur de champ par flou des couches éloignées.
- **Temps du récit** : `story(t)` distinct du temps du film, pour rembobiner proprement (20,9 → 22,3 s, du récit
  18,6 s au récit 5,9 s).
- **Flou de bougé** : `window.shutter` / `window.samples` (MB = 4 au rendu).
- **Vidéos réelles** : Mixkit, extraites en séquences JPG à 30 i/s et peintes sur canvas, lues en aller-retour
  (`drawSeq`). Liste des numéros Mixkit dans `video/docs/timeline-mo5.md`. Les séquences ne sont pas versionnées
  (`film-mo5da/seq/`, ignoré) : `motion-studio/scripts/mixkit.py get` les retélécharge.

## 6. Contrôle mesuré du film publié

`video/renders/qa/9x16-mo5-qa.md` : H.264 yuv420p 60 i/s, première image pleine, aucune image vide, aucun plan figé
de plus de 0,9 s, −14,3 LUFS, −3,5 dBTP, son présent dès les 2 premières secondes. Avertissement zones sûres (non
bloquant) : la voiture et ses étiquettes descendent dans la zone basse de 5,5 à 18,75 s, la pile de notifications
touche la marge droite. Les étiquettes de prix sont du texte : un épisode suivant les garde au-dessus de y = 1480.
