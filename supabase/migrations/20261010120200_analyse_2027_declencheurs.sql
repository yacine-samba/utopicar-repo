set lock_timeout = '15s';

-- Analyse 2027 (3/4) : déclencheurs qui notent chaque changement de prix de la base du marché (jamais bloquants).
create or replace trigger noter_prix_cote after insert or update of prix on public.cote_annonces for each row execute function public.noter_prix();
create or replace trigger noter_prix_marche after insert or update of prix on public.marche_annonces for each row execute function public.noter_prix();
create or replace trigger noter_prix_suivi after insert or update of prix on public.annonces for each row execute function public.noter_prix();

