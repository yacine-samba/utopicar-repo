import { dateTxt, listeCotes } from "@/lib/cotes-publiques";
import { Compteur } from "./Compteur";

/** Les vrais chiffres de la base du marché (rien d'arrondi à la hausse), qui montent quand ils arrivent à l'écran. */
export async function ChiffresMarche() {
  const cotes = await listeCotes();
  const annonces = cotes.reduce((s, c) => s + c.n, 0);
  if (!annonces) return null;
  const releve = dateTxt(cotes.map((c) => c.maj).filter((d): d is string => !!d).sort().pop() ?? null);
  return (
    <section aria-label="La base du marché" className="wrap pb-6">
      <dl className="grid grid-cols-3 gap-2 text-center sm:gap-3">
        {(
          [
            [annonces, "annonces relevées", releve ? `au ${releve}` : null],
            [cotes.length, "modèles cotés", null],
            [38, "défauts recherchés", null],
          ] as [number, string, string | null][]
        ).map(([v, l, s]) => (
          <div key={l} className="flex flex-col rounded-2xl border border-line px-2 py-4 sm:px-4">
            {/* le chiffre d'abord à l'écran, l'intitulé d'abord pour les lecteurs d'écran (dt avant dd) */}
            <dt className="order-2 text-xs text-ink-2 sm:text-sm">{l}</dt>
            <dd className="num order-1 font-display text-2xl font-semibold text-ink sm:text-4xl">
              <Compteur valeur={v} />
            </dd>
            {s && <dd className="order-3 mt-0.5 hidden text-xs text-ink-3 sm:block">{s}</dd>}
          </div>
        ))}
      </dl>
    </section>
  );
}
