-- Annonces d'un modèle pour la recherche et la cote (moteur de l'outil Garage côté site) :
-- relevés (marche_annonces), cotes Garage (cote_annonces) et recherches suivies (annonces), sans doublon.
-- p_regex : motif du modèle (catalogue, mots entiers \y), p_marque : motif de la marque, appliqués au titre sans accents.
create or replace function public.marche_candidats(p_regex text, p_marque text, p_annee_min integer, p_annee_max integer, p_limite integer default 3000)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with toutes as (
    select ca.id, 'garage' as source, ca.titre, ca.texte, ca.prix, ca.annee, ca.km, ca.energie, ca.boite, (ca.vendeur ilike 'pro%') as pro, ca.ch, ca.places, ca.carrosserie as carr, ca.etat,
           ca.dep as lieu, null::text as url, ca.publie_le as vu_le, public.norm_txt(coalesce(ca.titre, '') || ' ' || ca.cle) as t
    from public.cote_annonces ca
    union all
    select a.id, 'suivi', a.titre, left(a.description, 700), a.prix, a.annee, a.km, a.energie, a.boite, a.vendeur_type = 'professionnel', null::int, null::int, null, null,
           coalesce(a.ville, '') || coalesce(' ' || a.cp, ''), a.url, coalesce(a.publie_le, a.premiere_vue), public.norm_txt(coalesce(a.marque, '') || ' ' || coalesce(a.modele, '') || ' ' || coalesce(a.titre, ''))
    from public.annonces a
    union all
    select substr(m.id, 5), m.source, m.titre, null, m.prix, m.annee, m.km, m.energie, m.boite, m.pro, m.ch, null::int, null, null, m.cp,
           'https://www.leboncoin.fr/ad/voitures/' || substr(m.id, 5), m.vu_le, m.titre_norm
    from public.marche_annonces m where m.source = 'releve'
  ), filtrees as (
    select distinct on (id) * from toutes
    where public.a_offre(array['pro']) -- base du marché : Benef Pro et illimité
      and prix between 300 and 300000
      and (p_regex is null or t ~ p_regex)
      and (p_marque is null or t ~ p_marque)
      and (p_annee_min is null or annee >= p_annee_min)
      and (p_annee_max is null or annee <= p_annee_max)
    order by id, (source = 'suivi') desc, (texte is not null) desc
  )
  select coalesce(jsonb_agg(to_jsonb(f) - 't'), '[]'::jsonb) from (select * from filtrees order by vu_le desc nulls last limit greatest(1, least(p_limite, 5000))) f;
$$;
revoke execute on function public.marche_candidats(text, text, integer, integer, integer) from public, anon;
grant execute on function public.marche_candidats(text, text, integer, integer, integer) to authenticated;
