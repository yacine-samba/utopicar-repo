import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compteBenef, dateCourte } from "@/lib/benef";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { RapportEnregistre } from "@/components/benef/RapportEnregistre";
import { ResultatParticulier } from "@/components/analyse/ResultatParticulier";
import type { Analyse } from "@/lib/analyse/couts";
import type { Vendeur } from "@/lib/analyse/vendeur";
import { EnTeteRapport } from "@/components/analyse/EnTeteRapport";
import { cleFavori, type NouveauFavori } from "@/lib/favoris";
import { titreVehicule } from "@/lib/titre";
import { numeroLeboncoin, type Historique } from "@/lib/analyse/historique";
import { BoutonPartager } from "@/components/analyse/BoutonPartager";
import { BoutonSuivi } from "@/components/analyse/Suivi";

export const metadata: Metadata = { title: "Rapport" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await compteBenef(`/app/rapports/${id}`);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { data } = await (await supabaseServeur()).from("rapports").select("titre, resultat, created_at, annonce, mode, prix, photos, lien, vendeur").eq("id", id).maybeSingle();
  if (!data) notFound();
  const particulier = data.mode === "particulier";
  const a = data.resultat as Analyse;
  // historique à jour (jours en ligne, baisses de prix, même voiture ailleurs) ; celui de l'analyse si la base ne répond pas
  const numero = numeroLeboncoin(data.lien ?? a.lien);
  if (numero || a.faits?.km) {
    const { data: h } = await (await supabaseServeur()).rpc("historique_annonce", { p_id: numero, p_annee: a.faits?.annee ?? null, p_km: a.faits?.km ?? null, p_modele: a.ia?.vehicule.modele ?? null });
    if (h) a.historique = h as Historique;
  }
  const photos: string[] = data.photos?.length ? data.photos : (a.photosUrls ?? []);
  // Découverte : les 3 premières photos, toutes ensuite
  const maxPhotos = !c.illimite && c.offre.prix === 0 && c.credits === 0 ? 3 : 30;
  const lien = data.lien ?? a.lien ?? null;
  const cle = cleFavori(lien, `rapport:${id}`);
  const { data: fav } = await (await supabaseServeur()).from("favoris").select("id").eq("cle", cle).maybeSingle();
  // lu à part : tant que la colonne n'existe pas en base, la page s'affiche sans le bouton Partager
  const { data: part, error: ePart } = await (await supabaseServeur()).from("rapports").select("partage").eq("id", id).maybeSingle();
  const { data: suivi, error: eSuivi } = numero ? await (await supabaseServeur()).from("suivis").select("rapport_id").eq("rapport_id", id).maybeSingle() : { data: null, error: true };
  const veh = a.ia?.vehicule;
  const cote = a.ia?.marche?.realiste ?? null;
  const prix = data.prix ?? a.faits?.prix ?? null;
  const favori: NouveauFavori = {
    cle, titre: titreVehicule(data.titre), prix, annee: veh?.annee ?? a.faits?.annee ?? null, km: veh?.km ?? a.faits?.km ?? null,
    energie: veh?.energie || a.faits?.energie || null, boite: veh?.boite || a.faits?.boite || null, lieu: veh?.localisation || a.faits?.ville || null,
    url: lien, photo: photos[0] ?? null, source: "rapport", rapport_id: id,
    cote: cote ? { P: cote, ecart: prix != null ? cote - prix : null, pct: prix != null ? (cote - prix) / cote : null } : null,
  };
  return (
    <div className="grid gap-5">
      <EnTeteRapport
        titre={data.titre}
        prix={data.prix ?? a.faits?.prix ?? null}
        photos={photos}
        lien={lien}
        favori={{ f: favori, initial: !!fav }}
        vendeur={(data.vendeur as Vendeur | null) ?? a.vendeur ?? null}
        maxPhotos={maxPhotos}
        date={dateCourte(data.created_at)}
        retour={{ href: "/app/rapports", l: particulier ? "Mes analyses" : "Rapports" }}
        actions={
          <>
            {numero && !eSuivi && <BoutonSuivi a={a} rapportId={id} annonce={numero} titre={titreVehicule(data.titre)} initial={!!suivi} />}
            {!ePart && <BoutonPartager rapportId={id} initial={(part as { partage?: string | null } | null)?.partage ?? null} titre={titreVehicule(data.titre)} />}
          </>
        }
      />
      {particulier ? (
        <div className="max-w-3xl">
          <ResultatParticulier a={a} id={id} />
        </div>
      ) : (
        <RapportEnregistre a={a} id={id} titre={data.titre} parc={c.offre.parc} />
      )}
      {data.annonce && (
        <details className="carte max-w-3xl p-5">
          <summary className="cursor-pointer font-display font-semibold">Texte de l&apos;annonce analysée</summary>
          <pre className="mt-3 whitespace-pre-wrap font-body text-sm text-ink-2">{data.annonce}</pre>
        </details>
      )}
    </div>
  );
}
