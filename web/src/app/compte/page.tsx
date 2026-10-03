import { redirect } from "next/navigation";

/** Ancienne adresse du compte (liens d'emails, retours Stripe) : le compte est maintenant dans l'espace. */
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(await searchParams)) if (typeof v === "string") p.set(k, v);
  const q = p.toString();
  redirect(`/app/compte${q ? `?${q}` : ""}`);
}
