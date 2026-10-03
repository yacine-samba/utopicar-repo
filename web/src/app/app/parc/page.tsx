import { compteBenef } from "@/lib/benef";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { VerrouBenef } from "@/components/benef/Verrou";
import { GestionParc } from "@/components/benef/GestionParc";
import type { Vehicule } from "@/lib/parc";

export default async function Page() {
  const c = await compteBenef("/app/parc");
  if (!c.offre.parc) return <VerrouBenef offre="pro" titre="Gestion du parc" texte="Suivez chaque voiture de l'achat à la vente : frais, prix de vente, marge réelle et temps passé en stock." />;
  const { data } = await (await supabaseServeur()).from("parc").select("*").order("created_at", { ascending: false }).limit(500);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Parc</h1>
        <p className="mt-1 text-ink-3">Vos voitures, de l&apos;achat à la vente, avec la marge réelle.</p>
      </div>
      <GestionParc vehicules={(data ?? []) as Vehicule[]} />
    </div>
  );
}
