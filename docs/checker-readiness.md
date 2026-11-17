# Checker readiness and partial previews

Strict remains the default for the API, typed client, UI and index builder. Strict publication still requires full 24-hour coverage, a fresh collector heartbeat, no unresolved gaps in the window, and successful metadata reads. Those checks have not been disabled.

The checker includes an explicit **Use partial preview** action. It selects the existing partial mode; it does not automatically substitute a partial result for a strict result. Every result includes the real window start, end and duration. Older windows are also identified as historical snapshots. A match applies only to the labelled window, not all launches in the database or the whole market.

The index CLI accepts `--end <ISO timestamp>` and an optional partial-only `--start <ISO timestamp>` to build a reproducible historical snapshot using the existing coverage, gap and metadata checks. Example: `npm run index:build -- --partial --end 2026-11-17T10:45:27.481Z`. Verify the latest partial artifact with `npm run index:verify -- --partial`.

Metadata recovery can target a required interval: `npm run metadata:start -- --from <ISO timestamp> --to <ISO timestamp>`. This supervisor restarts the separate recovery worker if its connection lock is lost. The worker continues to use unchanged metadata mappings and normalization. It does not write collector heartbeats. Remove the interval arguments to continue general recovery after a preview has been completed.

Local background processes are not deployed production services. A historical preview does not establish current live coverage or make strict mode eligible. Keep collection and recovery running and inspect reported gaps before attempting strict publication.

Verified preview: 2026-11-17T10:43:35.000Z through 2026-11-17T10:45:27.481Z (112.481 seconds). Content hash `df04c59e1244dbfd13f4551880ef9eac9143c8f6e423e8b8cb84aa09b3948fa3`, 25 shared index entries. Reproduction returned the same hash. API and browser comparison for JUSSY COIN / $JUSSY returned two matching launches and one distinct creator in this interval. Browser receipt download recorded that exact index hash. This is a historical snapshot, not current or complete 24-hour coverage.

A stale collector failure was found overwriting recovered metadata. The failure update now refuses to change records already marked successful. A real-database verification transaction updated zero successful rows and retained status ok, then rolled back. One affected successful state was restored only after verifying its previously fetched fields against every stored normalized hash.

Expanded verified preview: all 63 launches in 2026-11-17T10:41:12.204Z through 2026-11-17T10:45:27.481Z have successful metadata. Coverage is 255.277 seconds; 43 shared index entries; hash `d7e1946879078e447328d9468c051f7dab68c717228bbbf2f8bd8b80b4e3650f`. Reproduction matched. API, browser comparison, and newly downloaded receipt matched this hash. JUSSY COIN / $JUSSY returned three matching launches and one distinct creator.

Partial start boundaries are now excluded by their exact gap record ID. PostgreSQL retains sub-millisecond timestamps that JavaScript Date truncates; previously the start marker could be incorrectly counted as a later unresolved gap. Other gap IDs remain blocking, including strict mode, which never excludes a boundary.
