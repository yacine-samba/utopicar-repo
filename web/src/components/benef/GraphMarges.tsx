"use client";
import Link from "next/link";
import { cx } from "@/lib/cx";
import { useProfilAnalyse } from "../analyse/ProfilAnalyse";

/* Marges par voiture (vendues, puis prévues en clair) face au bénéfice minimum du profil d'analyse, comme l'outil Garage. */
export type BarreMarge = { id: string; nom: string; marge: number; prevue: boolean };

export function GraphMarges({ barres }: { barres: BarreMarge[] }) {
  const seuil = useProfilAnalyse().profil.margeMin;
  if (!barres.length) return <p className="text-sm text-ink-3">Renseignez prix d&apos;achat, frais et prix de vente dans le parc pour voir les marges.</p>;
  const lo = Math.min(0, ...barres.map((b) => b.marge));
  const hi = Math.max(seuil, ...barres.map((b) => b.marge)) * 1.08;
  const pos = (x: number) => ((x - lo) / (hi - lo || 1)) * 100;
  const z = pos(0), th = pos(seuil);
  return (
    <div className="grid gap-2">
      {barres.map((b) => {
        const a = Math.min(z, pos(b.marge)), w = Math.max(Math.abs(pos(b.marge) - z), 0.6);
        return (
          <Link key={b.id} href="/app/parc" className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-sm hover:text-ink sm:grid-cols-[minmax(0,14rem)_1fr_auto]">
            <span className="truncate text-ink-2" title={b.nom}>{b.nom}{b.prevue && <span className="ml-1 text-xs text-ink-3">prévue</span>}</span>
            <span className="relative h-3 rounded-full bg-glass">
              <span className={cx("absolute top-0 h-3 rounded-full", b.marge < 0 ? "bg-bad" : b.marge < seuil ? "bg-warn" : "bg-ok", b.prevue && "opacity-50")} style={{ left: `${a}%`, width: `${w}%` }} />
              {lo < 0 && <span className="absolute -top-1 h-5 w-px bg-ink-3" style={{ left: `${z}%` }} aria-hidden="true" />}
              <span className="absolute -top-1 h-5 w-0.5 bg-o" style={{ left: `${th}%` }} aria-hidden="true" />
            </span>
            <span className="num w-20 text-right">{Math.round(b.marge).toLocaleString("fr-FR")} €</span>
          </Link>
        );
      })}
      <p className="mt-1 flex items-center gap-2 text-xs text-ink-3"><span className="inline-block h-3 w-0.5 bg-o" aria-hidden="true" /> seuil de marge {seuil.toLocaleString("fr-FR")} €</p>
    </div>
  );
}
