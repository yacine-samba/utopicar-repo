import { redirect } from "next/navigation";

/** Ancienne adresse d'une analyse : les analyses sont maintenant dans l'espace. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/app/rapports/${encodeURIComponent(id)}`);
}
