"use client";
import { useEffect, useRef, useState } from "react";
import { FicheAnnonce, type FicheData } from "@/components/espace/FicheAnnonce";
import { cleFavori } from "@/lib/favoris";
import { BoutonFavori } from "../espace/BoutonFavori";
import { useNotification } from "../espace/Notification";
import { cx, inputCls } from "@/lib/cx";
import type { CatMarque } from "@/lib/vehicules/types";
import { ChoixVehicule, type Choix } from "./ChoixVehicule";

/* Alertes e-mail : une recherche Leboncoin suivie automatiquement, à la fréquence choisie ;
   les nouvelles annonces arrivent par e-mail (ou pas), avec leur écart à la cote, éventuellement seulement les bonnes affaires. */

export type Formulaire = {
  marque: string; modele: string; gen: string; energie: string; boite: string; anneeMin: string; anneeMax: string; prixMin: string; prixMax: string;
  kmMax: string; vendeur: string; mots: string; exclure: string; sousCote: string;
  /** version (carrosserie, code châssis), motorisation et ses puissances Leboncoin (« 218 » ou « 129,143 »), puissance DIN */
  version?: string; moteur?: string; moteurCh?: string; chMin?: string; chMax?: string;
};
type AnnonceAlerte = { id: string; url: string | null; titre: string; prix: number | null; annee: number | null; km: number | null; energie: string | null; boite: string | null; ville: string | null; cp: string | null; vendeur_type: string | null; vignette: boolean | string | null; vu: string | null };
/** Vignette servie à part (la liste des alertes ne transporte plus les images). */
const vignette = (x: AnnonceAlerte) => (x.vignette ? `/api/alertes/vignette?id=${encodeURIComponent(x.id)}` : null);
export type Alerte = {
  id: string; nom: string; actif: boolean; notifier: boolean; email: string | null; intervalle_min: number; filtres: Record<string, unknown> & { utp?: { site?: Formulaire; sous_cote?: number } };
  derniere_execution: string | null; derniere_erreur: string | null; derniers_nouveaux: number | null; en_cours: boolean; created_at: string; passages: number; mails: number; annonces: AnnonceAlerte[];
  collecte_faite?: boolean; dernier_lu?: number | null; dernier_initial?: boolean;
};

const FREQUENCES = [[60, "Toutes les heures"], [120, "Toutes les 2 heures"], [180, "Toutes les 3 heures"], [240, "Toutes les 4 heures"], [360, "Toutes les 6 heures"], [480, "Toutes les 8 heures"], [720, "Toutes les 12 heures"], [1440, "Une fois par jour"]] as const;
const FUEL: Record<string, string[]> = { essence: ["1"], diesel: ["2"], electrique: ["4"], hybride: ["6", "8"] };
// carrosseries que Leboncoin sait filtrer (critère « Type de véhicule »)
const TYPE_LBC: Record<string, string> = { break: "break", coupe: "coupe", cabriolet: "cabriolet", monospace: "monospace" };
const PIEGES = "pour pieces|epave|non roulant|ne demarre pas|moteur hs|moteur casse|boite hs|export";
const VIDE: Formulaire = { marque: "", modele: "", gen: "", energie: "", boite: "", anneeMin: "", anneeMax: "", prixMin: "", prixMax: "", kmMax: "", vendeur: "particulier", mots: "", exclure: "", sousCote: "", version: "", moteur: "", moteurCh: "", chMin: "", chMax: "" };
const n = (s: string) => (s.trim() && /^\d+$/.test(s.replace(/\s/g, "")) ? Number(s.replace(/\s/g, "")) : undefined);
const eur = (v: number | null | undefined) => (v == null ? "—" : `${Math.round(v).toLocaleString("fr-FR")} €`);
const flat = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const echap = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const freqTxt = (m: number) => FREQUENCES.find(([v]) => v === m)?.[1] ?? `Toutes les ${Math.round(m / 60)} h`;
const quand = (d: string | null) => (d ? new Date(d).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "jamais");

/** Filtres au format de l'acteur Leboncoin : uniquement des critères Leboncoin (marque, modèle, années de la génération,
    énergie, boîte, type de véhicule, puissance DIN), pas de mots-clés qui feraient rater les annonces qui ne les écrivent pas. */
export function versFiltres(f: Formulaire, cat: CatMarque[]) {
  const b = cat.find((x) => x.k === f.marque);
  const m = b?.m.find((x) => x.k === f.modele);
  const g = m?.g.find((x) => x.id === f.gen);
  const v = g?.v?.find((x) => x.id === f.version);
  const out: Record<string, unknown> = {};
  const avance: Record<string, unknown> = {}; // critères Leboncoin sans champ dédié dans l'acteur
  if (b?.lbc) out.vehicle_brand = b.lbc;
  if (m?.lbc) out.vehicle_model = m.lbc;
  const mots = [m && !m.lbc ? m.n : "", f.mots].filter(Boolean).join(" ").trim();
  if (mots) out.text = mots;
  // la génération (ou la version) = ses dates, Leboncoin ne connaît pas les générations
  const y0 = n(f.anneeMin) ?? v?.y0 ?? g?.y0, y1 = n(f.anneeMax) ?? v?.y1 ?? g?.y1;
  if (y0) out.year_min = y0;
  if (y1) out.year_max = y1;
  if (n(f.prixMin) != null) out.price_min = n(f.prixMin);
  if (n(f.prixMax) != null) out.price_max = n(f.prixMax);
  if (n(f.kmMax) != null) out.mileage_max = n(f.kmMax);
  if (FUEL[f.energie]) out.fuel = FUEL[f.energie];
  if (f.energie === "gpl") avance.fuel = ["3"];
  if (f.boite) out.gearbox = [f.boite === "auto" ? "2" : "1"];
  if (v && TYPE_LBC[v.b]) out.vehicle_type = [TYPE_LBC[v.b]];
  // motorisation → puissance DIN Leboncoin (325i = 218 ch) ; une puissance saisie l'emporte
  const pw = (f.moteurCh ?? "").split(",").map(Number).filter((x) => x > 0);
  const chMin = n(f.chMin ?? "") ?? (pw.length ? Math.min(...pw) - 3 : undefined);
  const chMax = n(f.chMax ?? "") ?? (pw.length ? Math.max(...pw) + 3 : undefined);
  if (chMin != null || chMax != null) avance.horse_power_din = { ...(chMin != null ? { min: chMin } : {}), ...(chMax != null ? { max: chMax } : {}) };
  if (Object.keys(avance).length) out.filters = avance;
  out.owner_type = f.vendeur === "pro" ? "pro" : f.vendeur === "tous" ? "all" : "private";
  const exclus = flat(f.exclure).split(/[,;]+/).map((x) => x.trim()).filter((x) => x.length >= 2).map(echap);
  out.utp = {
    inclure: m?.rx ?? "",
    exclure: `\\b(${[PIEGES, ...exclus].join("|")})\\b`,
    ...(g ? { gen: `${f.marque} ${f.modele} ${g.id}` } : {}),
    ...(n(f.sousCote) ? { sous_cote: n(f.sousCote) } : {}),
    site: f,
  };
  return out;
}

function resumeCriteres(a: Alerte, cat: CatMarque[]) {
  const f = a.filtres?.utp?.site;
  if (!f) return "Recherche créée dans l'outil Garage";
  const b = cat.find((x) => x.k === f.marque);
  const m = b?.m.find((x) => x.k === f.modele);
  const g = m?.g.find((x) => x.id === f.gen);
  const v = g?.v?.find((x) => x.id === f.version);
  return [
    [b?.n, g?.l ?? m?.n, v?.l].filter(Boolean).join(" "),
    f.moteur, f.chMin || f.chMax ? `${f.chMin || "…"} – ${f.chMax || "…"} ch` : "",
    f.energie, f.boite === "auto" ? "automatique" : f.boite,
    f.anneeMin || f.anneeMax ? `${f.anneeMin || "…"} – ${f.anneeMax || "…"}` : "",
    f.prixMax ? `≤ ${eur(Number(f.prixMax))}` : "", f.kmMax ? `≤ ${Number(f.kmMax).toLocaleString("fr-FR")} km` : "",
    f.vendeur === "pro" ? "pros" : f.vendeur === "tous" ? "tous vendeurs" : "particuliers",
    f.mots ? `« ${f.mots} »` : "", f.sousCote ? `${f.sousCote} % sous la cote` : "",
  ].filter(Boolean).join(" · ");
}

async function appel(corps: unknown) {
  const r = await fetch("/api/alertes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps) });
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(j?.erreur ?? "Action impossible. Réessayez.");
  return j as { alertes: Alerte[]; id?: string };
}

/** `max` : alertes autorisées par la formule ; `freqMin` : intervalle minimal entre deux passages (minutes). */
export function Alertes({ cat, initiales, prerempli, email, max = 20, freqMin = 60, favoris = [] }: { cat: CatMarque[]; initiales: Alerte[]; prerempli: Formulaire | null; email: string; max?: number; freqMin?: number; favoris?: string[] }) {
  const [liste, setListe] = useState(initiales);
  const [favs] = useState(() => new Set(favoris));
  const { notifier, element: notification } = useNotification();
  // passages suivis jusqu'à leur fin : id de l'alerte → dernier passage connu au moment du lancement
  const [suivis, setSuivis] = useState<Record<string, { prev: string | null; t0?: number }>>(() => Object.fromEntries(initiales.filter((a) => a.en_cours).map((a) => [a.id, { prev: null }])));
  const limite = useRef(new Map<string, number>()); // fin de suivi au bout de 6 min (lu seulement dans le minuteur)
  const plein = liste.length >= max;
  const [edition, setEdition] = useState<{ id?: string; f: Formulaire; nom: string; notifier: boolean; email: string; intervalle: number; actif: boolean } | null>(
    prerempli && initiales.length < max ? { f: prerempli, nom: "", notifier: true, email, intervalle: freqMin, actif: true } : null,
  );
  const [etat, setEtat] = useState("");
  const [occupe, setOccupe] = useState(false);
  const [ouverte, setOuverte] = useState<string | null>(null);
  const [aConfirmer, setAConfirmer] = useState<string | null>(null);
  const [fiche, setFiche] = useState<{ liste: AnnonceAlerte[]; i: number } | null>(null);

  async function faire(corps: unknown, ok?: string) {
    setOccupe(true);
    setEtat("");
    try {
      const j = await appel(corps);
      setListe(j.alertes);
      if (ok) setEtat(ok);
      return true;
    } catch (e) {
      setEtat((e as Error).message);
      return false;
    } finally {
      setOccupe(false);
    }
  }

  // Suit les passages lancés : la liste est relue toutes les 5 s jusqu'à la fin, puis une notification l'annonce.
  useEffect(() => {
    const ids = Object.keys(suivis);
    if (!ids.length) return;
    const t = setInterval(async () => {
      let j: { alertes: Alerte[] };
      try {
        j = await appel({ action: "liste" });
      } catch {
        return;
      }
      setListe(j.alertes);
      const finis: string[] = [];
      for (const id of ids) {
        const a = j.alertes.find((x) => x.id === id);
        if (!a) { finis.push(id); continue; }
        // collecte complète plus longue : 15 min avant d'abandonner le suivi, 6 min sinon
        if (!limite.current.has(id)) limite.current.set(id, Date.now() + (a.collecte_faite ? 6 : 15) * 60000);
        const trop = Date.now() > limite.current.get(id)!;
        const relance = /Nouvel essai/.test(a.derniere_erreur ?? "");
        const fini = !a.en_cours && !relance && a.derniere_execution !== suivis[id].prev && a.derniere_execution != null;
        if (!fini && !trop) continue;
        finis.push(id);
        if (a.derniere_erreur || trop)
          notifier({ titre: `Alerte « ${a.nom} » : recherche interrompue`, texte: trop ? "Leboncoin met du temps à répondre : le prochain passage prendra le relais." : a.derniere_erreur ?? "", ton: "warn" });
        else if (a.dernier_initial)
          notifier({
            titre: `Alerte « ${a.nom} » : collecte complète terminée`,
            texte: `${a.dernier_lu ?? a.derniers_nouveaux ?? 0} annonces correspondent à vos critères. Les prochains passages ne liront que les nouvelles.`,
            action: a.annonces.length ? { l: "Voir les annonces", onClick: () => { setOuverte(a.id); document.getElementById(`al-${a.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); } } : undefined,
          });
        else
          notifier({
            titre: `Alerte « ${a.nom} » : recherche terminée`,
            texte: a.derniers_nouveaux ? `${a.derniers_nouveaux} nouvelle${a.derniers_nouveaux > 1 ? "s" : ""} annonce${a.derniers_nouveaux > 1 ? "s" : ""} trouvée${a.derniers_nouveaux > 1 ? "s" : ""}.` : "Aucune nouvelle annonce depuis le dernier passage.",
            action: a.annonces.length ? { l: "Voir les annonces", onClick: () => { setOuverte(a.id); document.getElementById(`al-${a.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); } } : undefined,
          });
      }
      if (finis.length) {
        finis.forEach((k) => limite.current.delete(k));
        setSuivis((s) => Object.fromEntries(Object.entries(s).filter(([k]) => !finis.includes(k))));
      }
    }, 5000);
    return () => clearInterval(t);
  }, [suivis, notifier]);

  async function lancer(a: Alerte) {
    const ok = await faire({ action: "lancer", id: a.id });
    if (!ok) return;
    setSuivis((s) => ({ ...s, [a.id]: { prev: a.derniere_execution, t0: Date.now() } }));
  }

  function nouvelle() {
    setEdition({ f: VIDE, nom: "", notifier: true, email, intervalle: freqMin, actif: true });
    setEtat("");
  }
  function modifier(a: Alerte) {
    setEdition({ id: a.id, f: { ...VIDE, ...(a.filtres?.utp?.site ?? {}) }, nom: a.nom, notifier: a.notifier, email: a.email ?? email, intervalle: a.intervalle_min, actif: a.actif });
    setEtat("");
    requestAnimationFrame(() => document.getElementById("al-form")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    if (!edition) return;
    const { f } = edition;
    if (!f.marque || !f.modele) return setEtat("Choisissez au moins la marque et le modèle.");
    const b = cat.find((x) => x.k === f.marque), m = b?.m.find((x) => x.k === f.modele), g = m?.g.find((x) => x.id === f.gen);
    const nom = edition.nom.trim() || [b?.n, g?.l ?? m?.n].filter(Boolean).join(" ");
    const ok = await faire(
      { action: "enregistrer", alerte: { id: edition.id, nom, actif: edition.actif, notifier: edition.notifier, email: edition.email.trim() || undefined, intervalle_min: edition.intervalle, filtres: versFiltres(f, cat) } },
      edition.id
        ? "Alerte modifiée : le prochain passage relit toutes les annonces qui correspondent aux nouveaux critères, puis seulement les nouvelles."
        : "Alerte créée : le premier passage (dans le quart d'heure) lit toutes les annonces qui correspondent, sans e-mail ; ensuite, seulement les nouvelles.",
    );
    if (ok) setEdition(null);
  }

  const majF = (k: keyof Formulaire) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setEdition((x) => (x ? { ...x, f: { ...x.f, [k]: e.target.value } } : x));

  return (
    <div className="grid gap-6">
      {notification}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={nouvelle} disabled={plein} className="btn btn-o btn-sm">Nouvelle alerte</button>
        <span className="num text-sm text-ink-3">{liste.length} / {max} alerte{max > 1 ? "s" : ""}{plein ? " : supprimez-en une pour en créer une autre" : ""}</span>
        <p className="text-sm text-ink-3" role="status" aria-live="polite">{etat}</p>
      </div>

      {edition && (
        <form id="al-form" onSubmit={enregistrer} className="carte grid scroll-mt-24 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <h2 className="font-display text-lg font-semibold sm:col-span-2 lg:col-span-3">{edition.id ? "Modifier l'alerte" : "Nouvelle alerte"}</h2>
          <ChoixVehicule
            cat={cat}
            v={{ marque: edition.f.marque, modele: edition.f.modele, gen: edition.f.gen }}
            onChange={(c: Choix) => setEdition((x) => (x ? { ...x, f: { ...x.f, ...c, ...(c.gen !== x.f.gen || c.modele !== x.f.modele ? { version: "", moteur: "", moteurCh: "" } : {}) } } : x))}
            idPrefixe="al"
          />
          <ChampsPrecis cat={cat} f={edition.f} onChange={(x) => setEdition((e) => (e ? { ...e, f: { ...e.f, ...x } } : e))} />
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Énergie</span>
            <select value={edition.f.energie} onChange={majF("energie")} className={inputCls}>
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
            <select value={edition.f.boite} onChange={majF("boite")} className={inputCls}>
              <option value="">Toutes</option>
              <option value="manuelle">Manuelle</option>
              <option value="auto">Automatique</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Vendeurs</span>
            <select value={edition.f.vendeur} onChange={majF("vendeur")} className={inputCls}>
              <option value="particulier">Particuliers</option>
              <option value="pro">Professionnels</option>
              <option value="tous">Tous</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm"><span className="text-ink-2">Année min.</span><input inputMode="numeric" value={edition.f.anneeMin} onChange={majF("anneeMin")} className={inputCls} /></label>
            <label className="grid gap-1.5 text-sm"><span className="text-ink-2">Année max.</span><input inputMode="numeric" value={edition.f.anneeMax} onChange={majF("anneeMax")} className={inputCls} /></label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm"><span className="text-ink-2">Prix min. (€)</span><input inputMode="numeric" value={edition.f.prixMin} onChange={majF("prixMin")} className={inputCls} /></label>
            <label className="grid gap-1.5 text-sm"><span className="text-ink-2">Prix max. (€)</span><input inputMode="numeric" value={edition.f.prixMax} onChange={majF("prixMax")} className={inputCls} /></label>
          </div>
          <label className="grid gap-1.5 text-sm"><span className="text-ink-2">Kilométrage max.</span><input inputMode="numeric" value={edition.f.kmMax} onChange={majF("kmMax")} className={inputCls} /></label>
          <label className="grid gap-1.5 text-sm"><span className="text-ink-2">Moteur, finition, mots-clés</span><input value={edition.f.mots} onChange={majF("mots")} placeholder="ex. 100 ch" className={inputCls} /></label>
          <label className="grid gap-1.5 text-sm"><span className="text-ink-2">Exclure (séparés par des virgules)</span><input value={edition.f.exclure} onChange={majF("exclure")} placeholder="ex. utilitaire, société" className={inputCls} /></label>

          <fieldset className="grid gap-3 rounded-2xl border border-line p-4 sm:col-span-2 lg:col-span-3 lg:grid-cols-3">
            <legend className="px-1 text-sm font-medium">Bonne affaire et e-mail</legend>
            <label className="grid gap-1.5 text-sm">
              <span className="text-ink-2">Seulement si sous la cote d&apos;au moins (%)</span>
              <input inputMode="numeric" value={edition.f.sousCote} onChange={majF("sousCote")} placeholder="vide = toutes les nouvelles" className={inputCls} />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-ink-2">Fréquence</span>
              <select value={edition.intervalle} onChange={(e) => setEdition((x) => (x ? { ...x, intervalle: Number(e.target.value) } : x))} className={inputCls}>
                {FREQUENCES.filter(([v]) => v >= freqMin).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-ink-2">Nom de l&apos;alerte</span>
              <input value={edition.nom} onChange={(e) => setEdition((x) => (x ? { ...x, nom: e.target.value } : x))} placeholder="facultatif" className={inputCls} />
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-2">
              <input type="checkbox" checked={edition.notifier} onChange={(e) => setEdition((x) => (x ? { ...x, notifier: e.target.checked } : x))} className="size-4 accent-[#ff5a1f]" />
              Recevoir les nouvelles annonces par e-mail
            </label>
            <label className="grid gap-1.5 text-sm lg:col-span-2">
              <span className="text-ink-2">Adresse e-mail</span>
              <input type="email" disabled={!edition.notifier} value={edition.email} onChange={(e) => setEdition((x) => (x ? { ...x, email: e.target.value } : x))} className={inputCls} />
            </label>
          </fieldset>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-3">
            <button type="submit" disabled={occupe} className="btn btn-o btn-sm">{edition.id ? "Enregistrer" : "Créer l'alerte"}</button>
            <button type="button" onClick={() => setEdition(null)} className="btn btn-sm">Annuler</button>
          </div>
        </form>
      )}

      {liste.length ? (
        <ul className="grid gap-4">
          {liste.map((a) => (
            <li key={a.id} id={`al-${a.id}`} className={cx("carte grid scroll-mt-24 gap-4 p-5", !a.actif && "opacity-80")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold">{a.nom}</p>
                  <p className="text-sm text-ink-3">{resumeCriteres(a, cat)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Interrupteur on={a.actif} label="Active" disabled={occupe} onClick={() => faire({ action: "basculer", id: a.id, actif: !a.actif, notifier: null })} />
                  <Interrupteur on={a.notifier} label="E-mail" disabled={occupe} onClick={() => faire({ action: "basculer", id: a.id, actif: null, notifier: !a.notifier })} />
                </div>
              </div>
              <div className="grid gap-1 text-sm text-ink-2 sm:grid-cols-3">
                <p>{freqTxt(a.intervalle_min)}{a.notifier && a.email ? ` · ${a.email}` : " · sans e-mail"}</p>
                <p>Dernier passage : {a.en_cours ? "en cours…" : quand(a.derniere_execution)}{a.derniers_nouveaux ? ` · ${a.derniers_nouveaux} nouvelle${a.derniers_nouveaux > 1 ? "s" : ""}` : ""}</p>
                <p>{a.passages} passage{a.passages > 1 ? "s" : ""} · {a.mails} e-mail{a.mails > 1 ? "s" : ""} envoyé{a.mails > 1 ? "s" : ""}</p>
              </div>
              <p className="text-xs text-ink-3">
                {a.collecte_faite
                  ? "Collecte complète faite : chaque passage ne lit que les annonces parues depuis le précédent."
                  : "Collecte complète au prochain passage : toutes les annonces qui correspondent (jusqu'à 300), sans e-mail."}
              </p>
              {a.id in suivis ? <PassageEnCours depart={suivis[a.id].t0} complete={!a.collecte_faite} /> : a.derniere_erreur && <p className="rounded-xl border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn">{a.derniere_erreur}</p>}
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={occupe || a.en_cours || a.id in suivis} onClick={() => lancer(a)} className="btn btn-sm">{a.id in suivis ? "Recherche en cours…" : "Chercher maintenant"}</button>
                <button type="button" onClick={() => modifier(a)} className="btn btn-sm">Modifier</button>
                <button type="button" aria-expanded={ouverte === a.id} onClick={() => setOuverte(ouverte === a.id ? null : a.id)} className="btn btn-sm">
                  Annonces trouvées ({a.annonces.length})
                </button>
                {aConfirmer === a.id ? (
                  <button type="button" onClick={() => { setAConfirmer(null); faire({ action: "retirer", id: a.id }, "Alerte supprimée."); }} className="btn btn-sm border-bad/60 text-bad">Confirmer la suppression</button>
                ) : (
                  <button type="button" onClick={() => setAConfirmer(a.id)} className="btn btn-sm text-ink-3">Supprimer</button>
                )}
              </div>
              {ouverte === a.id && (
                a.annonces.length ? (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {a.annonces.map((x, i) => (
                      <li key={x.id} className="relative flex gap-3 rounded-xl border border-line p-2 transition hover:border-o/40">
                        {x.vignette ? (
                          // eslint-disable-next-line @next/next/no-img-element -- petite vignette servie par la route des alertes
                          <img src={vignette(x)!} alt="" width={64} height={64} className="size-16 shrink-0 rounded-lg object-cover" loading="lazy" decoding="async" />
                        ) : (
                          <span className="size-16 shrink-0 rounded-lg bg-glass" aria-hidden="true" />
                        )}
                        <span className="min-w-0 flex-1 text-sm">
                          <button type="button" onClick={() => setFiche({ liste: a.annonces, i })} className="block max-w-full truncate text-left font-medium after:absolute after:inset-0 after:content-['']" aria-label={`Voir la fiche : ${x.titre}`}>{x.titre}</button>
                          <b className="num">{eur(x.prix)}</b>
                          <span className="block truncate text-xs text-ink-3">{[x.annee, x.km != null ? `${x.km.toLocaleString("fr-FR")} km` : null, x.ville, quand(x.vu)].filter(Boolean).join(" · ")}</span>
                        </span>
                        <BoutonFavori
                          compact
                          className="relative z-10 shrink-0 self-start"
                          initial={favs.has(cleFavori(x.url, `lbc:${x.id}`))}
                          onChange={(on) => (on ? favs.add(cleFavori(x.url, `lbc:${x.id}`)) : favs.delete(cleFavori(x.url, `lbc:${x.id}`)))}
                          f={{ cle: cleFavori(x.url, `lbc:${x.id}`), titre: x.titre, prix: x.prix, annee: x.annee, km: x.km, energie: x.energie, boite: x.boite, lieu: [x.ville, x.cp].filter(Boolean).join(" ") || null, url: x.url, photo: vignette(x), source: "alerte", cote: null }}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-ink-3">Aucune annonce pour l&apos;instant.</p>
                )
              )}
            </li>
          ))}
        </ul>
      ) : (
        !edition && (
          <div className="carte grid gap-2 p-6">
            <p className="font-display text-lg font-semibold">Aucune alerte</p>
            <p className="text-ink-2">Créez une alerte : Utopicar surveille Leboncoin à la fréquence choisie et vous envoie les nouvelles annonces par e-mail, avec leur écart à la cote. Vous pouvez ne recevoir que les bonnes affaires.</p>
          </div>
        )
      )}
      <FicheAnnonce
        fiches={(fiche?.liste ?? []).map((x): FicheData => ({ id: x.id, titre: x.titre, prix: x.prix, annee: x.annee, km: x.km, energie: x.energie, boite: x.boite, lieu: [x.ville, x.cp].filter(Boolean).join(" ") || null, pro: x.vendeur_type ? x.vendeur_type !== "particulier" : null, photo: vignette(x), url: x.url }))}
        index={fiche ? fiche.i : null}
        onIndex={(i) => setFiche((f) => (f && i != null ? { ...f, i } : null))}
      />
    </div>
  );
}

function Interrupteur({ on, label, onClick, disabled }: { on: boolean; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} disabled={disabled} onClick={onClick}
      className={cx("flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm", on ? "border-o/50 bg-o/12 text-ink" : "border-line-2 text-ink-3")}>
      <span className={cx("relative h-4 w-7 rounded-full transition", on ? "bg-o" : "bg-line-2")} aria-hidden="true">
        <span className={cx("absolute top-0.5 size-3 rounded-full bg-white transition", on ? "left-3.5" : "left-0.5")} />
      </span>
      {label}
    </button>
  );
}

/** Passage en cours sur Leboncoin (une à deux minutes) : minuteur, étapes et barre qui avance. */
function PassageEnCours({ depart, complete }: { depart?: number; complete?: boolean }) {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    const t0 = depart ?? Date.now();
    const i = setInterval(() => setSec(Math.max(0, Math.round((Date.now() - t0) / 1000))), 1000);
    return () => clearInterval(i);
  }, [depart]);
  const etapes: [string, number][] = complete
    ? [["Collecte complète : toutes les annonces qui correspondent", 0], ["Tri : critères, pièges, doublons", 90], ["Enregistrement des annonces", 150]]
    : [["Lecture des nouvelles annonces sur Leboncoin", 0], ["Tri : critères, pièges, doublons", 35], ["Cote de chaque annonce et e-mail", 60]];
  const actuelle = etapes.reduce((k, [, t], i) => (sec >= t ? i : k), 0);
  const pct = Math.min(94, Math.round((1 - Math.exp(-sec / (complete ? 120 : 45))) * 100));
  return (
    <div className="grid gap-2.5 rounded-xl border border-o/30 bg-o/5 p-3" role="status" aria-live="polite">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2 font-medium">
          <span className="size-4 animate-spin rounded-full border-2 border-o/30 border-t-o" aria-hidden="true" />
          {etapes[actuelle][0]}…
        </span>
        <span className="num text-ink-3">{Math.floor(sec / 60)}:{String(sec % 60).padStart(2, "0")}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className="h-full rounded-full bg-gradient-to-r from-o to-o2 transition-[width] duration-1000" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-ink-3">{complete ? "Deux à cinq minutes pour cette première collecte" : "Une à deux minutes"}. Une notification s&apos;affiche en haut de l&apos;écran à la fin, inutile de recharger la page.</p>
    </div>
  );
}

/** Version (carrosserie), motorisation et puissance : envoyées à Leboncoin comme critères (type de véhicule, puissance DIN),
    jamais comme mots-clés. Une motorisation devient sa puissance (325i E90 = 218 ch), apprise des annonces de la génération. */
function ChampsPrecis({ cat, f, onChange }: { cat: CatMarque[]; f: Formulaire; onChange: (x: Partial<Formulaire>) => void }) {
  const g = cat.find((b) => b.k === f.marque)?.m.find((m) => m.k === f.modele)?.g.find((x) => x.id === f.gen);
  const [moteurs, setMoteurs] = useState<{ l: string; n: number; ch: number[] }[]>([]);
  const [charge, setCharge] = useState(false);
  useEffect(() => {
    if (!f.marque || !f.modele) return;
    let fini = false;
    const t = setTimeout(async () => {
      setCharge(true);
      const r = await fetch(`/api/marche/moteurs?${new URLSearchParams({ marque: f.marque, modele: f.modele, gen: f.gen, energie: f.energie })}`).catch(() => null);
      const j = r?.ok ? ((await r.json().catch(() => null)) as { moteurs?: { l: string; n: number; ch: number[] }[] } | null) : null;
      if (fini) return;
      setMoteurs(j?.moteurs ?? []);
      setCharge(false);
      // motorisation reprise d'une recherche : ses puissances Leboncoin sont complétées ici
      const repris = f.moteur && !f.moteurCh ? (j?.moteurs ?? []).find((m) => m.l === f.moteur) : null;
      if (repris?.ch.length) onChange({ moteurCh: repris.ch.join(",") });
    }, 0);
    return () => {
      fini = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- relu quand le véhicule ou l'énergie change, pas à chaque saisie
  }, [f.marque, f.modele, f.gen, f.energie]);
  const pw = (f.moteurCh ?? "").split(",").map(Number).filter((x) => x > 0);
  const liste = f.moteur && !moteurs.some((m) => m.l === f.moteur) ? [{ l: f.moteur, n: 0, ch: pw }, ...moteurs] : moteurs;
  return (
    <>
      {g?.v && (
        <label className="grid content-start gap-1.5 text-sm">
          <span className="text-ink-2">Version, carrosserie</span>
          <select value={f.version ?? ""} onChange={(e) => onChange({ version: e.target.value })} className={inputCls}>
            <option value="">Toutes les versions</option>
            {g.v.map((v) => <option key={v.id} value={v.id}>{v.l} ({v.y0} – {v.y1})</option>)}
          </select>
        </label>
      )}
      <label className="grid content-start gap-1.5 text-sm">
        <span className="text-ink-2">Motorisation</span>
        <select
          value={f.moteur ?? ""}
          disabled={!f.modele}
          onChange={(e) => {
            const m = liste.find((x) => x.l === e.target.value);
            onChange({ moteur: m?.l ?? "", moteurCh: m ? m.ch.join(",") : "" });
          }}
          className={inputCls}
        >
          <option value="">{!f.modele ? "Modèle d'abord" : charge ? "Chargement…" : liste.length ? "Toutes" : "Pas encore assez d'annonces"}</option>
          {liste.map((m) => (
            <option key={m.l} value={m.l} disabled={!m.ch.length}>
              {m.l}{m.ch.length ? ` · ${m.ch.join(" / ")} ch` : " · puissance inconnue"}{m.n ? ` (${m.n} annonces)` : ""}
            </option>
          ))}
        </select>
        {pw.length > 0 && !f.chMin && !f.chMax && <span className="text-xs text-ink-3">Leboncoin cherchera les annonces de {Math.min(...pw) - 3} à {Math.max(...pw) + 3} ch, même sans le nom du moteur.</span>}
      </label>
      <fieldset className="grid content-start gap-1.5 text-sm">
        <legend className="mb-1.5 text-ink-2">Puissance DIN (ch)</legend>
        <div className="grid grid-cols-2 gap-3">
          <input inputMode="numeric" value={f.chMin ?? ""} onChange={(e) => onChange({ chMin: e.target.value })} placeholder="min." aria-label="Puissance minimum (ch)" className={inputCls} />
          <input inputMode="numeric" value={f.chMax ?? ""} onChange={(e) => onChange({ chMax: e.target.value })} placeholder="max." aria-label="Puissance maximum (ch)" className={inputCls} />
        </div>
      </fieldset>
    </>
  );
}
