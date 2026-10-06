import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { compteCourant, type Compte } from "@/lib/compte";
import { comptesActifs } from "@/lib/supabase/config";
import { familleEspace, navEspace, nomFormule, texteRestantes } from "@/lib/espace";
import { Logo } from "@/components/site/Logo";
import { Ico } from "@/components/espace/Icones";
import { NavCote, NavMobile } from "@/components/espace/NavEspace";
import { CommandeK, SeuilMarge } from "@/components/espace/OutilsEspace";
import { BoutonAnalyser } from "@/components/espace/BoutonAnalyser";
import { AnalysesEnFond } from "@/components/espace/AnalysesEnFond";
import { PreferencesEspace } from "@/components/espace/Preferences";

export const metadata: Metadata = { title: { default: "Mon espace", template: "%s · Mon espace Utopicar" }, robots: { index: false } };
// Espace personnel : toujours rendu à la demande (session, formule, quotas).
export const dynamic = "force-dynamic";

/** Bas du menu : le profil, avec la formule à côté. Un clic ouvre les paramètres (formule, mot de passe, guides…). */
function PiedNav({ c }: { c: Compte }) {
  return (
    <div className="grid gap-3">
      <Link href="/app/compte" className="group flex items-center gap-3 rounded-2xl border border-line px-2.5 py-2 transition hover:border-o/40 hover:bg-glass" title="Profil et paramètres">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-o/15 font-display font-semibold text-o2" aria-hidden="true">
          {(c.prenom || c.email).slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{c.prenom || "Mon compte"}</span>
            <span className="shrink-0 rounded-full border border-o/40 bg-o/10 px-2 py-px text-[11px] font-medium text-o2">{nomFormule(c)}</span>
          </span>
          <span className="block truncate text-xs text-ink-3">{c.email}</span>
          <span className="block truncate text-xs text-ink-3">{texteRestantes(c)}</span>
        </span>
      </Link>
      <div className="grid gap-0.5 text-sm">
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-ink-3 hover:bg-glass hover:text-ink">
          <Ico nom="site" className="size-4" /> Retour au site
        </Link>
        <form action="/auth/deconnexion" method="post">
          <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-ink-3 hover:bg-glass hover:text-ink">
            <Ico nom="sortie" className="size-4" /> Se déconnecter
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

  return (
    <PreferencesEspace favoris={c.favoris}>
    <AnalysesEnFond mode={benef && c.offre.famille === "benef" ? "benef" : "particulier"} actif={!benef || c.offre.famille === "benef"} maxPhotos={c.offre.photos} ville={c.ville}>
    <div className="min-h-dvh lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-5 overflow-y-auto border-r border-line bg-bg0/60 px-4 py-5 lg:flex">
        <Link href="/app" className="px-1" aria-label="Mon espace, accueil">
          <Logo sous={benef ? "Benef" : undefined} />
        </Link>
        <BoutonAnalyser className="min-h-9 gap-2 whitespace-nowrap px-3.5 py-1.5 text-[13px] shadow-[0_8px_22px_-14px_rgb(255_90_31/0.9)]" icone="size-4" />
        <div className="grid flex-1 content-start gap-3">
          <NavCote entrees={entrees} />
          <div className="grid gap-2">
            {benef && <SeuilMarge />}
            <CommandeK entrees={entrees} />
          </div>
        </div>
        <PiedNav c={c} />
      </aside>

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
          {children}
        </main>
      </div>
    </div>
    </AnalysesEnFond>
    </PreferencesEspace>
  );
}
