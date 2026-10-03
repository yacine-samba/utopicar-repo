alter table public.landing_leads
  add column if not exists prenom text check (prenom is null or length(prenom) between 1 and 60),
  add column if not exists objectif text check (objectif is null or length(objectif) <= 80),
  add column if not exists site text default 'utopicar' check (length(site) <= 40),
  add column if not exists ip_hash text,
  add column if not exists notifie boolean default false;
alter table public.landing_leads drop constraint if exists landing_leads_profil_check;
alter table public.landing_leads add constraint landing_leads_profil_check check (profil is null or profil in ('debutant','marchand','garagiste','particulier','autre'));
-- plus aucun accès direct depuis le navigateur : tout passe par la fonction serveur
drop policy if exists "anon insert leads" on public.landing_leads;
revoke all on public.landing_leads from anon, authenticated;
create index if not exists landing_leads_ip_recent on public.landing_leads (ip_hash, created_at);
