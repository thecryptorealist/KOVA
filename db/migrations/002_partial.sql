BEGIN;
ALTER TABLE core.index_builds DROP CONSTRAINT index_builds_status_check;
ALTER TABLE core.index_builds ADD CONSTRAINT index_builds_status_check CHECK(status IN ('building','published','refused','preview'));
ALTER TABLE core.index_builds ADD CONSTRAINT preview_is_partial CHECK(status<>'preview' OR (content_hash IS NOT NULL AND artifact IS NOT NULL AND (artifact->'metadata'->>'mode') IS NOT DISTINCT FROM 'partial'));
ALTER TABLE core.index_builds ADD CONSTRAINT published_is_strict CHECK(status<>'published' OR coalesce(artifact->'metadata'->>'mode','strict')='strict');
ALTER TABLE core.index_builds DROP CONSTRAINT index_builds_check;
ALTER TABLE core.index_builds ADD CONSTRAINT index_window_duration CHECK ((status='preview' AND window_end>window_start AND window_end-window_start<interval '24 hours') OR (status<>'preview' AND window_end-window_start=interval '24 hours'));
COMMIT;
