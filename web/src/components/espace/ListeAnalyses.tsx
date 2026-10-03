import Link from "next/link";
import { cx } from "@/lib/cx";

export type LigneAnalyse = { id: string; titre: string; verdict: string | null; prix: number | null; note: number | null; created_at: string };

export const NIVEAUX: Record<string, { l: string; ton: string }> = {
  bon: { l: "Bonne affaire", ton: "border-ok/35 bg-ok/10 text-ok" },
  correct: { l: "Prix correct", ton: "border-o/40 bg-o/10 text-o2" },
  cher: { l: "Trop cher", ton: "border-warn/35 bg-warn/10 text-warn" },
  prudence: { l: "Prudence", ton: "border-warn/35 bg-warn/10 text-warn" },
  eviter: { l: "À éviter", ton: "border-bad/35 bg-bad/10 text-bad" },
  inconnu: { l: "Prix non évalué", ton: "border-line-2 bg-glass text-ink-2" },
};

const dateFr = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

/** Analyses d'un particulier : une carte par voiture, avec le verdict en couleur. */
export function ListeAnalyses({ lignes }: { lignes: LigneAnalyse[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {lignes.map((r) => {
        const n = NIVEAUX[r.verdict ?? ""] ?? NIVEAUX.inconnu;
        return (
          <li key={r.id}>
            <Link href={`/app/rapports/${r.id}`} className="carte group flex h-full flex-col gap-3 p-5 transition hover:border-o/40">
              <div className="flex items-start justify-between gap-3">
                <span className="font-display text-[17px] font-semibold leading-snug group-hover:text-o2">{r.titre}</span>
                <span className={cx("shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium", n.ton)}>{n.l}</span>
              </div>
              <div className="mt-auto flex flex-wrap items-baseline justify-between gap-2 text-sm text-ink-3">
                <span>{r.prix != null ? <b className="num font-semibold text-ink">{r.prix.toLocaleString("fr-FR")}&nbsp;€</b> : "Prix non lu"}</span>
                <span>{dateFr(r.created_at)}</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
