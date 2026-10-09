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
| [Citroën C3 front.jpg](https://commons.wikimedia.org/wiki/File%3ACitro%C3%ABn_C3_front.jpg) | M 93, **domaine public** (aucun crédit obligatoire) | `assets/cars-libres/car-c3.png` (RGBA, rognée, 1757×1241), `assets/cars-libres/car-c3-contour.js` (`window.CAR_C3_CONTOUR`) |

Déjà traitée par `scripts/cars-libres-twingo-c3.py` : double chevron de la calandre et des enjoliveurs effacés, texte
du cadre de plaque effacé, plaque vierge, détourage BiRefNet, bords décontaminés, étalonnage de la charte. L'avant
regarde à gauche : elle sort par la gauche. On la copie telle quelle dans `assets/photos-mo12/` (original :
`assets/cars-libres/src/wm-c3.jpg`, hors dépôt ; crédits : `assets/cars-libres/CREDITS.tsv`).

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
| 4,95 → 5,75 | 11:01 → 11:09 | l'essai | — |
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

Texte, méthode de comptage, minutage provisoire et texte exact pour ElevenLabs : `brief-mo12.md`, section « La voix ».
Une seule génération (generations_count = 1), environ 570 crédits (556 caractères ; MO10 : 570 caractères pour
580 crédits), quand l'utilisateur aura débloqué le compte. Rien n'est envoyé avant.

## Les plans réels

Mixkit, licence « Mixkit Stock Video Free License » (usage commercial libre, sans crédit obligatoire), comme MO5, MO9
et MO10. Candidats repérés le 9 octobre 2026 sur une planche de vignettes
(`mixkit.py search coffee steering-wheel signing documents smartphone door --sheet …`) ; chacun se regarde sur trois
images avant usage (visage, logo de volant, texte lisible).

| Nom | Mixkit | Ce qu'on y voit | Où | À vérifier |
|---|---|---|---|---|
| cafe | 808 | tasse fumante sur une table, lumière de jour | image 0 et chute (si la tasse dessinée ne suffit pas) | — |
| essai | 13976 | mains sur un volant, route de jour | l'essai, 4,95 → 5,75 s | logo au centre du volant |
| essai2 | 24723 | main qui tapote un volant, montre | l'essai (variante) | logo du volant, marque de la montre |
| ct | 13260 | voiture sur un pont élévateur (MO5) | carte du contrôle | — |
| phone | 4915 | mains qui tapent sur un téléphone | le virement | écran sans interface lisible |
| signe | 17416 | stylo sur une ligne de signature, gros plan | cession signée | mot anglais « Signature » : flou ou recadrage |
| signe2 | 241 | mains qui signent (MO5) | carte grise barrée | — |
| cles | 34140 | main qui tend des clés (MO5, MO9) | les clés | — |
| jours | 38501 | jours rayés sur un calendrier (MO10) | fond flou du rembobinage | — |

Écartés : 21813 (visage), 45923 (menton visible), 38492 (texte de contrat anglais lisible), 21812 (porte : plus
utilisée).

```
python3 ../.claude/skills/motion-studio/scripts/mixkit.py get 808 13976 24723 13260 4915 17416 241 34140 38501 --out assets/stock/mo12
python3 ../.claude/skills/motion-studio/scripts/mixkit.py seq assets/stock/mo12/mixkit-<id>.mp4 film-mo12/seq/<nom> --start 1.0 --dur 4
```

Bruitages (banque `audio/bank/mo12/`, Mixkit) : sonnette, petite bulle, papier qui glisse et rabat de pochette, stylo
sur papier, caisse enregistreuse (le gag), clés, plus les sons des banques MO5, MO6 et MO9 (vibration, rouleaux,
tampon, notification, moteur, arrêt de bande, souffle inversé).

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
