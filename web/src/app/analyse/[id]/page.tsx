import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { compteCourant } from "@/lib/compte";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { ResultatParticulier } from "@/components/analyse/ResultatParticulier";
import type { Analyse } from "@/lib/analyse/couts";

export const metadata: Metadata = { title: "Votre analyse", robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const compte = await compteCourant();
  if (!compte) redirect(`/connexion?next=/analyse/${id}`);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { data } = await (await supabaseServeur()).from("rapports").select("resultat, created_at, mode").eq("id", id).maybeSingle();
  if (!data) notFound();
  if (data.mode === "benef") redirect(`/app/rapports/${id}`);
  return (
    <div className="wrap py-12">
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 text-sm text-ink-3">
          <Link href="/compte" className="underline underline-offset-4 hover:text-ink">Mon compte</Link> · analyse du {new Date(data.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <ResultatParticulier a={data.resultat as Analyse} />
      </div>
    </div>
  );
}
