alter table public.landing_leads
  add column if not exists envoi_tentatives integer not null default 0,
  add column if not exists dernier_envoi timestamptz,
  add column if not exists relance_le timestamptz,
  add column if not exists desinscrit boolean not null default false,
  add column if not exists desinscrit_le timestamptz;

create or replace function public.lancer_taches_leads()
returns bigint language plpgsql security definer set search_path to 'public','extensions' as $$
declare v_secret text; v_req bigint;
begin
  select valeur into v_secret from public.reglages where cle = 'cle_interne';
  select net.http_post(
    url := 'https://rvdfifhgosovdapdltps.supabase.co/functions/v1/inscription',
    headers := jsonb_build_object('Content-Type','application/json','x-cle-interne', v_secret),
    body := '{"action":"taches"}'::jsonb,
    timeout_milliseconds := 60000) into v_req;
  return v_req;
end $$;
revoke all on function public.lancer_taches_leads() from public, anon, authenticated;

select cron.schedule('leads-envois-relances', '7,37 * * * *', 'select public.lancer_taches_leads();');
