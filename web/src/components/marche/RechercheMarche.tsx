"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { FILTRES_VIDES, quandRecherche, resumeFiltres, type FiltresRecherche, type Recherche } from "@/lib/recherches";
import { cleFavori } from "@/lib/favoris";
import { BoutonFavori } from "../espace/BoutonFavori";
import { BoutonAnalyserAnnonce } from "../espace/BoutonAnalyserAnnonce";
import { useNotification } from "../espace/Notification";
import { Ico } from "../espace/Icones";
import { cx, inputCls } from "@/lib/cx";
import type { CatMarque, CoteAnnonce } from "@/lib/vehicules/types";
import { motorisationsTypes } from "@/lib/vehicules/phases";
import { ChoixVehicule, type Choix } from "./ChoixVehicule";
import { InterrupteurAlerte } from "./InterrupteurAlerte";

type Annonce = {
  id: string; titre: string; prix: number; annee: number | null; km: number | null; energie: string | null; boite: string | null; ch: number | null; pro: boolean; lieu: string | null;
  source: string; vu: string | null; url: string | null; photo?: string | null; gen: string | null; genLabel: string; piege: boolean; suspect: boolean; cote: CoteAnnonce | null;
  moteur: string | null; version: string | null;
  /** motorisation déduite de la puissance (pas écrite) ; génération d'après l'année seulement (doute) ; version et estimation Leboncoin */
  moteurDeduit?: boolean; genPar?: "texte" | "puissance" | "annee" | null; doute?: boolean;
  lbcVersion?: string | null; mec?: string | null; lbc?: { min: number; max: number; pos: string | null } | null;
};
type Collecte = { cle: string; nom: string; statut: "demandee" | "en cours" | "ok" | "erreur" | "quota"; n?: number | null; erreur?: string | null };
type Resultat = {
  recherche: Recherche | null; modele: { nom: string; gens: { id: string; label: string; y0: number; y1: number; n: number }[]; incertaines: number };
  versions: { id: string; label: string; n: number }[]; moteurs: { l: string; n: number; deduits?: number; ch?: number | null }[]; base: number; collecte: Collecte | null;
  /** annonces placées dans la génération d'après leur année seulement */
  incertaines?: number;
  total: number; trouvees: number; sousLaCote: number; annonces: Annonce[]; ms: number;
  /** lancement gardé : date des résultats affichés */
  journal: { id: string; le: string } | null; criteres?: { choix: Choix; f: Partial<Filtres> };
};
type Filtres = FiltresRecherche;

const VIDE = FILTRES_VIDES;
const eur = (v: number | null | undefined) => (v == null ? "—" : `${Math.round(v).toLocaleString("fr-FR")} €`);
const n = (s: string) => (s.trim() && /^\d+$/.test(s.replace(/\s/g, "")) ? Number(s.replace(/\s/g, "")) : null);
const SANS: Choix = { marque: "", modele: "", gen: "" };
const CARROSSERIES: [string, string][] = [["berline", "Berline / 5 portes"], ["break", "Break"], ["coupe", "Coupé"], ["cabriolet", "Cabriolet"], ["3p", "3 portes"], ["monospace", "Monospace"]];

/** Recherche dans la base du marché. Chaque recherche est enregistrée (une par véhicule) et reste ouverte en onglet :
    on peut chercher une autre voiture sans perdre la précédente, et la retrouver depuis le tableau de bord. */
export function RechercheMarche({ cat, alertes, etatsAlertes = {}, initiales, ouvrir, prerempli, journal, favoris = [], nouvelleRecherche = false }: {
  cat: CatMarque[]; alertes: boolean; etatsAlertes?: Record<string, boolean>; initiales: Recherche[]; ouvrir?: string | null; prerempli?: Choix | null;
  /** « Chercher une annonce » : formulaire vide, sans rouvrir le dernier onglet */
  nouvelleRecherche?: boolean;
  /** lancement du journal à rouvrir (résultats gardés ; relancé seulement s'il n'en a pas) */
  journal?: { id: string; choix: Choix; f: Partial<Filtres> } | null; favoris?: string[];
}) {
  const { notifier, element: notification } = useNotification();
  const [favs] = useState(() => new Set(favoris));
  const [liste, setListe] = useState<Recherche[]>(initiales);
  const [courant, setCourant] = useState<string | null>(null); // id de l'onglet affiché, null = nouvelle recherche
  const [choix, setChoix] = useState<Choix>(SANS);
  const [f, setF] = useState<Filtres>(VIDE);
  const [res, setRes] = useState<Resultat | null>(null);
  const [etat, setEtat] = useState("");
  const [charge, setCharge] = useState(false);
  // téléphone : les filtres se replient pendant et après la recherche, pour voir le chargement puis les résultats
  const [filtresOuverts, setFiltresOuverts] = useState(true);
  const [ouverture, setOuverture] = useState(false);
  // formulaire allégé : voiture, prix, kilométrage, année ; le reste derrière « Plus de filtres »
  const [plusFiltres, setPlusFiltres] = useState(false);
  const cache = useRef(new Map<string, Resultat>());
  // collecte Leboncoin en cours pour la recherche affichée (base trop maigre) : suivie, puis la recherche se relance seule
  const [collecte, setCollecte] = useState<(Collecte & { choix: Choix; f: Filtres; rid: string | null }) | null>(null);
  const courantRef = useRef<string | null>(null);
  useEffect(() => {
    courantRef.current = courant;
  }, [courant]);
  const marqueCat = cat.find((b) => b.k === choix.marque);
  const modeleCat = marqueCat?.m.find((m) => m.k === choix.modele);
  const genCat = modeleCat ? modeleCat.g.find((g) => g.id === (choix.gen || (modeleCat.g.length === 1 ? modeleCat.g[0].id : ""))) : undefined;
  const memeModele = res && res.recherche?.criteres.choix.modele === choix.modele && res.recherche?.criteres.choix.marque === choix.marque;
  const suggestionsMoteur = memeModele && res.moteurs.length ? res.moteurs.map((x) => x.l) : motorisationsTypes(choix.marque, choix.modele);
  const onglets = liste.filter((r) => r.active);
  const anciennes = liste.filter((r) => !r.active).slice(0, 6);

  const maj = (k: keyof Filtres) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((x) => ({ ...x, [k]: e.target instanceof HTMLInputElement && e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function lancer(c: Choix, fx: Filtres) {
    if (!c.marque || !c.modele) return setEtat("Choisissez une marque et un modèle.");
    setCharge(true);
    setEtat("");
    setFiltresOuverts(false);
    requestAnimationFrame(() => {
      if (innerWidth < 640) document.getElementById("rm-attente")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    try {
      const r = await fetch("/api/marche/recherche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marque: c.marque, modele: c.modele, gen: c.gen || undefined, energie: fx.energie, boite: fx.boite,
          version: fx.version || undefined, phase: fx.phase || undefined, carrosserie: fx.carrosserie, moteur: fx.moteur.trim() || undefined, chMin: n(fx.chMin), chMax: n(fx.chMax),
          anneeMin: n(fx.anneeMin), anneeMax: n(fx.anneeMax), prixMin: n(fx.prixMin), prixMax: n(fx.prixMax), kmMax: n(fx.kmMax),
          vendeur: fx.vendeur, mots: fx.mots, exclure: fx.exclure, sousCote: n(fx.sousCote) ?? 0, fiables: fx.fiables, tri: fx.tri, saisie: fx,
        }),
      });
      const j = (await r.json().catch(() => null)) as (Resultat & { erreur?: string }) | null;
      if (!r.ok || !j) {
        setEtat(j?.erreur ?? "La recherche n'a pas abouti. Réessayez.");
        notifier({ titre: "La recherche n'a pas abouti", texte: j?.erreur ?? "Réessayez dans un instant.", ton: "warn" });
        return;
      }
      setRes(j);
      setEtat("");
      const enCours = j.collecte && (j.collecte.statut === "demandee" || j.collecte.statut === "en cours");
      setCollecte(j.collecte ? { ...j.collecte, choix: c, f: fx, rid: j.recherche?.id ?? null } : null);
      notifier({
        titre: `Recherche terminée : ${j.recherche?.nom ?? j.modele.nom}`,
        texte: `${j.trouvees} annonce${j.trouvees > 1 ? "s" : ""}${j.sousLaCote ? `, dont ${j.sousLaCote} sous la cote` : ""}.${enCours ? " Collecte Leboncoin lancée pour compléter la base." : ""}`,
        action: { l: "Voir les résultats", onClick: () => document.getElementById("rm-res")?.scrollIntoView({ behavior: "smooth", block: "start" }) },
      });
      const rec = j.recherche;
      if (rec) {
        cache.current.set(rec.id, j);
        setCourant(rec.id);
        // l'onglet du véhicule est mis à jour (ou ajouté à la fin) ; les autres restent ouverts
        setListe((l) => (l.some((x) => x.id === rec.id) ? l.map((x) => (x.id === rec.id ? rec : x)) : [...l, rec]));
        history.replaceState(null, "", `/app/recherche?r=${rec.id}`);
      }
    } finally {
      setCharge(false);
    }
  }

  /** Pastille (version, motorisation) : filtre aussitôt, sans repasser par le formulaire. */
  function affiner(x: Partial<Filtres>) {
    const fx = { ...f, ...x };
    setF(fx);
    void lancer(choix, fx);
  }

  const chercher = (e?: React.FormEvent) => {
    e?.preventDefault();
    void lancer(choix, f);
  };

  /** Résultats gardés (aucune requête sur le marché) : un lancement du journal ou le dernier d'une recherche. */
  async function ouvrirGardes(q: string): Promise<Resultat | null> {
    setOuverture(true);
    try {
      const r = await fetch(`/api/marche/recherche?${q}`);
      if (!r.ok) return null;
      const j = (await r.json().catch(() => null)) as Resultat | null;
      if (!j) return null;
      setRes(j);
      setEtat("");
      setCollecte(null);
      if (j.recherche) {
        cache.current.set(j.recherche.id, j);
        setCourant(j.recherche.id);
        history.replaceState(null, "", `/app/recherche?r=${j.recherche.id}`);
      }
      return j;
    } finally {
      setOuverture(false);
    }
  }

  /** Affiche un onglet : ses critères et ses résultats gardés ; « relancer » seulement sur demande (Actualiser). */
  function afficher(r: Recherche, relancer = false) {
    const c = { ...SANS, ...r.criteres.choix };
    const fx = { ...VIDE, ...r.criteres.f };
    setCourant(r.id);
    setChoix(c);
    setF(fx);
    history.replaceState(null, "", `/app/recherche?r=${r.id}`);
    const deja = cache.current.get(r.id);
    if (deja && !relancer) {
      setRes(deja);
      setEtat("");
    } else if (relancer) {
      setRes(null);
      void lancer(c, fx);
    } else {
      setRes(null);
      // pas de résultats gardés (recherche d'avant cette version) : un seul lancement, gardé ensuite
      void ouvrirGardes(`r=${r.id}`).then((j) => {
        if (!j) void lancer(c, fx);
      });
    }
  }

  function nouvelle() {
    setFiltresOuverts(true);
    setCourant(null);
    setChoix(SANS);
    setF(VIDE);
    setRes(null);
    setEtat("");
    history.replaceState(null, "", "/app/recherche");
  }

  async function fermer(r: Recherche) {
    setListe((l) => l.map((x) => (x.id === r.id ? { ...x, active: false } : x)));
    await supabaseNavigateur().from("recherches").update({ active: false }).eq("id", r.id);
    if (courant === r.id) {
      const reste = onglets.filter((x) => x.id !== r.id);
      if (reste.length) afficher(reste[reste.length - 1]);
      else nouvelle();
    }
  }

  async function rouvrir(r: Recherche) {
    setListe((l) => l.map((x) => (x.id === r.id ? { ...x, active: true } : x)));
    afficher({ ...r, active: true });
    await supabaseNavigateur().from("recherches").update({ active: true }).eq("id", r.id);
  }

  // à l'arrivée : la recherche demandée (tableau de bord), le véhicule choisi, sinon le dernier onglet ouvert
  const demarre = useRef(false);
  useEffect(() => {
    const t = setTimeout(() => {
      if (demarre.current) return;
      demarre.current = true;
      const cible = (ouvrir && initiales.find((r) => r.id === ouvrir)) || null;
      // la recherche relancée revient « active » du serveur et rouvre son onglet
      if (journal?.choix?.marque && journal.choix.modele) {
        const c = { ...SANS, ...journal.choix };
        const fx = { ...VIDE, ...journal.f };
        setChoix(c);
        setF(fx);
        void ouvrirGardes(`j=${journal.id}`).then((j) => {
        if (!j) void lancer(c, fx);
      });
      } else if (cible) afficher(cible);
      else if (prerempli?.marque && prerempli.modele) {
        setChoix(prerempli);
        void lancer(prerempli, VIDE);
      } else {
        const dernier = [...initiales].filter((r) => r.active).sort((x, y) => y.derniere_le.localeCompare(x.derniere_le))[0];
        if (dernier && !nouvelleRecherche) afficher(dernier);
      }
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- une seule fois, à l'arrivée sur la page
  }, []);

  // suivi de la collecte : toutes les 15 s ; à la fin, la recherche se relance avec les nouvelles annonces
  const suivie = collecte && (collecte.statut === "demandee" || collecte.statut === "en cours") ? collecte : null;
  useEffect(() => {
    if (!suivie) return;
    let fini = false;
    const t0 = performance.now();
    const i = setInterval(async () => {
      if (fini) return;
      if (performance.now() - t0 > 30 * 60e3) {
        fini = true;
        clearInterval(i);
        setCollecte((x) => (x ? { ...x, statut: "erreur", erreur: "La collecte prend plus de temps que prévu. Relancez la recherche dans quelques minutes." } : x));
        return;
      }
      const r = await fetch(`/api/marche/collecte?cle=${encodeURIComponent(suivie.cle)}`).catch(() => null);
      const e = r?.ok ? ((await r.json().catch(() => null)) as Collecte | null) : null;
      if (!e || fini) return;
      if (e.statut === "ok" || e.statut === "erreur") {
        fini = true;
        clearInterval(i);
        setCollecte((x) => (x ? { ...x, ...e } : x));
        if (e.statut === "erreur") return notifier({ titre: "Collecte Leboncoin interrompue", texte: e.erreur ?? "Réessayez plus tard.", ton: "warn" });
        const ici = !suivie.rid || courantRef.current === suivie.rid;
        notifier({
          titre: `Collecte terminée : ${e.n ?? 0} annonces relevées`,
          texte: ici ? "La recherche se met à jour avec les nouvelles annonces." : `${suivie.nom} : relancez la recherche pour les voir.`,
        });
        if (ici) void lancer(suivie.choix, suivie.f);
      } else setCollecte((x) => (x ? { ...x, statut: e.statut } : x));
    }, 15000);
    return () => {
      fini = true;
      clearInterval(i);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- une boucle par collecte
  }, [suivie?.cle]);

  const rechercheCourante = (courant && liste.find((x) => x.id === courant)) || res?.recherche || null;
  const avance = !!(f.version || f.phase || f.carrosserie || f.moteur || f.chMin || f.chMax || f.energie || f.boite || f.vendeur || f.anneeMax || f.prixMin || f.mots || f.exclure || f.sousCote || f.tri !== "ecart" || !f.fiables);
  const filtresCaches = !(plusFiltres || avance);

  return (
    <div className="grid gap-6">
      <nav aria-label="Mes recherches" className="grid gap-3">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {onglets.map((r) => (
            <div key={r.id} className={cx("flex shrink-0 items-center rounded-2xl border transition", courant === r.id ? "border-o/60 bg-o/12" : "border-line-2 hover:border-o/30")}>
              <button type="button" onClick={() => afficher(r)} aria-current={courant === r.id ? "true" : undefined} className="grid py-2 pl-4 pr-2 text-left">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span className="size-2 rounded-full bg-ok" aria-hidden="true" />
                  {r.nom}
                </span>
                <span className="text-xs text-ink-3">
                  {r.trouvees != null ? `${r.trouvees} annonce${r.trouvees > 1 ? "s" : ""}` : "—"}
                  {r.sous_cote ? ` · ${r.sous_cote} sous la cote` : ""}
                </span>
              </button>
              <button type="button" onClick={() => fermer(r)} aria-label={`Fermer la recherche ${r.nom} (elle reste dans l'historique)`} title="Fermer (reste dans l'historique)" className="mr-1.5 grid size-7 place-items-center rounded-full text-ink-3 hover:bg-glass hover:text-ink">
                ✕
              </button>
            </div>
          ))}
          <button type="button" onClick={nouvelle} aria-current={courant === null ? "true" : undefined} className={cx("shrink-0 rounded-2xl border border-dashed px-4 py-2 text-sm", courant === null ? "border-o/60 text-ink" : "border-line-2 text-ink-2 hover:text-ink")}>
            + Nouvelle recherche
          </button>
          <Link href="/app/recherche?vue=historique" className="flex shrink-0 items-center gap-2 rounded-2xl border border-line-2 px-4 py-2 text-sm text-ink-2 hover:border-o/30 hover:text-ink">
            <Ico nom="historique" className="size-4" /> Historique
          </Link>
        </div>
        {anciennes.length > 0 && (
          <p className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
            Rouvrir :
            {anciennes.map((r) => (
              <button key={r.id} type="button" onClick={() => rouvrir(r)} className="rounded-full border border-line px-2.5 py-1 text-ink-2 hover:border-o/40 hover:text-ink">
                {r.nom} <span className="text-ink-3" suppressHydrationWarning>· {quandRecherche(r.derniere_le)}</span>
              </button>
            ))}
          </p>
        )}
      </nav>

      {!filtresOuverts && (
        <button type="button" onClick={() => setFiltresOuverts(true)} aria-expanded={false} aria-controls="rm-filtres" className="carte flex items-center justify-between gap-3 p-4 text-left sm:hidden">
          <span className="min-w-0">
            <span className="block text-xs text-ink-3">Critères</span>
            <span className="block truncate text-sm font-medium">
              {[cat.find((b) => b.k === choix.marque)?.n, cat.find((b) => b.k === choix.marque)?.m.find((m) => m.k === choix.modele)?.n, resumeFiltres(f)].filter(Boolean).join(" · ") || "Choisir une voiture"}
            </span>
          </span>
          <span className="shrink-0 text-sm font-semibold text-o2">Modifier</span>
        </button>
      )}
      <form id="rm-filtres" onSubmit={chercher} className={cx("carte grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3", !filtresOuverts && "max-sm:hidden")}>
        <ChoixVehicule
          cat={cat}
          v={choix}
          onChange={(c) => {
            if (c.gen !== choix.gen || c.modele !== choix.modele) setF((x) => ({ ...x, version: "", phase: "", ...(c.modele !== choix.modele ? { moteur: "" } : {}) }));
            setChoix(c);
          }}
          idPrefixe="rm"
        />
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Prix max. (€)</span>
          <input inputMode="numeric" value={f.prixMax} onChange={maj("prixMax")} placeholder="ex. 9 000" className={inputCls} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Kilométrage max.</span>
          <input inputMode="numeric" value={f.kmMax} onChange={maj("kmMax")} placeholder="150000" className={inputCls} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Année min.</span>
          <input inputMode="numeric" value={f.anneeMin} onChange={maj("anneeMin")} placeholder="2010" className={inputCls} />
        </label>
        {!avance && (
          <button type="button" onClick={() => setPlusFiltres((v) => !v)} aria-expanded={plusFiltres} aria-controls="rm-plus" className="flex items-center gap-2 self-end pb-2.5 text-sm font-medium text-o2 underline-offset-4 hover:underline sm:col-span-2 lg:col-span-3">
            {plusFiltres ? "Moins de filtres" : "Plus de filtres"} <span aria-hidden="true">{plusFiltres ? "▴" : "▾"}</span>
            <span className="font-normal text-ink-3">version, motorisation, puissance, énergie, boîte, vendeur, sous la cote…</span>
          </button>
        )}
        <div id="rm-plus" className={filtresCaches ? "hidden" : "contents"}>
        {genCat?.v ? (
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Version, carrosserie</span>
            <select value={f.version} onChange={maj("version")} className={inputCls}>
              <option value="">Toutes les versions</option>
              {genCat.v.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.l} ({v.y0} – {v.y1})
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Carrosserie</span>
            <select value={f.carrosserie} onChange={maj("carrosserie")} className={inputCls}>
              <option value="">Toutes</option>
              {CARROSSERIES.map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Phase</span>
          <select value={f.phase} onChange={maj("phase")} disabled={!genCat?.ph} className={inputCls}>
            <option value="">{genCat?.ph ? "Toutes" : genCat ? "Pas de restylage distingué" : "Génération d'abord"}</option>
            {genCat?.ph?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.l}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Motorisation</span>
          <input value={f.moteur} onChange={maj("moteur")} list="rm-moteurs" placeholder={suggestionsMoteur.slice(0, 3).join(", ") || "ex. 1.5 dCi, 320d"} className={inputCls} />
          <datalist id="rm-moteurs">
            {suggestionsMoteur.map((x) => (
              <option key={x} value={x} />
            ))}
          </datalist>
        </label>
        <fieldset className="grid gap-1.5 text-sm">
          <legend className="mb-1.5 text-ink-2">Puissance (ch)</legend>
          <div className="grid grid-cols-2 gap-3">
            <input inputMode="numeric" value={f.chMin} onChange={maj("chMin")} placeholder="min. ex. 150" aria-label="Puissance minimum (ch)" className={inputCls} />
            <input inputMode="numeric" value={f.chMax} onChange={maj("chMax")} placeholder="max." aria-label="Puissance maximum (ch)" className={inputCls} />
          </div>
        </fieldset>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Énergie</span>
          <select value={f.energie} onChange={maj("energie")} className={inputCls}>
            <option value="">Toutes</option>
            <option value="essence">Essence</option>
            <option value="diesel">Diesel</option>
            <option value="hybride">Hybride</option>
            <option value="electrique">Électrique</option>
            <option value="gpl">GPL</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Boîte</span>
          <select value={f.boite} onChange={maj("boite")} className={inputCls}>
            <option value="">Toutes</option>
            <option value="manuelle">Manuelle</option>
            <option value="auto">Automatique</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Vendeur</span>
          <select value={f.vendeur} onChange={maj("vendeur")} className={inputCls}>
            <option value="">Tous</option>
            <option value="particulier">Particuliers</option>
            <option value="pro">Professionnels</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Année max.</span>
            <input inputMode="numeric" value={f.anneeMax} onChange={maj("anneeMax")} placeholder="2016" className={inputCls} />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Prix min. (€)</span>
            <input inputMode="numeric" value={f.prixMin} onChange={maj("prixMin")} className={inputCls} />
          </label>
        </div>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Moteur, finition, mots-clés</span>
          <input value={f.mots} onChange={maj("mots")} placeholder="ex. 1.2 tce, intens" className={inputCls} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Exclure les mots</span>
          <input value={f.exclure} onChange={maj("exclure")} placeholder="ex. société, utilitaire" className={inputCls} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Sous la cote d&apos;au moins (%)</span>
          <input inputMode="numeric" value={f.sousCote} onChange={maj("sousCote")} placeholder="ex. 10" className={inputCls} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Trier par</span>
          <select value={f.tri} onChange={maj("tri")} className={inputCls}>
            <option value="ecart">Les plus sous la cote</option>
            <option value="prix">Prix croissant</option>
            <option value="km">Kilométrage croissant</option>
            <option value="annee">Les plus récentes</option>
            <option value="recent">Vues en dernier</option>
          </select>
        </label>
        <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-ink-2">
          <input type="checkbox" checked={f.fiables} onChange={maj("fiables")} className="size-4 accent-[#ff5a1f]" /> Masquer les pièges (pour pièces, moteur HS, prix suspects…)
        </label>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-3">
          <button type="submit" disabled={charge} className="btn btn-o btn-sm">
            {charge ? "Recherche…" : "Rechercher"}
          </button>
          <button type="button" className="btn btn-sm" onClick={nouvelle}>
            Nouvelle recherche
          </button>
          {alertes && rechercheCourante && <InterrupteurAlerte key={rechercheCourante.id} r={rechercheCourante} actif={!!(rechercheCourante.alerte_id && etatsAlertes[rechercheCourante.alerte_id])} cat={cat} />}
          <p className="text-sm text-ink-3" role="status">{etat}</p>
        </div>
      </form>

      {ouverture && !charge && (
        <p role="status" className="carte flex items-center gap-3 p-4 text-sm text-ink-2">
          <span className="size-4 animate-spin rounded-full border-2 border-o/30 border-t-o" aria-hidden="true" /> Ouverture des résultats gardés…
        </p>
      )}
      {charge && <PatienceRecherche id="rm-attente" nom={choix.modele ? (cat.find((b) => b.k === choix.marque)?.m.find((m) => m.k === choix.modele)?.n ?? "") : ""} />}
      {notification}

      {collecte && !charge && <BandeauCollecte c={collecte} base={res?.base ?? 0} />}

      {res && !charge && (
        <section aria-labelledby="rm-res" className="grid scroll-mt-24 gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="rm-res" className="font-display text-xl font-semibold">
              {res.trouvees} annonce{res.trouvees > 1 ? "s" : ""} · {res.recherche?.nom ?? res.modele.nom}
              {resumeFiltres(f) && <span className="block text-sm font-normal text-ink-3">{resumeFiltres(f)}</span>}
            </h2>
            <p className="text-sm text-ink-3">
              {res.total} annonces de ce modèle en base · {res.sousLaCote} à 5 % ou plus sous la cote
            </p>
          </div>
          {res.journal && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line px-4 py-2.5 text-sm">
              <span className="text-ink-2" suppressHydrationWarning>
                Résultats gardés du <b className="text-ink">{new Date(res.journal.le).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</b> : rouvrir la recherche ne refait aucune requête.
              </span>
              <button type="button" onClick={() => void lancer(choix, f)} className="btn btn-sm min-h-9 px-4">
                Actualiser
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2 text-xs">
            {res.modele.gens.filter((g) => g.n).map((g) => (
              <button key={g.id} type="button" onClick={() => { setChoix((c) => ({ ...c, gen: c.gen === g.id ? "" : g.id })); }}
                className={cx("rounded-full border px-3 py-1", choix.gen === g.id ? "border-o/60 bg-o/12 text-ink" : "border-line-2 text-ink-2")}>
                {g.label} <span className="num text-ink-3">{g.n}</span>
              </button>
            ))}
            {res.modele.incertaines > 0 && <span className="rounded-full border border-line px-3 py-1 text-ink-3">génération incertaine {res.modele.incertaines}</span>}
          </div>
          {(res.versions.some((v) => v.n) || res.moteurs.length > 0) && (
            <div className="grid gap-2 text-xs">
              {res.versions.some((v) => v.n) && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-ink-3">Versions :</span>
                  {res.versions.filter((v) => v.n).map((v) => (
                    <button key={v.id} type="button" onClick={() => affiner({ version: f.version === v.id ? "" : v.id })} aria-pressed={f.version === v.id}
                      className={cx("rounded-full border px-3 py-1", f.version === v.id ? "border-o/60 bg-o/12 text-ink" : "border-line-2 text-ink-2")}>
                      {v.label} <span className="num text-ink-3">{v.n}</span>
                    </button>
                  ))}
                </div>
              )}
              {res.moteurs.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-ink-3">Motorisations :</span>
                  {res.moteurs.filter((m) => m.n >= 3 || f.moteur === m.l).slice(0, 12).map((m) => (
                    <button key={m.l} type="button" onClick={() => affiner({ moteur: f.moteur === m.l ? "" : m.l })} aria-pressed={f.moteur === m.l}
                      title={m.deduits ? `${m.n - m.deduits} écrites dans l'annonce, ${m.deduits} reconnues à leur puissance` : undefined}
                      className={cx("rounded-full border px-3 py-1", f.moteur === m.l ? "border-o/60 bg-o/12 text-ink" : "border-line-2 text-ink-2")}>
                      {m.l}{m.ch ? <span className="text-ink-3"> · {m.ch} ch</span> : null} <span className="num text-ink-3">{m.n}</span>
                    </button>
                  ))}
                </div>
              )}
              <p className="text-ink-3">
                Touchez une pastille pour filtrer. Motorisation : écrite dans l&apos;annonce ou dans la version Leboncoin, sinon reconnue à sa puissance et son énergie.
              </p>
            </div>
          )}
          {!!res.incertaines && (
            <p className="rounded-2xl border border-warn/30 bg-warn/5 px-4 py-2.5 text-sm text-ink-2">
              {res.incertaines} annonce{res.incertaines > 1 ? "s" : ""} de cette période ne disent pas leur génération (années de transition) : elles sont gardées d&apos;après leur année, comme sur Leboncoin, marquées « à vérifier », et ne comptent pas comme bonnes affaires.
            </p>
          )}
          {res.annonces.length ? (
            <ul className="grid gap-3">
              {res.annonces.map((a) => <LigneAnnonce key={a.id} a={a} fav={favs.has(cleFavori(a.url, `marche:${a.id}`))} onFav={(on) => (on ? favs.add(cleFavori(a.url, `marche:${a.id}`)) : favs.delete(cleFavori(a.url, `marche:${a.id}`)))} />)}
            </ul>
          ) : (
            <p className="carte p-6 text-ink-2">
              {suivie ? "Aucune annonce en base pour l'instant : la collecte Leboncoin est en cours, les résultats s'afficheront seuls." : "Aucune annonce ne correspond. Élargissez les années, le prix, le kilométrage ou la puissance."}
            </p>
          )}
          {res.trouvees > res.annonces.length && <p className="text-sm text-ink-3">Les 300 premières sont affichées : affinez les filtres pour voir les autres.</p>}
          <p className="text-xs text-ink-3">
            Cote : régression de l&apos;outil Garage sur les annonces de la même génération et de la même énergie (âge, kilométrage, boîte, version, puissance, équipements), annonces aberrantes écartées. Ce sont des prix demandés, pas des prix de vente.
          </p>
        </section>
      )}
    </div>
  );
}

function LigneAnnonce({ a, fav, onFav }: { a: Annonce; fav: boolean; onFav: (on: boolean) => void }) {
  const c = a.cote;
  const bon = c?.pct != null && c.pct >= 0.05, cher = c?.pct != null && c.pct <= -0.05;
  return (
    <li className="carte grid gap-3 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:items-center">
      {a.photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- vignette servie par Leboncoin
        <img src={a.photo} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-20 w-28 rounded-xl border border-line object-cover max-sm:h-40 max-sm:w-full" />
      ) : (
        <span className="hidden h-20 w-28 place-items-center rounded-xl border border-dashed border-line-2 text-xs text-ink-3 sm:grid">sans photo</span>
      )}
      <div className="min-w-0">
        <p className="truncate font-medium">{a.titre || "Annonce"}</p>
        <p className="mt-0.5 text-sm text-ink-3">
          {[a.annee, a.km != null ? `${a.km.toLocaleString("fr-FR")} km` : null].filter(Boolean).join(" · ")}
          {a.moteur && <span title={a.moteurDeduit ? "Reconnue à sa puissance et son énergie (pas écrite dans l'annonce)" : undefined}> · {a.moteurDeduit ? "≈ " : ""}{a.moteur}</span>}
          {[a.ch ? `${a.ch} ch` : null, a.energie, a.boite].filter(Boolean).map((x) => ` · ${x}`).join("")}
          {(a.version ?? a.genLabel) && (
            <span title={a.doute ? "Génération d'après l'année seulement : vérifiez-la (carte grise, photos)" : a.genPar === "puissance" ? "Génération reconnue à sa puissance (année de transition)" : undefined} className={a.doute ? "text-warn" : undefined}>
              {" · "}{a.version ?? a.genLabel}{a.doute ? " (à vérifier)" : ""}
            </span>
          )}
        </p>
        {a.lbcVersion && <p className="truncate text-xs text-ink-3" title="Version indiquée sur Leboncoin">Version Leboncoin : {a.lbcVersion}</p>}
        <p className="text-xs text-ink-3">
          {[a.lieu, a.pro ? "professionnel" : "particulier", a.vu ? `vue le ${new Date(a.vu).toLocaleDateString("fr-FR")}` : null].filter(Boolean).join(" · ")}
          {a.piege && <span className="ml-2 text-bad">{a.suspect ? "prix suspect (pièces, location, acompte ?)" : "piège possible"}</span>}
        </p>
      </div>
      <div className="flex items-baseline gap-4 sm:block sm:text-right">
        <p className="num font-display text-xl font-semibold">{eur(a.prix)}</p>
        <p className="text-xs text-ink-3">{c ? `cote ${eur(c.P)}` : "pas de cote"}</p>
        {a.lbc && <p className="text-xs text-ink-3" title="Estimation affichée par Leboncoin sur l'annonce">Leboncoin : {eur(a.lbc.min)} – {eur(a.lbc.max)}{a.lbc.pos ? ` · ${a.lbc.pos}` : ""}</p>}
      </div>
      <div className="flex items-center justify-between gap-3 sm:block sm:min-w-36 sm:text-right">
        {c && c.ecart != null ? (
          <div>
            <p className={cx("num font-semibold", bon ? "text-ok" : cher ? "text-bad" : "text-ink-2")}>
              {c.ecart >= 0 ? `${eur(c.ecart)} sous` : `${eur(-c.ecart)} au-dessus`}
            </p>
            <p className="text-xs text-ink-3">
              {Math.round(Math.abs(c.pct ?? 0) * 100)} % · confiance {c.conf}
              {c.moinsCherQue != null ? ` · moins chère que ${c.moinsCherQue} %` : ""}
            </p>
          </div>
        ) : (
          <p className="text-xs text-ink-3">{a.gen ? "pas assez de comparables" : "génération incertaine"}</p>
        )}
        <div className="mt-2 flex items-center gap-2 sm:justify-end">
          <BoutonFavori
            compact
            initial={fav}
            onChange={onFav}
            f={{ cle: cleFavori(a.url, `marche:${a.id}`), titre: a.titre || "Annonce", prix: a.prix, annee: a.annee, km: a.km, energie: a.energie, boite: a.boite, lieu: a.lieu, url: a.url, photo: null, source: "recherche", cote: c ? { P: c.P ?? null, ecart: c.ecart ?? null, pct: c.pct ?? null } : null }}
          />
          <BoutonAnalyserAnnonce url={a.url} />
          {a.url && (
            <a href={a.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
              Ouvrir
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

/** Collecte Leboncoin lancée par la recherche : où elle en est, et ce qui se passera ensuite. */
function BandeauCollecte({ c, base }: { c: Collecte; base: number }) {
  const enCours = c.statut === "demandee" || c.statut === "en cours";
  return (
    <section role="status" aria-live="polite" className={cx("carte grid gap-1.5 p-4 sm:p-5", enCours ? "border-o/40" : c.statut === "ok" ? "border-ok/40" : "border-warn/40")}>
      <p className="flex items-center gap-2.5 font-semibold">
        {enCours ? <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-o/30 border-t-o" aria-hidden="true" /> : <span aria-hidden="true" className={c.statut === "ok" ? "text-ok" : "text-warn"}>{c.statut === "ok" ? "✓" : "!"}</span>}
        {enCours ? `Collecte Leboncoin en cours : ${c.nom}` : c.statut === "ok" ? `Collecte terminée : ${c.n ?? 0} annonces ajoutées à la base` : c.statut === "quota" ? "Collecte non lancée" : "Collecte interrompue"}
      </p>
      <p className="text-sm text-ink-2">
        {enCours
          ? `La base n'avait que ${base} annonce${base > 1 ? "s" : ""} de cette génération : jusqu'à 1 000 annonces sont relevées sur Leboncoin (3 à 10 minutes). La recherche se relance toute seule à la fin, et une notification s'affiche.`
          : c.erreur ?? "Les résultats ci-dessous incluent les nouvelles annonces."}
      </p>
    </section>
  );
}

const ETAPES_RECHERCHE: [string, number][] = [
  ["Lecture des annonces du modèle dans la base du marché", 0],
  ["Classement par génération, énergie et boîte", 0.8],
  ["Calcul de la cote de chaque annonce (âge, kilométrage, version)", 1.8],
  ["Repérage des bonnes affaires et des pièges", 3.5],
];

/** Attente de la recherche : étapes qui avancent, barre de progression et emplacements des résultats. */
function PatienceRecherche({ nom, id }: { nom: string; id: string }) {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    const t0 = performance.now(); // l'attente commence à l'affichage du loader
    const i = setInterval(() => setSec((performance.now() - t0) / 1000), 200);
    return () => clearInterval(i);
  }, []);
  const actuelle = ETAPES_RECHERCHE.reduce((k, [, t], i) => (sec >= t ? i : k), 0);
  const pct = Math.min(94, Math.round((1 - Math.exp(-sec / 2.5)) * 100));
  return (
    <section id={id} className="carte grid scroll-mt-20 gap-4 p-5 sm:p-6" role="status" aria-live="polite" aria-label="Recherche en cours">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-lg font-semibold">Recherche en cours{nom ? ` : ${nom}` : ""}…</p>
        <span className="num text-sm text-ink-3">{Math.floor(sec)} s</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className="h-full rounded-full bg-gradient-to-r from-o to-o2 transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
      <ol className="grid gap-1.5 text-sm">
        {ETAPES_RECHERCHE.map(([l], i) => (
          <li key={l} className={cx("flex items-center gap-2.5", i < actuelle ? "text-ink-3" : i === actuelle ? "text-ink" : "text-ink-3/60")}>
            {i < actuelle ? (
              <span className="grid size-5 place-items-center rounded-full bg-ok/20 text-[11px] text-ok" aria-hidden="true">✓</span>
            ) : i === actuelle ? (
              <span className="size-5 animate-spin rounded-full border-2 border-o/30 border-t-o" aria-hidden="true" />
            ) : (
              <span className="size-5 rounded-full border border-line-2" aria-hidden="true" />
            )}
            {l}
          </li>
        ))}
      </ol>
      <p className="text-xs text-ink-3">Quelques secondes. Une notification s&apos;affiche en haut de l&apos;écran quand c&apos;est prêt : vous pouvez ouvrir un autre onglet en attendant.</p>
      <ul className="grid gap-2" aria-hidden="true">
        {[0, 1, 2].map((k) => (
          <li key={k} className="grid animate-pulse grid-cols-[1fr_auto] gap-3 rounded-2xl border border-line p-4">
            <span className="grid gap-2">
              <span className="h-3.5 w-3/5 rounded bg-line" />
              <span className="h-3 w-2/5 rounded bg-line/70" />
            </span>
            <span className="h-5 w-20 rounded bg-line" />
          </li>
        ))}
      </ul>
    </section>
  );
}
