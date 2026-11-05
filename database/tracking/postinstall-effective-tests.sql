-- Non-mutating effective permission tests after the authorised installation.
-- No fixture, account, row or grant is created. Transaction always rolls back.
BEGIN;
SET LOCAL statement_timeout='10s';
SET LOCAL lock_timeout='2s';
DO $$
DECLARE r text; t text; denied boolean;
BEGIN
 IF EXISTS(SELECT 1 FROM public.admin_users WHERE user_id='00000000-0000-4000-8000-0000000000f1'::uuid) THEN
  RAISE EXCEPTION 'test actor collision';
 END IF;
 FOREACH r IN ARRAY ARRAY['anon','authenticated','service_role'] LOOP
  FOREACH t IN ARRAY ARRAY['projects','events','accesses','audit','rate_limits'] LOOP
   denied=false;EXECUTE format('SET LOCAL ROLE %I',r);
   BEGIN EXECUTE format('SELECT count(*) FROM pax_tracking.%I',t);
   EXCEPTION WHEN insufficient_privilege THEN denied=true;END;
   RESET ROLE;
   IF NOT denied THEN RAISE EXCEPTION 'unexpected direct access';END IF;
  END LOOP;
 END LOOP;
 FOREACH r IN ARRAY ARRAY['anon','authenticated'] LOOP
  denied=false;EXECUTE format('SET LOCAL ROLE %I',r);
  BEGIN PERFORM public.pax_tracking_dispatch('active','{"id":"00000000-0000-4000-8000-0000000000f1"}'::jsonb,NULL);
  EXCEPTION WHEN insufficient_privilege THEN denied=true;END;
  RESET ROLE;
  IF NOT denied THEN RAISE EXCEPTION 'unexpected browser RPC access';END IF;
 END LOOP;
 denied=false;SET LOCAL ROLE service_role;
 BEGIN PERFORM public.pax_tracking_dispatch('list','{}'::jsonb,'00000000-0000-4000-8000-0000000000f1'::uuid);
 EXCEPTION WHEN insufficient_privilege THEN denied=true;END;
 RESET ROLE;
 IF NOT denied THEN RAISE EXCEPTION 'unexpected unprivileged actor access';END IF;
 SET LOCAL ROLE service_role;
 IF public.pax_tracking_dispatch('active','{"id":"00000000-0000-4000-8000-0000000000f1"}'::jsonb,NULL) IS NOT NULL THEN
  RAISE EXCEPTION 'unexpected absent access';
 END IF;
 IF public.pax_tracking_dispatch('access','{"hash":"0000000000000000000000000000000000000000000000000000000000000000"}'::jsonb,NULL) IS NOT NULL THEN
  RAISE EXCEPTION 'unexpected absent token';
 END IF;
 RESET ROLE;
END $$;
SELECT 'passed' AS result,15 AS denied_direct_table_reads,2 AS denied_browser_rpc_calls,1 AS denied_unprivileged_actor,2 AS service_rpc_absence_checks,0 AS data_writes;
ROLLBACK;
