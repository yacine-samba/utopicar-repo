-- Chiffres publics du site (13 oct. 2026) : nombre d'inscrits affiché en direct sur l'accueil, les tarifs et l'inscription.
-- Ne compte ni les comptes de l'équipe (admin, illimité) ni ceux marqués hors_stats (comptes de test).
-- Lecture seulement par le serveur (service_role, route /api/stats) : rien d'autre qu'un nombre ne sort, jamais une adresse.
--   Exclure un compte de test : update public.profils set hors_stats = true where id = '<uuid>';

alter table public.profils add column if not exists hors_stats boolean not null default false;
comment on column public.profils.hors_stats is 'Compte de test ou de l''équipe : jamais compté dans les chiffres publics du site.';

create or replace function public.stats_publiques()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'inscrits', count(*),
    'semaine', count(*) filter (where u.created_at >= now() - interval '7 days'))
  from public.profils p join auth.users u on u.id = p.id   -- date d'inscription réelle (celle du profil a pu être recréée)
  where not p.hors_stats and not coalesce(p.admin, false) and not coalesce(p.illimite, false);
$$;
revoke execute on function public.stats_publiques() from public, anon, authenticated;
grant execute on function public.stats_publiques() to service_role;
