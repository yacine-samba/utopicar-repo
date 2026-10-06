import { compteBenef } from "@/lib/benef";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { VerrouBenef } from "@/components/benef/Verrou";
import { ListeRapports } from "@/components/benef/ListeRapports";
import { ExportCsv } from "@/components/benef/ExportCsv";
import { cx, inputCls } from "@/lib/cx";
import { catalogue } from "@/lib/vehicules/catalogue";
import { RechercheMarche } from "@/components/marche/RechercheMarche";
import { COLONNES_JOURNAL, COLONNES_RECHERCHE, type Lancement, type Recherche } from "@/lib/recherches";
import { HistoriqueRecherches, type AlerteSupprimee } from "@/components/marche/HistoriqueRecherches";
import { DernieresRecherches, type NomsCatalogue } from "@/components/marche/DernieresRecherches";
import { AnnoncesTrouvees, type AnnonceTrouvee } from "@/components/marche/AnnoncesTrouvees";

/** Noms lisibles (marque, modèle, génération) pour les filtres de l'historique. */
function nomsCatalogue(): NomsCatalogue {
  const noms: NomsCatalogue = { marques: {}, modeles: {}, gens: {} };
  for (const b of catalogue()) {
    noms.marques[b.k] = b.n;
    for (const m of b.m) {
      noms.modeles[`${b.k} ${m.k}`] = m.n;
      for (const g of m.g) noms.gens[`${b.k} ${m.k} ${g.id}`] = g.l;
    }
  }
  return noms;
}

const VERDICTS = ["GO", "GO SI NÉGOCIÉ", "GO EN MANDAT UNIQUEMENT", "À SURVEILLER", "NO GO"];
type Filtres = { vue?: string; q?: string; marque?: string; modele?: string; gen?: string; r?: string; j?: string; verdict?: string; marge?: string; prix?: string; depuis?: string };
const entier = (s?: string) => (s && /^\d{1,7}$/.test(s.replace(/\s/g, "")) ? Number(s.replace(/\s/g, "")) : null);

export default async function Page({ searchParams }: { searchParams: Promise<Filtres> }) {
  const c = await compteBenef("/app/recherche");
  if (!c.offre.recherche) return <VerrouBenef offre="pro" titre="Recherche" texte="Cherchez dans toutes les annonces du marché par marque, modèle et génération, chacune placée sur sa cote, et retrouvez n'importe quel rapport par verdict, marge ou prix." />;
  const f = await searchParams;
  const alertes = c.illimite || c.offre.id === "pro";
  // à l'arrivée : l'historique des recherches (avec leurs photos) ; « Chercher une annonce » ouvre la recherche
  const chercher = f.vue === "chercher" || !!f.r || !!f.j || !!(f.marque && f.modele && f.vue !== "rapports");
  if (!chercher && (!f.vue || f.vue === "historique")) {
    const sb = await supabaseServeur();
    const [{ data: recherches }, { data: journal }, sup, { data: vues }, mes] = await Promise.all([
      sb.from("recherches").select(COLONNES_RECHERCHE).order("derniere_le", { ascending: false }).limit(300),
      sb.from("recherches_journal").select(COLONNES_JOURNAL).order("created_at", { ascending: false }).limit(1000),
      alertes ? sb.rpc("mes_alertes_supprimees") : Promise.resolve({ data: [] }),
      sb.from("annonces_trouvees").select("recherche, photo").not("photo", "is", null).order("derniere_le", { ascending: false }).limit(600),
      alertes ? sb.rpc("mes_alertes") : Promise.resolve({ data: [] }),
    ]);
    const photos: Record<string, string[]> = {};
    for (const x of (vues ?? []) as { recherche: string | null; photo: string }[]) {
      if (!x.recherche) continue;
      const l = (photos[x.recherche] ??= []);
      if (l.length < 4 && !l.includes(x.photo)) l.push(x.photo);
    }
    const etats = Object.fromEntries(((mes.data ?? []) as { id: string; actif: boolean }[]).map((a) => [a.id, a.actif]));
    const noms = nomsCatalogue();
    return (
      <div className="grid gap-10">
        <EnTete vue="historique" />
        <HistoriqueRecherches recherches={(recherches ?? []) as Recherche[]} supprimees={((sup.data ?? []) as AlerteSupprimee[])} alertes={alertes} photos={photos} etatsAlertes={etats} />
        <details className="carte p-5">
          <summary className="cursor-pointer font-display font-semibold">Chaque lancement, avec ses filtres exacts</summary>
          <div className="mt-4">
            <DernieresRecherches journal={(journal ?? []) as Lancement[]} noms={noms} />
          </div>
        </details>
      </div>
    );
  }
  if (f.vue === "annonces") {
    const sb = await supabaseServeur();
    const [{ data: annonces }, { data: favs }] = await Promise.all([
      sb.from("annonces_trouvees").select("cle, titre, prix, annee, km, ch, energie, boite, moteur, version, lieu, url, marque, modele, gen, gen_label, pro, cote, recherche, premiere_le, derniere_le").order("derniere_le", { ascending: false }).limit(5000),
      sb.from("favoris").select("cle").limit(2000),
    ]);
    return (
      <div className="grid gap-6">
        <EnTete vue="annonces" />
        <AnnoncesTrouvees annonces={(annonces ?? []) as AnnonceTrouvee[]} noms={nomsCatalogue()} favoris={(favs ?? []).map((x) => x.cle as string)} />
      </div>
    );
  }
  if (f.vue !== "rapports") {
    const sb = await supabaseServeur();
    const { data: mesAlertes } = alertes ? await sb.rpc("mes_alertes") : { data: [] };
    const etats = Object.fromEntries(((mesAlertes ?? []) as { id: string; actif: boolean }[]).map((a) => [a.id, a.actif]));
    const [{ data: recherches }, { data: favs }, { data: lancement }] = await Promise.all([
      sb.from("recherches").select(COLONNES_RECHERCHE).order("created_at", { ascending: true }).limit(300),
      sb.from("favoris").select("cle").limit(2000),
      f.j && /^[0-9a-f-]{36}$/.test(f.j) ? sb.from("recherches_journal").select(COLONNES_JOURNAL).eq("id", f.j).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    const prerempli = f.marque && f.modele ? { marque: f.marque.slice(0, 40), modele: f.modele.slice(0, 60), gen: (f.gen ?? "").slice(0, 20) } : null;
    return (
      <div className="grid gap-6">
        <EnTete vue="marche" />
        <RechercheMarche cat={catalogue()} alertes={alertes} etatsAlertes={etats} nouvelleRecherche={f.vue === "chercher" && !f.r && !f.j} initiales={(recherches ?? []) as Recherche[]} ouvrir={f.r ?? null} prerempli={prerempli} journal={lancement ? { id: (lancement as Lancement).id, ...(lancement as Lancement).criteres } : null} favoris={(favs ?? []).map((x) => x.cle as string)} />
      </div>
    );
  }
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
      <ListeRapports rapports={res} comparateur={false} vide="Aucun rapport ne correspond à ces filtres." />
    </div>
  );
}

function EnTete({ vue }: { vue: "marche" | "historique" | "annonces" | "rapports" }) {
  const onglet = (actif: boolean) => cx("shrink-0 rounded-full px-4 py-2 text-sm", actif ? "bg-o/15 text-ink shadow-[inset_0_0_0_1px_rgb(255_90_31/0.35)]" : "text-ink-2 hover:bg-glass");
  const sous = { marche: "Toutes les annonces de la base du marché, chacune placée sur la cote de sa génération.", historique: "Vos recherches, leurs photos et leurs résultats gardés. Une alerte e-mail s'allume sur chaque recherche.", annonces: "Toutes les annonces trouvées par vos recherches, gardées pour toujours.", rapports: "Vos rapports enregistrés, par verdict, marge, prix ou période." }[vue];
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-semibold">Recherche</h1>
        <p className="mt-1 text-ink-2">{sous}</p>
      </div>
      <div className="flex max-w-full flex-wrap items-center gap-2">
      <a href="/app/recherche?vue=chercher" className="btn btn-o btn-sm gap-2"><span aria-hidden="true">+</span> Chercher une annonce</a>
      <nav aria-label="Type de recherche" className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-line p-1">
        <a href="/app/recherche" aria-current={vue === "historique" ? "page" : undefined} className={onglet(vue === "historique")}>Mes recherches</a>
        <a href="/app/recherche?vue=annonces" aria-current={vue === "annonces" ? "page" : undefined} className={onglet(vue === "annonces")}>Annonces trouvées</a>
        <a href="/app/recherche?vue=rapports" aria-current={vue === "rapports" ? "page" : undefined} className={onglet(vue === "rapports")}>Mes rapports</a>
      </nav>
      </div>
    </div>
  );
}
