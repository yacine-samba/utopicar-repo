# Motion studio rules

## Contrat de rendu
- Chaque film est une fonction pure du temps : window.seek(t) peint la frame t.
- Aucun CSS transition, setTimeout, requestAnimationFrame ou état conservé entre les frames en mode rendu.
- Utiliser un bruit déterministe avec une seed, jamais Math.random().
- Ne pas utiliser will-change, translate3d ou translateZ(0).
- Encoder en H.264 yuv420p avec CRF 16.

## Mouvement
- Utiliser des springs fermés depuis lib/motion.js.
- Toute valeur qui possède plusieurs cibles doit utiliser track().
- Utiliser snappy pour boutons et indicateurs, default pour cartes et conteneurs,
  heavy pour gros textes et logos, playful uniquement pour les mascottes.
- Pas de rebond visible sur la typographie.
- Un texte dans un conteneur morphing entre après le début du morphing et sort avant le suivant.
- Une simple opacité ne doit jamais être l'unique animation d'entrée ou de sortie.

## Direction artistique interdite
- Titre centré sur un dégradé.
- Tout qui apparaît par fondu.
- Étiquettes dans les coins et bordures décoratives.
- Glow sur les éléments d'interface.
- Particules génériques.
- Crossfades entre scènes.
- Spins, glitches et light leaks sans raison narrative.
- Temps mort.

## Marque
- Une police display et une police UI.
- Une seule couleur d'accent sauf justification du brief.
- Utiliser le vrai produit, les vrais logos et les vraies polices.
- Ne jamais redessiner une interface existante à partir de l'imagination.
- Quelque chose de nouveau doit apparaître toutes les 2 à 4 secondes.

## Son
- Utiliser la grille mesurée dans beats.json.
- Placer les impacts sur les beats et les grands moments sur les downbeats.
- Cible de mix : -14 LUFS, true peak inférieur ou égal à -1 dBTP.

## Contrôle qualité
1. Générer une contact sheet avec une image par beat et la regarder réellement.
2. Tester les frames sur une largeur de 360 px.
3. Noter le hook, la lisibilité, le mouvement, la variété, la marque et la synchro sonore.
4. Corriger les trois problèmes les plus importants.
5. Recommencer au moins trois fois et ne livrer que si tous les scores sont à 8 ou plus.
6. Mesurer chaque MP4 livré avec `.claude/skills/motion-studio/scripts/qa_video.py` : zones sûres, première image,
   images vides, plans figés, loudness et true peak du fichier encodé (l'AAC ajoute jusqu'à 2 dB : masteriser à
   −3,5 dBTP), son des 2 premières secondes, équilibre pour haut-parleur de téléphone. Un FAIL bloque la livraison.

## Spécifique UTOPICAR
- L'UI filmée est le vrai fichier assets/site/utopicar-live.html, chargé dans Chromium
  avec une fausse base démo (window.claude mocké). Aucune donnée réelle du parc.
- Les chiffres affichés sont ceux que calcule l'outil lui-même à partir des données démo.
- Pas de logo Leboncoin, La Centrale ou autre plateforme à l'écran.
- Zones sûres en 1080x1920 (union TikTok / Reels / Shorts) : rien d'important dans les 220 px du haut,
  les 440 px du bas, les 140 px de droite et les 60 px de gauche. Square : 60 px partout. Desktop : 96 × 54 px, bas 108 px.
- Chiffres démo dans une pub : mention « Données de démonstration » à l'écran.
- Processus complet (brief, script, voix, A/B, langues, formats, livraison) : skill `/motion-studio`.
