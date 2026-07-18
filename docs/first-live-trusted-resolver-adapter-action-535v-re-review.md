# Action 535V - Independent Re-Review of First Live Trusted Resolver Remediation

## Executive Summary

Action 535V independently reviewed the complete uncommitted Action 534, Action 535, and Action 535R package. The review verified that `A535-H1` is closed: live filesystem access is now isolated in the `server-only` adapter module and the core has no filesystem import or runtime filesystem side effect.

The review is blocked because `A535-H2` is only partially remediated. Production resolution no longer accepts injected policy, filesystem, candidate path, or dependency objects, and the generic source-controlled policy builder was removed. However, the pure core still exports a synthetic observation builder and evaluator that can construct an observation marked `server_only_lstat` and produce successful evidence with `observedLiveFilesystem: true` without passing through the server-only `lstat` adapter.

## Scope Reviewed

- `lib/post-trade-first-live-trusted-resolver-adapter-core.ts`
- `lib/post-trade-first-live-trusted-resolver-adapter.ts`
- `tests/e2e/post-trade-first-live-trusted-resolver-adapter.spec.ts`
- `docs/first-live-trusted-resolver-adapter-action-534.md`
- `docs/first-live-trusted-resolver-adapter-action-534-checkpoint.md`
- `docs/first-live-trusted-resolver-adapter-action-535-static-security-review.md`
- `docs/first-live-trusted-resolver-adapter-action-535-checkpoint.md`
- `docs/first-live-trusted-resolver-adapter-action-535r-remediation.md`
- `docs/first-live-trusted-resolver-adapter-action-535r-checkpoint.md`
- `docs/ture-agent-dev-chat-3-continuation-summary.md`
- Related fixture resolver, observer, spawn, credential, capability, provenance, fingerprint, session, and expiry contracts

## A535-H1 Verdict

Closed.

- `lib/post-trade-first-live-trusted-resolver-adapter.ts` starts with `import "server-only";` and is the only first-live resolver production module importing `node:fs/promises` and invoking `lstat`.
- `lib/post-trade-first-live-trusted-resolver-adapter-core.ts` imports no filesystem primitive, no process primitive, no network primitive, no credential primitive, and no `server-only` runtime primitive.
- Importing the pure core performs no filesystem work.
- Static reachability found no API, UI, runner, observer, spawn, credential, or application route import that invokes the live adapter.

## A535-H2 Verdict

Blocked pending correction.

The production resolver input is now closed over canonical policy and no longer accepts caller-supplied policy/filesystem/candidate/dependency injection. The generic exported source-controlled policy builder is gone. That part of the remediation is successful.

The remaining blocker is the exported pure observation seam:

- `buildFirstLiveTrustedResolverCandidateObservation` accepts `observationSource: "server_only_lstat"`.
- `evaluateFirstLiveTrustedExecutableResolution` accepts caller-provided observations.
- `buildEvidence` sets `observedLiveFilesystem: true` when a successful selected observation has `observationSource === "server_only_lstat"`.
- Those exports allow a caller to synthesize live-looking evidence without going through the server-only adapter that actually performed `lstat`.

This does not grant process-spawn authority, but it can make fixture/test-provided evidence appear to be live filesystem evidence, so the test seam can still become a production trust input.

## Findings

| ID | Severity | File / Symbol | Finding | Failure Scenario | Required Remediation | Blocks Approval |
| --- | --- | --- | --- | --- | --- | --- |
| A535V-H1 | High | `lib/post-trade-first-live-trusted-resolver-adapter-core.ts:107-119`, `lib/post-trade-first-live-trusted-resolver-adapter-core.ts:245-266`, `lib/post-trade-first-live-trusted-resolver-adapter-core.ts:268-351`, `lib/post-trade-first-live-trusted-resolver-adapter-core.ts:416` | Exported pure observation/evaluation APIs can synthesize `server_only_lstat` observations and produce `observedLiveFilesystem: true` evidence without the server-only adapter. | A downstream or test caller imports the pure core, builds a `server_only_lstat` observation for a canonical candidate, evaluates it, and obtains successful live-looking filesystem evidence without real `lstat`. | Restrict `server_only_lstat` observation construction to the server-only adapter, or make the pure exported seam accept only `test_synthetic_metadata` and always produce `observedLiveFilesystem: false`. If live observations need provenance, use an unexported token, opaque provenance object, or server-only-only constructor that cannot be forged from the pure core. | Yes |
| A535V-I1 | Informational | `lib/post-trade-first-live-trusted-resolver-adapter.ts:24-39` | Production resolver no longer accepts policy/filesystem/candidate injection and closes over the canonical policy. | None. | Preserve this correction in the next remediation. | No |

## Capability And Authority Review

- Existing fixture resolver request/session validation remains in use.
- Malformed, wrong-purpose, expired, cloned, mutated, and cross-boundary inputs remain rejected in the focused tests.
- Successful evidence still grants no spawn, runner, observer, credential, execution, authorization-consumption, or trading authority.
- Output remains frozen and evidence-only.
- Approval remains blocked because live-observation provenance is forgeable through exported pure APIs.

## Filesystem Review

- Actual live filesystem behavior remains limited to `lstat` in the server-only adapter.
- Fixed canonical candidate paths remain `/usr/bin/git`, `/opt/homebrew/bin/supabase`, and `/usr/local/bin/supabase`.
- No PATH lookup, environment lookup, directory scan, recursive scan, `readFile`, `readdir`, `realpath`, write, chmod/chown, mkdir/unlink/rename, child process, shell, network, credential, Keychain, browser/session, Avanza, persistence, API/UI/runner activation, or trade/order/position mutation was found.
- Approval remains blocked by the exported evidence-provenance seam, not by a reachable live filesystem operation outside server-only.

## Test Review

The 11 focused tests materially cover the server-only split, canonical policy closure, immutability, deterministic synthetic evaluation, negative filesystem classifications, capability rejection, and static forbidden-operation checks.

The tests do not cover the adversarial case where the exported pure builder is used to create `server_only_lstat` observations. That missing negative is tied to blocking finding `A535V-H1`.

## Explicit Non-Authorization

This review does not authorize process spawn, CLI execution, CLI version collection, credentials, environment reads, network access, observer activation, runner activation, API/UI activation, Avanza interaction, order behavior, position behavior, deployment, or Action 536.

## Decision

`post_trade_first_live_trusted_resolver_adapter_remediation_re_review_blocked_observation_provenance`

## Result Status

`post_trade_first_live_trusted_resolver_adapter_action_535v_re_review_completed_blocked`

## Recommended Next Action

Action 535W - Close first-live resolver live-observation provenance seam without execution or activation.
