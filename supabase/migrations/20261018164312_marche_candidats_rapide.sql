-- Cote « placer une voiture » impossible depuis plusieurs jours (18 oct. 2026) : « Modèle inconnu ou base indisponible ».
-- marche_candidats coupée à 8 s : une Fiesta (toutes années) prenait 5 s base chaude, plus de 8 s à froid, alors que la
-- même requête écrite avec ses valeurs prend 1,1 s. En fonction SQL, les filtres facultatifs (« p_regex is null or … »)
-- gardent un plan générique qui ne passe pas par les index. Réécrite en plpgsql : la requête est composée avec les
-- valeurs de l'appel, seulement avec les filtres demandés, et planifiée à chaque fois. Mêmes colonnes, mêmes annonces ;

create or replace function public.marche_candidats(p_regex text, p_marque text, p_annee_min integer, p_annee_max integer, p_limite integer default 3000)
returns jsonb language plpgsql stable security definer set search_path = '' as $fn$
declare
  pre_ca text := '';
  pre_m text := '';
  filtres text := '';
  r jsonb;
begin
  if not (public.a_offre(array['pro']) or (select auth.role()) = 'service_role') then
    return '[]'::jsonb;
  end if;
  if p_regex is not null then
    -- préfiltre par l'index des mots (noms courts compris) ; le filtre exact suit
    pre_ca := format(' where public.mots_txt(public.norm_txt(coalesce(ca.titre, %L) || %L || ca.cle)) ~ %L', '', ' ', public.rx_mots(p_regex));
    pre_m := format(' and public.mots_txt(m.titre_norm) ~ %L', public.rx_mots(p_regex));
    filtres := filtres || format(' and t ~ %L', p_regex);
  end if;
  if p_marque is not null then filtres := filtres || format(' and t ~ %L', p_marque); end if;
  if p_annee_min is not null then filtres := filtres || format(' and annee >= %s', p_annee_min); end if;
  if p_annee_max is not null then filtres := filtres || format(' and annee <= %s', p_annee_max); end if;

  execute $q$
  with toutes as (
    select ca.id, 'garage' as source, ca.titre, ca.texte, ca.prix, ca.annee, ca.km, ca.energie, ca.boite, (ca.vendeur ilike 'pro%') as pro, ca.ch, ca.places, ca.carrosserie as carr, ca.etat,
           ca.dep as lieu, null::text as url, coalesce(ca.publie_le, ca.vu_le) as vu_le, ca.version, ca.finition, ca.mec, ca.portes, ca.lbc_min, ca.lbc_max, ca.lbc_pos, ca.photo,
           ca.photos,
           public.norm_txt(coalesce(ca.titre, '') || ' ' || ca.cle) as t,
           -- vue au dernier relevé complet ; sans relevé complet, vue depuis moins de 21 jours
           case when c.complete and c.maj is not null then ca.vu_le >= c.maj - interval '3 hours' else ca.vu_le >= now() - interval '21 days' end as en_ligne
    from public.cote_annonces ca left join public.cotes c on c.cle = ca.cle$q$ || pre_ca || $q$
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
    where m.source = 'releve'$q$ || pre_m || $q$
  ), filtrees as (
    -- une annonce relevée sous plusieurs clés (« toutes énergies » et « diesel ») est en ligne si l'un des relevés l'a vue
    select distinct on (id) *, coalesce(bool_or(en_ligne) over (partition by id), true) as en_ligne_id from toutes
    where prix between 300 and 300000$q$ || filtres || $q$
    order by id, (source = 'suivi') desc, (version is not null) desc, (texte is not null) desc
  )
  select coalesce(jsonb_agg(jsonb_set(to_jsonb(f) - 't' - 'en_ligne_id', '{en_ligne}', to_jsonb(f.en_ligne_id))), '[]'::jsonb)
  from (select * from filtrees order by en_ligne_id desc, vu_le desc nulls last limit $1) f$q$
  into r using greatest(1, least(coalesce(p_limite, 3000), 5000));
  return r;
end;
$fn$;
