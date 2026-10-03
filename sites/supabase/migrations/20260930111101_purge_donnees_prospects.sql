-- Durées de conservation RGPD : inscrits 3 ans après le dernier contact, messages 1 an,
-- jetons d'accès au guide effacés 1 jour après expiration.
select cron.schedule('purge-donnees-prospects', '17 3 * * *', $$
  delete from public.landing_leads where greatest(created_at, coalesce(confirme_le, created_at)) < now() - interval '3 years';
  delete from public.contact_messages where created_at < now() - interval '1 year';
  update public.landing_leads set token_hash = null where token_expire < now() - interval '1 day' and token_hash is not null;
$$);
