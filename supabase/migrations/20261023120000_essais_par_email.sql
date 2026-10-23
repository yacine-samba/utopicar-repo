-- Analyse offerte sans compte : le visiteur colle son annonce et donne son email ; la fonction `compte` (action « essai »)
-- garde l'annonce ici et envoie un lien de connexion qui ouvre /app/analyser?essai=<id>, où l'analyse part toute seule.
-- Limites dans la fonction (table envois_compte) : 2 essais par jour et par IP, plafond global par jour (reglages.essais_max_jour).
-- Écrit par la fonction et lu par le site (clé service) : personne d'autre n'y a accès.
create table if not exists public.essais (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  texte text,
  lien text,
  ville text,
  ip text,
  created_at timestamptz not null default now(),
  utilise_le timestamptz,
  check (texte is not null or lien is not null)
);
create index if not exists essais_email_idx on public.essais (email, created_at desc);
alter table public.essais enable row level security;
revoke all on public.essais from anon, authenticated;

-- Annonces gardées 30 jours au plus.
create or replace function public.purger_essais() returns void language sql security definer set search_path = public as $$
  delete from public.essais where created_at < now() - interval '30 days';
$$;
revoke execute on function public.purger_essais() from public, anon, authenticated;
select cron.schedule('purge-essais', '27 3 * * *', 'select public.purger_essais();');
