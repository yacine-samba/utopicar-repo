-- Gestion des formules à la main depuis Supabase (Table Editor › profils) et enregistrement des analyses sans clé service.

-- ---------------------------------------------------------------- formule attribuée à la main
do $$ begin
  create type public.formule as enum ('gratuit', 'essentiel', 'serenite', 'starter', 'croissance', 'pro');
exception when duplicate_object then null;
end $$;

alter table public.profils
  add column if not exists email text,
  add column if not exists formule_offerte public.formule,
  add column if not exists offerte_jusqu_au date;

comment on column public.profils.email is 'Copie de l''email du compte, pour retrouver la personne dans le Table Editor.';
comment on column public.profils.formule_offerte is 'Formule attribuée à la main : prioritaire sur Stripe. Vide = la formule payée sur Stripe (ou Découverte).';
comment on column public.profils.offerte_jusqu_au is 'Dernier jour de la formule attribuée à la main. Vide = sans date de fin.';

update public.profils p set email = u.email from auth.users u where u.id = p.id and p.email is distinct from u.email;

create or replace function public.creer_profil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profils (id, email, prenom, famille, onboarding)
  values (
    new.id,
    new.email,
    left(coalesce(new.raw_user_meta_data ->> 'prenom', ''), 60),
    case when new.raw_user_meta_data ->> 'famille' in ('particulier', 'benef') then new.raw_user_meta_data ->> 'famille' end,
    coalesce(new.raw_user_meta_data -> 'onboarding', '{}'::jsonb)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke execute on function public.creer_profil() from public, anon, authenticated;

-- Pas de changement d'email dans l'interface : la copie est faite à la création du compte.

-- ---------------------------------------------------------------- formule en vigueur
create or replace function public.formule_de(uid uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.formule_offerte::text from public.profils p
      where p.id = uid and p.formule_offerte is not null
        and (p.offerte_jusqu_au is null or p.offerte_jusqu_au >= current_date)),
    (select a.offre from public.abonnements a
      where a.user_id = uid and a.statut in ('active', 'trialing', 'past_due')),
    'gratuit'
  );
$$;
-- Réservée aux règles et aux vues : personne ne l'appelle directement.
revoke execute on function public.formule_de(uuid) from public, anon, authenticated;

create or replace function public.a_offre(offres text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.formule_de((select auth.uid())) = any (offres);
$$;
revoke execute on function public.a_offre(text[]) from public, anon;
grant execute on function public.a_offre(text[]) to authenticated;

-- ---------------------------------------------------------------- vue d'ensemble (lecture seule, tableau de bord Supabase uniquement)
create or replace view public.comptes_admin with (security_invoker = true) as
select
  p.email,
  p.prenom,
  p.famille,
  public.formule_de(p.id) as formule_active,
  p.formule_offerte,
  p.offerte_jusqu_au,
  a.offre as offre_stripe,
  a.statut as statut_stripe,
  a.periode_fin as stripe_fin_periode,
  (select count(*) from public.usages u where u.user_id = p.id and u.created_at >= date_trunc('month', now())) as analyses_ce_mois,
  (select count(*) from public.rapports r where r.user_id = p.id) as rapports,
  p.created_at as inscrit_le,
  p.id
from public.profils p
left join public.abonnements a on a.user_id = p.id
order by p.created_at desc;
revoke all on public.comptes_admin from public, anon, authenticated;
comment on view public.comptes_admin is 'Tous les comptes et leur formule. Pour changer une formule : table profils, colonne formule_offerte.';

-- ---------------------------------------------------------------- enregistrement d'une analyse (appelé par le serveur avec la session de la personne)
create or replace function public.enregistrer_analyse(
  p_mode text, p_titre text, p_marque text, p_prix integer, p_verdict text, p_marge integer, p_note integer, p_annonce text, p_resultat jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  rid uuid;
begin
  if uid is null then raise exception 'non connecté' using errcode = '28000'; end if;
  if p_mode not in ('particulier', 'benef') then raise exception 'mode inconnu' using errcode = '22023'; end if;
  if pg_column_size(p_resultat) > 400000 then raise exception 'résultat trop volumineux' using errcode = '22023'; end if;
  insert into public.usages (user_id, mode) values (uid, p_mode);
  insert into public.rapports (user_id, mode, titre, marque, prix, verdict, marge, note, annonce, resultat)
  values (uid, p_mode, left(coalesce(nullif(trim(p_titre), ''), 'Annonce'), 140), left(p_marque, 60), p_prix, left(p_verdict, 40), p_marge, p_note, left(p_annonce, 8000), p_resultat)
  returning id into rid;
  return rid;
end;
$$;
revoke execute on function public.enregistrer_analyse(text, text, text, integer, text, integer, integer, text, jsonb) from public, anon;
grant execute on function public.enregistrer_analyse(text, text, text, integer, text, integer, integer, text, jsonb) to authenticated;
