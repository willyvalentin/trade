# Action 661J.5N.1 Default-Off Certification Consumer

## Purpose and authority

`action_661j5n1_default_off_runtime_certification_consumer_v1` is an additive,
read-only verifier for the merged Action 661J.5 runtime certification. Its
external roots are the final freeze-manifest digest
`9e6f8237a5f760c0ef34b2783eca69d7d1496a935d984bc8f07a92493982a4a6`,
the 28-shard aggregate digest
`98064a290926d7b2ade45965eec3a21b41819763cb667a3a0c54f618600fe99d`,
and delivery digest
`80024a817857603d508d094e2e53616dfab48ba60ac661211ff3fa2672ad5d0e`.
Self-declared `passed`, `approved`, or `certified` values are never sufficient.

## Default-off boundary

Calling the consumer without `enabled:true` returns `incomplete` with reason
`consumer_disabled`. This path does not call the filesystem boundary and does
not canonicalize or hash data. Enabled mode requires one canonical absolute
repository root. The public request is closed to `enabled` and
`repository_root`; callers cannot supply paths, authorities, expected digests,
or preverified results.

## Read and trust boundary

Reads are limited to four pinned authority paths, the freeze manifest's
allowlisted runtime-evidence paths, six predecessor aggregate paths, and runner
modules named by signed evidence. Every path is repository-relative and checked
component-by-component with `lstat`; absolute artifact paths, empty components,
dot traversal, backslashes, unknown prefixes, and symbolic links are rejected.
The consumer exposes only injected synchronous `lstat`, `realpath`, and
`readFile` capabilities. It has no write, persistence, subprocess, network,
Docker, environment-secret, migration, CI, or deployment capability.

Traversal is iterative and bounded to 96 files, 16 MiB, 500,000 JSON nodes,
depth 32, 4,096 array entries, 512 object fields, and 1 MiB strings. Budget
exhaustion is `scope_rejected`.

## Verification order

1. Validate the closed request and canonical repository root.
2. Rebuild and pin the freeze manifest and delivery identity.
3. Verify the independent review and recovery disclosure by raw-file SHA and
   closed historical claims. Lost hashes remain commitments, never recovered
   bytes.
4. Read the canonical final aggregate and every one of the 28 listed persisted
   files through the approved path boundary.
5. Rebuild domain, combined snapshot, diagnostic, runtime identity, runtime
   capture, policy, registry, precondition, runner, evidence, record, shard,
   canonical-file, scenario-semantic, and aggregate digests.
6. Verify 14 exact A/B scenario pairs, failure `no_transition_verified`, the
   successful `closed_transition_verified` delta, and unchanged application
   data.
7. Verify all predecessor aggregate raw hashes and the 12-entry preservation
   commitment chain recorded by the freeze authority.

The closed result taxonomy is `certified`, `incomplete`, `tampered`,
`incompatible`, and `scope_rejected`. Failures include sanitized stage, approved
relative path when available, and expected/observed digests only. No raw file
content, SQL, credentials, connection data, or runtime identifiers are emitted.

## Determinism and compatibility

Canonical objects use lexicographically sorted keys and preserve array order.
The focused suite proves same-process and UTC/Stockholm/New York process parity.
The consumer does not alter or promote any historical protocol. It consumes
the frozen merged bytes and emits an in-memory verification result only.

The companion golden report is a test authority for this consumer version. It
records observed bounded-work counts and hashes, not a replacement runtime
authority. Runtime execution and local checkpoint publication remain deferred.
