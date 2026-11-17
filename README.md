# Solana launch strings — Core only

Not a recommendation to buy, sell or size anything. Reads strings, not contracts.

## Setup

Node 20.6+ (native `--env-file`) and Supabase Postgres session pooler, port 5432. No Docker or Supabase SDK. The source is in its own `solana-launch-strings` directory; `apexacademywebsite` is empty.

Install with `npm ci`. Keep DATABASE_URL, SOLANA_RPC_HTTP and SOLANA_RPC_WS exclusively in `.env`. All commands load `.env` without printing it. Never pass credentials as shell arguments. `.env` is ignored. Supabase's database connection role must be permitted to run DDL. RLS is enabled with no anonymous policies: browser access goes through this API, never Supabase's data API. The connection role used for reads/writes must have the appropriate privileges; Supabase owner connections may bypass RLS.

```
npm run db:migrate
npm run probe
npm test
npm run build
npm run collector
```

Keep the collector running in a dedicated terminal. It logs connections, reconnect attempts, saved launches, metadata results and hourly retention cleanup, without URI or RPC credentials. `npm run stats` reports observed database totals. `npm run cleanup` runs the 48-hour retention job manually. This reduces retention; it does not guarantee a 500 MB size ceiling under arbitrary launch volume or database bloat. Postgres autovacuum and database size must still be considered. No dashboard or alerting is included.

Once full coverage is available:

```
npm run index:build
npm run index:verify
npm run index:watch
npm run api
```

Index watch rebuilds every 15 minutes. API is loopback-only at http://localhost:3000. The research frontend is at /; the original unstyled API test page is retained at /test. See docs/frontend.md. `npm run build` emits browser modules with no bundler or external scripts/assets. TypeScript checks project code strictly; `skipLibCheck` avoids existing Anchor declaration incompatibilities. Tests currently require building first for browser module HTTP checks.

## Evidence and completeness

IDLs are downloaded from pump-fun/pump-public-docs, stored in `idl/`, and their digests are in `docs/idl-sha256.txt`. IDL definitions are not live-transaction evidence. Probe prints decoded field names and observed instruction log variants. Until live verified, variant detection is provisional; it must never imply both create variants were observed when only one was.

Collector subscribes to finalized pump program logs with an explicit allowlist. Reconnect/restart, decoder failure and queue overflow create unresolved gap records. A jump between launches is **not** proof of a missing slot. Missing intervals remain unresolved until verified through a provider create-only feed. No automatic full-program history walk is implemented. `SOLANA_RPC_HTTP` is reserved for transaction verification; the current stream consumes `SOLANA_RPC_WS`.

Index publication refuses incomplete 24-hour coverage, unresolved gaps or pending/failed metadata. It never widens the window or publishes fabricated counts. Starting today cannot produce a fully covered trailing day immediately. If no valid build exists, index/check return 503. Otherwise the last successful artifact remains available with its actual age.

Reproducibility uses a repeatable-read database transaction, fixed window and original build time. After retention removes source evidence, historical reproduction is no longer possible. SHA-256 covers JSON serialization of `{metadata, entries}` (excluding the self-referential `contentHash`). Field hashing uses namespace + NUL + normalized value, first eight SHA-256 bytes.

Metadata reads use HTTPS, validated and pinned public DNS addresses, three redirects, a total eight-second abort deadline and a 200 KB response cap. The logo URI is normalized only; the image is never fetched or rendered. JSON is treated as data, never executed. **OS-level egress isolation is not configured in this local project**; use a restricted process/egress environment before treating this as hardened operation. No Docker setup is included.

## API and browser client

See `docs/api.md`. Browser client source: `src/client.ts`; standalone normalization/comparison modules: `src/normalize.ts`, `src/compare.ts`. Published aggregate index contains hashes and counts, no raw strings or addresses. Private database launch records retain the published field strings for token/history endpoints; every returned string remains untrusted text. Test page renders only via `textContent`.

No Telegram, wallet, trading, deployment, dashboard or alerting implementation is included. See `docs/audit.md` and the full JSON audit reports for unresolved dependency advisories.

## Offline verification and temporary fixtures

`npm run test:normalization` runs only normalization tests. `npm test` includes in-memory database fixtures, synthetic IDL-derived events, mocked database reconnects, mocked WebSockets, mocked HTTPS responses and local HTTP servers. API tests require loopback permission; no test consumes live RPC data. Build before running the full suite so the served browser modules exist.

`npm run verify:fixtures` attempts a real Postgres connection through DATABASE_URL, creates a unique `fixture_<hex>` schema, inserts explicitly synthetic rows, builds and reproduces the index, tests every API endpoint against that schema, and drops the entire fixture schema in a finally block. It does not insert into core or publish a production JSON artifact. An unavailable database fails before insertion. Do not interpret the mock-database hash from unit tests as a Supabase-derived artifact.

`npm run download:idl` downloads only the two official public GitHub IDLs and saves checksums/source URLs. It neither loads .env nor calls a Solana RPC endpoint. The probe is a separate opt-in command and was deliberately not run during the offline verification stretch.

## Explicit partial-window previews

Strict 24-hour publication remains the default: `npm run index:build` and API requests without a window selector.

For initial collection coverage shorter than 24 hours, run `npm run index:build -- --partial`. This is explicitly labelled `PARTIAL WINDOW — not a 24-hour index`, stores status `preview`, and writes `data/index.partial.json`. It never replaces `data/index.json`. A database CHECK rejects a partial artifact as published. Partial mode is refused once a full day is available. No coverage means refusal, not a fabricated partial result. Metadata incompleteness and unresolved delivery gaps still refuse either mode. The initial collection/restart boundary can advance the partial start timestamp; it never erases later unknown gaps.

Use `npm run index:verify -- --partial` to reproduce the latest preview. Add `?window=partial` explicitly to each API endpoint, or construct `new CoreClient(baseURL, 'partial')`. The plain test page has a clearly labelled mode selector and defaults to strict. Every comparison result carries mode, label, UTC window boundaries and measured coverageSeconds; responses without an index carry null coverage. Historical artifacts remain labelled with their original coverage and age. Coverage is measured from collector session records and gap boundaries, not claimed independent-provider proof.

`npm run db:migrate` applies the additional partial-preview constraints. All existing RLS settings remain enabled.
