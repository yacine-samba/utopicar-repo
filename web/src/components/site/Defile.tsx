/** Bandeau défilant décoratif ; le contenu est lisible une seule fois par les lecteurs d'écran. */
export function Defile({ items, label, inverse = false }: { items: string[]; label: string; inverse?: boolean }) {
  return (
    <div className="relative overflow-hidden py-3 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
      <ul className="sr-only" aria-label={label}>
        {items.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
      <div className={`flex w-max gap-3 ${inverse ? "animate-[defile_60s_linear_infinite_reverse]" : "animate-[defile_50s_linear_infinite]"}`} aria-hidden="true">
        {[...items, ...items].map((m, i) => (
          <span key={i} className="flex items-center gap-2 whitespace-nowrap rounded-full border border-line px-4 py-2 text-sm text-ink-2">
            <i className="size-1.5 rounded-full bg-o" />
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
