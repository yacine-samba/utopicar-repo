/** Liste d'étiquettes fixe (modèles analysés, pièges repérés) : rien ne défile tout seul. Sur téléphone, une seule
    ligne qu'on fait glisser du doigt ; à partir de la tablette, elle passe à la ligne et se lit d'un coup d'œil.
    `intitule` : l'intitulé discret affiché au-dessus, quand aucun titre de section ne le porte déjà. */
export function Etiquettes({ items, label, intitule = false }: { items: string[]; label: string; intitule?: boolean }) {
  return (
    <div className="wrap">
      {intitule && <p className="mb-3 text-center text-sm text-ink-3">{label}</p>}
      <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-auto sm:max-w-4xl sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0" aria-label={label}>
        {items.map((m) => (
          <li key={m} className="shrink-0 whitespace-nowrap rounded-full border border-line px-3 py-1.5 text-sm text-ink-2">
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}
