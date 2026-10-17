-- Recherche du marché, CarCrush et cote des analyses trop lentes (17 oct. 2026) : « canceling statement due to statement timeout ».
-- marche_candidats et cote_marche lisaient les 347 000 annonces une à une (expression régulière sur chaque titre) :
-- 2 à 9 s par appel, au-delà de la limite de 8 s de l'API. cote_marche (8,4 s) échouait presque à chaque analyse,
-- qui retombait alors sur le prix estimé par l'IA au lieu des annonces comparables.
-- Index trigrammes : la base ne lit plus que les titres qui contiennent le modèle cherché.
-- Mesuré dans une transaction annulée : marche_candidats Clio 3,1 s → 1,4 s, cote_marche 8,4 s → 0,2 s, mêmes résultats.
-- Les écritures du relevé sur marche_annonces attendent quelques secondes pendant la création des index.

create extension if not exists pg_trgm with schema extensions;

-- titres normalisés des annonces relevées (marche_candidats, cote_marche, historique_annonce)
create index if not exists marche_annonces_titre_trgm on public.marche_annonces using gin (titre_norm extensions.gin_trgm_ops);
-- modèle Leboncoin normalisé (cote_marche : « titre contient le modèle ou modèle égal »)
create index if not exists marche_annonces_modele_norm on public.marche_annonces (public.norm_txt(modele));
-- annonces de la cote Garage : même expression que dans marche_candidats et historique_annonce
create index if not exists cote_annonces_titre_trgm on public.cote_annonces using gin ((public.norm_txt(coalesce(titre, '') || ' ' || cle)) extensions.gin_trgm_ops);

analyze public.marche_annonces;
analyze public.cote_annonces;
