"use client";
import Link from "next/link";
import { cx, inputCls } from "@/lib/cx";
import { useReglages } from "@/components/ui";
import { titreVehicule } from "@/lib/titre";
import { niveauDe, type LigneAnalyse } from "./ListeAnalyses";
import { estFavorable, infoVerdict } from "@/lib/analyse/verdicts";

/* Tableau de bord particulier : le projet d'achat, pas des chiffres.
   Où j'en suis (5 étapes), mon budget, ma sélection classée et la liste du jour de la visite. Retenu dans ce navigateur. */

type Projet = { budget: string; etapes: string[]; visite: string[] };
const DEFAUT: Projet = { budget: "", etapes: [], visite: [] };
const VISITE = [
  ["cg", "Carte grise au nom du vendeur, adresse identique à sa pièce d'identité"],
  ["ct", "Contrôle technique de moins de 6 mois, sans contre-visite en attente"],
  ["gage", "Certificat de non-gage de moins de 15 jours (gratuit sur HistoVec)"],
  ["histovec", "Rapport HistoVec : propriétaires, sinistres, kilométrage déclaré"],
  ["factures", "Carnet et factures d'entretien (courroie, vidange, embrayage)"],
  ["froid", "Démarrage moteur froid, sans fumée ni bruit anormal"],
  ["essai", "Essai sur route : freins, boîte, direction, voyants éteints"],
  ["cles", "Double des clés et code de l'autoradio"],
] as const;

export function ProjetAchat({ lignes }: { lignes: LigneAnalyse[] }) {
  const [p, maj] = useReglages<Projet>("utp-projet", DEFAUT);
  const budget = Number(p.budget.replace(/\s/g, "")) || null;
  const bascule = (k: "etapes" | "visite", id: string) => maj({ [k]: p[k].includes(id) ? p[k].filter((x) => x !== id) : [...p[k], id] });

  const etapes = [
    { id: "reperer", l: "Repérer", d: "Analyser une première annonce", fait: lignes.length >= 1, auto: true },
    { id: "comparer", l: "Comparer", d: "En analyser au moins deux", fait: lignes.length >= 2, auto: true },
    { id: "contacter", l: "Contacter", d: "Poser les questions au vendeur", fait: p.etapes.includes("contacter"), auto: false },
    { id: "visiter", l: "Visiter", d: "Vérifier sur place et essayer", fait: p.etapes.includes("visiter"), auto: false },
    { id: "acheter", l: "Acheter", d: "Signer, payer, carte grise", fait: p.etapes.includes("acheter"), auto: false },
  ];
  const courante = etapes.findIndex((e) => !e.fait);
  const selection = [...lignes].sort((a, b) => infoVerdict(a.verdict).ordre - infoVerdict(b.verdict).ordre || (b.note ?? 0) - (a.note ?? 0));
  const piste = selection.find((x) => estFavorable(x.verdict) && (!budget || (x.prix ?? 0) <= budget));
  const coche = p.visite.length;

  return (
    <div className="grid gap-8">
      <section aria-labelledby="pa-etapes" className="carte grid gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="pa-etapes" className="font-display text-xl font-semibold">Où en est votre achat ?</h2>
            <p className="mt-1 text-sm text-ink-3">{courante === -1 ? "Bravo, c'est fait. Bonne route !" : `Prochaine étape : ${etapes[courante].d.toLowerCase()}.`}</p>
          </div>
          <label className="grid gap-1 text-sm">
            <span className="text-ink-2">Mon budget maximum</span>
            <span className="relative">
              <input inputMode="numeric" value={p.budget} onChange={(e) => maj({ budget: e.target.value.replace(/[^\d\s]/g, "").slice(0, 9) })} placeholder="ex. 8 000" className={cx(inputCls, "w-40 pr-8")} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3">€</span>
            </span>
          </label>
        </div>
        <ol className="grid grid-cols-5 gap-1.5 sm:gap-3">
          {etapes.map((e, i) => (
            <li key={e.id} className="grid gap-2">
              <span className={cx("h-1.5 rounded-full", e.fait ? "bg-o" : i === courante ? "bg-o/40" : "bg-line")} aria-hidden="true" />
              {e.auto ? (
                <span className="text-xs sm:text-sm">
                  <b className={cx("block font-medium", e.fait ? "text-ink" : "text-ink-3")}>{e.fait ? "✓ " : ""}{e.l}</b>
                  <span className="hidden text-ink-3 sm:block">{e.d}</span>
                </span>
              ) : (
                <button type="button" aria-pressed={e.fait} onClick={() => bascule("etapes", e.id)} className="text-left text-xs sm:text-sm">
                  <b className={cx("block font-medium", e.fait ? "text-ink" : "text-ink-3")}>{e.fait ? "✓ " : ""}{e.l}</b>
                  <span className="hidden text-ink-3 sm:block">{e.fait ? "fait · annuler" : e.d}</span>
                </button>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="pa-selection" className="grid gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="pa-selection" className="font-display text-xl font-semibold">Ma sélection</h2>
          {lignes.length > 0 && <Link href="/app/rapports" className="text-sm text-o2 underline-offset-4 hover:underline">Toutes mes analyses</Link>}
        </div>
        {piste && (
          <Link href={`/app/rapports/${piste.id}`} className="carte group grid gap-2 border-ok/30 p-5 transition hover:border-ok/60 sm:grid-cols-[1fr_auto] sm:items-center">
            <span>
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-ok">Votre meilleure piste{budget ? " dans le budget" : ""}</span>
              <span className="mt-1 block font-display text-xl font-semibold group-hover:text-o2">{titreVehicule(piste.titre)}</span>
              <span className="text-sm text-ink-3">{niveauDe(piste.verdict).l}{piste.note != null ? ` · note ${piste.note} sur 100` : ""}</span>
            </span>
            <span className="num font-display text-2xl font-semibold">{piste.prix != null ? `${piste.prix.toLocaleString("fr-FR")} €` : "—"}</span>
          </Link>
        )}
        {selection.length ? (
          <ul className="grid gap-2">
            {selection.map((r, i) => {
              const n = niveauDe(r.verdict);
              const depasse = budget && r.prix != null && r.prix > budget ? r.prix - budget : 0;
              return (
                <li key={r.id} className="min-w-0">
                  <Link href={`/app/rapports/${r.id}`} className="carte flex items-center gap-3 p-3 transition hover:border-o/40 sm:gap-4 sm:p-4">
                    {r.photos?.[0] ? (
                      <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element -- photo de l'annonce */}
                        <img src={r.photos[0]} alt="" referrerPolicy="no-referrer" loading="lazy" className="size-full object-cover" />
                        <span className="num absolute left-0.5 top-0.5 rounded-full bg-black/70 px-1.5 text-[10px] text-white">{i + 1}</span>
                      </span>
                    ) : (
                      <span className="num grid size-8 shrink-0 place-items-center rounded-full bg-glass text-sm text-ink-3">{i + 1}</span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{titreVehicule(r.titre)}</span>
                      <span className="flex flex-wrap gap-x-2 text-xs text-ink-3">
                        <span className={cx("rounded-full border px-2 py-px font-medium", n.ton)}>{n.l}</span>
                        {depasse ? <span className="text-warn">{depasse.toLocaleString("fr-FR")} € au-dessus du budget</span> : budget && r.prix != null ? <span className="text-ok">dans le budget</span> : null}
                      </span>
                    </span>
                    <b className="num shrink-0">{r.prix != null ? `${r.prix.toLocaleString("fr-FR")} €` : "—"}</b>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="carte p-5 text-ink-2">Votre sélection est vide : collez le lien d&apos;une annonce ci-dessus. Chaque voiture analysée vient s&apos;y ranger, de la meilleure affaire à celle à éviter.</p>
        )}
      </section>

      <section aria-labelledby="pa-visite" className="carte grid gap-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="pa-visite" className="font-display text-xl font-semibold">Le jour de la visite</h2>
          <span className="num text-sm text-ink-3">{coche} / {VISITE.length} vérifié{coche > 1 ? "s" : ""}</span>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {VISITE.map(([id, l]) => (
            <li key={id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3 text-sm hover:bg-glass">
                <input type="checkbox" checked={p.visite.includes(id)} onChange={() => bascule("visite", id)} className="mt-0.5 size-4 shrink-0 accent-[#ff5a1f]" />
                <span className={cx(p.visite.includes(id) ? "text-ink-3 line-through" : "text-ink-2")}>{l}</span>
              </label>
            </li>
          ))}
        </ul>
        {coche > 0 && (
          <button type="button" onClick={() => maj({ visite: [] })} className="justify-self-start text-sm text-ink-3 underline-offset-4 hover:underline">
            Tout décocher pour la prochaine voiture
          </button>
        )}
      </section>
    </div>
  );
}
