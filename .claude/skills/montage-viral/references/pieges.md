# Pièges déjà payés (montage Henritokane, oct. 2026)

- **La vidéo de qui ?** Monté comme l'histoire du témoin → refait. Le compte qui publie parle à l'écran.
- **Le style demandé, pas celui de la maison** : « pas le style de UTOPICAR » ; la référence s'analyse image par image
  (0,05 s) et au son avant de restyler. « Respecte beaucoup plus la ref » : intercalaires, carte vidéo, bruitages.
- **« Spin design »** = sound design.
- **Interface jamais visible** : seule la zone caméra (Loom, visio) est gardée.
- **Accroche sur la tête** : en plan serré la tête est haute ; l'accroche « haut » passe en plan moyen, sinon « bas ».
- **Nom posé sur la carte vidéo** : illisible ; la légende va sur la trame au-dessus de la carte.
- **Mot fort qui déborde** sur la pastille du chapitre suivant (corrigé dans le moteur) ou sur un intercalaire.
- **Carte qui couvre celui qui parle** : forcer `cote` du panneau.
- **Carte vide** au début (texte qui n'arrive qu'au mot) : démarrer la carte juste avant le mot (`depuis`).
- **Polices** : les polices intégrées d'HyperFrames (League Gothic, Inter) ne s'injectent pas : Impact via
  `local("Impact")`, Satoshi et Instrument Serif en woff2 (assets/fonts). Clash Display perd l'approche des paires
  quand les lettres sont animées une à une.
- **Console Windows** : caractères ≥ → font planter un print ; les scripts forcent l'UTF-8.
- **Fonction `projet()`** dans un script qui importe `projet` : conflit de nom (renommée `dossier_projet`).
- **Envoi à distance** : fichiers de plus de 30 Mo non reçus sur téléphone.
- **Rendu relancé** : tuer les anciens processus `hyperframes render` avant (ils écrivent au même endroit).

## Style v4 utopicar (« 4 000 € » v4 et 13 vidéos de 10 s, 29 oct. 2026)

- **Mesurer le texte, pas son bloc** : un gros chiffre mis à l'échelle sur son bloc de 800 px débordait, et le masque
  du bloc coupait le « € ». Mesurer un `span` en `inline-block`, marges de la capsule comprises.
- **Détourage sale** : `remove-background` garde la poignée du plafond, semi-transparente, collée aux cheveux ; elle
  passait devant le texte « derrière la tête ». `detour_propre.py` avant tout.
- **Pastille trop large** : un nom en `display: block` prend la largeur de son conteneur ; `width: max-content`, et la
  capsule épouse le nom affiché ; les noms et chiffres hors affichage passent en `visibility: hidden` (sinon
  `hyperframes check` mesure leur contraste sur la vidéo).
- **Sous-titres sur deux lignes avec un mot seul** : la largeur se mesure dans Chromium (`mesure_texte.js`) et le
  découpage se fait par phrase sur des coûts (syntaxe, durée, mots) ; deux lignes seulement quand un groupe resterait
  moins de 20 images.
- **Mots perdus sous une couleur pleine** : elle ne cache que ses mots ; les autres s'affichent à la réouverture.
- **Accroche et pastille au même endroit** : l'accroche sort avant que la pastille entre.
- **Carte de fin vide sur sa première image** : le masque part de la position mesurée du logo.
- **Coup sourd inaudible au téléphone** (−35 dB au test passe-haut 800 Hz) : couche d'harmoniques + corps médium court
  qui finit avant le premier mot.
- **`pkill -f` tue le shell** de la session : arrêter un processus par son PID.
- **Trois images noires à la fin** d'une vidéo sans carte de fin : le dernier plan doit tenir jusqu'à la dernière
  image (`gen4.py` l'allonge de la queue) ; le contrôle à 4 i/s ne le voit pas, regarder la dernière image.
