-- Analyse 2027 (1/4), second lot : rapport partageable, retours « ce chiffre est faux », historique des prix et republications,
-- suivi des annonces analysées, réponses du vendeur ajoutées au rapport, mesure de justesse (administration).
-- Les déclencheurs touchent des tables écrites par les collectes : si une collecte tient un verrou, la migration échoue
-- au bout de 15 s au lieu de bloquer le site ; il suffit de la relancer.
set lock_timeout = '15s';

-- ---------------------------------------------------------------- 1. Rapport partageable par lien
alter table public.rapports add column if not exists partage text unique check (partage is null or partage ~ '^[0-9a-f]{32}$');
comment on column public.rapports.partage is 'Jeton du lien public /r/<jeton> (lecture seule, sans les coordonnées du vendeur). Vide : non partagé.';

create or replace function public.rapport_partager(p_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare v text;
begin
  update public.rapports set partage = coalesce(partage, replace(gen_random_uuid()::text, '-', ''))
  where id = p_id and user_id = (select auth.uid())
  returning partage into v;
  return v;
end $$;

create or replace function public.rapport_departager(p_id uuid)
returns void language sql security definer set search_path = '' as $$
  update public.rapports set partage = null where id = p_id and user_id = (select auth.uid());
$$;

-- Lecture publique : jamais le vendeur (prénom, téléphone), ni le texte brut de l'annonce, ni l'identifiant du compte.
create or replace function public.rapport_public(p_jeton text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'titre', r.titre, 'mode', r.mode, 'created_at', r.created_at, 'photos', to_jsonb(r.photos), 'lien', r.lien,
    'resultat', r.resultat - 'vendeur' - 'rapportId' - 'vignettes' - 'restantes')
  from public.rapports r
  where p_jeton ~ '^[0-9a-f]{32}$' and r.partage = p_jeton;
$$;
revoke execute on function public.rapport_partager(uuid), public.rapport_departager(uuid) from public, anon;
grant execute on function public.rapport_partager(uuid), public.rapport_departager(uuid) to authenticated;
revoke execute on function public.rapport_public(text) from public;
grant execute on function public.rapport_public(text) to anon, authenticated;

-- ---------------------------------------------------------------- 2. Réponses du vendeur et mode visite gardés avec le rapport
-- Les compléments ne remplacent rien : l'analyse d'origine reste, le bilan les ajoute (avant / après).
create or replace function public.rapport_reponses(p_id uuid, p_complements jsonb, p_verdict text, p_note integer, p_marge integer)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if jsonb_typeof(p_complements) <> 'array' or pg_column_size(p_complements) > 200000 then
    raise exception 'compléments invalides';
  end if;
  update public.rapports set
    resultat = jsonb_set(resultat, '{complements}', p_complements),
    verdict = coalesce(left(p_verdict, 40), verdict),
    note = coalesce(p_note, note),
    marge = coalesce(p_marge, marge)
  where id = p_id and user_id = (select auth.uid());
end $$;
revoke execute on function public.rapport_reponses(uuid, jsonb, text, integer, integer) from public, anon;
grant execute on function public.rapport_reponses(uuid, jsonb, text, integer, integer) to authenticated;

-- ---------------------------------------------------------------- 3. « Ce chiffre est faux »
create table if not exists public.retours_analyse (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  rapport_id uuid references public.rapports (id) on delete set null,
  champ text not null check (champ in ('verdict', 'fiabilite', 'travaux', 'prix', 'rentabilite', 'usage', 'cote', 'autre')),
  valeur_outil text check (char_length(valeur_outil) <= 80),
  valeur_juste text check (char_length(valeur_juste) <= 80),
  commentaire text check (char_length(commentaire) <= 600),
  created_at timestamptz not null default now()
);
create index if not exists retours_analyse_date_idx on public.retours_analyse (created_at desc);
alter table public.retours_analyse enable row level security;
create policy "retours : ajout des siens" on public.retours_analyse for insert to authenticated with check (user_id = (select auth.uid()));
create policy "retours : lecture des siens" on public.retours_analyse for select to authenticated using (user_id = (select auth.uid()));
grant select, insert on public.retours_analyse to authenticated;
revoke all on public.retours_analyse from anon;

