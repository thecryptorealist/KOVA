# Notify-only deployment checklist

Required environment variable names:

- DATABASE_URL
- SOLANA_RPC_WS
- DISCORD_WEBHOOK_URL
- NOTIFIER

Telegram-only environment variable names (optional unless Telegram is selected):

- TELEGRAM_BOT_TOKEN
- TELEGRAM_ALLOWED_CHAT_IDS

Probe-only environment variable name:

- SOLANA_RPC_HTTP

Run the independent notification migration, then its configuration check. Start the supervised notification worker only after the selected notifier is configured. Do not add the worker to the checker's process. No notification module is imported by the checker.

Use the notification status command or the bot's /status command to inspect health, budget pauses, delivery states and gaps. Run the seven-day cleanup command manually if the worker is stopped; the worker also runs it hourly.

The supervisor restarts crashed worker processes with bounded backoff. Missing configuration fails closed. A host service manager must run the supervisor after a machine restart; no host service installation or deployment was performed here.

Notifications are at-most-once attempts when transport outcome is uncertain. Do not reset unknown delivery states merely to resend. A configuration change requires a worker restart. Re-evaluate the measured streaming budget before following very active wallets.
