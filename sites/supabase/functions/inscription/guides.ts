// Guides réservés aux inscrits, choisis selon l'objectif. Jamais servis sans jeton valide.
const ch = (n: string, titre: string, corps: string) => `<section class="eb-ch"><span class="eb-n">${n}</span><h4>${titre}</h4>${corps}</section>`;
const ul = (cls: string, items: string[]) => `<ul class="${cls}">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
const cover = (tag: string, titre: string, intro: string) => `<header class="eb-cover"><span class="eb-tag">${tag}</span><h3>${titre}</h3><p>${intro}</p></header>`;
const calc = (rows: [string, string, string?][], tot: [string, string]) => `<div class="eb-calc">${rows.map(([a, b, c]) => `<div class="${c ?? ""}"><span>${a}</span><b>${b}</b></div>`).join("")}<div class="t"><span>${tot[0]}</span><b>${tot[1]}</b></div></div>`;

const CITADINES: [string, string, string][] = [
  ["Renault Clio III / IV", "1.2 16V 75, 1.5 dCi 75/85/90", "AL4, EDC, TCe 120"],
  ["Toyota Yaris II / III", "1.0 et 1.33 VVT-i, 1.4 D-4D", "Robotisée MMT"],
  ["Aygo / C1 / 107", "1.0 68 ch", "Robotisée"],
  ["Honda Jazz II / III", "1.2 et 1.4 i-VTEC manuelle", "i-Shift robotisée"],
  ["Suzuki Swift", "1.2 VVT 94 ch", "Rien de notable"],
  ["Mazda 2", "1.3 et 1.5 essence", "Sans suivi d'entretien"],
  ["Dacia Sandero I / II", "1.2 16V, 1.5 dCi, 0.9 TCe", "Easy-R robotisée"],
  ["Peugeot 207", "1.4 HDi 70, 1.6 HDi 90", "1.6 THP, VTi, AL4"],
  ["Peugeot 208 diesel", "HDi, BlueHDi", "1.2 PureTech, ETG"],
  ["Citroën C3 II", "1.4 HDi, 1.6 HDi / BlueHDi", "1.2 PureTech, ETG"],
  ["Ford Fiesta VI", "1.25 Duratec, 1.4 TDCi", "1.0 EcoBoost, Powershift"],
  ["Hyundai i20 / Kia Rio", "1.2 / 1.25, 1.4 CRDi", "Sans carnet"],
  ["Hyundai i10 / Kia Picanto", "1.0 et 1.2 essence", "Auto 4 rapports usée"],
  ["Toyota Auris", "1.33 / 1.6 VVT-i, 1.4 D-4D, hybride", "2.0 / 2.2 D-4D"],
  ["Volkswagen Polo V", "1.6 TDI, 1.4 MPI", "DSG7, premiers 1.2 TSI"],
  ["Renault Twingo II", "1.2 16V 75", "Quickshift robotisée"],
  ["Škoda Fabia II / III", "1.6 TDI, 1.0 MPI", "DSG, 1.2 HTP sans preuve"],
];
const tableCitadines = () => `<div class="eb-tw"><table class="eb-t"><tr><th>Modèle</th><th>À prendre</th><th>À éviter</th></tr>${CITADINES.map(([a, b, c]) => `<tr><td><b>${a}</b></td><td>${b}</td><td class="no">${c}</td></tr>`).join("")}</table></div>`;
const PANNES = `<div class="eb-tw"><table class="eb-t"><tr><th>Intervention (citadine)</th><th>Fourchette indicative</th></tr><tr><td>Plaquettes + disques avant</td><td>150 – 300 €</td></tr><tr><td>2 pneus</td><td>140 – 260 €</td></tr><tr><td>Batterie</td><td>100 – 200 €</td></tr><tr><td>Vidange + filtres</td><td>80 – 150 €</td></tr><tr><td>Kit distribution + pompe à eau</td><td>350 – 700 €</td></tr><tr><td>Embrayage</td><td>450 – 800 €</td></tr><tr><td>Amortisseurs avant</td><td>250 – 450 €</td></tr><tr><td>Vanne EGR</td><td>250 – 600 €</td></tr></table></div><p class="eb-small">Pièces et main-d'œuvre en garage indépendant. Varient selon le modèle et la région. Sans diagnostic, prévoir le haut de la fourchette.</p>`;

const Q5 = `<ol class="eb-q"><li>Depuis quand vous l'avez ?</li><li>Vous avez les factures d'entretien ? La distribution a été faite à quel kilométrage ?</li><li>Le CT a moins de 6 mois ? Il y a une contre-visite ?</li><li>Un voyant allumé, un bruit, une fuite ?</li><li>Pouvez-vous m'envoyer le rapport HistoVec ?</li></ol>`;
const ESSAI = ul("eb-ok", ["Démarrage moteur froid : bruits, claquements, fumée", "Voyants qui s'allument au contact puis s'éteignent", "Embrayage : s'il accroche tout en haut, il est usé", "Vitesses sans craquement, freinage droit, direction qui ne tire pas", "Clim qui fait du froid, traces d'huile sous la voiture"]);
const PAPIERS = ul("eb-ok", ["Carte grise barrée, datée, signée, avec l'heure", "Certificat de cession en 2 exemplaires et code de cession", "Certificat de situation administrative de moins de 15 jours", "PV de contrôle technique de moins de 6 mois (voiture de plus de 4 ans)", "Nom sur la carte grise = la personne en face, VIN de la carte = VIN de la voiture"]);
const MOTEURS = ul("eb-no", ["<b>1.2 PureTech</b> : courroie de distribution, consommation d'huile", "<b>1.6 THP</b> : chaîne de distribution", "<b>1.0 EcoBoost</b> : circuit de refroidissement", "<b>TCe 115 / 120</b> : consommation d'huile", "<b>Boîtes robotisées</b> : EDC, DSG, Powershift, ETG, MMT"]);

// ------------------------------------------------------------------ guides
function guideDebutant(prenom: string, plan = "") {
  return `<div class="eb">${cover("Guide gratuit", "Les 7 règles avant ta première voiture", `${prenom}, voici les règles de base pour ne pas perdre d'argent sur ta première voiture, puis viser 500 à 1 000 € par mois ensuite. Pas de promesse magique.`)}${plan}
${ch("Règle 1", "Regarde les vrais chiffres avant de rêver", `<p>Sur une citadine bien achetée, il reste en général <b>400 à 800 € nets</b> une fois tout payé. Pas 3 000 €.</p>${calc([["Achat négocié", "5 000 €"], ["Carte grise (selon région)", "− 200 €", "m"], ["2 pneus + parallélisme", "− 220 €", "m"], ["Préparation, nettoyage", "− 60 €", "m"], ["CT de moins de 6 mois", "− 80 €", "m"], ["Trajet", "− 70 €", "m"], ["Revente", "6 300 €"]], ["Bénéfice net", "670 €"])}<p><b>Ce que ça veut dire :</b> 500 à 1 000 € par mois, c'est une à deux voitures bien achetées et bien revendues. Atteignable, mais c'est un vrai travail.</p>`)}
${ch("Règle 2", "Achète ce que les autres cherchent, pas ce qui te plaît", `<p>Pour commencer, vise des citadines courantes : beaucoup d'acheteurs, pièces pas chères, entretien connu.</p>${ul("eb-ok", ["Renault Clio III / IV en dCi ou 1.2 16V", "Peugeot 208 en diesel HDi / BlueHDi", "Dacia Sandero en 1.2 ou dCi", "Toyota Yaris en 1.0 / 1.33 essence", "Volkswagen Polo V en 1.6 TDI"])}<p>À éviter au début : premium, électriques, boîtes automatiques, modèles rares ou très récents.</p>`)}
${ch("Règle 3", "Fuis les moteurs et les boîtes à problèmes", `${MOTEURS}<p>Un de ces moteurs avec toutes ses factures peut passer. Le même sans aucune preuve d'entretien : tu passes ton tour.</p>`)}
${ch("Règle 4", "Calcule ton prix maximum avant d'appeler", `<p class="eb-formula">Revente réaliste − travaux − frais − ta marge = <b>ton prix max</b></p><p>Exemple : revente 6 300 €, travaux 400 €, frais 350 €, marge voulue 700 € → <b>prix max 4 850 €</b>. Au-dessus, tu passes à l'annonce suivante. Ta marge se fait le jour où tu achètes.</p><p>Pour la revente réaliste, compare au moins 20 annonces : même modèle et moteur, année à ± 1 an, kilométrage à ± 30 000 km.</p>`)}
${ch("Règle 5", "Pose ces 5 questions avant de te déplacer", `${Q5}<p>Un vendeur qui ne sait rien, n'a aucune facture ou refuse HistoVec : tu achèterais l'historique à l'aveugle.</p>`)}
${ch("Règle 6", "Fais l'essai de 10 minutes, moteur froid", `${ESSAI}<p>Au moindre doute, propose un passage chez un garagiste avant l'achat. Si le vendeur refuse, tu as ta réponse.</p>`)}
${ch("Règle 7", "Récupère les bons papiers, et reste dans les clous", `${PAPIERS}<p><b>Important :</b> acheter pour revendre de façon régulière, c'est une activité commerciale. Elle se déclare (la micro-entreprise est le plus simple) et implique un registre de police. Vérifie ta situation avec la CCI ou un comptable avant ta deuxième voiture.</p>`)}
<footer class="eb-end"><h4>La suite : l'ebook complet</h4><p>Ce guide te dit quoi éviter. L'ebook complet, en cours d'écriture, te montrera comment faire étape par étape : trouver les bonnes annonces avant les autres, négocier avec des scripts complets, préparer et photographier la voiture, rédiger l'annonce qui vend, déclarer ton activité proprement.</p></footer></div>`;
}

function planEbook(budget: string | null, objectif: string | null) {
  const b: Record<string, [string, string]> = {
    "moins-2000": ["Commence sans acheter", "Avec moins de 2 000 €, n'achète pas encore : une voiture à ce prix cache souvent des frais qui mangent tout. Commence par aider un particulier à vendre sa voiture contre une commission, avec un mandat écrit. Tu apprends les prix, la négociation et les papiers sans risquer ton argent, et tu mets de côté pour ta première vraie voiture."],
    "2000-5000": ["Une citadine à 3 000 – 4 000 €", "Vise une citadine fiable entre 3 000 et 4 000 € et garde le reste en réserve pour les imprévus. Une seule voiture à la fois : tu revends avant de racheter."],
    "5000-10000": ["Une voiture à la fois, avec une vraie réserve", "Ton budget permet une citadine récente et bien suivie autour de 5 000 €, avec 15 % de réserve. Ne pars pas sur deux voitures en même temps avant d'avoir réussi la première revente."],
    "plus-10000": ["Pas plus de deux voitures en même temps", "Avec plus de 10 000 €, le risque n'est pas le manque d'argent mais d'aller trop vite. Fais ta première revente seule, puis passe à deux voitures en parallèle maximum, jamais plus au début."],
  };
  const p = budget && b[budget];
  const o = objectif && /1 000/.test(objectif) ? "<p><b>Ton objectif de 1 000 € par mois</b> demande environ deux voitures par mois : compte plusieurs soirées et un week-end par semaine, et un statut déclaré dès le début.</p>" : objectif && /500/.test(objectif) ? "<p><b>Ton objectif de 500 € par mois</b> correspond à environ une voiture bien achetée par mois. C'est le bon rythme pour apprendre sans t'épuiser.</p>" : "";
  if (!p && !o) return "";
  return `<section class="eb-plan"><span class="eb-n">Ton plan de départ</span>${p ? `<h4>${p[0]}</h4><p>${p[1]}</p>` : ""}${o}</section>`;
}

function guideTri(prenom: string) {
  return `<div class="eb">${cover("Guide marchands", "Trier 40 annonces en 10 minutes", `${prenom}, voici la méthode que suit l'outil pour passer de 40 annonces à 3 appels utiles.`)}
${ch("Étape 1", "Filtrez le modèle et le moteur", `<p>Éliminez d'abord tout ce que vous ne reprendrez jamais : moteurs à risque, boîtes robotisées, versions société non signalées.</p>${MOTEURS}`)}
${ch("Étape 2", "Lisez le texte comme un vendeur l'écrit", `${ul("eb-no", ["« Petit bruit, rien de grave »", "« Voyant allumé, sûrement un capteur »", "« Vendu en l'état, prix en conséquence »", "« Prévoir distribution », « clim à recharger »"])}<p>Attention aux négations : « joint de culasse refait », « non gagé », « pneus neufs » sont des points positifs. Un bon tri ne les élimine pas.</p>`)}
${ch("Étape 3", "Séparez les leviers des pièges", `<p><b>Leviers</b> (vous les chiffrez et vous les retirez du prix) : pneus, freins, batterie, vidange, rayures, pare-brise, amortisseurs.</p><p><b>Lourds</b> (chiffrables avec un diagnostic, sinon scénario haut) : boîte, embrayage, turbo, injecteurs, EGR, FAP, distribution.</p><p><b>Pièges</b> (vous partez) : joint de culasse, surchauffe, moteur HS, compteur incohérent, papiers manquants ou gage.</p>`)}
${ch("Étape 4", "Comparez au vrai marché, pas au prix affiché", `<p>Mesuré sur 189 annonces de Clio IV diesel (2015, 140 000 km, prix attendu 7 000 € en dCi 90) :</p>${ul("eb-ok", ["Version société 2 places : <b>− 21 %</b>", "Break : <b>− 2 %</b>", "Finition haute : <b>+ 5 %</b>"])}<p>Une affaire, c'est un <b>prix réel (prix + travaux) au moins 5 % sous la cote</b>, sans piège et avec un moteur fiable.</p>`)}
${ch("Étape 5", "Appelez avec votre prix déjà calculé", `<p class="eb-formula">Revente − travaux − frais − marge = <b>plafond</b></p>${calc([["Revente à la cote", "6 950 €"], ["Travaux chiffrés", "− 800 €", "m"], ["Frais fixes et trajet", "− 400 €", "m"], ["Marge voulue", "− 800 €", "m"]], ["Plafond", "4 950 €"])}<p>Première offre environ 6 % sous le plafond, arrondie : <b>4 650 €</b>. Vous avez de la marge pour discuter sans dépasser votre limite.</p>`)}
${ch("Annexe", "Les 17 citadines fiables entre 3 000 et 7 000 €", tableCitadines())}
<footer class="eb-end"><h4>L'outil fait ces 5 étapes pour vous</h4><p>Je vous écris pour ouvrir votre accès à Utopicar pendant la phase test. En attendant, gardez ce guide sous la main.</p></footer></div>`;
}

function guideReprise(prenom: string) {
  return `<div class="eb">${cover("Guide garagistes", "Estimer une reprise en 2 minutes", `${prenom}, voici comment répondre à « elle vaut combien ma voiture ? » avec des chiffres que le client comprend.`)}
${ch("Étape 1", "Comparez ce qui est comparable", `${ul("eb-ok", ["Même modèle, même motorisation", "Année à ± 1 an, kilométrage à ± 30 000 km", "Même type de vendeur (particulier ou pro)", "Retirez épaves, voitures pour pièces, doublons postés dans plusieurs villes"])}<p>Avec 5 annonces vous avez un avis, avec 100 vous avez un prix. Sous 100 annonces exploitables, restez prudent sur votre chiffre.</p>`)}
${ch("Étape 2", "Appliquez les écarts qui comptent vraiment", `<p>Mesurés sur 189 annonces de Clio IV diesel :</p>${ul("eb-ok", ["Version société 2 places : <b>− 21 %</b>", "Break : <b>− 2 %</b>", "Finition haute : <b>+ 5 %</b>", "Chaque année et chaque tranche de 10 000 km en plus font baisser la cote"])}`)}
${ch("Étape 3", "Retirez ce que la voiture va coûter", PANNES)}
${ch("Étape 4", "Vérifiez le compteur avant de donner un prix", `${ul("eb-ok", ["Kilométrages des CT sur HistoVec", "Factures d'entretien datées, carnet, étiquettes de vidange", "Données de la valise quand c'est possible"])}${ul("eb-no", ["Volant, pommeau, pédales très usés pour le km affiché", "Facture avec un km supérieur au compteur"])}<p>Au moindre doute, vous reprenez au prix d'un kilométrage inconnu, ou vous ne reprenez pas.</p>`)}
${ch("Étape 5", "Expliquez le prix au client", `<p>Montrez la cote pour son année et son kilométrage, puis chaque ligne qui fait baisser le prix. Un PV de CT se traduit simplement : <b>mineure</b> = à prévoir, <b>majeure</b> = contre-visite sous 2 mois, <b>critique</b> = réparer avant de rouler.</p><p>Transformez chaque ligne du PV en ligne de devis classée par urgence : le client comprend, et les travaux restent chez vous.</p>`)}
<footer class="eb-end"><h4>L'outil calcule cette cote pour vous</h4><p>Je vous écris pour ouvrir votre accès à Utopicar pendant la phase test.</p></footer></div>`;
}

function guideParticulier(prenom: string) {
  return `<div class="eb">${cover("Guide acheteurs", "Acheter votre prochaine occasion sans vous faire avoir", `${prenom}, voici les vérifications à faire, dans l'ordre, pour acheter au bon prix.`)}
${ch("Étape 1", "Choisissez un modèle et un moteur fiables", `${tableCitadines()}<p class="eb-small">La réputation d'un moteur ne remplace pas l'examen de la voiture : l'historique d'entretien compte plus que le modèle.</p>`)}
${ch("Étape 2", "Posez ces 5 questions avant de vous déplacer", Q5)}
${ch("Étape 3", "L'essai de 10 minutes", ESSAI)}
${ch("Étape 4", "Négociez avec des défauts chiffrés", `${PANNES}<p>Chaque défaut vu pendant l'essai ou sur le PV de CT devient un argument chiffré, pas une impression.</p>`)}
${ch("Étape 5", "Papiers et paiement", `${PAPIERS}${ul("eb-no", ["Jamais d'argent avant d'avoir vu la voiture", "Pas de vendeur « à l'étranger » avec livraison", "Chèque de banque : appelez la banque émettrice avec un numéro trouvé vous-même"])}`)}
<footer class="eb-end"><h4>Besoin d'un avis sur une annonce ?</h4><p>Utopicar calcule la vraie cote et repère les défauts dans le texte. Je vous écris pour vous ouvrir un accès pendant la phase test.</p></footer></div>`;
}

export function titreGuide(site: string, objectif: string | null) {
  if (site === "ebook") return "Les 7 règles avant ta première voiture";
  if (objectif === "Trier plus vite mes annonces") return "Trier 40 annonces en 10 minutes";
  if (objectif === "Estimer des reprises") return "Estimer une reprise en 2 minutes";
  if (objectif === "Me lancer dans l'achat-revente") return "Les 7 règles avant ta première voiture";
  if (objectif === "Trouver ma prochaine voiture") return "Acheter votre prochaine occasion sans vous faire avoir";
  return "Trier 40 annonces en 10 minutes";
}
export function contenu(site: string, objectif: string | null, budget: string | null, prenom: string) {
  const p = prenom.replace(/[&<>"']/g, "");
  if (site === "ebook") return guideDebutant(p, planEbook(budget, objectif));
  if (objectif === "Estimer des reprises") return guideReprise(p);
  if (objectif === "Me lancer dans l'achat-revente") return guideDebutant(p);
  if (objectif === "Trouver ma prochaine voiture") return guideParticulier(p);
  return guideTri(p);
}
