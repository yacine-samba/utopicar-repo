// Données de démonstration pour filmer l'app (aucune donnée réelle). Compte : Benef Pro, option Messages.
export const UID = '00000000-0000-4000-8000-000000000001';
export const USER = { id: UID, aud: 'authenticated', role: 'authenticated', email: 'demo@utopicar.fr', email_confirmed_at: '2026-09-01T10:00:00Z', app_metadata: { provider: 'email' }, user_metadata: { prenom: 'Yacine' }, created_at: '2026-09-01T10:00:00Z' };
export const TABLES = {
  profils: [{ id: UID, prenom: 'Yacine', nom: '', famille: 'benef', ville: 'Lyon', formule_offerte: null, offerte_jusqu_au: null, illimite: false, reglages: { analyse: { objectif: 'revente', experience: 'habitue', travaux: 'petits', margeMin: 750, ville: 'Lyon', rempli: true } }, admin: false, onboarding: { fait: true } }],
  abonnements: [{ user_id: UID, offre: 'pro', statut: 'active', periode_fin: '2026-11-14T00:00:00Z', annule_fin_periode: false }],
  achats: [], credits: [], codes_utilises: [], usages: [], favoris: [], rapports: [],
};
export const RPC = { mes_credits: 0, mon_code_solde: 0, option_active: true, suivis_verifier: null };

// ---------- analyse : cote de l'outil = vraie fonction cote_marche de la base, lue le 14 oct. 2026 (agrégats, aucune annonce) ----------
const COTES = [
  { re: /208/i, cote: { n: 514, p25: 4838, mediane: 5519, p75: 6654 } },     // Peugeot 208, 2016, 116 789 km, essence
  { re: /clio/i, cote: { n: 1411, p25: 7557, mediane: 8329, p75: 9144 } },   // Renault Clio, 2016, 112 000 km, diesel
];
RPC.cote_marche = (a) => (COTES.find((c) => c.re.test(`${a.p_marque} ${a.p_modele}`)) || {}).cote ?? null;
RPC.historique_annonce = null;
let nRap = 0;
RPC.enregistrer_analyse = (a) => {
  const id = `00000000-0000-4000-8000-${String(100000000000 + ++nRap)}`;
  TABLES.rapports.unshift({ id, user_id: UID, mode: a.p_mode, titre: a.p_titre, marque: a.p_marque, prix: a.p_prix, verdict: a.p_verdict, marge: a.p_marge, note: a.p_note, annonce: a.p_annonce, resultat: a.p_resultat, created_at: new Date().toISOString(), photos: [], lien: null, vendeur: null, partage: null });
  return id;
};
RPC.rapport_completer = (a) => { const r = TABLES.rapports.find((x) => x.id === a.p_id); if (r) Object.assign(r, { photos: a.p_photos ?? [], lien: a.p_lien, vendeur: a.p_vendeur }); return null; };
TABLES.suivis = [];

// ---------- marché de démonstration (annonces fictives, aucune annonce réelle) : Renault Clio IV diesel ----------
// Prix tirés autour de la vraie cote de l'outil (médiane 8 329 € pour 2016 et 112 000 km), décote par an et par km,
// quelques annonces nettement sous la cote. Bruit déterministe (graine), jamais Math.random.
const rnd = (k) => { const x = Math.sin(k * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const VILLES = ['Lyon (69)', 'Villeurbanne (69)', 'Vénissieux (69)', 'Saint-Étienne (42)', 'Grenoble (38)', 'Bourg-en-Bresse (01)', 'Vienne (38)', 'Mâcon (71)', 'Annecy (74)', 'Chambéry (73)', 'Valence (26)', 'Roanne (42)'];
const FIN = ['Business', 'Zen', 'Intens', 'Limited', 'Life', 'Trend', 'Zen Energy'];
export const MARCHE = Array.from({ length: 220 }, (_, i) => {
  const annee = 2013 + Math.floor(rnd(i + 1) * 7), km = Math.round((35000 + rnd(i + 101) * 90000 + (2019 - annee) * 14000) / 100) * 100;
  const ch = rnd(i + 201) < 0.75 ? 90 : 75, base = 8329 + (annee - 2016) * 700 - (km - 112000) * 0.012 + (ch === 75 ? -300 : 0);
  const aff = rnd(i + 301) < 0.05 ? -(0.16 + rnd(i + 401) * 0.08) : (rnd(i + 501) - 0.45) * 0.1;
  const prix = Math.round(base * (1 + aff) / 50) * 50;
  const vu = new Date(Date.UTC(2026, 9, 14, 9) - Math.floor(rnd(i + 601) * 6 * 24) * 3600e3).toISOString();
  return { id: `demo-clio-${i}`, source: 'demo', titre: `Renault Clio IV 1.5 dCi ${ch} ${FIN[i % FIN.length]}`, texte: '', prix, annee, km, energie: 'Diesel', boite: 'Manuelle', pro: rnd(i + 701) < 0.3, ch, places: 5, carr: 'citadine', etat: null, lieu: VILLES[i % VILLES.length], url: null, vu_le: vu, en_ligne: true, photo: null, photos: null, version: null, finition: FIN[i % FIN.length], mec: `${annee}-0${1 + (i % 9)}`, portes: 5, lbc_min: null, lbc_max: null, lbc_pos: null };
});
RPC.marche_candidats = (a) => { let re; try { re = new RegExp(String(a.p_regex || '').replace(/\\y/g, '\\b'), 'i'); } catch { return []; }
  return MARCHE.filter((l) => re.test(l.titre) && (!a.p_annee_min || l.annee >= a.p_annee_min) && (!a.p_annee_max || l.annee <= a.p_annee_max)).slice(0, a.p_limite || 5000); };
Object.assign(TABLES, { recherches: [], recherches_journal: [], annonces_trouvees: [], documents: [], parc: [], lbc_boites: [], lbc_campagnes: [], lbc_envois: [], cotes: [], collectes: [] });
RPC.mes_alertes = []; RPC.mes_alertes_supprimees = []; RPC.lbc_mon_compte = null;

// ---------- alertes e-mail (Benef Pro : un passage toutes les 3 h au plus souvent) ----------
TABLES.veilles = [];
RPC.alerte_enregistrer = (a) => { const p = a.p || {}; let v = p.id && TABLES.veilles.find((x) => x.id === p.id);
  if (!v) { v = { id: `00000000-0000-4000-a000-${String(300000000000 + TABLES.veilles.length + 1)}`, created_at: '2026-10-09T08:00:00Z' }; TABLES.veilles.push(v); }
  Object.assign(v, { nom: p.nom || 'Ma recherche', actif: p.actif ?? true, notifier: p.notifier ?? true, email: p.email || USER.email, intervalle_min: Math.max(180, p.intervalle_min || 180), filtres: p.filtres || {} });
  const r = TABLES.recherches.find((x) => x.nom === v.nom || (x.criteres && JSON.stringify(x.criteres).includes(String((p.filtres || {}).modele || '~')))); if (r) r.alerte_id = v.id;
  return v.id; };
RPC.mes_alertes = () => TABLES.veilles.map((v) => ({ ...v, derniere_execution: '2026-10-14T06:00:00Z', derniere_erreur: null, derniers_nouveaux: 1, en_cours: false, passages: 37, mails: 4, annonces: [] }));
RPC.alerte_supprimer = null; RPC.alerte_basculer = (a) => { const v = TABLES.veilles.find((x) => x.id === (a.p_id || a.id)); if (v) v.actif = a.p_actif ?? !v.actif; return null; };

// ---------- recherche suivie Clio 4 diesel (pré-remplie pour les pages qui la lisent) ----------
export const RECH_ID = '00000000-0000-4000-9000-000000000010';
const F0 = { version: '', phase: '', carrosserie: '', moteur: '', chMin: '', chMax: '', energie: 'diesel', boite: '', anneeMin: '', anneeMax: '', prixMin: '', prixMax: '', kmMin: '', kmMax: '', vendeur: '', dep: '', mots: '', exclure: '', sousCote: '', fiables: true, tri: 'ecart' };
TABLES.recherches.push({ id: RECH_ID, user_id: UID, cle: 'renault|clio|4', nom: 'Renault Clio 4', active: true, criteres: { choix: { marque: 'renault', modele: 'clio', gen: '4' }, f: F0 }, trouvees: 220, sous_cote: 22,
  meilleure: { titre: 'Renault Clio IV 1.5 dCi 90 Business', prix: 7650, ecart: 2270, pct: 0.23, url: null }, derniere_le: '2026-10-14T06:00:00Z', alerte_id: process.env.ALERTE_ON ? '00000000-0000-4000-a000-300000000001' : null, created_at: '2026-10-09T08:00:00Z' });
if (process.env.ALERTE_ON) TABLES.veilles.push({ id: '00000000-0000-4000-a000-300000000001', nom: 'Renault Clio 4', actif: true, notifier: true, email: USER.email, intervalle_min: 180, filtres: {}, created_at: '2026-10-09T08:00:00Z' });

// ---------- messages automatiques (option de Benef Pro) : la nuit, la campagne écrit aux vendeurs ----------
RPC.lbc_mon_compte = { email: 'demo@utopicar.fr', nom_affiche: 'Yacine', statut: 'ok', erreur: null, updated_at: '2026-10-09T08:05:00Z' };
TABLES.lbc_campagnes = [{ id: '00000000-0000-4000-b000-000000000001', user_id: UID, recherche_id: RECH_ID, nom: 'Renault Clio 4 diesel', message: "Bonjour, votre Clio m'intéresse. Est-elle toujours disponible ? Pourriez-vous m'envoyer le contrôle technique et les factures d'entretien ?", actif: true, ignorer_refus: true, updated_at: '2026-10-09T08:10:00Z', created_at: '2026-10-09T08:10:00Z' }];
const NUIT = ['01:14', '01:16', '02:41', '02:43', '03:12', '03:14', '04:37', '06:02', '06:04'];
TABLES.lbc_envois = NUIT.map((h, i) => { const m = MARCHE.filter((x) => x.annee >= 2014).sort((a, b) => a.prix - b.prix)[i * 3];
  return { id: 900 + i, user_id: UID, campagne_id: TABLES.lbc_campagnes[0].id, annonce_id: m.id, url: '', titre: m.titre, prix: m.prix, statut: i === 8 ? 'en_attente' : 'envoye', raison: null, created_at: `2026-10-14T${h}:00+02:00`, traite_le: i === 8 ? null : `2026-10-14T${h}:30+02:00` }; }).reverse();
TABLES.lbc_boites = [{ user_id: UID, conversations: [
  { id: 'c1', nom: 'Karim', annonce: 'Renault Clio IV 1.5 dCi 90 Business', annonce_id: 'demo-clio-1', dernier: 'Oui toujours dispo ! CT de 3 mois, je vous envoie les factures.', le: '2026-10-14T07:41:00+02:00', non_lus: 1 },
  { id: 'c2', nom: 'Sophie', annonce: 'Renault Clio IV 1.5 dCi 90 Zen', annonce_id: 'demo-clio-2', dernier: 'Bonjour, oui elle est disponible. Visible ce week-end.', le: '2026-10-14T07:12:00+02:00', non_lus: 1 }],
  non_lus: 2, total: 2, maj: '2026-10-14T07:45:00+02:00', demande: null, run_id: null, erreur: null }];
