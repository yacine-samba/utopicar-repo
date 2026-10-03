import { compteBenef } from "@/lib/benef";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { VerrouBenef } from "@/components/benef/Verrou";
import { ListeRapports } from "@/components/benef/ListeRapports";
import { ExportCsv } from "@/components/benef/ExportCsv";
import { inputCls } from "@/lib/cx";

const VERDICTS = ["GO", "GO SI NÉGOCIÉ", "GO EN MANDAT UNIQUEMENT", "À SURVEILLER", "NO GO"];
type Filtres = { q?: string; marque?: string; verdict?: string; marge?: string; prix?: string; depuis?: string };
const entier = (s?: string) => (s && /^\d{1,7}$/.test(s.replace(/\s/g, "")) ? Number(s.replace(/\s/g, "")) : null);

export default async function Page({ searchParams }: { searchParams: Promise<Filtres> }) {
  const c = await compteBenef("/app/recherche");
  if (!c.offre.recherche) return <VerrouBenef offre="pro" titre="Recherche avancée" texte="Retrouvez n'importe quel rapport par marque, verdict, marge minimum, prix maximum ou période, et exportez le résultat." />;
  const f = await searchParams;
  let q = (await supabaseServeur()).from("rapports").select("id, titre, created_at, prix, verdict, marge, note, marque").eq("mode", "benef");
  const texte = (f.q ?? "").replace(/[%_,()]/g, " ").trim().slice(0, 60);
  if (texte) q = q.ilike("titre", `%${texte}%`);
  if (f.marque) q = q.ilike("marque", f.marque.replace(/[%_,()]/g, "").slice(0, 40));
  if (f.verdict && VERDICTS.includes(f.verdict)) q = q.eq("verdict", f.verdict);
  if (entier(f.marge) != null) q = q.gte("marge", entier(f.marge)!);
  if (entier(f.prix) != null) q = q.lte("prix", entier(f.prix)!);
  if (f.depuis && /^\d{4}-\d{2}-\d{2}$/.test(f.depuis)) q = q.gte("created_at", f.depuis);
  const { data } = await q.order("created_at", { ascending: false }).limit(300);
  const { data: marques } = await (await supabaseServeur()).from("rapports").select("marque").eq("mode", "benef").not("marque", "is", null).limit(1000);
  const listeMarques = [...new Set((marques ?? []).map((m) => m.marque as string))].sort();
  const res = data ?? [];
  return (
    <div className="grid gap-6">
      <h1 className="font-display text-3xl font-semibold">Recherche avancée</h1>
      <form method="get" className="carte grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Mots du titre</span>
          <input name="q" defaultValue={f.q} placeholder="ex. Clio dCi" className={inputCls} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Marque</span>
          <select name="marque" defaultValue={f.marque ?? ""} className={inputCls}>
            <option value="">Toutes</option>
            {listeMarques.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Verdict</span>
          <select name="verdict" defaultValue={f.verdict ?? ""} className={inputCls}>
            <option value="">Tous</option>
            {VERDICTS.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Marge minimum (€)</span>
          <input name="marge" inputMode="numeric" defaultValue={f.marge} className={inputCls} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Prix maximum (€)</span>
          <input name="prix" inputMode="numeric" defaultValue={f.prix} className={inputCls} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Analysés depuis le</span>
          <input name="depuis" type="date" defaultValue={f.depuis} className={inputCls} />
        </label>
        <div className="flex flex-wrap gap-3 sm:col-span-2 lg:col-span-3">
          <button type="submit" className="btn btn-o btn-sm">
            Rechercher
          </button>
          <a href="/app/recherche" className="btn btn-sm">
            Effacer
          </a>
        </div>
      </form>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink-3" role="status">
          {res.length} rapport{res.length > 1 ? "s" : ""}
        </p>
        <ExportCsv nom="rapports-utopicar" entetes={["Véhicule", "Date", "Prix", "Verdict", "Marge", "Note"]} lignes={res.map((r) => [r.titre, r.created_at.slice(0, 10), r.prix, r.verdict, r.marge, r.note])} />
      </div>
      <ListeRapports rapports={res} comparateur={c.offre.comparateur} vide="Aucun rapport ne correspond à ces filtres." />
    </div>
  );
}
