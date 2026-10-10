"use client";
import { BoutonAnalyserAnnonce } from "./BoutonAnalyserAnnonce";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { lienLeboncoin } from "@/lib/analyse/import";
import { cx } from "@/lib/cx";
import type { Favori } from "@/lib/favoris";
import { SansPhoto } from "../analyse/Photos";
import { Ico } from "./Icones";
import { FicheAnnonce, type FicheData } from "./FicheAnnonce";

const eur = (v: number | null) => (v == null ? "—" : `${Math.round(v).toLocaleString("fr-FR")} €`);
const SOURCE: Record<Favori["source"], string> = { recherche: "Recherche", alerte: "Alerte", rapport: "Rapport" };

/** Favoris : note personnelle, analyse, passage au parc ou retrait. */
export function ListeFavoris({ initiaux, parc }: { initiaux: Favori[]; parc: boolean }) {
  const [liste, setListe] = useState(initiaux);
  const [etat, setEtat] = useState("");
  const [auParc, setAuParc] = useState<string[]>([]);
  const [fi, setFi] = useState<number | null>(null);

  async function retirer(f: Favori) {
    setListe((l) => l.filter((x) => x.id !== f.id));
    const { error } = await supabaseNavigateur().from("favoris").delete().eq("id", f.id);
    if (error) {
      setListe((l) => [f, ...l]);
      setEtat("Retrait impossible. Réessayez.");
    }
  }

  async function versParc(f: Favori) {
    const { error } = await supabaseNavigateur().from("parc").insert({
      titre: f.titre.slice(0, 140), statut: "repere", prix_achat: f.prix, annee: f.annee, km: f.km,
      energie: f.energie?.slice(0, 30) ?? null, boite: f.boite?.slice(0, 30) ?? null, localisation: f.lieu?.slice(0, 120) ?? null,
      lien: f.url, rapport_id: f.rapport_id ?? null, photos: f.photo && /^https:\/\//.test(f.photo) ? [f.photo] : [],
      prix_conseille: f.cote?.P ?? null,
    });
    setEtat(error ? "Ajout au parc impossible. Réessayez." : `« ${f.titre} » est dans votre parc (repérée). Elle reste aussi dans vos favoris.`);
    if (!error) setAuParc((l) => [...l, f.id]);
  }

  if (!liste.length)
    return (
      <div className="carte grid justify-items-start gap-3 p-6">
        <span className="grid size-10 place-items-center rounded-full bg-o/12 text-o2"><Ico nom="favoris" /></span>
        <p className="font-display text-lg font-semibold">Aucun favori pour l&apos;instant</p>
        <p className="max-w-xl text-ink-2">Touchez l&apos;étoile sur une annonce de la recherche, une annonce trouvée par une alerte ou en haut d&apos;un rapport : la voiture arrive ici.</p>
        <Link href="/app/recherche" className="btn btn-o btn-sm">Chercher une voiture</Link>
      </div>
    );

  return (
    <div className="grid gap-4">
      <p className="text-sm text-ink-3" role="status" aria-live="polite">
        {liste.length} voiture{liste.length > 1 ? "s" : ""} en favori{etat ? ` · ${etat}` : ""}
      </p>
      <ul className="grid gap-4 lg:grid-cols-2">
        {liste.map((f, i) => {
          const lbc = f.url ? lienLeboncoin(f.url) : null;
          const ecart = f.cote?.ecart ?? null;
          return (
            <li key={f.id} className="carte grid gap-4 p-4 sm:grid-cols-[150px_minmax(0,1fr)]">
              <button type="button" onClick={() => setFi(i)} aria-label={`Voir la fiche : ${f.titre}`} className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-bg0 text-left sm:aspect-auto sm:h-full sm:min-h-28">
                {f.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- photo de l'annonce (lien Leboncoin ou vignette enregistrée)
                  <img src={f.photo} alt="" referrerPolicy="no-referrer" loading="lazy" className="absolute inset-0 size-full object-cover" />
                ) : (
                  <SansPhoto className="absolute inset-0" />
                )}
                <span className="absolute left-2 top-2 rounded-full bg-bg0/85 px-2 py-0.5 text-xs text-ink-2">{SOURCE[f.source]}</span>
              </button>
              <div className="grid min-w-0 gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      <button type="button" onClick={() => setFi(i)} className="max-w-full truncate text-left underline-offset-4 hover:underline">{f.titre}</button>
                    </p>
                    <p className="text-sm text-ink-3">{[f.annee, f.km != null ? `${f.km.toLocaleString("fr-FR")} km` : null, f.energie, f.boite, f.lieu].filter(Boolean).join(" · ")}</p>
                  </div>
                  <p className="num shrink-0 font-display text-xl font-semibold">{eur(f.prix)}</p>
                </div>
                {ecart != null && (
                  <p className={cx("text-sm", ecart >= 0 ? "text-ok" : "text-warn")}>
                    {ecart >= 0 ? `${eur(ecart)} sous la cote` : `${eur(-ecart)} au-dessus de la cote`} au moment où vous l&apos;avez gardée
                    {f.cote?.P ? <span className="text-ink-3"> (cote {eur(f.cote.P)})</span> : null}
                  </p>
                )}
                <NoteFavori f={f} onSave={(note) => setListe((l) => l.map((x) => (x.id === f.id ? { ...x, note } : x)))} />
                <div className="flex flex-wrap gap-2">
                  {lbc && <Link href={`/app/analyser?lien=${encodeURIComponent(lbc)}`} className="btn btn-o btn-sm">Analyser</Link>}
                  {f.rapport_id && <Link href={`/app/rapports/${f.rapport_id}`} className="btn btn-sm">Voir le rapport</Link>}
                  {!f.rapport_id && <BoutonAnalyserAnnonce url={f.url} />}
                  <button type="button" onClick={() => setFi(i)} className="btn btn-sm">Voir la fiche</button>
                  {parc && (auParc.includes(f.id) ? (
                    <Link href="/app/parc" className="btn btn-sm text-ok">Dans le parc ✓</Link>
                  ) : (
                    <button type="button" onClick={() => versParc(f)} className="btn btn-sm">Ajouter au parc</button>
                  ))}
                  <button type="button" onClick={() => retirer(f)} className="btn btn-sm text-ink-3">Retirer</button>
                </div>
                <p className="text-xs text-ink-3">Ajoutée le {new Date(f.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <FicheAnnonce
        fiches={liste.map((f): FicheData => ({ id: f.id, titre: f.titre, prix: f.prix, annee: f.annee, km: f.km, energie: f.energie, boite: f.boite, lieu: f.lieu, pro: null, photo: f.photo, url: f.url, cote: f.cote ? { P: f.cote.P ?? null, ecart: f.cote.ecart ?? null, pct: f.cote.pct ?? null } : null }))}
        index={fi}
        onIndex={setFi}
      />
    </div>
  );
}

/** Note personnelle : enregistrée toute seule une seconde après la dernière frappe (et en quittant le champ). */
function NoteFavori({ f, onSave }: { f: Favori; onSave: (note: string | null) => void }) {
  const [v, setV] = useState(f.note ?? "");
  const [etat, setEtat] = useState<"" | "attente" | "ok" | "err">("");
  const derniere = useRef(f.note ?? "");
  const minuteur = useRef<ReturnType<typeof setTimeout>>(undefined);
  async function enregistrer(texte: string) {
    clearTimeout(minuteur.current);
    const note = texte.trim().slice(0, 1000);
    if (note === derniere.current) return setEtat((e) => (e === "attente" ? "" : e));
    const { error } = await supabaseNavigateur().from("favoris").update({ note: note || null }).eq("id", f.id);
    if (error) return setEtat("err");
    derniere.current = note;
    setEtat("ok");
    onSave(note || null);
  }
  useEffect(() => () => clearTimeout(minuteur.current), []);
  return (
    <label className="grid gap-1 text-sm">
      <span className="sr-only">Note pour {f.titre}</span>
      <textarea
        value={v}
        onChange={(e) => {
          setV(e.target.value);
          setEtat("attente");
          clearTimeout(minuteur.current);
          const t = e.target.value;
          minuteur.current = setTimeout(() => enregistrer(t), 1000);
        }}
        onBlur={() => enregistrer(v)}
        rows={2}
        maxLength={1000}
        placeholder="Une note : à appeler mardi, demander le CT…"
        className="w-full resize-y rounded-xl border border-line-2 bg-bg0/60 px-3 py-2 text-sm outline-none focus:border-o/60"
      />
      <span className={cx("min-h-4 text-xs", etat === "err" ? "text-warn" : etat === "ok" ? "text-ok" : "text-ink-3")} aria-live="polite">
        {etat === "attente" ? "Enregistrement…" : etat === "ok" ? "Enregistrée ✓" : etat === "err" ? "Note non enregistrée : réessayez." : ""}
      </span>
    </label>
  );
}
