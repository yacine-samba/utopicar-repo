import Link from "next/link";
import { compteBenef } from "@/lib/benef";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { VerrouBenef } from "@/components/benef/Verrou";
import { coutParticulier, dealPro, DEFAUTS_PART, DEFAUTS_PRO, type Analyse } from "@/lib/analyse/couts";

type Ligne = { l: string; v: (number | string | null)[]; meilleur?: "haut" | "bas"; euros?: boolean };

export default async function Page({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const c = await compteBenef("/app/comparer");
  if (!c.offre.comparateur) return <VerrouBenef offre="croissance" titre="Comparateur de rapports" texte="Mettez deux ou trois voitures côte à côte : prix, cote, marge, état et fiabilité, avec la meilleure valeur en évidence." />;
  const ids = ((await searchParams).ids ?? "").split(",").filter((x) => /^[0-9a-f-]{36}$/.test(x)).slice(0, 3);
  if (ids.length < 2)
    return (
      <div className="carte p-8 text-center">
        <h1 className="font-display text-2xl font-semibold">Comparer des rapports</h1>
        <p className="mt-2 text-ink-2">Dans la liste des rapports, cochez deux ou trois voitures puis cliquez sur « Comparer ».</p>
        <Link href="/app/rapports" className="btn btn-o mt-5">
          Choisir les rapports
        </Link>
      </div>
    );
  const { data } = await (await supabaseServeur()).from("rapports").select("id, titre, resultat").in("id", ids);
  const rs = (data ?? []).map((r) => {
    const a = r.resultat as Analyse;
    const d = dealPro(a, { ...DEFAUTS_PRO, ville: a.ville || DEFAUTS_PRO.ville }, null, null);
    const e = coutParticulier(a, DEFAUTS_PART, null).etat;
    return { id: r.id, titre: r.titre, a, d, e };
  });
  const lignes: Ligne[] = [
    { l: "Prix demandé", v: rs.map((r) => r.d.prix), meilleur: "bas", euros: true },
    { l: "Cote du marché", v: rs.map((r) => r.a.ia?.marche.realiste ?? null), euros: true },
    { l: "Revente rapide", v: rs.map((r) => r.d.revente), meilleur: "haut", euros: true },
    { l: "Remise en état", v: rs.map((r) => r.d.remise), meilleur: "bas", euros: true },
    { l: "Marge nette", v: rs.map((r) => r.d.gain), meilleur: "haut", euros: true },
    { l: "Plafond", v: rs.map((r) => r.d.plafond), euros: true },
    { l: "Note", v: rs.map((r) => r.d.note), meilleur: "haut" },
    { l: "État", v: rs.map((r) => r.e.score), meilleur: "haut" },
    { l: "Kilométrage", v: rs.map((r) => r.a.faits.km ?? r.a.ia?.vehicule.km ?? null), meilleur: "bas" },
    { l: "Année", v: rs.map((r) => r.a.faits.annee ?? r.a.ia?.vehicule.annee ?? null), meilleur: "haut" },
    { l: "Moteur", v: rs.map((r) => (r.a.fiab.k === "eviter" ? "À éviter" : r.a.fiab.k === "fiable" ? "Fiable" : r.a.fiab.k === "limite" ? "Fiable, hors tranche" : "Hors liste")) },
    { l: "Verdict", v: rs.map((r) => r.d.verdict) },
  ];
  const meilleur = (l: Ligne) => {
    if (!l.meilleur) return -1;
    const nums = l.v.map((x) => (typeof x === "number" ? x : null));
    const ok = nums.filter((x): x is number => x != null);
    if (ok.length < 2) return -1;
    const best = l.meilleur === "haut" ? Math.max(...ok) : Math.min(...ok);
    return nums.filter((x) => x === best).length === 1 ? nums.indexOf(best) : -1;
  };
  return (
    <div className="grid gap-5">
      <h1 className="font-display text-3xl font-semibold">Comparateur</h1>
      <p className="text-ink-3">Fond vert : la meilleure valeur de la ligne.</p>
      <div className="carte overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <caption className="sr-only">Comparaison de {rs.length} rapports</caption>
          <thead>
            <tr className="border-b border-line">
              <td className="px-4 py-3" />
              {rs.map((r) => (
                <th key={r.id} scope="col" className="px-4 py-3 text-left font-display text-base font-semibold">
                  <Link href={`/app/rapports/${r.id}`} className="hover:text-o2">
                    {r.titre}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {lignes.map((l) => {
              const b = meilleur(l);
              return (
                <tr key={l.l}>
                  <th scope="row" className="px-4 py-3 text-left font-normal text-ink-3">
                    {l.l}
                  </th>
                  {l.v.map((x, i) => (
                    <td key={i} className={`num px-4 py-3 ${i === b ? "bg-ok/10 font-semibold text-ok" : ""}`}>
                      {x == null ? "—" : typeof x === "number" && l.euros ? `${x.toLocaleString("fr-FR")} €` : typeof x === "number" ? x.toLocaleString("fr-FR") : x}
                      {i === b && <span className="sr-only"> (meilleure valeur)</span>}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-3">Calculs avec les réglages par défaut (marge minimum 800 €, frais fixes 150 €). Ouvrez un rapport pour l&apos;ajuster à vos réglages.</p>
    </div>
  );
}
