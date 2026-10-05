"use client";
import { useEffect, useRef, useState } from "react";
import { useExtension } from "@/lib/extension";
import { cx, inputCls } from "@/lib/cx";
import type { CatMarque, CoteAnnonce, PointCote } from "@/lib/vehicules/types";
import { ChoixVehicule, type Choix } from "./ChoixVehicule";
import { NuageCote } from "./NuageCote";

type AnnonceCotee = { id: string; ch?: number | null; titre: string; prix: number; annee: number | null; km: number | null; energie: string; boite: string; pro: boolean; lieu: string; url: string | null; badge: string; cote: CoteAnnonce | null };
type Groupe = { cle: string; base: string; nom: string; gen: string | null; genLabel: string; energie: string; nCote: number; annonces: AnnonceCotee[]; points: PointCote[] };
type Releve = { src: string; total: number; enregistrees: number; groupes: Groupe[]; inconnues: { id: string; titre: string; prix: number; url: string }[]; nInconnues: number; ms: number };
type Place = { nom: string; gen: string; estimation: CoteAnnonce | null; points: PointCote[]; courbe: { km: number; P: number | null }[] };

const eur = (v: number | null | undefined) => (v == null ? "—" : `${Math.round(v).toLocaleString("fr-FR")} €`);
const n = (s: string) => (s.trim() && /^\d+$/.test(s.replace(/\s/g, "")) ? Number(s.replace(/\s/g, "")) : null);

export function CoteMarche({ cat }: { cat: CatMarque[] }) {
  const [onglet, setOnglet] = useState<"releve" | "voiture">("releve");
  return (
    <div className="grid gap-6">
      <div role="tablist" aria-label="Mode de calcul" className="flex w-fit gap-1 rounded-full border border-line p-1">
        {([["releve", "Coller un relevé"], ["voiture", "Placer une voiture"]] as const).map(([k, l]) => (
          <button key={k} role="tab" type="button" aria-selected={onglet === k} onClick={() => setOnglet(k)}
            className={cx("rounded-full px-4 py-2 text-sm", onglet === k ? "bg-o/15 text-ink shadow-[inset_0_0_0_1px_rgb(255_90_31/0.35)]" : "text-ink-2 hover:bg-glass")}>
            {l}
          </button>
        ))}
      </div>
      <div hidden={onglet !== "releve"}>
        <CollerReleve actif={onglet === "releve"} />
      </div>
      <div hidden={onglet !== "voiture"}>
        <PlacerVoiture cat={cat} />
      </div>
    </div>
  );
}

function CollerReleve({ actif }: { actif: boolean }) {
  const [brut, setBrut] = useState("");
  const [enregistrer, setEnregistrer] = useState(true);
  const [etat, setEtat] = useState("");
  const [charge, setCharge] = useState(false);
  const [res, setRes] = useState<Releve | null>(null);
  const [g, setG] = useState(0);
  const [sous, setSous] = useState(false);
  const zone = useRef<HTMLTextAreaElement>(null);

  async function calculer(txt = brut) {
    if (txt.trim().length < 10) return setEtat("Collez d'abord un relevé (Ctrl+V).");
    setCharge(true);
    setEtat("Reconnaissance des annonces et calcul de la cote de chacune…");
    try {
      const r = await fetch("/api/marche/cote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ releve: txt, enregistrer }) });
      const j = await r.json().catch(() => null);
      if (!r.ok) return setEtat(j?.erreur ?? "Le calcul n'a pas abouti. Réessayez.");
      setRes(j);
      setG(0);
      setEtat("");
    } finally {
      setCharge(false);
    }
  }

  // Relevé envoyé par l'extension (bouton « Relever la page » sur Leboncoin) : calculé dès l'ouverture.
  useExtension("releve", (e) => {
    if (!actif || !e.brut.startsWith("UTPRELEVE")) return;
    setBrut(e.brut);
    calculer(e.brut);
  });

  // Ctrl+V n'importe où sur la page : un relevé de l'extension est reconnu et calculé tout de suite.
  useEffect(() => {
    if (!actif) return;
    const f = (e: ClipboardEvent) => {
      const t = e.clipboardData?.getData("text") ?? "";
      if (!t.startsWith("UTPRELEVE")) return;
      if (document.activeElement === zone.current) return; // la zone de texte gère elle-même son collage
      e.preventDefault();
      setBrut(t);
      calculer(t);
    };
    addEventListener("paste", f);
    return () => removeEventListener("paste", f);
  });

  const gr = res?.groupes[g];
  const lignes = gr ? [...gr.annonces].filter((a) => !sous || (a.cote?.pct ?? -1) >= 0.05).sort((a, b) => (b.cote?.pct ?? -9) - (a.cote?.pct ?? -9)) : [];
  const toutes = res?.groupes.flatMap((x) => x.annonces) ?? [];
  const sousCote = toutes.filter((a) => (a.cote?.pct ?? -1) >= 0.05).length;

  return (
    <div className="grid gap-6">
      <div className="carte grid gap-4 p-5">
        <div className="grid gap-1">
          <h2 className="font-display text-lg font-semibold">Relevé Leboncoin</h2>
          <p className="text-sm text-ink-2">
            Sur une recherche Leboncoin, icône Utopicar puis « Relever toute la recherche » (jusqu&apos;à 3 500 annonces) : cette page s&apos;ouvre toute seule et chaque annonce est reconnue (marque, modèle, génération) et placée sur sa cote. Si elle ne s&apos;ouvre pas, collez le relevé ici avec <kbd className="rounded border border-line-2 px-1.5 text-xs">Ctrl</kbd> + <kbd className="rounded border border-line-2 px-1.5 text-xs">V</kbd>.
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-ink-3">
            <a href="/app/extension" className="btn btn-sm min-h-9 px-4">Installer l&apos;extension Utopicar</a>
            Chrome, Edge : 1 minute.
          </p>
        </div>
        <label htmlFor="releve" className="sr-only">Relevé collé</label>
        <textarea
          id="releve"
          ref={zone}
          value={brut}
          onChange={(e) => setBrut(e.target.value)}
          onPaste={(e) => {
            const t = e.clipboardData.getData("text");
            if (t.startsWith("UTPRELEVE")) {
              e.preventDefault();
              setBrut(t);
              calculer(t);
            }
          }}
          rows={4}
          placeholder="Collez ici le relevé (UTPRELEVE…)"
          className={cx(inputCls, "font-mono text-xs")}
        />
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" disabled={charge} onClick={() => calculer()} className="btn btn-o btn-sm">
            {charge ? "Calcul…" : "Calculer la cote"}
          </button>
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input type="checkbox" checked={enregistrer} onChange={(e) => setEnregistrer(e.target.checked)} className="size-4 accent-[#ff5a1f]" />
            Ajouter ces annonces à la base du marché
          </label>
          <p className="text-sm text-ink-3" role="status">{etat}</p>
        </div>
      </div>

      {res && (
        <section aria-labelledby="cr-res" className="grid gap-5">
          <div className="grid gap-3 sm:grid-cols-4">
            <Chiffre l="Annonces relevées" v={String(res.total)} s={res.src || "relevé"} />
            <Chiffre l="Modèles reconnus" v={String(res.groupes.length)} s={`${res.nInconnues} non reconnue${res.nInconnues > 1 ? "s" : ""}`} />
            <Chiffre l="Sous la cote (5 % et +)" v={String(sousCote)} s={`sur ${toutes.filter((a) => a.cote).length} cotées`} bon={sousCote > 0} />
            <Chiffre l="Ajoutées à la base" v={String(res.enregistrees)} s={`calcul en ${(res.ms / 1000).toFixed(1)} s`} />
          </div>
          <h2 id="cr-res" className="sr-only">Résultat du relevé</h2>
          <label className="grid max-w-xl gap-1.5 text-sm">
            <span className="text-ink-2">Modèle et génération</span>
            <select value={g} onChange={(e) => setG(Number(e.target.value))} className={inputCls}>
              {res.groupes.map((x, i) => (
                <option key={x.cle} value={i}>
                  {x.nom} · {x.annonces.length} annonce{x.annonces.length > 1 ? "s" : ""}{x.nCote ? ` · cote sur ${x.nCote}` : " · pas de cote"}
                </option>
              ))}
            </select>
          </label>
          {gr && (
            <>
              {gr.points.length > 0 ? (
                <div className="carte p-4 sm:p-5">
                  <NuageCote titre={gr.nom} points={gr.points} reperes={gr.annonces.filter((a) => a.annee).map((a) => ({ km: a.km, annee: a.annee, prix: a.prix, label: `${a.titre} · ${eur(a.prix)}`, ton: "releve" as const }))} />
                </div>
              ) : (
                <p className="carte p-5 text-sm text-ink-2">
                  {gr.gen ? "Pas assez d'annonces de cette génération en base (il en faut 20) : collez d'autres relevés de ce modèle pour obtenir la cote." : "Génération incertaine (année de transition ou titre trop court) : ces annonces ne sont pas cotées pour ne pas mélanger deux générations."}
                </p>
              )}
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-ink-3">{lignes.length} annonce{lignes.length > 1 ? "s" : ""}</p>
                <label className="flex items-center gap-2 text-sm text-ink-2">
                  <input type="checkbox" checked={sous} onChange={(e) => setSous(e.target.checked)} className="size-4 accent-[#ff5a1f]" /> Sous la cote seulement
                </label>
              </div>
              <ul className="grid gap-2">
                {lignes.map((a) => (
                  <LigneCotee key={a.id} a={a} />
                ))}
              </ul>
            </>
          )}
          {res.nInconnues > 0 && (
            <details className="carte p-4 text-sm">
              <summary className="cursor-pointer text-ink-2">{res.nInconnues} annonce{res.nInconnues > 1 ? "s" : ""} non reconnue{res.nInconnues > 1 ? "s" : ""} (modèle hors catalogue ou titre trop vague)</summary>
              <ul className="mt-3 grid gap-1 text-ink-3">
                {res.inconnues.map((a) => (
                  <li key={a.id}>
                    {a.url ? <a href={a.url} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">{a.titre || a.id}</a> : a.titre} · {eur(a.prix)}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}
    </div>
  );
}

function Chiffre({ l, v, s, bon }: { l: string; v: string; s?: string; bon?: boolean }) {
  return (
    <div className="carte p-4">
      <p className="text-xs text-ink-3">{l}</p>
      <p className={cx("num mt-1 font-display text-2xl font-semibold", bon && "text-ok")}>{v}</p>
      {s && <p className="text-xs text-ink-3">{s}</p>}
    </div>
  );
}

function LigneCotee({ a }: { a: AnnonceCotee }) {
  const c = a.cote;
  const bon = c?.pct != null && c.pct >= 0.05, cher = c?.pct != null && c.pct <= -0.05;
  return (
    <li className="carte grid gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {a.url ? <a href={a.url} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">{a.titre || "Annonce"}</a> : a.titre}
        </p>
        <p className="text-xs text-ink-3">
          {[a.annee, a.km != null ? `${a.km.toLocaleString("fr-FR")} km` : null, a.ch ? `${a.ch} ch` : null, a.energie, a.boite, a.lieu, a.pro ? "pro" : "particulier"].filter(Boolean).join(" · ")}
          {a.badge && <span className="ml-2 rounded-full border border-line-2 px-2 py-px">Leboncoin : {a.badge}</span>}
        </p>
      </div>
      <p className="num text-sm sm:text-right">
        <b className="font-display text-lg">{eur(a.prix)}</b>
        <span className="block text-xs text-ink-3">{c ? `cote ${eur(c.P)} (${eur(c.lo)} – ${eur(c.hi)})` : "pas de cote"}</span>
      </p>
      <p className="num text-sm sm:min-w-36 sm:text-right">
        {c && c.ecart != null ? (
          <>
            <b className={cx(bon ? "text-ok" : cher ? "text-bad" : "text-ink-2")}>{c.ecart >= 0 ? `${eur(c.ecart)} sous` : `${eur(-c.ecart)} au-dessus`}</b>
            <span className="block text-xs text-ink-3">{Math.round(Math.abs(c.pct ?? 0) * 100)} % · confiance {c.conf}</span>
          </>
        ) : (
          <span className="text-xs text-ink-3">{c?.why || "—"}</span>
        )}
      </p>
    </li>
  );
}

function PlacerVoiture({ cat }: { cat: CatMarque[] }) {
  const [choix, setChoix] = useState<Choix>({ marque: "", modele: "", gen: "" });
  const [v, setV] = useState({ energie: "", boite: "", annee: "", km: "", prix: "", version: "", ch: "" });
  const [etat, setEtat] = useState("");
  const [charge, setCharge] = useState(false);
  const [res, setRes] = useState<Place | null>(null);
  const maj = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV((x) => ({ ...x, [k]: e.target.value }));

  async function placer(e: React.FormEvent) {
    e.preventDefault();
    if (!choix.marque || !choix.modele) return setEtat("Choisissez la marque et le modèle.");
    if (!n(v.annee) || n(v.km) == null) return setEtat("Indiquez l'année et le kilométrage.");
    setCharge(true);
    setEtat("Calcul de la cote…");
    try {
      const r = await fetch("/api/marche/cote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voiture: { base: `${choix.marque} ${choix.modele}`, gen: choix.gen || undefined, energie: v.energie, boite: v.boite, annee: n(v.annee), km: n(v.km), prix: n(v.prix), version: v.version, ch: n(v.ch) } }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) return setEtat(j?.erreur ?? "Le calcul n'a pas abouti.");
      setRes(j);
      setEtat("");
    } finally {
      setCharge(false);
    }
  }
  const e = res?.estimation;

  return (
    <div className="grid gap-6">
      <form onSubmit={placer} className="carte grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <ChoixVehicule cat={cat} v={choix} onChange={setChoix} idPrefixe="pv" />
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Énergie</span>
          <select value={v.energie} onChange={maj("energie")} className={inputCls}>
            <option value="">Toutes</option>
            <option value="essence">Essence</option>
            <option value="diesel">Diesel</option>
            <option value="hybride">Hybride</option>
            <option value="electrique">Électrique</option>
            <option value="gpl">GPL</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Boîte</span>
          <select value={v.boite} onChange={maj("boite")} className={inputCls}>
            <option value="">Manuelle</option>
            <option value="automatique">Automatique</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Version, finition, options</span>
          <input value={v.version} onChange={maj("version")} placeholder="ex. 1.4 100 ch Cosmo, GPS, clim auto" className={inputCls} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Année</span>
            <input required inputMode="numeric" value={v.annee} onChange={maj("annee")} placeholder="2011" className={inputCls} />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Kilométrage</span>
            <input required inputMode="numeric" value={v.km} onChange={maj("km")} placeholder="103000" className={inputCls} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Prix demandé (€)</span>
            <input inputMode="numeric" value={v.prix} onChange={maj("prix")} placeholder="facultatif" className={inputCls} />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Puissance (ch)</span>
            <input inputMode="numeric" value={v.ch} onChange={maj("ch")} placeholder="facultatif" className={inputCls} />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-3">
          <button type="submit" disabled={charge} className="btn btn-o btn-sm">
            {charge ? "Calcul…" : "Placer sur la cote"}
          </button>
          <p className="text-sm text-ink-3" role="status">{etat}</p>
        </div>
      </form>

      {res && (
        <section aria-labelledby="pv-res" className="grid gap-5">
          <h2 id="pv-res" className="font-display text-xl font-semibold">{res.nom}</h2>
          {e ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Chiffre l="Cote" v={eur(e.P)} s={`fourchette ${eur(e.lo)} – ${eur(e.hi)}`} />
              <Chiffre l={e.ecart == null ? "Confiance" : "Écart au prix demandé"} v={e.ecart == null ? e.conf : e.ecart >= 0 ? `${eur(e.ecart)} sous` : `${eur(-e.ecart)} au-dessus`} s={e.ecart == null ? e.why || `${e.n} annonces comparables` : `${Math.round(Math.abs(e.pct ?? 0) * 100)} % · moins chère que ${e.moinsCherQue ?? "—"} % des annonces`} bon={(e.pct ?? 0) >= 0.05} />
              <Chiffre l="Dans un an" v={eur(e.dans1an)} s="un an et 15 000 km de plus" />
              <Chiffre l="Ce que coûtent les kilomètres" v={eur(e.parKm)} s={`par 10 000 km · ${eur(e.parAn)} par an d'âge`} />
            </div>
          ) : (
            <p className="text-ink-2">Pas d&apos;estimation possible pour cette voiture.</p>
          )}
          {e && (e.ajust?.length || e.why) ? (
            <div className="carte grid gap-1 p-4 text-sm text-ink-2">
              {e.ajust?.map((a) => (
                <p key={a.l}>
                  {a.l} : <b className="num">{a.eur >= 0 ? "+" : ""}{eur(a.eur)}</b>
                </p>
              ))}
              {e.why && <p className="text-warn">Confiance {e.conf} : {e.why}</p>}
              <p className="text-xs text-ink-3">Cote calculée sur {e.n} annonces de la même génération et de la même énergie.</p>
            </div>
          ) : null}
          <div className="carte p-4 sm:p-5">
            <NuageCote titre={`Votre voiture face aux annonces ${res.nom}`} points={res.points} courbe={res.courbe} reperes={[{ km: n(v.km), annee: n(v.annee), prix: n(v.prix) ?? e?.P ?? 0, label: n(v.prix) ? `Votre voiture · ${eur(n(v.prix))}` : `Votre voiture à la cote · ${eur(e?.P)}`, ton: "voiture" }]} />
          </div>
          {e?.comps?.length ? (
            <div className="grid gap-2">
              <h3 className="font-display font-semibold">Les annonces les plus proches</h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {e.comps.map((x, i) => (
                  <li key={i} className="carte flex items-center justify-between gap-3 p-3 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate">{x.id && /^\d{6,}$/.test(x.id) ? <a href={`https://www.leboncoin.fr/ad/voitures/${x.id}`} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">{x.lib || "Annonce"}</a> : x.lib || "Annonce"}</span>
                      <span className="text-xs text-ink-3">{x.annee} · {x.km.toLocaleString("fr-FR")} km · {x.pro ? "pro" : "particulier"}</span>
                    </span>
                    <b className="num shrink-0">{eur(x.prix)}</b>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
