-- Messages Leboncoin : la fonction « messages » est appelée toutes les minutes ; elle n'envoie rien sans campagne active,
-- s'arrête seule à la date « lbc_jusqu_au » (réglages) et espace elle-même les requêtes Apify de 2 minutes.
select cron.schedule('messages-leboncoin', '* * * * *', 'select public.lancer_messages();')
where not exists (select 1 from cron.job where jobname = 'messages-leboncoin');
