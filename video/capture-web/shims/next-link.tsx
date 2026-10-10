/* Remplace next/link hors de Next : un simple <a>, avec les mêmes attributs (classes, style, aria-*, target…).
   Les options propres au routeur de Next (prefetch, replace, scroll…) sont ignorées. */
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

type Url = string | { pathname?: string | null; query?: Record<string, string> | string | null; hash?: string | null };
type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: Url;
  children?: ReactNode;
  prefetch?: unknown;
  replace?: unknown;
  scroll?: unknown;
  shallow?: unknown;
  passHref?: unknown;
  legacyBehavior?: unknown;
  locale?: unknown;
  onNavigate?: unknown;
};

const versTexte = (h: Url) => {
  if (typeof h === "string") return h;
  const q = h.query ? (typeof h.query === "string" ? h.query : new URLSearchParams(h.query).toString()) : "";
  return `${h.pathname ?? ""}${q ? `?${q}` : ""}${h.hash ? `#${h.hash.replace(/^#/, "")}` : ""}`;
};

const Link = forwardRef<HTMLAnchorElement, Props>(function Link(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { href, prefetch, replace, scroll, shallow, passHref, legacyBehavior, locale, onNavigate, ...reste },
  ref,
) {
  return <a ref={ref} href={versTexte(href)} {...reste} />;
});

export default Link;
