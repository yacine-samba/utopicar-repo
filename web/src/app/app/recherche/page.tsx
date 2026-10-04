import { compteBenef } from "@/lib/benef";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { VerrouBenef } from "@/components/benef/Verrou";
import { ListeRapports } from "@/components/benef/ListeRapports";
import { ExportCsv } from "@/components/benef/ExportCsv";
import { cx, inputCls } from "@/lib/cx";
import { catalogue } from "@/lib/vehicules/catalogue";
import { RechercheMarche } from "@/components/marche/RechercheMarche";

const VERDICTS = ["GO", "GO SI NÉGOCIÉ", "GO EN MANDAT UNIQUEMENT", "À SURVEILLER", "NO GO"];
type Filtres = { vue?: string; q?: string; marque?: string; verdict?: string; marge?: string; prix?: string; depuis?: string };
const entier = (s?: string) => (s && /^\d{1,7}$/.test(s.replace(/\s/g, "")) ? Number(s.replace(/\s/g, "")) : null);

export default async function Page({ searchParams }: { searchParams: Promise<Filtres> }) {
  const c = await compteBenef("/app/recherche");
  if (!c.offre.recherche) return <VerrouBenef offre="pro" titre="Recherche" texte="Cherchez dans toutes les annonces du marché par marque, modèle et génération, chacune placée sur sa cote, et retrouvez n'importe quel rapport par verdict, marge ou prix." />;
  const f = await searchParams;
  if (f.vue !== "rapports")
    return (
      <div className="grid gap-6">
        <EnTete vue="marche" />
        <RechercheMarche cat={catalogue()} alertes={c.illimite} />
      </div>
    );
  let q = (await supabaseServeur()).from("rapports").select("id, titre, created_at, prix, verdict, marge, note, marque, photos, lien").eq("mode", "benef");
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
      <EnTete vue="rapports" />
      <form method="get" className="carte grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <input type="hidden" name="vue" value="rapports" />
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
          <a href="/app/recherche?vue=rapports" className="btn btn-sm">
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

function EnTete({ vue }: { vue: "marche" | "rapports" }) {
  const onglet = (actif: boolean) => cx("rounded-full px-4 py-2 text-sm", actif ? "bg-o/15 text-ink shadow-[inset_0_0_0_1px_rgb(255_90_31/0.35)]" : "text-ink-2 hover:bg-glass");
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-semibold">Recherche</h1>
        <p className="mt-1 text-ink-2">{vue === "marche" ? "Toutes les annonces de la base du marché, chacune placée sur la cote de sa génération." : "Vos rapports enregistrés, par verdict, marge, prix ou période."}</p>
      </div>
      <nav aria-label="Type de recherche" className="flex gap-1 rounded-full border border-line p-1">
        <a href="/app/recherche" aria-current={vue === "marche" ? "page" : undefined} className={onglet(vue === "marche")}>Annonces du marché</a>
        <a href="/app/recherche?vue=rapports" aria-current={vue === "rapports" ? "page" : undefined} className={onglet(vue === "rapports")}>Mes rapports</a>
      </nav>
    </div>
  );
}
