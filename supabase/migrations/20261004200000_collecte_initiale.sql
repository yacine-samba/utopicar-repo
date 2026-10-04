-- Collecte des alertes comme dans l'outil Garage : le premier passage (nouvelle alerte ou critères modifiés)
-- lit toutes les annonces qui correspondent ; les suivants seulement celles parues depuis le passage précédent.
alter table public.veille_passages add column if not exists initiale boolean not null default false;

-- La liste des alertes dit si la collecte complète est faite, et combien d'annonces elle a lues.
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
      -- en cours tant que l'acteur tourne ET tant que ses annonces s'enregistrent (passage pas encore terminé)
      'en_cours', v.run_id is not null or exists (select 1 from public.veille_passages p where p.veille_id = v.id and p.statut = 'en cours' and p.debut > now() - interval '30 minutes'),
      'created_at', v.created_at,
      'collecte_faite', v.prochain_nb is not null,
      'dernier_lu', (select p.recues from public.veille_passages p where p.veille_id = v.id order by p.debut desc limit 1),
      'dernier_initial', coalesce((select p.initiale from public.veille_passages p where p.veille_id = v.id order by p.debut desc limit 1), false),
      'passages', (select count(*) from public.veille_passages p where p.veille_id = v.id and p.statut = 'ok'),
      'mails', (select count(*) from public.veille_passages p where p.veille_id = v.id and p.mail = 'envoyé'),
      'annonces', coalesce((select jsonb_agg(a order by a.vu desc) from (
          select an.id, an.url, an.titre, an.prix, an.annee, an.km, an.energie, an.boite, an.ville, an.cp, an.vendeur_type, an.vignette,
                 coalesce(an.publie_le, an.premiere_vue) as vu
          from public.annonces an where v.id = any (an.veilles)
          order by coalesce(an.publie_le, an.premiere_vue) desc nulls last limit 30) a), '[]'::jsonb)
    ) order by v.created_at desc)
    from public.veilles v where v.user_id = (select auth.uid()) and v.supprimee_le is null), '[]'::jsonb);
end $function$;
