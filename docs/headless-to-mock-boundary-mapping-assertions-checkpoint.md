# Headless To Mock Boundary Mapping Assertions Checkpoint

Date: 2026-07-07

## 1. Purpose

Add structural test assertions that prove safe headless-ish BUY/SELL execution inputs can map into the locked mock boundary fixture shapes created in Task 365.

This is structural test hardening only. It does not open runtime gates or introduce execution.

Decision: `headless_to_mock_boundary_mapping_assertions_complete_with_warnings`

## 2. Scope

In scope:

- Test-only headless-ish BUY input fixture.
- Test-only headless-ish SELL exit input fixture.
- Pure mapping helpers from headless-ish inputs to mock boundary fixtures.
- Positive BUY/SELL mapping assertions.
- Negative authority, safety, mutation, and consistency assertions.
- Source isolation assertions.

Out of scope:

- No new scenario execution.
- No browser automation execution.
- No Avanza login.
- No Avanza order-prep.
- No BankID handling.
- No credential access.
- No cookie/session handling.
- No final KOP/SALJ.
- No order submission.
- No Supabase execution write.
- No live trade mutation.
- No live position mutation.
- No Trade UI execution.
- No API route activation.
- No production readiness.

## 3. Inventory

Directly used in this task:

- `tests/fixtures/execution-boundary-mock-contracts.ts`
- `tests/fixtures/execution-boundary-mapping-fixtures.ts`
- `tests/e2e/execution-headless-to-mock-boundary-mapping.spec.ts`

Inspected but not directly imported by the mapping fixture:

- `lib/avanza-headless-execution-data-contract.ts`
- `lib/avanza-headless-execution-contract-selector.ts`
- `lib/avanza-headless-agent-plan-builder.ts`

Reason not directly imported:

- The mapping helper is intentionally test-only and uses minimal headless-ish shapes to avoid coupling this boundary test layer to evolving runtime/model files.
- The inspected files remain future mapping sources for broader contract-to-boundary integration.

Future mapping source candidates:

- Headless execution contract output.
- Selected execution contract selector output.
- Headless Avanza agent plan builder output.
- Execution orchestration pipeline report.
- Execution session state machine state.

## 4. Mapping Helpers Created

Created `tests/fixtures/execution-boundary-mapping-fixtures.ts`.

The helper exports:

- `mockHeadlessBuyExecutionInputFixture`
- `mockHeadlessSellExitInputFixture`
- `mapMockHeadlessBuyContractToBoundaryFixture`
- `mapMockHeadlessSellExitContractToBoundaryFixture`
- `assertMappedBuyBoundarySafe`
- `assertMappedSellBoundarySafe`

The helper is pure/test-only and imports only the existing test boundary fixture module.

## 5. Tests Created

Created `tests/e2e/execution-headless-to-mock-boundary-mapping.spec.ts`.

The tests verify:

- Headless-ish BUY input maps to a safe mock BUY boundary shape.
- Headless-ish SELL exit input maps to a safe mock SELL boundary shape.
- BUY mapping preserves safe order-prep-relevant fields.
- SELL mapping preserves safe exit/order-prep-relevant fields.
- Mapped BUY/SELL outputs pass the Task 365 boundary safety assertions.
- Mapping source isolation stays away from runtime and restricted modules.

## 6. BUY Mapping Safety Summary

Mapped BUY output:

- `mode: mock_review_only`
- `side: BUY`
- Preserves ticker, company, quantity, entry, stop, target, order type, and risk summary.
- `brokerAuthority: false`
- `accountBinding: false`
- `liveOrderIntent: false`
- `finalBuyAuthority: false`
- `orderSubmissionAuthority: false`
- `supabaseExecutionWriteAuthority: false`
- `humanFinalRequired: true`
- `noSubmit: true`
- `stopAtReview: true`
- `noFinalClick: true`
- `noAvanza: true`
- `noCredentials: true`
- `noBankID: true`
- `noCookieSession: true`
- `redactedEvidenceOnly: true`

## 7. SELL Mapping Safety Summary

Mapped SELL output:

- `mode: mock_review_only`
- `side: SELL`
- Preserves ticker, company, quantity, planned exit reason, reference entry, stop, target, order type, position reference, plan reference, and risk summary.
- `brokerAuthority: false`
- `accountBinding: false`
- `liveOrderIntent: false`
- `finalSellAuthority: false`
- `orderSubmissionAuthority: false`
- `supabaseExecutionWriteAuthority: false`
- `livePositionMutationAuthority: false`
- `humanFinalRequired: true`
- `noSubmit: true`
- `stopAtReview: true`
- `noFinalClick: true`
- `noAvanza: true`
- `noCredentials: true`
- `noBankID: true`
- `noCookieSession: true`
- `noLivePositionMutation: true`
- `redactedEvidenceOnly: true`
- Position/exit consistency is preserved.

## 8. Negative Tests Summary

BUY mapping rejects:

- `orderSubmissionAuthority: true`
- `finalBuyAuthority: true`
- `brokerAuthority: true`
- `supabaseExecutionWriteAuthority: true`
- `noSubmit: false`
- `stopAtReview: false`

SELL mapping rejects:

- `orderSubmissionAuthority: true`
- `finalSellAuthority: true`
- `brokerAuthority: true`
- `supabaseExecutionWriteAuthority: true`
- `livePositionMutationAuthority: true`
- `noLivePositionMutation: false`
- Inconsistent position reference quantity.
- Missing `positionReference`.
- Missing `planReference`.

## 9. Source Isolation Summary

The mapping helper and mapping spec remain isolated from:

- Smoke scripts.
- Avanza bridge/runner code.
- Browser helpers.
- Credential/session helpers.
- Supabase clients.
- Env reads.
- Fetch calls.
- Local/session storage.
- Trade UI.
- API routes.
- App runtime.

## 10. What This Proves

This task proves:

- Headless-ish BUY input can map to a safe mock BUY boundary shape.
- Headless-ish SELL exit input can map to a safe mock SELL boundary shape.
- Mapping preserves no-submit, no-final-click, human-final, and stop-at-review semantics.
- Mapping refuses broker, submit, final-click, Supabase, and live-mutation authority.
- SELL mapping enforces no-live-position-mutation and position/exit consistency.
- The structural path can be tested without Avanza, browser, runtime gates, Supabase writes, or Trade UI execution.

## 11. What This Does Not Prove

This task does not prove:

- Real Avanza automation.
- Real browser automation.
- Real login boundary.
- Broker page handling.
- Real order form fill.
- Real KOP/SALJ review detection.
- Credential/BankID/MFA handling.
- Cookie/session/browser storage safety.
- Supabase execution persistence.
- Production readiness.
- Live order safety.
- Broker confirmation capture.
- Settlement/avrakningsnota extraction.

## 12. Remaining Warnings

| Warning | Severity | Why not blocker | Mitigation |
| --- | --- | --- | --- |
| Mapping uses headless-ish test shapes, not direct runtime types | Medium | Intentional to avoid runtime coupling | Add direct type-backed mapping later only if safe |
| Fixtures remain mock-review-only | Medium | This phase is structural only | Keep all live-adjacent claims blocked |
| SELL remains higher risk | High | Position/exit consistency is tested here | Expand SELL negative cases before Avanza-boundary planning |
| No real provider/broker field mapping | Medium | Out of scope | Add broader mapping assertions before runtime |
| Production readiness remains blocked | High | No production path intended | Keep gate locked |

No blockers were found.

## 13. Validation

| Command | Result | Notes |
| --- | --- | --- |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-headless-to-mock-boundary-mapping.spec.ts --reporter=line` | Passed | 5 passed; static mapping tests only |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-mock-boundary-contract-fixtures.spec.ts --reporter=line` | Passed | 10 passed; static fixture tests only |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-script-import-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-auth-hardening.spec.ts --reporter=line` | Passed | 27 passed; boundary tests only; not smoke execution |
| `./node_modules/.bin/tsc --noEmit` | Passed | Compile check only |
| `npm run lint` | Passed | Lint only |
| `git diff --check` | Passed | Whitespace/conflict marker hygiene |
| `git diff -- .env.local --exit-code` | Passed | Confirms `.env.local` unchanged without printing values |
| `git diff -- app/trade-app.tsx --exit-code` | Passed | Confirms Trade UI unchanged |
| `find docs -type f -size 0` | Passed | No empty docs artifacts found |

## 14. Static Search

Static search command:

```bash
rg -n "mapMockHeadless|mock_review_only|noSubmit|stopAtReview|noFinalClick|brokerAuthority|accountBinding|liveOrderIntent|finalBuyAuthority|finalSellAuthority|orderSubmissionAuthority|supabaseExecutionWriteAuthority|livePositionMutationAuthority|noLivePositionMutation|Avanza|BankID|credential|cookie|session|browser|fetch|localStorage|sessionStorage|Supabase|Trade UI execution|API route activation|production readiness|ENABLE_" tests lib docs app scripts
```

Expected classifications:

- Tests-only hits: expected.
- Fixtures-only hits: expected.
- Docs-only hits: expected.
- Locked/blocked hits: expected.
- Allowlisted hits: expected for isolated local-dev scripts covered by boundary tests.
- Future-gated hits: expected.
- Warning hits: expected.
- Blocker hits: none expected.

Observed static-search footprint by top-level directory:

| Directory | Matching files | Classification |
| --- | ---: | --- |
| `docs` | 948 | Expected docs-only planning, checkpoints, runbooks, warnings, gates, and milestone references |
| `lib` | 470 | Expected pure helpers, contracts, fixtures, disabled models, and allowlisted isolated runtime contracts |
| `tests` | 141 | Expected mapping assertions, fixture assertions, boundary, guard, and safety coverage |
| `app` | 25 | Expected locked, diagnostic, mock, auth, and hard-disabled route/UI references already covered by boundary tests |
| `scripts` | 8 | Expected isolated terminal/local-dev diagnostics covered by script import boundary tests |

Observed classification after validation:

- Tests-only hits: expected.
- Fixtures-only hits: expected.
- Docs-only hits: expected.
- Locked/blocked hits: expected.
- Allowlisted script/process hits: expected and covered by boundary tests.
- Future-gated planning hits: expected.
- Warning-class legacy hits: expected and carried forward.
- Blocker hits: none found.

## 15. Recommended Next Task

Recommended next task:

`Task 368 - Execution boundary structural test coverage review and Chat 3 continuation decision`

Alternate hardening task:

`Task 368 - Agent plan to boundary mapping negative-case expansion`

## 16. Final Decision

`headless_to_mock_boundary_mapping_assertions_complete_with_warnings`
