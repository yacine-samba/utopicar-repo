"use client";
import Link from "next/link";
import type { Vendeur } from "@/lib/analyse/vendeur";
import { titreVehicule } from "@/lib/titre";
import { BentoPhotos } from "./Photos";
import type { NouveauFavori } from "@/lib/favoris";
import { BoutonFavori } from "../espace/BoutonFavori";
import type { ReactNode } from "react";

const eur = (v: number | null) => (v == null ? null : `${Math.round(v).toLocaleString("fr-FR")} €`);

/** Haut de rapport : barre fixe avec le lien de l'annonce d'origine, photos en mosaïque, vendeur. */
export function EnTeteRapport({ titre, prix, photos, lien, vendeur, maxPhotos, date, retour, favori, actions, verrouPhotos = true }: { titre: string; prix: number | null; photos: string[]; lien: string | null; vendeur: Vendeur | null; maxPhotos: number; date: string; retour: { href: string; l: string } | { onClick: () => void; l: string }; favori?: { f: NouveauFavori; initial: boolean }; /** Boutons en plus dans la barre (partager…). */ actions?: ReactNode; verrouPhotos?: boolean }) {
  const t = titreVehicule(titre);
  return (
    <div className="grid gap-4">
      <div className="sticky top-16 z-30 -mx-4 flex items-center justify-between gap-3 border-b border-line bg-bg0/90 px-4 py-2.5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-10 lg:px-10">
        <p className="flex min-w-0 items-baseline gap-1 text-sm">
          {"href" in retour ? (
            <Link href={retour.href} className="shrink-0 text-ink-3 underline-offset-4 hover:text-ink hover:underline">
              {retour.l}
            </Link>
          ) : (
            <button type="button" onClick={retour.onClick} className="shrink-0 text-ink-3 underline-offset-4 hover:text-ink hover:underline">
              {retour.l}
            </button>
          )}
          <span className="shrink-0 text-ink-3" aria-hidden="true">·</span>
          <span className="min-w-0 truncate font-medium">{t}</span>
          {prix != null && <b className="num ml-1 shrink-0 whitespace-nowrap text-o2">{eur(prix)}</b>}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {favori && <BoutonFavori f={favori.f} initial={favori.initial} compact />}
          {lien ? (
            <a href={lien} target="_blank" rel="noopener noreferrer" aria-label="Ouvrir l'annonce d'origine" className="btn btn-sm shrink-0 whitespace-nowrap max-sm:px-3">
              <span className="max-sm:hidden">Annonce d&apos;origine</span>
              <span className="sm:hidden">Annonce</span> <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <span className="shrink-0 text-xs text-ink-3">{date}</span>
          )}
        </div>
      </div>

      <BentoPhotos
        photos={photos}
        alt={t}
        max={maxPhotos}
        verrou={
          !verrouPhotos ? null : <Link href="/app/credits" className="text-o2 underline-offset-4 hover:underline">
            {photos.length - maxPhotos} autre{photos.length - maxPhotos > 1 ? "s" : ""} photo{photos.length - maxPhotos > 1 ? "s" : ""} avec Essentiel ou un crédit
          </Link>
        }
      />

      {(vendeur || lien) && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-line px-4 py-3 text-sm">
          {vendeur && (
            <span className="text-ink-2">
              Vendeur : <b className="text-ink">{vendeur.nom || (vendeur.type === "pro" ? "professionnel" : "particulier")}</b>
              {vendeur.nom && vendeur.type ? `, ${vendeur.type === "pro" ? "professionnel" : "particulier"}` : ""}
            </span>
          )}
          {vendeur?.telephone ? (
            <a href={`tel:${vendeur.telephone.replace(/\s/g, "")}`} className="num font-medium text-o2 underline-offset-4 hover:underline">
              {vendeur.telephone}
            </a>
          ) : vendeur?.aTel ? (
            <span className="text-ink-3">Numéro visible sur Leboncoin (« Voir le numéro »)</span>
          ) : null}
          {lien && (
            <a href={lien} target="_blank" rel="noopener noreferrer" className="ml-auto text-o2 underline-offset-4 hover:underline">
              Ouvrir l&apos;annonce d&apos;origine ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}
