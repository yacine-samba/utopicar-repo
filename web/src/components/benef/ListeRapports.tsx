"use client";
import { titreVehicule } from "@/lib/titre";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { cx } from "../ui";

export type LigneRapport = { id: string; titre: string; created_at: string; prix: number | null; verdict: string | null; marge: number | null; note: number | null };

const ton = (v: string | null) => (!v ? "text-ink-3" : v.startsWith("NO") ? "text-bad" : v.includes("SURVEILLER") ? "text-warn" : v === "GO" ? "text-ok" : "text-o2");
const eur = (v: number | null) => (v == null ? "—" : `${v.toLocaleString("fr-FR")}\u00a0€`);

export function ListeRapports({ rapports, comparateur, vide = "Aucun rapport pour le moment." }: { rapports: LigneRapport[]; comparateur: boolean; vide?: string }) {
  const router = useRouter();
  const [sel, setSel] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  if (!rapports.length) return <p className="carte p-6 text-ink-3">{vide}</p>;
  return (
    <div className="grid gap-3">
      {comparateur && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-ink-3">Cochez 2 ou 3 rapports pour les comparer.</span>
          <Link href={`/app/comparer?ids=${sel.join(",")}`} aria-disabled={sel.length < 2} className={cx("btn btn-sm", sel.length >= 2 ? "btn-o" : "pointer-events-none opacity-50")}>
            Comparer ({sel.length})
          </Link>
        </div>
      )}
      <div className="carte overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Vos rapports, du plus récent au plus ancien</caption>
          <thead className="text-ink-3">
            <tr className="border-b border-line">
              {comparateur && <th scope="col" className="w-10 px-4 py-3"><span className="sr-only">Comparer</span></th>}
              <th scope="col" className="px-4 py-3 font-medium">Véhicule</th>
              <th scope="col" className="px-4 py-3 font-medium">Date</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Prix</th>
              <th scope="col" className="px-4 py-3 font-medium">Verdict</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Marge</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Note</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rapports.map((r) => (
              <tr key={r.id} className="hover:bg-glass">
                {comparateur && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Comparer ${r.titre}`}
                      checked={sel.includes(r.id)}
                      disabled={!sel.includes(r.id) && sel.length >= 3}
                      onChange={(e) => setSel((l) => (e.target.checked ? [...l, r.id] : l.filter((x) => x !== r.id)))}
                      className="size-4 accent-[#ff5a1f]"
                    />
                  </td>
                )}
                <th scope="row" className="min-w-44 px-4 py-3 font-normal">
                  <Link href={`/app/rapports/${r.id}`} className="font-medium hover:text-o2">
                    {titreVehicule(r.titre)}
                  </Link>
                </th>
                <td className="whitespace-nowrap px-4 py-3 text-ink-3">{new Date(r.created_at).toLocaleDateString("fr-FR")}</td>
                <td className="num whitespace-nowrap px-4 py-3 text-right">{eur(r.prix)}</td>
                <td className={cx("px-4 py-3 font-medium", ton(r.verdict))}>{r.verdict ?? "—"}</td>
                <td className={cx("num px-4 py-3 text-right", r.marge == null ? "" : r.marge >= 0 ? "text-ok" : "text-bad")}>{eur(r.marge)}</td>
                <td className="num px-4 py-3 text-right">{r.note ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    aria-label={`Supprimer le rapport ${r.titre}`}
                    className="rounded-full px-2 py-1 text-ink-3 hover:text-bad"
                    onClick={async () => {
                      if (!confirm(`Supprimer le rapport « ${r.titre} » ?`)) return;
                      const { error } = await supabaseNavigateur().from("rapports").delete().eq("id", r.id);
                      if (error) setMsg("Suppression impossible.");
                      else router.refresh();
                    }}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {msg && <p role="alert" className="text-sm text-warn">{msg}</p>}
    </div>
  );
}
