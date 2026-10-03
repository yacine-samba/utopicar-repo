-- Import d'une annonce par son lien (fonction `annonce`, acteur Apify) : une ligne par demande,
-- pour limiter le nombre d'imports par personne et suivre le coût. Écrit uniquement par la fonction (clé service).
create table if not exists public.imports_annonces (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  url text not null,
  statut text not null,
  cout_usd numeric(10, 5),
  created_at timestamptz not null default now()
);
create index if not exists imports_annonces_user_date_idx on public.imports_annonces (user_id, created_at desc);
alter table public.imports_annonces enable row level security;
revoke all on public.imports_annonces from anon, authenticated;
