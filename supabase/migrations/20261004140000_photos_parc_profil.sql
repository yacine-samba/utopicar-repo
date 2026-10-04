-- 1. Rapports : photos de la voiture (liens Leboncoin ou photos envoyées, stockées), lien de l'annonce d'origine, vendeur.
alter table public.rapports add column if not exists photos text[] not null default '{}';
alter table public.rapports add column if not exists lien text;
alter table public.rapports add column if not exists vendeur jsonb;

-- Complète un rapport juste après son enregistrement (appelé par le serveur avec la session de la personne).
create or replace function public.rapport_completer(p_id uuid, p_photos text[], p_lien text, p_vendeur jsonb)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.rapports set
    photos = coalesce((select array_agg(u) from (select u from unnest(coalesce(p_photos, '{}')) u where u ~ '^https://' and length(u) < 1000 limit 12) x), '{}'),
    lien = case when p_lien ~ '^https?://' then left(p_lien, 500) else null end,
    vendeur = case when jsonb_typeof(p_vendeur) = 'object' and pg_column_size(p_vendeur) < 2000 then p_vendeur else null end
  where id = p_id and user_id = (select auth.uid());
end $$;
revoke execute on function public.rapport_completer(uuid, text[], text, jsonb) from public, anon;
grant execute on function public.rapport_completer(uuid, text[], text, jsonb) to authenticated;

-- 2. Stockage des photos (rapports et parc) : lecture publique par lien, écriture dans son propre dossier seulement.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

create policy "photos : ajout dans son dossier" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "photos : remplacement dans son dossier" on storage.objects for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "photos : suppression dans son dossier" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- 3. Profil : le nom en plus du prénom.
alter table public.profils add column if not exists nom text check (length(nom) <= 80);
grant update (nom) on public.profils to authenticated;

-- 4. Parc : fiche complète, comme l'outil Garage.
alter table public.parc
  add column if not exists finition text check (length(finition) <= 140),
  add column if not exists annee integer check (annee between 1950 and 2100),
  add column if not exists km integer check (km between 0 and 2000000),
  add column if not exists energie text check (length(energie) <= 30),
  add column if not exists boite text check (length(boite) <= 30),
  add column if not exists premiere_immat date,
  add column if not exists cv integer check (cv between 0 and 200),
  add column if not exists couleur text check (length(couleur) <= 40),
  add column if not exists vin text check (length(vin) <= 20),
  add column if not exists localisation text check (length(localisation) <= 120),
  add column if not exists lien text check (length(lien) <= 500),
  add column if not exists structure text not null default 'achat' check (structure in ('achat', 'paiement_revente', 'mandat', 'depot', 'intermediation')),
  add column if not exists commission integer check (commission >= 0),
  add column if not exists prix_conseille integer check (prix_conseille >= 0),
  add column if not exists note_qualite text check (note_qualite in ('A', 'B', 'C', 'D')),
  add column if not exists ct_date date,
  add column if not exists vendeur_nom text check (length(vendeur_nom) <= 80),
  add column if not exists vendeur_tel text check (length(vendeur_tel) <= 30),
  add column if not exists frais_detail jsonb not null default '[]' check (jsonb_typeof(frais_detail) = 'array' and pg_column_size(frais_detail) < 20000),
  add column if not exists docs jsonb not null default '{}' check (jsonb_typeof(docs) = 'object' and pg_column_size(docs) < 4000),
  add column if not exists photos text[] not null default '{}' check (cardinality(photos) <= 12);
