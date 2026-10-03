import Link from "next/link";
import { compteCourant, debutPeriode } from "@/lib/compte";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { statsParc, type Vehicule } from "@/lib/parc";
import { ListeRapports } from "@/components/benef/ListeRapports";

const eur = (v: number | null) => (v == null ? "—" : `${Math.round(v).toLocaleString("fr-FR")} €`);

function Tuile({ l, v, sous, alerte }: { l: string; v: string; sous?: string; alerte?: boolean }) {
  return (
    <div className="carte p-5">
      <p className="text-sm text-ink-3">{l}</p>
      <p className="num mt-1 font-display text-3xl font-semibold">{v}</p>
      {sous && <p className={`mt-1 text-sm ${alerte ? "text-warn" : "text-ink-3"}`}>{alerte && <span aria-hidden="true">⚠ </span>}{sous}</p>}
    </div>
  );
}

export default async function TableauDeBord() {
  const c = await compteCourant();
  if (!c)
    return (
      <div className="carte p-8 text-center">
        <h1 className="font-display text-2xl font-semibold">Mode démonstration</h1>
        <p className="mt-2 text-ink-2">Le tableau de bord s&apos;affiche avec un compte. L&apos;analyse reste disponible pour essayer.</p>
        <Link href="/app/analyser" className="btn btn-o mt-5">
          Analyser une annonce
        </Link>
      </div>
    );
  const sb = await supabaseServeur();
  const debut = debutPeriode(c.offre);
  const [{ data: mois }, { data: derniers }] = await Promise.all([
    sb.from("rapports").select("id, titre, marge, verdict, prix").eq("mode", "benef").gte("created_at", debut).limit(1000),
    sb.from("rapports").select("id, titre, created_at, prix, verdict, marge, note").eq("mode", "benef").order("created_at", { ascending: false }).limit(5),
  ]);
  const go = (mois ?? []).filter((r) => r.verdict?.startsWith("GO"));
  const marges = go.map((r) => r.marge).filter((x): x is number => x != null);
  const meilleure = [...(mois ?? [])].filter((r) => r.marge != null).sort((a, b) => (b.marge ?? 0) - (a.marge ?? 0))[0];
  const complet = c.offre.tableauDeBord === "complet";
  const parc = complet ? statsParc(((await sb.from("parc").select("*").limit(1000)).data ?? []) as Vehicule[]) : null;

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Tableau de bord</h1>
          <p className="mt-1 text-ink-3">Ce mois-ci, depuis le 1er.</p>
        </div>
        <Link href="/app/analyser" className="btn btn-o btn-sm">
          Analyser une annonce
        </Link>
      </div>

      <section aria-labelledby="tb-analyses">
        <h2 id="tb-analyses" className="mb-3 font-display text-lg font-semibold">
          Analyses
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tuile l="Analyses ce mois" v={`${c.utilisees} / ${c.offre.analyses}`} sous={`${c.restantes} restante${c.restantes > 1 ? "s" : ""}`} alerte={c.restantes <= 3} />
          <Tuile l="Affaires GO repérées" v={String(go.length)} sous={`sur ${(mois ?? []).length} annonce${(mois ?? []).length > 1 ? "s" : ""} analysée${(mois ?? []).length > 1 ? "s" : ""}`} />
          <Tuile l="Marge moyenne des GO" v={eur(marges.length ? marges.reduce((s, x) => s + x, 0) / marges.length : null)} sous="estimée avant achat" />
          <Tuile l="Meilleure affaire" v={eur(meilleure?.marge ?? null)} sous={meilleure?.titre ?? "aucune ce mois"} />
        </div>
      </section>

      {parc ? (
        <section aria-labelledby="tb-parc">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="tb-parc" className="font-display text-lg font-semibold">
              Parc et marges réelles
            </h2>
            <Link href="/app/parc" className="text-sm text-o2 underline underline-offset-4">
              Gérer le parc
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Tuile l="Voitures en stock" v={String(parc.enStock)} sous={parc.plusVieux != null ? `la plus ancienne depuis ${parc.plusVieux} jours` : undefined} alerte={(parc.plusVieux ?? 0) > 45} />
            <Tuile l="Capital immobilisé" v={eur(parc.capital)} sous="achats + frais du stock" />
            <Tuile l="Marge réalisée ce mois" v={eur(parc.margeMois)} sous="voitures vendues ce mois" />
            <Tuile l="Marge moyenne par voiture" v={eur(parc.margeMoyenne)} sous={`${parc.vendus} voiture${parc.vendus > 1 ? "s" : ""} vendue${parc.vendus > 1 ? "s" : ""}`} />
            <Tuile l="Rotation moyenne" v={parc.rotation != null ? `${parc.rotation} j` : "—"} sous="de l'achat à la vente" />
            <Tuile l="Marge réalisée au total" v={eur(parc.margeTotale)} />
          </div>
        </section>
      ) : (
        <section className="carte border-dashed p-6">
          <h2 className="font-display text-lg font-semibold">Le tableau de bord complet</h2>
          <p className="mt-1 text-ink-2">Stock, capital immobilisé, marges réelles et rotation : inclus dans Benef Pro, avec la gestion du parc.</p>
          <Link href="/tarifs#benef" className="btn btn-sm mt-4">
            Découvrir Pro
          </Link>
        </section>
      )}

      <section aria-labelledby="tb-derniers">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="tb-derniers" className="font-display text-lg font-semibold">
            Derniers rapports
          </h2>
          <Link href="/app/rapports" className="text-sm text-o2 underline underline-offset-4">
            Tous les rapports
          </Link>
        </div>
        <ListeRapports rapports={derniers ?? []} comparateur={false} vide="Aucun rapport pour le moment : lancez votre première analyse." />
      </section>
    </div>
  );
}
