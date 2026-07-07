# Execution Script Import Boundary Tests Checkpoint

Date: 2026-07-07

## Purpose

Add static safety coverage proving terminal smoke scripts, local-dev bridge scripts, invocation-style scripts, and local-only runner scripts remain outside app runtime imports and UI/API invocation paths.

This checkpoint does not run smoke scripts, open a browser, call Avanza, enable API routes, wire Trade UI execution, or open any runtime gate.

## Scope

Added:

- `tests/e2e/execution-script-import-boundary.spec.ts`

Reviewed/protected:

- `app/trade-app.tsx`
- `app/**`
- `app/api/**`
- `components/**`
- `hooks/**`
- `lib/**`

Not changed:

- `app/trade-app.tsx`
- `.env.local`
- API route activation
- Smoke scripts
- Local bridge scripts
- Browser automation
- Credential/session handling
- Supabase execution writes

## Restricted Paths And Patterns

Restricted terminal/local-dev scripts:

- `scripts/avanza-login-smoke-test.local.ts`
- `scripts/avanza-order-chain-smoke-test.local.ts`
- `scripts/avanza-localhost-bridge-server.mjs`
- `scripts/avanza-localhost-bridge-server-smoke.mjs`
- `scripts/avanza-dry-run-runner-skeleton.mjs`
- `scripts/mock-order-page-agent-runner.mjs`

Restricted import patterns:

- static `import ... from "..."`
- static `export ... from "..."`
- CommonJS `require("...")`
- dynamic `import("...")`
- script path/name variants such as `scripts/<name>`, `@/scripts/<name>`, and direct basename references

Restricted invocation patterns:

- `node:child_process`
- `child_process`
- `execFileSync`
- `execFile(...)`
- `execSync`
- `spawnSync`
- `spawn(...)`
- `fork(...)`

## Protected Runtime Paths

The boundary test statically scans source files under:

- `app`
- `components`
- `hooks`
- `lib`

The UI/API spawn-invocation check is stricter for:

- `app`
- `components`
- `hooks`

The test also explicitly verifies `app/trade-app.tsx` does not import terminal script, bridge-server, local Playwright/browser, or credential-provider runtime modules.

## Allowlist Policy

Allowlist entries must be explicit and small. Current allowlist:

- `lib/avanza-headless-execution-architecture-checkpoint.ts`: allowed to mention restricted script paths as model/checkpoint inventory text only.
- `lib/first-real-avanza-fill-only-poc-approved-live-fill-only-cdp-runner.ts`: allowed as the only current `child_process` library surface; it remains isolated from `app`, `components`, and `app/trade-app.tsx`.

No app, UI component, API route, or Trade UI file is allowlisted to import or spawn restricted scripts.

## Test Coverage Added

`tests/e2e/execution-script-import-boundary.spec.ts` verifies:

- restricted terminal/local-dev scripts are inventoried and remain under `scripts/`
- runtime-facing source files do not import restricted scripts
- `app/trade-app.tsx` does not import script, bridge, browser, or credential runtime modules
- UI/API runtime files do not expose process-spawn invocation
- `lib` `child_process` usage remains explicitly allowlisted
- restricted script text references outside scripts are explicitly allowlisted

The test reads files as text only. It does not import restricted scripts, execute scripts, start a browser, or require a web server.

## Findings

- No app/runtime import of restricted terminal scripts was found by the new test.
- No UI/API `child_process` invocation capability was found.
- One existing library `child_process` surface remains allowlisted and isolated: `lib/first-real-avanza-fill-only-poc-approved-live-fill-only-cdp-runner.ts`.
- One existing model/checkpoint source mentions restricted script paths as inventory text: `lib/avanza-headless-execution-architecture-checkpoint.ts`.
- Existing dev QA/model harnesses remain visibility/model surfaces only; they are not terminal script imports.

## Deferred Improvements

- Add dependency-graph/transitive import analysis if the dev-only QA route is ever treated as production-facing.
- Split legacy local-dev runner libraries into a more clearly named `lib/local-dev-only/**` boundary if a future cleanup task is approved.
- Follow-up legacy modal isolation checkpoint completed in `docs/legacy-modal-isolation-checkpoint.md`; future work can still extract legacy modal diagnostics into a stronger dev-only module boundary if approved.

## Validation Commands

Focused validation run:

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-script-import-boundary.spec.ts --reporter=line
```

Result: `6 passed`.

Full-task validation run:

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-script-import-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-auth-hardening.spec.ts --reporter=line
git diff --check
git diff -- .env.local --exit-code
git diff -- app/trade-app.tsx --exit-code
find docs -type f -size 0
./node_modules/.bin/tsc --noEmit
npm run lint
```

Results:

- focused boundary spec: `6 passed`
- boundary plus audit-writer route hardening specs: `27 passed`
- `git diff --check`: passed
- `git diff -- .env.local --exit-code`: passed
- `git diff -- app/trade-app.tsx --exit-code`: passed
- `find docs -type f -size 0`: passed with no output
- `./node_modules/.bin/tsc --noEmit`: passed
- `npm run lint`: passed

## Safety Confirmations

- No runtime gates were opened.
- No API routes were activated.
- No smoke scripts were run or imported by app runtime.
- No browser automation was added.
- No credential access was added.
- No cookie/session handling was added.
- No BankID automation was added.
- No order submission was added.
- No final KOP/SALJ click was added.
- No Supabase execution write was added.
- No Trade UI execution was added.
- No production readiness was introduced.

## Final Decision

`execution_script_import_boundary_tests_complete_with_warnings`

The script import boundary tests are complete. Warnings remain because legacy/local-dev runner libraries and script inventory references still exist intentionally; they are now covered by explicit static import/spawn boundaries and small allowlists.
