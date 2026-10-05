-- Critères Leboncoin gardés avec chaque annonce collectée : version exacte (« 208 1.5 BlueHDi 100ch… »), finition,
-- date de 1re mise en circulation (sépare deux générations la même année), portes, et l'estimation de prix de Leboncoin.
alter table public.cote_annonces
  add column if not exists version text,
  add column if not exists finition text,
  add column if not exists mec text check (mec is null or mec ~ '^\d{4}-\d{2}$'),
  add column if not exists portes integer,
  add column if not exists lbc_min integer,
  add column if not exists lbc_max integer,
  add column if not exists lbc_pos text;

-- Valeur d'un attribut Leboncoin (libellé, sinon valeur brute).
create or replace function public.lbc_attr(attrs jsonb, cle text)
returns text language sql immutable set search_path = '' as $$
  select coalesce(a->>'value_label', a->>'value') from jsonb_array_elements(case when jsonb_typeof(attrs) = 'array' then attrs else '[]'::jsonb end) a where a->>'key' = cle limit 1
$$;

-- « 03/2013 » → « 2013-03 »
create or replace function public.lbc_mec(s text)
returns text language sql immutable set search_path = '' as $$
  select case when s ~ '^\d{2}/\d{4}$' then substr(s, 4, 4) || '-' || substr(s, 1, 2) end
$$;

create or replace function public.marche_candidats(p_regex text, p_marque text, p_annee_min integer, p_annee_max integer, p_limite integer default 3000)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with toutes as (
    select ca.id, 'garage' as source, ca.titre, ca.texte, ca.prix, ca.annee, ca.km, ca.energie, ca.boite, (ca.vendeur ilike 'pro%') as pro, ca.ch, ca.places, ca.carrosserie as carr, ca.etat,
           ca.dep as lieu, null::text as url, coalesce(ca.publie_le, ca.vu_le) as vu_le, ca.version, ca.finition, ca.mec, ca.portes, ca.lbc_min, ca.lbc_max, ca.lbc_pos,
           public.norm_txt(coalesce(ca.titre, '') || ' ' || ca.cle) as t
    from public.cote_annonces ca
    union all
    select a.id, 'suivi', a.titre, left(a.description, 700), a.prix, a.annee, a.km, a.energie, a.boite, a.vendeur_type = 'professionnel',
           nullif(regexp_replace(coalesce(public.lbc_attr(a.attributs, 'horse_power_din'), ''), '\D', '', 'g'), '')::int, null::int, public.lbc_attr(a.attributs, 'vehicle_type'), public.lbc_attr(a.attributs, 'vehicle_damage'),
           coalesce(a.ville, '') || coalesce(' ' || a.cp, ''), a.url, coalesce(a.publie_le, a.premiere_vue),
           public.lbc_attr(a.attributs, 'u_car_version'), public.lbc_attr(a.attributs, 'u_car_finition'), public.lbc_mec(public.lbc_attr(a.attributs, 'issuance_date')),
           nullif(regexp_replace(coalesce(public.lbc_attr(a.attributs, 'doors'), ''), '\D', '', 'g'), '')::int,
           nullif(regexp_replace(coalesce(public.lbc_attr(a.attributs, 'car_price_min'), ''), '\D', '', 'g'), '')::int,
           nullif(regexp_replace(coalesce(public.lbc_attr(a.attributs, 'car_price_max'), ''), '\D', '', 'g'), '')::int,
           public.lbc_attr(a.attributs, 'car_price_positioning'),
           public.norm_txt(coalesce(a.marque, '') || ' ' || coalesce(a.modele, '') || ' ' || coalesce(a.titre, ''))
    from public.annonces a
    union all
    select substr(m.id, 5), m.source, m.titre, null, m.prix, m.annee, m.km, m.energie, m.boite, m.pro, m.ch, null::int, null, null, m.cp,
           'https://www.leboncoin.fr/ad/voitures/' || substr(m.id, 5), m.vu_le, null, null, null, null, null, null, null, m.titre_norm
    from public.marche_annonces m where m.source = 'releve'
  ), filtrees as (
    select distinct on (id) * from toutes
    where public.a_offre(array['pro']) -- base du marché : Benef Pro et illimité
      and prix between 300 and 300000
      and (p_regex is null or t ~ p_regex)
      and (p_marque is null or t ~ p_marque)
      and (p_annee_min is null or annee >= p_annee_min)
      and (p_annee_max is null or annee <= p_annee_max)
    order by id, (source = 'suivi') desc, (version is not null) desc, (texte is not null) desc
  )
  select coalesce(jsonb_agg(to_jsonb(f) - 't'), '[]'::jsonb) from (select * from filtrees order by vu_le desc nulls last limit greatest(1, least(p_limite, 5000))) f;
$$;
revoke execute on function public.marche_candidats(text, text, integer, integer, integer) from public, anon;
grant execute on function public.marche_candidats(text, text, integer, integer, integer) to authenticated;
revoke execute on function public.lbc_attr(jsonb, text) from public, anon, authenticated;
revoke execute on function public.lbc_mec(text) from public, anon, authenticated;
