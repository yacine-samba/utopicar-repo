/** Assemble des classes CSS conditionnelles. Utilisable côté serveur et client. */
export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

// 16 px sur téléphone : en dessous, Safari sur iPhone zoome la page à chaque champ touché.
export const inputCls =
  "w-full rounded-xl border border-line-2 bg-champ px-3 py-2.5 text-ink max-sm:text-base placeholder:text-ink-3/75 outline-none transition focus:border-o/60 focus:ring-2 focus:ring-o/20";
