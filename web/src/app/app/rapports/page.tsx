import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { compteBenef } from "@/lib/benef";
import { familleEspace } from "@/lib/espace";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { ListeRapports } from "@/components/benef/ListeRapports";
import { ListeAnalyses } from "@/components/espace/ListeAnalyses";

export const metadata: Metadata = { title: "Rapports" };

export default async function Page() {
  const c = await compteBenef("/app/rapports");
  const lim = Number.isFinite(c.offre.historique) ? c.offre.historique : 1000;
  const sb = await supabaseServeur();

  if (familleEspace(c) === "particulier") {
    const { data } = await sb.from("rapports").select("id, titre, verdict, prix, note, created_at").eq("mode", "particulier").order("created_at", { ascending: false }).limit(lim);
    return (
      <div className="grid gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold">Mes analyses</h1>
            <p className="mt-1 text-ink-3">{Number.isFinite(c.offre.historique) ? `Vos ${c.offre.historique === 1 ? "dernière analyse" : `${c.offre.historique} dernières analyses`}.` : "Toutes vos analyses."}</p>
          </div>
          <Link href="/app/analyser" className="btn btn-o btn-sm">
            Analyser une annonce
          </Link>
        </div>
        {data?.length ? (
          <ListeAnalyses lignes={data} />
        ) : (
          <p className="carte p-6 text-ink-3">
            Aucune analyse pour le moment. <Link href="/app/analyser" className="text-o2 underline underline-offset-4">Analysez votre première annonce</Link>.
          </p>
        )}
      </div>
    );
  }

  if (c.offre.famille !== "benef") redirect("/app");
  const { data } = await sb.from("rapports").select("id, titre, created_at, prix, verdict, marge, note").eq("mode", "benef").order("created_at", { ascending: false }).limit(lim);
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
          L&apos;historique complet et le comparateur sont inclus dans <Link href="/app/compte#formule" className="text-o2 underline underline-offset-4">Croissance</Link>.
        </p>
      )}
    </div>
  );
}
