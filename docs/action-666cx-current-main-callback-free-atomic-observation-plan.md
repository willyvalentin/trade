# Action 666CX — current-main callback-free atomic observation plan

## Planning status and authority boundary

This plan was prepared from the then-open Action 666CW PR #115 head
`e86f2d7bd6a4ff8674fdad8e4d9d01e04e4a71b4`. Its semantic prerequisite was met
when PR #115 merged ordinarily. Before this candidate was published, Action
660J / PR #116 then merged the provider-free CI sharding infrastructure to
protected `main` at `b9f894e92cc41d9d00ef625fe3bd987e495d6445`, tree
`d83819ea9fa49ba8784dce820db21ff39c5d5873`; exact-main push CI run
`32252186236` succeeded. PR #116 changes CI scheduling and registration only;
it does not alter the delivered 666CW runtime foundation. This protected
commit/tree is the current candidate base. The plan and resulting candidate
still create no delivery, runtime, provider, database, broker, release,
production or roadmap-completion authority.

Action 666CX is a fresh current-main successor. Historical PR #72 / Action
666CF material remains design context only and may not supply implementation,
tests, fixtures, hashes, review conclusions or authority. Do not modify 666CW
implementation, fixtures, tests, freeze manifest or golden report.

## Bounded objective

Create one server-only, synthetic-only, default-off and runtime-unwired public
readback boundary for the exact public 666CW integrity envelope. The boundary
is callback-free and atomic:

- its public execution accepts only an unknown input plus literal primitive
  enable and kill-switch values;
- it accepts a canonical UTF-8 string or a genuine direct `Uint8Array` only;
- after the literal enabled/not-killed gate it captures one bounded local byte
  snapshot, and all parsing, canonicality, digest rebuilding and terminal
  identity work uses that snapshot only; and
- it can establish public-byte integrity only. It must always report
  `provenance_verified:false`, `trusted:false` and `admitted:false`.

It does not construct a 666CW harness, invoke its `observe` function, access a
runtime-evidence object, expose a private capsule, accept an authority reader,
or turn public bytes into provenance. A self-consistent semantic replacement
therefore remains `integrity_only`, never trusted or admitted.

## Proposed contract

The fresh current-main implementation will expose one direct execution entry
alongside closed version, byte-budget, literal-gate and artifact-role constants.
Its API must contain no request reader, callback, factory, trust hook,
dependency object, harness, caller-owned evidence container or upgrade path.
Function-valued inputs and arbitrary objects are terminal `input_rejected`
without enumeration, coercion or caller-code execution.

The result has a closed terminal taxonomy:

```text
integrity_only
malformed
non_canonical
digest_mismatch
input_rejected
```

For a valid 666CW public envelope, the result carries the envelope, proves its
canonical serialized bytes and recomputed envelope digest, and records
`authority_status:"integrity_only"`. Every other terminal has no envelope and
a stable, bounded reason code. Success, terminal and failure projections are
canonically digested from captured values and recursively frozen. No output may
contain a caller exception message, stack, coercion result or backend detail.

The gate is literal: `enabled === true` and `kill_switch_engaged === false`.
Disabled and killed invocations do not inspect input, create a byte snapshot,
parse JSON or compute a digest. The implementation captures the required
reflection, JSON, hashing, text and typed-array intrinsics before any caller
input is processed. Direct typed-array prototype identity, proxy rejection,
fatal UTF-8 decoding and the 65,536-byte cap are checked before any
caller-controlled traversal.

The canonical-envelope schema is pinned to the delivered 666CW public
envelope version and its exact digest projection, re-established from the
protected current-main source at the post-PR #116 base. The implementation may
use no predecessor runtime authority path to validate that public schema.

## Scope after the prerequisite

The implementation candidate should be additive and limited to:

1. a new `lib/server` callback-free atomic-readback implementation;
2. a new synthetic fixture module;
3. a focused Action 666CX Playwright specification;
4. a contract document and synthetic golden report;
5. a separate five-artifact freeze manifest and freeze specification; and
6. the required provider-free CI registration in Action 660J's replay-lineage
   shard.

The 666CX source must not change 666CW source, fixture, focused test, freeze
manifest or golden report. The roadmap and current-state ledger remain
deferred. Action 660J owns the provider-free CI sharding integration, so this
candidate extends only its executable replay-lineage plan, machine-readable
registration and plan oracle; the workflow and protected check identity remain
unchanged. There is no route, UI, persistence, migration, provider, broker,
model, ranking, training, promotion or deployment work in scope.

## Required tests

1. Freeze the exact public export inventory, versions, five normative artifact
   roles, byte budget and closed terminal taxonomy.
2. Prove literal default-off and kill-switch behavior with zero counters,
   snapshot attempts, parses and digests even when the input is a hostile
   proxy.
3. Prove that canonical 666CW envelope strings and genuine direct bytes yield
   identical `integrity_only` results with all provenance/trust/admission flags
   false.
4. Reject functions, arbitrary objects, proxies, accessors, `Uint8Array`
   subclasses, detached buffers, invalid UTF-8 and oversized inputs without
   calling caller hooks or leaking caller-controlled error text.
5. Distinguish malformed JSON, duplicate/extra-key or alternate-order JSON,
   envelope-digest mismatch and input rejection with deterministic terminal and
   failure identities.
6. Prove one-snapshot atomicity: mutating the source `Uint8Array` after return
   cannot change the frozen result; captured-byte accounting is exact.
7. Prove that recomputing all public digest fields after semantic replacement
   never raises the result above `integrity_only` and cannot recreate 666CW
   runtime provenance.
8. Prove recursive freezing, repeat-run determinism and no accepted result for
   copied runtime evidence, a harness, a result shell or any caller-supplied
   callback-shaped value.
9. Add a static public-surface check that forbids callback/factory/trust-hook
   exports and predecessor runtime-authority construction in the new module.
10. Hash-pin the five normative artifacts in a separate fail-closed manifest;
    its test must reject source, artifact-count and aggregate-hash drift.

## Execution and delivery sequence

1. The exact protected-main commit/tree and successful exact-main CI have been
   verified before implementation. Stop if that base changes or the recorded
   identity drifts.
2. Rerun the relevant 666CW focused and freeze tests as the predecessor
   baseline.
3. Re-establish the 666CW public envelope schema and digest projection from
   that delivered source; do not carry any historical hash or implementation
   forward.
4. Implement only the additive 666CX contract and tests above, then run the
   focused 666CX/666CW tests and the freeze tests. Register the two 666CX tests
   in Action 660J's replay-lineage plan and machine manifest without modifying
   the workflow or protected aggregate identity.
5. Freeze the final five-artifact scope, obtain an independent current-head
   read-only review and record exact-head test evidence.
6. Before pushing a branch or opening a PR, obtain explicit operator approval
   naming the proposed PR and exact commit. A later ordinary protected merge
   and exact-main CI remain separate delivery conditions.

No production deployment, provider mutation, Supabase mutation or other
external-state mutation is part of this plan.
