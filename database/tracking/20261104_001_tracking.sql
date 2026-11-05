-- PaxSolutio tracking V1. PREPARED ONLY: never apply to Production without approval.
-- Requires existing public.admin_users(user_id), anon/authenticated/service_role.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
CREATE SCHEMA pax_tracking;
REVOKE ALL ON SCHEMA pax_tracking FROM PUBLIC, anon, authenticated, service_role;
CREATE TABLE pax_tracking.projects (
 id uuid PRIMARY KEY, reference text NOT NULL UNIQUE CHECK(reference ~ '^[A-Z0-9][A-Z0-9-]{2,23}$'),
 client_name text NOT NULL CHECK(length(client_name) BETWEEN 1 AND 120),
 internal_notes text NOT NULL CHECK(length(internal_notes)<=2000),
 document jsonb NOT NULL CHECK(jsonb_typeof(document)='object'),
 version integer NOT NULL CHECK(version>0), updated_at timestamptz NOT NULL,
 closed boolean NOT NULL DEFAULT false
);
CREATE TABLE pax_tracking.events (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES pax_tracking.projects(id) ON DELETE RESTRICT,
 position integer NOT NULL CHECK(position>=0), document jsonb NOT NULL CHECK(jsonb_typeof(document)='object'),
 UNIQUE(project_id,position)
);
CREATE TABLE pax_tracking.accesses (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES pax_tracking.projects(id) ON DELETE RESTRICT,
 token_hash text NOT NULL UNIQUE CHECK(token_hash ~ '^[0-9a-f]{64}$'),
 code_hash text NOT NULL CHECK(code_hash ~ '^[0-9a-f]{64}$'),
 expires_at timestamptz NOT NULL, revoked boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON pax_tracking.accesses(project_id);
CREATE UNIQUE INDEX one_active_access ON pax_tracking.accesses(project_id) WHERE NOT revoked;
CREATE TABLE pax_tracking.audit (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES pax_tracking.projects(id) ON DELETE RESTRICT,
 actor uuid NOT NULL, happened_at timestamptz NOT NULL DEFAULT now(), action text NOT NULL,
 before_document jsonb, after_document jsonb NOT NULL
);
CREATE INDEX ON pax_tracking.audit(project_id,happened_at);
CREATE TABLE pax_tracking.rate_limits (
 bucket text PRIMARY KEY CHECK(bucket ~ '^[0-9a-f]{64}$'), count integer NOT NULL CHECK(count>0), until_at timestamptz NOT NULL
);
CREATE INDEX ON pax_tracking.rate_limits(until_at);
ALTER TABLE pax_tracking.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pax_tracking.projects FORCE ROW LEVEL SECURITY;
ALTER TABLE pax_tracking.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pax_tracking.events FORCE ROW LEVEL SECURITY;
ALTER TABLE pax_tracking.accesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pax_tracking.accesses FORCE ROW LEVEL SECURITY;
ALTER TABLE pax_tracking.audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE pax_tracking.audit FORCE ROW LEVEL SECURITY;
ALTER TABLE pax_tracking.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pax_tracking.rate_limits FORCE ROW LEVEL SECURITY;
-- No permissive RLS policy: no browser access, including authenticated admins.
REVOKE ALL ON ALL TABLES IN SCHEMA pax_tracking FROM PUBLIC,anon,authenticated,service_role;

CREATE FUNCTION pax_tracking.project_json(project_id uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT p.document || jsonb_build_object('id',p.id,'reference',p.reference,'clientName',p.client_name,
 'internalNotes',p.internal_notes,'version',p.version,'updatedAt',p.updated_at,'closed',p.closed,
 'events',COALESCE((SELECT jsonb_agg(e.document ORDER BY e.position) FROM pax_tracking.events e WHERE e.project_id=p.id),'[]'::jsonb))
 FROM pax_tracking.projects p WHERE p.id=project_id
$$;
CREATE FUNCTION pax_tracking.access_json(access_id uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT jsonb_build_object('id',a.id,'projectId',a.project_id,'tokenHash',a.token_hash,'codeHash',a.code_hash,'expiresAt',a.expires_at,'revoked',a.revoked)
 FROM pax_tracking.accesses a WHERE a.id=access_id
$$;
REVOKE ALL ON FUNCTION pax_tracking.project_json(uuid),pax_tracking.access_json(uuid) FROM PUBLIC,anon,authenticated,service_role;

-- Single service-only RPC. No caller-controlled SQL, no grants to API user roles.
CREATE FUNCTION public.pax_tracking_dispatch(operation text,payload jsonb,actor_id uuid DEFAULT NULL) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
 p_id uuid; a_id uuid; old_doc jsonb; j jsonb; e jsonb; result jsonb; n integer; expected integer;
 k text; idx integer; cap integer; duration interval; rate_count integer; allowed boolean:=true;
BEGIN
 IF jsonb_typeof(payload)<>'object' OR octet_length(payload::text)>500000 THEN RAISE EXCEPTION 'invalid payload' USING ERRCODE='22023'; END IF;
 IF operation IN ('list','get','save','history','rotate','revoke') THEN
  -- Membership is checked again in the same SQL transaction, not a JWT claim.
  PERFORM 1 FROM public.admin_users WHERE user_id=actor_id FOR KEY SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'forbidden' USING ERRCODE='42501'; END IF;
 ELSIF operation NOT IN ('access','active','rate') THEN RAISE EXCEPTION 'unknown operation' USING ERRCODE='22023'; END IF;
 IF operation='list' THEN
  SELECT COALESCE(jsonb_agg(pax_tracking.project_json(p.id) ORDER BY p.updated_at DESC),'[]') INTO result FROM pax_tracking.projects p; RETURN result;
 ELSIF operation='get' THEN RETURN pax_tracking.project_json((payload->>'id')::uuid);
 ELSIF operation='history' THEN
  SELECT COALESCE(jsonb_agg(jsonb_build_object('id',a.id,'projectId',a.project_id,'actor',a.actor,'at',a.happened_at,'action',a.action,'before',a.before_document,'after',a.after_document) ORDER BY a.happened_at),'[]') INTO result FROM pax_tracking.audit a WHERE project_id=(payload->>'id')::uuid; RETURN result;
 ELSIF operation='save' THEN
  j=payload->'project';p_id=(j->>'id')::uuid;expected=(payload->>'expected')::integer;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_id::text,0));
  old_doc=pax_tracking.project_json(p_id);
  IF COALESCE((old_doc->>'version')::integer,0)<>expected OR (j->>'version')::integer<>expected+1 OR COALESCE((old_doc->>'closed')::boolean,false) THEN RAISE EXCEPTION 'version conflict' USING ERRCODE='40001'; END IF;
  IF j->>'status' NOT IN ('À l’étude','Préparation','En transit','Arrivée estimée','Livré','Suspendu') OR length(j->>'title') NOT BETWEEN 1 AND 140 OR jsonb_typeof(j->'events')<>'array' OR jsonb_array_length(j->'events')>200 THEN RAISE EXCEPTION 'invalid project' USING ERRCODE='22023'; END IF;
  IF EXISTS(SELECT 1 FROM jsonb_object_keys(j) AS keys(key) WHERE key NOT IN ('id','reference','clientName','internalNotes','title','type','status','eta','message','events','closed','version','updatedAt')) THEN RAISE EXCEPTION 'unknown field' USING ERRCODE='22023'; END IF;
  INSERT INTO pax_tracking.projects(id,reference,client_name,internal_notes,document,version,updated_at,closed)
  VALUES(p_id,j->>'reference',j->>'clientName',j->>'internalNotes',j-ARRAY['id','reference','clientName','internalNotes','events','version','updatedAt','closed'],(j->>'version')::integer,(j->>'updatedAt')::timestamptz,(j->>'closed')::boolean)
  ON CONFLICT(id) DO UPDATE SET reference=excluded.reference,client_name=excluded.client_name,internal_notes=excluded.internal_notes,document=excluded.document,version=excluded.version,updated_at=excluded.updated_at,closed=excluded.closed;
  -- An update replaces this project's event snapshot atomically; audit retains history.
  DELETE FROM pax_tracking.events WHERE project_id=p_id;
  n=0;FOR e IN SELECT value FROM jsonb_array_elements(j->'events') LOOP
   INSERT INTO pax_tracking.events VALUES((e->>'id')::uuid,p_id,n,e);n=n+1;
  END LOOP;
  IF (j->>'closed')::boolean THEN UPDATE pax_tracking.accesses SET revoked=true WHERE project_id=p_id; END IF;
  INSERT INTO pax_tracking.audit(project_id,actor,action,before_document,after_document) VALUES(p_id,actor_id,payload->>'action',old_doc,j);
  RETURN 'null'::jsonb;
 ELSIF operation IN ('rotate','revoke') THEN
  p_id=COALESCE(payload->'access'->>'projectId',payload->>'id')::uuid;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_id::text,0));old_doc=pax_tracking.project_json(p_id);
  IF old_doc IS NULL OR (old_doc->>'closed')::boolean THEN RAISE EXCEPTION 'closed or absent' USING ERRCODE='40001'; END IF;
  UPDATE pax_tracking.accesses SET revoked=true WHERE project_id=p_id;
  IF operation='rotate' THEN
   j=payload->'access';IF (j->>'expiresAt')::timestamptz<=now() OR (j->>'expiresAt')::timestamptz>now()+interval '91 days' THEN RAISE EXCEPTION 'invalid expiry' USING ERRCODE='22023'; END IF;
   INSERT INTO pax_tracking.accesses(id,project_id,token_hash,code_hash,expires_at) VALUES((j->>'id')::uuid,p_id,j->>'tokenHash',j->>'codeHash',(j->>'expiresAt')::timestamptz);
  END IF;
  INSERT INTO pax_tracking.audit(project_id,actor,action,before_document,after_document) VALUES(p_id,actor_id,CASE WHEN operation='rotate' THEN 'Accès renouvelé' ELSE 'Accès révoqué' END,old_doc,old_doc);RETURN 'null'::jsonb;
 ELSIF operation='access' THEN
  IF payload->>'reference' IS NULL THEN SELECT a.id INTO a_id FROM pax_tracking.accesses a JOIN pax_tracking.projects p ON p.id=a.project_id WHERE token_hash=payload->>'hash' AND NOT a.revoked AND NOT p.closed AND a.expires_at>now();
  ELSE SELECT a.id INTO a_id FROM pax_tracking.accesses a JOIN pax_tracking.projects p ON p.id=a.project_id WHERE a.code_hash=payload->>'hash' AND p.reference=payload->>'reference' AND NOT a.revoked AND NOT p.closed AND a.expires_at>now();END IF;
  RETURN pax_tracking.access_json(a_id);
 ELSIF operation='active' THEN
  SELECT a.project_id INTO p_id FROM pax_tracking.accesses a JOIN pax_tracking.projects p ON p.id=a.project_id WHERE a.id=(payload->>'id')::uuid AND NOT a.revoked AND NOT p.closed AND a.expires_at>now();
  IF p_id IS NULL THEN RETURN NULL;END IF;
  RETURN jsonb_build_object('access',pax_tracking.access_json((payload->>'id')::uuid),'project',pax_tracking.project_json(p_id));
 ELSIF operation='rate' THEN
  IF jsonb_typeof(payload->'keys')<>'array' OR jsonb_array_length(payload->'keys')<>3 THEN RAISE EXCEPTION 'invalid buckets' USING ERRCODE='22023';END IF;
  DELETE FROM pax_tracking.rate_limits WHERE until_at<=now();
  idx=0;FOR k IN SELECT value FROM jsonb_array_elements_text(payload->'keys') LOOP
   cap=CASE WHEN idx=0 THEN 100 ELSE 10 END;duration=CASE WHEN idx=0 THEN interval '1 minute' ELSE interval '15 minutes' END;
   INSERT INTO pax_tracking.rate_limits(bucket,count,until_at) VALUES(k,1,now()+duration)
   ON CONFLICT(bucket) DO UPDATE SET count=pax_tracking.rate_limits.count+1 RETURNING count INTO rate_count;
   IF rate_count>cap THEN allowed=false;IF idx=0 THEN RETURN false;END IF;END IF;idx=idx+1;
  END LOOP;RETURN to_jsonb(allowed);
 END IF;
 RAISE EXCEPTION 'unhandled operation';
END;
$$;
REVOKE ALL ON FUNCTION public.pax_tracking_dispatch(text,jsonb,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.pax_tracking_dispatch(text,jsonb,uuid) TO service_role;
COMMENT ON FUNCTION public.pax_tracking_dispatch(text,jsonb,uuid) IS 'Server-only tracking V1. Actor verified against current admin_users for administration. No client grants.';
COMMIT;
