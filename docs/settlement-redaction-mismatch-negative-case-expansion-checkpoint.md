# Settlement Redaction and Mismatch Negative-Case Expansion Checkpoint

## Purpose

Task 372 expands settlement / broker confirmation lifecycle negative-case coverage around redaction, sensitive data leakage, mismatch handling, partial fills, duplicate confirmations, SELL position/exit risk, deviation classification, and authority/persistence escalation.

This is structural test/model hardening only. It does not run new scenarios, open runtime gates, start browser automation, log in to Avanza, fetch a real avräkningsnota, handle credentials/cookies/sessions/BankID, submit orders, click final KÖP/SÄLJ, write Supabase execution records, activate API routes, or add Trade UI execution.

Decision: `settlement_redaction_mismatch_negative_case_expansion_complete_with_warnings`.

Task 374 follow-up: `docs/settlement-extraction-plan-vs-actual-review-hardening-checkpoint.md` builds on this redaction/mismatch layer by making the mock extraction-to-review mapping more explicit for planned BUY/SELL package fields, slippage, commission/courtage, FX impact, settlement reconciliation, partial-fill classification, SELL realized PnL reconciliation, and authority/persistence locks.

## Scope

In scope:

- test-only helper hardening in `tests/fixtures/execution-settlement-mock-fixtures.ts`
- focused negative-case expansion in `tests/e2e/execution-settlement-mock-fixtures.spec.ts`
- checkpoint documentation
- source isolation verification

Out of scope:

- real settlement extraction
- real avräkningsnota access
- real PDF/screenshot parsing
- real broker confirmation capture
- real Avanza/browser interaction
- real Supabase persistence
- production readiness
- accounting/tax correctness
- live settlement correctness

## Existing Coverage

Task 371 already covered:

- mock BUY/SELL settlement fixtures
- mock broker confirmation evidence
- mock settlement note artifacts
- extraction assertions
- plan-vs-actual review classification
- execution cost breakdown fields
- partial-fill and mismatch modeling
- marker-based redaction validator
- negative tests for basic sensitive data, authority escalation, unsafe flags, missing fields, impossible settlement math, duplicate confirmation, partial-fill misuse, and SELL live-position mutation risks

## New Redaction Negative Cases

Expanded sensitive marker coverage now blocks:

- credential marker
- password-like field
- BankID marker/data
- MFA code marker
- cookie token
- session token
- raw browser storage marker
- network dump marker
- unredacted Avanza customer id
- unredacted account number
- account/customer id
- personnummer marker
- full personal identity data
- full name + account linkage marker
- account balance
- unrelated holdings
- env secret marker
- Supabase service key marker
- API token marker
- unredacted raw artifact marker
- raw PDF marker with sensitive data
- screenshot marker with sensitive account data

The expanded tests verify leakage through settlement artifacts, broker confirmation evidence, and extraction-level review classification.

## New Mismatch Negative Cases

Expanded mismatch coverage now blocks or rejects:

- wrong ticker
- wrong side
- plan side mismatch
- missing ticker
- missing currency
- execution timestamp missing
- missing planned price / planned entry
- missing planned quantity
- missing plan reference
- quantity mismatch without partial-fill marker
- artifact/evidence quantity mismatch
- missing execution price
- actual price missing in evidence
- artifact/evidence execution price mismatch
- missing commission/courtage
- negative commission
- missing total settlement amount
- gross amount inconsistent with execution price * quantity
- cost gross amount mismatch
- cost commission mismatch
- cost total settlement amount mismatch
- currency mismatch
- total settlement amount inconsistent with gross amount plus/minus commission
- duplicate confirmation marker
- missing settlement artifact

## New Partial-Fill Negative Cases

Expanded partial-fill coverage now ensures:

- partial fill cannot be treated as full fill
- partial fill requires the partial-fill marker
- partial fill requires executed quantity
- remaining quantity must be derivable or the fixture must mark manual review
- partial fill classification becomes `requires_manual_review`
- partial fill with wrong ticker is blocked

## New Deviation Classification Coverage

The focused spec now explicitly covers:

- `execution_match`
- `minor_execution_deviation`
- `major_execution_deviation`
- `requires_manual_review`
- `blocked_sensitive_or_mismatched_evidence`

Classification behavior:

- sensitive evidence always blocks clean classification
- wrong ticker/side blocks
- missing required fields block clean classification
- partial fills require manual review unless later fully modeled
- major price/fee mismatch becomes major deviation or manual review depending on the mismatch shape

## Authority / Persistence Negative Cases

Expanded coverage rejects or blocks:

- `supabaseExecutionWriteAuthority: true`
- `productionPersistenceAllowed: true`
- `brokerAuthority: true`
- `accountBinding: true`
- `liveOrderIntent: true`
- `orderSubmissionAuthority: true`
- `finalBuyAuthority: true`
- `finalSellAuthority: true`
- `livePositionMutationAuthority: true`
- automatic result update authority
- automatic statistics update authority
- automatic learning update authority

Supabase, production persistence, result/statistics/learning updates, and broker authority remain blocked.

## Helper Changes

`tests/fixtures/execution-settlement-mock-fixtures.ts` was hardened to:

- recognize broader sensitive field markers
- require plan side, plan id, contract id, planned price, and planned quantity
- require artifact/evidence quantity, execution price, and currency consistency
- require gross amount to reconcile with execution price * quantity
- require cost breakdown fields to match artifact fields
- reject automatic result/statistics/learning update authority
- require SELL position ticker/instrument/entry consistency
- reject SELL quantity greater than mock position quantity
- require SELL planned stop/target and mock-calculable realized PnL
- require partial fill remaining quantity or manual-review marker
- classify any extraction violation as non-clean

All helper changes remain pure/test-only with no env read, fetch, Supabase client, browser, localStorage/sessionStorage, Trade UI import, API route import, smoke script import, bridge import, or runner import.

## Source Isolation

The settlement fixture/spec source isolation test still verifies no restricted imports from:

- smoke scripts
- Avanza bridge/runner modules
- browser helpers
- credential/session helpers
- Supabase clients
- env reads
- fetch
- storage APIs
- Trade UI
- API routes
- app runtime
- process-spawn modules

## What This Proves

- The settlement model rejects broader sensitive data leakage.
- Mismatch handling is stronger.
- Partial-fill handling is safer.
- Deviation classification catches sensitive/mismatched evidence.
- Supabase/production persistence remains blocked.
- SELL position/exit mismatch risks are better covered.
- Source isolation remains intact.

## What This Does Not Prove

- Real avräkningsnota parsing.
- Real PDF/screenshot extraction.
- Real broker confirmation capture.
- Real Avanza/browser interaction.
- Real Supabase persistence.
- Production readiness.
- Accounting/tax correctness.
- Live settlement correctness.

## Remaining Warnings

- This remains model/test-only.
- The redaction validator is marker-based, not a production sanitizer.
- No real Avanza or broker settlement artifact parser exists.
- No Supabase persistence gate is open.
- No runtime or Trade UI execution path is enabled.

## Validation

Validation run for this checkpoint:

| Check | Result |
| --- | --- |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-settlement-mock-fixtures.spec.ts --reporter=line` | Pass, 11 passed |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-headless-to-mock-boundary-mapping.spec.ts --reporter=line` | Pass, 5 passed |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-mock-boundary-contract-fixtures.spec.ts --reporter=line` | Pass, 10 passed |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-script-import-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-auth-hardening.spec.ts --reporter=line` | Pass, 27 passed |
| `./node_modules/.bin/tsc --noEmit` | Pass |
| `npm run lint` | Pass |
| `git diff --check` | Pass |
| `git diff -- .env.local --exit-code` | Pass |
| `git diff -- app/trade-app.tsx --exit-code` | Pass |
| `find docs -type f -size 0` | Pass |

Static search required:

```text
rg -n "settlement|avräkningsnota|broker confirmation|execution price|commission|courtage|FX|likvidbelopp|plan-vs-actual|redacted|credential|password|BankID|MFA|cookie|session|browser storage|network dump|account id|customer id|personnummer|Supabase write|service key|productionPersistenceAllowed|finalBuyAuthority|finalSellAuthority|orderSubmissionAuthority|livePositionMutationAuthority|Trade UI execution|API route activation|production readiness" tests lib docs app scripts
```

Static search category counts:

```text
  22 app
 759 docs
 278 lib
   7 scripts
 116 tests
```

Expected classification:

- tests-only: expanded settlement spec
- fixtures-only: expanded mock fixture/helper model
- docs-only: checkpoints
- locked/blocked: authority and persistence gates
- future-gated: real settlement extraction and Supabase persistence
- warning: model-only limitations
- blocker: none expected

## Recommended Next Task

Recommended next task: Task 373 - Post-trade lifecycle structural coverage review.

Alternative: Task 373 - Settlement extraction mapping to plan-vs-actual review hardening.

## Final Decision

Final decision: `settlement_redaction_mismatch_negative_case_expansion_complete_with_warnings`.

The warnings are model/test-only warnings. No runtime gates were opened and no execution capability was introduced.
