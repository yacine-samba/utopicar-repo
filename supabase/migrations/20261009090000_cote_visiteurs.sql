-- Aperçu d'annonce sans compte (accueil) : la cote de l'outil (annonces comparables en ligne, aucune donnée personnelle)
-- doit pouvoir être calculée pour un visiteur. La fonction est SECURITY DEFINER et ne lit que la base du marché.
grant execute on function public.cote_marche(text, text, integer, integer, text) to anon;
