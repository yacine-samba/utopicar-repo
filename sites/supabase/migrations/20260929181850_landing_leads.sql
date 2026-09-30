create table if not exists public.landing_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254),
  profil text check (profil in ('debutant','marchand','garagiste','autre')),
  source text default 'landing' check (length(source) <= 60),
  created_at timestamptz not null default now()
);
create unique index if not exists landing_leads_email_uniq on public.landing_leads (lower(email));
alter table public.landing_leads enable row level security;
revoke all on public.landing_leads from anon, authenticated;
grant insert (email, profil, source) on public.landing_leads to anon;
drop policy if exists "anon insert leads" on public.landing_leads;
create policy "anon insert leads" on public.landing_leads for insert to anon with check (true);
