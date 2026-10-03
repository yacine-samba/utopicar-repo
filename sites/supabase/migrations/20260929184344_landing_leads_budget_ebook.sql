alter table public.landing_leads
  add column if not exists budget text check (budget is null or length(budget) <= 40),
  add column if not exists interet_ebook boolean not null default false;
