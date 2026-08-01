# Action 661J.5P.1 certification-gated runtime selection

## Boundary

P.1 is a default-off, read-only decision layer above the delivered O.1
certification admission authority. The public request accepts only an explicit
enable bit and repository root. It does not accept an admission, certificate,
authority, capsule, verified result, runtime profile, callback, or provider.

When disabled, the operation returns one frozen result without invoking O.1,
reading files, hashing values, or selecting a profile. When enabled, P.1 calls
O.1 internally. It verifies O.1's module-private provenance before reading the
admission payload. Only the exact admission identity bound to the certified
28-fixture, 28-shard, 14-scenario chain can proceed.

## Selected profile

The only selectable profile is
`action_661j5p1_certified_rebuild_v1_runtime_profile`. It binds:

- runtime family `action_661j5r2_runtime_certification_rebuild_v1`;
- protocol `action_661j5r2_runtime_result_protocol_rebuild_v1`;
- runner `action_661j5r2_runtime_runner_rebuild_v1` and identity digest
  `76e4804def6411adaba50f4588248e8beaac88c63e1d6029850410b6c84bd2f7`;
- policy `action_661j5r2_atomic_policy_registry_rebuild_v1`;
- Snapshot contract `action_661j5r2_metadata_first_snapshot_rebuild_v1`;
- final 28-shard aggregate digest.

The profile is a frozen certification selection. It is not a command, runner
configuration, migration request, or live authority.

## Receipt and provenance

The canonical selection identity binds the complete certified runtime profile,
P.1 policy, exact O.1 admission identity, inventory counts, aggregate and
delivery identities, full-chain result, final freeze, and recovery disclosure.
The issued receipt explicitly carries `runtime_authority:false` and
`runtime_execution_allowed:false`.

Receipt trust exists only in a module-private `WeakMap`. Clones, serialized
copies, caller-recomputed digests, and changed profiles have no provenance.
Exact repeated requests return the same frozen result; identity reuse with
different canonical bytes is rejected. Failure identities bind sanitized stage,
reason, policy, runtime profile, admission-verification reason, and a digest of
the requested repository root after an enabled admission failure. Raw paths are
never included in failure output or identity preimages.

## Excluded capabilities

P.1 imports only O.1 and `node:crypto`. It has no Docker, PostgreSQL, migration,
runner, provider, network, callback, filesystem writer, persistence, or
production capability. Runtime execution remains a separately authorized and
unimplemented boundary.
