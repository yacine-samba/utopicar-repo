-- La fonction de déclencheur noter_prix n'a pas à être appelée par l'API (les déclencheurs s'exécutent sans ce droit).
revoke execute on function public.noter_prix() from public, anon, authenticated;
