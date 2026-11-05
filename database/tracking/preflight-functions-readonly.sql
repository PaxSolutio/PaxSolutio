-- Metadata only, already observed functions; no table rows or mutations.
BEGIN READ ONLY;
SET LOCAL statement_timeout = '8s';
SELECT jsonb_pretty(jsonb_build_object(
 'definitions',(SELECT jsonb_agg(jsonb_build_object('name',p.proname,'definition',pg_get_functiondef(p.oid))) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('is_admin','rls_auto_enable')),
 'event_triggers',(SELECT jsonb_agg(jsonb_build_object('name',evtname,'event',evtevent,'enabled',evtenabled,'function',evtfoid::regprocedure::text,'tags',evttags)) FROM pg_event_trigger)
)) AS function_metadata;
ROLLBACK;
