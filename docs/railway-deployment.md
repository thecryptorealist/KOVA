# Deploy Kova to Railway

Use this project directory as the source root, not the former Apex project. Node 22, Railpack, build command `npm run build`. No Docker and no Railway database: all services continue to use the existing Supabase session-pooler connection.

## Services

| Name | Start command | Public networking | Required secret names |
| --- | --- | --- | --- |
| kova-web | npm start | Generate Railway domain; healthcheck /healthz | DATABASE_URL |
| kova-collector | npm run start:collector | None | DATABASE_URL, SOLANA_RPC_HTTP, SOLANA_RPC_WS |
| kova-metadata | npm run start:metadata | None | DATABASE_URL |
| kova-indexer | npm run start:indexer | None | DATABASE_URL |

Use one replica per service, always-on operation, automatic restart on failure. Keep workers without public domains and without HTTP health checks. The collector performs the existing 48-hour retention cleanup. Web thumbnail cache is disposable and capped locally; metadata and comparison indexes remain in Supabase.

Production scripts use compiled JavaScript and Railway environment variables; no `.env` file or development `tsx` loader is required in production. The web service binds `0.0.0.0` on Railway's `PORT`. `/healthz` reports process liveness; `/v1/status` reports data readiness. A healthcheck success does not mean a complete 24-hour index exists.

## Account and service setup

1. Authenticate with the Railway CLI using its browser sign-in flow. No credentials belong in chat.
2. Create a Kova project with four empty services named above. Keep existing services/data intact if attaching to an existing project.
3. Set required variables using the Railway Variables panel or run the local helper: `node scripts/railway-env.mjs --project PROJECT_ID`. The helper reads `.env`, passes values through stdin, and prints only service and variable names. Never run commands that list raw Railway variable values in shared output.
4. `.railway/railway.ts` references existing secrets with `preserve()`. Run `railway config plan`; apply only the expected four-service configuration with no unexpected deletions. No new database is declared.
5. Upload the sanitized source with `railway up` for each service. Do not upload `.env`, `data`, logs, credentials, or `node_modules`. `.railwayignore` excludes these.
6. Generate a public domain for kova-web and verify `/healthz`, the homepage, assets, launch feed, token lookup and explicitly selected partial checker/receipt.
7. Confirm remote collector heartbeats and metadata progress before stopping the corresponding local workers, so two collectors do not consume duplicate RPC credits.

## Readiness limits

The existing historical partial index is already in Supabase and is not copied as a fake seed. Strict mode remains the default and requires verified full-day coverage, no unresolved gaps in its window and completed metadata. Deploying does not waive those checks. Notifications remain unconfigured and are not deployed as an operational bot in this release.

## Verification before upload

Run `npm run build` and `npm test`. Start compiled code with production environment and a test PORT; verify `/healthz`, HTML, and same-origin HTTPS module requests through Railway's forwarded-protocol handling. Scan the upload source against actual secret values without displaying them. Never copy `.env` into an upload directory.
