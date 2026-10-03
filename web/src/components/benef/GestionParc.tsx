"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { joursStock, margeReelle, STATUTS_PARC, type Vehicule } from "@/lib/parc";
import { cx, inputCls } from "../ui";
import { ExportCsv } from "./ExportCsv";

const eur = (v: number | null) => (v == null ? "—" : `${v.toLocaleString("fr-FR")} €`);
const ent = (s: string) => (s.trim() === "" ? null : Math.max(0, Math.round(Number(s.replace(/[\s €]/g, "").replace(",", "."))) || 0));

function Fiche({ v, onFini }: { v: Partial<Vehicule>; onFini: () => void }) {
  const router = useRouter();
  const [f, setF] = useState({
    titre: v.titre ?? "",
    immat: v.immat ?? "",
    statut: v.statut ?? "repere",
    prix_achat: v.prix_achat?.toString() ?? "",
    frais: v.frais?.toString() ?? "0",
    prix_vente: v.prix_vente?.toString() ?? "",
    date_achat: v.date_achat ?? "",
    date_vente: v.date_vente ?? "",
    notes: v.notes ?? "",
  });
  const [err, setErr] = useState("");
  const maj = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <form
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!f.titre.trim()) return setErr("Indiquez le véhicule.");
        const ligne = {
          titre: f.titre.trim().slice(0, 140),
          immat: f.immat.trim().slice(0, 20) || null,
          statut: f.statut,
          prix_achat: ent(f.prix_achat),
          frais: ent(f.frais) ?? 0,
          prix_vente: ent(f.prix_vente),
          date_achat: f.date_achat || null,
          date_vente: f.date_vente || null,
          notes: f.notes.slice(0, 2000) || null,
          updated_at: new Date().toISOString(),
        };
        const sb = supabaseNavigateur();
        const { error } = v.id ? await sb.from("parc").update(ligne).eq("id", v.id) : await sb.from("parc").insert(ligne);
        if (error) return setErr("Enregistrement impossible. Réessayez.");
        onFini();
        router.refresh();
      }}
    >
      <label className="grid gap-1.5 text-sm sm:col-span-2">
        <span className="text-ink-2">Véhicule</span>
        <input value={f.titre} onChange={maj("titre")} required placeholder="ex. Clio IV 1.5 dCi 90" className={inputCls} />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Immatriculation</span>
        <input value={f.immat} onChange={maj("immat")} className={inputCls} />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Statut</span>
        <select value={f.statut} onChange={maj("statut")} className={inputCls}>
          {Object.entries(STATUTS_PARC).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Prix d&apos;achat (€)</span>
        <input value={f.prix_achat} onChange={maj("prix_achat")} inputMode="numeric" className={inputCls} />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Frais cumulés (€)</span>
        <input value={f.frais} onChange={maj("frais")} inputMode="numeric" className={inputCls} />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Prix de vente (€)</span>
        <input value={f.prix_vente} onChange={maj("prix_vente")} inputMode="numeric" className={inputCls} />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Date d&apos;achat</span>
        <input type="date" value={f.date_achat} onChange={maj("date_achat")} className={inputCls} />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Date de vente</span>
        <input type="date" value={f.date_vente} onChange={maj("date_vente")} className={inputCls} />
      </label>
      <label className="grid gap-1.5 text-sm sm:col-span-2 lg:col-span-3">
        <span className="text-ink-2">Notes</span>
        <textarea value={f.notes} onChange={maj("notes")} rows={2} className={inputCls} />
      </label>
      <div className="flex flex-wrap items-end gap-2">
        <button type="submit" className="btn btn-o btn-sm">
          Enregistrer
        </button>
        <button type="button" onClick={onFini} className="btn btn-sm">
          Annuler
        </button>
      </div>
      {err && <p role="alert" className="text-sm text-warn sm:col-span-4">{err}</p>}
    </form>
  );
}

export function GestionParc({ vehicules }: { vehicules: Vehicule[] }) {
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
            entetes={["Véhicule", "Immatriculation", "Statut", "Prix d'achat", "Frais", "Prix de vente", "Marge réelle", "Date d'achat", "Date de vente", "Jours en stock"]}
            lignes={vehicules.map((v) => [v.titre, v.immat, STATUTS_PARC[v.statut], v.prix_achat, v.frais, v.prix_vente, margeReelle(v), v.date_achat, v.date_vente, joursStock(v)])}
          />
          <button type="button" onClick={() => setEdition("nouveau")} className="btn btn-o btn-sm">
            Ajouter un véhicule
          </button>
        </div>
      </div>
      {edition === "nouveau" && (
        <div className="carte p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">Nouveau véhicule</h2>
          <Fiche v={{}} onFini={() => setEdition(null)} />
        </div>
      )}
      {liste.length === 0 ? (
        <p className="carte p-6 text-ink-3">Aucun véhicule ici. Ajoutez-en un, ou depuis un rapport avec « Ajouter au parc ».</p>
      ) : (
        <ul className="grid gap-3">
          {liste.map((v) => {
            const m = margeReelle(v);
            const j = joursStock(v);
            return (
              <li key={v.id} className="carte p-5">
                {edition === v.id ? (
                  <Fiche v={v} onFini={() => setEdition(null)} />
                ) : (
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-semibold">{v.titre}</p>
                      <p className="text-sm text-ink-3">
                        {STATUTS_PARC[v.statut]}
                        {v.immat ? ` · ${v.immat}` : ""}
                        {j != null ? ` · ${j} jour${j > 1 ? "s" : ""} ${v.statut === "vendu" ? "en stock" : "depuis l'achat"}` : ""}
                        {v.rapport_id && (
                          <>
                            {" · "}
                            <Link href={`/app/rapports/${v.rapport_id}`} className="underline underline-offset-4 hover:text-ink">
                              rapport
                            </Link>
                          </>
                        )}
                      </p>
                    </div>
                    <dl className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <dt className="text-ink-3">Achat + frais</dt>
                        <dd className="num">{v.prix_achat != null ? eur(v.prix_achat + (v.frais || 0)) : "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-ink-3">Vente</dt>
                        <dd className="num">{eur(v.prix_vente)}</dd>
                      </div>
                      <div>
                        <dt className="text-ink-3">Marge réelle</dt>
                        <dd className={cx("num font-semibold", m == null ? "" : m >= 0 ? "text-ok" : "text-bad")}>{eur(m)}</dd>
                      </div>
                    </dl>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setEdition(v.id)} className="btn btn-sm">
                        Modifier
                      </button>
                      <button
                        type="button"
                        aria-label={`Supprimer ${v.titre}`}
                        className="btn btn-sm"
                        onClick={async () => {
                          if (!confirm(`Supprimer « ${v.titre} » du parc ?`)) return;
                          await supabaseNavigateur().from("parc").delete().eq("id", v.id);
                          router.refresh();
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
