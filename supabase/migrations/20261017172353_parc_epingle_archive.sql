-- Parc (17 oct. 2026) : épingler un véhicule (en tête du parc et de « Votre journée ») et l'archiver (caché du parc
-- et des décisions du jour, toujours compté dans les marges et les statistiques). Les règles d'accès existantes
-- (modification par le titulaire en Benef Pro) couvrent ces deux colonnes.

alter table public.parc add column if not exists epingle boolean not null default false;
alter table public.parc add column if not exists archive boolean not null default false;

comment on column public.parc.epingle is 'Épinglé : affiché en tête du parc et de « Votre journée ».';
comment on column public.parc.archive is 'Archivé : caché du parc et des décisions du jour, toujours compté dans les statistiques.';
