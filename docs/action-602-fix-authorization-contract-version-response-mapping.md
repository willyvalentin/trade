# Action 602 - Fix Authorization Contract Version Response Mapping

## Root Cause

The authorization table constrains its sole supported version to
`continuous_intelligence_shadow_canary_manual_authorization_v1`, and the
persisted production rows use that exact value. The legacy authorization RPC
returns the field; the combined authorization-plus-lease RPC returns only
identifiers, timestamps, and statuses. The persistence adapter reconstructs
the bounded authorization record before the route serializes it.

The public authorization sanitizer omitted `contract_version` altogether. The
strict route-level validator correctly rejected that missing field at
`authorization_contract` as `issuance_response_version_unsupported`. The lease
sanitizer already emits its own explicit canonical version.

Classification: `field mapping mismatch`.

## Fix

`sanitizeContinuousIntelligenceShadowCanaryManualAuthorization()` now emits
the one explicit canonical authorization contract version. This matches the
database constraint and parser; it does not accept a second version or add a
fallback. Unknown, missing, malformed, and future versions remain rejected by
the parser and strict issuance-response validator.

The lease continues to use
`continuous_intelligence_shadow_canary_manual_execution_lease_v1`; no parallel
lease mismatch was found.

## Validation

- `npx next typegen`
- `npx tsc --noEmit`
- Scoped ESLint for the authorization response boundary and Action 598, 600,
  and 602 coverage
- Focused Actions 598-602 Playwright tests: 10 passed
- Relevant authorization and continuous-intelligence suite: 29 passed

The regression fixture mirrors the canonical PostgREST-equivalent authorization
shape. It proves the canonical value passes while unsupported, missing, and
wrong-type authorization versions remain a fail-closed
`issuance_response_version_unsupported` result. The separate lease version and
the no-effect issuance flags are also covered.

## Boundaries

Authorization/lease identity, policy, timestamp, TTL, deployment binding,
execution admission, provider behavior, claims, audit, ledger, usage, flags,
and schedules are unchanged. This Action does not issue credentials, invoke
production execution or a provider, create claims, write durable evidence,
change flags, activate schedules, deploy, commit, or push.
