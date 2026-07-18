# Action 544 - Static Security and Contract Review of Dormant Immediate Pre-Spawn Revalidation Adapter

## Executive Summary

Action 544 reviewed the uncommitted Action 543 dormant server-only immediate pre-spawn revalidation adapter. The adapter remains dormant and is not wired into API, UI, runner, observer, spawn, credential, trading, Avanza, persistence, deployment, or production execution paths.

The review is blocked pending corrections. The server-only wrapper is narrow and the only production module that imports `lstat`, but the current contract does not yet prove safe retention as infrastructure for a future spawn boundary because successful revalidation evidence can be synthesized by the pure core without server-only provenance, caller-controlled `evaluatedAt` can make expired evidence appear fresh, and default numeric `lstat` metadata can lose precision for device and inode identifiers.

Approval is not recorded.

## Artifacts Reviewed

- `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.ts`
- `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core.ts`
- `tests/e2e/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.spec.ts`
- `docs/dormant-server-only-immediate-pre-spawn-revalidation-adapter-action-543.md`
- `docs/dormant-server-only-immediate-pre-spawn-revalidation-action-543-checkpoint.md`
- `docs/ture-agent-dev-chat-3-continuation-summary.md`
- First-live trusted resolver adapter and core
- Dormant server-only first-live composition adapter and core
- Pure staging-preflight composition contract
- Resolver, composition, Action 540, Action 533, observer, spawn, credential, CLI, authorization, execution-boundary, and lifecycle test suites
- Action 534-542 documentation and checkpoints

## Findings

| ID | Severity | Evidence | Finding | Scenario | Required Remediation | Blocks Approval |
| --- | --- | --- | --- | --- | --- | --- |
| A544-H1 | High | `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core.ts:124`, `:251`, `:394`; `tests/e2e/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.spec.ts:174` | The pure core can return `status: "revalidated_non_authoritative_evidence"` and `immediateRevalidationOccurred: true` from `test_synthetic_lstat`. The final evidence does not bind `observationSource`, a server-only private provenance marker, or an observation fingerprint, so a synthetic pure-core success is not distinguishable from production `lstat` evidence. | A future spawn boundary could accidentally consume a pure-core synthetic result as if live server-only revalidation occurred. The current result is non-authoritative, but the boundary is intended to become a trust input for later spawn work. | Add a server-only provenance distinction for production `lstat` results or split pure-core output so synthetic observations cannot claim actual revalidation occurred. Bind observation source/fingerprint and reject synthetic observations in any production-valid success path. Add regression tests. | Yes |
| A544-H2 | High | `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.ts:14`, `:21`, `:35`; `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core.ts:251`, `:284` | Production accepts caller-supplied `evaluatedAt` and passes it into expiry validation. A caller can move evaluation backward and cause evidence that is expired relative to real execution time to validate as fresh. | Stale composition evidence can be revalidated by choosing an old timestamp. No authority is granted today, but this can undermine freshness before a future spawn boundary. | Remove caller-controlled production time or require a reviewed trusted time provider. Tests may keep deterministic injected time through a non-production seam. Add stale-evidence regression tests proving backward time cannot refresh evidence. | Yes |
| A544-H3 | High | `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.ts:43`, `:66`, `:67`; resolver precedent at `lib/post-trade-first-live-trusted-resolver-adapter.ts:53`, `:56`, `:57` | `lstat` is called without bigint metadata. `stats.dev` and `stats.ino` are converted from JavaScript numbers to strings, which can lose precision for large filesystem identifiers. The approval criteria require that bigint/number conversion cannot truncate device or inode identity. | Two different filesystem objects with large identifiers could compare equal after numeric precision loss. That would weaken the exact metadata comparison. | Use bigint stat metadata where supported, or fail closed if device/inode cannot be represented exactly. Align resolver and revalidation metadata representation and add precision regression tests. | Yes |
| A544-M1 | Medium | `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.ts:19`, `:20` | The production wrapper dereferences `input.compositionAdapterResult` before shape validation. Malformed JavaScript callers can throw before a deterministic fail-closed result is constructed. | A malformed runtime call can escape the structured blocking-reason contract. It does not grant authority or perform `lstat`, but it weakens deterministic fail-closed behavior. | Guard wrapper input before dereference and return the pure core blocked result without filesystem access. Add malformed-wrapper tests. | Yes |
| A544-M2 | Medium | `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core.ts:251`; docs at `docs/dormant-server-only-immediate-pre-spawn-revalidation-adapter-action-543.md:87` | One-shot/replay semantics are documented but not enforced with private consumption state. The same initial composition result can be revalidated repeatedly, and the same result object has no consumption marker. | Repeated revalidation is non-authoritative today, but a future spawn boundary needs an explicit single-use consumption boundary to prevent replay from becoming permission. | Defer consumption to the future spawn boundary only if explicitly modeled and tested, or add private one-shot provenance before spawn work begins. | Yes |
| A544-M3 | Medium | `tests/e2e/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.spec.ts:162`, `:174`, `:231`, `:398` | The 15 tests cover the pure core and static wrapper shape, but do not execute the server-only wrapper with controlled/mocked `lstat`. They do not prove runtime wrapper behavior for malformed input, single-attempt behavior under real wrapper control, or server-only provenance separation. | Static tests can miss wrapper-specific behavior such as pre-validation throws or future accidental second `lstat` attempts. | Add controlled wrapper tests with a safe module mock or other reviewed non-production harness. | Yes |

## Server-Only Verdict

Partially approved. The wrapper has `import "server-only";` as the first effective import and is the only reviewed module importing `node:fs/promises`. No API, UI, runner, observer, spawn, credential, or trading path imports the adapter.

Blocked because production-valid live revalidation evidence is not distinguished from pure synthetic evidence.

## Production API Verdict

Blocked. The production API is mostly closed to caller path, path list, policy, filesystem, metadata, arbitrary tool, arbitrary platform, and dependency injection. However, `evaluatedAt` remains caller-controlled and can weaken freshness, and malformed inputs can throw before structured fail-closed handling.

## Initial Evidence Verdict

Blocked. The core validates the dormant composition result identity, status, fingerprints, canonical evidence set, session/tool/platform/purpose linkage, policy linkage, and authority posture. It rejects common clones because frozen object state and fingerprints are checked.

The remaining issue is that the revalidation output does not retain a server-only provenance distinction, making pure-core synthetic success indistinguishable downstream.

## Path And Policy Verdict

Approved with no blocking path-policy finding. The path is derived from approved composition evidence and checked against the first-live resolver policy allowlist. Relative, normalized, traversal, metacharacter, and non-allowlisted paths fail closed.

## Filesystem Operation Verdict

Approved with one dependency on remediation. Static review found one `lstat` call in the server-only wrapper, no module-import-time `lstat`, no `stat`, `realpath`, `readFile`, `readdir`, writes, shell, process spawn, network, timers, signals, or fallback calls.

The wrapper still needs malformed-input fail-closed handling and wrapper-level tests.

## Metadata Comparison Verdict

Blocked. Exact comparisons exist for path, device ID, inode, size, mode, and modified time, with finite nonnegative numeric checks for numeric fields. The current metadata source still uses number-based `lstat` for device and inode, so precision loss has not been ruled out.

## Regular File And Symlink Verdict

Approved. `lstat` distinguishes symlinks before regular-file classification. Symlink, directory, missing, socket, FIFO, block device, character device, unknown, and filesystem-error observations fail closed.

## Authority Verdict

Approved for current dormancy, blocked for future consumption. Output fields remain `none` or `false`, and no process, shell, observer, credential, runner, API, UI, trading, Avanza, persistence, or deployment authority is granted. A future spawn boundary must not consume revalidation output until the provenance and replay issues are remediated.

## TOCTOU Verdict

Approved for honesty of documentation. The adapter and docs state `toctouEliminated: false`, recognize point-in-time metadata, do not open or retain file descriptors, and do not claim permanent integrity.

## Replay And One-Shot Verdict

Blocked. Retry count and attempt fields are structurally validated, but repeated revalidation and result replay are not prevented with private state. This can be deferred only with an explicit future single-use consumption contract; Action 543 does not yet include that contract.

## Test-Seam Verdict

Blocked. The pure-core synthetic seam is useful, but it can emit success evidence that is indistinguishable from production server-only evidence. Wrapper behavior is not executed under controlled tests.

## Export Surface And Reachability

Static reachability review found no imports of `post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter` outside the new adapter files and focused tests. No route, client component, API handler, runner, cron, observer, spawn, credential, CLI, authorization, trading, or Avanza module imports it.

## Prohibited Operations

No prohibited operation was found in the reviewed production modules. The only approved live primitive is server-only `lstat`. Deterministic `JSON.stringify` appears only for canonical fingerprint construction.

No executable was run. No CLI version was collected. No process was spawned. No shell was used. No credentials or environment values were read. No network request occurred. No observer, spawn, credential, API, UI, runner, cron, browser, Avanza, order, position, settlement, persistence, or deployment behavior was activated.

## Decision

Decision: `post_trade_dormant_server_only_immediate_pre_spawn_revalidation_adapter_static_security_review_blocked_pending_remediation`

Result status: `post_trade_dormant_server_only_immediate_pre_spawn_revalidation_adapter_action_544_review_completed_blocked`

Recommended next action: Action 545 - Remediate Dormant Immediate Pre-Spawn Revalidation Provenance, Time, and Metadata Precision No Activation.
