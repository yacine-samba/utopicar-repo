-- Analyses restantes d'un compte (même règle que le site : quota de la formule, par mois sauf la formule gratuite).
-- Sert à la fonction « annonce » : pas d'import Leboncoin (payant) sans analyse disponible.
create or replace function public.analyses_restantes(p_uid uuid)
returns integer language sql stable security definer set search_path = '' as $$
  with f as (select public.formule_de(p_uid) as o, coalesce((select illimite from public.profils where id = p_uid), false) as ill),
  q as (select case o when 'gratuit' then 1 when 'essentiel' then 10 when 'serenite' then 30 when 'starter' then 30 when 'croissance' then 100 when 'pro' then 400 else 1 end as n,
               o <> 'gratuit' as mois, ill from f)
  select case when q.ill then 1000000 else greatest(0, q.n - (
    select count(*)::int from public.usages u where u.user_id = p_uid
      and (not q.mois or u.created_at >= date_trunc('month', now() at time zone 'UTC') at time zone 'UTC'))) end
  from q;
$$;
revoke execute on function public.analyses_restantes(uuid) from public, anon, authenticated;
grant execute on function public.analyses_restantes(uuid) to service_role;
