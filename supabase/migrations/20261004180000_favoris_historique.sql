-- Favoris : une voiture à revoir plus tard, sans l'ajouter au parc (annonce du marché, d'une alerte ou d'un rapport).
create table if not exists public.favoris (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  cle text not null check (char_length(cle) <= 300),
  titre text not null check (char_length(titre) <= 200),
  prix integer, annee integer, km integer,
  energie text check (char_length(energie) <= 40),
  boite text check (char_length(boite) <= 40),
  lieu text check (char_length(lieu) <= 120),
  url text check (url is null or (url ~ '^https://' and char_length(url) <= 500)),
  photo text check (photo is null or (photo ~ '^(https://|data:image/)' and char_length(photo) <= 200000)),
  cote jsonb check (cote is null or pg_column_size(cote) < 1000),
  source text not null default 'recherche' check (source in ('recherche', 'alerte', 'rapport')),
  rapport_id uuid references public.rapports (id) on delete set null,
  note text check (char_length(note) <= 1000),
  created_at timestamptz not null default now(),
  unique (user_id, cle)
);
create index if not exists favoris_user_date on public.favoris (user_id, created_at desc);
alter table public.favoris enable row level security;
create policy "favoris : lecture des siens" on public.favoris for select to authenticated using (user_id = (select auth.uid()));
create policy "favoris : ajout des siens" on public.favoris for insert to authenticated with check (user_id = (select auth.uid()));
create policy "favoris : modification des siens" on public.favoris for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "favoris : suppression des siens" on public.favoris for delete to authenticated using (user_id = (select auth.uid()));
grant select, insert, update, delete on public.favoris to authenticated;

-- Historique : les alertes supprimées restent consultables, avec ce qu'elles ont trouvé, et peuvent être réactivées.
create or replace function public.mes_alertes_supprimees() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', v.id, 'nom', v.nom, 'filtres', v.filtres, 'intervalle_min', v.intervalle_min, 'created_at', v.created_at,
    'supprimee_le', v.supprimee_le, 'derniere_execution', v.derniere_execution,
    'passages', (select count(*) from public.veille_passages p where p.veille_id = v.id and p.statut = 'ok'),
    'mails', (select count(*) from public.veille_passages p where p.veille_id = v.id and p.mail = 'envoyé'),
    'trouvees', (select count(*) from public.annonces an where v.id = any (an.veilles))
  ) order by v.supprimee_le desc), '[]'::jsonb)
  from public.veilles v where v.user_id = (select auth.uid()) and v.supprimee_le is not null;
$$;
revoke execute on function public.mes_alertes_supprimees() from public, anon;
grant execute on function public.mes_alertes_supprimees() to authenticated;

-- Réactivée en pause : la personne la rallume quand elle veut (le nombre d'alertes actives de sa formule s'applique).
create or replace function public.alerte_restaurer(p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.peut_alertes() then raise exception 'Alertes réservées à Benef Pro' using errcode = '42501'; end if;
  if (select count(*) from public.veilles where user_id = (select auth.uid()) and supprimee_le is null) >= coalesce((public.mes_droits_alertes()->>'max')::int, 0) then
    raise exception 'Nombre maximal d''alertes atteint : supprimez-en une pour réactiver celle-ci.';
  end if;
  update public.veilles set supprimee_le = null, actif = false
   where id = p_id and user_id = (select auth.uid()) and supprimee_le is not null;
end $$;
revoke execute on function public.alerte_restaurer(uuid) from public, anon;
grant execute on function public.alerte_restaurer(uuid) to authenticated;
