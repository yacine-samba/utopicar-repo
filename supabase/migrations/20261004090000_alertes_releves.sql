-- Alertes e-mail (recherches suivies) gérées depuis le site, réservées aux comptes illimités,
-- et relevés Leboncoin collés dans la page Cote, enregistrés pour enrichir la base du marché.

-- 1. Recherches suivies : propriétaire, destinataire, suppression douce (l'outil Garage garde les siennes, sans propriétaire).
alter table public.veilles add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.veilles add column if not exists email text;
alter table public.veilles add column if not exists supprimee_le timestamptz;
create index if not exists veilles_user_idx on public.veilles (user_id) where user_id is not null;

create or replace function public.est_illimite()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select p.illimite from public.profils p where p.id = (select auth.uid())), false);
$$;
revoke execute on function public.est_illimite() from public, anon;
grant execute on function public.est_illimite() to authenticated;

-- Mes alertes, avec les derniers passages et les dernières annonces trouvées.
create or replace function public.mes_alertes()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.est_illimite() then raise exception 'Alertes réservées au mode illimité' using errcode = '42501'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', v.id, 'nom', v.nom, 'actif', v.actif, 'notifier', v.notifier, 'email', v.email, 'intervalle_min', v.intervalle_min,
      'filtres', v.filtres, 'derniere_execution', v.derniere_execution, 'derniere_erreur', v.derniere_erreur, 'derniers_nouveaux', v.derniers_nouveaux,
      'en_cours', v.run_id is not null, 'created_at', v.created_at,
      'passages', (select count(*) from public.veille_passages p where p.veille_id = v.id and p.statut = 'ok'),
      'mails', (select count(*) from public.veille_passages p where p.veille_id = v.id and p.mail = 'envoyé'),
      'annonces', coalesce((select jsonb_agg(a order by a.vu desc) from (
          select an.id, an.url, an.titre, an.prix, an.annee, an.km, an.energie, an.boite, an.ville, an.cp, an.vendeur_type, an.vignette,
                 coalesce(an.publie_le, an.premiere_vue) as vu
          from public.annonces an where v.id = any (an.veilles)
          order by coalesce(an.publie_le, an.premiere_vue) desc nulls last limit 30) a), '[]'::jsonb)
    ) order by v.created_at desc)
    from public.veilles v where v.user_id = (select auth.uid()) and v.supprimee_le is null), '[]'::jsonb);
end $$;

-- Créer ou modifier une alerte. Fréquence de 1 à 24 heures, filtres au format Leboncoin (+ « utp » : inclure, exclure, gen, sous_cote).
create or replace function public.alerte_enregistrer(p jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid := nullif(p->>'id', '')::uuid;
  v_int int := greatest(60, least(1440, coalesce((p->>'intervalle_min')::int, 60)));
  v_nom text := left(coalesce(nullif(trim(p->>'nom'), ''), 'Ma recherche'), 80);
  v_mail text := nullif(trim(coalesce(p->>'email', '')), '');
  v_f jsonb := coalesce(p->'filtres', '{}'::jsonb);
begin
  if not public.est_illimite() then raise exception 'Alertes réservées au mode illimité' using errcode = '42501'; end if;
  if jsonb_typeof(v_f) <> 'object' then raise exception 'Filtres invalides'; end if;
  if v_mail is not null and v_mail !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Adresse e-mail invalide'; end if;
  if v_mail is null then select u.email into v_mail from auth.users u where u.id = (select auth.uid()); end if;
  if v_id is null then
    if (select count(*) from public.veilles where user_id = (select auth.uid()) and supprimee_le is null) >= 20 then raise exception '20 alertes au maximum'; end if;
    insert into public.veilles (nom, actif, notifier, email, intervalle_min, filtres, user_id, nb_par_passage, details)
    values (v_nom, coalesce((p->>'actif')::boolean, true), coalesce((p->>'notifier')::boolean, true), v_mail, v_int, v_f, (select auth.uid()), 20, false)
    returning id into v_id;
  else
    update public.veilles set nom = v_nom, actif = coalesce((p->>'actif')::boolean, actif), notifier = coalesce((p->>'notifier')::boolean, notifier),
      email = v_mail, intervalle_min = v_int, filtres = v_f, prochain_nb = null
    where id = v_id and user_id = (select auth.uid()) and supprimee_le is null;
    if not found then raise exception 'Alerte introuvable'; end if;
  end if;
  return v_id;
end $$;

-- Interrupteurs rapides (activer, e-mail) sans renvoyer toute l'alerte.
create or replace function public.alerte_basculer(p_id uuid, p_actif boolean, p_notifier boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.est_illimite() then raise exception 'Alertes réservées au mode illimité' using errcode = '42501'; end if;
  update public.veilles set actif = coalesce(p_actif, actif), notifier = coalesce(p_notifier, notifier)
  where id = p_id and user_id = (select auth.uid()) and supprimee_le is null;
end $$;

-- Suppression : l'alerte s'arrête et disparaît de la liste (les annonces trouvées restent dans la base du marché).
create or replace function public.alerte_retirer(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.est_illimite() then raise exception 'Alertes réservées au mode illimité' using errcode = '42501'; end if;
  update public.veilles set actif = false, notifier = false, supprimee_le = now()
  where id = p_id and user_id = (select auth.uid());
end $$;

-- Lancer un passage tout de suite (bouton « Chercher maintenant »), au plus une fois toutes les 5 minutes.
create or replace function public.alerte_lancer(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.est_illimite() then raise exception 'Alertes réservées au mode illimité' using errcode = '42501'; end if;
  if not exists (select 1 from public.veilles where id = p_id and user_id = (select auth.uid()) and supprimee_le is null
                 and run_id is null and (derniere_execution is null or derniere_execution < now() - interval '5 minutes')) then
    raise exception 'Recherche déjà en cours ou lancée il y a moins de 5 minutes';
  end if;
  perform public.lancer_veille_force(p_id);
end $$;

create or replace function public.lancer_veille_force(p_veille uuid)
returns bigint language plpgsql security definer set search_path = '' as $$
declare v_secret text; v_req bigint;
begin
  select valeur into v_secret from public.reglages where cle = 'cle_interne';
  select net.http_post(
    url := 'https://rvdfifhgosovdapdltps.supabase.co/functions/v1/veille',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-veille-secret', v_secret),
    body := jsonb_build_object('veille_id', p_veille, 'force', true),
    timeout_milliseconds := 150000) into v_req;
  return v_req;
end $$;
revoke execute on function public.lancer_veille_force(uuid) from public, anon, authenticated;

revoke execute on function public.mes_alertes() from public, anon;
revoke execute on function public.alerte_enregistrer(jsonb) from public, anon;
revoke execute on function public.alerte_basculer(uuid, boolean, boolean) from public, anon;
revoke execute on function public.alerte_retirer(uuid) from public, anon;
revoke execute on function public.alerte_lancer(uuid) from public, anon;
grant execute on function public.mes_alertes() to authenticated;
grant execute on function public.alerte_enregistrer(jsonb) to authenticated;
grant execute on function public.alerte_basculer(uuid, boolean, boolean) to authenticated;
grant execute on function public.alerte_retirer(uuid) to authenticated;
grant execute on function public.alerte_lancer(uuid) to authenticated;

-- 2. Relevés collés (extension Leboncoin) : enregistrés dans la base du marché, réservé à Benef Pro et illimité.
create or replace function public.releve_enregistrer(p_items jsonb)
returns integer language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  if not public.a_offre(array['pro']) then raise exception 'Réservé à Benef Pro' using errcode = '42501'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 5000 then raise exception 'Relevé invalide'; end if;
  insert into public.marche_annonces as m (id, source, marque, modele, titre, titre_norm, annee, km, prix, energie, boite, ch, pro, cp, vu_le)
  select 'lbc:' || (x->>'id'), 'releve', nullif(x->>'marque', ''), nullif(x->>'modele', ''), left(x->>'titre', 200), public.norm_txt(left(x->>'titre', 200)),
         (x->>'annee')::int, (x->>'km')::int, (x->>'prix')::int, nullif(x->>'energie', ''), nullif(x->>'boite', ''), (x->>'ch')::int,
         coalesce((x->>'pro')::boolean, false), nullif(x->>'cp', ''), now()
  from jsonb_array_elements(p_items) x
  where (x->>'id') ~ '^\d{6,14}$' and (x->>'prix') ~ '^\d{3,6}$' and (x->>'prix')::int between 300 and 300000
    and coalesce(x->>'annee', '') ~ '^(\d{4})?$' and coalesce(x->>'km', '') ~ '^(\d{1,7})?$' and coalesce(x->>'ch', '') ~ '^(\d{1,4})?$'
  on conflict (id) do update set prix = excluded.prix, km = coalesce(excluded.km, m.km), annee = coalesce(excluded.annee, m.annee), vu_le = now();
  get diagnostics n = row_count;
  return n;
end $$;
revoke execute on function public.releve_enregistrer(jsonb) from public, anon;
grant execute on function public.releve_enregistrer(jsonb) to authenticated;
