import type { Metadata } from "next";
import Link from "next/link";
import { compteBenef } from "@/lib/benef";
import { Calculateur } from "@/components/benef/Calculateur";

export const metadata: Metadata = { title: "Rentabilité" };

export default async function Page() {
  const c = await compteBenef("/app/rentabilite");
  return (
    <div className="grid gap-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold">Rentabilité</h1>
        <p className="mt-2 text-ink-2">
          Simulez une affaire avant de vous déplacer : prix d&apos;achat négocié, frais et prix de revente, et ce qu&apos;il vous reste vraiment. Pour le chiffrage complet d&apos;une annonce (cote, défauts, plafond d&apos;achat),{" "}
          <Link href="/app/analyser" className="text-o2 underline underline-offset-4">
            analysez-la
          </Link>
          .
        </p>
      </div>
      <Calculateur />
      {c.offre.parc ? (
        <p className="text-sm text-ink-3">
          Vos marges réelles, voiture par voiture, sont dans le <Link href="/app/parc" className="text-o2 underline underline-offset-4">parc</Link>.
        </p>
      ) : (
        <p className="text-sm text-ink-3">
          Suivez vos marges réelles voiture par voiture avec la gestion du parc, incluse dans <Link href="/app/compte#formule" className="text-o2 underline underline-offset-4">Benef Pro</Link>.
        </p>
      )}
    </div>
  );
}
