# Revue complète de utopicar.fr — cap 2027-2028

Revue faite le 8 octobre 2026 sur le site en production, sans refonte : ce qui est bon, ce qui manque, dans quel ordre le faire.
Mesures : Lighthouse 12 (mobile simulé 4G et ordinateur), axe-core 4.10 sur chaque page publique à 375 px et 1280 px, reflow à 320 px, navigation au clavier, en-têtes HTTP, lecture du code. L'espace connecté (`/app`) n'a pas été testé dans le navigateur : il demande un compte.

## Verdict en une ligne

Le socle est solide (accessibilité 100, SEO technique 100, bonnes pratiques 100, zéro violation axe, mobile propre à 320 px). Ce qui manque pour 2027 n'est pas de la correction, c'est de la **preuve** (chiffres réels, avis, résultats), de la **mesure** (aucun événement de conversion n'est suivi) et une **identité plus marquée** (le site utilise encore trois réflexes de « site généré »). Côté SEO, le site n'a que 7 pages indexables et aucun contenu éditorial : il ne peut pas capter de recherches Google.

| Page | Perf mobile | Perf ordi | Accessibilité | SEO | Bonnes pratiques | LCP mobile |
|---|---|---|---|---|---|---|
| Accueil | 83 | 97 | 100 | 100 | 100 | 3,6 s |
| /analyse | 85 | — | 100 | 100 | 100 | 3,5 s |
| /benef | 86 | — | 100 | 100 | 100 | 3,2 s |
| /tarifs | 88 | — | 100 | 100 | 100 | 3,0 s |

CLS partout ≤ 0,004, TBT ≤ 40 ms, poids total 226 à 366 Ko : le site est léger. Le seul vrai sujet de performance est le délai d'affichage sur téléphone (FCP 2,6 à 2,8 s).

## Ce qui est déjà bon, à ne pas casser

- Lien d'évitement en premier Tab, focus visible partout, un seul `<main>`, zones nommées, `lang="fr"`, titres sans saut.
- Titre animé stable : hauteur constante mesurée sur 7 s à 375 px (la place est réservée).
- Bouton « Mettre les animations en pause » dans le pied de page, `prefers-reduced-motion` respecté, bandeaux défilants lus une seule fois par les lecteurs d'écran.
- Aucun débordement horizontal à 320 px, bouton principal visible sans défiler sur téléphone (haut à 530 px sur 812).
- Formulaires avec labels reliés, `autocomplete`, pot de miel masqué, erreurs en `role="alert"`.
- Démo avec trois vraies annonces, onglets au clavier, zone `aria-live` : c'est le meilleur argument du site.
- Page « Informations légales » avec section Accessibilité honnête (« partiellement conforme », recours au Défenseur des droits).
- Image de partage générée, manifest installable, 404 propre, redirections http → https → www en 308, HSTS 2 ans.

---

## 1. Conversion et identité (le plus rentable)

### 1.1 Aucune preuve chiffrée sur le site
Le site promet (« 10 secondes », « 38 défauts ») mais ne montre jamais un résultat réel : pas de nombre d'analyses faites, pas d'avis, pas de « économisé en moyenne », pas de logos presse, pas de témoignage. En 2027 un SaaS sans preuve sociale perd le visiteur qui compare.

À faire :
- Un bandeau de chiffres vrais, tirés de la base (`analyses`, `cote_annonces`) et recalculés chaque nuit : « 12 946 annonces relevées », « X analyses ce mois », « écart moyen à la cote trouvé : Y € ». Le code a déjà des compteurs animés (`Demo.tsx` → `useCompte`) : les réutiliser.
- 3 témoignages courts avec prénom, ville et voiture (demandés par e-mail aux comptes Essentiel/Benef actifs, via Resend qui est déjà branché).
- Un « avant/après » réel : capture de l'annonce → capture du rapport, sur la page Benef.

### 1.2 Trois boutons pour la même action
Le même geste s'appelle « Estimer » (en-tête mobile), « Estimer une affaire » (hero), « Analyser une annonce » (section parcours), « Analyser mon annonce » (onboarding). Le skill maison dit : un bouton garde le même nom tout au long du parcours.

À faire : un seul libellé, « Analyser une annonce » (c'est ce que la personne fait), partout, y compris `EnTete.tsx` (« Analyser » sur mobile) et `Onboarding.tsx`.

### 1.3 L'onboarding s'ouvre tout seul au-dessus du hero
`Onboarding.tsx` ouvre la fenêtre à 1,2 s sur `/`, `/benef` et `/tarifs` à la première visite. Effets mesurés : sur téléphone, Lighthouse prend le texte de cette fenêtre comme élément LCP (3,6 s au lieu du titre), et le visiteur voit un formulaire avant d'avoir lu la promesse. C'est aussi ce que Google traite comme interstitiel intrusif sur mobile.

À faire : ne plus l'ouvrir automatiquement. Le garder derrière le bouton « M'orienter en 3 questions » et le proposer en bas du hero sur téléphone. Si vous tenez à une ouverture automatique : seulement sur ordinateur, après 8 s ou 50 % de défilement, jamais sur `/tarifs`.

### 1.4 Le site se reconnaît, mais pas encore au premier coup d'œil
Ce qui fait « Utopicar » aujourd'hui : fond sombre chaud, orange `#ff5a1f`, Clash Display, le mot en italique serif dégradé, le symbole voiture. C'est cohérent. Mais le site coche trois des cinq réflexes de site généré listés dans le skill maison : kit de cartes arrondies toutes identiques (`.carte` partout, 26 px, même panneau), petit label (« kicker ») au-dessus de chaque titre, et « → » sur presque tous les boutons avec un seul mot coloré par titre.

À faire, sans refonte :
- Choisir **un objet signature** et le répéter : la « fiche » (le rapport). Le rapport de la démo, incliné légèrement, est déjà le visuel le plus fort du site ; le reprendre dans l'image de partage, en haut de `/benef`, dans les e-mails et sur les réseaux. Un SaaS se reconnaît à son produit, pas à sa palette.
- Garder le symbole orange du logo (la flèche) comme motif : puce de liste, curseur du titre animé, séparateur. Il remplace les « → » génériques.
- Varier la structure : une section sur deux sans cartes (liste numérotée large, ou texte + visuel), pour que les cartes redeviennent un signal.
- Retirer le kicker quand le titre se suffit (« Comment ça marche », « Questions fréquentes »).
- Un seul `→`, sur le bouton principal.

### 1.5 Parcours particulier : l'inscription arrive après l'effort
`/analyse` demande de coller l'annonce, puis annonce « Un compte gratuit vous sera demandé pour voir le résultat ». La personne découvre la barrière après avoir collé. Deux options, à tester avec des événements (voir §6) :
- Montrer un résultat partiel (verdict + cote, sans le détail) avant la création de compte ;
- ou dire la barrière avant, en une ligne au-dessus du champ, avec « 30 secondes, sans carte ».

### 1.6 Tarifs
- La formule Sérénité (9,99 €) est cachée (`cachee: true`) mais reste dans le code et dans l'onboarding : soit on la montre, soit on la retire.
- Pas de bascule mensuel / annuel : en 2027 c'est attendu sur un SaaS, et c'est le levier le plus simple pour la trésorerie (2 mois offerts).
- La ligne « Sans abonnement : crédits à l'unité » en `<details>` est bien, mais les packs ne disent pas pour qui ils sont (« une seule voiture en vue »).

---

## 2. SEO : le site est propre mais invisible

### 2.1 Technique (à faire en une journée)
- **Aucune URL canonique** sur aucune page (`alternates.canonical` absent du `metadata`). Avec `?sans-accueil`, `?guide=`, `?paiement=`, Google peut indexer des doublons. Ajouter `alternates: { canonical: "/" }` par page (et le `metadataBase` existe déjà).
- **Aucune donnée structurée** (zéro `application/ld+json`). Ajouter `Organization` + `WebSite` (accueil), `SoftwareApplication` avec `offers` (accueil et tarifs), `FAQPage` sur les FAQ (accueil, benef, tarifs), `BreadcrumbList`. Les FAQ sont déjà dans le code : le JSON-LD se génère à partir des mêmes données.
- **Titre d'accueil de 68 caractères** : coupé dans Google. Viser « Utopicar : cote et analyse d'une annonce de voiture d'occasion » (58).
- **Sitemap** sans `lastModified` ; ajouter la date de build. `/guide` y est, mais son contenu est réservé aux comptes : Google ne verra que la page d'achat.
- Les liens `/legal#mentions`, `/legal#accessibilite` sont bien ; ajouter un lien vers `/legal` depuis l'en-tête mobile n'est pas nécessaire.
- Image de partage : le texte est bon, mais elle n'a ni le produit ni la couleur orange en fond. Y mettre la fiche (§1.4).

### 2.2 Contenu (c'est là que se joue 2027)
Sept pages indexables, zéro page de contenu : le site ne peut sortir que sur « utopicar ». Les recherches qui amènent vos clients existent déjà en volume : « cote voiture occasion gratuite », « estimation voiture occasion », « 1.2 PureTech problème », « arnaque leboncoin voiture », « acheter une voiture à un particulier », « achat revente voiture statut », « combien de voitures peut-on revendre par an ».

Le site a déjà la matière : 16 chapitres du guide, une liste de moteurs à éviter, 38 défauts, une base de 13 000 annonces avec cotes par modèle.

À faire, dans l'ordre :
1. **Pages modèles générées depuis la base** (`cotes`, `cote_annonces`) : `/cote/renault-clio-4-diesel` avec cote médiane, fourchette, nombre d'annonces, répartition par année et kilométrage, moteurs fiables ou à éviter, et le bouton « Analyser une Clio en vente ». Une page par génération et énergie déjà relevée (11 aujourd'hui, 227 modèles possibles avec les codes ajoutés cette semaine). Mise à jour automatique avec les relevés. C'est le contenu que personne d'autre n'a avec des données fraîches.
2. **Pages moteurs** : `/moteur/1-2-puretech` (problèmes connus, années, coût, modèles concernés). Déjà dans `fiabilite.ts`.
3. **Un guide gratuit par mois** tiré du guide payant (un chapitre réécrit, le reste réservé) : « Le mandat de vente pour commencer sans argent », « Vendre une voiture sans la garantie des vices cachés ».
4. Un `title` et une `description` propres à chaque page générée, un `BreadcrumbList`, un maillage vers `/analyse`.

Sans ça, la seule source de visiteurs reste les réseaux et la publicité.

---

## 3. Performance : un seul chantier, l'affichage sur téléphone

Mesures accueil mobile : TTFB simulé 658 ms, FCP 2,8 s, LCP 3,6 s, dont **2,9 s de « render delay »**. Causes, par importance :

1. **Polices chargées depuis api.fontshare.com** : une feuille CSS tierce en chaîne (HTML → CSS Fontshare → 2 fichiers woff2), dans le chemin critique. Clash Display et Satoshi sont libres d'utilisation : les télécharger et les servir avec `next/font/local` (comme Instrument Serif l'est déjà). Gain attendu : 300 à 600 ms de FCP sur mobile, plus aucune dépendance tierce, plus de blocage si Fontshare tombe. C'est la correction au meilleur rapport effort/gain du document.
2. **L'onboarding automatique** (§1.3) qui devient l'élément LCP.
3. **Photos de la démo** servies en 800 × 600 là où 400 px suffisent sur téléphone : 83 Ko de trop. Passer par `next/image` avec `sizes`, ou fournir deux tailles. (`next/image` n'est utilisé nulle part dans `src/`.)
4. **14 Ko de polyfills** inutiles (`Array.prototype.at`, `Object.fromEntries`…) : ajouter un `browserslist` moderne dans `package.json` (`"browserslist": ["chrome >= 109", "safari >= 16", "firefox >= 115"]`).
5. Le document principal est en `Cache-Control: no-store` (lecture du compte à chaque page) : la page ne rentre pas dans le cache arrière/avant. Pour les pages publiques, lire le cookie de session sans rendre la page dynamique (l'en-tête en client, ou `Suspense` autour de `EnTete`) permettrait le rendu statique et un TTFB quasi nul. Chantier plus gros ; à faire si le trafic monte.

Ce qui ne pose pas problème : JS 73 Ko pour le plus gros chunk, exécution 0,3 s, CLS nul.

---

## 4. Accessibilité : 100 au score, 4 choses à finir pour le niveau pro

- **Fond du `body` sans couleur de secours** : seulement des dégradés. Les outils (axe le signale en « contraste indéterminé » sur 55 éléments) et le mode impression ou contraste forcé n'ont pas de couleur de base. Ajouter `background-color: var(--color-bg0)` avant les dégradés. Les contrastes réels sont bons (texte secondaire ≈ 6,8:1, orange sur sombre ≈ 9:1, texte sombre sur bouton orange ≈ 6,3:1).
- **Mode contraste élevé** (`@media (forced-colors: active)`) : les boutons en verre, les pastilles et les champs n'ont pas de bordure visible. Une règle de 5 lignes.
- **Cibles tactiles** : le lien « Aller au contenu » fait 32 × 16 px au focus ; les liens du pied de page font 19 px de haut, espacés de 8 px. Passer le pied en `py-1.5` par lien, et le lien d'évitement en `min-height: 44px`.
- **Lecteur d'écran sur le titre** : le mot animé est bien masqué, mais le nom accessible du titre est « …si une occasion est une vraie affaire » seulement. Mettre la phrase complète dans le texte masqué : « une vraie affaire, une arnaque, à négocier ou au bon prix ».
- Espace connecté : six fenêtres modales sont des `div` cliquables (`EspaceMessages`, `RechercheRapide`, `SommaireRapport`, `Photos`), avec `role="dialog"` mais sans piège de focus ni retour du focus à la fermeture. Un composant `Fenetre` commun basé sur `<dialog>` (comme `Onboarding.tsx` le fait déjà) règle les six.

---

## 5. Design et animation : le budget est bien dépensé, deux ajustements

Le site est de type C (SaaS) : mouvement élevé, mais chaque animation doit montrer le produit. Le titre qui se tape, la démo qui s'enchaîne, les compteurs : oui. Deux bandeaux défilants l'un sous l'autre (modèles + vérifications), 60 et 70 s en boucle : c'est le seul mouvement décoratif, et il double. En garder un (« Ce que l'outil vérifie », qui vend), le second devient une ligne statique.

- Les cartes « apparaissent » avec un délai en cascade de 80 ms : bien. Les boutons ont un ressort au survol : bien. Rien n'anime `width` ou `height`, sauf la barre de progression de l'onboarding (`transition-[width]`) : passer en `transform: scaleX()`.
- Le curseur clignotant du titre tourne à l'infini même quand l'onglet est caché : `Rotateur.tsx` vérifie `document.hidden` pour le texte, pas le CSS du curseur. Mineur.
- Densité : les sections font toutes `py-20` avec un titre centré sur deux lignes ; le rythme est régulier au point d'être prévisible. Une section pleine largeur avec le rapport en grand (§1.4) casse ce rythme au bon endroit.
- Le kicker avec point lumineux (`box-shadow: 0 0 10px`) est joli ; en 10 exemplaires sur la page il perd sa valeur.

---

## 6. Mesure : aucun événement n'est suivi

Vercel Analytics et Speed Insights sont installés, mais aucun `track()` n'existe dans le code. Vous voyez les pages vues, pas les conversions. Impossible aujourd'hui de savoir si l'onboarding aide ou nuit, ni combien de visiteurs de `/analyse` créent un compte.

À brancher (une ligne chacun, `import { track } from "@vercel/analytics"`) :
- `analyse_lancee` (source : lien ou texte, site d'origine), `compte_cree`, `analyse_terminee`, `rapport_vu`
- `onboarding_ouvert`, `onboarding_fini` (avec la recommandation), `onboarding_passe`
- `tarifs_onglet` (particulier / benef), `paiement_lance` (formule), `paiement_ok` (déjà côté serveur Stripe : l'envoyer aussi)
- `demo_onglet`, `demo_relancee`
- `guide_achete`, `pack_credits_achete`

Puis un tableau de bord Vercel avec l'entonnoir visite → analyse → compte → paiement. C'est le préalable à toute décision de design en 2027.

---

## 7. Sécurité et bonnes pratiques

- Présents : HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, pas de secret dans le dépôt.
- Manquants : **`Content-Security-Policy`** (au moins en `report-only` pour commencer, puis stricte : scripts `self` + Vercel + Stripe, images `self` + leboncoin + supabase), **`Permissions-Policy`** (`camera=(), microphone=(), geolocation=()`), `Cross-Origin-Opener-Policy`. HSTS sans `includeSubDomains; preload`.
- Supabase : la protection contre les mots de passe compromis est désactivée (Authentication → Password). Une case à cocher.
- `/analyse/[id]` redirige vers `/app/rapports/[id]` : bien, mais une ancienne URL partagée publiquement envoie maintenant vers la connexion. Si des rapports ont été partagés, prévoir une page publique en lecture seule (c'est aussi un levier de bouche-à-oreille : « voir le rapport » sans compte).
- Le pied de page dit « Vos données ne sont jamais revendues » ; il manque la ligne « Fait en France · données hébergées en UE » que les acheteurs regardent en 2027 (Supabase région à vérifier).

---

## Plan proposé

**Semaine 1 (une journée de travail, aucun risque)**
1. Polices en local (`next/font/local`) — §3.1
2. Onboarding plus automatique — §1.3
3. Canoniques + JSON-LD + titre d'accueil — §2.1
4. Fond du body, forced-colors, cibles 44 px, nom accessible du titre — §4
5. Événements Vercel — §6
6. CSP en report-only, Permissions-Policy, mot de passe compromis — §7

**Mois 1**
7. Un seul libellé de bouton, un seul bandeau, un seul `→` — §1.2, §5
8. Preuves : compteurs réels + 3 témoignages + avant/après — §1.1
9. Bascule annuelle sur les tarifs — §1.6
10. Composant `Fenetre` commun dans l'espace — §4

**Trimestre**
11. Pages modèles et moteurs générées depuis la base — §2.2 (c'est le chantier qui change la courbe de trafic)
12. Résultat partiel avant inscription, décidé avec les chiffres de l'entonnoir — §1.5
13. Rendu statique des pages publiques — §3.5

Après la semaine 1, on peut viser : performance mobile ≥ 92, LCP < 2,5 s, toujours 100 ailleurs, et un entonnoir mesuré.
