# Discord delivery and interchangeable notifiers

Discord webhook delivery is the default. It requires DISCORD_WEBHOOK_URL, DATABASE_URL and SOLANA_RPC_WS, and has no Telegram configuration or polling dependency. NOTIFIER selects discord or telegram; omitting it selects Discord. Telegram remains available when explicitly selected with its own token and private-chat allowlist.

Both adapters implement src/notify/notifier.ts and send the exact existing message formatter output, with the same no-advice/no-contract-check footer. Discord disables mentions, disables automatic link previews for plain messages, requests wait=true to confirm a returned message ID, and preserves large message text in an uncolored embed rather than truncating it. Transport failures/uncertain acknowledgments remain unknown and are not blindly retried. Explicit HTTP 429 responses use the supplied retry delay. Redirects are refused and only canonical HTTPS Discord webhook URLs are accepted. The URL is never logged or stored in the database.

An incoming webhook sends to its configured channel; it does not receive Discord commands. Manage follows locally:

```
npm run notify:manage -- follow <public-wallet>
npm run notify:manage -- unfollow <public-wallet>
npm run notify:manage -- list
npm run notify:manage -- pause
npm run notify:manage -- resume
npm run notify:manage -- status
npm run notify:check
npm run notify:start
```

Local watch-list controls work without a webhook or Telegram token; delivery starts only once the selected notifier configuration passes. Local operations never advance the Telegram update offset. Discord's fixed internal destination is independent from its secret URL. Switching providers preserves each destination's watch list and delivery ledger; it does not replay old notifications into another destination. Add desired follows for the selected destination explicitly. This avoids accidental duplicate delivery on a provider change.

The watcher, rate limits, seven-day retention, deduplication and checker rules are unchanged. No signing or trading is present. The checker never imports a notifier.

Tests use synthetic URLs and mocked HTTP responses; no test sends real notifications. Real Discord delivery remains unverified until a real webhook is configured and a notification is sent. No webhook URL is included in documentation or command output.
