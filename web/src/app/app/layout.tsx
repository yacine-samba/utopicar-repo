import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { compteCourant, type Compte } from "@/lib/compte";
import { comptesActifs } from "@/lib/supabase/config";
import { familleEspace, navEspace, nomFormule, texteRestantes } from "@/lib/espace";
import { centimes, formuleSuivante, prixParAnalyse } from "@/lib/offres";
import { Logo } from "@/components/site/Logo";
import { Ico } from "@/components/espace/Icones";
import { NavCote, NavMobile } from "@/components/espace/NavEspace";
import { CommandeK, SeuilMarge } from "@/components/espace/OutilsEspace";
import { BoutonAnalyser } from "@/components/espace/BoutonAnalyser";
import { AnalysesEnFond } from "@/components/espace/AnalysesEnFond";
import { NotificationsEspace } from "@/components/espace/Notification";
import { CadreEspace } from "@/components/espace/CadreEspace";
import { RepriseAchat } from "@/components/espace/RepriseAchat";
import { PreferencesEspace } from "@/components/espace/Preferences";
import { ProfilDepuisNavigateur } from "@/components/espace/ProfilDepuisNavigateur";
import { CodeEnAttente } from "@/components/compte/CodeOffert";
import { ProfilAnalyseFournisseur } from "@/components/analyse/ProfilAnalyse";

export const metadata: Metadata = { title: { default: "Mon espace", template: "%s · Mon espace Utopicar" }, robots: { index: false } };
// Espace personnel : toujours rendu à la demande (session, formule, quotas).
export const dynamic = "force-dynamic";

/** Bas du menu : le profil, avec la formule à côté. Un clic ouvre les paramètres (formule, mot de passe, guides…).
    Menu replié : l'avatar seul, et les intitulés en bulle au survol. */
function PiedNav({ c }: { c: Compte }) {
  const ligne = "a-bulle flex min-h-9 items-center gap-3 rounded-xl px-3 py-2 text-ink-3 hover:bg-glass hover:text-ink lg:group-data-[replie=true]/menu:size-11 lg:group-data-[replie=true]/menu:justify-center lg:group-data-[replie=true]/menu:p-0";
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 lg:group-data-[replie=true]/menu:justify-items-center">
      <Link href="/app/compte" className="a-bulle group flex min-w-0 items-center gap-3 rounded-2xl border border-line px-2.5 py-2 transition hover:border-o/40 hover:bg-glass lg:group-data-[replie=true]/menu:border-transparent lg:group-data-[replie=true]/menu:p-1">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-o/15 font-display font-semibold text-o2" aria-hidden="true">
          {(c.prenom || c.email).slice(0, 1).toUpperCase()}
        </span>
        <span className="grid min-w-0 flex-1 gap-0.5 lg:group-data-[replie=true]/menu:hidden">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-medium">{c.prenom || "Mon compte"}</span>
            <span className="max-w-[60%] shrink-0 truncate rounded-full border border-o/40 bg-o/10 px-2 py-px text-[11px] font-medium text-o2">{nomFormule(c)}</span>
          </span>
          <span className="truncate text-xs text-ink-3">{c.email}</span>
          <span className="truncate text-xs text-ink-3">{texteRestantes(c)}</span>
        </span>
        <span className="bulle-seule">Profil et paramètres · {nomFormule(c)}</span>
      </Link>
      <div className="grid gap-0.5 text-sm lg:group-data-[replie=true]/menu:justify-items-center">
        <Link href="/" className={ligne}>
          <Ico nom="site" className="size-4 shrink-0" /> <span className="bulle">Retour au site</span>
        </Link>
        <form action="/auth/deconnexion" method="post">
          <button type="submit" className={`${ligne} w-full text-left`}>
            <Ico nom="sortie" className="size-4 shrink-0" /> <span className="bulle">Se déconnecter</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default async function LayoutEspace({ children }: { children: ReactNode }) {
  if (!comptesActifs())
    return (
      <main id="contenu" className="wrap py-24 text-center">
        <h1 className="h-sec">Votre espace ouvre très bientôt</h1>
        <p className="mt-4 text-ink-2">
          <Link href="/" className="text-o2 underline underline-offset-4">Retour au site</Link>
        </p>
      </main>
    );
  const c = await compteCourant();
  if (!c) redirect("/connexion?next=/app");
  const entrees = navEspace(c);
  const benef = familleEspace(c) === "benef";
  // analyses épuisées : la formule suivante (moins chère à l'analyse que les crédits), payée en un clic
  const fs = c.illimite ? null : formuleSuivante(c.offre.id, benef ? "benef" : "particulier");
  const pa = fs ? prixParAnalyse(fs) : null;
  const suite = fs ? { l: `Passer à ${fs.nom}${pa ? ` (${centimes(pa)} l'analyse)` : ""}`, href: `/app/payer?produit=${fs.id}` } : null;

  return (
    <PreferencesEspace favoris={c.favoris}>
    <ProfilAnalyseFournisseur initial={c.profilAnalyse}>
    <ProfilDepuisNavigateur />
    <CodeEnAttente />
    <AnalysesEnFond mode={benef && c.offre.famille === "benef" ? "benef" : "particulier"} actif={!benef || c.offre.famille === "benef"} maxPhotos={c.offre.photos} ville={c.ville} suite={suite}>
    <CadreEspace
      logo={
        <Link href="/app" className="block px-1" aria-label="Mon espace, accueil">
          <Logo sous={benef ? "Benef" : undefined} />
        </Link>
      }
      menu={
        <>
          <BoutonAnalyser className="min-h-10 gap-2 whitespace-nowrap px-3.5 py-1.5 text-[13px] shadow-[0_8px_22px_-14px_rgb(255_90_31/0.9)]" icone="size-4" />
          <div className="grid w-full flex-1 content-start gap-3">
            <NavCote entrees={entrees} />
            <div className="grid gap-2 lg:group-data-[replie=true]/menu:hidden">
              {benef && <SeuilMarge />}
              <CommandeK entrees={entrees} />
            </div>
          </div>
          <PiedNav c={c} />
        </>
      }
    >
      <div className="min-w-0">
        <NavMobile
          entrees={entrees}
          pied={<PiedNav c={c} />}
          gauche={
            <Link href="/app" aria-label="Mon espace, accueil">
              <Logo sous={benef ? "Benef" : undefined} />
            </Link>
          }
          droite={
            <Link href="/app/compte" className="rounded-full border border-line-2 px-3 py-1.5 text-xs text-ink-2">
              {c.illimite ? (
                "Illimité"
              ) : (
                <>
                  <b className="num text-ink">{c.restantes}</b> analyse{c.restantes > 1 ? "s" : ""}
                </>
              )}
            </Link>
          }
        />
        <main id="contenu" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 outline-none sm:px-6 lg:px-10 lg:pb-16 lg:pt-10">
          <RepriseAchat actuelle={c.offre.id} abonne={!!c.abonnement && ["active", "trialing", "past_due"].includes(c.abonnement.statut)} />
          {children}
        </main>
        <NotificationsEspace />
      </div>
    </CadreEspace>
    </AnalysesEnFond>
    </ProfilAnalyseFournisseur>
    </PreferencesEspace>
  );
}
