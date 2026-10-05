import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { compteBenef } from "@/lib/benef";
import { familleEspace } from "@/lib/espace";
import { TriRapide } from "@/components/benef/TriRapide";

export const metadata: Metadata = { title: "Tri rapide" };

export default async function Page() {
  const c = await compteBenef("/app/tri");
  if (familleEspace(c) !== "benef") redirect("/app");
  return (
    <div className="grid gap-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold">Tri rapide</h1>
        <p className="mt-2 text-ink-2">Jusqu&apos;à 10 annonces classées en quelques secondes : cote sur annonces comparables, défauts, marge estimée et prix plafond. Sans IA, ça ne consomme aucune analyse. Ouvrez ensuite l&apos;analyse complète des meilleures.</p>
      </div>
      <TriRapide extension={c.illimite} />
    </div>
  );
}
