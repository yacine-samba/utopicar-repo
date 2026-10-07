-- Recherche alignée sur Leboncoin : les annonces retirées (vendues, supprimées) ne sont plus proposées.
-- cotes.complete : le dernier relevé a lu toutes les annonces que Leboncoin propose pour cette génération
-- (moins que le maximum demandé, et pas un relevé bloqué à moitié vide). Une annonce absente d'un relevé complet
-- est retirée de Leboncoin : elle garde son prix pour la cote, mais la recherche ne la propose plus.
alter table public.cotes add column if not exists complete boolean;

create or replace function public.marche_candidats(p_regex text, p_marque text, p_annee_min integer, p_annee_max integer, p_limite integer default 3000)
 returns jsonb
 language sql
 stable security definer
 set search_path to ''
as $function$
  with toutes as (
    select ca.id, 'garage' as source, ca.titre, ca.texte, ca.prix, ca.annee, ca.km, ca.energie, ca.boite, (ca.vendeur ilike 'pro%') as pro, ca.ch, ca.places, ca.carrosserie as carr, ca.etat,
           ca.dep as lieu, null::text as url, coalesce(ca.publie_le, ca.vu_le) as vu_le, ca.version, ca.finition, ca.mec, ca.portes, ca.lbc_min, ca.lbc_max, ca.lbc_pos, ca.photo,
           public.norm_txt(coalesce(ca.titre, '') || ' ' || ca.cle) as t,
           -- vue au dernier relevé complet ; sans relevé complet, vue depuis moins de 21 jours
           case when c.complete and c.maj is not null then ca.vu_le >= c.maj - interval '3 hours' else ca.vu_le >= now() - interval '21 days' end as en_ligne
    from public.cote_annonces ca left join public.cotes c on c.cle = ca.cle
    union all
    select a.id, 'suivi', a.titre, left(a.description, 700), a.prix, a.annee, a.km, a.energie, a.boite, a.vendeur_type = 'professionnel',
           nullif(regexp_replace(coalesce(public.lbc_attr(a.attributs, 'horse_power_din'), ''), '\D', '', 'g'), '')::int, null::int, public.lbc_attr(a.attributs, 'vehicle_type'), public.lbc_attr(a.attributs, 'vehicle_damage'),
           coalesce(a.ville, '') || coalesce(' ' || a.cp, ''), a.url, coalesce(a.publie_le, a.premiere_vue),
           public.lbc_attr(a.attributs, 'u_car_version'), public.lbc_attr(a.attributs, 'u_car_finition'), public.lbc_mec(public.lbc_attr(a.attributs, 'issuance_date')),
           nullif(regexp_replace(coalesce(public.lbc_attr(a.attributs, 'doors'), ''), '\D', '', 'g'), '')::int,
           nullif(regexp_replace(coalesce(public.lbc_attr(a.attributs, 'car_price_min'), ''), '\D', '', 'g'), '')::int,
           nullif(regexp_replace(coalesce(public.lbc_attr(a.attributs, 'car_price_max'), ''), '\D', '', 'g'), '')::int,
           public.lbc_attr(a.attributs, 'car_price_positioning'),
           case when jsonb_typeof(a.photos) = 'array' and (a.photos->>0) ~ '^https://' then a.photos->>0 end,
           public.norm_txt(coalesce(a.marque, '') || ' ' || coalesce(a.modele, '') || ' ' || coalesce(a.titre, '')),
           coalesce(a.derniere_vue, a.premiere_vue) >= now() - interval '21 days'
    from public.annonces a
    union all
    select substr(m.id, 5), m.source, m.titre, null, m.prix, m.annee, m.km, m.energie, m.boite, m.pro, m.ch, null::int, null, null, m.cp,
           'https://www.leboncoin.fr/ad/voitures/' || substr(m.id, 5), m.vu_le, null, null, null, null, null, null, null, null, m.titre_norm,
           m.vu_le >= now() - interval '21 days'
    from public.marche_annonces m where m.source = 'releve'
  ), filtrees as (
    -- une annonce relevée sous plusieurs clés (« toutes énergies » et « diesel ») est en ligne si l'un des relevés l'a vue
    select distinct on (id) *, coalesce(bool_or(en_ligne) over (partition by id), true) as en_ligne_id from toutes
    where (public.a_offre(array['pro']) or (select auth.role()) = 'service_role')
      and prix between 300 and 300000
      and (p_regex is null or t ~ p_regex)
      and (p_marque is null or t ~ p_marque)
      and (p_annee_min is null or annee >= p_annee_min)
      and (p_annee_max is null or annee <= p_annee_max)
    order by id, (source = 'suivi') desc, (version is not null) desc, (texte is not null) desc
  )
  select coalesce(jsonb_agg(jsonb_set(to_jsonb(f) - 't' - 'en_ligne_id', '{en_ligne}', to_jsonb(f.en_ligne_id))), '[]'::jsonb)
  from (select * from filtrees order by en_ligne_id desc, vu_le desc nulls last limit greatest(1, least(p_limite, 5000))) f;
$function$;
