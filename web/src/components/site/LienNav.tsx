"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function LienNav({ href, children }: { href: string; children: React.ReactNode }) {
  const chemin = usePathname();
  const actif = href === "/" ? chemin === "/" : chemin === href || chemin.startsWith(href + "/");
  return (
    <Link href={href} aria-current={actif ? "page" : undefined} className="rounded-full px-3.5 py-2 text-[15px] text-ink-2 transition hover:bg-glass hover:text-ink aria-[current=page]:text-ink aria-[current=page]:bg-glass">
      {children}
    </Link>
  );
}
