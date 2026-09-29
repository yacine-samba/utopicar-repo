// Données démo UTOPICAR : fictives, déterministes (seed), jamais tirées de la vraie base.
// Les chiffres affichés à l'écran sont calculés par l'outil lui-même à partir de ces données.

export const NOW = Date.parse('2026-09-29T18:00:00+02:00');
const H = 3600e3, D = 24 * H;
const iso = t => new Date(t).toISOString();
const day = t => new Date(t).toISOString().slice(0, 10);

// bruit déterministe (mulberry32)
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gauss = r => { const u = Math.max(1e-9, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

/* ---------- 1. Rapport du hook : Golf VII à 9 500 €, NO GO, il reste −1 200 € ---------- */
const golf = {
  id: 'demo-golf', type: 'annonce', v: 3, createdAt: NOW - 2 * H,
  titre: 'Volkswagen Golf VII 1.6 TDI',
  input: {
    docs: ['annonce', 'histovec'],
    texte: 'Volkswagen Golf VII 1.6 TDI 110 Confortline, 2015, 168 000 km, 9 500 €, Orléans. Distribution faite, CT OK, 2 propriétaires.',
  },
  result: {
    vehicule: {
      marque: 'Volkswagen', modele: 'Golf', generation: 'Golf 7', versionExacte: '1.6 TDI 110 Confortline',
      titreAnnonce: 'Golf 7 1.6 TDI 110 Confortline', annee: 2015, premiereImmat: '2015-06-12', km: 168000, prix: 9500,
      energie: 'Diesel', boite: 'Manuelle', localisation: 'Orléans (45)', distanceKm: 128, puissanceFiscale: 5, vendeur: 'particulier',
    },
    marche: { reventeRapide: 9800, realiste: 10200, bas: 9300, confiance: 'moyenne' },
    remiseEnEtat: { prudent: 1100, postes: [
      { libelle: 'Embrayage fatigué (patine en côte)', categorie: 'mécanique', min: 650, max: 900 },
      { libelle: 'Pneus avant', categorie: 'usure', min: 160, max: 220 },
    ] },
    utoscore: 76,
    scores: { revente: 7, marge: 2, risqueMecanique: 6, risqueAdministratif: 9, compat0: 3, debutant: 5 },
    controles: [
      { id: 'kilometrage', statut: 'ok', detail: 'Kilométrage cohérent sur 6 relevés HistoVec.' },
      { id: 'gage_opposition', statut: 'ok', detail: 'Aucun gage ni opposition.' },
      { id: 'sinistres', statut: 'ok', detail: 'Aucun sinistre déclaré.' },
    ],
    alertes: [],
    resume: 'Voiture saine mais trop chère : à 9 500 €, embrayage et pneus compris, elle vous coûte de l\'argent. Elle ne devient intéressante que sous 7 500 €.',
    vraiZeroEuro: false,
  },
};

/* ---------- 2. Rapport GO (Clio IV) pour le tableau de bord ---------- */
const clioRep = {
  id: 'demo-clio', type: 'annonce', v: 3, createdAt: NOW - 26 * H,
  titre: 'Renault Clio IV 1.5 dCi 90',
  input: { docs: ['annonce', 'histovec', 'ct'], texte: 'Renault Clio IV 1.5 dCi 90 Business, 2016, 121 000 km, 6 400 €, Évry.' },
  result: {
    vehicule: {
      marque: 'Renault', modele: 'Clio', generation: 'Clio 4', versionExacte: '1.5 dCi 90 Business', annee: 2016, premiereImmat: '2016-03-02',
      km: 121000, prix: 6400, energie: 'Diesel', boite: 'Manuelle', localisation: 'Évry (91)', distanceKm: 32, puissanceFiscale: 4, vendeur: 'particulier',
    },
    marche: { reventeRapide: 8900, realiste: 9200, bas: 8500, confiance: 'forte' },
    remiseEnEtat: { prudent: 250, postes: [] },
    utoscore: 84, controles: [], alertes: [], resume: 'Bonne affaire nette.', vraiZeroEuro: true,
  },
};

/* ---------- 3. Parc : 4 en stock, 9 vendus, rotation ~23 j ---------- */
const V = (id, marque, modele, generation, annee, statut, achat, vente, frais, dAchat, dVente, plaque) => ({
  id, marque, modele, generation, annee, statut, structure: 'achat', plaque,
  prixAchat: achat, prixVente: statut === 'vendu' ? vente : null, prixConseille: statut !== 'vendu' ? vente : null,
  frais: frais.map(([libelle, montant]) => ({ libelle, montant })),
  dateAchat: day(NOW - dAchat * D), dateVente: dVente != null ? day(NOW - dVente * D) : null,
  ctDate: day(NOW - 40 * D), revisionDate: day(NOW + 120 * D),
});
// marges vendues : 1 540 + 1 910 + 1 280 + 2 150 + 1 620 + 1 370 + 1 840 + 1 490 + 1 620 = 14 820 €
const vehicles = [
  V('v1', 'Renault', 'Clio', 'Clio 4', 2016, 'vendu', 5200, 7100, [['Pneus', 210], ['Carte grise', 150]], 150, 128, 'EK-218-QB'),
  V('v2', 'Peugeot', '208', '208 I', 2015, 'vendu', 4800, 7050, [['Freins', 190], ['Carte grise', 150]], 132, 110, 'DZ-904-LM'),
  V('v3', 'Toyota', 'Yaris', 'Yaris 3', 2014, 'vendu', 5400, 6990, [['Nettoyage', 160], ['Carte grise', 150]], 118, 97, 'DG-377-TR'),
  V('v4', 'Renault', 'Clio', 'Clio 4', 2017, 'vendu', 6100, 8600, [['Embrayage', 200], ['Carte grise', 150]], 101, 80, 'EP-651-KA'),
  V('v5', 'Dacia', 'Sandero', 'Sandero 2', 2016, 'vendu', 4300, 6230, [['Pneus', 160], ['Carte grise', 150]], 88, 62, 'EA-102-HS'),
  V('v6', 'Peugeot', '208', '208 I', 2014, 'vendu', 4600, 6280, [['Batterie', 160], ['Carte grise', 150]], 70, 49, 'DC-588-PV'),
  V('v7', 'Renault', 'Clio', 'Clio 4', 2015, 'vendu', 5000, 7150, [['Distribution', 160], ['Carte grise', 150]], 58, 36, 'DT-230-XN'),
  V('v8', 'Toyota', 'Yaris', 'Yaris 3', 2015, 'vendu', 5600, 7400, [['Nettoyage', 160], ['Carte grise', 150]], 43, 18, 'DX-714-CE'),
  V('v9', 'Citroën', 'C3', 'C3 II', 2016, 'vendu', 4700, 6630, [['Pneus', 160], ['Carte grise', 150]], 29, 6, 'EF-469-JU'),
  V('v10', 'Renault', 'Clio', 'Clio 4', 2016, 'en_vente', 5900, 7900, [['Pneus', 220], ['Carte grise', 150]], 12, null, 'EH-305-RD'),
  V('v11', 'Peugeot', '208', '208 I', 2016, 'en_vente', 5500, 7400, [['Carte grise', 150]], 9, null, 'EC-817-BA'),
  V('v12', 'Toyota', 'Yaris', 'Yaris 3', 2016, 'preparation', 6200, 8200, [['Carrosserie', 280], ['Carte grise', 150]], 5, null, 'EL-042-SF'),
  V('v13', 'Dacia', 'Sandero', 'Sandero 2', 2017, 'preparation', 5100, 6900, [['Carte grise', 150]], 2, null, 'EW-561-GT'),
  V('v14', 'Renault', 'Clio', 'Clio 4', 2016, 'repere', null, 7800, [], 0, null, ''),
];

/* ---------- 4. Recherche en direct : cote Clio IV diesel sur 200 annonces + 3 nouvelles annonces ---------- */
function cloioCote() {
  const r = rng(42); const Y = 2026; const rows = [];
  const fins = ['Business', 'Zen', 'Limited', 'Trend'];
  const villes = ['Paris', 'Lyon', 'Lille', 'Nantes', 'Rennes', 'Toulouse', 'Reims', 'Tours', 'Rouen', 'Orléans'];
  for (let i = 0; i < 200; i++) {
    const annee = 2013 + Math.floor(r() * 7);           // 2013 → 2019
    const age = Y - annee;
    const km = Math.round((age * 13500 + gauss(r) * 22000 + 15000) / 500) * 500;
    const kmC = Math.min(240000, Math.max(20000, km));
    const pro = r() < 0.3 ? 1 : 0;
    const lp = Math.log(22375) - 0.07 * age - 0.03 * (kmC / 10000) + 0.06 * pro + gauss(r) * 0.07;
    const prix = Math.round(Math.exp(lp) / 50) * 50;
    const fin = fins[Math.floor(r() * fins.length)];
    const ch = r() < 0.75 ? 90 : 110;
    rows.push([prix, annee, kmC, 1, pro, 'Bon état', null,
      `Renault Clio IV 1.5 dCi ${ch} ${fin} | ${villes[i % villes.length]}`, ch, 5, 'Citadine', `demo${100000 + i}`]);
  }
  return { cle: 'renault clio|4|diesel', nom: 'Renault Clio 4 diesel (2012 – 2019)', base: 'renault clio', gen: '4', energie: 'diesel',
    y0: 2012, y1: 2019, n: 200, statut: 'ok', maj: iso(NOW - 3 * D), rows };
}

const ann = (id, titre, prix, km, annee, ville, dep, minAgo, statut, extrait) => ({
  id, titre, prix, km, annee, energie: 'Diesel', boite: 'Manuelle', ville, cp: '', departement: dep, vendeur_type: 'particulier',
  statut, publie_le: iso(NOW - minAgo * 60e3), premiere_vue: iso(NOW - minAgo * 60e3), nb_photos: 0, marque: 'Renault', modele: 'Clio',
  extrait, attributs: [{ key: 'fuel', value_label: 'Diesel' }, { key: 'gearbox', value_label: 'Manuelle' }, { key: 'horse_power_din', value: '90' }, { key: 'seats', value: '5' }, { key: 'vehicle_type', value_label: 'Citadine' }],
  veille_id: 'veille-clio', url: '',
});
const liveList = [
  ann('lv1', 'Renault Clio IV 1.5 dCi 90 Business', 6400, 118000, 2016, 'Évry', '91', 12, 'nouvelle',
    'Clio 4 dCi 90 Business, 118 000 km, carnet d\'entretien complet, distribution faite à 110 000 km, CT OK sans défaut, 2 propriétaires. Vidange et filtres faits en juin, pneus avant neufs, climatisation qui fonctionne, régulateur et GPS. Aucun frais à prévoir, visible à Évry.'),
  ann('lv2', 'Renault Clio IV 1.5 dCi 90 Limited', 8400, 104000, 2016, 'Versailles', '78', 27, 'nouvelle',
    'Clio 4 dCi 90 Limited, 104 000 km, première main, CT OK, révision faite chez Renault en mai avec factures. Pneus récents, climatisation, GPS, radar de recul. Véhicule non fumeur, visible à Versailles le week-end.'),
  ann('lv3', 'Renault Clio IV 1.5 dCi 90 Zen', 7200, 142000, 2016, 'Créteil', '94', 48, 'suivie',
    'Clio 4 dCi 90 Zen, 142 000 km, entretien à jour avec factures, CT OK, pneus récents, distribution faite à 120 000 km. Climatisation, régulateur, Bluetooth. Petite rayure sur le pare-choc arrière.'),
];
const etat = {
  token: 'demo', nonvues: 2, aujourdhui: 7, total: 412, cout_mois: 3.4, passages_mois: 58, taille_mo: 120,
  cron: { active: true },
  reglages: { frequence_minutes: 30, heure_debut: 7, heure_fin: 23, budget_mensuel_usd: 20 },
  passages: [{ statut: 'ok', debut: iso(NOW - 13 * 60e3), fin: iso(NOW - 12 * 60e3), nouvelles: 2, cout_usd: 0.06 }],
  veilles: [{ id: 'veille-clio', nom: 'Clio IV diesel 5 – 9 k€', actif: true, intervalle: 30,
    filtres: { price_min: 5000, price_max: 9000, year_min: 2013, year_max: 2019, mileage_max: 180000 } }],
};

export const demo = {
  now: NOW,
  vehicules: vehicles,
  analyses: [golf, clioRep],
  releves: [],
  params: { margeMin: 800, stockMax: 45, tarifCV: 68.95, cgPaye: true, kmCost: 0.25, fraisFixes: 150, ville: 'Paris' },
  sql: { etat, live: liveList, cotes: [cloioCote()] },
};
