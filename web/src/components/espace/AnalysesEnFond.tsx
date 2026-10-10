"use client";
/* Analyses en arrière-plan : on colle un lien dans la fenêtre « Analyser une annonce », la fenêtre se ferme et l'on continue
   à travailler (parc, recherche, rapports). L'import, les photos et l'analyse tournent ici, dans la mise en page de l'espace
   (elle reste en place d'une page à l'autre) ; une notification annonce la fin avec un lien vers le rapport. */
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { lienImportable, siteAnnonce, texteDepuisImport } from "@/lib/analyse/import";
import { depuisDataUrl, type PhotoLocale } from "@/lib/photos-analyse";
import { SUPABASE_CLE, SUPABASE_URL } from "@/lib/supabase/config";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { useNotification } from "./Notification";
import { useProfilAnalyse } from "../analyse/ProfilAnalyse";

type EnCours = { id: number; lien: string; etape: "import" | "analyse" };
type Ctx = { lancer: (lien: string) => Promise<string | null>; actif: boolean; enCours: EnCours[] };

const Contexte = createContext<Ctx | null>(null);
export const useAnalyseEnFond = () => useContext(Contexte);

const ERREURS: Record<string, string> = {
  lien: "Ce lien n'est pas celui d'une annonce Leboncoin, La Centrale ou AutoScout24.",
  introuvable: "Annonce introuvable : elle a peut-être été retirée ou vendue.",
  trop: "Vous avez importé beaucoup d'annonces aujourd'hui. Réessayez demain, ou collez le texte de l'annonce dans la page Analyser.",
  quota: "Vous n'avez plus d'analyse disponible ce mois-ci.",
};


const rien = () => () => {};

export function AnalysesEnFond({ children, mode, maxPhotos, ville, actif }: { children: ReactNode; mode: "particulier" | "benef"; maxPhotos: number; ville: string; actif: boolean }) {
  const router = useRouter();
  const { notifier, element } = useNotification();
  // ville de départ et de revente : celle du profil d'analyse, sinon celle du compte
  const villeProfil = useProfilAnalyse().profil.ville || ville;
  const [enCours, setEnCours] = useState<EnCours[]>([]);
  const monte = useSyncExternalStore(rien, () => true, () => false);

  /** Lance l'analyse ; renvoie un message d'erreur immédiat (lien refusé), sinon null : la suite arrive par notification. */
  const lancer = useCallback(
    async (brut: string): Promise<string | null> => {
      const lien = lienImportable(brut);
      if (!lien) return ERREURS.lien;
      if (!SUPABASE_URL) return "L'import par lien n'est pas disponible ici : collez le texte de l'annonce dans la page Analyser.";
      const { data } = await supabaseNavigateur().auth.getSession();
      const jeton = data.session?.access_token;
      if (!jeton) return "Votre session a expiré : reconnectez-vous.";
      const id = Date.now();
      const etape = (e: EnCours["etape"]) => setEnCours((l) => l.map((x) => (x.id === id ? { ...x, etape: e } : x)));
      setEnCours((l) => [...l, { id, lien, etape: "import" }]);
      const echec = (texte: string, quota = false): null => {
        notifier({ titre: "L'analyse n'a pas abouti", texte, ton: "warn", action: quota ? { l: "Acheter des crédits", onClick: () => router.push("/app/credits") } : { l: "Réessayer dans la page Analyser", onClick: () => router.push(`/app/analyser?lien=${encodeURIComponent(lien)}`) } });
        return null;
      };
      try {
        const r = await fetch(`${SUPABASE_URL}/functions/v1/annonce`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${jeton}`, apikey: SUPABASE_CLE },
          body: JSON.stringify({ url: lien }),
        });
        const j = await r.json().catch(() => null);
        if (!r.ok || !j?.ok) return echec(ERREURS[j?.erreur] ?? `Lecture de l'annonce ${siteAnnonce(lien)} impossible pour le moment.`, r.status === 402);
        etape("analyse");
        const texte = texteDepuisImport(j);
        const photos = maxPhotos > 0 ? (await Promise.all((j.photos as string[]).slice(0, maxPhotos).map(depuisDataUrl))).filter((x): x is PhotoLocale => !!x) : [];
        const a = await fetch("/api/analyse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode,
            texte,
            ville: villeProfil,
            photos: photos.map((p) => ({ media_type: "image/jpeg", data: p.data })),
            photosLiens: (Array.isArray(j.liens) ? j.liens : []).filter((u: string) => /^https:\/\//.test(u)).slice(0, 30),
            lienAnnonce: j.url,
            vendeur: j.vendeur ?? null,
          }),
        });
        const res = await a.json().catch(() => null);
        if (!a.ok || !res) return echec(res?.erreur ?? "L'analyse a échoué, réessayez.", a.status === 402);
        const v = res.ia?.vehicule;
        const nom = [v?.marque, v?.modele, v?.version].filter(Boolean).join(" ") || res.faits?.titre || "Annonce";
        notifier({
          titre: `Analyse terminée : ${nom}`,
          texte: res.rapportId ? "Le rapport est enregistré dans vos rapports." : "Le résultat est prêt.",
          action: res.rapportId ? { l: "Voir le rapport", onClick: () => router.push(`/app/rapports/${res.rapportId}`) } : undefined,
        });
        router.refresh(); // compteur d'analyses et derniers rapports à jour
      } catch {
        echec("Connexion impossible. Vérifiez votre réseau et réessayez.");
      } finally {
        setEnCours((l) => l.filter((x) => x.id !== id));
      }
      return null;
    },
    [maxPhotos, mode, notifier, router, villeProfil],
  );

  return (
    <Contexte.Provider value={{ lancer, actif, enCours }}>
      {children}
      {element}
      {monte &&
        enCours.length > 0 &&
        createPortal(
          <div role="status" aria-live="polite" className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-[60] flex items-center gap-3 rounded-full border border-o/40 bg-bg1 py-2 pl-3 pr-4 text-sm shadow-[0_16px_40px_-10px_rgb(0_0_0/0.8)] lg:bottom-6">
            <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-o/30 border-t-o" aria-hidden="true" />
            {enCours.length > 1 ? `${enCours.length} analyses en cours` : enCours[0].etape === "import" ? "Lecture de l'annonce…" : "Analyse en cours…"}
            <span className="text-ink-3">vous pouvez continuer</span>
          </div>,
          document.body,
        )}
    </Contexte.Provider>
  );
}
