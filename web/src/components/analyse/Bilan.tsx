"use client";
/* Bilan d'une annonce, en tête de chaque rapport (particulier et Benef) : verdict et action, note sur 100,
   quatre réponses (Fiable ? Des travaux ? Bon prix ? Ça rapporte / Combien par mois ?), ce qu'il faut demander
   au vendeur avant de se déplacer, l'argent et les travaux. Recalculé dans le navigateur avec le profil courant :
   changer son profil met à jour tous les rapports. */
import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { bilan, type Bilan as BilanT, type Pilier } from "@/lib/analyse/bilan";
import type { Analyse } from "@/lib/analyse/couts";
import { probaTexte, type SourcePoste } from "@/lib/analyse/travaux";
import type { TonVerdict } from "@/lib/analyse/verdicts";
import type { Detail } from "@/lib/offres";
import { cx } from "@/lib/cx";
import { Copier } from "../ui";
import { PuceProfil, useProfilAnalyse } from "./ProfilAnalyse";

const eur = (v: number | null | undefined) => (v == null || !isFinite(v) ? "—" : `${Math.round(v).toLocaleString("fr-FR")} €`);
const signe = (v: number | null) => (v == null ? "—" : v >= 0 ? `+${eur(v)}` : `−${eur(-v)}`);

const TEXTE: Record<TonVerdict, string> = { ok: "text-ok", o: "text-o2", warn: "text-warn", bad: "text-bad", neutre: "text-ink" };
const FOND: Record<TonVerdict, string> = { ok: "from-ok/15 border-ok/40", o: "from-o/15 border-o/40", warn: "from-warn/15 border-warn/40", bad: "from-bad/15 border-bad/40", neutre: "from-glass border-line-2" };
const BARRE: Record<TonVerdict, string> = { ok: "bg-ok", o: "bg-o2", warn: "bg-warn", bad: "bg-bad", neutre: "bg-ink-3" };
const TRAIT: Record<TonVerdict, string> = { ok: "stroke-ok", o: "stroke-o2", warn: "stroke-warn", bad: "stroke-bad", neutre: "stroke-ink-3" };
const SOURCES: Record<SourcePoste, string> = { annonce: "Annonce", photos: "Photos", ia: "Analyse", entretien: "Entretien", moteur: "Réputation" };

/** Bilan avec le profil courant ; `prix` et `remise` : simulation (prix envisagé, travaux modifiés). */
export function useBilan(a: Analyse, o: { prix?: number | null; distance?: number | null; travaux?: number | null; remise?: number | null } = {}) {
  const { profil } = useProfilAnalyse();
  return useMemo(() => bilan(a, profil, o), [a, profil, o.prix, o.distance, o.travaux, o.remise]); // eslint-disable-line react-hooks/exhaustive-deps
}

function Anneau({ v, ton }: { v: number | null; ton: TonVerdict }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid size-32 shrink-0 place-items-center" role="img" aria-label={v == null ? "Note indisponible" : `Note ${v} sur 100`}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="9" className="stroke-line" />
        {v != null && <circle cx="60" cy="60" r={r} fill="none" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${(c * v) / 100} ${c}`} className={cx("transition-[stroke-dasharray] duration-700", TRAIT[ton])} />}
      </svg>
      <div className="text-center leading-none">
        <span className="num font-display text-4xl font-semibold">{v ?? "—"}</span>
        <span className="block text-xs text-ink-3">sur 100</span>
      </div>
    </div>
  );
}

function CartePilier({ p }: { p: Pilier }) {
  return (
    <details className="group rounded-2xl border border-line bg-black/20 p-4 open:bg-black/30">
      <summary className="grid cursor-pointer list-none gap-1.5">
        <span className="flex items-center justify-between gap-2 text-sm text-ink-3">
          {p.question}
          <span className="text-ink-3 transition group-open:rotate-90" aria-hidden="true">›</span>
        </span>
        <span className={cx("font-display text-2xl font-semibold leading-tight", TEXTE[p.ton])}>{p.reponse}</span>
        <span className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <span className={cx("block h-full rounded-full", BARRE[p.ton])} style={{ width: `${p.score ?? 0}%` }} />
        </span>
        <span className="text-sm text-ink-2">{p.sous}</span>
        {p.score != null && <span className="sr-only">Note {p.score} sur 100.</span>}
      </summary>
      {p.raisons.length > 0 && (
        <ul className="mt-3 grid gap-1.5 border-t border-line pt-3 text-sm">
          {p.raisons.map((x, i) => (
            <li key={i} className="flex gap-2">
              <span className={cx("mt-0.5 shrink-0 font-bold", x.s === 1 ? "text-ok" : x.s === -1 ? "text-warn" : "text-ink-3")} aria-hidden="true">
                {x.s === 1 ? "+" : x.s === -1 ? "−" : "·"}
              </span>
              <span className="text-ink-2">{x.t}</span>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}

function Bloc({ titre, aside, children }: { titre: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-panel p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold tracking-tight">{titre}</h2>
        {aside && <span className="text-sm text-ink-3">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

/** Bilan complet. `detail` (formules particulier) : « simple » montre les deux premières questions sans le message. */
export function Bilan({ a, b, detail = "complet", lien, argent }: { a: Analyse; b: BilanT; detail?: Detail; lien?: string | null; /** Bloc d'argent propre à l'écran (remplace celui du bilan). */ argent?: ReactNode }) {
  const { profil } = useProfilAnalyse();
  const simple = detail === "simple";
  // sans IA, le message de l'outil (il pose la question qui compte pour ce moteur) ; avec l'IA, le sien
  const message = (!a.regles && a.ia?.messageVendeur) || b.message;
  const revente = profil.objectif === "revente";
  const g = b.argent;
  const lexique = (a.rapport?.lexique ?? []).filter((x) => x?.terme && x.sens);
  // alertes de l'IA qui ne répètent pas la réputation du moteur déjà montrée dans « Fiable ? »
  const alertes = (a.ia?.alertes ?? []).filter((x) => !b.connus.some((c) => x.startsWith(c.nom)));
  // questions de l'outil d'abord (faiblesses connues, entretien), puis celles de l'analyse IA qui ne les répètent pas
  const cle = (q: string) => q.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "").slice(0, 28);
  const vues = new Set(b.questions.map((q) => cle(q.q)));
  const questions = [...b.questions, ...(a.ia?.questions ?? []).filter((q) => q && !vues.has(cle(q)) && !/contr[oô]le technique|histovec/i.test(q) && !(/^depuis/i.test(q) && b.questions.some((x) => /^depuis/i.test(x.q)))).slice(0, 3).map((q) => ({ q, pourquoi: "Conseillé par l'analyse de l'annonce", montant: undefined as number | undefined }))].slice(0, 7);
  return (
    <div className="grid gap-5">
      {/* Verdict */}
      <section className={cx("rounded-3xl border bg-gradient-to-b to-panel p-6 sm:p-8", FOND[b.ton])} aria-labelledby="bilan-verdict">
        <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-3">Avant le premier message</p>
            <h1 id="bilan-verdict" className={cx("mt-2 font-display text-[clamp(32px,6vw,52px)] font-semibold leading-none tracking-tight", TEXTE[b.ton])}>
              {b.libelle}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-ink">{b.phrase}</p>
            <p className="mt-2 max-w-2xl text-ink-2">
              <b className="text-ink">À faire :</b> {b.action}
            </p>
          </div>
          <Anneau v={b.indice} ton={b.ton} />
        </div>
        {b.aSavoir.length > 0 && (
          <ul className="mt-5 grid gap-1.5 sm:grid-cols-2">
            {b.aSavoir.map((x, i) => (
              <li key={i} className="flex gap-2 text-[15px]">
                <span className={cx("mt-0.5 shrink-0", x.s === 1 ? "text-ok" : x.s === -1 ? "text-warn" : "text-ink-3")} aria-hidden="true">
                  {x.s === 1 ? "✓" : x.s === -1 ? "!" : "•"}
                </span>
                <span className="text-ink-2">{x.t}</span>
              </li>
            ))}
          </ul>
        )}
        {alertes.length > 0 && (
          <div className="mt-4 rounded-2xl border border-warn/30 bg-warn/5 p-3">
            <p className="text-sm font-medium text-warn">Vu par l&apos;analyse de l&apos;annonce</p>
            <ul className="mt-1 grid gap-1 text-sm text-ink-2">
              {alertes.slice(0, 4).map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-5 grid gap-2 border-t border-line pt-4">
          <details className="text-sm">
            <summary className="cursor-pointer list-none text-ink-2">
              <span className={cx("mr-2 inline-block size-2 rounded-full", b.confiance.score >= 70 ? "bg-ok" : b.confiance.score >= 45 ? "bg-warn" : "bg-bad")} aria-hidden="true" />
              {b.confiance.label}
              {b.confiance.ameliorer.length > 0 && <span className="text-ink-3"> · comment l&apos;affiner ›</span>}
            </summary>
            {b.confiance.ameliorer.length > 0 && (
              <ul className="mt-2 grid list-disc gap-1 pl-5 text-ink-3 marker:text-o2">
                {b.confiance.ameliorer.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            )}
          </details>
          {b.limites.length > 0 && <p className="text-sm text-ink-3">Note limitée : {b.limites.join(" ; ")}.</p>}
          <PuceProfil />
        </div>
      </section>

      {/* Les quatre questions */}
      <div className="grid gap-3 sm:grid-cols-2">
        {b.piliers.map((p) => (
          <CartePilier key={p.cle} p={p} />
        ))}
      </div>

      {/* Ce qu'on ne sait pas encore */}
      {questions.length > 0 && (
        <Bloc titre="Avant de vous déplacer, demandez" aside={simple ? undefined : <Copier texte={questions.map((q) => q.q).join("\n")} label="Copier les questions" />}>
          <ol className="grid gap-2.5">
            {questions.slice(0, simple ? 2 : 7).map((q, i) => (
              <li key={q.q} className="grid grid-cols-[auto_1fr] gap-3">
                <span className="grid size-6 place-items-center rounded-full border border-o/40 text-xs font-semibold text-o2">{i + 1}</span>
                <span>
                  {q.q}
                  <span className="block text-sm text-ink-3">
                    {q.pourquoi}
                    {q.montant ? ` · jusqu'à ${eur(q.montant)} en jeu` : ""}
                  </span>
                </span>
              </li>
            ))}
          </ol>
          {simple ? (
            <p className="mt-4 rounded-2xl border border-dashed border-line-2 p-3 text-sm text-ink-2">
              Toutes les questions et le premier message prêt à envoyer sont inclus dès Essentiel.{" "}
              <Link href="/tarifs#particuliers" className="text-o2 underline underline-offset-4">
                Voir les formules
              </Link>
            </p>
          ) : (
            <div className="mt-5">
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm text-ink-3">Premier message, prêt à envoyer</h3>
                <div className="flex gap-2">
                  <Copier texte={message} label="Copier le message" />
                  {lien && (
                    <a href={lien} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line-2 px-3 py-1 text-sm text-ink-2 transition hover:border-o/50 hover:text-ink">
                      Ouvrir l&apos;annonce
                    </a>
                  )}
                </div>
              </div>
              <p className="rounded-xl border border-line bg-black/25 p-3 text-ink-2">{message}</p>
            </div>
          )}
        </Bloc>
      )}

      {/* L'argent */}
      {argent ??
        (revente ? (
          <Bloc titre="Ce qu'il vous resterait" aside={`minimum visé : ${eur(g.seuil)}`}>
            <div className="grid gap-2 sm:grid-cols-3">
              {g.scenarios.map((s) => (
                <div key={s.cle} className={cx("rounded-2xl border p-4", g.retenu?.cle === s.cle ? "border-o/50 bg-o/10" : "border-line")}>
                  <p className="text-sm text-ink-3">
                    {s.l} · {s.delai}
                  </p>
                  <p className="num mt-1 text-sm text-ink-2">Revente {eur(s.revente)}</p>
                  <p className={cx("num font-display text-2xl font-semibold", s.marge == null ? "" : s.marge >= g.seuil ? "text-ok" : s.marge >= 0 ? "text-warn" : "text-bad")}>{signe(s.marge)}</p>
                  {g.retenu?.cle === s.cle && <p className="text-xs text-o2">Votre rythme de revente</p>}
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                ["Offre d'ouverture", g.offre, "après la visite"],
                ["Objectif", g.cible, "prix à viser"],
                ["Prix à ne pas dépasser", g.plafond != null && g.plafond > 0 ? g.plafond : null, `pour garder ${eur(g.seuil)}`],
              ].map(([l, v, d]) => (
                <div key={l as string} className="rounded-2xl border border-line bg-black/20 p-3">
                  <p className="text-xs text-ink-3">{l as string}</p>
                  <p className="num font-display text-xl font-semibold">{eur(v as number | null)}</p>
                  <p className="text-xs text-ink-3">{d as string}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-ink-3">
              Frais comptés : travaux {eur(g.travauxRetenus)} (marge de prudence comprise), carte grise {eur(g.cg)}, trajet {g.trajet != null ? eur(g.trajet) : "inconnu"}, frais {eur(g.fraisFixes)}. Revente {g.liquidite === "inconnue" ? "difficile à évaluer" : `${g.liquidite === "forte" ? "facile" : g.liquidite === "moyenne" ? "normale" : "plus lente"}`}.
            </p>
          </Bloc>
        ) : (
          <Bloc titre="Ce qu'elle va vous coûter">
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-line bg-black/20 p-4">
                <p className="text-sm text-ink-3">Coût réel d&apos;achat</p>
                <p className="num font-display text-2xl font-semibold text-o2">{eur(g.coutReel)}</p>
                <p className="text-xs text-ink-3">prix, carte grise, trajet, CT, petites réparations</p>
              </div>
              <div className="rounded-2xl border border-line bg-black/20 p-4">
                <p className="text-sm text-ink-3">Ensuite, chaque mois</p>
                <p className="num font-display text-2xl font-semibold">{g.mensuel != null ? `≈ ${eur(g.mensuel)}` : "—"}</p>
                <p className="text-xs text-ink-3">perte de valeur, entretien, travaux ; hors carburant et assurance</p>
              </div>
              <div className="rounded-2xl border border-line bg-black/20 p-4">
                <p className="text-sm text-ink-3">Prix raisonnable à proposer</p>
                <p className="num font-display text-2xl font-semibold">{g.proposer != null && g.prix != null && g.proposer < g.prix ? eur(g.proposer) : g.prix != null ? eur(g.prix) : "—"}</p>
                <p className="text-xs text-ink-3">{g.proposer != null && g.prix != null && g.proposer < g.prix ? `${eur(g.prix - g.proposer)} sous le prix affiché` : "le prix affiché est cohérent"}</p>
              </div>
            </div>
            {g.budgetDepasse ? <p className="mt-3 text-sm text-warn">{eur(g.budgetDepasse)} au-dessus de votre budget.</p> : null}
          </Bloc>
        ))}

      {/* Travaux */}
      {b.travaux.postes.length > 0 && (
        <Bloc titre="Travaux à prévoir sur 12 mois" aside={`probable : ${eur(b.travaux.probable)}`}>
          <ul className="divide-y divide-line">
            {b.travaux.postes.slice(0, simple ? 3 : 12).map((x) => (
              <li key={x.cle} className="grid gap-1 py-2.5 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-4">
                <span>
                  {x.libelle}
                  <span className="mt-0.5 flex flex-wrap gap-1.5 text-xs">
                    <span className="rounded-full border border-line-2 px-2 py-px text-ink-3">{SOURCES[x.source]}</span>
                    <span className={cx("rounded-full border px-2 py-px", x.piege ? "border-bad/40 text-bad" : x.proba >= 1 ? "border-warn/40 text-warn" : x.proba >= 0.5 ? "border-o/40 text-o2" : "border-line-2 text-ink-3")}>{x.piege ? "rédhibitoire" : probaTexte(x.proba)}</span>
                    {x.pourquoi && <span className="text-ink-3">{x.pourquoi}</span>}
                  </span>
                </span>
                <span className="num shrink-0 text-ink-2">{x.nc ? "à chiffrer sur place" : `${eur(x.min)} à ${eur(x.max)}`}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ink-3">
            « Sûr » : écrit dans l&apos;annonce ou vu sur les photos. « Probable » et « possible » : entretien arrivé à échéance ou faiblesse connue du moteur, comptés à leur probabilité dans le total.
          </p>
        </Bloc>
      )}

      {lexique.length > 0 && profil.experience !== "pro" && (
        <details className="rounded-3xl border border-line bg-panel p-5 sm:p-6">
          <summary className="cursor-pointer font-display text-lg font-semibold">Les mots du rapport, expliqués</summary>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {lexique.map((x) => (
              <div key={x.terme}>
                <dt className="font-medium">{x.terme}</dt>
                <dd className="text-ink-3">{x.sens}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </div>
  );
}
