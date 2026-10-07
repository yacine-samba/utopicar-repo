-- Guide choisi à la main depuis la page Administration : il remplace celui que donne le profil (site, objectif).
-- Vide = le guide du profil. Remis à vide quand la personne refait une demande sur le site.
alter table public.landing_leads add column if not exists guide text
  check (guide is null or guide in ('premiere-revente', 'trier-annonces', 'estimer-reprise', 'acheter-occasion'));
comment on column public.landing_leads.guide is 'Guide envoyé, choisi depuis /app/admin. Vide = celui du profil.';
