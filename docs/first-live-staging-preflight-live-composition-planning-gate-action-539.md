# Action 539 - Live-Composition Planning Gate

## Approved Current Architecture

The current first-live read-only staging preflight composition architecture is approved only as a dormant fixture-only contract. It composes source-controlled fixture evidence for resolver evidence, immediate revalidation requirement, direct-spawn plan, scoped observer plan, no-credential evidence, CLI-version expectation, and one-shot authorization lifecycle evidence.

The current architecture remains authority-free. It models what must be true before future live work can proceed, but it does not invoke a live resolver, perform filesystem access, execute a CLI, spawn a process, collect a CLI version, access credentials, observe processes, activate a runner, call an API route, or touch UI/runtime behavior.

## Dormant Module Graph

Current dormant graph:

1. `post-trade-first-live-read-only-staging-preflight-composition-contract-core.ts`
2. imports only pure identity/policy constants and fixture contract helpers from reviewed resolver, spawn, observer, credential, CLI-version, authorization, and execution-boundary modules
3. exports fixture evidence builders, canonical evidence-set builder, pure composer, validator, lifecycle helper, constants, and types
4. is referenced by focused tests and documentation only

No route, UI component, runner, cron job, live resolver adapter, observer boundary, spawn boundary, credential boundary, browser automation, Avanza module, order module, position module, settlement module, deployment path, or runtime path invokes the composition contract.

## Established Trust Guarantees

- Source-controlled composition identity and policy are frozen and versioned.
- Evidence order is canonical and enforced.
- Evidence is session-bound, purpose-bound, platform-bound, tool-bound, fingerprinted, and module-provenance checked.
- Missing, duplicate, ambiguous, out-of-order, stale, expired, malformed, cloned, spread, JSON-cloned, wrong-session, wrong-purpose, wrong-tool, wrong-platform, wrong-boundary, and mutated evidence fails closed.
- Top-level authority claims fail closed with `authority_claim_rejected`.
- Nested resolver metadata authority claims fail closed with `resolver_metadata_schema_rejected`.
- Forged live-observation claims fail closed with `live_observation_claim_rejected`.
- Resolver metadata is exact-schema only: `deviceId`, `inode`, `sizeBytes`, `mode`, `modifiedTimeMs`.
- Credential material and credential authority fail closed.
- Shell, arbitrary argv, retry, second attempt, command execution, process start, observer invocation, CLI version collection, authorization consumption, runner activation, and deployment claims fail closed.
- `composition_complete` is structural only and grants no runtime authority.
- Resolver evidence remains point-in-time; immediate pre-spawn revalidation remains required; TOCTOU elimination is not claimed.

## Absent Capabilities

The following remain absent and unauthorized:

- server-only live composition adapter
- in-process verification of private live resolver provenance by composition
- preflight live resolver invocation
- immediate pre-spawn filesystem revalidation
- process spawn
- process observation
- CLI execution or version collection
- credentials, environment reads, PATH discovery, or network access
- runner, API, UI, cron, browser, Avanza, trading, order, position, settlement, persistence, deployment, staging execution, production execution

## Future Live-Composition Trust Problem

A future server-only live-composition boundary must solve a narrow provenance problem without creating execution authority.

It must accept only original in-process live resolver evidence produced by the approved server-only resolver adapter. It must not serialize, clone, spread, reconstruct, persist, or expose the resolver private provenance mechanism. It must preserve exact tool identity, resolved path, policy identity/version, session, purpose, capability linkage, provenance, fingerprint, `deviceId`, `inode`, `sizeBytes`, `mode`, and `modifiedTimeMs`.

The boundary must fail closed when evidence is serialized, cloned, mutated, expired, stale, cross-session, cross-purpose, cross-tool, cross-platform, cross-boundary, or missing private provenance. It must not treat resolver evidence as spawn permission. It must require a separately reviewed immediate pre-spawn revalidation boundary before any future spawn path can be considered. Live resolver evidence must remain separate from spawn authority, observer authority, credential authority, CLI execution authority, and authorization-consumption authority.

The future boundary must remain one-shot, no-retry, dormant, test-only reachable, and unreachable from runtime until separately reviewed activation.

## Architecture Option Comparison

| Option | Summary | Provenance Integrity | Leakage / Replay Risk | Testability | TOCTOU Implication | Authority Expansion | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A | Server-only composition adapter imports the live resolver adapter and immediately consumes the original returned object in the same call stack. | Strong if original object provenance is checked before neutral projection. | Low if no serialization/persistence/barrel export is added. | Good with injected synthetic live-result factories kept server-only or resolver-owned test helpers. | Still requires immediate pre-spawn revalidation. | Low if output remains non-authoritative. | Recommended baseline for Action 540. |
| B | Server-only resolver exposes a narrowly scoped private verifier or composition callback while keeping WeakSet/token unexported. | Strong if verifier cannot be caller-forged. | Medium coupling risk; verifier can become a capability leak if exported too broadly. | Good but needs careful export-surface review. | Still requires immediate pre-spawn revalidation. | Low to medium depending on API shape. | Acceptable only if A needs a verifier seam. |
| C | New server-only orchestration module owns resolver invocation and composition in one closed module while pure composition receives neutral validated metadata. | Strong if orchestration never exposes live evidence and keeps provenance in-process. | Low replay risk; higher module complexity. | Good but larger review surface. | Still requires immediate pre-spawn revalidation. | Low if dormant and non-authoritative. | Viable later, larger than needed for next step. |
| D | Shared exported token, brand, signature, hash, or serialized provenance marker. | Weak if callers can reproduce exported inputs. | High clone/serialization/replay risk. | Easy but misleading. | Does not solve TOCTOU. | Medium to high. | Not recommended; presumed unsafe. |
| E | Persisted resolver evidence consumed later by composition. | Weak for private provenance and freshness. | High replay/staleness risk. | Operationally testable but unsafe for first bridge. | Worsens TOCTOU and freshness. | Medium to high. | Not recommended; presumed unsafe. |

## Recommended Architecture Principles

Future implementation should use:

- `server-only` as the first effective import
- one closed server-only module graph
- original-object in-process provenance
- no serialization
- no persistence
- no caller dependency, policy, filesystem, path, PATH, or environment injection
- no live adapter barrel activation path
- neutral metadata projection after live provenance verification
- no authority upgrade
- no runtime wiring
- explicit dormant status
- independent static security review after implementation

## Next-Step Comparison

| Candidate | Authority Introduced | OS Interaction | Dependencies / Blockers | TOCTOU | Credentials / Network | Testability | Value | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A. Implement dormant server-only live-composition adapter | Minimal if non-authoritative and dormant | Optional live resolver call only, no spawn | Depends on approved live resolver provenance | Preserves need for revalidation | None | High | Best next step |
| B. Design immediate pre-spawn revalidation contract first | None | None | Useful but premature before live evidence bridge exists | Directly relevant | None | High | Good later |
| C. Implement immediate pre-spawn revalidation adapter | Moderate filesystem authority | Filesystem metadata access | Needs live composition trust handoff first | Directly relevant | None | Medium | Too early |
| D. Design direct-spawn live adapter | None in design, but points to process authority | None in design | Several unresolved trust gates | Requires revalidation first | None | Medium | Too early |
| E. Implement read-only CLI-version collector | Process execution pressure | Requires spawn/CLI execution | Spawn and observation not ready | Depends on spawn revalidation | None | Medium | Too early |
| F. Design scoped live observer | None in design | None in design | Useful after spawn shape is clearer | Indirect | None | Medium | Later |

## Exact Recommended Next Action

Action 540 - Implement Dormant Server-Only First-Live Staging Preflight Composition Adapter.

The Action 540 scope should be limited to:

- server-only module boundary
- optional controlled invocation of the already approved live resolver
- in-process verification and retention of original live provenance
- conversion into non-authoritative composition input
- no process spawn
- no observer activation
- no credentials
- no CLI execution
- no API/UI/runner wiring
- no deployment
- dormant test-only reachability

## Mandatory Implementation Constraints For Action 540

- Do not implement process spawn.
- Do not collect CLI versions.
- Do not access credentials or environment values.
- Do not access network resources.
- Do not wire API, UI, runner, cron, browser, Avanza, trading, order, position, settlement, persistence, or deployment behavior.
- Do not expose resolver private provenance through a generic export, token, brand, hash, signature, or serialized marker.
- Do not accept serialized, cloned, spread, reconstructed, persisted, stale, expired, cross-session, cross-purpose, cross-tool, cross-platform, or cross-boundary live resolver evidence.
- Do not treat resolver success as spawn permission.
- Preserve immediate pre-spawn revalidation as a separate future gate.

## Mandatory Review Gates

Before any runtime composition may occur, future work requires:

1. Focused implementation tests.
2. Static server-only boundary review.
3. Export-surface and barrel-bypass review.
4. Private-provenance integrity review.
5. Clone/serialization/replay rejection review.
6. Session/purpose/tool/platform/fingerprint review.
7. Evidence-level authority review.
8. Static prohibited-operation review.
9. Runtime reachability review.
10. Independent final re-review after remediation.
11. Separate approval before any caller or runtime wiring.
12. Separate approval before immediate pre-spawn revalidation.
13. Separate approval before process spawn.
14. Separate approval before observer or credentials.
15. Separate approval before deployment.

## Explicit Non-Authorizations

Action 539 and the recommended Action 540 plan do not authorize live staging preflight execution, process spawn, CLI execution, CLI-version collection, credentials, environment reads, PATH discovery, network access, observer activation, runner activation, API/UI activation, browser automation, Avanza interaction, order/position/trade/settlement behavior, persistence, deployment, production execution, or any runtime activation.

## Commit And Deploy Recommendation

No deploy is recommended for Action 539. A source-control checkpoint commit may be considered only after the complete Action 539 diff has been manually inspected. Do not deploy.
