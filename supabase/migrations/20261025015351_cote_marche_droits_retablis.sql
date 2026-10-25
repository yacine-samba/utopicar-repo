-- La cote des analyses ne sortait plus depuis le 13 oct. 2026 : cote_marche n'était plus exécutable que par le rôle
-- service, alors que l'analyse (comptes) et l'aperçu (visiteurs) l'appellent en leur nom. 0 rapport coté sur 7 jours.
-- Droits rétablis tels que posés par 20261003210000_marche_annonces et 20261009090000_cote_visiteurs ; le site passe
-- ensuite par une lecture serveur, et ces droits pourront être retirés.
grant execute on function public.cote_marche(text, text, integer, integer, text) to authenticated, anon;
