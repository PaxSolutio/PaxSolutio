-- Read-only metadata audit ONLY. Target must first be confirmed as
-- PaxSolutio / nymrbqulweokwlaucrkv (not PSBC). No application row is read.
BEGIN READ ONLY;
SET LOCAL statement_timeout = '8s';
SET LOCAL lock_timeout = '1s';
SELECT jsonb_pretty(jsonb_build_object(
  'database', current_database(),
  'user', current_user,
  'version', current_setting('server_version'),
  'read_only', current_setting('transaction_read_only'),
  'create_schema', has_database_privilege(current_user,current_database(),'CREATE'),
  'create_function_public', has_schema_privilege(current_user,'public','CREATE'),
  'roles', (SELECT jsonb_agg(jsonb_build_object('role',rolname,'superuser',rolsuper,'bypassrls',rolbypassrls,'login',rolcanlogin))
            FROM pg_roles WHERE rolname IN (current_user,'postgres','anon','authenticated','service_role')),
  'tracking_schema_exists', to_regnamespace('pax_tracking') IS NOT NULL,
  'tracking_rpc_exists', to_regprocedure('public.pax_tracking_dispatch(text,jsonb,uuid)') IS NOT NULL,
  'admin_table', (SELECT jsonb_build_object('owner',pg_get_userbyid(c.relowner),'rls',c.relrowsecurity,'force_rls',c.relforcerowsecurity)
                   FROM pg_class c WHERE c.oid=to_regclass('public.admin_users')),
  'admin_columns', (SELECT jsonb_agg(jsonb_build_object('column',a.attname,'type',format_type(a.atttypid,a.atttypmod),'not_null',a.attnotnull))
                     FROM pg_attribute a WHERE a.attrelid=to_regclass('public.admin_users') AND a.attnum>0 AND NOT a.attisdropped),
  'admin_permissions', (SELECT jsonb_agg(jsonb_build_object('role',rolname,'select',has_table_privilege(oid,to_regclass('public.admin_users'),'SELECT'),'insert',has_table_privilege(oid,to_regclass('public.admin_users'),'INSERT')))
                         FROM pg_roles WHERE rolname IN ('anon','authenticated','service_role',current_user)),
  'admin_policies', (SELECT jsonb_agg(jsonb_build_object('name',policyname,'roles',roles,'command',cmd,'using',qual,'check',with_check))
                      FROM pg_policies WHERE schemaname='public' AND tablename='admin_users'),
  'uuid_builtin', to_regprocedure('pg_catalog.gen_random_uuid()') IS NOT NULL,
  'defaults', (SELECT jsonb_agg(jsonb_build_object('owner',pg_get_userbyid(d.defaclrole),'schema',COALESCE(n.nspname,'ALL'),'kind',d.defaclobjtype,'acl',d.defaclacl::text))
                FROM pg_default_acl d LEFT JOIN pg_namespace n ON n.oid=d.defaclnamespace WHERE pg_get_userbyid(d.defaclrole)=current_user),
  'candidate_objects', (SELECT jsonb_agg(jsonb_build_object('schema',n.nspname,'object',c.relname,'kind',c.relkind))
                         FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='pax_tracking'),
  'existing_public_definers', (SELECT jsonb_agg(jsonb_build_object('name',p.proname,'owner',pg_get_userbyid(p.proowner),'settings',p.proconfig,'anon_execute',has_function_privilege('anon',p.oid,'EXECUTE'),'authenticated_execute',has_function_privilege('authenticated',p.oid,'EXECUTE')))
                               FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.prosecdef)
)) AS compatibility_metadata;
ROLLBACK;
