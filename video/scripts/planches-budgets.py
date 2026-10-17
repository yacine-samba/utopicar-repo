"""Planches des 5 concepts achat-revente par budget (2 000 / 5 000 / 10 000 / 20 000 €).

Une source unique (CONCEPTS, SOURCES) → une planche HTML par concept dans video/planches-budgets/.
Chaque planche : diagnostic, accroches, art du hook, découpage en 9:16 (zones de video/CLAUDE.md),
script final, contrôle qualité, variante, éléments à fournir, sources.

usage (depuis la racine du dépôt) : python3 video/scripts/planches-budgets.py
"""
import html
import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = os.path.join(ROOT, "planches-budgets")
WORDS_PER_SECOND = 3.1  # débit retenu : Simon × 1,2 (MO9 : 74 mots = 23,8 s de parole)

SOURCES = {
    "S1": ("Fiches-auto, rappel 1.2 PureTech 110 et 130 ch (fabriqués de mars 2013 à avril 2017)",
           "https://www.fiches-auto.fr/articles-auto/rappels-constructeurs/s-2398-rappel-des-12-puretech.php"),
    "S2": ("Italpassion, liste des modèles 1.2 PureTech à courroie (guide non officiel, à recouper)",
           "https://www.italpassion.fr/guides/moteur-stellantis-1-2-puretech-liste-des-modeles-avec-courroie-et-ceux-a-chaine"),
    "S3": ("L'argus, principaux problèmes du moteur 1.2 PureTech",
           "https://www.largus.fr/actualite-automobile/moteur-1-2-puretech-quels-sont-les-vrais-problemes-10653953.html"),
    "S4": ("L'argus, HistoVec intègre les données du contrôle technique",
           "https://www.largus.fr/actualite-automobile/histovec-integre-desormais-les-donnees-du-controle-technique-10512410.html"),
    "S5": ("Matmut, HistoVec pour les véhicules d'occasion (le rapport est demandé au propriétaire)",
           "https://www.matmut.fr/assurance/auto/conseils/histovec-vehicules-occasion"),
    "S6": ("Actu-Automobile, article sur les voitures d'occasion (2022) : délai de revente entre particuliers, à recouper dans l'article",
           "https://www.actu-automobile.com/2022/09/25/les-voitures-doccasion-de-plus-en-plus-cheres/"),
    "S7": ("UFC-Que Choisir, fraude au compteur : 1 voiture d'occasion sur 10 (9,6 %). Repris du brief semaines du 12 oct., non revérifié aujourd'hui",
           "https://www.quechoisir.org/actualite-fraude-au-compteur-1-voiture-d-occasion-sur-10-concernee-n105694"),
    "S8": ("Base des annonces relevées UTOPICAR, lecture du 16 oct. 2026 : fonction cote_marche (comparables ±2 ans, km proche, prix ajustés) et médianes brutes. Prix affichés, pas prix de vente", None),
    "S9": ("Code : web/src/lib/analyse/defauts.ts (fourchettes de coût par défaut)", None),
    "S10": ("Code : web/src/lib/analyse/bilan.ts (revente normale = médiane × 0,96, arrondie aux 50 €)", None),
    "S11": ("Code : web/src/lib/analyse/fiabilite.ts (EVITER_GLOBAL : toutes les 1.0 et 1.2 PureTech)", None),
    "S12": ("Code : video/CLAUDE.md (zones sûres 1080 × 1920, mentions)", None),
    "S13": ("Code : web/src/components/marche/Alertes.tsx (fonction alertes, à décrire comme elle marche réellement)", None),
}

CONCEPTS = [
    dict(
        n=1, slug="1-dictionnaire", titre="Le dictionnaire du vendeur",
        budget="2 000 €", voiture="Citroën C1 2007–2009, environ 150 000 km",
        idee="Une phrase rassurante dans une annonce a un prix. L'acheteur doit le chiffrer avant d'appeler.",
        public="Débutant qui achète une première voiture à petit budget et lit des annonces de particuliers.",
        enjeu="Un défaut écrit en une phrase peut coûter de 100 à 600 € selon l'outil (bruit), jusqu'à 1 500 € (voyant). Ne pas le chiffrer, c'est le payer après l'achat.",
        question="Combien peut coûter la phrase que le vendeur a écrite ?",
        attente="« Petit bruit, rien de grave » : le vendeur sait, donc ce n'est pas cher.",
        revelation="Chaque phrase rassurante correspond à une fourchette de coût dans l'outil. Les quatre phrases ensemble peuvent aller jusqu'à 3 450 € : somme des maxima, cas extrême, pas une moyenne.",
        preuves="Fourchettes de defauts.ts [S9]. Médiane brute des C1 de 2007 à 2009 à 130 000–170 000 km : 2 920 €, 113 annonces [S8].",
        limites="Les fourchettes sont des estimations de réparation de l'outil, pas des devis. Les prix de la base sont des prix affichés, non ajustés. « Jusqu'à » à chaque chiffre.",
        accroches=[
            dict(type="Contradiction (recommandée, image 0)",
                 voix="« Juste un voyant, rien de grave. » Ça peut te coûter jusqu'à 1 500 euros.",
                 question="Quel voyant ? Combien ça coûte vraiment ?",
                 risque="Le 1 500 € est le maximum de la fourchette « voyant allumé ». Toujours dire « jusqu'à »."),
            dict(type="Directe",
                 voix="Une phrase rassurante peut te coûter jusqu'à 1 500 euros.",
                 question="Laquelle ?",
                 risque="Plus neutre : la phrase du vendeur n'est pas dans le hook, donc moins de tension."),
            dict(type="Situation",
                 voix="Tu lis une C1 à 2 000 euros, et une phrase te rassure.",
                 question="Et si elle coûte 600 euros ?",
                 risque="Situation, pas annonce réelle : ne pas suggérer que cette C1 a ce défaut."),
        ],
        analyse="Douleur : il lit des annonces sans savoir chiffrer ce qu'il lit. Croyance : « rien de grave » veut dire rien à payer. Vérité : la phrase a un coût, et l'outil en donne la fourchette.",
        reco="Contradiction en ouverture : la phrase du vendeur et le chiffre dans la phrase 1. Directe en test : mesurer si la phrase du vendeur ajoute de la tension.",
        verrous=[
            ("Temps", "✅", "« Juste un voyant » et « 1 500 » dans la première phrase, le sujet dès les trois premiers mots."),
            ("Sens", "✅", "Deux phrases courtes, aucun terme technique hors « voyant »."),
            ("Miroir", "✅", "Il lit ce genre d'annonce : la phrase rassurante est celle qu'il a déjà lue."),
            ("Écart", "✅", "Il croit « rien de grave » ; « jusqu'à 1 500 € » ouvre « combien, exactement ? »."),
        ],
        frames=[
            dict(t="0–5 s", fonction="Hook", bg="light", tag=None,
                 tx="Rien de grave = jusqu'à 1 500 € ?",
                 vis="Citation géante « Juste un voyant, rien de grave. » ; surligneur orange qui barre « rien de grave » ; une étiquette « 1 500 € » tombe sur le temps fort.",
                 voix="Juste un voyant, rien de grave. Ça peut te coûter jusqu'à 1 500 euros.",
                 mouv="Surligneur tracé en une seconde ; l'étiquette tombe sur « 1 500 ».",
                 preuve="Fourchette « voyant » 100 à 1 500 € [S9]."),
            dict(t="5–9 s", fonction="Traduction 1", bg="light", tag=None,
                 tx="Bruit : 100 à 600 €",
                 vis="« Petit bruit au démarrage » ; étiquette « 600 € max » qui se retourne.",
                 voix="Petit bruit au démarrage : jusqu'à 600 euros.",
                 mouv="Plongée courte, retournement d'étiquette.",
                 preuve="Fourchette « bruit » 100 à 600 € [S9]."),
            dict(t="9–14 s", fonction="Traduction 2", bg="light", tag=None,
                 tx="Embrayage 500–900 · Clim 80–450",
                 vis="Deux étiquettes : « Embrayage un peu haut », « Clim à recharger ».",
                 voix="Embrayage un peu haut : 500 à 900 euros. Clim à recharger : 80 à 450.",
                 mouv="Deux étiquettes qui s'empilent, une par temps.",
                 preuve="Fourchettes « embrayage » 500 à 900 € et « clim » 80 à 450 € [S9]."),
            dict(t="14–19 s", fonction="Total (pic de tension)", bg="dark", tag=None,
                 tx="Au maximum : 3 450 €",
                 vis="Quatre étiquettes empilées ; un compteur roule jusqu'à 3 450.",
                 voix="Quatre phrases, quatre étiquettes. Au maximum : 3 450 euros.",
                 mouv="Compteur sur un ressort court, il tombe exactement sur 3 450.",
                 preuve="1 500 + 600 + 900 + 450 = 3 450 : somme des maxima, cas extrême [S9]."),
            dict(t="19–26 s", fonction="Marché : l'écart à la cote", bg="light", tag=None,
                 tx="2 000 € : sous la cote",
                 vis="Barre horizontale : médiane 2 920 € ; marqueur 2 000 € à gauche. [PHOTO À FOURNIR : Citroën C1 2007–2009, trois quarts avant, plaque floutée, licence libre notée]",
                 voix="C1 de 2007 à 2009, 150 000 km : 2 920 euros en médiane. À 2 000, elle est sous la cote. Pourquoi ?",
                 mouv="La barre se remplit, le marqueur saute à gauche.",
                 preuve="Médiane brute, 113 annonces, cohorte 2007–2009, 130 000–170 000 km [S8]."),
            dict(t="26–30 s", fonction="Réponse et produit", bg="dark", tag=None,
                 tx="La phrase a un prix",
                 vis="[CAPTURE À FAIRE : fiche UTOPICAR avec les défauts chiffrés, sur un dossier de démonstration. Mention « Données de démonstration » si ce sont des données de démo.]",
                 voix="Une phrase peut cacher une réparation. Utopicar la chiffre avant ton appel.",
                 mouv="Rien d'animé tant que la capture n'existe pas.",
                 preuve="Capture à faire après vérification du rendu réel de defauts.ts sur l'annonce choisie [S9]."),
        ],
        promesse="Savoir combien peut coûter la phrase du vendeur.",
        reponse="Chaque phrase a une fourchette dans l'outil ; le total maximal est 3 450 €. La C1 à 2 000 € est sous la médiane : c'est une question à poser, pas une conclusion.",
        controles=[
            ("Le sujet est-il clair ?", "Oui : une phrase rassurante, un prix."),
            ("L'enjeu est-il crédible ?", "Oui, à condition de dire « jusqu'à » à chaque chiffre."),
            ("La question est-elle précise ?", "Oui : combien coûte la phrase."),
            ("Chaque passage fait-il progresser ?", "Oui : une traduction par temps, un total, la cote, une réponse."),
            ("Le renversement est-il justifié ?", "Pas de renversement : la tension vient du total et de l'écart à la cote."),
            ("Les éléments fictifs sont-ils signalés ?", "Aucun exemple fictif. La C1 est une donnée de la base, prix affichés."),
            ("La conclusion répond-elle à la promesse ?", "Oui (voir la réponse ci-dessus)."),
            ("Le ton semble-t-il humain ?", "À vérifier à voix haute : phrases courtes, pas d'adjectif gratuit."),
            ("Les affirmations sont-elles soutenues ?", "Oui pour les fourchettes [S9] et la médiane [S8]. « Une phrase peut cacher une réparation » : interprétation raisonnable, à tester."),
            ("Zones sûres respectées ?", "Oui : rien au-dessus de y = 220 px ni sous y = 1 480 px."),
        ],
        variante=dict(dim="Le chiffre héros du hook",
                      change="Juste un voyant (1 500 €) → Petit bruit (600 €) en ouverture.",
                      pourquoi="1 500 € est le maximum d'un voyant ; 600 € est plus crédible pour un débutant.",
                      hyp="Hypothèse à mesurer, sans garantie : un chiffre élevé retient plus à 3 s, un chiffre bas inspire plus confiance. Critère : part encore là à 3 s."),
        fournir=["Photo d'une Citroën C1 2007–2009 (trois quarts avant, plein jour, plaque floutée), licence libre notée.",
                 "Capture de la fiche démo : vérifier le rendu réel de defauts.ts sur l'annonce choisie.",
                 "Validation des fourchettes avant tournage (elles viennent de l'outil, pas d'un devis)."],
        sources=["S8", "S9", "S12"],
    ),
    dict(
        n=2, slug="2-alerte", titre="Quinze minutes (l'alerte)",
        budget="5 000 €", voiture="Dacia Sandero 2014, essence, 110 000 km (médiane réelle) ; l'annonce de l'exemple est fictive",
        idee="Une alerte te prévient quand une annonce qui te correspond apparaît. Le délai réel n'est pas mesuré.",
        public="Débutant qui cherche depuis des soirs et rate les annonces qu'il veut.",
        enjeu="Voir une bonne annonce plus tôt, c'est pouvoir appeler avant les autres. Le gain réel dépend du délai de relevé, qui n'est pas mesuré.",
        question="Comment voir une annonce dès qu'elle apparaît ?",
        attente="Il faut rafraîchir les annonces toute la journée.",
        revelation="L'alerte fait le travail à ta place. Le délai exact reste à mesurer avant de le promettre.",
        preuves="La fonction alertes existe [S13]. Médiane ajustée de la Sandero 2014 à 110 000 km : 6 407 €, 171 annonces [S8].",
        limites="« 15 minutes » est un exemple fictif, pas une statistique. Le seul délai sourcé [S6] concerne la revente d'un particulier : 25,5 jours en moyenne en 2022, ce n'est pas la durée d'une annonce. Risque de surpromesse : élevé.",
        accroches=[
            dict(type="Situation (image 0, exemple fictif étiqueté)",
                 voix="Cette Sandero est restée 15 minutes en ligne. Toi, tu l'as vue à la seizième.",
                 question="Et ta prochaine annonce, tu la vois quand ?",
                 risque="Exemple fictif : étiqueté à chaque plan. Sans étiquette, c'est un témoignage inventé."),
            dict(type="Contradiction",
                 voix="Tu regardes les annonces tous les soirs. La bonne était partie avant.",
                 question="Depuis quand ?",
                 risque="Scénario, pas une mesure. Même règle d'étiquette."),
            dict(type="Directe",
                 voix="Les bonnes annonces ne restent pas en ligne.",
                 question="Combien de temps ?",
                 risque="Affirmation non mesurée : à ne pas poser sans donnée. Remplacée par la variante."),
        ],
        analyse="Douleur : il cherche depuis des soirs et rate les bonnes affaires. Croyance : il faut être là au bon moment. Vérité : une alerte travaille à sa place. Le délai est à mesurer.",
        reco="Situation en ouverture, étiquetée « exemple fictif ». Ne pas tourner tant que le délai réel de notification n'est pas mesuré : voir la variante.",
        verrous=[
            ("Temps", "✅", "« 15 minutes » et « seizième » dans la phrase 1."),
            ("Sens", "✅", "Deux phrases, une image simple."),
            ("Miroir", "✅", "La recherche du soir : il la fait déjà."),
            ("Écart", "✅ si l'étiquette reste", "« Tu l'as vue à la seizième » ouvre « comment faire mieux ? »."),
        ],
        frames=[
            dict(t="0–5 s", fonction="Hook (situation fictive)", bg="light", tag="EXEMPLE FICTIF",
                 tx="Sandero 5 000 € · 15 min en ligne",
                 vis="Cadran d'horloge plein cadre ; une carte d'annonce « Sandero 2014 · 5 000 € » sous l'aiguille, qui balaie dès l'image 0.",
                 voix="Cette Sandero est restée 15 minutes en ligne. Toi, tu l'as vue à la seizième.",
                 mouv="L'aiguille balaie dès la première image.",
                 preuve="Exemple fictif, étiqueté. Rien de réel n'est montré."),
            dict(t="5–10 s", fonction="Minute 2", bg="light", tag="EXEMPLE FICTIF",
                 tx="Minute 2 : un appel",
                 vis="Notification d'appel fictive sur la carte.",
                 voix="Minute deux : quelqu'un appelle.",
                 mouv="Onde d'appel sur la carte.",
                 preuve="Scénario fictif."),
            dict(t="10–15 s", fonction="Minute 16", bg="dark", tag="EXEMPLE FICTIF",
                 tx="Minute 16 : « Déjà vendue. »",
                 vis="Deux bulles de message fictives : « Toujours dispo ? » puis « Désolé, déjà vendue. »",
                 voix="Minute seize : « Désolé, déjà vendue. »",
                 mouv="Le second message tombe sur le temps fort.",
                 preuve="Ne jamais reproduire une vraie conversation."),
            dict(t="15–19 s", fonction="Le mécanisme", bg="light", tag="EXEMPLE FICTIF",
                 tx="Pas de la chance : une alerte",
                 vis="Le cadran se referme sur la carte ; une notification remplace la scène.",
                 voix="Celui qui l'a eue ne cherchait pas. Il a reçu une alerte.",
                 mouv="Le cadran se referme sur la carte.",
                 preuve="Scénario fictif. Le « il » n'est pas une personne réelle."),
            dict(t="19–25 s", fonction="La fonction", bg="dark", tag=None,
                 tx="Dès qu'elle apparaît",
                 vis="[CAPTURE À FAIRE : notification d'alerte sur un dossier de démonstration, sans logo de plateforme]",
                 voix="Une alerte te prévient dès que l'outil relève une annonce qui te correspond.",
                 mouv="Notification qui glisse depuis le haut.",
                 preuve="À vérifier avant tournage : fréquence de relevé, délai réel de notification [S13]."),
            dict(t="25–30 s", fonction="Chute chiffrée (réelle)", bg="light", tag="PRIX DE L'EXEMPLE FICTIF",
                 tx="Sous la médiane de 1 400 €",
                 vis="Deux barres : 5 000 € (prix de l'exemple) et médiane réelle 6 407 €. [À RECALCULER à la date de tournage]",
                 voix="Sous la médiane de 1 400 euros. Dès qu'elle apparaît, tu le sais.",
                 mouv="La barre du prix s'arrête sous celle de la médiane.",
                 preuve="Médiane ajustée, 171 annonces Sandero 2014 à 110 000 km [S8]. Le prix de 5 000 € reste celui de l'exemple."),
        ],
        promesse="Voir une bonne annonce avant les autres.",
        reponse="L'alerte la signale dès que l'outil la relève. Le délai n'est pas mesuré : on ne le chiffre pas.",
        controles=[
            ("Le sujet est-il clair ?", "Oui : une alerte au lieu de rafraîchir."),
            ("L'enjeu est-il crédible ?", "Partiellement : le gain dépend d'un délai non mesuré."),
            ("La question est-elle précise ?", "Oui : comment voir une annonce dès qu'elle apparaît."),
            ("Chaque passage fait-il progresser ?", "Oui, mais l'histoire repose sur un scénario fictif."),
            ("Le renversement est-il justifié ?", "Non : pas de renversement."),
            ("Les éléments fictifs sont-ils signalés ?", "Oui : étiquette « EXEMPLE FICTIF » sur chaque plan du scénario, et sur le prix de l'exemple."),
            ("La conclusion répond-elle à la promesse ?", "Partiellement : l'alerte, pas le délai."),
            ("Le ton semble-t-il humain ?", "À vérifier à voix haute."),
            ("Les affirmations sont-elles soutenues ?", "« 15 minutes » et « seizième » : fiction. Médiane : [S8]. Délai : non mesuré."),
            ("Zones sûres respectées ?", "Oui : étiquette à y = 250 px, rien sous y = 1 480 px."),
        ],
        variante=dict(dim="Le type de preuve",
                      change="Scénario fictif (15 minutes) → délai réel sourcé : 25,5 jours pour la revente entre particuliers (2022).",
                      pourquoi="Un chiffre réel ne s'étiquette pas ; le scénario, si. La variante teste lequel retient le plus.",
                      hyp="Hypothèse à mesurer : le scénario retient mieux à 3 s, le chiffre réel est plus solide sur 30 s. Critère : part à 3 s et durée moyenne."),
        fournir=["Décision : garder ce concept ou le remplacer (voir le README).",
                 "Si la promesse « dès qu'elle apparaît » reste : mesurer le délai réel de notification de l'alerte.",
                 "Capture de la notification sur un dossier de démonstration."],
        sources=["S6", "S8", "S13"],
    ),
    dict(
        n=3, slug="3-deux-208", titre="Deux 208, un mot",
        budget="5 000 €", voiture="Peugeot 208 I, essence 2014 (deux annonces fictives)",
        idee="Le moteur écrit dans le titre (82 ou 110 ch) change la question à poser : le 110 et le 130 ch fabriqués de 2013 à 2017 sont au rappel constructeur, pas le 82.",
        public="Débutant qui hésite entre deux 208 de même année et de même prix.",
        enjeu="Une courroie qui baigne dans l'huile, un rappel constructeur : la question à poser au vendeur change.",
        question="Comment savoir si une 208 essence de 2014 est concernée par le rappel du 1.2 PureTech ?",
        attente="Deux 208 de même année et de même prix, c'est la même voiture.",
        revelation="Le moteur écrit dans le titre décide de la vérification à faire. Le numéro de châssis tranche.",
        preuves="Rappel 2020 sur les 110 et 130 ch fabriqués de mars 2013 à avril 2017 [S1, S3] ; second rappel fin 2022 sur le PureTech turbo [S1]. Médiane ajustée d'une 208 essence 2014 à 110 000 km : 5 386 €, 411 annonces [S8].",
        limites="Le périmètre du rappel vient de sources secondaires [S1, S2] : à vérifier avec le numéro de châssis chez un concessionnaire. Les deux titres sont fictifs. L'outil classe aujourd'hui toutes les 1.0 et 1.2 PureTech comme « à éviter » [S11] : trop large, à corriger avant toute capture.",
        accroches=[
            dict(type="Directe (recommandée, image 0)",
                 voix="Deux 208 de 2014 à 5 000 euros. Un mot les sépare.",
                 question="Lequel ?",
                 risque="Le mot seul ne suffit pas : la date de fabrication compte aussi. La planche le dit à l'écran."),
            dict(type="Contradiction",
                 voix="Même modèle, même année, même prix : tu crois qu'elles se valent.",
                 question="Pourquoi pas ?",
                 risque="Généralise une croyance : la preuve arrive en 4 s."),
            dict(type="Situation",
                 voix="Tu compares deux 208 et tu prends celle qui a la plus belle photo.",
                 question="Et si l'une est au rappel ?",
                 risque="Décrit une habitude d'acheteur : à tester, pas à affirmer."),
        ],
        analyse="Douleur : hésiter entre deux annonces identiques. Croyance : même modèle, même année, même risque. Vérité : le moteur écrit dans le titre change le contrôle à faire.",
        reco="Directe en ouverture : clarté (208, 2014, 5 000 € dans la phrase 1) et écart implicite. Contradiction en test.",
        verrous=[
            ("Temps", "✅", "208, 2014 et 5 000 € dans la première phrase."),
            ("Sens", "✅", "Deux phrases, aucun terme technique avant « un mot »."),
            ("Miroir", "✅", "Comparer deux annonces : une tâche qu'il fait vraiment."),
            ("Écart", "✅", "Il croit qu'elles se valent ; « un mot » ouvre « lequel ? »."),
        ],
        frames=[
            dict(t="0–4 s", fonction="Hook", bg="light", tag="ANNONCES FICTIVES",
                 tx="Deux 208 de 2014 · 5 000 €",
                 vis="Deux cartes d'annonce en miroir, même travelling. [PHOTO À FOURNIR : Peugeot 208 I, 2012–2015, trois quarts avant, couleur identique, plaques floutées]",
                 voix="Deux 208 de 2014 à 5 000 euros. Un mot les sépare.",
                 mouv="Travelling identique sur les deux cartes.",
                 preuve="Deux annonces fictives, étiquetées."),
            dict(t="4–8 s", fonction="Le mot", bg="light", tag="ANNONCES FICTIVES",
                 tx="82 ch ≠ 110 ch",
                 vis="Une loupe balaie deux titres fictifs : « 1.2 PureTech 82 » et « 1.2 PureTech 110 ».",
                 voix="Trouve le mot : 82 chevaux d'un côté, 110 de l'autre.",
                 mouv="La loupe s'arrête sur le mot « 110 ».",
                 preuve="Titres fictifs (exemple)."),
            dict(t="8–16 s", fonction="Le rappel", bg="dark", tag=None,
                 tx="Rappel constructeur : 110 et 130 ch",
                 vis="Schéma au trait : la courroie plonge dans un bain d'huile (dessin en SVG, pas d'image générée).",
                 voix="Les 110 et 130 chevaux fabriqués de mars 2013 à avril 2017 sont au rappel constructeur. La courroie baigne dans l'huile.",
                 mouv="Le schéma se trace, l'huile monte sur la courroie.",
                 preuve="[S1, S3]. À recouper sur la fiche officielle du constructeur."),
            dict(t="16–19 s", fonction="Le 82", bg="light", tag=None,
                 tx="Le 82 : hors rappel",
                 vis="Une carte « 82 ch » avec un tampon gris « hors rappel » (graphisme, pas une attestation).",
                 voix="Le 82 n'est pas dans ce rappel.",
                 mouv="Le tampon gris se pose sur la carte.",
                 preuve="[S1] : le rappel vise les versions turbo 110 et 130 ch. À recouper."),
            dict(t="19–25 s", fonction="Vérifier", bg="dark", tag=None,
                 tx="Vérifie le numéro de châssis",
                 vis="Numéro de châssis (VIN) flouté sur une carte grise fictive.",
                 voix="Le numéro de châssis dit si ta voiture est concernée. Un concessionnaire le vérifie.",
                 mouv="Le numéro se fait net, puis se floute.",
                 preuve="[S1, S2] : le VIN auprès d'un concessionnaire reste la vérification fiable (recherche du 16 oct. 2026)."),
            dict(t="25–30 s", fonction="Boucle", bg="light", tag=None,
                 tx="Même modèle. Une question de plus.",
                 vis="Retour sur les deux cartes ; la carte du 110 reste en surbrillance.",
                 voix="Même modèle, même année. Une question de plus à poser au vendeur.",
                 mouv="Retour au miroir de l'image 0.",
                 preuve="Rien de nouveau à prouver. Pas de verdict sur la voiture."),
        ],
        promesse="Savoir pourquoi deux 208 identiques ne se valent pas.",
        reponse="Le moteur (82 ou 110 ch) et la date de fabrication décident du rappel ; le numéro de châssis confirme. Pas de verdict sur la voiture.",
        controles=[
            ("Le sujet est-il clair ?", "Oui : deux 208, un mot."),
            ("L'enjeu est-il crédible ?", "Oui, si le périmètre du rappel est recoupé (S1, S3)."),
            ("La question est-elle précise ?", "Oui : la 208 de 2014 est-elle concernée ?"),
            ("Chaque passage fait-il progresser ?", "Oui : le mot, le rappel, le 82, la vérification."),
            ("Le renversement est-il justifié ?", "Pas de renversement : la différence est dans le titre."),
            ("Les éléments fictifs sont-ils signalés ?", "Oui : étiquette « annonces fictives » sur les deux premiers plans."),
            ("La conclusion répond-elle à la promesse ?", "Oui, sans verdict sur la voiture."),
            ("Le ton semble-t-il humain ?", "À vérifier à voix haute."),
            ("Les affirmations sont-elles soutenues ?", "Rappel : S1, S3, à recouper. « Entre 2013 et 2017 » simplifie mars 2013 – avril 2017 : la voix garde les mois."),
            ("Zones sûres respectées ?", "Oui. Capture finale bloquée tant que fiabilite.ts n'est pas corrigé [S11]."),
        ],
        variante=dict(dim="La clé de contraste",
                      change="Puissance (82 vs 110 ch) → date de fabrication (2013 vs 2016), même moteur.",
                      pourquoi="La date est dans le périmètre du rappel ; la puissance est plus visible dans le titre. Teste laquelle retient.",
                      hyp="Hypothèse à mesurer : la puissance se lit plus vite, la date paraît plus concrète. Critère : part à 3 s."),
        fournir=["Photo d'une 208 I 2012–2015 (trois quarts avant), exacte, licence notée, plaques floutées.",
                 "Décision : corriger la règle PureTech de fiabilite.ts avant toute capture de l'outil [S11].",
                 "Recoupement du périmètre du rappel sur la fiche constructeur, puis validation de la voix."],
        sources=["S1", "S2", "S3", "S8", "S11"],
    ),
    dict(
        n=4, slug="4-duel-20000", titre="Choisis ta voiture (20 000 €)",
        budget="20 000 €", voiture="Kia Niro hybride 2019 contre Mercedes Classe A 2018–2020 (modèles neufs à ce budget)",
        idee="À prix égal, la voiture la plus désirable n'est pas forcément celle qui se revend le mieux : on compare au prix médian, pas au badge.",
        public="Débutant qui hésite à 20 000 € entre deux voitures.",
        enjeu="À 20 000 €, l'écart à la cote peut peser plusieurs milliers d'euros : 3 490 € sous la médiane de la Classe A, 2 438 € au-dessus de celle de la Niro.",
        question="À 20 000 €, laquelle de ces deux voitures est sous sa cote ?",
        attente="La Kia hybride est la valeur sûre ; la Mercedes, c'est le prix de la marque.",
        revelation="À ce prix, la Classe A est sous sa médiane et la Niro est au-dessus, sur les annonces relevées.",
        preuves="Classe A 2018–2020, 45 000–75 000 km : 402 annonces, médiane 23 490 € (non ajustée) [S8]. Niro 2019, 60 000 km, hybride : 169 annonces, médiane ajustée 17 562 € [S8]. Revente normale = médiane × 0,96 [S10].",
        limites="Prix affichés, pas prix de vente. Frais, carte grise et travaux hors calcul. Aucune source fiable sur la fiabilité de ces deux modèles dans cette planche : on n'en parle pas.",
        accroches=[
            dict(type="Directe (recommandée, image 0)",
                 voix="Même prix : 20 000 euros. Une Mercedes, une Kia hybride. Laquelle est sous sa cote ?",
                 question="Laquelle ?",
                 risque="Dépend de la méthode : la Classe A est comparée à une médiane non ajustée. À dire dans la planche."),
            dict(type="Contradiction",
                 voix="On dit que l'hybride est une valeur sûre. À 20 000 euros, la Kia est au-dessus de sa cote.",
                 question="Et la Mercedes ?",
                 risque="Généralise à partir d'un seul prix et de deux modèles. Dire « sur ces annonces »."),
            dict(type="Situation",
                 voix="Tu hésites entre deux voitures au même prix, et tu prends celle que tu préfères.",
                 question="Celle qui se revend le mieux, c'est laquelle ?",
                 risque="Juge la préférence de l'acheteur : ton neutre, pas de moquerie."),
        ],
        analyse="Douleur : choisir à 20 000 € sans pouvoir se tromper. Croyance : la marque ou l'hybride protège la revente. Vérité : à ce prix, le chiffre médian dit l'inverse pour la Niro.",
        reco="Directe (duel) en ouverture. La croyance « hybride = valeur sûre » est la voix 5, pour l'écart. Variante : comparer avec un diesel au même prix.",
        verrous=[
            ("Temps", "✅", "20 000 € et les deux voitures dans la phrase 1."),
            ("Sens", "✅", "Deux phrases, deux noms de voiture."),
            ("Miroir", "✅", "Un choix entre deux voitures : il l'a déjà fait ou va le faire."),
            ("Écart", "✅", "La réputation dit « Kia » ; le chiffre dit autre chose."),
        ],
        frames=[
            dict(t="0–5 s", fonction="Duel (hook)", bg="light", tag=None,
                 tx="20 000 € chacune. Sous la cote ?",
                 vis="Deux cartes côte à côte. [PHOTO À FOURNIR : Kia Niro hybride 2019, trois quarts avant] [PHOTO À FOURNIR : Mercedes Classe A, génération W177 2018–2020, trois quarts avant] Plaques floutées.",
                 voix="Même prix : 20 000 euros. Une Mercedes, une Kia hybride. Laquelle est sous sa cote ?",
                 mouv="Les cartes glissent l'une vers l'autre, le curseur hésite.",
                 preuve="Photos à fournir, exactes (génération, motorisation) : pas de photo « proche »."),
            dict(t="5–9 s", fonction="Les médianes", bg="light", tag=None,
                 tx="Médiane : 23 490 € · 17 562 €",
                 vis="Deux barres qui se remplissent : « Classe A 2018–2020 » et « Niro 2019, 60 000 km ».",
                 voix="Médiane de la Mercedes : 23 490 euros. De la Kia : 17 562.",
                 mouv="Barres sur ressort, sans rebond.",
                 preuve="[S8]. Classe A non ajustée (cohorte centrée sur 2019 et 63 000 km) ; Niro ajustée."),
            dict(t="9–12 s", fonction="Le temps de choisir", bg="dark", tag=None,
                 tx="Trois secondes. Choisis.",
                 vis="Compte à rebours 3-2-1 ; le curseur hésite entre les deux cartes.",
                 voix="Trois secondes. Choisis.",
                 mouv="Compte à rebours net, une seconde par chiffre.",
                 preuve="Mécanique du duel : aucune donnée."),
            dict(t="12–18 s", fonction="La revente", bg="light", tag=None,
                 tx="Revente : 22 550 · 16 850 (hors frais)",
                 vis="« VS » en diagonale ; deux colonnes : « Classe A ≈ 22 550 € », « Niro ≈ 16 850 € ».",
                 voix="Revente normale, avant frais : la Mercedes autour de 22 550 euros. La Kia autour de 16 850.",
                 mouv="VS claque en diagonale, les colonnes montent.",
                 preuve="Médiane × 0,96, arrondie aux 50 € : 23 490 × 0,96 et 17 562 × 0,96 [S8, S10]."),
            dict(t="18–24 s", fonction="L'écart à la cote", bg="dark", tag=None,
                 tx="À 20 000 € : sous, puis au-dessus",
                 vis="Deux marqueurs à 20 000 € sur les barres : la Classe A reste à gauche de sa médiane, la Niro à droite.",
                 voix="On dit que l'hybride est une valeur sûre. À 20 000 euros, la Kia est au-dessus de sa cote.",
                 mouv="Le marqueur saute sur chaque barre.",
                 preuve="Écarts : 23 490 − 20 000 = 3 490 € ; 20 000 − 17 562 = 2 438 € [S8]."),
            dict(t="24–30 s", fonction="Le produit", bg="light", tag=None,
                 tx="Même prix. Pas la même affaire.",
                 vis="[CAPTURE À FAIRE : deux fiches calculées dans l'outil, sur des annonces réelles, sans plaque visible]",
                 voix="Utopicar fait ce calcul pour chaque annonce, frais compris. Même prix. Pas la même affaire.",
                 mouv="Les deux fiches se superposent.",
                 preuve="Calcul : bilan.ts (carte grise, frais, travaux) [S10]. Capture à faire."),
        ],
        promesse="Savoir laquelle des deux est sous sa cote, à 20 000 €.",
        reponse="La Classe A est sous sa médiane à ce prix (non ajustée) ; la Niro est au-dessus (ajustée). La planche ne dit rien de la fiabilité, des frais ni de la valeur réelle de chaque voiture.",
        controles=[
            ("Le sujet est-il clair ?", "Oui : deux voitures, un prix, une question."),
            ("L'enjeu est-il crédible ?", "Oui : les écarts viennent des médianes [S8]."),
            ("La question est-elle précise ?", "Oui : laquelle est sous sa cote à 20 000 € ?"),
            ("Chaque passage fait-il progresser ?", "Oui : médianes, revente, écart, outil."),
            ("Le renversement est-il justifié ?", "Oui par le chiffre : « l'hybride est sûre » est une croyance testée, pas une opinion."),
            ("Les éléments fictifs sont-ils signalés ?", "Aucun exemple fictif : médianes réelles de la base, prix affichés."),
            ("La conclusion répond-elle à la promesse ?", "Oui, avec la limite dite à l'écran."),
            ("Le ton semble-t-il humain ?", "À vérifier à voix haute : deux phrases courtes, pas de jugement sur l'acheteur."),
            ("Les affirmations sont-elles soutenues ?", "Oui pour les médianes [S8] et la formule [S10]. Classe A non ajustée : à signaler, ou à recalculer dans l'outil."),
            ("Zones sûres respectées ?", "Oui : rien au-dessus de y = 220 px ni sous y = 1 480 px."),
        ],
        variante=dict(dim="La motorisation",
                      change="Kia Niro hybride → Peugeot 3008 diesel 2019, 60 000 km (médiane 17 298 €, 742 annonces).",
                      pourquoi="Teste si l'hybride est la cause de l'écart, ou seulement le niveau de prix.",
                      hyp="Hypothèse à mesurer : si le 3008 reste au-dessus de sa médiane à 20 000 €, c'est le prix, pas la motorisation. Critère : écart au prix affiché."),
        fournir=["Photo Kia Niro hybride 2019 et photo Mercedes Classe A W177 : exactes, trois quarts avant, plaques floutées, licences notées.",
                 "Recalcul de la Classe A avec la fonction ajustée de l'outil, ou mention « non ajustée » à l'écran.",
                 "Capture des deux fiches calculées sur des annonces réelles, sans plaque ni nom de vendeur."],
        sources=["S8", "S10"],
    ),
    dict(
        n=5, slug="5-compteur", titre="Le compteur qui recule",
        budget="10 000 €", voiture="Dacia Duster 2016, essence, 110 000 km (médiane réelle) ; l'exemple de kilométrage est fictif",
        idee="Entre deux contrôles techniques, le kilométrage ne baisse pas. Quand l'annonce affiche moins que le relevé, la question est obligatoire.",
        public="Acheteur d'occasion, et celui qui envoie la vidéo à son proche.",
        enjeu="Une voiture d'occasion sur dix serait concernée par la fraude au compteur [S7, à recouper]. Acheter au mauvais kilométrage, c'est acheter un prix faux.",
        question="Comment vérifier gratuitement que le kilométrage annoncé est cohérent ?",
        attente="Ça n'arrive qu'aux autres.",
        revelation="HistoVec affiche les kilométrages relevés aux contrôles techniques : l'annonce se compare à ce relevé.",
        preuves="HistoVec : service gratuit de l'État, relevés des contrôles techniques [S4, S5]. UFC-Que Choisir : 9,6 % [S7]. Duster 2016, 110 000 km, essence : médiane ajustée 8 481 €, p75 9 568 €, 326 annonces [S8].",
        limites="L'exemple (110 000 km sur l'annonce, 168 000 au contrôle) est fictif et étiqueté. HistoVec ne couvre que les contrôles en France métropolitaine, et le rapport est généré par le propriétaire [S5]. Un compteur remplacé existe : c'est une question à poser.",
        accroches=[
            dict(type="Contradiction (recommandée, image 0, exemple fictif)",
                 voix="110 000 km sur l'annonce. 168 000 au contrôle technique. Même voiture.",
                 question="Lequel est le bon ?",
                 risque="Exemple fictif : étiquette obligatoire à chaque plan du scénario."),
            dict(type="Directe (chiffre sourcé)",
                 voix="Une voiture d'occasion sur dix est concernée par la fraude au compteur.",
                 question="Et celle que tu regardes ?",
                 risque="Chiffre à recouper avant tournage [S7]. Dire « concernée par une fraude », jamais « trafiquée »."),
            dict(type="Situation",
                 voix="Tu as trouvé le Duster parfait, avec un kilométrage rassurant.",
                 question="Tu as vérifié le relevé ?",
                 risque="Ne reproche rien au vendeur : c'est la question de l'acheteur."),
        ],
        analyse="Douleur : payer un prix sur un kilométrage faux. Croyance : un kilométrage rassurant est vrai. Vérité : un relevé gratuit permet de comparer.",
        reco="Contradiction en ouverture, avec l'étiquette « exemple fictif ». Directe en test (chiffre sourcé) pour mesurer ce que la fiction apporte à 3 s.",
        verrous=[
            ("Temps", "✅", "110 000 et 168 000 dans la phrase 1 ; le sujet est le kilométrage."),
            ("Sens", "✅", "Deux phrases, deux chiffres, un mot : « même »."),
            ("Miroir", "✅", "L'acheteur regarde le kilométrage en premier."),
            ("Écart", "✅", "« Même voiture » ; la question « lequel est le bon ? » ouvre la suite."),
        ],
        frames=[
            dict(t="0–5 s", fonction="Hook (exemple fictif)", bg="light", tag="EXEMPLE FICTIF",
                 tx="110 000 ≠ 168 000",
                 vis="Liège, deux documents punaisés : « Annonce : 110 000 km » et « Contrôle technique 2019 : 168 000 km » (fictifs).",
                 voix="110 000 kilomètres sur l'annonce. 168 000 au contrôle technique de 2019. Même voiture.",
                 mouv="Travelling latéral ; le fil rouge se tend entre les deux chiffres.",
                 preuve="Valeurs fictives, étiquetées."),
            dict(t="5–10 s", fonction="La règle", bg="light", tag="EXEMPLE FICTIF",
                 tx="Entre deux contrôles, il ne baisse pas",
                 vis="Le fil rouge dessine une courbe : elle monte, puis redescend.",
                 voix="Entre deux contrôles, le kilométrage ne baisse pas.",
                 mouv="La courbe se trace au rythme de la voix.",
                 preuve="Logique de base. Un compteur remplacé existe : c'est la question à poser (limites)."),
            dict(t="10–15 s", fonction="L'outil gratuit", bg="dark", tag=None,
                 tx="HistoVec : gratuit, service de l'État",
                 vis="Carte de verre, nom écrit en texte : « HistoVec ». Pas de capture de l'interface officielle.",
                 voix="HistoVec, service gratuit de l'État, affiche les relevés des contrôles techniques.",
                 mouv="La carte glisse depuis le bas.",
                 preuve="[S4, S5]. Pas d'interface redessinée."),
            dict(t="15–20 s", fonction="Le marché", bg="light", tag=None,
                 tx="Médiane : 8 481 €",
                 vis="Barre de prix : annonces Duster 2016 à 110 000 km (p25 7 671 · médiane 8 481 · p75 9 568).",
                 voix="Les annonces de Duster 2016 à 110 000 km : 8 500 euros en médiane.",
                 mouv="La barre se remplit, le marqueur de la médiane se pose.",
                 preuve="[S8], ajustée, 326 annonces. Prix affichés."),
            dict(t="20–25 s", fonction="La statistique", bg="dark", tag=None,
                 tx="1 voiture sur 10 · UFC-Que Choisir",
                 vis="Dix petites cartes ; une seule est marquée « fraude au compteur ».",
                 voix="Une voiture d'occasion sur dix est concernée par la fraude au compteur, selon l'UFC-Que Choisir.",
                 mouv="La carte marquée se soulève.",
                 preuve="[S7] : 9,6 % repris du brief du 12 oct. 2026, à recouper avant tournage."),
            dict(t="25–30 s", fonction="L'action", bg="light", tag=None,
                 tx="Demande le relevé. Compare.",
                 vis="Le fil se tend entre « annonce » et « relevé » ; les documents restent punaisés.",
                 voix="Demande le relevé au vendeur. Compare-le à l'annonce. Un chiffre qui ne colle pas, c'est déjà une réponse.",
                 mouv="Le fil se tend, puis se fige.",
                 preuve="[S5] : le rapport est généré par le propriétaire ; l'acheteur le demande."),
        ],
        promesse="Vérifier un kilométrage gratuitement.",
        reponse="On compare l'annonce au relevé HistoVec. Un écart est une question à poser, pas une preuve. Le chiffre de un sur dix est à recouper.",
        controles=[
            ("Le sujet est-il clair ?", "Oui : le kilométrage, deux chiffres, une question."),
            ("L'enjeu est-il crédible ?", "Oui si le chiffre de l'UFC est recoupé [S7]."),
            ("La question est-elle précise ?", "Oui : le kilométrage annoncé est-il cohérent ?"),
            ("Chaque passage fait-il progresser ?", "Oui : règle, outil, marché, chiffre, action."),
            ("Le renversement est-il justifié ?", "Pas de renversement."),
            ("Les éléments fictifs sont-ils signalés ?", "Oui : étiquette « EXEMPLE FICTIF » sur les quatre premiers plans."),
            ("La conclusion répond-elle à la promesse ?", "Oui, sans accuser le vendeur."),
            ("Le ton semble-t-il humain ?", "À vérifier à voix haute."),
            ("Les affirmations sont-elles soutenues ?", "HistoVec [S4, S5] ; médiane [S8] ; 1 sur 10 [S7], à recouper."),
            ("Zones sûres respectées ?", "Oui : étiquette à y = 250 px, rien sous y = 1 480 px."),
        ],
        variante=dict(dim="Le type de preuve en ouverture",
                      change="Contradiction fictive (étiquetée) → Directe avec le chiffre sourcé (1 sur 10).",
                      pourquoi="Une fiction étiquetée raconte mieux ; un chiffre sourcé n'a pas besoin d'étiquette.",
                      hyp="Hypothèse à mesurer : la fiction garde plus à 3 s ; le chiffre sourcé convainc mieux sur 30 s. Critère : part à 3 s et durée moyenne."),
        fournir=["Recoupement du chiffre de l'UFC-Que Choisir [S7] sur la fiche source.",
                 "Photo d'une Dacia Duster 2016 (première génération), trois quarts avant, plaque floutée, licence notée.",
                 "Aucune capture de l'interface HistoVec : nom écrit en texte seulement."],
        sources=["S4", "S5", "S7", "S8"],
    ),
]

CSS = """
@font-face{font-family:Clash;font-weight:600;src:url(../assets/fonts-site/ClashDisplay-600.woff2) format('woff2')}
@font-face{font-family:Clash;font-weight:700;src:url(../assets/fonts-site/ClashDisplay-700.woff2) format('woff2')}
@font-face{font-family:Satoshi;font-weight:500;src:url(../assets/fonts-site/Satoshi-500.woff2) format('woff2')}
@font-face{font-family:Satoshi;font-weight:700;src:url(../assets/fonts-site/Satoshi-700.woff2) format('woff2')}
:root{--w:#fbf9f5;--k:#0e0b09;--o:#ff5a1f;--r:#c81e1e;--ink:#1c1612;--mut:#6b5e54;--line:rgba(28,22,18,.12)}
*{box-sizing:border-box}
body{margin:0;width:1440px;padding:48px 56px 64px;background:var(--w);color:var(--ink);font:400 16px/1.45 Satoshi,sans-serif}
h1{font:700 60px/1 Clash,sans-serif;margin:0 0 10px;letter-spacing:-.02em}
h2{font:700 30px/1.1 Clash,sans-serif;margin:0 0 14px}
h3{font:700 14px/1 Satoshi,sans-serif;text-transform:uppercase;letter-spacing:.12em;color:var(--o);margin:34px 0 14px}
.sig{font:500 22px/1.3 Satoshi,sans-serif;color:var(--mut);margin:0 0 18px;max-width:1100px}
.chips{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px}
.chip{border:1.5px solid var(--ink);border-radius:999px;padding:6px 14px;font:500 15px Satoshi,sans-serif}
.chip.o{border-color:var(--o);color:var(--o);font-weight:700}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:18px 20px}
.card p{margin:0 0 8px}
.card b{font-weight:700}
.lbl{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:var(--mut);font-weight:700}
table{border-collapse:collapse;width:100%;font-size:14px;background:#fff;border-radius:14px;overflow:hidden}
th,td{text-align:left;vertical-align:top;padding:9px 11px;border-top:1px solid var(--line)}
th{background:#f3eee6;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--mut)}
.frames{display:flex;flex-wrap:wrap;gap:18px}
.fcard{width:270px}
.ftime{font:700 15px Satoshi,sans-serif;color:var(--o);margin-bottom:8px}
.frame{width:270px;height:480px;position:relative;overflow:hidden;border-radius:16px;box-shadow:0 16px 34px -14px rgba(28,22,18,.45)}
.stage{position:absolute;left:0;top:0;width:1080px;height:1920px;transform:scale(.25);transform-origin:0 0;overflow:hidden}
.frame.light .stage{background:var(--w);color:var(--ink)}
.frame.dark .stage{background:var(--k);color:var(--w)}
.g{position:absolute;left:0;right:0;border-top:5px dashed rgba(200,30,30,.55)}
.g.top{top:220px}.g.bot{top:1480px}
.gv{position:absolute;top:0;bottom:0;border-left:3px dotted rgba(200,30,30,.4)}
.gv.l{left:140px}.gv.r{left:940px}
.tag{position:absolute;left:140px;top:250px;background:var(--r);color:#fff;font:700 40px Satoshi,sans-serif;letter-spacing:.06em;padding:12px 22px;border-radius:14px}
.tx{position:absolute;left:140px;top:560px;width:800px;font:700 118px/1.02 Clash,sans-serif;letter-spacing:-.02em}
.vis{position:absolute;left:140px;top:980px;width:800px;height:420px;border:7px dashed rgba(28,22,18,.32);border-radius:30px;padding:40px;font:500 42px/1.3 Satoshi,sans-serif;color:var(--mut);overflow:hidden}
.frame.dark .vis{border-color:rgba(251,249,245,.35);color:#d9d2c8}
.fdesc{margin-top:12px;font-size:13.5px;line-height:1.4}
.fdesc p{margin:0 0 6px}
.voix{font-style:italic}
.foot{margin-top:30px;font-size:13px;color:var(--mut);border-top:1px solid var(--line);padding-top:14px}
.legend{display:flex;gap:18px;flex-wrap:wrap;font-size:13.5px;color:var(--mut);margin:8px 0 14px}
.legend i{display:inline-block;width:26px;border-top:4px dashed rgba(200,30,30,.55);vertical-align:middle;margin-right:6px}
ul{margin:0;padding-left:20px}
li{margin:0 0 6px}
a{color:var(--ink)}
"""


def esc(s):
    return html.escape(str(s), quote=True)


def words_of(voix_list):
    return sum(len(v.split()) for v in voix_list)


def frame_html(f):
    tag = f'<div class="tag">{esc(f["tag"])}</div>' if f.get("tag") else ""
    return f"""
    <div class="fcard">
      <div class="ftime">{esc(f["t"])} · {esc(f["fonction"])}</div>
      <div class="frame {f["bg"]}"><div class="stage">
        <div class="gv l"></div><div class="gv r"></div>
        <div class="g top"></div><div class="g bot"></div>
        {tag}
        <div class="tx">{esc(f["tx"])}</div>
        <div class="vis">{esc(f["vis"])}</div>
      </div></div>
      <div class="fdesc">
        <p class="voix">« {esc(f["voix"])} »</p>
        <p><b>Mouvement :</b> {esc(f["mouv"])}</p>
        <p><b>Preuve :</b> {esc(f["preuve"])}</p>
      </div>
    </div>"""


def table_rows(c):
    rows = []
    for f in c["frames"]:
        rows.append(
            f"<tr><td>{esc(f['t'])}</td><td>{esc(f['fonction'])}</td><td>« {esc(f['voix'])} »</td>"
            f"<td>{esc(f['vis'])}</td><td>{esc(f['tx'])}</td><td>{esc(f['mouv'])}</td><td>{esc(f['preuve'])}</td></tr>")
    return "\n".join(rows)


def page(c):
    voix = [f["voix"] for f in c["frames"]]
    n_words = words_of(voix)
    est = n_words / WORDS_PER_SECOND + 0.3 * len(voix)
    script = " ".join(voix)
    accroches = "".join(
        f"""<div class="card"><p class="lbl">{esc(a["type"])}</p>
        <p><b>Voix :</b> « {esc(a["voix"])} »</p>
        <p><b>Question ouverte :</b> {esc(a["question"])}</p>
        <p><b>Risque de surpromesse :</b> {esc(a["risque"])}</p></div>"""
        for a in c["accroches"])
    verrous = "".join(
        f"<li><b>{esc(k)}</b> {esc(v)} · {esc(d)}</li>" for k, v, d in c["verrous"])
    controles = "".join(
        f"<tr><td>{esc(q)}</td><td>{esc(r)}</td></tr>" for q, r in c["controles"])
    fournir = "".join(f"<li>{esc(x)}</li>" for x in c["fournir"])
    sources = "".join(
        f"<li><b>{s}</b> {esc(SOURCES[s][0])}" + (f" — <a href=\"{esc(SOURCES[s][1])}\">{esc(SOURCES[s][1])}</a>" if SOURCES[s][1] else "") + "</li>"
        for s in c["sources"])
    frames = "".join(frame_html(f) for f in c["frames"])
    v = c["variante"]
    return f"""<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Planche {c["n"]} · {esc(c["titre"])}</title>
<style>{CSS}</style></head>
<body>
<h1>Planche {c["n"]} · {esc(c["titre"])}</h1>
<p class="sig">{esc(c["idee"])}</p>
<div class="chips">
  <span class="chip o">Budget {esc(c["budget"])}</span>
  <span class="chip">{esc(c["voiture"])}</span>
  <span class="chip">Vidéo 9:16 · 30 s · planche, pas de tournage</span>
  <span class="chip">À valider</span>
</div>

<h3>1 · Diagnostic</h3>
<div class="grid">
  <div class="card"><p><b>Idée finale :</b> {esc(c["idee"])}</p><p><b>Public :</b> {esc(c["public"])}</p><p><b>Enjeu :</b> {esc(c["enjeu"])}</p><p><b>Question principale :</b> {esc(c["question"])}</p></div>
  <div class="card"><p><b>Attente initiale :</b> {esc(c["attente"])}</p><p><b>Révélation possible :</b> {esc(c["revelation"])}</p><p><b>Preuves :</b> {esc(c["preuves"])}</p><p><b>Limites :</b> {esc(c["limites"])}</p></div>
</div>

<h3>2 · Trois accroches</h3>
<div class="grid">{accroches}</div>

<h3>3 · Art du hook</h3>
<div class="grid">
  <div class="card"><p><b>Analyse :</b> {esc(c["analyse"])}</p><p><b>Recommandation :</b> {esc(c["reco"])}</p></div>
  <div class="card"><p class="lbl">Les 4 verrous (accroche recommandée)</p><ul>{verrous}</ul></div>
</div>

<h3>4 · Découpage en planche (9:16, 1080 × 1920)</h3>
<div class="legend"><span><i></i>Zone interdite : au-dessus de y = 220 px et sous y = 1 480 px</span><span>Texte à l'écran : x 140 → 940</span><span>Les crochets [ ] = élément à fournir ou à capturer</span></div>
<div class="frames">{frames}</div>

<h3>5 · Détail du découpage</h3>
<table><tr><th>Temps</th><th>Fonction</th><th>Voix</th><th>Visuel</th><th>Texte à l'écran</th><th>Mouvement</th><th>Preuve ou élément à fournir</th></tr>
{table_rows(c)}
</table>

<h3>6 · Script final (voix, sans annotation)</h3>
<div class="card"><p>{esc(script)}</p>
<p><b>Mots :</b> {n_words} · <b>Durée estimée :</b> ≈ {est:.0f} s à {WORDS_PER_SECOND} mots/s (débit retenu : Simon × 1,2). À vérifier à voix haute avant tout enregistrement.</p>
<p><b>Promesse :</b> {esc(c["promesse"])}<br><b>Réponse réelle :</b> {esc(c["reponse"])}</p></div>

<h3>7 · Contrôle qualité</h3>
<table><tr><th>Question</th><th>Réponse</th></tr>{controles}</table>

<h3>8 · Variante à tester (une seule dimension)</h3>
<div class="card"><p><b>Dimension :</b> {esc(v["dim"])}</p><p><b>Ce qui change :</b> {esc(v["change"])}</p><p><b>Pourquoi :</b> {esc(v["pourquoi"])}</p><p><b>Hypothèse :</b> {esc(v["hyp"])}</p></div>

<h3>9 · À fournir avant production</h3>
<div class="card"><ul>{fournir}</ul></div>

<h3>10 · Sources de cette planche</h3>
<div class="card"><ul>{sources}</ul></div>

<div class="foot">Concept 5 sur 5 · planches du 16 oct. 2026 · Rien de tourné, rien de rendu. Mentions : « exemple fictif » sur tout scénario inventé ; « prix affichés » sur les médianes de la base ; « jusqu'à » sur chaque fourchette.</div>
</body></html>"""


def main():
    os.makedirs(OUT, exist_ok=True)
    for c in CONCEPTS:
        path = os.path.join(OUT, f"planche-{c['slug']}.html")
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(page(c))
        voix = [f["voix"] for f in c["frames"]]
        est = words_of(voix) / WORDS_PER_SECOND + 0.3 * len(voix)
        print(f"{path} · {words_of(voix)} mots · ≈ {est:.0f} s")


if __name__ == "__main__":
    main()
