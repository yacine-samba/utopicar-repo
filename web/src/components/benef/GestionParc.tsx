"use client";
import { useConfirmation } from "../espace/Confirmation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { DOCS_VENTE, joursStock, margePrevue, margeReelle, STATUTS_PARC, STRUCTURES, type Vehicule } from "@/lib/parc";
import { cx } from "../ui";
import { ExportCsv } from "./ExportCsv";
import { FicheParc } from "./FicheParc";
import { Carrousel } from "../analyse/Photos";

const eur = (v: number | null) => (v == null ? "—" : `${v.toLocaleString("fr-FR")}\u00a0€`);

export function GestionParc({ vehicules }: { vehicules: Vehicule[] }) {
  const { confirmer, element: confirmation } = useConfirmation();
  const router = useRouter();
  const [edition, setEdition] = useState<string | null>(null);
  const [filtre, setFiltre] = useState<"stock" | "tous" | "vendus">("stock");
  const liste = vehicules.filter((v) => (filtre === "tous" ? true : filtre === "vendus" ? v.statut === "vendu" : !["vendu", "abandonne"].includes(v.statut)));
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Filtrer le parc" className="flex gap-1 rounded-full border border-line-2 bg-glass p-1 text-sm">
          {(["stock", "vendus", "tous"] as const).map((k) => (
            <button key={k} type="button" aria-pressed={filtre === k} onClick={() => setFiltre(k)} className="rounded-full px-4 py-1.5 text-ink-2 aria-pressed:bg-o aria-pressed:text-[#160904]">
              {k === "stock" ? "En cours" : k === "vendus" ? "Vendues" : "Toutes"}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportCsv
            nom="parc-utopicar"
            entetes={["Véhicule", "Version", "Immatriculation", "Année", "Kilométrage", "Énergie", "Boîte", "VIN", "Statut", "Structure", "Prix d'achat", "Commission", "Frais", "Prix conseillé", "Prix de vente", "Marge réelle", "Date d'achat", "Date de vente", "Jours en stock", "Lien"]}
            lignes={vehicules.map((v) => [v.titre, v.finition, v.immat, v.annee, v.km, v.energie, v.boite, v.vin, STATUTS_PARC[v.statut], STRUCTURES[v.structure ?? "achat"], v.prix_achat, v.commission, v.frais, v.prix_conseille, v.prix_vente, margeReelle(v), v.date_achat, v.date_vente, joursStock(v), v.lien].map((x) => x ?? null))}
          />
          <button type="button" onClick={() => setEdition("nouveau")} className="btn btn-o btn-sm">
            Ajouter un véhicule
          </button>
        </div>
      </div>
      {edition === "nouveau" && (
        <div className="carte p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">Nouveau véhicule</h2>
          <FicheParc v={{}} onFini={() => setEdition(null)} />
        </div>
      )}
      {liste.length === 0 ? (
        <p className="carte p-6 text-ink-3">Aucun véhicule ici. Ajoutez-en un, ou depuis un rapport avec « Ajouter au parc ».</p>
      ) : (
        <ul className="grid gap-3">
          {liste.map((v) => {
            const m = margeReelle(v);
            const mp = margePrevue(v);
            const j = joursStock(v);
            const nDocs = DOCS_VENTE.filter(([k]) => v.docs?.[k]).length;
            return (
              <li key={v.id} className={cx("carte overflow-hidden", edition === v.id && "p-5")}>
                {edition === v.id ? (
                  <FicheParc v={v} onFini={() => setEdition(null)} />
                ) : (
                  <div className="grid sm:grid-cols-[240px_minmax(0,1fr)]">
                    <Carrousel photos={v.photos ?? []} alt={v.titre} className="sm:aspect-auto sm:h-full sm:min-h-44" />
                    <div className="grid gap-3 p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-display text-lg font-semibold">
                            <Link href={`/app/parc/${v.id}`} className="underline-offset-4 hover:text-o2 hover:underline">{v.titre}</Link>
                            {v.finition && <span className="ml-2 font-body text-sm font-normal text-ink-3">{v.finition}</span>}
                          </p>
                          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-3">
                            <span className="rounded-full border border-o/40 bg-o/10 px-2 py-px text-xs font-medium text-o2">{STATUTS_PARC[v.statut]}</span>
                            {v.immat && <span className="rounded border border-line-2 bg-white/90 px-1.5 font-mono text-xs font-semibold tracking-wider text-[#1d1d1f]">{v.immat}</span>}
                            {v.structure && v.structure !== "achat" && <span>{STRUCTURES[v.structure]}</span>}
                            {j != null && <span>{j} jour{j > 1 ? "s" : ""} {v.statut === "vendu" ? "en stock" : "depuis l'achat"}</span>}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setEdition(v.id)} className="btn btn-sm">
                            Modifier
                          </button>
                          <button
                            type="button"
                            aria-label={`Supprimer ${v.titre}`}
                            className="btn btn-sm"
                            onClick={async () => {
                              if (!(await confirmer({ titre: `Supprimer « ${v.titre} » du parc ?`, texte: "La fiche, ses frais et ses notes sont effacés.", action: "Supprimer" }))) return;
                              await supabaseNavigateur().from("parc").delete().eq("id", v.id);
                              router.refresh();
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      {(v.annee || v.km != null || v.energie || v.boite) && (
                        <p className="text-sm text-ink-2">{[v.annee, v.km != null ? `${v.km.toLocaleString("fr-FR")} km` : null, v.energie, v.boite, v.couleur, v.localisation].filter(Boolean).join(" · ")}</p>
                      )}
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                        <div>
                          <dt className="text-ink-3">Achat</dt>
                          <dd className="num">{eur(v.prix_achat)}</dd>
                        </div>
                        <div>
                          <dt className="text-ink-3">Frais</dt>
                          <dd className="num">{eur(v.frais || 0)}</dd>
                        </div>
                        <div>
                          <dt className="text-ink-3">{v.statut === "vendu" ? "Vendue" : "Prix conseillé"}</dt>
                          <dd className="num">{eur(v.statut === "vendu" ? v.prix_vente : (v.prix_conseille ?? null))}</dd>
                        </div>
                        <div>
                          <dt className="text-ink-3">{m != null ? "Marge réelle" : "Marge prévue"}</dt>
                          <dd className={cx("num font-semibold", (m ?? mp) == null ? "" : (m ?? mp)! >= 0 ? "text-ok" : "text-bad")}>{eur(m ?? mp)}</dd>
                        </div>
                      </dl>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-3">
                        <span>
                          Papiers : <b className={cx("num", nDocs === DOCS_VENTE.length ? "text-ok" : "text-ink-2")}>{nDocs}/{DOCS_VENTE.length}</b>
                        </span>
                        {v.vendeur_tel && (
                          <a href={`tel:${v.vendeur_tel.replace(/\s/g, "")}`} className="text-o2 underline-offset-4 hover:underline">
                            {v.vendeur_nom ? `${v.vendeur_nom} · ` : ""}
                            {v.vendeur_tel}
                          </a>
                        )}
                        <Link href={`/app/parc/${v.id}`} className="text-o2 underline-offset-4 hover:underline">
                          {v.rapport_id ? "Fiche, documents et rapport" : "Fiche et documents"}
                        </Link>
                        {v.lien && (
                          <a href={v.lien} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-ink hover:underline">
                            Annonce d&apos;origine ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {confirmation}
    </div>
  );
}
