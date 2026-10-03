/** Assemble des classes CSS conditionnelles. Utilisable côté serveur et client. */
export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export const inputCls =
  "w-full rounded-xl border border-line-2 bg-black/30 px-3 py-2.5 text-ink placeholder:text-ink-3 outline-none transition focus:border-o/60 focus:ring-2 focus:ring-o/20";
