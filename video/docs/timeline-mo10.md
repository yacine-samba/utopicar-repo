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
