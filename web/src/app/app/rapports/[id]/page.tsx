import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compteBenef, dateCourte } from "@/lib/benef";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { RapportEnregistre } from "@/components/benef/RapportEnregistre";
import { ResultatParticulier } from "@/components/analyse/ResultatParticulier";
import type { Analyse } from "@/lib/analyse/couts";
import type { Vendeur } from "@/lib/analyse/vendeur";
import { EnTeteRapport } from "@/components/analyse/EnTeteRapport";

export const metadata: Metadata = { title: "Rapport" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await compteBenef(`/app/rapports/${id}`);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { data } = await (await supabaseServeur()).from("rapports").select("titre, resultat, created_at, annonce, mode, prix, photos, lien, vendeur").eq("id", id).maybeSingle();
  if (!data) notFound();
  const particulier = data.mode === "particulier";
  const a = data.resultat as Analyse;
  const photos: string[] = data.photos?.length ? data.photos : (a.photosUrls ?? []);
  // Découverte : les 3 premières photos, toutes ensuite
  const maxPhotos = !c.illimite && c.offre.prix === 0 && c.credits === 0 ? 3 : 12;
  return (
    <div className="grid gap-5">
      <EnTeteRapport
        titre={data.titre}
        prix={data.prix ?? a.faits?.prix ?? null}
        photos={photos}
        lien={data.lien ?? a.lien ?? null}
        vendeur={(data.vendeur as Vendeur | null) ?? a.vendeur ?? null}
        maxPhotos={maxPhotos}
        date={dateCourte(data.created_at)}
        retour={{ href: "/app/rapports", l: particulier ? "Mes analyses" : "Rapports" }}
      />
      {particulier ? (
        <div className="max-w-3xl">
          <ResultatParticulier a={data.resultat as Analyse} />
        </div>
      ) : (
        <RapportEnregistre a={data.resultat as Analyse} id={id} titre={data.titre} parc={c.offre.parc} />
      )}
      {data.annonce && (
        <details className="carte max-w-3xl p-5">
          <summary className="cursor-pointer font-display font-semibold">Texte de l&apos;annonce analysée</summary>
          <pre className="mt-3 whitespace-pre-wrap font-body text-sm text-ink-2">{data.annonce}</pre>
        </details>
      )}
    </div>
  );
}
