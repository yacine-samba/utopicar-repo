import type { Metadata } from "next";
import { OutilParticulier } from "@/components/OutilParticulier";

export const metadata: Metadata = {
  title: "Cette voiture est-elle une bonne affaire ?",
  description: "Collez une annonce de voiture d'occasion : son coût réel d'achat et ce qu'il faut vérifier avant d'acheter.",
};

export default function Page() {
  return <OutilParticulier />;
}
