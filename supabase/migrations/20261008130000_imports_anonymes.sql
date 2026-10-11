-- Lecture d'une annonce par son lien sans compte (aperçu sur l'accueil) : l'import est journalisé avec l'adresse IP
-- au lieu du compte. Limites dans la fonction `annonce` : 3 par jour et par IP, 200 imports anonymes par jour en tout.
alter table public.imports_annonces alter column user_id drop not null;
alter table public.imports_annonces add column if not exists ip text;
create index if not exists imports_annonces_ip_idx on public.imports_annonces (ip, created_at) where user_id is null;
