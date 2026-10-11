"use client";
import { useState } from "react";
/* Rapport Benef sans le format complet (anciens rapports) : le bilan, une simulation de prix et de distance, l'annonce. */
import { eur, type Analyse, type ParamsPro } from "@/lib/analyse/couts";
import { Champ, Panneau, Pastille, cx, inputCls } from "../ui";
import { Bilan, useBilan } from "../analyse/Bilan";
import { SuiteRapport } from "../analyse/SuiteRapport";

export const numOrNull = (s: string) => {
  const v = Number(s.replace(/[\s\u00a0€]/g, "").replace(",", "."));
  return s.trim() !== "" && Number.isFinite(v) ? v : null;
};

export function ResultatBenef({ a, prixInit = "", onNouvelle, actions, id }: { a: Analyse; reg?: ParamsPro; prixInit?: string; onNouvelle?: () => void; actions?: React.ReactNode; id?: string | null }) {
  const [prix, setPrix] = useState(prixInit);
  const [dist, setDist] = useState("");
  const b = useBilan(a, { prix: numOrNull(prix), distance: numOrNull(dist) });
  const ia = a.ia;
  const postes = b.travaux.postes;

  return (
    <div className="grid gap-5">
      {a.demo && <span className="text-sm text-warn">Mode démonstration : rien n&apos;est enregistré.</span>}
      {a.regles && <p className="text-sm text-ink-3">Analyse faite avec les règles et la cote de l&apos;outil : les photos n&apos;ont pas été examinées.</p>}
      {a.iaErreur && <p className="text-sm text-warn">{a.iaErreur} Sans cote du marché, la marge ne peut pas être calculée.</p>}
      <Bilan a={a} b={b} lien={a.lien} rapportId={id ?? a.rapportId ?? null} />
      {(id ?? a.rapportId) && <SuiteRapport a={a} id={(id ?? a.rapportId)!} />}

      <Panneau titre="Simuler">
        <div className="grid grid-cols-2 gap-3 sm:max-w-md">
          <Champ label="Votre prix (€)">
            <input value={prix} onChange={(e) => setPrix(e.target.value)} inputMode="numeric" placeholder={b.argent.prix != null ? String(b.argent.prix) : ""} className={cx(inputCls, "py-1.5")} />
          </Champ>
          <Champ label="Distance (km)">
            <input value={dist} onChange={(e) => setDist(e.target.value)} inputMode="numeric" placeholder={b.argent.dist != null ? String(b.argent.dist) : ""} className={cx(inputCls, "py-1.5")} />
          </Champ>
        </div>
      </Panneau>

      <Panneau titre="Ce que dit l'annonce" aside={`${postes.length} point(s)`}>
        <div className="flex flex-wrap gap-1.5">
          {a.faits.ct ? <Pastille ton={a.faits.ct.statut === "ok" || a.faits.ct.statut === "vierge" ? "ok" : a.faits.ct.statut === "mentionné" ? "neutre" : "bad"}>CT {a.faits.ct.statut}{a.faits.ct.dateTxt ? ` · ${a.faits.ct.dateTxt}` : ""}</Pastille> : <Pastille ton="warn">CT non mentionné</Pastille>}
          {a.faits.distribution && <Pastille ton={a.faits.distribution.statut === "faite" ? "ok" : a.faits.distribution.statut === "à faire" ? "bad" : "neutre"}>Distribution {a.faits.distribution.statut}{a.faits.distribution.km ? ` à ${a.faits.distribution.km.toLocaleString("fr-FR")} km` : ""}</Pastille>}
          {a.faits.proprietaires && <Pastille>{a.faits.proprietaires === 1 ? "1re main" : `${a.faits.proprietaires} propriétaires`}</Pastille>}
          {a.faits.carnet && <Pastille ton="ok">carnet</Pastille>}
          {a.faits.factures && <Pastille ton="ok">factures</Pastille>}
          {(a.faits.recents ?? []).map((x) => (
            <Pastille key={x} ton="ok">{x} refait</Pastille>
          ))}
          {a.faits.importe && <Pastille ton="warn">import</Pastille>}
          {ia?.photos.vuesManquantes.length ? <Pastille>Vues manquantes : {ia.photos.vuesManquantes.join(", ")}</Pastille> : null}
        </div>
      </Panneau>

      {ia?.negociation && (
        <Panneau titre="Négociation">
          {ia.negociation.arguments.length > 0 && (
            <ul className="mb-4 divide-y divide-line">
              {ia.negociation.arguments.map((x) => (
                <li key={x.argument} className="flex justify-between gap-4 py-2">
                  <span>{x.argument}</span>
                  {x.montant != null && <span className="num shrink-0 text-ink-2">{eur(x.montant)}</span>}
                </li>
              ))}
            </ul>
          )}
          <ul className="grid list-disc gap-1.5 pl-5 text-sm text-ink-2 marker:text-o2">
            {ia.negociation.conseils.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Panneau>
      )}

      {ia?.visite && (
        <Panneau titre="Inspection sur place">
          <ul className="grid list-disc gap-1.5 pl-5 text-ink-2 marker:text-o2 sm:columns-2">
            {ia.visite.aControler.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Panneau>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        {actions}
        {onNouvelle && (
          <button type="button" onClick={onNouvelle} className="btn">
            Analyser une autre annonce
          </button>
        )}
      </div>
    </div>
  );
}
