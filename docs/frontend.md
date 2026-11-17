# Research frontend

Run `npm run build` and `npm run api`, then open http://localhost:3000. The original plain API test page remains at /test. This is a local implementation; no deployment was performed.

Pages use hash navigation: overview, live, check, token, creator, notifications, status and method. Token/creator addresses may follow the page name in the hash, making detail links shareable. Live-feed search filters the returned API response only, with no claim of searching all chain history.

The interface uses local CSS and browser modules, system fonts and CSS artwork. No third-party scripts, fonts, images, analytics, wallet connections or trading controls are added. Comparison happens locally against the downloaded public index through the same existing module. JSON receipts and index downloads contain actual API-derived data only. Empty, refused and unavailable states are explicit; no demonstration market data is shown.

Strict mode is the default. Partial selection is explicit and carries a page-level label; available results state their actual window and age. Metadata states all use the same neutral visual treatment. The UI does not assign safety scores, rankings, recommendations or semantic status colors.

The notification page reads only coarse worker health through GET /v1/notifications. This endpoint returns provider type, configuration presence, heartbeat age, follow/queue/gap counts and a bounded set of state flags. It never returns webhook URLs, chat IDs, tokens, raw runtime objects or follow-list identities. Notification failures are contained in this route and do not affect Core routes. Watch-list mutations stay in private host controls or the existing Telegram allowlisted channel; no unauthenticated browser mutation endpoint was added.

Customization files: public/index.html for the shell/navigation, public/app.css for design tokens/layout and public/app.js for page rendering. API/static serving additions are in src/api.ts. Research/normalization/index publication rules are unchanged.

Verification: JavaScript syntax check, TypeScript build, full unit/HTTP regression suite, static asset/content-type and CSP checks. No browser-control tool was available, so rendered layout and browser interactions have not been visually validated in an automated browser.

## Visual reference update

The presentation uses the user-supplied Galilee Framer reference: a white header, horizontal navigation, pill controls, neutral tables and a landscape overview with translucent panels. The landscape is stored locally as `public/landscape.png`, sourced from https://framerusercontent.com/images/HfjsQlPWzI34QlGNkzv1xNih1XQ.png. No remote assets are fetched by visitors. Existing frontend JavaScript, comparison rules and normalization were retained unchanged. The server change only serves the PNG and permits same-origin images in the content policy. Desktop (1440px) and mobile (390px) screenshots were inspected in Chrome; the mobile overview had no document overflow. All 58 regression tests and the TypeScript build passed.
