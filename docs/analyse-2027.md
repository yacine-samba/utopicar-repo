# Analyse 2027 : juger la voiture avant le premier message

Octobre 2026. Ce qui est en place dans le code, puis ce qui reste à construire pour garder un temps d'avance.

## Le problème de l'ancienne analyse

- **Notation pensée pour une seule cible** : la liste « fiable » ne couvrait que des citadines d'avant 2016. Une RS3, une Golf GTI ou une 911 tombaient « hors liste », et l'IA, nourrie d'un contexte achat-revente de petites voitures, concluait « pas un achat cible ».
- **Faux « à éviter »** : toute boîte DSG ou EDC était classée à éviter, tout EcoBoost et tout THP aussi, quelle que soit l'année (une S tronic de RS3 ou une 308 GTi récente étaient pénalisées).
- **Note opaque** : 50 % état + 50 % marge, puis des plafonds ; un seul chiffre, sans dire pourquoi. Le verdict particulier ne regardait que le prix.
- **Des sections vides au moment où l'on décide** : HistoVec, carte grise, CT, 13 contrôles presque tous « inconnu ». Or la décision se prend avant le premier message, avec l'annonce et ses photos.
- **Réglages figés** : seuil de marge de 750 € quelle que soit la voiture, revente « à Paris en moins de 3 semaines », frais fixes de 20 €, réglages gardés dans le navigateur seulement.

## Ce qui change (en production après fusion)

### 1. Un profil d'analyse, demandé à la première analyse

Quatre questions (20 secondes), modifiables dans **Profil › Mon profil d'analyse** :

1. Cette voiture, c'est pour… rouler avec / la revendre / rouler puis revendre.
2. Votre expérience : je débute / j'ai l'habitude / c'est mon métier.
3. Les travaux : aucun / les petits / même les gros.
4. Revente : bénéfice minimum (en euros, ou en % du prix pour les voitures chères) et délai (2-3 semaines, 1-2 mois, pas pressé). Usage : kilomètres par an et budget (le budget ne change jamais la note, il signale seulement l'écart).

Réglages des frais en plus : ville, prix du cheval fiscal, coût du trajet, frais par voiture revendue, statut de négociant (pas de carte grise à son nom).

Enregistré dans `profils.reglages.analyse` (pas de migration). Le profil **règle les priorités, jamais l'éligibilité** : aucune voiture n'est « hors cible ». Changer son profil recalcule aussitôt tous les rapports affichés, anciens compris (le bilan est calculé dans le navigateur à partir de l'analyse enregistrée).

### 2. Quatre questions au lieu d'une note opaque

Chaque rapport commence par un bilan (`lib/analyse/bilan.ts`, composant `Bilan`) :

| Question | Ce qui est pesé |
|---|---|
| **Fiable ?** | Réputation du moteur et de la boîte (toutes gammes), kilométrage face à la durée de vie de ce moteur, âge, entretien prouvé, pièces déjà refaites, première main, avis de l'IA (25 %). |
| **Des travaux ?** | Budget sur 12 mois : écrit dans l'annonce, vu sur les photos, entretien arrivé à échéance (distribution, embrayage, révision, amortisseurs) et risque connu du moteur, chacun avec sa probabilité. « Probable : 650 €, entre 300 et 1 400 € ». |
| **Bon prix ?** | Prix affiché face au prix médian **affiché** des annonces comparables (on compare enfin des prix affichés entre eux). |
| **Ça rapporte ?** (revente) | Bénéfice dans trois scénarios (vente rapide, normale, en prenant son temps), frais comptés avec une marge de prudence selon l'expérience ; prix à ne pas dépasser, offre d'ouverture, objectif ; facilité de revente. |
| **Combien par mois ?** (usage) | Perte de valeur mesurée sur les annonces du modèle (moteur de cote de l'outil), entretien courant selon le kilométrage, travaux probables ; hors carburant et assurance. |

La note sur 100 est la moyenne de ces quatre réponses, **pondérée selon le profil** (revente : le bénéfice compte pour 40 % ; usage : la fiabilité et les travaux d'abord ; « aucun travaux » et « je débute » renforcent ce qui compte pour eux). Ce qui limite la note est écrit en clair.

### 3. Un verdict qui dit quoi faire

**Très bonne affaire · Bonne affaire · À négocier · À creuser · À éviter**, avec une phrase et une action (« Écrivez au vendeur maintenant », « Visitez, puis proposez 35 750 € ; ne dépassez jamais 38 050 € », « Posez ces questions avant de vous déplacer »). « À creuser » existe pour le cas fréquent où rien n'est mauvais mais une réponse manque (moteur à éviter sans preuve de courroie, défaut non chiffrable).

### 4. Ce qu'on ne sait pas encore devient le premier message

Les documents absents ne pénalisent plus rien. Ils deviennent des questions, classées par ce qu'elles changent à la décision, avec le montant en jeu (« La courroie a-t-elle été changée ? jusqu'à 1 300 € en jeu »), puis un premier message prêt à envoyer qui pose les deux plus importantes.

### 5. Une base de connaissances toutes gammes

`lib/analyse/connaissances.ts` : une soixantaine de fiches moteurs, boîtes et batteries (PureTech, THP, N47, N54, S65, EA111, EA888, 2.5 TFSI, OM651, IMS Porsche, DQ200 contre DSG à bain d'huile, EDC, CVT, ZF 8, EAT8, batterie en location…), avec années, durée de vie, type de distribution, question à poser et risque sur 12 mois (probabilité, coût). Les pages publiques `/moteur` ne changent pas.

### 6. Confiance de l'analyse

« Analyse solide / correcte / à confirmer », avec ce qui l'affinerait : ajouter les photos, version exacte du moteur, cote estimée faute d'annonces comparables.

### 7. Une IA qui parle à la bonne personne

La consigne reçoit le profil : ton simple et termes expliqués pour un débutant, ton direct pour un pro ; interdiction explicite de juger une voiture « hors cible » ; message au vendeur centré sur la question qui change la décision ; lexique des mots techniques du rapport. Les notions « vrai 0 € » et « compatibilité débutant » sont retirées.

## Fichiers

| Fichier | Rôle |
|---|---|
| `web/src/lib/analyse/profil.ts` | Profil d'analyse : schéma, valeurs par défaut, seuil de bénéfice, résumé |
| `web/src/lib/analyse/connaissances.ts` | Réputation des moteurs, boîtes et batteries |
| `web/src/lib/analyse/travaux.ts` | Budget travaux probabilisé sur 12 mois |
| `web/src/lib/analyse/bilan.ts` | Les quatre réponses, note, verdict, confiance, questions, argent |
| `web/src/lib/analyse/verdicts.ts` | Libellés, couleurs, lecture des anciens verdicts (GO, NO GO, bon, cher…) |
| `web/src/lib/analyse/projection.ts` | Perte de valeur mesurée sur les annonces du modèle |
| `web/src/components/analyse/Bilan.tsx` | Le bilan en tête des rapports |
| `web/src/components/analyse/ProfilAnalyse.tsx` | Questionnaire, formulaire des paramètres, puce « Analysé pour vous » |

Les anciens rapports restent lisibles : leur verdict enregistré est traduit (GO → Bonne affaire, NO GO → À éviter…), et leur bilan est recalculé à l'ouverture.

## Pour aller plus loin (non construit)

Classées par effet attendu sur la décision, du plus fort au plus faible.

1. **Analyse vivante** : quand le vendeur répond (CT, factures, HistoVec collés ou photographiés), le rapport se met à jour et la note bouge sous les yeux : « la courroie est prouvée, Fiable ? passe de Moyen à Oui ». Le cycle complet : annonce → message → réponses → visite (liste cochée sur place, défauts constatés chiffrés) → offre.
2. **Liquidité mesurée** : la base du marché est cumulative ; mesurer le délai réel de vente et les baisses de prix par modèle et motorisation, pour remplacer l'estimation de facilité de revente par un vrai « se vend en 23 jours en moyenne à ce prix ».
3. **Calibrage par les résultats** : comparer la marge prévue et la marge réelle des voitures du parc (achat, frais, vente) pour corriger automatiquement les probabilités de travaux et les prix de revente, par modèle.
4. **Suivi des annonces analysées** : alerte quand le prix d'une annonce analysée baisse sous le prix à ne pas dépasser, ou quand elle disparaît (vendue : signal de liquidité).
5. **Comparateur de projets** : trois annonces côte à côte avec les quatre réponses ; « laquelle choisir pour mon profil » en une phrase.
6. **Coût d'usage complet** : carburant (consommation de la version, prix du litre), assurance estimée et Crit'Air (zones à faibles émissions de la ville du profil), pour un vrai coût mensuel.
7. **Rappels constructeur et campagnes de prise en charge** (PureTech, AdBlue) par numéro de série, quand une source fiable est disponible.
8. **Mode collection et plus-value** : pour les modèles dont la cote monte (sportives, youngtimers), une courbe de valeur sur plusieurs années au lieu d'une décote.

## Vérifié

- Types (`tsc`) et lint (`eslint src`) sans erreur ni avertissement.
- Moteur essayé sur une RS3 (2018, 41 900 €), une Clio IV dCi (168 000 km, embrayage à prévoir), une 208 PureTech (112 000 km) et une Golf GTI DSG, en profil particulier et Benef : la RS3 est « Très bonne affaire » pour rouler avec et « À négocier » pour la revendre (−3 070 € au prix affiché, offre à 35 750 €) ; la 208 PureTech est « À creuser » avec la question de la courroie en premier.
- Rendu vérifié en capture sur ordinateur (1280 px) et téléphone (390 px), sans défilement horizontal.
- Non vérifié ici : l'appel réel à l'IA (pas de clé dans ce conteneur) et l'enregistrement du profil en base (pas de Supabase). Le build s'arrête sur le plan du site faute de variables Supabase, comme avant ces changements.
