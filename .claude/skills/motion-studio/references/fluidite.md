# Fluidité : ce qui fait un motion « fluide » (mesuré sur 9 pubs de référence, oct. 2026)

Source : `video/docs/ref_motion_fluide.md` ; mesure : `scripts/ref-motion.py` (flux optique image par image).
Toujours mesurer nos rendus avec le même outil que les références, et comparer les chiffres.

| Mesure | Pubs fluides (9:16) | Nos anciens films | Cible |
|---|---|---|---|
| images en mouvement | 81–94 % | 22–40 % | ≥ 60 %, idéalement ≥ 80 % |
| plus longue pause | 0,5–1,5 s | 2,1–3,5 s | ≤ 1 s, hors plan final |
| à-coups (variation de vitesse) | 0,09–0,10 | 0,14–0,26 | ≤ 0,10 |
| flou de bougé (netteté au pic de vitesse ÷ netteté posée) | 0,22–0,49 | 0,71–0,95 | ≤ 0,55 |

## Les 7 règles

1. **Ça bouge tout le temps** : une caméra 3D qui ne s'arrête jamais. Orbite lente permanente, plus un travelling par
   scène : poussée sur l'accroche, glissé le long d'une liste, gros plan puis recul quand le contenu grandit.
2. **Pas de pause** de plus d'une seconde, sauf le plan final, qui bouge quand même (poussée lente).
3. **Les mouvements se passent le relais** : le suivant démarre avant que le précédent s'arrête. Les springs lents
   (f ≈ 0,3 Hz) lancés en avance donnent un mouvement continu.
4. **Une chaîne sans coupe** : chaque objet devient le suivant (annonce → champ → bouton → fiche → prix → point).
5. **Flou de bougé réel** : sur-échantillonnage temporel au rendu, sans flou CSS. Le film déclare `window.shutter(t)`
   (180° partout, 360° sur les gestes rapides) et `window.samples(t)` (4 sous-images, 8 sur les gestes rapides) ;
   `render.mjs` avec `MB=8`.
6. **Pointes de vitesse courtes et fortes**, montée en 0,1 à 0,3 s, retombée douce.
7. **On ne voit jamais une coupe** : un flash, un flou de vitesse ou un zoom à travers un élément.

## Pièges réels

- **Le fond uni ne porte aucun mouvement** : seul le contenu texturé compte, à l'œil comme à la mesure. Remplir l'image
  de contenu, ou faire bouger ce qui est là.
- **L'orbite de caméra pousse le texte hors des zones sûres** : réduire l'échelle de 5 % et garder une amplitude
  horizontale ≤ 8 px. Une ligne de 732 px ne se zoome pas au-delà de ×1,09 dans la colonne 140 → 940.
- **`filter: blur()` sur un grand calque 3D coûte 2 s par image** en rendu logiciel : utiliser l'opacité.
- **Grandes ombres floues (box-shadow 120 px) coûteuses** : le site n'en a pas sur `.carte`, ne pas en ajouter.
- **Rendu lent** : capture PNG rapide via CDP (`optimizeForSpeed`), 3 morceaux en parallèle (`PARTS=3 PART=i`, puis
  `--assemble`), brouillon 540p mesuré avant le rendu final (≈ 8 min contre 25 min).
- **Couverture** : choisir une image sans le doigt ni un élément qui cache le titre.
