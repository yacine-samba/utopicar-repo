# UTOPICAR Garage : inventaire de l'outil d'origine

L'outil complet est archivé tel quel dans `legacy/garage/` (le zip `UTOPICAR_Garage`).
`index.html` : page unique d'environ 4 600 lignes, faite pour tourner comme artifact claude.ai.
`vendor/` contient pdf.js 3.32.2 et tesseract.js avec le modèle français, pour l'OCR.

La V1 en Next.js (`web/`) ne reprend que l'**analyse d'annonce**. Ce document liste tout le reste, pour les ajouts futurs.
Les numéros de ligne renvoient à `legacy/garage/index.html`.

## Dépendances de l'outil d'origine (à remplacer avant de reprendre un module)

| Capacité claude.ai | Utilisée pour | Remplacement prévu |
|---|---|---|
| `claude.use('sample')`, l'IA côté navigateur (`sample.json`, `modelTier: 'complex'`) | analyse complète, tri par lot, estimation de modèle, état sur photos, lecture de la carte grise | route serveur Next.js + SDK Anthropic (fait pour l'analyse : `web/src/lib/analyse/ia.ts`) |
| `claude.use('db')` : collections `vehicules`, `analyses`, `releves`, `config` | parc, rapports, relevés, réglages | base de données (Supabase, déjà utilisé) |
| `claude.use('mcp')` : Supabase par le connecteur claude.ai, projet `rvdfifhgosovdapdltps` | recherches suivies, cotes du marché | client Supabase côté serveur |
| `claude.use('assets')` | miniatures des rapports, documents du parc | Supabase Storage ou Vercel Blob |

Tables et fonctions Supabase appelées : `utp_annonce`, `utp_config`, `utp_cote_demande`, `utp_cotes`, `utp_etat`, `utp_etat_ia`, `utp_http`, `utp_lancer`, `utp_live`, `utp_photo`, `utp_statut`, `utp_test_mail`, `annonces`.
La collecte des recherches suivies passe par **Apify** (clé personnelle saisie dans les réglages).

## Modules

### 1. Analyser une annonce (repris en V1)
- Dossier en 5 zones pondérées : annonce + photos (30 %), HistoVec (25 %), PV de CT (20 %), entretien/factures (15 %), carte grise (10 %). Jauge « dossier complet à X % » (`ZONES`, `completeness`).
- Glisser-déposer, collage d'images, PDF lus avec pdf.js (`pdfToParts`), images converties en JPEG (`toJpeg`).
- Import depuis l'extension ou le favori (« bookmarklet ») : données structurées Leboncoin (`lbcFacts`, `lbcAttrs`, `importToText`), photos en base64.
- Faits lus par règles fixes, jamais par l'IA (`descFacts`, l. 2032) : CT (statut, date, « moins de X mois »), distribution, propriétaires, carnet, factures, défauts avoués. **Repris.**
- 38 règles de défauts chiffrés (`DEFAUTS`, l. 3467) : pièges rédhibitoires, gros travaux, petits défauts, signaux. **Repris.**
- Note d'état 0-100 (`etatCalc`). **Repris.**
- Fiabilité : moteurs et boîtes à éviter, 17 familles de modèles fiables entre 3 000 et 7 000 € (`EVITER_GLOBAL`, `FIABLES`, `fiabRate`). **Repris.**
- Référentiel marque → modèle → génération avec années, codes châssis et moteurs propres à chaque génération (`CAT`, l. 1010-1520, `vehResolve`). *Non repris : l'IA identifie la génération.*
- Cote du marché par régression sur 200 annonces Leboncoin de la même génération : âge, km, vendeur pro, boîte, version, équipements (`coteModel`, `coteEstim`, `ols`, l. 4330-4550). *Non repris : demande la base Supabase. En V1, l'IA estime le marché.*
- Rapport IA complet (`A_SCHEMA`, l. 2334) : annonce décortiquée sujet par sujet (prouvé / annoncé / non mentionné / contradictoire), 13 contrôles, relevés kilométriques datés avec graphique, analyse HistoVec, analyse du PV de CT, entretien, risques cachés par catégorie, structure conseillée (mandat, dépôt-vente, paiement à la revente…), « vrai 0 € », scripts de négociation avec marqueurs `{OFFRE}` `{CIBLE}` `{PLAFOND}`. *V1 : version allégée (`web/src/lib/analyse/ia-schema.ts`).*
- Calcul du deal, toujours par l'outil (`deal`, l. 883) : revente − prix − remise en état − carte grise − trajet − frais fixes, plafond, offre (plafond × 0,94 arrondi à 50 €), note plafonnée par motif, verdict GO / GO SI NÉGOCIÉ / GO EN MANDAT UNIQUEMENT / À SURVEILLER / NO GO. **Repris** (`dealPro`).
- Remise en état modifiable poste par poste, avec un pourcentage de prudence (`bindRemise`, `RE_CATS`).

### 2. Trier un lot d'annonces
- Jusqu'à 10 annonces collées (séparateur `---`) ou envoyées par l'extension, classées selon ce qu'il resterait une fois les frais déduits, avec le plafond de chacune (`L_SCHEMA`, `buildLotPrompt`, `renderLot`).
- Historique des tris, envoi d'une annonce vers l'analyse complète ou vers le parc.

### 3. Recherche (en direct)
- Recherche par marque, modèle et génération, prix, km, années, énergie, boîte, zone, mots exclus (`qsParse`, `renderLiveForm`).
- Recherches suivies : relance automatique toutes les 15 min à 24 h par Apify, avec suivi du budget mensuel.
- Liste des annonces : filtres « sans moteur à éviter », « fiables seulement », « masquer les pièges », « vraies affaires » ; tri par écart réel ou par état ; vérification des photos par l'IA en lot (`liveCheckBatch`).
- Catalogue « Modèles fiables 3 000 – 7 000 € » prêt à suivre en un clic.

### 4. Cotes et marché
- Cote par génération (200 annonces), nuage de points prix / km (`coteScatter`), demande de nouvelle cote (`coteDemande`).
- Relevés de pages de résultats par le favori « Relever la page » (`releveFn`, `handleReleve`), comparaison de chaque annonce aux autres relevés.
- Synthèse par modèle sur 90 jours, estimation de modèle par l'IA (`M_SCHEMA`), ventes réelles et études enregistrées.

### 5. Tableau de bord
- Indicateurs du parc, meilleures affaires des 7 derniers jours, pipeline par statut, alertes (durée de stock, documents manquants), marge nette par véhicule avec le seuil en pointillés, nouvelles annonces, derniers rapports (`renderDash`).

### 6. Parc
- Fiche véhicule : identité, statut (repéré, en préparation, en vente, vendu, abandonné), structure (achat direct, paiement à la revente, mandat, dépôt-vente, intermédiation), prix d'achat et de vente, frais par catégorie, documents (carte grise, CT, non-gage, HistoVec, factures, cession, mandat).
- Checklist des papiers de vente : carte grise, CT de moins de 6 mois, non-gage de moins de 15 jours, HistoVec, cerfa de cession.
- Lecture de la carte grise depuis une photo : OCR tesseract, puis IA si besoin (`readCG`, `parseCGText`, `CG_SCHEMA`).
- Génération de l'annonce de revente par l'IA (`genAnnonce`).

### 7. Rapports et comparateur
- Liste des rapports avec recherche, comparaison de 2 ou 3 rapports côte à côte, avec la meilleure valeur de chaque ligne en vert (`renderCompare`).

### 8. Divers
- Palette de commandes Ctrl+K (`cmdk`), thème clair / sombre, réglages du calcul : marge minimum (800 €), durée de stock (45 j), ville, carte grise comptée ou non, prix du cheval fiscal (68,95 € en Île-de-France en 2026), coût au km (0,25 €), frais fixes (150 €).

## Extension Chrome

`extension/` (dans ce dépôt) : « UTOPICAR Scanner » pour Leboncoin, La Centrale, AutoScout24 et LeParking. Elle lit l'annonce ou la page de résultats et la copie pour l'outil (`UTPIMPORT:` / `UTPLOT:`).
