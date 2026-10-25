-- Le site enregistre les analyses par enregistrer_analyse_pour (rôle service) depuis le déploiement de la PR #98
-- (21 oct. 2026) : l'ancienne fonction n'est plus appelable par les comptes, qui ne peuvent donc plus enregistrer
-- eux-mêmes un rapport inventé.
revoke execute on function public.enregistrer_analyse(text, text, text, integer, text, integer, integer, text, jsonb) from public, anon, authenticated;
