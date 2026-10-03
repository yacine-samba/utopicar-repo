-- Comptes illimités (administrateurs, testeurs) : toutes les fonctions de Benef Pro, sans limite d'analyses,
-- et libres de passer de l'espace particulier à l'espace Benef. Réglable dans Table Editor › profils › illimite.
alter table public.profils add column if not exists illimite boolean not null default false;
comment on column public.profils.illimite is 'Accès à tout, sans limite d''analyses (administrateurs). La personne ne peut pas modifier cette colonne.';

create or replace function public.formule_de(uid uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select 'pro' from public.profils p where p.id = uid and p.illimite),
    (select p.formule_offerte::text from public.profils p
      where p.id = uid and p.formule_offerte is not null
        and (p.offerte_jusqu_au is null or p.offerte_jusqu_au >= current_date)),
    (select a.offre from public.abonnements a
      where a.user_id = uid and a.statut in ('active', 'trialing', 'past_due')),
    'gratuit'
  );
$$;
revoke execute on function public.formule_de(uuid) from public, anon, authenticated;

-- Vue d'ensemble : la colonne illimite en plus.
create or replace view public.comptes_admin with (security_invoker = true) as
select p.email, p.prenom, p.famille, public.formule_de(p.id) as formule_active, p.formule_offerte, p.offerte_jusqu_au,
  a.offre as offre_stripe, a.statut as statut_stripe, a.periode_fin as stripe_fin_periode,
  (select count(*) from public.usages u where u.user_id = p.id and u.created_at >= date_trunc('month', now())) as analyses_ce_mois,
  (select count(*) from public.rapports r where r.user_id = p.id) as rapports,
  p.created_at as inscrit_le, p.id, p.illimite
from public.profils p left join public.abonnements a on a.user_id = p.id
order by p.created_at desc;
revoke all on public.comptes_admin from public, anon, authenticated;
