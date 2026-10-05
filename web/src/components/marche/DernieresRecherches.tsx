"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { inputCls } from "@/lib/cx";
import { resumeFiltres, type Lancement } from "@/lib/recherches";

export type NomsCatalogue = { marques: Record<string, string>; modeles: Record<string, string>; gens: Record<string, string> };

const TRIS = {
  recentes: "Les plus récentes",
  anciennes: "Les plus anciennes",
  vehicule: "Marque, modèle, série (A → Z)",
  annonces: "Le plus d'annonces",
  affaires: "Le plus d'annonces sous la cote",
} as const;
type Tri = keyof typeof TRIS;
const PAGE = 30;

const quand = (d: string) => new Date(d).toLocaleString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Dernières recherches : chaque lancement, avec ses filtres exacts. Filtre par marque, modèle, série ; tri ; relance à l'identique. */
export function DernieresRecherches({ journal, noms }: { journal: Lancement[]; noms: NomsCatalogue }) {
  const [liste, setListe] = useState(journal);
  const [marque, setMarque] = useState("");
  const [modele, setModele] = useState("");
  const [gen, setGen] = useState("");
  const [tri, setTri] = useState<Tri>("recentes");
  const [vus, setVus] = useState(PAGE);
  const [etat, setEtat] = useState("");

  const nomVehicule = (l: Lancement) => [noms.marques[l.marque] ?? l.marque, noms.modeles[`${l.marque} ${l.modele}`] ?? l.modele, l.gen ? noms.gens[`${l.marque} ${l.modele} ${l.gen}`] ?? l.gen.toUpperCase() : ""].filter(Boolean).join(" ");
  const options = useMemo(() => {
    const marques = [...new Set(liste.map((l) => l.marque))].sort((a, b) => (noms.marques[a] ?? a).localeCompare(noms.marques[b] ?? b, "fr"));
    const modeles = [...new Set(liste.filter((l) => !marque || l.marque === marque).map((l) => `${l.marque} ${l.modele}`))].sort((a, b) => (noms.modeles[a] ?? a).localeCompare(noms.modeles[b] ?? b, "fr", { numeric: true }));
    const gens = [...new Set(liste.filter((l) => l.gen && (!modele || `${l.marque} ${l.modele}` === modele) && (!marque || l.marque === marque)).map((l) => `${l.marque} ${l.modele} ${l.gen}`))];
    return { marques, modeles, gens };
  }, [liste, marque, modele, noms]);

  const vues = useMemo(() => {
    const L = liste.filter((l) => (!marque || l.marque === marque) && (!modele || `${l.marque} ${l.modele}` === modele) && (!gen || `${l.marque} ${l.modele} ${l.gen}` === gen));
    const parDate = (a: Lancement, b: Lancement) => b.created_at.localeCompare(a.created_at);
    return L.sort(
      tri === "anciennes" ? (a, b) => -parDate(a, b)
      : tri === "vehicule" ? (a, b) => nomVehicule(a).localeCompare(nomVehicule(b), "fr", { numeric: true }) || parDate(a, b)
      : tri === "annonces" ? (a, b) => (b.trouvees ?? 0) - (a.trouvees ?? 0) || parDate(a, b)
      : tri === "affaires" ? (a, b) => (b.sous_cote ?? 0) - (a.sous_cote ?? 0) || parDate(a, b)
      : parDate,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- nomVehicule ne dépend que de noms
  }, [liste, marque, modele, gen, tri, noms]);

  async function effacer(l: Lancement) {
    const { error } = await supabaseNavigateur().from("recherches_journal").delete().eq("id", l.id);
    if (error) setEtat("Suppression impossible. Réessayez.");
    else setListe((x) => x.filter((y) => y.id !== l.id));
  }

  return (
    <section aria-labelledby="hi-d" className="grid gap-4">
      <div>
        <h2 id="hi-d" className="font-display text-xl font-semibold">Dernières recherches</h2>
        <p className="text-sm text-ink-3">Chaque recherche lancée, avec ses filtres exacts et ses résultats gardés : l&apos;ouvrir ne refait aucune requête. Les annonces restent dans « Annonces trouvées » même si vous effacez la recherche.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Marque</span>
          <select value={marque} onChange={(e) => { setMarque(e.target.value); setModele(""); setGen(""); setVus(PAGE); }} className={inputCls}>
            <option value="">Toutes</option>
            {options.marques.map((k) => <option key={k} value={k}>{noms.marques[k] ?? k}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Modèle</span>
          <select value={modele} onChange={(e) => { setModele(e.target.value); setGen(""); setVus(PAGE); }} className={inputCls}>
            <option value="">Tous</option>
            {options.modeles.map((k) => <option key={k} value={k}>{noms.modeles[k] ?? k}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Série, génération</span>
          <select value={gen} onChange={(e) => { setGen(e.target.value); setVus(PAGE); }} className={inputCls}>
            <option value="">Toutes</option>
            {options.gens.map((k) => <option key={k} value={k}>{noms.gens[k] ?? k.split(" ").pop()!.toUpperCase()}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Trier par</span>
          <select value={tri} onChange={(e) => setTri(e.target.value as Tri)} className={inputCls}>
            {Object.entries(TRIS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </label>
      </div>
      <p className="text-sm text-ink-3" role="status" aria-live="polite">
        {etat || `${vues.length} recherche${vues.length > 1 ? "s" : ""}`}
      </p>
      {vues.length ? (
        <ul className="grid gap-2">
          {vues.slice(0, vus).map((l) => (
            <li key={l.id} className="carte grid gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="grid min-w-0 gap-0.5">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <b className="font-semibold">{l.nom}</b>
                  <span className="text-xs text-ink-3" suppressHydrationWarning>{quand(l.created_at)}</span>
                </p>
                <p className="truncate text-sm text-ink-3">{resumeFiltres(l.criteres.f ?? {}) || "Tous les critères"}</p>
                <p className="text-sm text-ink-2">
                  <b className="num text-ink">{l.trouvees ?? 0}</b> annonce{(l.trouvees ?? 0) > 1 ? "s" : ""}
                  {l.sous_cote ? <> · <b className="num text-ok">{l.sous_cote}</b> sous la cote</> : null}
                </p>
              </div>
              <div className="flex gap-2 sm:justify-end">
                <Link href={`/app/recherche?j=${l.id}`} className="btn btn-o btn-sm">Ouvrir</Link>
                <button type="button" onClick={() => effacer(l)} className="btn btn-sm text-ink-3" aria-label={`Effacer la recherche ${l.nom} du ${quand(l.created_at)}`}>Effacer</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="carte p-5 text-ink-2">{liste.length ? "Aucune recherche ne correspond à ces filtres." : "Aucune recherche pour l'instant : lancez-en une depuis « Annonces du marché »."}</p>
      )}
      {vues.length > vus && (
        <button type="button" onClick={() => setVus((v) => v + PAGE)} className="btn btn-sm justify-self-center">
          Voir {Math.min(PAGE, vues.length - vus)} de plus
        </button>
      )}
    </section>
  );
}
