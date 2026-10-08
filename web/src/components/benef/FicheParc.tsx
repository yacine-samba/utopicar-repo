"use client";
/* eslint-disable @next/next/no-img-element -- photos du véhicule (stockage ou annonce) */
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { envoyerPhotos } from "@/lib/photos-client";
import { DOCS_VENTE, FRAIS_CAT, NOTES_QUALITE, STATUTS_PARC, STRUCTURES, totalFrais, type Frais, type Vehicule } from "@/lib/parc";
import { cx, inputCls } from "../ui";

const ent = (s: string) => (s.trim() === "" ? null : Math.max(0, Math.round(Number(s.replace(/[\s €]/g, "").replace(",", "."))) || 0));
const txt = (s: string, n: number) => s.trim().slice(0, n) || null;
const str = (v: unknown) => (v == null ? "" : String(v));

function Champ({ l, children, large }: { l: string; children: React.ReactNode; large?: boolean }) {
  return (
    <label className={cx("grid gap-1.5 text-sm", large && "sm:col-span-2")}>
      <span className="text-ink-2">{l}</span>
      {children}
    </label>
  );
}

function Groupe({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-4 rounded-2xl border border-line p-4 sm:grid-cols-2 lg:grid-cols-4">
      <legend className="px-1 font-display text-base font-semibold">{titre}</legend>
      {children}
    </fieldset>
  );
}

/** Fiche véhicule du parc : identité, deal, frais détaillés, papiers de vente, vendeur, photos, notes. */
export function FicheParc({ v, onFini }: { v: Partial<Vehicule>; onFini: () => void }) {
  const router = useRouter();
  const fichier = useRef<HTMLInputElement>(null);
  const [f, setF] = useState({
    titre: str(v.titre), finition: str(v.finition), immat: str(v.immat), annee: str(v.annee), km: str(v.km), energie: str(v.energie), boite: str(v.boite),
    premiere_immat: str(v.premiere_immat), cv: str(v.cv), couleur: str(v.couleur), vin: str(v.vin), localisation: str(v.localisation), lien: str(v.lien),
    statut: v.statut ?? "repere", structure: v.structure ?? "achat", date_achat: str(v.date_achat), prix_achat: str(v.prix_achat), commission: str(v.commission),
    prix_conseille: str(v.prix_conseille), prix_vente: str(v.prix_vente), date_vente: str(v.date_vente), note_qualite: str(v.note_qualite), ct_date: str(v.ct_date),
    vendeur_nom: str(v.vendeur_nom), vendeur_tel: str(v.vendeur_tel), frais: str(v.frais ?? 0), notes: str(v.notes),
  });
  const [frais, setFrais] = useState<Frais[]>(v.frais_detail ?? []);
  const [docs, setDocs] = useState<Record<string, boolean>>(v.docs ?? {});
  const [photos, setPhotos] = useState<string[]>(v.photos ?? []);
  const [envoi, setEnvoi] = useState("");
  const [err, setErr] = useState("");
  const [charge, setCharge] = useState(false);
  const maj = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const total = frais.length ? totalFrais({ frais: 0, frais_detail: frais }) : (ent(f.frais) ?? 0);
  const mandat = f.structure === "mandat" || f.structure === "depot" || f.structure === "intermediation";

  async function ajouterPhotos(fs: File[]) {
    const place = 30 - photos.length;
    if (place <= 0) return setEnvoi("30 photos au plus.");
    setEnvoi("Envoi des photos…");
    const { urls, refusees } = await envoyerPhotos(fs.filter((x) => x.type.startsWith("image/")).slice(0, place), "parc");
    setPhotos((p) => [...p, ...urls].slice(0, 30));
    setEnvoi(refusees ? `${refusees} photo${refusees > 1 ? "s" : ""} n'${refusees > 1 ? "ont" : "a"} pas pu être envoyée${refusees > 1 ? "s" : ""}.` : "");
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!f.titre.trim()) return setErr("Indiquez le véhicule.");
        setCharge(true);
        const ligne = {
          titre: f.titre.trim().slice(0, 140), finition: txt(f.finition, 140), immat: txt(f.immat.toUpperCase(), 20),
          annee: ent(f.annee), km: ent(f.km), energie: txt(f.energie, 30), boite: txt(f.boite, 30), premiere_immat: f.premiere_immat || null,
          cv: ent(f.cv), couleur: txt(f.couleur, 40), vin: txt(f.vin.toUpperCase(), 20), localisation: txt(f.localisation, 120), lien: /^https?:\/\//.test(f.lien.trim()) ? f.lien.trim().slice(0, 500) : null,
          statut: f.statut, structure: f.structure, date_achat: f.date_achat || null, prix_achat: ent(f.prix_achat), commission: ent(f.commission),
          prix_conseille: ent(f.prix_conseille), prix_vente: ent(f.prix_vente), date_vente: f.date_vente || null, note_qualite: f.note_qualite || null, ct_date: f.ct_date || null,
          vendeur_nom: txt(f.vendeur_nom, 80), vendeur_tel: txt(f.vendeur_tel, 30),
          frais_detail: frais.filter((x) => x.label.trim() || x.montant).map((x) => ({ cat: x.cat, label: x.label.trim().slice(0, 80), montant: Math.max(0, Math.round(Number(x.montant) || 0)) })),
          frais: total, docs, photos, notes: f.notes.slice(0, 2000) || null, updated_at: new Date().toISOString(),
        };
        const sb = supabaseNavigateur();
        const { error } = v.id ? await sb.from("parc").update(ligne).eq("id", v.id) : await sb.from("parc").insert(ligne);
        setCharge(false);
        if (error) return setErr("Enregistrement impossible. Vérifiez les champs (année, kilométrage, VIN) et réessayez.");
        onFini();
        router.refresh();
      }}
    >
      <Groupe titre="Le véhicule">
        <Champ l="Véhicule" large>
          <input value={f.titre} onChange={maj("titre")} required placeholder="ex. Renault Clio IV" className={inputCls} />
        </Champ>
        <Champ l="Version ou finition" large>
          <input value={f.finition} onChange={maj("finition")} placeholder="ex. 1.5 dCi 90 Business" className={inputCls} />
        </Champ>
        <Champ l="Immatriculation">
          <input value={f.immat} onChange={maj("immat")} placeholder="AB-123-CD" className={cx(inputCls, "uppercase")} />
        </Champ>
        <Champ l="Année">
          <input value={f.annee} onChange={maj("annee")} inputMode="numeric" className={inputCls} />
        </Champ>
        <Champ l="Kilométrage">
          <input value={f.km} onChange={maj("km")} inputMode="numeric" className={inputCls} />
        </Champ>
        <Champ l="1re immatriculation">
          <input type="date" value={f.premiere_immat} onChange={maj("premiere_immat")} className={inputCls} />
        </Champ>
        <Champ l="Énergie">
          <select value={f.energie} onChange={maj("energie")} className={inputCls}>
            {["", "Essence", "Diesel", "Hybride", "Électrique", "GPL"].map((x) => <option key={x} value={x}>{x || "—"}</option>)}
          </select>
        </Champ>
        <Champ l="Boîte">
          <select value={f.boite} onChange={maj("boite")} className={inputCls}>
            {["", "Manuelle", "Automatique"].map((x) => <option key={x} value={x}>{x || "—"}</option>)}
          </select>
        </Champ>
        <Champ l="Puissance fiscale (CV)">
          <input value={f.cv} onChange={maj("cv")} inputMode="numeric" className={inputCls} />
        </Champ>
        <Champ l="Couleur">
          <input value={f.couleur} onChange={maj("couleur")} className={inputCls} />
        </Champ>
        <Champ l="N° de série (VIN)" large>
          <input value={f.vin} onChange={maj("vin")} maxLength={17} className={cx(inputCls, "uppercase")} />
        </Champ>
        <Champ l="Lieu d'achat" large>
          <input value={f.localisation} onChange={maj("localisation")} placeholder="ex. Orléans (45)" className={inputCls} />
        </Champ>
        <Champ l="Lien de l'annonce source" large>
          <input value={f.lien} onChange={maj("lien")} inputMode="url" placeholder="https://…" className={inputCls} />
        </Champ>
      </Groupe>

      <Groupe titre="Le deal">
        <Champ l="Statut">
          <select value={f.statut} onChange={maj("statut")} className={inputCls}>
            {Object.entries(STATUTS_PARC).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </Champ>
        <Champ l="Structure du deal">
          <select value={f.structure} onChange={maj("structure")} className={inputCls}>
            {Object.entries(STRUCTURES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </Champ>
        <Champ l="Date d'achat ou d'entrée">
          <input type="date" value={f.date_achat} onChange={maj("date_achat")} className={inputCls} />
        </Champ>
        <Champ l={mandat ? "Net vendeur (€)" : "Prix d'achat (€)"}>
          <input value={f.prix_achat} onChange={maj("prix_achat")} inputMode="numeric" className={inputCls} />
        </Champ>
        {mandat && (
          <Champ l="Commission (€)">
            <input value={f.commission} onChange={maj("commission")} inputMode="numeric" className={inputCls} />
          </Champ>
        )}
        <Champ l="Prix de vente conseillé (€)">
          <input value={f.prix_conseille} onChange={maj("prix_conseille")} inputMode="numeric" className={inputCls} />
        </Champ>
        <Champ l="Prix de vente réel (€)">
          <input value={f.prix_vente} onChange={maj("prix_vente")} inputMode="numeric" className={inputCls} />
        </Champ>
        <Champ l="Date de vente">
          <input type="date" value={f.date_vente} onChange={maj("date_vente")} className={inputCls} />
        </Champ>
        <Champ l="Note qualité">
          <select value={f.note_qualite} onChange={maj("note_qualite")} className={inputCls}>
            <option value="">—</option>
            {Object.entries(NOTES_QUALITE).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </Champ>
        <Champ l="Date du dernier CT">
          <input type="date" value={f.ct_date} onChange={maj("ct_date")} className={inputCls} />
        </Champ>
        <Champ l="Vendeur">
          <input value={f.vendeur_nom} onChange={maj("vendeur_nom")} autoComplete="off" className={inputCls} />
        </Champ>
        <Champ l="Téléphone du vendeur">
          <input value={f.vendeur_tel} onChange={maj("vendeur_tel")} inputMode="tel" autoComplete="off" className={inputCls} />
        </Champ>
      </Groupe>

      <fieldset className="grid gap-3 rounded-2xl border border-line p-4">
        <legend className="px-1 font-display text-base font-semibold">Frais</legend>
        {frais.length === 0 ? (
          <label className="grid max-w-xs gap-1.5 text-sm">
            <span className="text-ink-2">Frais cumulés (€)</span>
            <input value={f.frais} onChange={maj("frais")} inputMode="numeric" className={inputCls} />
          </label>
        ) : (
          <ul className="grid gap-2">
            {frais.map((x, i) => (
              <li key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_7rem_auto] items-center gap-2">
                <select aria-label="Catégorie" value={x.cat} onChange={(e) => setFrais((l) => l.map((y, j) => (j === i ? { ...y, cat: e.target.value } : y)))} className={inputCls}>
                  {Object.entries(FRAIS_CAT).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
                <input aria-label="Poste" value={x.label} onChange={(e) => setFrais((l) => l.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)))} placeholder="Pneus AV, vidange…" className={inputCls} />
                <input aria-label="Montant en euros" value={x.montant || ""} onChange={(e) => setFrais((l) => l.map((y, j) => (j === i ? { ...y, montant: ent(e.target.value) ?? 0 } : y)))} inputMode="numeric" placeholder="€" className={inputCls} />
                <button type="button" aria-label="Supprimer ce poste" onClick={() => setFrais((l) => l.filter((_, j) => j !== i))} className="rounded-full px-2 py-1 text-ink-3 hover:text-bad">✕</button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <button type="button" onClick={() => setFrais((l) => [...l, { cat: "reparation", label: "", montant: 0 }])} className="btn btn-sm">
            + Ajouter un poste de frais
          </button>
          <span>
            Total des frais : <b className="num">{total.toLocaleString("fr-FR")}&nbsp;€</b>
          </span>
        </div>
      </fieldset>

      <fieldset className="grid gap-3 rounded-2xl border border-line p-4">
        <legend className="px-1 font-display text-base font-semibold">Papiers pour la vente</legend>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {DOCS_VENTE.map(([k, l]) => (
            <li key={k}>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-line p-3 text-sm hover:bg-glass">
                <input type="checkbox" checked={!!docs[k]} onChange={(e) => setDocs((d) => ({ ...d, [k]: e.target.checked }))} className="size-4 accent-[#ff5a1f]" />
                {l}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className="grid gap-3 rounded-2xl border border-line p-4">
        <legend className="px-1 font-display text-base font-semibold">Photos</legend>
        <ul className="flex flex-wrap gap-2">
          {photos.map((u, i) => (
            <li key={u} className="relative">
              <img src={u} alt={`Photo ${i + 1}`} referrerPolicy="no-referrer" className="h-20 w-28 rounded-xl object-cover" />
              <button type="button" aria-label={`Retirer la photo ${i + 1}`} onClick={() => setPhotos((p) => p.filter((x) => x !== u))} className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/70 text-xs text-white">
                ✕
              </button>
              {i === 0 && <span className="absolute bottom-1 left-1 rounded-full bg-black/70 px-1.5 text-[10px] text-white">principale</span>}
            </li>
          ))}
          <li>
            <button type="button" onClick={() => fichier.current?.click()} className="grid h-20 w-28 place-items-center rounded-xl border border-dashed border-line-2 text-2xl text-ink-3 hover:text-ink" aria-label="Ajouter des photos">
              +
            </button>
          </li>
        </ul>
        <input ref={fichier} type="file" accept="image/*" multiple hidden onChange={(e) => (ajouterPhotos(Array.from(e.target.files ?? [])), (e.target.value = ""))} />
        {envoi && <p role="status" className="text-sm text-ink-3">{envoi}</p>}
      </fieldset>

      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Notes</span>
        <textarea value={f.notes} onChange={maj("notes")} rows={3} className={inputCls} />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={charge} className="btn btn-o btn-sm">
          {charge ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button type="button" onClick={onFini} className="btn btn-sm">
          Annuler
        </button>
        {err && <p role="alert" className="text-sm text-warn">{err}</p>}
      </div>
    </form>
  );
}
