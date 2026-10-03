"use client";
import { useState } from "react";
import Link from "next/link";
import { coutParticulier, DEFAUTS_PART, eur, type Analyse, type Niveau } from "@/lib/analyse/couts";
import { Entete } from "./Entete";
import { Saisie } from "./Saisie";
import { Copier, Panneau, Pastille, cx, inputCls, useReglages, type Ton } from "./ui";

const VERDICTS: Record<Niveau, { l: string; ton: Ton; phrase: string }> = {
  bon: { l: "Bonne affaire", ton: "ok", phrase: "Le prix est sous le marché." },
  correct: { l: "Prix correct", ton: "ok", phrase: "Le prix est dans la moyenne du marché." },
  cher: { l: "Trop cher", ton: "warn", phrase: "Le prix est au-dessus du marché." },
  prudence: { l: "Prudence", ton: "warn", phrase: "Elle peut convenir, mais de gros frais sont possibles. Faites-la vérifier avant d'acheter." },
  eviter: { l: "À éviter", ton: "bad", phrase: "Un problème grave est signalé : mieux vaut passer votre chemin." },
  inconnu: { l: "Prix non évalué", ton: "neutre", phrase: "Nous n'avons pas pu comparer le prix au marché." },
};
const FOND: Record<Ton, string> = {
  ok: "from-ok/20 border-ok/40",
  warn: "from-warn/20 border-warn/40",
  bad: "from-bad/20 border-bad/40",
  o: "from-o/20 border-o/40",
  neutre: "from-glass border-line-2",
};
const TEXTE: Record<Ton, string> = { ok: "text-ok", warn: "text-warn", bad: "text-bad", o: "text-o2", neutre: "text-ink" };

export function OutilParticulier() {
  const [reg, setReg] = useReglages("utp-part", DEFAUTS_PART);
  const [a, setA] = useState<Analyse | null>(null);
  const [km, setKm] = useState<string>("");

  return (
    <>
      <Entete href="/benef" sous="Achat">
        <Link href="/app" className="ml-auto text-sm text-ink-3 underline-offset-4 hover:text-ink hover:underline">
          Vous achetez pour revendre ?
        </Link>
      </Entete>
      <main className="mx-auto grid max-w-3xl gap-6 px-4 pb-20 pt-10">
        {!a && (
          <div className="grid gap-3">
            <h1 className="font-display text-[clamp(30px,6vw,48px)] font-semibold leading-[1.05] tracking-tight">
              Cette voiture est-elle <span className="font-serif font-normal italic text-o2">une bonne affaire</span> ?
            </h1>
            <p className="max-w-xl text-lg text-ink-2">Collez l&apos;annonce. On vous dit combien elle va vraiment vous coûter, et ce qu&apos;il faut vérifier avant d&apos;acheter.</p>
          </div>
        )}

        {a ? (
          <Resultat a={a} km={km} setKm={setKm} kmCost={reg.kmCost} tarifCV={reg.tarifCV} onNouvelle={() => setA(null)} />
        ) : (
          <Panneau>
            <Saisie
              key={reg.ville}
              villeInitiale={reg.ville}
              villeLabel="Votre ville"
              villeAide="Pour calculer le trajet jusqu'à la voiture."
              bouton="Analyser l'annonce"
              onResultat={(r, ville) => {
                setReg({ ville });
                setKm("");
                setA(r);
                window.scrollTo({ top: 0 });
              }}
            />
          </Panneau>
        )}

        <p className="text-center text-xs text-ink-3">
          Estimation indicative à partir de l&apos;annonce : elle ne remplace pas l&apos;essai ni l&apos;avis d&apos;un garagiste.
        </p>
      </main>
    </>
  );
}

function Resultat({ a, km, setKm, kmCost, tarifCV, onNouvelle }: { a: Analyse; km: string; setKm: (v: string) => void; kmCost: number; tarifCV: number; onNouvelle: () => void }) {
  const kmSaisi = km.trim() === "" ? null : Number(km.replace(/\s/g, ""));
  const c = coutParticulier(a, { kmCost, tarifCV, ville: "" }, kmSaisi != null && Number.isFinite(kmSaisi) ? kmSaisi : null);
  const v = VERDICTS[c.niveau];
  const ia = a.ia;
  const veh = ia?.vehicule;
  const titre = [veh?.marque, veh?.modele, veh?.version].filter(Boolean).join(" ") || a.faits.titre || "Votre annonce";
  const infos = [veh?.annee ?? a.faits.annee, (veh?.km ?? a.faits.km) != null ? `${(veh?.km ?? a.faits.km)!.toLocaleString("fr-FR")} km` : null, veh?.energie || a.faits.energie, veh?.localisation || a.faits.ville].filter(Boolean);

  let phrasePrix = v.phrase;
  if (c.niveau === "bon" && c.ecart != null) phrasePrix = `Environ ${eur(c.ecart)} sous le prix du marché, petites réparations comprises.`;
  if (c.niveau === "cher" && c.ecart != null) phrasePrix = `Environ ${eur(-c.ecart)} au-dessus du prix du marché, petites réparations comprises.`;

  // À vérifier : 4 points maximum, du plus grave au moins grave.
  const verifs: { t: string; ton: Ton }[] = [];
  c.pieges.forEach((p) => verifs.push({ t: p.l, ton: "bad" }));
  if (a.fiab.k === "eviter") verifs.push({ t: `Moteur ou boîte réputé fragile : ${a.fiab.pourquoi[0].split(" : ")[0]}`, ton: "warn" });
  c.gros.forEach((p) => verifs.push({ t: `${p.l}${p.nc ? "" : ` (${eur(p.min)} à ${eur(p.max)})`}`, ton: "warn" }));
  if (!a.faits.ct || a.faits.ct.statut === "à faire" || a.faits.ct.statut === "mentionné")
    verifs.push({ t: "Demandez le contrôle technique de moins de 6 mois : c'est au vendeur de le fournir.", ton: "neutre" });
  ia?.alertes.slice(0, 2).forEach((t) => verifs.push({ t, ton: "neutre" }));

  const questions = (ia?.questions ?? []).slice(0, 3);

  return (
    <div className="grid gap-5">
      <section className={cx("rounded-3xl border bg-gradient-to-b to-panel p-6 sm:p-8", FOND[v.ton])}>
        <p className="text-sm text-ink-3">{titre}</p>
        {infos.length > 0 && <p className="text-sm text-ink-3">{infos.join(" · ")}</p>}
        <h1 className={cx("mt-3 font-display text-[clamp(34px,7vw,56px)] font-semibold leading-none tracking-tight", TEXTE[v.ton])}>{v.l}</h1>
        <p className="mt-3 max-w-xl text-lg text-ink">{ia?.resumeSimple || phrasePrix}</p>
        {ia?.resumeSimple && c.niveau !== "eviter" && c.niveau !== "prudence" && c.niveau !== "inconnu" && <p className="mt-1 text-ink-2">{phrasePrix}</p>}
        {c.proposer != null && c.prix != null && c.proposer < c.prix && c.niveau !== "eviter" && (
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
          <input
            value={km}
            onChange={(e) => setKm(e.target.value)}
            inputMode="numeric"
            placeholder={c.dist != null ? String(c.dist) : "km"}
            className={cx(inputCls, "w-24! py-1.5")}
            aria-label="Distance en kilomètres"
          />
          km
          </span>
        </label>
        {c.gros.length > 0 && <p className="mt-3 text-sm text-warn">Gros travaux possibles non comptés : voir ci-dessous.</p>}
      </Panneau>

      {verifs.length > 0 && (
        <Panneau titre="À vérifier avant d'acheter">
          <ul className="grid gap-2.5">
            {verifs.slice(0, 4).map((x, i) => (
              <li key={i} className="flex gap-3">
                <span className={cx("mt-2 size-2 shrink-0 rounded-full", x.ton === "bad" ? "bg-bad" : x.ton === "warn" ? "bg-warn" : "bg-ink-3")} />
                <span>{x.t}</span>
              </li>
            ))}
          </ul>
        </Panneau>
      )}

      {questions.length > 0 && (
        <Panneau titre="Questions à poser au vendeur" aside={<Copier texte={questions.join("\n")} label="Tout copier" />}>
          <ol className="grid list-decimal gap-2 pl-5 marker:text-o2">
            {questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
        </Panneau>
      )}

      <details className="group rounded-3xl border border-line bg-panel p-5 sm:p-6">
        <summary className="cursor-pointer list-none font-display text-lg font-semibold">
          Voir le détail <span className="text-ink-3 transition group-open:rotate-90 inline-block">›</span>
        </summary>
        <div className="mt-4 grid gap-5 text-sm">
          {ia && ia.marche.realiste != null && (
            <div>
              <h3 className="mb-1 font-semibold">Prix du marché</h3>
              <p className="text-ink-2">
                Environ <b className="num">{eur(ia.marche.realiste)}</b>
                {ia.marche.bas != null && ia.marche.haut != null && (
                  <>
                    {" "}
                    (de {eur(ia.marche.bas)} à {eur(ia.marche.haut)})
                  </>
                )}
                , fiabilité de l&apos;estimation {ia.marche.confiance}. {ia.marche.commentaire}
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
                  {p.l} · {eur(p.min)}–{eur(p.max)}
                </Pastille>
              ))}
            </div>
          </div>
          {(a.fiab.modele || ia) && (
            <div>
              <h3 className="mb-1 font-semibold">Fiabilité</h3>
              <p className="text-ink-2">
                {a.fiab.k === "eviter" ? a.fiab.pourquoi.join(" ; ") : a.fiab.k === "fiable" ? `${a.fiab.modele} : modèle réputé fiable. ${a.fiab.pourquoi[0]}` : a.fiab.k === "limite" ? `${a.fiab.modele} : ${a.fiab.pourquoi.join(", ")}.` : ""}
                {ia && ` ${ia.fiabilite.moteur} : ${ia.fiabilite.note}/10.`}
              </p>
              {a.fiab.aVerifier && <p className="mt-1 text-ink-3">À l&apos;essai : {a.fiab.aVerifier}</p>}
            </div>
          )}
          {ia?.messageVendeur && (
            <div>
              <div className="mb-1 flex items-center justify-between gap-2">
                <h3 className="font-semibold">Premier message au vendeur</h3>
                <Copier texte={ia.messageVendeur} />
              </div>
              <p className="rounded-xl border border-line bg-black/25 p-3 text-ink-2">{ia.messageVendeur}</p>
            </div>
          )}
        </div>
      </details>

      <button type="button" onClick={onNouvelle} className="justify-self-center rounded-full border border-line-2 px-5 py-2.5 text-ink-2 transition hover:border-o/50 hover:text-ink">
        Analyser une autre annonce
      </button>
    </div>
  );
}
