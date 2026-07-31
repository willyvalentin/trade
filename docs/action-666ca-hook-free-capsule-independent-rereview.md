# Action 666CA — Hook-Free Observation Capsule Independent Re-Review

## Scope and freeze

The review used `refs/codex-preservation/action-666bz` at
`0dbcb4d2404e383a08c4764097c52881fcc4f15b`. All five normative BZ
artifacts matched the preservation object byte-for-byte. The canonical
normative digest was
`360457eec36ad87deb55643c10a3de15942798606dfa93f062736d8ac29bb94e`
before regression, after regression, and after this review.

No normative artifact was changed after review started. This report, the
freeze manifest, and the threat matrix are self-excluded review evidence.

## Verified boundaries

- The BY-M1 predecessor attack executes hostile `ownKeys` and accessor hooks;
  BZ rejects the same unknown inputs before candidate property access.
- Proxy probes for `ownKeys`, `getOwnPropertyDescriptor`, `getPrototypeOf`,
  `get`, iterator access, and accessors remained at zero.
- Unknown candidates produce the closed, sanitized
  `untrusted_observation_container` classification without a content-identity
  claim or caller-controlled message.
- Private WeakMap provenance is checked before candidate property,
  prototype, key, descriptor, iterator, or serialization access.
- Clones, spread copies, structured clones, and Proxy wrappers do not inherit
  WeakMap provenance and are rejected.
- Recognized frozen capsules rebuild against private canonical observation
  bytes, observation digest, and capsule digest.
- Signed BigInt values, IEEE-754 number edges, strings, booleans, `null`, and
  `undefined` retain BX lossless primitive binding.
- Unknown inputs share only a sanitized classification digest; the result
  explicitly declines content identity and does not claim two unknown
  containers are the same payload.
- Separate UTC and Europe/Stockholm processes passed deterministic retry and
  exact golden-parity checks.
- BV/BX interoperability, default-off zero-work, and the DB prohibition
  remained intact.
- No database, provider, persistence, writer, live import, migration,
  dependency, or lockfile surface was introduced.

## Finding 666CA-M1 — generic capsule mint is caller-accessible

Severity: **major**

`mintCanonicalProvenanceBoundObservationCapsule` is exported from the
server-only implementation. Any server caller that can import the module can
invoke this generic mint with an arbitrary supported primitive. The returned
capsule is inserted into the module-private WeakMap and is consequently
accepted by `verifyCanonicalProvenanceBoundObservationCapsule`.

The WeakMap correctly prevents clones, substitutions, and externally
constructed lookalikes, but it does not establish non-forgeable ownership
while the function that creates accepted provenance is part of the public
module surface. This conflicts with the review requirement that recognized
capsules cannot be self-minted by a caller.

No remediation was performed in Action 666CA.

## Decision

```text
blocker: 0
major: 1
minor: 0
nit: 0
approved: false
local_checkpoint_ready: false
```

Recommended bounded successor: hide the generic mint behind a private
closure or owner-controlled capability, expose only the hook-free verifier
and a narrowly scoped owner factory, and prove that ordinary module callers
cannot obtain provenance for caller-chosen bytes.
