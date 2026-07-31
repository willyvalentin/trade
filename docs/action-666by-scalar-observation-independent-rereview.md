# Action 666BY — Scalar Observation Independent Re-Review

## Scope and freeze

The review used `refs/codex-preservation/action-666bx` at
`22ff041c8703ebd11f9023f7d21546b69d79e814`. All five normative artifacts
matched the preservation object byte-for-byte. The normative digest was
`e470de83ddea47fa527aa2096c29401ab641d0483a9d6d170fdbcc92166b24b6`
before regression, after regression, and after review.

No normative artifact was changed after review started. This report, the
freeze manifest, and the threat matrix are self-excluded review evidence.

## Verified boundaries

- The predecessor reproduces the documented `1n`/`2n` collision; BX binds
  distinct complete value, bounded-observation, observation, failure-identity,
  and terminal digests.
- Signed BigInt, IEEE-754 number edges, UTF-16 strings, booleans, `null`, and
  `undefined` have explicit closed type tags and canonical representations.
- Same-text type substitution is distinguishable.
- Representable values bind their complete canonical bytes. Oversized and
  unsupported identities explicitly decline a full content-identity claim.
- The creation path uses captured intrinsics and did not execute a hostile
  `toJSON` getter or replaced BigInt coercion hook.
- Terminal results independently rebuild the BV predecessor and bind the
  observation digest into failure and issuance evidence.
- UTC and Europe/Stockholm processes produced the identical golden-scenario
  digest `6b7e867acd2ebec6bbbc661ab2ba5dce0ca5d3309a2f3e732f0333bdf1aff3ac`.
- Full BV issued interoperability and default-off/kill-switch zero-work passed.
- No database, provider, persistence, writer, live import, migration,
  dependency, or lockfile surface was introduced.

## Finding 666BY-M1 — untrusted verifier hooks execute

Severity: **major**

`verifyCanonicalLosslessPrimitiveObservation` accepts its observation as
`unknown`, but calls `Object.keys` and canonical digest logic on that object
without a bounded plain-data validation or sanitized exception boundary.

The clean-room threat probe supplied:

1. a Proxy whose `ownKeys` hook throws `caller_proxy_hook_executed`; and
2. an otherwise shape-compatible observation whose `canonical_value`
   accessor throws `caller_getter_executed`.

Both hooks executed exactly once and both caller-controlled exception messages
escaped the verifier. The issuance creation path remains hook-free, but the
exported independent verification boundary does not satisfy the requested
zero-caller-hook property for untrusted result bytes.

No remediation was performed in Action 666BY.

## Decision

```text
blocker: 0
major: 1
minor: 0
nit: 0
approved: false
local_checkpoint_ready: false
```

Recommended bounded successor: add iterative descriptor-based validation and
a sanitized exception boundary before any key enumeration or digest of an
untrusted observation/result, then independently rebuild against plain frozen
bytes.
