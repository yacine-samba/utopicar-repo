-- Résultats gardés : chaque lancement garde ses résultats ; rouvrir une recherche les affiche sans relancer de requête.
alter table public.recherches_journal add column if not exists resultat jsonb check (resultat is null or pg_column_size(resultat) < 900000);
alter table public.recherches_journal add column if not exists maj timestamptz not null default now();
create policy "journal : modification des siennes" on public.recherches_journal for update to authenticated
  using (user_id = (select auth.uid()) and public.a_offre(array['pro'])) with check (user_id = (select auth.uid()) and public.a_offre(array['pro']));
grant update on public.recherches_journal to authenticated;

-- Annonces trouvées : toutes les annonces remontées par ses recherches, gardées même si la recherche est supprimée.
create table if not exists public.annonces_trouvees (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  cle text not null check (char_length(cle) <= 200),
  titre text not null default '' check (char_length(titre) <= 300),
  prix integer, annee integer, km integer, ch integer,
  energie text, boite text, moteur text, version text, lieu text, url text check (url is null or char_length(url) <= 500),
  marque text not null check (char_length(marque) <= 40),
  modele text not null check (char_length(modele) <= 60),
  gen text, gen_label text, pro boolean,
  cote jsonb check (cote is null or pg_column_size(cote) < 4000),
  recherche text check (recherche is null or char_length(recherche) <= 160),
  premiere_le timestamptz not null default now(),
  derniere_le timestamptz not null default now(),
  fois integer not null default 1,
  primary key (user_id, cle)
);
create index if not exists annonces_trouvees_user_date on public.annonces_trouvees (user_id, derniere_le desc);
alter table public.annonces_trouvees enable row level security;
create policy "trouvées : lecture des siennes" on public.annonces_trouvees for select to authenticated using (user_id = (select auth.uid()) and public.a_offre(array['pro']));
create policy "trouvées : ajout des siennes" on public.annonces_trouvees for insert to authenticated with check (user_id = (select auth.uid()) and public.a_offre(array['pro']));
create policy "trouvées : modification des siennes" on public.annonces_trouvees for update to authenticated using (user_id = (select auth.uid()) and public.a_offre(array['pro'])) with check (user_id = (select auth.uid()) and public.a_offre(array['pro']));
create policy "trouvées : suppression des siennes" on public.annonces_trouvees for delete to authenticated using (user_id = (select auth.uid()));
grant select, insert, update, delete on public.annonces_trouvees to authenticated;
revoke all on public.annonces_trouvees from anon;

-- Base du marché cumulative : une nouvelle collecte ajoute et met à jour, elle n'efface plus les annonces déjà relevées
-- (une annonce vendue garde son prix pour la cote). vu_le : dernière fois que Leboncoin l'a montrée.
alter table public.cote_annonces add column if not exists vu_le timestamptz not null default now();
