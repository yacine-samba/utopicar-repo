"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAUTS_PRO, type Analyse, type ParamsPro } from "@/lib/analyse/couts";
import { Saisie } from "../Saisie";
import { Champ, inputCls, useReglages } from "../ui";
import { Reglages, ResultatBenef } from "./ResultatBenef";
import { RapportComplet } from "./RapportComplet";
import { AjouterParc } from "./AjouterParc";
import { EnTeteRapport } from "../analyse/EnTeteRapport";

export function OutilBenef({ maxPhotos, parc, villeCompte, lienInitial, restantes = null }: { maxPhotos: number; parc: boolean; villeCompte: string; lienInitial?: string; restantes?: number | null }) {
  const [reg, setReg] = useReglages<ParamsPro>("utp-pro", { ...DEFAUTS_PRO, ville: villeCompte || DEFAUTS_PRO.ville });
  const router = useRouter();
  const [a, setA] = useState<Analyse | null>(null);
  const [prix, setPrix] = useState("");

  if (a) {
    const v = a.ia?.vehicule;
    const titre = [v?.marque, v?.modele, v?.version].filter(Boolean).join(" ") || a.faits.titre || "Annonce";
    const entete = (a.photosUrls?.length || a.lien) ? (
      <EnTeteRapport titre={titre} prix={a.faits.prix ?? v?.prix ?? null} photos={a.photosUrls ?? []} lien={a.lien ?? null} vendeur={a.vendeur ?? null} maxPhotos={30} date="" retour={{ onClick: () => (setA(null), scrollTo({ top: 0 })), l: "Nouvelle analyse" }} />
    ) : null;
    if (a.rapport)
      return (
        <div className="grid gap-4">
          {entete}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-3">{a.rapportId ? "Rapport enregistré dans vos rapports." : ""}</p>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => {
                setA(null);
                scrollTo({ top: 0 });
              }}
            >
              Analyser une autre annonce
            </button>
          </div>
          <RapportComplet a={a} r={a.rapport} reg={reg} offre={a.offre ?? "starter"} id={a.rapportId} parc={parc} lien={a.lien} />
        </div>
      );
    return (
      <div className="grid gap-4">
      {entete}
      <ResultatBenef
        a={a}
        reg={reg}
        prixInit={prix}
        onNouvelle={() => {
          setA(null);
          scrollTo({ top: 0 });
        }}
        actions={
          a.rapportId ? (
            <>
              <Link href={`/app/rapports/${a.rapportId}`} className="btn">
                Ouvrir le rapport enregistré
              </Link>
              {parc && <AjouterParc rapportId={a.rapportId} titre={titre} prix={a.faits.prix ?? v?.prix ?? null} />}
            </>
          ) : null
        }
      />
      </div>
    );
  }
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-[clamp(28px,5vw,42px)] font-semibold leading-tight tracking-tight">Analyser une annonce</h1>
        <p className="mt-2 max-w-2xl text-ink-2">Le rapport calcule ce qu&apos;il vous resterait une fois la voiture revendue, et le prix à ne pas dépasser. Il est enregistré dans vos rapports.</p>
      </div>
      <div className="carte p-5 sm:p-7">
        <Saisie
          key={reg.ville}
          mode="benef"
          maxPhotos={maxPhotos}
          restantes={restantes}
          villeInitiale={reg.ville}
          villeLabel="Ville de départ et de revente"
          villeAide="Sert au trajet et à la cote de revente."
          bouton="Analyser l'annonce"
          retour="/app/analyser"
          lienInitial={lienInitial}
          enPlus={
            <Champ label="Prix envisagé (€)" aide="Facultatif : sinon, le prix de l'annonce.">
              <input value={prix} onChange={(e) => setPrix(e.target.value)} inputMode="numeric" placeholder="ex. 6 500" className={inputCls} />
            </Champ>
          }
          onResultat={(r, ville) => {
            setReg({ ville });
            // rapport enregistré (sans prix envisagé à tester) : la page complète s'ouvre, photos d'abord
            if (r.rapportId && !prix.trim()) return router.push(`/app/rapports/${r.rapportId}`);
            setA(r);
            scrollTo({ top: 0 });
          }}
        />
      </div>
      <div id="reglages" className="scroll-mt-24">
        <Reglages reg={reg} setReg={setReg} />
      </div>
    </div>
  );
}
