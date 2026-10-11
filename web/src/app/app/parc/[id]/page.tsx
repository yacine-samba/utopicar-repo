import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compteBenef, dateCourte } from "@/lib/benef";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { joursStock, margePrevue, margeReelle, STATUTS_PARC, STRUCTURES, type Vehicule } from "@/lib/parc";
import type { Analyse } from "@/lib/analyse/couts";
import type { Vendeur } from "@/lib/analyse/vendeur";
import { VerrouBenef } from "@/components/benef/Verrou";
import { EnTeteRapport } from "@/components/analyse/EnTeteRapport";
import { RapportEnregistre } from "@/components/benef/RapportEnregistre";
import { PiecesDossier } from "@/components/benef/PiecesDossier";
import { EditionFiche } from "@/components/benef/EditionFiche";
import { AnnonceRevente } from "@/components/benef/AnnonceRevente";

export const metadata: Metadata = { title: "Voiture du parc" };

const eur = (v: number | null | undefined) => (v == null ? "—" : `${Math.round(v).toLocaleString("fr-FR")}\u00a0€`);

/** Vue détaillée d'une voiture du parc : photos, chiffres, documents, et le rapport complet de l'analyse. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await compteBenef(`/app/parc/${id}`);
  if (!c.offre.parc) return <VerrouBenef offre="pro" titre="Gestion du parc" texte="Suivez chaque voiture de l'achat à la vente : frais, prix de vente, marge réelle et temps passé en stock." />;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const sb = await supabaseServeur();
  const { data: v } = await sb.from("parc").select("*").eq("id", id).maybeSingle();
  if (!v) notFound();
  const veh = v as Vehicule;
  const { data: r } = veh.rapport_id ? await sb.from("rapports").select("titre, resultat, created_at, photos, lien, vendeur, mode").eq("id", veh.rapport_id).maybeSingle() : { data: null };
  const a = (r?.resultat ?? null) as Analyse | null;
  const photos = veh.photos?.length ? veh.photos : (r?.photos ?? []);
  const m = margeReelle(veh) ?? margePrevue(veh);
  const j = joursStock(veh);
  return (
    <div className="grid gap-5">
      <EnTeteRapport
        titre={[veh.titre, veh.finition].filter(Boolean).join(" · ")}
        prix={veh.prix_achat ?? a?.faits?.prix ?? null}
        photos={photos}
        lien={veh.lien ?? r?.lien ?? null}
        vendeur={(r?.vendeur as Vendeur | null) ?? (veh.vendeur_nom ? { nom: veh.vendeur_nom, type: null, aTel: !!veh.vendeur_tel, telephone: veh.vendeur_tel ?? null } : null)}
        maxPhotos={30}
        date={dateCourte(veh.created_at)}
        retour={{ href: "/app/parc", l: "Parc" }}
      />

      <section className="carte grid gap-4 p-5 sm:p-6" aria-labelledby="pv-t">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 id="pv-t" className="font-display text-2xl font-semibold">{veh.titre}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-3">
              <span className="rounded-full border border-o/40 bg-o/10 px-2 py-px text-xs font-medium text-o2">{STATUTS_PARC[veh.statut]}</span>
              {veh.immat && <span className="rounded border border-line-2 bg-white/90 px-1.5 font-mono text-xs font-semibold tracking-wider text-[#1d1d1f]">{veh.immat}</span>}
              {veh.structure && veh.structure !== "achat" && <span>{STRUCTURES[veh.structure]}</span>}
              {j != null && <span>{j} jour{j > 1 ? "s" : ""} {veh.statut === "vendu" ? "en stock" : "depuis l'achat"}</span>}
              {[veh.annee, veh.km != null ? `${veh.km.toLocaleString("fr-FR")} km` : null, veh.energie, veh.boite].filter(Boolean).map((x) => <span key={String(x)}>· {x}</span>)}
            </p>
          </div>
          <EditionFiche v={veh} />
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[["Achat", eur(veh.prix_achat)], ["Frais", eur(veh.frais || 0)], [veh.statut === "vendu" ? "Vendue" : "Prix conseillé", eur(veh.statut === "vendu" ? veh.prix_vente : veh.prix_conseille)], [margeReelle(veh) != null ? "Marge réelle" : "Marge prévue", eur(m)]].map(([l, x]) => (
            <div key={l} className="rounded-xl border border-line p-3">
              <dt className="text-ink-3">{l}</dt>
              <dd className="num mt-0.5 font-display text-lg font-semibold">{x}</dd>
            </div>
          ))}
        </dl>
        {veh.notes && <p className="whitespace-pre-line text-sm text-ink-2">{veh.notes}</p>}
      </section>

      <section className="carte p-5 sm:p-6">
        <PiecesDossier parcId={veh.id} rapportId={veh.rapport_id} />
      </section>

      {veh.statut !== "vendu" && veh.statut !== "abandonne" && <AnnonceRevente parcId={veh.id} />}

      {a && r?.mode === "benef" ? (
        <RapportEnregistre a={a} id={veh.rapport_id!} titre={r.titre} parc parcId={veh.id} />
      ) : (
        <p className="carte p-5 text-sm text-ink-3">
          Pas de rapport lié à cette voiture. <Link href="/app/parc" className="text-o2 underline underline-offset-4">Retour au parc</Link>
        </p>
      )}
    </div>
  );
}
