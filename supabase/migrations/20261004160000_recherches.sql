-- Recherches du marché enregistrées : une par véhicule (marque, modèle, génération), avec ses derniers filtres.
-- « active » : la recherche reste ouverte en onglet sur la page Recherche, même quand on en lance une autre.
create table if not exists public.recherches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  cle text not null check (char_length(cle) <= 120),
  nom text not null check (char_length(nom) <= 160),
  criteres jsonb not null default '{}'::jsonb check (pg_column_size(criteres) < 4000),
  active boolean not null default true,
  trouvees integer,
  sous_cote integer,
  meilleure jsonb check (meilleure is null or pg_column_size(meilleure) < 2000),
  created_at timestamptz not null default now(),
  derniere_le timestamptz not null default now(),
  unique (user_id, cle)
);
create index if not exists recherches_user_date on public.recherches (user_id, derniere_le desc);

alter table public.recherches enable row level security;
create policy "recherches : lecture des siennes" on public.recherches for select to authenticated using (user_id = (select auth.uid()));
create policy "recherches : ajout des siennes" on public.recherches for insert to authenticated with check (user_id = (select auth.uid()));
create policy "recherches : modification des siennes" on public.recherches for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "recherches : suppression des siennes" on public.recherches for delete to authenticated using (user_id = (select auth.uid()));
grant select, insert, update, delete on public.recherches to authenticated;
-- Au plus 8 onglets ouverts et 30 recherches par personne : le ménage est fait par la route /api/marche/recherche.
