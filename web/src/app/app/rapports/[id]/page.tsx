import Link from "next/link";
import { notFound } from "next/navigation";
import { compteBenef, dateCourte } from "@/lib/benef";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { RapportEnregistre } from "@/components/benef/RapportEnregistre";
import type { Analyse } from "@/lib/analyse/couts";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await compteBenef(`/app/rapports/${id}`);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { data } = await (await supabaseServeur()).from("rapports").select("titre, resultat, created_at, annonce").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <div className="grid gap-5">
      <p className="text-sm text-ink-3">
        <Link href="/app/rapports" className="underline underline-offset-4 hover:text-ink">Rapports</Link> · {dateCourte(data.created_at)}
      </p>
      <RapportEnregistre a={data.resultat as Analyse} id={id} titre={data.titre} parc={c.offre.parc} />
      {data.annonce && (
        <details className="carte p-5">
          <summary className="cursor-pointer font-display font-semibold">Texte de l&apos;annonce analysée</summary>
          <pre className="mt-3 whitespace-pre-wrap font-body text-sm text-ink-2">{data.annonce}</pre>
        </details>
      )}
    </div>
  );
}
