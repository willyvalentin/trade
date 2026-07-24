# Action 590 - Stable RPC Naming and PostgREST Availability Hardening

## Finding

PostgreSQL identifiers are limited to 63 bytes. The Action 580 authorization issue and consume names were declared at 64 and 66 bytes, and the Action 589 readiness name at 68 bytes. PostgreSQL stored truncated catalog names while the application requested the longer declarations through PostgREST.

The Action 585 lease issuance and lease admission names are each 35 bytes. The superseded Action 583 non-lease admission name is 60 bytes and remains intentionally revoked for `service_role`; the canonical Action 585 lease admission remains the only enabled admission path.

## Canonical Names

| Purpose | Stable catalog name |
| --- | --- |
| Manual authorization issuance | `ci_mca_issue` |
| Manual authorization consumption | `ci_mca_consume` |
| Paired authorization and lease issuance | `issue_ci_shadow_canary_manual_lease` |
| Atomic paired admission | `admit_ci_shadow_canary_manual_lease` |
| Read-only issuance readiness | `ci_mca_readiness` |

Migration `20260722005000_stabilize_continuous_intelligence_shadow_canary_rpc_names.sql` renames the three accidentally truncated catalog entries by their exact current signatures, preserves their implementations and ACLs, rewrites the read-only readiness probe to inspect the new canonical issue function, reapplies service-role-only grants, and requests a PostgREST schema reload.

## Safety

The migration does not alter the paired issuance or atomic admission implementations, bounded request contract (`AAPL`, `5min`, 30 minutes), 60-second credential TTL, or the `377 / 57 / 320` policy. The readiness function remains `security invoker`, read-only, and inaccessible to public, anon, and authenticated roles.

## Historical Classification

`historical_issuance_rpc_name_mismatch_unproven`

The Action 589 readiness mismatch is confirmed. It does not establish the cause of the earlier Action 587 issuance failure because the historical issuance result was intentionally discarded and the Action 585 paired issuance RPC had separate evidence of PostgREST availability.

## Production Verification (2026-07-22)

`production_readiness_rpc_fix_verified_with_sanitized_blocker`

One authenticated, parameter-free GET to the canonical issuance-readiness route returned HTTP `200`. The route reached `ci_mca_readiness` through PostgREST successfully: authorization and lease tables/RLS, both issuance RPCs, signatures, service-role-only permissions, and transaction prerequisites all verified true. The issuance concurrency guard was clear.

The sole sanitized blocker was `environment_configuration_missing`. The service-role probe itself succeeded, so the unavailable required environment fact is the runtime deployment identity used to bind a future authorization, not the database credential. Because that identity is absent, the diagnostic correctly also reports response mapping as unavailable rather than constructing a detached binding.

Durable state remained zero before and after the route call:

| Store | Before | After |
| --- | ---: | ---: |
| Manual authorizations | 0 | 0 |
| Manual execution leases | 0 | 0 |
| Daily claims | 0 | 0 |
| Durable audit rows | 0 | 0 |
| Credit-ledger rows | 0 | 0 |

Daily usage remained `0 / 0`. Production readiness, global safe defaults, and schedule inactivity were verified. The canary stayed disabled, the kill switch stayed active, and no credential generation, durable write, claim, provider call, audit or ledger write, flag change, or schedule action occurred.
