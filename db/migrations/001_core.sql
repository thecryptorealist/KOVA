BEGIN;
CREATE SCHEMA core;

CREATE TABLE core.launches (
 mint text PRIMARY KEY, creator text NOT NULL, program_id text NOT NULL,
 signature text NOT NULL, event_index integer NOT NULL CHECK(event_index >= 0),
 slot bigint NOT NULL CHECK(slot >= 0), block_time timestamptz,
 seen_at timestamptz NOT NULL DEFAULT now(), metadata_uri text NOT NULL, fields jsonb NOT NULL DEFAULT '{}',
 metadata_status text NOT NULL DEFAULT 'pending' CHECK(metadata_status IN ('pending','ok','failed')),
 metadata_attempts integer NOT NULL DEFAULT 0, next_metadata_attempt timestamptz,
 UNIQUE(signature,event_index)
);
CREATE INDEX ON core.launches(block_time);
CREATE INDEX ON core.launches(creator,block_time);
CREATE INDEX ON core.launches(next_metadata_attempt) WHERE metadata_status='pending';
-- Internal evidence hashes; no launch strings in the published index.
CREATE TABLE core.field_hashes (
 mint text NOT NULL REFERENCES core.launches(mint),
 namespace text NOT NULL CHECK(namespace IN ('name','ticker','name_skeleton','ticker_skeleton','description','link','logo')),
 hash text NOT NULL CHECK(hash ~ '^[0-9a-f]{16}$'),
 spelling_hash text CHECK(spelling_hash ~ '^[0-9a-f]{64}$'),
 PRIMARY KEY(mint,namespace,hash)
);
CREATE INDEX ON core.field_hashes(namespace,hash);
CREATE TABLE core.collector_sessions (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 started_at timestamptz NOT NULL DEFAULT now(), heartbeat_at timestamptz NOT NULL DEFAULT now(),
 last_finalized_slot bigint, stopped_at timestamptz
);
-- A jump between launch events alone does not prove missed slots.
CREATE TABLE core.gaps (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 start_slot bigint, end_slot bigint, detected_at timestamptz NOT NULL DEFAULT now(),
 reason text NOT NULL, resolved_at timestamptz,
 CHECK(end_slot IS NULL OR start_slot IS NULL OR end_slot>=start_slot)
);
CREATE TABLE core.index_builds (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 window_start timestamptz NOT NULL, window_end timestamptz NOT NULL,
 built_at timestamptz NOT NULL DEFAULT now(),
 status text NOT NULL CHECK(status IN ('building','published','refused')),
 content_hash text, artifact jsonb, refusal_reason text,
 CHECK(window_end-window_start=interval '24 hours'),
 CHECK(status <> 'published' OR (content_hash IS NOT NULL AND artifact IS NOT NULL))
);
ALTER TABLE core.launches ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.field_hashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.collector_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.index_builds ENABLE ROW LEVEL SECURITY;
COMMIT;
