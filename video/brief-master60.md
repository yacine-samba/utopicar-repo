# Brief — master60 — la pub d'une minute UTOPICAR (débutants + marchands)

Produit / URL : UTOPICAR, utopicar.fr, espace Benef (nouvelle app web, `web/src/app/app`)
Objectif : faire essayer Benef, puis s'abonner (Starter ou Pro)
Plateforme(s) : pub payante Meta / TikTok + organique TikTok, Reels, Shorts ; 16:9 pour YouTube et le site

Public : deux cibles dans le même film
- **Le débutant** qui se lance dans l'achat-revente (1res voitures) : il a peur de se planter sur la première.
- **Le marchand** déjà en activité : il a du stock, du capital immobilisé, et pas le temps de tout éplucher.

Promesse (1 phrase) : de la première voiture à la vingtième, UTOPICAR te dit **avant** d'acheter ce qu'il te
restera, et **après** l'achat où est ton argent.

Ce que le spectateur gagne (la valeur, chiffres sourcés) :
| Pour qui | Gain | Source |
|---|---|---|
| Débutant | Même Clio : + 670 € bien achetée, − 130 € si l'embrayage à refaire passe inaperçu | scénarios du calculateur Benef (`GainsAbonnement.tsx`) |
| Débutant | 450 € à négocier sur une vraie Clio IV à 6 700 € (prix conseillé 6 250 €) | vraie annonce analysée le 3 oct. 2026 (`web/src/lib/demo.ts`) |
| Débutant | Starter 14,99 €/mois, « rentabilisée 44 fois par une seule voiture bien achetée » | `offres.ts` + calculateur |
| Marchand | Le marché trié : annonces de ses recherches entre 10 et 45 % sous la cote, alertes | tableau de bord Pro (`Marche`, recherches suivies) |
| Marchand | Le capital qui dort signalé (> 45 j, > 60 j en stock) dans « Votre journée » | tableau de bord Pro (`Journee`, `AgeStock`) |
| Marchand | Marge réelle par voiture, parc par étapes, rotation | tableau de bord Pro (`GraphMarges`, `EtapesParc`) ; Pro 79 €/mois |

CTA (dit + écrit, avant la fin, zone sûre) : « Essaie 3 jours de Benef, sans carte bancaire. Lien en bio. »
(16:9 : « utopicar.fr » à la place de « lien en bio »)
⚠ **À confirmer** : je ne trouve pas l'essai de 3 jours dans le code du site (Stripe sans période d'essai, page
/tiktok = « Première analyse offerte, sans carte bancaire »). Si l'offre n'est pas active au moment de la diffusion,
le CTA devient « Ta première analyse est offerte. Lien en bio. »

Type / durée : pub produit « master », 60 s (≈ 140 mots de voix au débit de Simon, 10 % de respiration)
Référence(s) : prompt-motion.com, catégorie Product UI et Kinetic type, études image par image ; on en reprend la
grammaire (rythme, transitions, caméra), jamais les textes, les images ni la musique. Base maison : skill
motion-studio (caméra continue, flou de bougé, vraie UI, curseur, chiffre géant, surligneur).
Preuves à montrer : vraie annonce → analyse (marge nette, prix d'offre, plafond) · tableau de bord « Votre journée » ·
marché sous la cote · parc par étapes et âge du stock · marges par voiture · les deux formules Starter et Pro.

Voix : oui — français seulement — **Simon** (ElevenLabs `mvhJVdVoTWVUtL4keT7W`, eleven_v3), joué **incarné** : un pote
qui montre l'app, avec le sourire, et qui réagit (« Ah. Non. », petit rire, « Ah ouais. ») — tutoiement, humour léger,
jamais d'emphase de bande-annonce.
Script : j'écris en m'inspirant des références, tu valides. Hooks écrits avec le skill art-du-hook (règle du dépôt),
textes passés au Stop Slop.
Musique : ElevenLabs Music instrumentale, ≈ 110–120 BPM, groove lumineux, arrêt net sur le gag, montée sur la valeur,
voix devant (ducking).

Ouvertures (0–3 s, même corps de film) : A = le débutant d'abord / B = le marchand d'abord. Le corps parle aux deux.
Formats : Vertical 9:16 (1080×1920) · Desktop 16:9 (1920×1080), mise en page recomposée par format.
Données : vraies annonces analysées (mention « Vraie annonce, analysée par UTOPICAR ») ; tableau de bord et parc en
données démo avec la mention « Données de démonstration » ; gains présentés comme exemples calculés, jamais promis.

Livrables : 2 ouvertures × 1 langue × 2 formats = **4 MP4** + posters + SRT + voix et musique séparées + rapport de mesures
Interdits : logos tiers (aucun logo Leboncoin à l'écran), interface inventée, chiffres non sourcés sans mention.

## Déroulé et validations
1. **Brief** (ce document) → ton OK.
2. Étude des références prompt-motion.com (Product UI) + **script** minuté, 2 hooks, extrait de voix de Simon → ton OK.
3. Captures du vrai tableau de bord (app installée en local, données démo), direction artistique, **storyboard** → ton OK.
4. Musique, bruitages, mix ; construction ; **premier montage** 540p (9:16, ouverture A) → ton OK.
5. Trois rounds de critique mesurée, puis livraison des 4 MP4.
