set lock_timeout = '15s';

-- Analyse 2027 (2/4) : historique des prix vus et des republications. Les déclencheurs sont posés à l'étape 3.
-- ---------------------------------------------------------------- 4. Historique des prix vus (toutes les sources de la base du marché)
create table if not exists public.prix_vus (
  annonce text not null,
  prix integer not null,
  vu_le timestamptz not null default now(),
  primary key (annonce, vu_le)
);
alter table public.prix_vus enable row level security;
revoke all on public.prix_vus from anon, authenticated;

-- Un prix est noté quand il change (ou à la première vue). Jamais bloquant pour la collecte.
create or replace function public.noter_prix()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_id text := regexp_replace(new.id, '^lbc:', '');
begin
  if new.prix is null or v_id !~ '^\d{6,14}$' then return null; end if;
  if tg_op = 'UPDATE' and old.prix is not distinct from new.prix then return null; end if;
  if (select p.prix from public.prix_vus p where p.annonce = v_id order by p.vu_le desc limit 1) is distinct from new.prix then
    insert into public.prix_vus (annonce, prix) values (v_id, new.prix) on conflict do nothing;
  end if;
  return null;
exception when others then
  return null;
end $$;

-- Point de départ : le prix connu aujourd'hui, daté de sa première apparition connue.
insert into public.prix_vus (annonce, prix, vu_le)
select distinct on (id) id, prix, coalesce(publie_le, vu_le) from public.cote_annonces where prix is not null and id ~ '^\d{6,14}$'
order by id, vu_le desc
on conflict do nothing;
insert into public.prix_vus (annonce, prix, vu_le)
select regexp_replace(id, '^lbc:', ''), prix, vu_le from public.marche_annonces m
where prix is not null and id ~ '^lbc:\d{6,14}$'
  and not exists (select 1 from public.cote_annonces c where c.id = regexp_replace(m.id, '^lbc:', ''))
on conflict do nothing;

-- Historique d'une annonce (par son numéro Leboncoin) et la même voiture vue ailleurs
-- (même année, même kilométrage exact, même modèle, autre numéro) : republication, doublon, annonce copiée.
create or replace function public.historique_annonce(p_id text, p_annee integer, p_km integer, p_modele text)
returns jsonb language sql stable security definer set search_path = '' as $$
  with ids as (select nullif(regexp_replace(coalesce(p_id, ''), '\D', '', 'g'), '') as id),
  modl as (select nullif(split_part(trim(public.norm_txt(p_modele)), ' ', 1), '') as m),
  vues as (
    select ca.publie_le, ca.vu_le as fin, ca.vu_le as debut from public.cote_annonces ca, ids where ca.id = ids.id
    union all select a.publie_le, a.derniere_vue, a.premiere_vue from public.annonces a, ids where a.id = ids.id
    union all select null, m.vu_le, m.vu_le from public.marche_annonces m, ids where m.id = 'lbc:' || ids.id
  ),
  prix as (
    select p.prix, p.vu_le from public.prix_vus p, ids where p.annonce = ids.id
  ),
  autres as (
    select x.id, x.prix, x.lieu, x.vu, x.publie from (
      select ca.id, ca.prix, ca.dep as lieu, ca.vu_le as vu, ca.publie_le as publie, public.norm_txt(coalesce(ca.titre, '') || ' ' || ca.cle) as t, ca.annee, ca.km from public.cote_annonces ca
      union all select a.id, a.prix, coalesce(a.ville, a.cp), coalesce(a.derniere_vue, a.premiere_vue), a.publie_le, public.norm_txt(coalesce(a.marque, '') || ' ' || coalesce(a.modele, '') || ' ' || coalesce(a.titre, '')), a.annee, a.km from public.annonces a
      union all select substr(m.id, 5), m.prix, m.cp, m.vu_le, null, m.titre_norm, m.annee, m.km from public.marche_annonces m where m.id like 'lbc:%'
    ) x, ids, modl
    where p_km is not null and p_km >= 1000 and x.km = p_km and x.annee = p_annee
      and modl.m is not null and x.t ~ ('\m' || modl.m || '\M')
      and (ids.id is null or x.id <> ids.id)
  )
  select jsonb_build_object(
    'publie_le', (select min(publie_le) from vues),
    'premiere_vue', (select min(debut) from vues),
    'derniere_vue', (select max(fin) from vues),
    'prix', coalesce((select jsonb_agg(jsonb_build_object('prix', prix, 'le', vu_le) order by vu_le) from prix), '[]'::jsonb),
    'autres', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'prix', prix, 'lieu', lieu, 'vu_le', vu, 'publie_le', publie) order by vu desc)
                        from (select distinct on (id) * from autres order by id, vu desc limit 8) d), '[]'::jsonb));
$$;
revoke execute on function public.historique_annonce(text, integer, integer, text) from public, anon;
grant execute on function public.historique_annonce(text, integer, integer, text) to authenticated;

