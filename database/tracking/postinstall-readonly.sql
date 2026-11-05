-- PREPARED ONLY: run after a separately authorised installation on the exact target.
-- Metadata and aggregate counts of the NEW tracking tables only; no client rows.
BEGIN READ ONLY;
SET LOCAL statement_timeout = '8s';
SELECT current_database(), current_user, current_setting('transaction_read_only');
SELECT c.relname, pg_get_userbyid(c.relowner) AS owner, c.relacl,
       c.relrowsecurity AS rls, c.relforcerowsecurity AS force_rls,
       (SELECT count(*) FROM pg_policy p WHERE p.polrelid=c.oid) AS policies
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='pax_tracking' AND c.relkind='r' ORDER BY c.relname;
SELECT r.rolname, c.relname,
       has_schema_privilege(r.oid,n.oid,'USAGE') AS schema_usage,
       has_table_privilege(r.oid,c.oid,'SELECT') AS can_select,
       has_table_privilege(r.oid,c.oid,'INSERT') AS can_insert,
       has_table_privilege(r.oid,c.oid,'UPDATE') AS can_update,
       has_table_privilege(r.oid,c.oid,'DELETE') AS can_delete,
       has_table_privilege(r.oid,c.oid,'TRUNCATE') AS can_truncate,
       has_table_privilege(r.oid,c.oid,'REFERENCES') AS can_reference,
       has_table_privilege(r.oid,c.oid,'TRIGGER') AS can_trigger
FROM pg_roles r CROSS JOIN pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE r.rolname IN ('anon','authenticated','service_role')
AND n.nspname='pax_tracking' AND c.relkind='r' ORDER BY r.rolname,c.relname;
SELECT n.nspname,p.proname,pg_get_userbyid(p.proowner) AS owner,p.prosecdef,p.proconfig,p.proacl,
       has_function_privilege('anon',p.oid,'EXECUTE') AS anon_execute,
       has_function_privilege('authenticated',p.oid,'EXECUTE') AS authenticated_execute,
       has_function_privilege('service_role',p.oid,'EXECUTE') AS service_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='pax_tracking' OR (n.nspname='public' AND p.proname='pax_tracking_dispatch');
SELECT 'projects' AS object,count(*) FROM pax_tracking.projects
UNION ALL SELECT 'events',count(*) FROM pax_tracking.events
UNION ALL SELECT 'accesses',count(*) FROM pax_tracking.accesses
UNION ALL SELECT 'audit',count(*) FROM pax_tracking.audit
UNION ALL SELECT 'rate_limits',count(*) FROM pax_tracking.rate_limits;
ROLLBACK;
