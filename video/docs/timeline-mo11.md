# MO11 « La préparation » : chiffres sourcés, voiture et repères (étape 2, minutage provisoire)

Brief : `brief-mo11.md` (révisé le 9 octobre 2026 après trois relectures). Film visé : environ 30,5 s, 1080×1920,
60 i/s, en boucle (retour à l'image 0 à partir de 27,8 s). Grille provisoire : **120 BPM**, un temps toutes les 0,5 s,
une mesure toutes les 2 s, comme MO5 et MO9. Le minutage de ce document est **provisoire** : ElevenLabs a bloqué le
compte (« Unusual activity… Free Tier access has been disabled »), la voix n'est pas générée. Le film tourne sur les
temps du brief jusqu'à la prise de Simon, puis se recale mot à mot (`audio/vo-mo11/vo-timing.json`, méthode de MO9 et
MO10).

Toutes les pages ci-dessous ont été lues ou relues le **9 octobre 2026**. À l'écran pendant tout le récit :
« Exemple · prix moyens constatés ». Les coûts sont pris au milieu des fourchettes citées, ce que la mention annonce ;
les prix de vente sont ceux de l'exemple, bornés par une annonce relevée (repère « Propre, chez un pro · 3 490 € »).
Aucun site, aucune enseigne, aucun modèle n'est nommé à l'écran ni dans la voix.

## La voiture

Une **Renault Clio III phase 1, 5 portes, gris platine, enjoliveurs sur jantes tôle**, déjà détourée dans la
bibliothèque libre : `assets/cars-libres/car-clio3.png` (1 809 × 1 232, RGBA ; trois quarts avant, roues droites,
l'avant regarde à gauche, elle entre par la droite comme la Polo de MO5), contour
`assets/cars-libres/car-clio3-contour.js` (`window.CAR_CLIO3_CONTOUR`), fabriquée par `scripts/cars-libres-clio3.py`
(logo de calandre, losanges d'enjoliveurs, vignette de pare-brise, support et plaque effacés). Luminance moyenne de la
carrosserie détourée : 102 sur 255 (mesurée le 9 octobre) : une salissure réaliste ne ferait que l'assombrir, d'où la
salissure exagérée ci-dessous.

| Photo | Auteur, licence | Fichier |
|---|---|---|
| [Renault Clio III 20090527 front.JPG](https://commons.wikimedia.org/wiki/File%3ARenault_Clio_III_20090527_front.JPG) | M 93, **domaine public** (aucun crédit obligatoire) | `assets/cars-libres/car-clio3.png` |

Aucune annonce voisine n'est montrée (révision du 9 octobre) : les vignettes `clio3-annonce-1` à `-6` ne servent pas.

Motorisation de l'exemple : 1.2 16V 75 ch essence, monte en **165/65 R15** ([Allopneus, Clio III](https://www.allopneus.com/vehicule/renault/clio/clio-iii)),
donc des enjoliveurs de **15 pouces**. Rien ne le dit à l'écran (aucun modèle nommé).

**Les états de la voiture** (9 octobre 2026) : `python3 scripts/dirty-mo11.py` → `assets/photos-mo11/`
(`--check <dossier>` : la voiture sale, lavée et propre sur fond #08070a, plein cadre et à 200 px de large). Bruit à
graine fixe (`default_rng(11)`), même résultat à chaque lancement ; méthode de `scripts/dirty-mo9.py` et
`scripts/polo-dirty-mo6.py`, copiée, pas importée. Les calques raster sont des PNG RGBA de la taille de la photo
(1 809 × 1 232), à poser sur la voiture propre dans cet ordre, chacun effacé par sa ligne de partage ; la rayure et les
enjoliveurs sont des SVG de même `viewBox` (pixels de la photo), nets à × 1,6. Zones mesurées sur l'alpha des calques :

| Fichier | Ce qu'il montre | Zone (x, y, pixels de la photo) | Coup |
|---|---|---|---|
| `car-clio3.png`, `car-clio3-contour.js` | la voiture propre et son contour de lumière (`window.CAR_CLIO3_CONTOUR`), copies de `assets/cars-libres/` | toute la photo | tout le film ; l'état « après » de chaque coup |
| `clio3-poussiere.png` | la voiture entière, sale, **opaque sur la carrosserie** (elle remplace la propre tant que le lavage n'est pas passé) : voile de poussière beige mat en plaques, boue brune sur le tiers bas et autour des passages de roue, projections, coulures sombres sous les vitres latérales et sous les optiques, vernis sans éclat, « LAVE-MOI » tracé au doigt (la peinture réapparaît dans les lettres) | toute la carrosserie ; « LAVE-MOI » dans le quadrilatère (1 400, 520) (1 600, 482) (1 600, 570) (1 402, 628) ; coulures x 1 400 → 1 700 sous la ligne des vitres et x 60 → 1 090 sous les optiques | image 0 ; hook (l'embout aspire une bande x 1 150 → 1 650, y ≈ 480 → 600, « LAVE-MOI » part avec) ; lavage (ligne de partage sur toute la voiture) ; boucle |
| `clio3-phares.png` | voile jaune saturé et laiteux, craquelé, reflets de l'optique gardés | x 38 → 1 123, y 448 → 825 (grand phare x 672 → 1 117, petit phare x 44 → 194) | phares |
| `clio3-pare-brise.png` | voile gris sur la face intérieure du pare-brise, traces d'essuyage en arcs ; sièges devinables derrière ; trois auréoles sur le dossier passager (round 2 : fond #c49a5c, liseré #5c4128, voile éclairci devant elles) | x 498 → 1 369, y 66 → 392 | sièges |
| `clio3-vitres.png` | voile jaunâtre du tabac sur les vitres latérales, plus dense sur les bords et en haut | x 1 385 → 1 695, y 65 → 336 | odeur |
| `clio3-rayure.svg` | rayure claire, effilée, interrompue deux fois (la clé a sauté), halo de vernis rayé, ombre fine sur le bord haut du sillon ; deux éraflures plus fines et quatre micro-rayures | trait principal de (1 165, 657) à (1 346, 592) ; le tout x 1 158 → 1 346, y 591 → 677 | rayure ; revient au rembobinage ; l'ongle la traverse au verdict |
| `clio3-enjoliveurs.svg` | les enjoliveurs à l'achat : **la photo des enjoliveurs salie pixel par pixel** (PNG opaque intégré, à la résolution de la photo : rayons gardés, creux noircis par la poussière de frein, voile brun mat, plus dense vers le bord, bord roulé compris), puis en vectoriel le bord frotté, l'éclat manquant et la fissure du rayon fendu | avant : image x 1 179 → 1 333, y 820 → 1 162 (ellipse de centre (1 256, 991), demi-axes 67 × 169, 10°) ; arrière : x 1 723 → 1 777, y 513 → 713 | enjoliveurs ; reviennent au rembobinage |
| `clio3-enjoliveurs-neufs.svg` | le reflet des neufs : un arc de lumière sur le bord, rien d'autre (la photo montre déjà des enjoliveurs gris argent propres, losanges effacés) | mêmes ellipses | enjoliveurs (après) |
| `clio3-parechocs.png` (round 2) | le coin avant gauche du bouclier frotté sur une bordure : vernis abrasé blanchi, stries dans le sens du frottement, plastique noir à nu au coin, bord de vernis éclaté | lèvre basse x 30 → 280, y 896 → 1 086 | jamais réparé : la 3e règle (« Pare-chocs · 600 € ✗ »), entouré à la lumière sur « Le pare-chocs, », ✗ sur « tu le laisses. » ; visible tout le film, photo 1 comprise |
| `CREDITS.tsv` | crédits de la photo, écrits par le script | | |

États composés (`--check`) : **sale** = propre + poussière + phares + pare-brise + vitres + rayure + enjoliveurs ;
**lavée** (13:10, rembobinage, verdict) = propre + phares + pare-brise + vitres + rayure + enjoliveurs ; **propre** =
propre + enjoliveurs neufs. Regardés le 9 octobre : à 200 px de large, « sale » se lit d'un coup d'œil (voile beige,
boue en bas, phares jaunes) ; à × 1,6 la rayure se lit comme une rayure, l'enjoliveur sale garde ses rayons. Ce qui a
changé ce jour-là : l'enjoliveur sale n'est plus une ellipse brune translucide (elle se lisait comme un enjoliveur
doré), et la rayure n'est plus un trait d'épaisseur constante qui ondulait point par point. Planches :
`renders/review/mo11-etats.jpg` (sale, lavée, propre), `mo11-etats-200px.png`, `mo11-etats-zoom.jpg` (enjoliveurs et
rayure à × 2 et × 3).

Aucun trait d'odeur, aucune pastille posée sur la voiture : l'odeur et les sièges passent par le voile des vitres et
par la vidéo de la notification.

**Crédits** : `assets/photos-mo11/CREDITS.tsv`. Licence relue sur la page File: le 9 octobre 2026 : « I, the copyright
holder of this work, release this work into the public domain » (modèle PD-self), auteur M 93 (Matthias93), photo du
27 mai 2009. Rien n'est dû. Les plans Mixkit (vidéo et sons) n'en demandent pas non plus.
**Légende du post** : aucun crédit obligatoire. Par courtoisie, une ligne à la fin, sans nommer le modèle : « Photo de
la voiture : M 93, domaine public (Wikimedia Commons), salie et retouchée pour l'exemple. »

**La ligne de partage** (`lib/kit47-etats.js`, `etats.split`) : une ligne verticale de lumière traverse la zone du
coup de gauche à droite en 0,7 s : 0,2 s jusqu'au milieu, arrêt de 0,3 s (moitié sale, moitié propre visibles
ensemble), 0,2 s jusqu'au bout. Le calque « sale » est masqué à droite de la ligne. Pendant l'arrêt, la caméra et le
compteur continuent de bouger : aucun plan figé.

**Le soleil bas** n'est pas un calque : `etats.sun` étalonne la photo propre selon sa luminance (hautes lumières
dorées, ombres froides), tire l'ombre portée du masque alpha (longue, qui tourne avec l'heure) et fait courir un reflet
rasant sur le capot, masqué sur les zones claires. La photo a été prise par temps couvert : un simple filtre orange
ne ferait pas une lumière. Contrôle sur image fixe avant d'animer : `CUT=mo11 node scripts/at.mjs 13.6
renders/review/mo11-soleil.jpg`. La photo 1 se fait par une avancée de la caméra avec parallaxe (ombre au sol et
décor sur des calques séparés) : pas d'orbite, la photo est plate et déjà en trois quarts avant, les roues ne se
braquent pas.

**L'image 0** se contrôle avant d'animer : `CUT=mo11 node scripts/render.mjs --phone` (`renders/phone-mo11.png`), puis
`CUT=mo11 node scripts/at.mjs 0 renders/review/mo11-image0.jpg`, réduite à 200 px de large à côté de la même image
avec la voiture propre. On doit lire « sale » en une seconde.

## Le scénario chiffré

### La voiture et son prix

Une Clio III 1.2 16V 75 ch de 2008, environ 150 000 km, sale : sièges tachés, odeur de tabac, phares jaunis, rayure
sur l'aile avant, enjoliveurs ternes. **Achetée 2 000 € à un particulier** : hypothèse déclarée, pas une cote (environ
800 € sous le particulier relevé ci-dessous, 1 490 € sous le professionnel).

Les annonces du même modèle, relevées le 9 octobre 2026 :

| Annonce | Kilométrage | Prix | Vendeur | État du lien |
|---|---|---|---|---|
| [Clio 3 1.2 75 Expression 5 portes, 2008](https://occasion.largus.fr/auto/annonce-f4c52656-bfb2-414c-aee5-0cd8bd20f88e-renault-clio-2008-152000km), publiée le 7 juin 2026, « véhicule très propre et non fumeur » | 152 000 km | **3 490 €** | professionnel, garantie moteur et boîte de 3 mois | lu le 9 octobre |
| [Clio 1.2 16V 75 Campus Dynamique, 02/2008, 3 portes](https://www.autoscout24.fr/offres/renault-clio-1-2-16v-75-campus-dynamique-essence-cat_ma60mo1961-4c0a5e95-3ce6-4f2c-909a-5588e4477141), contrôle technique de mai 2026, distribution refaite | 167 000 km | **2 799 €** | particulier | lu le 9 octobre |
| Clio III 1.2 16V 75 Expression, 2008, vue dans les résultats de recherche ([lien](https://occasion.largus.fr/auto/annonce-189794b4-4ec5-488b-846d-5edf4cc4288c-renault-clio-2008-150500km)) | 150 500 km | 3 990 € | professionnel, garantie 12 mois | erreur 404 à la lecture : retirée |

L'annonce à 3 490 € porte le **repère fixe à l'écran** (« Propre, chez un pro · 3 490 € ») : le compteur monte vers
lui et reste dessous. Les annonces de la version du 8 octobre à 3 450 € (retirée) et 3 500 € (sans lien) sont
retirées de ce document. Le prix final de l'exemple (3 330 € affichés, 3 300 € de vente) reste sous le professionnel
avec garantie et au-dessus du particulier à 3 portes et 167 000 km : c'est le prix d'un particulier dont la voiture
est propre.

### Le plan du débutant

Revendre **telle quelle à 2 900 €** : 900 € au-dessus de l'achat, sans rien toucher.

### La préparation : un samedi après-midi, 113 €

Tout se fait soi-même, de 13 h à 16 h 30. Montants pris au **milieu** des fourchettes (relecture des faits : la
version du 8 octobre prenait le bas, 103 €).

| Coup (ordre de l'image) | Montant | D'où vient le chiffre |
|---|---|---|
| Lavage haute pression | **8 €** | « Le coût d'un lavage haute pression est de 4 à 12 € environ » ([TotalEnergies, prix du lavage](https://services.totalenergies.fr/particuliers/entretien-vehicule/lavage/prix-et-modalites-achat-lavage), page sans date) : le milieu |
| Phares : kit de rénovation avec vernis de finition | **25 €** | kits « vendus entre 15 et 40 euros » ; sans couche de finition, « le jaunissement réapparaît souvent sous six à douze mois » ([Pièces et Pneus](https://blog.piecesetpneus.com/?p=158097), 9 octobre 2026). 25 € : à peu près le milieu (l'article ne dit pas que les kits avec vernis coûtent plus). Chez un professionnel : 44 à 121 € pour un Kangoo ([GoodMecano, Kangoo](https://www.goodmecano.com/reparation-automobile-par-marque/renault/kangoo/renovation-des-optiques-de-phare-avant-4338198)), pas de page Clio III équivalente lue |
| Sièges : injecteur-extracteur loué une journée, nettoyant textile | **30 €** | location « pour environ 10 à 50 € par jour » ([Companeo](https://www.companeo.com/aspirateur-industriel/guide/injecteur-extracteur-professionnels), mis à jour le 27 août 2026) ; contre le tabac, « utilisez un nettoyeur injecteur-extracteur » ([Pièces et Pneus](https://blog.piecesetpneus.com/?p=155596), 9 octobre 2026). Montant : le milieu, produit compris |
| **Sous les sièges : 3,40 €** | trouvé | **le gag** : des pièces (au moins quatre : 2 € + 1 € + 0,20 € + 0,20 €) et une frite, trouvées en aspirant. Sur une carte « trouvé », pas une notification bancaire. Petit, vrai pour tous ceux qui ont nettoyé une voiture d'occasion, annoncé comme exemple |
| Odeur : filtre d'habitacle à **charbon actif** | **15 €** | les filtres à charbon sont « plus efficaces pour retenir les odeurs et les pollens, mais aussi plus onéreux » ; filtre de Clio 3 « à partir d'environ 10 € pour les modèles de base », « jusqu'à 30 € ou plus » ([AD](https://www.ad.fr/guides/guide-conseil/tout-savoir-sur-la-climatisation-auto/filtre-habitacle-clio-3), page sans date) ; filtres à charbon pour Clio III de 13,17 € à 19,74 € (relevé Oscaro dans les résultats de recherche, la page refuse la lecture directe) |
| Rayure : polish | **15 €** | kits de 4,99 à 34,90 €, la plupart entre 15 et 30 € ([Touslesprix](https://www.touslesprix.com/achat,kit-efface-rayures-auto.html)) ; « quelques dizaines d'euros tout au plus » ([Caradisiac](https://www.caradisiac.com/faut-il-remettre-la-carrosserie-en-etat-avant-de-revendre-sa-voiture-d-occasion-195473.htm), 2 avril 2022). Valable si la rayure n'a pas traversé le vernis : test de l'ongle, plus bas |
| Enjoliveurs : jeu de 4, 15 pouces | **20 €** | lot de 4 enjoliveurs 15 pouces à 22,90 € chez un centre auto, offre de juin à août 2026 ([Promocatalogues](https://www.promocatalogues.fr/magasins/carter-cash/offres/lot-de-4-enjoliveurs-15-pouces-offre-62497847/)), 16,90 € en promotion ailleurs (relevé Bonial dans les résultats de recherche) ; « remplacer les enjoliveurs trop abîmés » avant de vendre ([L'argus](https://www.largus.fr/actualite-automobile/vendre-sa-voiture-comme-un-pro-2201371.html), 2012) |
| Photo 1 : trois quarts avant, soleil bas dans le dos | **0 €** | règles plus bas |
| **Total** | **113 €** | **109,60 €** avec les pièces trouvées sous les sièges |

**L'odeur de tabac se traite en deux temps**, comme le film les enchaîne (coup « sièges » puis coup « odeur ») : dans
les tissus d'abord, parce que l'odeur « pénètre aisément les fibres textiles, les mousses des sièges » et que « les
sièges en tissu retiennent fortement les odeurs de cigarette » (injecteur-extracteur ; bicarbonate sur les sièges, la
moquette, les tapis et le ciel de toit, « au minimum quatre heures ») ; puis dans la ventilation, parce qu'un filtre
saturé « diffuse lui-même des odeurs désagréables ». Pas de désodorisant, qui masque « temporairement les odeurs sans
les traiter en profondeur » ([Pièces et Pneus](https://blog.piecesetpneus.com/?p=155596), 9 octobre 2026). Le film
ne dit pas qu'un filtre seul retire l'odeur.

### Le prix affiché qui monte

C'est la variable de l'épisode : chaque coup fait monter le prix qu'il peut afficher. **Le compteur ne se pose que
deux fois** : à **2 900 €** (le plan) et à **3 330 €** (après le dernier coup). Entre les deux, il roule sans
s'arrêter : chaque débit lui donne une impulsion et le coup suivant arrive avant l'arrêt ; on lit le chiffre des
centaines monter (9 → 0 → 1 → 2 → 3), les dizaines et les unités restent en mouvement. Aucune valeur n'est attribuée à
un coup : aucune source ne chiffre ce que rapporte un phare ou un enjoliveur pris seul, et le film ne le prétend pas
(révision du 9 octobre ; la version du 8 posait le compteur sur 3 000, 3 110, 3 160, 3 240 et 3 290).

**+ 430 €, soit + 14,8 %** sur le prix « telle quelle ». L'exemple est un **cas favorable**, et le film l'annonce
comme exemple. Ce qui porte l'ordre de grandeur :

- [Caradisiac](https://www.caradisiac.com/faut-il-remettre-la-carrosserie-en-etat-avant-de-revendre-sa-voiture-d-occasion-195473.htm)
  (Manuel Cailliot, 2 avril 2022) : un polish, « quelques dizaines d'euros tout au plus », peut « couper court à des
  négociations qui feraient baisser le prix de plusieurs centaines d'euros » ; pour une Clio 3 dont « la cote de
  marché ressort à environ 3 900 € » avec « environ 1 000 € de remise en état » de carrosserie, l'article conseille
  d'« accepter de baisser le prix de 500, voire 600 € ». Les défauts visibles valent donc, sur ce modèle, plus que les
  430 € de l'exemple.
- [Toyota, car staging](https://www.toyota.fr/occasions/nos-conseils/vente-voiture-occasion/car-staging-comment-nettoyer-sa-voiture-pour-une-vente)
  (page sans date, © 2026) : « Une voiture propre, réparée et attrayante peut se vendre jusqu'à 15 % plus cher »,
  chiffre sans source, qui compte aussi des réparations (débosselage, climatisation, vitres électriques) ; l'exemple,
  qui ne fait que de la préparation, est **au plafond** de cette fourchette. La même page dit que la préparation
  « réduit le temps de vente en séduisant rapidement les acheteurs », ce qui soutient les quatre jours de l'exemple.
- [CapCar](https://www.capcar.fr/blog/3-conseils-pour-valoriser-mon-vehicule-avant-la-vente) (2 janvier 2022) : une
  voiture mal préparée « offre aux acheteurs des arguments pour négocier son prix à la baisse ».
- Le repère : l'annonce professionnelle à 3 490 € (plus haut). Le compteur reste dessous.

La mention à l'écran dit « Exemple · prix moyens constatés » : les coûts sont des prix moyens, la hausse est celle de
l'exemple, bornée par une annonce réelle.

### La vente

Photo 1 prise samedi à 16 h 30, annonce à **3 330 €**. Au jour 4 : « 3 300 et je la prends. » Il accepte.
**Vendue 3 300 €, soit + 400 € sur son plan « telle quelle »** (3 300 − 2 900). Ce « + 400 € » compare deux prix de
vente, **pas une marge** : le compteur passe de « PRIX AFFICHÉ » à un écart, et l'écran le dit (« SUR TON PLAN » au-dessus,
« − 109,60 € de prépa » dessous, en 44 px au moins, pendant toute la pause). Une fois la préparation payée, il lui reste
**290,40 €** de plus que son plan, pour un après-midi : « Ton samedi le mieux payé. » Le délai de quatre jours et
l'offre sont l'exemple, pas une moyenne : aucun gain n'est présenté comme garanti.

Les autres frais d'une revente (carte grise, contrôle technique, assurance : MO5 et MO9) sont les mêmes que la
voiture soit vendue sale ou propre : le film ne les montre pas et ne parle pas de marge. Avec l'achat à 2 000 €, le
plan « telle quelle » laisse 900 € avant ces frais.

### La photo 1

| Règle | Source |
|---|---|
| L'acheteur regarde d'abord la photo 1 : « ce n'est pas votre texte : c'est la première photo » | [CapCar, photos pour l'annonce](https://www.capcar.fr/blog/photos-voiture-pour-annonce), 29 juillet 2026 (blog d'un vendeur de voitures ; son « moins de trois secondes » par annonce n'a pas de source, il ne va pas à l'écran) |
| Trois quarts avant, « la photo principale qui donne du volume au véhicule », prise à hauteur des phares ; l'angle qui montre « environ 75 % du côté de la voiture » | [CapCar](https://www.capcar.fr/blog/photos-voiture-pour-annonce) ; [Autohero](https://www.autohero.com/fr/vendre-sa-voiture/photos-pour-vendre-voiture/), 21 octobre 2024 ; photo principale en trois quarts avant aussi chez [LegiPermis](https://www.legipermis.com/blog/2025/10/10/meilleures-photos-pour-vendre-sa-voiture/) (10 octobre 2025). Autohero conseille aussi de tourner les roues vers l'objectif : la photo libre ne le permet pas, le film ne le montre pas |
| Soleil bas : « tôt le matin ou en fin d'après-midi, quand la lumière est douce et dorée » ; le soleil derrière le photographe, pas face à l'objectif ; pas le plein soleil de midi (« ombres dures et reflets aveuglants ») | [CapCar](https://www.capcar.fr/blog/photos-voiture-pour-annonce) |
| « Le moment idéal pour photographier un véhicule est pendant l'heure dorée », juste après le lever ou avant le coucher du soleil ; « de préférence en fin de journée » | [Autohero](https://www.autohero.com/fr/vendre-sa-voiture/photos-pour-vendre-voiture/) |
| Laver avant la séance photo (« Laver la carrosserie et sécher pour éviter les traces d'eau visibles au soleil ») | [CapCar](https://www.capcar.fr/blog/photos-voiture-pour-annonce), [Autohero](https://www.autohero.com/fr/vendre-sa-voiture/photos-pour-vendre-voiture/) |

**L'heure** (révision du 9 octobre). La version du 8 octobre mettait la photo à 18 h 30, juste seulement à la
mi-octobre. La vidéo sera publiée au plus tôt fin octobre, après le passage à l'heure d'hiver (25 octobre 2026) :
18 h 30 tomberait alors de nuit. Coucher du soleil à Paris ([Calendrier-365, octobre](https://www.calendrier-365.fr/calendrier/2026/octobre.html),
[novembre](https://www.calendrier-365.fr/calendrier/2026/novembre.html)) :

| Date | Coucher | 16 h 30, c'est… |
|---|---|---|
| 15 octobre | 19:02 | (heure d'été) |
| 24 octobre | 18:45 | (heure d'été) |
| 25 octobre | 17:43 | 1 h 13 avant |
| 31 octobre | 17:32 | 1 h 02 avant |
| 7 novembre | 17:21 | 51 min avant |
| 14 novembre | 17:12 | 42 min avant |
| 21 novembre | 17:04 | 34 min avant |
| 28 novembre | 16:58 | 28 min avant |

L'histoire se passe donc de **13 h à 16 h 30** (palettes et voix : « Samedi, treize heures. »), valable de fin octobre
à janvier. La règle générale, elle, est écrite sous les palettes : « **l'heure avant le coucher** » (l'heure dorée
d'Autohero), pour qui verra la vidéo en été. Le rembobinage s'arrête à 13:10, juste après le lavage.

### Ce qui ne rapporte pas (le renversement)

| Règle ou montant | Source |
|---|---|
| **Règle des 15 %** : « sur une auto à moins de 5 000 €, si les travaux dépassent 15 % de la valeur de l'auto », « il vaut mieux la laisser en l'état » « et accepter la négociation, ou afficher d'entrée de jeu un prix plus bas ». **Ici : 15 % de 3 300 € ≈ 495 €**, écrit « 500 € max » | [Caradisiac](https://www.caradisiac.com/faut-il-remettre-la-carrosserie-en-etat-avant-de-revendre-sa-voiture-d-occasion-195473.htm), Manuel Cailliot, 2 avril 2022 |
| Pare-chocs remplacé et peint, en atelier de la marque : « entre 600 € pour les moins chers, et plus de 1 000 € » → au-dessus de 495 € : **en l'état** (à l'écran : « pare-chocs 600 € ✗ ») | [Caradisiac](https://www.caradisiac.com/faut-il-remettre-la-carrosserie-en-etat-avant-de-revendre-sa-voiture-d-occasion-195473.htm) |
| Remplacement « d'une portière, d'un capot, d'un hayon, d'une aile » : « entre 700 € et plus de 1 000 € » → en l'état (gardé ici, pas à l'écran : la carte tient en trois lignes) | [Caradisiac](https://www.caradisiac.com/faut-il-remettre-la-carrosserie-en-etat-avant-de-revendre-sa-voiture-d-occasion-195473.htm) |
| Peinture neuve d'un élément : « entre 300 et 350 € », soit 9 à 11 % de 3 300 € : **sous** le seuil. Elle n'est donc pas « ce qui ne rapporte pas » (la version du 8 octobre l'écrivait, à tort). L'article la dit « parfois encore rentable par rapport à un remplacement pur et simple » | [Caradisiac](https://www.caradisiac.com/faut-il-remettre-la-carrosserie-en-etat-avant-de-revendre-sa-voiture-d-occasion-195473.htm) |
| Peinture de l'aile avant droite d'une Clio III chez un garage : 69 à 347 €, prix moyens mis à jour le 8 octobre 2026 | [GoodMecano, Clio III](https://www.goodmecano.com/reparation-automobile-par-marque/renault/clio-iii/peinture-aile-avant-droite-22748) (la version du 8 citait par erreur la page d'une C-Elysée) |
| Retouche locale d'une rayure isolée, type Smart Repair : « entre 100€ et 300€ » | [Ornikar](https://www.ornikar.com/code/cours/mecanique-vehicule/entretien/effacer-rayure-voiture), page sans date |
| Polish à la machine chez un professionnel : « 250/300 € » | [Caradisiac](https://www.caradisiac.com/faut-il-remettre-la-carrosserie-en-etat-avant-de-revendre-sa-voiture-d-occasion-195473.htm) |
| **Test de l'ongle** : on passe l'ongle sur la rayure ; s'il n'accroche pas, elle ne touche en général que le vernis et un polissage suffit ; s'il accroche, « c'est une rayure profonde qui ne pourra pas être effacée avec du polish » | [Ornikar](https://www.ornikar.com/code/cours/mecanique-vehicule/entretien/effacer-rayure-voiture) |

**Le verdict du film**, appliqué au même exemple, sur la Clio lavée (le rembobinage s'arrête après le lavage : on
juge une rayure sur une carrosserie propre) : l'ongle glisse, **15 € de polish** ; « Carrossier · 300 € » se barre.
300 € est le haut des fourchettes d'Ornikar (100 à 300 €) et de Caradisiac pour un polish machine (250 à 300 €). Ces
300 € passeraient la règle des 15 % (9 % de la valeur) : c'est le test de l'ongle qui les écarte, parce que la photo 1
serait la même. Ils mangeraient à eux seuls 70 % de ce que toute la préparation a fait monter le prix (300 / 430).

**Si MO6 est publiée** (le journal, §1, ne la donne pas comme publiée au 9 octobre) : MO6 chiffrait la rayure à
environ 30 € (kit efface-rayures) et annonçait « 100 € → + 600 € » ; MO11 dit 15 € de polish et « + 400 € ». Les deux
tiennent dans la même fourchette (kits de 15 à 30 € pour la plupart, Touslesprix), et ils ne mesurent pas la même
chose : MO6 parlait de la valeur d'une Polo à l'achat, MO11 du prix de vente d'une Clio. À écrire dans la légende si un
commentaire relève l'écart.

### Ce que la vidéo ne dit pas

Qu'une voiture préparée part toujours en quatre jours, qu'un acheteur accepte toujours 3 300 €, ni ce que rapporte un
phare ou un enjoliveur pris seul (le compteur ne se pose sur aucune valeur intermédiaire). Elle ne dit pas qu'un filtre
seul retire l'odeur de tabac. Elle ne conseille pas de cacher un défaut : l'odeur est traitée à la source (tissus,
puis filtre), et une rayure qui accroche l'ongle reste une rayure, à montrer sur les photos ou à faire réparer si le
devis reste sous les 15 %.

## Repères provisoires (à recaler sur la voix)

Le déroulé seconde par seconde (image, voix, son) est dans le brief. Les événements que le film attachera à un mot dès
que la prise existera :

| Événement | t provisoire (s) | Sur le mot |
|---|---|---|
| la plume rallume « 2 000 » · « → 2 900 » et « telle quelle ? » | 0,10 · 1,20 | « Tu l'achètes » · « tu la revends » |
| l'embout aspire la bande du flanc, « LAVE-MOI » part | 2,75 → 3,70 | « aspirateur » |
| « 2 900 » passe au gris, « 2 ?00 » · « C'est donné. » | 4,00 | « donné » |
| le calcul devient le compteur (2 900 € au repos) · palettes SAMEDI · 13:00 | 4,55 → 5,00 · 4,65 | « Samedi » |
| lavage : ligne 5,80 → 6,50 (arrêt 6,00-6,30) · débit, impulsion | 6,50 | après « treize heures » |
| phares : ligne 6,80 → 7,50 (arrêt 7,00-7,30) · débit | 7,50 | sans voix |
| sièges : ligne 7,80 → 8,50 (arrêt 8,00-8,30) · débit | 8,50 | « Les sièges » (7,95) |
| carte « Sous les sièges · 3,40 € · une frite » | 9,00 | seule, entre deux mots |
| odeur : ligne 9,05 → 9,75 (arrêt 9,25-9,55) · débit | 9,75 | « L'odeur » (9,25) |
| rayure : ligne 9,80 → 10,50 (arrêt 10,00-10,30) · débit | 10,50 | sans voix |
| enjoliveurs : ligne 10,55 → 11,25 (arrêt 10,75-11,05) · débit | 11,25 | « Les enjoliveurs » (10,75) |
| compteur au repos à 3 330 €, recul de la caméra | 11,70 | après « enjoliveurs » |
| palettes 13:00 → 16:30, la lumière tombe · « Soleil bas, dans ton dos. » · « l'heure avant le coucher » | 11,90 → 13,90 · 12,60 · 13,20 | « Et là, tu attends le soleil » (12,20) |
| avancée de la caméra, viseur · déclic | 13,90 → 14,50 · 14,50 | « Photo 1 » (14,25) |
| la photo devient l'annonce · palettes 16:30 → J+4 · deux messages | 14,80 · 14,90 → 15,60 · 15,30 et 15,70 | après « Photo 1 » |
| bulle « 3 300 et je la prends. » · virement | 15,90 · 16,78 | 1 s avant « Quatre cents » (« Quatre jours » retiré, round 2) · avant « Quatre cents » |
| « + 400 € » géant · « − 109,60 € de prépa » · arrêt de la musique | 17,30 → 17,90 · 17,60 · 18,00 | « de plus » · premier temps |
| « Ton samedi le mieux payé. » s'écrit | 18,70 | sur les mots |
| rembobinage jusqu'à 13:10 | 20,40 → 21,10 | 0,25 s après « payé » |
| carte « Avant la photo 1 » · « Pas tout. » · trois lignes · barre du pare-chocs | 21,10 · 22,30 · 22,50, 23,00, 23,50 · 23,90 | « Ceux qui gagnent » · « pas tout » ; musique au premier temps de 22,00 |
| plongée sur l'aile · l'ongle traverse la rayure | 24,50 · 25,30 | « L'ongle glisse » (24,75) |
| verdict « L'ongle glisse ? Tu lustres. » (tenu 1,9 s) · « Polish · 15 € » · « Carrossier · 300 € » barré | 25,90 → 27,80 · 26,30 · 26,90 | « Quinze euros » (26,25) |
| retour au cadre de l'image 0, la poussière revient | 27,80 → 30,50 | « La prochaine fois que tu te dis… » (28,40) |

Depuis le 9 octobre, le film lit ces temps dans `audio/vo-mo11/vo-timing.json` (repères `marks`, voir « La voix ») et
non plus dans ce tableau : ils suivront la prise quand elle arrivera.

## La voix

**État au 9 octobre 2026 : provisoire.** ElevenLabs a bloqué le compte, aucune prise n'existe et aucun appel n'est
parti. `python3 scripts/vo-mo11.py --provisoire` a écrit `audio/vo-mo11/vo-timing.json` au format de MO9 (`dur`,
`take`, `lines`, `words`, `marks`, `loop`), avec `"provisional": true`, `hookB` et `estimate`, et un `vo-placed.wav`
muet de 30,1 s. Le film lit ces repères comme il lira ceux de la prise : chaque geste suit son mot.

### Le texte à générer

Une seule génération : Simon `mvhJVdVoTWVUtL4keT7W`, modèle `eleven_v3`, français, **generations_count 1**. 510
caractères, soit environ 510 crédits (MO9 : 526 ; MO10 : 580). Avant d'envoyer, demander l'estimation, puis le solde :
l'estimation de MO9 ne vérifiait pas le quota. Après un échec, on ne relance pas : on note l'erreur et on attend
l'utilisateur. L'ouverture B se dit à la fin, après la longue pause, dans la même génération (méthode de MO10).

```
Tu l'achètes deux mille, tu la revends deux mille neuf cents. Ton aspirateur trouve ça donné.
Samedi, treize heures. Les sièges. L'odeur. Les enjoliveurs.
Et là… tu attends le soleil. Photo un.
Quatre cents de plus. [short pause] Ton samedi le mieux payé.
Ceux qui gagnent ne réparent pas tout. Le pare-chocs, tu le laisses. L'ongle glisse sur la rayure ? Quinze euros de polish.
La prochaine fois que tu te dis…
[long pause]
La revendre sale t'économise un après-midi. Et ça peut te coûter quatre cents euros.
```

Le script garde ce texte (`TEXTE`) et vérifie à chaque lancement que ses seize répliques et l'ouverture B le redisent
mot pour mot, chiffres lus en lettres. Si on change l'un sans l'autre, il s'arrête.

### Le minutage provisoire

Chaque réplique part à son ancre du brief, ou 0,3 s après la fin de la précédente si celle-ci déborde ; 1 s avant
« Ton samedi », « Ceux qui gagnent » et « La prochaine fois » (la seule pause, le rembobinage, le repli de la carte).
Durée d'une réplique : ses syllabes dites divisées par 5,96 par seconde, plus 0,34 s par ponctuation interne, 0,55 s
au moins. Les mots s'y répartissent au prorata de leurs syllabes. Les deux valeurs viennent des 25 répliques posées
de MO9 et MO10, mesurées après accélération (`python3 scripts/vo-mo11.py --calibre`), avec 0,23 s d'écart type par
réplique.

| Réplique (sous-titre) | Provisoire (s) | Brief (s) |
|---|---|---|
| Tu l'achètes 2 000, | 0,10-1,11 | 0,10-1,00 |
| tu la revends 2 900. | 1,26-2,60 | 1,20-2,50 |
| Ton aspirateur trouve ça donné. | 2,85-4,36 | 2,75-4,35 |
| Samedi, 13 heures. | 4,66-6,01 | 4,65-5,80 |
| Les sièges. | 7,95-8,50 | 7,95-8,50 |
| L'odeur. | 9,25-9,80 | 9,25-9,80 |
| Les enjoliveurs. | 10,75-11,59 | 10,75-11,65 |
| Et là, tu attends le soleil. | 12,20-13,88 | 12,20-13,95 |
| Photo 1. | 14,25-14,80 | 14,25-14,85 |
| ~~4 jours.~~ (retiré, round 2) | | 15,95-16,60 |
| 400 de plus. | 16,90-17,57 | 16,90-17,70 |
| Ton samedi le mieux payé. | 18,70-20,04 | 18,70-20,15 |
| Ceux qui gagnent ne réparent pas tout. | 21,15-22,49 | 21,15-22,60 |
| Le pare-chocs, tu le laisses. (round 2) | 23,30-24,81 | |
| L'ongle glisse sur la rayure ? | 25,11-26,12 | 24,75-26,00 |
| 15 euros de polish. | 26,42-27,43 | 26,25-27,35 |
| La prochaine fois que tu te dis… | 28,43-29,77 | 28,40-29,90 |

Parole : 17,6 s (brief : 17,5 s). « aspirateur » à 3,02 s, « donné » à 4,02 s. La voix finit à 29,77 s, la boucle
part à 27,83 s, le film proposé dure **30,15 s** (round 2 : « Quatre jours. » retiré, « Le pare-chocs, tu le
laisses. » ajouté ; 30,1 s avant). L'ouverture B, estimée de 0,10 à 4,30 s, finit avant « Samedi »
(4,66 s). Aucune réplique ne chevauche la suivante. Sous-titres provisoires : `python3 scripts/srt-mo11.py` →
`renders/9x16-mo11.srt` (15 cartons, 32 caractères au plus par ligne).

**Pourquoi pas 2,6 mots par seconde.** À 2,6 mots dits par seconde sans pause interne (`--unite mots --debit 2.6
--pause-int 0`), la voix finit à 32,9 s et le film dure 33,3 s, 1,8 s au-delà de la limite de 31,5 s ; « Ton
aspirateur » glisse de 2,85 à 4,73 s et le contradicteur ne tombe plus avant 3 s. Ce débit décrit un film entier,
silences compris (65 mots pour 29,6 s). Dans une réplique, Simon posé à × 1,15-1,2 dit 3,7 mots par seconde sur MO9
et 3,2 sur MO10, environ 5 hors pauses.

### Une fois la prise déposée

Depuis `video/` :

1. Déposer la génération en `audio/vo-mo11/takeA.mp3` (une seule prise, ouverture B comprise).
2. `python3 scripts/vo-mo11.py takeA.mp3 --retenue`. Le script transcrit la prise (faster-whisper *medium*, en cache
   depuis le 9 octobre ; *small* s'il manque) dans `words.json`, aligne le texte sur la transcription, recale les
   bornes des mots sur l'enveloppe à 20 ms, pose les répliques à × 1,15 et × 1,2 sur leurs ancres, écrit les repères,
   l'ouverture B (`vo-placed-B.wav`), `vo-placed.wav`, `vo-timing.json` (sans `provisional`) et la durée dans
   `timeline-mo11.json`. Il retranscrit ensuite la pose et liste les mots qu'il n'y retrouve pas.
3. Écouter `vo-placed.wav` et lire les lignes « ! » et « recalé sur l'enveloppe ». Un mot mal placé se corrige dans
   `FIX` (`{indice: (début, fin)}`, temps de la prise), une réplique mal alignée dans `SPAN` ; relancer l'étape 2.
   La transcription reste en cache (`--retranscrire` la refait).
4. Si le film dépasse 31,5 s, appliquer les coupes du brief dans `COUPE`, dans l'ordre : `{'sam': 'Samedi.'}`, puis
   `{'sam': 'Samedi.', 'j4': ''}`, et relancer l'étape 2. Une réplique retirée garde ses repères, sans durée.
5. `python3 scripts/srt-mo11.py` : sous-titres sur les vrais temps.
6. `CUT=mo11 node scripts/events.mjs` : temps des événements du film, pour les bruitages.
7. `python3 scripts/audio-mo11.py` : le mix (rapport dans `docs/mix_report-mo11.txt`).
8. Rendu : `CUT=mo11 node scripts/render.mjs --draft` pour contrôler, puis le rendu final, sans `--all` tant que
   les trois épisodes tournent.

Tempos par variables d'environnement (`TH` ouverture, `TV` coups, `TC` attente et chute, `TF` méthode, `TL` boucle) :
le script refuse tout tempo au-delà de × 1,2. Vérifié sur la prise de MO10 : le recalage retrouve à 0,04 s près les
huit bornes corrigées à l'oreille dans `vo-mo10.py` (dont « Bénéfice », placé 0,8 s trop tard par *medium*),
l'alignement retrouve tout le texte et la retranscription de la pose ne perd aucun mot.

## Les plans réels

Mixkit, licence « Mixkit Stock Video Free License » (usage commercial libre, sans crédit obligatoire), comme MO5, MO6
et MO9. Choisis le 9 octobre 2026 sur planches de vignettes étiquetées (`motion-studio/scripts/mixkit.py search
--sheet`), puis regardés sur trois images au moins par plan : aucun visage, aucune plaque, aucun logo lisible.
Vidéos hors dépôt dans `assets/stock/mo11/` ; séquences JPG 30 i/s, 720 px de large, hors dépôt, dans
`film-mo11/seq/<clé>/NNN.jpg`, refaites par `python3 film-mo11/seq-mo11.py` (début, durée et recadrage de chaque plan
y sont écrits ; `--check <dossier>` : planche de trois images par clé). Nombre d'images par clé : `film-mo11/seq.json`
(à donner tel quel à `Kit47.loadSeqs('seq', SEQ)`, lecture en aller-retour par `drawSeq`).

**Numéros exclus** (révision du 9 octobre : MO11 ne remonte aucun plan de MO9) : ceux de MO9, 241, 4716, 13260, 22168,
31961, 34140, 36522, 42136, 45755, 47830, 49219 ; ceux de MO6, 47832, 24815, 12054 ; ceux que MO10 a ajoutés, 47585,
33324, 38501, 22916. Aucun n'est pris. Écartés en plus : **4915** (mains qui tapent sur un téléphone), que MO12 monte
pour son virement, et les plans de la même série que le 47830 de MO9 où l'on voit une machine (47829, 47833, 47834).

| Clé | Mixkit | Ce qu'on y voit | Extrait | Où |
|---|---|---|---|---|
| `lavage` | 26680 | vu de l'intérieur : le jet haute pression frappe la vitre, puis la mousse coule sur le verre ; portique rouge flou derrière | 0,0 → 4,5 s (135 images) | notification « Lavage · haute pression · − 8,00 € » |
| `phares` | 24822 | une optique avant allumée, nette et claire, sur une carrosserie bleue (l'« après ») ; recadrée sur l'optique, ni calandre ni sigle | 0,7 → 4,7 s, recadrage 624 × 442 en (652, 118), 720 × 510 (120 images) | notification « Phares · kit + vernis · − 25,00 € » |
| `sieges` | 45040 | la buse transparente d'un injecteur-extracteur glisse sur un tissu clair ; l'eau sale monte dans la buse | 0,3 → 4,8 s (135) | notification « Sièges · injecteur loué · − 30,00 € » |
| `pieces` | 18263 | une main verse des pièces dans une paume ouverte, fond clair flou (pièces non lisibles à la taille de la carte) | 0,3 → 4,8 s (135) | carte « trouvé » : « Sous les sièges · 3,40 € · une frite » |
| `odeur` | 15052 | un doigt tourne la molette de ventilation d'un tableau de bord (pictogramme de ventilateur, voyant orange) | 0,8 → 5,3 s (135) | notification « Odeur · filtre à charbon · − 15,00 € » |
| `rayure` | 47831 | une main gantée passe un applicateur de polish sur une carrosserie sombre, bandes de lumière d'atelier | 0,3 → 4,8 s (135) | notification « Rayure · polish · − 15,00 € » |
| `roue` | 17132 | une jante, des mains gantées, une clé à chocs sur les écrous ; l'emblème du cache-moyeu est flouté (suivi image par image) | 0,5 → 5,0 s (135) | notification « Enjoliveurs · jeu de 4 · − 20,00 € » ; aucun plan Mixkit ne montre un enjoliveur |
| `soleil` | 20298 | soleil bas orange derrière des lampadaires, ligne d'arbres sombre | 5,0 → 10,0 s (150) | fond flou de l'attente (13:00 → 16:30) |
| `photo` | 36800 | une main tient un téléphone à l'horizontale, fond d'intérieur flou ; **l'écran vert est devenu noir** pour recevoir la photo 1 | 1,0 → 5,5 s (136) | la photo 1 : le film peint la Clio dorée dans l'écran (voir plus bas) |
| `messages` | 14669 | des mains écrivent sur un téléphone vu de profil, écran illisible, fond bleu flou | 0,5 → 5,0 s (135) | les deux messages sur la vignette de l'annonce (J+4) |
| `cles` | 12877 | une main donne une clé dans une paume ouverte, manches de veste, fenêtre floue derrière | 0,2 → 4,7 s (136) | « Virement reçu · + 3 300,00 € » |

**L'écran du téléphone** (`photo`). `film-mo11/photo-ecran.json` donne, pour chacune des 136 images, les quatre coins
de l'écran en pixels de l'image 720 × 406 (haut-gauche, haut-droit, bas-droit, bas-gauche ; coins vifs, obtenus en
prolongeant les côtés relevés sur le vert) et le rayon des coins arrondis (22 px). La paume passe devant le coin
bas-gauche de l'écran : `film-mo11/seq/photo-masque/NNN.png` (hors dépôt, refait par le même script) est le masque
doux de la part visible de l'écran (blanc, alpha = écran). Pour peindre la photo 1 : sur un canevas à part de
720 × 406, dessiner la Clio dans le quadrilatère de l'image courante (homographie, ou deux triangles affines), puis
`globalCompositeOperation = 'destination-in'` avec le masque de la même image, puis poser ce canevas sur l'image de la
séquence avec la même mise à l'échelle que `drawSeq`. Essai fait le 9 octobre sur trois images : la Clio tient dans
l'écran, la paume reste devant (`renders/review/mo11-seq-photo-essai.jpg`). Sans rien peindre, le plan montre un
écran noir. Planche des onze clés : `renders/review/mo11-seq.jpg`.

## Bruitages

Banques : `audio/bank/mo5/` et `audio/bank/mo6/` d'abord (rôles repris de `scripts/audio-mo5.py`, `audio-mo6.py` et
`audio-mo9.py`, qui lit `mo5` puis `mo6` ; il n'existe pas de banque `mo9`), puis `audio/bank/mo11/` pour les sons
propres à cette histoire (Mixkit, licence libre, aperçus téléchargés le 9 octobre 2026 ; liste, durées et notes dans
`audio/bank/mo11/SOURCES.tsv`). Un son principal à la fois ; les débits sur une note qui **monte** (méthode de MO9 :
`2354` transposé de + 0 à + 5 demi-tons d'un coup à l'autre).

| Moment (t provisoire) | Son | Banque | Rôle, réglage proposé |
|---|---|---|---|
| plume, écriture à la lumière (0,1 · 1,2 · 4,0 s) | 2589, 3005, 2369 | mo5 | `orn`, comme MO5 et MO9 |
| hook : l'embout aspire la bande (2,75 → 3,7 s) | 2608 « Air zoom vacuum » puis 1465 « Vacuum swoosh transition » | mo5, mo11 | 2608 pour l'attaque (crête à 0,44 s dans le fichier), 1465 pour le balayage qui monte (la montée est entre 0,6 et 1,6 s dans le fichier), panoramique de gauche à droite avec l'embout |
| « 2 ?00 » : le rouleau tourne (4,0 s) | 1054 | mo5 | `tick`, 0,4 s |
| le calcul se replie, palettes SAMEDI · 13:00 (4,55 · 4,65 s) | 3120, 1119 | mo5 | `whoosh` ; une `tick` par palette |
| lavage : jet pendant la ligne (5,8 → 6,5 s) | 3215 « Spray water or liquid » | mo11 | `tool`, 0,7 s, − 2 à − 3 demi-tons pour le corps d'un nettoyeur |
| phares : ponçage court (6,8 → 7,5 s) | 850 « Wood polishing electrical tool » | mo11 | `tool`, 0,5 à 0,7 s pris après 2 s (partie stable) |
| sièges : aspiration humide (7,8 → 8,5 s) | 1835 « Vacuum engine hum » | mo6 | `tool`, 0,7 s pris après 3 s (MO6 l'employait pour l'injecteur-extracteur) |
| gag : quatre pièces qui tintent (9,0 s) | 3183 « Fluttering coin » (×4) ou 1993 « Clinking coins » | mo11 | 3183 (la pièce tombe vers 0,41 s dans le fichier, 0,25 s de son) en quatre départs à 0,07 s d'écart, transposés 0, + 2, + 6, + 7 (2 €, 1 €, 0,20 €, 0,20 € : la plus grosse sonne le plus grave), seul dans le mix ; 1993 en un seul départ si le temps manque |
| odeur : la molette, puis le souffle (9,05 → 9,75 s) | 1832 « Stove extractor fan starting » | mo11 | clic à 0,14 s calé sur le doigt de la vidéo, souffle qui monte coupé à 0,7 s (le second clic est à 7,59 s) |
| rayure : le polish passé à la main (9,8 → 10,5 s) | 3087 « Long broom or wipe sweep sound », puis le scintillement 2589 transposé + 7 | mo11, mo5 | `tool` court, choisi parce que le plan `rayure` montre un polish à la main ; la polisseuse 2646 (mo6) du brief reste possible |
| enjoliveurs : le neuf se clipse (10,55 → 11,25 s) | 486 « Plastic CD cover close hard » | mo11 | `tool`, claquement à 0,35-0,43 s dans le fichier, posé à la fin de la ligne |
| chaque débit (6,5 · 7,5 · 8,5 · 9,75 · 10,5 · 11,25 s) | 2354 (note), 1490 (arrivée) | mo5 | `ui`, transposé + 0 à + 5, le dernier le plus haut ; 1490 `whoosh` − 4 dB, 0,1 s avant |
| le compteur roule sans se poser (6,5 → 11,7 s) | 1054 | mo5 | `tick` à chaque impulsion, gain bas |
| le soleil baisse (11,9 → 13,9 s) | 2932 « Urban park and traffic » (extrait de 16 s) | mo11 | ambiance du soir à − 26 dB environ, oiseaux à 4-5,5 s et 10,5-11,5 s dans l'extrait ; aucune voix |
| déclic de la photo 1 (14,5 s) | 1133 « Camera shutter click » | mo11 | `ui`, sec, sans réverbération |
| palettes 16:30 → J+4 (14,9 → 15,6 s) | 1119 | mo5 | `tick` |
| deux messages, bulle (15,3 · 15,7 · 16,2 s) | 2354, 2384 | mo5 | `ui`, transposés + 7 et + 9 ; aucun son de vibration de téléphone sur Mixkit (recherches « vibration », « vibrate », « phone », « smartphone », « cellphone », « buzz ») : la note seule, comme MO9 |
| virement reçu (16,8 s) | 1490 puis 951 | mo5 | `whoosh` puis `chime` |
| « + 400 € » géant (17,3 s) | 2909, 1107 | mo5 | `accent` puis `chime` transposé + 7 ; puis arrêt de bande sur la musique (18,0 s) |
| rembobinage (20,4 → 21,1 s) | 1092 | mo5 | `accent`, 1,45 s, − 6 dB |
| la carte, ses trois lignes, la barre du pare-chocs (21,1 → 23,9 s) | 3120, 2369 (×3, + 0, + 2, + 4), 3005 transposé − 3 | mo5 | comme MO9 |
| l'ongle glisse sur la rayure (25,3 s) | 1898 « Cloth slide out » | mo11 | 0,3 à 0,4 s pris dans le glissement (0,65 → 1,5 s dans le fichier), passe-haut vers 2 kHz : un frottement doux, sans accroche |
| « Polish · 15 € », « Carrossier · 300 € » barré (26,3 · 26,9 s) | 2384 ; 3005 transposé − 3 | mo5 | une note, puis une note grave sur la barre |
| retour à l'image 0, la poussière revient (27,8 s) | 3120, 1465 à l'envers | mo5, mo11 | `whoosh` ; 1465 inversé, à − 20 dB environ, pour la poussière qui revient |

## Mesure de référence pour la fabrication

`ref-motion.py` (flux optique, part des images où quelque chose bouge), mesuré le 9 octobre 2026 sur les films livrés
(segments coupés sans son, analyse à 180 px) :

| Segment | Durée | Mouvement | Figé (part) | Couches |
|---|---|---|---|---|
| MO5, accumulation (5,9 → 12,0 s) | 6,1 s | 78 % | 19 % (un plan figé de 1,13 s) | 0,67 |
| MO9, accumulation (13,5 → 16,6 s) | 3,1 s | 80 % | 0 % | 0,66 |
| MO9, film entier | 31,4 s | 53 % | 42 % | 0,63 |

Commande (depuis `video/`) :

```
ffmpeg -ss 5.8 -to 11.7 -i renders/<film-mo11>.mp4 -an -c:v libx264 -crf 18 <scratchpad>/mo11-accu.mp4
python3 ../.claude/skills/motion-studio/scripts/ref-motion.py <scratchpad>/mo11-accu.mp4 <scratchpad>/mo9-accu.mp4 --label mo11-accu,mo9-accu --out <scratchpad>/motion
```

Objectif pour MO11 : au moins 85 % d'images en mouvement entre 5,8 et 11,7 s, aucun plan figé de plus de 0,3 s
(l'arrêt de la ligne de partage dure 0,3 s, caméra et compteur en mouvement), couches ≥ 0,66 (la voiture change
pendant que le compteur roule et que les notifications tombent).

**Mesure de l'hypothèse, après publication** : sur la courbe de rétention de TikTok Studio, la perte relative par
seconde de l'accumulation, (R début − R fin) / R début / durée, sur 5,8 → 11,7 s pour MO11 et 5,9 → 12,0 s pour MO5
(même place dans le film ; comparer à MO9 sur 13,5 → 16,6 s n'aurait pas de sens, une courbe perd moins plus tard).
On tranche une fois MO9 publiée et relevée.

## Le film (étape 3, maquettage du 9 octobre 2026)

`film-mo11/index.html` + `film-mo11/film.js`, sur `lib/kit47.js` (inchangé) et **`lib/kit47-etats.js`** (nouveau).
Fonction pure du temps (`window.seek(t)`), ressorts fermés et `track()`, bruit à graine fixe, aucune transition CSS
ni minuterie, `window.shutter` / `window.samples` pour le flou de bougé, `window.EVENTS` pour les bruitages
(`CUT=mo11 node scripts/events.mjs` → `film-mo11/events.json`). `timeline-mo11.json` : 60 i/s, 120 BPM, 1080 × 1920,
30,1 s, poster = image 0. Le film lit **tous** ses temps dans `audio/vo-mo11/vo-timing.json` (repères `marks` et
`lines`) : quand la prise de Simon remplacera le minutage provisoire, chaque geste suivra son mot sans retouche du film.

**Le module `lib/kit47-etats.js`** (réutilisable pour une autre voiture) :

| Fonction | Ce qu'elle fait |
|---|---|
| `car(parent, { img, w, left, top, layers })` | la photo propre et ses calques pleine taille (PNG ou SVG), une ombre, la bande mouillée, le reflet rasant, un SVG aux pixels de la photo pour la ligne et les outils |
| `prepSun(C, img)` | une fois : la photo étalonnée selon la luminance (hautes lumières dorées, ombres froides), le masque des zones claires, la silhouette floutée tirée du masque alpha |
| `clip(C, calque, a, b, trou)` | le calque visible entre x = a et x = b (pixels de la photo), moins un trou polygonal (`clip-path` en règle pair-impair) |
| `lineAt(t, o)`, `lineOn(t, o)`, `split(t, C, o)` | la ligne de partage : 0,2 s jusqu'au point d'arrêt `xm`, arrêt `hold`, 0,2 s jusqu'au bout ; ressorts critiques ; liseré orange, trait clair, poignée « ◂ ▸ » à épaisseur constante à l'écran |
| `sun(C, k, { rake, rakeK })`, `wet(C, x, k)` | la lumière de 16 h 30 (k de 0 à 1) : étalonnage, ombre couchée qui s'allonge et tourne, reflet rasant masqué sur les zones claires ; la brillance mouillée derrière le lavage |

Piège du kit : `Kit47.word()` lit la famille au troisième mot de la chaîne de police ; pour un mot en Fraunces
italique, passer `'500 92px Fraunces'` avec `{ italic: true }`, jamais `'italic 500 92px Fraunces'` (le SVG tombe sur
une police de secours). Les SVG des calques sont lus par `fetch` puis servis en Blob : les serveurs de `at.mjs`, `sheet.mjs` et `events.mjs`
n'ont pas le type `image/svg+xml`.

**Les instants clés** (minutage provisoire ; « mot » = repère de `vo-timing.json`) :

| Temps du film | t (s) | Sur le mot / la règle |
|---|---|---|
| Image 0 : « 2 000 → 2 900 · telle quelle ? », Clio sale, « LAVE-MOI », contour entier | 0 | |
| La plume rallume « 2 000 », descend la flèche, rallume « 2 900 », fait vaciller le « ? » | 0,15 · 1,55 · 1,87 · 2,64 | « achètes » − 0,12 · « revends » · « 2 900 » · fin de « 2 900 » |
| L'embout aspire la bande du flanc, « LAVE-MOI » part | 2,99 → 3,71 | « aspirateur » |
| « 2 ?00 », la fente réécrit « C'est donné. » | 3,97 | « donné » − 0,05 |
| Le calcul devient le compteur (2 900 €), palettes SAMEDI · 13:00, repère 3 490 €, mention | 4,64 · 4,68 · 5,2 · 5,3 | « Samedi » |
| Lavage · phares · sièges · odeur · rayure · enjoliveurs (début de ligne ; arrêt 0,2 s après) | 5,96 · 6,88 · 7,80 · 9,05 · 9,80 · 10,55 | fin de « heures » · entre deux · « sièges » − 0,33 · « L'odeur » − 0,2 · entre deux · « Les enjoliveurs » − 0,2 |
| Débits (notification) ; impulsion au compteur 0,33 s après (une étincelle monte de la notification) | 6,68 · 7,60 · 8,52 · 9,77 · 10,52 · 11,27 | fin de chaque ligne |
| Carte « trouvé » · « Sous les sièges · 3,40 € · une frite » | 8,83 | entre « sièges » et « L'odeur » |
| Recul, compteur posé à 3 330 € | 11,33 → ≈ 12,2 | |
| La lumière baisse ; « Soleil bas, dans ton dos. » ; « l'heure avant le coucher » | 11,90 → 13,90 · 12,60 · 13,20 | « Et là » − 0,3 · « Et là » + 0,4 · « soleil » − 0,35 |
| Viseur · déclic · la photo part dans l'écran du téléphone (annonce 3 330 €) · J+4 | 13,84 · 14,52 · 14,78 · 14,92 | fin de « soleil » · « 1 » − 0,1 |
| Messages · offre « 3 300 et je la prends. » · virement · « + 400 € » | 15,30 · 15,65 · 15,90 · 16,78 · 17,28 | « 4 jours » · « 400 » · « plus » |
| « − 109,60 € de prépa » · la seule pause · « Ton samedi le mieux payé. » | 17,65 · 18,0 → 18,7 · 18,67 | « Ton samedi » |
| Rembobinage jusqu'à 13:10 (lavée, phares jaunes, rayure, enjoliveurs bruns) | 20,40 → 21,10 | fin de « payé » + 0,36 |
| Carte « Avant la photo 1 » · « Pas tout. » · trois lignes · ✗ | 21,10 · 22,12 · 22,51 / 23,01 / 23,51 · 23,93 | « Ceux » · « pas » · fin de « tout » |
| Plongée sur l'aile · l'ongle traverse la rayure · verdict · « Polish · 15 € » (le polish efface la rayure) · « Carrossier · 300 € » barré | 24,45 · 24,96 · 25,82 · 26,29 · 26,89 | « L'ongle » − 0,3 · « glisse » · fin de « rayure ? » · « 15 » · « polish » |
| Retour à l'image 0 : la carte se replie, la poussière revient en front inverse, le contour se retrace, le calcul se réécrit | 27,80 → 29,95 | boucle (`loop`) |

**Mesures du maquettage** (9 octobre 2026) :

- **Accumulation, 5,8 → 11,7 s** (`ref-motion.py`, images du film à 30 i/s sans flou de bougé, comparées aux films
  livrés ramenés à 30 i/s ; analyse à 180 px) : **93 % d'images en mouvement, aucun plan figé** (MO9 78 % avec un
  arrêt de 0,3 s, MO5 77 % avec un plan figé de 1,13 s ; à 60 i/s, MO9 et MO5 donnent 80 et 78 %, les chiffres de
  référence). À-coups 0,115 (MO9 0,173, MO5 0,238). **Couches 0,62, sous l'objectif de 0,66** (MO9 0,67) : la caméra
  porte la plus grande part du mouvement (panoramique 72 %, zoom 70 %). Planche : `renders/review/mo11-motion-accu.png`,
  tableau : `renders/review/mo11-motion-accu.md`. À remesurer sur le rendu final, avec le flou de bougé.
- **Boucle** : image 0 contre la dernière image (t = 1 805 / 60 s), pleine définition : **écart moyen 0,016 / 255**
  (p99 1,0).
- **Zones sûres**, mesurées sur le DOM toutes les 0,1 s (boîte à l'écran de chaque texte visible, découpée par ses
  conteneurs) : aucun texte au repos hors de x 60 → 940, y 220 → 1 480. Restent des passages en mouvement : les
  notifications qui entrent par la droite, les messages par la gauche, l'annonce par le bas, et trois images
  (11,98 → 12,03 s) où la pile de débits, déjà sous 50 % d'opacité, descend sous 1 480 px en sortant.
- **Image 0** à 200 px de large : `renders/review/mo11-image0.jpg` (« 2 000 → 2 900 », « telle quelle ? » et la Clio
  sale se lisent ; « LAVE-MOI » se devine à peine à cette taille).
- Aucune erreur `PAGEERR` (`at.mjs`, trois planches, `events.mjs`).
