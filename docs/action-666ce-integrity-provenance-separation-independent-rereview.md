# Action 666CE — Integrity/Provenance Separation Independent Re-Review

## Scope and freeze

The review used `refs/codex-preservation/action-666cd` at
`130b06e3db6284151f2d40fc605bfffb48c93306`. All five normative CD
artifacts matched the preservation object byte-for-byte. The canonical
normative digest was
`5fae52c1f0ad833c21585a58ad113c9ab1d7961dab4fb82c82028277ef8e198f`
before regression, after regression, and after this review.

No normative artifact was changed after review started. This report, the
freeze manifest, and the threat matrix are self-excluded review evidence.

## Verified boundaries

- The 666CC-M1 attack remains reproducible against CB. The same semantic
  replacement with all public SHA-256 digests recomputed reaches only CD's
  `integrity_only` terminal with `provenance_verified: false`,
  `trusted: false`, and `admitted: false`.
- Canonical JSON and genuine `Uint8Array` readback always strip private
  runtime provenance. Exact equality with a previously issued canonical
  envelope does not upgrade authority.
- Closed-schema fields fix `authority_status` to `integrity_only` and reject
  caller attempts to set or imply provenance, trust, or admission.
- Runtime provenance remains scoped to the current process and is created
  only after CB's private in-process capsule and WeakMap verification.
  Capsules and WeakMap records are not returned or accepted by readback.
- Malformed, noncanonical, digest-mismatched, integrity-only, and rejected
  inputs have closed classifications. Safely observed bytes bind terminal
  and failure identities, and distinct malformed strings remain distinct.
- Clone, substitution, replayed object, and cross-module container inputs are
  rejected. Proxy, descriptor, prototype, getter, iterator, accessor, and
  coercion probes remain at zero in the readback object boundary.
- Signed BigInt, IEEE-754 edge values, strings, booleans, `null`, and
  `undefined` retain lossless primitive binding. CB/BV/BX/BZ interoperability
  and deterministic UTC/Europe-Stockholm golden parity pass.
- Disabled and kill-switch paths do not execute the request reader, issue,
  parse, readback, or digest work.
- No database, provider, persistence, writer, live import, migration,
  dependency, or lockfile surface was introduced.

## Finding 666CE-M1 — exported caller callback executes outside a sanitized boundary

Severity: **major**

The sole public run operation accepts
`read_request?: () => unknown`. On an enabled execution it calls that
caller-supplied function directly before the issuance/readback operation and
without a sanitizing exception boundary.

An isolated adversarial probe supplied a callback that incremented a counter
and threw `caller_review_message`. The callback executed exactly once and the
caller-controlled exception message escaped the public contract unchanged.
The probe passed `1/1`; it was removed after reproduction and did not change a
normative artifact.

This does not allow an integrity-only payload to become provenance-verified,
trusted, or admitted. It does, however, directly violate the required review
invariant that the exported authority surface contain no caller callback, and
it creates an externally executable, unsanitized hook at the enabled
authority boundary. The existing source/export test checks only names such as
`trust_callback`; it does not reject the actual `read_request` function field.

No remediation was performed in Action 666CE.

## Decision

```text
blocker: 0
major: 1
minor: 0
nit: 0
approved: false
local_checkpoint_ready: false
```

Recommended bounded successor: replace the public callback-based request
reader with a non-executable closed request envelope while preserving the
default-off early gate. Add source, type, runtime, Proxy, accessor, and thrown
exception tests proving that no caller function is accepted or invoked.
