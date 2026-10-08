-- Pages publiques « Cote d'un modèle » (/cote/...) : statistiques agrégées de la base du marché, lisibles sans compte.
-- Aucune annonce n'est renvoyée, seulement des médianes et des comptes (au moins 5 annonces par ligne, 50 par modèle).
-- Annonces vues dans les 90 derniers jours, prix entre 500 et 150 000 €, 2 % les plus bas et les plus hauts écartés.

create or replace function public.cotes_publiques()
 returns jsonb
 language sql
 stable security definer
 set search_path to ''
as $function$
  select coalesce(jsonb_agg(jsonb_build_object('cle', c.cle, 'nom', c.nom, 'base', c.base, 'energie', c.energie, 'y0', c.y0, 'y1', c.y1, 'maj', c.maj,
           'n', x.n, 'mediane', round(x.med)) order by x.n desc), '[]'::jsonb)
  from public.cotes c
  cross join lateral (
    select count(*) as n, percentile_cont(0.5) within group (order by a.prix) as med
    from public.cote_annonces a
    where a.cle = c.cle and a.prix between 500 and 150000 and a.vu_le > now() - interval '90 days'
  ) x
  where c.statut = 'ok' and x.n >= 50;
$function$;

create or replace function public.cote_publique(p_cle text)
 returns jsonb
 language sql
 stable security definer
 set search_path to ''
as $function$
  with c as (select cle, nom, base, energie, y0, y1, maj from public.cotes where cle = p_cle and statut = 'ok'),
  brut as (
    select a.prix, a.annee, a.km, a.boite, a.ch, a.vendeur
    from public.cote_annonces a join c on c.cle = a.cle
    where a.prix between 500 and 150000 and a.vu_le > now() - interval '90 days'
  ),
  bornes as (select percentile_cont(0.02) within group (order by prix) as lo, percentile_cont(0.98) within group (order by prix) as hi from brut),
  a as (select b.* from brut b, bornes where b.prix between bornes.lo and bornes.hi)
  select case when (select count(*) from a) < 50 then null else jsonb_build_object(
    'cle', c.cle, 'nom', c.nom, 'base', c.base, 'energie', c.energie, 'y0', c.y0, 'y1', c.y1, 'maj', c.maj,
    'n', (select count(*) from a),
    'mediane', (select round(percentile_cont(0.5) within group (order by prix)) from a),
    'p25', (select round(percentile_cont(0.25) within group (order by prix)) from a),
    'p75', (select round(percentile_cont(0.75) within group (order by prix)) from a),
    'km', (select round(percentile_cont(0.5) within group (order by km)) from a where km is not null),
    'pros', (select count(*) from a where a.vendeur ilike 'pro%'),
    'par_annee', (select coalesce(jsonb_agg(x order by x.annee), '[]'::jsonb) from (
        select annee, count(*) as n, round(percentile_cont(0.5) within group (order by prix)) as mediane, round(percentile_cont(0.5) within group (order by km)) as km
        from a where annee is not null group by annee having count(*) >= 5) x),
    'par_km', (select coalesce(jsonb_agg(x order by x.t), '[]'::jsonb) from (
        select case when km < 50000 then 0 when km < 100000 then 1 when km < 150000 then 2 when km < 200000 then 3 else 4 end as t,
               count(*) as n, round(percentile_cont(0.5) within group (order by prix)) as mediane
        from a where km is not null group by 1 having count(*) >= 5) x),
    'par_boite', (select coalesce(jsonb_agg(x order by x.n desc), '[]'::jsonb) from (
        select boite, count(*) as n, round(percentile_cont(0.5) within group (order by prix)) as mediane
        from a where boite is not null group by boite having count(*) >= 5) x),
    'par_ch', (select coalesce(jsonb_agg(x order by x.n desc), '[]'::jsonb) from (
        select ch, count(*) as n, round(percentile_cont(0.5) within group (order by prix)) as mediane
        from a where ch is not null group by ch having count(*) >= 10 order by count(*) desc limit 6) x)
  ) end
  from c;
$function$;

grant execute on function public.cotes_publiques() to anon, authenticated;
grant execute on function public.cote_publique(text) to anon, authenticated;

-- Index des cotes : mêmes annonces que la page de chaque modèle (2 % les plus bas et les plus hauts écartés),
-- pour que le nombre d'annonces et le prix médian affichés soient identiques des deux côtés.
create or replace function public.cotes_publiques()
 returns jsonb
 language sql
 stable security definer
 set search_path to ''
as $function$
  select coalesce(jsonb_agg(jsonb_build_object('cle', c.cle, 'nom', c.nom, 'base', c.base, 'energie', c.energie, 'y0', c.y0, 'y1', c.y1, 'maj', c.maj,
           'n', x.n, 'mediane', round(x.med)) order by x.n desc), '[]'::jsonb)
  from public.cotes c
  cross join lateral (
    with brut as (
      select a.prix from public.cote_annonces a
      where a.cle = c.cle and a.prix between 500 and 150000 and a.vu_le > now() - interval '90 days'
    ),
    bornes as (select percentile_cont(0.02) within group (order by prix) as lo, percentile_cont(0.98) within group (order by prix) as hi from brut)
    select count(*) as n, percentile_cont(0.5) within group (order by b.prix) as med
    from brut b, bornes where b.prix between bornes.lo and bornes.hi
  ) x
  where c.statut = 'ok' and x.n >= 50;
$function$;
