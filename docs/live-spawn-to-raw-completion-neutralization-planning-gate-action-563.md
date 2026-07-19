# Action 563 - Live Spawn-to-Raw-Completion Neutralization Planning Gate

## Scope

Action 563 is a documentation, architecture, and approval-gate action only. It does not implement live neutralization, does not modify the direct-spawn adapter, does not modify the pure raw-completion contract, does not modify the pure Git-version parser, does not execute Git or any executable, and does not activate runtime, API, UI, runner, cron, observer, credential, network, Avanza, trading, order, position, settlement, persistence, or deployment behavior.

The purpose is to define the smallest future dormant server-only boundary that may consume one original production-valid direct-spawn result and emit a neutral, non-authoritative input compatible with the approved pure raw process completion evidence contract.

## Current Approved Chains

The approved live-side chain is:

```text
server-only live resolver
  -> dormant live composition
  -> immediate pre-spawn revalidation
  -> fixed dormant direct spawn
  -> original private spawn provenance
  -> immutable non-authoritative spawn lifecycle evidence
```

The approved pure-side chain is:

```text
pure raw process completion evidence contract
  -> pure Git-version interpretation contract
```

These chains are not connected. No neutralization adapter exists. Pure evidence cannot claim live process observation. No real Git version has entered the pure parser. No runtime caller exists. No downstream authority exists. `toctouEliminated` remains false.

## Neutralization Trust Problem

The future boundary must solve a narrow provenance translation problem without becoming a generic trust oracle. It must accept only the exact original production-valid `FixedReadOnlyDirectSpawnResult` object produced by the reviewed server-only direct-spawn boundary, verify private original-object provenance through a boundary-specific consume path, consume the object exactly once, and emit only neutral structural evidence for the pure raw-completion contract.

The future boundary must reject reconstruction, spread clones, JSON clones, structured clones, prototype-preserving clones, copied fingerprints, copied lifecycle fields, copied output, mutation, stale or expired evidence, cross-session, cross-purpose, cross-tool, cross-platform, cross-policy, cross-boundary evidence, authority-bearing evidence, and already consumed evidence.

The future boundary must not export a generic verifier, `WeakSet`, token, symbol, brand, reset function, minting helper, reusable trust oracle, serialized proof, or persisted evidence. It must not preserve private live provenance inside the neutral output.

## Eligible Source-State Comparison

| Option | Assessment | Decision |
| --- | --- | --- |
| A. Every terminal direct-spawn result category | Best long-term diagnostic coverage, but only safe if every direct-spawn terminal state carries exact output, lifecycle, termination, and timestamp facts needed by the pure raw contract. Requires careful state-by-state review. | Preferred implementation target if no evidence gaps are found. |
| B. Only ordinary successfully closed zero-exit results | Smallest Git-version path and easiest to verify. It excludes useful fail-closed diagnostics and risks adding later categories without the same review discipline. | Acceptable fallback if Action 564 finds direct-spawn evidence gaps. |
| C. Exact reviewed subset including failures required for diagnostics | Safer than generic mapping and less complete than A. Useful if some live source states lack exact pure-field evidence. | Acceptable only with an explicit unsupported-state list. |

Recommended mapping: support a complete deterministic terminal-state mapping only for source states with exact reviewed evidence. Unknown or underspecified live states must fail closed with a neutralizer-specific unsupported-state reason and must not be converted into `malformed_completion_evidence`.

## Exact Source-To-Target Mapping

Future mapping must be exact:

| Source | Target |
| --- | --- |
| direct-spawn adapter id `ture.execution.dormant-server-only-fixed-read-only-direct-spawn-adapter.server.v1` | pure `sourceSpawnContractId` |
| direct-spawn result version `1` | pure `sourceSpawnContractVersion:1` |
| direct-spawn result fingerprint | pure `sourceSpawnFingerprint` linkage |
| accepted revalidation result/evidence/observation fingerprints | neutralizer evidence linkage and downstream fingerprint inputs |
| boundary session id | pure `boundarySessionId` |
| purpose `first_live_read_only_staging_preflight` | pure `purpose` |
| tool `git` | pure `toolIdentity:"git"` |
| platform `macos` | pure `platform:"macos"` |
| executable `/usr/bin/git` | pure `canonicalExecutablePath:"/usr/bin/git"` |
| argv `["--version"]` | pure `fixedArgvIdentity:"git_version_argv_v1"` and exact argv |
| process attempted/started/exited/spawn error | pure spawn/process state fields |
| exit code and signal | pure exit/signal/close fields |
| terminal reason and lifecycle state | pure completion category, reason, lifecycle, and event-order fields |
| stdout/stderr byte counts and retained UTF-8 text | pure stdout/stderr counts and text fields |
| overflow, encoding, stream error, unexpected chunk facts | pure terminal error and retention fields |
| child termination request facts | pure termination and death-confirmation fields |
| retry/fallback facts | pure `retryCount:0` and `fallbackAttempted:false` |
| security posture | pure false fields for shell, PATH, inherited environment, credentials, network, observer authority, CLI interpretation, authorization consumption, runtime activation |
| TOCTOU posture | pure `toctouEliminated:false` |
| authority posture | pure `authority:"none"` |

Every mapping must be fingerprint-bound. Any mismatch, contradiction, missing field, unsupported category, copied object, or authority claim must block neutralization.

## Raw-Output Transfer Model

The pure raw-completion contract uses canonical UTF-8 text only, with stdout max 16 KiB, stderr max 16 KiB, and combined max 32 KiB. The direct-spawn result currently records stdout/stderr byte counts, decoded text when valid, invalid-encoding flags, binary-output flags, stream errors, unexpected chunks, and overflow flags.

Future neutralization may transfer retained stdout/stderr text only when byte counts match the exact UTF-8 byte length, no invalid encoding is present, no binary output is present, and output-limit rules are satisfied. Overflow and invalid-encoding categories must not retain output text beyond the pure contract's retention restrictions. The neutralizer must not normalize, trim, parse Git output, repair encoding, or log output.

If Action 564 discovers that a direct-spawn terminal state lacks enough exact data to populate a valid pure category, that state must be unsupported rather than reconstructed.

## Time Model

The future boundary should copy approved source timestamps such as the direct-spawn `evaluatedAt` value and source lifecycle timestamps where present, then capture its own internal server-only neutralization timestamp. Callers must not supply production time.

Timestamps are evidence only. They do not refresh stale source evidence, do not extend expiry, and do not create execution authority. Neutralization must validate freshness before consumption and bind source timestamps plus neutralization timestamp into the neutralizer result fingerprint and the pure raw input fingerprint.

## Provenance Bridge Comparison

| Option | Assessment | Decision |
| --- | --- | --- |
| A. Direct-spawn server-only module exposes a boundary-specific consume operation for raw-completion neutralization | Preserves private original-object provenance and one-shot semantics while keeping the neutralizer separate from spawn. Matches existing original-object bridge style. | Recommended. |
| B. Closed server-only neutralization module imports a narrowly scoped private consumer callback | Similar safety if the callback cannot be reused. More coupling and harder to audit if callback shape is generic. | Secondary option. |
| C. Closed orchestration module owns direct-spawn completion and neutralization in one call | Strong provenance but couples process creation and neutralization, making dormant review and rollback harder. | Defer. |
| D. Generic exported `isTrustedSpawnResult(...)` verifier | Becomes a reusable trust oracle and invites replay. | Reject. |
| E. Exported token, symbol, brand, hash, or signature | Leaks minting or copying semantics across boundaries. | Reject. |
| F. Serialized or persisted spawn evidence | Cannot prove original-object provenance and introduces replay/storage risks. | Reject. |

Recommended bridge: A. Add a boundary-specific server-only consume operation on the direct-spawn module for exactly one neutralization purpose.

## Neutral Output Classification

The approved pure raw-completion contract currently supports `provenanceClassification:"fixture_synthetic"` and `fixtureLiveClassification:"fixture_only_not_live_observation"`. Action 563 does not widen that contract.

The future neutralized output must therefore be classified as fixture-compatible neutral structural evidence. It must set `observedLiveProcess:false`, carry no private live marker, grant no authority, and remain incapable of proving by itself that a process ran live. Private live provenance must stay outside the pure evidence object.

## Git-Parser Separation

The pure Git parser accepts only approved pure raw-completion evidence. Neutralization must not parse output. Successful neutralization must not imply parser acceptance. Parser acceptance must not imply live provenance, runtime compatibility, deployment, or authorization. Raw completion and interpretation fingerprints must preserve source linkage while keeping live provenance outside pure evidence objects.

## Recommended Next Action

Action 564 - Implement Dormant Server-Only Spawn-to-Raw-Completion Neutralization Adapter

This is the smallest safe next action. It should implement the boundary-specific original-object consume bridge and pure-compatible neutral mapping, while remaining dormant, server-only, test-only reachable, non-authoritative, and separate from Git parsing and runtime activation.

## Mandatory Implementation Constraints

Any future implementation must require `import "server-only";` as the first effective import, consume only an original production-valid spawn object, use a boundary-specific private consume bridge, consume before neutralization, avoid generic verifiers and serialization, reject caller policy/path/output/lifecycle/time injection, avoid process creation, process observation, process handles, termination action, Git parsing, runtime wiring, credentials, network, Avanza, trading, persistence, and deployment behavior.

The output must be deeply frozen, exact-state mapped, timestamp-linked, fingerprint-bound, `observedLiveProcess:false`, `authority:"none"`, and `toctouEliminated:false`.

## Mandatory Review Gates

1. Focused implementation tests.
2. Server-only import review.
3. Production API closure review.
4. Original-object provenance review.
5. One-shot, replay, and concurrency review.
6. Source-state eligibility review.
7. Source-to-target mapping review.
8. Raw-output byte and UTF-8 review.
9. Timestamp and freshness review.
10. Authority and provenance-classification review.
11. Fingerprint linkage review.
12. Pure-contract compatibility review.
13. Git-parser separation review.
14. Export-surface review.
15. Runtime-reachability review.
16. Prohibited-operation review.
17. Independent static security review.
18. Remediation and final re-review if findings exist.
19. Separate approval before parser orchestration.
20. Separate approval before runtime activation.
21. Separate approval before deployment.

## Explicit Non-Authorizations

Action 563 does not authorize live neutralization implementation, process creation, process observation, process handles, Git parsing, Git version collection, observer/spawn/credential/runner activation, runtime/API/UI/cron wiring, credentials, network, Avanza, trading, order, position, settlement, persistence, deployment, commit, push, merge, or production readiness.

## Commit And Deploy

No deploy is recommended for Action 563. No commit, push, merge, or deployment was authorized for this action.

## Decision

Decision: `post_trade_live_spawn_to_raw_completion_neutralization_boundary_plan_ready`

Result status: `post_trade_live_spawn_to_raw_completion_neutralization_action_563_planning_gate_completed`
