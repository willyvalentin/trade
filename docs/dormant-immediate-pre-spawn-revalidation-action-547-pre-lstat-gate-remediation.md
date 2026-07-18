# Action 547 - Dormant Immediate Pre-Spawn Revalidation Pre-Lstat Gate Remediation

## Summary

Action 547 remediates the Action 546 blocked findings `A546-H1` and `A546-M1`.

The dormant server-only immediate pre-spawn revalidation wrapper now requires a closed Action 540-to-543 original-object handoff before deriving any path for filesystem inspection. A composition-looking object, clone, reconstruction, stale object, expired object, non-allowlisted path, unsafe nested shape, or authority-bearing object cannot trigger `lstat`.

The adapter remains dormant and non-authoritative. This action does not approve activation and does not execute a CLI, collect a CLI version, spawn a process, invoke an observer, access credentials, read environment values, use the network, consume authorization, activate API/UI/runner paths, interact with Avanza, mutate orders or positions, persist data, deploy, commit, push, or merge.

## Files Changed

- `lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter.ts`
- `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.ts`
- `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core.ts`
- `tests/e2e/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.spec.ts`

## A546-H1 Remediation

The production wrapper no longer reads `compositionAdapterResult.resolvedAbsolutePath` from a shallowly validated input.

The wrapper now:

1. calls `consumeOriginalDormantFirstLiveCompositionForImmediatePreSpawnRevalidation(input)`;
2. receives the bridge-captured internal production time;
3. returns a zero-filesystem-attempt blocked result when the bridge rejects;
4. calls `observeApprovedPathWithLstat` only with the bridge-returned `preLstatEligibility.approvedResolvedAbsolutePath`;
5. performs exactly one `lstat(path, { bigint: true })` after original-object provenance, full pre-lstat eligibility, freshness, authority, policy, platform, tool, session, path, fingerprint, and one-shot checks pass.

The bridge is implemented in the Action 540 server-only composition adapter. It uses module-local `WeakSet` provenance for original successful Action 540 composition results and a separate module-local `WeakSet` for one-shot consumption by the Action 543 revalidation boundary.

No `WeakSet`, generic verifier, `isTrusted` boolean, token, symbol, brand, reset, mint helper, or caller-reproducible signature is exported.

## A546-M1 Remediation

The focused wrapper-source harness now covers decisive zero-`lstat` negative cases for:

- plain reconstruction, spread clone, JSON clone, structured clone, copied fingerprint, copied metadata, synthetic pure-core composition result, and missing production provenance;
- arbitrary absolute path, relative path, non-allowlisted path, correct tool with wrong path, correct path with wrong tool, unsupported platform, policy/path mismatch, accessor-backed path, and inherited path;
- stale original evidence, expired original evidence, cross-session, cross-purpose, cross-boundary, mutated original, already consumed original, and concurrent duplicate calls;
- top-level and nested authority claims for filesystem, spawn, credential, runner, network, and trading authority;
- malformed primitives, nulls, arrays, unknown fields, filesystem failure after valid eligibility, symlink, directory, and exact large bigint `dev`/`ino` preservation.

The expanded focused suite now has 30 tests.

## Pre-Lstat Order

The production order is:

1. defensive unknown-input guard in the Action 540 bridge;
2. original Action 540 production provenance verification;
3. already-consumed check;
4. exact nested schema and authority validation through the pure pre-lstat eligibility helper;
5. session, purpose, tool, platform, policy, path, fingerprint, stale, and expiry validation using internal production time;
6. one-shot consumption of the original composition object;
7. exactly one `lstat(path, { bigint: true })`;
8. exact metadata comparison;
9. immutable private-production-provenance result construction only on success.

Failures before step 6 cause zero `lstat` and do not consume non-original inputs. Failures after step 6 remain terminal and cannot be retried with the same original object.

## Canonical Path Allowlist

The pure pre-lstat eligibility helper reuses the existing canonical allowlist validation:

- the path must be absolute;
- the path must already be normalized;
- null bytes, redundant traversal, and shell-like characters are rejected;
- the path must exactly match a source-controlled candidate for the exact reviewed tool;
- unsupported tools and mismatched tool/path combinations are rejected.

No PATH lookup, environment value, caller fallback, configuration file, normalization-to-approval, or broad directory search is introduced.

## Stale, Expiry, And Authority

Stale or expired Action 540 evidence is rejected before `lstat` using the bridge-captured production timestamp. The production wrapper and caller cannot supply time.

Authority-bearing top-level or nested composition evidence is rejected before `lstat`. The rejected authority families include filesystem, spawn, observer, credential, CLI execution, runner, authorization consumption, network, API, UI, trading, Avanza, order, position, settlement, persistence, and deployment.

## TOCTOU Limit

This remediation does not eliminate TOCTOU. A valid result remains point-in-time metadata evidence only. Any future spawn boundary must independently revalidate immediately before execution and remains separately unimplemented and unauthorized.

## Decision

Decision: `post_trade_dormant_server_only_immediate_pre_spawn_revalidation_adapter_pre_lstat_original_object_gate_remediated_ready_for_final_re_review`

Result status: `post_trade_dormant_server_only_immediate_pre_spawn_revalidation_adapter_action_547_remediation_completed_not_activated`

Recommended next action: Action 548 - Final Independent Re-Review of Dormant Immediate Pre-Spawn Revalidation Pre-Lstat Gate Remediation.
