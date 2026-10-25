-- Codes offerts (11 oct. 2026) : un code donne des analyses Benef offertes, une fois par compte.
-- Premier code : TIKTOK, 3 analyses Benef (marge nette, prix d'offre, prix max), annoncé à la fin des vidéos TikTok.
-- Ces analyses passent avant les crédits ; en usage Benef sur une formule non Benef, elles passent avant l'analyse
-- offerte de Découverte (qui reste disponible pour une analyse particulier).
--   Désactiver un code : update public.codes_offerts set actif = false where code = 'TIKTOK';
--   Nouveau code       : insert into public.codes_offerts (code, analyses) values ('NOUVEAU', 3);

-- 1. Les codes et leur utilisation
create table if not exists public.codes_offerts (
  code text primary key check (code = upper(code) and length(code) between 3 and 30),
  analyses integer not null check (analyses between 1 and 50),
  actif boolean not null default true,
  fin date,
  created_at timestamptz not null default now()
);
alter table public.codes_offerts enable row level security;   -- aucune lecture directe : on passe par utiliser_code()

create table if not exists public.codes_utilises (
  user_id uuid not null references auth.users (id) on delete cascade,
  code text not null references public.codes_offerts (code),
  analyses integer not null,
  created_at timestamptz not null default now(),
  primary key (user_id, code)
);
alter table public.codes_utilises enable row level security;
create policy "codes_utilises : lecture par le titulaire" on public.codes_utilises
  for select to authenticated using ((select auth.uid()) = user_id);

insert into public.codes_offerts (code, analyses) values ('TIKTOK', 3) on conflict (code) do nothing;

-- 2. Les analyses payées par un code sont marquées : elles ne comptent pas dans le quota de la formule
alter table public.usages add column if not exists par_code boolean not null default false;

create or replace function public.code_solde(p_uid uuid)
returns integer language sql stable security definer set search_path = '' as $$
  select greatest(0,
    coalesce((select sum(c.analyses) from public.codes_utilises c where c.user_id = p_uid), 0)
    - (select count(*) from public.usages u where u.user_id = p_uid and u.par_code))::int;
$$;
revoke execute on function public.code_solde(uuid) from public, anon, authenticated;
grant execute on function public.code_solde(uuid) to service_role;

create or replace function public.mon_code_solde()
returns integer language sql stable security definer set search_path = '' as $$
  select public.code_solde((select auth.uid()));
$$;
revoke execute on function public.mon_code_solde() from public, anon;
grant execute on function public.mon_code_solde() to authenticated;

-- 3. Saisie d'un code par la personne connectée. Renvoie le nombre d'analyses ajoutées.
--    Erreurs : 'code inconnu' (P0002), 'code déjà utilisé' (23505).
create or replace function public.utiliser_code(p_code text)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  c public.codes_offerts;
begin
  if uid is null then raise exception 'non connecté' using errcode = '28000'; end if;
  select * into c from public.codes_offerts
    where code = upper(trim(p_code)) and actif and (fin is null or fin >= current_date);
  if not found then raise exception 'code inconnu' using errcode = 'P0002'; end if;
  if exists (select 1 from public.codes_utilises where user_id = uid and code = c.code) then
    raise exception 'code déjà utilisé' using errcode = '23505';
  end if;
  insert into public.codes_utilises (user_id, code, analyses) values (uid, c.code, c.analyses);
  return c.analyses;
end;
$$;
revoke execute on function public.utiliser_code(text) from public, anon;
grant execute on function public.utiliser_code(text) to authenticated;

-- 4. Quota de la formule : sans les analyses payées par un code (reprise de 20261004120000, seul le filtre change)
create or replace function public.quota_formule(p_uid uuid)
returns integer language sql stable security definer set search_path = '' as $$
  with f as (select public.formule_de(p_uid) as o, coalesce((select illimite from public.profils where id = p_uid), false) as ill),
  q as (select case o when 'gratuit' then 1 when 'essentiel' then 10 when 'serenite' then 30 when 'starter' then 30 when 'croissance' then 100 when 'pro' then 400 else 1 end as n,
               o <> 'gratuit' as mois, ill from f)
  select case when q.ill then 1000000 else greatest(0, q.n - (
    select count(*)::int from public.usages u where u.user_id = p_uid and not u.par_code
      and (not q.mois or u.created_at >= date_trunc('month', now() at time zone 'UTC') at time zone 'UTC'))) end
  from q;
$$;
revoke execute on function public.quota_formule(uuid) from public, anon, authenticated;
grant execute on function public.quota_formule(uuid) to service_role;

create or replace function public.analyses_restantes(p_uid uuid)
returns integer language sql stable security definer set search_path = '' as $$
  select least(1000000, public.quota_formule(p_uid) + public.code_solde(p_uid) + public.credits_solde(p_uid));
$$;
revoke execute on function public.analyses_restantes(uuid) from public, anon, authenticated;
grant execute on function public.analyses_restantes(uuid) to service_role;

-- 5. Décompte d'une analyse : la formule, puis le code, puis les crédits.
--    Une analyse Benef sur une formule non Benef ne peut venir que d'un code.
create or replace function public.enregistrer_analyse(
  p_mode text, p_titre text, p_marque text, p_prix integer, p_verdict text, p_marge integer, p_note integer, p_annonce text, p_resultat jsonb
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  rid uuid;
  benef_hors_formule boolean;
  v_code boolean;
  v_credit boolean;
begin
  if uid is null then raise exception 'non connecté' using errcode = '28000'; end if;
  if p_mode not in ('particulier', 'benef') then raise exception 'mode inconnu' using errcode = '22023'; end if;
  if pg_column_size(p_resultat) > 400000 then raise exception 'résultat trop volumineux' using errcode = '22023'; end if;
  perform pg_advisory_xact_lock(hashtext('credits:' || uid::text));
  benef_hors_formule := p_mode = 'benef' and public.formule_de(uid) not in ('starter', 'croissance', 'pro');
  v_code := public.code_solde(uid) > 0 and (benef_hors_formule or public.quota_formule(uid) <= 0);
  v_credit := not v_code and public.quota_formule(uid) <= 0 and public.credits_solde(uid) > 0;
  insert into public.usages (user_id, mode, par_code) values (uid, p_mode, v_code);
  insert into public.rapports (user_id, mode, titre, marque, prix, verdict, marge, note, annonce, resultat)
  values (uid, p_mode, left(coalesce(nullif(trim(p_titre), ''), 'Annonce'), 140), left(p_marque, 60), p_prix, left(p_verdict, 40), p_marge, p_note, left(p_annonce, 8000), p_resultat)
  returning id into rid;
  if v_credit then
    insert into public.credits (user_id, delta, motif, rapport_id) values (uid, -1, 'analyse', rid);
  end if;
  return rid;
end;
$$;
revoke execute on function public.enregistrer_analyse(text, text, text, integer, text, integer, integer, text, jsonb) from public, anon;
grant execute on function public.enregistrer_analyse(text, text, text, integer, text, integer, integer, text, jsonb) to authenticated;
