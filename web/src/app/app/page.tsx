import type { Metadata } from "next";
import { OutilPro } from "@/components/OutilPro";

export const metadata: Metadata = {
  title: "Analyser une annonce (pro)",
  description: "Achat-revente : marge nette, prix d'offre et plafond à partir d'une annonce de voiture d'occasion.",
  robots: { index: false },
};

export default function Page() {
  return <OutilPro />;
}
