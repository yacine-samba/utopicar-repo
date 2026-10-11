import Link from "next/link";
import { redirect } from "next/navigation";
import { compteCourant } from "@/lib/compte";
import { comptesActifs } from "@/lib/supabase/config";
import { suiteSure } from "@/lib/suite";
import { OFFRES, type OffreId } from "@/lib/offres";
import { FormulaireCompte } from "./FormulaireCompte";
import { ConnexionSociale } from "./ConnexionSociale";
import { fournisseursActifs } from "@/lib/fournisseurs";
import { TroisTemps } from "../accueil/TroisTemps";
import { PreuveAnimee } from "../accueil/PreuveAnimee";

/** Écran commun inscription / connexion. À l'inscription : le parcours en 3 temps (on en est au premier)
    et, sur ordinateur, la carte animée qui montre ce qu'on obtient juste après. */
export async function PageCompte({ mode, params }: { mode: "inscription" | "connexion"; params: { next?: string; offre?: string; erreur?: string } }) {
  const suite = suiteSure(params.next, "/app");
  if (await compteCourant()) redirect(suite);
  const offre = params.offre && params.offre in OFFRES ? OFFRES[params.offre as OffreId] : null;
  const autre = `/${mode === "inscription" ? "connexion" : "inscription"}?next=${encodeURIComponent(suite)}${offre ? `&offre=${offre.id}` : ""}`;
  return (
    <div className="wrap grid gap-8 py-10 sm:py-14 lg:grid-cols-[1fr_440px] lg:items-start lg:gap-10">
      <div className="max-w-xl">
        <span className="kicker">{mode === "inscription" ? "Compte gratuit" : "Bon retour"}</span>
        <h1 className="h-sec mt-5">{mode === "inscription" ? <>Créez votre compte <span className="it">en 30 secondes</span></> : <>Connectez-vous <span className="it">à votre compte</span></>}</h1>
        <p className="mt-4 text-lg text-ink-2">
          {offre
            ? `Ensuite, vous pourrez choisir la formule ${offre.nom}.`
            : mode === "inscription"
              ? "Votre première analyse est offerte, sans carte bancaire."
              : "Retrouvez vos analyses, vos rapports et votre formule."}
        </p>
        {mode === "inscription" && (
          <div className="mt-7">
            <TroisTemps etapes={[["compte", "Votre compte"], ["lien", "Collez une annonce"], ["verdict", "Votre verdict"]]} actif={0} />
          </div>
        )}
        {mode === "inscription" && (
          <ul className="mt-7 hidden gap-2.5 text-ink-2 lg:grid">
            {["Une analyse complète offerte", "Vos analyses gardées dans votre compte", "Aucune publicité, aucune revente de données"].map((t) => (
              <li key={t} className="flex gap-2.5">
                <span className="text-ok" aria-hidden="true">✓</span>
                {t}
              </li>
            ))}
          </ul>
        )}
        {mode === "inscription" && (
          <div className="mt-10 hidden max-w-[360px] lg:block">
            <PreuveAnimee />
          </div>
        )}
      </div>
      <div className="carte p-6 sm:p-8">
        <h2 className="mb-5 font-display text-xl font-semibold">{mode === "inscription" ? "Inscription" : "Connexion"}</h2>
        {params.erreur === "lien" && (
          <p role="alert" className="mb-4 rounded-xl border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn">
            Ce lien n&apos;est plus valable. Connectez-vous ou demandez-en un nouveau.
          </p>
        )}
        {comptesActifs() && <div className="mb-5"><ConnexionSociale fournisseurs={await fournisseursActifs()} suite={suite} inscription={mode === "inscription"} /></div>}
        <FormulaireCompte mode={mode} suite={suite} actif={comptesActifs()} />
        <p className="mt-6 border-t border-line pt-5 text-center text-sm text-ink-3">
          {mode === "inscription" ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
          <Link href={autre} className="font-medium text-o2 underline underline-offset-4">
            {mode === "inscription" ? "Se connecter" : "Créer un compte gratuit"}
          </Link>
        </p>
      </div>
    </div>
  );
}
