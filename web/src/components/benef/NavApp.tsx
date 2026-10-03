"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type Onglet = { href: string; label: string; ouvert: boolean };

export function NavApp({ onglets }: { onglets: Onglet[] }) {
  const chemin = usePathname();
  return (
    <nav aria-label="Espace Benef" className="-mx-1 flex gap-1 overflow-x-auto pb-1">
      {onglets.map((o) => {
        const actif = o.href === "/app" ? chemin === "/app" : chemin.startsWith(o.href);
        return (
          <Link
            key={o.href}
            href={o.href}
            aria-current={actif ? "page" : undefined}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-transparent px-4 py-2 text-sm text-ink-2 hover:bg-glass hover:text-ink aria-[current=page]:border-o/40 aria-[current=page]:bg-o/10 aria-[current=page]:text-ink"
          >
            {o.label}
            {!o.ouvert && (
              <span className="text-[11px] text-ink-3" aria-label="(formule supérieure)">
                🔒
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
