# Action 666CC — Private Atomic Observation Authority Independent Re-Review

## Scope and freeze

The review used `refs/codex-preservation/action-666cb` at
`4145dd4282428101ae41162fc583867e7b91503e`. All five normative CB
artifacts matched the preservation object byte-for-byte. The canonical
normative digest was
`0ffadc6d2f4400d1722fb1d6ee5b01b7c1f4e194403fc7349ed7db05acf27c50`
before regression, after regression, and after this review.

No normative artifact was changed after review started. This report, the
freeze manifest, and the threat matrix are self-excluded review evidence.

## Verified boundaries

- The CA-M1 predecessor surface remains reproducible, while CB exports no
  capsule mint or generic capsule factory. Runtime and source inventories
  match the closed expected export set.
- Capsule minting and WeakMap provenance are private. Capsules and provenance
  records are neither returned nor accepted through the public object-input
  readback boundary.
- Atomic primitive observation returns only deep-frozen plain evidence.
  Clones, substitutions, predecessor capsules, and arbitrary object inputs
  are rejected.
- Unknown Proxy and accessor probes execute zero `ownKeys`,
  `getOwnPropertyDescriptor`, `getPrototypeOf`, `get`, iterator, or accessor
  hooks, and caller-controlled exception messages are absent from output.
- Genuine canonical JSON strings and genuine `Uint8Array` bytes rebuild the
  expected closed-schema evidence deterministically.
- Lossless BigInt and IEEE-754 edge binding, deterministic malformed-input
  failure identities, BV/BX/BZ interoperability, default-off zero-work, and
  UTC/Europe-Stockholm parity remain intact.
- No database, provider, persistence, writer, live import, migration,
  dependency, or lockfile surface was introduced.

## Finding 666CC-M1 — canonical readback can self-attest private provenance

Severity: **major**

The canonical readback boundary authenticates parsed evidence only with a
caller-recomputable, unkeyed SHA-256 digest. It does not rebuild the primitive
observation and capsule relationship, consult the private WeakMap, or bind the
serialized evidence to an owner-controlled external anchor.

An isolated adversarial probe performed these steps:

1. obtain a legitimate canonical evidence string;
2. change `primitive_type`, capsule identity/digest, primitive value digest,
   primitive observation digest, and bounded observation digest;
3. recompute `evidence_digest` with the exported canonical digest algorithm;
4. preserve the required canonical field order; and
5. submit the resulting string to
   `verifyCanonicalPrivateAtomicObservationReadback`.

The result was `status: "verified"` with
`provenance_verified: true`, `content_identity_claimed: true`, and the
attacker-selected digest fields. The probe passed `1/1`; it was removed after
reproduction and did not alter any normative artifact.

The private in-process capsule cannot be forged as an object, but the
persisted readback representation can forge the security claim that those
private provenance checks occurred. This violates the independent review
requirements for capsule non-forgeability, canonical readback authority, and
evidence-digest rebuilding.

No remediation was performed in Action 666CC.

## Decision

```text
blocker: 0
major: 1
minor: 0
nit: 0
approved: false
local_checkpoint_ready: false
```

Recommended bounded successor: bind canonical readback evidence to a
non-caller-controlled authority proof or independently rebuild the complete
primitive/capsule provenance relationship without exposing a minting
capability. Add a negative test for a semantically changed evidence payload
whose public SHA digests are all recomputed self-consistently.
