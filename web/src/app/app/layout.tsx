import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { compteCourant, type Compte } from "@/lib/compte";
import { comptesActifs } from "@/lib/supabase/config";
import { familleEspace, navEspace, nomFormule } from "@/lib/espace";
import { Logo } from "@/components/site/Logo";
import { Ico } from "@/components/espace/Icones";
import { NavCote, NavMobile } from "@/components/espace/NavEspace";

export const metadata: Metadata = { title: { default: "Mon espace", template: "%s · Mon espace Utopicar" }, robots: { index: false } };
// Espace personnel : toujours rendu à la demande (session, formule, quotas).
export const dynamic = "force-dynamic";

function CarteFormule({ c }: { c: Compte }) {
  const o = c.offre;
  const part = Math.min(100, (c.utilisees / Math.max(1, o.analyses)) * 100);
  return (
    <div className="rounded-2xl border border-line bg-glass p-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs uppercase tracking-[0.12em] text-ink-3">Formule</span>
        <Link href="/app/compte#formule" className="text-xs text-o2 underline-offset-4 hover:underline">
          {o.id === "pro" ? "Gérer" : "Changer"}
        </Link>
      </div>
      <p className="mt-1 font-display text-lg font-semibold">{nomFormule(c)}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className={`h-full rounded-full ${c.restantes <= Math.max(1, o.analyses * 0.1) ? "bg-warn" : "bg-gradient-to-r from-o to-o2"}`} style={{ width: `${part}%` }} />
      </div>
      <p className="mt-2 text-sm text-ink-3">
        <b className="num font-semibold text-ink">{c.restantes}</b> analyse{c.restantes > 1 ? "s" : ""} restante{c.restantes > 1 ? "s" : ""} {o.parMois ? "ce mois" : ""}
      </p>
    </div>
  );
}

function PiedNav({ c }: { c: Compte }) {
  return (
    <div className="grid gap-3">
      <CarteFormule c={c} />
      <div className="flex items-center gap-3 px-1">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-o/15 font-display font-semibold text-o2" aria-hidden="true">
          {(c.prenom || c.email).slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{c.prenom || "Mon compte"}</span>
          <span className="block truncate text-xs text-ink-3">{c.email}</span>
        </span>
      </div>
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
    <div className="min-h-dvh lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 overflow-y-auto border-r border-line bg-bg0/60 px-4 py-5 lg:flex">
        <Link href="/app" className="px-1" aria-label="Mon espace, accueil">
          <Logo sous={benef ? "Benef" : undefined} />
        </Link>
        <div className="flex-1">
          <NavCote entrees={entrees} />
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
            <Link href="/app/compte#formule" className="rounded-full border border-line-2 px-3 py-1.5 text-xs text-ink-2">
              <b className="num text-ink">{c.restantes}</b> analyse{c.restantes > 1 ? "s" : ""}
            </Link>
          }
        />
        <main id="contenu" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 outline-none sm:px-6 lg:px-10 lg:pb-16 lg:pt-10">
          {children}
        </main>
      </div>
    </div>
  );
}
