-- Revue du site du 21 oct. 2026 : ce que la base doit garantir elle-même.
-- 1. Quota d'analyses : enregistrer_analyse acceptait tout, même sans analyse restante ; des analyses lancées en
--    parallèle (plusieurs instances du site) passaient toutes. Elle refuse désormais (code P0003) quand la formule,
--    le code offert et les crédits sont épuisés. Le verrou par compte (pg_advisory_xact_lock) rend le décompte sûr.
-- 2. Enregistrement réservé au serveur : appelée directement par l'API REST avec un résultat inventé, elle créait un
--    « rapport Utopicar » partageable. Nouvelle fonction enregistrer_analyse_pour (rôle service seulement) ;
--    l'ancienne n'est plus exécutable par les comptes.
-- 3. option_active : un compte ne peut plus interroger l'offre d'un autre (le serveur et la fonction messages, en rôle
--    service, le peuvent toujours).
-- 4. formule_de : une formule offerte « Pro + Messages » a les droits de Pro (comme un abonnement).
-- 5. Réglages du profil fusionnés dans la base (profil_reglages) : deux écritures ne s'effacent plus.
-- 6. Limites d'appels partagées entre les instances du site (limite_appel), au lieu d'un compteur par instance.

-- 4. ---------------------------------------------------------------------------------------------------------------
alter type public.formule add value if not exists 'pro_messages';

create or replace function public.formule_de(uid uuid)
returns text language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select 'pro' from public.profils p where p.id = uid and p.illimite),
    -- Pro + Messages, offerte ou payée : les droits de Pro
    (select case p.formule_offerte::text when 'pro_messages' then 'pro' else p.formule_offerte::text end from public.profils p
      where p.id = uid and p.formule_offerte is not null
        and (p.offerte_jusqu_au is null or p.offerte_jusqu_au >= current_date)),
    (select case a.offre when 'pro_messages' then 'pro' else a.offre end from public.abonnements a
      where a.user_id = uid and a.statut in ('active', 'trialing', 'past_due')),
    'gratuit'
  );
$$;

-- option_active : Messages compris aussi dans une formule offerte « Pro + Messages »
create or replace function public.option_active(p_uid uuid, p_option text)
returns boolean language sql stable security definer set search_path = '' as $$
  select case
    -- un compte n'interroge que lui-même ; le rôle service (serveur, fonction messages) interroge qui il veut
    when (select auth.role()) is distinct from 'service_role' and p_uid is distinct from (select auth.uid()) then false
    else coalesce((select illimite from public.profils where id = p_uid), false)
      or (public.formule_de(p_uid) = 'pro' and exists (
            select 1 from public.options_comptes o where o.user_id = p_uid and o.option = p_option
              and (o.offerte or o.statut in ('active', 'trialing', 'past_due'))))
      -- Messages compris dans la formule Pro + Messages
      or (p_option = 'messages' and (
            exists (select 1 from public.abonnements a where a.user_id = p_uid and a.offre = 'pro_messages'
                      and a.statut in ('active', 'trialing', 'past_due'))
            or exists (select 1 from public.profils p where p.id = p_uid and p.formule_offerte::text = 'pro_messages'
                      and (p.offerte_jusqu_au is null or p.offerte_jusqu_au >= current_date))))
  end;
$$;

-- 1 et 2. -----------------------------------------------------------------------------------------------------------
create or replace function public.enregistrer_analyse_pour(
  p_uid uuid, p_mode text, p_titre text, p_marque text, p_prix integer, p_verdict text, p_marge integer, p_note integer, p_annonce text, p_resultat jsonb
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  rid uuid;
  benef_hors_formule boolean;
  v_code boolean;
  v_credit boolean;
begin
  if (select auth.role()) is distinct from 'service_role' then raise exception 'réservé au serveur' using errcode = '42501'; end if;
  if p_uid is null then raise exception 'compte manquant' using errcode = '22023'; end if;
  if p_mode not in ('particulier', 'benef') then raise exception 'mode inconnu' using errcode = '22023'; end if;
  if pg_column_size(p_resultat) > 400000 then raise exception 'résultat trop volumineux' using errcode = '22023'; end if;
  perform pg_advisory_xact_lock(hashtext('credits:' || p_uid::text));
  -- plus rien de disponible (formule, code offert, crédits) : l'analyse n'est ni enregistrée ni livrée
  if public.quota_formule(p_uid) <= 0 and public.code_solde(p_uid) <= 0 and public.credits_solde(p_uid) <= 0 then
    raise exception 'plus d''analyse disponible' using errcode = 'P0003';
  end if;
  benef_hors_formule := p_mode = 'benef' and public.formule_de(p_uid) not in ('starter', 'croissance', 'pro');
  v_code := public.code_solde(p_uid) > 0 and (benef_hors_formule or public.quota_formule(p_uid) <= 0);
  v_credit := not v_code and public.quota_formule(p_uid) <= 0 and public.credits_solde(p_uid) > 0;
  insert into public.usages (user_id, mode, par_code) values (p_uid, p_mode, v_code);
  insert into public.rapports (user_id, mode, titre, marque, prix, verdict, marge, note, annonce, resultat)
  values (p_uid, p_mode, left(coalesce(nullif(trim(p_titre), ''), 'Annonce'), 140), left(p_marque, 60), p_prix, left(p_verdict, 40), p_marge, p_note, left(p_annonce, 8000), p_resultat)
  returning id into rid;
  if v_credit then
    insert into public.credits (user_id, delta, motif, rapport_id) values (p_uid, -1, 'analyse', rid);
  end if;
  return rid;
end;
$$;
revoke execute on function public.enregistrer_analyse_pour(uuid, text, text, text, integer, text, integer, integer, text, jsonb) from public, anon, authenticated;
grant execute on function public.enregistrer_analyse_pour(uuid, text, text, text, integer, text, integer, integer, text, jsonb) to service_role;

-- l'ancienne (au nom du compte) : même refus du quota tout de suite ; elle sera retirée aux comptes une fois le site
-- passé à enregistrer_analyse_pour (migration suivante), pour ne pas couper les analyses entre les deux déploiements
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
  if public.quota_formule(uid) <= 0 and public.code_solde(uid) <= 0 and public.credits_solde(uid) <= 0 then
    raise exception 'plus d''analyse disponible' using errcode = 'P0003';
  end if;
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

-- 5. ---------------------------------------------------------------------------------------------------------------
-- Réglages du profil : les clés envoyées remplacent les mêmes clés, les autres restent (profil d'analyse, favoris…).
create or replace function public.profil_reglages(p jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r jsonb;
begin
  if (select auth.uid()) is null then raise exception 'non connecté' using errcode = '28000'; end if;
  if jsonb_typeof(p) <> 'object' or pg_column_size(p) > 20000 then raise exception 'réglages invalides' using errcode = '22023'; end if;
  update public.profils set reglages = coalesce(reglages, '{}'::jsonb) || p, updated_at = now()
  where id = (select auth.uid())
  returning reglages into r;
  return r;
end;
$$;
revoke execute on function public.profil_reglages(jsonb) from public, anon;
grant execute on function public.profil_reglages(jsonb) to authenticated;

-- 6. ---------------------------------------------------------------------------------------------------------------
-- Compteurs par fenêtre fixe (clé de la route, adresse IP ou compte). Lus et écrits par le serveur seulement.
create table if not exists public.limites_appels (
  cle text not null,
  ident text not null,
  debut timestamptz not null,
  n integer not null default 0,
  primary key (cle, ident, debut)
);
alter table public.limites_appels enable row level security;
revoke all on public.limites_appels from public, anon, authenticated;

create or replace function public.limite_appel(p_cle text, p_ident text, p_max integer, p_fenetre_s integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_debut timestamptz := to_timestamp(floor(extract(epoch from now()) / greatest(p_fenetre_s, 1)) * greatest(p_fenetre_s, 1));
  v_n integer;
begin
  insert into public.limites_appels as l (cle, ident, debut, n) values (left(p_cle, 40), left(p_ident, 120), v_debut, 1)
  on conflict (cle, ident, debut) do update set n = l.n + 1
  returning n into v_n;
  -- ménage de temps en temps : les fenêtres de plus d'un jour ne servent plus
  if random() < 0.01 then delete from public.limites_appels where debut < now() - interval '1 day'; end if;
  return v_n > p_max;
end;
$$;
revoke execute on function public.limite_appel(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.limite_appel(text, text, integer, integer) to service_role;
