"use client";
import Link from "next/link";
import { useState } from "react";
import { DEFAUTS_PRO, eur, type ParamsPro } from "@/lib/analyse/couts";
import { lienLeboncoin, texteDepuisImport } from "@/lib/analyse/import";
import { SUPABASE_CLE, SUPABASE_URL } from "@/lib/supabase/config";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { cx, inputCls } from "@/lib/cx";
import { useReglages } from "../ui";

type Ligne = { titre: string; lien: string | null; annee: number | null; km: number | null; prix: number | null; cote: number | null; n: number; gain: number | null; plafond: number | null; verdict: string; alertes: string[] };
const ORDRE: Record<string, number> = { GO: 0, "GO SI NÉGOCIÉ": 1, "GO EN MANDAT UNIQUEMENT": 2, "À SURVEILLER": 3, "NO GO": 4 };
const TON: Record<string, string> = { GO: "text-ok", "GO SI NÉGOCIÉ": "text-o2", "GO EN MANDAT UNIQUEMENT": "text-o2", "À SURVEILLER": "text-warn", "NO GO": "text-bad" };
const e = (v: number | null) => (v == null ? "—" : eur(v));

export function TriRapide() {
  const [reg] = useReglages<ParamsPro>("utp-pro", DEFAUTS_PRO);
  const [brut, setBrut] = useState("");
  const [etat, setEtat] = useState("");
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [charge, setCharge] = useState(false);

  async function trier() {
    setCharge(true);
    setLignes([]);
    try {
      // Liens Leboncoin (un par ligne) : lus par l'import ; sinon, annonces collées séparées par ---.
      const morceaux = brut.split(/^\s*-{3,}\s*$/m).flatMap((m) => {
        const liens = m.split(/\s+/).map((x) => lienLeboncoin(x)).filter((x): x is string => !!x);
        return liens.length && m.trim().split(/\s+/).length === liens.length ? liens : [m.trim()];
      }).filter((m) => m.length >= 30).slice(0, 10);
      if (!morceaux.length) return setEtat("Collez au moins une annonce complète ou un lien Leboncoin.");
      const textes: string[] = [];
      const { data } = await supabaseNavigateur().auth.getSession();
      for (const [i, m] of morceaux.entries()) {
        if (!lienLeboncoin(m)) {
          textes.push(m);
          continue;
        }
        setEtat(`Lecture de l'annonce ${i + 1} sur ${morceaux.length}… (environ une minute par lien)`);
        const r = await fetch(`${SUPABASE_URL}/functions/v1/annonce`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}`, apikey: SUPABASE_CLE }, body: JSON.stringify({ url: m }) });
        const j = await r.json().catch(() => null);
        if (r.ok && j?.ok) textes.push(texteDepuisImport(j));
      }
      setEtat("Tri en cours…");
      const r = await fetch("/api/tri", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ annonces: textes, margeMin: reg.margeMin }) });
      const j = await r.json().catch(() => null);
      if (!r.ok) return setEtat(j?.erreur ?? "Le tri n'a pas marché. Réessayez.");
      setLignes((j.lignes as Ligne[]).sort((a, b) => (ORDRE[a.verdict] ?? 9) - (ORDRE[b.verdict] ?? 9) || (b.gain ?? -1e9) - (a.gain ?? -1e9)));
      setEtat("");
    } finally {
      setCharge(false);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="carte grid gap-3 p-5">
        <label htmlFor="tri" className="text-sm text-ink-2">
          Liens Leboncoin (un par ligne), ou textes d&apos;annonces séparés par une ligne <code>---</code>
        </label>
        <textarea id="tri" rows={8} value={brut} onChange={(ev) => setBrut(ev.target.value)} className={inputCls} placeholder={"https://www.leboncoin.fr/ad/voitures/…\nhttps://www.leboncoin.fr/ad/voitures/…"} />
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-o" disabled={charge} onClick={trier}>
            {charge ? "Tri en cours…" : "Trier les annonces"}
          </button>
          <span className="text-sm text-ink-3">Seuil de marge : {e(reg.margeMin)}</span>
          {etat && <span role="status" className="text-sm text-ink-2">{etat}</span>}
        </div>
      </div>
      {lignes.length > 0 && (
        <div className="carte overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <caption className="sr-only">Annonces triées, la meilleure en premier</caption>
            <thead className="text-ink-3">
              <tr className="border-b border-line">
                {["Annonce", "Prix", "Cote", "Marge estimée", "Plafond", "Verdict", ""].map((t) => (
                  <th key={t} scope="col" className="px-3 py-2 font-medium">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lignes.map((l, i) => (
                <tr key={i} className="border-b border-line align-top last:border-0">
                  <td className="px-3 py-2">
                    <b className="font-medium">{l.titre}</b>
                    <span className="block text-ink-3">{[l.annee, l.km != null ? `${l.km.toLocaleString("fr-FR")} km` : null].filter(Boolean).join(" · ")}</span>
                    {l.alertes.length > 0 && <span className="block text-bad">{l.alertes.join(" ; ")}</span>}
                  </td>
                  <td className="num px-3 py-2">{e(l.prix)}</td>
                  <td className="num px-3 py-2">
                    {e(l.cote)}
                    {l.n > 0 && <span className="block text-xs text-ink-3">{l.n} annonces</span>}
                  </td>
                  <td className={cx("num px-3 py-2 font-semibold", l.gain == null ? "" : l.gain >= reg.margeMin ? "text-ok" : l.gain >= 0 ? "text-warn" : "text-bad")}>{e(l.gain)}</td>
                  <td className="num px-3 py-2">{l.plafond != null && l.plafond > 0 ? e(l.plafond) : "—"}</td>
                  <td className={cx("px-3 py-2 font-bold", TON[l.verdict])}>{l.verdict}</td>
                  <td className="px-3 py-2">
                    {l.lien && (
                      <Link href={`/app/analyser?lien=${encodeURIComponent(l.lien)}`} className="whitespace-nowrap text-o2 underline underline-offset-4">
                        Analyse complète
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
