-- CarCrush : recherche d'annonces en swipe pour les particuliers (page /carcrush, non reliée au site).
-- Une recherche coûte des crédits selon le nombre de critères (2–3 : 1 crédit, 4–6 : 2, 7 et plus : 3), débités au lancement.
-- Aucune annonce trouvée (ou recherche en erreur) : les crédits sont rendus aussitôt. 30 annonces au plus par recherche.

-- 1. Deux nouveaux motifs de mouvement de crédits.
alter table public.credits drop constraint if exists credits_motif_check;
alter table public.credits add constraint credits_motif_check
  check (motif in ('achat', 'analyse', 'offert', 'expiration', 'carcrush', 'remboursement'));
alter table public.credits add column if not exists carcrush_id uuid;

-- Un remboursement ne prolonge pas la validité des crédits : seuls les achats et les cadeaux comptent pour les 12 mois.
create or replace function public.credits_solde(p_uid uuid)
returns integer language sql stable security definer set search_path = '' as $$
  select case when max(c.created_at) filter (where c.delta > 0 and c.motif in ('achat', 'offert')) >= now() - interval '12 months'
              then greatest(0, coalesce(sum(c.delta), 0))::int else 0 end
  from public.credits c where c.user_id = p_uid;
$$;

-- 2. Recherches lancées et annonces proposées (gardées pour rouvrir la pile sans relancer ni repayer).
create table if not exists public.carcrush_recherches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  criteres jsonb not null,
  nb_criteres integer not null check (nb_criteres >= 2),
  cout integer not null check (cout >= 0),
  trouvees integer,
  annonces jsonb,
  rembourse boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists carcrush_recherches_user_idx on public.carcrush_recherches (user_id, created_at desc);
alter table public.carcrush_recherches enable row level security;
create policy "carcrush_recherches : lecture par le titulaire" on public.carcrush_recherches
  for select to authenticated using ((select auth.uid()) = user_id);

-- 3. Choix faits en swipant : « garde » (coup de cœur) ou « passe ». L'annonce est copiée pour la liste des coups de cœur.
create table if not exists public.carcrush_choix (
  user_id uuid not null references auth.users (id) on delete cascade,
  recherche_id uuid not null references public.carcrush_recherches (id) on delete cascade,
  annonce_id text not null check (length(annonce_id) between 1 and 80),
  choix text not null check (choix in ('garde', 'passe')),
  annonce jsonb not null check (pg_column_size(annonce) < 8000),
  created_at timestamptz not null default now(),
  primary key (user_id, recherche_id, annonce_id)
);
create index if not exists carcrush_choix_garde_idx on public.carcrush_choix (user_id, created_at desc) where choix = 'garde';
alter table public.carcrush_choix enable row level security;
create policy "carcrush_choix : lecture par le titulaire" on public.carcrush_choix
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "carcrush_choix : ajout par le titulaire" on public.carcrush_choix
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.carcrush_recherches r where r.id = recherche_id and r.user_id = (select auth.uid()))
  );
create policy "carcrush_choix : modification par le titulaire" on public.carcrush_choix
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "carcrush_choix : suppression par le titulaire" on public.carcrush_choix
  for delete to authenticated using ((select auth.uid()) = user_id);

-- 4. Lancement : vérifie le solde et débite, en une seule transaction. Appelé par le serveur du site (clé service), qui calcule le coût.
--    Compte illimité : rien n'est débité.
create or replace function public.carcrush_lancer(p_uid uuid, p_criteres jsonb, p_nb integer, p_cout integer)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  rid uuid;
  ill boolean := coalesce((select illimite from public.profils where id = p_uid), false);
  cout int := case when ill then 0 else p_cout end;
begin
  if p_uid is null then raise exception 'non connecté' using errcode = '28000'; end if;
  if p_nb is null or p_nb < 2 then raise exception 'Au moins 2 critères' using errcode = '22023'; end if;
  if p_cout is null or p_cout < 1 or p_cout > 3 then raise exception 'Coût invalide' using errcode = '22023'; end if;
  if pg_column_size(p_criteres) > 4000 then raise exception 'Critères trop volumineux' using errcode = '22023'; end if;
  perform pg_advisory_xact_lock(hashtext('credits:' || p_uid::text));
  if cout > 0 and public.credits_solde(p_uid) < cout then raise exception 'solde insuffisant' using errcode = 'P0001'; end if;
  insert into public.carcrush_recherches (user_id, criteres, nb_criteres, cout) values (p_uid, p_criteres, p_nb, cout) returning id into rid;
  if cout > 0 then
    insert into public.credits (user_id, delta, motif, carcrush_id) values (p_uid, -cout, 'carcrush', rid);
  end if;
  return rid;
end $$;
revoke execute on function public.carcrush_lancer(uuid, jsonb, integer, integer) from public, anon, authenticated;
grant execute on function public.carcrush_lancer(uuid, jsonb, integer, integer) to service_role;

-- 5. Résultat : garde les annonces trouvées ; aucune (ou p_annonces null : recherche en erreur) → crédits rendus, une seule fois.
--    Renvoie le nombre de crédits rendus.
create or replace function public.carcrush_terminer(p_uid uuid, p_id uuid, p_annonces jsonb)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  r public.carcrush_recherches;
  n int := coalesce(jsonb_array_length(case when jsonb_typeof(p_annonces) = 'array' then p_annonces end), 0);
begin
  perform pg_advisory_xact_lock(hashtext('credits:' || p_uid::text));
  select * into r from public.carcrush_recherches where id = p_id and user_id = p_uid for update;
  if not found then raise exception 'Recherche inconnue' using errcode = 'P0002'; end if;
  if r.trouvees is not null then return 0; end if;
  update public.carcrush_recherches set trouvees = n, annonces = case when n > 0 then p_annonces end, rembourse = (n = 0 and r.cout > 0) where id = p_id;
  if n = 0 and r.cout > 0 then
    insert into public.credits (user_id, delta, motif, carcrush_id) values (p_uid, r.cout, 'remboursement', p_id);
    return r.cout;
  end if;
  return 0;
end $$;
revoke execute on function public.carcrush_terminer(uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.carcrush_terminer(uuid, uuid, jsonb) to service_role;
