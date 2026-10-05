-- Recherches du marché : réservées à Benef Pro (et illimité) jusque dans la base, pas seulement dans l'interface.
alter policy "recherches : lecture des siennes" on public.recherches using (user_id = (select auth.uid()) and public.a_offre(array['pro']));
alter policy "recherches : ajout des siennes" on public.recherches with check (user_id = (select auth.uid()) and public.a_offre(array['pro']));
alter policy "recherches : modification des siennes" on public.recherches using (user_id = (select auth.uid()) and public.a_offre(array['pro'])) with check (user_id = (select auth.uid()) and public.a_offre(array['pro']));
alter policy "recherches : suppression des siennes" on public.recherches using (user_id = (select auth.uid()));

-- Journal : chaque recherche lancée, avec ses filtres exacts (la table « recherches » garde une ligne par véhicule).
create table if not exists public.recherches_journal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  recherche_id uuid references public.recherches (id) on delete set null,
  nom text not null check (char_length(nom) <= 160),
  marque text not null check (char_length(marque) <= 40),
  modele text not null check (char_length(modele) <= 60),
  gen text check (gen is null or char_length(gen) <= 20),
  criteres jsonb not null default '{}'::jsonb check (pg_column_size(criteres) < 4000),
  trouvees integer,
  sous_cote integer,
  created_at timestamptz not null default now()
);
create index if not exists recherches_journal_user_date on public.recherches_journal (user_id, created_at desc);
create index if not exists recherches_journal_recherche on public.recherches_journal (recherche_id);
alter table public.recherches_journal enable row level security;
create policy "journal : lecture des siennes" on public.recherches_journal for select to authenticated using (user_id = (select auth.uid()) and public.a_offre(array['pro']));
create policy "journal : ajout des siennes" on public.recherches_journal for insert to authenticated with check (user_id = (select auth.uid()) and public.a_offre(array['pro']));
create policy "journal : suppression des siennes" on public.recherches_journal for delete to authenticated using (user_id = (select auth.uid()));
grant select, insert, delete on public.recherches_journal to authenticated;
revoke all on public.recherches_journal from anon;

-- Collectes Leboncoin demandées par une recherche (base trop maigre pour une génération) : quota par compte.
-- Écrites seulement par le serveur (clé service) ; chacun ne lit que les siennes.
create table if not exists public.collectes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  cle text not null check (char_length(cle) <= 120),
  created_at timestamptz not null default now()
);
create index if not exists collectes_user_date on public.collectes (user_id, created_at desc);
alter table public.collectes enable row level security;
create policy "collectes : lecture des siennes" on public.collectes for select to authenticated using (user_id = (select auth.uid()));
grant select on public.collectes to authenticated;
revoke all on public.collectes from anon;
