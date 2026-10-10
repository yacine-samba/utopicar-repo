# MO12 « La pochette » : règles, montants et sources (étape 2)

Brief : `brief-mo12.md` (9 octobre 2026, révisé le même jour après trois relectures). Film d'environ 30,7 s,
1080×1920, 60 i/s, en boucle. **Minutage provisoire** : le compte ElevenLabs est bloqué (« Unusual activity… Free
Tier access has been disabled »), aucune voix n'est générée. Le film tourne sur les temps estimés du brief (grille de
120 BPM, débit de Simon mesuré sur MO9, méthode de comptage écrite dans le brief) ; il se recalera mot à mot sur
`audio/vo-mo12/vo-timing.json` quand l'utilisateur aura débloqué le compte.

Toutes les pages ont été consultées le **9 octobre 2026**. Quand une fiche officielle porte sa propre date de
vérification, elle est notée à côté. Les corrections de la révision ont été relues à la source ce jour-là ; ce qui
n'a pas pu l'être est dit.

À l'écran de l'image 0 à la dernière image : « Exemple · prix moyens constatés ».

## La voiture

Une **Citroën C3 de première génération** (phase 1, 2002-2005), cinq portes, bleu clair métallisé. Aucun modèle n'est
nommé à l'écran ni dans la voix ; dans l'exemple, c'est une 1.4i essence de 2004 à 150 000 km.

| Photo | Auteur, licence | Fichiers |
|---|---|---|
| [Citroën C3 front.jpg](https://commons.wikimedia.org/wiki/File%3ACitro%C3%ABn_C3_front.jpg) | M 93, **domaine public** (aucun crédit obligatoire) | `assets/photos-mo12/car-c3.png` (RGBA, rognée, 1757×1241), `car-c3-contour.js` (`window.CAR_C3_CONTOUR`), `car-c3-flou.png`, `car-c3-reperes.js` (`window.CAR_C3_REPERES`) |

Déjà traitée par `scripts/cars-libres-twingo-c3.py` : double chevron de la calandre et des enjoliveurs effacés, texte
du cadre de plaque effacé, plaque vierge, détourage BiRefNet, bords décontaminés, étalonnage de la charte. L'avant
regarde à gauche : elle sort par la gauche. Revérifiée au zoom le 9 octobre sur fond #08070a : calandre lisse, plaque
vierge, centres d'enjoliveurs sans chevrons (il reste l'anneau moulé de l'enjoliveur avant, sans logo), aucune
personne, aucun texte. Original : `assets/cars-libres/src/wm-c3.jpg` (hors dépôt).

**Ce que le film reçoit** (`python3 scripts/photos-mo12.py`, `--check <dossier>` pour les planches de contrôle) :

| Fichier | Quoi | Pour |
|---|---|---|
| `car-c3.png`, `car-c3-contour.js` | copies telles quelles de `assets/cars-libres/` (contour : repère de 1000 px de large) | la C3 nette et son contour de lumière : image 0, sorties de 2,70 et 17,15 s, retour de 4,45 s, boucle |
| `car-c3-flou.png` | la même, floutée (flou gaussien sur couleurs prémultipliées, pas de halo sombre), à demi-résolution (879×621, à afficher × 2) | « la C3 passe en décor flou » (papiers, chute, renversement) : un fondu entre la nette et la floue au lieu d'un `filter: blur()` CSS sur un PNG de 1757 px, qui coûte cher à chaque image (MO6 : ≈ 2 h de rendu) |
| `car-c3-reperes.js` | `window.CAR_C3_REPERES`, en pixels du PNG et dans le repère du contour : pare-brise (quadrilatère haut-g, haut-d, bas-d, bas-g : (712, 75), (1325, 100), (1252, 445), (398, 345)) ; étiquette proposée dans ce plan, côté passager, au-dessus des balais ; point d'impact du tampon VENDUE (734, 204), au centre de l'étiquette ; bas des pneus (sol) : roue avant (1180, 1231), roue arrière (1650, 819) ; plaque vierge ; boîte englobante | poser l'étiquette « 2 700 € » en perspective (`matrix3d` calculée sur les quatre coins), viser le tampon, caler une ombre ou un trait de sol |

L'étiquette proposée couvre 40 % de la largeur du pare-brise (une feuille A4 en couvrirait 23 %) : avec la voiture
affichée à environ 950 px de large (× 0,54), elle fait environ 75 px de haut à l'écran (135 px dans le PNG), assez pour un
« 2 700 € » de 48 px, lisible à 360 px. Aucun état de la voiture n'est fabriqué (ni sale, ni phares jaunis, ni rayure) : c'est une
vente qui se passe bien, la C3 reste telle qu'elle est.

**Crédits** : `assets/photos-mo12/CREDITS.tsv` (et `assets/cars-libres/CREDITS.tsv`). Domaine public : rien n'est dû.
**Légende du post** : aucun crédit obligatoire, ni pour la photo ni pour Mixkit. Si l'on veut créditer par courtoisie,
une ligne à la fin, sans nommer le modèle : « Photo de la voiture : M 93, domaine public (Wikimedia Commons). »

## Les règles de la pochette (vente entre particuliers)

| Règle | Ce que le film en montre | Source |
|---|---|---|
| Le vendeur remet un **procès-verbal de contrôle technique** si la voiture y est soumise (plus de 4 ans) : « le contrôle doit dater de moins de 6 mois **à la date de dépôt de la demande d'établissement** » du nouveau certificat d'immatriculation, c'est-à-dire de la carte grise de l'acheteur, pas du jour de la vente. Contre-visite : le délai de 2 mois ne doit pas être dépassé. « Si le délai est dépassé, il faudra réaliser un nouveau contrôle, à vos frais. » | carte « Contrôle · 6 oct. », anneau « 6 mois » ; bandeau « < 6 mois à sa carte grise » | [service-public, F1707 « Vendre ou donner son véhicule »](https://www.service-public.gouv.fr/particuliers/vosdroits/F1707), vérifiée le 23 janvier 2026, relue le 9 octobre 2026 ; [service-public, F1050 « Carte grise d'un véhicule d'occasion »](https://www.service-public.gouv.fr/particuliers/vosdroits/F1050), vérifiée le 6 février 2026 : même formule, « à la date de dépôt » |
| L'acheteur a **1 mois** pour demander sa carte grise ; le coupon détachable lui permet de « circuler, en France, pendant 1 mois avec le véhicule ». D'où la marge à garder : un contrôle de 5 mois et 3 semaines peut avoir plus de 6 mois quand il dépose sa demande | anneau « 1 mois » sur la carte grise ; réponse prête aux commentaires | [F1050](https://www.service-public.gouv.fr/particuliers/vosdroits/F1050) (« Vous avez 1 mois pour demander le nouveau certificat d'immatriculation ») ; [F1707](https://www.service-public.gouv.fr/particuliers/vosdroits/F1707) (coupon) |
| Un contrôle favorable vaut **2 ans** pour rouler (exemple de la fiche : contrôle du 14 mai 2025, valable jusqu'au 13 mai 2027) | « Contrôle : deux ans pour rouler, six mois pour vendre » (formule arrondie, dite ; la ligne exacte est à l'écran) | [service-public, F2878 « Contrôle technique d'une voiture »](https://www.service-public.gouv.fr/particuliers/vosdroits/F2878), vérifiée le 1er janvier 2026 |
| **Certificat de situation administrative** (l'ancien « non-gage ») : « Il doit dater de moins de 15 jours », obtenu par le téléservice HistoVec, gratuit ; « Le CSA est disponible immédiatement » | carte « Situation adm. · 0 € », anneau « 15 j » | [F1707](https://www.service-public.gouv.fr/particuliers/vosdroits/F1707) ; [service-public, F1360](https://www.service-public.gouv.fr/particuliers/vosdroits/F1360), vérifiée le 26 février 2026 |
| Un **gage** n'empêche pas la vente ; une **opposition** la bloque tant qu'elle n'est pas levée | la question « Pas de gage ? » de l'acheteur | [F1360](https://www.service-public.gouv.fr/particuliers/vosdroits/F1360) |
| **Certificat de cession**, cerfa n° 15776, rempli et signé par le vendeur et l'acheteur le jour de la vente ; l'acheteur garde l'exemplaire n° 2 | carte « Cession · × 2 », deux signatures | [F1707](https://www.service-public.gouv.fr/particuliers/vosdroits/F1707) |
| **Carte grise barrée** : « "vendu le" avec la date (jour/mois/année) et l'heure de la cession, suivie de votre signature » ; le verso du coupon détachable se remplit au nom de l'acquéreur, « sans découper le coupon détachable » | carte « Carte grise · à barrer », puis « Vendu le 10/10/2026 · 11 h 16 » | [F1707](https://www.service-public.gouv.fr/particuliers/vosdroits/F1707) |
| **Déclaration de cession** obligatoire « dans les 15 jours suivant la signature du certificat de cession ». « Vous pouvez débuter la déclaration de cession avant le jour de la transaction et la finaliser le jour de la vente » | anneau « 15 j » sur la cession ; la déclaration commencée mardi, finie sur place à 11 h 17 | [F1707](https://www.service-public.gouv.fr/particuliers/vosdroits/F1707) ; base légale : article R322-4 du Code de la route |
| Le **code de cession** s'affiche à la fin de la déclaration : « Il est valide 15 jours », « Il est à remettre à l'acheteur » | carte « Code de cession · remis » | [F1707](https://www.service-public.gouv.fr/particuliers/vosdroits/F1707) |
| La déclaration est **gratuite** sur le site de l'ANTS. F1707 ne le dit pas. Ce sont les réponses de l'agence qui le disent : « sur notre site de l'ANTS, la déclaration de cession est totalement gratuite » (France Titres-ANTS, 15 avril 2024) ; « la déclaration de cession est gratuite sur notre site » (29 janvier 2025). La DREETS PACA (reprise de la DGCCRF) : des sites commerciaux font payer des démarches « d'immatriculations de véhicules ou cartes grises » sans « véritablement de service supplémentaire par rapport aux sites officiels » | « Déclaration de cession · 0,00 € » ; « Déclaration · ANTS · 0 € » | [Services Publics +, 4713477](https://www.plus.transformation.gouv.fr/experiences/4713477_declaration-de-cession-dun-vehicule) (réponse de France Titres-ANTS) ; [Services Publics +, 5511083](https://www.plus.transformation.gouv.fr/experiences/5511083_declaration-de-cession-dun-vehicule-sur-le-site-ants) ; [DREETS PACA](https://paca.dreets.gouv.fr/Demarches-administratives-en-ligne-attention-aux-confusions-entre-les-sites) (voir la réserve plus bas). Les pages ants.gouv.fr et immatriculation.ants.gouv.fr ne renvoient qu'une page de contrôle JavaScript à la lecture : pas de citation directe du site de l'ANTS |
| Après la vente, le vendeur prévient son assureur | non montré (voir « Ce que la vidéo ne dit pas ») | [F1707](https://www.service-public.gouv.fr/particuliers/vosdroits/F1707) |

Le nom de l'ANTS et celui de HistoVec s'écrivent en texte dans une carte de verre de la charte. On ne redessine ni
leur interface ni leur logo (`video/CLAUDE.md`).

## La règle du contrôle, pour qui achète pour revendre

C'est le savoir propre à l'achat-revente du film (le reste vaut pour tout vendeur particulier).

- **À l'achat, regarde la date du contrôle.** Date du contrôle + 6 mois = la limite pour la demande de carte grise de
  ton futur acheteur. Il a un mois pour la faire : pour être tranquille, vends au moins un mois avant cette limite.
  Après, compte un contrôle neuf dans tes frais (78 €, prix moyen 2026). Règle : F1707 et F1050 ; la marge d'un mois
  est une prudence déduite de ces deux fiches, pas un texte.
- **Dans l'exemple** : contrôle du 10 mars 2026 ; le débutant fait sa carte grise le 2 septembre (5 mois et 23 jours :
  bon pour lui). Pour une revente, le contrôle n'aurait servi que si son acheteur avait déposé sa demande au plus tard
  le 9 septembre. Le 6 octobre, il a 6 mois et 26 jours (7 mois le jour de la vente) : refait, 78 €. Le nouveau
  (6 octobre) vaut pour une demande déposée jusqu'au 5 avril 2027.
- **La formule dite** (« deux ans pour rouler, six mois pour vendre ») est un arrondi à retenir ; la ligne exacte est
  écrite sur le bandeau (« < 6 mois à sa carte grise ») et la réponse aux commentaires la détaille.

## Le gag : le site qui imite l'officiel

| Fait | Source |
|---|---|
| Un usager a payé **49,90 €** à un site privé pour sa déclaration de cession, sans remboursement (11 avril 2024). Il écrit : « je me suis trompé dans ma démarche » ; France Titres-ANTS lui répond que sur son site la déclaration est « totalement gratuite » et parle d'« utilisation de site prestataire ». C'est **un cas réel**, pas un prix moyen | [Services Publics +, 4713477](https://www.plus.transformation.gouv.fr/experiences/4713477_declaration-de-cession-dun-vehicule) |
| Un autre a reçu un courriel lui demandant **59,90 €** pour « finaliser » sa déclaration (6 janvier 2025) ; l'ANTS conseille de taper « ANTS » dans le moteur de recherche et de vérifier que l'adresse finit en « gouv.fr » ou « fr », jamais en « gouv.org » | [Services Publics +, 5511083](https://www.plus.transformation.gouv.fr/experiences/5511083_declaration-de-cession-dun-vehicule-sur-le-site-ants) |
| **Selon un usager** (24 janvier 2026) : « les sites privés payants sont mis en avant et apparaissent en premier », « la somme à payer n'apparaît qu'en fin de démarche ». France Titres-ANTS répond le contraire sur le premier point : « Notre site arrive bien en tête du référencement sur les différents moteurs de recherche, notamment Google », et rappelle de taper « ANTS » | [Services Publics +, 7046845](https://www.plus.transformation.gouv.fr/experiences/7046845_declaration-cession-vehicule) |
| **Ce qui fonde le libellé « Site qui imite l'officiel »** : la DREETS PACA (page publiée le 25 mars 2025, mise à jour le 18 novembre 2025, reprise de la fiche DGCCRF de février 2025) : « De nombreux sites commerciaux qui proposent aux consommateurs de l'aide dans leurs démarches administratives, entretiennent la confusion avec des sites officiels » ; « Ils utilisent des logos officiels, la Marianne tricolore réservée aux services de l'Etat, des termes administratifs » ; ils achètent du référencement pour arriver en tête. L'activité n'est pas interdite en soi, « à condition toutefois de ne pas abuser le consommateur en favorisant une confusion avec le site officiel où la démarche est gratuite ». **Réserve** : la page ne s'ouvre pas en lecture directe (renvoi vers l'accueil du site), et les deux pages de la DGCCRF sur economie.gouv.fr renvoient une erreur 403 ; le texte ci-dessus vient des extraits du moteur de recherche du 9 octobre 2026. À relire avant publication | [DREETS PACA, « Démarches administratives en ligne : attention aux confusions entre les sites officiels et les sites commerciaux »](https://paca.dreets.gouv.fr/Demarches-administratives-en-ligne-attention-aux-confusions-entre-les-sites) ; [DGCCRF](https://www.economie.gouv.fr/dgccrf/aides-aux-demarches-administratives-attention-aux-risques-de-confusion-avec-les-sites) (403) |

À l'écran : « Site qui imite l'officiel · − 49,90 € », légende « ton beau-frère ». Aucun site n'est nommé. On retient
49,90 €, le montant **payé** que cite le témoignage de 2024. Les 59,99 € de `serie-47.md` ne se retrouvent pas dans la
page citée là-bas (277767, sans montant) : ce chiffre est abandonné.

## Le paiement

| Moyen | Règle et piège | Source |
|---|---|---|
| **Virement instantané** (celui du film) | « en moins de 10 secondes, 24 heures sur 24 et 7 jours sur 7 » ; « les ordres exécutés sont irrévocables » ; depuis le 9 janvier 2025, même tarif que le virement classique : « généralement gratuits, s'ils sont initiés depuis leur espace de banque en ligne » ; depuis le 9 octobre 2025, chaque banque fixe son plafond (« Ce plafond doit pouvoir être modifié par les clients à leur demande » : l'acheteur vérifie le sien avant de venir) et propose la **vérification du bénéficiaire** (le nom correspond-il à l'IBAN ?) | [Banque de France, « Le virement SEPA instantané »](https://www.banque-france.fr/fr/a-votre-service/particuliers/mieux-connaitre-moyens-paiement/le-virement-sepa-instantane) (page sans date) ; [service-public, actualité A17985](https://www.service-public.gouv.fr/particuliers/actualites/A17985?lang=fr) (9 janvier 2025, le tarif) |
| Virement : le piège | ne remettre ni clés ni papiers avant d'avoir vu le paiement sur **son** compte. Un virement peut faire l'objet d'une demande de retour (doublon, erreur, origine frauduleuse) « jusqu'à 30 jours », mais « le retour de fonds n'est possible que si le bénéficiaire et sa banque ont donné une réponse favorable ». Le film le montre : « Virement reçu », vu sur ton compte, avant les signatures | [INC, fiche J 441, « sécuriser la transaction »](https://www.inc-conso.fr/content/vendre-ou-acheter-un-vehicule-doccasion-conseils-pour-securiser-la-transaction) (1er juin 2020) ; [Banque de France](https://www.banque-france.fr/fr/a-votre-service/particuliers/mieux-connaitre-moyens-paiement/le-virement-sepa-instantane) |
| **Chèque de banque** | « de nombreux faux chèques de banque circulent » ; appeler la banque émettrice avec un numéro trouvé soi-même (celui du chèque peut mener à un complice) ; vérifier le numéro du chèque, le montant, le bénéficiaire ; rendez-vous aux heures d'ouverture des banques, « Evitez le dimanche et les jours fériés » | [INC](https://www.inc-conso.fr/content/vendre-ou-acheter-un-vehicule-doccasion-conseils-pour-securiser-la-transaction) |
| **Espèces** | entre particuliers, « s'ils n'agissent pas pour des besoins professionnels, le paiement en espèces n'est pas limité » ; « Un écrit est nécessaire au-delà de 1 500 € pour prouver les versements » ; attention aux faux billets. « Le paiement en espèces d'un particulier à un professionnel ou entre professionnels est limité à 1 000 €. » | [service-public, F10999 « Paiement en espèces »](https://www.service-public.gouv.fr/particuliers/vosdroits/F10999), vérifiée le 26 juin 2026 ; [INC](https://www.inc-conso.fr/content/vendre-ou-acheter-un-vehicule-doccasion-conseils-pour-securiser-la-transaction) |

L'article de L'argus de 2014 cité dans la première version est retiré : il jugeait le virement « à bannir » et ne
parlait d'aucun délai de 30 jours. La mention « à bonne fin » sur le chèque de banque est retirée : aucune des sources
relues ne l'emploie.

## Les montants de l'exemple

| Montant | À l'écran | D'où vient le chiffre |
|---|---|---|
| Contrôle technique : **78 €** | carte du contrôle, total de la pochette, « refait le 6 oct. · 78 € » | prix moyen 2026 d'une citadine essence ou diesel, fourchette 45 à 150 € ; contre-visite 10 à 45 € ([Groupama](https://www.groupama.fr/assurance-auto/conseils/prix-controle-technique/), mise à jour du 5 janvier 2026), comme MO5 et MO9 |
| Certificat de situation administrative : **0 €** | carte | HistoVec est gratuit ([F1707](https://www.service-public.gouv.fr/particuliers/vosdroits/F1707)) |
| Certificat de cession : **0 €** | bandeau | cerfa téléchargé pendant la démarche de l'ANTS ([F1707](https://www.service-public.gouv.fr/particuliers/vosdroits/F1707)) |
| Carte grise barrée : **0 €** | bandeau | le document du vendeur |
| Déclaration de cession : **0,00 €** | carte | réponses de France Titres-ANTS citées plus haut |
| **Pochette entière : 78 €** | total | les cinq pièces : contrôle 78 €, les quatre autres 0 € |
| Le gag : **− 49,90 €** | notification « Site qui imite l'officiel » | un cas réel de 2024, cité plus haut (pas un prix moyen) |
| Prix de vente : **2 700 €** | étiquette du pare-brise, « Virement reçu · + 2 700,00 € », ouverture B | **médiane de cinq annonces de particuliers** relevées le 9 octobre 2026 (tableau ci-dessous). Prix demandés ; dans l'exemple, l'acheteur accepte le prix de l'annonce par message. Aucune annonce n'est reproduite, aucun site n'est nommé à l'écran |
| Virement instantané : **0 €** de frais | non affiché | « généralement gratuits » depuis la banque en ligne ([Banque de France](https://www.banque-france.fr/fr/a-votre-service/particuliers/mieux-connaitre-moyens-paiement/le-virement-sepa-instantane)) |
| **20 minutes** | « 20 min » | la durée de la scène (exemple) : 11:00 → 11:20 |

**Le prix : les annonces relevées** (AutoScout24, France, le 9 octobre 2026, filtre « particulier », C3 essence de
2002 à 2006, 100 000 à 200 000 km : 8 annonces). Le marché est mince pour la fourchette demandée par la relecture
(2003-2005, 130 000 à 170 000 km : trois annonces seulement), d'où la fourchette élargie.

| Annonce | Prix demandé | Retenue ? |
|---|---|---|
| [C3 1.4, 01/2004, 198 000 km (54, Nancy)](https://www.autoscout24.fr/offres/citroen-c3-1-4-essence-cat_ma21mo18264-3cb73c7a-e222-49a1-bed3-ecd7948f63b3) | 2 000 € | oui |
| [C3 1.1i Pack Ambiance, 01/2006, 105 000 km (13, Marseille)](https://www.autoscout24.fr/offres/citroen-c3-1-1i-pack-ambiance-essence-cat_ma21mo18264-3318d672-964b-4e5c-8e95-1fdbf1501cc3) | 2 300 € | oui |
| [C3 1.1i SX Pack Ambiance, 07/2006, 154 800 km (28, Dreux)](https://www.autoscout24.fr/offres/citroen-c3-1-1i-sx-pack-ambiance-essence-cat_ma21mo18264-7b2b70fd-a283-4c08-adc7-6238e3fd0a81) | 2 700 € | oui |
| [C3 1.4 Exclusive, 02/2004, 176 000 km (44, Nantes)](https://www.autoscout24.fr/offres/citroen-c3-1-4-exclusive-essence-cat_ma21mo18264-4418047a-532d-4e9e-b3fd-a7aea23f63ba) | 2 890 € | oui |
| [C3 1.4i Pack Clim, 02/2005, 120 690 km (69, Rillieux-la-Pape)](https://www.autoscout24.fr/offres/citroen-c3-c3-1-4i-pack-clim-essence-vert-cat_ma21mo18264-df6ffa63-6921-4b80-bdbf-6457db541f1d) | 3 000 € | oui |
| [C3 1.1i Tentation, 07/2003, 135 000 km (59, Maubeuge)](https://www.autoscout24.fr/offres/citroen-c3-c3-1-1i-tentation-essence-gris-cat_ma21mo18264-a9c750a5-bd21-4185-8e73-b23f44490cc4) | 1 600 € | non : « Véhicule pour la vente en belgique » |
| [C3 1.4i Pack Clim, 03/2005, 147 000 km (70)](https://www.autoscout24.fr/offres/citroen-c3-1-4i-pack-clim-essence-cat_ma21mo18264-e4695f5e-e6ee-44fa-bc7b-5028d10bdf19) | 3 190 € | non : classée particulier, mais « révisé dans notre garage », « Garantie 3 mois » |
| [C3 1.1i Pack, 05/2004, 150 000 km (37, Tours)](https://www.autoscout24.fr/offres/citroen-c3-c3-1-1i-pack-essence-blanc-cat_ma21mo18264-37950a18-5f7e-4e3b-92de-2bfc325b5d3a) | 3 200 € | non : classée particulier, mais « vendu révisé garantie 3 mois », « carte grise offert » (le prix de la première version) |

Médiane des cinq retenues : **2 700 €** (moyenne : 2 578 €). Les annonces 1 et 2 n'ont pas de description ; aucune
n'affiche de garantie ni de mention de garage.

## Le scénario chiffré

**L'achat.** Une C3 1.4i essence de 2004, 150 000 km, achetée le mardi 1er septembre 2026 à un particulier, pour la
revendre (sa première revente). Le vendeur lui a remis un contrôle du **10 mars 2026**. Le débutant fait sa carte
grise le mercredi 2 septembre : le contrôle a 5 mois et 23 jours ce jour-là, il vaut pour lui.

| Jour | Ce qui entre dans la pochette | Coût |
|---|---|---|
| mar. 6 oct. | le contrôle du 10 mars a 6 mois et 26 jours : bon pour rouler jusqu'au 9 mars 2028, plus pour vendre (il n'aurait servi que pour une carte grise demandée au plus tard le 9 septembre). **Contrôle refait**, favorable, sans contre-visite | 78 € |
| mar. 6 oct. | **certificat de situation administrative** téléchargé sur HistoVec, daté du 6 : bon pour une vente jusqu'au 20 octobre | 0 € |
| mar. 6 oct. | déclaration de cession **commencée** sur le site de l'ANTS ; cerfa 15776 téléchargé et pré-rempli, imprimé en deux exemplaires ; carte grise rangée, prête à barrer | 0 € |
| mar. 6 oct., 19 h | la pochette est pleine : **l'annonce passe en ligne**, à 2 700 € | — |
| jeu. 8 oct. | message de l'acheteur : il prend au prix de l'annonce, 2 700 €, rendez-vous samedi 11 h, paiement en virement instantané | — |
| | **Total de la pochette** | **78 €** |

Si la vente avait lieu après le 20 octobre, il retéléchargerait le certificat de situation (gratuit, immédiat).

**Samedi 10 octobre : le compteur, pas à pas** (horloge à rouleaux en haut de l'écran, une minute par geste ; temps
du film du brief).

| t film (s) | Horloge | Ce qui se passe | Montant |
|---|---|---|---|
| 0,00 | **11:00** | il sonne ; bulle « Acheteur · Je suis devant. » | étiquette 2 700 € |
| 2,15 | 11:20 | flash-forward : VENDUE, la C3 part ; « Beau-frère · 20 min ? Impossible. » | — |
| 4,45 → 4,95 | 11:20 → 11:00 | retour | — |
| 4,95 → 5,75 | 11:01 → 11:09 | l'essai ; à 5,64 s, la bulle passe à « Les papiers ? » (round 3) | — |
| 7,50 | 11:10 | « Le contrôle ? » → contrôle du 6 oct. | 78 € (payé mardi) |
| 8,00 | 11:11 | « Pas de gage ? » → certificat de situation administrative du 6 oct., ni gage ni opposition | 0 € |
| 8,50 | 11:12 | « La cession ? » → deux exemplaires pré-remplis | 0 € |
| 9,00 | 11:13 | « La carte grise ? » → prête à barrer | 0 € |
| 9,40 | 11:14 | il lance le virement instantané | 0 € de frais |
| 12,00 | 11:15 | « Virement reçu · + 2 700,00 € », vu sur ton compte | **+ 2 700 €** |
| 12,75 | 11:16 | cession signée deux fois ; carte grise barrée « Vendu le 10/10/2026 à 11 h 16 », signée ; coupon rempli à son nom | 0 € |
| 13,50 | 11:17 | déclaration finie sur le site de l'ANTS (date, heure, kilométrage, adresse) | 0,00 € |
| 15,00 | 11:18 | code de cession remis | — |
| 15,50 | 11:18 | (gag) « Site qui imite l'officiel · − 49,90 € » : ton beau-frère | − 49,90 € (pas toi) |
| 17,00 | 11:19 | les clés | — |
| 17,50 | **11:20** | il repart avec ; l'horloge devient « 20 min » | — |

**Le chiffre final** : **20 min**. La chute : le café servi à 11 h est encore chaud.

## La méthode du pro et le verdict

La pochette se remplit avant l'annonce : cinq pièces, 78 € (contrôle 78 €, les quatre autres 0 €).

| Pièce | Règle | La C3 |
|---|---|---|
| Contrôle technique | moins de 6 mois à la date où l'acheteur dépose sa demande de carte grise (F1707, F1050) ; il a un mois : vends avec de la marge. 2 ans pour rouler (F2878) | celui de l'achat (10 mars) : bon pour une revente jusqu'au 9 sept. ; 7 mois le jour de la vente → **refait le 6 oct., 78 €** |
| Situation administrative | moins de 15 jours, HistoVec, gratuit | 6 oct. → bon jusqu'au 20 oct. |
| Certificat de cession | cerfa 15776, deux exemplaires, signés le jour J ; déclaration dans les 15 jours | pré-rempli le 6 oct. |
| Carte grise | « vendu le », date, heure, signature ; coupon rempli, pas découpé ; l'acheteur circule un mois avec | barrée à 11 h 16 |
| Déclaration de cession | site de l'ANTS, gratuite (France Titres-ANTS), dans les 15 jours ; commencée avant, finie le jour J ; code de cession valable 15 jours, remis | commencée le 6, finie à 11 h 17 |

**Le verdict** : « Le tien a sept mois : tu le refais. » Le contrôle reçu à l'achat ne sert à revendre que s'il a
encore moins de 6 mois quand l'acheteur suivant dépose sa carte grise ; ici, il a 7 mois le jour de la vente : refait
le 6 octobre, 78 €. À l'écran : « Contrôle d'achat · 10 mars · bon jusqu'au 9 sept. », barré, puis « refait le 6 oct.
· 78 € ».

**Ce que la vidéo ne dit pas, parce qu'on ne le sait pas** : qu'une vente dure toujours vingt minutes ; que l'acheteur
paie le prix de l'annonce (ici oui, c'est l'exemple) ; que la pochette évite la négociation ; qu'un virement
instantané protège de toute fraude. Elle ne dit pas non plus « rien à refaire » : il reste à prévenir l'assureur.
C'est un exemple, annoncé comme tel.

## Réponses prêtes pour les commentaires

- **« Six mois au jour de la vente ? »** : non, au jour où ton acheteur dépose sa demande de carte grise (F1707 :
  « moins de 6 mois à la date de dépôt de la demande d'établissement »). Il a un mois pour la faire (F1050). Garde de
  la marge : un contrôle de 5 mois et 3 semaines peut le mettre hors délai.
- **« Et le chèque de banque ? »** : de faux chèques circulent ; appelle la banque émettrice avec un numéro que tu
  trouves toi-même, pas celui du chèque ; vérifie le numéro, le montant, le bénéficiaire ; rendez-vous aux heures
  d'ouverture, évite le dimanche et les jours fériés (INC).
- **« Et le liquide ? »** : entre particuliers qui n'agissent pas pour des besoins professionnels, pas de plafond, mais
  un écrit au-delà de 1 500 € (F10999), et gare aux faux billets (INC). Le paiement en espèces d'un particulier à un
  professionnel est limité à 1 000 € (F10999) : si l'achat-revente devient ton activité, la règle n'est plus celle des
  particuliers. Le statut du revendeur ne se tranche pas en commentaire (`recette-47/references/sujets.md` : à faire
  vérifier par un juriste).
- **« Un virement instantané, ça s'annule ? »** : un ordre exécuté est irrévocable (Banque de France) ; une demande de
  retour reste possible jusqu'à 30 jours en cas de fraude, seulement si le bénéficiaire et sa banque l'acceptent
  (INC). Regarde ton compte, pas son écran, avant de signer.
- **« J'ai payé pour la déclaration »** : la déclaration est gratuite sur le site de l'ANTS (France Titres-ANTS) ;
  l'adresse officielle finit en « gouv.fr ». Pour un remboursement, l'ANTS renvoie vers le site qui a encaissé
  (Services Publics +, 4713477).

## La voix

**État au 9 octobre 2026 : provisoire.** ElevenLabs a bloqué le compte (« Unusual activity… Free Tier access has been
disabled ») : aucune prise, aucun appel. `python3 scripts/vo-mo12.py --provisoire` a écrit
`audio/vo-mo12/vo-timing.json` au format de MO9 (`dur`, `take`, `lines`, `words`, `marks`, `loop`), avec
`"provisional": true`, `estimate` et `hookB` (répliques, mots et repères de l'ouverture B), et un `vo-placed.wav` muet
de 31,05 s. Le film lit ces repères comme il lira ceux de la prise : chaque geste suit son mot.

### Le texte à générer

Une seule génération : Simon `mvhJVdVoTWVUtL4keT7W`, modèle `eleven_v3`, français, **generations_count 1**. 556
caractères balises comprises (504 sans), soit environ 570 crédits (MO10 : 570 caractères pour 580 crédits). Avant
d'envoyer, demander l'estimation, puis le solde : l'estimation de MO9 ne vérifiait pas le quota. Après un échec, on ne
relance pas : on note l'erreur et on attend l'utilisateur. L'ouverture B se dit à la fin, après `[pause]`, dans la
même génération (méthode de MO10). La prise se dépose en `audio/vo-mo12/takeA.mp3`.

```
Onze heures, ton acheteur sonne. Onze heures vingt, tu l'as vendue. [deadpan] Ton beau-frère n'y croit pas.
Il demande les papiers : tu tends la pochette.
Tu attends le virement.
Déclaration de vente : zéro euro. [deadpan] Ton beau-frère l'a payée.
Vingt minutes. [short pause] Ton café est encore chaud.
Mardi, tu remplis la pochette.
Contrôle : deux ans pour rouler, six mois pour vendre.
Le tien a sept mois : tu le refais.
La prochaine fois que tu vends…
[pause]
Vingt minutes, tu la vends deux mille sept cents. [deadpan] Ton beau-frère n'y croit pas.
```

Le script garde ce texte (`TEXTE`) et vérifie à chaque lancement que ses treize répliques et les deux de l'ouverture B
le redisent mot pour mot, chiffres lus en lettres, et que chaque repère vise un mot de sa réplique. Si on change l'un
sans l'autre, il s'arrête.

### Le minutage provisoire

Chaque réplique part à son ancre du brief, ou 0,3 s après la fin de la précédente si celle-ci déborde ; l'écart monte à
0,8 s avant « Il demande » (le retour et l'essai) et avant « Vingt minutes », à 1,4 s avant « Déclaration » (l'attente
muette) et avant « Mardi » (le rembobinage), à 0,6 s avant « Ton café » (la seule pause). Durée d'une réplique : ses
syllabes dites (nombres lus en lettres, méthode du brief) divisées par 5,90 par seconde, plus 0,45 s par ponctuation
interne, moins 0,09 s pour une réplique d'ouverture, 0,55 s au moins. Les mots s'y répartissent au prorata de leurs
syllabes. Ces valeurs viennent des 25 répliques posées de MO9 et MO10, mesurées après accélération
(`python3 scripts/vo-mo12.py --calibre`, 0,25 s d'écart type par réplique) ; sur leurs ouvertures (× 1,15), Simon
parle 0,09 s plus vite que le modèle, l'écart que le brief avait noté.

| Réplique (sous-titre) | Provisoire (s) | Brief (s) |
|---|---|---|
| 11 heures, ton acheteur sonne. | 0,10-1,65 | 0,10-1,55 |
| 11 heures 20, tu l'as vendue. | 1,95-3,49 | 1,75-3,15 |
| Ton beau-frère n'y croit pas. | 3,79-4,72 | 3,40-4,40 |
| Il demande les papiers : tu tends la pochette. | 5,52-7,83 | 5,20-7,40 |
| Tu attends le virement. | 9,40-10,59 | 9,40-10,60 |
| Déclaration de vente : 0 euro. | 13,40-15,54 | 13,40-15,45 |
| Ton beau-frère l'a payée. | 15,85-16,86 | 15,65-16,65 |
| 20 minutes. | 18,00-18,55 | 18,00-18,75 |
| Ton café est encore chaud. | 19,35-20,54 | 19,35-20,55 |
| Mardi, tu remplis la pochette. | 22,05-23,86 | 22,05-23,80 |
| Contrôle : 2 ans pour rouler, 6 mois pour vendre. | 24,16-26,92 | 24,00-26,45 |
| Le tien a 7 mois : tu le refais. | 27,22-29,20 | 26,70-28,75 |
| La prochaine fois que tu vends… | 29,65-30,83 | 29,20-30,55 |
| *B :* 20 minutes, tu la vends 2 700. | 0,10-2,15 | 0,10-2,00 |
| *B :* Ton beau-frère n'y croit pas. | 3,79-4,72 | 3,40-4,40 |

Parole : 20,2 s pour 72 mots et 99 syllabes. La voix finit à 30,83 s ; la boucle part à 29,45 s, 0,2 s avant « La
prochaine fois », quand la pochette se replie. Le film proposé dure **31,05 s** (plafond 31,5 s ; MO9 : 31,4 s) : il
finit 0,2 s après « vends… », et « Onze » revient à 0,10 s, soit 0,3 s entre les phrases à la boucle. Aucune réplique
ne chevauche la suivante, 0,3 s au moins les sépare. Avec ce modèle, chaque réplique d'ouverture dure 0,1 à 0,4 s de
plus que dans le brief : « vingt » tombe à 2,26 s (brief : 2,15), « beau-frère » à 3,95 s (brief : 3,50).

Les repères (`marks`, 44 en A, 7 en B), un par geste du film :
- ouverture : `onze`, `acheteur`, `sonne`, `onze2`, `vingt`, `vendue`, `beaufrere`, `croit` ;
- jour 1 (retour et essai, sans voix) : `retour`, sur « pas » ;
- les coups : `demande`, `papiers`, `tends`, `pochette`, `attends`, `virement`, `declaration`, `vente`, `zero`,
  `euro` ;
- le gag : `gag` (« Ton », la notification se pose 0,15 s avant), `beaufrere2`, `payee` ;
- le chiffre final : `vingt2`, `minutes` ; la chute : `tasse` (« Ton »), `cafe`, `encore`, `chaud` ;
- la méthode : `mardi`, `remplis`, `pochette2`, `controle`, `deuxans`, `rouler`, `sixmois`, `vendre` ;
- le verdict : `letien` (la carte du contrôle d'achat se pose), `tien`, `sept`, `mois` (le trait), `tu` (« refait le
  6 oct. »), `refais` ;
- la boucle : `prochaine`, `vends` ; ouverture B (`hookB.marks`) : `vingtB`, `minutesB`, `vendsB`, `b2700`,
  `beaufrereB`, `croitB`, `retourB`.

Sous-titres provisoires : `python3 scripts/srt-mo12.py` écrit `renders/9x16-mo12.srt` (13 cartons) et
`renders/9x16-mo12-B.srt` (12), deux lignes de 32 caractères au plus, coupées après une ponctuation quand c'est
possible.

**Pourquoi pas 2,6 mots par seconde.** À 2,6 mots dits par seconde sans pause interne (`--provisoire --unite mots
--debit 2.6 --pause-int 0 --essai`), la parole dure 27,7 s, la voix finit à 35,04 s et le film à 35,25 s, 3,75 s
au-delà du plafond ; les trois coupes du brief n'en reprennent que 0,5 s (34,75 s). « Ton beau-frère » glisse de 3,40
à 4,93 s, après la mesure à 3 s. Ce débit décrit un film entier, silences compris (MO5 : 65 mots pour 29,6 s, soit
2,2 mots par seconde). Dans une réplique, Simon posé à × 1,15-1,2 dit 3,5 mots par seconde pauses internes comprises,
4,9 hors pauses (MO9 et MO10). MO11 l'a écarté pour la même raison (`docs/timeline-mo11.md`).

Si la prise est plus lente que le modèle (MO10 a dit « Ceux qui gagnent comptent en jours. » 0,56 s plus lentement),
le film garde 0,45 s sous le plafond, puis les coupes de l'étape 4 ci-dessous.

### Une fois la prise déposée

Depuis `video/` :

1. Déposer la génération en `audio/vo-mo12/takeA.mp3` (une seule prise, ouverture B comprise).
2. `python3 scripts/vo-mo12.py takeA.mp3 --retenue`. Le script transcrit la prise (faster-whisper *medium*, en cache ;
   *small* s'il manque) dans `words.json` et aligne le texte sur la transcription : chaque mot de whisper va au jeton
   dont il partage le plus de lettres, un mot mal entendu à la réplique la plus proche dans le temps. Il recale les
   bornes sur l'enveloppe à 20 ms, pose les répliques à × 1,15 (ouverture, chute, boucle) et × 1,2 (récit, méthode)
   sur leurs ancres, écrit les repères, l'ouverture B (`vo-placed-B.wav`), `vo-placed.wav`, `vo-timing.json` (sans
   `provisional`) et la durée dans `timeline-mo12.json` s'il existe. Il retranscrit ensuite la pose et liste les mots
   qu'il n'y retrouve pas. Sur 2 cœurs (`WHISPER_THREADS`), compter 4 minutes.
3. Écouter `vo-placed.wav` et `vo-placed-B.wav`, lire les lignes « ! » et « recalé sur l'enveloppe ». Un mot mal placé
   se corrige dans `FIX` (`{indice: (début, fin)}`, temps de la prise), une réplique mal alignée dans `SPAN`
   (`{clé: (premier indice, dernier)}`) ; relancer l'étape 2. La transcription reste en cache (`--retranscrire` la
   refait).
4. Si le film dépasse 31,5 s, relancer l'étape 2 avec `--coupes 1` (l'attente muette passe de 1,4 à 1,0 s), puis
   `--coupes 2` (l'essai, de 0,8 à 0,6 s), puis `--coupes 3` (« Tu attends le virement. » retirée ; ses repères
   restent, sans durée, à son ancre).
5. `python3 scripts/srt-mo12.py` : sous-titres sur les vrais temps.
6. `CUT=mo12 node scripts/events.mjs` : temps des événements du film (`film-mo12/events.json`), pour les bruitages.
7. `python3 scripts/audio-mo12.py` : le mix, rapport dans `docs/mix_report-mo12.txt` ; l'ouverture B se mixe avec
   `vo-placed-B.wav` (`HOOK=B`, comme `audio-mo10.py`).
8. Rendu : `CUT=mo12 node scripts/render.mjs --draft` pour contrôler, puis le rendu final en morceaux comme MO9
   (`CUT=mo12 MB=4 PARTS=4 PART=0..3 node scripts/render.mjs --all`, puis `--assemble`) quand trois épisodes ne se
   partagent plus la machine ; `HOOK=B` pour l'ouverture B ; contrôle par `qa_video.py`.

Essai du mode prise le 9 octobre, sur une prise de synthèse (espeak-ng, même texte, dossier d'essai désigné par
`VO_DIR`) : malgré une transcription très dégradée (« Couteau » pour « Contrôle », « Retiens » pour « Le tien »),
l'alignement pose les quinze répliques sur leurs mots ; la retranscription de la pose ne perd aucun mot ; `--coupes 3`
retire la réplique 5 et garde ses repères.

## Les plans réels

Mixkit, licence « Mixkit Stock Video Free License » (usage commercial libre, modification permise, sans crédit
obligatoire), comme MO5, MO9 et MO10. Chaque clip a été regardé le 9 octobre 2026 sur au moins trois images (planches
de 4 à 12 images par clip, puis la séquence livrée au début, au milieu et à la fin) : aucun visage, aucun logo, aucune
plaque, aucun texte lisible dans la fenêtre retenue. Vidéos hors dépôt (`assets/stock/mo12/`), séquences hors dépôt
(`film-mo12/seq/<clé>/001.jpg…`, 30 i/s, 720 px de large, ignorées par `.gitignore`), nombre d'images par clé dans
`film-mo12/seq.json`. À lire avec `Kit47.loadSeqs('seq', SEQ)` et `Kit47.drawSeq` (aller-retour : une séquence courte
ne saute jamais).

| Clé | Mixkit | Fenêtre (s du clip) | Images | Ce qu'on y voit | Où (brief) | Contrôle |
|---|---|---|---|---|---|---|
| essai | 13976 | 11,30 → 14,80 | 105 | mains d'homme sur un volant gainé, route de jour, glissière, lauriers roses, pylônes | carte de l'essai, 4,95 → 5,75 s | le moyeu du volant reste hors champ (aucun logo) ; des voitures passent avant 11,3 s et après 14,8 s (plaque possible) : hors fenêtre |
| ct2 | 13260 | 12,05 → 13,90, recadré à droite (x ≥ 410 sur 1280) | 56 | dessous d'une voiture sur un pont élévateur, roue, échappement, atelier clair aux murs de briques | carte « Contrôle · 6 oct. » (7,50 → 9,00 s) : **recommandé** (le plan de MO5, lisible en petit ; 1,9 s suffisent en aller-retour) | le mécanicien montre son visage de 0 à 11,5 s et dès 13,95 s : seule cette fenêtre, recadrée, est sans lui |
| ct | 17133 | 6,50 → 11,00, ombres relevées (gamma 1,3) | 135 | dessous d'une voiture qui monte sur un pont, roue de secours, bras rouges du pont, atelier sombre | variante plus longue de la carte du contrôle | aucun visage (au fond, entre les bras du pont, des jambes floues), aucun texte |
| phone | 4915 | 2,00 → 6,50 | 135 | deux mains qui tapent sur un téléphone, fond sombre, bord de table en bois | carte « Virement · en cours » (9,40 → 12,00 s) | écran flou : clavier deviné, illisible à 720 px, aucune interface ; MO11 utilise le même clip (« messages ») |
| signe | 17416 | 1,60 → 6,00 | 132 | un stylo arrive et signe sur une ligne pointillée, gros plan, la signature bleue reste | carte de la cession, deux signatures (12,25 et 12,50 s) | le mot anglais « Signature » imprimé sous la ligne est effacé sur chaque image (`scripts/seq-mo12.py`), vérifié au zoom sur 9 images et par mesure sur les 132 |
| signe2 | 241 | 4,00 → 8,50 | 135 | une main signe une feuille sur une table ronde en bois, téléphone éteint posé à côté | carte grise barrée (12,75 → 13,25 s) | cadré sous les épaules : aucun visage ; texte de la feuille illisible ; écran du téléphone noir |
| cles | 34140 | 1,00 → 5,50 | 136 | une main tend un trousseau de deux clés, veste sombre, fond blanc | case 3 à 17,00 s | cadré sous le col : aucun visage ; tête de clé sans marque lisible |
| cafe | 44956 | 1,00 → 5,50 | 135 | tasse blanche fumante sur sa soucoupe, lumière de jour, la vapeur monte nettement | la tasse de l'image 0 et de la chute (19,35 s), si le pictogramme ne suffit pas : **recommandé**, la vapeur porte « encore chaud » | tasse unie, liseré doré, aucun logo |
| cafe2 | 808 | 1,00 → 5,50 | 135 | tasse grise et sa cuillère, lumière chaude rasante, fond sombre, vapeur à peine visible | variante sombre de la tasse | aucun logo |
| jours | 38501 | 8,50 → 13,00, flouté (sigma 3 px à 720 px) | 135 | des jours cerclés puis barrés au feutre bleu sur un calendrier, le bout du feutre | fond flou du rembobinage (20,70 → 21,95 s) | calendrier en anglais (« December », « Mo Tu We ») : livré déjà flouté, ne jamais le montrer net |

Écartés : 13260 hors de la fenêtre ci-dessus (visage du mécanicien ; MO5, MO9 et MO10 l'avaient pris dès 1,0 s) ;
24723 (montre au poignet, écran du tableau de bord lisible ; 13976 suffit) ; 307 (signature à un bureau, doublon de
241) ; 21813 (visage), 45923 (menton visible), 38492 (texte de contrat anglais lisible), 21812 (porte : plus utilisée).
Recherche d'un pont sans personne : `mixkit.py search car-lift mechanic car-repair garage car-service` puis
`car-mechanic car-workshop auto-repair tire-change car-inspection` (planches du 9 octobre) : 17133 est le seul plan de
pont sans personne.

```
python3 ../.claude/skills/motion-studio/scripts/mixkit.py get 13976 13260 17133 4915 17416 241 34140 44956 808 38501 --out assets/stock/mo12
python3 scripts/seq-mo12.py                   # toutes les clés → film-mo12/seq/ et film-mo12/seq.json
python3 scripts/seq-mo12.py signe --check D   # une clé, et une planche début / milieu / fin dans D
```

`film-mo12/seq.json` : `{"essai": 105, "ct": 135, "ct2": 56, "phone": 135, "signe": 132, "signe2": 135, "cles": 136,
"cafe": 135, "cafe2": 135, "jours": 135}`.

## Bruitages

Banques : `audio/bank/mo5/` (celle de MO5, reprise par MO9 avec `audio/bank/mo6/` : il n'existe pas de dossier
`audio/bank/mo9/`) et `audio/bank/mo12/`, 14 sons Mixkit ajoutés le 9 octobre 2026 pour ce que l'histoire a en propre
(licence « Mixkit Sound Effects Free License », usage commercial, sans crédit obligatoire ; fichiers d'aperçu
`https://assets.mixkit.co/active_storage/sfx/<id>/<id>-preview.mp3`, comme les autres banques). Chaque son a été
mesuré (durée utile, attaques, spectre) avant d'entrer dans la banque. Le moteur, la vibration du téléphone, le
tic-tac et l'arrêt de bande se fabriquent comme dans `scripts/audio-mo5.py` et `scripts/audio-mo9.py`.

**Les sons ajoutés** (`audio/bank/mo12/sfx-<id>.mp3`) :

| Id | Titre Mixkit | Ce qu'on entend | Partie utile | Rôle (`ROLE` d'audio-mo9.py) |
|---|---|---|---|---|
| 113 | Modern classic door bell sound | la sonnette : « ding-dong » de maison, deux notes | 0,03 → 1,2 s (fondu) | chime |
| 2356 | Dry pop up notification alert | la petite bulle du beau-frère, note sèche | 0,03 → 0,22 s | ui |
| 1124 | Plastic bubble click | le tic de la bulle quand l'acheteur change de question | 0,11 s, un clic | tick |
| 1530 | Paper slide | la pochette qui monte, papier qui glisse | 0,17 → 0,40 s | ui |
| 1105 | Big paper page turn | le rabat de la pochette qui s'ouvre (et, à l'envers, qui se ferme) | 0,26 → 0,51 s | ui |
| 2370 | Fast signing with a pen | les signatures : quatre gestes de stylo | 0,01-0,17 · 0,49-0,69 · 0,90-1,15 · 1,27-2,00 s | tool |
| 2998 | Pen marker line | le trait orange qui barre (carte grise, contrôle d'achat) | 0,01 → 0,30 s | ui |
| 931 | Service bell | la caisse du gag, la cloche | 0,01 → 1,0 s | chime |
| 1939 | Coins handling | la caisse du gag, la monnaie (0,05 s après la cloche) | 0,04 → 0,40 s | orn |
| 2182 | Wood hard hit | le coup sec du tampon (VENDUE, signé, PRÊTE), sous le papier de 2380 | 0,06 → 0,18 s | accent |
| 1393 | Smartphone typing | les tapotements sur le téléphone (virement lancé) | attaques toutes les 0,1 à 0,25 s, 3,9 s | tool |
| 2997 | Clear mouse clicks | le clic qui finit la déclaration | 0,21 s, un clic | ui |
| 2835 | Stirring cutlery in ceramic plate | une cuillère contre la tasse (un seul tintement) | 1,05 → 1,30 s | orn |
| 1564 | Car door slam | facultatif : la portière de l'acheteur avant le départ | 0,12 → 0,32 s | accent |

Pas de caisse enregistreuse chez Mixkit (catégories `money`, `cash`, `coins`, `shop`, `bell` parcourues) : la cloche de
comptoir et la monnaie, posées à 0,05 s l'une de l'autre, la font. Pas de son de tampon non plus : 2182 sous 2380 (MO9 jouait 2380 seul, à + 10 dB). 1530 et 2182 sont les mêmes
fichiers que ceux de `audio/bank/mo8/`.

**Repris des banques de MO5 et MO6** (rôles d'audio-mo5.py et audio-mo9.py) : 2354 (note de notification, une par
carte, qui monte), 951 (virement reçu), 1490 et 1492 (souffles), 3120 (souffle, à l'envers pour le retour), 1054
(rouleaux de l'horloge), 1384 et 1119 (petits tics, palettes), 2380 (papier du tampon), 2369 (écriture à la lumière),
3005 (trait de lumière), 2589 (point de lumière, éclair), 2909 (impact), 1107 (note claire), 2384 (les chiffres
claquent), 1092 (bande qui rembobine), 1063 (tic-tac), 1538 et 1566 (moteur : démarrage, puis départ), 1558 (clés),
1554 (route, un passage de 0,8 s pour l'essai).

**Où ils tombent** (temps provisoires du brief ; dans `audio-mo12.py`, chaque son s'attache à son repère de
`film-mo12/events.json`, comme dans MO9) :

| t (s) | Ce qui se passe | Son | Réglage |
|---|---|---|---|
| 0,10 | la bulle « Je suis devant. » vibre | vibration fabriquée (MO5 : 165 Hz hachés à 24 Hz, 0,25 s) | −15 dB, sous la voix |
| 1,25 | « sonne » | 113 | chime, −2 dB, pan −0,2, 1,2 s avec fondu |
| 2,15 | 11:00 → 11:20 | 1054 | tick, 0,45 s, +6 dB |
| 2,50 | tampon VENDUE | 2182 + 2380 | accent −4 dB, priorité 1 ; 2380 tick +10 dB |
| 2,70 | la C3 sort par la gauche | 1538 (régime qui monte, MO5) | engine, pan 0 → −0,85 en 0,5 s |
| 3,50 | bulle du beau-frère | 2356 | ui, st −2, pan +0,4 |
| 4,45 | retour court | 3120 à l'envers + 1054 | whoosh 0,5 s ; tick st −2 |
| 4,95 | carte de l'essai, 11:01 → 11:09 | 1554 (0,8 s) + 1054 | whoosh −6 dB ; tick 0,8 s |
| 6,50 · 7,00 | la pochette monte, le rabat s'ouvre | 1530 · 1105 | ui −4 dB · ui −2 dB |
| ~~7,25 · 7,75 · 8,25 · 8,75~~ | la bulle change de question : **retiré au round 2** (la carte sort 0,1 s avant sa question, sa note porte la paire) | ~~1124~~ | — |
| 7,50 · 8,00 · 8,50 · 9,00 | une carte sort et répond | 2354 st 0, 2, 4, 5 (+ 2380 −6 dB) | ui, une note qui monte, un son principal à la fois |
| 9,40 | les mains sur le téléphone | 1393 (1,2 s) | tool, pan +0,2 |
| 10,60 → 12,00 | l'attente | 1063 | tick, discret (la basse sort de la musique) |
| 12,00 | « Virement reçu » | vibration (deux fois) + 1490 + 951 | 951 chime priorité 1 |
| 12,25 · 12,50 | deux signatures sur la cession | 2370 (0,01 → 0,17 s, puis 0,49 → 0,69 s) ; tampons « signé » 2182 à 12,40 et 12,65 | tool ; accent −10 dB |
| 12,75 → 13,25 | carte grise barrée, « Vendu le… » écrit, signée | 2998 · 2369 · 2370 (0,90 → 1,15 s) | ui · orn · tool |
| 13,50 · 14,85 | déclaration, « 0,00 € » s'allume | 2997 · 1107 st +2 | ui · chime −4 dB |
| 15,00 | code de cession remis | 2354 st 7 | ui |
| 15,50 | le gag, seul | 1490 (en avance) + 931 + 1939 à +0,05 s | chime priorité 1 ; orn |
| 17,00 · 17,15 | les clés · la C3 démarre et part | 1558 · 1566 puis 1538 | tool · engine, pan 0 → −0,85 (portière 1564 facultative vers 17,05) |
| 17,50 · 17,85 | 11:20 → « 20 min », arrêt de bande | 1054 + 2909 · musique (MO5) | tick · accent priorité 1 |
| 18,00 → 19,35 | la seule pause | rien | silence |
| 19,35 · 19,90 | la tasse revient · « encore chaud. » s'écrit | 2835 (un tintement) · 2369 | orn −3 dB · orn |
| 20,70 → 21,95 | rembobinage, palettes « MAR 6 OCT » | 1092 + 1119 × 5 | accent −6 dB, 1,45 s ; tick |
| 22,50 → 24,50 | cinq cartes entrent dans la pochette | 2369 st 0, 2, 4, 5, 7 (+ 2380 −6 dB) | orn, une note par carte, qui monte |
| 24,60 · 25,80 | « 2 ans pour rouler » · « < 6 mois à sa carte grise » (round 3, minutage provisoire : lignes à 25,36 et 26,22 s, une fois le bandeau agrandi ; les notes suivent le texte) | 1107 st 0 · 1107 st 3 | chime −4 dB, note claire |
| 25,00 | « Pochette : 78 € » | 2589 + 2384 | orn · ui |
| 26,50 · 27,50 · 28,00 | contrôle d'achat posé · barré · « refait le 6 oct. » ; sur « refais », le bandeau « Contrôle » pulse et son « 78 € » s'allume (round 3 : l'éclair est retiré) | 1490 · 2998 · 2369 + 3005 | whoosh −4 dB · ui · orn |
| 28,50 · 28,75 | le rabat se ferme · tampon PRÊTE | 1105 à l'envers · 2182 + 2380 st +2 | ui · accent (répond à VENDUE) |
| 29,00 | retour à l'image 0 | 3120 | whoosh 0,8 s |

## Ce qui a changé à la révision du 9 octobre

- Règle du contrôle réécrite (6 mois à la demande de carte grise de l'acheteur, pas au jour de la vente), verdict
  rattaché à l'exemple, règle de l'achat-revente ajoutée.
- Prix de vente : 3 200 € (une annonce, probablement d'un garage) → 2 700 € (médiane de cinq annonces de
  particuliers).
- Certificat de situation daté du 6 octobre (et non du 9) ; carte grise du débutant datée du 2 septembre.
- Scène passée de 14 h à 11 h (MO11 dit « Samedi, quatorze heures ») ; horloge 11:18 pendant le gag, 11:19 sur les
  clés.
- Sources du paiement : L'argus retiré, Banque de France et INC citées avec leurs conditions ; espèces : la condition
  « besoins professionnels » de F10999 rétablie.
- Gag : citation de 7046845 attribuée à l'usager ; page DGCCRF (403) remplacée par la DREETS PACA, avec sa réserve ;
  49,90 € présenté comme un cas réel.
- Sieste et ses sources retirées (la chute est devenue le café).
