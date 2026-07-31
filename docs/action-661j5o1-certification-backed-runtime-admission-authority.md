# Action 661J.5O.1 certification-backed runtime admission authority

## Scope

This additive authority converts the delivered 28/28 runtime certification into a default-off quality decision. It does not start or expose a runtime, database, container, provider, writer, persistence mechanism, network operation, callback, or privileged capability.

The public request surface is `requestCertificationBackedRuntimeAdmissionV1(enabled, repositoryRoot)`. An omitted or non-`true` enable flag returns the frozen disabled result before inspecting `repositoryRoot`, invoking N.2A, or computing a digest. Enabled requests have exactly two arguments; callers cannot supply certification results, manifests, path inventories, receipts, capsules, authorities, or preverified status.

## Verification boundary

The authority invokes the frozen N.2A descriptor-bound consumer internally. N.2A performs the approved-root validation and all content reads through verified `O_NOFOLLOW` descriptors. This authority consumes only N.2A's in-memory result and performs no path-based reread.

Admission requires all of the following:

- N.2A outer and semantic results are `certified` with reason `certification_chain_verified`.
- The semantic inventory is exactly 28 fixtures, 28 shards, and 14 scenarios.
- The final aggregate, delivery, and final-freeze digests match their pinned authorities.
- Raw file hashes for the aggregate, final freeze manifest, and recovery disclosure match the descriptor-bound observations.
- The recovery disclosure remains a non-promoted historical partial recovery.

The admission identity binds the policy/version, frozen N.2A authority, certification and freeze manifests, inventory, descriptor observations, full-chain semantic result, and recovery disclosure. Canonical JSON sorts object keys, preserves array order, and hashes UTF-8 bytes with SHA-256.

## Trust model

Issued objects receive module-private provenance in a `WeakMap` before `verifyCertificationBackedRuntimeAdmissionV1` can admit them. No mint, factory, capsule, receipt, or authority constructor is exported. A clone, proxy, caller-created object, substituted digest, or self-consistently recomputed public object has no private provenance and is rejected without property access.

Exact duplicate certification bytes produce the same identity and return the existing frozen admission. Reuse of an identity with different canonical bytes is an `admission_identity_conflict`. Rejections bind a closed reason/stage projection and sanitized upstream failure identity; raw paths and provider messages are not included.

## Safety and lifecycle

The authority is an admission signal only. Its policy declares an empty privileged-capability list. A later runtime boundary must separately verify private provenance and must not treat public fields or digests as trust. This Action performs no runtime execution and creates no production effect.

The five O.1 artifacts are intentionally not final-review authority. Their successful bytes are preserved locally; freeze and independent review remain a later Action, so `local_checkpoint_ready` remains false.
