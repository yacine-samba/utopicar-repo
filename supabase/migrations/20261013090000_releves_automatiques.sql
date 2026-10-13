-- Relevé automatique des cotes (extension 4.6) : toutes les marques et tous les modèles de Leboncoin, dans chaque énergie.
-- Les annonces rejoignent la base du marché (releve_enregistrer) ; le bilan du relevé est gardé ici pour que la page Cote
-- l'affiche : chaque recherche, son nombre de résultats, et celles que Leboncoin coupe à 100 pages (le reste n'est pas lisible).

create table if not exists public.releves_auto (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  debut timestamptz not null,
  fin timestamptz,
  bilan jsonb not null check (pg_column_size(bilan) < 8000000),
  created_at timestamptz not null default now()
);
create index if not exists releves_auto_user_idx on public.releves_auto (user_id, created_at desc);
alter table public.releves_auto enable row level security;
create policy "releves_auto : lecture par le titulaire" on public.releves_auto
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "releves_auto : ajout par le titulaire" on public.releves_auto
  for insert to authenticated with check ((select auth.uid()) = user_id and public.a_offre(array['pro']));
-- un même relevé renvoyé (nouvel envoi après une coupure) remplace son bilan
create policy "releves_auto : modification par le titulaire" on public.releves_auto
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
