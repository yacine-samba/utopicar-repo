import type { Metadata } from "next";
import Link from "next/link";
import { compteBenef } from "@/lib/benef";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { catalogue } from "@/lib/vehicules/catalogue";
import { Alertes, type Alerte, type Formulaire } from "@/components/marche/Alertes";

export const metadata: Metadata = { title: "Alertes" };

const CHAMPS: (keyof Formulaire)[] = ["marque", "modele", "gen", "energie", "boite", "anneeMin", "anneeMax", "prixMin", "prixMax", "kmMax", "mots", "exclure", "sousCote"];

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const c = await compteBenef("/app/alertes");
  if (!c.illimite && c.offre.id !== "pro")
    return (
      <section className="carte mx-auto max-w-2xl p-8 text-center">
        <p className="text-sm font-medium text-o2">Avec Benef Pro</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Alertes bonnes affaires</h1>
        <p className="mt-3 text-ink-2">Utopicar surveille Leboncoin pour vous et vous envoie par e-mail les nouvelles annonces sous la cote, à la fréquence de votre choix. Jusqu&apos;à 3 recherches suivies avec Benef Pro.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/tarifs#benef" className="btn btn-o">Passer à Benef Pro</Link>
          <Link href="/app/compte#formule" className="btn">Ma formule</Link>
        </div>
      </section>
    );
  const sp = await searchParams;
  const sb = await supabaseServeur();
  const [{ data, error }, { data: droits }, { data: favs }] = await Promise.all([sb.rpc("mes_alertes"), sb.rpc("mes_droits_alertes"), sb.from("favoris").select("cle").limit(2000)]);
  const d = (droits ?? {}) as { max?: number; freq_min?: number };
  const prerempli = sp.marque && sp.modele ? (Object.fromEntries(CHAMPS.map((k) => [k, (sp[k] ?? "").slice(0, 80)])) as Formulaire) : null;
  if (prerempli) prerempli.vendeur = "particulier";
  return (
    <div className="grid gap-6">
      <div className="max-w-3xl">
        <h1 className="font-display text-3xl font-semibold">Alertes</h1>
        <p className="mt-2 text-ink-2">
          Une alerte surveille Leboncoin à la fréquence choisie{c.illimite ? "" : " (toutes les 3 heures au plus souvent avec Benef Pro)"}. Chaque nouvelle annonce est comparée à la cote du marché ; vous la recevez par e-mail si vous le souhaitez, ou seulement si c&apos;est une bonne affaire.
        </p>
      </div>
      {error ? (
        <p className="carte p-5 text-bad">Alertes indisponibles : {error.message}</p>
      ) : (
        <Alertes cat={catalogue()} initiales={(data ?? []) as Alerte[]} prerempli={prerempli} email={c.email} max={d.max ?? 3} freqMin={d.freq_min ?? 180} favoris={(favs ?? []).map((x) => x.cle as string)} />
      )}
    </div>
  );
}
