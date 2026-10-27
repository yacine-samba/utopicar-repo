/** Bandeau défilant décoratif, en boucle continue à toute largeur d'écran (zoom arrière compris) :
    deux groupes identiques, chacun au moins aussi large que le bandeau, glissent ensemble d'une largeur de groupe.
    Le contenu est lu une seule fois par les lecteurs d'écran. */
export function Defile({ items, label, inverse = false }: { items: string[]; label: string; inverse?: boolean }) {
  // Deux fois la liste par groupe : sur grand écran, les pastilles restent serrées au lieu de s'espacer.
  const groupe = [...items, ...items];
  const anim = inverse ? "animate-[defile_70s_linear_infinite_reverse]" : "animate-[defile_60s_linear_infinite]";
  return (
    <div className="defile relative flex overflow-hidden py-3 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
      <ul className="sr-only" aria-label={label}>
        {items.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
      {[0, 1].map((g) => (
        <div key={g} className={`flex min-w-full shrink-0 items-center justify-around gap-3 pr-3 ${anim}`} aria-hidden="true">
          {groupe.map((m, i) => (
            <span key={i} className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-line px-4 py-2 text-sm text-ink-2">
              <i className="size-1.5 rounded-full bg-o" />
              {m}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
