# Verification ledger

Verified against official upstream IDLs via web retrieval:
- pump program address: 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P
- PumpSwap program address: pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA
Sources: https://github.com/pump-fun/pump-public-docs/tree/main/idl

Still unverified; do not assume:
- Current create/create_v2 layouts, event discriminators, creator semantics and buy-event fields: Official IDLs are now vendored in idl/ and inspected. Live event decoding remains unverified.
- Fee program identity: verify against official fee IDL.
- Real create/create_v2 decoding: needs live finalized transaction evidence from configured RPC.
- Provider retention, create-only backfill API and streaming guarantees: provider-specific.
- Metadata availability and observed field shapes: inspect actual fetched JSON under the SSRF controls.
- On-chain session-wallet enforcement and revocation: no program selected, no feasibility claim.

Protocol choices: hash separator will be a single NUL byte; spelling hashes will retain full SHA-256 internally to distinguish skeleton variants. Published artifacts contain only the specified aggregates and metadata. Incomplete reads refuse publication. A complete 24-hour coverage window requires verified collection coverage; do not treat an empty database as a complete window.

Collect live first. Never enumerate all pump transactions as a backfill strategy. A separate provider create-event feed is required for backfill.
