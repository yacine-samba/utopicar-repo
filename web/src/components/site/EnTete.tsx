import Link from "next/link";
import { compteCourant } from "@/lib/compte";
import { Logo } from "./Logo";
import { LienNav } from "./LienNav";
import { MenuMobile } from "./MenuMobile";
import { BoutonTheme } from "./BoutonTheme";
import { themeSite } from "@/lib/theme";

// Deux entrées seulement : l'outil (bouton orange) et l'espace se trouvent à droite.
const LIENS = [
  { href: "/benef", label: "Benef" },
  { href: "/tarifs", label: "Tarifs" },
];

export async function EnTete() {
  const [compte, theme] = await Promise.all([compteCourant(), themeSite()]);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg0/80 backdrop-blur-md">
      <div className="wrap relative flex h-[68px] items-center gap-4 max-[359px]:gap-2">
        {/* sous 360 px, le nom à côté du logo se cache (le lien garde son nom) : le bouton d'action garde sa place, même texte agrandi */}
        <Link href="/" className="no-underline max-[359px]:[&_span.font-display]:sr-only" aria-label="Utopicar, accueil">
          <Logo />
        </Link>
        <nav aria-label="Principal" className="ml-4 hidden items-center gap-1 md:flex">
          {LIENS.map((l) => (
            <LienNav key={l.href} href={l.href}>
              {l.label}
            </LienNav>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <BoutonTheme initial={theme} className="max-md:hidden" />
          {compte ? (
            <Link href="/app" className="btn btn-o btn-sm whitespace-nowrap">
              Mon espace
            </Link>
          ) : (
            <>
              <Link href="/connexion" className="hidden rounded-full px-3.5 py-2 text-[15px] text-ink-2 hover:text-ink sm:inline-flex">
                Se connecter
              </Link>
              <Link href="/analyse" className="btn btn-o btn-sm whitespace-nowrap">
                <span>
                  Analyser<span className="hidden sm:inline"> une annonce</span>
                </span>
              </Link>
            </>
          )}
          <MenuMobile theme={theme} liens={LIENS} compte={compte ? { href: "/app", label: "Mon espace" } : { href: "/connexion", label: "Se connecter" }} />
        </div>
      </div>
    </header>
  );
}
