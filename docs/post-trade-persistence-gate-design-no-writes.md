# Post-Trade Persistence Gate Design, No Writes

## Summary

Purpose: define the gate that must be satisfied before any future persistence of post-trade settlement, broker confirmation, and plan-vs-actual review data may be considered.

Scope: docs/model/gate-design only. This task does not create a Supabase write path, migration, API route, runtime gate, Trade UI path, browser automation path, Avanza integration, or production persistence claim.

Gate design decision: `post_trade_persistence_gate_design_complete_with_warnings`.

Warning basis: this design describes prerequisites for future persistence, but it does not implement schema, RLS, redaction tooling, payload allowlists, write previews, rollback tooling, or production readiness.

Task 377 follow-up: `docs/post-trade-persistence-payload-allowlist-tests-checkpoint.md` adds test-only payload allowlist fixtures and assertions. It keeps Supabase writes, migrations, API routes, Trade UI execution, and runtime activation absent.

Task 379 follow-up: `docs/post-trade-supabase-schema-rls-design-no-migrations.md` expands this gate into a docs-only Supabase schema/RLS design. It documents table areas, shared safe columns, never-store columns, RLS policy principles, write gates, feature flags, migration strategy, blockers, and no-migration/no-write confirmation without creating migrations or writes.

## Persistence Scope

Allowed future categories, only after a separate explicit gate:

- broker confirmation evidence metadata
- settlement extraction result
- plan-vs-actual execution review
- execution cost breakdown
- deviation classification
- redacted artifact reference
- manual review status
- result/statistics/learning candidate event

Explicitly not allowed without a later gate:

- raw broker confirmation screenshot or PDF
- unredacted avräkningsnota
- credentials
- BankID data
- cookies or session data
- account/customer ids
- full personal identity data
- Supabase writes in this task
- production persistence
- automatic learning update

## Proposed Schema Areas

| Potential table/model | Purpose | Minimum fields | Sensitive fields not allowed | Redaction requirements | RLS requirements | Write gate requirements | Rollback/delete requirements |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `execution_settlement_reviews` | Store redacted post-trade settlement review summary | internal trade id, plan id, contract id, side, ticker, quantity, planned price, execution price, slippage, deviation classification, manual review status, extraction timestamp | raw artifact, account/customer ids, personal identity data, credentials, cookies/sessions, BankID, service keys | allowlisted payload only; redacted artifact reference only | authenticated internal role; no public read; no broad update | redaction pass, schema/RLS pass, reviewer sign-off, feature flag | delete/rollback by internal id with audit reason |
| `execution_confirmation_evidence` | Store broker confirmation evidence metadata | internal evidence id, broker/source label, redacted broker reference, evidence timestamp, side, ticker, quantity, execution price | screenshot/PDF content, raw page text, account ids, session/cookie data, BankID | metadata only; no raw evidence blob | restricted read; append-only by approved writer | raw-artifact storage flag must remain false unless separately designed | delete redacted metadata by evidence id; preserve audit tombstone |
| `execution_cost_breakdowns` | Store redacted cost summary | review id, currency, gross amount, commission/courtage, FX rate if safe, settlement amount / likvidbelopp | account balances, unrelated holdings, raw broker statement | numeric allowlist; no copied raw text dump | scoped to related review | reconciliation pass, mismatch handling pass | rollback with parent review |
| `execution_deviation_reviews` | Store classification and reviewer state | review id, slippage, fee impact, FX impact, classification, blocked reasons, reviewer status | raw notes containing PII, credentials, account identifiers | reviewer notes require redaction/length/pattern gate | no public read; reviewer-only updates | blocked classifications cannot auto-progress | update must be audited; delete requires rollback plan |
| `execution_learning_candidates` | Stage possible result/statistics/learning candidate after review | review id, clean outcome marker, classification, approved minor deviation marker, reviewer label | raw evidence, personal data, account data, credentials | derived summary only | no automatic learning write; gated queue only | separate learning candidate gate required | candidate can be discarded without mutating stats |

## Minimum Safe Fields

Fields that may be considered for persistence after a later gate:

- internal trade id / plan id / contract id
- side
- ticker
- quantity
- execution price
- planned price
- slippage
- commission/courtage
- FX rate if safe
- currency
- gross amount
- settlement amount / likvidbelopp
- deviation classification
- manual review status
- redacted evidence artifact id
- extraction timestamp
- reviewer id or safe internal actor label

Never persist unredacted:

- credentials
- BankID data
- cookies/session data
- raw browser storage
- network dumps
- account/customer ids
- personal identity data
- full raw PDF/screenshot
- env secrets
- service keys

## Redaction Gate

Before any write:

- redaction validator must pass
- no forbidden sensitive fields may be present
- artifact must be safe/redacted
- raw artifact must not be stored in execution tables
- reviewer must confirm redaction
- sensitive marker scan must pass
- write payload must be allowlist-based, not dump-based
- evidence metadata must reference only a redacted artifact id or safe internal reference
- blocked/mismatched evidence must remain non-persisting unless a separate manual-review persistence gate is approved

## RLS and Security Gate

Required before persistence:

- schema review
- RLS policy review
- service role use prohibited in client/runtime path
- no public read exposure
- no broad update/delete access
- no user-provided raw artifact dump
- audit trail
- rollback/delete path
- test data isolation
- explicit review of generated Supabase types before integration
- proof that write helpers cannot be imported by Trade UI or browser automation code

## Write Authorization Gate

Required before any Supabase write:

- explicit task approval
- explicit feature flag
- local/test environment first
- redaction pass
- schema/RLS pass
- rollback plan
- dry-run write payload preview
- reviewer sign-off
- no production until a separate production gate

Forbidden:

- automatic write from Trade UI
- write from Avanza/browser automation path
- write during order-prep
- write before human-final external confirmation
- write if evidence mismatch/sensitive/partial-fill unresolved
- write if deviation classification is blocked
- write if final KÖP/SÄLJ was agent-clicked or submitted by automation
- write if credentials/cookies/sessions/BankID data appear anywhere in payload or source artifacts

## Result, Statistics, and Learning Gate

Settlement persistence must not automatically update result/statistics/learning.

Learning candidate staging may be considered only after a separate gate:

- clean outcome requires `execution_match` or reviewer-approved minor deviation
- major deviations must not update learning automatically
- manual-review classifications must not update learning automatically
- blocked classifications must not update learning automatically
- partial fills require special review
- duplicate confirmations must be blocked
- result/statistics/learning candidate events must remain staged, reviewable, and discardable

## API and Runtime Boundary

This task adds no API route activation, no Trade UI execution path, no fetch/polling from Trade UI, no browser automation path writes, no local-dev bridge writes, no smoke runner writes, and no production route.

Any future API route must be separately planned and must fail closed by default. It must not be linked from Trade UI, browser automation, Avanza path code, smoke scripts, or production runtime before a separate explicit gate.

## Feature Flag Design

Future false-by-default flags:

```text
ENABLE_POST_TRADE_SETTLEMENT_PERSISTENCE=false
ENABLE_EXECUTION_CONFIRMATION_EVIDENCE_WRITE=false
ENABLE_PLAN_VS_ACTUAL_REVIEW_WRITE=false
ENABLE_EXECUTION_LEARNING_CANDIDATE_WRITE=false
ENABLE_RAW_SETTLEMENT_ARTIFACT_STORAGE=false
```

Rules:

- default false
- not added in this task
- not committed true
- local/test only first
- production requires separate gate
- raw artifact storage should remain false unless separately designed
- feature flags do not override redaction/RLS/reviewer gates

## Persistence Blockers

Persistence remains blocked if any of these are true:

- redaction validator fails
- sensitive fields are present
- required safe fields are missing
- schema/RLS has not been reviewed
- feature flag is not explicitly approved
- rollback plan is missing
- service role is exposed
- Trade UI write path is detected
- API route active unexpectedly
- evidence is mismatched/blocked
- partial fill is unresolved
- duplicate confirmation is detected
- production environment
- raw artifact storage requested
- deviation classification is blocked
- learning/statistics update is automatic
- `app/trade-app.tsx` write wiring appears without separate approval

## Test Strategy

Future tests should include:

- payload allowlist tests
- redaction gate tests
- schema-shape tests
- RLS policy tests if possible
- write payload preview tests
- blocked sensitive payload tests
- blocked mismatch/deviation tests
- no Trade UI/API route write tests
- feature flag false-by-default tests
- no service-role client-runtime import tests
- no raw artifact storage tests
- learning candidate staging tests with no automatic statistics mutation

## No-Write Confirmation

This task writes no Supabase records.

No Supabase client is added. No migration is added. No API route is added or activated. No Trade UI path is added. No persistence helper with write capability is added. No env values are changed. No runtime gate is opened.

## What This Proves

- The persistence boundary is explicitly designed before any write path exists.
- Future persistence categories are scoped.
- Minimum safe fields and never-persist fields are documented.
- Redaction, RLS/security, write authorization, feature flags, rollback, and learning gates are documented.
- Supabase writes remain locked.

## What This Does Not Prove

- A schema is safe.
- RLS is correct.
- Redaction tooling is production-ready.
- A write payload is valid.
- Supabase persistence works.
- Production readiness.
- Real Avanza/broker/settlement data can be persisted safely.

## Recommended Next Task

Task 379 completed the docs-only Supabase schema/RLS design without migrations or writes.

Recommended next task: Task 380 - Post-trade schema allowlist alignment tests, no migrations.

Alternative: Task 380 - Ture Agent Dev Chat 3 continuation summary, if the project wants to package this phase before more tests.

## Validation

Validation completed for this no-write design task:

| Check | Result |
| --- | --- |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-settlement-mock-fixtures.spec.ts --reporter=line` | Pass, 15 passed |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-headless-to-mock-boundary-mapping.spec.ts --reporter=line` | Pass, 5 passed |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-mock-boundary-contract-fixtures.spec.ts --reporter=line` | Pass, 10 passed |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-script-import-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-auth-hardening.spec.ts --reporter=line` | Pass, 27 passed |
| `./node_modules/.bin/tsc --noEmit` | Pass |
| `npm run lint` | Pass |
| `git diff --check` | Pass |
| `git diff -- .env.local --exit-code` | Pass |
| `git diff -- app/trade-app.tsx --exit-code` | Pass |
| `find docs -type f -size 0` | Pass, no empty docs found |

Static search completed:

```text
rg -n "post_trade|settlement|persistence|Supabase write|insert|upsert|update|service role|RLS|raw artifact|avräkningsnota|broker confirmation|plan-vs-actual|learning candidate|Trade UI execution|API route activation|ENABLE_POST_TRADE|ENABLE_EXECUTION|ENABLE_PLAN_VS|ENABLE_RAW" docs tests lib app scripts
```

Static search category counts:

```text
  18 app
 802 docs
 255 lib
   5 scripts
  92 tests
```

Classification:

- docs-only: persistence gate design, lifecycle checkpoints, and warning language
- tests-only: structural boundary and settlement regression tests
- locked/blocked: Supabase write, persistence authority, service role, Trade UI execution, and API activation gates
- future-gated: schema/RLS review, redaction tooling, payload allowlist, write preview, and production persistence
- warning: design-only, no schema/RLS/write implementation
- blocker: none found for this no-write design task

## Out of Scope

- No Supabase writes.
- No migrations.
- No API route activation.
- No Trade UI execution.
- No real settlement extraction.
- No real avräkningsnota access.
- No browser automation.
- No Avanza login.
- No Avanza order-prep.
- No BankID handling.
- No credential access.
- No cookie/session handling.
- No final KÖP/SÄLJ.
- No order submission.
- No live trade mutation.
- No live position mutation.
- No production readiness.
