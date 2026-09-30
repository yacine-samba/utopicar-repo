# Critique, contrôle et livraison (phases 6 et 7)

## Un round de critique

Sur le **MP4 réellement encodé** (jamais seulement sur la page) :
1. `CUT=<projet> python3 video/scripts/review.py <round>` → planche 2 img/s, bande de 12 frames autour du mouvement le
   plus rapide, test à 360 px sur les `reviewKeys`, jonction de boucle, liste des plans figés. **Regarder** ces images.
2. `python3 .claude/skills/motion-studio/scripts/qa_video.py renders/<fichier>.mp4 --out renders/qa --intentional <pauses voulues>`
   → rapport de mesures + planche des zones interdites en rouge. Chaque WARN se tranche en regardant la planche :
   texte, logo ou CTA dans le rouge = FAIL.
3. Planche à 4 img/s sur tout le film pour la lecture fine (`ffmpeg … fps=4,scale=216:384,tile=10x6`).
4. Noter, corriger les **trois** problèmes les plus graves, recommencer. Minimum trois rounds.

## Grille de notes (sur 10, livrable si tout ≥ 8 et aucun FAIL)

| Critère | 8 veut dire |
|---|---|
| Hook (0–3 s) | Image 0 pleine, son qui attaque, promesse ou douleur comprise en 3 s, sur les deux ouvertures |
| Clarté du message | On sait pour qui, quoi, pourquoi agir ; promesse dite ; une idée par plan |
| Lisibilité à 360 px | Chaque texte, chiffre et CTA lisible sur la planche téléphone ; UI zoomée sur ce qui compte |
| Zones sûres | Aucun texte, logo, CTA dans les zones interdites de chaque format (mesuré) |
| Mouvement | Springs justes, aucun fondu seul, aucun plan figé non voulu, aucune image vide à la coupe |
| Variété / rythme | Nouveauté toutes les 2–4 s, pas de structure répétée à l'identique |
| Marque | Vrai logo lisible sur chaque fond, un seul accent, typo de la marque, vraie UI |
| Voix | Débit dans le budget, prononciation juste, énergie dès la première syllabe, adaptée dans chaque langue |
| Son | −14 ±1 LUFS et ≤ −1 dBTP sur le MP4, attaque à 0 s, équilibre téléphone, voix devant, synchro ≤ 1 frame |
| Conformité | Mention « Données de démonstration » si chiffres démo, aucune plateforme tierce, aucun élément de la référence |
| Formats | Chaque format recomposé (pas recadré), rien de coupé, sous-titres dans leur zone |

Consigne chaque round dans `video/docs/review_log.md` (tableau des notes + constats chiffrés + corrections).

## Matrice de livraison

2 ouvertures × 2 langues × formats demandés. Pour 3 formats : 12 MP4.
```
renders/<projet>/
  <projet>_<A|B>_<fr|en>_<9x16|1x1|16x9>_<durée>s_v<N>.mp4   H.264 yuv420p CRF 16, AAC 256 k 48 kHz, 30 i/s
  <projet>_<A|B>_<fr|en>_<format>_poster.png                  image de couverture (hook ou carton, jamais une image vide)
  <projet>_<A|B>_<fr|en>.srt                                  sous-titres de la voix
  audio/<projet>_vo_<fr|en>.wav, <projet>_music.wav, <projet>_mix_<fr|en>.wav
  qa/<fichier>-qa.md, qa/<fichier>-safe.png                   mesures de chaque fichier
```
Plus : `docs/<projet>_style_guide.md`, `docs/<projet>_shotlist.md`, script bilingue, journal de critique.

Ordre de rendu conseillé : un montage 540p (vertical, langue 1, A) pour la porte 4 → finaux vertical A/B langue 1 →
langue 2 → square → desktop. Lancer les rendus longs en arrière-plan et avancer sur autre chose.

## Git et envoi

- Branche de travail désignée ; commits clairs ; ne jamais committer un MP4 en cours d'écriture (attendre la fin du
  rendu) ; `refs/`, WAV intermédiaires, `node_modules` et images de travail hors dépôt.
- Aucun identifiant de modèle dans les commits, PR ou fichiers.
- Envoi à l'utilisateur : fichiers ≤ 30 Mo directement ; au-delà, un aperçu compressé (CRF 26, 720p) + le chemin du
  fichier complet dans le dépôt.
- Message final : ce qui est livré (liste), chiffres mesurés (LUFS, dBTP, durée, poids), notes finales, ce qui n'a pas
  été vérifié (ex. son écouté ou non), métriques à suivre pour l'A/B, et 2–3 pistes d'amélioration honnêtes.
