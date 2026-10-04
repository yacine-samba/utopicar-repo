-- 1. Crédits d'analyse à l'unité : packs payés une fois, sans abonnement (formule Découverte surtout).
--    Un crédit sert quand le quota de la formule est épuisé. Les crédits restent valables 12 mois après le dernier achat.
create table if not exists public.credits (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  delta integer not null check (delta <> 0),
  motif text not null check (motif in ('achat', 'analyse', 'offert', 'expiration')),
  pack text,
  stripe_session_id text unique,
  rapport_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists credits_user_idx on public.credits (user_id, created_at desc);
alter table public.credits enable row level security;
create policy "credits : lecture par le titulaire" on public.credits
  for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.credits_solde(p_uid uuid)
returns integer language sql stable security definer set search_path = '' as $$
  select case when max(c.created_at) filter (where c.delta > 0) >= now() - interval '12 months'
              then greatest(0, coalesce(sum(c.delta), 0))::int else 0 end
  from public.credits c where c.user_id = p_uid;
$$;
revoke execute on function public.credits_solde(uuid) from public, anon, authenticated;
grant execute on function public.credits_solde(uuid) to service_role;

create or replace function public.mes_credits()
returns integer language sql stable security definer set search_path = '' as $$
  select public.credits_solde((select auth.uid()));
$$;
revoke execute on function public.mes_credits() from public, anon;
grant execute on function public.mes_credits() to authenticated;

-- Ajout de crédits (paiement Stripe confirmé, ou crédits offerts à la main). Sans effet si la session Stripe est déjà comptée.
--   Offrir 5 crédits : select public.credits_ajouter('<id du compte>', 5, null, null, 'offert');
create or replace function public.credits_ajouter(p_uid uuid, p_n integer, p_pack text, p_session text, p_motif text default 'achat')
returns integer language plpgsql security definer set search_path = '' as $$
declare v_reste int;
begin
  if p_n is null or p_n <= 0 or p_n > 1000 then raise exception 'Nombre de crédits invalide'; end if;
  if p_motif not in ('achat', 'offert') then raise exception 'Motif invalide'; end if;
  perform pg_advisory_xact_lock(hashtext('credits:' || p_uid::text));
  if p_session is not null and exists (select 1 from public.credits where stripe_session_id = p_session) then
    return public.credits_solde(p_uid);
  end if;
  -- Anciens crédits expirés : remis à zéro avant d'ajouter les nouveaux.
  select coalesce(sum(delta), 0) into v_reste from public.credits where user_id = p_uid;
  if v_reste > 0 and public.credits_solde(p_uid) = 0 then
    insert into public.credits (user_id, delta, motif) values (p_uid, -v_reste, 'expiration');
  end if;
  insert into public.credits (user_id, delta, motif, pack, stripe_session_id) values (p_uid, p_n, p_motif, p_pack, p_session);
  return public.credits_solde(p_uid);
end $$;
revoke execute on function public.credits_ajouter(uuid, integer, text, text, text) from public, anon, authenticated;
grant execute on function public.credits_ajouter(uuid, integer, text, text, text) to service_role;

-- 2. Quota : celui de la formule, puis les crédits. Sérénité n'est plus proposée mais reste comptée pour un éventuel abonné.
create or replace function public.quota_formule(p_uid uuid)
returns integer language sql stable security definer set search_path = '' as $$
  with f as (select public.formule_de(p_uid) as o, coalesce((select illimite from public.profils where id = p_uid), false) as ill),
  q as (select case o when 'gratuit' then 1 when 'essentiel' then 10 when 'serenite' then 30 when 'starter' then 30 when 'croissance' then 100 when 'pro' then 400 else 1 end as n,
               o <> 'gratuit' as mois, ill from f)
  select case when q.ill then 1000000 else greatest(0, q.n - (
    select count(*)::int from public.usages u where u.user_id = p_uid
      and (not q.mois or u.created_at >= date_trunc('month', now() at time zone 'UTC') at time zone 'UTC'))) end
  from q;
$$;
revoke execute on function public.quota_formule(uuid) from public, anon, authenticated;
grant execute on function public.quota_formule(uuid) to service_role;

create or replace function public.analyses_restantes(p_uid uuid)
returns integer language sql stable security definer set search_path = '' as $$
  select least(1000000, public.quota_formule(p_uid) + public.credits_solde(p_uid));
$$;
revoke execute on function public.analyses_restantes(uuid) from public, anon, authenticated;
grant execute on function public.analyses_restantes(uuid) to service_role;

-- Une analyse au-delà du quota de la formule consomme un crédit (enregistré avec le rapport).
create or replace function public.enregistrer_analyse(
  p_mode text, p_titre text, p_marque text, p_prix integer, p_verdict text, p_marge integer, p_note integer, p_annonce text, p_resultat jsonb
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  rid uuid;
  par_credit boolean;
begin
  if uid is null then raise exception 'non connecté' using errcode = '28000'; end if;
  if p_mode not in ('particulier', 'benef') then raise exception 'mode inconnu' using errcode = '22023'; end if;
  if pg_column_size(p_resultat) > 400000 then raise exception 'résultat trop volumineux' using errcode = '22023'; end if;
  perform pg_advisory_xact_lock(hashtext('credits:' || uid::text));
  par_credit := public.quota_formule(uid) <= 0 and public.credits_solde(uid) > 0;
  insert into public.usages (user_id, mode) values (uid, p_mode);
  insert into public.rapports (user_id, mode, titre, marque, prix, verdict, marge, note, annonce, resultat)
  values (uid, p_mode, left(coalesce(nullif(trim(p_titre), ''), 'Annonce'), 140), left(p_marque, 60), p_prix, left(p_verdict, 40), p_marge, p_note, left(p_annonce, 8000), p_resultat)
  returning id into rid;
  if par_credit then
    insert into public.credits (user_id, delta, motif, rapport_id) values (uid, -1, 'analyse', rid);
  end if;
  return rid;
end;
$$;
revoke execute on function public.enregistrer_analyse(text, text, text, integer, text, integer, integer, text, jsonb) from public, anon;
grant execute on function public.enregistrer_analyse(text, text, text, integer, text, integer, integer, text, jsonb) to authenticated;

-- Vue d'ensemble des comptes : le solde de crédits en plus.
create or replace view public.comptes_admin with (security_invoker = true) as
select p.email, p.prenom, p.famille, public.formule_de(p.id) as formule_active, p.formule_offerte, p.offerte_jusqu_au,
  a.offre as offre_stripe, a.statut as statut_stripe, a.periode_fin as stripe_fin_periode,
  (select count(*) from public.usages u where u.user_id = p.id and u.created_at >= date_trunc('month', now())) as analyses_ce_mois,
  (select count(*) from public.rapports r where r.user_id = p.id) as rapports,
  p.created_at as inscrit_le, p.id, p.illimite,
  public.credits_solde(p.id) as credits
from public.profils p left join public.abonnements a on a.user_id = p.id
order by p.created_at desc;
revoke all on public.comptes_admin from public, anon, authenticated;

-- 3. Alertes e-mail (recherches suivies sur Leboncoin) ouvertes à Benef Pro, avec des limites :
--    Pro : 3 alertes, un passage toutes les 3 heures au plus souvent. Illimité : 20 alertes, toutes les heures.
create or replace function public.alertes_droits(p_uid uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select case
    when coalesce((select illimite from public.profils where id = p_uid), false) then '{"max": 20, "freq_min": 60}'::jsonb
    when public.formule_de(p_uid) = 'pro' then '{"max": 3, "freq_min": 180}'::jsonb
    else '{"max": 0, "freq_min": 1440}'::jsonb end;
$$;
revoke execute on function public.alertes_droits(uuid) from public, anon, authenticated;
grant execute on function public.alertes_droits(uuid) to service_role;

create or replace function public.mes_droits_alertes()
returns jsonb language sql stable security definer set search_path = '' as $$
  select public.alertes_droits((select auth.uid()));
$$;
revoke execute on function public.mes_droits_alertes() from public, anon;
grant execute on function public.mes_droits_alertes() to authenticated;

create or replace function public.peut_alertes()
returns boolean language sql stable security definer set search_path = '' as $$
  select (public.alertes_droits((select auth.uid()))->>'max')::int > 0;
$$;
revoke execute on function public.peut_alertes() from public, anon;
grant execute on function public.peut_alertes() to authenticated;

create or replace function public.mes_alertes()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.peut_alertes() then raise exception 'Alertes réservées à Benef Pro' using errcode = '42501'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', v.id, 'nom', v.nom, 'actif', v.actif, 'notifier', v.notifier, 'email', v.email, 'intervalle_min', v.intervalle_min,
      'filtres', v.filtres, 'derniere_execution', v.derniere_execution, 'derniere_erreur', v.derniere_erreur, 'derniers_nouveaux', v.derniers_nouveaux,
      'en_cours', v.run_id is not null, 'created_at', v.created_at,
      'passages', (select count(*) from public.veille_passages p where p.veille_id = v.id and p.statut = 'ok'),
      'mails', (select count(*) from public.veille_passages p where p.veille_id = v.id and p.mail = 'envoyé'),
      'annonces', coalesce((select jsonb_agg(a order by a.vu desc) from (
          select an.id, an.url, an.titre, an.prix, an.annee, an.km, an.energie, an.boite, an.ville, an.cp, an.vendeur_type, an.vignette,
                 coalesce(an.publie_le, an.premiere_vue) as vu
          from public.annonces an where v.id = any (an.veilles)
          order by coalesce(an.publie_le, an.premiere_vue) desc nulls last limit 30) a), '[]'::jsonb)
    ) order by v.created_at desc)
    from public.veilles v where v.user_id = (select auth.uid()) and v.supprimee_le is null), '[]'::jsonb);
end $$;

create or replace function public.alerte_enregistrer(p jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  d jsonb := public.alertes_droits((select auth.uid()));
  v_id uuid := nullif(p->>'id', '')::uuid;
  v_int int := greatest((d->>'freq_min')::int, least(1440, coalesce((p->>'intervalle_min')::int, 60)));
  v_nom text := left(coalesce(nullif(trim(p->>'nom'), ''), 'Ma recherche'), 80);
  v_mail text := nullif(trim(coalesce(p->>'email', '')), '');
  v_f jsonb := coalesce(p->'filtres', '{}'::jsonb);
begin
  if (d->>'max')::int = 0 then raise exception 'Alertes réservées à Benef Pro' using errcode = '42501'; end if;
  if jsonb_typeof(v_f) <> 'object' then raise exception 'Filtres invalides'; end if;
  if v_mail is not null and v_mail !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Adresse e-mail invalide'; end if;
  if v_mail is null then select u.email into v_mail from auth.users u where u.id = (select auth.uid()); end if;
  if v_id is null then
    if (select count(*) from public.veilles where user_id = (select auth.uid()) and supprimee_le is null) >= (d->>'max')::int then
      raise exception '% alertes au maximum avec votre formule', (d->>'max');
    end if;
    insert into public.veilles (nom, actif, notifier, email, intervalle_min, filtres, user_id, nb_par_passage, details)
    values (v_nom, coalesce((p->>'actif')::boolean, true), coalesce((p->>'notifier')::boolean, true), v_mail, v_int, v_f, (select auth.uid()), 20, false)
    returning id into v_id;
  else
    update public.veilles set nom = v_nom, actif = coalesce((p->>'actif')::boolean, actif), notifier = coalesce((p->>'notifier')::boolean, notifier),
      email = v_mail, intervalle_min = v_int, filtres = v_f, prochain_nb = null
    where id = v_id and user_id = (select auth.uid()) and supprimee_le is null;
    if not found then raise exception 'Alerte introuvable'; end if;
  end if;
  return v_id;
end $$;

create or replace function public.alerte_basculer(p_id uuid, p_actif boolean, p_notifier boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.peut_alertes() then raise exception 'Alertes réservées à Benef Pro' using errcode = '42501'; end if;
  update public.veilles set actif = coalesce(p_actif, actif), notifier = coalesce(p_notifier, notifier)
  where id = p_id and user_id = (select auth.uid()) and supprimee_le is null;
end $$;

-- La suppression reste possible même après la fin de la formule.
create or replace function public.alerte_retirer(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.veilles set actif = false, notifier = false, supprimee_le = now()
  where id = p_id and user_id = (select auth.uid());
end $$;

create or replace function public.alerte_lancer(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.peut_alertes() then raise exception 'Alertes réservées à Benef Pro' using errcode = '42501'; end if;
  if not exists (select 1 from public.veilles where id = p_id and user_id = (select auth.uid()) and supprimee_le is null
                 and run_id is null and (derniere_execution is null or derniere_execution < now() - make_interval(mins => case when (public.mes_droits_alertes()->>'max')::int >= 20 then 5 else 15 end))) then
    raise exception 'Recherche déjà en cours ou lancée il y a quelques minutes';
  end if;
  perform public.lancer_veille_force(p_id);
end $$;
