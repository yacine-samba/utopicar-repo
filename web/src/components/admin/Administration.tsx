"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CompteAdmin, JournalAdmin, LeadAdmin } from "@/lib/admin";
import type { GuideId } from "@/lib/guides";
import { OFFRES, type OffreId } from "@/lib/offres";
import { cx, inputCls, Pastille } from "../ui";

const dateFr = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
const heureFr = (d: string) => new Date(d).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const nomOffre = (id: OffreId) => (OFFRES[id].famille === "benef" ? `Benef ${OFFRES[id].nom}` : OFFRES[id].nom);
export type GuideChoix = { id: GuideId; titre: string; pour: string };
const FORMULES: OffreId[] = ["essentiel", "serenite", "starter", "croissance", "pro"];
const ACTIONS: Record<string, string> = {
  formule_offerte: "Formule offerte",
  formule_retiree: "Formule offerte retirée",
  credits_offerts: "Crédits offerts",
  guides_offerts: "Guide envoyé à un compte",
  messages_offerts: "Option Messages offerte",
  messages_retires: "Option Messages retirée",
  guide_lead: "Guide envoyé à un inscrit",
};

/** Appel à /api/admin : message à afficher, et rechargement des données si tout s'est bien passé. */
function useAction() {
  const router = useRouter();
  const [charge, setCharge] = useState(false);
  const [etat, setEtat] = useState<{ ok: boolean; t: string } | null>(null);
  const lancer = async (corps: Record<string, unknown>) => {
    setCharge(true);
    setEtat(null);
    try {
      const r = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps) });
      const j = await r.json().catch(() => ({}));
      setEtat(r.ok ? { ok: true, t: j.message ?? "C'est fait." } : { ok: false, t: j.erreur ?? "Action impossible." });
      if (r.ok) router.refresh();
    } catch {
      setEtat({ ok: false, t: "Connexion impossible. Réessayez." });
    }
    setCharge(false);
  };
  return { charge, etat, lancer };
}

function Etat({ etat }: { etat: { ok: boolean; t: string } | null }) {
  return (
    <p role="status" className={cx("text-sm", etat?.ok ? "text-ok" : "text-warn")}>
      {etat?.t}
    </p>
  );
}

function Prevenir({ v, set }: { v: boolean; set: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink-2">
      <input type="checkbox" checked={v} onChange={(e) => set(e.target.checked)} className="size-4 accent-[#ff5a1f]" />
      Prévenir par e-mail
    </label>
  );
}

function ChoixGuide({ guides, v, set, label = "Guide" }: { guides: GuideChoix[]; v: GuideId; set: (g: GuideId) => void; label?: string }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="text-ink-2">{label}</span>
      <select value={v} onChange={(e) => set(e.target.value as GuideId)} className={cx(inputCls, "max-w-full")}>
        {guides.map((g) => (
          <option key={g.id} value={g.id}>
            {g.titre} ({g.pour})
          </option>
        ))}
      </select>
    </label>
  );
}

function FicheCompte({ c, guides }: { c: CompteAdmin; guides: GuideChoix[] }) {
  const { charge, etat, lancer } = useAction();
  const [formule, setFormule] = useState<OffreId | "">(c.offerte?.id ?? "starter");
  const [jusquAu, setJusquAu] = useState(c.offerte?.jusquAu ?? "");
  const [n, setN] = useState(5);
  const [prevenir, setPrevenir] = useState(true);
  const [guide, setGuide] = useState<GuideId>(guides[0].id);
  return (
    <div className="grid gap-5 border-t border-line pt-4">
      {c.illimite && <p className="text-sm text-ink-3">Compte illimité : tout est déjà ouvert.</p>}
      {c.stripe && (
        <p className="text-sm text-ink-3">
          Stripe : {c.stripe.offre} · {c.stripe.statut}
          {c.stripe.periodeFin ? ` · fin de période le ${dateFr(c.stripe.periodeFin)}` : ""}. Une formule offerte passe avant.
        </p>
      )}

      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          lancer({ action: "formule", user: c.id, formule: formule || null, jusquAu: jusquAu || null, prevenir });
        }}
      >
        <p className="text-sm font-medium">Offrir une formule</p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Formule</span>
            <select value={formule} onChange={(e) => setFormule(e.target.value as OffreId)} className={inputCls}>
              {FORMULES.map((f) => (
                <option key={f} value={f}>
                  {nomOffre(f)} ({OFFRES[f].analyses} analyses/mois)
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Jusqu&apos;au (inclus, vide = sans fin)</span>
            <input type="date" value={jusquAu} onChange={(e) => setJusquAu(e.target.value)} className={inputCls} />
          </label>
          <button type="submit" disabled={charge} className="btn btn-sm">
            Offrir
          </button>
          {c.offerte && (
            <button type="button" disabled={charge} className="btn btn-sm" onClick={() => lancer({ action: "formule", user: c.id, formule: null, jusquAu: null })}>
              Retirer la formule offerte
            </button>
          )}
        </div>
      </form>

      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          lancer({ action: "credits", user: c.id, n, prevenir });
        }}
      >
        <p className="text-sm font-medium">Offrir des crédits d&apos;analyse</p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Nombre (solde actuel : {c.credits})</span>
            <input type="number" min={1} max={500} value={n} onChange={(e) => setN(Math.max(1, Math.min(500, Number(e.target.value) || 1)))} className={cx(inputCls, "w-28")} />
          </label>
          <button type="submit" disabled={charge} className="btn btn-sm">
            Ajouter
          </button>
        </div>
      </form>

      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          lancer({ action: "guides", user: c.id, guide, prevenir });
        }}
      >
        <p className="text-sm font-medium">Envoyer un guide</p>
        <div className="flex flex-wrap items-end gap-3">
          <ChoixGuide guides={guides} v={guide} set={setGuide} />
          <button type="submit" disabled={charge} className="btn btn-sm">
            Envoyer ce guide
          </button>
        </div>
        <p className="text-xs text-ink-3">Ouvre seulement ce guide sur ce compte{c.guides.length ? ` (déjà ouverts : ${c.guides.map((x) => guides.find((g) => g.id === x)?.titre ?? x).join(", ")})` : ""}. L&apos;e-mail y mène directement (case « Prévenir par e-mail »).</p>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={charge} className="btn btn-sm" onClick={() => lancer({ action: "messages", user: c.id, actif: !c.messages })}>
          {c.messages ? "Retirer l'option Messages" : "Offrir l'option Messages"}
        </button>
        <span className="text-xs text-ink-3">L&apos;option Messages ne marche qu&apos;avec Benef Pro.</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Prevenir v={prevenir} set={setPrevenir} />
        <Etat etat={etat} />
      </div>
    </div>
  );
}

function ListeComptes({ comptes, moi, guides }: { comptes: CompteAdmin[]; moi: string; guides: GuideChoix[] }) {
  if (!comptes.length) return <p className="carte p-6 text-ink-3">Aucun compte ne correspond.</p>;
  return (
    <ul className="grid gap-2">
      {comptes.map((c) => (
        <li key={c.id}>
          <details className="carte group p-4">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">
                  {c.prenom || "Sans prénom"}
                  {c.id === moi && <span className="text-ink-3"> (vous)</span>}
                </span>
                <span className="block truncate text-sm text-ink-3">{c.email}</span>
              </span>
              <span className="flex flex-wrap items-center gap-2 text-sm">
                <Pastille ton={c.illimite ? "o" : OFFRES[c.formule].prix > 0 ? "ok" : "neutre"}>
                  {c.illimite ? "Illimité" : nomOffre(c.formule)}
                  {c.offerte && !c.illimite ? " · offerte" : ""}
                </Pastille>
                {c.credits > 0 && <Pastille>{c.credits} crédit{c.credits > 1 ? "s" : ""}</Pastille>}
                {c.guides.length > 0 && <Pastille>{c.guides.length === 4 ? "4 guides" : `${c.guides.length} guide${c.guides.length > 1 ? "s" : ""}`}</Pastille>}
                <span className="num text-ink-3">{c.analysesMois} analyse{c.analysesMois > 1 ? "s" : ""} ce mois</span>
                <span className="text-ink-3">inscrit le {dateFr(c.inscritLe)}</span>
              </span>
            </summary>
            <div className="mt-4">
              <FicheCompte c={c} guides={guides} />
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}

function LigneInscrit({ l, guides }: { l: LeadAdmin; guides: GuideChoix[] }) {
  const { charge, etat, lancer } = useAction();
  const [guide, setGuide] = useState<GuideId>(l.guide);
  return (
    <li className="carte grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <p className="truncate font-medium">
          {l.prenom || "Sans prénom"} <span className="font-normal text-ink-3">· {l.email}</span>
        </p>
        <p className="mt-1 text-sm text-ink-3">
          {l.site === "ebook" ? "Bénef" : "Utopicar"} · {[l.objectif, l.budget, l.source].filter(Boolean).join(" · ") || "sans détail"} · inscrit le {dateFr(l.inscritLe)}
        </p>
        <p className="mt-2 flex flex-wrap gap-2">
          {l.desinscrit ? (
            <Pastille ton="bad">Désinscrit</Pastille>
          ) : l.ouvert ? (
            <Pastille ton="ok">Guide ouvert {l.ouvertures} fois</Pastille>
          ) : l.envoye ? (
            <Pastille ton="warn">Envoyé, pas encore ouvert</Pastille>
          ) : (
            <Pastille ton="bad">Pas encore envoyé</Pastille>
          )}
          {l.compte && <Pastille ton="o">A un compte</Pastille>}
        </p>
      </div>
      <div className="grid justify-items-start gap-2 sm:justify-items-end">
        {!l.desinscrit && (
          <form
            className="flex flex-wrap items-end gap-2 sm:justify-end"
            onSubmit={(e) => {
              e.preventDefault();
              lancer({ action: "guide_lead", lead: l.id, guide });
            }}
          >
            <ChoixGuide guides={guides} v={guide} set={setGuide} label="Guide à envoyer" />
            <button type="submit" disabled={charge} className="btn btn-sm">
              {charge ? "Envoi…" : "Envoyer"}
            </button>
          </form>
        )}
        {l.dernierEnvoi && <span className="text-xs text-ink-3">Dernier envoi : {heureFr(l.dernierEnvoi)}</span>}
        <Etat etat={etat} />
      </div>
    </li>
  );
}

export function Administration({ comptes, inscrits, journal, moi, guides }: { comptes: CompteAdmin[]; inscrits: LeadAdmin[]; journal: JournalAdmin[]; moi: string; guides: GuideChoix[] }) {
  const [onglet, setOnglet] = useState<"comptes" | "inscrits" | "journal">("comptes");
  const [q, setQ] = useState("");
  const cherche = (...champs: string[]) => !q.trim() || champs.some((c) => c.toLowerCase().includes(q.trim().toLowerCase()));
  const onglets = [
    ["comptes", `Comptes (${comptes.length})`],
    ["inscrits", `Inscrits au guide (${inscrits.length})`],
    ["journal", "Journal"],
  ] as const;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Rubriques" className="flex flex-wrap gap-2 text-sm">
          {onglets.map(([id, l]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={onglet === id}
              onClick={() => setOnglet(id)}
              className={cx("rounded-full border px-3 py-1.5", onglet === id ? "border-o/50 bg-o/10 text-ink" : "border-line-2 text-ink-2 hover:text-ink")}
            >
              {l}
            </button>
          ))}
        </div>
        {onglet !== "journal" && (
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher un prénom ou un e-mail" aria-label="Chercher un prénom ou un e-mail" className={cx(inputCls, "w-full sm:w-72")} />
        )}
      </div>

      {onglet === "comptes" && <ListeComptes comptes={comptes.filter((c) => cherche(c.email, c.prenom))} moi={moi} guides={guides} />}

      {onglet === "inscrits" &&
        (inscrits.length ? (
          <ul className="grid gap-2">
            {inscrits.filter((l) => cherche(l.email, l.prenom)).map((l) => (
              <LigneInscrit key={l.id} l={l} guides={guides} />
            ))}
          </ul>
        ) : (
          <p className="carte p-6 text-ink-3">Personne ne s&apos;est encore inscrit au guide.</p>
        ))}

      {onglet === "journal" &&
        (journal.length ? (
          <ul className="carte divide-y divide-line">
            {journal.map((j) => (
              <li key={j.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm">
                <span>
                  <b className="font-medium">{ACTIONS[j.action] ?? j.action}</b>
                  {j.cible && <span className="text-ink-3"> · {j.cible}</span>}
                  {typeof j.details.n === "number" && <span className="text-ink-3"> · {j.details.n} crédits</span>}
                  {typeof j.details.guide === "string" && <span className="text-ink-3"> · {guides.find((g) => g.id === j.details.guide)?.titre ?? j.details.guide}</span>}
                  {typeof j.details.formule === "string" && j.details.formule in OFFRES && <span className="text-ink-3"> · {nomOffre(j.details.formule as OffreId)}</span>}
                </span>
                <span className="text-ink-3">{heureFr(j.le)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="carte p-6 text-ink-3">Rien d&apos;offert pour l&apos;instant.</p>
        ))}
    </div>
  );
}
