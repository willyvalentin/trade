# Action 589 - Sanitized Manual Authorization Issuance Readiness Diagnostic

## Purpose

Action 589 adds a read-only diagnostic for the canonical paired manual authorization and execution-lease issuance path. It is the required follow-up to Action 588: it distinguishes a blocked context, missing runtime configuration, unavailable schema, unsafe grants, signature mismatch, active issuance guard, and response-mapping incompatibility without generating a token or creating any durable record.

## Route And Access

`GET /api/automation/continuous-intelligence/shadow-collector/canary/manual-authorization/readiness`

The route requires `x-automation-secret`, accepts no query parameters or body, is dynamically rendered with `no-store`, and only calls read-only context and probe helpers. Unauthorized and malformed requests return `request_auth_invalid` and `request_contract_invalid`; no diagnostic request reaches issuance code.

The service-role-only database function `read_continuous_intelligence_shadow_canary_manual_issuance_readiness()` reads PostgreSQL catalog facts and active issued-record counts. It does not invoke either issuance RPC and contains no data-modifying statement.

## Sanitized Categories

- `diagnostic_ready`
- `request_auth_invalid`
- `request_contract_invalid`
- `readiness_blocked`
- `authorization_rpc_unavailable`
- `lease_rpc_unavailable`
- `rpc_permission_invalid`
- `rpc_signature_mismatch`
- `environment_configuration_missing`
- `response_mapping_incompatible`
- `transaction_prerequisite_failed`
- `concurrent_issuance_guard_active`
- `unknown_sanitized_failure`

The response contains booleans and active-record counts only. It never contains raw tokens, token hashes, lease credentials, request fingerprints, provider data, URLs, secrets, or database errors.

## No-Effect Boundary

The diagnostic does not generate credentials; insert, update, consume, claim, provider, audit, ledger, flag, and schedule effects are all explicitly false. Existing issuance and execution routes are not changed.

## Production Verification (2026-07-22)

`production_issuance_readiness_diagnostic_failed`

The current production deployment (`8bb236f`) contains Action 589. One authenticated, parameter-free GET was sent to the canonical readiness route. It returned HTTP `502` before the route emitted its sanitized diagnostic envelope, so no route-level category or subcategory was available to retain.

The read-only service-role probe was then checked directly. Its API endpoint returned HTTP `404`, meaning the new probe was not available through the production PostgREST API despite migration `20260722004000` being registered. This is a current diagnostic-infrastructure availability failure. It does not prove that the earlier Action 587 issuance failure had the same cause; that issuance response was intentionally not retained.

Durable counts were zero immediately before and after the single route call:

| Store | Before | After |
| --- | ---: | ---: |
| Manual authorizations | 0 | 0 |
| Manual execution leases | 0 | 0 |
| Daily claims | 0 | 0 |
| Durable audit rows | 0 | 0 |
| Credit-ledger rows | 0 | 0 |

Daily usage therefore remained `0 / 0`. No token or lease credential was generated or exposed; no authorization, lease, claim, provider request, audit or ledger write, flag change, or schedule action occurred.

The immediate follow-up is to restore the deployed route/probe availability and verify the PostgREST schema exposure before any future issuance is considered. Do not retry issuance based on this result.
