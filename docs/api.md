# Core JSON API v1

No cookies, tracking or third-party client requests. CORS uses the comma-separated CORS_ORIGINS environment setting. In-memory IP limit: 120 requests/minute per process. Do not trust forwarded IP headers without a deliberate trusted proxy design. Fields body maximum 200 KB; each string maximum 20,000 characters. Unknown fields and nonstrings return 400. Invalid 32-byte base58 addresses return 400. The backend never lowercases addresses.

- `GET /v1/index`: latest published aggregate artifact. 503 if none exists.
- `POST /v1/check`: JSON `{name?,ticker?,description?,x?,telegram?,website?,logo?}`. Returns normalized lines, hash, matching n/d/first/v where published, window, current age, content hash and disclaimer. No result if index absent.
- `GET /v1/live`: latest 100 locally observed launches, metadata status and comparison if an index exists. No safety ranking. Chronological listing only.
- `GET /v1/deployer/:address`: latest 100 recorded launches for a creator, same per-launch sharing results. History is bounded by 48-hour retention.
- `GET /v1/token/:mint`: one stored launch and its published fields/comparison. 404 if unobserved. Unknown data is null, never an invented count.
- `GET /v1/status`: latest successful build, window age in seconds, collector heartbeat age, unresolved gaps. Heartbeat age is process/database liveness, not an independent proof of chain coverage.

Sharing n counts launches in the published index. For stored launches inside the index window, comparison subtracts that launch from n; d still means distinct creators in the original index group. Pasted checks have no self identity and return original group counts. Absent entries return null rather than an invented zero. Skeleton v is distinct normalized spellings; v>1 establishes multiple spellings within that skeleton group, not contract equivalence or any recommendation.

Typed client: `new CoreClient(baseURL)`, methods `index`, `check`, `live`, `deployer`, `token`, `status`. Standalone `compare(fields,index)` performs no network calls. `receipt(fields,index)` returns exact supplied input, normalized lines, index hash, window and the statement “Local record, not independent proof.” Test page downloads this JSON using a Blob.

Errors: 400 invalid input, 403 origin refused, 404 absent route/token, 413 body too large, 429 rate limit, 503 database/index unavailable. No exception text or secrets are returned.

## Partial-window mode

Default requests select the strict published index. Explicit `?window=partial` selects only a preview. There is no automatic fallback. An invalid window selector returns 400. Returned coverage includes mode, clear label, actual coverageSeconds and UTC start/end; each normalized comparison line also carries coverage. The index metadata includes the same fields. Status, launch lists, individual launches and creator histories expose coverage alongside results; unavailable coverage is null. Partial previews never appear as strict published indexes.

Both modes refuse absent coverage, unresolved gaps and incomplete metadata. Preview mode is only buildable while observed coverage is less than 24 hours.
