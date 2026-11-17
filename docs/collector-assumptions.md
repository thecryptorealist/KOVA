# Collector assumptions: live verification

Evidence: `data/live-probe-final.log`, `data/live-collector-final.log`, `data/creator-repair.log` and `data/live-summary.json`. These contain public chain observations and safe operational codes, not RPC credentials. The final probe completed with 40 transaction-verified events: all create_v2; 27 version-1 transactions and 13 version-0 transactions. No legacy create was observed. Synthetic tests are labelled separately.

## Original assumption audit

| # | Status and actual evidence |
|---|---|
| 1 — deployed IDL compatibility | Confirmed for the observed create_v2 events: all 20 CreateEvent fields decoded and replayed from finalized transaction logs. Legacy create remains unverified live. Full instruction decoding failed on documented omitted optional arguments; fixed by decoding only the official IDL-derived mandatory name/symbol/uri/creator prefix. Optional flags are not fabricated. |
| 2 — fields, timestamp and creator semantics | Field names confirmed. Event timestamps are Unix seconds; observed deltas from transaction blockTime were -1 or 0 seconds. **Contradicted:** event.creator is not always the creator wallet: holder-reward events use a pump-controlled fee address. Fixed by reading the creator argument from the verified create instruction for holder-reward launches. The original event fee address remains in public probe evidence. |
| 3 — finalized logs and event delivery | Confirmed for sampled logs and their getTransaction replays. No claim of universal completeness, no guarantee against truncation, and no CPI-only event support claim. |
| 4 — instruction log variants | CreateV2 log labels agree with decoded create_v2 instructions in observed samples. Legacy Create and mixed-create transactions were not observed. The collector's transaction-wide log label remains provisional; the verifier identifies the actual variant by the official discriminator and mint account. |
| 5 — delivery identity and duplicates | Mint and signature/event-index uniqueness are enforced by SQL. Natural duplicate deliveries are counted when observed; an absence of duplicates does not independently verify delivery stability or all conflict paths. No duplicate replay is added to live counts. |
| 6 — transaction versions and JSON response | **Contradicted:** supporting only legacy/v0 fails live v1 reads with RPC -32015. Fixed to request maxSupportedTransactionVersion: 1. JSON account keys/instructions, inner instructions and logs were read for both v0 and v1. Legacy and future versions remain unverified; future versions are refused. |
| 7 — subscriptions and reconnects | Live logsSubscribe delivery worked. Earlier diagnostic collector runs logged WebSocket reconnects and database retries/recoveries; each lost WebSocket interval is recorded as a gap, not silently called complete. The ten-minute run's measured counts are in live-summary.json. Provider losslessness and historic replay remain unverified. |
| 8 — metadata field names | Actual successful metadata included createdOn, description, image, name, symbol, twitter and website. The implemented description/twitter/website/image mappings were observed; Telegram was not confirmed in this three-file sample. Unknown or nonstring properties are ignored and missing properties stay absent. On-chain name/symbol remain authoritative. |
| 9 — URI transport | HTTPS metadata was fetched from actual launches. URI availability is not universal: HTTP 429 and DNS/network errors were observed. Raw ipfs:// URIs still require an explicitly selected gateway and are refused; no unverified gateway fallback was added. Images are never fetched. |
| 10 — retry budget | Eight attempts and capped exponential delays are operational policy, not chain facts. Retry scheduling ran against live metadata. Whether this budget captures eventual pinning success over hours remains unverified. HTTP throttling is not interpreted as absence of metadata. |
| 11 — gaps, coverage and backfill | Startup/restart boundaries and real disconnections are recorded. No create-only backfill source is verified. Strict publication requires a full day; partial previews state their actual window and still refuse pending/failed metadata or unresolved gaps. No gaps are silently resolved to obtain a hash. |
| 12 — throughput limits | Observed traffic was processed during the run. The queue and message-size limits exist; sustained capacity, overflow recovery and larger peak loads have not been established by this sample. |

## Fixes prompted by actual failures

- RPC -32015: opt into version 1 when reading transactions; JSON reads support only the explicitly accepted legacy/0/1 versions.
- ERR_OUT_OF_RANGE in instruction decoding: the official create_v2 docs allow arguments 6–8 to be omitted. Decode the required IDL-defined prefix; do not invent missing arguments.
- CREATE_CROSSCHECK_MISMATCH: holder-reward event.creator is a fee address. Preserve the actual instruction creator wallet. Re-read only already observed creation transactions to repair affected records; this is not a program-history scan.
- ERR_INVALID_IP_ADDRESS in metadata fetching: Node requests lookup results with all:true. Return an address array in that case while preserving validated DNS pinning. Single-address and all-address branches have regression tests.
- Transient ENOTFOUND and HTTP 429 remain real network/provider failures. Database retries and metadata backoff remain enabled; they are reported rather than hidden.

## Source verification

- https://github.com/pump-fun/pump-public-docs/blob/main/docs/instructions/COIN_CREATION.md — mandatory prefix and optional trailing arguments.
- https://github.com/pump-fun/pump-public-docs/blob/main/docs/HOLDER_REWARDS_README.md — creator argument versus program-controlled fee recipient.
- https://solana.com/docs/core/transactions/versioned-transactions — version-1 opt-in and RPC -32015.
- Official downloaded IDLs and checksums: idl/ and docs/idl-sources.json.

## Remaining operational limits

No independent proof of complete chain coverage, no verified historical create-only backfill, no OS egress isolation, no guaranteed metadata availability, no peak-load certification, and no live legacy create evidence. A ten-minute collection run does not establish a complete 24-hour index. See the measured report for actual saved launches, metadata status, gaps and reconnects.

## Clock and measured-run follow-up

The final measured interval was 956 seconds, with 286 saves, zero duplicate deliveries logged, and no in-interval reconnects. Database time lagged process time by about 34.8 seconds; freshness calculations now normalize clock offset, API lag uses database time, and new subscription acknowledgments record explicit capture boundaries. The original startup boundary was conservatively advanced from the server-clock value to the first actual saved-launch log timestamp. No gap was marked resolved. Real strict indexing refused INSUFFICIENT_COVERAGE; real partial indexing refused INCOMPLETE_METADATA after the freshness correction. Full evidence is in docs/live-verification.md.
