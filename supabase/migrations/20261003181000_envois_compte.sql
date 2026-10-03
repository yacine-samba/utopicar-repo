-- Limites d'envoi de la fonction `compte` (inscriptions par IP, liens de connexion et mots de passe oubliés par email).
-- Écrit et lu uniquement par la fonction (clé service) : personne d'autre n'y a accès.
create table if not exists public.envois_compte (
  id bigint generated always as identity primary key,
  cle text not null,
  created_at timestamptz not null default now()
);
create index if not exists envois_compte_cle_date_idx on public.envois_compte (cle, created_at desc);
alter table public.envois_compte enable row level security;
revoke all on public.envois_compte from anon, authenticated;
