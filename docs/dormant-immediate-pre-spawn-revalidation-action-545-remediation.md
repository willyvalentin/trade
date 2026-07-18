# Action 545 - Dormant Immediate Pre-Spawn Revalidation Remediation

## Summary

Action 545 remediated the six blocking findings from the Action 544 static/security review of the dormant server-only immediate pre-spawn revalidation adapter.

The adapter remains dormant and non-authoritative. It does not execute a CLI, collect a CLI version, spawn a process, invoke an observer, access credentials, read environment values, use the network, consume authorization, activate API/UI/runner paths, interact with Avanza, mutate orders or positions, persist data, deploy, commit, push, or merge.

Action 544 remains historically blocked. Action 545 records remediation readiness for an independent re-review only.

## Files Changed

- `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.ts`
- `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core.ts`
- `tests/e2e/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.spec.ts`
- `docs/dormant-immediate-pre-spawn-revalidation-action-545-remediation.md`
- `docs/dormant-immediate-pre-spawn-revalidation-action-545-checkpoint.md`
- `docs/ture-agent-dev-chat-3-continuation-summary.md`

## Finding Remediation

### A544-H1 - Production Provenance

Pure-core output now carries explicit non-production provenance:

- `observationSource`
- `observationFingerprint`
- `productionLiveRevalidationProvenance: "none"`

The server-only wrapper is the only path that can reconstruct a successful result with `productionLiveRevalidationProvenance: "server_only_private_original_object"`. The wrapper uses module-local `WeakSet` provenance for successful production results/evidence. The WeakSets are not exported, and no generic production provenance verifier is exported.

Pure synthetic comparison remains useful for deterministic tests, but it is explicitly non-live and not production provenance.

### A544-H2 - Trusted Time

The production API no longer accepts `evaluatedAt`.

The production wrapper captures exactly one internal timestamp with `new Date().toISOString()` after input-shape validation and before one-shot consumption and `lstat`. Callers cannot move time backward or forward through the production API.

Pure-core tests may still use deterministic `evaluatedAt` as a non-production seam.

Production ordering:

1. validate production input shape;
2. capture internal evaluation timestamp;
3. check and consume original composition object;
4. perform exactly one `lstat`;
5. compare exact metadata;
6. return immutable non-authoritative evidence.

### A544-H3 - Device and Inode Precision

The production wrapper now calls:

`lstat(path, { bigint: true })`

`stats.dev` and `stats.ino` are retained as exact canonical decimal strings through `bigint.toString(10)`. They are never converted through `Number`.

The core metadata validator rejects malformed, signed, padded, decimal, exponent, empty, and other non-canonical device/inode representations. The focused tests include adjacent values above `Number.MAX_SAFE_INTEGER`.

Size, mode, and mtime are converted through a safe bigint-to-number helper and fail metadata validation if they cannot be represented as finite nonnegative safe integers.

### A544-M1 - Structured Fail Closed

The server wrapper now defensively validates unknown inputs before dereferencing nested properties.

It rejects:

- null;
- primitives;
- arrays;
- unexpected keys;
- accessor properties;
- exotic prototypes;
- symbol-bearing objects;
- malformed nested composition objects;
- missing resolved paths.

Malformed input returns a deterministic blocked result and does not reach `lstat`.

### A544-M2 - One-Shot and Replay

The wrapper uses module-local original-object identity tracking:

`CONSUMED_COMPOSITION_RESULTS = new WeakSet<object>()`

The original composition result is consumed before awaiting `lstat`, so success and failure both consume the one attempt. The same original object cannot initiate a second production revalidation. Clones do not inherit original-object validity. No reset, delete, replay token, or production test reset API is exported.

Result inspection remains repeatable. Future spawn consumption remains separately unimplemented and unauthorized.

### A544-M3 - Test Coverage

The focused suite expanded from 15 to 22 tests. New coverage includes:

- canonical device/inode validation;
- production API closure over time, filesystem, path, policy, metadata, and dependency injection;
- bigint `dev`/`ino` preservation without number coercion;
- private one-shot WeakSet ordering before awaited filesystem inspection;
- synthetic pure-core output remaining non-production provenance;
- test-only execution of the actual wrapper source with controlled `lstat` success and failure paths.

The wrapper execution harness is test-only: it transpiles the wrapper source, strips `server-only` for the test process, and injects controlled `lstat` and fixed time only inside the evaluated test harness. The production wrapper exposes no filesystem, clock, policy, path, or dependency-injection seam.

## TOCTOU Limits

The adapter still does not eliminate TOCTOU. Revalidation evidence remains point-in-time metadata only. A future spawn boundary must independently revalidate immediately before any execution attempt and remains separately unauthorized.

## Absent Authorities

The result grants no filesystem authority, spawn authority, observer authority, credential authority, CLI-execution authority, authorization-consumption authority, runner/API/UI/network authority, trading/Avanza/order/position/settlement authority, persistence authority, or deployment authority.

## Decision

Decision: `post_trade_dormant_server_only_immediate_pre_spawn_revalidation_adapter_action_544_findings_remediated_ready_for_re_review`

Result status: `post_trade_dormant_server_only_immediate_pre_spawn_revalidation_adapter_action_545_remediation_completed_not_activated`

Recommended next action: Action 546 - Independent Re-Review of Dormant Immediate Pre-Spawn Revalidation Adapter Remediation.
