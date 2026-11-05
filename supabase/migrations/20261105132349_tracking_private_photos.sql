-- PREPARED ONLY. Requires explicit user authorization for this exact bucket.
-- Exclusive target: PaxSolutio nymrbqulweokwlaucrkv.
-- No existing bucket, policy, grant, application table or row is changed.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='15s';
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM storage.buckets WHERE id='pax-tracking-media' OR name='pax-tracking-media') THEN
  RAISE EXCEPTION 'Tracking bucket already exists: inspect before any change';
 END IF;
END $$;
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES ('pax-tracking-media','pax-tracking-media',false,2097152,ARRAY['image/webp']);
-- No client policy: uploads/downloads only through the authorised server.
-- Existing policies are scoped to news-media and do not grant this bucket.
COMMIT;
