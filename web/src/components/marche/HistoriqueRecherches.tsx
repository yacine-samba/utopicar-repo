"use client";
import Link from "next/link";
import { useState } from "react";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { cx } from "@/lib/cx";
import { quandRecherche, resumeFiltres, type Recherche } from "@/lib/recherches";
import { Ico } from "../espace/Icones";
import { useCatalogue } from "@/lib/vehicules/useCatalogue";
import { InterrupteurAlerte } from "./InterrupteurAlerte";

export type AlerteSupprimee = {
  id: string; nom: string; filtres: { utp?: { site?: Record<string, string> } } | null; created_at: string; supprimee_le: string;
  derniere_execution: string | null; passages: number; mails: number; trouvees: number;
};

const eur = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`;
const date = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

/** Historique : toutes les recherches faites (ouvertes ou fermées) et les alertes supprimées, à relancer ou réactiver. */
export function HistoriqueRecherches({ recherches, supprimees, alertes, photos = {}, etatsAlertes = {} }: {
  recherches: Recherche[]; supprimees: AlerteSupprimee[]; alertes: boolean;
  /** vignettes des annonces trouvées, par nom de recherche */
  photos?: Record<string, string[]>;
  /** alerte liée : allumée ou en pause */
  etatsAlertes?: Record<string, boolean>;
}) {
  const cat = useCatalogue(alertes);
  const [liste, setListe] = useState(recherches);
  const [anciennes, setAnciennes] = useState(supprimees);
  const [q, setQ] = useState("");
  const [aConfirmer, setAConfirmer] = useState<string | null>(null);
  const [etat, setEtat] = useState("");
  const filtre = q.trim().toLowerCase();
  const vues = filtre ? liste.filter((r) => r.nom.toLowerCase().includes(filtre)) : liste;

  async function retirer(r: Recherche) {
    setAConfirmer(null);
    const { error } = await supabaseNavigateur().from("recherches").delete().eq("id", r.id);
    if (error) setEtat("Suppression impossible. Réessayez.");
    else setListe((l) => l.filter((x) => x.id !== r.id));
  }

  /** Active : ouverte en onglet et sur le tableau de bord. Désactivée : rangée ici, avec ses résultats gardés. */
  async function basculer(r: Recherche) {
    setEtat("");
    const { error } = await supabaseNavigateur().from("recherches").update({ active: !r.active }).eq("id", r.id);
    if (error) return setEtat("Modification impossible. Réessayez.");
    setListe((l) => l.map((x) => (x.id === r.id ? { ...x, active: !r.active } : x)));
  }

  async function reactiver(a: AlerteSupprimee) {
    setEtat("");
    const r = await fetch("/api/alertes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "restaurer", id: a.id }) });
    const j = await r.json().catch(() => null);
    if (!r.ok) return setEtat(j?.erreur ?? "Réactivation impossible. Réessayez.");
    setAnciennes((l) => l.filter((x) => x.id !== a.id));
    setEtat(`« ${a.nom} » est de retour dans vos alertes, en pause : allumez-la quand vous voulez.`);
  }

  return (
    <div className="grid gap-8">
      <section aria-labelledby="hi-r" className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="hi-r" className="font-display text-xl font-semibold">Mes recherches</h2>
            <p className="text-sm text-ink-3">Une ligne par voiture, avec ses résultats gardés. L&apos;interrupteur « Alerte e-mail » envoie les nouvelles annonces par e-mail.</p>
          </div>
          <label className="relative w-full sm:w-72">
            <span className="sr-only">Filtrer par voiture</span>
            <Ico nom="recherche" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrer : Clio, 208…" className="min-h-11 w-full rounded-xl border border-line-2 bg-bg0/60 pl-9 pr-3 text-sm outline-none focus:border-o/60" />
          </label>
        </div>
        <p className="text-sm text-ink-3" role="status" aria-live="polite">{etat}</p>
        {vues.length ? (
          <ul className="grid gap-3">
            {vues.map((r) => (
              <li key={r.id} className="carte grid gap-3 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                <Vignettes urls={photos[r.nom] ?? []} nom={r.nom} />
                <div className="grid min-w-0 gap-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <b className="font-semibold">{r.nom}</b>
                    <span className={cx("rounded-full border px-2 py-0.5 text-xs", r.active ? "border-ok/40 text-ok" : "border-line-2 text-ink-3")}>{r.active ? "Active" : "Désactivée"}</span>
                    <span className="text-xs text-ink-3" suppressHydrationWarning>{quandRecherche(r.derniere_le)}</span>
                  </p>
                  <p className="truncate text-sm text-ink-3">{resumeFiltres(r.criteres.f) || "Tous les critères"}</p>
                  <p className="text-sm text-ink-2">
                    <b className="num text-ink">{r.trouvees ?? 0}</b> annonce{(r.trouvees ?? 0) > 1 ? "s" : ""}
                    {r.sous_cote ? <> · <b className="num text-ok">{r.sous_cote}</b> sous la cote</> : null}
                    {r.meilleure && <span className="text-ink-3"> · meilleure : {eur(r.meilleure.prix)} ({r.meilleure.pct} % sous la cote)</span>}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Link href={`/app/recherche?r=${r.id}`} className="btn btn-o btn-sm">Ouvrir</Link>
                  <button type="button" onClick={() => basculer(r)} aria-pressed={r.active} className="btn btn-sm">{r.active ? "Désactiver" : "Activer"}</button>
                  {alertes && <InterrupteurAlerte r={r} actif={!!(r.alerte_id && etatsAlertes[r.alerte_id])} cat={cat} />}
                  {aConfirmer === r.id ? (
                    <button type="button" onClick={() => retirer(r)} className="btn btn-sm border-bad/60 text-bad" title="Ses annonces restent dans « Annonces trouvées » et dans la cote">Supprimer (annonces gardées)</button>
                  ) : (
                    <button type="button" onClick={() => setAConfirmer(r.id)} className="btn btn-sm text-ink-3" aria-label={`Supprimer la recherche ${r.nom}`}>Supprimer</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="carte p-5 text-ink-2">{filtre ? "Aucune recherche ne correspond." : "Aucune recherche pour l'instant : lancez-en une depuis « Annonces du marché »."}</p>
        )}
      </section>

      {alertes && (
        <section aria-labelledby="hi-a" className="grid gap-4">
          <div>
            <h2 id="hi-a" className="font-display text-xl font-semibold">Alertes supprimées</h2>
            <p className="text-sm text-ink-3">Elles ne tournent plus, mais gardent leurs critères et ce qu&apos;elles ont trouvé. Réactivez-en une en un clic.</p>
          </div>
          {anciennes.length ? (
            <ul className="grid gap-3">
              {anciennes.map((a) => (
                <li key={a.id} className="carte grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="grid min-w-0 gap-1">
                    <b className="font-semibold">{a.nom}</b>
                    <p className="truncate text-sm text-ink-3">{resumeFiltres(a.filtres?.utp?.site ?? {}) || "Critères de l'outil Garage"}</p>
                    <p className="text-sm text-ink-2">
                      Créée le {date(a.created_at)} · supprimée le {date(a.supprimee_le)} · {a.passages} passage{a.passages > 1 ? "s" : ""} · <b className="num text-ink">{a.trouvees}</b> annonce{a.trouvees > 1 ? "s" : ""} trouvée{a.trouvees > 1 ? "s" : ""} · {a.mails} e-mail{a.mails > 1 ? "s" : ""}
                    </p>
                  </div>
                  <button type="button" onClick={() => reactiver(a)} className="btn btn-sm">Réactiver</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="carte p-5 text-sm text-ink-3">Aucune alerte supprimée.</p>
          )}
        </section>
      )}
    </div>
  );
}

/** Les photos des annonces trouvées par la recherche (vignettes Leboncoin), pour reconnaître la voiture d'un coup d'œil. */
function Vignettes({ urls, nom }: { urls: string[]; nom: string }) {
  if (!urls.length)
    return (
      <span className="hidden size-16 place-items-center rounded-xl border border-dashed border-line-2 text-ink-3 sm:grid" aria-hidden="true">
        <Ico nom="parc" className="size-6" />
      </span>
    );
  return (
    <span className="flex gap-1.5" aria-label={`Photos des annonces trouvées : ${nom}`}>
      {urls.slice(0, 4).map((u, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- vignette servie par Leboncoin
        <img key={u} src={u} alt="" loading="lazy" referrerPolicy="no-referrer" className={cx("h-16 w-20 rounded-xl border border-line object-cover", i > 1 && "max-sm:hidden")} />
      ))}
    </span>
  );
}
