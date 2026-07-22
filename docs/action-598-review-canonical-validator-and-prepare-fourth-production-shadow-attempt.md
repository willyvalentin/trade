# Action 598 - Review Canonical Validator And Prepare Fourth Production Shadow Attempt

## Scope

Action 598 reviews and integrates the canonical issuance-response validator
identified in Action 597. It does not issue or consume credentials, invoke
manual execution or a provider, create claims, write audit/ledger/usage data,
change flags, or activate a schedule.

## Files And Call Paths Reviewed

- `docs/action-596-third-authorized-production-shadow-canary-attempt.md` and
  `docs/action-597-diagnose-action-596-atomic-issuance-validation-failure.md`:
  the contained Action 596 attempt and the exact historical comparison defect.
- `app/api/automation/continuous-intelligence/shadow-collector/canary/manual-authorization/route.ts`:
  authenticated fixed-body entry point, readiness/context construction, atomic
  authorization-plus-lease issuance, response construction, canonical
  validation, and safe lifecycle mapping.
- `lib/server/continuous-intelligence-shadow-canary-manual-authorization-context.ts`
  and `lib/server/continuous-intelligence-shadow-canary-manual-authorization-persistence.ts`:
  deployment/readiness binding, token hashing, strict RPC-row mapping, and
  atomic issuance persistence.
- `lib/continuous-intelligence-shadow-canary-manual-authorization.ts`,
  `lib/continuous-intelligence-shadow-canary-manual-execution-lease.ts`, and
  `lib/continuous-intelligence-shadow-canary-manual-authorization-issuance-response.ts`:
  public contract surfaces, sanitizers, canonical validator, timestamp and
  cross-object binding rules, and the isolated historical reproducer.
- `app/api/automation/continuous-intelligence/shadow-collector/canary/manual-execution/route.ts`:
  strict request parsing, authorization lookup, binding verification, atomic
  admission, bounded provider entry, deterministic claim finalization, audit,
  ledger, usage-related durable evidence, and terminal response mapping.
- `lib/server/continuous-intelligence-shadow-canary-claim-persistence.ts` and
  `lib/continuous-intelligence-shadow-collector-canary.ts`: claim lifecycle,
  runtime recheck, provider boundary, retry prohibition, and bounded execution
  semantics.

The route-level call-site search found one production invocation of the
canonical validator in the manual-authorization route. Its remaining
references are the Action 597 historical reproducer and Action 597/598 tests;
none is an alternate production issuance validator.

## Reviewed Production Path

1. `manual-authorization/route.ts` authenticates the fixed request body,
   builds the server-only readiness/binding context, and makes the one atomic
   authorization-plus-lease issuance call.
2. The server persistence adapter hashes the opaque token before its RPC call,
   parses the returned authorization and lease records strictly, and creates
   the sanitized route response.
3. The route now invokes
   `validateContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceResponse`
   before returning the one-time token to the caller.
4. Only a semantic-success result reaches `return json(response)`. A semantic
   failure returns HTTP `503` with the safe terminal status
   `atomic_issuance_failed_before_execution`, diagnostic code, stage, and field
   names, without returning the token.
5. The separate canonical manual-execution route performs authorization lookup,
   atomic authorization-and-lease consumption plus claim admission, one bounded
   provider call at most, deterministic claim finalization, then audit and
   ledger persistence. It is unreachable from issuance validation failure.

## Validator Review Result

The corrected validator is the only route-level issuance-response validator.
No inline, legacy, shadowed, or stale validator is active in the production
issuance path. The Action 596 historical comparison remains only in the
Action 597 diagnostic reproducer and cannot authorize execution.

The lease public contract intentionally excludes deployment metadata. The
canonical validator validates deployment identity on the authorization object,
validates only documented shared authorization/lease fields, and binds both
returned opaque IDs to the exact records returned by persistence.

The one defect found was the Action 597 historical comparison itself. Action
598 removes it from the active route path by making the canonical validator the
mandatory route-level gate before `return json(response)`. No other invalid
non-contract comparison was evidenced, so no unrelated comparison was changed.

## Comparison Inventory

| Comparison | Classification | Reason |
| --- | --- | --- |
| Route HTTP status is `200` | Required public contract | Transport success is necessary but insufficient. |
| Response, authorization, and lease contract versions | Required public contract | Unknown versions fail closed. |
| Required public response fields and types | Required public contract | Missing or malformed values fail closed. |
| Authorization ID against persisted result | Required internal contract | Prevents response substitution. |
| Lease ID against persisted result | Required internal contract | Prevents response substitution. |
| Shared IDs, ticker, interval, policy, and credits | Required public contract | These fields exist on both sanitized objects. |
| Issued, expiry, start, and end instants after normalization | Derived invariant | Semantic instant equality is required. |
| AAPL, 5min, 30-minute range, 377/57/320, issued/unconsumed state, and TTL | Required public contract | Exact bounded canary contract. |
| Authorization deployment commit/build marker | Required internal authorization contract | Server admission enforces it; lease does not expose it. |
| Token hash | Required internal persistence contract | SHA-256-only server-side value, never public. |
| Atomic admission fingerprint, execution ID, claim ID, replay, and daily limits | Required internal contract | The RPC controls consumption and claim creation. |
| Provider/audit/ledger/usage work | Derived lifecycle invariant | Unreachable before validation and admission. |
| Canary, kill switch, schedule, calendar, planner, and provider readiness | Required route configuration | Fail closed before issuance/admission. |
| Authorization deployment commit against lease deployment commit | Historical invalid comparison | Lease contract omits it. |

No additional invalid cross-object comparison was found. Nonce, signature, and
digest comparisons are not applicable to the public issuance response: the
opaque token is returned once, its hash is server-side only, and no public
nonce/signature/digest field exists.

## Fourth-Attempt Runbook (Preparation Only)

### Preconditions

- A separately authorized Action 599 names the exact production route,
  deployment commit, one attempt count, a maximum 60-second expiration, and
  issuance-only operator scope.
- The reviewed commit is deployed; worktree state is clean or explicitly
  understood, including unrelated files.
- Required validator/route suites, TypeScript, lint, and production build pass.
- Readiness is `diagnostic_ready` and activation readiness is
  `ready_for_one_manual_canary_attempt`.
- Canary remains disabled, the kill switch remains active, and no schedule is
  active.
- There is no active authorization, lease, claim, audit/ledger delta, or
  reusable prior attempt state.

### Authorized Operation

1. Make exactly one canonical manual-authorization request for the deployed
   production route
   `/api/automation/continuous-intelligence/shadow-collector/canary/manual-authorization`.
   Its bounded contract is AAPL, `5min`, a completed
   30-minute window, and policy `377 / 57 / 320`.
2. Keep the raw token and matching lease ID in ephemeral process memory only.
   They expire in no more than 60 seconds, are single-use, and must not be
   logged, documented, or retried.
3. Validate the HTTP response with the canonical validator and the exact
   persisted authorization/lease IDs. Check semantic timestamps, status,
   contract versions, binding, and zero issuance-side effects.
4. Stop after validation. Provider execution, claim admission, audit, ledger,
   and usage effects are prohibited unless a distinct later authorization
   explicitly permits the canonical manual-execution phase.

### Stop Conditions And Evidence

Abort without execution on any non-success diagnostic, route/version/commit
mismatch, expired or inconsistent credential pair, unexpected persistence,
retry request, provider call, flag/schedule change, or changed canary/kill
switch state. Clear ephemeral credentials and let an unconsumed pair expire.

Capture only sanitized HTTP status, validator result, terminal status,
diagnostic/stage/field names, lifecycle state, table counts, usage, provider
call count, retry count, canary state, kill-switch state, and schedule state.
No token, lease ID, credential hash, header, URL, provider payload, or secret
may be recorded. Confirm the exact terminal lifecycle state and no dangling
claim after any separately authorized operation.

After an issuance-only validation checkpoint, confirm both credentials are
unconsumed and expire naturally, claims/audit/ledger/usage/provider/retry
counts remain zero, and canary, kill switch, and schedule states are unchanged.
Any later execution protocol must instead prove exactly one consumed
authorization and lease, one terminal claim, and internally consistent audit,
ledger, usage, and provider-count evidence.

## Safety Confirmation

No authorization or lease was created in Action 598. No production attempt,
provider call, claim, audit, ledger, or usage write occurred. Canary remains
disabled, the kill switch remains active, and no schedule or feature flag was
modified.

## Validation

The following local, non-production checks passed:

```text
PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test \
  tests/e2e/action-597-diagnose-action-596-atomic-issuance-validation-failure.spec.ts \
  tests/e2e/action-598-review-canonical-validator-and-prepare-fourth-production-shadow-attempt.spec.ts
npx next typegen
npx tsc --noEmit
npx eslint lib/continuous-intelligence-shadow-canary-manual-authorization-issuance-response.ts \
  app/api/automation/continuous-intelligence/shadow-collector/canary/manual-authorization/route.ts \
  tests/e2e/action-597-diagnose-action-596-atomic-issuance-validation-failure.spec.ts \
  tests/e2e/action-598-review-canonical-validator-and-prepare-fourth-production-shadow-attempt.spec.ts
PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test \
  tests/e2e/action-565-continuous-intelligence-budget-orchestrator.spec.ts \
  tests/e2e/action-566-shared-candle-cache-rolling-rest-collector.spec.ts \
  tests/e2e/action-567-authenticated-shadow-collector-dry-run-boundary.spec.ts \
  tests/e2e/action-568-bounded-shadow-collector-execution-proof.spec.ts \
  tests/e2e/action-569-production-bounded-execution-preflight.spec.ts \
  tests/e2e/action-570-one-time-operator-authorization.spec.ts \
  tests/e2e/action-571-live-proof-receipt-operator-runbook.spec.ts \
  tests/e2e/action-572-durable-sanitized-proof-audit.spec.ts \
  tests/e2e/action-573-provider-credit-reconciliation-ledger.spec.ts \
  tests/e2e/action-574-scheduled-shadow-collector-canary.spec.ts \
  tests/e2e/action-575-shadow-canary-schedule-activation-readiness.spec.ts \
  tests/e2e/action-576-verified-us-market-calendar-integration.spec.ts \
  tests/e2e/action-580-one-manual-shadow-canary-attempt-authorization.spec.ts \
  tests/e2e/action-583-atomic-manual-canary-execution-continuation.spec.ts \
  tests/e2e/action-585-atomic-one-time-live-canary-configuration-lease.spec.ts \
  tests/e2e/action-589-sanitized-manual-authorization-issuance-readiness-diagnostic.spec.ts \
  tests/e2e/action-590-stable-rpc-naming-and-postgrest-availability-hardening.spec.ts \
  tests/e2e/action-595-canonical-timestamp-normalization-for-authorization-binding.spec.ts \
  tests/e2e/action-597-diagnose-action-596-atomic-issuance-validation-failure.spec.ts \
  tests/e2e/action-598-review-canonical-validator-and-prepare-fourth-production-shadow-attempt.spec.ts
npm run build
git diff --check
```

The focused Action 597/598 validator tests passed (`9 passed`). The complete
focused continuous-intelligence suite passed (`149 passed`). Type generation,
TypeScript, scoped ESLint, and the Next.js 16.2.6 Turbopack production build
all passed. The static call-site audit found one real issuance-route validator
call and only diagnostic/test references elsewhere.

## Remaining Uncertainty

Action 596's raw token-bearing response remains intentionally unavailable.
The route contract, sanitizer surfaces, and historical predicate now provide a
deterministic reproduction and route-level protection without recovering that
secret material.
