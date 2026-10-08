"use client";
/* Documents du dossier, ajoutés quand on les reçoit (après le premier contact, à l'achat) : CT, HistoVec, carte grise,
   certificat de cession, non-gage, factures. Stockés dans le dossier privé de la personne (stockage « documents »),
   ouverts par un lien temporaire. Rattachés au rapport, à la voiture du parc, ou aux deux. */
import { useEffect, useRef, useState } from "react";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { cx } from "@/lib/cx";

export const TYPES_DOCUMENTS: [string, string][] = [
  ["ct", "Contrôle technique"],
  ["histovec", "Rapport HistoVec"],
  ["carte_grise", "Carte grise"],
  ["cession", "Certificat de cession"],
  ["csa", "Non-gage (situation administrative)"],
  ["factures", "Factures d'entretien"],
  ["autre", "Autre document"],
];
const NOMS = Object.fromEntries(TYPES_DOCUMENTS);
/** Papiers du parc cochés automatiquement quand le document est ajouté. */
const VERS_PARC: Record<string, string> = { ct: "ct", histovec: "histovec", carte_grise: "carte_grise", cession: "cession", csa: "csa" };

type Doc = { id: string; type: string; nom: string; chemin: string; created_at: string };

export function PiecesDossier({ rapportId, parcId, titre = "Documents du dossier" }: { rapportId?: string | null; parcId?: string | null; titre?: string }) {
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [etat, setEtat] = useState("");
  const [type, setType] = useState("ct");
  const fichier = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sb = supabaseNavigateur();
    let q = sb.from("documents").select("id, type, nom, chemin, created_at").order("created_at", { ascending: false });
    q = rapportId && parcId ? q.or(`rapport_id.eq.${rapportId},parc_id.eq.${parcId}`) : rapportId ? q.eq("rapport_id", rapportId) : q.eq("parc_id", parcId!);
    q.then(({ data }) => setDocs((data ?? []) as Doc[]));
  }, [rapportId, parcId]);

  async function ajouter(fs: File[], t: string) {
    if (!fs.length) return;
    const sb = supabaseNavigateur();
    const { data: u } = await sb.auth.getUser();
    if (!u.user) return setEtat("Reconnectez-vous pour ajouter un document.");
    setEtat("Envoi…");
    let ok = 0;
    for (const f of fs.slice(0, 10)) {
      if (f.size > 10 * 1024 * 1024) {
        setEtat(`« ${f.name} » dépasse 10 Mo.`);
        continue;
      }
      const propre = f.name.normalize("NFD").replace(/[^\w.-]+/g, "_").slice(-80) || "document";
      const chemin = `${u.user.id}/${rapportId ?? parcId}/${crypto.randomUUID()}-${propre}`;
      const { error } = await sb.storage.from("documents").upload(chemin, f, { contentType: f.type || "application/octet-stream" });
      if (error) {
        setEtat(/mime|type/i.test(error.message) ? "Format refusé : PDF, JPEG, PNG, WebP ou HEIC." : "Envoi impossible, réessayez.");
        continue;
      }
      const { data, error: e2 } = await sb
        .from("documents")
        .insert({ rapport_id: rapportId ?? null, parc_id: parcId ?? null, type: t, nom: f.name.slice(0, 200) || NOMS[t], chemin, taille: f.size })
        .select("id, type, nom, chemin, created_at")
        .single();
      if (e2 || !data) continue;
      ok++;
      setDocs((l) => [data as Doc, ...(l ?? [])]);
    }
    // papiers de vente du parc : cochés tout seuls
    if (ok && parcId && VERS_PARC[t]) {
      const { data: v } = await sb.from("parc").select("docs").eq("id", parcId).maybeSingle();
      await sb.from("parc").update({ docs: { ...((v?.docs as Record<string, boolean>) ?? {}), [VERS_PARC[t]]: true } }).eq("id", parcId);
    }
    if (ok) setEtat(`${ok} document${ok > 1 ? "s" : ""} ajouté${ok > 1 ? "s" : ""}.`);
  }

  async function ouvrir(d: Doc) {
    const { data } = await supabaseNavigateur().storage.from("documents").createSignedUrl(d.chemin, 300);
    if (data?.signedUrl) open(data.signedUrl, "_blank", "noopener");
    else setEtat("Document introuvable.");
  }

  async function retirer(d: Doc) {
    const sb = supabaseNavigateur();
    const { error } = await sb.from("documents").delete().eq("id", d.id);
    if (error) return setEtat("Suppression impossible.");
    await sb.storage.from("documents").remove([d.chemin]);
    setDocs((l) => (l ?? []).filter((x) => x.id !== d.id));
  }

  const presents = new Set((docs ?? []).map((d) => d.type));
  return (
    <div className="grid gap-4">
      <div>
        <h3 className="font-display font-semibold">{titre}</h3>
        <p className="text-sm text-ink-3">Pas de CT ni d&apos;HistoVec au premier contact ? C&apos;est normal : ajoutez-les quand vous les recevez, ils restent avec le dossier.</p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {TYPES_DOCUMENTS.filter(([k]) => k !== "autre").map(([k, l]) => (
          <li key={k}>
            <button
              type="button"
              onClick={() => {
                setType(k);
                fichier.current?.click();
              }}
              className={cx("btn btn-sm gap-1.5", presents.has(k) && "border-ok/40 text-ok")}
            >
              <span aria-hidden="true">{presents.has(k) ? "✓" : "+"}</span> {l}
            </button>
          </li>
        ))}
        <li>
          <button type="button" onClick={() => (setType("autre"), fichier.current?.click())} className="btn btn-sm">
            + Autre
          </button>
        </li>
      </ul>
      <input
        ref={fichier}
        type="file"
        multiple
        hidden
        accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,.heic"
        onChange={(e) => {
          void ajouter(Array.from(e.target.files ?? []), type);
          e.target.value = "";
        }}
      />
      {docs && docs.length > 0 && (
        <ul className="grid gap-2">
          {docs.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line px-3 py-2 text-sm">
              <span className="min-w-0">
                <b className="font-medium">{NOMS[d.type] ?? "Document"}</b>
                <span className="block truncate text-xs text-ink-3">
                  {d.nom} · ajouté le {new Date(d.created_at).toLocaleDateString("fr-FR")}
                </span>
              </span>
              <span className="flex gap-2">
                <button type="button" onClick={() => ouvrir(d)} className="btn btn-sm">
                  Ouvrir
                </button>
                <button type="button" onClick={() => retirer(d)} className="btn btn-sm text-ink-3" aria-label={`Retirer ${d.nom}`}>
                  ✕
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <p role="status" aria-live="polite" className="text-sm text-ink-3">
        {etat}
      </p>
    </div>
  );
}
