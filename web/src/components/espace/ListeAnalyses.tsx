import { CarteVoiture } from "../analyse/CarteVoiture";
import { CONSEILS, infoVerdict, PASTILLE } from "@/lib/analyse/verdicts";

export type LigneAnalyse = { id: string; titre: string; verdict: string | null; prix: number | null; note: number | null; created_at: string; photos?: string[]; lien?: string | null };

export const NIVEAUX: Record<string, { l: string; ton: string; conseil: string }> = {
  bon: { l: "Bon prix", ton: "border-ok/35 bg-ok/10 text-ok", conseil: "Moins chère que les voitures comparables." },
  correct: { l: "Prix juste", ton: "border-o/40 bg-o/10 text-o2", conseil: "Au prix des voitures comparables." },
  cher: { l: "Trop cher", ton: "border-warn/35 bg-warn/10 text-warn", conseil: "Plus chère que les voitures comparables : négociez." },
  prudence: { l: "À faire vérifier", ton: "border-warn/35 bg-warn/10 text-warn", conseil: "Des frais importants sont possibles : contrôle par un garage conseillé." },
  eviter: { l: "Déconseillée", ton: "border-bad/35 bg-bad/10 text-bad", conseil: "Un problème grave est signalé dans l'annonce." },
  inconnu: { l: "Prix à confirmer", ton: "border-line-2 bg-glass text-ink-2", conseil: "Pas assez d'annonces comparables pour juger le prix." },
};

/** Pastille d'une analyse : ancien niveau de prix (bon, cher…) ou verdict du bilan. */
export function niveauDe(v: string | null) {
  if (v && v in NIVEAUX) return NIVEAUX[v];
  const i = infoVerdict(v);
  return i.code ? { l: i.l, ton: PASTILLE[i.ton], conseil: CONSEILS[i.code] } : NIVEAUX.inconnu;
}

/** Analyses d'un particulier : une carte par voiture, photos à faire glisser, verdict en clair. */
export function ListeAnalyses({ lignes }: { lignes: LigneAnalyse[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {lignes.map((r) => {
        const n = niveauDe(r.verdict);
        return (
          <li key={r.id}>
            <CarteVoiture href={`/app/rapports/${r.id}`} titre={r.titre} photos={r.photos ?? []} prix={r.prix} badge={n} sous={n.conseil} lien={r.lien} date={r.created_at} />
          </li>
        );
      })}
    </ul>
  );
}
