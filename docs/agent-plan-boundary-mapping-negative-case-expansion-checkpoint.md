# Agent Plan Boundary Mapping Negative-Case Expansion Checkpoint

Date: 2026-07-07

## 1. Purpose

Expand negative-case coverage for the headless-ish/agent-plan to mock boundary mapping layer so BUY/SELL boundary shapes are better protected against authority escalation, inconsistent data, live mutation, Supabase write authority, final-click risk, submit risk, and sensitive boundary leakage.

Decision: `agent_plan_boundary_mapping_negative_case_expansion_complete_with_warnings`

## 2. Scope

In scope:

- Hardening of pure/test-only mapping helper validation.
- Expanded BUY negative cases.
- Expanded SELL negative cases.
- Source isolation confirmation.
- Documentation of remaining warnings and next task.

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

## 3. Existing Coverage

Existing positive coverage:

- Headless-ish BUY input maps to safe `mock_review_only` BUY boundary shape.
- Headless-ish SELL exit input maps to safe `mock_review_only` SELL boundary shape.
- Mapped BUY output passes BUY boundary safety assertions.
- Mapped SELL output passes SELL boundary safety assertions.
- Source isolation keeps mapping helper/spec away from runtime and restricted modules.

Existing negative coverage before this task:

- BUY rejected submit authority, final-buy authority, broker authority, Supabase write authority, `noSubmit: false`, and `stopAtReview: false`.
- SELL rejected submit authority, final-sell authority, broker authority, Supabase write authority, live-position mutation authority, `noLivePositionMutation: false`, inconsistent position quantity, missing `positionReference`, and missing `planReference`.

Identified gaps before this task:

- Missing safety marker coverage was incomplete.
- Account binding and live order intent escalation were not explicitly covered.
- Human-final false was not covered.
- BUY data consistency coverage was thin.
- SELL exit/position mismatch coverage needed broader plan reference cases.
- Forbidden coupling markers such as account id, broker order id, production execution id, credential/session/cookie-like data, and final authority markers were not covered.

## 4. New BUY Negative Cases

BUY mapping now rejects:

- `finalBuyAuthority: true`
- `orderSubmissionAuthority: true`
- `brokerAuthority: true`
- `accountBinding: true`
- `liveOrderIntent: true`
- `supabaseExecutionWriteAuthority: true`
- `humanFinalRequired: false`
- `noFinalClick: false`
- `noSubmit: false`
- `stopAtReview: false`
- `noAvanza: false`
- `noCredentials: false`
- `noBankID: false`
- `noCookieSession: false`
- `redactedEvidenceOnly: false`
- Side/action mismatch.
- Missing ticker.
- Zero or negative quantity.
- Invalid stop/entry/target relation.
- Missing plan reference.
- Plan ticker mismatch.
- Unsafe `MARKET` order type.
- Account id coupling.
- Broker order id coupling.
- Production execution id coupling.
- Credential-like coupling.
- Session-like coupling.
- Cookie-like coupling.
- Final KOP authority marker.

## 5. New SELL Negative Cases

SELL mapping now rejects:

- `finalSellAuthority: true`
- `orderSubmissionAuthority: true`
- `brokerAuthority: true`
- `accountBinding: true`
- `liveOrderIntent: true`
- `supabaseExecutionWriteAuthority: true`
- `livePositionMutationAuthority: true`
- `humanFinalRequired: false`
- `noFinalClick: false`
- `noSubmit: false`
- `stopAtReview: false`
- `noLivePositionMutation: false`
- `noAvanza: false`
- `noCredentials: false`
- `noBankID: false`
- `noCookieSession: false`
- `redactedEvidenceOnly: false`
- Missing `positionReference`.
- Missing `planReference`.
- Position quantity mismatch.
- Sell quantity greater than position quantity through mismatch rejection.
- Side/action mismatch.
- Missing ticker.
- Missing or invalid planned exit reason.
- Missing reference entry.
- Target mismatch.
- Stop mismatch.
- Planned exit reason mismatch.
- Unsafe `MARKET` order type.
- Real broker order id coupling.
- Real account id coupling.
- Production execution id coupling.
- Credential/session/cookie-like coupling.
- Final SALJ authority marker.
- Live trade mutation marker.

## 6. Mapping Helper Changes

Updated `tests/fixtures/execution-boundary-mapping-fixtures.ts` with:

- Forbidden coupling input shape.
- Shared rejection of account id, broker order id, production execution id, credential/session/cookie-like fields, final KOP/SALJ authority markers, and live trade mutation markers.
- Shared rejection of account binding, live order intent, human-final false, and missing safety markers.
- BUY validation for ticker/company presence, positive quantity, positive prices, valid stop/entry/target relationship, `LIMIT` order type, required plan reference, and plan ticker/intent consistency.
- SELL validation for ticker/company presence, positive quantity, positive reference/stop/target prices, valid planned exit reason, `LIMIT` order type, required position and plan references, and position/exit consistency.

The helper remains pure/test-only and imports only the mock boundary fixture module.

## 7. Source Isolation Confirmation

Source isolation remains enforced by `tests/e2e/execution-headless-to-mock-boundary-mapping.spec.ts`.

The mapping helper/spec do not import:

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

## 8. What This Proves

This task proves:

- The mapping layer rejects more authority escalation cases.
- BUY cannot silently gain broker, final-click, submit, account binding, live order intent, or Supabase authority.
- SELL cannot silently gain broker, final-click, submit, account binding, live order intent, Supabase, live trade mutation, or live-position mutation authority.
- Missing/unsafe safety markers are caught.
- BUY data validity and plan-reference consistency are stronger.
- SELL no-live-position-mutation and position/exit consistency are stronger.
- Source isolation remains intact.

## 9. What This Does Not Prove

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

## 10. Remaining Warnings

| Warning | Severity | Why not blocker | Mitigation |
| --- | --- | --- | --- |
| Mapping remains structural/test-only | Medium | This task intentionally avoids runtime | Keep live-adjacent claims blocked |
| No real Avanza/browser/broker validation | High | Browser and Avanza are out of scope | Plan separately behind gates if ever needed |
| SELL remains higher risk | High | Negative cases are stronger, but live position data is not used | Continue SELL-specific hardening before any Avanza-boundary |
| No settlement lifecycle proof | Medium | Out of scope | Recommended next task addresses lifecycle checkpointing |
| Production readiness remains blocked | High | No production path intended | Keep gate locked |

No blockers were found.

## 11. Validation

| Command | Result | Notes |
| --- | --- | --- |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-headless-to-mock-boundary-mapping.spec.ts --reporter=line` | Passed | 5 passed; expanded negative-case matrices |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-mock-boundary-contract-fixtures.spec.ts --reporter=line` | Passed | 10 passed; static fixture tests only |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-script-import-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-auth-hardening.spec.ts --reporter=line` | Passed | 27 passed; boundary tests only; not smoke execution |
| `./node_modules/.bin/tsc --noEmit` | Passed | Compile check only |
| `npm run lint` | Passed | Lint only |
| `git diff --check` | Passed | Whitespace/conflict marker hygiene |
| `git diff -- .env.local --exit-code` | Passed | Confirms `.env.local` unchanged without printing values |
| `git diff -- app/trade-app.tsx --exit-code` | Passed | Confirms Trade UI unchanged |
| `find docs -type f -size 0` | Passed | No empty docs artifacts found |

## 12. Static Search

Static search command:

```bash
rg -n "finalBuyAuthority|finalSellAuthority|orderSubmissionAuthority|brokerAuthority|accountBinding|liveOrderIntent|supabaseExecutionWriteAuthority|livePositionMutationAuthority|noLivePositionMutation|humanFinalRequired|noSubmit|stopAtReview|noFinalClick|noAvanza|noCredentials|noBankID|noCookieSession|redactedEvidenceOnly|Avanza|BankID|credential|cookie|session|browser|fetch|localStorage|sessionStorage|Supabase|Trade UI execution|API route activation|production readiness|ENABLE_" tests lib docs app scripts
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
| `docs` | 950 | Expected docs-only planning, checkpoints, runbooks, warnings, gates, and milestone references |
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

## 13. Recommended Next Task

Recommended next task:

`Task 370 - Settlement and broker confirmation lifecycle checkpoint`

Reasoning:

- The structural execution boundary is now heavily guarded.
- A settlement/broker confirmation lifecycle checkpoint strengthens the post-trade side without moving toward Avanza runtime.

Alternate next task:

`Task 370 - Avanza-boundary planning, no execution`

## 14. Final Decision

`agent_plan_boundary_mapping_negative_case_expansion_complete_with_warnings`
