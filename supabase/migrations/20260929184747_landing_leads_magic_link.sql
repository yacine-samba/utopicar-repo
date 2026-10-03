alter table public.landing_leads
  add column if not exists token_hash text,
  add column if not exists token_expire timestamptz,
  add column if not exists email_envoye boolean not null default false,
  add column if not exists email_confirme boolean not null default false,
  add column if not exists confirme_le timestamptz,
  add column if not exists ouvertures int not null default 0;
create unique index if not exists landing_leads_token on public.landing_leads (token_hash) where token_hash is not null;
insert into public.reglages (cle, valeur) values ('email_from_leads', 'Yacine <guide@mail.yacinesamba.fr>')
  on conflict (cle) do update set valeur = excluded.valeur;
