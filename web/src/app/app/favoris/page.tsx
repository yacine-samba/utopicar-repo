import type { Metadata } from "next";
import { compteBenef } from "@/lib/benef";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { COLONNES_FAVORI, type Favori } from "@/lib/favoris";
import Link from "next/link";
import { ListeFavoris } from "@/components/espace/ListeFavoris";

export const metadata: Metadata = { title: "Favoris" };

export default async function Page() {
  const c = await compteBenef("/app/favoris");
  if (!c.favoris)
    return (
      <section className="carte mx-auto max-w-xl p-8 text-center">
        <h1 className="font-display text-2xl font-semibold">Favoris désactivés</h1>
        <p className="mt-2 text-ink-2">Les favoris sont une option. Activez-les dans votre profil, rubrique Accessibilité : l&apos;étoile apparaîtra sur les annonces et les rapports.</p>
        <Link href="/app/compte#accessibilite" className="btn btn-o mt-6">Activer les favoris</Link>
      </section>
    );
  const { data } = await (await supabaseServeur()).from("favoris").select(COLONNES_FAVORI).order("created_at", { ascending: false }).limit(500);
  return (
    <div className="grid gap-6">
      <div className="max-w-3xl">
        <h1 className="font-display text-3xl font-semibold">Favoris</h1>
        <p className="mt-2 text-ink-2">
          Les voitures mises de côté avec l&apos;étoile, depuis la recherche, une alerte ou un rapport : à revoir plus tard, sans encombrer votre parc.
        </p>
      </div>
      <ListeFavoris initiaux={(data ?? []) as Favori[]} parc={c.offre.parc || c.illimite} />
    </div>
  );
}
