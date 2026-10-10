set lock_timeout = '15s';

-- Analyse 2027 (4/4) : suivi des annonces analysées et mesure de justesse.
-- ---------------------------------------------------------------- 5. Suivi des annonces analysées (alerte de prix)
create table if not exists public.suivis (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  rapport_id uuid not null references public.rapports (id) on delete cascade,
  annonce text not null check (annonce ~ '^\d{6,14}$'),
  titre text check (char_length(titre) <= 160),
  prix_initial integer,
  prix_conseille integer,
  dernier_prix integer,
  statut text not null default 'suivi' check (statut in ('suivi', 'baisse', 'sous_conseille', 'disparue')),
  verifie_le timestamptz,
  created_at timestamptz not null default now(),
  primary key (user_id, rapport_id)
);
alter table public.suivis enable row level security;
create policy "suivis : lecture des siens" on public.suivis for select to authenticated using (user_id = (select auth.uid()));
create policy "suivis : ajout des siens" on public.suivis for insert to authenticated with check (user_id = (select auth.uid()));
create policy "suivis : modification des siens" on public.suivis for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "suivis : suppression des siens" on public.suivis for delete to authenticated using (user_id = (select auth.uid()));
grant select, insert, update, delete on public.suivis to authenticated;
revoke all on public.suivis from anon;

-- Met à jour les suivis de la personne avec le dernier prix connu de la base du marché (collectes, alertes, imports).
create or replace function public.suivis_verifier()
returns setof public.suivis language plpgsql security definer set search_path = '' as $$
begin
  update public.suivis s set
    dernier_prix = coalesce(d.prix, s.dernier_prix),
    statut = case
      when d.fin is not null and d.fin < now() - interval '21 days' then 'disparue'
      when d.prix is not null and s.prix_conseille is not null and d.prix <= s.prix_conseille then 'sous_conseille'
      when d.prix is not null and s.prix_initial is not null and d.prix < s.prix_initial then 'baisse'
      else 'suivi' end,
    verifie_le = now()
  from (
    select s2.rapport_id,
      (select p.prix from public.prix_vus p where p.annonce = s2.annonce order by p.vu_le desc limit 1) as prix,
      greatest((select max(ca.vu_le) from public.cote_annonces ca where ca.id = s2.annonce),
               (select max(a.derniere_vue) from public.annonces a where a.id = s2.annonce),
               (select max(m.vu_le) from public.marche_annonces m where m.id = 'lbc:' || s2.annonce)) as fin
    from public.suivis s2 where s2.user_id = (select auth.uid())
  ) d
  where s.user_id = (select auth.uid()) and s.rapport_id = d.rapport_id;
  return query select * from public.suivis where user_id = (select auth.uid()) order by created_at desc;
end $$;
revoke execute on function public.suivis_verifier() from public, anon;
grant execute on function public.suivis_verifier() to authenticated;

-- Un prix vérifié à la main (import de l'annonce par son lien) rejoint l'historique.
create or replace function public.prix_constate(p_annonce text, p_prix integer)
returns void language sql security definer set search_path = '' as $$
  insert into public.prix_vus (annonce, prix)
  select p_annonce, p_prix
  where p_annonce ~ '^\d{6,14}$' and p_prix between 300 and 500000
    and exists (select 1 from public.suivis s where s.user_id = (select auth.uid()) and s.annonce = p_annonce)
    and (select p.prix from public.prix_vus p where p.annonce = p_annonce order by p.vu_le desc limit 1) is distinct from p_prix;
$$;
revoke execute on function public.prix_constate(text, integer) from public, anon;
grant execute on function public.prix_constate(text, integer) to authenticated;

-- ---------------------------------------------------------------- 6. Mesure de justesse (page Administration, clé serveur seulement)
-- a) Les annonces bien placées face à la cote partent-elles plus vite ? Annonces disparues de Leboncoin (vendues ou retirées),
--    durée en ligne selon l'écart à la cote de leur génération (prix ramenés à l'année et au kilométrage médians).
-- b) Couverture : part des analyses sans cote ; verdicts ; retours « ce chiffre est faux ».
create or replace function public.justesse_analyse()
returns jsonb language sql stable security definer set search_path = '' as $$
  with base as (
    select ca.cle, ca.prix, ca.annee, ca.km, ca.publie_le, ca.vu_le,
      case when c.complete and c.maj is not null then ca.vu_le >= c.maj - interval '3 hours' else ca.vu_le >= now() - interval '21 days' end as en_ligne
    from public.cote_annonces ca left join public.cotes c on c.cle = ca.cle
    where ca.prix between 300 and 300000 and ca.annee is not null and ca.km is not null
  ), ref as (
    select cle, percentile_cont(0.5) within group (order by annee) as an, percentile_cont(0.5) within group (order by km) as k
    from base group by cle having count(*) >= 20
  ), adj as (
    select b.*, b.prix * greatest(0.65, least(1.35, (1 + 0.07 * (r.an - b.annee)) * (1 - 0.035 * (r.k - b.km) / 10000.0))) as p
    from base b join ref r using (cle)
  ), cote as (
    select cle, percentile_cont(0.5) within group (order by p) as med from adj group by cle
  ), pos as (
    select a.*, (c.med - a.p) / nullif(c.med, 0) as ecart,
      case when not a.en_ligne and a.publie_le is not null then extract(epoch from (a.vu_le - a.publie_le)) / 86400 end as jours
    from adj a join cote c using (cle)
  ), tranches as (
    select case when ecart >= 0.08 then 1 when ecart >= 0.03 then 2 when ecart > -0.03 then 3 when ecart > -0.1 then 4 else 5 end as t, *
    from pos
  )
  select jsonb_build_object(
    'tranches', (select jsonb_agg(x order by x.t) from (
      select t, (array['8 % ou plus sous la cote', '3 à 8 % sous la cote', 'Au prix de la cote', '3 à 10 % au-dessus', 'Plus de 10 % au-dessus'])[t] as l,
        count(*) as annonces,
        count(*) filter (where not en_ligne) as disparues,
        round((percentile_cont(0.5) within group (order by jours) filter (where jours between 0 and 365))::numeric, 1) as jours_median,
        round(100.0 * count(*) filter (where jours between 0 and 15) / nullif(count(*) filter (where jours between 0 and 365), 0)) as pct_15j
      from tranches group by t) x),
    'rapports', (select jsonb_build_object(
        'total', count(*),
        'trente_jours', count(*) filter (where created_at >= now() - interval '30 days'),
        'sans_cote', count(*) filter (where resultat->'cote' is null or resultat->'cote' = 'null'::jsonb),
        'avec_bilan', count(*) filter (where resultat ? 'bilan'))
      from public.rapports),
    'verdicts', (select coalesce(jsonb_object_agg(v, n), '{}'::jsonb) from (select coalesce(verdict, '—') v, count(*) n from public.rapports where created_at >= now() - interval '90 days' group by 1) z),
    'retours', (select coalesce(jsonb_agg(jsonb_build_object('champ', champ, 'outil', valeur_outil, 'juste', valeur_juste, 'commentaire', commentaire, 'le', created_at, 'rapport', rapport_id) order by created_at desc), '[]'::jsonb)
      from (select * from public.retours_analyse order by created_at desc limit 50) r),
    'prix_vus', (select count(*) from public.prix_vus));
$$;
revoke execute on function public.justesse_analyse() from public, anon, authenticated;
