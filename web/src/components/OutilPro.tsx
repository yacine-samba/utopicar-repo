"use client";
import { useState } from "react";
import Link from "next/link";
import { dealPro, DEFAUTS_PRO, eur, type Analyse, type ParamsPro, type Verdict } from "@/lib/analyse/couts";
import { Entete } from "./Entete";
import { Saisie } from "./Saisie";
import { Champ, Copier, Panneau, Pastille, cx, inputCls, useReglages, type Ton } from "./ui";

const MODULES = ["Tableau de bord", "Parc", "Rapports", "Recherches"];

const VTON: Record<Verdict, Ton> = { GO: "ok", "GO SI NÉGOCIÉ": "o", "GO EN MANDAT UNIQUEMENT": "o", "À SURVEILLER": "warn", "NO GO": "bad" };
const VTXT: Record<Ton, string> = { ok: "text-ok", o: "text-o2", warn: "text-warn", bad: "text-bad", neutre: "text-ink" };
const VFOND: Record<Ton, string> = { ok: "from-ok/20 border-ok/40", o: "from-o/20 border-o/40", warn: "from-warn/20 border-warn/40", bad: "from-bad/20 border-bad/40", neutre: "from-glass border-line-2" };

const numOrNull = (s: string) => {
  const v = Number(s.replace(/[\s €]/g, "").replace(",", "."));
  return s.trim() !== "" && Number.isFinite(v) ? v : null;
};

export function OutilPro() {
  const [reg, setReg] = useReglages<ParamsPro>("utp-pro", DEFAUTS_PRO);
  const [a, setA] = useState<Analyse | null>(null);
  const [prix, setPrix] = useState("");

  return (
    <>
      <Entete href="/app" sous="Pro">
        <nav className="flex flex-wrap items-center gap-1 text-sm" aria-label="Modules">
          <span className="rounded-full bg-o/15 px-3 py-1 text-o2" aria-current="page">
            Analyser
          </span>
          {MODULES.map((m) => (
            <span key={m} className="cursor-not-allowed rounded-full px-3 py-1 text-ink-3" title="Bientôt disponible" aria-disabled="true">
              {m} <small className="text-[10px] uppercase tracking-wide text-ink-3/70">bientôt</small>
            </span>
          ))}
        </nav>
        <Link href="/benef" className="ml-auto text-sm text-ink-3 underline-offset-4 hover:text-ink hover:underline">
          Particulier ? Version simple
        </Link>
      </Entete>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 pb-20 pt-8">
        {a ? (
          <ResultatPro a={a} reg={reg} prixInit={prix} onNouvelle={() => setA(null)} />
        ) : (
          <>
            <div className="grid gap-2">
              <h1 className="font-display text-[clamp(28px,5vw,42px)] font-semibold leading-tight tracking-tight">Analyser une annonce</h1>
              <p className="max-w-2xl text-ink-2">
                Collez l&apos;annonce. Le rapport calcule ce qu&apos;il vous resterait une fois la voiture revendue, et le prix à ne pas dépasser.
              </p>
            </div>
            <Panneau>
              <Saisie
                key={reg.ville}
                villeInitiale={reg.ville}
                villeLabel="Ville de départ et de revente"
                villeAide="Sert au trajet et à la cote de revente."
                bouton="Analyser l'annonce"
                enPlus={
                  <Champ label="Prix envisagé (€)" aide="Facultatif : sinon le prix de l'annonce.">
                    <input value={prix} onChange={(e) => setPrix(e.target.value)} inputMode="numeric" placeholder="ex. 6 500" className={inputCls} />
                  </Champ>
                }
                onResultat={(r, ville) => {
                  setReg({ ville });
                  setA(r);
                  window.scrollTo({ top: 0 });
                }}
              />
            </Panneau>
            <Reglages reg={reg} setReg={setReg} />
          </>
        )}
      </main>
    </>
  );
}

function Reglages({ reg, setReg }: { reg: ParamsPro; setReg: (p: Partial<ParamsPro>) => void }) {
  const f = (k: keyof ParamsPro, label: string, aide: string) => (
    <Champ label={label} aide={aide}>
      <input
        defaultValue={String(reg[k])}
        key={String(reg[k])}
        inputMode="decimal"
        onBlur={(e) => {
          const v = numOrNull(e.target.value);
          if (v != null) setReg({ [k]: v });
        }}
        className={inputCls}
      />
    </Champ>
  );
  return (
    <details className="rounded-3xl border border-line bg-panel p-5 sm:p-6">
      <summary className="cursor-pointer font-display text-lg font-semibold">
        Réglages du calcul <span className="ml-2 font-body text-sm font-normal text-ink-3">seuil de marge, carte grise, trajet, frais fixes</span>
      </summary>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {f("margeMin", "Marge nette minimum (€)", "En dessous, le deal est refusé.")}
        {f("tarifCV", "Prix du cheval fiscal (€)", "Île-de-France 2026 : 68,95 €.")}
        {f("kmCost", "Coût du trajet (€/km)", "Compté sur l'aller-retour.")}
        {f("fraisFixes", "Frais fixes par voiture (€)", "CT, nettoyage, annonce.")}
      </div>
    </details>
  );
}

function Chiffre({ l, v, ton, sous }: { l: string; v: number | null; ton?: string; sous?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-black/25 p-4">
      <div className="text-sm text-ink-3">{l}</div>
      <div className={cx("num font-display text-2xl font-semibold", ton)}>{v == null ? "—" : eur(v)}</div>
      {sous && <div className="text-xs text-ink-3">{sous}</div>}
    </div>
  );
}

function ResultatPro({ a, reg, prixInit, onNouvelle }: { a: Analyse; reg: ParamsPro; prixInit: string; onNouvelle: () => void }) {
  const [prix, setPrix] = useState(prixInit);
  const [dist, setDist] = useState("");
  const d = dealPro(a, reg, numOrNull(prix), numOrNull(dist));
  const ia = a.ia;
  const veh = ia?.vehicule;
  const ton = VTON[d.verdict];
  const titre = [veh?.marque, veh?.modele, veh?.version].filter(Boolean).join(" ") || a.faits.titre || "Annonce";
  const infos = [veh?.generation, veh?.annee ?? a.faits.annee, (veh?.km ?? a.faits.km) != null ? `${(veh?.km ?? a.faits.km)!.toLocaleString("fr-FR")} km` : null, veh?.energie || a.faits.energie, veh?.boite || a.faits.boite, veh?.localisation || a.faits.ville, veh?.vendeur && veh.vendeur !== "inconnu" ? veh.vendeur : null].filter(Boolean);
  const gainTon = d.gain == null ? "" : d.gain >= reg.margeMin ? "text-ok" : d.gain >= 0 ? "text-warn" : "text-bad";

  return (
    <div className="grid gap-5">
      <section className={cx("grid gap-5 rounded-3xl border bg-gradient-to-b to-panel p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr]", VFOND[ton])}>
        <div>
          <p className="font-display text-lg font-semibold">{titre}</p>
          <p className="text-sm text-ink-3">{infos.join(" · ")}</p>
          <h1 className={cx("mt-4 font-display text-[clamp(30px,6vw,48px)] font-semibold leading-none tracking-tight", VTXT[ton])}>{d.verdict}</h1>
          {ia?.resume && <p className="mt-3 text-ink">{ia.resume}</p>}
          {a.iaErreur && <p className="mt-3 text-sm text-warn">{a.iaErreur} Sans cote du marché, la marge ne peut pas être calculée.</p>}
        </div>
        <div className="grid content-start gap-3">
          <div className="flex items-baseline gap-2">
            <span className={cx("num font-display text-5xl font-semibold", d.note >= 75 ? "text-ok" : d.note >= 60 ? "text-o2" : d.note >= 45 ? "text-warn" : "text-bad")}>{d.note}</span>
            <span className="text-ink-3">/ 100</span>
          </div>
          {d.cap && <p className="text-sm text-ink-3">Note plafonnée : {d.cap.why}.</p>}
          <p className="text-sm text-ink-2">
            État : <b>{d.etat.score}</b>/100, {d.etat.label.toLowerCase()}
          </p>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Chiffre l="Marge nette" v={d.gain} ton={gainTon} sous={`seuil ${eur(reg.margeMin)}`} />
        <Chiffre l="Offre à faire" v={d.offre} ton="text-o2" sous="plafond − 6 %" />
        <Chiffre l="Plafond" v={d.plafond} sous="à ne pas dépasser" />
        <Chiffre l="Revente rapide" v={d.revente} sous={ia ? `confiance ${ia.marche.confiance}` : undefined} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panneau titre="Ticket" aside="tout compris">
          <ul className="divide-y divide-line">
            {d.lignes.map((l) => (
              <li key={l.l} className="flex items-baseline justify-between gap-4 py-2.5">
                <span className={cx(l.head && "font-semibold")}>
                  {l.l}
                  {l.d && <span className="block text-xs text-ink-3">{l.d}</span>}
                </span>
                <span className={cx("num shrink-0", l.v != null && l.v < 0 ? "text-ink-2" : "text-ink")}>{l.v == null ? "—" : (l.v < 0 ? "− " : "") + eur(Math.abs(l.v))}</span>
              </li>
            ))}
            <li className="flex items-baseline justify-between gap-4 pt-3">
              <b>Il vous resterait</b>
              <b className={cx("num font-display text-xl", gainTon)}>{d.gain == null ? "—" : eur(d.gain)}</b>
            </li>
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Champ label="Votre prix (€)">
              <input value={prix} onChange={(e) => setPrix(e.target.value)} inputMode="numeric" placeholder={d.prix != null ? String(d.prix) : ""} className={cx(inputCls, "py-1.5")} />
            </Champ>
            <Champ label="Distance (km)">
              <input value={dist} onChange={(e) => setDist(e.target.value)} inputMode="numeric" placeholder={d.dist != null ? String(d.dist) : ""} className={cx(inputCls, "py-1.5")} />
            </Champ>
          </div>
        </Panneau>

        <Panneau titre="Marché" aside={ia ? `confiance ${ia.marche.confiance}` : undefined}>
          {ia && ia.marche.realiste != null ? (
            <>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  ["Bas", ia.marche.bas],
                  ["Réaliste", ia.marche.realiste],
                  ["Haut", ia.marche.haut],
                ].map(([l, v]) => (
                  <div key={l as string} className="rounded-xl border border-line p-3">
                    <div className="text-xs text-ink-3">{l}</div>
                    <div className="num font-semibold">{v == null ? "—" : eur(v as number)}</div>
                  </div>
                ))}
              </div>
              {d.prix != null && (
                <p className="mt-3 text-sm">
                  {(() => {
                    const e = (ia.marche.realiste - d.prix) / ia.marche.realiste;
                    return e > 0.03 ? (
                      <span className="text-ok">{eur(ia.marche.realiste - d.prix)} sous la cote ({Math.round(e * 100)} %)</span>
                    ) : e < -0.03 ? (
                      <span className="text-bad">{eur(d.prix - ia.marche.realiste)} au-dessus de la cote ({Math.round(-e * 100)} %)</span>
                    ) : (
                      <span>Au prix de la cote</span>
                    );
                  })()}
                </p>
              )}
              <p className="mt-2 text-sm text-ink-2">{ia.marche.commentaire}</p>
            </>
          ) : (
            <p className="text-sm text-ink-3">Cote indisponible.</p>
          )}
          {a.faits.estimSite && (
            <p className="mt-2 text-sm text-ink-3">
              Estimation du site : {eur(a.faits.estimSite.min)} à {eur(a.faits.estimSite.max)}
            </p>
          )}
        </Panneau>
      </div>

      <Panneau titre="État et remise en état" aside={`${d.postes.length} point(s)`}>
        {d.postes.length ? (
          <div className="flex flex-wrap gap-1.5">
            {d.postes.map((p) => (
              <Pastille key={p.k} ton={p.cat === "piege" ? "bad" : p.cat === "lourd" ? "warn" : p.cat === "info" ? "neutre" : "o"} title={p.extrait ? `« ${p.extrait} »` : p.src === "photos" ? "Vu sur les photos" : "Estimé par l'IA"}>
                {p.src === "photos" ? "📷 " : ""}
                {p.l}
                {p.cat !== "piege" && p.cat !== "info" && (p.nc ? " · à chiffrer" : ` · ${eur(p.min)}–${eur(p.max)}`)}
              </Pastille>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-3">Aucun défaut écrit dans l&apos;annonce{ia?.photos.fournies ? " ni vu sur les photos" : ""}.</p>
        )}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {a.faits.ct ? <Pastille ton={a.faits.ct.statut === "ok" || a.faits.ct.statut === "vierge" ? "ok" : a.faits.ct.statut === "mentionné" ? "neutre" : "bad"}>CT {a.faits.ct.statut}{a.faits.ct.dateTxt ? ` · ${a.faits.ct.dateTxt}` : ""}</Pastille> : <Pastille ton="warn">CT non mentionné</Pastille>}
          {a.faits.distribution && <Pastille ton={a.faits.distribution.statut === "faite" ? "ok" : a.faits.distribution.statut === "à faire" ? "bad" : "neutre"}>Distribution {a.faits.distribution.statut}{a.faits.distribution.km ? ` à ${a.faits.distribution.km.toLocaleString("fr-FR")} km` : ""}</Pastille>}
          {a.faits.proprietaires && <Pastille>{a.faits.proprietaires === 1 ? "1re main" : `${a.faits.proprietaires} propriétaires`}</Pastille>}
          {a.faits.carnet && <Pastille ton="ok">carnet</Pastille>}
          {a.faits.factures && <Pastille ton="ok">factures</Pastille>}
          {a.faits.importe && <Pastille ton="warn">import</Pastille>}
          {ia?.photos.vuesManquantes.length ? <Pastille>Vues manquantes : {ia.photos.vuesManquantes.join(", ")}</Pastille> : null}
        </div>
      </Panneau>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panneau titre="Moteur et fiabilité">
          {a.fiab.k !== "hors" && (
            <p className="mb-2">
              <Pastille ton={a.fiab.k === "fiable" ? "ok" : a.fiab.k === "limite" ? "warn" : "bad"}>
                {a.fiab.k === "fiable" ? "Liste fiable" : a.fiab.k === "limite" ? "Fiable, hors tranche" : "À éviter"}
              </Pastille>
            </p>
          )}
          <ul className="grid gap-1.5 text-sm text-ink-2">
            {a.fiab.pourquoi.map((x) => (
              <li key={x}>{x}</li>
            ))}
            {a.fiab.bonsMoteurs && <li>Bons moteurs : {a.fiab.bonsMoteurs}</li>}
            {a.fiab.aVerifier && <li>À vérifier : {a.fiab.aVerifier}</li>}
            {ia && (
              <li>
                {ia.fiabilite.moteur} : <b>{ia.fiabilite.note}/10</b>
                {ia.fiabilite.problemesConnus.length > 0 && ` · ${ia.fiabilite.problemesConnus.join(" ; ")}`}
              </li>
            )}
          </ul>
        </Panneau>
        <Panneau titre="Alertes et points forts">
          {ia && (ia.alertes.length || ia.pointsForts.length) ? (
            <ul className="grid gap-1.5 text-sm">
              {ia.alertes.map((x) => (
                <li key={x} className="text-warn">
                  ⚠ {x}
                </li>
              ))}
              {ia.pointsForts.map((x) => (
                <li key={x} className="text-ok">
                  ✓ {x}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-3">Rien à signaler.</p>
          )}
        </Panneau>
      </div>

      {ia && (
        <Panneau titre="Contacter le vendeur">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-sm text-ink-3">Premier message, sans prix</span>
            <Copier texte={ia.messageVendeur} />
          </div>
          <p className="rounded-xl border border-line bg-black/25 p-3 text-ink-2">{ia.messageVendeur}</p>
          {ia.questions.length > 0 && (
            <>
              <div className="mb-2 mt-5 flex items-center justify-between gap-2">
                <span className="text-sm text-ink-3">Questions à poser</span>
                <Copier texte={ia.questions.join("\n")} label="Tout copier" />
              </div>
              <ol className="grid list-decimal gap-1.5 pl-5 text-sm marker:text-o2">
                {ia.questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ol>
            </>
          )}
        </Panneau>
      )}

      <button type="button" onClick={onNouvelle} className="justify-self-center rounded-full border border-line-2 px-5 py-2.5 text-ink-2 transition hover:border-o/50 hover:text-ink">
        Analyser une autre annonce
      </button>
    </div>
  );
}
