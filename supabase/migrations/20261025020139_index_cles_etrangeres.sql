-- Conseillers de performance Supabase (25 oct. 2026) : clés étrangères sans index sur les tables lues par l'espace
-- (choix CarCrush d'une recherche, suivis et favoris d'un rapport, retours, documents) et un index en double.
create index if not exists carcrush_choix_recherche_idx on public.carcrush_choix (recherche_id);
create index if not exists documents_user_idx on public.documents (user_id);
create index if not exists favoris_rapport_idx on public.favoris (rapport_id);
create index if not exists suivis_rapport_idx on public.suivis (rapport_id);
create index if not exists retours_analyse_rapport_idx on public.retours_analyse (rapport_id);
create index if not exists retours_analyse_user_idx on public.retours_analyse (user_id);
create index if not exists recherches_alerte_idx on public.recherches (alerte_id);
create index if not exists lbc_campagnes_recherche_idx on public.lbc_campagnes (recherche_id);
create index if not exists lbc_envois_campagne_idx on public.lbc_envois (campagne_id);
create index if not exists prix_vus_par_idx on public.prix_vus (par);
create index if not exists codes_utilises_code_idx on public.codes_utilises (code);
create index if not exists journal_admin_admin_idx on public.journal_admin (admin_id);
drop index if exists public.annonces_premiere_vue;
