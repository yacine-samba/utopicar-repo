import Link from "next/link";
import { compteBenef } from "@/lib/benef";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { ListeRapports } from "@/components/benef/ListeRapports";

export default async function Page() {
  const c = await compteBenef("/app/rapports");
  const lim = Number.isFinite(c.offre.historique) ? c.offre.historique : 1000;
  const { data } = await (await supabaseServeur()).from("rapports").select("id, titre, created_at, prix, verdict, marge, note").eq("mode", "benef").order("created_at", { ascending: false }).limit(lim);
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Rapports</h1>
          <p className="mt-1 text-ink-3">{Number.isFinite(c.offre.historique) ? `Vos ${c.offre.historique} derniers rapports.` : "Tous vos rapports."}</p>
        </div>
        <Link href="/app/analyser" className="btn btn-o btn-sm">
          Analyser une annonce
        </Link>
      </div>
      <ListeRapports rapports={data ?? []} comparateur={c.offre.comparateur} vide="Aucun rapport pour le moment : lancez votre première analyse." />
      {!Number.isFinite(c.offre.historique) ? null : (
        <p className="text-sm text-ink-3">
          L&apos;historique complet et le comparateur sont inclus dans <Link href="/tarifs#benef" className="text-o2 underline underline-offset-4">Croissance</Link>.
        </p>
      )}
    </div>
  );
}
