import { libelle, listeCotes } from "@/lib/cotes-publiques";
import { Compteur } from "@/components/site/Compteur";

/** La cote en direct : les modèles les plus suivis de la base, leur prix médian et le nombre d'annonces relevées.
    Vrais chiffres. Le prix médian seulement : la cote détaillée (par année, kilométrage…) est réservée aux abonnés. */
export async function CoteEnDirect() {
  const cotes = (await listeCotes()).filter((c) => c.n > 0 && c.mediane > 0).sort((a, b) => b.n - a.n).slice(0, 6);
  if (!cotes.length) return null;
  const max = Math.max(...cotes.map((c) => c.mediane));
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {cotes.map((c) => (
        <li key={c.cle} className="vue">
          <div className="carte flex h-full flex-col gap-3 p-4 sm:p-5">
            <span className="flex items-start justify-between gap-2">
              <span className="font-medium leading-tight">{libelle(c.nom)}</span>
            </span>
            <span className="num font-display text-2xl font-semibold sm:text-3xl">
              <Compteur valeur={c.mediane} />
              &nbsp;€
            </span>
            <span className="h-1.5 rounded-full bg-glass" aria-hidden="true">
              <span className="block h-full rounded-full bg-o" style={{ width: `${(c.mediane / max) * 100}%` }} />
            </span>
            <span className="text-xs text-ink-3">
              prix médian · <span className="num">{c.n.toLocaleString("fr-FR")}</span> annonces · {c.y0}–{c.y1}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
