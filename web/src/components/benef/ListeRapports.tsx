"use client";
/* eslint-disable @next/next/no-img-element -- photos d'annonces */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { titreVehicule } from "@/lib/titre";
import { CarteVoiture } from "../analyse/CarteVoiture";
import { cx, useReglages } from "../ui";

export type LigneRapport = { id: string; titre: string; created_at: string; prix: number | null; verdict: string | null; marge: number | null; note: number | null; photos?: string[]; lien?: string | null };

const ton = (v: string | null) => (!v ? "text-ink-3" : v.startsWith("NO") ? "text-bad" : v.includes("SURVEILLER") ? "text-warn" : v === "GO" ? "text-ok" : "text-o2");
const badgeTon = (v: string | null) =>
  !v ? "border-line-2 text-ink-2" : v.startsWith("NO") ? "border-bad/50 bg-bad/15 text-bad" : v.includes("SURVEILLER") ? "border-warn/50 bg-warn/15 text-warn" : v === "GO" ? "border-ok/50 bg-ok/15 text-ok" : "border-o/50 bg-o/15 text-o2";
const eur = (v: number | null) => (v == null ? "—" : `${v.toLocaleString("fr-FR")} €`);

export function ListeRapports({ rapports, comparateur, vide = "Aucun rapport pour le moment.", choixVue = true }: { rapports: LigneRapport[]; comparateur: boolean; vide?: string; choixVue?: boolean }) {
  const router = useRouter();
  const [sel, setSel] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [pref, setPref] = useReglages<{ vue: "cartes" | "tableau" }>("utp-vue-rapports", { vue: "cartes" });
  const vue = choixVue ? pref.vue : "cartes";
  if (!rapports.length) return <p className="carte p-6 text-ink-3">{vide}</p>;

  const supprimer = async (r: LigneRapport) => {
    if (!confirm(`Supprimer le rapport « ${titreVehicule(r.titre)} » ?`)) return;
    const { error } = await supabaseNavigateur().from("rapports").delete().eq("id", r.id);
    if (error) setMsg("Suppression impossible.");
    else router.refresh();
  };
  const caseComparer = (r: LigneRapport, cls = "size-4") => (
    <input
      type="checkbox"
      aria-label={`Comparer ${titreVehicule(r.titre)}`}
      checked={sel.includes(r.id)}
      disabled={!sel.includes(r.id) && sel.length >= 3}
      onChange={(e) => setSel((l) => (e.target.checked ? [...l, r.id] : l.filter((x) => x !== r.id)))}
      className={cx(cls, "accent-[#ff5a1f]")}
    />
  );

  return (
    <div className="grid gap-3">
      {(comparateur || choixVue) && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          {comparateur ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-ink-3">Cochez 2 ou 3 rapports pour les comparer.</span>
              <Link href={`/app/comparer?ids=${sel.join(",")}`} aria-disabled={sel.length < 2} className={cx("btn btn-sm", sel.length >= 2 ? "btn-o" : "pointer-events-none opacity-50")}>
                Comparer ({sel.length})
              </Link>
            </div>
          ) : (
            <span />
          )}
          {choixVue && (
            <div role="group" aria-label="Affichage" className="flex rounded-full border border-line-2 bg-glass p-1">
              {(["cartes", "tableau"] as const).map((v) => (
                <button key={v} type="button" aria-pressed={vue === v} onClick={() => setPref({ vue: v })} className={cx("rounded-full px-3 py-1.5", vue === v ? "bg-o/20 text-ink" : "text-ink-3 hover:text-ink")}>
                  {v === "cartes" ? "Cartes" : "Tableau"}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {vue === "cartes" ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rapports.map((r) => (
            <li key={r.id}>
              <CarteVoiture
                href={`/app/rapports/${r.id}`}
                titre={r.titre}
                photos={r.photos ?? []}
                prix={r.prix}
                badge={r.verdict ? { l: r.verdict, ton: badgeTon(r.verdict) } : undefined}
                chiffres={[
                  { l: "Marge", v: eur(r.marge), ton: r.marge == null ? "" : r.marge >= 0 ? "text-ok" : "text-bad" },
                  { l: "Note", v: r.note != null ? `${r.note}/100` : "—" },
                ]}
                lien={r.lien}
                date={r.created_at}
                coin={
                  <>
                    {comparateur && <label className="grid size-10 cursor-pointer place-items-center rounded-full bg-bg0/85 backdrop-blur-md">{caseComparer(r)}</label>}
                    <button type="button" aria-label={`Supprimer le rapport ${titreVehicule(r.titre)}`} onClick={() => supprimer(r)} className="grid size-8 place-items-center rounded-full bg-bg0/85 text-ink-3 backdrop-blur-md hover:text-bad">
                      ✕
                    </button>
                  </>
                }
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="carte overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
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
                  {comparateur && <td className="px-2 py-1"><label className="grid size-10 cursor-pointer place-items-center rounded-full hover:bg-glass">{caseComparer(r)}</label></td>}
                  <th scope="row" className="min-w-52 px-4 py-2.5 font-normal">
                    <Link href={`/app/rapports/${r.id}`} className="flex items-center gap-3 font-medium hover:text-o2">
                      {r.photos?.[0] ? <img src={r.photos[0]} alt="" referrerPolicy="no-referrer" loading="lazy" className="h-10 w-14 shrink-0 rounded-md object-cover" /> : <span className="h-10 w-14 shrink-0 rounded-md bg-glass" />}
                      {titreVehicule(r.titre)}
                    </Link>
                  </th>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-3">{new Date(r.created_at).toLocaleDateString("fr-FR")}</td>
                  <td className="num whitespace-nowrap px-4 py-3 text-right">{eur(r.prix)}</td>
                  <td className={cx("px-4 py-3 font-medium", ton(r.verdict))}>{r.verdict ?? "—"}</td>
                  <td className={cx("num px-4 py-3 text-right", r.marge == null ? "" : r.marge >= 0 ? "text-ok" : "text-bad")}>{eur(r.marge)}</td>
                  <td className="num px-4 py-3 text-right">{r.note ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {r.lien && (
                      <a href={r.lien} target="_blank" rel="noopener noreferrer" aria-label={`Annonce d'origine de ${titreVehicule(r.titre)}`} className="rounded-full px-2 py-1 text-ink-3 hover:text-o2">
                        ↗
                      </a>
                    )}
                    <button type="button" aria-label={`Supprimer le rapport ${titreVehicule(r.titre)}`} className="rounded-full px-2 py-1 text-ink-3 hover:text-bad" onClick={() => supprimer(r)}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {msg && <p role="alert" className="text-sm text-warn">{msg}</p>}
    </div>
  );
}
