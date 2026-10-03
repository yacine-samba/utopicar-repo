-- Cote calculée par l'outil à partir des annonces réellement en ligne (relevés Leboncoin), sans IA.
create table if not exists public.marche_annonces (
  id text primary key,
  source text not null,
  marque text,
  modele text,
  titre text not null,
  titre_norm text not null,
  annee integer,
  km integer,
  prix integer not null,
  energie text,
  boite text,
  ch integer,
  pro boolean,
  cp text,
  vu_le timestamptz not null default now()
);
create index if not exists marche_annonces_annee_idx on public.marche_annonces (annee);
alter table public.marche_annonces enable row level security;
revoke all on public.marche_annonces from anon, authenticated;

create or replace function public.norm_txt(t text)
returns text language sql immutable set search_path = '' as $$
  select lower(translate(coalesce(t, ''), 'ÀÂÄÁÉÈÊËÎÏÍÔÖÓÙÛÜÚÇàâäáéèêëîïíôöóùûüúç’''-_', 'AAAAEEEEIIIOOOUUUUCaaaaeeeeiiiooouuuuc    '));
$$;

-- Annonces comparables (même marque et modèle, ±2 ans, même énergie, kilométrage proche), prix ramenés à l'année
-- et au kilométrage de la voiture analysée (±7 % par an, ±3,5 % par 10 000 km, ajustement plafonné à ±35 %).
create or replace function public.cote_marche(p_marque text, p_modele text, p_annee integer, p_km integer, p_energie text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with p as (
    select nullif(split_part(public.norm_txt(p_marque), ' ', 1), '') as mar,
           nullif(split_part(trim(public.norm_txt(p_modele)), ' ', 1), '') as modl,
           nullif(left(public.norm_txt(p_energie), 4), '') as en
  ), c as (
    select m.prix, m.annee, m.km
    from public.marche_annonces m, p
    where p.modl is not null
      and m.prix between 300 and 300000
      and (m.titre_norm ~ ('\m' || p.modl || '\M') or public.norm_txt(m.modele) = p.modl)
      and (p.mar is null or m.titre_norm ~ ('\m' || p.mar || '\M') or public.norm_txt(m.marque) = p.mar)
      and (p_annee is null or m.annee between p_annee - 2 and p_annee + 2)
      and (p.en is null or m.energie is null or left(public.norm_txt(m.energie), 4) = p.en)
      and (p_km is null or m.km is null or m.km between p_km * 0.5 and p_km * 1.6 + 20000)
  ), a as (
    select prix * greatest(0.65, least(1.35,
             (1 + 0.07 * coalesce(p_annee - annee, 0)) * (1 - 0.035 * coalesce((p_km - km) / 10000.0, 0)))) as adj
    from c
  )
  select jsonb_build_object(
    'n', count(*),
    'p25', round(percentile_cont(0.25) within group (order by adj)),
    'mediane', round(percentile_cont(0.5) within group (order by adj)),
    'p75', round(percentile_cont(0.75) within group (order by adj)))
  from a;
$$;
revoke execute on function public.cote_marche(text, text, integer, integer, text) from public, anon;
grant execute on function public.cote_marche(text, text, integer, integer, text) to authenticated;

-- Reprise des annonces déjà relevées par l'outil Garage (table cote_annonces, clé « marque modèle|génération|énergie »).
insert into public.marche_annonces (id, source, marque, modele, titre, titre_norm, annee, km, prix, energie, boite, ch, pro, cp)
select 'lbc:' || ca.id, 'garage', split_part(split_part(ca.cle, '|', 1), ' ', 1), split_part(split_part(ca.cle, '|', 1), ' ', 2),
       coalesce(nullif(ca.titre, ''), split_part(ca.cle, '|', 1)),
       public.norm_txt(coalesce(nullif(ca.titre, ''), '') || ' ' || split_part(ca.cle, '|', 1)),
       ca.annee, ca.km, ca.prix, ca.energie, ca.boite, ca.ch, ca.vendeur ilike 'pro%', ca.dep
from public.cote_annonces ca
where ca.prix is not null and ca.id is not null
on conflict (id) do nothing;
