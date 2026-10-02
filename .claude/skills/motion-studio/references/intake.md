# Questionnaire de brief (phase 1)

À poser **à chaque nouveau film**, même quand la réponse paraît évidente : le contexte d'une pub TikTok, d'une démo
de site et d'un film de lancement n'a rien à voir, et une mauvaise hypothèse coûte des heures de rendu.
Pose-les avec `AskUserQuestion` (4 questions max par appel), en mettant la réponse la plus probable en premier avec
« (Recommandé) ». L'utilisateur peut toujours répondre « Autre » en texte libre.

Avant de poser une question, regarde si la réponse est déjà dans la conversation, dans un brief précédent ou dans
`utopicar.md`. Si oui, propose-la comme option recommandée plutôt que de la reposer à vide.

## Appel 1 — Contexte

| # | Question | Options (la première = recommandée si rien ne dit le contraire) |
|---|---|---|
| 1 | Pour quel produit ou quelle marque est ce film ? | UTOPICAR Garage (pack de marque prêt) · Un autre produit (lien à donner) · UtopicLabs |
| 2 | À quoi va servir ce film ? | Pub payante TikTok / Meta · Contenu organique réseaux · Démo sur le site / la landing · Annonce de lancement |
| 3 | Qui doit se reconnaître dedans ? | Acheteurs-revendeurs particuliers · Marchands VO / garages pros · Grand public automobile · Autre public |
| 4 | Quelle action veux-tu déclencher ? | Commenter un mot-clé (ex. GARAGE) · Cliquer le lien en bio · S'inscrire / télécharger · Aucune (notoriété) |

## Appel 2 — La demande

| # | Question | Options |
|---|---|---|
| 5 | Quel type de film ? | Pub courte à hook · Explainer produit · Film de lancement cinématique · Teaser |
| 6 | Quelle durée ? | 30 s (idéal pub in-feed, 21–34 s) · 15 s · 45–60 s (version longue) · 6 s (bumper) |
| 7 | As-tu une référence de style ? | Oui, je donne un lien ou un fichier · Style maison UTOPICAR · Pas de référence : propose-moi une direction originale · Je décris ce que je veux |
| 8 | Que faut-il prouver à l'écran ? (multiSelect) | Analyser une annonce · Recherche en direct · Rapports · Parc et tableau de bord |

Pour un autre produit que UTOPICAR, remplace la question 8 par « Quelles 2–3 fonctions ou preuves montrer ? » en
texte libre, et demande l'URL et l'accès à l'interface réelle.

## Appel 3 — Voix

| # | Question | Options |
|---|---|---|
| 9 | Voix off ? | Oui, voix professionnelle (Recommandé : TikTok se regarde avec le son) · Non, textes à l'écran seulement · Ma propre voix (j'enregistre) |
| 10 | Quelles deux langues ? | Français + anglais · Français + espagnol · Français + arabe · Français + portugais |
| 11 | Quel type de voix ? | Jeune et directe (réseaux) · Posée et experte · Féminine dynamique · Grave et premium |
| 12 | Quel registre ? | Tutoiement direct · Vouvoiement professionnel · Humour léger · Sérieux, factuel |
| 12b | Quel degré d'humain ? | Voix incarnée : un personnage qui réagit, rit, chuchote · Présence à l'écran (mains, visage, captations) · Narration posée |

Si « Non » à la question 9, saute 11 et garde 10 (les textes à l'écran sont traduits) et 12 (ton des textes).
Pour la voix, précise ensuite âge approximatif, genre, accent (France, Québec, neutre…), débit ; ce sont les filtres
de `creative_list_voices`.

## Appel 4 — Écriture, son, déclinaisons

| # | Question | Options |
|---|---|---|
| 13 | Le script ? | Tu l'écris, je valide · J'ai déjà un script · On part de mes points clés |
| 14 | La musique ? | Musique originale générée (ElevenLabs Music, instrumentale) · Synthèse en code (100 % maîtrisée, plus simple) · J'ai une musique sous licence · Pas de musique |
| 15 | Les ouvertures ? | 2 ouvertures A/B (problème vécu vs chiffre choc) · 3 ouvertures A/B/C (gros hooks à tester) · Question directe vs démo immédiate · Je choisis les angles |
| 16 | Quels formats ? (multiSelect) | Vertical 9:16 · Square 1:1 · Desktop 16:9 · (option) Feed 4:5 |

## En texte libre, si ce n'est pas déjà connu

- Lien du produit et accès à l'interface réelle (ou fichier HTML à charger).
- **Fichier source du logo** (SVG ou PNG haute définition) — ne jamais le redessiner si le fichier peut être fourni.
- Offre, prix, mot-clé du CTA, promesse autorisée (ce qu'on a le droit d'affirmer).
- Chiffres : démo (avec mention à l'écran) ou réels (vérifiables, avec accord) ?
- Date de diffusion, budget de crédits ElevenLabs acceptable.

## Valeurs par défaut (si l'utilisateur dit « comme d'hab » ou « OK »)

UTOPICAR · pub TikTok payante · acheteurs-revendeurs · CTA « Commente GARAGE » · pub courte à hook · 30 s (+ version
60 s si demandée) · style maison · preuves : analyser + recherche + tableau de bord · voix pro · FR + EN · jeune et
directe · tutoiement · je rédige · musique ElevenLabs instrumentale · ouvertures « problème » vs « chiffre choc » ·
Vertical + Square + Desktop · données démo avec mention.

## Modèle de brief (`video/brief-<projet>.md`)

```markdown
# Brief — <projet>
Produit / URL :            Objectif :             Plateforme(s) :
Public :                   Promesse (1 phrase) :  CTA (dit + écrit) :
Type / durée :             Référence(s) :         Preuves à montrer :
Voix : oui/non — langues L1 + L2 — voix (genre, âge, accent, débit) — registre
Script : qui écrit         Musique : source, BPM visé, humeur
Ouvertures : A = <angle> / B = <angle> [/ C = <angle>] (0–3 s, même corps)
Formats : 9:16 · 1:1 · 16:9         Données : démo (mention à l'écran) / réelles
Livrables : 2 ouvertures × 2 langues × N formats = <n> MP4 + posters + SRT
Interdits : logos tiers, interface inventée, chiffres non vérifiables sans mention
```
