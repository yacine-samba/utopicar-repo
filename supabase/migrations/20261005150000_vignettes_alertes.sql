-- Alertes : la liste ne transporte plus les vignettes en base64 (jusqu'à 1 Mo par chargement, tableau de bord compris).
-- Elle dit seulement s'il y en a une ; l'image est servie à part (route /api/alertes/vignette), à qui suit l'annonce.
create or replace function public.mes_alertes()
 returns jsonb
 language plpgsql
 stable security definer
 set search_path to ''
as $function$
begin
  if not public.peut_alertes() then raise exception 'Alertes réservées à Benef Pro' using errcode = '42501'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', v.id, 'nom', v.nom, 'actif', v.actif, 'notifier', v.notifier, 'email', v.email, 'intervalle_min', v.intervalle_min,
      'filtres', v.filtres, 'derniere_execution', v.derniere_execution, 'derniere_erreur', v.derniere_erreur, 'derniers_nouveaux', v.derniers_nouveaux,
      'en_cours', v.run_id is not null or exists (select 1 from public.veille_passages p where p.veille_id = v.id and p.statut = 'en cours' and p.debut > now() - interval '30 minutes'),
      'created_at', v.created_at,
      'collecte_faite', v.prochain_nb is not null,
      'dernier_lu', (select p.recues from public.veille_passages p where p.veille_id = v.id order by p.debut desc limit 1),
      'dernier_initial', coalesce((select p.initiale from public.veille_passages p where p.veille_id = v.id order by p.debut desc limit 1), false),
      'passages', (select count(*) from public.veille_passages p where p.veille_id = v.id and p.statut = 'ok'),
      'mails', (select count(*) from public.veille_passages p where p.veille_id = v.id and p.mail = 'envoyé'),
      'annonces', coalesce((select jsonb_agg(a order by a.vu desc) from (
          select an.id, an.url, an.titre, an.prix, an.annee, an.km, an.energie, an.boite, an.ville, an.cp, an.vendeur_type, (an.vignette is not null) as vignette,
                 coalesce(an.publie_le, an.premiere_vue) as vu
          from public.annonces an where v.id = any (an.veilles)
          order by coalesce(an.publie_le, an.premiere_vue) desc nulls last limit 30) a), '[]'::jsonb)
    ) order by v.created_at desc)
    from public.veilles v where v.user_id = (select auth.uid()) and v.supprimee_le is null), '[]'::jsonb);
end $function$;

-- Vignette d'une annonce, seulement pour qui la suit par une de ses alertes (même supprimée : elle reste restaurable).
create or replace function public.vignette_annonce(p_id text)
 returns text
 language sql
 stable security definer
 set search_path to ''
as $function$
  select an.vignette from public.annonces an
  where an.id = p_id and public.peut_alertes()
    and exists (select 1 from public.veilles v where v.user_id = (select auth.uid()) and v.id = any (an.veilles))
$function$;
revoke execute on function public.vignette_annonce(text) from public, anon;
grant execute on function public.vignette_annonce(text) to authenticated;
