# Dependency audit: full findings

Full machine reports: npm-audit-before.json and npm-audit-after.json.

Reachability is based on inspected installed source, not a proof of exploitability.

## @coral-xyz/anchor: high
Affected range: `*`. Direct dependency: True.

Inherited via toml

Suggested fix: False

## @solana/web3.js: high
Affected range: `<=0.0.0-pr-29130 || 0.0.4 - 1.99.0`. Direct dependency: True.

Inherited via bigint-buffer

Inherited via jayson

Suggested fix: {'name': '@solana/web3.js', 'version': '1.99.0', 'isSemVerMajor': False}

## bigint-buffer: high
Affected range: `*`. Direct dependency: False.

- bigint-buffer Vulnerable to Buffer Overflow via toBigIntLE() Function — https://github.com/advisories/GHSA-3gc7-fjrx-p6mg — range `<=1.1.5`; CWE ['CWE-120']; CVSS {'score': 7.5, 'vectorString': 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H'}

Suggested fix: {'name': '@solana/web3.js', 'version': '1.99.0', 'isSemVerMajor': False}

## esbuild: moderate
Affected range: `<=0.24.2`. Direct dependency: False.

- esbuild enables any website to send any requests to the development server and read the response — https://github.com/advisories/GHSA-67mh-4wv8-2f99 — range `<=0.24.2`; CWE ['CWE-346']; CVSS {'score': 5.3, 'vectorString': 'CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:N/A:N'}

Suggested fix: {'name': 'tsx', 'version': '4.23.15', 'isSemVerMajor': False}

## jayson: moderate
Affected range: `2.0.6 - 4.3.0`. Direct dependency: False.

Inherited via stream-json

Inherited via uuid

Suggested fix: {'name': '@solana/web3.js', 'version': '1.99.0', 'isSemVerMajor': False}

## stream-json: moderate
Affected range: `<=3.5.0`. Direct dependency: False.

- stream-json: pick/ignore/filter/replace filters are O(depth²) on nested input — small crafted JSON blocks the event loop for seconds→minutes (DoS) — https://github.com/advisories/GHSA-528h-pc64-c93x — range `<=3.4.0`; CWE ['CWE-407']; CVSS {'score': 6.2, 'vectorString': 'CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H'}

- stream-json: JSONC parser and verifier re-scan the whole accumulated comment on every input chunk — https://github.com/advisories/GHSA-hqr4-qq8f-hg3x — range `<=3.5.0`; CWE ['CWE-407']; CVSS {'score': 6.2, 'vectorString': 'CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H'}

- stream-json has a prototype pollution issue: Assembler writes this.current[this.key] on plain objects — https://github.com/advisories/GHSA-mjw6-4jj6-33hc — range `<3.6.0`; CWE ['CWE-1321']; CVSS {'score': 5.1, 'vectorString': 'CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:L'}

Suggested fix: {'name': '@solana/web3.js', 'version': '1.99.0', 'isSemVerMajor': False}

## toml: high
Affected range: `<=5.0.0`. Direct dependency: False.

- toml-node: Uncontrolled Recursion — https://github.com/advisories/GHSA-82x6-q7mm-w9cf — range `<4.2.0`; CWE ['CWE-674']; CVSS {'score': 7.5, 'vectorString': 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H'}

- toml-node: Prototype Pollution Leads to `Object.prototype` Corruption via `__proto__` Key-Path Desynchronization — https://github.com/advisories/GHSA-v5mp-jgw5-2x6j — range `<4.1.2`; CWE ['CWE-1321']; CVSS {'score': 8.2, 'vectorString': 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:L'}

- toml-node: Quadratic-complexity DoS via many array-of-tables headers in toml.parse() — https://github.com/advisories/GHSA-4qx8-w7c3-pj3p — range `<=5.0.0`; CWE ['CWE-407']; CVSS {'score': 0, 'vectorString': None}

- toml-node: Quadratic-complexity DoS via long dotted keys or table paths in toml.parse() — https://github.com/advisories/GHSA-9j65-hcg3-gc64 — range `<=5.0.0`; CWE ['CWE-407']; CVSS {'score': 0, 'vectorString': None}

- toml-node: Uncontrolled resource consumption (CPU DoS) via unbounded-length integer literals in toml.parse() — https://github.com/advisories/GHSA-9qmh-m7c6-f92p — range `<=5.0.0`; CWE ['CWE-400', 'CWE-770']; CVSS {'score': 7.5, 'vectorString': 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H'}

- toml-node: Prototype pollution: parsing a TOML document can write to Object.prototype — https://github.com/advisories/GHSA-h895-cgqg-jf52 — range `<=5.0.0`; CWE ['CWE-1321']; CVSS {'score': 0, 'vectorString': None}

Suggested fix: False

## tsx: moderate
Affected range: `3.13.0 - 4.19.2`. Direct dependency: True.

Inherited via esbuild

Suggested fix: {'name': 'tsx', 'version': '4.23.15', 'isSemVerMajor': False}

## uuid: moderate
Affected range: `<11.1.1`. Direct dependency: False.

- uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided — https://github.com/advisories/GHSA-w5hq-g745-h8pq — range `<11.1.1`; CWE ['CWE-787', 'CWE-1285']; CVSS {'score': 7.5, 'vectorString': 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N'}

Suggested fix: {'name': '@solana/web3.js', 'version': '1.99.0', 'isSemVerMajor': False}

## Runtime assessment and action
- tsx/esbuild: compatible tsx update applied. This project uses transpilation, not esbuild’s development HTTP server. Tests must verify the updated runner.
- Anchor/toml: Anchor’s workspace module imports toml, but this project only constructs BorshCoder/EventParser from vendored JSON; it does not use workspace or parse TOML input. No compatible audit fix is available; retained and disclosed.
- web3.js/bigint-buffer: installed runtime dependency; the library has calls to toBigIntLE in integer layout decoding. This project’s launch event decoder uses Anchor Borsh, not those web3 instruction decoders. Reachability is not conclusively ruled out. No forced or unverified override applied.
- jayson/uuid: the inspected JSON-RPC code uses uuid.v4; the advisory targets v3/v5/v6 with supplied buffers. No such call is made here.
- jayson/stream-json: streaming parsers are imported in the installed tree, but this project uses direct bounded WebSocket JSON messages and no jayson streaming server. The verifier/parser and Assembler vulnerabilities remain in the dependency tree; no incompatible major override applied.

No npm audit fix --force was run. Remaining advisories are unresolved, not a clean audit.

## WebSocket addition and subsequent fix
The initially pinned ws 8.18.3 introduced GHSA-58qx-3vcg-4xpx (uninitialized memory disclosure, affected >=8.0.0 <8.20.1) and GHSA-96hv-2xvq-fx4p (memory exhaustion through fragmented frames, affected >=8.0.0 <8.21.0). This is directly reachable in the collector’s WebSocket transport. Updated compatibly to pinned ws 8.23.0. Both advisories are absent from the final audit, which still reports 7 affected packages (3 moderate, 4 high).
