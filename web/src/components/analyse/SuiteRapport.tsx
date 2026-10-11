"use client";
/* « Après le premier message » : le rapport continue avec ce que l'on apprend. Réponse du vendeur collée, documents
   photographiés (CT, factures, HistoVec, lus par l'IA), puis la visite : points à contrôler propres à ce moteur, défauts
   constatés et chiffrés, offre finale recalculée. Chaque ajout recalcule le bilan ; l'avant / après est affiché. */
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { bilan } from "@/lib/analyse/bilan";
import type { Analyse } from "@/lib/analyse/couts";
import type { Complement, Constat } from "@/lib/analyse/complements";
import { VISITE } from "@/lib/analyse/regles";
import { estImage, reduire, type PhotoLocale } from "@/lib/photos-analyse";
import { cx, inputCls } from "@/lib/cx";
import { useProfilAnalyse } from "./ProfilAnalyse";

const eur = (v: number | null | undefined) => (v == null || !isFinite(v) ? "—" : `${Math.round(v).toLocaleString("fr-FR")} €`);
const ONGLETS = [
  ["reponse", "Réponse du vendeur"],
  ["document", "Documents"],
  ["visite", "Visite"],
] as const;
type Onglet = (typeof ONGLETS)[number][0];

export function SuiteRapport({ a, id }: { a: Analyse; id: string }) {
  const router = useRouter();
  const { profil, actif } = useProfilAnalyse();
  const [onglet, setOnglet] = useState<Onglet>("reponse");
  const [texte, setTexte] = useState("");
  const [photos, setPhotos] = useState<PhotoLocale[]>([]);
  const [etat, setEtat] = useState<{ t: string; ton: "ok" | "bad" | "" } | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const liste = a.complements ?? [];
  const visite = liste.find((x) => x.type === "visite");
  const [coches, setCoches] = useState<string[]>(visite?.coches ?? []);
  const [constats, setConstats] = useState<Constat[]>(visite?.constats ?? []);
  const revente = profil.objectif === "revente";

  // avant / après : le bilan sans les ajouts, avec les ajouts enregistrés, et avec la visite en cours de saisie
  const avant = useMemo(() => bilan({ ...a, complements: [] }, profil), [a, profil]);
  const apres = useMemo(() => bilan(a, profil), [a, profil]);
  const visiteEnCours: Complement = { le: new Date().toISOString(), type: "visite", constats: constats.filter((x) => x.libelle.trim()), coches };
  const enVisite = useMemo(() => bilan({ ...a, complements: [...liste.filter((x) => x.type !== "visite"), visiteEnCours] }, profil), [a, profil, constats, coches]); // eslint-disable-line react-hooks/exhaustive-deps

  // points de contrôle : faiblesses connues de ce moteur et de cette boîte, puis l'analyse, puis la liste de base
  const points = useMemo(() => {
    const l = [
      ...apres.connus.filter((c) => c.avis !== "robuste").map((c) => `${c.nom} : ${c.verif}`),
      ...(a.ia?.visite?.aControler ?? a.rapport?.inspection ?? []),
      ...VISITE,
    ];
    return [...new Set(l)].slice(0, 20);
  }, [a, apres.connus]);

  if (!actif) return null;

  async function envoyer(corps: Record<string, unknown>, ok: string) {
    setEnvoi(true);
    setEtat(null);
    const r = await fetch(`/api/rapports/${id}/complements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    setEnvoi(false);
    if (!r?.ok) return setEtat({ t: j.erreur ?? "Enregistrement impossible, réessayez.", ton: "bad" });
    setEtat({ t: ok, ton: "ok" });
    setTexte("");
    setPhotos([]);
    router.refresh();
  }

  const delta = (x: number | null, y: number | null) => (x == null || y == null || x === y ? null : y - x);
  const dNote = delta(avant.indice, apres.indice);

  return (
    <section className="rounded-3xl border border-o/30 bg-panel p-5 sm:p-6" aria-labelledby="suite-titre">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="suite-titre" className="font-display text-lg font-semibold">Après le premier message</h2>
        <p className="text-sm text-ink-3">Ajoutez ce que vous apprenez : le rapport se met à jour.</p>
      </div>

      {liste.length > 0 && (
        <div className="mt-4 rounded-2xl border border-line bg-black/20 p-4">
          <p className="text-sm">
            Avec vos ajouts : <b className={cx(apres.ton === "ok" ? "text-ok" : apres.ton === "bad" ? "text-bad" : apres.ton === "warn" ? "text-warn" : "text-o2")}>{apres.libelle}</b>
            {avant.libelle !== apres.libelle && <span className="text-ink-3"> (avant : {avant.libelle})</span>}
            {dNote != null && (
              <span className={cx("num ml-2", dNote > 0 ? "text-ok" : "text-bad")}>
                note {avant.indice} → {apres.indice}
              </span>
            )}
          </p>
          <ul className="mt-2 grid gap-1 text-sm text-ink-2">
            {apres.piliers.map((p, i) => {
              const q = avant.piliers[i];
              return q && q.reponse !== p.reponse ? (
                <li key={p.cle}>
                  {p.question} <span className="text-ink-3">{q.reponse}</span> → <b>{p.reponse}</b>
                </li>
              ) : null;
            })}
          </ul>
          <ul className="mt-3 grid gap-1.5 border-t border-line pt-3 text-sm">
            {liste.map((c, i) => (
              <li key={i} className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="text-ink-3">{new Date(c.le).toLocaleDateString("fr-FR")} · {c.type === "reponse" ? "réponse du vendeur" : c.type === "document" ? "documents" : "visite"} · </span>
                  <span className="text-ink-2">{c.type === "visite" ? `${(c.coches ?? []).length} point(s) vérifié(s), ${(c.constats ?? []).length} défaut(s) constaté(s)` : (c.texte ?? "").slice(0, 160)}</span>
                </span>
                <button type="button" disabled={envoi} onClick={() => envoyer({ type: "retirer", index: i }, "Ajout retiré.")} className="shrink-0 text-xs text-ink-3 hover:text-bad">
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div role="tablist" aria-label="Ajouter au rapport" className="mt-4 flex w-fit flex-wrap gap-1 rounded-full border border-line-2 bg-glass p-1 text-sm">
        {ONGLETS.map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={onglet === k} onClick={() => setOnglet(k)} className="rounded-full px-3.5 py-1.5 text-ink-2 transition aria-selected:bg-o aria-selected:text-[#160904]">
            {l}
          </button>
        ))}
      </div>

      <div className="mt-4" role="tabpanel">
        {onglet === "reponse" && (
          <div className="grid gap-3">
            <p className="text-sm text-ink-3">Collez la réponse du vendeur (« distribution faite à 120 000 km, CT de mars sans défaut, embrayage d&apos;origine… »). L&apos;outil en tire les faits et recalcule.</p>
            <textarea value={texte} onChange={(e) => setTexte(e.target.value)} rows={4} maxLength={5000} className={inputCls} placeholder="Réponse du vendeur" aria-label="Réponse du vendeur" />
            <div>
              <button type="button" disabled={envoi || texte.trim().length < 3} onClick={() => envoyer({ type: "reponse", texte }, "Réponse ajoutée : le bilan est à jour.")} className="btn btn-o btn-sm">
                {envoi ? "Mise à jour…" : "Mettre à jour le rapport"}
              </button>
            </div>
          </div>
        )}

        {onglet === "document" && (
          <div className="grid gap-3">
            <p className="text-sm text-ink-3">Photographiez le procès-verbal de contrôle technique, les factures ou le rapport HistoVec (3 photos au plus). Ils sont lus et rangés dans le rapport : défaillances chiffrées, distribution, kilométrages, titulaires, gage.</p>
            <label className="btn btn-sm w-fit cursor-pointer">
              Choisir des photos
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={async (e) => {
                  const f = Array.from(e.target.files ?? []).filter(estImage).slice(0, 3);
                  const l = (await Promise.all(f.map(reduire))).filter((x): x is PhotoLocale => !!x);
                  setPhotos(l);
                  if (f.length && !l.length) setEtat({ t: "Photos illisibles : essayez en JPEG.", ton: "bad" });
                }}
              />
            </label>
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photos.map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.id} src={p.url} alt="Document à lire" className="h-20 w-auto rounded-lg border border-line object-cover" />
                ))}
              </div>
            )}
            <div>
              <button type="button" disabled={envoi || !photos.length} onClick={() => envoyer({ type: "document", photos: photos.map((p) => ({ media_type: "image/jpeg", data: p.data })) }, "Documents lus : le bilan est à jour.")} className="btn btn-o btn-sm">
                {envoi ? "Lecture des documents…" : "Lire les documents"}
              </button>
            </div>
          </div>
        )}

        {onglet === "visite" && (
          <div className="grid gap-5">
            <div>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h3 className="font-semibold">À contrôler sur place</h3>
                <span className="text-sm text-ink-3">{coches.length} / {points.length}</span>
              </div>
              <ul className="grid gap-1">
                {points.map((x) => (
                  <li key={x}>
                    <label className="flex cursor-pointer gap-3 rounded-xl px-2 py-1.5 hover:bg-glass">
                      <input type="checkbox" checked={coches.includes(x)} onChange={(e) => setCoches((l) => (e.target.checked ? [...l, x] : l.filter((y) => y !== x)))} className="mt-1 size-4 shrink-0 accent-[#3ecb7f]" />
                      <span className={cx("text-[15px]", coches.includes(x) && "text-ink-3 line-through")}>{x}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Défauts constatés</h3>
              <ul className="grid gap-2">
                {constats.map((k, i) => (
                  <li key={i} className="grid grid-cols-[1fr_110px_auto] items-center gap-2">
                    <input value={k.libelle} onChange={(e) => setConstats((l) => l.map((x, j) => (j === i ? { ...x, libelle: e.target.value } : x)))} placeholder="ex. pneus avant usés" className={cx(inputCls, "py-1.5")} aria-label="Défaut constaté" />
                    <input value={k.montant || ""} inputMode="numeric" onChange={(e) => setConstats((l) => l.map((x, j) => (j === i ? { ...x, montant: Number(e.target.value.replace(/\D/g, "")) || 0 } : x)))} placeholder="€" className={cx(inputCls, "num py-1.5 text-right")} aria-label="Coût estimé en euros" />
                    <button type="button" onClick={() => setConstats((l) => l.filter((_, j) => j !== i))} className="btn btn-sm" aria-label={`Retirer ${k.libelle || "ce défaut"}`}>
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => setConstats((l) => [...l, { libelle: "", montant: 0 }])} className="btn btn-sm mt-2">
                Ajouter un défaut
              </button>
            </div>
            <div className="rounded-2xl border border-o/40 bg-o/10 p-4">
              <p className="text-sm text-ink-3">Avec ce que vous avez constaté</p>
              {revente ? (
                <p className="mt-1 text-lg">
                  Offre finale <b className="num font-display text-2xl text-o2">{eur(enVisite.argent.offre)}</b>
                  <span className="text-sm text-ink-3"> · plafond {eur(enVisite.argent.plafond != null && enVisite.argent.plafond > 0 ? enVisite.argent.plafond : null)} · au prix affiché {enVisite.argent.marge == null ? "—" : enVisite.argent.marge >= 0 ? `+${eur(enVisite.argent.marge)}` : `−${eur(-enVisite.argent.marge)}`}</span>
                </p>
              ) : (
                <p className="mt-1 text-lg">
                  Proposez <b className="num font-display text-2xl text-o2">{eur(Math.min(enVisite.argent.proposer ?? Infinity, enVisite.argent.prix ?? Infinity))}</b>
                  <span className="text-sm text-ink-3"> · travaux probables {eur(enVisite.travaux.probable)}</span>
                </p>
              )}
              <p className="mt-1 text-sm text-ink-2">
                Verdict au prix affiché : {enVisite.libelle}.
                {revente && enVisite.verdict === "eviter" && enVisite.argent.offre != null && " À l'offre finale, l'achat redevient rentable : sinon, passez."}
              </p>
            </div>
            <div>
              <button type="button" disabled={envoi} onClick={() => envoyer({ type: "visite", constats: visiteEnCours.constats, coches }, "Visite enregistrée : le bilan est à jour.")} className="btn btn-o btn-sm">
                {envoi ? "Enregistrement…" : "Enregistrer la visite"}
              </button>
            </div>
          </div>
        )}
        {etat && (
          <p role="status" className={cx("mt-3 text-sm", etat.ton === "ok" ? "text-ok" : etat.ton === "bad" ? "text-bad" : "text-ink-2")}>
            {etat.t}
          </p>
        )}
      </div>
    </section>
  );
}
