import Link from "next/link";
import { compteCourant } from "@/lib/compte";
import { Logo } from "./Logo";
import { LienNav } from "./LienNav";
import { MenuMobile } from "./MenuMobile";

// Deux entrées seulement : l'outil (bouton orange) et l'espace se trouvent à droite.
const LIENS = [
  { href: "/benef", label: "Benef" },
  { href: "/tarifs", label: "Tarifs" },
];

export async function EnTete() {
  const compte = await compteCourant();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg0/80 backdrop-blur-md">
      <div className="wrap relative flex h-[68px] items-center gap-4">
        <Link href="/" className="no-underline" aria-label="Utopicar, accueil">
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
                Estimer<span className="hidden sm:inline">&nbsp;une affaire</span>
              </Link>
            </>
          )}
          <MenuMobile liens={LIENS} compte={compte ? { href: "/app", label: "Mon espace" } : { href: "/connexion", label: "Se connecter" }} />
        </div>
      </div>
    </header>
  );
}
