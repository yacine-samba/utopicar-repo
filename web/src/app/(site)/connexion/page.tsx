import type { Metadata } from "next";
import { PageCompte } from "@/components/compte/PageCompte";

export const metadata: Metadata = { title: "Se connecter", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; offre?: string; erreur?: string }> }) {
  return <PageCompte mode="connexion" params={await searchParams} />;
}
