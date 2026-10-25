-- Formule « Pro + Messages » (17 oct. 2026) : Benef Pro avec l'option Messages Leboncoin comprise, un seul abonnement.
-- Elle est enregistrée telle quelle dans abonnements (offre = 'pro_messages') et vaut 'pro' pour tous les droits
-- (formule_de : parc, recherche, alertes, quota de 400 analyses) ; option_active('messages') est vraie tant qu'elle est active.
-- Un passage à Pro depuis le portail Stripe retire donc les messages tout seul.
-- À APPLIQUER AVANT la mise en ligne du code : sans elle, un abonnement Pro + Messages serait refusé par la base.

alter table public.abonnements drop constraint if exists abonnements_offre_check;
alter table public.abonnements add constraint abonnements_offre_check
  check (offre = any (array['essentiel', 'serenite', 'starter', 'croissance', 'pro', 'pro_messages']));

create or replace function public.formule_de(uid uuid)
returns text language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select 'pro' from public.profils p where p.id = uid and p.illimite),
    (select p.formule_offerte::text from public.profils p
      where p.id = uid and p.formule_offerte is not null
        and (p.offerte_jusqu_au is null or p.offerte_jusqu_au >= current_date)),
    -- Pro + Messages : les droits de Pro
    (select case a.offre when 'pro_messages' then 'pro' else a.offre end from public.abonnements a
      where a.user_id = uid and a.statut in ('active', 'trialing', 'past_due')),
    'gratuit'
  );
$$;

create or replace function public.option_active(p_uid uuid, p_option text)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select illimite from public.profils where id = p_uid), false)
      or (public.formule_de(p_uid) = 'pro' and exists (
            select 1 from public.options_comptes o where o.user_id = p_uid and o.option = p_option
              and (o.offerte or o.statut in ('active', 'trialing', 'past_due'))))
      -- Messages compris dans la formule Pro + Messages
      or (p_option = 'messages' and exists (
            select 1 from public.abonnements a where a.user_id = p_uid and a.offre = 'pro_messages'
              and a.statut in ('active', 'trialing', 'past_due')));
$$;
