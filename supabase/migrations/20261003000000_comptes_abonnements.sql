-- Comptes, abonnements, rapports et parc pour utopicar.fr (outil Next.js).
-- Écritures sensibles (abonnements, achats, usages, rapports) : uniquement par le serveur (clé service).

-- ---------------------------------------------------------------- profils
create table if not exists public.profils (
  id uuid primary key references auth.users (id) on delete cascade,
  prenom text,
  famille text check (famille in ('particulier', 'benef')),
  onboarding jsonb not null default '{}'::jsonb,
  ville text,
  reglages jsonb not null default '{}'::jsonb,
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profils enable row level security;
create policy "profils : lecture par le titulaire" on public.profils
  for select to authenticated using ((select auth.uid()) = id);
create policy "profils : modification par le titulaire" on public.profils
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
-- Le titulaire ne peut pas modifier son identifiant client Stripe.
revoke update on public.profils from authenticated, anon;
grant update (prenom, famille, onboarding, ville, reglages, updated_at) on public.profils to authenticated;

create or replace function public.creer_profil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profils (id, prenom, famille, onboarding)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'prenom', ''), 60),
    case when new.raw_user_meta_data ->> 'famille' in ('particulier', 'benef') then new.raw_user_meta_data ->> 'famille' end,
    coalesce(new.raw_user_meta_data -> 'onboarding', '{}'::jsonb)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists creer_profil on auth.users;
create trigger creer_profil after insert on auth.users
  for each row execute function public.creer_profil();
-- Fonction réservée au déclencheur : personne ne l'appelle directement.
revoke execute on function public.creer_profil() from public, anon, authenticated;

-- ---------------------------------------------------------------- abonnements (écrits par le webhook Stripe)
create table if not exists public.abonnements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  offre text not null check (offre in ('essentiel', 'serenite', 'starter', 'croissance', 'pro')),
  statut text not null,
  stripe_subscription_id text unique,
  periode_fin timestamptz,
  annule_fin_periode boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.abonnements enable row level security;
create policy "abonnements : lecture par le titulaire" on public.abonnements
  for select to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------- achats ponctuels (guides)
create table if not exists public.achats (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  produit text not null,
  stripe_session_id text unique,
  created_at timestamptz not null default now()
);
create index if not exists achats_user_idx on public.achats (user_id);
alter table public.achats enable row level security;
create policy "achats : lecture par le titulaire" on public.achats
  for select to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------- usages (quotas, jamais supprimés par l'utilisateur)
create table if not exists public.usages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null check (mode in ('particulier', 'benef')),
  created_at timestamptz not null default now()
);
create index if not exists usages_user_date_idx on public.usages (user_id, created_at desc);
alter table public.usages enable row level security;
create policy "usages : lecture par le titulaire" on public.usages
  for select to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------- rapports
create table if not exists public.rapports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null check (mode in ('particulier', 'benef')),
  titre text not null,
  marque text,
  prix integer,
  verdict text,
  marge integer,
  note integer,
  annonce text,
  resultat jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists rapports_user_date_idx on public.rapports (user_id, created_at desc);
alter table public.rapports enable row level security;
create policy "rapports : lecture par le titulaire" on public.rapports
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "rapports : suppression par le titulaire" on public.rapports
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------- parc (formule Pro)
create or replace function public.a_offre(offres text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.abonnements a
    where a.user_id = (select auth.uid())
      and a.offre = any (offres)
      and a.statut in ('active', 'trialing', 'past_due')
  );
$$;
-- Utilisée par les règles du parc : appelable par les personnes connectées seulement.
revoke execute on function public.a_offre(text[]) from public, anon;
grant execute on function public.a_offre(text[]) to authenticated;

create table if not exists public.parc (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  rapport_id uuid references public.rapports (id) on delete set null,
  titre text not null check (length(titre) between 1 and 140),
  immat text check (length(immat) <= 20),
  statut text not null default 'repere' check (statut in ('repere', 'achete', 'preparation', 'en_vente', 'vendu', 'abandonne')),
  prix_achat integer check (prix_achat >= 0),
  frais integer not null default 0 check (frais >= 0),
  prix_vente integer check (prix_vente >= 0),
  date_achat date,
  date_vente date,
  notes text check (length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists parc_user_idx on public.parc (user_id, created_at desc);
create index if not exists parc_rapport_idx on public.parc (rapport_id);
alter table public.parc enable row level security;
create policy "parc : lecture par le titulaire" on public.parc
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "parc : ajout (Pro)" on public.parc
  for insert to authenticated with check ((select auth.uid()) = user_id and public.a_offre(array['pro']));
create policy "parc : modification (Pro)" on public.parc
  for update to authenticated using ((select auth.uid()) = user_id and public.a_offre(array['pro']))
  with check ((select auth.uid()) = user_id);
create policy "parc : suppression par le titulaire" on public.parc
  for delete to authenticated using ((select auth.uid()) = user_id);
