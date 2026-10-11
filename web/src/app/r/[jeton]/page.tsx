import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabasePublic } from "@/lib/supabase/public";
import { comptesActifs } from "@/lib/supabase/config";
import type { Analyse } from "@/lib/analyse/couts";
import { lireProfilAnalyse, resumeProfil } from "@/lib/analyse/profil";
import { Logo } from "@/components/site/Logo";
import { EnTeteRapport } from "@/components/analyse/EnTeteRapport";
import { BilanPartage } from "./bilan";

/* Rapport partagé par lien : lecture seule, sans compte, sans les coordonnées du vendeur ni le texte brut de l'annonce.
   Le bilan est calculé avec le profil de la personne qui a partagé (son objectif, son seuil). */
export const metadata: Metadata = { title: "Analyse partagée", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Partage = { titre: string; mode: "particulier" | "benef"; created_at: string; photos: string[] | null; lien: string | null; resultat: Analyse };

export default async function Page({ params }: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await params;
  if (!/^[0-9a-f]{32}$/.test(jeton) || !comptesActifs()) notFound();
  const { data } = await supabasePublic().rpc("rapport_public", { p_jeton: jeton });
  const r = data as Partage | null;
  if (!r?.resultat) notFound();
  const a = r.resultat;
  const profil = lireProfilAnalyse(a.profil, r.mode, a.ville ?? "");
  const date = new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" aria-label="Utopicar, accueil">
          <Logo />
        </Link>
        <Link href="/analyse" className="btn btn-o btn-sm">
          Analyser une annonce
        </Link>
      </header>
      <main id="contenu" className="mx-auto grid w-full max-w-3xl gap-5 px-4 pb-24 sm:px-6">
        <EnTeteRapport titre={r.titre} prix={a.faits?.prix ?? null} photos={r.photos ?? a.photosUrls ?? []} lien={r.lien} vendeur={null} maxPhotos={12} date={date} retour={{ href: "/", l: "Utopicar" }} verrouPhotos={false} />
        <p className="text-sm text-ink-3">
          Analyse du {date}, faite pour un projet : {resumeProfil(profil).toLowerCase()}. Les montants dépendent de ce projet.
        </p>
        <BilanPartage a={a} profil={profil} />
        <section className="carte grid gap-3 p-6 text-center sm:p-8">
          <h2 className="font-display text-2xl font-semibold">Une voiture en vue ?</h2>
          <p className="text-ink-2">Collez le lien de l&apos;annonce : fiabilité, travaux à prévoir, juste prix et questions à poser au vendeur, avant le premier message. La première analyse est offerte.</p>
          <div>
            <Link href="/analyse" className="btn btn-o">
              Analyser mon annonce
            </Link>
          </div>
          <p className="text-xs text-ink-3">
            Utopicar ne touche aucune commission sur les ventes. <Link href="/methode" className="underline underline-offset-4">Comment l&apos;analyse est faite</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
