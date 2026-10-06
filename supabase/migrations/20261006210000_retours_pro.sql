-- Retours pros d'octobre : 30 photos, photo des annonces du marché, documents ajoutés après coup,
-- alerte e-mail liée à une recherche, option « Messages Leboncoin » et sa file d'envoi.

-- 1. Jusqu'à 30 photos par rapport et par voiture du parc.
create or replace function public.rapport_completer(p_id uuid, p_photos text[], p_lien text, p_vendeur jsonb)
returns void language plpgsql security definer set search_path to '' as $$
begin
  update public.rapports set
    photos = coalesce((select array_agg(u) from (select u from unnest(coalesce(p_photos, '{}')) u where u ~ '^https://' and length(u) < 1000 limit 30) x), '{}'),
    lien = case when p_lien ~ '^https?://' then left(p_lien, 500) else null end,
    vendeur = case when jsonb_typeof(p_vendeur) = 'object' and pg_column_size(p_vendeur) < 2000 then p_vendeur else null end
  where id = p_id and user_id = (select auth.uid());
end $$;
alter table public.parc drop constraint if exists parc_photos_check;
alter table public.parc add constraint parc_photos_check check (cardinality(photos) <= 30);

-- 2. Photo des annonces du marché (vignette Leboncoin), gardée avec les annonces trouvées.
alter table public.cote_annonces add column if not exists photo text check (photo is null or (photo ~ '^https://' and length(photo) <= 600));
alter table public.annonces_trouvees add column if not exists photo text check (photo is null or (photo ~ '^https://' and length(photo) <= 600));

create or replace function public.marche_candidats(p_regex text, p_marque text, p_annee_min integer, p_annee_max integer, p_limite integer default 3000)
returns jsonb language sql stable security definer set search_path to '' as $function$
  with toutes as (
    select ca.id, 'garage' as source, ca.titre, ca.texte, ca.prix, ca.annee, ca.km, ca.energie, ca.boite, (ca.vendeur ilike 'pro%') as pro, ca.ch, ca.places, ca.carrosserie as carr, ca.etat,
           ca.dep as lieu, null::text as url, coalesce(ca.publie_le, ca.vu_le) as vu_le, ca.version, ca.finition, ca.mec, ca.portes, ca.lbc_min, ca.lbc_max, ca.lbc_pos, ca.photo,
           public.norm_txt(coalesce(ca.titre, '') || ' ' || ca.cle) as t
    from public.cote_annonces ca
    union all
    select a.id, 'suivi', a.titre, left(a.description, 700), a.prix, a.annee, a.km, a.energie, a.boite, a.vendeur_type = 'professionnel',
           nullif(regexp_replace(coalesce(public.lbc_attr(a.attributs, 'horse_power_din'), ''), '\D', '', 'g'), '')::int, null::int, public.lbc_attr(a.attributs, 'vehicle_type'), public.lbc_attr(a.attributs, 'vehicle_damage'),
           coalesce(a.ville, '') || coalesce(' ' || a.cp, ''), a.url, coalesce(a.publie_le, a.premiere_vue),
           public.lbc_attr(a.attributs, 'u_car_version'), public.lbc_attr(a.attributs, 'u_car_finition'), public.lbc_mec(public.lbc_attr(a.attributs, 'issuance_date')),
           nullif(regexp_replace(coalesce(public.lbc_attr(a.attributs, 'doors'), ''), '\D', '', 'g'), '')::int,
           nullif(regexp_replace(coalesce(public.lbc_attr(a.attributs, 'car_price_min'), ''), '\D', '', 'g'), '')::int,
           nullif(regexp_replace(coalesce(public.lbc_attr(a.attributs, 'car_price_max'), ''), '\D', '', 'g'), '')::int,
           public.lbc_attr(a.attributs, 'car_price_positioning'),
           case when jsonb_typeof(a.photos) = 'array' and (a.photos->>0) ~ '^https://' then a.photos->>0 end,
           public.norm_txt(coalesce(a.marque, '') || ' ' || coalesce(a.modele, '') || ' ' || coalesce(a.titre, ''))
    from public.annonces a
    union all
    select substr(m.id, 5), m.source, m.titre, null, m.prix, m.annee, m.km, m.energie, m.boite, m.pro, m.ch, null::int, null, null, m.cp,
           'https://www.leboncoin.fr/ad/voitures/' || substr(m.id, 5), m.vu_le, null, null, null, null, null, null, null, null, m.titre_norm
    from public.marche_annonces m where m.source = 'releve'
  ), filtrees as (
    select distinct on (id) * from toutes
    where (public.a_offre(array['pro']) or (select auth.role()) = 'service_role')
      and prix between 300 and 300000
      and (p_regex is null or t ~ p_regex)
      and (p_marque is null or t ~ p_marque)
      and (p_annee_min is null or annee >= p_annee_min)
      and (p_annee_max is null or annee <= p_annee_max)
    order by id, (source = 'suivi') desc, (version is not null) desc, (texte is not null) desc
  )
  select coalesce(jsonb_agg(to_jsonb(f) - 't'), '[]'::jsonb) from (select * from filtrees order by vu_le desc nulls last limit greatest(1, least(p_limite, 5000))) f;
$function$;

-- 3. Alerte e-mail d'une recherche : un simple interrupteur sur la recherche.
alter table public.recherches add column if not exists alerte_id uuid references public.veilles (id) on delete set null;

-- 4. Documents ajoutés après l'analyse (CT, HistoVec, carte grise, cession…), rattachés à un rapport ou à une voiture du parc.
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  rapport_id uuid references public.rapports (id) on delete cascade,
  parc_id uuid references public.parc (id) on delete cascade,
  type text not null check (type in ('ct', 'histovec', 'carte_grise', 'cession', 'csa', 'factures', 'autre')),
  nom text not null check (length(nom) between 1 and 200),
  chemin text not null check (length(chemin) <= 400),
  taille integer check (taille >= 0),
  created_at timestamptz not null default now(),
  check (rapport_id is not null or parc_id is not null)
);
create index if not exists documents_rapport on public.documents (rapport_id);
create index if not exists documents_parc on public.documents (parc_id);
alter table public.documents enable row level security;
create policy "documents : lecture" on public.documents for select to authenticated using (user_id = (select auth.uid()));
create policy "documents : ajout" on public.documents for insert to authenticated with check (user_id = (select auth.uid()) and chemin like (select auth.uid())::text || '/%');
create policy "documents : suppression" on public.documents for delete to authenticated using (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = excluded.allowed_mime_types;
create policy "documents : dépôt dans son dossier" on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "documents : lecture de son dossier" on storage.objects for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "documents : suppression dans son dossier" on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- 5. Options payantes en plus de la formule (Messages Leboncoin). « offerte » : ouverte à la main, comme formule_offerte.
create table if not exists public.options_comptes (
  user_id uuid not null references auth.users (id) on delete cascade,
  option text not null check (option in ('messages')),
  statut text not null default 'active',
  offerte boolean not null default false,
  stripe_subscription_id text unique,
  periode_fin timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, option)
);
alter table public.options_comptes enable row level security;
create policy "options : lecture" on public.options_comptes for select to authenticated using (user_id = (select auth.uid()));

/** Option ouverte : compte illimité, option offerte, ou abonnement Stripe actif — toujours avec Benef Pro. */
create or replace function public.option_active(p_uid uuid, p_option text)
returns boolean language sql stable security definer set search_path to '' as $$
  select coalesce((select illimite from public.profils where id = p_uid), false)
      or (public.formule_de(p_uid) = 'pro' and exists (
            select 1 from public.options_comptes o where o.user_id = p_uid and o.option = p_option
              and (o.offerte or o.statut in ('active', 'trialing', 'past_due'))));
$$;
revoke execute on function public.option_active(uuid, text) from public, anon;
grant execute on function public.option_active(uuid, text) to authenticated, service_role;

-- 6. Messages Leboncoin : identifiants chiffrés, campagnes (une par recherche), file d'envoi, boîte de réception.
-- Le mot de passe est chiffré dès son arrivée (pgcrypto, clé dans le coffre Supabase Vault) ; aucun rôle client ne peut le lire.
-- Seule la fonction d'envoi (rôle service) le déchiffre, en mémoire, au moment de l'appel à l'acteur Apify.
do $$ begin
  if not exists (select 1 from vault.secrets where name = 'lbc_cle') then
    perform vault.create_secret(encode(extensions.gen_random_bytes(32), 'base64'), 'lbc_cle', 'Clé de chiffrement des mots de passe Leboncoin');
  end if;
end $$;

create table if not exists public.lbc_comptes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null check (length(email) between 3 and 200),
  mdp bytea not null,
  nom_affiche text check (length(nom_affiche) <= 60),
  statut text not null default 'nouveau' check (statut in ('nouveau', 'ok', 'erreur')),
  erreur text,
  updated_at timestamptz not null default now()
);
alter table public.lbc_comptes enable row level security; -- aucune politique : accès par fonctions seulement

create table if not exists public.lbc_campagnes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  recherche_id uuid not null references public.recherches (id) on delete cascade,
  nom text not null check (length(nom) between 1 and 160),
  message text not null check (length(message) between 10 and 2500),
  actif boolean not null default false,
  ignorer_refus boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, recherche_id)
);
alter table public.lbc_campagnes enable row level security;
create policy "campagnes : lecture" on public.lbc_campagnes for select to authenticated using (user_id = (select auth.uid()));
create policy "campagnes : ajout" on public.lbc_campagnes for insert to authenticated with check (user_id = (select auth.uid()) and public.option_active((select auth.uid()), 'messages'));
create policy "campagnes : modification" on public.lbc_campagnes for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and (not actif or public.option_active((select auth.uid()), 'messages')));
create policy "campagnes : suppression" on public.lbc_campagnes for delete to authenticated using (user_id = (select auth.uid()));

create table if not exists public.lbc_envois (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  campagne_id uuid references public.lbc_campagnes (id) on delete set null,
  annonce_id text not null check (annonce_id ~ '^\d{6,14}$'),
  url text not null check (url ~ '^https://www\.leboncoin\.fr/'),
  titre text,
  prix integer,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'en_cours', 'envoye', 'erreur', 'ignoree', 'annule')),
  raison text,
  conversation_id text,
  run_id text,
  created_at timestamptz not null default now(),
  traite_le timestamptz,
  unique (user_id, annonce_id)
);
create index if not exists lbc_envois_file on public.lbc_envois (statut, created_at);
alter table public.lbc_envois enable row level security;
create policy "envois : lecture" on public.lbc_envois for select to authenticated using (user_id = (select auth.uid()));
create policy "envois : annulation" on public.lbc_envois for update to authenticated
  using (user_id = (select auth.uid()) and statut = 'en_attente') with check (user_id = (select auth.uid()) and statut in ('annule', 'en_attente'));

create table if not exists public.lbc_boites (
  user_id uuid primary key references auth.users (id) on delete cascade,
  conversations jsonb not null default '[]'::jsonb check (jsonb_typeof(conversations) = 'array' and pg_column_size(conversations) < 400000),
  non_lus integer not null default 0,
  total integer not null default 0,
  maj timestamptz,
  demande timestamptz,
  run_id text,
  erreur text
);
alter table public.lbc_boites enable row level security;
create policy "boîte : lecture" on public.lbc_boites for select to authenticated using (user_id = (select auth.uid()));

/** Enregistre (ou met à jour) le compte Leboncoin de la personne : le mot de passe est chiffré ici, jamais gardé en clair.
    Mot de passe vide : on garde celui déjà enregistré (changement d'e-mail ou de nom affiché seulement). */
create or replace function public.lbc_enregistrer(p_email text, p_mdp text, p_nom text)
returns void language plpgsql security definer set search_path to '' as $$
declare v_uid uuid := (select auth.uid()); v_cle text;
begin
  if v_uid is null or not public.option_active(v_uid, 'messages') then raise exception 'Option Messages Leboncoin non active' using errcode = '42501'; end if;
  if p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Adresse e-mail invalide'; end if;
  if coalesce(p_mdp, '') = '' then
    update public.lbc_comptes set email = lower(trim(p_email)), nom_affiche = nullif(left(trim(coalesce(p_nom, '')), 60), ''), updated_at = now() where user_id = v_uid;
    if not found then raise exception 'Mot de passe Leboncoin manquant'; end if;
    return;
  end if;
  if length(p_mdp) > 200 then raise exception 'Mot de passe trop long'; end if;
  select decrypted_secret into v_cle from vault.decrypted_secrets where name = 'lbc_cle';
  insert into public.lbc_comptes (user_id, email, mdp, nom_affiche, statut, erreur, updated_at)
  values (v_uid, lower(trim(p_email)), extensions.pgp_sym_encrypt(p_mdp, v_cle, 'cipher-algo=aes256'), nullif(left(trim(coalesce(p_nom, '')), 60), ''), 'nouveau', null, now())
  on conflict (user_id) do update set email = excluded.email, mdp = excluded.mdp, nom_affiche = excluded.nom_affiche, statut = 'nouveau', erreur = null, updated_at = now();
end $$;
revoke execute on function public.lbc_enregistrer(text, text, text) from public, anon;
grant execute on function public.lbc_enregistrer(text, text, text) to authenticated;

/** Ce que la personne voit de son compte Leboncoin : jamais le mot de passe. */
create or replace function public.lbc_mon_compte()
returns jsonb language sql stable security definer set search_path to '' as $$
  select to_jsonb(x) from (select email, nom_affiche, statut, erreur, updated_at from public.lbc_comptes where user_id = (select auth.uid())) x;
$$;
revoke execute on function public.lbc_mon_compte() from public, anon;
grant execute on function public.lbc_mon_compte() to authenticated;

/** Oublier le compte Leboncoin : identifiants effacés, campagnes arrêtées, envois en attente annulés. */
create or replace function public.lbc_oublier()
returns void language plpgsql security definer set search_path to '' as $$
begin
  delete from public.lbc_comptes where user_id = (select auth.uid());
  update public.lbc_campagnes set actif = false, updated_at = now() where user_id = (select auth.uid());
  update public.lbc_envois set statut = 'annule', traite_le = now() where user_id = (select auth.uid()) and statut = 'en_attente';
end $$;
revoke execute on function public.lbc_oublier() from public, anon;
grant execute on function public.lbc_oublier() to authenticated;

/** Identifiants déchiffrés, pour la fonction d'envoi seulement (rôle service). */
create or replace function public.lbc_identifiants(p_uid uuid)
returns table (email text, mdp text, nom_affiche text) language plpgsql security definer set search_path to '' as $$
declare v_cle text;
begin
  select decrypted_secret into v_cle from vault.decrypted_secrets where name = 'lbc_cle';
  return query select c.email, extensions.pgp_sym_decrypt(c.mdp, v_cle, 'cipher-algo=aes256'), c.nom_affiche from public.lbc_comptes c where c.user_id = p_uid;
end $$;
revoke execute on function public.lbc_identifiants(uuid) from public, anon, authenticated;
grant execute on function public.lbc_identifiants(uuid) to service_role;

/** Demande de rafraîchissement de la boîte de réception (traitée par la fonction d'envoi, dans la même file). */
create or replace function public.lbc_actualiser_boite()
returns void language plpgsql security definer set search_path to '' as $$
begin
  if not public.option_active((select auth.uid()), 'messages') then raise exception 'Option Messages Leboncoin non active' using errcode = '42501'; end if;
  insert into public.lbc_boites (user_id, demande) values ((select auth.uid()), now())
  on conflict (user_id) do update set demande = coalesce(public.lbc_boites.demande, now()), erreur = null;
end $$;
revoke execute on function public.lbc_actualiser_boite() from public, anon;
grant execute on function public.lbc_actualiser_boite() to authenticated;

-- Réglages de l'envoi : interrupteur général et date d'arrêt des essais (pass Apify gratuit jusqu'au 7 octobre 20 h).
insert into public.reglages (cle, valeur) values
  ('lbc_actif', 'oui'), ('lbc_jusqu_au', '2026-10-07T19:45:00+02:00'), ('lbc_acteur', 'clearpath~leboncoin-acheteur'), ('lbc_dernier_run', '')
on conflict (cle) do nothing;

/** Appel de la fonction d'envoi (toutes les minutes) : elle respecte elle-même 2 minutes entre deux requêtes Apify. */
create or replace function public.lancer_messages()
returns bigint language plpgsql security definer set search_path to 'public', 'extensions' as $$
declare v_secret text; v_req bigint;
begin
  if coalesce((select valeur from public.reglages where cle = 'lbc_actif'), 'non') <> 'oui' then return null; end if;
  select valeur into v_secret from public.reglages where cle = 'cle_interne';
  select net.http_post(url := 'https://rvdfifhgosovdapdltps.supabase.co/functions/v1/messages',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-veille-secret', v_secret),
    body := '{}'::jsonb, timeout_milliseconds := 60000) into v_req;
  return v_req;
end $$;
revoke execute on function public.lancer_messages() from public, anon, authenticated;
-- La tâche planifiée (toutes les minutes) est ajoutée par la migration suivante, une fois la fonction « messages » déployée.
