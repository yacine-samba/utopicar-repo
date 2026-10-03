create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  site text not null check (length(site) <= 40),
  prenom text not null check (length(prenom) between 1 and 60),
  email text not null check (length(email) <= 254),
  message text not null check (length(message) between 5 and 3000),
  ip_hash text,
  notifie boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon, authenticated;
create index if not exists contact_messages_ip on public.contact_messages (ip_hash, created_at);
