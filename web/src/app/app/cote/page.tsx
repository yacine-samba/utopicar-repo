import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { compteBenef } from "@/lib/benef";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { catalogue } from "@/lib/vehicules/catalogue";
import { CoteMarche } from "@/components/marche/CoteMarche";
import type { Bilan } from "@/components/marche/BilanBalayage";
import type { BilanAncien } from "@/components/marche/BilanAncien";

export const metadata: Metadata = { title: "Cote" };

export default async function Page() {
  const c = await compteBenef("/app/cote");
  // cote globale (graphique, comparables, relevés) : compte illimité ; les formules Benef ont l'estimation
  if (!c.illimite) redirect("/app/estimation");
  // dernier relevé automatique des cotes (extension) : son bilan, avec les recherches coupées à 100 pages
  const { data: rel } = await (await supabaseServeur()).from("releves_auto").select("bilan").order("created_at", { ascending: false }).limit(1).maybeSingle();
  const brut = rel?.bilan as Bilan | BilanAncien | undefined;
  const dernier = brut?.v === 2 || brut?.v === 1 ? brut : null;
  return (
    <div className="grid gap-6">
      <div className="max-w-3xl">
        <h1 className="font-display text-3xl font-semibold">Cote</h1>
        <p className="mt-2 text-ink-2">
          Une voiture est cotée sur les annonces du même moteur (une 335i sur des 335i, pas sur des 316i) quand il y en a au moins 25, sinon sur toute sa génération avec la puissance de chacune. Âge au mois près, kilométrage, carrosserie (coupé, Touring, 3 ou 5 portes), finition Leboncoin, boîte et équipements font le reste ; les annonces aberrantes sont écartées.{c.illimite ? " Collez un relevé pour coter toute une page, ou placez une voiture précise sur le graphique." : " Placez une voiture précise face aux annonces comparables."}
        </p>
      </div>
      <CoteMarche cat={catalogue()} extension={c.illimite} dernierReleve={dernier} />
    </div>
  );
}
