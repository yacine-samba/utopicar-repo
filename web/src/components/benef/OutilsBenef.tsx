import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Picto, TuilePicto, type NomPicto } from "@/components/site/Picto";

/* Ce que Benef fait pour chaque voiture, en bento : la taille d'une case dit son importance, une seule idée par case,
   et l'action dans sa propre case (qui ramène au champ d'essai, l'unique objectif de la page).
   Case d'ancrage : la marge et le verdict, avec les chiffres du premier scénario du calculateur (Clio IV bien achetée).
   Les mini-maquettes sont des illustrations de l'écran, pas des données ; elles s'animent quand elles arrivent à l'écran. */

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
const REVENTE = 6300, ACHAT = 5000, FRAIS = 630;
const MARGE = REVENTE - ACHAT - FRAIS;
const pc = (v: number) => `${(v / REVENTE) * 100}%`;
const e = (v: number) => `${v.toLocaleString("fr-FR").replace(/ /g, " ")} €`;

function Case({ className, titre, sous, picto, children }: { className?: string; titre: string; sous: string; picto?: NomPicto; children: ReactNode }) {
  return (
    <li className={cx("vue attend", className)}>
      <article className="carte scene flex h-full flex-col gap-4 p-5 sm:p-6">
        <div className="grid flex-1 place-items-center rounded-2xl border border-line bg-creux p-4" aria-hidden="true">
          {children}
        </div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold">{titre}</h3>
            <p className="text-sm text-ink-3">{sous}</p>
          </div>
          {picto && <TuilePicto nom={picto} />}
        </div>
      </article>
    </li>
  );
}

export function OutilsBenef() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
      {/* 1. la case d'ancrage : la marge et le verdict, avant d'appeler */}
      <li className="vue attend sm:col-span-2 lg:col-span-4 lg:row-span-2">
        <article className="carte scene flex h-full flex-col gap-5 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-o2">Avant d&apos;appeler le vendeur</p>
              <h3 className="mt-1 font-display text-2xl font-semibold">Marge nette et verdict</h3>
            </div>
            <span className="pas grid justify-items-center rounded-xl border-2 border-ok px-3 py-1 text-ok" style={d(1.1)} aria-hidden="true">
              <span className="respire font-display text-2xl font-bold leading-none tracking-wider">GO</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide">à acheter</span>
            </span>
          </div>
          {/* le chiffre qui décide, en très grand */}
          <p className="pas my-auto" style={d(1)} aria-hidden="true">
            <span className="num block font-display text-[clamp(56px,8vw,96px)] font-semibold leading-none tracking-tight text-ok">+{e(MARGE)}</span>
            <span className="mt-1 block text-sm text-ink-3">de marge nette, frais déduits</span>
          </p>
          <figure className="grid gap-3">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-ink-3">Revente réaliste</span>
              <b className="num">{e(REVENTE)}</b>
            </div>
            <div className="relative h-5 overflow-hidden rounded-full bg-glass" aria-hidden="true">
              <span className="jauge absolute inset-y-0 left-0 bg-o" style={{ width: pc(ACHAT), ...d(0.2) }} />
              <span className="jauge absolute inset-y-0 bg-warn" style={{ left: pc(ACHAT), width: pc(FRAIS), ...d(0.5) }} />
              <span className="jauge absolute inset-y-0 bg-ok" style={{ left: pc(ACHAT + FRAIS), width: pc(MARGE), ...d(0.8) }} />
            </div>
            <ul className="grid grid-cols-3 gap-2 text-sm" aria-hidden="true">
              {(
                [
                  ["Achat", ACHAT, "bg-o", ""],
                  ["Frais", FRAIS, "bg-warn", ""],
                  ["Marge", MARGE, "bg-ok", "text-ok"],
                ] as const
              ).map(([l, v, puce, txt], k) => (
                <li key={l} className="pas grid" style={d(0.35 + k * 0.3)}>
                  <span className="flex items-center gap-1.5 text-ink-3">
                    <span className={`size-2 rounded-full ${puce}`} />
                    {l}
                  </span>
                  <b className={`num ${txt}`}>{e(v)}</b>
                </li>
              ))}
            </ul>
            <figcaption className="sr-only">
              Exemple : revente réaliste {e(REVENTE)}, achat {e(ACHAT)}, frais {e(FRAIS)}, marge nette {e(MARGE)}. Verdict GO. Prix d&apos;offre 4 700 €, à ne pas dépasser 5 000 €.
            </figcaption>
          </figure>
          <dl className="grid grid-cols-2 gap-3 border-t border-line pt-4" aria-hidden="true">
            <div className="pas" style={d(1.2)}>
              <dt className="text-sm text-ink-3">Prix d&apos;offre</dt>
              <dd className="num font-display text-3xl font-semibold">4 700 €</dd>
            </div>
            <div className="pas" style={d(1.35)}>
              <dt className="text-sm text-ink-3">À ne pas dépasser</dt>
              <dd className="num font-display text-3xl font-semibold">5 000 €</dd>
            </div>
          </dl>
        </article>
      </li>

      {/* 2. la négociation, rédigée */}
      <Case className="lg:col-span-2" picto="poignee" titre="Négociation" sous="Le message et le prix d'offre, prêts">
        <div className="grid w-full gap-2 text-xs">
          <span className="pas w-[88%] rounded-2xl rounded-bl-md bg-glass px-3 py-2 text-ink-2" style={d(0.3)}>
            Bonjour, votre Clio m&apos;intéresse. Le CT est récent ?
          </span>
          <span className="pas ml-auto rounded-full bg-o px-3 py-1 font-semibold text-[#160904]" style={d(0.6)}>
            Offre : 4 700 €
          </span>
        </div>
      </Case>

      {/* 3. le tableau de bord */}
      <Case className="lg:col-span-2" picto="marge" titre="Tableau de bord" sous="Vos marges, mois après mois">
        <div className="flex h-20 w-full items-end gap-2">
          {[38, 55, 46, 72, 64, 90].map((h, i) => (
            <span key={i} className="flex h-full flex-1 items-end">
              <span className={cx("monte w-full rounded-t-md", i === 5 ? "bg-o" : "bg-o/35")} style={{ height: `${h}%`, ...d(0.2 + i * 0.08) }} />
            </span>
          ))}
        </div>
      </Case>

      {/* 4. le parc, de la voiture repérée à la vente */}
      <Case className="lg:col-span-3" picto="voiture" titre="Parc" sous="Chaque voiture, de l'achat à la vente, avec sa marge réelle (Pro)">
        <ol className="relative grid w-full grid-cols-5">
          <span className="absolute left-[10%] right-[10%] top-2 h-0.5 bg-line-2">
            <span className="jauge absolute inset-y-0 left-0 w-3/4 bg-o" style={d(0.3)} />
            {/* une voiture qui avance d'étape en étape */}
            <span className="trajet absolute inset-0" aria-hidden="true">
              <span className="absolute -top-[22px] left-0 -ml-3 text-o">
                <Picto nom="voiture" className="size-6" />
              </span>
            </span>
          </span>
          {["Repérée", "Achetée", "Prête", "En vente", "Vendue"].map((l, i) => (
            <li key={l} className="relative grid justify-items-center gap-2 text-center">
              <span className={cx("pas size-4 rounded-full border-2", i < 4 ? "border-o bg-o" : "border-line-2 bg-bg0")} style={d(0.3 + i * 0.12)} />
              <span className="text-[11px] text-ink-3 sm:text-xs">{l}</span>
            </li>
          ))}
        </ol>
      </Case>

      {/* 5. l'action, dans sa propre case : retour au champ d'essai */}
      <li className="vue lg:col-span-3">
        <Link href="#essai" className="reflet isolate group flex h-full min-h-44 flex-col justify-between gap-4 rounded-[26px] bg-o p-6 text-[#160904] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-24px_rgb(255_90_31/0.9)]">
          <span className="pointer-events-none absolute -bottom-6 -right-6 -z-10 text-[#160904]/15" aria-hidden="true">
            <Picto nom="voiture" className="size-40" />
          </span>
          <span className="font-display text-2xl font-semibold leading-tight">Combien vous rapporterait votre prochaine voiture ?</span>
          <span className="flex items-center justify-between font-semibold">
            Chiffrer une annonce
            <span className="grid size-11 place-items-center rounded-full bg-[#160904] text-o transition group-hover:translate-x-1" aria-hidden="true">
              <span className="pousse">→</span>
            </span>
          </span>
        </Link>
      </li>
    </ul>
  );
}
