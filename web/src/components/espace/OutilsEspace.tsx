"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { EntreeNav } from "@/lib/espace";
import { DEFAUTS_PRO, eur, type ParamsPro } from "@/lib/analyse/couts";
import { cx, inputCls } from "@/lib/cx";
import { useReglages } from "../ui";

/** Seuil de marge en cours (réglage de l'outil Benef), affiché dans le menu. */
export function SeuilMarge() {
  const [reg] = useReglages<ParamsPro>("utp-pro", DEFAUTS_PRO);
  return (
    <Link href="/app/analyser#reglages" className="flex items-center justify-between rounded-xl border border-line px-3 py-2 text-sm text-ink-2 hover:text-ink">
      Seuil de marge <b className="num text-ink">{eur(reg.margeMin)}</b>
    </Link>
  );
}

/** Palette Ctrl K (Cmd K sur Mac) : aller à une page de l'espace au clavier. */
export function CommandeK({ entrees }: { entrees: EntreeNav[] }) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const champ = useRef<HTMLInputElement>(null);
  const items = useMemo(() => {
    const tous = [...entrees.map((e) => ({ l: e.label, href: e.href })), { l: "Retour au site", href: "/" }];
    const t = q.trim().toLowerCase();
    return t ? tous.filter((x) => x.l.toLowerCase().includes(t)) : tous;
  }, [entrees, q]);
  useEffect(() => {
    const f = (ev: KeyboardEvent) => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") {
        ev.preventDefault();
        setOuvert((v) => !v);
        setQ("");
        setSel(0);
      } else if (ev.key === "Escape") setOuvert(false);
    };
    addEventListener("keydown", f);
    return () => removeEventListener("keydown", f);
  }, []);
  useEffect(() => {
    if (ouvert) champ.current?.focus();
  }, [ouvert]);
  const aller = (href: string) => {
    setOuvert(false);
    router.push(href);
  };
  return (
    <>
      <button type="button" onClick={() => setOuvert(true)} className="hidden items-center justify-between rounded-xl border border-line px-3 py-2 text-sm text-ink-3 hover:text-ink lg:flex">
        Aller à… <kbd className="rounded border border-line-2 px-1.5 text-xs">Ctrl K</kbd>
      </button>
      {ouvert && (
        <div className="fixed inset-0 z-50 grid place-items-start bg-black/60 px-4 pt-[15vh]" onClick={() => setOuvert(false)}>
          <div role="dialog" aria-modal="true" aria-label="Aller à une page" className="carte mx-auto w-full max-w-md p-3" onClick={(ev) => ev.stopPropagation()}>
            <input
              ref={champ}
              value={q}
              onChange={(ev) => {
                setQ(ev.target.value);
                setSel(0);
              }}
              onKeyDown={(ev) => {
                if (ev.key === "ArrowDown") setSel((s) => Math.min(items.length - 1, s + 1));
                if (ev.key === "ArrowUp") setSel((s) => Math.max(0, s - 1));
                if (ev.key === "Enter" && items[sel]) aller(items[sel].href);
              }}
              placeholder="Rechercher une page…"
              aria-label="Rechercher une page"
              className={inputCls}
            />
            <ul className="mt-2 grid max-h-80 gap-0.5 overflow-y-auto">
              {items.map((x, i) => (
                <li key={x.href}>
                  <button type="button" onClick={() => aller(x.href)} onMouseEnter={() => setSel(i)} className={cx("w-full rounded-lg px-3 py-2 text-left text-sm", i === sel ? "bg-o/15 text-ink" : "text-ink-2")}>
                    {x.l}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
