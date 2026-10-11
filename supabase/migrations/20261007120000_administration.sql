-- Administration depuis le site (/app/admin) : nouveaux comptes, inscrits au guide, formules et crédits offerts, envoi des guides.
-- Réservée aux comptes cochés « admin » (distinct de « illimite », qui sert aussi aux testeurs).
-- Toutes les lectures et écritures passent par le serveur (clé service) après vérification de la colonne admin.
alter table public.profils add column if not exists admin boolean not null default false;
comment on column public.profils.admin is 'Accès à la page Administration (/app/admin). La personne ne peut pas modifier cette colonne.';

-- Le compte illimité existant est celui du propriétaire : il devient administrateur.
update public.profils set admin = true where illimite and not admin;

-- Journal des actions faites depuis la page Administration (qui a offert quoi à qui).
create table if not exists public.journal_admin (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users (id) on delete set null,
  action text not null,
  cible text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists journal_admin_date_idx on public.journal_admin (created_at desc);
alter table public.journal_admin enable row level security;
revoke all on public.journal_admin from anon, authenticated;
