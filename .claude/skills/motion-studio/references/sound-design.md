# Sound design et mixage d'une pub motion (méthode d'ingénieur du son)

Le sound design, c'est faire entendre ce que l'image fait : chaque geste, chaque changement d'état, chaque mouvement
de caméra a un son à sa place, et la musique porte l'émotion sans jamais couvrir l'action. Le spectateur ne doit
entendre ni collision, ni trou, ni bouillie. Ce fichier vient d'une erreur réelle (MO4) : de bons sons collés au
même niveau, en même temps, sur une musique à plat. Le résultat était jugé « horrible ».

Script de référence : `video/scripts/audio-mo4-sd.py`.

## 1. La musique : choisir, couper, caler

- **Analyser tout le morceau, mesure par mesure** : énergie, grave (< 200 Hz), aigu. Chercher la forme qui sert le
  film : montée → coupure (la basse disparaît) → drop.
- **Prendre un passage continu** qui suit déjà l'histoire, plutôt qu'un collage. S'il faut coller, couper sur un
  premier temps de mesure, fondu de 10 à 30 ms.
- **Ramener le tempo sur la grille du montage** (étirement ≤ 3 %, sinon ça s'entend). À 120 BPM, 1 mesure = 2 s.
- **Poser le drop sur le pivot de l'image** (la révélation), recalé sur l'attaque réelle (onset), pas sur le temps
  théorique.
- **Accroche** : la musique doit déjà vivre à 0 s (énergie présente dans la première seconde, pas d'intro muette).

## 2. Le repérage (spotting)

Tableau temps → son → rôle → priorité, fait sur l'image, pas sur la musique :

| Rôle | Exemples | Crête visée | Bande | Priorité |
|---|---|---|---|---|
| accent | impact du pivot, prix qui sort, logo | −3 dBFS | 40 Hz–16 kHz | 1 |
| interface | toucher, clic, collage | −9 dBFS | 400 Hz–14 kHz | 1 ou 2 |
| carillon | coches, validation | −12 dBFS | 500 Hz–12 kHz | 2 |
| transition | souffle d'un mouvement de caméra | −13 dBFS | 250 Hz–9 kHz | 2 |
| ornement | traînée, scintillement | −16 dBFS | 1,5–15 kHz | 2 |
| tic | apparition de texte, ligne | −22 dBFS | 1,5–12 kHz | 3 |

Règles de placement :
- **Un clic sur un clic** : l'attaque du son (silence de tête retiré) sur l'image du contact.
- **Un souffle par mouvement de caméra** : le pic d'énergie du souffle sur le pic de vitesse, mesuré sur le rendu
  (`ref-motion.py`), et pas plus long que le mouvement.
- **Pas de son pour tout** : les mots qui apparaissent n'ont pas tous un tic. La musique porte le texte.
- **Une même famille de sons pour une même action**. Les coches gardent le même son, qui monte d'un ton à chaque fois
  (+0, +2, +4, +7 demi-tons) : c'est musical et lisible.

## 3. Pas de collision

- **Un seul son principal à la fois** : un son moins prioritaire qui tombe à moins de 0,12 s d'un plus prioritaire
  est supprimé, sans être juste baissé.
- **Chaque son raccourci à sa durée utile, avec un fondu de sortie**, pour qu'aucune traîne ne déborde sur l'action
  suivante.
- **Chaque son filtré dans sa bande** (tableau ci-dessus) : les souffles laissent le grave aux impacts et l'aigu aux
  clics.
- **Panoramique** léger selon la position à l'écran (± 0,25), jamais extrême sur téléphone.

## 4. La musique cède la place, par bandes

- **Ducking par bandes, pas de baisse globale** :
  - grave (< 180 Hz) baissé jusqu'à −9 dB sous les impacts ;
  - présence (1,5–6 kHz) baissée jusqu'à −7 dB sous les clics, coches et souffles ;
  - attaque 4 ms, relâchement 160 à 250 ms.
- **Courbe de mise en scène** (volume et filtre passe-bas automatisés) :
  - tension : étouffée, de −8 à −4 dB, filtre qui s'ouvre de 2 à 9 kHz ;
  - 0,1 s de vide juste avant le pivot ;
  - élan : pleine bande ;
  - léger creux avant le second temps fort ;
  - en retrait pendant un moment « bruitage solo » (traînée, logo) ;
  - fondu de fin vers la boucle.
- **Musique 4 dB sous les bruitages** au niveau du bus. Réglage de départ, à ajuster à l'écoute.

## 5. Cohésion et master

- **Une réverbération courte commune** (≈ 0,45 s, −15 dB) sur tous les bruitages : ils sonnent dans la même pièce.
- **Compression de bus douce** (1,8:1), puis −14 LUFS intégrés et plafond −3,5 dBTP (l'AAC ajoute jusqu'à 2 dB).
- **Livrer les pistes séparées** : musique, bruitages, mix.

## 6. Vérifier (aucun « à l'oreille » seul)

- **Calage sur la vidéo encodée** : attaques mesurées (onset) aux temps des actions ; écart ≤ 3 images à 60 i/s.
- **Niveaux par passage** (RMS) : tension < élan, vide nettement plus bas, ornement jamais plus fort que l'élan.
- **`qa_video.py`** : loudness, true peak, son dès 0 s, équilibre pour haut-parleur de téléphone.
- **Toujours une version sans musique** (bruitages seuls) pour juger le sound design nu.
- **Dire franchement** que le son est mesuré et pas écouté, quand c'est le cas.

## 7. Banques de sons

- Mixkit (licence Mixkit, usage commercial libre) : accessible depuis cet environnement.
- Pixabay, ZapSplat, Sonniss, Freesound : bloqués par la politique réseau de l'environnement (403). Ne pas contourner :
  demander les fichiers à l'utilisateur.
- Musique fournie par l'utilisateur ou générée avec Suno (prompt type : `video/docs/prompt-suno-mo4.md`).

## 8. Voix off au milieu du sound design (MO5)

Script de référence : `video/scripts/audio-mo5.py`.
- **La voix d'abord** : chaque réplique ramenée au même niveau (± 6 dB max), présence 2–5 kHz légèrement remontée.
- **La musique cède à la voix par bandes** : présence −10 dB et niveau global −8 dB pendant chaque réplique. Contrôle
  mesuré : écart voix/musique par réplique, minimum ≥ 4 dB, médiane ≈ 10 dB.
- **Gestes musicaux de montage** :
  - arrêt de bande (le morceau ralentit et s'éteint en 0,22 s) sur la chute ;
  - souffle inversé (0,9 s à l'envers) qui remonte jusqu'au premier temps de la reprise ;
  - automation qui retire basse et aigus pendant un passage d'attente.
- **Familles de notes** : chaque débit joue une note plus grave que le précédent, le gag une note plus haute.
- **Sons fabriqués quand la banque n'a pas le bon** :
  - moteur léger à régime variable (`varrate`, +3 demi-tons, passe-haut 150 Hz, panoramique droite → centre, pic à
    l'arrivée) ;
  - vibration de téléphone synthétisée ;
  - tic-tac qui accélère.
- **Master** : limiteur à anticipation (4 ms) avant la normalisation à −14 LUFS (sans lui, les transitoires laissaient
  le mix à −18,9 LUFS) ; musique −9 dB sous 150 Hz et passe-haut 45 Hz pour le téléphone.
