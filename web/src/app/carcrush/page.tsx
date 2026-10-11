import type { Metadata, Viewport } from "next";
import { compteCourant } from "@/lib/compte";
import { CarCrush } from "@/components/carcrush/CarCrush";

// CarCrush : recherche d'annonces en swipe pour les particuliers. Page volontairement absente du menu, du plan du site
// et des moteurs de recherche : on y arrive par un lien direct (utopicar.fr/carcrush).
export const metadata: Metadata = {
  title: "CarCrush : votre prochaine voiture, au coup de cœur",
  description: "Décrivez la voiture, Utopicar trouve jusqu'à 30 annonces comparées à la cote, vous swipez.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0f0d0b" };

export default async function Page({ searchParams }: { searchParams: Promise<{ r?: string }> }) {
  const [c, p] = await Promise.all([compteCourant(), searchParams]);
  const r = p.r && /^[0-9a-f-]{36}$/.test(p.r) && c ? p.r : null;
  return (
    <main id="contenu" tabIndex={-1} className="outline-none">
      <CarCrush compte={c ? { credits: c.credits, illimite: c.illimite } : null} rechercheInitiale={r} />
    </main>
  );
}
