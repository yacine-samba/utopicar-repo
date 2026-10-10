import type { CSSProperties, ReactNode } from "react";

/* Ce que Benef fait pour chaque voiture, montré plutôt qu'écrit : quatre cartes, chacune avec une mini-maquette
   de l'écran correspondant (illustrations, pas des données). Elles s'animent quand elles arrivent à l'écran. */

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

function Carte({ titre, sous, children }: { titre: string; sous: string; children: ReactNode }) {
  return (
    <li className="vue attend">
      <article className="carte scene flex h-full flex-col gap-4 p-5">
        <div className="grid min-h-28 place-items-center rounded-2xl border border-line bg-creux p-4" aria-hidden="true">
          {children}
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold">{titre}</h3>
          <p className="text-sm text-ink-3">{sous}</p>
        </div>
      </article>
    </li>
  );
}

export function OutilsBenef() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Carte titre="Marge et verdict" sous="GO ou NO GO, avant d'appeler">
        <div className="flex w-full items-center justify-between gap-3">
          <span className="pas rounded-lg border-2 border-ok px-2 py-0.5 font-display text-lg font-bold text-ok" style={d(0.3)}>
            GO
          </span>
          <span className="pas num font-display text-3xl font-semibold text-ok" style={d(0.5)}>
            +670 €
          </span>
        </div>
      </Carte>
      <Carte titre="Négociation" sous="Le message et le prix d'offre, prêts">
        <div className="grid w-full gap-2 text-xs">
          <span className="pas w-[85%] rounded-2xl rounded-bl-md bg-glass px-3 py-2 text-ink-2" style={d(0.3)}>
            Bonjour, votre Clio m&apos;intéresse. Le CT est récent ?
          </span>
          <span className="pas ml-auto rounded-full bg-o px-3 py-1 font-semibold text-[#160904]" style={d(0.6)}>
            Offre : 4 700 €
          </span>
        </div>
      </Carte>
      <Carte titre="Tableau de bord" sous="Vos marges, mois après mois">
        <div className="flex h-20 w-full items-end gap-2">
          {[38, 55, 46, 72, 64, 90].map((h, i) => (
            <span key={i} className="flex h-full flex-1 items-end">
              <span className={`pas w-full rounded-t-md ${i === 5 ? "bg-o" : "bg-o/35"}`} style={{ height: `${h}%`, ...d(0.2 + i * 0.08) }} />
            </span>
          ))}
        </div>
      </Carte>
      <Carte titre="Parc" sous="De la voiture repérée à la vente (Pro)">
        <ol className="relative flex w-full items-center justify-between">
          <span className="absolute inset-x-2 top-1/2 h-0.5 -translate-y-1/2 bg-line-2">
            <span className="jauge absolute inset-y-0 left-0 w-3/4 bg-o" style={d(0.3)} />
          </span>
          {["Repérée", "Achetée", "Prête", "En vente", "Vendue"].map((l, i) => (
            <li key={l} className="relative grid justify-items-center">
              <span className={`pas size-4 rounded-full border-2 ${i < 4 ? "border-o bg-o" : "border-line-2 bg-bg0"}`} style={d(0.3 + i * 0.12)} />
            </li>
          ))}
        </ol>
      </Carte>
    </ul>
  );
}
