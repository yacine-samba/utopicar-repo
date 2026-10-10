"use client";
import Link from "next/link";
import { useState } from "react";
import { coutParticulier, eur, type Analyse } from "@/lib/analyse/couts";
import { OFFRES, PACKS, prixTxt } from "@/lib/offres";
import { Panneau, Pastille, cx, inputCls, type Ton } from "../ui";
import { AnalysePhotos } from "./AnalysePhotos";
import { Fourchette } from "./Fourchette";
import { Bilan, useBilan } from "./Bilan";
import { useProfilAnalyse } from "./ProfilAnalyse";

const TEXTE: Record<Ton, string> = { ok: "text-ok", warn: "text-warn", bad: "text-bad", o: "text-o2", neutre: "text-ink" };
const ACCOMP: Record<string, { ton: Ton; icone: string }> = {
  "vous pouvez y aller seul": { ton: "ok", icone: "✓" },
  "venez accompagné": { ton: "warn", icone: "👥" },
  "faites inspecter la voiture": { ton: "bad", icone: "🔧" },
};

function Verrou({ titre, texte, offre }: { titre: string; texte: string; offre: "essentiel" }) {
  const o = OFFRES[offre];
  return (
    <section className="carte border-dashed p-6" aria-label={titre}>
      <p className="text-sm font-medium text-o2">Avec {o.nom}</p>
      <h2 className="mt-1 font-display text-lg font-semibold">{titre}</h2>
      <p className="mt-1 text-ink-2">{texte}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/tarifs#particuliers" className="btn btn-sm">
          Découvrir {o.nom}, {prixTxt(o.prix)} par mois
        </Link>
        <Link href="/app/credits" className="btn btn-sm">
          Ou un crédit, dès {prixTxt(PACKS[0].prix)}
        </Link>
      </div>
    </section>
  );
}

export function ResultatParticulier({ a, onNouvelle }: { a: Analyse; onNouvelle?: () => void }) {
  const { profil } = useProfilAnalyse();
  const { tarifCV, kmCost } = profil;
  const [km, setKm] = useState("");
  const [cochees, setCochees] = useState<string[]>([]);
  const detail = a.detail ?? "simple";
  const plus = detail !== "simple";
  const complet = detail === "complet";
  const kmSaisi = km.trim() === "" ? null : Number(km.replace(/\s/g, ""));
  const c = coutParticulier(a, { kmCost, tarifCV, ville: "" }, kmSaisi != null && Number.isFinite(kmSaisi) ? kmSaisi : null);
  const b = useBilan(a, { distance: kmSaisi != null && Number.isFinite(kmSaisi) ? kmSaisi : null });
  const ia = a.ia;
  const acc = ia?.accompagnement ? ACCOMP[ia.accompagnement.recommandation] ?? { ton: "warn" as Ton, icone: "!" } : null;

  return (
    <div className="grid gap-5">
      {a.demo && <p className="rounded-2xl border border-warn/40 bg-warn/10 p-3 text-sm text-warn">Mode démonstration : comptes non configurés, rien n&apos;est enregistré.</p>}

      {a.regles && <p className="text-sm text-ink-3">Analyse faite avec les règles et la cote de l&apos;outil : les photos n&apos;ont pas été examinées.</p>}
      {a.iaErreur && <p className="text-sm text-warn">{a.iaErreur} Le coût et les points à vérifier restent calculés.</p>}
      <Bilan
        a={a}
        b={b}
        detail={detail}
        lien={a.lien}
        argent={
      <Panneau titre="Ce qu'elle va vraiment vous coûter">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <span className="text-ink-2">Coût réel d&apos;achat</span>
          <b className="num font-display text-[clamp(28px,6vw,40px)] font-semibold text-o2">
            {c.total != null && c.incomplet && <small className="mr-1.5 font-body text-base font-normal text-ink-3">à partir de</small>}
            {c.total != null ? eur(c.total) : "—"}
          </b>
        </div>
        {c.prix != null && a.cote && a.cote.n >= 5 && (
          <div className="mb-4">
            <Fourchette prix={c.prix} p25={a.cote.p25} p75={a.cote.p75} />
          </div>
        )}
        <BarreFrais lignes={c.lignes} />
        <ul className="divide-y divide-line">
          {c.lignes.map((l) => (
            <li key={l.l} className="flex items-baseline justify-between gap-4 py-2.5">
              <span>
                {l.l}
                {l.d && <span className="block text-xs text-ink-3">{l.d}</span>}
              </span>
              <span className="num shrink-0 text-ink-2">{l.v == null ? "—" : l.v === 0 ? "0\u00a0€" : (l.l === "Prix demandé" ? "" : "+\u00a0") + eur(l.v)}</span>
            </li>
          ))}
        </ul>
        <label className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-3">
          Distance jusqu&apos;à la voiture
          <span className="flex items-center gap-2 whitespace-nowrap">
            <input value={km} onChange={(e) => setKm(e.target.value)} inputMode="numeric" placeholder={c.dist != null ? String(c.dist) : "km"} className={cx(inputCls, "w-24! py-1.5")} aria-label="Distance en kilomètres" />
            km
          </span>
        </label>
        <div className="mt-4 grid gap-2 border-t border-line pt-4 sm:grid-cols-2">
          <p className="flex items-baseline justify-between gap-3 text-sm sm:block">
            <span className="text-ink-3">Ensuite, chaque mois </span>
            <b className="num">{b.argent.mensuel != null ? `≈ ${eur(b.argent.mensuel)}` : "—"}</b>
            <span className="block text-xs text-ink-3">perte de valeur, entretien et travaux probables ; hors carburant et assurance</span>
          </p>
          {plus && b.argent.proposer != null && b.argent.prix != null && b.argent.proposer < b.argent.prix && b.verdict !== "eviter" && (
            <p className="flex items-baseline justify-between gap-3 text-sm sm:block">
              <span className="text-ink-3">Prix raisonnable à proposer </span>
              <b className="num text-o2">{eur(b.argent.proposer)}</b>
              <span className="block text-xs text-ink-3">{eur(b.argent.prix - b.argent.proposer)} sous le prix affiché, travaux probables déduits</span>
            </p>
          )}
        </div>
        {b.argent.budgetDepasse ? <p className="mt-3 text-sm text-warn">{eur(b.argent.budgetDepasse)} au-dessus de votre budget.</p> : null}
        {c.gros.length > 0 && <p className="mt-3 text-sm text-warn">Les gros travaux possibles ne sont pas comptés dans le coût d&apos;achat : voir « Travaux à prévoir ».</p>}
      </Panneau>
        }
      />

      {plus && (ia?.photos.fournies || (a.vignettes ?? []).length > 0) && (
        <Panneau titre="Ce que montrent les photos">
          <AnalysePhotos photos={ia?.photos} vignettes={a.vignettes} regles={a.regles} />
        </Panneau>
      )}
      {plus && !ia?.photos.fournies && !(a.vignettes ?? []).length && (
        <p className="rounded-2xl border border-line p-4 text-sm text-ink-3">
          Aucune photo examinée. À la prochaine analyse, ajoutez les photos de l&apos;annonce : l&apos;IA repère les chocs, la rouille, les pneus usés, une teinte différente et lit le compteur.
        </p>
      )}

      {acc && ia?.accompagnement && (
        <section className={cx("carte p-6", acc.ton === "ok" ? "border-ok/40" : acc.ton === "bad" ? "border-bad/40" : "border-warn/40")} aria-labelledby="acc">
          <p className="text-sm text-ink-3">Faut-il y aller seul ?</p>
          <h2 id="acc" className={cx("mt-1 font-display text-2xl font-semibold first-letter:uppercase", TEXTE[acc.ton])}>
            <span aria-hidden="true">{acc.icone} </span>
            {ia.accompagnement.recommandation}
          </h2>
          <p className="mt-2 text-ink-2">{ia.accompagnement.pourquoi}</p>
        </section>
      )}

      {complet && ia?.negociation && (
        <Panneau titre="Comment négocier">
          {ia.negociation.prixOuverture != null && (
            <p className="mb-4 flex flex-wrap items-baseline gap-2">
              <span className="text-ink-2">Ouvrez la discussion à</span>
              <b className="num font-display text-2xl text-o2">{eur(ia.negociation.prixOuverture)}</b>
            </p>
          )}
          {ia.negociation.arguments.length > 0 && (
            <>
              <h3 className="mb-2 font-semibold">Vos arguments, du plus fort au plus faible</h3>
              <ul className="mb-5 divide-y divide-line">
                {ia.negociation.arguments.map((x) => (
                  <li key={x.argument} className="flex justify-between gap-4 py-2">
                    <span>{x.argument}</span>
                    {x.montant != null && <span className="num shrink-0 text-ink-2">{eur(x.montant)}</span>}
                  </li>
                ))}
              </ul>
            </>
          )}
          <h3 className="mb-2 font-semibold">Les bons réflexes</h3>
          <ul className="grid list-disc gap-1.5 pl-5 text-ink-2 marker:text-o2">
            {ia.negociation.conseils.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Panneau>
      )}

      {complet && ia?.visite && (
        <Panneau titre="Sur place : quoi contrôler" aside={`${cochees.length} / ${ia.visite.aControler.length} vérifiés`}>
          <p className="mb-3 text-sm text-ink-3">Cochez au fur et à mesure pendant la visite.</p>
          <ul className="grid gap-2">
            {ia.visite.aControler.map((x) => (
              <li key={x}>
                <label className="flex cursor-pointer gap-3 rounded-xl px-2 py-1.5 hover:bg-glass">
                  <input type="checkbox" checked={cochees.includes(x)} onChange={(e) => setCochees((l) => (e.target.checked ? [...l, x] : l.filter((y) => y !== x)))} className="mt-1 size-4 shrink-0 accent-[#3ecb7f]" />
                  <span className={cochees.includes(x) ? "text-ink-3 line-through" : ""}>{x}</span>
                </label>
              </li>
            ))}
          </ul>
          {ia.visite.documents.length > 0 && (
            <>
              <h3 className="mb-2 mt-5 font-semibold">Papiers à demander avant de payer</h3>
              <ul className="grid list-disc gap-1.5 pl-5 text-ink-2 marker:text-o2">
                {ia.visite.documents.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </>
          )}
        </Panneau>
      )}

      {detail === "simple" && <Verrou offre="essentiel" titre="Le prix à proposer et les questions à poser" texte="Analysez plusieurs annonces, voyez le prix du marché en détail, la fiabilité du moteur et les questions à poser au vendeur." />}

      <details className="group carte p-5 sm:p-6">
        <summary className="cursor-pointer list-none font-display text-lg font-semibold">
          Voir le détail <span className="inline-block text-ink-3 transition group-open:rotate-90" aria-hidden="true">›</span>
        </summary>
        <div className="mt-4 grid gap-5 text-sm">
          {ia && ia.marche.realiste != null && (
            <div>
              <h3 className="mb-1 font-semibold">Prix du marché</h3>
              <p className="text-ink-2">
                Environ <b className="num">{eur(ia.marche.realiste)}</b>
                {ia.marche.bas != null && ia.marche.haut != null && <> (de {eur(ia.marche.bas)} à {eur(ia.marche.haut)})</>}, estimation {ia.marche.confiance === "forte" ? "fiable" : ia.marche.confiance === "faible" ? "à prendre avec prudence" : "assez fiable"}. {ia.marche.commentaire}
              </p>
            </div>
          )}
          <div>
            <h3 className="mb-2 font-semibold">Ce que dit l&apos;annonce</h3>
            <div className="flex flex-wrap gap-1.5">
              {a.faits.ct ? <Pastille ton={a.faits.ct.statut === "ok" || a.faits.ct.statut === "vierge" ? "ok" : a.faits.ct.statut === "mentionné" ? "neutre" : "bad"}>CT {a.faits.ct.statut}</Pastille> : <Pastille ton="warn">CT non mentionné</Pastille>}
              {a.faits.distribution && <Pastille ton={a.faits.distribution.statut === "faite" ? "ok" : a.faits.distribution.statut === "à faire" ? "bad" : "neutre"}>Distribution {a.faits.distribution.statut}</Pastille>}
              {a.faits.carnet && <Pastille ton="ok">Carnet d&apos;entretien</Pastille>}
              {a.faits.factures && <Pastille ton="ok">Factures</Pastille>}
              {a.faits.proprietaires && <Pastille>{a.faits.proprietaires === 1 ? "1re main" : `${a.faits.proprietaires} propriétaires`}</Pastille>}
              {a.faits.importe && <Pastille ton="warn">Import</Pastille>}
              {c.petites.map((p) => (
                <Pastille key={p.k} ton="o">
                  {p.l} · {eur(p.min)} à {eur(p.max)}
                </Pastille>
              ))}
            </div>
          </div>
          {plus && (a.fiab.modele || ia) && (
            <div>
              <h3 className="mb-1 font-semibold">Fiabilité</h3>
              <p className="text-ink-2">
                {a.fiab.k === "eviter" ? a.fiab.pourquoi.join(" ; ") : a.fiab.k === "fiable" ? `${a.fiab.modele} : modèle réputé fiable. ${a.fiab.pourquoi[0]}` : a.fiab.k === "limite" ? `${a.fiab.modele} : ${a.fiab.pourquoi.join(", ")}.` : ""}
                {ia && ` ${ia.fiabilite.moteur} : ${ia.fiabilite.note}/10.`}
              </p>
              {ia?.fiabilite.problemesConnus.length ? <p className="mt-1 text-ink-3">Points faibles connus : {ia.fiabilite.problemesConnus.join(" ; ")}.</p> : null}
            </div>
          )}
        </div>
      </details>

      <div className="flex flex-wrap justify-center gap-3">
        {onNouvelle && (
          <button type="button" onClick={onNouvelle} className="btn">
            Analyser une autre annonce
          </button>
        )}
        <button type="button" onClick={() => print()} className="btn">
          Imprimer
        </button>
      </div>
    </div>
  );
}

/* Ce qui s'ajoute au prix demandé, en une barre : chaque poste a sa part, avant la liste chiffrée. */
const TEINTES = ["bg-o/80", "bg-o3/70", "bg-warn/70", "bg-bad/70", "bg-ink-3/60"];
function BarreFrais({ lignes }: { lignes: { l: string; v: number | null }[] }) {
  const frais = lignes.filter((l) => l.l !== "Prix demandé" && (l.v ?? 0) > 0);
  const total = frais.reduce((s, l) => s + (l.v ?? 0), 0);
  if (!total) return null;
  return (
    <div className="mb-4" role="img" aria-label={`En plus du prix demandé : ${eur(total)}, soit ${frais.map((l) => `${l.l} ${eur(l.v ?? 0)}`).join(", ")}.`}>
      <p className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="text-ink-2">En plus du prix demandé</span>
        <b className="num">+&nbsp;{eur(total)}</b>
      </p>
      <div className="flex h-3 gap-px overflow-hidden rounded-full bg-line">
        {frais.map((l, i) => (
          <span key={l.l} className={`min-w-[4px] ${TEINTES[i % TEINTES.length]}`} style={{ flex: l.v ?? 0 }} />
        ))}
      </div>
      <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-3" aria-hidden="true">
        {frais.map((l, i) => (
          <li key={l.l} className="flex items-center gap-1">
            <span className={`size-2 rounded-full ${TEINTES[i % TEINTES.length]}`} />
            {l.l}
          </li>
        ))}
      </ul>
    </div>
  );
}
