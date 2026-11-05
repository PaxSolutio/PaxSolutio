// Catalog and aggregate fingerprints remain inside encrypted manifests, never console output.
export const identifier=s=>'"'+String(s).replaceAll('"','""')+'"';
export const CATALOG_SQL=`SELECT jsonb_build_object(
 'tables',(SELECT jsonb_agg(jsonb_build_object('schema',n.nspname,'name',c.relname,'kind',c.relkind,'owner',pg_get_userbyid(c.relowner),'rls',c.relrowsecurity,'forced',c.relforcerowsecurity,'acl',(SELECT array_agg(a::text ORDER BY a::text) FROM unnest(COALESCE(c.relacl,acldefault(CASE WHEN c.relkind='S' THEN 's'::"char" ELSE 'r'::"char" END,c.relowner))) a)) ORDER BY n.nspname,c.relname) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname !~ '^pg_' AND n.nspname<>'information_schema' AND c.relkind IN ('r','p','v','m','S') AND NOT EXISTS(SELECT FROM pg_depend d WHERE d.classid='pg_class'::regclass AND d.objid=c.oid AND d.deptype='e')),
 'policies',(SELECT jsonb_agg(jsonb_build_object('schema',schemaname,'table',tablename,'name',policyname,'roles',roles,'permissive',permissive,'using',qual,'check',with_check,'command',cmd) ORDER BY schemaname,tablename,policyname) FROM pg_policies),
 'constraints',(SELECT jsonb_agg(jsonb_build_object('table',conrelid::regclass::text,'name',conname,'definition',pg_get_constraintdef(oid)) ORDER BY conrelid::regclass::text,conname) FROM pg_constraint WHERE connamespace IN (SELECT oid FROM pg_namespace WHERE nspname !~ '^pg_' AND nspname<>'information_schema')),
 'functions',(SELECT jsonb_agg(jsonb_build_object('schema',n.nspname,'name',p.proname,'args',pg_get_function_identity_arguments(p.oid),'owner',pg_get_userbyid(p.proowner),'definition',pg_get_functiondef(p.oid),'acl',(SELECT array_agg(a::text ORDER BY a::text) FROM unnest(COALESCE(p.proacl,acldefault('f',p.proowner))) a)) ORDER BY n.nspname,p.proname,pg_get_function_identity_arguments(p.oid)) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname !~ '^pg_' AND n.nspname<>'information_schema' AND p.prokind IN ('f','p') AND NOT EXISTS(SELECT FROM pg_depend d WHERE d.classid='pg_proc'::regclass AND d.objid=p.oid AND d.deptype='e')),
 'default_acls',(SELECT jsonb_agg(jsonb_build_object('owner',pg_get_userbyid(defaclrole),'schema',CASE WHEN defaclnamespace=0 THEN '' ELSE defaclnamespace::regnamespace::text END,'kind',defaclobjtype,'acl',(SELECT array_agg(a::text ORDER BY a::text) FROM unnest(defaclacl) a)) ORDER BY pg_get_userbyid(defaclrole),defaclnamespace::regnamespace::text,defaclobjtype) FROM pg_default_acl),
 'effective_privileges',(SELECT jsonb_agg(jsonb_build_object('role',r.rolname,'schema',n.nspname,'table',c.relname,'usage',has_schema_privilege(r.oid,n.oid,'USAGE'),'select',has_table_privilege(r.oid,c.oid,'SELECT'),'insert',has_table_privilege(r.oid,c.oid,'INSERT'),'update',has_table_privilege(r.oid,c.oid,'UPDATE'),'delete',has_table_privilege(r.oid,c.oid,'DELETE')) ORDER BY r.rolname,n.nspname,c.relname) FROM pg_roles r CROSS JOIN pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE r.rolname IN ('anon','authenticated','service_role') AND n.nspname !~ '^pg_' AND n.nspname<>'information_schema' AND c.relkind IN ('r','p') AND NOT EXISTS(SELECT FROM pg_depend d WHERE d.classid='pg_class'::regclass AND d.objid=c.oid AND d.deptype='e'))
 ) AS catalog`;
export const TABLES_SQL="SELECT n.nspname AS schema,c.relname AS name,c.relkind AS kind,EXISTS(SELECT FROM pg_depend d WHERE d.classid='pg_class'::regclass AND d.objid=c.oid AND d.deptype='e') AS extension_owned,has_table_privilege(c.oid,'SELECT') AS readable FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relkind IN ('r','p','S') AND n.nspname !~ '^pg_' AND n.nspname<>'information_schema' ORDER BY n.nspname,c.relname";
export function fingerprintSQL(t){
 const table=identifier(t.schema)+'.'+identifier(t.name);
 if(t.kind==='S')return `SELECT jsonb_build_object('last',last_value::text,'called',is_called) AS fingerprint FROM ${table}`;
 // MD5 is a deterministic row-comparison checksum, not an authenticity primitive.
 // The complete manifest is authenticated with AES-GCM and SHA-256 by archive.mjs.
 return `SELECT jsonb_build_object('rows',count(*)::text,'checksum',md5(COALESCE(string_agg(md5(row_to_json(t)::text),'' ORDER BY md5(row_to_json(t)::text)),''))) AS fingerprint FROM ONLY ${table} t`;
}
export async function capture(query){
 const tables=(await query(TABLES_SQL)).rows.filter(t=>!t.extension_owned);
 if(tables.some(t=>!t.readable))throw Error('REQUIRED_TABLE_UNREADABLE');
 const out={catalog:(await query(CATALOG_SQL)).rows[0].catalog,tables:[]};
 for(const t of tables)out.tables.push({...t,fingerprint:(await query(fingerprintSQL(t))).rows[0].fingerprint});
 return out;
}
