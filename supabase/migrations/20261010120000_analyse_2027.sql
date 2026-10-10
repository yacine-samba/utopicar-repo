-- Analyse 2027, second lot : rapport partageable, retours « ce chiffre est faux », historique des prix et republications,
-- suivi des annonces analysées, réponses du vendeur ajoutées au rapport, mesure de justesse (administration).
-- Les déclencheurs touchent des tables écrites par les collectes : si une collecte tient un verrou, la migration échoue
-- au bout de 15 s au lieu de bloquer le site ; il suffit de la relancer.
set lock_timeout = '15s';

-- ---------------------------------------------------------------- 1. Rapport partageable par lien
alter table public.rapports add column if not exists partage text unique check (partage is null or partage ~ '^[0-9a-f]{32}$');
comment on column public.rapports.partage is 'Jeton du lien public /r/<jeton> (lecture seule, sans les coordonnées du vendeur). Vide : non partagé.';

create or replace function public.rapport_partager(p_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare v text;
begin
  update public.rapports set partage = coalesce(partage, replace(gen_random_uuid()::text, '-', ''))
  where id = p_id and user_id = (select auth.uid())
  returning partage into v;
  return v;
end $$;

create or replace function public.rapport_departager(p_id uuid)
returns void language sql security definer set search_path = '' as $$
  update public.rapports set partage = null where id = p_id and user_id = (select auth.uid());
$$;

-- Lecture publique : jamais le vendeur (prénom, téléphone), ni le texte brut de l'annonce, ni l'identifiant du compte.
create or replace function public.rapport_public(p_jeton text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'titre', r.titre, 'mode', r.mode, 'created_at', r.created_at, 'photos', to_jsonb(r.photos), 'lien', r.lien,
    'resultat', r.resultat - 'vendeur' - 'rapportId' - 'vignettes' - 'restantes')
  from public.rapports r
  where p_jeton ~ '^[0-9a-f]{32}$' and r.partage = p_jeton;
$$;
revoke execute on function public.rapport_partager(uuid), public.rapport_departager(uuid) from public, anon;
grant execute on function public.rapport_partager(uuid), public.rapport_departager(uuid) to authenticated;
revoke execute on function public.rapport_public(text) from public;
grant execute on function public.rapport_public(text) to anon, authenticated;

-- ---------------------------------------------------------------- 2. Réponses du vendeur et mode visite gardés avec le rapport
-- Les compléments ne remplacent rien : l'analyse d'origine reste, le bilan les ajoute (avant / après).
create or replace function public.rapport_reponses(p_id uuid, p_complements jsonb, p_verdict text, p_note integer, p_marge integer)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if jsonb_typeof(p_complements) <> 'array' or pg_column_size(p_complements) > 200000 then
    raise exception 'compléments invalides';
  end if;
  update public.rapports set
    resultat = jsonb_set(resultat, '{complements}', p_complements),
    verdict = coalesce(left(p_verdict, 40), verdict),
    note = coalesce(p_note, note),
    marge = coalesce(p_marge, marge)
  where id = p_id and user_id = (select auth.uid());
end $$;
revoke execute on function public.rapport_reponses(uuid, jsonb, text, integer, integer) from public, anon;
grant execute on function public.rapport_reponses(uuid, jsonb, text, integer, integer) to authenticated;

-- ---------------------------------------------------------------- 3. « Ce chiffre est faux »
create table if not exists public.retours_analyse (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  rapport_id uuid references public.rapports (id) on delete set null,
  champ text not null check (champ in ('verdict', 'fiabilite', 'travaux', 'prix', 'rentabilite', 'usage', 'cote', 'autre')),
  valeur_outil text check (char_length(valeur_outil) <= 80),
  valeur_juste text check (char_length(valeur_juste) <= 80),
  commentaire text check (char_length(commentaire) <= 600),
  created_at timestamptz not null default now()
);
create index if not exists retours_analyse_date_idx on public.retours_analyse (created_at desc);
alter table public.retours_analyse enable row level security;
create policy "retours : ajout des siens" on public.retours_analyse for insert to authenticated with check (user_id = (select auth.uid()));
create policy "retours : lecture des siens" on public.retours_analyse for select to authenticated using (user_id = (select auth.uid()));
grant select, insert on public.retours_analyse to authenticated;
revoke all on public.retours_analyse from anon;

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

drop trigger if exists noter_prix_cote on public.cote_annonces;
create trigger noter_prix_cote after insert or update of prix on public.cote_annonces for each row execute function public.noter_prix();
drop trigger if exists noter_prix_marche on public.marche_annonces;
create trigger noter_prix_marche after insert or update of prix on public.marche_annonces for each row execute function public.noter_prix();
drop trigger if exists noter_prix_suivi on public.annonces;
create trigger noter_prix_suivi after insert or update of prix on public.annonces for each row execute function public.noter_prix();

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
