# Action 600 - Diagnose Real Issuance Response Semantic Validation Failure

## Scope

Action 600 performs read-only diagnosis of the Action 599 HTTP `503`. It does
not issue credentials, invoke execution or a provider, create claims, write
audit/ledger/usage data, change flags, activate a schedule, deploy, or retry
issuance.

## Available Evidence

The original Action 599 response was intentionally filtered before it could
retain a token-bearing response. The observed facts are limited to one route
request, HTTP `503`, one temporarily active authorization/lease pair, no
manual-execution request, and zero claims, audit rows, ledger rows, usage, and
provider work. The pair later expired unconsumed.

Read-only production table inspection of the latest pair found:

- one authorization and one lease with matching authorization identity;
- matching request fingerprint, execution ID, claim ID, ticker, interval,
  requested range, and all four policy values;
- `AAPL`, `5min`, a 30-minute range, and `377 / 57 / 320 / 1` policy values;
- authorization and lease contract versions valid, deployment commit canonical,
  and both records unconsumed;
- PostgREST timestamps serialized as valid `+00:00` timestamps, with only
  zero-padded millisecond precision and semantic equality across both records.

No identifier, token, lease reference, hash, secret, header, or sensitive URL
is recorded here.

## Reproduction

`tests/e2e/action-600-diagnose-real-issuance-response-semantic-validation-failure.spec.ts`
contains a faithful sanitized response fixture for the observed PostgREST
shape: `+00:00` timestamps, three-digit milliseconds for issuance/expiry,
no fractional digits for the market range, numeric policy fields, one
authorization-only deployment identity, and no lease deployment field.

The real strict validator accepts that complete response. The test also
exercises the enumerated wrapper, authorization identity, lease identity,
shared-binding, timestamp-normalization, and policy-contract rejection
branches without any credential value.

## Finding

No exact validator branch can be proven from the retained evidence. Every
field available from the actual persisted pair satisfies the canonical
validator's corresponding condition, and the faithful production-shaped
fixture validates successfully. The Action 599 route body was not retained,
so it is not possible to distinguish the route's semantic-validator response
branch from a later route-level exception solely from HTTP `503`.

No permissive parsing or validation weakening is justified. A future, separately
approved diagnostic would need to retain only the existing sanitized
`diagnostic_code`, `validation_stage`, and `failed_fields` from a failed route
response, without retaining any credential-bearing fields.

## Validation

Passed locally:

```text
PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test \
  tests/e2e/action-600-diagnose-real-issuance-response-semantic-validation-failure.spec.ts
# 2 passed

npx tsc --noEmit
npx eslint \
  tests/e2e/action-600-diagnose-real-issuance-response-semantic-validation-failure.spec.ts \
  lib/continuous-intelligence-shadow-canary-manual-authorization-issuance-response.ts
git diff --check
```

All checks passed. These local checks and the production data inspection were
read-only; no credential, provider, claim, audit, ledger, usage, flag, or
schedule mutation occurred in Action 600.

## Decision

`issuance_response_validation_root_cause_not_identified`
