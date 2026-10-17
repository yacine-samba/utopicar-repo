-- Recherche du marché encore lente pour les modèles à nom court (17 oct. 2026) : Q3, A3, C3, X1, Up, Ka…
-- L'index trigrammes (20261017164444) ne sert pas quand le mot cherché a moins de 3 lettres : « \y(q3)\y » relisait
-- les 347 000 annonces (4,6 s, et l'API coupe à 8 s quand la base n'a pas les données en mémoire).
-- Solution sans perte : un index sur le titre dont toute ponctuation devient une espace (« audi, q3– sportback »
-- → « audi q3 sportback ») ; les bords de mot \y deviennent des espaces, que l'index exploite (« q3 »).
-- Le filtre exact \y reste appliqué ensuite : mêmes annonces qu'avant (vérifié sur Q3, Clio, 208, A3).

create or replace function public.mots_txt(t text) returns text
language sql immutable parallel safe set search_path = '' as $$
  select ' ' || regexp_replace(coalesce(t, ''), '[^a-z0-9]+', ' ', 'g') || ' '
$$;

-- motif du catalogue « \y(q3|…)\y » pour mots_txt : les bords de mot deviennent des espaces
create or replace function public.rx_mots(p text) returns text
language sql immutable parallel safe set search_path = '' as $$
  select replace(p, '\y', ' ')
$$;

create index if not exists marche_annonces_mots_trgm on public.marche_annonces using gin ((public.mots_txt(titre_norm)) extensions.gin_trgm_ops);
create index if not exists cote_annonces_mots_trgm on public.cote_annonces
  using gin ((public.mots_txt(public.norm_txt(coalesce(titre, '') || ' ' || cle))) extensions.gin_trgm_ops);

create or replace function public.marche_candidats(p_regex text, p_marque text, p_annee_min integer, p_annee_max integer, p_limite integer default 3000)
returns jsonb language sql stable security definer set search_path = '' as $function$
  with toutes as (
    select ca.id, 'garage' as source, ca.titre, ca.texte, ca.prix, ca.annee, ca.km, ca.energie, ca.boite, (ca.vendeur ilike 'pro%') as pro, ca.ch, ca.places, ca.carrosserie as carr, ca.etat,
           ca.dep as lieu, null::text as url, coalesce(ca.publie_le, ca.vu_le) as vu_le, ca.version, ca.finition, ca.mec, ca.portes, ca.lbc_min, ca.lbc_max, ca.lbc_pos, ca.photo,
           ca.photos,
           public.norm_txt(coalesce(ca.titre, '') || ' ' || ca.cle) as t,
           -- vue au dernier relevé complet ; sans relevé complet, vue depuis moins de 21 jours
           case when c.complete and c.maj is not null then ca.vu_le >= c.maj - interval '3 hours' else ca.vu_le >= now() - interval '21 days' end as en_ligne
    from public.cote_annonces ca left join public.cotes c on c.cle = ca.cle
    -- préfiltre par l'index des mots (noms courts compris) ; le filtre exact suit
    where p_regex is null or public.mots_txt(public.norm_txt(coalesce(ca.titre, '') || ' ' || ca.cle)) ~ public.rx_mots(p_regex)
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
           case when jsonb_typeof(a.photos) = 'array' then (select jsonb_agg(p) from (select p from jsonb_array_elements_text(a.photos) p where p ~ '^https://' limit 3) s) end,
           public.norm_txt(coalesce(a.marque, '') || ' ' || coalesce(a.modele, '') || ' ' || coalesce(a.titre, '')),
           coalesce(a.derniere_vue, a.premiere_vue) >= now() - interval '21 days'
    from public.annonces a
    union all
    select substr(m.id, 5), m.source, m.titre, null, m.prix, m.annee, m.km, m.energie, m.boite, m.pro, m.ch, null::int, null, null, m.cp,
           'https://www.leboncoin.fr/ad/voitures/' || substr(m.id, 5), m.vu_le, null, null, null, null, null, null, null, null, null::jsonb, m.titre_norm,
           m.vu_le >= now() - interval '21 days'
    from public.marche_annonces m
    where m.source = 'releve'
      -- préfiltre par l'index des mots (noms courts compris) ; le filtre exact suit
      and (p_regex is null or public.mots_txt(m.titre_norm) ~ public.rx_mots(p_regex))
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

-- Cote des analyses (cote_marche) : 20 s pour une Q3 ou une A3, donc toujours coupée à 8 s. Elle recalculait norm_txt sur
-- les 347 000 annonces et ne pouvait pas utiliser d'index (« titre contient le modèle ou modèle égal »). Réécrite pour
-- passer par l'index des mots et par celui du modèle normalisé : mêmes résultats (Clio, Q3, A3 vérifiés), 0,2 à 2 s.
create or replace function public.cote_marche(p_marque text, p_modele text, p_annee integer, p_km integer, p_energie text)
returns jsonb language plpgsql stable security definer set search_path = '' as $fn$
declare
  v_mar text := nullif(trim(public.mots_txt(split_part(public.norm_txt(p_marque), ' ', 1))), '');
  v_modl text := nullif(trim(public.mots_txt(split_part(trim(public.norm_txt(p_modele)), ' ', 1))), '');
  v_en text := nullif(left(public.norm_txt(p_energie), 4), '');
  r jsonb;
begin
  with c as (
    select m.prix, m.annee, m.km from public.marche_annonces m
    where v_modl is not null
      and m.id in (
        select x.id from public.marche_annonces x where public.mots_txt(x.titre_norm) like '% ' || v_modl || ' %'
        union
        select y.id from public.marche_annonces y where public.norm_txt(y.modele) = v_modl)
      and m.prix between 300 and 300000
      and (v_mar is null or public.mots_txt(m.titre_norm) like '% ' || v_mar || ' %' or public.norm_txt(m.marque) = v_mar)
      and (p_annee is null or m.annee between p_annee - 2 and p_annee + 2)
      and (v_en is null or m.energie is null or left(public.norm_txt(m.energie), 4) = v_en)
      and (p_km is null or m.km is null or m.km between p_km * 0.5 and p_km * 1.6 + 20000)
  ), a as (
    select prix * greatest(0.65, least(1.35,
             (1 + 0.07 * coalesce(p_annee - annee, 0)) * (1 - 0.035 * coalesce((p_km - km) / 10000.0, 0)))) as adj
    from c
  )
  select jsonb_build_object('n', count(*),
    'p25', round(percentile_cont(0.25) within group (order by adj)),
    'mediane', round(percentile_cont(0.5) within group (order by adj)),
    'p75', round(percentile_cont(0.75) within group (order by adj)))
  into r from a;
  return r;
end $fn$;

analyze public.marche_annonces;
analyze public.cote_annonces;
