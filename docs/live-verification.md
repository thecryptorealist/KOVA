# Live verification report

The measured collector interval was 2026-11-17T10:45:10.484Z through 2026-11-17T11:01:06.769Z: 956 seconds (15 minutes 56 seconds). This is an actual measured run, not a simulation. A later collector instance was started with the final checkpoint/freshness fixes.

## Measured run

- 286 saved launches within the measured interval; zero natural duplicate deliveries recorded. One additional launch committed during shutdown, outside the measured interval.
- For the 286 launches: 25 metadata OK, 261 pending, zero terminal failures at the database snapshot.
- 32 metadata success events during the interval, including seven launches from earlier diagnostic runs.
- 602 failed metadata attempts scheduled for retry: METADATA_HTTP_429=594, ENOTFOUND=1, ABORT_ERR=2, operation_failed=5. These attempt counts are distinct from terminal failure counts. The five generic errors have no finer recorded code; no cause is invented.
- Zero WebSocket reconnects, database reconnects or database retry events within the measured interval. Shutdown-only retry messages were excluded.
- One conservative startup boundary record; no WebSocket disconnect/delivery gaps detected during this interval. This is not independent proof that the provider delivered every launch. Older diagnostic-run gaps remain in status; no gap was marked recovered merely to publish an index.
- Whole database at the final snapshot: 362 launches, 50 metadata OK, 312 pending, zero terminal failures. This includes earlier live diagnostic runs and the shutdown commit.

## Probe

40 live transaction-verified create_v2 events, zero verification failures in the final probe. 27 used transaction version 1 and 13 used version 0. Legacy create was not observed; its live behavior remains unverified. The complete actual CreateEvent field names and a decoded event are stored in data/live-summary.json. Full public event evidence is in data/live-probe-final.log.

Example (excerpt of an actual verified event):

```json
{
  "variant": "create_v2",
  "signature": "5waKUfvxDbMPhb5bs5FRYz2GwdqrFh3VNudczNeVGa1fY5JQ3HoCLPgKhvdLSptiFS2DoWZz3urcYv2K9JAuy7nS",
  "slot": 470504721,
  "transactionVersion": 1,
  "fields": [
    "name",
    "symbol",
    "uri",
    "mint",
    "bonding_curve",
    "user",
    "creator",
    "timestamp",
    "virtual_token_reserves",
    "virtual_sol_reserves",
    "real_token_reserves",
    "token_total_supply",
    "token_program",
    "is_mayhem_mode",
    "is_cashback_enabled",
    "quote_mint",
    "virtual_quote_reserves",
    "creator_fee_bps",
    "is_holder_reward",
    "depth"
  ],
  "data": {
    "name": "GG",
    "symbol": "GG",
    "uri": "https://ipfs.io/ipfs/QmSSvkTKUF1mma2qWojdfsXPsK9X7cb8RjLSVxX66PJnV4",
    "mint": "2Ez7yvRsCMDpZ23eEtvWFBdNqgHiyZ8wrDprXT9ppump",
    "bonding_curve": "44Wmx8m8jUEg3xSp7CYyXMAZVnXfcJzBF81p5AcjoBHj",
    "user": "TPjsqQVG6XXHFfbpbBfrDz5sEYAW9XjYKoFjqDFN5a7",
    "creator": "TPjsqQVG6XXHFfbpbBfrDz5sEYAW9XjYKoFjqDFN5a7",
    "timestamp": "1794912255",
    "virtual_token_reserves": "1073000000000000",
    "virtual_sol_reserves": "30000000000",
    "real_token_reserves": "793100000000000",
    "token_total_supply": "1000000000000000",
    "token_program": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
    "is_mayhem_mode": true,
    "is_cashback_enabled": false,
    "quote_mint": "11111111111111111111111111111111",
    "virtual_quote_reserves": "30000000000",
    "creator_fee_bps": "0",
    "is_holder_reward": false,
    "depth": 0
  }
}
```

## Fixes made from live evidence

1. Solana RPC -32015 required maxSupportedTransactionVersion: 1.
2. Omitted documented optional trailing create_v2 arguments caused ERR_OUT_OF_RANGE; the verifier now reads only the IDL-defined required creation prefix.
3. Holder-reward event.creator is a pump-controlled fee address. The instruction creator is used as the creator wallet for those coins. The repair reread 75 previously stored creation transactions, corrected 17 creator addresses, and reported zero failures.
4. Metadata ERR_INVALID_IP_ADDRESS came from the pinned DNS callback returning a single address when Node requested all:true. Both single-address and array-return branches are fixed and tested.
5. Database clock was measured about 34.8 seconds behind the process clock. Freshness now corrects that offset; API heartbeat lag uses database time. Startup coverage was conservatively advanced to the first actually saved launch log timestamp. Future subscription acknowledgments record explicit checkpoint timestamps. No unresolved gap was erased.

## Actual real-data index results

```
strict: INSUFFICIENT_COVERAGE — fewer than 24 hours of collection coverage
partial after freshness fix: INCOMPLETE_METADATA — incomplete metadata reads
strict reproducibility: NO_PUBLISHED_INDEX
partial reproducibility: NO_PUBLISHED_INDEX
```

There is no real-data index hash or successful real-data reproducibility claim. Partial mode does not bypass missing metadata or gaps.

## Real API results

Both strict/default and explicit partial modes returned 200 for status, live, token and deployer endpoints; index and check returned 503 because there was no qualifying artifact. After the freshness fix the sampled status heartbeat ages were 4.245 seconds (strict call) and 2.755 seconds (partial call). Full raw responses: data/live-api-strict-final.log and data/live-api-partial-final.log.

An observed shared ticker sample was read separately from the database and its token endpoint: ticker Know, 12 observed launches, one distinct creator, example mint 3zp2TevmYTPohE2Q7DBz4GN8Qumhm2hQvy4RQoSPpump. The token API returned 200 and comparison:null. These are observed stored rows, not a published complete-window comparison; see data/shared-sample.log.

## Tests and partial-mode safeguards

Build passed. All 38 tests passed. The isolated Supabase fixture test reproduced its explicitly synthetic 600-second partial preview, preserved strict selection as the default, rejected partial publication with CHECK code 23514, and verified that its fixture schema and rows were removed. Fixture hashes must not be presented as real-data index hashes.

The exact confirmed, contradicted and unverified assumptions are audited in docs/collector-assumptions.md.

## Remaining operational work

Gateway throttling and transient DNS/timeout failures remain. Continue the bounded retry/backoff sweep; a follow-up improvement is per-host cooldown respecting Retry-After. No gateway substitution or metadata-completeness bypass was used. Live legacy create, exhaustive provider coverage, create-only historical backfill, peak-load behavior and OS egress isolation remain unverified.
