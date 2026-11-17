# Notify-only watcher: capacity and verification

## Measured before service implementation

A temporary full-pump-program diagnostic ran for 600.031 seconds. It did not create a follow list or insert trade rows. It kept aggregate counters and one verified buy/sell example. This diagnostic is not the production subscription design.

```json
{
  "diagnosticOnly": true,
  "elapsedSeconds": 600.031,
  "bytes": 553897828,
  "messages": 444095,
  "transactions": 83868,
  "tradeEvents": 38269,
  "distinctActors": 5790,
  "sample20ActorTrades": 923,
  "sample20ActorNote": "First twenty observed actors, measurement only; not user follows and never inserted in the database",
  "decodeErrors": 2,
  "rpcCalls": 3,
  "reconnects": 4,
  "errors": {
    "TRADE_INSTRUCTION_MISMATCH": 1
  },
  "streamCreditsEstimate": 11077.95656,
  "monthlyStreamCreditsAtSampleRate": 47854299.86704021,
  "storedTradeRows": 0
}
```

At the current published Helius standard WebSocket rate of 2 credits per 0.1 MB, this sample is approximately 11,078 streaming credits. Extrapolation at the same traffic rate is approximately 47.85 million streaming credits per 30 days. A full 1 million Free allowance would last approximately 15.05 hours at this rate, before any other usage. This is an estimate from received uncompressed payload bytes, not a reading of the account's billed/remaining credits. getTransaction verification calls are separate; the diagnostic made three.

Source: https://www.helius.dev/docs/billing/credits and https://www.helius.dev/pricing (checked during this task). Standard methods are available on Free. Current credits documentation lists getTransaction as one credit; the more general pricing page wording on archival calls is less specific.

The first twenty observed actors produced 923 trade events in the sample. They were diagnostic actors, not user-selected follows. At that sampled activity, extrapolation is about 132,905 trades/day. A read-only Postgres sizing query measured 272 bytes per logical trade record and 144 per delivery record. Seven-day extrapolation for that cohort is about 387 MB logical record data, or 930 MB at a planning allowance of 1 KB/trade including one delivery and indexes. Table/index page allocation, bloat, number of allowed chats and future traffic can change that. No production trade storage was used to measure growth. Baseline database size was 13,612,723 bytes.

**Conclusion:** a full-program trade stream is not viable on Free at this sample's traffic rate. Twenty wallets can still be too active. The production worker uses per-wallet native logsSubscribe filters, not a pump-wide subscription. Empty follow lists generate no trade subscriptions. Exact traffic for the user's eventual list is unmeasured because no user follow list exists. Existing checker streaming consumption is unchanged and may independently exceed Free if run continuously. Total account survival cannot be guaranteed from the bot's limits alone.

## Budget and delivery policy

- Max 20 distinct followed wallets, globally across allowed chats.
- Native wallet subscriptions sent at at most five requests/second. No per-trade HTTP RPC fetch and no history scan in the production worker.
- Stream guard: 100 MB per UTC day; storage guard: 10,000 newly stored trades per UTC day. Hitting a guard pauses capture, persists a gap/status reason, and stops subscriptions. /resume does not bypass a daily budget. The budget resets on the next UTC day. Stream counters are checkpointed; abrupt process failure can lose up to one checkpoint interval of accounting. Frame/network overhead and provider billing make the stream guard an approximate credit bound, not a billing guarantee.
- At 100 MB/day the bot's stream alone is approximately 60,000 credits per 30 days. At 10,000 trades/day and a 1 KB planning allowance, seven-day retained data is about 70 MB for one chat. These are planning estimates, not total account guarantees.
- Messages are queued and limited to one per 10 seconds per chat and one per 60 seconds per wallet/chat. A busy-wallet backlog can delay messages; records older than seven days expire with the required retention cleanup.
- A delivery is claimed durably before the send request. Successful sends are recorded; known Telegram 429 non-delivery is rescheduled using retry_after. Timeouts/ambiguous outcomes are recorded as unknown and never blindly resent. This favors no duplicate attempts over guaranteed delivery. A process restart converts in-flight claims to unknown.
- Pause cancels queued alerts and stops subscriptions for wallets with no active chats. A message already in flight may finish. Resume covers future observations only; there is no undisclosed catch-up.

## Actual trade field/flag evidence

The official vendored pump IDL exposes TradeEvent. The actual decoded field names from the live samples were:

```
mint, sol_amount, token_amount, is_buy, user, timestamp, virtual_sol_reserves, virtual_token_reserves, real_sol_reserves, real_token_reserves, fee_recipient, fee_basis_points, fee, creator, creator_fee_basis_points, creator_fee, track_volume, total_unclaimed_tokens, total_claimed_tokens, current_sol_volume, last_update_timestamp, ix_name, mayhem_mode, cashback_fee_basis_points, cashback, buyback_fee_basis_points, buyback_fee, shareholders, quote_mint, quote_amount, virtual_quote_reserves, real_quote_reserves, holder_rewards_bps, holder_rewards, creator_fee_unclaimed
```

Both events were replayed from successful finalized transactions, with the official IDL-derived instruction discriminator and account positions used to match wallet and mint. The production decoder was then run against those same transactions; its wallet, mint, isBuy, SOL amount, timestamp and original event index matched. Evidence: data/trade-decoder-live-verification.json.

```json
{
  "sell": {
    "signature": "23xdJtSAHFeaF3nnRJZNBTM4L8jp1eQtEZSd5uhwUWsuMnLcU8W4DRfpjfWyMAjB1HTcjjWhyQzcSkaPFwZK4RoV",
    "eventIndex": 0,
    "slot": 470606833,
    "transactionVersion": 1,
    "verifiedInstruction": "sell",
    "actualFieldNames": [
      "mint",
      "sol_amount",
      "token_amount",
      "is_buy",
      "user",
      "timestamp",
      "virtual_sol_reserves",
      "virtual_token_reserves",
      "real_sol_reserves",
      "real_token_reserves",
      "fee_recipient",
      "fee_basis_points",
      "fee",
      "creator",
      "creator_fee_basis_points",
      "creator_fee",
      "track_volume",
      "total_unclaimed_tokens",
      "total_claimed_tokens",
      "current_sol_volume",
      "last_update_timestamp",
      "ix_name",
      "mayhem_mode",
      "cashback_fee_basis_points",
      "cashback",
      "buyback_fee_basis_points",
      "buyback_fee",
      "shareholders",
      "quote_mint",
      "quote_amount",
      "virtual_quote_reserves",
      "real_quote_reserves",
      "holder_rewards_bps",
      "holder_rewards",
      "creator_fee_unclaimed"
    ],
    "data": {
      "user": "743wxXzAE5asUoboQ7YYzmGQwE3kf7b3Rf7rDq6NxLb4",
      "mint": "AFa1KjyBaLyGw3ANTp8QghYYjFQCtXexXGgXr527pump",
      "is_buy": false,
      "sol_amount": "592946422",
      "quote_amount": "592946422",
      "quote_mint": "11111111111111111111111111111111",
      "timestamp": "1794934207",
      "ix_name": "sell"
    }
  },
  "buy": {
    "signature": "2JA2jNJEtiHbMVtaeurKMjLg13wQ8kr5ypBem1Hxh51jAw1wJ5s8pp6PFHY5QZFB7NpS8qhWBiAsyT6PMA6zJ786",
    "eventIndex": 0,
    "slot": 470606837,
    "transactionVersion": 0,
    "verifiedInstruction": "buy",
    "actualFieldNames": [
      "mint",
      "sol_amount",
      "token_amount",
      "is_buy",
      "user",
      "timestamp",
      "virtual_sol_reserves",
      "virtual_token_reserves",
      "real_sol_reserves",
      "real_token_reserves",
      "fee_recipient",
      "fee_basis_points",
      "fee",
      "creator",
      "creator_fee_basis_points",
      "creator_fee",
      "track_volume",
      "total_unclaimed_tokens",
      "total_claimed_tokens",
      "current_sol_volume",
      "last_update_timestamp",
      "ix_name",
      "mayhem_mode",
      "cashback_fee_basis_points",
      "cashback",
      "buyback_fee_basis_points",
      "buyback_fee",
      "shareholders",
      "quote_mint",
      "quote_amount",
      "virtual_quote_reserves",
      "real_quote_reserves",
      "holder_rewards_bps",
      "holder_rewards",
      "creator_fee_unclaimed"
    ],
    "data": {
      "user": "BwWK17cbHxwWBKZkUYvzxLcNQ1YVyaFezduWbtm2de6s",
      "mint": "CsLB3X9ByWvTiCVjagNwkqypry932gwbz3XyHMXEpump",
      "is_buy": true,
      "sol_amount": "157505767",
      "quote_amount": "157505767",
      "quote_mint": "11111111111111111111111111111111",
      "timestamp": "1794934208",
      "ix_name": "buy"
    }
  }
}
```

An earlier bounded diagnostic also verified sell_v3 and buy_exact_quote_in_v3. Their event ix_name values were sell and buy_exact_quote_in respectively. The event's normalized ix_name is not assumed to equal the actual instruction name. Routing uses the verified boolean is_buy. One diagnostic cross-check attempt failed and two decoding errors were counted during the sample; those were not treated as verified examples. The production watcher logs decoding failures as gaps. No claim of exhaustive routed-transaction attribution is made: the followed actor is exactly TradeEvent.user.

## Scope and isolation

Only the allowlisted pump bonding-curve program's TradeEvent is supported. PumpSwap after graduation and other venues are not watched in this version. A watched wallet merely mentioned in a transaction is insufficient: the decoded TradeEvent.user must equal an active follow, and the database checks it again before insertion. Other actors are discarded without trade rows or notifications.

All notification writes are in the separate notify schema and process. The checker never imports notification modules. The bot reads local checker token fields and the public, strict published index. It calls the existing pure comparison function; it never changes normalization, count floors, exclusions or publication gates. Missing token fields are dashes; missing index means checked:none, not a guessed sharing count. Buy messages state the actual window/age, checked fields and unchecked fields. Non-SOL quote events show a dash for SOL conversion rather than inventing an exchange rate. Token strings are plain text, bounded and stripped of line-control characters. Every outgoing message has the no-advice/no-contract-check disclaimer; link previews are disabled.

## Commands and operation

Commands: /follow <public wallet>, /unfollow <public wallet>, /list, /pause, /resume, /status. Only allowlisted private chats whose sender is that chat's user can invoke them. Other chats are ignored without replies or unauthorized chat/follow rows. The Telegram update offset is persisted, and processed command update IDs are deduplicated.

Local commands:

```
npm run notify:migrate
npm run notify:check
npm run notify:start
npm run notify:status
npm run notify:cleanup
npm run notify:verify
```

The supervisor automatically restarts crashed worker processes with bounded backoff. It fails closed on missing configuration rather than repeatedly making network requests. /status includes worker connectivity, pause state, budgets, delivery states, gap count and checker-index availability. notify:status is the local status command. The checker's existing status API remains unchanged. No host service was installed, and no deployment was performed.

## Verification record

- The independent migration ran against Supabase and reported RLS enabled on all eight notify tables.
- Database fixtures passed: unauthorized command no-write behavior, Telegram update deduplication, signature/event-index deduplication, non-followed trade rejection, persisted rate limits, interrupted-delivery recovery, pause/resume/unfollow, 20-wallet cap, and seven-day cascading cleanup/old-replay rejection. Fixture schema deletion was verified. Earlier ENOTFOUND attempts inserted no fixtures; a later retry passed.
- Unit/mock tests cover address validation, allowlisting, formatting, missing configuration, Telegram transport ambiguity/429, wallet-scoped subscriptions, event-index retention, reconnect gap callbacks, and automatic supervisor restarts. The complete checker suite also ran.
- The source-hash check compares all 14 pre-existing checker source/script files and found no changes.
- New source is searched for key-loading, signing and transaction-submission APIs. No such calls are present. Only public addresses/signatures are handled.
- Real Telegram polling, commands and delivery have **not** been exercised: the two required Telegram settings were still unconfigured. No real Telegram messages were sent. No production follows or trade rows were inserted.
- Peak loads, provider losslessness, account-wide remaining credits, other trading venues and live end-to-end notifications remain unverified. Reconnect intervals are gaps, not claims of recovered trades.

See notify-deployment-checklist.md for environment names only. No token or connection values are in this report.
