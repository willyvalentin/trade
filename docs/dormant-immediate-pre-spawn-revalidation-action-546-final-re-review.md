# Action 546 - Final Re-Review of Dormant Immediate Pre-Spawn Revalidation Remediation

## Executive Summary

Action 546 independently re-reviewed the Action 543 dormant server-only immediate pre-spawn revalidation adapter as remediated by Action 545, together with the Action 544 blocked review.

The re-review is blocked. Action 545 remediated several important issues, including production time injection, exact bigint device/inode representation, explicit synthetic-vs-production evidence fields, private one-shot tracking, and expanded focused tests. However, the production wrapper still performs `lstat` after only shallow wrapper input validation. A forged composition-looking object with a caller-selected absolute `resolvedAbsolutePath` can reach the one live filesystem primitive before the pure core rejects the object as cloned, malformed, expired, non-allowlisted, or otherwise unsafe.

Approval is not recorded. The adapter remains dormant and must not be activated or consumed by a future spawn boundary before remediation and another independent re-review.

## Artifacts Reviewed

- `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.ts`
- `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core.ts`
- `tests/e2e/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.spec.ts`
- `docs/dormant-server-only-immediate-pre-spawn-revalidation-adapter-action-543.md`
- `docs/dormant-server-only-immediate-pre-spawn-revalidation-action-543-checkpoint.md`
- `docs/dormant-server-only-immediate-pre-spawn-revalidation-action-544-static-security-review.md`
- `docs/dormant-server-only-immediate-pre-spawn-revalidation-action-544-checkpoint.md`
- `docs/dormant-immediate-pre-spawn-revalidation-action-545-remediation.md`
- `docs/dormant-immediate-pre-spawn-revalidation-action-545-checkpoint.md`
- `docs/ture-agent-dev-chat-3-continuation-summary.md`
- Resolver, dormant composition, pure composition, Action 533 cross-boundary, observer, spawn, credential, CLI, authorization, and execution-boundary contracts and tests.

## Findings

| ID | Severity | Evidence | Finding | Scenario | Required Remediation | Approval Impact |
| --- | --- | --- | --- | --- | --- | --- |
| A546-H1 | High | `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.ts:25-33`, `:96-103`; core validation only runs after `lstat` at `:34-41` | The production wrapper performs `lstat` after shallow input-shape validation. `validateProductionInputShape` accepts any plain nested object with a string `resolvedAbsolutePath`, then `observeApprovedPathWithLstat` calls `lstat` on that value before the pure core validates frozen original-object shape, result fingerprints, evidence freshness, policy allowlist, tool, session, purpose, and authority posture. | A forged input such as `{ compositionAdapterResult: { resolvedAbsolutePath: "/etc/passwd" } }` is rejected eventually, but only after one caller-selected filesystem metadata lookup. A cloned, stale, expired, non-allowlisted, or mutated composition object can also trigger one `lstat` before being blocked. This violates the source-controlled path and exact original composition object boundary. | Add a pre-filesystem production gate that rejects anything except the exact reviewed original Action 540 composition object before `lstat`: frozen object, safe shape, fingerprint validity, ready status, fresh evidence under internally captured time, tool/platform/session/purpose/policy linkage, source-controlled allowlisted path, and no authority claims. Tests must prove forged path, clone, stale/expired, non-allowlisted, authority-bearing, and malformed inputs produce zero `lstat`. | Blocks approval. |
| A546-M1 | Medium | `tests/e2e/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.spec.ts:489-540` | The wrapper-source harness verifies valid success, malformed top-level zero-`lstat`, filesystem failure no retry, and second invocation no extra `lstat`, but it does not cover forged/cloned/stale/expired/non-allowlisted nested composition inputs reaching zero `lstat`. | The test suite can pass while the wrapper still performs one live filesystem metadata call for unsafe nested inputs. | Add wrapper-source harness negative tests for forged path, cloned result, expired result, stale evidence, non-allowlisted path, authority-bearing result, and malformed nested composition object, all asserting zero `lstat`. | Blocks approval until paired with A546-H1 remediation. |

## A544 Finding Verdicts

- `A544-H1`: Partially remediated, still blocked by A546-H1. Synthetic pure-core output is now explicitly non-production, and private server wrapper provenance is module-local. However, production provenance can still be reached after a shallow wrapper gate that allows caller-selected `lstat` before full original-object validation.
- `A544-H2`: Remediated for production API surface. The production wrapper no longer accepts `evaluatedAt`, `clock`, timestamp, or time injection and captures internal time once per attempt. Blocked indirectly because stale/expired evidence is only rejected after `lstat`.
- `A544-H3`: Remediated. Production uses `lstat(path, { bigint: true })`, preserves `dev` and `ino` as exact canonical decimal strings, and the core rejects non-canonical device/inode strings.
- `A544-M1`: Partially remediated, still blocked by A546-H1. Top-level malformed input is structured fail-closed with zero `lstat`, but malformed or forged nested composition data can reach `lstat`.
- `A544-M2`: Partially remediated. One-shot consumption occurs before awaited `lstat`, so success/failure consume the original object attempt. The issue is that unsafe objects can also be consumed and `lstat`ed before full validation.
- `A544-M3`: Partially remediated. The focused suite now includes a test-only wrapper-source harness, but missing unsafe nested-input zero-`lstat` cases leave the main production-gate issue uncovered.

## Review Verdicts

### Server-Only

Partially approved. `import "server-only";` is the first effective import, only the wrapper imports `node:fs/promises`, the pure core remains filesystem-free, and no API/UI/runner/observer/spawn/credential/trading path imports the adapter.

### Production API

Blocked. The exported input type exposes only `compositionAdapterResult`, with no clock/filesystem/path/policy/metadata/dependency injection fields. Runtime validation is still too shallow before `lstat`.

### Provenance

Blocked pending production-gate remediation. Private `WeakSet` provenance is module-local and not exported, and pure-core results remain non-production. The problem is not the final provenance marker; it is that production can perform the live filesystem primitive before proving the input is the exact eligible original composition object.

### Trusted Time

Partially approved. The production caller cannot supply time. Stale/expired evidence still needs to be rejected before `lstat` using the internally captured time.

### Precision

Approved. Device and inode precision uses bigint-backed canonical decimal strings, and static review found no conversion of `stats.dev` or `stats.ino` through `Number`.

### Fail Closed

Blocked. Top-level malformed input is fail-closed, but forged nested composition data can trigger one `lstat` before structured core rejection.

### One-Shot

Partially approved. Consumption occurs before `lstat`, and second invocation on the same original object performs no additional `lstat`. Full approval requires pre-filesystem eligibility validation so an unsafe object cannot spend the single live attempt.

### Wrapper Tests

Blocked. The wrapper-source harness is meaningful for valid success and basic failure, but it does not cover the decisive unsafe nested-input zero-`lstat` cases.

### Filesystem And Comparison

Blocked. Exactly one `lstat(path, { bigint: true })` exists for the first wrapper path, and comparison covers the required fields in the pure core. The wrapper must prove path allowlist and original-object validity before that one `lstat`.

### Authority And TOCTOU

Approved for current dormancy. Output remains deeply frozen, evidence-only, non-authoritative, and `toctouEliminated: false`. No process is spawned, no file descriptor is retained, and future spawn consumption remains separately blocked.

## Security Assertions

No executable was run. No CLI version was collected. No process was spawned. No shell was used. No credentials, environment values, cookies, sessions, BankID, Avanza state, network resources, database resources, persistence, API/UI/runner paths, observer paths, spawn paths, order behavior, position behavior, settlement retrieval, commit, push, merge, PR, or deployment was activated.

## Decision

Decision: `post_trade_dormant_server_only_immediate_pre_spawn_revalidation_adapter_final_security_review_blocked_pending_pre_lstat_original_object_gate`

Result status: `post_trade_dormant_server_only_immediate_pre_spawn_revalidation_adapter_action_546_final_re_review_completed_blocked`

Recommended next action: Action 547 - Remediate Dormant Immediate Pre-Spawn Revalidation Pre-Lstat Original-Object Gate No Activation.
