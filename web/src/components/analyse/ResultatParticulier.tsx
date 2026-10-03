"use client";
import Link from "next/link";
import { useState } from "react";
import { coutParticulier, DEFAUTS_PART, eur, type Analyse, type Niveau } from "@/lib/analyse/couts";
import { OFFRES } from "@/lib/offres";
import { Copier, Panneau, Pastille, cx, inputCls, type Ton } from "../ui";

const VERDICTS: Record<Niveau, { l: string; ton: Ton; phrase: string }> = {
  bon: { l: "Bonne affaire", ton: "ok", phrase: "Le prix est sous le marché." },
  correct: { l: "Prix correct", ton: "ok", phrase: "Le prix est dans la moyenne du marché." },
  cher: { l: "Trop cher", ton: "warn", phrase: "Le prix est au-dessus du marché." },
  prudence: { l: "Prudence", ton: "warn", phrase: "Elle peut convenir, mais de gros frais sont possibles. Faites-la vérifier avant d'acheter." },
  eviter: { l: "À éviter", ton: "bad", phrase: "Un problème grave est signalé : mieux vaut passer votre chemin." },
  inconnu: { l: "Prix non évalué", ton: "neutre", phrase: "Nous n'avons pas pu comparer le prix au marché." },
};
const FOND: Record<Ton, string> = { ok: "from-ok/20 border-ok/40", warn: "from-warn/20 border-warn/40", bad: "from-bad/20 border-bad/40", o: "from-o/20 border-o/40", neutre: "from-glass border-line-2" };
const TEXTE: Record<Ton, string> = { ok: "text-ok", warn: "text-warn", bad: "text-bad", o: "text-o2", neutre: "text-ink" };
const ACCOMP: Record<string, { ton: Ton; icone: string }> = {
  "vous pouvez y aller seul": { ton: "ok", icone: "✓" },
  "venez accompagné": { ton: "warn", icone: "👥" },
  "faites inspecter la voiture": { ton: "bad", icone: "🔧" },
};

function Verrou({ titre, texte, offre }: { titre: string; texte: string; offre: "essentiel" | "serenite" }) {
  const o = OFFRES[offre];
  return (
    <section className="carte border-dashed p-6" aria-label={titre}>
      <p className="text-sm font-medium text-o2">Avec {o.nom}</p>
      <h2 className="mt-1 font-display text-lg font-semibold">{titre}</h2>
      <p className="mt-1 text-ink-2">{texte}</p>
      <Link href="/tarifs#particuliers" className="btn btn-sm mt-4">
        Découvrir {o.nom}, {o.prix.toLocaleString("fr-FR")} € par mois
      </Link>
    </section>
  );
}

export function ResultatParticulier({ a, tarifCV = DEFAUTS_PART.tarifCV, kmCost = DEFAUTS_PART.kmCost, onNouvelle }: { a: Analyse; tarifCV?: number; kmCost?: number; onNouvelle?: () => void }) {
  const [km, setKm] = useState("");
  const [cochees, setCochees] = useState<string[]>([]);
  const detail = a.detail ?? "simple";
  const plus = detail !== "simple";
  const complet = detail === "complet";
  const kmSaisi = km.trim() === "" ? null : Number(km.replace(/\s/g, ""));
  const c = coutParticulier(a, { kmCost, tarifCV, ville: "" }, kmSaisi != null && Number.isFinite(kmSaisi) ? kmSaisi : null);
  const v = VERDICTS[c.niveau];
  const ia = a.ia;
  const veh = ia?.vehicule;
  const titre = [veh?.marque, veh?.modele, veh?.version].filter(Boolean).join(" ") || a.faits.titre || "Votre annonce";
  const kmVeh = veh?.km ?? a.faits.km;
  const infos = [veh?.annee ?? a.faits.annee, kmVeh != null ? `${kmVeh.toLocaleString("fr-FR")} km` : null, veh?.energie || a.faits.energie, veh?.localisation || a.faits.ville].filter(Boolean);

  let phrasePrix = v.phrase;
  if (c.niveau === "bon" && c.ecart != null) phrasePrix = `Environ ${eur(c.ecart)} sous le prix du marché, petites réparations comprises.`;
  if (c.niveau === "cher" && c.ecart != null) phrasePrix = `Environ ${eur(-c.ecart)} au-dessus du prix du marché, petites réparations comprises.`;

  // À vérifier : du plus grave au moins grave.
  const verifs: { t: string; ton: Ton }[] = [];
  c.pieges.forEach((p) => verifs.push({ t: p.l, ton: "bad" }));
  if (a.fiab.k === "eviter") verifs.push({ t: `Moteur ou boîte réputé fragile : ${a.fiab.pourquoi[0].split(" : ")[0]}`, ton: "warn" });
  c.gros.forEach((p) => verifs.push({ t: `${p.l}${p.nc ? "" : ` (${eur(p.min)} à ${eur(p.max)})`}`, ton: "warn" }));
  if (!a.faits.ct || a.faits.ct.statut === "à faire" || a.faits.ct.statut === "mentionné") verifs.push({ t: "Demandez le contrôle technique de moins de 6 mois : c'est au vendeur de le fournir.", ton: "neutre" });
  ia?.alertes.forEach((t) => verifs.push({ t, ton: "neutre" }));
  const nbVerifs = complet ? 6 : plus ? 4 : 3;
  const questions = (ia?.questions ?? []).slice(0, complet ? 5 : 3);
  const acc = ia?.accompagnement ? ACCOMP[ia.accompagnement.recommandation] ?? { ton: "warn" as Ton, icone: "!" } : null;

  return (
    <div className="grid gap-5">
      {a.demo && <p className="rounded-2xl border border-warn/40 bg-warn/10 p-3 text-sm text-warn">Mode démonstration : comptes non configurés, rien n&apos;est enregistré.</p>}

      <section className={cx("rounded-3xl border bg-gradient-to-b to-panel p-6 sm:p-8", FOND[v.ton])} aria-labelledby="verdict">
        <p className="text-sm text-ink-2">{titre}</p>
        {infos.length > 0 && <p className="text-sm text-ink-3">{infos.join(" · ")}</p>}
        <h1 id="verdict" className={cx("mt-3 font-display text-[clamp(34px,7vw,56px)] font-semibold leading-none tracking-tight", TEXTE[v.ton])}>
          {v.l}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-ink">{ia?.resumeSimple || phrasePrix}</p>
        {ia?.resumeSimple && ["bon", "correct", "cher"].includes(c.niveau) && <p className="mt-1 text-ink-2">{phrasePrix}</p>}
        {plus && c.proposer != null && c.prix != null && c.proposer < c.prix && c.niveau !== "eviter" && (
          <p className="mt-4 inline-flex flex-wrap items-baseline gap-2 rounded-2xl border border-line-2 bg-black/25 px-4 py-2">
            <span className="text-ink-2">Prix raisonnable à proposer</span>
            <b className="num font-display text-xl">{eur(c.proposer)}</b>
          </p>
        )}
        {a.iaErreur && <p className="mt-4 text-sm text-warn">{a.iaErreur} Le coût et les points à vérifier restent calculés.</p>}
      </section>

      <Panneau titre="Ce qu'elle va vraiment vous coûter">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <span className="text-ink-2">Coût réel d&apos;achat</span>
          <b className="num font-display text-[clamp(28px,6vw,40px)] font-semibold text-o2">
            {c.total != null && c.incomplet && <small className="mr-1.5 font-body text-base font-normal text-ink-3">à partir de</small>}
            {c.total != null ? eur(c.total) : "—"}
          </b>
        </div>
        <ul className="divide-y divide-line">
          {c.lignes.map((l) => (
            <li key={l.l} className="flex items-baseline justify-between gap-4 py-2.5">
              <span>
                {l.l}
                {l.d && <span className="block text-xs text-ink-3">{l.d}</span>}
              </span>
              <span className="num shrink-0 text-ink-2">{l.v == null ? "—" : l.v === 0 ? "0 €" : (l.l === "Prix demandé" ? "" : "+ ") + eur(l.v)}</span>
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
        {c.gros.length > 0 && <p className="mt-3 text-sm text-warn">Des gros travaux sont possibles et ne sont pas comptés ici : voir « À vérifier ».</p>}
      </Panneau>

      {verifs.length > 0 && (
        <Panneau titre="À vérifier avant d'acheter">
          <ul className="grid gap-2.5">
            {verifs.slice(0, nbVerifs).map((x, i) => (
              <li key={i} className="flex gap-3">
                <span className={cx("mt-2 size-2 shrink-0 rounded-full", x.ton === "bad" ? "bg-bad" : x.ton === "warn" ? "bg-warn" : "bg-ink-3")} aria-hidden="true" />
                <span>{x.t}</span>
              </li>
            ))}
          </ul>
        </Panneau>
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

      {plus && questions.length > 0 && (
        <Panneau titre="Questions à poser au vendeur" aside={<Copier texte={questions.join("\n")} label="Tout copier" />}>
          <ol className="grid list-decimal gap-2 pl-5 marker:text-o2">
            {questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
          {ia?.messageVendeur && (
            <div className="mt-5">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h3 className="text-sm text-ink-3">Premier message, prêt à envoyer</h3>
                <Copier texte={ia.messageVendeur} />
              </div>
              <p className="rounded-xl border border-line bg-black/25 p-3 text-ink-2">{ia.messageVendeur}</p>
            </div>
          )}
        </Panneau>
      )}

      {detail === "simple" && <Verrou offre="essentiel" titre="Le prix à proposer et les questions à poser" texte="Analysez plusieurs annonces, voyez le prix du marché en détail, la fiabilité du moteur et les questions à poser au vendeur." />}
      {detail !== "complet" && <Verrou offre="serenite" titre="Comment négocier, quoi contrôler sur place, faut-il y aller seul" texte="Un accompagnement complet jusqu'à l'achat : vos arguments chiffrés, la liste des contrôles à faire pendant la visite, et notre avis sur l'aide dont vous aurez besoin." />}

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
