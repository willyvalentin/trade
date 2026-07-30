# Action 661J.5R.2 Runtime Certification Rebuild V1

## Recovery boundary

This foundation starts at durable Git commit
`f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33`. The R.1 loss manifest is
preserved at
`docs/recovery/action-661j5r1/loss-reconstruction-manifest.json`.

The 42 byte-matching recovered files are classified only as
`historical_recovered_reference`. Their complete dependency chains were not
recovered. The 129 missing files remain lost. Historical SHA-256 values are
commitments to unavailable bytes, not reconstructed artifacts or authorities.
This rebuild makes no compatibility claim against those files and does not
reuse their protocol version names.

## Version family

The closed family root is
`action_661j5r2_runtime_certification_rebuild_v1`. It defines additive,
newly hashed contracts for:

- metadata-first Snapshot V2 collection;
- scenario-specific atomic rejection;
- runtime scenario selection;
- runner identity;
- atomic evidence, record, shard and persisted file;
- an exact four-shard A/B aggregate.

No Docker execution is part of this static foundation.

## Snapshot contract

Metadata discovery is authoritative for the frozen six-relation target
inventory. It classifies each target as `present_table`, `missing`,
`non_table` or `wrong_owner`. Guarded reads are required exactly once for
`present_table` targets and forbidden for all other states.

`present_table` can represent rows or an empty table. Invalid relation states
use `not_read_due_to_relation_state`, with `rows:null` and
`data_digest:null`. A missing relation is therefore cryptographically
different from an empty table.

Every snapshot contains exactly nine V2 domains. Each domain signs its ID,
version and value. The combined digest signs the snapshot contract, schema,
target inventory and all domain envelopes.

## Policy and registry

`forbidden_history` binds the closed forbidden-version inventory and the
exact controlled reason `Action 661J refuses forbidden migration history`.

`missing_target` binds `public.historical_candles`, state `missing`, SQLSTATE
`42P01`, the exact native PostgreSQL message, and classification
`native_regclass_missing_relation_preempts_policy`.

The runtime registry marks only these two scenarios implemented. It selects
the protocol and runner. Caller-selected protocol versions are rejected.

## Runner identity

The runner does not import its authority. The separate authority pins:

- canonical runner path and version;
- SHA-256 of the runner's exact local bytes;
- the closed scenario/protocol capability matrix;
- registry, snapshot and result-protocol dependencies;
- explicit no-production and no-external-access boundaries.

The authority computes its own module SHA at verification time, then signs a
runner identity receipt. Atomic evidence carries the complete receipt.

## Diagnostic boundary

The injected runtime attempt returns a sanitized diagnostic. The runner must
persist it before any terminal-policy verification or evidence construction.
The signed diagnostic contains no stack, query, connection string, credential
material or raw error object.

## Protocol projections

Verification order is:

1. closed input shape and canonical runtime values;
2. runtime registry and policy selection;
3. runtime identity and diagnostic;
4. Snapshot V2 pre/post and guarded-read rules;
5. exact no-transition equality;
6. precondition reference and runner identity receipt;
7. atomic-evidence digest;
8. record identity and digest;
9. single-scenario shard inventory and digest;
10. persisted-file identity, digest and canonical readback;
11. exact four-shard inventory and per-scenario A/B semantic equality;
12. aggregate digest and certified decision.

Self-digest fields are excluded only from their own layer's preimage.
Nested signed payloads remain present in every outer layer.

Persisted JSON is canonical UTF-8 with one trailing newline. Writes use an
exclusive temporary file followed by rename. Existing identical bytes are
idempotent; different bytes at the same identity fail closed.

## Aggregate contract

The aggregate accepts exactly:

- `forbidden_history/run-a`;
- `forbidden_history/run-b`;
- `missing_target/run-a`;
- `missing_target/run-b`.

Each input is independently verified first. Semantic comparison excludes only
run, shard and file identity fields. It retains policy, registry, runner,
runtime identity, diagnostics, guarded reads, all nine domains and atomicity.

## Reason taxonomy

Stable reason codes use the `rebuild_v1.*` namespace:

- `canonical_value_invalid`
- `closed_shape_invalid`
- `snapshot_inventory_mismatch`
- `snapshot_metadata_invalid`
- `guarded_read_contract_violation`
- `relation_state_mismatch`
- `snapshot_domain_digest_mismatch`
- `snapshot_combined_digest_mismatch`
- `policy_mismatch`
- `protocol_version_mismatch`
- `precondition_reference_mismatch`
- `runtime_registry_mismatch`
- `runtime_identity_mismatch`
- `diagnostic_mismatch`
- `runner_identity_mismatch`
- `atomic_transition_detected`
- `evidence_digest_mismatch`
- `record_digest_mismatch`
- `shard_inventory_mismatch`
- `shard_digest_mismatch`
- `file_digest_mismatch`
- `file_identity_mismatch`
- `aggregate_inventory_mismatch`
- `semantic_determinism_mismatch`
- `aggregate_digest_mismatch`
- `persistence_collision`
- `persistence_readback_mismatch`

## Independent oracle

The zero-import literal fixture contains no production imports or dynamic
authority construction. The independent oracle imports only that fixture and
`node:crypto`, and separately projects Snapshot V2, evidence, records, shards,
files and the aggregate. Hardcoded goldens are compared one-way against the
production implementation. Rebuilds are verified in UTC, Europe/Stockholm and
America/New_York.

## Deferred scope

This action provides a statically certified runtime foundation only. It does
not start Docker, execute migrations, connect to production or increment the
14/28 runtime fixture count.
