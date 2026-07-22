# Action 597 - Diagnose Action 596 Atomic Issuance Validation Failure

## Scope

This action diagnoses the Action 596 operator-side validation failure without
issuing or consuming credentials, invoking manual execution or a provider,
creating claims, writing audit or ledger records, changing flags, or activating
a schedule.

## Evidence And Root Cause

Action 596 made one successful HTTP `200` issuance request. The canonical
route had already persisted a valid, bounded authorization and matching lease.
The external fail-closed validator then rejected the response before creating
the manual-execution request.

The exact failing predicate compared `authorization.deployment_commit` with
`execution_lease.deployment_commit`. The public lease sanitizer intentionally
does not expose `deployment_commit`; deployment identity belongs to the
authorization binding and is enforced again by the atomic server admission.
The comparison therefore evaluated a real authorization value against an
absent lease response field.

Classification: validator defect caused by a request/response binding mismatch
against a non-contract field. It was not a provider response, route transport,
schema-version, timestamp-normalization, or production-configuration failure.

## Sanitized Regression Fixture

The original raw HTTP body was intentionally not retained because it contained
a one-time authorization token. The deterministic fixture contains the exact
sanitized public response shape reconstructed from the issuance route and its
two sanitizer functions. It deliberately omits `deployment_commit` from the
lease object, matching the deployed response contract. No token, lease ID,
signature, hash, or production identifier is stored in this document.

## Diagnostic Contract

`lib/continuous-intelligence-shadow-canary-manual-authorization-issuance-response.ts`
separates HTTP transport success from semantic response validation. It adds
safe failure categories, including
`issuance_response_binding_mismatch`, and retains the terminal status
`atomic_issuance_failed_before_execution` for semantic validation failures.

The canonical validator accepts the documented shared authorization/lease
surface and performs strict version, required-field, timestamp, status, TTL,
policy, range, and common-binding validation. The historical reproducer emits
`issuance_response_binding_mismatch` at
`historical_non_contract_pair_comparison` with the safe field name
`deployment_commit`.

## Files Changed

- `lib/continuous-intelligence-shadow-canary-manual-authorization-issuance-response.ts`
  adds the pure strict response validator and the historical diagnostic
  reproducer.
- `tests/e2e/action-597-diagnose-action-596-atomic-issuance-validation-failure.spec.ts`
  covers valid, historical, unknown-version, missing-field, malformed-value,
  and zero-side-effect cases.
- This Action 597 record documents the evidence and verification.

The production issuance route, persistence adapter, migrations, flags, and
schedule configuration are unchanged.

## Preserved Boundaries

- HTTP `200` is not treated as execution-ready until canonical semantic
  validation succeeds.
- Unknown versions, missing fields, malformed values, timestamps, expired
  credentials, and actual shared-binding mismatches remain fail-closed.
- Validation is pure and does not retry issuance or create/consume credentials.
- Validation failure cannot reach manual execution, claim admission, audit or
  ledger persistence, usage persistence, or provider work.
- Canary remains disabled and the kill switch remains active.

## Production Status

No new production attempt occurred during Action 597. The Action 596 pair is
expired and unconsumed; claims, audit, ledger, usage, and provider calls remain
unchanged at zero.

## Validation

Passed:

```text
PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test \
  tests/e2e/action-597-diagnose-action-596-atomic-issuance-validation-failure.spec.ts
# 4 passed

npx next typegen
npx tsc --noEmit
npx eslint \
  lib/continuous-intelligence-shadow-canary-manual-authorization-issuance-response.ts \
  tests/e2e/action-597-diagnose-action-596-atomic-issuance-validation-failure.spec.ts

PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test <Actions 565-597 relevant suite>
# 144 passed

npm run build
# Next.js 16.2.6 / Turbopack passed

git diff --check
# passed
```

The Action 597 changes are the new pure validator, its focused test, and this
record. The worktree also retains the pre-existing Action 595 verification-note
modification and the untouched untracked `deno.lock`.

## Remaining Uncertainty

The original token-bearing raw response cannot and should not be recovered.
The failing rule is nevertheless deterministically reproduced from the exact
historical validator predicate and the deployed public response contract.
