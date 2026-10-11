# MO10 « La cote » : chiffres, voix et plans (étape 2)

Brief : `brief-mo10.md` (8 octobre 2026, mode automatique demandé par l'utilisateur). 29,6 s, 1080×1920, 60 i/s, en
boucle. Série recette 47, épisode 2. Variable testée : la forme de l'accumulation (grille d'annonces jumelles au lieu
des notifications de débit). Le déroulé seconde par seconde est dans le brief (section « Timeline seconde par
seconde ») ; ce document porte les sources.

Grille : **120 BPM**, un temps toutes les 0,5 s, une mesure toutes les 2 s. Les neuf jumelles tombent aux instants des
neuf débits de MO5 (6,0 · 6,8 · 7,3 · 7,81 · 8,23 · 8,74 · 9,45 · 9,95 · 11,65). Je recale tout sur la voix à
l'étape 4.

Toutes les pages ci-dessous ont été consultées le **8 octobre 2026**, sauf mention contraire. Aucun nom de site
n'apparaît à l'écran : ils ne servent qu'à sourcer.

## Les chiffres

### Le scénario chiffré

Une Renault Clio III phase 1, 1.2 16V 75 ch essence, boîte manuelle, berline 5 portes, 2009, 165 000 km, en
Île-de-France. Achetée 3 000 € à un particulier ; la cote de la version dit 5 800 €. Il l'affiche à 5 800 €. À
l'écran : « Exemple · prix moyens constatés ».

| Moment | Montant | Compteur « MARGE » | D'où vient le chiffre |
|---|---|---|---|
| La cote | 5 800 € | | cote brute de la version, arrondie (voir « La cote ») |
| L'achat | 3 000 € | 2 800 | hypothèse (voir « L'achat ») |
| Jumelle 1 | 4 600 € | 1 600 | annonce réelle n° 1 |
| Jumelle 2 | 4 500 € | 1 500 | annonce réelle n° 2 |
| Jumelle 3 | 4 250 € | 1 250 | annonce réelle n° 3 |
| Jumelle 4 | 4 000 € | 1 000 | annonce réelle n° 4 |
| Jumelle 5 | 3 990 € | 990 | annonce réelle n° 5 |
| Jumelle 6 | 3 690 € | 690 | annonce réelle n° 6 |
| Jumelle 7 | 3 590 € | 590 | annonce réelle n° 7 |
| Jumelle 8 | 3 490 € | 490 | annonce réelle n° 8 |
| Le gag : « URGENT · cause déménagement » | 3 450 € | 450 | inventé, déclaré (voir « Le gag ») |
| Baisse de prix, J+10 | 4 900 € | 450 (inchangé) | hypothèse, au-dessus de la jumelle la moins chère |
| Annonce remontée | 12 € | 438 | option de visibilité la moins chère, 11,90 € |
| Baisse de prix, J+30 | 3 900 € | 438 (inchangé) | hypothèse |
| Assurance, 6 semaines | 45 € | 393 | 32 €/mois au tiers × 1,4 mois |
| Vente, J+42 | 3 200 € | **143** | hypothèse : sous toutes les jumelles de la grille |

Règle du compteur : MARGE = le prix le plus bas entre son étiquette et les jumelles déjà apparues, moins 3 000, moins
les frais engagés. À la vente : 3 200 − 3 000 − 12 − 45 = **143 €**.

Le calcul du pro sur le même exemple (sa Clio : 2009, 165 000 km) : jumelles retenues (même moteur et même boîte,
même carrosserie, année 2008 à 2010, kilométrage de 145 000 à 185 000 km) = n° 2 (4 500, 2008, 153 500 km), n° 6
(3 690, 2009, 146 000 km), n° 7 (3 590, 2010, 180 500 km). Celle du milieu : **3 690 €**. Marge avant négociation et
frais : 3 690 − 3 000 = 690 €. Sans le critère de carrosserie, le break n° 1 (2010, 158 000 km) entrerait et le
milieu tomberait entre deux cartes : la règle garde la carrosserie.

### La cote

| Ce qu'on affiche | Source | Ce qu'elle dit |
|---|---|---|
| « la cote dit 5 800 » : version la plus proche | [La Centrale, cote Clio III 1.2 16V 75 Authentique 5p, 2009](https://www.lacentrale.fr/cote-auto-renault-clio-iii+1.2+16v+75+authentique+5p-2009.html) | cote brute 6 274 € (hors options) pour 10 840 km/an |
| ordre de grandeur, 2011 | [La Centrale, Authentique 5p Euro5, 2011](https://www.lacentrale.fr/cote-auto-renault-clio-iii+(2)+1.2+16v+75+authentique+5p+euro5-2011.html) ; [Expression Clim 5p Euro5, 2011](https://www.lacentrale.fr/cote-auto-renault-clio-iii+(2)+1.2+16v+75+expression+clim+5p+euro5-2011.html) | « Cote brute : 5 831 € pour 11 550 Km/an » ; 7 345 € pour 13 740 km/an |
| ordre de grandeur, 2010 | [La Centrale, GPL Expression Clim 5p, 2010](https://www.lacentrale.fr/cote-auto-renault-clio-iii+(2)+1.2+16v+75+gpl+expression+clim+5p-2010.html) ; [Euro5](https://www.lacentrale.fr/cote-auto-renault-clio-iii+(2)+1.2+16v+75+gpl+expression+clim+5p+euro5-2010.html) | 5 729 € pour 13 740 km/an ; 5 236 € pour 13 010 km/an |
| la cote passe au-dessus des annonces | [Capcar, « 6 conseils pour bien fixer le prix de vente »](https://www.capcar.fr/blog/6-conseils-pour-bien-fixer-le-prix-de-vente-de-ma-voiture), 30 avril 2018 | « Souvent, elles sont au-dessus du marché réel, d'environ 10 % au moins. » ; elles « ne peuvent constituer l'unique base de la constitution de votre prix » |
| une estimation, pas un prix | [Capcar, « La cote Argus face aux prix sur le marché de l'occasion »](https://www.capcar.fr/blog/la-cote-argus-face-aux-prix-sur-le-marche-de-loccasion), 19 janvier 2026 | « une estimation théorique basée sur des données statistiques » ; conseille de « comparer la cote Argus avec les prix réellement pratiqués sur les plateformes d'annonces » |
| à 15 ans, la cote se fait rare | [L'argus, cote Renault Clio](https://www.largus.fr/cote/voitures-particulieres/renault/clio.html) ; [La Revue Automobile, Clio 3 1.2 16V 2012](https://www.larevueautomobile.com/index.php/cote-gratuite/renault-clio-3-1-2-16v-8149-2012) | cote « pour les voitures de 1 an à 15 ans de mise en circulation » ; « Ce modèle est trop ancien et n'est plus côté. » |

**Limite déclarée** : les pages de cote de La Centrale refusent les robots (HTTP 403). Les montants viennent de
l'extrait de ces pages dans l'index du moteur de recherche, lu le 8 octobre 2026. Leur date de calcul n'est pas
connue, et ils ne sont pas cohérents entre eux (la 2009 cotée plus haut que la 2011) : ils datent sans doute de
plusieurs années. Le 5 800 du film est donc un **exemple** : il tombe dans la fourchette des cotes brutes relevées
pour une Clio III 1.2 16V 75 de 2009 à 2011 (5 236 à 7 345 €), sous celle de la version la plus proche (6 274 €).
Une cote brute vaut pour un kilométrage moyen (10 840 km par an, soit environ 184 000 km à 17 ans ; la Clio de
l'exemple en a 165 000) et ignore l'état de la voiture. Une 2009 a 17 ans : L'argus ne la cote plus (1 à 15 ans), et
La Revue Automobile écrit pour une Clio 3 de 2012 « Ce modèle est trop ancien et n'est plus côté ». Le débutant lit
donc un chiffre ancien ou approximatif, ce qui renforce le sujet. À revérifier à la main avant publication si
quelqu'un a un compte : version Authentique 5p 2009, 165 000 km. Si la cote du jour est plus basse, remplacer 5 800
par elle (arrondie à la centaine) : le compteur part alors de (cote − 3 000) et la suite ne change pas tant que la
cote reste au-dessus de 4 600.

### L'achat

3 000 € à un particulier : **hypothèse**. C'est sous toutes les jumelles de la grille (3 490 à 4 600 €), et dans le
bas des annonces de Clio III relevées par [AutoUncle](https://www.autouncle.fr/fr/voitures-occasion/Renault/Clio%20III)
(page d'octobre 2026) : 2010, 3 177 à 6 940 €, moyenne 4 758 €, kilométrage médian 142 900 km ; 2011, 2 630 à
5 298 €, moyenne 3 888 €, kilométrage médian 200 900 km. La moyenne 2009 de la même page (6 551 €) mélange les
versions sportives : on ne la retient pas.

### Les neuf jumelles (prix demandés)

Huit vraies annonces de Clio III 1.2 16V 75 ch essence, boîte manuelle. À l'écran : prix, année, kilométrage, et un
argument repris de l'annonce pour trois d'entre elles. Aucune photo reprise des annonces (la vignette est une photo
Wikimedia d'une autre Clio III de même carrosserie), pas de titre, pas de nom de vendeur ni de site.
Ce sont des prix demandés, pas des prix de vente : Capcar le rappelle, « toutes les voitures sur les sites d'annonces
sont des voitures en vente, et non des voitures vendues ! ».

| N° | À l'écran | L'annonce réelle | Lieu, vendeur | Publiée le | Source |
|---|---|---|---|---|---|
| 1 | 4 600 € · 2010 · 158 000 km · break · *4 pneus neufs* | « Renault Clio3 ph2 Estate 1.2 16V 75cv authentique », 4 pneus neufs, kit distribution et pompe à eau neufs, CT valide | Romans-sur-Isère (26), professionnel | 7 juin 2026 | [annonce](https://occasion.largus.fr/auto/annonce-3a3faf10-0cd5-438f-a036-9655a6ba9f3f-renault-clio-2010-158000km) |
| 2 | 4 500 € · 2008 · 153 500 km | « renault clio 3 1.2 16v 75 ch » | Paris 16e (75016) | 21 sept. 2026 | [liste agrégée](https://www.leparking.fr/voiture-occasion/renault-clio-3-1.2-16v-75.html) |
| 3 | 4 250 € · 2012 · 162 000 km | « iii generation2 1.2 16V 75 tomtom live 5p » | Paris (75001) | 12 mai 2026 | [liste agrégée](https://www.leparking.fr/voiture-occasion/renault-clio-3-1.2-16v-75.html) |
| 4 | 4 000 € · 2005 · 160 000 km | « clio iii 5 portes 1.2 i 16v 75 cv » | Val-de-Marne (94400) | 21 sept. 2026 | [liste agrégée](https://www.leparking.fr/voiture-occasion/renault-clio-3-1.2-16v-75.html) |
| 5 | 3 990 € · 2011 · 186 000 km · *distribution neuve* | « Renault Clio 1.2 75 Expression Clim », 5 portes, « KIT DE DISTRIBUTION + POMPE A EAU NEUFS », CT OK, garantie 3 mois | Saint-Georges-lès-Baillargeaux (86), professionnel | 5 oct. 2026 | [annonce](https://occasion.largus.fr/auto/annonce-c02e508a-58c7-4f51-987b-769bc4f07cbc-renault-clio-2011-186000km) |
| 6 | 3 690 € · 2009 · 146 000 km | « renault clio 3 phase 2 1.2 16v 75 ch - 146 063 km - ct ok - 5 portes » | Val-de-Marne (94110) | 21 sept. 2026 | [liste agrégée](https://www.leparking.fr/voiture-occasion/renault-clio-3-1.2-16v-75.html) |
| 7 | 3 590 € · 2010 · 180 500 km | « iii generation2 1.2 16v 75 tomtom live 5p » | Paris (75001) | 7 oct. 2026 | [liste agrégée](https://www.leparking.fr/voiture-occasion/renault-clio-3-1.2-16v-75.html) |
| 8 | 3 490 € · 2012 · 162 000 km · break | « renault clio estate 1.2i 16v - 75 euro 5 iii break authentique courroie ok » | Paris 16e (75016) | 29 sept. 2026 | [liste agrégée](https://www.leparking.fr/voiture-occasion/renault-clio-3-1.2-16v-75.html) |

Six annonces sur huit sont en Île-de-France ; les n° 1 et n° 5 viennent de la Drôme et de la Vienne. Les jumelles
du pro (n° 2, 6, 7) sont toutes trois franciliennes. La liste agrégée est une page de résultats qui bouge : une annonce peut avoir disparu à la publication du film. Les prix restent ceux
du 8 octobre 2026.

### Le gag

« URGENT · cause déménagement · 3 450 € · 2009 · 230 000 km » : **inventé**, comme le kebab de MO5. Le prix est
plausible : sur la même liste agrégée, des Clio III 1.2 16V 75 très kilométrées s'affichent à 3 400 € (2011,
210 000 km) et 3 290 € (2012, 185 000 km). La règle des jumelles l'écarte (2009, 230 000 km) : il ne compte pas dans
le prix du pro.

### L'attente et la vente

| Élément | Montant | Source ou hypothèse |
|---|---|---|
| Baisses de prix (5 800 → 4 900 → 3 900) | — | **hypothèse**. Des vendeurs réels baissent ainsi : sur la liste agrégée, 6 500 → 5 800 € (2011, 91 000 km), 3 900 → 3 400 € (2011, 210 000 km), 3 620 → 3 290 € (2009, 145 000 km) |
| Annonce remontée | 12 € | options de visibilité « de 11,90 à 179,90 euros en fonction de la durée » ([Journal de l'Auto](https://journalauto.com/services/leboncoin-commence-a-facturer-les-particuliers/), 15 avril 2025) ; on prend la moins chère. Le même article : dépôt gratuit pour deux annonces de véhicules sur douze mois, payant au-delà |
| Assurance, 6 semaines | 45 € | Clio 3 au tiers : 32 €/mois en valeur moyenne ([Leocare](https://leocare.eu/fr/assurance-auto-en-ligne/renault/clio-3), mis à jour le 7 avril 2026) ; 32 × 1,4 = 44,8 |
| Six semaines (J+42) | — | **hypothèse**. Une Clio met en moyenne 51 jours entre l'annonce et la vente (rotation calculée sur les annonces de La Centrale, [Caradisiac](https://www.caradisiac.com/revente-de-votre-occasion-quels-sont-les-modeles-qui-s-arrachent-et-ceux-qu-il-faudra-brader-le-palmares-caradisiac-219522.htm), 21 décembre 2025, toutes générations) |
| « 3 200 € et je la prends aujourd'hui. » | 3 200 € | **hypothèse** : sous toutes les jumelles de la grille, 250 € sous l'urgent |
| « Personne n'appelle » tant qu'il est au-dessus | — | Capcar 2018 : à un prix trop élevé, « certains acheteurs ne regarderont pas l'annonce ou n'appelleront pas pour en savoir plus » ; Caradisiac 2025 : les modèles populaires partent vite « pour peu qu'ils soient au bon prix » |

### Hors du compteur

Le compteur ne compte ni la carte grise ni la remise en état (le sujet de MO5) : MO10 isole le prix de revente. Avec
la carte grise de l'exemple de MO5 (186 €), la marge finale passerait sous zéro. Le film ne le dit pas ; il reste un
exemple, annoncé comme tel à l'écran. Si un commentaire demande « et la carte grise ? », c'est le bon commentaire.

## La voix

Simon, ElevenLabs `eleven_v3`, voix `mvhJVdVoTWVUtL4keT7W`. Ton de MO5, prise accélérée de 10 % (`atempo`). 76 mots
écrits (« 3 000 » compte pour deux), 22 répliques, environ 22 s de parole. Passée à Stop Slop.

```
Tu l'achètes 3 000, la cote dit 5 800.
Ton téléphone n'a pas lu la cote.
Jour 1, tu l'affiches.
À côté, la même, pneus neufs. Plus récente. Distribution faite.
Et un urgent, cause déménagement.
Tu baisses. Tu baisses encore.
Il négocie. Tu acceptes.
Bénéfice, 143 euros. Même l'urgent était plus cher.
Ceux qui gagnent ne gardent que les jumelles.
Celle du milieu, 3 690. Là, ton téléphone sonne.
La prochaine fois que tu te dis…
```

Texte envoyé à ElevenLabs (nombres en lettres, balises sobres) :

```
[deadpan] Tu l'achètes trois mille, la cote dit cinq mille huit cents. [short pause] Ton téléphone n'a pas lu la cote.
Jour un, tu l'affiches.
À côté, la même, pneus neufs. [short pause] Plus récente. [short pause] Distribution faite.
[short pause] Et un urgent, cause déménagement.
[pause] Tu baisses. [pause] Tu baisses encore.
Il négocie. [short pause] Tu acceptes.
Bénéfice, cent quarante-trois euros. [pause] Même l'urgent était plus cher.
[deadpan] Ceux qui gagnent ne gardent que les jumelles.
Celle du milieu, trois mille six cent quatre-vingt-dix. [short pause] Là, ton téléphone sonne.
La prochaine fois que tu te dis…
```

Crédits estimés : 629 caractères par prise, deux prises, soit environ 1 250 crédits (MO8 : 1 054 pour deux prises
d'un texte comparable). Vérifier à la transcription : « cent quarante-trois », « trois mille six cent
quatre-vingt-dix », aucune balise prononcée.

## Les plans réels (à compléter)

**La voiture** (déjà préparée par l'équipe des assets, crédits dans `assets/photos-mo10/CREDITS.tsv`) :
[Renault Clio III 20090527 front.JPG](https://commons.wikimedia.org/wiki/File:Renault_Clio_III_20090527_front.JPG),
M 93, domaine public. Clio III phase 1, 5 portes, gris platine, trois quarts avant, enjoliveurs. Détourée
(`assets/photos-mo10/car-clio3.png`), contour `car-clio3-contour.js`, losanges, plaque et texte du garage effacés,
retournée (`scripts/photos-mo10.py`). Repli de modèle : Peugeot 207.

**Les vignettes des jumelles** (Wikimedia Commons, une par carte, même carrosserie et même phase que l'annonce) :

| Carte | Annonce | Vignette |
|---|---|---|
| n° 1 | 2010, break | à ajouter : une Clio III Estate phase 2 (catégorie Commons « Renault Clio III Wagon Phase II ») |
| n° 2 | 2008, portes non précisées | `annonce-5.jpg` (phase 1, 5 portes, beige, Thomas doerfer, CC BY-SA 3.0) |
| n° 3 | 2012, 5 portes | `annonce-3.jpg` (phase 2, 5 portes, gris, M 93, domaine public) |
| n° 4 | 2005, 5 portes | à ajouter : une phase 1 5 portes |
| n° 5, 6, 7 | 2011, 2009 phase 2, 2010 ; 5 portes | à ajouter : trois phase 2 5 portes, par exemple [Renault Clio III 5D Phase II front - PSM 2009.jpg](https://commons.wikimedia.org/wiki/File:Renault_Clio_III_5D_Phase_II_front_-_PSM_2009.jpg) (Michge, CC BY-SA 3.0 ou GFDL 1.2) et [Renault Clio III Facelift front 20100410.jpg](https://commons.wikimedia.org/wiki/File:Renault_Clio_III_Facelift_front_20100410.jpg) (M 93, attribution) |
| n° 8 | 2012, break | à ajouter : une deuxième Clio III Estate |
| gag | | pas de photo |

Les photos 3 portes déjà prêtes (`annonce-1`, `annonce-2`, `annonce-4`, `annonce-6`) ne vont sur aucune carte :
aucune annonce de la grille n'est une 3 portes. Crédit dans la légende du post pour chaque photo CC BY ou CC BY-SA
retenue.

**Vidéos Mixkit** (à choisir sur planche `mixkit.py search --sheet`, licence Mixkit) : un téléphone posé sur une
table, écran allumé, sans main (image 0 et boucle) ; route ou ville de nuit (attente, reprise possible de Mixkit 2026
de MO5) ; un téléphone qui vibre sur une table (15,7 s). Les cartes jumelles portent une photo fixe, pas de vidéo : elles font partie de la variable.

**Bruitages Mixkit** (banque `audio/bank/mo10/`) : glissé de carte et petit choc de verre (neuf jumelles), cran des
rouleaux, palettes, papier, trait de stylo, vibration, souffle inversé, feutre, claquements.
# MO10 « Deux voitures » : déroulé, sources et fabrication

Brief : `brief-mo10.md` (8 octobre 2026). 32,6 s, 1080×1920, 60 i/s, en boucle (retour à l'image 0 à partir de
30,3 s). Le film suit la voix mot à mot (`audio/vo-mo10/vo-timing.json`).

## Les chiffres et leurs sources (vérifiés le 8 octobre 2026)

Montants arrondis, mention « Exemple · prix moyens constatés » à l'écran pendant tout le récit et sur la carte finale.

| Frais | Twingo | 207 | D'où vient le chiffre |
|---|---|---|---|
| Carte grise | 152 € (4 CV) | 186 € (5 CV) | cheval fiscal Île-de-France 2026 (34,475 €, abattement de 50 % après 10 ans, [eplaque](https://www.eplaque.fr/carte-grise/prix-cheval-fiscal.html)) + 13,76 € de redevances ([Ornikar](https://www.ornikar.com/permis/autour-voiture/immatriculation/carte-grise/prix)) ; méthode de MO5 et MO9 |
| Contrôle technique | 78 € | 78 € | prix moyen 2026 ([Groupama](https://www.groupama.fr/assurance-auto/conseils/prix-controle-technique/)) |
| Contre-visite | — | 25 € | fourchette 10 à 45 € (même source) |
| Assurance, par mois | 40 € | 40 € × 2 | hypothèse de MO5, dans la fourchette des comparateurs 2026 pour le tiers : 35,57 € ([JeChange](https://www.jechange.fr/assurance/auto/prix)), 36,85 € ([Selectra](https://selectra.info/assurance/guides/auto/prix)), environ 53 € ([LeComparateurAssurance](https://www.lecomparateurassurance.com/assurance-auto/comparatif/prix)) |
| Vidange | 110 € | 110 € | petit moteur essence, 80 à 140 € ([Euromotor](https://euromotor.fr/blog/prix-vidange-voiture-2026-ou-moins-cher/)) |
| 2 pneus posés | 160 € | — | ([Mecazen](https://mecazen.fr/pneus/185-65-r15), [Carter-Cash](https://www.carter-cash.com/pneus/185-65-r15)) |
| Plaquettes avant | — | 140 € | ([Goodmecano](https://www.goodmecano.com/reparation-automobile-par-marque/peugeot/208/remplacement-jeu-plaquettes-de-frein-avant-39)) |
| Nettoyage | 20 € | 20 € | fait soi-même (MO5) |
| Essence, visites | — | 40 € | hypothèse de MO5 |
| Batterie à plat | — | 110 € | hypothèse de MO5 (batterie de citadine) |
| Annonce remontée × 3 | — | 96 € | hypothèse de MO5 (32 € l'option) |
| **Amende, stationnement abusif** | — | **35 €** | plus de 7 jours au même endroit de la voie publique : article R417-12 du Code de la route, contravention de 2e classe, 35 €, fourrière possible ([Legipermis](https://www.legipermis.com/infractions/stationnement-abusif-amende.html), [Ornikar](https://www.ornikar.com/permis/conseils-conduite/stationnement/types/abusif), [Digischool](https://www.digischool.fr/articles/auto/arret-et-stationnement/stationnement-abusif-7-jours-amende-fourriere/)) ; une commune peut fixer une durée plus courte |
| **Total** | **560 €** | **920 €** | |

- Achat : 3 000 € chacune. Revente visée : 4 000 € chacune (calcul du débutant : 2 × 1 000 €).
- Twingo vendue au jour 8, au prix affiché : 4 000 − 3 000 − 560 = **440 €**, soit **55 € par jour**.
- 207 : prix baissé à 3 800 € (jour 18) et 3 700 € (jour 30) ; offre acceptée au jour 40 : 3 600 €.
  3 600 − 3 000 − 920 = **− 320 €**.
- Les deux : 440 − 320 = **120 €** en 40 jours, soit **3 € par jour**.

Les délais de vente, les baisses et l'offre sont l'exemple, pas une moyenne. Rien n'est promis : la mention le dit.

Le compteur « MARGE » (temps du récit) : 2 000 → 1 662 (cartes grises) → 1 506 (contrôles) → 1 426 (assurances) →
1 206 (vidanges) → 1 046 (pneus) → 906 (plaquettes) → 881 (contre-visite) → 841 (nettoyage) ; attente : 809 → 699 →
499 (baisse) → 459 → 424 (amende) → 324 (baisse) → 284 → 252 → 220 ; offre : **120**.

## Les voitures

Photos libres de Wikimedia Commons, **CC0** (aucun crédit obligatoire), traitées par `scripts/photos-mo10.py` : logo
et plaque effacés (un monogramme vu à travers le pare-brise aussi), retournées vers la gauche, détourées (BiRefNet),
bords décontaminés, étalonnées dans la charte, contour vectoriel pour le trait de lumière (`film-mo10/cars-contour.js`).
Aucun modèle n'est nommé à l'écran ni dans la voix.

| Rôle | Photo | Auteur |
|---|---|---|
| la première, vendue en 8 jours | [Renault Twingo 122150.jpg](https://commons.wikimedia.org/wiki/File:Renault_Twingo_122150.jpg) (Twingo II bleue, phase 2) | Trop86 |
| la deuxième, qui reste | [20240602 Peugeot 207.jpg](https://commons.wikimedia.org/wiki/File:20240602_Peugeot_207.jpg) (207 blanche, de profil) | Abraham |

La berline garée derrière la 207 sur la photo d'origine est retirée du masque (zone `erase`).

## Les plans réels

Mixkit, licence « Mixkit Stock Video Free License » (usage commercial libre, sans crédit obligatoire). Vidéos hors dépôt
(`assets/stock/mo10/`), séquences dans `film-mo10/seq/` (hors dépôt), refaites par :

```
python3 ../.claude/skills/motion-studio/scripts/mixkit.py get 241 13260 4716 45755 47585 31961 42136 33324 34140 49219 38501 22916 --out assets/stock/mo10
python3 ../.claude/skills/motion-studio/scripts/mixkit.py seq assets/stock/mo10/mixkit-<id>.mp4 film-mo10/seq/<nom> --start <s> --dur 4
```

| Nom | Mixkit | Début | Ce qu'on y voit | Où |
|---|---|---|---|---|
| signe | 241 | 1,0 | mains qui signent | cartes grises |
| assur | 241 | 6,0 | mains qui signent (autre passage) | assurances |
| ct, ct2 | 13260 | 1,0 / 6,0 | voiture sur un pont élévateur | contrôles, contre-visite |
| moteur, moteur2 | 4716 | 1,0 / 8,0 | mains dans un moteur | vidanges, plaquettes |
| pneu | 45755 | 1,0 | main gantée sur un pneu | pneus |
| eponge | 47585 | 1,0 | éponge sur une carrosserie | nettoyage |
| essence | 31961 | 1,0 | main sur une pompe | essence |
| phone | 42136 | 1,0 | main sur un téléphone | annonce remontée |
| capot | 33324 | 2,0 | capot ouvert au bord de la route | batterie |
| garee | 22916 | 1,0 | rétroviseur d'une voiture garée, ombres d'arbres | amende |
| cles | 34140 | 1,0 | main qui tend des clés | ventes |
| jours | 38501 | 2,0 | des jours rayés sur un calendrier | fond de l'attente, flou |
| calc | 49219 | 1,0 | calculs au crayon | fond de la carte finale, flou |

## La voix (étape 4)

Simon (`mvhJVdVoTWVUtL4keT7W`), eleven_v3, **une seule génération** (generations_count = 1, 580 crédits, estimation
faite avant), ouverture B dite à la fin de la même prise. Prise brute : 40,8 s (`audio/vo-mo10/takeA.mp3`).

```
Tu en achètes deux, mille de marge chacune : deux mille. [deadpan] Ton voisin, lui, compte les jours.
Jour un. Deux cartes grises, deux contrôles, deux assurances.
La première part en huit jours.
La deuxième… [sighs] reste.
Il négocie. Tu acceptes. Bénéfice : [short pause] cent vingt euros. [deadpan] Moins qu'avec une seule.
Ceux qui gagnent comptent en jours.
Ta première : cinquante-cinq euros par jour. Les deux ensemble : trois.
La deuxième, tu l'achètes au jour huit.
La prochaine fois que tu te dis…
[pause]
Ta deuxième voiture va manger la marge de la première.
```

- **Mots horodatés** par faster-whisper *medium* (`scripts/words-mo10.py`) : il relit le texte exact. Bornes recalées
  sur l'enveloppe (mesure à 20 ms) : « Bénéfice » (medium le plaçait 0,8 s trop tard), le soupir (16,16-16,72 s),
  « reste », « Ta », le début de l'ouverture B.
- **Pose** (`scripts/vo-mo10.py`) : × 1,2 partout (pas plus : MO9 à × 1,25 jugé « trop rapide »), 0,2 à 0,45 s entre
  les phrases, 2,4 s de silence pour l'attente, 0,6 s sur « 120 € ». « Jour un. » est dans la prise mais pas dans le
  film : la parole tient en 24,2 s (MO9 : 23,8 s) et le film en 32,6 s. Contrôle : la pose retranscrite par *medium*
  redonne tous les mots.
- Ouverture B posée à part (`vo-placed-B.wav`) : la phrase B à 0,10 s à la place des deux premières répliques.

```
 0,10  Tu en achètes deux, mille de marge chacune : deux mille.
 3,36  Ton voisin, lui, compte les jours.
 5,82  Deux cartes grises, deux contrôles, deux assurances.
 9,97  La première part en huit jours.
11,85  La deuxième… (soupir) reste.
16,34  Il négocie. Tu acceptes.
18,34  Bénéfice : 120 euros.
20,74  Moins qu'avec une seule.
22,58  Ceux qui gagnent comptent en jours.
24,40  Ta première : 55 euros par jour.
26,60  Les deux ensemble : 3.
28,18  La deuxième, tu l'achètes au jour 8.
30,75  La prochaine fois que tu te dis…
```

## Le déroulé (temps du film, calés sur les mots)

| t (s) | Image | Voix |
|---|---|---|
| 0,0 | **Image 0** : « 2 × 1 000 € » en Clash ; en bas, les deux voitures, contours tracés à la lumière (Twingo devant, 207 derrière). | « Tu en achètes deux, » |
| 0,6 · 1,4 | La lumière passe sur « 2 × » sur « deux », puis sur « 1 000 € » sur « mille ». | « mille de marge chacune : » |
| 2,7 | « = 2 000 € » s'écrit à la lumière, puis le « ? » en Fraunces. | « deux mille. » |
| 3,6 → 5,2 | Sur « voisin », la plume trace des bâtons de prisonnier sous le calcul, cinq par cinq, de plus en plus vite (15). « Ton voisin *compte les jours.* » | « Ton voisin, lui, compte les jours. » |
| 5,4 | Le calcul se replie vers le haut ; palettes « JOUR 1 » ; le compteur « MARGE 2 000 € » se construit. | |
| 6,0 · 7,1 · 7,9 | Débits « Cartes grises − 338 € », « Contrôles techniques − 156 € », « Assurances − 80 € » : tampon « × 2 », un point s'allume sur chaque voiture. | « Deux cartes grises, deux contrôles, deux assurances. » |
| 8,4 → 9,7 | Pluie : vidanges (× 2), 2 pneus (Twingo), plaquettes et contre-visite (207), nettoyage (× 2). Le compteur passe sous 1 000 (906), puis 841. | |
| 10,1 → 10,9 | JOUR 1 → JOUR 8 ; les premiers bâtons apparaissent sur les vitres de la 207. La Twingo démarre et sort par la gauche. « Virement reçu + 4 000 € », tampon « vendue ✓ ». | « La première part en huit jours. » |
| 11,8 | La 207 seule vient au centre et grandit. « Annonce · 4 000 € ». La nuit tombe, le calendrier qu'on raye passe flou derrière. | « La deuxième… » |
| 12 → 16 | JOUR 9 → JOUR 40, de plus en plus vite ; un bâton par jour sur les vitres (40) ; la poussière monte. Débits : annonce remontée (j. 12), batterie (j. 15), essence (j. 19), assurance (j. 31), annonce (j. 34, 37). Baisses : 4 000 → 3 800 (j. 18), → 3 700 (j. 30). Le gag seul (j. 26) : « Stationnement abusif · Amende − 35 € », tampon « le voisin a compté ». | (soupir) « reste. » puis silence |
| 16,3 | Bulle : « 3 600 € et je la prends *ce soir.* » | « Il négocie. » |
| 17,4 | « D'accord. » | « Tu acceptes. » |
| 18,1 | « Virement reçu + 3 600 € » ; le compteur roule de 220 à 120. | « Bénéfice : » |
| 19,3 | « BÉNÉFICE · LES DEUX 120 € » plein cadre, tout le reste s'éteint (la seule pause). | « cent vingt euros. » |
| 20,8 | « *Moins qu'avec une seule.* » s'écrit à la lumière. | « Moins qu'avec une seule. » |
| 21,8 → 22,5 | Rembobinage : la Twingo revient, bâtons et poussière s'effacent, les débits remontent, le compteur remonte. | |
| 22,6 | Fond chaud (calculs flous). « Ceux qui gagnent / *comptent en jours.* » | « Ceux qui gagnent comptent en jours. » |
| 24,3 → 27,6 | Carte « MARGE ÷ JOURS » : « Ta première · 440 € ÷ 8 jours » → compteur **55 € / jour** ; « Les deux ensemble · 120 € ÷ 40 jours » → **3 € / jour**. | « Ta première : 55 euros par jour. Les deux ensemble : 3. » |
| 28,2 | « La deuxième, tu l'achètes *au jour 8.* » | « La deuxième, tu l'achètes au jour 8. » |
| 30,3 → 32,6 | La carte s'efface ; le calcul et les deux voitures reviennent dans le cadre exact de l'image 0. | « La prochaine fois que tu te dis… » |

Zones sûres : rien de lisible au-dessus de y = 246 ; compteur 272-494, palettes 584-700, débits 800-984, annonce
1009-1081, voitures jusqu'à y = 1461 (au-dessus de 1480, avertissement de MO5 corrigé) ; carte finale 500-1034,
verdict 1170-1330, mention 1404.

## Publication (proposition)

- Ouverture publiée : A. Même créneau que MO5 (jour et heure à noter dans le journal de la recette).
- Légende, sans appel à l'action : « Deux voitures d'un coup pour aller plus vite en achat-revente : le calcul que
  personne ne fait. Exemple chiffré, prix moyens constatés. »
- Hashtags (jeu A débutants de `docs/hashtags_test.md`) : #achatrevente #achatreventevoiture #voitureoccasion #entrepreneur
- Couverture : `renders/poster-mo10.png` (5,25 s : le calcul complet, les bâtons du voisin, les deux voitures).
- Sous-titres : `renders/9x16-mo10.srt`.
