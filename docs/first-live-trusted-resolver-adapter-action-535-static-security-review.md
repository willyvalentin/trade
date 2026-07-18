# Action 535 - First Live Trusted Resolver Adapter Static Security Review

## Executive Summary

Action 535 reviewed the uncommitted Action 534 live trusted resolver adapter as dormant server-only infrastructure for a future read-only staging preflight. The implementation remains non-executing and no API, UI, runner, observer, spawn, credential, browser, Avanza, order, position, settlement, network, environment, or process-execution path was activated.

The review is blocked pending corrections. Two high-severity contract findings prevent approval: the live filesystem core is directly importable without the `server-only` guard, and the exported resolver contract accepts injected policy/filesystem inputs that can represent caller-controlled candidate paths and filesystem behavior despite policy fields claiming source-controlled-only operation.

## Scope Reviewed

- `lib/post-trade-first-live-trusted-resolver-adapter-core.ts`
- `lib/post-trade-first-live-trusted-resolver-adapter.ts`
- `tests/e2e/post-trade-first-live-trusted-resolver-adapter.spec.ts`
- `docs/first-live-trusted-resolver-adapter-action-534.md`
- `docs/first-live-trusted-resolver-adapter-action-534-checkpoint.md`
- `docs/ture-agent-dev-chat-3-continuation-summary.md`
- Existing trusted resolver fixture contract and Action 533 cross-boundary integration review

## Positive Review Results

- The live adapter identity is distinct from the fixture resolver identity.
- Result and evidence fields remain non-authoritative: no process start, no runner enablement, no credential access, no authorization consumption, no shell use, and no process spawn.
- Capability request validation reuses the reviewed fixture resolver request/session checks and rejects malformed, expired, cloned, mutated, wrong-purpose, and cross-boundary test inputs.
- The default policy is frozen, versioned, deterministic, macOS-only, and limits supported tool identities to `git` and `supabase_cli`.
- Filesystem inspection is bounded to `lstat` semantics in the current implementation; no executable execution or version collection exists.
- Symlinks, directories, non-regular files, missing files, non-executable files, unsupported platforms, and duplicate acceptable candidates fail closed in the focused suite.
- The Action 533 cross-boundary suite remains fixture-only and does not activate the live adapter.
- Static reachability review found no API, UI, runner, observer, spawn, or credential boundary import of the live adapter.

## Findings

| ID | Severity | File / Symbol | Finding | Exploit or Failure Scenario | Required Remediation | Blocks Approval |
| --- | --- | --- | --- | --- | --- | --- |
| A535-H1 | High | `lib/post-trade-first-live-trusted-resolver-adapter-core.ts:1-2`, `lib/post-trade-first-live-trusted-resolver-adapter.ts:1-3`, `tests/e2e/post-trade-first-live-trusted-resolver-adapter.spec.ts:6-12` | The core module imports live filesystem primitives but does not carry the `server-only` marker. The server-only wrapper exports it, but callers can import the core directly, as the focused tests already do. | A future client/shared import could bypass the intended server-only wrapper and pull a live filesystem-capable boundary into an unsafe dependency graph. | Move live filesystem access behind the server-only boundary or add a server-only live module and split pure/test helpers into a separate non-live module. Static tests should assert no application/client import can reach the live filesystem module except through a server-only boundary. | Yes |
| A535-H2 | High | `lib/post-trade-first-live-trusted-resolver-adapter-core.ts:160-167`, `lib/post-trade-first-live-trusted-resolver-adapter-core.ts:173-201`, `lib/post-trade-first-live-trusted-resolver-adapter-core.ts:227-231`, `tests/e2e/post-trade-first-live-trusted-resolver-adapter.spec.ts:55-67` | The exported resolver input accepts `policy` and `filesystem` overrides, and the exported policy builder accepts arbitrary candidate policies while still marking the result `sourceControlled: true` and `allowCallerCandidatePaths: false`. | A caller with module access can construct a self-fingerprinted policy pointing at an arbitrary absolute candidate path and provide an alternate filesystem adapter, weakening the source-controlled-policy-only guarantee. | Make the production resolver use only an internal frozen source-controlled policy and internal filesystem primitive. Any test-only policy/filesystem injection must be isolated behind explicit test-only exports that cannot be confused with the production adapter and must not produce source-controlled live evidence. | Yes |
| A535-I1 | Informational | `lib/post-trade-first-live-trusted-resolver-adapter-core.ts:119-126`, `lib/post-trade-first-live-trusted-resolver-adapter-core.ts:309-336` | Metadata is useful for future revalidation and correctly does not claim TOCTOU elimination. | Future spawn work must revalidate path, device, inode, mode, size, and timestamps immediately before any separately reviewed execution. | Preserve the current TOCTOU caveat and require future spawn-side revalidation. | No |

## Review Questions Outcome

- Identity and authority: mostly pass; blocked only by import boundary exposure in A535-H1.
- Capability verification: pass for request/session provenance in current tests; no approval until the production entry point is isolated from injected policy/filesystem overrides.
- Source-controlled policy: blocked by A535-H2.
- Filesystem safety: current reachable implementation uses `lstat` only, but approval blocked until server-only reachability and source-controlled policy isolation are corrected.
- TOCTOU and metadata claims: pass with residual future-spawn revalidation requirement.
- Platform behavior: pass; unsupported platforms fail closed.
- Immutability and determinism: policy/result/evidence are frozen; approval blocked by caller-injectable policy construction.
- Reachability: no API/UI/runner/observer/spawn/credential import found; core import remains an unsafe export boundary.
- Static forbidden operations: no reachable process, network, env, credential, Keychain, Supabase, persistence, API/UI, trade, order, or position behavior found in the reviewed live resolver modules.
- Tests: the 9 focused tests are meaningful, but they depend on the same injected policy/filesystem surface that creates A535-H2. Future remediation should preserve machine-independent testing without exposing arbitrary live policy injection through the production resolver contract.

## Explicit Non-Authorization

This review does not authorize process spawn, CLI execution, version collection, credential access, environment reads, network access, observer activation, runner activation, API/UI activation, Avanza interaction, order behavior, position behavior, settlement behavior, deployment, or any future live adapter activation.

## Decision

`post_trade_first_live_trusted_resolver_adapter_static_security_review_blocked_pending_corrections`

## Result Status

`post_trade_first_live_trusted_resolver_adapter_static_security_review_completed_blocked`

## Recommended Remediation Action

Action 535R - Correct first live trusted resolver server-only and source-controlled policy contract blockers, with no execution and no runtime activation.
