"use client";
/* Messages Leboncoin (option de Benef Pro). En haut : « Paramètres » (compte Leboncoin, réglages par défaut) et
   « Nouvelle campagne » (fenêtre : recherche simplifiée avec photos, enregistrée dans l'historique de la Recherche,
   validation des annonces trouvées, puis le message). En bas : le suivi des campagnes. L'envoi est fait par la fonction « messages ». */
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useId, useState, useSyncExternalStore, type ReactNode } from "react";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { cx, inputCls } from "@/lib/cx";
import { FILTRES_VIDES, type FiltresRecherche, type Recherche } from "@/lib/recherches";
import { useCatalogue } from "@/lib/vehicules/useCatalogue";
import { ChoixVehicule, type Choix } from "../marche/ChoixVehicule";
import { Ico } from "../espace/Icones";

export type CompteLbc = { email: string; nom_affiche: string | null; statut: "nouveau" | "ok" | "erreur"; erreur: string | null; updated_at: string };
export type Campagne = { id: string; recherche_id: string; nom: string; message: string; actif: boolean; ignorer_refus: boolean; updated_at: string };
export type EnvoiLbc = { id: number; campagne_id: string | null; annonce_id: string; url: string; titre: string | null; prix: number | null; statut: "en_attente" | "en_cours" | "envoye" | "erreur" | "ignoree" | "annule"; raison: string | null; created_at: string; traite_le: string | null };
export type Conversation = { id: string; nom: string; annonce: string; annonce_id: string; dernier: string; le: string | null; non_lus: number };
export type Boite = { conversations: Conversation[]; non_lus: number; total: number; maj: string | null; demande: string | null; run_id: string | null; erreur: string | null };
/** Réglages par défaut des nouvelles campagnes (profils.reglages.messages). */
export type Defauts = { message?: string; ignorerRefus?: boolean };

const MESSAGE_DEFAUT = "Bonjour, votre {titre} est-elle toujours disponible ? Je suis professionnel de l'automobile, je peux me déplacer rapidement. Bonne journée.";
const STATUTS: Record<EnvoiLbc["statut"], [string, string]> = {
  en_attente: ["En attente", "border-line-2 text-ink-3"],
  en_cours: ["Envoi en cours", "border-o/40 text-o2"],
  envoye: ["Envoyé", "border-ok/40 text-ok"],
  erreur: ["Erreur", "border-bad/40 text-bad"],
  ignoree: ["Ignorée", "border-line-2 text-ink-3"],
  annule: ["Annulé", "border-line-2 text-ink-3"],
};
const quand = (d: string | null) => (d ? new Date(d).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—");
const eur = (v: number | null | undefined) => (v == null ? "—" : `${Math.round(v).toLocaleString("fr-FR")} €`);
const nombre = (s: string) => (s.trim() && /^\d+$/.test(s.replace(/\s/g, "")) ? Number(s.replace(/\s/g, "")) : null);
const rien = () => () => {};

function Interrupteur({ on, onClick, label, disabled }: { on: boolean; onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={onClick} className={cx("relative h-6 w-11 shrink-0 rounded-full transition", on ? "bg-o" : "bg-line-2", disabled && "opacity-50")}>
      <span className={cx("absolute top-0.5 size-5 rounded-full bg-ink transition", on ? "left-[22px]" : "left-0.5")} aria-hidden="true" />
    </button>
  );
}

/** Fenêtre par-dessus la page (Échap ou clic à côté pour fermer). */
function Fenetre({ titre, onFermer, children, large }: { titre: string; onFermer: () => void; children: ReactNode; large?: boolean }) {
  const id = useId();
  const monte = useSyncExternalStore(rien, () => true, () => false);
  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === "Escape" && onFermer();
    addEventListener("keydown", f);
    document.documentElement.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", f);
      document.documentElement.style.overflow = "";
    };
  }, [onFermer]);
  if (!monte) return null;
  return createPortal(
    <div className="fixed inset-0 z-[70] grid items-end bg-black/70 backdrop-blur-sm sm:place-items-center sm:px-4" onClick={onFermer}>
      <div role="dialog" aria-modal="true" aria-labelledby={`${id}-t`} onClick={(e) => e.stopPropagation()} className={cx("max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-line-2 bg-bg1 p-5 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)] sm:rounded-3xl sm:p-6", large ? "sm:max-w-4xl" : "sm:max-w-2xl")}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id={`${id}-t`} className="font-display text-xl font-semibold">{titre}</h2>
          <button type="button" onClick={onFermer} aria-label="Fermer" className="rounded-full px-2 py-1 text-ink-3 hover:text-ink">✕</button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function EspaceMessages({ compte, campagnes: c0, envois, boite, etat, defauts: d0, uid, reglages }: {
  compte: CompteLbc | null; campagnes: Campagne[]; envois: EnvoiLbc[]; boite: Boite | null;
  etat: { actif: boolean; jusquAu: string | null; passe: boolean }; defauts: Defauts; uid: string; reglages: Record<string, unknown>;
}) {
  const router = useRouter();
  const [campagnes, setCampagnes] = useState(c0);
  const [liste, setListe] = useState(envois);
  const [defauts, setDefauts] = useState(d0);
  const [fenetre, setFenetre] = useState<"" | "parametres" | "nouvelle">("");
  const [msg, setMsg] = useState("");
  const n = (s: EnvoiLbc["statut"]) => liste.filter((e) => e.statut === s).length;
  const arrete = !etat.actif || etat.passe;
  const compteOk = !!compte && compte.statut !== "erreur";
  const fermer = () => setFenetre("");

  async function actualiserBoite() {
    const { error } = await supabaseNavigateur().rpc("lbc_actualiser_boite");
    setMsg(error ? error.message : "Demande enregistrée : la boîte de réception se met à jour dans 2 à 4 minutes. Rechargez la page ensuite.");
  }
  async function annuler(e: EnvoiLbc) {
    const { error } = await supabaseNavigateur().from("lbc_envois").update({ statut: "annule" }).eq("id", e.id).eq("statut", "en_attente");
    if (!error) setListe((l) => l.map((x) => (x.id === e.id ? { ...x, statut: "annule" } : x)));
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-semibold">Messages Leboncoin</h1>
          <p className="mt-2 text-ink-2">Créez une campagne : vos critères, les annonces trouvées, votre premier message. Utopicar l&apos;envoie à chaque vendeur, une annonce toutes les une à deux minutes, puis s&apos;arrête là.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setFenetre("parametres")} className="btn btn-sm gap-2">
            <Ico nom="compte" className="size-4" /> Paramètres
            {!compteOk && <span className="size-2 rounded-full bg-warn" aria-label="compte à renseigner" />}
          </button>
          <button type="button" onClick={() => setFenetre("nouvelle")} className="btn btn-o btn-sm gap-2">
            <span aria-hidden="true">+</span> Nouvelle campagne
          </button>
        </div>
      </div>

      {arrete && (
        <p role="status" className="rounded-2xl border border-warn/40 bg-warn/10 p-4 text-sm text-warn">
          Les envois automatiques sont à l&apos;arrêt{etat.jusquAu && etat.actif ? ` depuis le ${quand(etat.jusquAu)} (fin de la période d'essai)` : ""} : rien ne part, vos campagnes et votre file sont gardées.
        </p>
      )}
      {!arrete && etat.jusquAu && (
        <p role="status" className="rounded-2xl border border-o/40 bg-o/10 p-4 text-sm text-o2">Période d&apos;essai : les envois automatiques s&apos;arrêtent le {quand(etat.jusquAu)}.</p>
      )}
      {!compteOk && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-warn/40 bg-warn/10 p-4 text-sm">
          <span className="text-ink-2">{compte?.statut === "erreur" ? `Leboncoin a refusé la connexion : ${compte.erreur}. Les campagnes sont arrêtées.` : "Renseignez votre compte Leboncoin avant d'activer une campagne."}</span>
          <button type="button" onClick={() => setFenetre("parametres")} className="btn btn-sm">Ouvrir les paramètres</button>
        </div>
      )}

      <section aria-labelledby="m-tb" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <h2 id="m-tb" className="sr-only">Tableau de bord</h2>
        {[
          ["Messages envoyés", String(n("envoye")), "premier message uniquement"],
          ["En attente", String(n("en_attente") + n("en_cours")), "une annonce toutes les 1 à 2 min"],
          ["Réponses reçues", boite ? String(boite.total) : "—", boite?.maj ? `boîte lue le ${quand(boite.maj)}` : "boîte jamais lue"],
          ["Non lus", boite ? String(boite.non_lus) : "—", "sur Leboncoin"],
        ].map(([l, v, s]) => (
          <div key={l} className="carte p-4">
            <p className="text-xs text-ink-3">{l}</p>
            <p className="num mt-1 font-display text-2xl font-semibold">{v}</p>
            <p className="mt-0.5 text-xs text-ink-3">{s}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="m-boite" className="carte grid gap-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="m-boite" className="font-display text-xl font-semibold">Boîte de réception</h2>
          <button type="button" onClick={actualiserBoite} disabled={!compteOk || !!boite?.demande || !!boite?.run_id} className="btn btn-sm">
            {boite?.demande || boite?.run_id ? "Lecture en cours…" : "Actualiser"}
          </button>
        </div>
        {msg && <p role="status" className="text-sm text-ink-2">{msg}</p>}
        {boite?.erreur && <p className="text-sm text-warn">Dernière lecture impossible : {boite.erreur}</p>}
        {boite?.conversations?.length ? (
          <ul className="grid gap-2">
            {boite.conversations.map((x) => (
              <li key={x.id} className={cx("grid gap-0.5 rounded-xl border p-3 text-sm", x.non_lus ? "border-o/40 bg-o/5" : "border-line")}>
                <span className="flex flex-wrap items-baseline justify-between gap-2">
                  <b className="font-medium">{x.nom || "Vendeur"}{x.non_lus ? <span className="ml-2 rounded-full bg-o px-2 py-px text-[11px] font-semibold text-[#160904]">{x.non_lus} non lu{x.non_lus > 1 ? "s" : ""}</span> : null}</b>
                  <span className="text-xs text-ink-3">{quand(x.le)}</span>
                </span>
                {x.annonce && <span className="truncate text-ink-3">{x.annonce}</span>}
                {x.dernier && <span className="text-ink-2">« {x.dernier} »</span>}
                {x.annonce_id && <a href={`https://www.leboncoin.fr/ad/voitures/${x.annonce_id}`} target="_blank" rel="noopener noreferrer" className="w-fit text-xs text-o2 underline-offset-4 hover:underline">Annonce ↗</a>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-3">{boite?.maj ? "Aucune conversation." : "La boîte n'a pas encore été lue : cliquez sur « Actualiser »."} Répondez aux vendeurs directement sur Leboncoin.</p>
        )}
      </section>

      <section aria-labelledby="m-camp" className="grid gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="m-camp" className="font-display text-xl font-semibold">Suivi des campagnes</h2>
          <span className="text-sm text-ink-3">{campagnes.filter((c) => c.actif).length} active{campagnes.filter((c) => c.actif).length > 1 ? "s" : ""} sur {campagnes.length}</span>
        </div>
        {campagnes.length ? (
          campagnes.map((c) => (
            <SuiviCampagne
              key={c.id}
              c={c}
              envois={liste.filter((e) => e.campagne_id === c.id)}
              compteOk={compteOk}
              onMaj={(x) => setCampagnes((l) => (x ? l.map((y) => (y.id === x.id ? x : y)) : l.filter((y) => y.id !== c.id)))}
              onAnnuler={annuler}
            />
          ))
        ) : (
          <div className="carte grid justify-items-start gap-3 p-6">
            <p className="text-ink-2">Aucune campagne pour l&apos;instant.</p>
            <button type="button" onClick={() => setFenetre("nouvelle")} className="btn btn-o btn-sm">+ Créer ma première campagne</button>
          </div>
        )}
      </section>

      {fenetre === "parametres" && (
        <Fenetre titre="Paramètres des messages" onFermer={fermer}>
          <div className="grid gap-6">
            <CompteLeboncoin compte={compte} onFait={() => router.refresh()} />
            <ReglagesDefaut defauts={defauts} uid={uid} reglages={reglages} onMaj={setDefauts} etat={etat} />
          </div>
        </Fenetre>
      )}
      {fenetre === "nouvelle" && (
        <Fenetre titre="Nouvelle campagne" onFermer={fermer} large>
          <NouvelleCampagne
            defauts={defauts}
            compteOk={compteOk}
            onParametres={() => setFenetre("parametres")}
            onCree={(x) => {
              setCampagnes((l) => (l.some((y) => y.id === x.id) ? l.map((y) => (y.id === x.id ? x : y)) : [...l, x]));
              setFenetre("");
              router.refresh();
            }}
          />
        </Fenetre>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- nouvelle campagne */

type AnnonceTrouvee = { id: string; titre: string; prix: number; annee: number | null; km: number | null; ch: number | null; energie: string | null; boite: string | null; lieu: string | null; url: string | null; photo?: string | null; pro: boolean; piege: boolean; cote: { P: number; ecart: number | null; pct: number | null } | null };
type Resultat = { recherche: Recherche | null; trouvees: number; annonces: AnnonceTrouvee[]; collecte: { statut: string; nom: string } | null; modele: { nom: string } };

/** Fenêtre « Nouvelle campagne » : 1. critères, 2. les annonces trouvées (avec photos), 3. le message. */
function NouvelleCampagne({ defauts, compteOk, onParametres, onCree }: { defauts: Defauts; compteOk: boolean; onParametres: () => void; onCree: (c: Campagne) => void }) {
  const cat = useCatalogue() ?? [];
  const [etape, setEtape] = useState<1 | 2 | 3>(1);
  const [choix, setChoix] = useState<Choix>({ marque: "", modele: "", gen: "" });
  const [f, setF] = useState<FiltresRecherche>({ ...FILTRES_VIDES, vendeur: "particulier" });
  const [res, setRes] = useState<Resultat | null>(null);
  const [charge, setCharge] = useState(false);
  const [err, setErr] = useState("");
  const [message, setMessage] = useState(defauts.message || MESSAGE_DEFAUT);
  const [refus, setRefus] = useState(defauts.ignorerRefus ?? true);
  const [activer, setActiver] = useState(true);
  const maj = (k: keyof FiltresRecherche) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  const cibles = (res?.annonces ?? []).filter((a) => !a.piege && a.url && /leboncoin\.fr/.test(a.url));

  async function chercher(e: React.FormEvent) {
    e.preventDefault();
    if (!choix.marque || !choix.modele) return setErr("Choisissez au moins la marque et le modèle.");
    setCharge(true);
    setErr("");
    try {
      // même recherche que la page Recherche : elle est enregistrée dans son historique
      const r = await fetch("/api/marche/recherche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marque: choix.marque, modele: choix.modele, gen: choix.gen || undefined, energie: f.energie, boite: f.boite,
          chMin: nombre(f.chMin), chMax: nombre(f.chMax), anneeMin: nombre(f.anneeMin), anneeMax: nombre(f.anneeMax),
          prixMin: nombre(f.prixMin), prixMax: nombre(f.prixMax), kmMax: nombre(f.kmMax), vendeur: f.vendeur, mots: f.mots, exclure: f.exclure,
          sousCote: nombre(f.sousCote) ?? 0, fiables: true, tri: "ecart", saisie: f,
        }),
      });
      const j = (await r.json().catch(() => null)) as (Resultat & { erreur?: string }) | null;
      if (!r.ok || !j) return setErr(j?.erreur ?? "La recherche n'a pas abouti. Réessayez.");
      setRes(j);
      setEtape(2);
    } finally {
      setCharge(false);
    }
  }

  async function creer() {
    if (!res?.recherche) return setErr("La recherche n'a pas été enregistrée : relancez-la.");
    if (message.trim().length < 10) return setErr("Le message est trop court.");
    if (activer && !compteOk) return setErr("Renseignez d'abord votre compte Leboncoin dans les paramètres, ou créez la campagne en pause.");
    setCharge(true);
    setErr("");
    const { data, error } = await supabaseNavigateur()
      .from("lbc_campagnes")
      .upsert({ recherche_id: res.recherche.id, nom: res.recherche.nom.slice(0, 160), message: message.trim().slice(0, 2500), ignorer_refus: refus, actif: activer, updated_at: new Date().toISOString() }, { onConflict: "user_id,recherche_id" })
      .select("id, recherche_id, nom, message, actif, ignorer_refus, updated_at")
      .single();
    setCharge(false);
    if (error || !data) return setErr(error?.message ?? "Création impossible.");
    onCree(data as Campagne);
  }

  return (
    <div className="grid gap-5">
      <ol className="flex flex-wrap gap-2 text-sm" aria-label="Étapes">
        {(["Critères", "Annonces trouvées", "Message et envoi"] as const).map((l, i) => (
          <li key={l} className={cx("flex items-center gap-2 rounded-full border px-3 py-1", etape === i + 1 ? "border-o bg-o/15 text-ink" : etape > i + 1 ? "border-ok/40 text-ok" : "border-line-2 text-ink-3")}>
            <span className="num font-semibold">{i + 1}</span> {l}
          </li>
        ))}
      </ol>

      {etape === 1 && (
        <form onSubmit={chercher} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ChoixVehicule cat={cat} v={choix} onChange={setChoix} idPrefixe="nc" />
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
          <fieldset className="grid gap-1.5 text-sm">
            <legend className="mb-1.5 text-ink-2">Puissance (ch, réelle)</legend>
            <div className="grid grid-cols-2 gap-3">
              <input inputMode="numeric" value={f.chMin} onChange={maj("chMin")} placeholder="min." aria-label="Puissance minimum en chevaux" className={inputCls} />
              <input inputMode="numeric" value={f.chMax} onChange={maj("chMax")} placeholder="max." aria-label="Puissance maximum en chevaux" className={inputCls} />
            </div>
          </fieldset>
          <fieldset className="grid gap-1.5 text-sm">
            <legend className="mb-1.5 text-ink-2">Années</legend>
            <div className="grid grid-cols-2 gap-3">
              <input inputMode="numeric" value={f.anneeMin} onChange={maj("anneeMin")} placeholder="de" aria-label="Année minimum" className={inputCls} />
              <input inputMode="numeric" value={f.anneeMax} onChange={maj("anneeMax")} placeholder="à" aria-label="Année maximum" className={inputCls} />
            </div>
          </fieldset>
          <fieldset className="grid gap-1.5 text-sm">
            <legend className="mb-1.5 text-ink-2">Prix (€)</legend>
            <div className="grid grid-cols-2 gap-3">
              <input inputMode="numeric" value={f.prixMin} onChange={maj("prixMin")} placeholder="min." aria-label="Prix minimum" className={inputCls} />
              <input inputMode="numeric" value={f.prixMax} onChange={maj("prixMax")} placeholder="max." aria-label="Prix maximum" className={inputCls} />
            </div>
          </fieldset>
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Kilométrage max.</span>
            <input inputMode="numeric" value={f.kmMax} onChange={maj("kmMax")} placeholder="150000" className={inputCls} />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Vendeurs</span>
            <select value={f.vendeur} onChange={maj("vendeur")} className={inputCls}>
              <option value="particulier">Particuliers</option>
              <option value="">Tous</option>
              <option value="pro">Professionnels</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Sous la cote d&apos;au moins (%)</span>
            <input inputMode="numeric" value={f.sousCote} onChange={maj("sousCote")} placeholder="facultatif" className={inputCls} />
          </label>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-3">
            <button type="submit" disabled={charge} className="btn btn-o btn-sm">{charge ? "Recherche…" : "Voir les annonces"}</button>
            <p className="text-xs text-ink-3">La recherche est gardée dans l&apos;historique de la page Recherche.</p>
          </div>
        </form>
      )}

      {etape === 2 && res && (
        <div className="grid gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-display text-lg font-semibold">
              {cibles.length} annonce{cibles.length > 1 ? "s" : ""} Leboncoin · {res.recherche?.nom ?? res.modele.nom}
            </p>
            <button type="button" onClick={() => setEtape(1)} className="text-sm text-o2 underline-offset-4 hover:underline">Modifier les critères</button>
          </div>
          {res.collecte && (res.collecte.statut === "demandee" || res.collecte.statut === "en cours") && (
            <p className="rounded-xl border border-o/40 bg-o/10 p-3 text-sm text-ink-2">La base avait peu d&apos;annonces pour ce modèle : une collecte Leboncoin est lancée (3 à 10 minutes). Vous pouvez valider maintenant ; rouvrez la recherche plus tard et cliquez sur « Actualiser » pour ajouter les nouvelles annonces à la campagne.</p>
          )}
          {cibles.length ? (
            <ul className="grid max-h-[50vh] gap-2 overflow-y-auto pr-1">
              {cibles.slice(0, 300).map((a) => (
                <li key={a.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-line p-2">
                  {a.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- vignette servie par Leboncoin
                    <img src={a.photo} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-16 w-24 rounded-lg border border-line object-cover" />
                  ) : (
                    <span className="grid h-16 w-24 place-items-center rounded-lg border border-dashed border-line-2 text-[11px] text-ink-3">photo bientôt</span>
                  )}
                  <span className="min-w-0">
                    <a href={a.url!} target="_blank" rel="noopener noreferrer" className="block truncate text-sm font-medium underline-offset-4 hover:underline">{a.titre || "Annonce"}</a>
                    <span className="block truncate text-xs text-ink-3">{[a.annee, a.km != null ? `${a.km.toLocaleString("fr-FR")} km` : null, a.ch ? `${a.ch} ch` : null, a.energie, a.boite, a.lieu].filter(Boolean).join(" · ")}</span>
                  </span>
                  <span className="text-right">
                    <b className="num block">{eur(a.prix)}</b>
                    {a.cote?.ecart != null && <span className={cx("text-xs", a.cote.ecart >= 0 ? "text-ok" : "text-ink-3")}>{a.cote.ecart >= 0 ? `${eur(a.cote.ecart)} sous la cote` : "au-dessus de la cote"}</span>}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-line-2 p-4 text-sm text-ink-3">Aucune annonce ne correspond. Élargissez les critères.</p>
          )}
          <p className="text-xs text-ink-3">Les annonces déjà contactées (ici ou sur Leboncoin) et, par défaut, celles qui refusent le démarchage sont écartées au moment de l&apos;envoi.</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setEtape(3)} disabled={!cibles.length} className="btn btn-o btn-sm">Valider ces {cibles.length} annonce{cibles.length > 1 ? "s" : ""}</button>
            <button type="button" onClick={() => setEtape(1)} className="btn btn-sm">Changer les critères</button>
          </div>
        </div>
      )}

      {etape === 3 && res && (
        <div className="grid gap-4">
          <p className="text-sm text-ink-2">
            Campagne « <b className="text-ink">{res.recherche?.nom}</b> » · {cibles.length} annonce{cibles.length > 1 ? "s" : ""}
          </p>
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Premier message</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={2500} className={cx(inputCls, "resize-y leading-relaxed")} />
            <span className="text-xs text-ink-3">
              <code className="rounded bg-glass px-1">{"{titre}"}</code> et <code className="rounded bg-glass px-1">{"{prix}"}</code> reprennent ceux de l&apos;annonce.
            </span>
          </label>
          <OptionRefus on={refus} onClick={() => setRefus((v) => !v)} />
          <div className="flex items-start justify-between gap-4 rounded-xl border border-line p-3 text-sm">
            <span>
              <span className="block font-medium">Envoyer le premier message tout de suite</span>
              <span className="block text-ink-3">Éteint : la campagne est créée en pause, vous l&apos;activerez depuis le suivi.</span>
            </span>
            <Interrupteur on={activer} label="Envoyer tout de suite" onClick={() => setActiver((v) => !v)} />
          </div>
          <div className={cx("flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-sm", compteOk ? "border-ok/40" : "border-warn/40 bg-warn/10")}>
            <span className={compteOk ? "text-ok" : "text-warn"}>{compteOk ? "✓ Compte Leboncoin enregistré" : "Compte Leboncoin à renseigner (double authentification désactivée)"}</span>
            <button type="button" onClick={onParametres} className="btn btn-sm">{compteOk ? "Vérifier" : "Renseigner"}</button>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={creer} disabled={charge} className="btn btn-o btn-sm">{charge ? "Création…" : activer ? "Créer et lancer la campagne" : "Créer la campagne en pause"}</button>
            <button type="button" onClick={() => setEtape(2)} className="btn btn-sm">Retour aux annonces</button>
          </div>
        </div>
      )}

      {err && <p role="alert" className="text-sm text-warn">{err}</p>}
    </div>
  );
}

function OptionRefus({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-line p-3 text-sm">
      <span>
        <span className="block font-medium">Ignorer les annonces qui refusent le démarchage</span>
        <span className="block text-ink-3">« Pas de démarchage », « pros s&apos;abstenir », « particuliers uniquement »… Activé par défaut.</span>
        {!on && <span className="mt-1 block text-warn">Désactivé : ces annonces seront aussi contactées, sous votre seule responsabilité (règles de Leboncoin, refus explicite du vendeur).</span>}
      </span>
      <Interrupteur on={on} label="Ignorer les annonces qui refusent le démarchage" onClick={onClick} />
    </div>
  );
}

/* ---------------------------------------------------------------- suivi */

function SuiviCampagne({ c, envois, compteOk, onMaj, onAnnuler }: { c: Campagne; envois: EnvoiLbc[]; compteOk: boolean; onMaj: (x: Campagne | null) => void; onAnnuler: (e: EnvoiLbc) => void }) {
  const [edition, setEdition] = useState(false);
  const [message, setMessage] = useState(c.message);
  const [refus, setRefus] = useState(c.ignorer_refus);
  const [etat, setEtat] = useState("");
  const [charge, setCharge] = useState(false);
  const compte = (s: EnvoiLbc["statut"][]) => envois.filter((e) => s.includes(e.statut)).length;

  async function enregistrer(champs: Partial<Campagne>) {
    if (champs.actif && !compteOk) return setEtat("Renseignez d'abord votre compte Leboncoin dans les paramètres.");
    setCharge(true);
    const { data, error } = await supabaseNavigateur()
      .from("lbc_campagnes")
      .update({ ...champs, updated_at: new Date().toISOString() })
      .eq("id", c.id)
      .select("id, recherche_id, nom, message, actif, ignorer_refus, updated_at")
      .single();
    setCharge(false);
    if (error || !data) return setEtat(error?.message ?? "Enregistrement impossible.");
    setEtat(champs.actif === true ? "Campagne active : les annonces entrent dans la file à la prochaine minute." : champs.actif === false ? "Campagne en pause." : "Enregistré.");
    setEdition(false);
    onMaj(data as Campagne);
  }
  async function supprimer() {
    if (!confirm(`Supprimer la campagne « ${c.nom} » ? Les messages déjà envoyés restent comptés.`)) return;
    const { error } = await supabaseNavigateur().from("lbc_campagnes").delete().eq("id", c.id);
    if (!error) onMaj(null);
  }

  return (
    <article className={cx("carte grid gap-3 p-4 sm:p-5", c.actif && "border-o/50")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{c.nom}</p>
          <p className="text-xs text-ink-3">Modifiée le {quand(c.updated_at)}{c.ignorer_refus ? " · refus de démarchage respecté" : " · refus de démarchage ignoré"}</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          {c.actif ? "Active" : "En pause"}
          <Interrupteur on={c.actif} label={c.actif ? "Mettre en pause" : "Activer"} disabled={charge} onClick={() => enregistrer({ actif: !c.actif })} />
        </label>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        {([["Envoyés", compte(["envoye"]), "text-ok"], ["En attente", compte(["en_attente", "en_cours"]), ""], ["Ignorées", compte(["ignoree", "annule"]), "text-ink-3"], ["Erreurs", compte(["erreur"]), "text-bad"]] as const).map(([l, v, t]) => (
          <div key={l} className="rounded-xl border border-line px-3 py-2">
            <dt className="text-xs text-ink-3">{l}</dt>
            <dd className={cx("num font-display text-lg font-semibold", v ? t : "")}>{v}</dd>
          </div>
        ))}
      </dl>
      {edition ? (
        <div className="grid gap-3">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={2500} className={cx(inputCls, "resize-y leading-relaxed")} aria-label="Premier message" />
          <OptionRefus on={refus} onClick={() => setRefus((v) => !v)} />
          <div className="flex gap-2">
            <button type="button" onClick={() => enregistrer({ message: message.trim(), ignorer_refus: refus })} disabled={charge || message.trim().length < 10} className="btn btn-o btn-sm">Enregistrer</button>
            <button type="button" onClick={() => setEdition(false)} className="btn btn-sm">Annuler</button>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-line bg-bg0/50 p-3 text-sm text-ink-2">« {c.message} »</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {!edition && <button type="button" onClick={() => setEdition(true)} className="btn btn-sm">Modifier le message</button>}
        <a href={`/app/recherche?r=${c.recherche_id}`} className="btn btn-sm">Voir la recherche</a>
        <button type="button" onClick={supprimer} className="btn btn-sm text-ink-3">Supprimer</button>
        {etat && <span role="status" className="text-sm text-ink-2">{etat}</span>}
      </div>
      {envois.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm text-o2">Détail des {envois.length} annonce{envois.length > 1 ? "s" : ""}</summary>
          <ul className="mt-2 grid max-h-96 gap-1.5 overflow-y-auto pr-1">
            {envois.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-sm">
                <span className="min-w-0">
                  <a href={e.url} target="_blank" rel="noopener noreferrer" className="block truncate underline-offset-4 hover:underline">{e.titre || `Annonce ${e.annonce_id}`}</a>
                  <span className="text-xs text-ink-3">{e.prix != null ? `${eur(e.prix)} · ` : ""}{e.statut === "en_attente" ? `ajoutée le ${quand(e.created_at)}` : quand(e.traite_le)}{e.raison ? ` · ${e.raison}` : ""}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className={cx("rounded-full border px-2 py-0.5 text-xs", STATUTS[e.statut][1])}>{STATUTS[e.statut][0]}</span>
                  {e.statut === "en_attente" && <button type="button" onClick={() => onAnnuler(e)} className="btn btn-sm min-h-8 px-3 text-ink-3">Ne pas envoyer</button>}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}

/* ---------------------------------------------------------------- paramètres */

/** Réglages par défaut des nouvelles campagnes et rythme d'envoi. */
function ReglagesDefaut({ defauts, uid, reglages, onMaj, etat }: { defauts: Defauts; uid: string; reglages: Record<string, unknown>; onMaj: (d: Defauts) => void; etat: { jusquAu: string | null } }) {
  const [message, setMessage] = useState(defauts.message || MESSAGE_DEFAUT);
  const [refus, setRefus] = useState(defauts.ignorerRefus ?? true);
  const [info, setInfo] = useState("");
  async function enregistrer() {
    const d = { message: message.trim().slice(0, 2500), ignorerRefus: refus };
    const { error } = await supabaseNavigateur().from("profils").update({ reglages: { ...reglages, messages: d }, updated_at: new Date().toISOString() }).eq("id", uid);
    setInfo(error ? "Enregistrement impossible." : "Réglages enregistrés : ils servent aux prochaines campagnes.");
    if (!error) onMaj(d);
  }
  return (
    <section aria-labelledby="m-defaut" className="grid gap-4 border-t border-line pt-5">
      <h3 id="m-defaut" className="font-display text-lg font-semibold">Réglages généraux</h3>
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Premier message par défaut</span>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={2500} className={cx(inputCls, "resize-y leading-relaxed")} />
      </label>
      <OptionRefus on={refus} onClick={() => setRefus((v) => !v)} />
      <ul className="grid gap-1 text-sm text-ink-3">
        <li>Rythme : une annonce toutes les 1 à 2 minutes, jamais deux fois la même.</li>
        <li>Une annonce déjà contactée sur Leboncoin n&apos;est jamais recontactée (lue dans la boîte de réception).</li>
        {etat.jusquAu && <li>Fin de la période d&apos;essai : {quand(etat.jusquAu)}.</li>}
      </ul>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={enregistrer} className="btn btn-sm">Enregistrer les réglages</button>
        {info && <span role="status" className="text-sm text-ink-2">{info}</span>}
      </div>
    </section>
  );
}

/** Compte Leboncoin : la double authentification doit être désactivée avant tout. Mot de passe chiffré dès l'enregistrement. */
function CompteLeboncoin({ compte, onFait }: { compte: CompteLbc | null; onFait: () => void }) {
  const [edition, setEdition] = useState(!compte);
  const [sans2fa, setSans2fa] = useState(!!compte);
  const [email, setEmail] = useState(compte?.email ?? "");
  const [mdp, setMdp] = useState("");
  const [nom, setNom] = useState(compte?.nom_affiche ?? "");
  const [etat, setEtat] = useState("");
  const [charge, setCharge] = useState(false);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    if (!sans2fa) return setEtat("Désactivez d'abord la double authentification sur votre compte Leboncoin, puis cochez la case.");
    if (!compte && !mdp) return setEtat("Indiquez le mot de passe de votre compte Leboncoin.");
    setCharge(true);
    const { error } = await supabaseNavigateur().rpc("lbc_enregistrer", { p_email: email.trim(), p_mdp: mdp, p_nom: nom.trim() });
    setCharge(false);
    setMdp("");
    if (error) return setEtat(error.message);
    setEtat("Compte enregistré. Le mot de passe est chiffré : personne ne peut le relire.");
    setEdition(false);
    onFait();
  }
  async function oublier() {
    if (!confirm("Effacer votre compte Leboncoin d'Utopicar ? Les campagnes s'arrêtent et les messages en attente sont annulés.")) return;
    const { error } = await supabaseNavigateur().rpc("lbc_oublier");
    setEtat(error ? error.message : "Compte effacé.");
    if (!error) onFait();
  }

  return (
    <section aria-labelledby="m-compte" className="grid gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 id="m-compte" className="font-display text-lg font-semibold">Compte Leboncoin</h3>
        {compte && (
          <span className={cx("rounded-full border px-2.5 py-0.5 text-xs", compte.statut === "ok" ? "border-ok/40 text-ok" : compte.statut === "erreur" ? "border-bad/40 text-bad" : "border-line-2 text-ink-3")}>
            {compte.statut === "ok" ? "Connexion vérifiée" : compte.statut === "erreur" ? "Connexion refusée" : "Pas encore utilisé"}
          </span>
        )}
      </div>
      {compte?.statut === "erreur" && (
        <p className="rounded-xl border border-bad/40 bg-bad/10 p-3 text-sm text-bad">Leboncoin a refusé la connexion : {compte.erreur}. Vérifiez que la double authentification est désactivée et que le mot de passe est le bon, puis enregistrez-le de nouveau.</p>
      )}
      {compte && !edition ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span>
            <b>{compte.email}</b>
            {compte.nom_affiche ? <span className="text-ink-3"> · affiché « {compte.nom_affiche} »</span> : null}
            <span className="block text-xs text-ink-3">Mot de passe chiffré, enregistré le {quand(compte.updated_at)}</span>
          </span>
          <span className="flex gap-2">
            <button type="button" onClick={() => setEdition(true)} className="btn btn-sm">Modifier</button>
            <button type="button" onClick={oublier} className="btn btn-sm text-ink-3">Effacer</button>
          </span>
        </div>
      ) : (
        <form onSubmit={enregistrer} className="grid gap-4">
          <div className="rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm">
            <p className="font-semibold text-warn">Avant tout : désactivez la double authentification</p>
            <p className="mt-1 text-ink-2">Sur Leboncoin : Mon compte › Connexion et sécurité › Validation en deux étapes, désactivez-la. Déconnectez aussi l&apos;application Leboncoin de votre téléphone si elle valide les connexions.</p>
            <label className="mt-2 flex items-center gap-2 text-ink">
              <input type="checkbox" checked={sans2fa} onChange={(e) => setSans2fa(e.target.checked)} className="size-4 accent-[#ff5a1f]" />
              J&apos;ai désactivé la double authentification
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-1.5 text-sm">
              <span className="text-ink-2">E-mail Leboncoin</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={!sans2fa} autoComplete="off" className={inputCls} />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-ink-2">Mot de passe{compte ? " (vide : inchangé)" : ""}</span>
              <input type="password" value={mdp} onChange={(e) => setMdp(e.target.value)} disabled={!sans2fa} autoComplete="new-password" className={inputCls} />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-ink-2">Nom affiché</span>
              <input value={nom} onChange={(e) => setNom(e.target.value)} disabled={!sans2fa} maxLength={60} placeholder="ex. Malek" className={inputCls} />
            </label>
          </div>
          <p className="text-xs text-ink-3">Mot de passe chiffré dès l&apos;enregistrement (AES-256, clé dans le coffre de la base), déchiffré seulement au moment de l&apos;envoi pour la connexion à Leboncoin.</p>
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={charge || !sans2fa} className="btn btn-o btn-sm">{charge ? "Enregistrement…" : "Enregistrer"}</button>
            {compte && <button type="button" onClick={() => setEdition(false)} className="btn btn-sm">Annuler</button>}
          </div>
        </form>
      )}
      {etat && <p role="status" className="text-sm text-ink-2">{etat}</p>}
    </section>
  );
}
